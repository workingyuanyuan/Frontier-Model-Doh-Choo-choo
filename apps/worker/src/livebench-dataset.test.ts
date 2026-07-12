import type { Database } from '@llm-bench/db';
import { describe, expect, it, vi } from 'vitest';

import {
  ingestLiveBenchDataset,
  type LiveBenchDatasetPageIngestor,
} from './livebench-dataset';

const database = {} as Database;
const datasetRevision = {
  datasetId: 'livebench/model_judgment' as const,
  revision: '9704e5da7bfbefe75ac1482a13de827127295993',
  lastModified: '2025-04-07T20:34:22.000Z',
  requestUrl: 'https://huggingface.co/api/datasets/livebench/model_judgment',
  fetchedAt: '2026-07-12T14:00:00.000Z',
};

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
      async () => datasetRevision,
    );

    expect(pageIngestor.mock.calls.map(([, options]) => options)).toEqual([
      { offset: 0, length: 100, rawStorageRoot: 'raw', datasetRevision },
      { offset: 100, length: 100, rawStorageRoot: 'raw', datasetRevision },
      { offset: 200, length: 1, rawStorageRoot: 'raw', datasetRevision },
    ]);
    expect(summary).toMatchObject({
      pageCount: 3,
      recordsSeen: 201,
      recordsAccepted: 201,
      totalAvailable: 201,
      datasetRevision: datasetRevision.revision,
      datasetLastModified: datasetRevision.lastModified,
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
        async () => datasetRevision,
      ),
    ).rejects.toThrow('changed during pagination');
    expect(pageIngestor).toHaveBeenCalledTimes(2);
  });

  it('does not ingest pages when revision capture fails', async () => {
    const pageIngestor = vi.fn<LiveBenchDatasetPageIngestor>();

    await expect(
      ingestLiveBenchDataset(
        database,
        { pageLength: 100, rawStorageRoot: 'raw' },
        pageIngestor,
        async () => {
          throw new Error('Hub unavailable');
        },
      ),
    ).rejects.toThrow('Hub unavailable');
    expect(pageIngestor).not.toHaveBeenCalled();
  });
});
