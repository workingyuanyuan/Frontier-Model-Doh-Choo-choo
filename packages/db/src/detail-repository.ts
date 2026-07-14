import {
  BenchmarkDetailSchema,
  ModelDetailSchema,
  RankingEntrySchema,
  type BenchmarkDetail,
  type ModelDetail,
  type QualityFlag,
} from '@llm-bench/contracts';
import { and, asc, desc, eq, sql } from 'drizzle-orm';

import type { Database } from './client.js';
import {
  benchmarkMetrics,
  benchmarkResults,
  benchmarks,
  benchmarkVersions,
  resultEvidence,
  sources,
  sourceSnapshots,
} from './schema/evidence.js';
import {
  modelFamilies,
  models,
  modelVariants,
  providers,
} from './schema/identity.js';
import { rankingEntries, weeklyEditions } from './schema/scoring.js';

const asFlags = (value: unknown): QualityFlag[] =>
  Array.isArray(value) ? (value as QualityFlag[]) : [];

export async function getModelDetailBySlug(
  db: Database,
  slug: string,
): Promise<ModelDetail | null> {
  const [identity] = await db
    .select({
      id: modelVariants.id,
      slug: modelVariants.slug,
      displayName: modelVariants.displayName,
      providerName: providers.displayName,
      providerUrl: providers.websiteUrl,
      familyName: modelFamilies.displayName,
      releaseDate: modelVariants.releaseDate,
      lifecycleStatus: modelVariants.lifecycleStatus,
      contextWindowTokens: modelVariants.contextWindowTokens,
      parameterCountMillions: modelVariants.parameterCountMillions,
      isOpenWeights: modelVariants.isOpenWeights,
    })
    .from(modelVariants)
    .innerJoin(models, eq(modelVariants.modelId, models.id))
    .innerJoin(modelFamilies, eq(models.familyId, modelFamilies.id))
    .innerJoin(providers, eq(modelFamilies.providerId, providers.id))
    .where(eq(modelVariants.slug, slug))
    .limit(1);
  if (!identity) return null;

  const [activeRows, historyRows, resultRows] = await Promise.all([
    db
      .select({
        modelVariantId: rankingEntries.modelVariantId,
        rank: rankingEntries.rank,
        overallScore: rankingEntries.overallScore,
        overallCoverage: rankingEntries.overallCoverage,
        overallConfidence: rankingEntries.overallConfidence,
        rankingStatus: rankingEntries.rankingStatus,
        dimensions: rankingEntries.dimensions,
        qualityFlags: rankingEntries.qualityFlags,
      })
      .from(rankingEntries)
      .innerJoin(
        weeklyEditions,
        eq(rankingEntries.rankingSnapshotId, weeklyEditions.rankingSnapshotId),
      )
      .where(
        and(
          eq(weeklyEditions.isActive, true),
          eq(rankingEntries.modelVariantId, identity.id),
        ),
      )
      .limit(1),
    db
      .select({
        editionDate: weeklyEditions.editionDate,
        publicationMode: weeklyEditions.publicationMode,
        rank: rankingEntries.rank,
        overallScore: rankingEntries.overallScore,
        rankingStatus: rankingEntries.rankingStatus,
      })
      .from(rankingEntries)
      .innerJoin(
        weeklyEditions,
        eq(rankingEntries.rankingSnapshotId, weeklyEditions.rankingSnapshotId),
      )
      .where(eq(rankingEntries.modelVariantId, identity.id))
      .orderBy(desc(weeklyEditions.editionDate)),
    db
      .select({
        benchmarkSlug: benchmarks.slug,
        benchmarkName: benchmarks.displayName,
        benchmarkVersion: benchmarkVersions.version,
        metricSlug: benchmarkMetrics.slug,
        metricName: benchmarkMetrics.displayName,
        value: benchmarkResults.value,
        unit: benchmarkMetrics.unit,
        sampleSize: benchmarkResults.sampleSize,
        qualityFlags: benchmarkResults.qualityFlags,
        sourceName: sources.displayName,
        sourceSnapshotId: sourceSnapshots.id,
        contentSha256: sourceSnapshots.contentSha256,
        requestUrl: sourceSnapshots.requestUrl,
      })
      .from(benchmarkResults)
      .innerJoin(
        benchmarkMetrics,
        eq(benchmarkResults.benchmarkMetricId, benchmarkMetrics.id),
      )
      .innerJoin(
        benchmarkVersions,
        eq(benchmarkMetrics.benchmarkVersionId, benchmarkVersions.id),
      )
      .innerJoin(benchmarks, eq(benchmarkVersions.benchmarkId, benchmarks.id))
      .leftJoin(
        resultEvidence,
        and(
          eq(resultEvidence.benchmarkResultId, benchmarkResults.id),
          eq(resultEvidence.isPrimary, true),
        ),
      )
      .leftJoin(
        sourceSnapshots,
        eq(resultEvidence.sourceSnapshotId, sourceSnapshots.id),
      )
      .leftJoin(sources, eq(sourceSnapshots.sourceId, sources.id))
      .where(eq(benchmarkResults.modelVariantId, identity.id))
      .orderBy(benchmarks.slug, benchmarkMetrics.slug),
  ]);

  const activeRow = activeRows[0];
  const activeRanking = activeRow
    ? RankingEntrySchema.parse({
        ...activeRow,
        slug: identity.slug,
        displayName: identity.displayName,
        providerName: identity.providerName,
        overallScore:
          activeRow.overallScore === null
            ? null
            : Number(activeRow.overallScore),
        overallCoverage: Number(activeRow.overallCoverage),
        overallConfidence: Number(activeRow.overallConfidence),
      })
    : null;

  return ModelDetailSchema.parse({
    ...identity,
    activeRanking,
    history: historyRows.map((row) => ({
      ...row,
      overallScore: row.overallScore === null ? null : Number(row.overallScore),
    })),
    benchmarkResults: resultRows.map((row) => ({
      benchmarkSlug: row.benchmarkSlug,
      benchmarkName: row.benchmarkName,
      benchmarkVersion: row.benchmarkVersion,
      metricSlug: row.metricSlug,
      metricName: row.metricName,
      value: Number(row.value),
      unit: row.unit,
      sampleSize: row.sampleSize,
      qualityFlags: asFlags(row.qualityFlags),
      evidence:
        row.sourceName &&
        row.sourceSnapshotId &&
        row.contentSha256 &&
        row.requestUrl
          ? {
              sourceName: row.sourceName,
              sourceSnapshotId: row.sourceSnapshotId,
              contentSha256: row.contentSha256,
              requestUrl: row.requestUrl,
            }
          : null,
    })),
  });
}

