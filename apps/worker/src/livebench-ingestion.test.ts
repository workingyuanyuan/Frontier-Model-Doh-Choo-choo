import { describe, expect, it } from 'vitest';

import {
  createLiveBenchEvidenceMetadata,
  toStagedLiveBenchRecord,
} from './livebench-ingestion.js';

const judgment = {
  question_id:
    '02af5e41681a8e07cb79f87ba76a79f75210e2887e0dc3006f913a952d25dd00',
  task: 'typos',
  model: 'claude-3-5-sonnet-20241022',
  score: 1,
  turn: 1,
  tstamp: 1_738_872_686.283_047,
  category: 'language' as const,
};

describe('LiveBench staging mapping', () => {
  it('keeps the source payload and model name unresolved', () => {
    const record = toStagedLiveBenchRecord(judgment);

    expect(record.rawModelName).toBe('claude-3-5-sonnet-20241022');
    expect(record.resolvedModelVariantId).toBeNull();
    expect(record.validationStatus).toBe('VALIDATED');
    expect(record.payload).toEqual(judgment);
  });

  it('creates a stable non-PII source record key', () => {
    const first = toStagedLiveBenchRecord(judgment);
    const second = toStagedLiveBenchRecord(structuredClone(judgment));

    expect(first.sourceRecordKey).toBe(second.sourceRecordKey);
    expect(first.sourceRecordKey).toMatch(/^[a-f0-9]{64}$/);
    expect(first.sourceRecordKey).not.toContain(judgment.model);
  });

  it('binds the immutable dataset revision into evidence metadata', () => {
    const metadata = createLiveBenchEvidenceMetadata(
      {
        offset: 100,
        length: 100,
        rawStorageRoot: 'raw',
        datasetRevision: {
          datasetId: 'livebench/model_judgment',
          revision: '9704e5da7bfbefe75ac1482a13de827127295993',
          lastModified: '2025-04-07T20:34:22.000Z',
          requestUrl:
            'https://huggingface.co/api/datasets/livebench/model_judgment',
          fetchedAt: '2026-07-12T14:00:00.000Z',
        },
      },
      60_372,
    );

    expect(metadata).toEqual({
      offset: 100,
      length: 100,
      totalAvailable: 60_372,
      datasetId: 'livebench/model_judgment',
      datasetRevision: '9704e5da7bfbefe75ac1482a13de827127295993',
      datasetLastModified: '2025-04-07T20:34:22.000Z',
      revisionFetchedAt: '2026-07-12T14:00:00.000Z',
      revisionRequestUrl:
        'https://huggingface.co/api/datasets/livebench/model_judgment',
    });
  });
});
