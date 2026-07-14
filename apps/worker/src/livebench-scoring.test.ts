import { describe, expect, it } from 'vitest';

import {
  computeLiveBenchScores,
  createScoreSnapshotContentHash,
  parseLiveBenchScoringArguments,
  reconcileScoreSnapshot,
  type LiveBenchScoreInput,
} from './livebench-scoring.js';

const modelId = '019f513f-132a-7dc0-805d-0b036ea0d477';
const snapshotId = '019f513f-132a-7dc0-805d-0b036ea0d476';

const input: LiveBenchScoreInput = {
  scoringMethodVersion: 'absolute-capability-v1',
  mappings: [
    {
      metricId: 'metric-coding-a',
      dimension: 'coding',
      weight: 0.5,
      lowerAnchor: 0,
      upperAnchor: 100,
      direction: 'HIGHER_IS_BETTER',
    },
    {
      metricId: 'metric-coding-b',
      dimension: 'coding',
      weight: 0.5,
      lowerAnchor: 0,
      upperAnchor: 100,
      direction: 'HIGHER_IS_BETTER',
    },
    {
      metricId: 'metric-language',
      dimension: 'language',
      weight: 1,
      lowerAnchor: 0,
      upperAnchor: 100,
      direction: 'HIGHER_IS_BETTER',
    },
  ],
  models: [
    {
      modelVariantId: modelId,
      slug: 'example-model',
      displayName: 'Example Model',
      providerName: 'Example Provider',
      results: [
        {
          resultId: 'result-coding-a',
          metricId: 'metric-coding-a',
          value: 80,
          evidenceQuality: 1,
          isIndependent: true,
          sourceSnapshotId: snapshotId,
        },
        {
          resultId: 'result-language',
          metricId: 'metric-language',
          value: 60,
          evidenceQuality: 1,
          isIndependent: true,
          sourceSnapshotId: snapshotId,
        },
      ],
    },
  ],
};

describe('LiveBench score computation', () => {
  it('defaults to a dry run and validates an optional edition date', () => {
    expect(parseLiveBenchScoringArguments([])).toEqual({
      dryRun: true,
      editionDate: undefined,
    });
    expect(
      parseLiveBenchScoringArguments([
        '--',
        '--apply',
        '--edition',
        '2026-07-12',
      ]),
    ).toEqual({ dryRun: false, editionDate: '2026-07-12' });
    expect(() =>
      parseLiveBenchScoringArguments(['--edition', '07/12/2026']),
    ).toThrow('edition');
    expect(() => parseLiveBenchScoringArguments(['--force'])).toThrow(
      'Unknown scoring argument',
    );
  });

  it('keeps unsupported dimensions null and sparse models unranked', () => {
    const plan = computeLiveBenchScores(input);
    const entry = plan.entries[0];

    expect(entry).toBeDefined();
    expect(entry?.rank).toBeNull();
    expect(entry?.overallScore).toBeNull();
    expect(entry?.rankingStatus).toBe('UNRANKED');
    expect(entry?.qualityFlags).toContain('LOW_COVERAGE');
    expect(
      entry?.dimensions.find(({ dimension }) => dimension === 'coding'),
    ).toEqual(
      expect.objectContaining({
        score: 80,
        coverage: 0.5,
        status: 'FORMAL',
      }),
    );
    expect(
      entry?.dimensions.find(({ dimension }) => dimension === 'knowledge'),
    ).toEqual({
      dimension: 'knowledge',
      score: null,
      coverage: 0,
      confidence: 0,
      status: 'INSUFFICIENT_DATA',
    });
  });

  it('records result components and unique source snapshots deterministically', () => {
    const plan = computeLiveBenchScores(input);

    expect(plan.sourceSnapshotIds).toEqual([snapshotId]);
    expect(plan.models[0]?.dimensions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          dimension: 'coding',
          componentResultIds: ['result-coding-a'],
        }),
      ]),
    );
  });

  it('produces the same content hash regardless of input model ordering', () => {
    const secondModel = {
      ...input.models[0]!,
      modelVariantId: '019f513f-132a-7dc0-805d-0b036ea0d478',
      slug: 'another-model',
    };
    const first = computeLiveBenchScores({
      ...input,
      models: [input.models[0]!, secondModel],
    });
    const second = computeLiveBenchScores({
      ...input,
      models: [secondModel, input.models[0]!],
    });

    const metadata = {
      editionDate: '2026-07-12',
      dataCutoffAt: '2026-07-12T00:00:00.000Z',
    };
    expect(createScoreSnapshotContentHash(first, metadata)).toBe(
      createScoreSnapshotContentHash(second, metadata),
    );
  });

  it('fails closed on duplicate model-metric results', () => {
    expect(() =>
      computeLiveBenchScores({
        ...input,
        models: [
          {
            ...input.models[0]!,
            results: [
              input.models[0]!.results[0]!,
              input.models[0]!.results[0]!,
            ],
          },
        ],
      }),
    ).toThrow('Duplicate published result');
  });

  it('reuses an identical immutable snapshot and rejects changed content', () => {
    expect(reconcileScoreSnapshot(undefined, 'same-hash')).toBe('CREATE');
    expect(reconcileScoreSnapshot('same-hash', 'same-hash')).toBe('REUSE');
    expect(() => reconcileScoreSnapshot('old-hash', 'new-hash')).toThrow(
      'Immutable ranking snapshot conflict',
    );
  });
});