export async function getBenchmarkDetailBySlug(
  db: Database,
  slug: string,
): Promise<BenchmarkDetail | null> {
  const [version] = await db
    .select({
      id: benchmarkVersions.id,
      slug: benchmarks.slug,
      displayName: benchmarks.displayName,
      description: benchmarks.description,
      homepageUrl: benchmarks.homepageUrl,
      licenseSpdx: benchmarks.licenseSpdx,
      version: benchmarkVersions.version,
      releasedAt: benchmarkVersions.releasedAt,
      methodologyUrl: benchmarkVersions.methodologyUrl,
    })
    .from(benchmarkVersions)
    .innerJoin(benchmarks, eq(benchmarkVersions.benchmarkId, benchmarks.id))
    .where(eq(benchmarks.slug, slug))
    .orderBy(
      desc(benchmarkVersions.releasedAt),
      desc(benchmarkVersions.version),
    )
    .limit(1);
  if (!version) return null;

  const [metricRows, leaderboardRows] = await Promise.all([
    db
      .select({
        slug: benchmarkMetrics.slug,
        displayName: benchmarkMetrics.displayName,
        unit: benchmarkMetrics.unit,
        higherIsBetter: benchmarkMetrics.higherIsBetter,
        theoreticalMin: benchmarkMetrics.theoreticalMin,
        theoreticalMax: benchmarkMetrics.theoreticalMax,
      })
      .from(benchmarkMetrics)
      .where(eq(benchmarkMetrics.benchmarkVersionId, version.id))
      .orderBy(benchmarkMetrics.slug),
    db
      .select({
        metricSlug: benchmarkMetrics.slug,
        modelSlug: modelVariants.slug,
        modelName: modelVariants.displayName,
        providerName: providers.displayName,
        value: benchmarkResults.value,
        sampleSize: benchmarkResults.sampleSize,
        qualityFlags: benchmarkResults.qualityFlags,
      })
      .from(benchmarkResults)
      .innerJoin(
        benchmarkMetrics,
        eq(benchmarkResults.benchmarkMetricId, benchmarkMetrics.id),
      )
      .innerJoin(
        modelVariants,
        eq(benchmarkResults.modelVariantId, modelVariants.id),
      )
      .innerJoin(models, eq(modelVariants.modelId, models.id))
      .innerJoin(modelFamilies, eq(models.familyId, modelFamilies.id))
      .innerJoin(providers, eq(modelFamilies.providerId, providers.id))
      .where(eq(benchmarkMetrics.benchmarkVersionId, version.id))
      .orderBy(
        benchmarkMetrics.slug,
        desc(
          sql`case when ${benchmarkMetrics.higherIsBetter} then ${benchmarkResults.value} end`,
        ),
        asc(
          sql`case when not ${benchmarkMetrics.higherIsBetter} then ${benchmarkResults.value} end`,
        ),
        modelVariants.slug,
      ),
  ]);

  return BenchmarkDetailSchema.parse({
    ...version,
    releasedAt: version.releasedAt?.toISOString() ?? null,
    metrics: metricRows.map((row) => ({
      ...row,
      theoreticalMin:
        row.theoreticalMin === null ? null : Number(row.theoreticalMin),
      theoreticalMax:
        row.theoreticalMax === null ? null : Number(row.theoreticalMax),
    })),
    leaderboard: leaderboardRows.map((row) => ({
      ...row,
      value: Number(row.value),
      qualityFlags: asFlags(row.qualityFlags),
    })),
  });
}
