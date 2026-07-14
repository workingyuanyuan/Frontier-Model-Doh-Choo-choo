import { createHash } from 'node:crypto';

import {
  type Database,
  benchmarkMetrics,
  benchmarkResults,
  benchmarks,
  benchmarkVersions,
  evaluationConfigs,
  liveBenchBenchmarkSeed,
  liveBenchEvaluationConfigSeed,
  liveBenchMetricSeeds,
  resultEvidence,
} from '@llm-bench/db';
import { and, eq, inArray } from 'drizzle-orm';

import type { LiveBenchAggregationReadinessReport } from './livebench-aggregation-readiness.js';

export interface LiveBenchPromotionCandidate {
  readonly publicationKey: string;
  readonly modelVariantId: string;
  readonly metricSlug: string;
  readonly sourceSnapshotId: string;
  readonly value: number;
  readonly sampleSize: number;
  readonly publicationStatus: 'PUBLISHED';
  readonly qualityFlags: readonly [];
  readonly evidenceLocator: {
    readonly schemaVersion: 1;
    readonly ingestionRunId: string;
    readonly release: string;
    readonly inventoryContentSha256: string;
    readonly category: string;
    readonly task: string;
    readonly expectedObservations: number;
    readonly duplicateObservations: number;
    readonly sourceSnapshotId: string;
  };
}

export interface LiveBenchPromotionPlan {
  readonly candidates: readonly LiveBenchPromotionCandidate[];
  readonly summary: {
    readonly candidateCount: number;
    readonly blockedIncompleteCount: number;
    readonly blockedConflictingCount: number;
  };
}

export interface LiveBenchPromotionReconciliation {
  readonly existingResultCount: number;
  readonly toInsert: readonly LiveBenchPromotionCandidate[];
}

export type LiveBenchPromotionSummary = LiveBenchPromotionPlan['summary'] & {
  readonly dryRun: boolean;
  readonly existingResultCount: number;
  readonly requestedInsertCount: number;
  readonly insertedResultCount: number;
};

const metricBySourceIdentity = new Map(
  liveBenchMetricSeeds.map((metric) => [
    JSON.stringify([metric.category, metric.sourceTask]),
    metric,
  ]),
);

export function parseLiveBenchPromotionArguments(
  arguments_: readonly string[],
): { readonly dryRun: boolean } {
  const allowedArguments = new Set(['--', '--apply']);
  const unknownArguments = arguments_.filter(
    (argument) => !allowedArguments.has(argument),
  );
  if (unknownArguments.length > 0) {
    throw new Error(
      `Unknown promotion arguments: ${unknownArguments.join(', ')}`,
    );
  }
  if (arguments_.filter((argument) => argument === '--apply').length > 1) {
    throw new Error('Promotion --apply argument may only appear once');
  }
  return { dryRun: !arguments_.includes('--apply') };
}

function compareCandidate(
  left: LiveBenchPromotionCandidate,
  right: LiveBenchPromotionCandidate,
): number {
  const leftKey = `${left.modelVariantId}\0${left.metricSlug}`;
  const rightKey = `${right.modelVariantId}\0${right.metricSlug}`;
  return leftKey < rightKey ? -1 : leftKey > rightKey ? 1 : 0;
}

function createPublicationKey(input: {
  readonly ingestionRunId: string;
  readonly modelVariantId: string;
  readonly metricSlug: string;
  readonly sourceSnapshotId: string;
}): string {
  return createHash('sha256')
    .update(
      JSON.stringify([
        'livebench-task-result-v1',
        input.ingestionRunId,
        input.modelVariantId,
        input.metricSlug,
        input.sourceSnapshotId,
      ]),
    )
    .digest('hex');
}

