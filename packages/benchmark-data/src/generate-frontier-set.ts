import { readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { format } from 'prettier';
import { loadWorkspaceCoverageData } from './coverage-matrix.js';
import { selectAaFrontier } from './frontier-selection.js';
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

export async function generateFrontierSet(repositoryRoot: string) {
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
  const selection = selectAaFrontier(candidates);
  const auditPath = join(root, 'data/mappings/frontier-selection-audit.json');
  const write = async (path: string, value: unknown) =>
    writeFile(
      path,
      await format(JSON.stringify(value), { parser: 'json', endOfLine: 'lf' }),
      'utf8',
    );
  if (selection.status !== 'selected') {
    await write(auditPath, selection);
    throw new Error(`AA frontier needs review; see ${auditPath}`);
  }
  let common: ReturnType<typeof commonQualityBenchmarks>;
  try {
    common = commonQualityBenchmarks(
      candidates,
      selection.selectedProfileIds,
      mapping,
      quality,
    );
  } catch (error) {
    await write(auditPath, {
      ...selection,
      status: 'needs-review',
      commonCoreError: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
  const artifact = {
    schemaVersion: 'frontier-set-v1',
    selection,
    benchmarkQuality: quality,
    models: selection.selectedModelIds.map((modelId) => ({
      modelId,
      displayName:
        input.catalog.models.find((m) => m.modelId === modelId)?.displayName ??
        modelId,
    })),
    ...common,
  };
  const outputPath = join(root, 'data/mappings/frontier-set.json');
  await write(outputPath, artifact);
  await write(auditPath, selection);
  return { outputPath, artifact };
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
