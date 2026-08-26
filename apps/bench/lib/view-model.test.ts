import { DIMENSION_IDS, type DimensionId } from '@llm-bench/benchmark-data';
import { describe, expect, it } from 'vitest';

import {
  ADVANCED_COST_SOURCE_IDS,
  COST_SOURCE_SCORE_BASES,
  COST_SOURCE_WEIGHTS,
  filterLeaderboard,
  getDataScopeSummary,
  getEvidenceForProfile,
  getProfileDisplayName,
  getProfileIdentity,
  getProfilesForModel,
  getDeveloperModelRows,
  getMissingDisplaySetBenchmarks,
  getPartialCoverageRows,
  getRepresentativeRows,
  isMainEligibleRow,
  profileById,
  splitCostSeries,
  buildAdvancedCostModelOptions,
  buildAdvancedCostSeries,
  buildWeightedCostCurve,
  getCostParetoFrontier,
  getSourceScore,
  type PresetProductVersion,
} from './view-model';
import {
  buildRadarPoints,
  buildRadarSegments,
  polarPoint,
} from './visualization';
import { UI_DIMENSION_IDS } from './ui-contract';
import { productFixture } from '../test/fixture';

type FixtureLeaderboardRow = (typeof productFixture.leaderboard)[number];

const displaySet = {
  benchmarkIds: ['terminal-bench-2-1', 'frontiermath'],
} as const;

const representativeCandidate = ({
  profileId,
  nonNullDimensions,
  resultCount,
  overallScore,
  rank,
}: {
  profileId: string;
  nonNullDimensions: number;
  resultCount: number;
  overallScore: number | null;
  rank: number;
}): FixtureLeaderboardRow => ({
  modelId: 'test-model',
  profileId,
  rank,
  overallScore,
  dimensions: productFixture.leaderboard[0]!.dimensions.map(
    ({ dimension }, index) => ({
      dimension,
      score: index < nonNullDimensions ? 50 + index : null,
      componentCount: index < nonNullDimensions ? 1 : 0,
    }),
  ),
  evidenceResultIds: Array.from(
    { length: resultCount },
    (_, index) => `${profileId}:result-${index}`,
  ),
});

const selectRepresentativeProfileId = (
  rows: FixtureLeaderboardRow[],
): string | undefined =>
  getRepresentativeRows({ ...productFixture, leaderboard: rows })[0]?.profileId;

