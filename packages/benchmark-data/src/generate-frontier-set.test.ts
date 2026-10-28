import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  commonQualityBenchmarks,
  createAaCohorts,
  chooseDefaultCohort,
  selectEligibleFrontier,
} from './generate-frontier-set.js';
import { loadWorkspaceCoverageData } from './coverage-matrix.js';
import {
  rankAaModels,
  selectAaTopTen,
  unresolvedAaRows,
} from './frontier-selection.js';
import {
  FrontierIdentitiesSchema,
  resolveFrontierIdentities,
} from './frontier-identities.js';
import {
  BenchmarkDimensionMappingSchema,
  BenchmarkQualityPolicySchema,
  applyProductProfilePolicy,
  getComparisonOnlyBenchmarkIds,
  type CandidateResult,
} from './index.js';

const root = resolve(import.meta.dirname, '../../..');
const read = async (name: string) =>
  JSON.parse(await readFile(resolve(root, 'data/mappings', name), 'utf8'));

async function workspace() {
  const input = await loadWorkspaceCoverageData(root);
  const mapping = BenchmarkDimensionMappingSchema.parse(
    await read('benchmarks-v2.json'),
  );
  const quality = BenchmarkQualityPolicySchema.parse(
    await read('benchmark-quality-v2.json'),
  );
  const identities = FrontierIdentitiesSchema.parse(
    await read('frontier-identities.json'),
  );
  const candidates = applyProductProfilePolicy(
    resolveFrontierIdentities(input.sourceCandidates, identities),
    input.catalog,
    input.profilePolicy,
    getComparisonOnlyBenchmarkIds(mapping),
  );
  return { candidates, mapping, quality };
}

/** The ten AA-ranked models that pass the frontier eligibility policy. */
async function eligibleWorkspace() {
  const data = await workspace();
  const eligibility = selectEligibleFrontier(
    data.candidates,
    rankAaModels(data.candidates),
    unresolvedAaRows(data.candidates) as CandidateResult[],
    data.mapping,
    data.quality,
  );
  return {
    ...data,
    leaders: eligibility.leaders,
    profileIds: eligibility.leaders.map(({ profileId }) => profileId!),
  };
}

