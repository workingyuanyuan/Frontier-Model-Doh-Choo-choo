import type {
  LiveBenchJudgment,
  LiveBenchQuestionInventoryObservation,
} from '@llm-bench/connectors';
import { describe, expect, it } from 'vitest';

import {
  buildLiveBenchAggregationReadinessReport,
  type LiveBenchAggregationRun,
  type LiveBenchAggregationStagedRow,
} from './livebench-aggregation-readiness.js';

const RUN_ID = '019f5d58-08e7-74fc-977f-cdd4c923e480';
const VARIANT_ID = '019f5d58-08e7-74fc-977f-cdd4c923e481';
const SNAPSHOT_ID = '019f5d58-08e7-74fc-977f-cdd4c923e482';
const INVENTORY_SHA256 =
  'b8a90d2f2308b774fbee982178d433412fd6f349429be2a41def4331b0ee4027';

function run(overrides: Partial<LiveBenchAggregationRun> = {}) {
  return {
    id: RUN_ID,
    status: 'SUCCEEDED',
    connectorVersion: 'livebench-parquet-v1',
    recordsSeen: 2,
    recordsAccepted: 2,
    ...overrides,
  } satisfies LiveBenchAggregationRun;
}

function stagedRow(
  overrides: Partial<LiveBenchAggregationStagedRow> = {},
): LiveBenchAggregationStagedRow {
  return {
    sourceSnapshotId: SNAPSHOT_ID,
    resolvedModelVariantId: VARIANT_ID,
    validationStatus: 'VALIDATED',
    payload: payload(),
    ...overrides,
  };
}

function payload(
  overrides: Partial<LiveBenchJudgment> = {},
): LiveBenchJudgment {
  return {
    question_id: 'a'.repeat(64),
    task: 'connections',
    model: 'model-a',
    score: 0.5,
    turn: 1,
    tstamp: 1_725_000_000,
    category: 'language',
    ...overrides,
  };
}

function questionInventory(
  observations: readonly LiveBenchQuestionInventoryObservation[] = [
    {
      category: 'language' as const,
      task: 'connections',
      questionId: 'a'.repeat(64),
      turn: 1,
    },
    {
      category: 'language' as const,
      task: 'connections',
      questionId: 'b'.repeat(64),
      turn: 1,
    },
  ],
) {
  return {
    contentSha256: INVENTORY_SHA256,
    release: '2024-11-25' as const,
    observations,
  };
}

