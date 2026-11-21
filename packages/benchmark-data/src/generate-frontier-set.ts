import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { format } from 'prettier';
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
  CandidateResultSchema,
  ModelCatalogSchema,
  ProfilePolicySchema,
  SourcesConfigSchema,
  applyProductProfilePolicy,
  getComparisonOnlyBenchmarkIds,
  selectCurrentResults,
  type BenchmarkDimensionMapping,
  type BenchmarkQualityPolicy,
  type CandidateResult,
  type ModelCatalog,
  type ProfilePolicy,
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
 * representative profile is the one holding the most scoring-eligible
 * benchmarks (user ruling 2026-11-21), so the frontier keeps the effort the
 * sources actually measured and follows it when another effort overtakes.
 * Ties go to more organizations, then the higher AA score, then profile ID.
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
 * Scoring-eligible benchmarks a single profile holds: exactly the rows a preset
 * intersection could use, counted once per benchmark after cross-source
 * current-result selection. Limited benchmarks count because their cap depends
 * on the cohort; comparison-only and quality-excluded benchmarks do not.
 */
export function scoringEligibleBenchmarksByProfile(
  current: readonly CandidateResult[],
  mapping: BenchmarkDimensionMapping,
  quality: BenchmarkQualityPolicy,
): Map<string, Set<string>> {
  const comparisonOnly = getComparisonOnlyBenchmarkIds(mapping);
  const known = new Set(mapping.benchmarks.map(({ id }) => id));
  const benchmarks = new Map<string, Set<string>>();
  for (const row of current) {
    if (
      row.normalizedScore === null ||
      row.model.profileId === null ||
      !known.has(row.benchmarkId) ||
      comparisonOnly.has(row.benchmarkId) ||
      quality.excludedBenchmarkIds.includes(row.benchmarkId)
    ) {
      continue;
    }
    const set = benchmarks.get(row.model.profileId) ?? new Set<string>();
    set.add(row.benchmarkId);
    benchmarks.set(row.model.profileId, set);
  }
  return benchmarks;
}

/**
 * Walks the AA ranking and keeps the first ten models with an AA profile that
 * meets the eligibility policy, represented by the qualifying effort with the
 * most scoring-eligible benchmarks. Ranking still uses the model's best AA
 * score. Skipped models stay in the audit and remain selectable in the
 * dashboard; they only leave the slider and default view.
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
  // Benchmarks are counted the way a preset intersection sees them: one
  // current result per benchmark across sources.
  const benchmarks = scoringEligibleBenchmarksByProfile(
    selectCurrentResults(candidates),
    mapping,
    quality,
  );
  const organizationsOf = (profileId: string | null) =>
    [...(organizations.get(profileId ?? '') ?? [])].toSorted();
  const benchmarkCountOf = (profileId: string | null) =>
    benchmarks.get(profileId ?? '')?.size ?? 0;
  const qualifies = (profileId: string | null) =>
    profileId !== null &&
    organizationsOf(profileId).length >=
      FRONTIER_ELIGIBILITY_POLICY.minIndependentOrganizations;
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
  // Most benchmarks, then most organizations, then AA score, then a stable ID.
  const byRepresentativeOrder = (
    left: CandidateResult,
    right: CandidateResult,
  ) =>
    benchmarkCountOf(right.model.profileId) -
      benchmarkCountOf(left.model.profileId) ||
    organizationsOf(right.model.profileId).length -
      organizationsOf(left.model.profileId).length ||
    right.rawScore - left.rawScore ||
    (left.model.profileId ?? '').localeCompare(right.model.profileId ?? '') ||
    left.id.localeCompare(right.id);
  const leaders: (AaLeader & {
    aaWinningProfileId: string | null;
    representativeScore: number;
    representativeResultId: string;
    candidateProfiles: {
      profileId: string;
      benchmarkCount: number;
      organizationCount: number;
      aaScore: number;
    }[];
  })[] = [];
  const skipped: (AaLeader & { organizations: string[] })[] = [];
  for (const leader of ranked) {
    if (leaders.length === AA_FRONTIER_POLICY.searchWindowModels) break;
    const qualifying = (aaRowsByModel.get(leader.modelId) ?? [])
      .filter((row) => qualifies(row.model.profileId))
      .toSorted(byRepresentativeOrder);
    const representative = qualifying[0];
    if (representative) {
      leaders.push({
        ...leader,
        aaWinningProfileId: leader.profileId,
        profileId: representative.model.profileId,
        representativeScore: representative.rawScore,
        representativeResultId: representative.id,
        candidateProfiles: qualifying.map((row) => ({
          profileId: row.model.profileId!,
          benchmarkCount: benchmarkCountOf(row.model.profileId),
          organizationCount: organizationsOf(row.model.profileId).length,
          aaScore: row.rawScore,
        })),
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
      benchmarkCount: benchmarkCountOf(leader.profileId),
    })),
    skipped,
  };
}

export const serializeFrontierJson = async (value: unknown): Promise<string> =>
  format(JSON.stringify(value), { parser: 'json', endOfLine: 'lf' });

/** Generated outputs live apart from the reviewed policy in data/mappings. */
export const frontierSetPath = (root: string) =>
  join(root, 'data/derived/frontier-set.json');