describe('frontier common quality core', () => {
  it('produces eight complete eligible profiles sharing 17 tests in five active categories', async () => {
    const { candidates, mapping, quality } = await workspace();
    expect(selectAaTopTen(candidates).status).toBe('selected');
    const { profileIds } = await eligibleWorkspace();
    expect(profileIds).toHaveLength(10);
    const result = commonQualityBenchmarks(
      candidates,
      profileIds.slice(0, 8),
      mapping,
      quality,
    );
    // 2026-10-25 data; changes when sources or eligibility change.
    expect(result.benchmarkIds).toHaveLength(17);
    expect(result.activeDimensionIds).toEqual([
      'reasoning',
      'knowledge',
      'comprehension',
      'coding',
      'agentic',
    ]);
    expect(result.dimensions.map((d) => [d.id, d.benchmarkIds.length])).toEqual(
      [
        ['reasoning', 2],
        ['knowledge', 2],
        ['comprehension', 3],
        ['coding', 4],
        ['agentic', 6],
        ['language', 0],
      ],
    );
    expect(result.profiles.every((p) => p.results.length === 17)).toBe(true);
  });

  it('never pools missing tests from another effort profile', async () => {
    const { candidates, mapping, quality, profileIds } =
      await eligibleWorkspace();
    const selectedProfileIds = profileIds.slice(0, 8);
    const moved = candidates.map((c) =>
      c.model.profileId === selectedProfileIds[0] && c.benchmarkId === 'critpt'
        ? {
            ...c,
            model: { ...c.model, profileId: `${c.model.profileId}-other` },
          }
        : c,
    );
    const result = commonQualityBenchmarks(
      moved,
      selectedProfileIds,
      mapping,
      quality,
    );
    expect(result.benchmarkIds).not.toContain('critpt');
    expect(
      result.dimensions.find(({ id }) => id === 'reasoning')!.benchmarkIds,
    ).not.toContain('critpt');
  });

  it('enforces limited-test share after the profile intersection', async () => {
    const { candidates, mapping, quality, profileIds } =
      await eligibleWorkspace();
    const selectedProfileIds = profileIds.slice(0, 8);
    const reduced = candidates.filter(
      (c) => !['medscribe', 'gdp-pdf', 'gdp-xlsx'].includes(c.benchmarkId),
    );
    const result = commonQualityBenchmarks(
      reduced,
      selectedProfileIds,
      mapping,
      quality,
    );
    expect(result.benchmarkIds).not.toContain('aa-lcr');
    expect(result.qualityShareRemovedBenchmarkIds).toContain('aa-lcr');
  });

  it('builds exact AA prefixes with independently derived quality intersections', async () => {
    const { candidates, mapping, quality, leaders, profileIds } =
      await eligibleWorkspace();
    const cohorts = createAaCohorts(candidates, leaders, mapping, quality);
    expect(cohorts.map(({ targetModelCount }) => targetModelCount)).toEqual([
      2, 3, 4, 5, 6, 7, 8, 9, 10,
    ]);
    // 2026-10-28 data (AA index v5.0, DAYJOB: Tax, FrontierCode 2.0); validate each
    // intersection independently below.
    expect(cohorts.map(({ benchmarkIds }) => benchmarkIds.length)).toEqual([
      41, 37, 36, 21, 21, 20, 17, 17, 17,
    ]);
    expect(cohorts[6]!.id).toBe('aa-frontier');
    // The first two models share ProofBench, so its quality exclusion is exercised.
    expect(cohorts[0]!.commonBeforeQuality).toContain('proofbench');
    expect(cohorts[0]!.excludedBenchmarkIds).toContain('proofbench');
    expect(cohorts[0]!.benchmarkIds).not.toContain('proofbench');
    for (const cohort of cohorts) {
      expect(cohort.profileIds).toEqual(
        profileIds.slice(0, cohort.targetModelCount),
      );
      expect(cohort.profiles.map(({ profileId }) => profileId)).toEqual(
        cohort.profileIds,
      );
      expect(
        cohort.profiles.every(
          ({ results }) => results.length === cohort.benchmarkIds.length,
        ),
      ).toBe(true);
      expect(cohort.benchmarkIds).toEqual(
        commonQualityBenchmarks(candidates, cohort.profileIds, mapping, quality)
          .benchmarkIds,
      );
    }
  });

  it('requires at least one common test and rejects duplicate profiles', async () => {
    const { mapping, quality } = await workspace();
    expect(() =>
      commonQualityBenchmarks([], ['missing'], mapping, quality),
    ).toThrow('no common');
    expect(() =>
      commonQualityBenchmarks(
        [] as CandidateResult[],
        ['a', 'a'],
        mapping,
        quality,
      ),
    ).toThrow('distinct');
  });
});

describe('default cohort selection', () => {
  const cohort = (targetModelCount: number, tests: number) => ({
    id: `aa-top-${targetModelCount}`,
    targetModelCount,
    benchmarkIds: Array.from({ length: tests }, (_, index) => `b${index}`),
  });

  it('grows past eight models while the common-test count holds', () => {
    expect(
      chooseDefaultCohort([
        cohort(7, 14),
        cohort(8, 12),
        cohort(9, 12),
        cohort(10, 11),
      ]).targetModelCount,
    ).toBe(9);
    expect(
      chooseDefaultCohort([cohort(8, 12), cohort(9, 12), cohort(10, 12)])
        .targetModelCount,
    ).toBe(10);
  });

  it('keeps eight when the next cohort loses a test, even if a later one ties', () => {
    expect(
      chooseDefaultCohort([cohort(8, 12), cohort(9, 11), cohort(10, 12)])
        .targetModelCount,
    ).toBe(8);
  });
});

