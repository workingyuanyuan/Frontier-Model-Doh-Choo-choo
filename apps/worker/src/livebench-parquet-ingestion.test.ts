import { describe, expect, it } from 'vitest';

import {
  batchLiveBenchStagedRecords,
  createLiveBenchParquetEvidenceMetadata,
} from './livebench-parquet-ingestion.js';
import type { StagedLiveBenchRecord } from './livebench-ingestion.js';

const datasetRevision = {
  datasetId: 'livebench/model_judgment' as const,
  revision: '9704e5da7bfbefe75ac1482a13de827127295993',
  lastModified: '2025-04-07T20:34:22.000Z',
  requestUrl: 'https://huggingface.co/api/datasets/livebench/model_judgment',
  fetchedAt: '2026-07-13T03:00:00.000Z',
};

const fetched = {
  revision: datasetRevision.revision,
  requestUrl:
    'https://huggingface.co/datasets/livebench/model_judgment/resolve/9704e5da7bfbefe75ac1482a13de827127295993/data/leaderboard-00000-of-00001.parquet?download=true',
  fetchedAt: '2026-07-13T03:01:00.000Z',
  responseStatus: 200,
  contentType: 'application/octet-stream',
  contentSha256:
    '35ad896970151776145c96b31c5ddb3a2749ea9a1d91e6b7f1a4c4c04735182a',
  byteLength: 737_444,
  linkedEtag:
    '"35ad896970151776145c96b31c5ddb3a2749ea9a1d91e6b7f1a4c4c04735182a"',
  downloadOrigin: 'https://us.aws.cdn.hf.co',
  body: new Uint8Array(),
};

describe('LiveBench Parquet ingestion evidence', () => {
  it('binds the immutable revision and artifact metadata', () => {
    expect(
      createLiveBenchParquetEvidenceMetadata(datasetRevision, fetched, 60_372),
    ).toEqual({
      datasetId: 'livebench/model_judgment',
      datasetRevision: datasetRevision.revision,
      datasetLastModified: datasetRevision.lastModified,
      revisionFetchedAt: datasetRevision.fetchedAt,
      revisionRequestUrl: datasetRevision.requestUrl,
      parquetPath: 'data/leaderboard-00000-of-00001.parquet',
      parquetLinkedEtag: fetched.linkedEtag,
      parquetDownloadOrigin: fetched.downloadOrigin,
      totalAvailable: 60_372,
    });
  });

  it('creates bounded insert batches without changing order', () => {
    const records = Array.from(
      { length: 2_001 },
      (_, index) =>
        ({ sourceRecordKey: String(index) }) as StagedLiveBenchRecord,
    );

    const batches = batchLiveBenchStagedRecords(records);

    expect(batches.map((batch) => batch.length)).toEqual([1_000, 1_000, 1]);
    expect(batches[0]?.[0]?.sourceRecordKey).toBe('0');
    expect(batches[2]?.[0]?.sourceRecordKey).toBe('2000');
  });
});