export function createLiveBenchPromotionPlan(
  report: LiveBenchAggregationReadinessReport,
): LiveBenchPromotionPlan {
  if (report.ingestionRun.sourceSnapshotIds.length !== 1) {
    throw new Error('LiveBench promotion requires exactly one source snapshot');
  }
  const sourceSnapshotId = report.ingestionRun.sourceSnapshotIds[0];
  if (!sourceSnapshotId) {
    throw new Error('LiveBench promotion source snapshot is missing');
  }
  if (
    report.questionInventory.release !== liveBenchBenchmarkSeed.version ||
    report.questionInventory.contentSha256 !==
      liveBenchBenchmarkSeed.inventoryContentSha256 ||
    report.questionInventory.inventoryObservationCount !==
      liveBenchBenchmarkSeed.inventoryObservationCount
  ) {
    throw new Error('LiveBench promotion inventory does not match the seed');
  }

  const candidates: LiveBenchPromotionCandidate[] = [];
  let blockedIncompleteCount = 0;
  let blockedConflictingCount = 0;

  for (const model of report.aggregation.models) {
    for (const category of model.categories) {
      for (const task of category.tasks) {
        const metric = metricBySourceIdentity.get(
          JSON.stringify([category.category, task.task]),
        );
        if (!metric) {
          throw new Error(
            `LiveBench task is not configured: ${category.category}/${task.task}`,
          );
        }

        if (task.status === 'INCOMPLETE') {
          if (task.score !== null) {
            throw new Error('Incomplete LiveBench task cannot have a score');
          }
          blockedIncompleteCount += 1;
          continue;
        }
        if (task.status === 'CONFLICTING') {
          if (task.score !== null || task.conflictingObservations < 1) {
            throw new Error('Conflicting LiveBench task evidence is invalid');
          }
          blockedConflictingCount += 1;
          continue;
        }
        if (
          task.score === null ||
          !Number.isFinite(task.score) ||
          task.score < 0 ||
          task.score > 100 ||
          task.observedObservations !== task.expectedObservations ||
          task.conflictingObservations !== 0
        ) {
          throw new Error('Complete LiveBench task evidence is invalid');
        }

        const publicationKey = createPublicationKey({
          ingestionRunId: report.ingestionRun.id,
          modelVariantId: model.modelVariantId,
          metricSlug: metric.slug,
          sourceSnapshotId,
        });
        candidates.push({
          publicationKey,
          modelVariantId: model.modelVariantId,
          metricSlug: metric.slug,
          sourceSnapshotId,
          value: task.score,
          sampleSize: task.expectedObservations,
          publicationStatus: 'PUBLISHED',
          qualityFlags: [],
          evidenceLocator: {
            schemaVersion: 1,
            ingestionRunId: report.ingestionRun.id,
            release: report.questionInventory.release,
            inventoryContentSha256: report.questionInventory.contentSha256,
            category: category.category,
            task: task.task,
            expectedObservations: task.expectedObservations,
            duplicateObservations: task.duplicateObservations,
            sourceSnapshotId,
          },
        });
      }
    }
  }

  candidates.sort(compareCandidate);
  if (
    new Set(candidates.map(({ publicationKey }) => publicationKey)).size !==
    candidates.length
  ) {
    throw new Error('Duplicate LiveBench promotion publication key');
  }

  return {
    candidates,
    summary: {
      candidateCount: candidates.length,
      blockedIncompleteCount,
      blockedConflictingCount,
    },
  };
}

export function reconcileLiveBenchPromotionPlan(
  plan: LiveBenchPromotionPlan,
  existingPublicationKeys: readonly string[],
): LiveBenchPromotionReconciliation {
  const existingKeys = new Set(existingPublicationKeys);
  const candidateKeys = new Set(
    plan.candidates.map(({ publicationKey }) => publicationKey),
  );
  const existingResultCount = [...existingKeys].filter((key) =>
    candidateKeys.has(key),
  ).length;

  return {
    existingResultCount,
    toInsert: plan.candidates.filter(
      ({ publicationKey }) => !existingKeys.has(publicationKey),
    ),
  };
}