describe('leaderboard view model', () => {
  it('renders exactly one highest-ranked representative per base model', () => {
    const rows = getRepresentativeRows(productFixture);

    expect(rows.map(({ profileId }) => profileId)).toEqual([
      'openai-gpt-5-6-sol-max',
      'anthropic-claude-fable-5-standard',
      'google-gemini-3-1-pro-high',
    ]);
    expect(rows.map(({ rank }) => rank)).toEqual([1, 2, 3]);
  });

  it('orders the leaderboard by Overall Score', () => {
    const lowerScore = {
      ...representativeCandidate({
        profileId: 'model-lower-score',
        nonNullDimensions: 8,
        resultCount: 8,
        overallScore: 40,
        rank: 3,
      }),
      modelId: 'model-lower-score',
    };
    const higherScore = {
      ...representativeCandidate({
        profileId: 'model-higher-score',
        nonNullDimensions: 7,
        resultCount: 7,
        overallScore: 99,
        rank: 1,
      }),
      modelId: 'model-higher-score',
    };

    expect(
      getRepresentativeRows({
        ...productFixture,
        leaderboard: [higherScore, lowerScore],
      }).map(({ profileId }) => profileId),
    ).toEqual(['model-higher-score', 'model-lower-score']);
  });

  it('prefers the profile with higher measured overall score regardless of completeness or result count', () => {
    expect(
      selectRepresentativeProfileId([
        representativeCandidate({
          profileId: 'test-model-more-complete-low-score',
          nonNullDimensions: 8,
          resultCount: 20,
          overallScore: 50,
          rank: 2,
        }),
        representativeCandidate({
          profileId: 'test-model-less-complete-high-score',
          nonNullDimensions: 4,
          resultCount: 4,
          overallScore: 99,
          rank: 1,
        }),
      ]),
    ).toBe('test-model-less-complete-high-score');
  });

  it('prefers a measured overall score over a null overall score regardless of completeness', () => {
    expect(
      selectRepresentativeProfileId([
        representativeCandidate({
          profileId: 'test-model-null-score',
          nonNullDimensions: 8,
          resultCount: 20,
          overallScore: null,
          rank: 2,
        }),
        representativeCandidate({
          profileId: 'test-model-measured-score',
          nonNullDimensions: 2,
          resultCount: 2,
          overallScore: 10,
          rank: 1,
        }),
      ]),
    ).toBe('test-model-measured-score');
  });

  it('uses profileId ascending as the final deterministic tie-break for equal scores', () => {
    expect(
      selectRepresentativeProfileId([
        representativeCandidate({
          profileId: 'test-model-z',
          nonNullDimensions: 7,
          resultCount: 8,
          overallScore: 60,
          rank: 1,
        }),
        representativeCandidate({
          profileId: 'test-model-a',
          nonNullDimensions: 3,
          resultCount: 3,
          overallScore: 60,
          rank: 2,
        }),
      ]),
    ).toBe('test-model-a');
  });

  it('uses profileId ascending as the final deterministic tie-break when both scores are null', () => {
    expect(
      selectRepresentativeProfileId([
        representativeCandidate({
          profileId: 'test-model-z',
          nonNullDimensions: 8,
          resultCount: 10,
          overallScore: null,
          rank: 1,
        }),
        representativeCandidate({
          profileId: 'test-model-a',
          nonNullDimensions: 2,
          resultCount: 2,
          overallScore: null,
          rank: 2,
        }),
      ]),
    ).toBe('test-model-a');
  });

  it('finds a base model through an alternative profile name', () => {
    const rows = filterLeaderboard(productFixture, 'sol · high');

    expect(rows.map(({ modelId }) => modelId)).toEqual(['openai-gpt-5-6-sol']);
  });

  it('keeps the representative profile first and exposes alternatives', () => {
    const profiles = getProfilesForModel(
      productFixture,
      'openai-gpt-5-6-sol',
      'openai-gpt-5-6-sol-max',
    );

    expect(profiles.map(({ id }) => id)).toEqual([
      'openai-gpt-5-6-sol-max',
      'openai-gpt-5-6-sol-high',
    ]);
  });

  it('keeps Included evidence profile-specific and Excluded evidence model-wide', () => {
    const maxRows = getEvidenceForProfile(
      productFixture,
      'openai-gpt-5-6-sol-max',
    );
    const highRows = getEvidenceForProfile(
      productFixture,
      'openai-gpt-5-6-sol-high',
    );

    expect(maxRows.map(({ id }) => id)).toEqual([
      'epoch:max',
      'terminal:max',
      'aggregate:max',
    ]);
    expect(highRows.map(({ id }) => id)).toEqual([
      'terminal:high',
      'aggregate:max',
    ]);
  });

  it('requires every explicit display-set benchmark and a complete rendered row', () => {
    const complete = productFixture.leaderboard[0]!;
    const missingCell = productFixture.leaderboard[2]!;
    const incompleteDimension = productFixture.leaderboard[1]!;

    expect(
      getMissingDisplaySetBenchmarks(
        productFixture,
        complete.profileId,
        displaySet,
      ),
    ).toEqual([]);
    expect(
      getMissingDisplaySetBenchmarks(
        productFixture,
        missingCell.profileId,
        displaySet,
      ),
    ).toEqual(['frontiermath']);
    expect(isMainEligibleRow(productFixture, complete, displaySet)).toBe(true);
    expect(isMainEligibleRow(productFixture, missingCell, displaySet)).toBe(
      false,
    );
    expect(
      isMainEligibleRow(productFixture, incompleteDimension, displaySet),
    ).toBe(false);
  });

  it('routes an excluded model to diagnostics without aggregate values', () => {
    const rows = getDeveloperModelRows(productFixture, displaySet);
    const excluded = rows.find(
      ({ modelId }) => modelId === 'anthropic-claude-fable-5',
    );

    expect(excluded).toMatchObject({
      modelId: 'anthropic-claude-fable-5',
      missingBenchmarkIds: ['terminal-bench-2-1', 'frontiermath'],
    });
    expect(excluded).not.toHaveProperty('overallScore');
    expect(excluded).not.toHaveProperty('dimensions');
  });

  it('selects the candidate profile with fewest missing display-set benchmarks for excluded models when overallScore is null', () => {
    const testDisplaySet = {
      schemaVersion: 'display-set-v1' as const,
      benchmarkIds: ['bm-1', 'bm-2', 'bm-3', 'bm-4'],
    };

    const multiProfileExcludedProduct: PresetProductVersion = {
      ...productFixture,
      frontier: [],
      profiles: [
        {
          id: 'model-x-alpha-high',
          modelId: 'model-x',
          providerId: 'provider-x',
          displayName: 'Model X · high',
          baseModelName: 'Model X',
          releaseDate: '2026-07-01',
          attributes: { effort: 'high', harness: null },
          pricing: [],
        },
        {
          id: 'model-x-beta-xhigh',
          modelId: 'model-x',
          providerId: 'provider-x',
          displayName: 'Model X · xhigh',
          baseModelName: 'Model X',
          releaseDate: '2026-07-01',
          attributes: { effort: 'xhigh', harness: null },
          pricing: [],
        },
      ],
      leaderboard: [
        {
          modelId: 'model-x',
          profileId: 'model-x-alpha-high',
          rank: 1,
          overallScore: null,
          dimensions: [],
          evidenceResultIds: [],
        },
        {
          modelId: 'model-x',
          profileId: 'model-x-beta-xhigh',
          rank: 2,
          overallScore: null,
          dimensions: [],
          evidenceResultIds: [],
        },
      ],
      evidence: [
        // Alpha profile only has 1 benchmark (missing 3: bm-2, bm-3, bm-4)
        {
          id: 'ev-1',
          sourceId: 'src-1',
          sourceRole: 'ORGANIZER',
          benchmarkId: 'bm-1',
          benchmarkVersion: '1.0',
          model: {
            rawName: 'model-x',
            canonicalModelId: 'model-x',
            profileId: 'model-x-alpha-high',
          },
          profile: {
            effort: 'high',
            thinking: 'enabled',
            tools: true,
            harness: null,
            contextWindowTokens: 100000,
            quantization: null,
            attempts: 1,
          },
          metric: {
            id: 'score',
            name: 'Score',
            unit: 'percent',
            higherIsBetter: true,
          },
          rawScore: 80,
          normalizedScore: 80,
          acquisitionStatus: 'FULL',
          inclusion: 'INCLUDED',
          exclusionReason: null,
          sourceUrl: 'https://example.com',
          observedAt: '2026-08-01T00:00:00.000Z',
          sourcePublishedAt: '2026-08-01T00:00:00.000Z',
          evidenceIds: ['ev-1'],
          provenance: {
            sourceUrl: 'https://example.com',
            rawScore: 80,
            locator: '$.score',
            retrievedAt: '2026-08-01T00:00:00.000Z',
            method: 'EMBEDDED_JSON',
            evidenceId: 'ev-1',
          },
        },
        // Beta profile has 3 benchmarks (missing only 1: bm-4)
        ...['bm-1', 'bm-2', 'bm-3'].map((benchmarkId, idx) => ({
          id: `ev-beta-${idx}`,
          sourceId: 'src-1',
          sourceRole: 'ORGANIZER' as const,
          benchmarkId,
          benchmarkVersion: '1.0',
          model: {
            rawName: 'model-x',
            canonicalModelId: 'model-x',
            profileId: 'model-x-beta-xhigh',
          },
          profile: {
            effort: 'xhigh',
            thinking: 'enabled',
            tools: true,
            harness: null,
            contextWindowTokens: 100000,
            quantization: null,
            attempts: 1,
          },
          metric: {
            id: 'score',
            name: 'Score',
            unit: 'percent',
            higherIsBetter: true,
          },
          rawScore: 85,
          normalizedScore: 85,
          acquisitionStatus: 'FULL' as const,
          inclusion: 'INCLUDED' as const,
          exclusionReason: null,
          sourceUrl: 'https://example.com',
          observedAt: '2026-08-01T00:00:00.000Z',
          sourcePublishedAt: '2026-08-01T00:00:00.000Z',
          evidenceIds: [`ev-beta-${idx}`],
          provenance: {
            sourceUrl: 'https://example.com',
            rawScore: 85,
            locator: '$.score',
            retrievedAt: '2026-08-01T00:00:00.000Z',
            method: 'EMBEDDED_JSON' as const,
            evidenceId: `ev-beta-${idx}`,
          },
        })),
      ],
    };

    const rows = getDeveloperModelRows(
      multiProfileExcludedProduct,
      testDisplaySet,
    );
    expect(rows).toHaveLength(1);
    const row = rows[0]!;

    // Must pick beta-xhigh (1 missing) over alpha-high (3 missing), not alphabetical alpha
    expect(row.profileId).toBe('model-x-beta-xhigh');
    expect(row.missingBenchmarkIds).toEqual(['bm-4']);
    expect(row).not.toHaveProperty('overallScore');
    expect(row).not.toHaveProperty('dimensions');
  });

  it('excludes frontier models that have no profile at all from developer mode', () => {
    const fixtureWithPhantomFrontier: PresetProductVersion = {
      ...productFixture,
      frontier: [
        ...productFixture.frontier,
        {
          modelId: 'phantom-model-ghost',
          reasons: ['External cohort only'],
          externalCompositeScores: { intelligence: 99.9 },
        },
      ],
    };

    const rows = getDeveloperModelRows(fixtureWithPhantomFrontier, displaySet);
    expect(rows.some((row) => row.modelId === 'phantom-model-ghost')).toBe(
      false,
    );
  });

  it('guarantees every row in developer mode resolves to a valid profile in product.profiles', () => {
    const rows = getDeveloperModelRows(productFixture, displaySet);
    expect(rows.length).toBeGreaterThan(0);
    const validProfileIds = new Set(productFixture.profiles.map((p) => p.id));

    rows.forEach((row) => {
      expect(validProfileIds.has(row.profileId)).toBe(true);
      expect(profileById(productFixture, row.profileId)).toBeDefined();
    });
  });

  it('derives frontier, ranked, scored-profile, and pending counts', () => {
    expect(getDataScopeSummary(productFixture)).toEqual({
      frontierModels: 3,
      rankedModels: 3,
      scoredProfiles: 4,
      awaitingDirectEvidence: 0,
    });
  });

  it('formats Product Profile identity from effort only', () => {
    const profile = productFixture.profiles[0]!;

    expect(getProfileIdentity(profile)).toBe('max');
    expect(getProfileDisplayName(profile)).toBe('GPT-5.6 Sol · max');
    expect(
      getProfileIdentity({
        ...profile,
        attributes: { effort: 'xhigh', harness: 'Codex' },
      }),
    ).toBe('xHigh');
    expect(
      getProfileIdentity({
        ...profile,
        attributes: { effort: null, harness: null },
      }),
    ).toBe('default');
  });
});