describe('buildLiveBenchAggregationReadinessReport', () => {
  it('uses excluded rows for inventory without allowing them to contribute scores', () => {
    const report = buildLiveBenchAggregationReadinessReport(
      run(),
      [
        stagedRow(),
        stagedRow({
          resolvedModelVariantId: null,
          validationStatus: 'EXCLUDED',
          payload: {
            question_id: 'b'.repeat(64),
            task: 'connections',
            model: 'private-checkpoint',
            score: 1,
            turn: 1,
            tstamp: 1_725_000_100,
            category: 'language',
          },
        }),
      ],
      questionInventory(),
    );

    expect(report).toMatchObject({
      ingestionRun: {
        id: RUN_ID,
        recordsSeen: 2,
        recordsValidated: 1,
        recordsExcluded: 1,
        recordsMatchedInventory: 2,
        recordsOutsideInventory: 0,
        sourceSnapshotIds: [SNAPSHOT_ID],
      },
      questionInventory: {
        contentSha256: INVENTORY_SHA256,
        release: '2024-11-25',
        inventoryObservationCount: 2,
        stagedObservationKeyCount: 2,
        missingObservationCount: 0,
      },
      aggregation: {
        inventory: {
          categories: [
            {
              category: 'language',
              tasks: [{ task: 'connections', expectedObservations: 2 }],
            },
          ],
        },
        summary: {
          inventoryObservationCount: 2,
          modelCount: 1,
          completeModelCount: 0,
          isReadyForPublication: false,
        },
      },
    });
    expect(report.aggregation.models[0]?.categories[0]?.tasks[0]).toMatchObject(
      {
        score: null,
        coverage: 0.5,
        expectedObservations: 2,
        observedObservations: 1,
        status: 'INCOMPLETE',
      },
    );
  });

  it('filters judgments outside the pinned release and reports all six category gaps', () => {
    const observations = [
      ['reasoning', 'reasoning-task', '1'],
      ['math', 'math-task', '2'],
      ['coding', 'coding-task', '3'],
      ['language', 'connections', 'a'],
      ['data_analysis', 'data-task', '4'],
      ['instruction_following', 'if-task', '5'],
    ].map(([category, task, questionId]) => ({
      category: category as
        | 'reasoning'
        | 'math'
        | 'coding'
        | 'language'
        | 'data_analysis'
        | 'instruction_following',
      task: task!,
      questionId: questionId!.repeat(64),
      turn: 1,
    }));
    const report = buildLiveBenchAggregationReadinessReport(
      run(),
      [
        stagedRow(),
        stagedRow({ payload: payload({ question_id: 'f'.repeat(64) }) }),
      ],
      questionInventory(observations),
    );

    expect(report.ingestionRun).toMatchObject({
      recordsMatchedInventory: 1,
      recordsOutsideInventory: 1,
    });
    expect(report.questionInventory.categories).toEqual([
      expect.objectContaining({ category: 'coding', coverage: 0 }),
      expect.objectContaining({ category: 'data_analysis', coverage: 0 }),
      expect.objectContaining({
        category: 'instruction_following',
        coverage: 0,
      }),
      expect.objectContaining({ category: 'language', coverage: 1 }),
      expect.objectContaining({ category: 'math', coverage: 0 }),
      expect.objectContaining({ category: 'reasoning', coverage: 0 }),
    ]);
    expect(report.questionInventory).toMatchObject({
      inventoryObservationCount: 6,
      stagedObservationKeyCount: 1,
      missingObservationCount: 5,
    });
    expect(report.aggregation.summary).toMatchObject({
      inventoryObservationCount: 6,
      missingCategories: [],
      isReadyForPublication: false,
    });
  });

  it('rejects staged metadata drift for a pinned question turn', () => {
    expect(() =>
      buildLiveBenchAggregationReadinessReport(
        run(),
        [
          stagedRow({ payload: payload({ task: 'wrong-task' }) }),
          stagedRow({ payload: payload({ question_id: 'b'.repeat(64) }) }),
        ],
        questionInventory(),
      ),
    ).toThrow('metadata');
  });

  it.each([
    ['a failed run', run({ status: 'FAILED' })],
    ['a paged run', run({ connectorVersion: 'livebench-rows-v1' })],
    ['a partial run', run({ recordsAccepted: 1 })],
  ])('rejects %s', (_label, invalidRun) => {
    expect(() =>
      buildLiveBenchAggregationReadinessReport(
        invalidRun,
        [
          stagedRow(),
          stagedRow({
            payload: payload({ question_id: 'b'.repeat(64) }),
          }),
        ],
        questionInventory(),
      ),
    ).toThrow();
  });

  it('rejects persisted alias states that violate adjudication invariants', () => {
    expect(() =>
      buildLiveBenchAggregationReadinessReport(
        run(),
        [
          stagedRow({ resolvedModelVariantId: null }),
          stagedRow({
            resolvedModelVariantId: null,
            validationStatus: 'EXCLUDED',
            payload: payload({ question_id: 'b'.repeat(64) }),
          }),
        ],
        questionInventory(),
      ),
    ).toThrow('VALIDATED');

    expect(() =>
      buildLiveBenchAggregationReadinessReport(
        run(),
        [
          stagedRow({ validationStatus: 'REVIEW_REQUIRED' }),
          stagedRow({
            payload: payload({ question_id: 'b'.repeat(64) }),
          }),
        ],
        questionInventory(),
      ),
    ).toThrow('Unexpected');
  });

  it('rejects malformed staged payloads at the aggregation boundary', () => {
    expect(() =>
      buildLiveBenchAggregationReadinessReport(
        run({ recordsSeen: 1, recordsAccepted: 1 }),
        [stagedRow({ payload: { category: 'language', score: 2 } })],
        questionInventory(),
      ),
    ).toThrow('payload');
  });

  it('rejects a row count that differs from the ingestion audit trail', () => {
    expect(() =>
      buildLiveBenchAggregationReadinessReport(
        run(),
        [stagedRow()],
        questionInventory(),
      ),
    ).toThrow('row count');
  });

  it('rejects an ingestion run above the bounded aggregation row limit', () => {
    expect(() =>
      buildLiveBenchAggregationReadinessReport(
        run({ recordsSeen: 100_001, recordsAccepted: 100_001 }),
        [],
        questionInventory(),
      ),
    ).toThrow('row limit');
  });
});
