import { describe, expect, it } from 'vitest';
import {
  COVERAGE_WINDOW_MODELS,
  commonQualityBenchmarks,
  createAaCohorts,
  createCoverageCohorts,
  chooseDefaultCohort,
  selectEligibleFrontier,
} from './generate-frontier-set.js';
import {
  AA_FRONTIER_POLICY,
  rankAaModels,
  unresolvedAaRows,
} from './frontier-selection.js';
import type {
  BenchmarkDimensionMapping,
  BenchmarkQualityPolicy,
  CandidateResult,
} from './index.js';

// Synthetic policy fixture: twelve AA-ranked models (m01 highest), each scored
// by org-a on the shared tests and org-b on agent-b; only the top five also
// carry the two coding tests, so larger cohorts lose them.
const benchmarks = [
  ['reason-a', 'reasoning'],
  ['reason-b', 'reasoning'],
  ['reason-c', 'reasoning'],
  ['excluded-x', 'reasoning'],
  ['know-a', 'knowledge'],
  ['know-b', 'knowledge'],
  ['limited-k', 'knowledge'],
  ['code-a', 'coding'],
  ['code-b', 'coding'],
  ['agent-a', 'agentic'],
  ['agent-b', 'agentic'],
  ['cmp-only', 'agentic'],
] as const;
const mapping = {
  schemaVersion: 'benchmark-dimensions-v2',
  dimensions: [
    'reasoning',
    'knowledge',
    'comprehension',
    'coding',
    'agentic',
    'language',
  ],
  benchmarks: benchmarks.map(([id, primaryDimension]) => ({
    id,
    primaryDimension,
    secondaryDimensions: [],
    ...(id === 'cmp-only' ? { comparisonOnly: true } : {}),
  })),
} as BenchmarkDimensionMapping;
const quality: BenchmarkQualityPolicy = {
  reviewedAt: '2026-01-01',
  evidencePath: 'fixture',
  excludedBenchmarkIds: ['excluded-x'],
  limitedBenchmarkIds: ['limited-k'],
  minOtherBenchmarksPerLimited: 2,
};
const evidenceId = `sha256:${'a'.repeat(64)}`;

const row = (
  modelId: string | null,
  benchmarkId: string,
  sourceId: string,
  options: Partial<CandidateResult> & { effort?: string; score?: number } = {},
): CandidateResult => {
  const { effort = 'max', score = 50, ...overrides } = options;
  return {
    schemaVersion: 'candidate-result-v1',
    id: `${sourceId}:${benchmarkId}:${modelId}-${effort}`,
    sourceId,
    sourceRole: 'INDEPENDENT',
    benchmarkId,
    benchmarkVersion: null,
    model: {
      rawName: modelId ?? 'Unknown',
      canonicalModelId: modelId,
      profileId: modelId && `${modelId}-${effort}`,
    },
    profile: {
      effort,
      thinking: null,
      tools: null,
      harness: null,
      contextWindowTokens: null,
      quantization: null,
      attempts: null,
    },
    metric: {
      id: 'score',
      name: 'Score',
      unit: 'percent',
      higherIsBetter: true,
    },
    rawScore: score,
    normalizedScore: score,
    acquisitionStatus: 'FULL',
    inclusion: 'INCLUDED',
    exclusionReason: null,
    sourceUrl: 'https://example.test/result',
    observedAt: '2026-01-01T00:00:00.000Z',
    sourcePublishedAt: null,
    evidenceIds: [evidenceId],
    provenance: { rawScore: { evidenceId, method: 'MANUAL', locator: '$' } },
    ...overrides,
  };
};
const aa = (modelId: string | null, score: number, effort = 'max') =>
  row(modelId, AA_FRONTIER_POLICY.benchmarkId, AA_FRONTIER_POLICY.sourceId, {
    effort,
    score,
    normalizedScore: null,
    inclusion: 'EXCLUDED',
    exclusionReason: 'composite',
  });