describe('cost chart view model', () => {
  it('declares one score basis, or an explicit none, for every weighted cost source', () => {
    // A source missing from this table would fall back to whatever the caller
    // did by default; the whole point of N11 is that there is no default.
    expect(
      Object.keys(COST_SOURCE_WEIGHTS).filter(
        (sourceId) => !(sourceId in COST_SOURCE_SCORE_BASES),
      ),
    ).toEqual([]);
    expect(
      ADVANCED_COST_SOURCE_IDS.filter(
        (sourceId) => COST_SOURCE_SCORE_BASES[sourceId] == null,
      ),
    ).toEqual([]);
  });

  it('gives LiveBench no score at all rather than a mean of its four benchmarks', () => {
    // Its cost is per SUCCESSFUL task and is filed site-wide, so no LiveBench
    // score was measured by the run that produced it. Null is the disclosure.
    expect(COST_SOURCE_SCORE_BASES['livebench']).toBeNull();
    expect(
      productFixture.profiles.every(
        ({ id }) => getSourceScore(productFixture, 'livebench', id) === null,
      ),
    ).toBe(true);
  });

  it('reads each source score off that source declared benchmark only', () => {
    const template = productFixture.evidence.find(
      ({ benchmarkId }) => benchmarkId === 'terminal-bench-2-1',
    )!;
    const product: PresetProductVersion = {
      ...productFixture,
      evidence: [
        ...productFixture.evidence,
        {
          ...template,
          id: 'aa-index:max',
          sourceId: 'artificial-analysis',
          benchmarkId: 'artificial-analysis-intelligence-index',
          inclusion: 'EXCLUDED',
          rawScore: 61.2,
          normalizedScore: null,
          model: {
            ...template.model,
            profileId: 'openai-gpt-5-6-sol-max',
            canonicalModelId: 'openai-gpt-5-6-sol',
          },
        },
        {
          ...template,
          id: 'aa-other:max',
          sourceId: 'artificial-analysis',
          benchmarkId: 'aa-briefcase',
          inclusion: 'INCLUDED',
          rawScore: 12,
          normalizedScore: 12,
          model: {
            ...template.model,
            profileId: 'openai-gpt-5-6-sol-max',
            canonicalModelId: 'openai-gpt-5-6-sol',
          },
        },
      ],
    };

    // The second AA row is off-basis and must not move the number, which is
    // exactly what the old "mean of every INCLUDED AA row" did.
    expect(
      getSourceScore(product, 'artificial-analysis', 'openai-gpt-5-6-sol-max'),
    ).toEqual({
      score: 61.2,
      basis: 'AA_INTELLIGENCE_INDEX',
      benchmarkId: 'artificial-analysis-intelligence-index',
      sourceEffort: 'max',
    });

    const aaSource = buildWeightedCostCurve(product)
      .find(({ profileId }) => profileId === 'openai-gpt-5-6-sol-max')
      ?.sourceCosts.find(({ sourceId }) => sourceId === 'artificial-analysis');
    expect(aaSource?.sourceScore).toBe(61.2);
    expect(aaSource?.scoreBasis).toBe('AA_INTELLIGENCE_INDEX');
    expect(aaSource?.scoreBenchmarkId).toBe(
      'artificial-analysis-intelligence-index',
    );
  });

  it('marks a source with no basis score as NONE instead of leaving it ambiguous', () => {
    const points = buildWeightedCostCurve(productFixture);

    expect(points.flatMap(({ sourceCosts }) => sourceCosts)).not.toHaveLength(
      0,
    );
    points
      .flatMap(({ sourceCosts }) => sourceCosts)
      .forEach((source) => {
        expect(source.scoreBasis === 'NONE').toBe(source.sourceScore === null);
        expect(source.scoreBenchmarkId === null).toBe(
          source.scoreBasis === 'NONE',
        );
      });
  });

  it('never claims more contributing sources than the weight table has', () => {
    const limit = Object.keys(COST_SOURCE_WEIGHTS).length;

    buildWeightedCostCurve(productFixture).forEach((point) => {
      expect(point.sourceCount).toBe(point.sourceCosts.length);
      expect(point.sourceCount).toBeGreaterThan(0);
      expect(point.sourceCount).toBeLessThanOrEqual(limit);
    });
  });

  it('separates standardized API cost from measured and agent task cost', () => {
    const series = splitCostSeries(productFixture);

    expect(series.api).toHaveLength(2);
    expect(
      series.api.every(({ costType }) => costType === 'API_STANDARDIZED'),
    ).toBe(true);
    expect(series.task.map(({ costType }) => costType)).toEqual([
      'MEASURED_TASK',
      'AGENT_TASK',
    ]);
  });

  it('excludes API prices and combines task costs into one normalized point per profile', () => {
    const points = buildWeightedCostCurve(productFixture);

    expect(points.map(({ profileId }) => profileId)).toEqual([
      'openai-gpt-5-6-sol-max',
      'anthropic-claude-fable-5-standard',
    ]);
    expect(
      points.every(
        ({ normalizedCost }) => Math.abs(normalizedCost - 50) < 1e-10,
      ),
    ).toBe(true);
    expect(points.every(({ sourceCount }) => sourceCount === 1)).toBe(true);
  });

  it('builds a deterministic non-dominated value frontier', () => {
    const points = buildWeightedCostCurve(productFixture);
    const frontier = getCostParetoFrontier(points);

    expect(frontier.map(({ profileId }) => profileId)).toEqual([
      'openai-gpt-5-6-sol-max',
    ]);
  });

  it('selects the same profile ID as getRepresentativeRows for a multi-profile model in the weighted cost curve', () => {
    const productWithMultiProfileCosts = {
      ...productFixture,
      leaderboard: productFixture.leaderboard.map((row) =>
        row.profileId === 'openai-gpt-5-6-sol-high'
          ? {
              ...row,
              overallScore: 99,
              dimensions: row.dimensions.map((dimension, index) =>
                index < 4
                  ? dimension
                  : { ...dimension, score: null, componentCount: 0 },
              ),
            }
          : row,
      ),
      costs: [
        ...productFixture.costs,
        {
          modelId: 'openai-gpt-5-6-sol',
          profileId: 'openai-gpt-5-6-sol-high',
          costType: 'MEASURED_TASK' as const,
          cost: 0.85,
          performance: 84.2,
          assumptionId: null,
          sourceUrl: 'https://artificialanalysis.ai/models',
          sourceId: 'artificial-analysis',
          metricId: 'cost-per-intelligence-index-task',
          metricName: 'Cost per Intelligence Index task',
          unit: 'USD_PER_TASK' as const,
          benchmarkId: 'artificial-analysis-intelligence-index',
          benchmarkVersion: null,
          evidenceIds: [
            'sha256:ccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccd051',
          ],
        },
      ],
    };
    const reps = getRepresentativeRows(productWithMultiProfileCosts);
    const solRep = reps.find((r) => r.modelId === 'openai-gpt-5-6-sol');
    expect(solRep?.profileId).toBe('openai-gpt-5-6-sol-high');

    const points = buildWeightedCostCurve(productWithMultiProfileCosts);
    const solPoints = points.filter((p) => p.modelId === 'openai-gpt-5-6-sol');

    // Emits at most the selected representative profile
    expect(solPoints).toHaveLength(1);
    expect(solPoints[0]?.profileId).toBe(solRep?.profileId);
    expect(solPoints[0]?.performance).toBe(solRep?.overallScore);
    expect(solPoints[0]?.normalizedCost).toBeCloseTo(100, 10);
  });

  it('uses the best available profile for a source when the global representative has no cost data', () => {
    const productWithoutRepCost = {
      ...productFixture,
      costs: productFixture.costs
        .filter((c) => c.profileId !== 'openai-gpt-5-6-sol-max')
        .concat([
          {
            modelId: 'openai-gpt-5-6-sol',
            profileId: 'openai-gpt-5-6-sol-high',
            costType: 'MEASURED_TASK' as const,
            cost: 0.85,
            performance: 84.2,
            assumptionId: null,
            sourceUrl: 'https://artificialanalysis.ai/models',
            sourceId: 'artificial-analysis',
            metricId: 'cost-per-intelligence-index-task',
            metricName: 'Cost per Intelligence Index task',
            unit: 'USD_PER_TASK' as const,
            benchmarkId: 'artificial-analysis-intelligence-index',
            benchmarkVersion: null,
            evidenceIds: [
              'sha256:ccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccd052',
            ],
          },
        ]),
    };
    const reps = getRepresentativeRows(productWithoutRepCost);
    const solRep = reps.find((r) => r.modelId === 'openai-gpt-5-6-sol');
    expect(solRep?.profileId).toBe('openai-gpt-5-6-sol-max');

    const points = buildWeightedCostCurve(productWithoutRepCost);
    const solPoints = points.filter((p) => p.modelId === 'openai-gpt-5-6-sol');
    expect(solPoints).toHaveLength(1);
    expect(solPoints[0]?.selectedProfileIds).toEqual([
      'openai-gpt-5-6-sol-high',
    ]);
  });

  it('excludes null-performance costs from the weighted cost curve', () => {
    const product = {
      ...productFixture,
      costs: productFixture.costs.map((cost) =>
        cost.modelId === 'openai-gpt-5-6-sol'
          ? { ...cost, performance: null }
          : cost,
      ),
    };

    expect(
      buildWeightedCostCurve(product).find(
        (point) => point.modelId === 'openai-gpt-5-6-sol',
      ),
    ).toBeUndefined();
  });

  it('guarantees leaderboard and cost curve defaults cannot diverge from getRepresentativeRows', () => {
    const reps = getRepresentativeRows(productFixture);
    const repByModel = new Map(reps.map((r) => [r.modelId, r.profileId]));

    const costPoints = buildWeightedCostCurve(productFixture);
    costPoints.forEach((point) => {
      expect(point.profileId).toBe(repByModel.get(point.modelId));
    });
  });

  it('uses seven equal source weights and excludes model-catalog costs', () => {
    expect(COST_SOURCE_WEIGHTS).toEqual({
      'artificial-analysis': 1 / 7,
      livebench: 1 / 7,
      deepswe: 1 / 7,
      'frontier-code': 1 / 7,
      'arc-prize': 1 / 7,
      'vals-ai': 1 / 7,
      'zapier-automationbench': 1 / 7,
    });

    const taskTemplate = productFixture.costs.find(
      ({ costType }) => costType === 'MEASURED_TASK',
    )!;
    const product = {
      ...productFixture,
      costs: [
        ...productFixture.costs,
        ...(
          [
            'livebench',
            'frontier-code',
            'arc-prize',
            'vals-ai',
            'model-catalog',
          ] as const
        ).map((sourceId, index) => ({
          ...taskTemplate,
          sourceId,
          cost: 1.5 + index,
          performance: 88.1,
          unit: 'USD_PER_TASK' as const,
        })),
      ],
    };

    const points = buildWeightedCostCurve(product);
    const sol = points.find(({ modelId }) => modelId === 'openai-gpt-5-6-sol');
    expect(sol?.sourceCount).toBe(5);
    expect(
      sol?.sourceCosts
        .map(({ sourceId, weight }) => [sourceId, weight] as const)
        .toSorted(([left], [right]) => left.localeCompare(right)),
    ).toEqual([
      ['arc-prize', 1 / 7],
      ['artificial-analysis', 1 / 7],
      ['frontier-code', 1 / 7],
      ['livebench', 1 / 7],
      ['vals-ai', 1 / 7],
    ]);
    expect(
      sol?.sourceCosts.some(({ sourceId }) => sourceId === 'model-catalog'),
    ).toBe(false);
  });

  it('never admits API-standardized token prices to either chart', () => {
    const apiOnly = {
      ...productFixture,
      costs: productFixture.costs.map((cost) => ({
        ...cost,
        costType: 'API_STANDARDIZED' as const,
        unit: 'USD_PER_MILLION_TOKENS' as const,
      })),
    };

    expect(buildWeightedCostCurve(apiOnly)).toEqual([]);
    expect(buildAdvancedCostSeries(apiOnly)).toEqual([]);
  });

  it('excludes profiles missing one required source, but keeps one-point model series', () => {
    const baseEvidence = productFixture.evidence[0]!;
    const profiles = [
      {
        ...productFixture.profiles[0]!,
        id: 'openai-gpt-5-6-sol-low',
        modelId: 'openai-gpt-5-6-sol',
        displayName: 'GPT-5.6 Sol · low',
        attributes: { effort: 'low', harness: null },
      },
      {
        ...productFixture.profiles[0]!,
        id: 'openai-gpt-5-6-sol-max',
        modelId: 'openai-gpt-5-6-sol',
        displayName: 'GPT-5.6 Sol · max',
        attributes: { effort: 'max', harness: null },
      },
      {
        ...productFixture.profiles[0]!,
        id: 'openai-gpt-5-6-sol-default',
        modelId: 'openai-gpt-5-6-sol',
        displayName: 'GPT-5.6 Sol · default',
        attributes: { effort: 'default', harness: null },
      },
      {
        ...productFixture.profiles[0]!,
        id: 'openai-gpt-5-6-sol-incomplete',
        modelId: 'openai-gpt-5-6-sol',
        displayName: 'GPT-5.6 Sol · incomplete',
        attributes: { effort: 'medium', harness: null },
      },
      {
        ...productFixture.profiles[2]!,
        id: 'anthropic-claude-fable-5-low',
        modelId: 'anthropic-claude-fable-5',
        displayName: 'Claude Fable 5 · low',
        attributes: { effort: 'low', harness: null },
      },
      {
        ...productFixture.profiles[2]!,
        id: 'anthropic-claude-fable-5-incomplete',
        modelId: 'anthropic-claude-fable-5',
        displayName: 'Claude Fable 5 · incomplete',
        attributes: { effort: 'high', harness: null },
      },
      {
        ...productFixture.profiles[3]!,
        id: 'google-gemini-3-1-pro-low',
        modelId: 'google-gemini-3-1-pro',
        displayName: 'Gemini 3.1 Pro · low',
        attributes: { effort: 'low', harness: null },
      },
    ];

    const sourceEvidence = (
      sourceId: string,
      profileId: string,
      modelId: string,
      score: number,
      index: number,
    ) => {
      const isAa = sourceId === 'artificial-analysis';
      const benchmarkId =
        sourceId === 'artificial-analysis'
          ? 'artificial-analysis-intelligence-index'
          : sourceId === 'deepswe'
            ? 'deepswe-1-1'
            : sourceId === 'frontier-code'
              ? 'frontier-code-1-1'
              : 'arc-agi-2';
      const sourceEffort = profileId.endsWith('-non-reasoning')
        ? 'non-reasoning'
        : profileId.endsWith('-default')
          ? null
          : profileId.slice(profileId.lastIndexOf('-') + 1);
      return {
        ...baseEvidence,
        id: `e3:${sourceId}:${profileId}:${index}`,
        sourceId,
        benchmarkId,
        inclusion: isAa ? ('EXCLUDED' as const) : ('INCLUDED' as const),
        exclusionReason: isAa
          ? 'External composite is used for display only.'
          : null,
        model: {
          ...baseEvidence.model,
          canonicalModelId: modelId,
          profileId,
        },
        profile: {
          ...baseEvidence.profile,
          effort: sourceEffort,
        },
        normalizedScore: isAa ? null : score,
        rawScore: score,
      };
    };

    const taskCost = (
      sourceId: string,
      profileId: string,
      modelId: string,
      cost: number,
      index: number,
    ) => ({
      ...productFixture.costs.find(
        ({ costType }) => costType === 'MEASURED_TASK',
      )!,
      sourceId,
      profileId,
      modelId,
      cost,
      costType:
        sourceId === 'deepswe'
          ? ('AGENT_TASK' as const)
          : ('MEASURED_TASK' as const),
      unit: 'USD_PER_TASK' as const,
      benchmarkId:
        sourceId === 'artificial-analysis'
          ? 'artificial-analysis-intelligence-index'
          : sourceId === 'deepswe'
            ? 'deepswe-1-1'
            : sourceId === 'frontier-code'
              ? 'frontier-code-1-1'
              : 'arc-agi-2',
      evidenceIds: [`sha256:${String(index).padStart(64, '0')}`],
    });

    const solProfiles = [
      ['openai-gpt-5-6-sol-low', 10],
      ['openai-gpt-5-6-sol-max', 30],
      ['openai-gpt-5-6-sol-default', 20],
    ] as const;

    const solCosts = solProfiles.flatMap(([profileId, cost]) =>
      ADVANCED_COST_SOURCE_IDS.map((sourceId, index) =>
        taskCost(
          sourceId,
          profileId,
          'openai-gpt-5-6-sol',
          cost + index,
          index + cost,
        ),
      ),
    );
    const solEvidence = solProfiles.flatMap(([profileId, score]) =>
      ADVANCED_COST_SOURCE_IDS.map((sourceId, sourceIndex) =>
        sourceEvidence(
          sourceId,
          profileId,
          'openai-gpt-5-6-sol',
          score + sourceIndex,
          sourceIndex,
        ),
      ),
    );

    // Incomplete profile for Sol: missing Frontier Code and ARC Prize
    const solIncompleteCosts = ['artificial-analysis', 'deepswe'].map(
      (sourceId, index) =>
        taskCost(
          sourceId,
          'openai-gpt-5-6-sol-incomplete',
          'openai-gpt-5-6-sol',
          15 + index,
          200 + index,
        ),
    );
    const solIncompleteEvidence = ['artificial-analysis', 'deepswe'].map(
      (sourceId, index) =>
        sourceEvidence(
          sourceId,
          'openai-gpt-5-6-sol-incomplete',
          'openai-gpt-5-6-sol',
          50 + index,
          200 + index,
        ),
    );

    // Claude: low profile has all 4 sources (single qualifying effort), incomplete profile has only 1 source
    const claudeLowCosts = ADVANCED_COST_SOURCE_IDS.map((sourceId, index) =>
      taskCost(
        sourceId,
        'anthropic-claude-fable-5-low',
        'anthropic-claude-fable-5',
        5 + index,
        300 + index,
      ),
    );
    const claudeLowEvidence = ADVANCED_COST_SOURCE_IDS.map(
      (sourceId, sourceIndex) =>
        sourceEvidence(
          sourceId,
          'anthropic-claude-fable-5-low',
          'anthropic-claude-fable-5',
          80 + sourceIndex,
          300 + sourceIndex,
        ),
    );
    const claudeIncompleteCosts = [
      taskCost(
        'artificial-analysis',
        'anthropic-claude-fable-5-incomplete',
        'anthropic-claude-fable-5',
        8,
        350,
      ),
    ];
    const claudeIncompleteEvidence = [
      sourceEvidence(
        'artificial-analysis',
        'anthropic-claude-fable-5-incomplete',
        'anthropic-claude-fable-5',
        85,
        350,
      ),
    ];

    // Gemini: low profile has only 2 sources, so Gemini has NO qualifying profile
    const geminiCosts = ['artificial-analysis', 'deepswe'].map(
      (sourceId, index) =>
        taskCost(
          sourceId,
          'google-gemini-3-1-pro-low',
          'google-gemini-3-1-pro',
          4 + index,
          400 + index,
        ),
    );
    const geminiEvidence = ['artificial-analysis', 'deepswe'].map(
      (sourceId, index) =>
        sourceEvidence(
          sourceId,
          'google-gemini-3-1-pro-low',
          'google-gemini-3-1-pro',
          70 + index,
          400 + index,
        ),
    );

    const product: PresetProductVersion = {
      ...productFixture,
      profiles,
      costs: [
        ...solCosts,
        ...solIncompleteCosts,
        ...claudeLowCosts,
        ...claudeIncompleteCosts,
        ...geminiCosts,
      ],
      evidence: [
        ...solEvidence,
        ...solIncompleteEvidence,
        ...claudeLowEvidence,
        ...claudeIncompleteEvidence,
        ...geminiEvidence,
      ],
    };

    const series = buildAdvancedCostSeries(product);

    // Only GPT-5.6 Sol and Claude Fable 5 qualify; Gemini is completely omitted
    expect(series.map(({ modelId }) => modelId)).toEqual([
      'anthropic-claude-fable-5',
      'openai-gpt-5-6-sol',
    ]);

    // Claude Fable 5 has a single qualifying effort and produces a 1-point series
    const claudeSeries = series.find(
      ({ modelId }) => modelId === 'anthropic-claude-fable-5',
    )!;
    expect(claudeSeries.points).toHaveLength(1);
    expect(claudeSeries.points[0]?.profileId).toBe(
      'anthropic-claude-fable-5-low',
    );
    expect(claudeSeries.points[0]?.effort).toBe('low');

    // GPT-5.6 Sol has 3 qualifying efforts (the incomplete one is dropped)
    const solSeries = series.find(
      ({ modelId }) => modelId === 'openai-gpt-5-6-sol',
    )!;
    expect(solSeries.points).toHaveLength(3);
    expect(solSeries.points.map(({ effort }) => effort)).toEqual([
      'low',
      'max',
      'default',
    ]);
    expect(
      solSeries.points.find(({ effort }) => effort === 'default')
        ?.isDefaultEffort,
    ).toBe(true);

    // Detail breakdown is preserved on every point
    for (const point of [...solSeries.points, ...claudeSeries.points]) {
      expect(point.sources).toHaveLength(4);
      expect(point.sources.map(({ sourceId }) => sourceId)).toEqual([
        'artificial-analysis',
        'deepswe',
        'frontier-code',
        'arc-prize',
      ]);
    }

    const twoSourceSeries = buildAdvancedCostSeries(product, [
      'artificial-analysis',
      'deepswe',
    ]);
    const twoSourceSol = twoSourceSeries.find(
      ({ modelId }) => modelId === 'openai-gpt-5-6-sol',
    )!;
    expect(twoSourceSol.points.map(({ effort }) => effort)).toEqual([
      'low',
      'medium',
      'max',
      'default',
    ]);
    expect(
      twoSourceSol.points.find(({ effort }) => effort === 'medium')?.sources,
    ).toHaveLength(2);
    expect(
      twoSourceSol.points
        .find(({ effort }) => effort === 'medium')
        ?.sources.map(({ sourceId }) => sourceId),
    ).toEqual(['artificial-analysis', 'deepswe']);
    expect(
      twoSourceSol.points.find(({ effort }) => effort === 'medium')?.score,
    ).toBeCloseTo(50.5, 5);

    const options = buildAdvancedCostModelOptions(product);
    expect(
      options
        .find(({ modelId }) => modelId === 'openai-gpt-5-6-sol')
        ?.efforts.map(({ effort }) => effort),
    ).toEqual(['low', 'medium', 'max', 'default']);
    expect(buildAdvancedCostSeries(product, [])).toEqual([]);
  });

  it('computes Y as the plain arithmetic mean of the four source scores without min-max normalization', () => {
    const baseEvidence = productFixture.evidence[0]!;
    const profile = {
      ...productFixture.profiles[0]!,
      id: 'test-model-high',
      modelId: 'test-model',
      displayName: 'Test Model · high',
      attributes: { effort: 'high', harness: null },
    };

    const sourceEvidence = (sourceId: string, score: number) => {
      const isAa = sourceId === 'artificial-analysis';
      const benchmarkId =
        sourceId === 'artificial-analysis'
          ? 'artificial-analysis-intelligence-index'
          : sourceId === 'deepswe'
            ? 'deepswe-1-1'
            : sourceId === 'frontier-code'
              ? 'frontier-code-1-1'
              : 'arc-agi-2';
      return {
        ...baseEvidence,
        id: `e-mean:${sourceId}`,
        sourceId,
        benchmarkId,
        inclusion: isAa ? ('EXCLUDED' as const) : ('INCLUDED' as const),
        exclusionReason: isAa
          ? 'External composite is used for display only.'
          : null,
        model: {
          ...baseEvidence.model,
          canonicalModelId: 'test-model',
          profileId: 'test-model-high',
        },
        profile: {
          ...baseEvidence.profile,
          effort: 'high',
        },
        normalizedScore: isAa ? null : score,
        rawScore: score,
      };
    };

    const taskCost = (sourceId: string, cost: number) => ({
      ...productFixture.costs.find(
        ({ costType }) => costType === 'MEASURED_TASK',
      )!,
      sourceId,
      profileId: 'test-model-high',
      modelId: 'test-model',
      cost,
      costType:
        sourceId === 'deepswe'
          ? ('AGENT_TASK' as const)
          : ('MEASURED_TASK' as const),
      unit: 'USD_PER_TASK' as const,
      benchmarkId:
        sourceId === 'artificial-analysis'
          ? 'artificial-analysis-intelligence-index'
          : sourceId === 'deepswe'
            ? 'deepswe-1-1'
            : sourceId === 'frontier-code'
              ? 'frontier-code-1-1'
              : 'arc-agi-2',
      evidenceIds: [
        'sha256:1111111111111111111111111111111111111111111111111111111111111111',
      ],
    });

    const aaScore = 60;
    const deepsweScore = 75;
    const frontierCodeScore = 90;
    const arcScore = 95;

    const product: PresetProductVersion = {
      ...productFixture,
      profiles: [profile],
      costs: [
        taskCost('artificial-analysis', 1.0),
        taskCost('deepswe', 2.0),
        taskCost('frontier-code', 3.0),
        taskCost('arc-prize', 4.0),
      ],
      evidence: [
        sourceEvidence('artificial-analysis', aaScore),
        sourceEvidence('deepswe', deepsweScore),
        sourceEvidence('frontier-code', frontierCodeScore),
        sourceEvidence('arc-prize', arcScore),
      ],
    };

    const series = buildAdvancedCostSeries(product);
    expect(series).toHaveLength(1);
    const point = series[0]!.points[0]!;

    // Expected Y = (60 + 75 + 90 + 95) / 4 = 80.0
    expect(point.score).toBeCloseTo(80.0, 5);
  });

  it('keeps point X values untouched when another model is removed from the product', () => {
    const baseEvidence = productFixture.evidence[0]!;
    const profiles = [
      {
        ...productFixture.profiles[0]!,
        id: 'model-a-high',
        modelId: 'model-a',
        displayName: 'Model A · high',
        attributes: { effort: 'high', harness: null },
      },
      {
        ...productFixture.profiles[1]!,
        id: 'model-b-high',
        modelId: 'model-b',
        displayName: 'Model B · high',
        attributes: { effort: 'high', harness: null },
      },
    ];

    const sourceEvidence = (
      sourceId: string,
      profileId: string,
      modelId: string,
      score: number,
    ) => {
      const isAa = sourceId === 'artificial-analysis';
      return {
        ...baseEvidence,
        id: `ev:${sourceId}:${profileId}`,
        sourceId,
        benchmarkId:
          sourceId === 'artificial-analysis'
            ? 'artificial-analysis-intelligence-index'
            : sourceId === 'deepswe'
              ? 'deepswe-1-1'
              : sourceId === 'frontier-code'
                ? 'frontier-code-1-1'
                : 'arc-agi-2',
        inclusion: isAa ? ('EXCLUDED' as const) : ('INCLUDED' as const),
        exclusionReason: isAa ? 'External composite' : null,
        model: { ...baseEvidence.model, canonicalModelId: modelId, profileId },
        profile: { ...baseEvidence.profile, effort: 'high' },
        normalizedScore: isAa ? null : score,
        rawScore: score,
      };
    };

    const taskCost = (
      sourceId: string,
      profileId: string,
      modelId: string,
      cost: number,
    ) => ({
      ...productFixture.costs.find(
        ({ costType }) => costType === 'MEASURED_TASK',
      )!,
      sourceId,
      profileId,
      modelId,
      cost,
      costType:
        sourceId === 'deepswe'
          ? ('AGENT_TASK' as const)
          : ('MEASURED_TASK' as const),
      unit: 'USD_PER_TASK' as const,
      benchmarkId:
        sourceId === 'artificial-analysis'
          ? 'artificial-analysis-intelligence-index'
          : sourceId === 'deepswe'
            ? 'deepswe-1-1'
            : sourceId === 'frontier-code'
              ? 'frontier-code-1-1'
              : 'arc-agi-2',
      evidenceIds: [
        'sha256:2222222222222222222222222222222222222222222222222222222222222222',
      ],
    });

    // Background task costs to anchor the population source ranges (min/max)
    const backgroundCosts = [
      taskCost('artificial-analysis', 'anchor-min', 'anchor-m', 0.5),
      taskCost('artificial-analysis', 'anchor-max', 'anchor-m', 10.0),
      taskCost('deepswe', 'anchor-min', 'anchor-m', 1.0),
      taskCost('deepswe', 'anchor-max', 'anchor-m', 20.0),
      taskCost('frontier-code', 'anchor-min', 'anchor-m', 2.0),
      taskCost('frontier-code', 'anchor-max', 'anchor-m', 50.0),
      taskCost('arc-prize', 'anchor-min', 'anchor-m', 0.25),
      taskCost('arc-prize', 'anchor-max', 'anchor-m', 5.0),
    ];

    const modelACosts = [
      taskCost('artificial-analysis', 'model-a-high', 'model-a', 2.0),
      taskCost('deepswe', 'model-a-high', 'model-a', 5.0),
      taskCost('frontier-code', 'model-a-high', 'model-a', 10.0),
      taskCost('arc-prize', 'model-a-high', 'model-a', 1.0),
    ];
    const modelAEvidence = [
      sourceEvidence('artificial-analysis', 'model-a-high', 'model-a', 70),
      sourceEvidence('deepswe', 'model-a-high', 'model-a', 75),
      sourceEvidence('frontier-code', 'model-a-high', 'model-a', 80),
      sourceEvidence('arc-prize', 'model-a-high', 'model-a', 85),
    ];

    const modelBCosts = [
      taskCost('artificial-analysis', 'model-b-high', 'model-b', 3.0),
      taskCost('deepswe', 'model-b-high', 'model-b', 8.0),
      taskCost('frontier-code', 'model-b-high', 'model-b', 15.0),
      taskCost('arc-prize', 'model-b-high', 'model-b', 1.5),
    ];
    const modelBEvidence = [
      sourceEvidence('artificial-analysis', 'model-b-high', 'model-b', 65),
      sourceEvidence('deepswe', 'model-b-high', 'model-b', 70),
      sourceEvidence('frontier-code', 'model-b-high', 'model-b', 75),
      sourceEvidence('arc-prize', 'model-b-high', 'model-b', 80),
    ];

    const fullProduct: PresetProductVersion = {
      ...productFixture,
      profiles,
      costs: [...backgroundCosts, ...modelACosts, ...modelBCosts],
      evidence: [...modelAEvidence, ...modelBEvidence],
    };

    const withoutModelBProduct: PresetProductVersion = {
      ...productFixture,
      profiles: [profiles[0]!],
      costs: [...backgroundCosts, ...modelACosts],
      evidence: [...modelAEvidence],
    };

    const seriesFull = buildAdvancedCostSeries(fullProduct);
    const seriesWithoutB = buildAdvancedCostSeries(withoutModelBProduct);

    const modelAPointFull = seriesFull.find(
      ({ modelId }) => modelId === 'model-a',
    )?.points[0];
    const modelAPointWithoutB = seriesWithoutB.find(
      ({ modelId }) => modelId === 'model-a',
    )?.points[0];

    expect(modelAPointFull).toBeDefined();
    expect(modelAPointWithoutB).toBeDefined();
    expect(modelAPointFull?.costIndex).toBe(modelAPointWithoutB?.costIndex);
    expect(modelAPointFull?.score).toBe(modelAPointWithoutB?.score);
  });
});

