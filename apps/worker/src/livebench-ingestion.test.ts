import { describe, expect, it } from 'vitest';

import { toStagedLiveBenchRecord } from './livebench-ingestion.js';

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
});