export async function promoteLiveBenchResults(
  db: Database,
  report: LiveBenchAggregationReadinessReport,
  options: { readonly dryRun: boolean },
): Promise<LiveBenchPromotionSummary> {
  const plan = createLiveBenchPromotionPlan(report);

  return db.transaction(
    async (transaction) => {
      const [benchmarkVersion] = await transaction
        .select({ id: benchmarkVersions.id })
        .from(benchmarkVersions)
        .innerJoin(benchmarks, eq(benchmarkVersions.benchmarkId, benchmarks.id))
        .where(
          and(
            eq(benchmarks.slug, liveBenchBenchmarkSeed.slug),
            eq(benchmarkVersions.version, liveBenchBenchmarkSeed.version),
          ),
        )
        .limit(1);
      if (!benchmarkVersion) {
        throw new Error('LiveBench promotion benchmark seed is missing');
      }

      const metricRows = await transaction
        .select({ id: benchmarkMetrics.id, slug: benchmarkMetrics.slug })
        .from(benchmarkMetrics)
        .where(eq(benchmarkMetrics.benchmarkVersionId, benchmarkVersion.id));
      const metricIdBySlug = new Map(
        metricRows.map(({ id, slug }) => [slug, id]),
      );
      if (metricIdBySlug.size !== liveBenchMetricSeeds.length) {
        throw new Error('LiveBench promotion metric seed is incomplete');
      }

      const [evaluationConfig] = await transaction
        .select({ id: evaluationConfigs.id })
        .from(evaluationConfigs)
        .where(
          and(
            eq(evaluationConfigs.benchmarkVersionId, benchmarkVersion.id),
            eq(
              evaluationConfigs.configHash,
              liveBenchEvaluationConfigSeed.configHash,
            ),
          ),
        )
        .limit(1);
      if (!evaluationConfig) {
        throw new Error('LiveBench promotion evaluation config is missing');
      }

      const publicationKeys = plan.candidates.map(
        ({ publicationKey }) => publicationKey,
      );
      const existingRows =
        publicationKeys.length === 0
          ? []
          : await transaction
              .select({ publicationKey: benchmarkResults.publicationKey })
              .from(benchmarkResults)
              .where(inArray(benchmarkResults.publicationKey, publicationKeys));
      const reconciliation = reconcileLiveBenchPromotionPlan(
        plan,
        existingRows.map(({ publicationKey }) => publicationKey),
      );

      if (options.dryRun || reconciliation.toInsert.length === 0) {
        return {
          ...plan.summary,
          dryRun: options.dryRun,
          existingResultCount: reconciliation.existingResultCount,
          requestedInsertCount: reconciliation.toInsert.length,
          insertedResultCount: 0,
        };
      }

      const inserted = await transaction
        .insert(benchmarkResults)
        .values(
          reconciliation.toInsert.map((candidate) => {
            const benchmarkMetricId = metricIdBySlug.get(candidate.metricSlug);
            if (!benchmarkMetricId) {
              throw new Error(
                `LiveBench promotion metric is missing: ${candidate.metricSlug}`,
              );
            }
            return {
              publicationKey: candidate.publicationKey,
              modelVariantId: candidate.modelVariantId,
              benchmarkMetricId,
              evaluationConfigId: evaluationConfig.id,
              value: String(candidate.value),
              sampleSize: candidate.sampleSize,
              publicationStatus: candidate.publicationStatus,
              qualityFlags: [...candidate.qualityFlags],
            };
          }),
        )
        .onConflictDoNothing({ target: benchmarkResults.publicationKey })
        .returning({
          id: benchmarkResults.id,
          publicationKey: benchmarkResults.publicationKey,
        });

      const candidateByKey = new Map(
        reconciliation.toInsert.map((candidate) => [
          candidate.publicationKey,
          candidate,
        ]),
      );
      if (inserted.length > 0) {
        await transaction.insert(resultEvidence).values(
          inserted.map((result) => {
            const candidate = candidateByKey.get(result.publicationKey);
            if (!candidate) {
              throw new Error('Inserted LiveBench result lost its evidence');
            }
            return {
              benchmarkResultId: result.id,
              sourceSnapshotId: candidate.sourceSnapshotId,
              evidenceKind: 'AGGREGATED_TASK',
              locator: candidate.evidenceLocator,
              isPrimary: true,
            };
          }),
        );
      }

      return {
        ...plan.summary,
        dryRun: false,
        existingResultCount: reconciliation.existingResultCount,
        requestedInsertCount: reconciliation.toInsert.length,
        insertedResultCount: inserted.length,
      };
    },
    {
      isolationLevel: 'serializable',
      accessMode: options.dryRun ? 'read only' : 'read write',
    },
  );
}
