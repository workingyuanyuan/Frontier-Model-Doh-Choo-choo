import { describe, expect, it } from 'vitest';
import {
  commonQualityBenchmarks,
  createAaCohorts,
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
    const { leaders } = eligible(candidates);
    const cohorts = createAaCohorts(candidates, leaders, mapping, quality);
    expect(cohorts.map(({ targetModelCount }) => targetModelCount)).toEqual([
      2, 3, 4, 5, 6, 7, 8, 9, 10,
    ]);
    expect(cohorts.map(({ id }) => id)).toContain('aa-frontier');
    expect(
      cohorts.find(({ id }) => id === 'aa-frontier')!.targetModelCount,
    ).toBe(8);
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

  it('represents each model by its qualifying effort with the most organizations', () => {
    const candidates = [
      ...base(),
      // m01's best AA effort is measured by one organization only.
      aa('m01', 101, 'xhigh'),
      ...scoredBy('m01', 'org-a', ['agent-a'], 'xhigh'),
      // m02 high and max tie on organizations: the higher AA score wins.
      aa('m02', 97.5, 'high'),
      ...scoredBy('m02', 'org-a', ['agent-a'], 'high'),
      ...scoredBy('m02', 'org-b', ['agent-a'], 'high'),
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
    expect(leader('m02').profileId).toBe('m02-max');
    // A third organization on m02 high outweighs its lower AA score.
    const more = eligible([
      ...candidates,
      ...scoredBy('m02', 'org-c', ['agent-a'], 'high'),
    ]);
    expect(more.leaders.find(({ modelId }) => modelId === 'm02')).toMatchObject(
      {
        profileId: 'm02-high',
        representativeScore: 97.5,
        organizations: ['org-a', 'org-b', 'org-c'],
      },
    );
    for (const l of result.leaders) {
      const rep = candidates.find(({ id }) => id === l.representativeResultId)!;
      expect(rep.model.profileId).toBe(l.profileId);
      expect(rep.rawScore).toBe(l.representativeScore);
    }
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
    // The tenth eligible leader (m10) scores 91.
    expect(() => eligible(base(), [unresolved(91)])).toThrow(
      /Unresolved AA identities can affect the eligible frontier: unresolved-91/u,
    );
    expect(eligible(base(), [unresolved(90.5)]).leaders).toHaveLength(10);
  });
});
