import { describe, expect, it } from 'vitest';

import {
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
  resolveActiveProfile,
  splitCostSeries,
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

  it('never resolves a stale profile from another base model', () => {
    const profile = resolveActiveProfile(
      productFixture,
      'openai-gpt-5-6-sol',
      'anthropic-claude-fable-5-standard',
      'openai-gpt-5-6-sol-max',
    );

    expect(profile?.id).toBe('openai-gpt-5-6-sol-max');
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
          evidenceIds: [],
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
    expect(solPoints[0]?.normalizedCost).toBe(50);
  });

  it('does not emit non-representative profile cost points even when representative has no cost data', () => {
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
            evidenceIds: [],
          },
        ]),
    };
    const reps = getRepresentativeRows(productWithoutRepCost);
    const solRep = reps.find((r) => r.modelId === 'openai-gpt-5-6-sol');
    expect(solRep?.profileId).toBe('openai-gpt-5-6-sol-max');

    const points = buildWeightedCostCurve(productWithoutRepCost);
    const solPoints = points.filter((p) => p.modelId === 'openai-gpt-5-6-sol');
    expect(solPoints).toHaveLength(0);
  });

  it('guarantees leaderboard and cost curve defaults cannot diverge from getRepresentativeRows', () => {
    const reps = getRepresentativeRows(productFixture);
    const repByModel = new Map(reps.map((r) => [r.modelId, r.profileId]));

    const costPoints = buildWeightedCostCurve(productFixture);
    costPoints.forEach((point) => {
      expect(point.profileId).toBe(repByModel.get(point.modelId));
    });
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
