import type { LiveBenchJudgment } from '@llm-bench/connectors';
import { describe, expect, it } from 'vitest';

import {
  buildLiveBenchAggregationReadinessReport,
  type LiveBenchAggregationRun,
  type LiveBenchAggregationStagedRow,
} from './livebench-aggregation-readiness.js';

const RUN_ID = '019f5d58-08e7-74fc-977f-cdd4c923e480';
const VARIANT_ID = '019f5d58-08e7-74fc-977f-cdd4c923e481';
const SNAPSHOT_ID = '019f5d58-08e7-74fc-977f-cdd4c923e482';

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

describe('buildLiveBenchAggregationReadinessReport', () => {
  it('uses excluded rows for inventory without allowing them to contribute scores', () => {
    const report = buildLiveBenchAggregationReadinessReport(run(), [
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
    ]);

    expect(report).toMatchObject({
      ingestionRun: {
        id: RUN_ID,
        recordsSeen: 2,
        recordsValidated: 1,
        recordsExcluded: 1,
        sourceSnapshotIds: [SNAPSHOT_ID],
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

  it.each([
    ['a failed run', run({ status: 'FAILED' })],
    ['a paged run', run({ connectorVersion: 'livebench-rows-v1' })],
    ['a partial run', run({ recordsAccepted: 1 })],
  ])('rejects %s', (_label, invalidRun) => {
    expect(() =>
      buildLiveBenchAggregationReadinessReport(invalidRun, [
        stagedRow(),
        stagedRow({
          payload: payload({ question_id: 'b'.repeat(64) }),
        }),
      ]),
    ).toThrow();
  });

  it('rejects persisted alias states that violate adjudication invariants', () => {
    expect(() =>
      buildLiveBenchAggregationReadinessReport(run(), [
        stagedRow({ resolvedModelVariantId: null }),
        stagedRow({
          resolvedModelVariantId: null,
          validationStatus: 'EXCLUDED',
          payload: payload({ question_id: 'b'.repeat(64) }),
        }),
      ]),
    ).toThrow('VALIDATED');

    expect(() =>
      buildLiveBenchAggregationReadinessReport(run(), [
        stagedRow({ validationStatus: 'REVIEW_REQUIRED' }),
        stagedRow({
          payload: payload({ question_id: 'b'.repeat(64) }),
        }),
      ]),
    ).toThrow('Unexpected');
  });

  it('rejects malformed staged payloads at the aggregation boundary', () => {
    expect(() =>
      buildLiveBenchAggregationReadinessReport(
        run({ recordsSeen: 1, recordsAccepted: 1 }),
        [stagedRow({ payload: { category: 'language', score: 2 } })],
      ),
    ).toThrow('payload');
  });

  it('rejects a row count that differs from the ingestion audit trail', () => {
    expect(() =>
      buildLiveBenchAggregationReadinessReport(run(), [stagedRow()]),
    ).toThrow('row count');
  });
});
