import { describe, expect, it } from 'vitest';

import {
  LIVEBENCH_REQUIRED_CATEGORIES,
  aggregateLiveBenchJudgments,
  type LiveBenchAggregationInventoryRow,
  type LiveBenchAggregationObservation,
} from './livebench-aggregation.js';

const inventory: readonly LiveBenchAggregationInventoryRow[] = [
  { category: 'language', task: 'alpha', questionId: 'q-1', turn: 1 },
  { category: 'language', task: 'alpha', questionId: 'q-2', turn: 1 },
  { category: 'language', task: 'beta', questionId: 'q-3', turn: 1 },
  { category: 'coding', task: 'code', questionId: 'q-4', turn: 1 },
];

function observation(
  overrides: Partial<LiveBenchAggregationObservation> = {},
): LiveBenchAggregationObservation {
  return {
    modelVariantId: '019f5d58-08e7-74fc-977f-cdd4c923e48a',
    category: 'language',
    task: 'alpha',
    questionId: 'q-1',
    turn: 1,
    score: 0.25,
    evaluatedAtUnixSeconds: 1_725_000_000,
    ...overrides,
  };
}

describe('aggregateLiveBenchJudgments', () => {
  it('uses question means inside equal-weight task category means with stable ordering', () => {
    const modelB = '019f5d58-08e7-74fc-977f-cdd4c923e48b';
    const report = aggregateLiveBenchJudgments({
      inventory,
      requiredCategories: ['language', 'coding'],
      observations: [
        observation({
          modelVariantId: modelB,
          category: 'coding',
          task: 'code',
          questionId: 'q-4',
          score: 0.4,
        }),
        observation({ modelVariantId: modelB, questionId: 'q-2', score: 0.75 }),
        observation({
          modelVariantId: modelB,
          task: 'beta',
          questionId: 'q-3',
          score: 1,
        }),
        observation({ modelVariantId: modelB, score: 0.25 }),
      ],
    });

    expect(report.models).toHaveLength(1);
    expect(report.models[0]?.modelVariantId).toBe(modelB);
    expect(
      report.models[0]?.categories.map(({ category }) => category),
    ).toEqual(['coding', 'language']);
    expect(report.models[0]?.categories[0]).toMatchObject({
      category: 'coding',
      score: 40,
      coverage: 1,
      status: 'COMPLETE',
    });
    expect(report.models[0]?.categories[1]).toMatchObject({
      category: 'language',
      score: 75,
      coverage: 1,
      status: 'COMPLETE',
    });
    expect(report.models[0]?.categories[1]?.tasks).toEqual([
      {
        task: 'alpha',
        score: 50,
        coverage: 1,
        expectedObservations: 2,
        observedObservations: 2,
        duplicateObservations: 0,
        conflictingObservations: 0,
        status: 'COMPLETE',
      },
      {
        task: 'beta',
        score: 100,
        coverage: 1,
        expectedObservations: 1,
        observedObservations: 1,
        duplicateObservations: 0,
        conflictingObservations: 0,
        status: 'COMPLETE',
      },
    ]);
  });

  it('keeps incomplete task and category scores null instead of filling missing values', () => {
    const report = aggregateLiveBenchJudgments({
      inventory,
      requiredCategories: ['language', 'coding'],
      observations: [
        observation(),
        observation({ task: 'beta', questionId: 'q-3', score: 1 }),
      ],
    });

    expect(report.models[0]?.categories).toEqual([
      {
        category: 'coding',
        score: null,
        coverage: 0,
        status: 'INCOMPLETE',
        tasks: [
          {
            task: 'code',
            score: null,
            coverage: 0,
            expectedObservations: 1,
            observedObservations: 0,
            duplicateObservations: 0,
            conflictingObservations: 0,
            status: 'INCOMPLETE',
          },
        ],
      },
      {
        category: 'language',
        score: null,
        coverage: 2 / 3,
        status: 'INCOMPLETE',
        tasks: [
          expect.objectContaining({
            task: 'alpha',
            score: null,
            coverage: 0.5,
          }),
          expect.objectContaining({ task: 'beta', score: 100, coverage: 1 }),
        ],
      },
    ]);
    expect(report.summary).toMatchObject({
      completeModelCount: 0,
      isReadyForPublication: false,
    });
  });

  it('collapses identical repeats without double weighting their score', () => {
    const report = aggregateLiveBenchJudgments({
      inventory: inventory.slice(0, 1),
      requiredCategories: ['language'],
      observations: [
        observation({ score: 0.5 }),
        observation({ score: 0.5, evaluatedAtUnixSeconds: 1_735_000_000 }),
      ],
    });

    expect(report.summary).toMatchObject({
      completeModelCount: 1,
      duplicateObservationCount: 1,
      conflictingObservationKeyCount: 0,
      isReadyForPublication: true,
    });
    expect(report.models[0]?.categories[0]?.tasks[0]).toMatchObject({
      score: 50,
      observedObservations: 1,
      duplicateObservations: 1,
      status: 'COMPLETE',
    });
  });

  it('blocks conflicting repeats from task and category scores', () => {
    const report = aggregateLiveBenchJudgments({
      inventory: inventory.slice(0, 1),
      requiredCategories: ['language'],
      observations: [
        observation({ score: 0.25 }),
        observation({ score: 0.75, evaluatedAtUnixSeconds: 1_735_000_000 }),
      ],
    });

    expect(report.summary).toMatchObject({
      duplicateObservationCount: 1,
      conflictingObservationKeyCount: 1,
      isReadyForPublication: false,
    });
    expect(report.models[0]?.categories[0]).toMatchObject({
      score: null,
      coverage: 0,
      status: 'CONFLICTING',
    });
    expect(report.models[0]?.categories[0]?.tasks[0]).toMatchObject({
      score: null,
      observedObservations: 0,
      duplicateObservations: 1,
      conflictingObservations: 1,
      status: 'CONFLICTING',
    });
  });

  it('reports missing required categories as a publication blocker', () => {
    const report = aggregateLiveBenchJudgments({
      inventory: inventory.slice(0, 1),
      requiredCategories: LIVEBENCH_REQUIRED_CATEGORIES,
      observations: [observation()],
    });

    expect(report.summary.missingCategories).toEqual([
      'coding',
      'data_analysis',
      'instruction_following',
      'math',
      'reasoning',
    ]);
    expect(report.summary.isReadyForPublication).toBe(false);
  });
});
