import {
  type Database,
  benchmarkDimensionMappings,
  benchmarkMetrics,
  benchmarkResults,
  dimensionScores,
  evaluationConfigs,
  liveBenchEvaluationConfigSeed,
  liveBenchMetricSeeds,
  modelFamilies,
  models,
  modelVariants,
  overallScores,
  providers,
  rankingEntries,
  rankingSnapshots,
  resultEvidence,
  scoringMethodSeed,
  scoringMethodVersions,
  sourceSnapshots,
  sources,
} from '@llm-bench/db';
import { DimensionIdSchema, RankingSnapshotSchema } from '@llm-bench/contracts';
import { and, eq, sql } from 'drizzle-orm';

import {
  computeLiveBenchScores,
  createScoreSnapshotContentHash,
  reconcileScoreSnapshot,
  type LiveBenchScoreMapping,
  type LiveBenchScorePlan,
  type LiveBenchScoreResult,
} from './livebench-scoring.js';

interface PreparedScoreSnapshot {
  readonly scoringMethodVersionId: string;
  readonly editionDate: string;
  readonly dataCutoffAt: string;
  readonly contentSha256: string;
  readonly plan: LiveBenchScorePlan;
}

interface MutableScoreModel {
  readonly modelVariantId: string;
  readonly slug: string;
  readonly displayName: string;
  readonly providerName: string;
  readonly results: LiveBenchScoreResult[];
}

export interface LiveBenchScorePublicationSummary {
  readonly dryRun: boolean;
  readonly action: 'CREATE' | 'REUSE';
  readonly rankingSnapshotId: string | null;
  readonly editionDate: string;
  readonly dataCutoffAt: string;
  readonly contentSha256: string;
  readonly sourceSnapshotCount: number;
  readonly modelCount: number;
  readonly rankedModelCount: number;
  readonly unrankedModelCount: number;
  readonly dimensionScoreCount: number;
}

function asRecord(value: unknown, label: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
  return value as Record<string, unknown>;
}

function parseNormalization(
  value: unknown,
): Pick<LiveBenchScoreMapping, 'lowerAnchor' | 'upperAnchor' | 'direction'> {
  const normalization = asRecord(value, 'Score normalization');
  const { lowerAnchor, upperAnchor, direction, method, clippingRule } =
    normalization;
  if (
    method !== 'FIXED_PERCENTAGE_V1' ||
    clippingRule !== 'CLAMP_0_100' ||
    (direction !== 'HIGHER_IS_BETTER' && direction !== 'LOWER_IS_BETTER') ||
    typeof lowerAnchor !== 'number' ||
    typeof upperAnchor !== 'number'
  ) {
    throw new Error('Unsupported score normalization config');
  }
  return { lowerAnchor, upperAnchor, direction };
}

function summarize(
  prepared: PreparedScoreSnapshot,
  input: {
    readonly dryRun: boolean;
    readonly action: 'CREATE' | 'REUSE';
    readonly rankingSnapshotId: string | null;
  },
): LiveBenchScorePublicationSummary {
  const rankedModelCount = prepared.plan.entries.filter(
    ({ rank }) => rank !== null,
  ).length;
  return {
    ...input,
    editionDate: prepared.editionDate,
    dataCutoffAt: prepared.dataCutoffAt,
    contentSha256: prepared.contentSha256,
    sourceSnapshotCount: prepared.plan.sourceSnapshotIds.length,
    modelCount: prepared.plan.entries.length,
    rankedModelCount,
    unrankedModelCount: prepared.plan.entries.length - rankedModelCount,
    dimensionScoreCount: prepared.plan.models.length * 8,
  };
}