describe('frontier eligibility', () => {
  it('skips AA leaders scored by fewer than two independent organizations', async () => {
    const { candidates, mapping, quality } = await workspace();
    const result = selectEligibleFrontier(
      candidates,
      rankAaModels(candidates),
      unresolvedAaRows(candidates) as CandidateResult[],
      mapping,
      quality,
    );
    expect(result.leaders).toHaveLength(10);
    // AA ranks are kept, so a skipped model leaves a gap in the sequence.
    expect(
      result.skipped.map(({ modelId, rank, organizations }) => ({
        modelId,
        rank,
        organizations,
      })),
    ).toEqual([
      // 2026-10-28 data: this model is scored outside AA by one organization only.
      { modelId: 'meta-muse-wonder-full', rank: 7, organizations: ['vals-ai'] },
    ]);
    for (const leader of result.leaders) {
      expect(leader.organizations.length).toBeGreaterThanOrEqual(2);
      expect(leader.organizations).not.toContain('artificial-analysis');
      expect(leader.organizations.some((id) => id.endsWith('-releases'))).toBe(
        false,
      );
      expect(leader.organizations.some((id) => id.startsWith('surge-'))).toBe(
        false,
      );
    }
  });

  it('represents each model by its qualifying effort with the most organizations', async () => {
    const { candidates, mapping, quality } = await workspace();
    const result = selectEligibleFrontier(
      candidates,
      rankAaModels(candidates),
      unresolvedAaRows(candidates) as CandidateResult[],
      mapping,
      quality,
    );
    const fable = result.leaders.find(
      ({ modelId }) => modelId === 'anthropic-claude-fable-5-1',
    )!;
    // 2026-10-28 data: AA v5 ranks xhigh above max, but only max is also
    // scored by LiveBench, Vals and Surge; ranking keeps the xhigh score.
    expect(fable).toMatchObject({
      aaWinningProfileId: 'anthropic-claude-fable-5-1-xhigh',
      profileId: 'anthropic-claude-fable-5-1-max',
    });
    expect(fable.representativeScore).toBeLessThan(fable.score);
    expect(fable.organizations).toEqual(
      expect.arrayContaining(['livebench', 'surge', 'vals-ai']),
    );
    for (const leader of result.leaders) {
      const row = candidates.find(
        ({ id }) => id === leader.representativeResultId,
      )!;
      expect(row.model.profileId).toBe(leader.profileId);
      expect(row.rawScore).toBe(leader.representativeScore);
    }
  });

  it('counts an organization even when another source wins the same benchmark', async () => {
    const { candidates, mapping, quality } = await workspace();
    // Muse Wonder Full is skipped with Vals as its only organization. A second
    // organization measuring one of the same Vals benchmarks must count, even
    // though only one of the two rows is the current product measurement.
    const valsRow = candidates.find(
      (row) =>
        row.sourceId === 'vals-ai' &&
        row.inclusion === 'INCLUDED' &&
        row.model.profileId === 'meta-muse-wonder-full-max' &&
        row.normalizedScore !== null &&
        !quality.excludedBenchmarkIds.includes(row.benchmarkId),
    )!;
    const duplicate = {
      ...valsRow,
      id: `${valsRow.id}:epoch-copy`,
      sourceId: 'epoch-ai',
      normalizedScore: valsRow.normalizedScore! - 1,
      rawScore: valsRow.rawScore - 1,
    };
    const withDuplicate = [...candidates, duplicate];
    const result = selectEligibleFrontier(
      withDuplicate,
      rankAaModels(withDuplicate),
      unresolvedAaRows(withDuplicate) as CandidateResult[],
      mapping,
      quality,
    );
    expect(
      result.leaders.find(({ modelId }) => modelId === 'meta-muse-wonder-full')
        ?.organizations,
    ).toEqual(['epoch-ai', 'vals-ai']);
  });

  it('fails closed when fewer than ten models qualify', async () => {
    const { candidates, mapping, quality } = await workspace();
    const aaOnly = candidates.filter(
      ({ sourceId }) => sourceId === 'artificial-analysis',
    );
    expect(() =>
      selectEligibleFrontier(
        aaOnly,
        rankAaModels(aaOnly),
        [],
        mapping,
        quality,
      ),
    ).toThrow(/Only 0 AA models meet the frontier eligibility policy/u);
  });

  it('fails closed when an unresolved identity scores inside the window', async () => {
    const { candidates, mapping, quality } = await workspace();
    const ranked = rankAaModels(candidates);
    const leader = candidates.find(({ id }) => id === ranked[0]!.resultId)!;
    const unresolved = {
      ...leader,
      id: 'unresolved-leader',
      model: { ...leader.model, canonicalModelId: null, profileId: null },
    };
    expect(() =>
      selectEligibleFrontier(
        candidates,
        ranked,
        [unresolved],
        mapping,
        quality,
      ),
    ).toThrow(
      /Unresolved AA identities can affect the eligible frontier: unresolved-leader/u,
    );
  });
});