describe('radar geometry', () => {
  const missingLast = UI_DIMENSION_IDS.map((dimension, index) => ({
    dimension,
    score: index === UI_DIMENSION_IDS.length - 1 ? null : 50,
    componentCount: index === UI_DIMENSION_IDS.length - 1 ? 0 : 1,
  }));

  it('keeps missing dimension values absent instead of plotting them at zero', () => {
    const points = buildRadarPoints(
      missingLast,
      UI_DIMENSION_IDS,
      100,
      100,
      80,
    );

    expect(points[UI_DIMENSION_IDS.length - 1]).toBeNull();
    expect(points.filter(Boolean)).toHaveLength(UI_DIMENSION_IDS.length - 1);
  });

  it('breaks partial radar data into open segments instead of closing a polygon across N/A', () => {
    const segments = buildRadarSegments(
      missingLast,
      UI_DIMENSION_IDS,
      100,
      100,
      80,
    );

    expect(segments).toHaveLength(1);
    expect(segments[0]).toHaveLength(UI_DIMENSION_IDS.length - 1);
    expect(segments[0]?.[0]).not.toEqual({ x: 100, y: 100 });
  });

  it('plots each value on the axis the chart labels with that dimension', () => {
    // ProductVersion stores dimensions in scoring order and the chart draws
    // them in UI order. Mapping by array index rotates every value onto a
    // neighbour's axis, so two models can swap places on an axis.
    const scores: Record<string, number> = {
      agentic: 10,
      coding: 20,
      reasoning: 30,
      knowledge: 50,
      language: 60,
    };
    const storedOrder: DimensionId[] = [...DIMENSION_IDS];
    const dimensions = storedOrder.map((dimension) => ({
      dimension,
      score: scores[dimension]!,
      componentCount: 1,
    }));

    const points = buildRadarPoints(dimensions, UI_DIMENSION_IDS, 0, 0, 100);

    UI_DIMENSION_IDS.forEach((dimension, index) => {
      const expected = polarPoint(
        index,
        UI_DIMENSION_IDS.length,
        scores[dimension]!,
        0,
        0,
      );
      expect(points[index]).toEqual(expected);
    });
  });
});