const models = Array.from(
  { length: 12 },
  (_, i) => `m${String(i + 1).padStart(2, '0')}`,
);
const shared = [
  'reason-a',
  'reason-b',
  'excluded-x',
  'know-a',
  'know-b',
  'limited-k',
  'agent-a',
  'cmp-only',
  'unmapped',
];
const scoredBy = (
  modelId: string,
  sourceId: string,
  ids: readonly string[],
  effort = 'max',
) => ids.map((id) => row(modelId, id, sourceId, { effort }));
const base = (): CandidateResult[] =>
  models.flatMap((modelId, index) => [
    aa(modelId, 100 - index),
    ...scoredBy(modelId, 'org-a', [
      ...shared,
      ...(index < 5 ? ['code-a', 'code-b'] : []),
    ]),
    ...scoredBy(modelId, 'org-b', ['agent-b']),
  ]);

const eligible = (
  candidates: CandidateResult[],
  unresolved: CandidateResult[] = [],
) =>
  selectEligibleFrontier(
    candidates,
    rankAaModels(candidates),
    [...unresolved, ...(unresolvedAaRows(candidates) as CandidateResult[])],
    mapping,
    quality,
  );
const profilesOf = (count: number) =>
  models.slice(0, count).map((m) => `${m}-max`);

describe('frontier common quality core', () => {
  it('intersects one profile per model and applies quality exclusions by dimension', () => {
    const result = commonQualityBenchmarks(
      base(),
      profilesOf(8),
      mapping,
      quality,
    );
    // Comparison-only and unmapped tests never enter; the excluded test is
    // common but removed after the intersection.
    expect(result.commonBeforeQuality).toEqual([
      'agent-a',
      'agent-b',
      'excluded-x',
      'know-a',
      'know-b',
      'limited-k',
      'reason-a',
      'reason-b',
    ]);
    expect(result.excludedBenchmarkIds).toEqual(['excluded-x']);
    expect(result.benchmarkIds).toEqual([
      'agent-a',
      'agent-b',
      'know-a',
      'know-b',
      'limited-k',
      'reason-a',
      'reason-b',
    ]);
    expect(result.activeDimensionIds).toEqual([
      'reasoning',
      'knowledge',
      'agentic',
    ]);
    expect(result.dimensions.map((d) => [d.id, d.benchmarkIds.length])).toEqual(
      [
        ['reasoning', 2],
        ['knowledge', 3],
        ['comprehension', 0],
        ['coding', 0],
        ['agentic', 2],
        ['language', 0],
      ],
    );
    expect(result.profiles.map(({ profileId }) => profileId)).toEqual(
      profilesOf(8),
    );
    expect(result.profiles.every((p) => p.results.length === 7)).toBe(true);
    expect(result.qualityShareRemovedBenchmarkIds).toEqual([]);
  });

  it('never pools missing tests from another effort profile', () => {
    const moved = base().map((c) =>
      c.model.profileId === 'm01-max' && c.benchmarkId === 'reason-a'
        ? { ...c, model: { ...c.model, profileId: 'm01-high' } }
        : c,
    );
    const result = commonQualityBenchmarks(
      moved,
      profilesOf(8),
      mapping,
      quality,
    );
    expect(result.benchmarkIds).not.toContain('reason-a');
    expect(
      result.dimensions.find(({ id }) => id === 'reasoning')!.benchmarkIds,
    ).toEqual(['reason-b']);
  });

  it('enforces limited-test share after the profile intersection', () => {
    // One fewer regular knowledge test leaves no room for the limited test.
    const reduced = base().filter((c) => c.benchmarkId !== 'know-b');
    const result = commonQualityBenchmarks(
      reduced,
      profilesOf(8),
      mapping,
      quality,
    );
    expect(result.commonBeforeQuality).toContain('limited-k');
    expect(result.benchmarkIds).not.toContain('limited-k');
    expect(result.qualityShareRemovedBenchmarkIds).toEqual(['limited-k']);
  });

  it('builds exact AA prefixes with independently derived quality intersections', () => {
    const candidates = base();
    const leaders = eligible(candidates).leaders.slice(0, 10);
    const cohorts = createAaCohorts(candidates, leaders, mapping, quality);
    expect(cohorts.map(({ targetModelCount }) => targetModelCount)).toEqual([
      2, 3, 4, 5, 6, 7, 8, 9, 10,
    ]);
    expect(cohorts.map(({ id }) => id)).toEqual(
      cohorts.map(({ targetModelCount }) => `aa-top-${targetModelCount}`),
    );
    for (const cohort of cohorts) {
      expect(cohort.profileIds).toEqual(profilesOf(cohort.targetModelCount));
      expect(cohort.modelIds).toEqual(models.slice(0, cohort.targetModelCount));
      // Coding tests are shared only while every member is among the top five.
      const expected = [
        ...(cohort.targetModelCount <= 5 ? ['code-a', 'code-b'] : []),
        ...['agent-a', 'agent-b', 'know-a', 'know-b', 'limited-k'],
        ...['reason-a', 'reason-b'],
      ].sort();
      expect(cohort.benchmarkIds).toEqual(expected);
      expect(cohort.profiles.map(({ profileId }) => profileId)).toEqual(
        cohort.profileIds,
      );
      for (const { results } of cohort.profiles)
        expect(results.map(({ benchmarkId }) => benchmarkId)).toEqual(expected);
    }
    // Same test count from eight through ten: the default grows to ten.
    expect(chooseDefaultCohort(cohorts).id).toBe('aa-top-10');
    expect(() =>
      createAaCohorts(candidates, leaders.slice(0, 9), mapping, quality),
    ).toThrow('Expected ten resolved AA leaders');
  });

  it('picks the window subset sharing the most tests, ties to higher AA ranks', () => {
    // m02 lacks know-a, so subsets without it share one more test.
    const candidates = base().filter(
      (c) => !(c.model.profileId === 'm02-max' && c.benchmarkId === 'know-a'),
    );
    const { leaders } = eligible(candidates);
    const cohorts = createCoverageCohorts(
      candidates,
      leaders,
      mapping,
      quality,
    );
    // The coverage window is every eligible model, here all twelve.
    expect(leaders).toHaveLength(12);
    expect(cohorts.map(({ id }) => id)).toEqual(
      [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => `coverage-${n}`),
    );
    const members = (n: number) =>
      cohorts.find(({ targetModelCount }) => targetModelCount === n)!.modelIds;
    expect(members(2)).toEqual(['m01', 'm03']);
    expect(members(4)).toEqual(['m01', 'm03', 'm04', 'm05']);
    // Keeping both coding tests (8) beats keeping know-a without them (7).
    expect(members(5)).toEqual(['m01', 'm02', 'm03', 'm04', 'm05']);
    // Several six-model subsets share seven tests; the highest ranks win.
    expect(members(6)).toEqual(['m01', 'm03', 'm04', 'm05', 'm06', 'm07']);
    const aaCohorts = createAaCohorts(
      candidates,
      leaders.slice(0, 10),
      mapping,
      quality,
    );
    for (const cohort of cohorts) {
      expect(cohort.family).toBe('coverage');
      expect(cohort.profileIds).toEqual(
        cohort.modelIds.map(
          (id) => leaders.find(({ modelId }) => modelId === id)!.profileId,
        ),
      );
      const sameSize = aaCohorts.find(
        ({ targetModelCount }) => targetModelCount === cohort.targetModelCount,
      );
      if (sameSize)
        expect(cohort.benchmarkIds.length).toBeGreaterThanOrEqual(
          sameSize.benchmarkIds.length,
        );
    }
    // One effort per model and one subset of the whole window: every leader
    // at its representative profile.
    expect(cohorts.at(-1)!.profileIds).toEqual(
      leaders.map(({ profileId }) => profileId),
    );
  });

  // m01-max lacks both coding tests but holds reason-c, so it keeps the
  // representative slot (8 benchmarks each; max has the higher AA score).
  // An alternate effort of m01 carries the coding tests the other top models
  // share, but not limited-k.
  const m01Alternate = (effort: string, aaScore: number) => [
    aa('m01', aaScore, effort),
    ...scoredBy(
      'm01',
      'org-a',
      [
        'reason-a',
        'reason-b',
        'know-a',
        'know-b',
        'code-a',
        'code-b',
        'agent-a',
      ],
      effort,
    ),
    ...scoredBy('m01', 'org-b', ['agent-b'], effort),
  ];
  const withoutM01Coding = () =>
    base().filter(
      (c) =>
        !(
          c.model.profileId === 'm01-max' &&
          ['code-a', 'code-b'].includes(c.benchmarkId)
        ),
    );
  const coverageCohort = (candidates: CandidateResult[], n: number) => {
    const { leaders } = eligible(candidates);
    return createCoverageCohorts(candidates, leaders, mapping, quality).find(
      ({ targetModelCount }) => targetModelCount === n,
    )!;
  };

  it('scores a model at another qualifying effort when that shares more tests', () => {
    // xhigh and high hold the same tests; xhigh is earlier in representative
    // order (higher AA score), so it wins that tie.
    const candidates = [
      ...withoutM01Coding(),
      ...scoredBy('m01', 'org-a', ['reason-c']),
      ...m01Alternate('high', 99),
      ...m01Alternate('xhigh', 99.5),
    ];
    const { leaders } = eligible(candidates);
    expect(leaders[0]!.profileId).toBe('m01-max');
    const aaFive = createAaCohorts(
      candidates,
      leaders.slice(0, 10),
      mapping,
      quality,
    )[3]!;
    expect(aaFive.benchmarkIds).toHaveLength(7);
    // With xhigh the top five keep both coding tests: 8 shared, not 7.
    const five = coverageCohort(candidates, 5);
    expect(five.modelIds).toEqual(['m01', 'm02', 'm03', 'm04', 'm05']);
    expect(five.profileIds[0]).toBe('m01-xhigh');
    expect(five.representativeProfileIds[0]).toBe('m01-max');
    expect(five.benchmarkIds).toHaveLength(8);
    expect(five.benchmarkIds).toContain('code-a');
  });

  it('skips an effort with two current metrics for one benchmark', () => {
    // m01-xhigh would share more tests, but its excluded-x has two metrics,
    // so no cohort can be built with it.
    const duplicate = row('m01', 'excluded-x', 'org-a', { effort: 'xhigh' });
    const candidates = [
      ...withoutM01Coding(),
      ...scoredBy('m01', 'org-a', ['reason-c']),
      ...m01Alternate('xhigh', 99.5),
      duplicate,
      {
        ...duplicate,
        id: `${duplicate.id}:second`,
        metric: { ...duplicate.metric, id: 'second' },
      },
    ];
    const cohorts = createCoverageCohorts(
      candidates,
      eligible(candidates).leaders,
      mapping,
      quality,
    );
    for (const cohort of cohorts)
      expect(cohort.profileIds).not.toContain('m01-xhigh');
    // Without xhigh the top five share the seven tests of the AA prefix.
    expect(coverageCohort(candidates, 5).benchmarkIds).toHaveLength(7);
  });

  it('prefers a lower-ranked subset that needs fewer non-representative efforts', () => {
    // m06 gains the coding tests and loses limited-k, so m02–m06 at their
    // representative efforts share the same 8 tests and 4 dimensions as the
    // top five with m01 at xhigh.
    const candidates = [
      ...withoutM01Coding().filter(
        (c) =>
          !(c.model.profileId === 'm06-max' && c.benchmarkId === 'limited-k'),
      ),
      ...scoredBy('m01', 'org-a', ['reason-c']),
      ...scoredBy('m06', 'org-a', ['code-a', 'code-b']),
      ...m01Alternate('xhigh', 99.5),
    ];
    const five = coverageCohort(candidates, 5);
    expect(five.benchmarkIds).toHaveLength(8);
    expect(five.modelIds).toEqual(['m02', 'm03', 'm04', 'm05', 'm06']);
    expect(five.profileIds).toEqual(five.representativeProfileIds);
  });

  it('keeps the representative effort when another effort only ties', () => {
    // m01-xhigh holds exactly the tests m01-max shares with every other
    // model, so each intersection is the same at either effort.
    const candidates = [
      ...base(),
      ...scoredBy('m01', 'org-a', ['reason-c']),
      aa('m01', 99.5, 'xhigh'),
      ...scoredBy('m01', 'org-a', [...shared, 'code-a', 'code-b'], 'xhigh'),
      ...scoredBy('m01', 'org-b', ['agent-b'], 'xhigh'),
    ];
    const { leaders } = eligible(candidates);
    expect(
      leaders[0]!.candidateProfiles.map(({ profileId }) => profileId),
    ).toEqual(['m01-max', 'm01-xhigh']);
    for (const cohort of createCoverageCohorts(
      candidates,
      leaders,
      mapping,
      quality,
    ))
      expect(cohort.profileIds, cohort.id).toEqual(
        cohort.representativeProfileIds,
      );
  });

  it('breaks coverage ties by active dimensions before AA rank', () => {
    // {m01, m02} and {m01, m03} share eight tests each (as do m04 and m05),
    // but only pairs without m02 keep a coding test.
    const candidates = [
      ...base().filter(
        (c) =>
          !(
            (c.model.profileId === 'm02-max' &&
              ['code-a', 'code-b'].includes(c.benchmarkId)) ||
            (['m03-max', 'm04-max', 'm05-max'].includes(c.model.profileId!) &&
              c.benchmarkId === 'code-b')
          ),
      ),
      ...scoredBy('m01', 'org-a', ['reason-c']),
      ...scoredBy('m02', 'org-a', ['reason-c']),
    ];
    const { leaders } = eligible(candidates);
    const [pair] = createCoverageCohorts(candidates, leaders, mapping, quality);
    expect(pair!.modelIds).toEqual(['m01', 'm03']);
    expect(pair!.activeDimensionIds).toContain('coding');
  });

  it('requires at least one common test and rejects duplicate profiles', () => {
    expect(() =>
      commonQualityBenchmarks([], ['missing'], mapping, quality),
    ).toThrow('no common');
    expect(() =>
      commonQualityBenchmarks([], ['a', 'a'], mapping, quality),
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
  it('skips AA leaders scored by fewer than two independent organizations', () => {
    const dropped: Record<string, string[]> = {
      m03: ['org-b'],
      m04: ['org-b'],
      m05: ['org-a', 'org-b'],
    };
    const candidates = [
      ...base().filter(
        (r) => !dropped[r.model.canonicalModelId!]?.includes(r.sourceId),
      ),
      // m03 keeps one organization; AA, vendor, excluded and comparison-only
      // rows from other sources do not count.
      row('m03', 'agent-b', 'artificial-analysis'),
      row('m03', 'agent-b', 'm03-releases', { sourceRole: 'VENDOR' }),
      row('m03', 'excluded-x', 'org-c'),
      row('m03', 'cmp-only', 'org-d'),
      // Surge boards count as one organization: enough with org-a for m04,
      // not enough on their own for m05.
      row('m04', 'agent-b', 'surge-x'),
      row('m05', 'agent-a', 'surge-x'),
      row('m05', 'agent-b', 'surge-y'),
    ];
    const result = eligible(candidates);
    expect(result.leaders).toHaveLength(10);
    // AA ranks are kept, so a skipped model leaves a gap in the sequence.
    expect(
      result.skipped.map(({ modelId, rank, organizations }) => ({
        modelId,
        rank,
        organizations,
      })),
    ).toEqual([
      { modelId: 'm03', rank: 3, organizations: ['org-a'] },
      { modelId: 'm05', rank: 5, organizations: ['surge'] },
    ]);
    expect(result.leaders.map(({ modelId }) => modelId)).toEqual(
      models.filter((m) => !['m03', 'm05'].includes(m)),
    );
    expect(
      result.leaders.find(({ modelId }) => modelId === 'm04')!.organizations,
    ).toEqual(['org-a', 'surge']);
  });

  it('represents each model by its qualifying effort with the most benchmarks', () => {
    const candidates = [
      ...base(),
      // m01's best AA effort is measured by one organization only.
      aa('m01', 101, 'xhigh'),
      ...scoredBy('m01', 'org-a', ['agent-a'], 'xhigh'),
      // m02 high is measured by three organizations but on one benchmark.
      aa('m02', 97.5, 'high'),
      ...scoredBy('m02', 'org-a', ['agent-a'], 'high'),
      ...scoredBy('m02', 'org-b', ['agent-a'], 'high'),
      ...scoredBy('m02', 'org-c', ['agent-a'], 'high'),
    ];
    const result = eligible(candidates);
    const leader = (id: string) =>
      result.leaders.find(({ modelId }) => modelId === id)!;
    expect(leader('m01')).toMatchObject({
      aaWinningProfileId: 'm01-xhigh',
      profileId: 'm01-max',
      score: 101,
      representativeScore: 100,
    });
    // More organizations do not outweigh more benchmarks.
    expect(leader('m02')).toMatchObject({
      profileId: 'm02-max',
      benchmarkCount: 9,
    });
    expect(
      leader('m02').candidateProfiles.map(
        ({ profileId, benchmarkCount, organizationCount }) => [
          profileId,
          benchmarkCount,
          organizationCount,
        ],
      ),
    ).toEqual([
      ['m02-max', 9, 2],
      ['m02-high', 1, 3],
    ]);
    // Once the high effort holds more benchmarks, the selection follows it.
    const overtaken = eligible([
      ...candidates,
      ...scoredBy(
        'm02',
        'org-a',
        [...shared, 'code-a', 'code-b', 'reason-c'],
        'high',
      ),
      ...scoredBy('m02', 'org-b', ['agent-b'], 'high'),
    ]);
    expect(
      overtaken.leaders.find(({ modelId }) => modelId === 'm02'),
    ).toMatchObject({
      profileId: 'm02-high',
      representativeScore: 97.5,
      benchmarkCount: 10,
    });
    for (const l of result.leaders) {
      const rep = candidates.find(({ id }) => id === l.representativeResultId)!;
      expect(rep.model.profileId).toBe(l.profileId);
      expect(rep.rawScore).toBe(l.representativeScore);
    }
  });

  it('breaks benchmark-count ties by organizations, then AA score', () => {
    const tied = [
      ...base(),
      aa('m02', 97.5, 'high'),
      ...scoredBy('m02', 'org-a', [...shared, 'code-a', 'code-b'], 'high'),
      ...scoredBy('m02', 'org-b', ['agent-b'], 'high'),
    ];
    // Same benchmarks and organizations: the higher AA score (max, 99) wins.
    const byScore = eligible(tied);
    expect(
      byScore.leaders.find(({ modelId }) => modelId === 'm02')!.profileId,
    ).toBe('m02-max');
    // A third organization on the same benchmark set tips it to high.
    const byOrganizations = eligible([
      ...tied,
      ...scoredBy('m02', 'org-c', ['agent-a'], 'high'),
    ]);
    expect(
      byOrganizations.leaders.find(({ modelId }) => modelId === 'm02')!
        .profileId,
    ).toBe('m02-high');
  });

  it('counts an organization even when another source wins the same benchmark', () => {
    const valsRow = row('m03', 'agent-a', 'org-a');
    const candidates = [
      ...base().filter(
        (r) => r.model.canonicalModelId !== 'm03' || r.sourceId !== 'org-b',
      ),
      {
        ...valsRow,
        id: 'copy',
        sourceId: 'org-e',
        rawScore: 49,
        normalizedScore: 49,
      },
    ];
    expect(
      eligible(candidates).leaders.find(({ modelId }) => modelId === 'm03')
        ?.organizations,
    ).toEqual(['org-a', 'org-e']);
  });

  it('fails closed when fewer than ten models qualify', () => {
    const aaOnly = base().filter(
      ({ sourceId }) => sourceId === 'artificial-analysis',
    );
    expect(() => eligible(aaOnly)).toThrow(
      /Only 0 AA models meet the frontier eligibility policy/u,
    );
  });

  it('fails closed only when an unresolved identity scores inside the window', () => {
    const unresolved = (score: number) => ({
      ...aa(null, score),
      id: `unresolved-${score}`,
    });
    // The last eligible leader (m12) scores 89.
    expect(() => eligible(base(), [unresolved(89)])).toThrow(
      /Unresolved AA identities can affect the eligible frontier: unresolved-89/u,
    );
    expect(eligible(base(), [unresolved(88.5)]).leaders).toHaveLength(12);
  });

  it('keeps at most the coverage window of eligible models', () => {
    const unresolved = (score: number) => ({
      ...aa(null, score),
      id: `unresolved-${score}`,
    });
    const extra = Array.from(
      { length: COVERAGE_WINDOW_MODELS },
      (_, i) => `x${String(i + 1).padStart(2, '0')}`,
    );
    const candidates = [
      ...base(),
      ...extra.flatMap((modelId, index) => [
        aa(modelId, 80 - index),
        ...scoredBy(modelId, 'org-a', shared),
        ...scoredBy(modelId, 'org-b', ['agent-b']),
      ]),
    ];
    const lastIndex = COVERAGE_WINDOW_MODELS - models.length - 1;
    const { leaders } = eligible(candidates, [
      unresolved(80 - lastIndex - 0.5),
    ]);
    expect(leaders.map(({ modelId }) => modelId)).toEqual([
      ...models,
      ...extra.slice(0, lastIndex + 1),
    ]);
    expect(() => eligible(candidates, [unresolved(80 - lastIndex)])).toThrow(
      /Unresolved AA identities/u,
    );
  });
});
