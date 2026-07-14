import { describe, expect, it } from 'vitest';

import type { LiveBenchAggregationReadinessReport } from './livebench-aggregation-readiness.js';
import {
  createLiveBenchPromotionPlan,
  parseLiveBenchPromotionArguments,
  reconcileLiveBenchPromotionPlan,
} from './livebench-promotion.js';

const snapshotId = '019f513f-132a-7dc0-805d-0b036ea0d476';
const modelA = '019f513f-132a-7dc0-805d-0b036ea0d477';
const modelB = '019f513f-132a-7dc0-805d-0b036ea0d478';

function report(
  models: LiveBenchAggregationReadinessReport['aggregation']['models'],
  sourceSnapshotIds: readonly string[] = [snapshotId],
): LiveBenchAggregationReadinessReport {
  return {
    ingestionRun: {
      id: '019f513f-132a-7dc0-805d-0b036ea0d479',
      connectorVersion: 'livebench-parquet-v1',
      recordsSeen: 10,
      recordsValidated: 10,
      recordsExcluded: 0,
      recordsMatchedInventory: 10,
      recordsOutsideInventory: 0,
      sourceSnapshotIds,
    },
    questionInventory: {
      contentSha256:
        'b8a90d2f2308b774fbee982178d433412fd6f349429be2a41def4331b0ee4027',
      release: '2024-11-25',
      inventoryObservationCount: 1_000,
      stagedObservationKeyCount: 318,
      missingObservationCount: 682,
      categories: [],
    },
    aggregation: {
      inventory: { categories: [] },
      summary: {
        inventoryObservationCount: 1_000,
        modelCount: models.length,
        completeModelCount: 0,
        duplicateObservationCount: 0,
        conflictingObservationKeyCount: 1,
        missingCategories: [],
        isReadyForPublication: false,
      },
      models,
    },
  };
}

const completeCoding = {
  category: 'coding' as const,
  score: null,
  coverage: 0.5,
  status: 'INCOMPLETE' as const,
  tasks: [
    {
      task: 'coding_completion',
      score: 75,
      coverage: 1,
      expectedObservations: 50,
      observedObservations: 50,
      duplicateObservations: 2,
      conflictingObservations: 0,
      status: 'COMPLETE' as const,
    },
    {
      task: 'LCB_generation',
      score: null,
      coverage: 0.5,
      expectedObservations: 78,
      observedObservations: 39,
      duplicateObservations: 0,
      conflictingObservations: 0,
      status: 'INCOMPLETE' as const,
    },
  ],
};

const conflictingCoding = {
  category: 'coding' as const,
  score: null,
  coverage: 0.9,
  status: 'CONFLICTING' as const,
  tasks: [
    {
      task: 'coding_completion',
      score: null,
      coverage: 0.98,
      expectedObservations: 50,
      observedObservations: 49,
      duplicateObservations: 1,
      conflictingObservations: 1,
      status: 'CONFLICTING' as const,
    },
  ],
};

describe('LiveBench result promotion plan', () => {
  it('accepts pnpm argument separators without weakening unknown-arg checks', () => {
    expect(parseLiveBenchPromotionArguments([])).toEqual({ dryRun: true });
    expect(parseLiveBenchPromotionArguments(['--', '--apply'])).toEqual({
      dryRun: false,
    });
    expect(() => parseLiveBenchPromotionArguments(['--force'])).toThrow(
      'Unknown promotion arguments',
    );
  });

  it('selects only complete conflict-free task aggregates', () => {
    const plan = createLiveBenchPromotionPlan(
      report([
        { modelVariantId: modelB, categories: [conflictingCoding] },
        { modelVariantId: modelA, categories: [completeCoding] },
      ]),
    );

    expect(plan.summary).toEqual({
      candidateCount: 1,
      blockedIncompleteCount: 1,
      blockedConflictingCount: 1,
    });
    expect(plan.candidates).toEqual([
      expect.objectContaining({
        modelVariantId: modelA,
        metricSlug: 'coding-completion',
        sourceSnapshotId: snapshotId,
        value: 75,
        sampleSize: 50,
        publicationStatus: 'PUBLISHED',
        qualityFlags: [],
      }),
    ]);
    expect(plan.candidates[0]?.publicationKey).toMatch(/^[a-f0-9]{64}$/u);
    expect(plan.candidates[0]?.evidenceLocator).toEqual(
      expect.objectContaining({
        release: '2024-11-25',
        task: 'coding_completion',
        category: 'coding',
        duplicateObservations: 2,
      }),
    );
  });

  it('is deterministic regardless of model input order', () => {
    const first = createLiveBenchPromotionPlan(
      report([
        { modelVariantId: modelB, categories: [conflictingCoding] },
        { modelVariantId: modelA, categories: [completeCoding] },
      ]),
    );
    const second = createLiveBenchPromotionPlan(
      report([
        { modelVariantId: modelA, categories: [completeCoding] },
        { modelVariantId: modelB, categories: [conflictingCoding] },
      ]),
    );

    expect(second).toEqual(first);
  });

  it('fails closed on ambiguous snapshots and unknown task mappings', () => {
    expect(() =>
      createLiveBenchPromotionPlan(report([], [snapshotId, modelA])),
    ).toThrow('exactly one source snapshot');

    const unknownTask = {
      ...completeCoding,
      tasks: [{ ...completeCoding.tasks[0]!, task: 'unknown_task' }],
    };
    expect(() =>
      createLiveBenchPromotionPlan(
        report([{ modelVariantId: modelA, categories: [unknownTask] }]),
      ),
    ).toThrow('not configured');
  });

  it('reconciles retry state without changing candidate order', () => {
    const plan = createLiveBenchPromotionPlan(
      report([
        { modelVariantId: modelA, categories: [completeCoding] },
        { modelVariantId: modelB, categories: [completeCoding] },
      ]),
    );
    const existingKey = plan.candidates[1]?.publicationKey;
    expect(existingKey).toBeDefined();

    const reconciliation = reconcileLiveBenchPromotionPlan(plan, [
      existingKey!,
      existingKey!,
    ]);

    expect(reconciliation.existingResultCount).toBe(1);
    expect(reconciliation.toInsert).toEqual([plan.candidates[0]]);
  });
});