describe('partial coverage disclosure (R19)', () => {
  it('lists profiles that hold four of the five dimensions with the axis they lack', () => {
    const rows = getPartialCoverageRows(productFixture);

    expect(rows.map(({ profileId }) => profileId)).toEqual([
      'anthropic-claude-fable-5-standard',
    ]);
    expect(rows[0]?.missingDimension).toBe('language');
    expect(rows[0]?.displayName).toBe('Claude Fable 5 · standard');
    expect(
      rows[0]?.dimensions.filter(({ score }) => score === null),
    ).toHaveLength(1);
  });

  it('excludes ranked profiles and profiles missing more than one dimension', () => {
    const mainEligible = productFixture.leaderboard.filter((row) =>
      isMainEligibleRow(productFixture, row, {
        benchmarkIds: productFixture.activePreset.benchmarkIds,
      }),
    );
    const twoMissing = {
      ...productFixture,
      leaderboard: productFixture.leaderboard.map((row) => ({
        ...row,
        dimensions: row.dimensions.map((dimension, index) =>
          index < 2
            ? { ...dimension, score: null, componentCount: 0 }
            : dimension,
        ),
        overallScore: null,
      })),
    };

    const partialIds = new Set(
      getPartialCoverageRows(productFixture).map(({ profileId }) => profileId),
    );
    expect(mainEligible.length).toBeGreaterThan(0);
    expect(
      mainEligible.some(({ profileId }) => partialIds.has(profileId)),
    ).toBe(false);
    expect(getPartialCoverageRows(twoMissing)).toEqual([]);
  });
});
