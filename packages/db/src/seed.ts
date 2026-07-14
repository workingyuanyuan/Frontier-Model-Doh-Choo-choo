import { createDatabase } from './client.js';
import {
  dimensionSeed,
  liveBenchBenchmarkSeed,
  liveBenchDimensionMappingSeeds,
  liveBenchEvaluationConfigSeed,
  liveBenchMetricSeeds,
  scoringMethodSeed,
  themePresetSeed,
} from './seed-data.js';
import {
  benchmarkDimensionMappings,
  benchmarkMetrics,
  benchmarks,
  benchmarkVersions,
  dimensions,
  evaluationConfigs,
  scoringMethodVersions,
  themePresets,
} from './schema/index.js';
import { and, eq } from 'drizzle-orm';

const { db, pool } = createDatabase();

try {
  await db.transaction(async (transaction) => {
    await transaction
      .insert(dimensions)
      .values([...dimensionSeed])
      .onConflictDoNothing({ target: dimensions.id });

    await transaction
      .insert(themePresets)
      .values([...themePresetSeed])
      .onConflictDoNothing({ target: themePresets.slug });

    await transaction
      .insert(benchmarks)
      .values({
        slug: liveBenchBenchmarkSeed.slug,
        displayName: liveBenchBenchmarkSeed.displayName,
        homepageUrl: liveBenchBenchmarkSeed.homepageUrl,
        licenseSpdx: liveBenchBenchmarkSeed.licenseSpdx,
        description: liveBenchBenchmarkSeed.description,
      })
      .onConflictDoNothing({ target: benchmarks.slug });
    const [benchmark] = await transaction
      .select({ id: benchmarks.id })
      .from(benchmarks)
      .where(eq(benchmarks.slug, liveBenchBenchmarkSeed.slug))
      .limit(1);
    if (!benchmark) throw new Error('Failed to resolve LiveBench benchmark');

    await transaction
      .insert(benchmarkVersions)
      .values({
        benchmarkId: benchmark.id,
        version: liveBenchBenchmarkSeed.version,
        releasedAt: new Date(liveBenchBenchmarkSeed.releasedAt),
        methodologyUrl: liveBenchBenchmarkSeed.methodologyUrl,
        config: {
          inventoryContentSha256: liveBenchBenchmarkSeed.inventoryContentSha256,
          inventoryObservationCount:
            liveBenchBenchmarkSeed.inventoryObservationCount,
          taskMetrics: liveBenchMetricSeeds,
        },
      })
      .onConflictDoNothing({
        target: [benchmarkVersions.benchmarkId, benchmarkVersions.version],
      });
    const [benchmarkVersion] = await transaction
      .select({ id: benchmarkVersions.id })
      .from(benchmarkVersions)
      .where(
        and(
          eq(benchmarkVersions.benchmarkId, benchmark.id),
          eq(benchmarkVersions.version, liveBenchBenchmarkSeed.version),
        ),
      )
      .limit(1);
    if (!benchmarkVersion) {
      throw new Error('Failed to resolve LiveBench benchmark version');
    }

    await transaction
      .insert(benchmarkMetrics)
      .values(
        liveBenchMetricSeeds.map((metric) => ({
          benchmarkVersionId: benchmarkVersion.id,
          slug: metric.slug,
          displayName: metric.displayName,
          unit: metric.unit,
          higherIsBetter: metric.higherIsBetter,
          theoreticalMin: metric.theoreticalMin,
          theoreticalMax: metric.theoreticalMax,
        })),
      )
      .onConflictDoNothing({
        target: [benchmarkMetrics.benchmarkVersionId, benchmarkMetrics.slug],
      });
    const metricRows = await transaction
      .select({ id: benchmarkMetrics.id, slug: benchmarkMetrics.slug })
      .from(benchmarkMetrics)
      .where(eq(benchmarkMetrics.benchmarkVersionId, benchmarkVersion.id));
    const metricIdBySlug = new Map(
      metricRows.map(({ id, slug }) => [slug, id]),
    );
    if (metricIdBySlug.size !== liveBenchMetricSeeds.length) {
      throw new Error('LiveBench metric seed count does not match');
    }

    await transaction
      .insert(evaluationConfigs)
      .values({
        benchmarkVersionId: benchmarkVersion.id,
        ...liveBenchEvaluationConfigSeed,
      })
      .onConflictDoNothing({ target: evaluationConfigs.configHash });

    await transaction
      .insert(scoringMethodVersions)
      .values(scoringMethodSeed)
      .onConflictDoNothing({ target: scoringMethodVersions.version });
    const [scoringMethod] = await transaction
      .select({ id: scoringMethodVersions.id })
      .from(scoringMethodVersions)
      .where(eq(scoringMethodVersions.version, scoringMethodSeed.version))
      .limit(1);
    if (!scoringMethod) {
      throw new Error('Failed to resolve scoring method version');
    }

    await transaction
      .insert(benchmarkDimensionMappings)
      .values(
        liveBenchDimensionMappingSeeds.map((mapping) => {
          const benchmarkMetricId = metricIdBySlug.get(mapping.metricSlug);
          if (!benchmarkMetricId) {
            throw new Error(
              `Failed to resolve LiveBench metric: ${mapping.metricSlug}`,
            );
          }
          return {
            scoringMethodVersionId: scoringMethod.id,
            benchmarkMetricId,
            dimensionId: mapping.dimensionId,
            weight: String(mapping.weight),
            normalization: {
              ...mapping.normalization,
              mapping: mapping.mapping,
            },
          };
        }),
      )
      .onConflictDoNothing({
        target: [
          benchmarkDimensionMappings.scoringMethodVersionId,
          benchmarkDimensionMappings.benchmarkMetricId,
          benchmarkDimensionMappings.dimensionId,
        ],
      });
  });

  console.info(
    `Seeded ${dimensionSeed.length} dimensions, ${themePresetSeed.length} themes, ${liveBenchMetricSeeds.length} LiveBench metrics and ${liveBenchDimensionMappingSeeds.length} mappings.`,
  );
} finally {
  await pool.end();
}
