import type { LiveBenchJudgment } from '@llm-bench/connectors';

export type LiveBenchAggregationCategory = LiveBenchJudgment['category'];

export const LIVEBENCH_REQUIRED_CATEGORIES = [
  'reasoning',
  'math',
  'coding',
  'language',
  'data_analysis',
  'instruction_following',
] as const satisfies readonly LiveBenchAggregationCategory[];

export interface LiveBenchAggregationInventoryRow {
  readonly category: LiveBenchAggregationCategory;
  readonly task: string;
  readonly questionId: string;
  readonly turn: number;
}

export interface LiveBenchAggregationObservation extends LiveBenchAggregationInventoryRow {
  readonly modelVariantId: string;
  readonly score: number;
  readonly evaluatedAtUnixSeconds: number;
}

export type LiveBenchAggregationStatus =
  'COMPLETE' | 'INCOMPLETE' | 'CONFLICTING';

export interface LiveBenchTaskAggregate {
  readonly task: string;
  readonly score: number | null;
  readonly coverage: number;
  readonly expectedObservations: number;
  readonly observedObservations: number;
  readonly duplicateObservations: number;
  readonly conflictingObservations: number;
  readonly status: LiveBenchAggregationStatus;
}

export interface LiveBenchCategoryAggregate {
  readonly category: LiveBenchAggregationCategory;
  readonly score: number | null;
  readonly coverage: number;
  readonly status: LiveBenchAggregationStatus;
  readonly tasks: readonly LiveBenchTaskAggregate[];
}

export interface LiveBenchModelAggregate {
  readonly modelVariantId: string;
  readonly categories: readonly LiveBenchCategoryAggregate[];
}

export interface LiveBenchAggregationReport {
  readonly summary: {
    readonly inventoryObservationCount: number;
    readonly modelCount: number;
    readonly completeModelCount: number;
    readonly duplicateObservationCount: number;
    readonly conflictingObservationKeyCount: number;
    readonly missingCategories: readonly LiveBenchAggregationCategory[];
    readonly isReadyForPublication: boolean;
  };
  readonly models: readonly LiveBenchModelAggregate[];
}

export interface AggregateLiveBenchJudgmentsInput {
  readonly inventory: readonly LiveBenchAggregationInventoryRow[];
  readonly observations: readonly LiveBenchAggregationObservation[];
  readonly requiredCategories?: readonly LiveBenchAggregationCategory[];
}

interface ObservationGroup {
  readonly observations: LiveBenchAggregationObservation[];
}

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function inventoryKey(row: LiveBenchAggregationInventoryRow): string {
  return JSON.stringify([row.category, row.task, row.questionId, row.turn]);
}

function observationKey(
  modelVariantId: string,
  row: LiveBenchAggregationInventoryRow,
): string {
  return JSON.stringify([
    modelVariantId,
    row.category,
    row.task,
    row.questionId,
    row.turn,
  ]);
}

function validateInventoryRow(row: LiveBenchAggregationInventoryRow): void {
  if (!row.task || !row.questionId) {
    throw new Error('LiveBench inventory task and question ID are required');
  }
  if (!Number.isInteger(row.turn) || row.turn < 1) {
    throw new Error('LiveBench inventory turn must be a positive integer');
  }
}

function validateObservation(row: LiveBenchAggregationObservation): void {
  validateInventoryRow(row);
  if (!row.modelVariantId) {
    throw new Error('LiveBench observation model variant ID is required');
  }
  if (!Number.isFinite(row.score) || row.score < 0 || row.score > 1) {
    throw new Error('LiveBench observation score must be between zero and one');
  }
  if (
    !Number.isFinite(row.evaluatedAtUnixSeconds) ||
    row.evaluatedAtUnixSeconds <= 0
  ) {
    throw new Error('LiveBench observation timestamp must be positive');
  }
}

