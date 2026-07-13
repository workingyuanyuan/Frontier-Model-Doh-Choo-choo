import {
  LIVEBENCH_MAX_QUESTION_ROWS,
  LIVEBENCH_PUBLIC_RELEASE,
  LiveBenchJudgmentSchema,
  type LiveBenchQuestionInventoryObservation,
} from '@llm-bench/connectors';
import {
  type Database,
  ingestionRuns,
  sources,
  stagedResults,
} from '@llm-bench/db';
import { and, eq } from 'drizzle-orm';

import {
  type LiveBenchAggregationReport,
  aggregateLiveBenchJudgments,
  liveBenchAggregationInventoryKey,
} from './livebench-aggregation.js';
import { LIVEBENCH_PARQUET_CONNECTOR_VERSION } from './livebench-parquet-ingestion.js';

export interface LiveBenchAggregationRun {
  readonly id: string;
  readonly status: string;
  readonly connectorVersion: string;
  readonly recordsSeen: number;
  readonly recordsAccepted: number;
}

export interface LiveBenchAggregationStagedRow {
  readonly sourceSnapshotId: string;
  readonly resolvedModelVariantId: string | null;
  readonly validationStatus: string;
  readonly payload: unknown;
}

export const LIVEBENCH_MAX_AGGREGATION_ROWS = 100_000;

export interface LiveBenchAggregationQuestionInventory {
  readonly contentSha256: string;
  readonly release: typeof LIVEBENCH_PUBLIC_RELEASE;
  readonly observations: readonly LiveBenchQuestionInventoryObservation[];
}

export interface LiveBenchAggregationReadinessReport {
  readonly ingestionRun: {
    readonly id: string;
    readonly connectorVersion: string;
    readonly recordsSeen: number;
    readonly recordsValidated: number;
    readonly recordsExcluded: number;
    readonly recordsMatchedInventory: number;
    readonly recordsOutsideInventory: number;
    readonly sourceSnapshotIds: readonly string[];
  };
  readonly questionInventory: {
    readonly contentSha256: string;
    readonly release: typeof LIVEBENCH_PUBLIC_RELEASE;
    readonly inventoryObservationCount: number;
    readonly stagedObservationKeyCount: number;
    readonly missingObservationCount: number;
    readonly categories: readonly {
      readonly category: LiveBenchQuestionInventoryObservation['category'];
      readonly coverage: number;
      readonly expectedObservations: number;
      readonly stagedObservationKeys: number;
      readonly missingObservations: number;
    }[];
  };
  readonly aggregation: LiveBenchAggregationReport;
}

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function questionTurnKey(
  row: Pick<LiveBenchQuestionInventoryObservation, 'questionId' | 'turn'>,
): string {
  return JSON.stringify([row.questionId, row.turn]);
}

function assertLiveBenchAggregationRun(run: LiveBenchAggregationRun): void {
  if (run.status !== 'SUCCEEDED') {
    throw new Error('LiveBench aggregation requires a succeeded ingestion run');
  }
  if (run.connectorVersion !== LIVEBENCH_PARQUET_CONNECTOR_VERSION) {
    throw new Error(
      'LiveBench aggregation requires a full Parquet ingestion run',
    );
  }
  if (run.recordsSeen <= 0 || run.recordsAccepted !== run.recordsSeen) {
    throw new Error('LiveBench aggregation requires a complete ingestion run');
  }
  if (run.recordsSeen > LIVEBENCH_MAX_AGGREGATION_ROWS) {
    throw new Error('LiveBench aggregation run exceeds the row limit');
  }
}

