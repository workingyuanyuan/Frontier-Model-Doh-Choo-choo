import { createHash } from 'node:crypto';

import {
  type LiveBenchJudgment,
  type LiveBenchPageRequest,
  fetchLiveBenchPage,
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

export const LIVEBENCH_CONNECTOR_VERSION = 'livebench-rows-v1';

export interface StagedLiveBenchRecord {
  readonly sourceRecordKey: string;
  readonly rawModelName: string;
  readonly resolvedModelVariantId: null;
  readonly payload: LiveBenchJudgment;
  readonly validationStatus: 'VALIDATED';
  readonly validationErrors: readonly [];
}

export interface LiveBenchIngestionOptions extends LiveBenchPageRequest {
  readonly rawStorageRoot: string;
}

export interface LiveBenchIngestionSummary {
  readonly sourceId: string;
  readonly sourceSnapshotId: string;
  readonly ingestionRunId: string;
  readonly contentSha256: string;
  readonly storagePath: string;
  readonly recordsSeen: number;
  readonly recordsAccepted: number;
  readonly totalAvailable: number;
}

export function toStagedLiveBenchRecord(
  judgment: LiveBenchJudgment,
): StagedLiveBenchRecord {
  const canonicalIdentity = JSON.stringify([
    judgment.question_id,
    judgment.task,
    judgment.model,
    judgment.turn,
    judgment.tstamp,
  ]);

  return {
    sourceRecordKey: createHash('sha256')
      .update(canonicalIdentity)
      .digest('hex'),
    rawModelName: judgment.model,
    resolvedModelVariantId: null,
    payload: judgment,
    validationStatus: 'VALIDATED',
    validationErrors: [],
  };
}

export async function ingestLiveBenchPage(
  db: Database,
  options: LiveBenchIngestionOptions,
): Promise<LiveBenchIngestionSummary> {
  const fetched = await fetchLiveBenchPage({
    offset: options.offset,
    length: options.length,
  });
  const stored = await writeContentAddressedArtifact(
    options.rawStorageRoot,
    fetched.body,
    'json',
  );
  const staged = fetched.page.rows.map(({ row }) =>
    toStagedLiveBenchRecord(row),
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
          datasetId: 'livebench/model_judgment',
          connectorVersion: LIVEBENCH_CONNECTOR_VERSION,
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
            datasetId: 'livebench/model_judgment',
            connectorVersion: LIVEBENCH_CONNECTOR_VERSION,
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
        metadata: {
          offset: options.offset,
          length: options.length,
          totalAvailable: fetched.page.num_rows_total,
        },
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
        connectorVersion: LIVEBENCH_CONNECTOR_VERSION,
        recordsSeen: staged.length,
        recordsAccepted: 0,
        metadata: { offset: options.offset, length: options.length },
      })
      .returning({ id: ingestionRuns.id });

    if (!run) {
      throw new Error('Failed to create the LiveBench ingestion run');
    }

    if (staged.length > 0) {
      await transaction.insert(stagedResults).values(
        staged.map((record) => ({
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
      contentSha256: stored.contentSha256,
      storagePath: stored.storagePath,
      recordsSeen: staged.length,
      recordsAccepted: staged.length,
      totalAvailable: fetched.page.num_rows_total,
    };
  });
}
