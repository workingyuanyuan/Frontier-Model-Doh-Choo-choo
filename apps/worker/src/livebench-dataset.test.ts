import type { Database } from '@llm-bench/db';
import { describe, expect, it, vi } from 'vitest';

import {
  ingestLiveBenchDataset,
  type LiveBenchDatasetPageIngestor,
} from './livebench-dataset';

const database = {} as Database;

function pageSummary(offset: number, length: number, totalAvailable = 201) {
  return {
    sourceId: 'source-id',
    sourceSnapshotId: `snapshot-${offset}`,
    ingestionRunId: `run-${offset}`,
    contentSha256: 'a'.repeat(64),
    storagePath: `raw/${offset}.json`,
    recordsSeen: Math.min(length, Math.max(0, totalAvailable - offset)),
    recordsAccepted: Math.min(length, Math.max(0, totalAvailable - offset)),
    totalAvailable,
  };
}

describe('LiveBench full dataset ingestion', () => {
  it('ingests every planned page sequentially and returns an aggregate summary', async () => {
    const pageIngestor = vi.fn<LiveBenchDatasetPageIngestor>(
      async (_db, options) => pageSummary(options.offset, options.length),
    );

    const summary = await ingestLiveBenchDataset(
      database,
      { pageLength: 100, rawStorageRoot: 'raw' },
      pageIngestor,
    );

    expect(pageIngestor.mock.calls.map(([, options]) => options)).toEqual([
      { offset: 0, length: 100, rawStorageRoot: 'raw' },
      { offset: 100, length: 100, rawStorageRoot: 'raw' },
      { offset: 200, length: 1, rawStorageRoot: 'raw' },
    ]);
    expect(summary).toMatchObject({
      pageCount: 3,
      recordsSeen: 201,
      recordsAccepted: 201,
      totalAvailable: 201,
    });
    expect(summary.sourceSnapshotIds).toEqual([
      'snapshot-0',
      'snapshot-100',
      'snapshot-200',
    ]);
  });

  it('stops when the source total changes during pagination', async () => {
    const pageIngestor = vi.fn<LiveBenchDatasetPageIngestor>(
      async (_db, options) =>
        pageSummary(
          options.offset,
          options.length,
          options.offset === 0 ? 201 : 202,
        ),
    );

    await expect(
      ingestLiveBenchDataset(
        database,
        { pageLength: 100, rawStorageRoot: 'raw' },
        pageIngestor,
      ),
    ).rejects.toThrow('changed during pagination');
    expect(pageIngestor).toHaveBeenCalledTimes(2);
  });
});