export function buildLiveBenchAggregationReadinessReport(
  run: LiveBenchAggregationRun,
  rows: readonly LiveBenchAggregationStagedRow[],
  questionInventory: LiveBenchAggregationQuestionInventory,
): LiveBenchAggregationReadinessReport {
  assertLiveBenchAggregationRun(run);
  if (rows.length !== run.recordsSeen) {
    throw new Error(
      'LiveBench staged row count does not match the ingestion run',
    );
  }
  if (
    questionInventory.release !== LIVEBENCH_PUBLIC_RELEASE ||
    !/^[a-f0-9]{64}$/u.test(questionInventory.contentSha256)
  ) {
    throw new Error('LiveBench question inventory identity is invalid');
  }
  if (
    questionInventory.observations.length < 1 ||
    questionInventory.observations.length > LIVEBENCH_MAX_QUESTION_ROWS
  ) {
    throw new Error('LiveBench question inventory row count is invalid');
  }

  const inventory = questionInventory.observations.map((observation) => ({
    category: observation.category,
    task: observation.task,
    questionId: observation.questionId,
    turn: observation.turn,
  }));
  const inventoryKeys = new Set(
    inventory.map(liveBenchAggregationInventoryKey),
  );
  if (inventoryKeys.size !== inventory.length) {
    throw new Error('Duplicate LiveBench question inventory observation');
  }
  const inventoryKeyByQuestionTurn = new Map(
    inventory.map((observation) => [
      questionTurnKey(observation),
      liveBenchAggregationInventoryKey(observation),
    ]),
  );
  if (inventoryKeyByQuestionTurn.size !== inventory.length) {
    throw new Error('Duplicate LiveBench question inventory question turn');
  }

  const observations = [];
  const sourceSnapshotIds = new Set<string>();
  const stagedObservationKeys = new Set<string>();
  let recordsValidated = 0;
  let recordsExcluded = 0;
  let recordsMatchedInventory = 0;
  let recordsOutsideInventory = 0;

  for (const row of rows) {
    const parsed = LiveBenchJudgmentSchema.safeParse(row.payload);
    if (!parsed.success) {
      throw new Error('LiveBench staged payload failed boundary validation', {
        cause: parsed.error,
      });
    }
    const judgment = parsed.data;
    const inventoryRow = {
      category: judgment.category,
      task: judgment.task,
      questionId: judgment.question_id,
      turn: judgment.turn,
    } as const;
    sourceSnapshotIds.add(row.sourceSnapshotId);

    let modelVariantId: string | null = null;
    if (row.validationStatus === 'VALIDATED') {
      if (row.resolvedModelVariantId === null) {
        throw new Error('VALIDATED LiveBench rows require a model variant ID');
      }
      recordsValidated += 1;
      modelVariantId = row.resolvedModelVariantId;
    } else if (row.validationStatus === 'EXCLUDED') {
      if (row.resolvedModelVariantId !== null) {
        throw new Error(
          'EXCLUDED LiveBench rows must not have a model variant ID',
        );
      }
      recordsExcluded += 1;
    } else {
      throw new Error(
        `Unexpected LiveBench validation status: ${row.validationStatus}`,
      );
    }

    const key = liveBenchAggregationInventoryKey(inventoryRow);
    const expectedKey = inventoryKeyByQuestionTurn.get(
      questionTurnKey(inventoryRow),
    );
    if (expectedKey !== undefined && expectedKey !== key) {
      throw new Error(
        'LiveBench staged judgment metadata does not match question inventory',
      );
    }
    if (!inventoryKeys.has(key)) {
      recordsOutsideInventory += 1;
      continue;
    }

    recordsMatchedInventory += 1;
    stagedObservationKeys.add(key);
    if (modelVariantId !== null) {
      observations.push({
        ...inventoryRow,
        modelVariantId,
        score: judgment.score,
        evaluatedAtUnixSeconds: judgment.tstamp,
      });
    }
  }

  const categories = [...new Set(inventory.map(({ category }) => category))]
    .sort(compareText)
    .map((category) => {
      const categoryInventory = inventory.filter(
        (observation) => observation.category === category,
      );
      const stagedObservationKeyCount = categoryInventory.filter(
        (observation) =>
          stagedObservationKeys.has(
            liveBenchAggregationInventoryKey(observation),
          ),
      ).length;
      const expectedObservations = categoryInventory.length;
      return {
        category,
        coverage: stagedObservationKeyCount / expectedObservations,
        expectedObservations,
        stagedObservationKeys: stagedObservationKeyCount,
        missingObservations: expectedObservations - stagedObservationKeyCount,
      };
    });

  return {
    ingestionRun: {
      id: run.id,
      connectorVersion: run.connectorVersion,
      recordsSeen: run.recordsSeen,
      recordsValidated,
      recordsExcluded,
      recordsMatchedInventory,
      recordsOutsideInventory,
      sourceSnapshotIds: [...sourceSnapshotIds].sort(compareText),
    },
    questionInventory: {
      contentSha256: questionInventory.contentSha256,
      release: questionInventory.release,
      inventoryObservationCount: inventory.length,
      stagedObservationKeyCount: stagedObservationKeys.size,
      missingObservationCount: inventory.length - stagedObservationKeys.size,
      categories,
    },
    aggregation: aggregateLiveBenchJudgments({ inventory, observations }),
  };
}

export async function getLiveBenchAggregationReadinessReport(
  db: Database,
  ingestionRunId: string,
  questionInventory: LiveBenchAggregationQuestionInventory,
): Promise<LiveBenchAggregationReadinessReport> {
  return db.transaction(
    async (transaction) => {
      const [run] = await transaction
        .select({
          id: ingestionRuns.id,
          status: ingestionRuns.status,
          connectorVersion: ingestionRuns.connectorVersion,
          recordsSeen: ingestionRuns.recordsSeen,
          recordsAccepted: ingestionRuns.recordsAccepted,
        })
        .from(ingestionRuns)
        .innerJoin(sources, eq(ingestionRuns.sourceId, sources.id))
        .where(
          and(
            eq(ingestionRuns.id, ingestionRunId),
            eq(sources.slug, 'livebench-model-judgment'),
          ),
        )
        .limit(1);
      if (!run) {
        throw new Error('LiveBench ingestion run was not found');
      }
      assertLiveBenchAggregationRun(run);

      const rows = await transaction
        .select({
          sourceSnapshotId: stagedResults.sourceSnapshotId,
          resolvedModelVariantId: stagedResults.resolvedModelVariantId,
          validationStatus: stagedResults.validationStatus,
          payload: stagedResults.payload,
        })
        .from(stagedResults)
        .where(eq(stagedResults.ingestionRunId, run.id))
        .orderBy(stagedResults.sourceRecordKey);

      return buildLiveBenchAggregationReadinessReport(
        run,
        rows,
        questionInventory,
      );
    },
    { isolationLevel: 'repeatable read', accessMode: 'read only' },
  );
}
