import {
  type FetchedLiveBenchDatasetRevision,
  type FetchedLiveBenchParquet,
  LIVEBENCH_PARQUET_PATH,
  fetchLiveBenchDatasetRevision,
  fetchLiveBenchParquet,
  parseLiveBenchParquet,
  writeContentAddressedArtifact,
} from '@llm-bench/connectors';
import {
  type Database,
  ingestionRuns,
  sourceSnapshots,
  sources,
  stagedResults,
} from '@llm-bench/db';
import { and, eq } from 'drizzle-orm';

import {
  type StagedLiveBenchRecord,
  toStagedLiveBenchRecord,
} from './livebench-ingestion.js';

export const LIVEBENCH_PARQUET_CONNECTOR_VERSION = 'livebench-parquet-v1';
export const LIVEBENCH_STAGING_BATCH_SIZE = 1_000;

export interface LiveBenchParquetIngestionOptions {
  readonly rawStorageRoot: string;
}

export interface LiveBenchParquetIngestionSummary {
  readonly sourceId: string;
  readonly sourceSnapshotId: string;
  readonly ingestionRunId: string;
  readonly datasetRevision: string;
  readonly contentSha256: string;
  readonly storagePath: string;
  readonly recordsSeen: number;
  readonly recordsAccepted: number;
}

export function createLiveBenchParquetEvidenceMetadata(
  datasetRevision: FetchedLiveBenchDatasetRevision,
  fetched: FetchedLiveBenchParquet,
  totalAvailable: number,
) {
  return {
    datasetId: datasetRevision.datasetId,
    datasetRevision: datasetRevision.revision,
    datasetLastModified: datasetRevision.lastModified,
    revisionFetchedAt: datasetRevision.fetchedAt,
    revisionRequestUrl: datasetRevision.requestUrl,
    parquetPath: LIVEBENCH_PARQUET_PATH,
    parquetLinkedEtag: fetched.linkedEtag,
    parquetDownloadOrigin: fetched.downloadOrigin,
    totalAvailable,
  };
}

export function batchLiveBenchStagedRecords(
  records: readonly StagedLiveBenchRecord[],
): readonly (readonly StagedLiveBenchRecord[])[] {
  const batches: StagedLiveBenchRecord[][] = [];
  for (
    let offset = 0;
    offset < records.length;
    offset += LIVEBENCH_STAGING_BATCH_SIZE
  ) {
    batches.push(records.slice(offset, offset + LIVEBENCH_STAGING_BATCH_SIZE));
  }
  return batches;
}

export async function ingestLiveBenchParquetDataset(
  db: Database,
  options: LiveBenchParquetIngestionOptions,
): Promise<LiveBenchParquetIngestionSummary> {
  const datasetRevision = await fetchLiveBenchDatasetRevision();
  const fetched = await fetchLiveBenchParquet(datasetRevision.revision);
  const judgments = await parseLiveBenchParquet(fetched.body);
  const stored = await writeContentAddressedArtifact(
    options.rawStorageRoot,
    fetched.body,
    'parquet',
  );
  const staged = judgments.map(toStagedLiveBenchRecord);
  const evidenceMetadata = createLiveBenchParquetEvidenceMetadata(
    datasetRevision,
    fetched,
    staged.length,
  );

  return db.transaction(async (transaction) => {
    const [source] = await transaction
      .insert(sources)
      .values({
        slug: 'livebench-model-judgment',
        displayName: 'LiveBench Model Judgment',
        sourceType: 'OFFICIAL_DATASET_API',
        baseUrl: 'https://huggingface.co/datasets/livebench/model_judgment',
        trustTier: 'INDEPENDENT_OFFICIAL_BENCHMARK',
        licenseSpdx: 'Apache-2.0',
        termsUrl: 'https://huggingface.co/terms-of-service',
        isEnabled: true,
        metadata: {
          datasetId: datasetRevision.datasetId,
          connectorVersion: LIVEBENCH_PARQUET_CONNECTOR_VERSION,
          artifactPath: LIVEBENCH_PARQUET_PATH,
        },
      })
      .onConflictDoUpdate({
        target: sources.slug,
        set: {
          displayName: 'LiveBench Model Judgment',
          sourceType: 'OFFICIAL_DATASET_API',
          baseUrl: 'https://huggingface.co/datasets/livebench/model_judgment',
          trustTier: 'INDEPENDENT_OFFICIAL_BENCHMARK',
          licenseSpdx: 'Apache-2.0',
          termsUrl: 'https://huggingface.co/terms-of-service',
          isEnabled: true,
          metadata: {
            datasetId: datasetRevision.datasetId,
            connectorVersion: LIVEBENCH_PARQUET_CONNECTOR_VERSION,
            artifactPath: LIVEBENCH_PARQUET_PATH,
          },
        },
      })
      .returning({ id: sources.id });
    if (!source) {
      throw new Error('Failed to upsert the LiveBench source');
    }

    let [snapshot] = await transaction
      .insert(sourceSnapshots)
      .values({
        sourceId: source.id,
        fetchedAt: new Date(fetched.fetchedAt),
        requestUrl: fetched.requestUrl,
        responseStatus: fetched.responseStatus,
        contentSha256: stored.contentSha256,
        contentType: fetched.contentType,
        storagePath: stored.storagePath,
        byteLength: stored.byteLength,
        metadata: evidenceMetadata,
      })
      .onConflictDoNothing({
        target: [sourceSnapshots.sourceId, sourceSnapshots.contentSha256],
      })
      .returning({ id: sourceSnapshots.id });
    if (!snapshot) {
      [snapshot] = await transaction
        .select({ id: sourceSnapshots.id })
        .from(sourceSnapshots)
        .where(
          and(
            eq(sourceSnapshots.sourceId, source.id),
            eq(sourceSnapshots.contentSha256, stored.contentSha256),
          ),
        )
        .limit(1);
    }
    if (!snapshot) {
      throw new Error('Failed to resolve the LiveBench source snapshot');
    }

    const [run] = await transaction
      .insert(ingestionRuns)
      .values({
        sourceId: source.id,
        status: 'RUNNING',
        connectorVersion: LIVEBENCH_PARQUET_CONNECTOR_VERSION,
        recordsSeen: staged.length,
        recordsAccepted: 0,
        metadata: evidenceMetadata,
      })
      .returning({ id: ingestionRuns.id });
    if (!run) {
      throw new Error('Failed to create the LiveBench ingestion run');
    }

    for (const batch of batchLiveBenchStagedRecords(staged)) {
      await transaction.insert(stagedResults).values(
        batch.map((record) => ({
          ingestionRunId: run.id,
          sourceSnapshotId: snapshot.id,
          sourceRecordKey: record.sourceRecordKey,
          rawModelName: record.rawModelName,
          resolvedModelVariantId: record.resolvedModelVariantId,
          payload: record.payload,
          validationStatus: record.validationStatus,
          validationErrors: record.validationErrors,
        })),
      );
    }

    await transaction
      .update(ingestionRuns)
      .set({
        status: 'SUCCEEDED',
        completedAt: new Date(),
        recordsAccepted: staged.length,
      })
      .where(eq(ingestionRuns.id, run.id));

    return {
      sourceId: source.id,
      sourceSnapshotId: snapshot.id,
      ingestionRunId: run.id,
      datasetRevision: datasetRevision.revision,
      contentSha256: stored.contentSha256,
      storagePath: stored.storagePath,
      recordsSeen: staged.length,
      recordsAccepted: staged.length,
    };
  });
}