async function prepareScoreSnapshot(
  transaction: Parameters<Parameters<Database['transaction']>[0]>[0],
  requestedEditionDate: string | undefined,
): Promise<PreparedScoreSnapshot> {
  const [method] = await transaction
    .select({
      id: scoringMethodVersions.id,
      version: scoringMethodVersions.version,
      status: scoringMethodVersions.status,
      config: scoringMethodVersions.config,
    })
    .from(scoringMethodVersions)
    .where(eq(scoringMethodVersions.version, scoringMethodSeed.version))
    .limit(1);
  if (!method) throw new Error('LiveBench scoring method seed is missing');
  const methodConfig = asRecord(method.config, 'Scoring method config');
  if (
    method.status !== 'DRAFT' ||
    methodConfig.formalPublicationEnabled !== false
  ) {
    throw new Error(
      'LiveBench partial scoring requires a non-publishable draft method',
    );
  }

  const mappingRows = await transaction
    .select({
      metricId: benchmarkDimensionMappings.benchmarkMetricId,
      dimension: benchmarkDimensionMappings.dimensionId,
      weight: benchmarkDimensionMappings.weight,
      normalization: benchmarkDimensionMappings.normalization,
    })
    .from(benchmarkDimensionMappings)
    .where(eq(benchmarkDimensionMappings.scoringMethodVersionId, method.id));
  if (mappingRows.length !== liveBenchMetricSeeds.length) {
    throw new Error('LiveBench score mapping seed is incomplete');
  }
  const mappings: LiveBenchScoreMapping[] = mappingRows.map((mapping) => ({
    metricId: mapping.metricId,
    dimension: DimensionIdSchema.parse(mapping.dimension),
    weight: Number(mapping.weight),
    ...parseNormalization(mapping.normalization),
  }));

  const resultRows = await transaction
    .select({
      resultId: benchmarkResults.id,
      metricId: benchmarkResults.benchmarkMetricId,
      value: benchmarkResults.value,
      modelVariantId: modelVariants.id,
      slug: modelVariants.slug,
      displayName: modelVariants.displayName,
      providerName: providers.displayName,
      sourceSnapshotId: sourceSnapshots.id,
      fetchedAt: sourceSnapshots.fetchedAt,
      trustTier: sources.trustTier,
    })
    .from(benchmarkResults)
    .innerJoin(
      benchmarkMetrics,
      eq(benchmarkResults.benchmarkMetricId, benchmarkMetrics.id),
    )
    .innerJoin(
      benchmarkDimensionMappings,
      and(
        eq(benchmarkDimensionMappings.benchmarkMetricId, benchmarkMetrics.id),
        eq(benchmarkDimensionMappings.scoringMethodVersionId, method.id),
      ),
    )
    .innerJoin(
      evaluationConfigs,
      eq(benchmarkResults.evaluationConfigId, evaluationConfigs.id),
    )
    .innerJoin(
      resultEvidence,
      and(
        eq(resultEvidence.benchmarkResultId, benchmarkResults.id),
        eq(resultEvidence.isPrimary, true),
      ),
    )
    .innerJoin(
      sourceSnapshots,
      eq(resultEvidence.sourceSnapshotId, sourceSnapshots.id),
    )
    .innerJoin(sources, eq(sourceSnapshots.sourceId, sources.id))
    .innerJoin(
      modelVariants,
      eq(benchmarkResults.modelVariantId, modelVariants.id),
    )
    .innerJoin(models, eq(modelVariants.modelId, models.id))
    .innerJoin(modelFamilies, eq(models.familyId, modelFamilies.id))
    .innerJoin(providers, eq(modelFamilies.providerId, providers.id))
    .where(
      and(
        eq(benchmarkResults.publicationStatus, 'PUBLISHED'),
        eq(
          evaluationConfigs.configHash,
          liveBenchEvaluationConfigSeed.configHash,
        ),
        eq(sources.slug, 'livebench-model-judgment'),
      ),
    );
  if (resultRows.length === 0) {
    throw new Error('No published LiveBench results are available for scoring');
  }

  const modelById = new Map<string, MutableScoreModel>();
  for (const row of resultRows) {
    const existing = modelById.get(row.modelVariantId);
    const model =
      existing ??
      ({
        modelVariantId: row.modelVariantId,
        slug: row.slug,
        displayName: row.displayName,
        providerName: row.providerName,
        results: [],
      } satisfies MutableScoreModel);
    if (!existing) modelById.set(row.modelVariantId, model);
    model.results.push({
      resultId: row.resultId,
      metricId: row.metricId,
      value: Number(row.value),
      evidenceQuality:
        row.trustTier === 'INDEPENDENT_OFFICIAL_BENCHMARK' ? 1 : 0.5,
      isIndependent: row.trustTier === 'INDEPENDENT_OFFICIAL_BENCHMARK',
      sourceSnapshotId: row.sourceSnapshotId,
    });
  }

  const plan = computeLiveBenchScores({
    scoringMethodVersion: method.version,
    mappings,
    models: [...modelById.values()],
  });
  if (plan.sourceSnapshotIds.length === 0) {
    throw new Error('Score snapshot requires source evidence');
  }
  const cutoff = resultRows.reduce(
    (latest, row) => (row.fetchedAt > latest ? row.fetchedAt : latest),
    resultRows[0]!.fetchedAt,
  );
  const dataCutoffAt = cutoff.toISOString();
  const editionDate = requestedEditionDate ?? dataCutoffAt.slice(0, 10);
  const contentSha256 = createScoreSnapshotContentHash(plan, {
    editionDate,
    dataCutoffAt,
  });
  return {
    scoringMethodVersionId: method.id,
    editionDate,
    dataCutoffAt,
    contentSha256,
    plan,
  };
}

