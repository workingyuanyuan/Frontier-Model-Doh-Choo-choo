import { readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { format } from 'prettier';
import { loadWorkspaceCoverageData } from './coverage-matrix.js';
import {
  AA_FRONTIER_POLICY,
  rankAaModels,
  selectAaTopTen,
  unresolvedAaRows,
} from './frontier-selection.js';
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
  type ModelCatalog,
} from './index.js';

/** A single profile must own each result; evidence is never unioned across efforts. */
export function commonQualityBenchmarks(
  candidates: CandidateResult[],
  profileIds: readonly string[],
  mapping: BenchmarkDimensionMapping,
  quality: BenchmarkQualityPolicy,
) {
  return commonQualityBenchmarksFromCurrentResults(
    selectCurrentResults(candidates),
    profileIds,
    mapping,
    quality,
  );
}

function commonQualityBenchmarksFromCurrentResults(
  current: CandidateResult[],
  profileIds: readonly string[],
  mapping: BenchmarkDimensionMapping,
  quality: BenchmarkQualityPolicy,
) {
  if (!profileIds.length || new Set(profileIds).size !== profileIds.length)
    throw new Error('Expected distinct nonempty frontier profiles');
  const comparisonOnly = getComparisonOnlyBenchmarkIds(mapping);
  const known = new Map(mapping.benchmarks.map((b) => [b.id, b]));
  const rows = current.filter(
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

/**
 * A frontier model must also be measured outside AA (user ruling 2026-10-24):
 * its representative profile needs scoring-eligible results from this many
 * independent organizations. AA itself selects, so it does not count; vendor
 * release pages are self-reports and do not count; Surge's leaderboards are
 * one organization. Among the model's AA efforts that meet this rule, the
 * representative profile is the one scored by the most organizations, ties
 * broken by AA score (user ruling 2026-10-28), so the frontier keeps the effort
 * other organizations actually measured.
 */
export const FRONTIER_ELIGIBILITY_POLICY = {
  minIndependentOrganizations: 2,
  excludedSourceIds: ['artificial-analysis'],
  excludedSourceRoles: ['VENDOR'],
} as const;

export const sourceOrganization = (sourceId: string): string =>
  sourceId.startsWith('surge-') ? 'surge' : sourceId;

type AaLeader = ReturnType<typeof rankAaModels>[number];

/**
 * Walks the AA ranking and keeps the first ten models with an AA profile that
 * meets the eligibility policy, represented by the qualifying effort with the
 * most organizations. Ranking still uses the model's best AA score. Skipped models stay
 * in the audit and remain selectable in the dashboard; they only leave the
 * slider and default view.
 */
export function selectEligibleFrontier(
  candidates: CandidateResult[],
  ranked: readonly AaLeader[],
  unresolved: readonly CandidateResult[],
  mapping: BenchmarkDimensionMapping,
  quality: BenchmarkQualityPolicy,
) {
  const comparisonOnly = getComparisonOnlyBenchmarkIds(mapping);
  const known = new Set(mapping.benchmarks.map(({ id }) => id));
  // Pick current rows within each source: selecting across sources keeps one
  // winner per benchmark and would drop the other organization's measurement.
  const bySource = new Map<string, CandidateResult[]>();
  for (const row of candidates) {
    const rows = bySource.get(row.sourceId) ?? [];
    rows.push(row);
    bySource.set(row.sourceId, rows);
  }
  const current = [...bySource.values()].flatMap((rows) =>
    selectCurrentResults(rows),
  );
  const organizations = new Map<string, Set<string>>();
  for (const row of current) {
    if (
      row.normalizedScore === null ||
      row.model.profileId === null ||
      !known.has(row.benchmarkId) ||
      comparisonOnly.has(row.benchmarkId) ||
      quality.excludedBenchmarkIds.includes(row.benchmarkId) ||
      (
        FRONTIER_ELIGIBILITY_POLICY.excludedSourceIds as readonly string[]
      ).includes(row.sourceId) ||
      (
        FRONTIER_ELIGIBILITY_POLICY.excludedSourceRoles as readonly string[]
      ).includes(row.sourceRole)
    ) {
      continue;
    }
    const set = organizations.get(row.model.profileId) ?? new Set<string>();
    set.add(sourceOrganization(row.sourceId));
    organizations.set(row.model.profileId, set);
  }
  const organizationsOf = (profileId: string | null) =>
    [...(organizations.get(profileId ?? '') ?? [])].toSorted();
  const qualifies = (profileId: string | null) =>
    profileId !== null &&
    organizationsOf(profileId).length >=
      FRONTIER_ELIGIBILITY_POLICY.minIndependentOrganizations;
  // Every AA index row per model, best score first, ties by result ID; the
  // stable sort below keeps that order among equally covered efforts.
  const aaRowsByModel = new Map<string, CandidateResult[]>();
  for (const row of candidates) {
    const modelId = row.model.canonicalModelId;
    if (
      row.sourceId !== AA_FRONTIER_POLICY.sourceId ||
      row.benchmarkId !== AA_FRONTIER_POLICY.benchmarkId ||
      modelId === null
    ) {
      continue;
    }
    const rows = aaRowsByModel.get(modelId) ?? [];
    rows.push(row);
    aaRowsByModel.set(modelId, rows);
  }
  for (const rows of aaRowsByModel.values()) {
    rows.sort(
      (left, right) =>
        right.rawScore - left.rawScore || left.id.localeCompare(right.id),
    );
  }
  const leaders: (AaLeader & {
    aaWinningProfileId: string | null;
    representativeScore: number;
    representativeResultId: string;
  })[] = [];
  const skipped: (AaLeader & { organizations: string[] })[] = [];
  for (const leader of ranked) {
    if (leaders.length === AA_FRONTIER_POLICY.searchWindowModels) break;
    const representative = (aaRowsByModel.get(leader.modelId) ?? [])
      .filter((row) => qualifies(row.model.profileId))
      .toSorted(
        (left, right) =>
          organizationsOf(right.model.profileId).length -
          organizationsOf(left.model.profileId).length,
      )[0];
    if (representative) {
      leaders.push({
        ...leader,
        aaWinningProfileId: leader.profileId,
        profileId: representative.model.profileId,
        representativeScore: representative.rawScore,
        representativeResultId: representative.id,
      });
    } else {
      skipped.push({
        ...leader,
        organizations: organizationsOf(leader.profileId),
      });
    }
  }
  if (leaders.length < AA_FRONTIER_POLICY.searchWindowModels) {
    throw new Error(
      `Only ${leaders.length} AA models meet the frontier eligibility policy`,
    );
  }
  // An unresolved identity scoring at or above the last eligible leader could
  // belong in the window; fail closed as the top-ten check does.
  const cutoff = leaders.at(-1)!.score;
  const blocking = unresolved.filter(({ rawScore }) => rawScore >= cutoff);
  if (blocking.length) {
    throw new Error(
      `Unresolved AA identities can affect the eligible frontier: ${blocking
        .map(({ id }) => id)
        .toSorted()
        .join(', ')}`,
    );
  }
  return {
    policy: FRONTIER_ELIGIBILITY_POLICY,
    leaders: leaders.map((leader) => ({
      ...leader,
      organizations: [...organizations.get(leader.profileId!)!].toSorted(),
    })),
    skipped,
  };
}

export const serializeFrontierJson = async (value: unknown): Promise<string> =>
  format(JSON.stringify(value), { parser: 'json', endOfLine: 'lf' });

export const frontierSetPath = (root: string) =>
  join(root, 'data/mappings/frontier-set.json');
export const frontierAuditPath = (root: string) =>
  join(root, 'data/mappings/frontier-selection-audit.json');

/** Validated, identity-resolved and profiled inputs from a single workspace build. */
export interface FrontierSetInput {
  candidates: CandidateResult[];
  catalog: ModelCatalog;
  mapping: BenchmarkDimensionMapping;
  quality: BenchmarkQualityPolicy;
}

async function loadFrontierSetInput(root: string): Promise<FrontierSetInput> {
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
  return { candidates, catalog: input.catalog, mapping, quality };
}

/** Computes the frontier artifact and audit without writing or reloading prepared inputs. */
export async function computeFrontierSet(
  repositoryRoot: string,
  input?: FrontierSetInput,
) {
  const root = resolve(repositoryRoot);
  const { candidates, catalog, mapping, quality } =
    input ?? (await loadFrontierSetInput(root));
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
  let eligibility: ReturnType<typeof selectEligibleFrontier>;
  let cohorts: ReturnType<typeof createAaCohorts>;
  try {
    eligibility = selectEligibleFrontier(
      candidates,
      rankAaModels(candidates),
      unresolvedAaRows(candidates) as CandidateResult[],
      mapping,
      quality,
    );
    cohorts = createAaCohorts(
      candidates,
      eligibility.leaders,
      mapping,
      quality,
    );
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
  const audit = { ...selection, eligibility };
  const artifact = {
    schemaVersion: 'frontier-set-v2',
    selection,
    eligibility,
    cohortPolicy: {
      minModels: 2,
      maxModels: 10,
      defaultModelCount: BASE_DEFAULT_MODEL_COUNT,
      defaultSelection: 'largest-cohort-keeping-base-test-count',
    },
    defaultPresetId: defaultCohort.id,
    benchmarkQuality: quality,
    models: eligibility.leaders.map(({ modelId }) => ({
      modelId,
      displayName:
        catalog.models.find((m) => m.modelId === modelId)?.displayName ??
        modelId,
    })),
    ...defaultCohort,
    cohorts,
  };
  return { status: 'selected' as const, audit, artifact };
}

export async function generateFrontierSet(
  repositoryRoot: string,
  input?: FrontierSetInput,
) {
  const root = resolve(repositoryRoot);
  const result = await computeFrontierSet(root, input);
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
  topTen: readonly Pick<AaLeader, 'modelId' | 'profileId'>[],
  mapping: BenchmarkDimensionMapping,
  quality: BenchmarkQualityPolicy,
) {
  if (topTen.length !== 10 || topTen.some(({ profileId }) => !profileId))
    throw new Error('Expected ten resolved AA leaders');
  const current = selectCurrentResults(candidates);
  return Array.from({ length: 9 }, (_, index) => {
    const targetModelCount = index + 2;
    const leaders = topTen.slice(0, targetModelCount);
    const profileIds = leaders.map(({ profileId }) => profileId!);
    return {
      id: targetModelCount === 8 ? 'aa-frontier' : `aa-top-${targetModelCount}`,
      targetModelCount,
      modelIds: leaders.map(({ modelId }) => modelId),
      profileIds,
      ...commonQualityBenchmarksFromCurrentResults(
        current,
        profileIds,
        mapping,
        quality,
      ),
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
