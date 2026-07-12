import { planLiveBenchPages } from '@llm-bench/connectors';
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
  readonly sourceSnapshotIds: readonly string[];
  readonly ingestionRunIds: readonly string[];
}

export async function ingestLiveBenchDataset(
  db: Database,
  options: LiveBenchDatasetIngestionOptions,
  pageIngestor: LiveBenchDatasetPageIngestor = ingestLiveBenchPage,
): Promise<LiveBenchDatasetIngestionSummary> {
  planLiveBenchPages(1, options.pageLength);

  const first = await pageIngestor(db, {
    offset: 0,
    length: options.pageLength,
    rawStorageRoot: options.rawStorageRoot,
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
    sourceSnapshotIds: pages.map((page) => page.sourceSnapshotId),
    ingestionRunIds: pages.map((page) => page.ingestionRunId),
  };
}
