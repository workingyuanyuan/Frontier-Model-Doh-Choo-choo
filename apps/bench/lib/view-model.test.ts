import type { ProductVersion } from '@llm-bench/benchmark-data';
import { describe, expect, it } from 'vitest';

import {
  ADVANCED_COST_SOURCE_IDS,
  COST_SOURCE_WEIGHTS,
  filterLeaderboard,
  getDataScopeSummary,
  getEvidenceForProfile,
  getProfileDisplayName,
  getProfileIdentity,
  getProfilesForModel,
  getDeveloperModelRows,
  getMissingDisplaySetBenchmarks,
  getRepresentativeRows,
  isMainEligibleRow,
  profileById,
  splitCostSeries,
  buildAdvancedCostSeries,
  buildWeightedCostCurve,
  getCostParetoFrontier,
} from './view-model';
import { buildRadarPoints, buildRadarSegments } from './visualization';
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

    const multiProfileExcludedProduct: ProductVersion = {
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
    const fixtureWithPhantomFrontier: ProductVersion = {
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
    expect(points.every(({ normalizedCost }) => normalizedCost === 50)).toBe(
      true,
    );
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
    expect(solPoints[0]?.normalizedCost).toBe(100);
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

  it('uses four equal source weights and excludes model-catalog costs', () => {
    expect(COST_SOURCE_WEIGHTS).toEqual({
      'artificial-analysis': 0.25,
      livebench: 0.25,
      deepswe: 0.25,
      'frontier-code': 0.25,
    });

    const taskTemplate = productFixture.costs.find(
      ({ costType }) => costType === 'MEASURED_TASK',
    )!;
    const product = {
      ...productFixture,
      costs: [
        ...productFixture.costs,
        ...(['livebench', 'frontier-code', 'model-catalog'] as const).map(
          (sourceId, index) => ({
            ...taskTemplate,
            sourceId,
            cost: 1.5 + index,
            performance: 88.1,
            unit: 'USD_PER_TASK' as const,
          }),
        ),
      ],
    };

    const points = buildWeightedCostCurve(product);
    const sol = points.find(({ modelId }) => modelId === 'openai-gpt-5-6-sol');
    expect(sol?.sourceCount).toBe(3);
    expect(
      sol?.sourceCosts
        .map(({ sourceId, weight }) => [sourceId, weight] as const)
        .toSorted(([left], [right]) => left.localeCompare(right)),
    ).toEqual([
      ['artificial-analysis', 0.25],
      ['frontier-code', 0.25],
      ['livebench', 0.25],
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

  it('excludes advanced models missing one required source and keeps source IDs aligned', () => {
    const baseEvidence = productFixture.evidence[0]!;
    const profiles = [
      {
        ...productFixture.profiles[0]!,
        id: 'openai-gpt-5-6-sol-low',
        displayName: 'GPT-5.6 Sol · low',
        attributes: { effort: 'low', harness: null },
      },
      {
        ...productFixture.profiles[0]!,
        id: 'openai-gpt-5-6-sol-default',
        displayName: 'GPT-5.6 Sol · default',
        attributes: { effort: 'default', harness: null },
      },
      {
        ...productFixture.profiles[1]!,
        id: 'anthropic-claude-fable-5-low',
        displayName: 'Claude Fable 5 · low',
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
            : 'frontier-code-1-1';
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
            : 'frontier-code-1-1',
      evidenceIds: [`sha256:${String(index).padStart(64, '0')}`],
    });
    const modelId = 'openai-gpt-5-6-sol';
    const advancedProfiles = [
      ['openai-gpt-5-6-sol-low', 10],
      ['openai-gpt-5-6-sol-max', 30],
      ['openai-gpt-5-6-sol-default', 20],
    ] as const;
    const advancedCosts = advancedProfiles.flatMap(([profileId, cost]) =>
      ADVANCED_COST_SOURCE_IDS.map((sourceId, index) =>
        taskCost(sourceId, profileId, modelId, cost + index, index + cost),
      ),
    );
    const advancedEvidence = advancedProfiles.flatMap(([profileId, score]) =>
      ADVANCED_COST_SOURCE_IDS.flatMap((sourceId, sourceIndex) => [
        sourceEvidence(
          sourceId,
          profileId,
          modelId,
          score + sourceIndex,
          sourceIndex,
        ),
        ...(sourceId === 'artificial-analysis'
          ? [
              {
                ...sourceEvidence(
                  sourceId,
                  profileId,
                  modelId,
                  score + sourceIndex + 10,
                  sourceIndex + 10,
                ),
                id: `e3:${sourceId}:${profileId}:unrelated`,
                benchmarkId: 'aa-unrelated-benchmark',
                inclusion: 'INCLUDED' as const,
                exclusionReason: null,
                normalizedScore: score + sourceIndex + 10,
              },
            ]
          : []),
      ]),
    );
    const missingModelId = 'anthropic-claude-fable-5';
    const missingCosts = ['artificial-analysis', 'deepswe'].map(
      (sourceId, index) =>
        taskCost(
          sourceId,
          'anthropic-claude-fable-5-low',
          missingModelId,
          index + 1,
          index + 100,
        ),
    );
    const missingEvidence = missingCosts.map((cost, index) =>
      sourceEvidence(
        cost.sourceId,
        cost.profileId,
        missingModelId,
        50 + index,
        index + 100,
      ),
    );
    const product = {
      ...productFixture,
      profiles: [...productFixture.profiles, ...profiles],
      costs: [...productFixture.costs, ...advancedCosts, ...missingCosts],
      evidence: [
        ...productFixture.evidence,
        ...advancedEvidence,
        ...missingEvidence,
      ],
    };

    const series = buildAdvancedCostSeries(product);
    expect(new Set(series.map(({ modelId: id }) => id))).toEqual(
      new Set([modelId]),
    );
    expect(series.map(({ sourceId }) => sourceId)).toEqual([
      'artificial-analysis',
      'deepswe',
      'frontier-code',
    ]);
    series.forEach((line) => {
      expect(
        line.points.every(({ sourceId }) => sourceId === line.sourceId),
      ).toBe(true);
      expect(
        line.points.every(
          ({ scoreBasis, scoreBenchmarkId }) =>
            scoreBasis ===
              (line.sourceId === 'artificial-analysis'
                ? 'AA_INTELLIGENCE_INDEX'
                : line.sourceId === 'deepswe'
                  ? 'DEEPSWE_1_1'
                  : 'FRONTIER_CODE_1_1') &&
            scoreBenchmarkId ===
              (line.sourceId === 'artificial-analysis'
                ? 'artificial-analysis-intelligence-index'
                : line.sourceId === 'deepswe'
                  ? 'deepswe-1-1'
                  : 'frontier-code-1-1'),
        ),
      ).toBe(true);
      expect(line.points.map(({ effort }) => effort)).toEqual([
        'low',
        'max',
        'default',
      ]);
    });
    expect(
      series
        .find(({ sourceId }) => sourceId === 'artificial-analysis')!
        .points.find(({ effort }) => effort === 'default')?.isDefaultEffort,
    ).toBe(true);
    expect(
      series
        .find(({ sourceId }) => sourceId === 'artificial-analysis')!
        .points.map(({ score }) => score),
    ).toEqual([10, 30, 20]);
  });
});

describe('radar geometry', () => {
  it('keeps missing dimension values absent instead of plotting them at zero', () => {
    const points = buildRadarPoints(
      productFixture.leaderboard[1]!.dimensions,
      100,
      100,
      80,
    );

    expect(points[7]).toBeNull();
    expect(points.filter(Boolean)).toHaveLength(7);
  });

  it('breaks partial radar data into open segments instead of closing a polygon across N/A', () => {
    const segments = buildRadarSegments(
      productFixture.leaderboard[1]!.dimensions,
      100,
      100,
      80,
    );

    expect(segments).toHaveLength(1);
    expect(segments[0]).toHaveLength(7);
    expect(segments[0]?.[0]).not.toEqual({ x: 100, y: 100 });
  });
});