export const frontierAuditPath = (root: string) =>
  join(root, 'data/derived/frontier-selection-audit.json');

/** Validated, identity-resolved and profiled inputs from a single workspace build. */
export interface FrontierSetInput {
  candidates: CandidateResult[];
  catalog: ModelCatalog;
  mapping: BenchmarkDimensionMapping;
  quality: BenchmarkQualityPolicy;
}

const readMapping = async (root: string, name: string): Promise<unknown> =>
  JSON.parse(await readFile(join(root, 'data/mappings', name), 'utf8'));

/** Whitelisted source candidates with the catalog and profile policy, before any mapping. */
export async function loadWorkspaceSources(repositoryRoot: string): Promise<{
  sourceCandidates: CandidateResult[];
  catalog: ModelCatalog;
  profilePolicy: ProfilePolicy;
}> {
  const root = resolve(repositoryRoot);
  const whitelist = new Set(
    SourcesConfigSchema.parse(await readMapping(root, 'sources.json'))
      .whitelist,
  );
  const sourceRoot = join(root, 'data/sources');
  const sourceIds = (await readdir(sourceRoot, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory() && whitelist.has(entry.name))
    .map(({ name }) => name)
    .sort();
  const sourceCandidates: CandidateResult[] = [];
  for (const sourceId of sourceIds) {
    sourceCandidates.push(
      ...CandidateResultSchema.array().parse(
        JSON.parse(
          await readFile(join(sourceRoot, sourceId, 'candidates.json'), 'utf8'),
        ),
      ),
    );
  }
  return {
    sourceCandidates,
    catalog: ModelCatalogSchema.parse(await readMapping(root, 'models.json')),
    profilePolicy: ProfilePolicySchema.parse(
      await readMapping(root, 'profile-policy.json'),
    ),
  };
}

async function loadFrontierSetInput(root: string): Promise<FrontierSetInput> {
  const { sourceCandidates, catalog, profilePolicy } =
    await loadWorkspaceSources(root);
  const quality = BenchmarkQualityPolicySchema.parse(
    await readMapping(root, 'benchmark-quality-v2.json'),
  );
  const mapping = BenchmarkDimensionMappingSchema.parse(
    await readMapping(root, 'benchmarks-v2.json'),
  );
  const candidates = applyProductProfilePolicy(
    resolveFrontierIdentities(
      sourceCandidates,
      FrontierIdentitiesSchema.parse(
        await readMapping(root, 'frontier-identities.json'),
      ),
    ),
    catalog,
    profilePolicy,
    getComparisonOnlyBenchmarkIds(mapping),
  );
  return { candidates, catalog, mapping, quality };
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
  let coverageCohorts: ReturnType<typeof createCoverageCohorts>;
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
    coverageCohorts = createCoverageCohorts(
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
    schemaVersion: 'frontier-set-v3',
    selection,
    eligibility,
    cohortPolicy: {
      minModels: 2,
      maxModels: 10,
      defaultModelCount: BASE_DEFAULT_MODEL_COUNT,
      defaultSelection: 'largest-cohort-keeping-base-test-count',
      coverageSelection:
        'most-common-tests-over-models-and-qualifying-efforts-then-active-dimensions-then-fewest-non-representative-efforts-then-aa-rank-within-window',
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
    coverageCohorts,
  };
  return { status: 'selected' as const, audit, artifact };
}

type FrontierSetResult = Awaited<ReturnType<typeof computeFrontierSet>>;

/**
 * Writes a computed result. A needs-review result writes only its audit and
 * leaves the last selected frontier-set.json in place.
 */
export async function writeFrontierSet(
  repositoryRoot: string,
  result: FrontierSetResult,
): Promise<void> {
  const root = resolve(repositoryRoot);
  const write = async (path: string, value: unknown) => {
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, await serializeFrontierJson(value), 'utf8');
  };
  if (result.status === 'selected') {
    await write(frontierSetPath(root), result.artifact);
  }
  await write(frontierAuditPath(root), result.audit);
}

export async function generateFrontierSet(
  repositoryRoot: string,
  input?: FrontierSetInput,
) {
  const root = resolve(repositoryRoot);
  const result = await computeFrontierSet(root, input);
  await writeFrontierSet(root, result);
  if (result.status !== 'selected') throw result.error;
  return { outputPath: frontierSetPath(root), artifact: result.artifact };
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
      id: `aa-top-${targetModelCount}`,
      family: 'aa-frontier' as const,
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

/** Every k-element index subset of 0..n-1, in lexicographic order. */
function* indexCombinations(n: number, k: number): Generator<number[]> {
  const picked = Array.from({ length: k }, (_, index) => index);
  while (true) {
    yield [...picked];
    let position = k - 1;
    while (position >= 0 && picked[position] === n - k + position) position--;
    if (position < 0) return;
    picked[position]!++;
    for (let next = position + 1; next < k; next++)
      picked[next] = picked[next - 1]! + 1;
  }
}

/** A window model and the qualifying efforts it may be scored at. */
type CoverageWindowModel = Pick<AaLeader, 'modelId' | 'profileId'> & {
  /** Qualifying efforts in representative order; the first is the representative. */
  candidateProfiles?: readonly { profileId: string }[];
};

/**
 * The coverage family (user ruling 2026-11-21): for each size N, the N window
 * models and one qualifying effort per model that together share the most
 * scoring-eligible tests after quality rules. A model may be scored at another
 * qualifying effort than its representative one when that raises the shared
 * count (user ruling 2026-11-21, coverage family only; the AA family keeps
 * the representative profiles). Ties go to more active dimensions, then to
 * fewer efforts other than the representative, then to the subset whose
 * window positions sort first (higher AA ranks), then to efforts earlier in
 * representative order. The window is the same ten eligible models, never the
 * wider catalog.
 */
export function createCoverageCohorts(
  candidates: CandidateResult[],
  window: readonly CoverageWindowModel[],
  mapping: BenchmarkDimensionMapping,
  quality: BenchmarkQualityPolicy,
) {
  if (window.length !== 10 || window.some(({ profileId }) => !profileId))
    throw new Error('Expected ten resolved AA leaders');
  const current = selectCurrentResults(candidates);
  // Raw intersections bound the capped count, so choices that cannot reach
  // the incumbent skip the rest of the search and the quality pass.
  const held = scoringEligibleBenchmarksByProfile(current, mapping, quality);
  const heldBy = (profileId: string) =>
    held.get(profileId) ?? new Set<string>();
  const options = window.map(({ profileId, candidateProfiles }) => {
    const ids = candidateProfiles?.map((candidate) => candidate.profileId) ?? [
      profileId!,
    ];
    if (ids[0] !== profileId)
      throw new Error(
        `Expected ${profileId} first among its model's candidate profiles`,
      );
    // Efforts holding the same tests give the same intersections, and the one
    // earlier in representative order wins every tie, so later copies are
    // never chosen; dropping them keeps the search small.
    const seen = new Set<string>();
    return ids.filter((id) => {
      const key = [...heldBy(id)].toSorted().join('\n');
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  });
  type Common = ReturnType<typeof commonQualityBenchmarksFromCurrentResults>;
  return Array.from({ length: 9 }, (_, index) => {
    const targetModelCount = index + 2;
    let best:
      | {
          positions: number[];
          profileIds: string[];
          deviations: number;
          common: Common;
        }
      | undefined;
    const evaluate = (positions: number[], choice: number[]) => {
      const profileIds = choice.map(
        (option, depth) => options[positions[depth]!]![option]!,
      );
      let common: Common;
      try {
        common = commonQualityBenchmarksFromCurrentResults(
          current,
          profileIds,
          mapping,
          quality,
        );
      } catch {
        return;
      }
      const deviations = choice.filter((option) => option > 0).length;
      // Subsets and efforts are enumerated in tie-break order, so only a
      // strict improvement on count, dimensions or deviations replaces the
      // incumbent.
      const gain = best
        ? common.benchmarkIds.length - best.common.benchmarkIds.length ||
          common.activeDimensionIds.length -
            best.common.activeDimensionIds.length ||
          best.deviations - deviations
        : 1;
      if (gain > 0) best = { positions, profileIds, deviations, common };
    };
    const search = (
      positions: number[],
      depth: number,
      shared: Set<string> | null,
      choice: number[],
    ): void => {
      if (depth === positions.length) {
        evaluate(positions, choice);
        return;
      }
      for (const [option, profileId] of options[positions[depth]!]!.entries()) {
        const held = heldBy(profileId);
        const next =
          shared === null
            ? held
            : new Set([...shared].filter((id) => held.has(id)));
        if (best && next.size < best.common.benchmarkIds.length) continue;
        search(positions, depth + 1, next, [...choice, option]);
      }
    };
    for (const positions of indexCombinations(window.length, targetModelCount))
      search(positions, 0, null, []);
    if (!best)
      throw new Error(
        `No ${targetModelCount}-model subset of the frontier window shares a quality-feasible test`,
      );
    const chosen = best.positions.map((position) => window[position]!);
    return {
      id: `coverage-${targetModelCount}`,
      family: 'coverage' as const,
      targetModelCount,
      modelIds: chosen.map(({ modelId }) => modelId),
      profileIds: best.profileIds,
      representativeProfileIds: chosen.map(({ profileId }) => profileId!),
      ...best.common,
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