export async function publishLiveBenchScoreSnapshot(
  db: Database,
  options: {
    readonly dryRun: boolean;
    readonly editionDate: string | undefined;
  },
): Promise<LiveBenchScorePublicationSummary> {
  return db.transaction(
    async (transaction) => {
      const prepared = await prepareScoreSnapshot(
        transaction,
        options.editionDate,
      );
      const [existing] = await transaction
        .select({
          id: rankingSnapshots.id,
          contentSha256: rankingSnapshots.contentSha256,
        })
        .from(rankingSnapshots)
        .where(
          and(
            eq(rankingSnapshots.editionDate, prepared.editionDate),
            eq(
              rankingSnapshots.scoringMethodVersionId,
              prepared.scoringMethodVersionId,
            ),
          ),
        )
        .limit(1);
      const action = reconcileScoreSnapshot(
        existing?.contentSha256,
        prepared.contentSha256,
      );
      if (options.dryRun || action === 'REUSE') {
        return summarize(prepared, {
          dryRun: options.dryRun,
          action,
          rankingSnapshotId: existing?.id ?? null,
        });
      }

      const dimensionValues = prepared.plan.models.flatMap((model) =>
        model.dimensions.map((dimension) => ({
          scoringMethodVersionId: prepared.scoringMethodVersionId,
          modelVariantId: model.modelVariantId,
          dimensionId: dimension.dimension,
          score: dimension.score === null ? null : String(dimension.score),
          coverage: String(dimension.coverage),
          confidence: String(dimension.confidence),
          status: dimension.status,
          componentResults: dimension.componentResultIds.map(
            (benchmarkResultId) => ({ benchmarkResultId }),
          ),
        })),
      );
      await transaction
        .insert(dimensionScores)
        .values(dimensionValues)
        .onConflictDoUpdate({
          target: [
            dimensionScores.scoringMethodVersionId,
            dimensionScores.modelVariantId,
            dimensionScores.dimensionId,
          ],
          set: {
            score: sql`excluded.score`,
            coverage: sql`excluded.coverage`,
            confidence: sql`excluded.confidence`,
            status: sql`excluded.status`,
            componentResults: sql`excluded.component_results`,
            computedAt: sql`now()`,
          },
        });

      await transaction
        .insert(overallScores)
        .values(
          prepared.plan.models.map((model) => ({
            scoringMethodVersionId: prepared.scoringMethodVersionId,
            modelVariantId: model.modelVariantId,
            score:
              model.overallScore === null ? null : String(model.overallScore),
            coverage: String(model.overallCoverage),
            confidence: String(model.overallConfidence),
            independentEvidenceShare: String(model.independentEvidenceShare),
            rankingStatus: model.rankingStatus,
            qualityFlags: [...model.qualityFlags],
          })),
        )
        .onConflictDoUpdate({
          target: [
            overallScores.scoringMethodVersionId,
            overallScores.modelVariantId,
          ],
          set: {
            score: sql`excluded.score`,
            coverage: sql`excluded.coverage`,
            confidence: sql`excluded.confidence`,
            independentEvidenceShare: sql`excluded.independent_evidence_share`,
            rankingStatus: sql`excluded.ranking_status`,
            qualityFlags: sql`excluded.quality_flags`,
            computedAt: sql`now()`,
          },
        });

      const [snapshot] = await transaction
        .insert(rankingSnapshots)
        .values({
          editionDate: prepared.editionDate,
          dataCutoffAt: new Date(prepared.dataCutoffAt),
          scoringMethodVersionId: prepared.scoringMethodVersionId,
          sourceSnapshotIds: [...prepared.plan.sourceSnapshotIds],
          entryCount: prepared.plan.entries.length,
          contentSha256: prepared.contentSha256,
        })
        .returning({ id: rankingSnapshots.id });
      if (!snapshot) throw new Error('Ranking snapshot insert failed');

      await transaction.insert(rankingEntries).values(
        prepared.plan.entries.map((entry) => ({
          rankingSnapshotId: snapshot.id,
          modelVariantId: entry.modelVariantId,
          rank: entry.rank,
          overallScore:
            entry.overallScore === null ? null : String(entry.overallScore),
          overallCoverage: String(entry.overallCoverage),
          overallConfidence: String(entry.overallConfidence),
          rankingStatus: entry.rankingStatus,
          dimensions: entry.dimensions,
          qualityFlags: entry.qualityFlags,
        })),
      );

      RankingSnapshotSchema.parse({
        id: snapshot.id,
        editionDate: prepared.editionDate,
        dataCutoffAt: prepared.dataCutoffAt,
        scoringMethodVersion: prepared.plan.scoringMethodVersion,
        sourceSnapshotIds: prepared.plan.sourceSnapshotIds,
        entries: prepared.plan.entries,
      });
      return summarize(prepared, {
        dryRun: false,
        action: 'CREATE',
        rankingSnapshotId: snapshot.id,
      });
    },
    {
      isolationLevel: 'serializable',
      accessMode: options.dryRun ? 'read only' : 'read write',
    },
  );
}
