import { readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { format } from 'prettier';
import { loadWorkspaceCoverageData } from './coverage-matrix.js';
import { selectAaTopTen } from './frontier-selection.js';
import {
  FrontierIdentitiesSchema,
  resolveFrontierIdentities,
} from './frontier-identities.js';
import {
  CATALOG_DIMENSION_IDS,
  BenchmarkDimensionMappingSchema,
  BenchmarkQualityPolicySchema,
  applyProductProfilePolicy,
  getComparisonOnlyBenchmarkIds,
  selectCurrentResults,
  type BenchmarkDimensionMapping,
  type BenchmarkQualityPolicy,
  type CandidateResult,
} from './index.js';

/** A single profile must own each result; evidence is never unioned across efforts. */
export function commonQualityBenchmarks(
  candidates: CandidateResult[],
  profileIds: readonly string[],
  mapping: BenchmarkDimensionMapping,
  quality: BenchmarkQualityPolicy,
) {
  if (!profileIds.length || new Set(profileIds).size !== profileIds.length)
    throw new Error('Expected distinct nonempty frontier profiles');
  const comparisonOnly = getComparisonOnlyBenchmarkIds(mapping);
  const known = new Map(mapping.benchmarks.map((b) => [b.id, b]));
  const rows = selectCurrentResults(candidates).filter(
    (c) =>
      c.normalizedScore !== null &&
      known.has(c.benchmarkId) &&
      !comparisonOnly.has(c.benchmarkId) &&
      profileIds.includes(c.model.profileId!),
  );
  const byProfile = new Map(
    profileIds.map((id) => [id, new Map<string, CandidateResult>()]),
  );
  for (const row of rows) {
    const scores = byProfile.get(row.model.profileId!)!;
    if (scores.has(row.benchmarkId))
      throw new Error(
        `Multiple current metrics: ${row.model.profileId}/${row.benchmarkId}`,
      );
    scores.set(row.benchmarkId, row);
  }
  const common = [...byProfile.get(profileIds[0]!)!.keys()]
    .filter((id) => profileIds.every((p) => byProfile.get(p)!.has(id)))
    .sort();
  const excluded = common.filter((id) =>
    quality.excludedBenchmarkIds.includes(id),
  );
  const eligible = common.filter(
    (id) => !quality.excludedBenchmarkIds.includes(id),
  );
  const limitedRemoved: string[] = [];
  const dimensions = CATALOG_DIMENSION_IDS.map((id) => {
    const members = eligible.filter(
      (b) => known.get(b)!.primaryDimension === id,
    );
    const regular = members.filter(
      (b) => !quality.limitedBenchmarkIds.includes(b),
    );
    const limited = members.filter((b) =>
      quality.limitedBenchmarkIds.includes(b),
    );
    // Preserve every regular test; retain the largest allowed limited subset.
    // Benchmark ID is the stable tie-break for equally feasible limited tests.
    const cap = Math.floor(
      regular.length / quality.minOtherBenchmarksPerLimited,
    );
    limitedRemoved.push(...limited.slice(cap));
    return { id, benchmarkIds: [...regular, ...limited.slice(0, cap)].sort() };
  });
  const benchmarkIds = dimensions.flatMap((d) => d.benchmarkIds).sort();
  if (!benchmarkIds.length)
    throw new Error('Frontier profiles have no common quality-feasible tests');
  return {
    commonBeforeQuality: common,
    excludedBenchmarkIds: excluded,
    qualityShareRemovedBenchmarkIds: limitedRemoved.sort(),
    benchmarkIds,
    dimensions,
    activeDimensionIds: dimensions
      .filter((d) => d.benchmarkIds.length)
      .map((d) => d.id),
    profiles: profileIds.map((profileId) => ({
      profileId,
      results: benchmarkIds.map((id) => {
        const row = byProfile.get(profileId)!.get(id)!;
        return {
          benchmarkId: id,
          score: row.normalizedScore!,
          resultId: row.id,
          evidenceIds: row.evidenceIds,
        };
      }),
    })),
  };
}

export const serializeFrontierJson = async (value: unknown): Promise<string> =>
  format(JSON.stringify(value), { parser: 'json', endOfLine: 'lf' });

export const frontierSetPath = (root: string) =>
  join(root, 'data/mappings/frontier-set.json');
export const frontierAuditPath = (root: string) =>
  join(root, 'data/mappings/frontier-selection-audit.json');

/** Computes the frontier artifact and audit from saved captures without writing. */
export async function computeFrontierSet(repositoryRoot: string) {
  const root = resolve(repositoryRoot);
  const input = await loadWorkspaceCoverageData(root);
  const quality = BenchmarkQualityPolicySchema.parse(
    JSON.parse(
      await readFile(
        join(root, 'data/mappings/benchmark-quality-v2.json'),
        'utf8',
      ),
    ),
  );
  const mapping = BenchmarkDimensionMappingSchema.parse(
    JSON.parse(
      await readFile(join(root, 'data/mappings/benchmarks-v2.json'), 'utf8'),
    ),
  );
  const identities = FrontierIdentitiesSchema.parse(
    JSON.parse(
      await readFile(
        join(root, 'data/mappings/frontier-identities.json'),
        'utf8',
      ),
    ),
  );
  const candidates = applyProductProfilePolicy(
    resolveFrontierIdentities(input.sourceCandidates, identities),
    input.catalog,
    input.profilePolicy,
    getComparisonOnlyBenchmarkIds(mapping),
  );
  const selection = selectAaTopTen(candidates);
  if (selection.status !== 'selected') {
    return {
      status: 'needs-review' as const,
      audit: selection,
      error: new Error(
        `AA frontier needs review; see ${frontierAuditPath(root)}`,
      ),
    };
  }
  let cohorts: ReturnType<typeof createAaCohorts>;
  try {
    cohorts = createAaCohorts(candidates, selection.topTen, mapping, quality);
  } catch (error) {
    return {
      status: 'needs-review' as const,
      audit: {
        ...selection,
        status: 'needs-review',
        commonCoreError: error instanceof Error ? error.message : String(error),
      },
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
  const defaultCohort = chooseDefaultCohort(cohorts);
  const artifact = {
    schemaVersion: 'frontier-set-v2',
    selection,
    cohortPolicy: {
      minModels: 2,
      maxModels: 10,
      defaultModelCount: BASE_DEFAULT_MODEL_COUNT,
      defaultSelection: 'largest-cohort-keeping-base-test-count',
    },
    defaultPresetId: defaultCohort.id,
    benchmarkQuality: quality,
    models: selection.selectedModelIds.map((modelId) => ({
      modelId,
      displayName:
        input.catalog.models.find((m) => m.modelId === modelId)?.displayName ??
        modelId,
    })),
    ...defaultCohort,
    cohorts,
  };
  return { status: 'selected' as const, audit: selection, artifact };
}

export async function generateFrontierSet(repositoryRoot: string) {
  const root = resolve(repositoryRoot);
  const result = await computeFrontierSet(root);
  const auditPath = frontierAuditPath(root);
  const write = async (path: string, value: unknown) =>
    writeFile(path, await serializeFrontierJson(value), 'utf8');
  if (result.status !== 'selected') {
    await write(auditPath, result.audit);
    throw result.error;
  }
  const outputPath = frontierSetPath(root);
  await write(outputPath, result.artifact);
  await write(auditPath, result.audit);
  return { outputPath, artifact: result.artifact };
}

export const BASE_DEFAULT_MODEL_COUNT = 8;

/**
 * The default starts at the top eight and grows while the larger cohort keeps
 * the same number of common tests: more models at no loss of test coverage
 * (user ruling 2026-10-23). Preset IDs stay tied to their model count.
 */
export function chooseDefaultCohort<
  T extends { targetModelCount: number; benchmarkIds: readonly string[] },
>(cohorts: readonly T[]): T {
  const ordered = cohorts.toSorted(
    (left, right) => left.targetModelCount - right.targetModelCount,
  );
  const base = ordered.find(
    ({ targetModelCount }) => targetModelCount === BASE_DEFAULT_MODEL_COUNT,
  );
  if (!base) throw new Error('Expected a cohort with the base default size');
  let chosen = base;
  for (const cohort of ordered) {
    if (cohort.targetModelCount <= chosen.targetModelCount) continue;
    if (cohort.benchmarkIds.length !== base.benchmarkIds.length) break;
    chosen = cohort;
  }
  return chosen;
}

/** Each prefix uses exactly its AA-winning profiles and their own common tests. */
export function createAaCohorts(
  candidates: CandidateResult[],
  topTen: ReturnType<typeof selectAaTopTen>['topTen'],
  mapping: BenchmarkDimensionMapping,
  quality: BenchmarkQualityPolicy,
) {
  if (topTen.length !== 10 || topTen.some(({ profileId }) => !profileId))
    throw new Error('Expected ten resolved AA leaders');
  return Array.from({ length: 9 }, (_, index) => {
    const targetModelCount = index + 2;
    const leaders = topTen.slice(0, targetModelCount);
    const profileIds = leaders.map(({ profileId }) => profileId!);
    return {
      id: targetModelCount === 8 ? 'aa-frontier' : `aa-top-${targetModelCount}`,
      targetModelCount,
      modelIds: leaders.map(({ modelId }) => modelId),
      profileIds,
      ...commonQualityBenchmarks(candidates, profileIds, mapping, quality),
    };
  });
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  generateFrontierSet(process.argv[2] ?? process.cwd())
    .then(({ outputPath, artifact }) => {
      console.log(
        JSON.stringify(
          {
            outputPath,
            models: artifact.models,
            benchmarkCount: artifact.benchmarkIds.length,
            dimensions: artifact.dimensions,
          },
          null,
          2,
        ),
      );
    })
    .catch((error: unknown) => {
      console.error(error);
      process.exitCode = 1;
    });
}