export function aggregateLiveBenchJudgments({
  inventory,
  observations,
  requiredCategories = LIVEBENCH_REQUIRED_CATEGORIES,
}: AggregateLiveBenchJudgmentsInput): LiveBenchAggregationReport {
  const inventoryByKey = new Map<string, LiveBenchAggregationInventoryRow>();
  for (const row of inventory) {
    validateInventoryRow(row);
    inventoryByKey.set(inventoryKey(row), row);
  }
  if (inventoryByKey.size === 0) {
    throw new Error('LiveBench aggregation inventory must not be empty');
  }

  const inventoryRows = [...inventoryByKey.values()];
  const inventoryCategories = new Set(
    inventoryRows.map(({ category }) => category),
  );
  const missingCategories = [...new Set(requiredCategories)]
    .filter((category) => !inventoryCategories.has(category))
    .sort(compareText);

  const observationsByKey = new Map<string, ObservationGroup>();
  const modelVariantIds = new Set<string>();
  for (const row of observations) {
    validateObservation(row);
    if (!inventoryByKey.has(inventoryKey(row))) {
      throw new Error('LiveBench observation is not present in the inventory');
    }
    modelVariantIds.add(row.modelVariantId);
    const key = observationKey(row.modelVariantId, row);
    const group = observationsByKey.get(key);
    if (group) {
      group.observations.push(row);
    } else {
      observationsByKey.set(key, { observations: [row] });
    }
  }

  let duplicateObservationCount = 0;
  let conflictingObservationKeyCount = 0;
  for (const { observations: repeated } of observationsByKey.values()) {
    duplicateObservationCount += repeated.length - 1;
    if (new Set(repeated.map(({ score }) => score)).size > 1) {
      conflictingObservationKeyCount += 1;
    }
  }

  const categories = [...inventoryCategories].sort(compareText);
  const models = [...modelVariantIds]
    .sort(compareText)
    .map((modelVariantId) => ({
      modelVariantId,
      categories: categories.map((category) => {
        const categoryInventory = inventoryRows.filter(
          (row) => row.category === category,
        );
        const tasks = [...new Set(categoryInventory.map(({ task }) => task))]
          .sort(compareText)
          .map((task): LiveBenchTaskAggregate => {
            const expectedRows = categoryInventory.filter(
              (row) => row.task === task,
            );
            const scores: number[] = [];
            let duplicateObservations = 0;
            let conflictingObservations = 0;

            for (const expectedRow of expectedRows) {
              const group = observationsByKey.get(
                observationKey(modelVariantId, expectedRow),
              );
              if (!group) {
                continue;
              }
              duplicateObservations += group.observations.length - 1;
              const distinctScores = [
                ...new Set(group.observations.map(({ score }) => score)),
              ];
              if (distinctScores.length > 1) {
                conflictingObservations += 1;
              } else if (distinctScores[0] !== undefined) {
                scores.push(distinctScores[0]);
              }
            }

            const expectedObservations = expectedRows.length;
            const observedObservations = scores.length;
            const coverage = observedObservations / expectedObservations;
            const status: LiveBenchAggregationStatus =
              conflictingObservations > 0
                ? 'CONFLICTING'
                : observedObservations === expectedObservations
                  ? 'COMPLETE'
                  : 'INCOMPLETE';

            return {
              task,
              score:
                status === 'COMPLETE'
                  ? (scores.reduce((sum, score) => sum + score, 0) /
                      expectedObservations) *
                    100
                  : null,
              coverage,
              expectedObservations,
              observedObservations,
              duplicateObservations,
              conflictingObservations,
              status,
            };
          });

        const expectedObservations = tasks.reduce(
          (sum, task) => sum + task.expectedObservations,
          0,
        );
        const observedObservations = tasks.reduce(
          (sum, task) => sum + task.observedObservations,
          0,
        );
        const status: LiveBenchAggregationStatus = tasks.some(
          (task) => task.status === 'CONFLICTING',
        )
          ? 'CONFLICTING'
          : tasks.every((task) => task.status === 'COMPLETE')
            ? 'COMPLETE'
            : 'INCOMPLETE';

        // LiveBench computes an equal-weight mean of task means per category.
        // Source: https://github.com/LiveBench/LiveBench/blob/main/livebench/show_livebench_result.py
        return {
          category,
          score:
            status === 'COMPLETE'
              ? tasks.reduce((sum, task) => sum + (task.score ?? 0), 0) /
                tasks.length
              : null,
          coverage: observedObservations / expectedObservations,
          status,
          tasks,
        };
      }),
    }));

  const completeModelCount = models.filter((model) =>
    model.categories.every((category) => category.status === 'COMPLETE'),
  ).length;

  return {
    summary: {
      inventoryObservationCount: inventoryByKey.size,
      modelCount: models.length,
      completeModelCount,
      duplicateObservationCount,
      conflictingObservationKeyCount,
      missingCategories,
      isReadyForPublication:
        completeModelCount > 0 &&
        missingCategories.length === 0 &&
        conflictingObservationKeyCount === 0,
    },
    models,
  };
}
