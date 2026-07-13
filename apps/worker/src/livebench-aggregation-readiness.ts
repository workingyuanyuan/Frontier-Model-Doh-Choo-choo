import { LiveBenchJudgmentSchema } from '@llm-bench/connectors';
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

export interface LiveBenchAggregationReadinessReport {
  readonly ingestionRun: {
    readonly id: string;
    readonly connectorVersion: string;
    readonly recordsSeen: number;
    readonly recordsValidated: number;
    readonly recordsExcluded: number;
    readonly sourceSnapshotIds: readonly string[];
  };
  readonly aggregation: LiveBenchAggregationReport;
}

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

export function buildLiveBenchAggregationReadinessReport(
  run: LiveBenchAggregationRun,
  rows: readonly LiveBenchAggregationStagedRow[],
): LiveBenchAggregationReadinessReport {
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
  if (rows.length !== run.recordsSeen) {
    throw new Error(
      'LiveBench staged row count does not match the ingestion run',
    );
  }

  const inventory = [];
  const observations = [];
  const sourceSnapshotIds = new Set<string>();
  let recordsValidated = 0;
  let recordsExcluded = 0;

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
    inventory.push(inventoryRow);
    sourceSnapshotIds.add(row.sourceSnapshotId);

    if (row.validationStatus === 'VALIDATED') {
      if (row.resolvedModelVariantId === null) {
        throw new Error('VALIDATED LiveBench rows require a model variant ID');
      }
      recordsValidated += 1;
      observations.push({
        ...inventoryRow,
        modelVariantId: row.resolvedModelVariantId,
        score: judgment.score,
        evaluatedAtUnixSeconds: judgment.tstamp,
      });
      continue;
    }

    if (row.validationStatus === 'EXCLUDED') {
      if (row.resolvedModelVariantId !== null) {
        throw new Error(
          'EXCLUDED LiveBench rows must not have a model variant ID',
        );
      }
      recordsExcluded += 1;
      continue;
    }

    throw new Error(
      `Unexpected LiveBench validation status: ${row.validationStatus}`,
    );
  }

  return {
    ingestionRun: {
      id: run.id,
      connectorVersion: run.connectorVersion,
      recordsSeen: run.recordsSeen,
      recordsValidated,
      recordsExcluded,
      sourceSnapshotIds: [...sourceSnapshotIds].sort(compareText),
    },
    aggregation: aggregateLiveBenchJudgments({ inventory, observations }),
  };
}

export async function getLiveBenchAggregationReadinessReport(
  db: Database,
  ingestionRunId: string,
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

      return buildLiveBenchAggregationReadinessReport(run, rows);
    },
    { isolationLevel: 'repeatable read', accessMode: 'read only' },
  );
}
