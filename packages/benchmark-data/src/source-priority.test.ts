import { describe, expect, it } from 'vitest';

import { selectCurrentResults, type CandidateResult } from './index.js';

const evidenceId =
  'sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';

const candidate = (
  overrides: Partial<CandidateResult> = {},
  harness: string | null = null,
): CandidateResult => ({
  schemaVersion: 'candidate-result-v1',
  id: 'organizer-result',
  sourceId: 'benchmark-organizer',
  sourceRole: 'ORGANIZER',
  benchmarkId: 'gpqa-diamond',
  benchmarkVersion: null,
  model: {
    rawName: 'Example Model',
    canonicalModelId: 'example-model',
    profileId: 'example-model-high',
  },
  profile: {
    effort: 'high',
    thinking: null,
    tools: null,
    harness,
    contextWindowTokens: null,
    quantization: null,
    attempts: null,
  },
  metric: {
    id: 'accuracy',
    name: 'Accuracy',
    unit: 'percent',
    higherIsBetter: true,
  },
  rawScore: 80,
  normalizedScore: 80,
  acquisitionStatus: 'FULL',
  inclusion: 'INCLUDED',
  exclusionReason: null,
  sourceUrl: 'https://example.test/benchmark',
  observedAt: '2026-09-01T00:00:00.000Z',
  sourcePublishedAt: '2026-09-01T00:00:00.000Z',
  evidenceIds: [evidenceId],
  provenance: {
    rawScore: { evidenceId, method: 'DOM', locator: 'benchmark table' },
  },
  ...overrides,
});

const expectWinnerInBothOrders = (
  winner: CandidateResult,
  other: CandidateResult,
): void => {
  expect(selectCurrentResults([winner, other])).toEqual([winner]);
  expect(selectCurrentResults([other, winner])).toEqual([winner]);
};

describe('source priority across harnesses', () => {
  it.each([null, 'organizer-harness'])(
    'keeps organizer evidence over a higher vendor score with harness %s',
    (harness) => {
      const organizer = candidate({}, harness);
      const vendor = candidate(
        {
          id: 'vendor-result',
          sourceId: 'model-vendor',
          sourceRole: 'VENDOR',
          rawScore: 95,
          normalizedScore: 95,
          sourcePublishedAt: '2026-10-01T00:00:00.000Z',
        },
        'vendor-harness',
      );

      expectWinnerInBothOrders(organizer, vendor);
    },
  );

  it('applies source role before completeness across differing harnesses', () => {
    const organizer = candidate({ acquisitionStatus: 'PARTIAL_SOURCE' });
    const vendor = candidate(
      {
        id: 'vendor-result',
        sourceId: 'model-vendor',
        sourceRole: 'VENDOR',
        rawScore: 95,
        normalizedScore: 95,
      },
      'vendor-harness',
    );

    expectWinnerInBothOrders(organizer, vendor);
  });

  it.each(['benchmark-organizer', 'second-organizer'])(
    'keeps a full snapshot over a higher partial score from %s with a different harness',
    (sourceId) => {
      const full = candidate({}, 'full-harness');
      const partial = candidate(
        {
          id: 'partial-result',
          sourceId,
          acquisitionStatus: 'PARTIAL_SOURCE',
          rawScore: 95,
          normalizedScore: 95,
          sourcePublishedAt: '2026-10-01T00:00:00.000Z',
        },
        'partial-harness',
      );

      expectWinnerInBothOrders(full, partial);
    },
  );

  it.each([null, 'second-harness'])(
    'takes the higher score between equal-standing sources with harness %s',
    (harness) => {
      const lower = candidate({ sourceRole: 'INDEPENDENT' });
      const higher = candidate(
        {
          id: 'higher-result',
          sourceId: 'second-independent',
          sourceRole: 'INDEPENDENT',
          rawScore: 95,
          normalizedScore: 95,
          sourcePublishedAt: '2026-08-01T00:00:00.000Z',
        },
        harness,
      );

      expectWinnerInBothOrders(higher, lower);
    },
  );

  it('takes the higher score across equal-standing harnesses at the same source', () => {
    const lower = candidate({}, 'lower-harness');
    const higher = candidate(
      {
        id: 'higher-result',
        rawScore: 95,
        normalizedScore: 95,
        sourcePublishedAt: '2026-08-01T00:00:00.000Z',
      },
      'higher-harness',
    );

    expectWinnerInBothOrders(higher, lower);
  });

  it('uses the newer snapshot for the same source and harness even if its score falls', () => {
    const older = candidate({}, 'same-harness');
    const newer = candidate(
      {
        id: 'newer-result',
        rawScore: 70,
        normalizedScore: 70,
        sourcePublishedAt: '2026-10-01T00:00:00.000Z',
      },
      'same-harness',
    );

    expectWinnerInBothOrders(newer, older);
  });

  it('uses publication time to break equal-standing score ties across harnesses', () => {
    const older = candidate({}, 'older-harness');
    const newer = candidate(
      {
        id: 'newer-result',
        sourceId: 'second-organizer',
        sourcePublishedAt: '2026-10-01T00:00:00.000Z',
      },
      'newer-harness',
    );

    expectWinnerInBothOrders(newer, older);
  });
});
