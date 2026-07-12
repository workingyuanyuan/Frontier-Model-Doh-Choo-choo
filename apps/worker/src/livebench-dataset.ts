import {
  type FetchedLiveBenchDatasetRevision,
  fetchLiveBenchDatasetRevision,
  planLiveBenchPages,
} from '@llm-bench/connectors';
import type { Database } from '@llm-bench/db';

import {
  ingestLiveBenchPage,
  type LiveBenchIngestionOptions,
  type LiveBenchIngestionSummary,
} from './livebench-ingestion.js';

export type LiveBenchDatasetPageIngestor = (
  db: Database,
  options: LiveBenchIngestionOptions,
) => Promise<LiveBenchIngestionSummary>;

export type LiveBenchDatasetRevisionFetcher =
  () => Promise<FetchedLiveBenchDatasetRevision>;

export interface LiveBenchDatasetIngestionOptions {
  readonly pageLength: number;
  readonly rawStorageRoot: string;
}

export interface LiveBenchDatasetIngestionSummary {
  readonly sourceId: string;
  readonly pageCount: number;
  readonly recordsSeen: number;
  readonly recordsAccepted: number;
  readonly totalAvailable: number;
  readonly datasetRevision: string;
  readonly datasetLastModified: string;
  readonly sourceSnapshotIds: readonly string[];
  readonly ingestionRunIds: readonly string[];
}

export async function ingestLiveBenchDataset(
  db: Database,
  options: LiveBenchDatasetIngestionOptions,
  pageIngestor: LiveBenchDatasetPageIngestor = ingestLiveBenchPage,
  revisionFetcher: LiveBenchDatasetRevisionFetcher = fetchLiveBenchDatasetRevision,
): Promise<LiveBenchDatasetIngestionSummary> {
  planLiveBenchPages(1, options.pageLength);
  const datasetRevision = await revisionFetcher();

  const first = await pageIngestor(db, {
    offset: 0,
    length: options.pageLength,
    rawStorageRoot: options.rawStorageRoot,
    datasetRevision,
  });
  const plannedRequests = planLiveBenchPages(
    first.totalAvailable,
    options.pageLength,
  );
  const pages = [first];

  for (const request of plannedRequests.slice(1)) {
    const page = await pageIngestor(db, {
      ...request,
      rawStorageRoot: options.rawStorageRoot,
      datasetRevision,
    });
    if (page.totalAvailable !== first.totalAvailable) {
      throw new Error('LiveBench total row count changed during pagination');
    }
    pages.push(page);
  }

  return {
    sourceId: first.sourceId,
    pageCount: pages.length,
    recordsSeen: pages.reduce((sum, page) => sum + page.recordsSeen, 0),
    recordsAccepted: pages.reduce((sum, page) => sum + page.recordsAccepted, 0),
    totalAvailable: first.totalAvailable,
    datasetRevision: datasetRevision.revision,
    datasetLastModified: datasetRevision.lastModified,
    sourceSnapshotIds: pages.map((page) => page.sourceSnapshotId),
    ingestionRunIds: pages.map((page) => page.ingestionRunId),
  };
}
