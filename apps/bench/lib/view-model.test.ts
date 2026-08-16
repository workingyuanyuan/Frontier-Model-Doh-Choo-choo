import { describe, expect, it } from 'vitest';

import {
  filterLeaderboard,
  getDataScopeSummary,
  getEvidenceForProfile,
  getProfileDisplayName,
  getProfileIdentity,
  getProfilesForModel,
  getRepresentativeRows,
  resolveActiveProfile,
  splitCostSeries,
  buildWeightedCostCurve,
  getCostParetoFrontier,
} from './view-model';
import { buildRadarPoints } from './visualization';
import { productFixture } from '../test/fixture';

type FixtureLeaderboardRow = (typeof productFixture.leaderboard)[number];

const representativeCandidate = ({
  profileId,
  coverage,
  resultCount,
  overallScore,
  rank,
}: {
  profileId: string;
  coverage: number;
  resultCount: number;
  overallScore: number;
  rank: number;
}): FixtureLeaderboardRow => ({
  modelId: 'test-model',
  profileId,
  rank,
  overallScore,
  status: 'ESTIMATED',
  dimensions: productFixture.leaderboard[0]!.dimensions.map(
    ({ dimension }, index) => ({
      dimension,
      score: index < coverage ? 50 + index : null,
      componentCount: index < coverage ? 1 : 0,
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
      'google-gemini-3-1-pro-high',
      'anthropic-claude-fable-5-standard',
    ]);
    expect(rows.map(({ rank }) => rank)).toEqual([1, 2, 3]);
  });

  it('orders the leaderboard by coverage, then Overall Score', () => {
    const moreComplete = {
      ...representativeCandidate({
        profileId: 'model-complete',
        coverage: 8,
        resultCount: 8,
        overallScore: 40,
        rank: 3,
      }),
      modelId: 'model-complete',
    };
    const higherScore = {
      ...representativeCandidate({
        profileId: 'model-higher-score',
        coverage: 7,
        resultCount: 7,
        overallScore: 99,
        rank: 1,
      }),
      modelId: 'model-higher-score',
    };

    expect(
      getRepresentativeRows({
        ...productFixture,
        leaderboard: [higherScore, moreComplete],
      }).map(({ profileId }) => profileId),
    ).toEqual(['model-complete', 'model-higher-score']);
  });

  it('prefers the profile with greater dimension coverage', () => {
    expect(
      selectRepresentativeProfileId([
        representativeCandidate({
          profileId: 'test-model-high-score',
          coverage: 6,
          resultCount: 12,
          overallScore: 99,
          rank: 1,
        }),
        representativeCandidate({
          profileId: 'test-model-high-coverage',
          coverage: 7,
          resultCount: 7,
          overallScore: 50,
          rank: 2,
        }),
      ]),
    ).toBe('test-model-high-coverage');
  });

  it('prefers more effective Benchmark Results when coverage is equal', () => {
    expect(
      selectRepresentativeProfileId([
        representativeCandidate({
          profileId: 'test-model-high-score',
          coverage: 7,
          resultCount: 7,
          overallScore: 99,
          rank: 1,
        }),
        representativeCandidate({
          profileId: 'test-model-more-results',
          coverage: 7,
          resultCount: 8,
          overallScore: 50,
          rank: 2,
        }),
      ]),
    ).toBe('test-model-more-results');
  });

  it('prefers the higher Overall Score when coverage and result count are equal', () => {
    expect(
      selectRepresentativeProfileId([
        representativeCandidate({
          profileId: 'test-model-lower-score',
          coverage: 7,
          resultCount: 8,
          overallScore: 50,
          rank: 1,
        }),
        representativeCandidate({
          profileId: 'test-model-higher-score',
          coverage: 7,
          resultCount: 8,
          overallScore: 60,
          rank: 2,
        }),
      ]),
    ).toBe('test-model-higher-score');
  });

  it('uses profileId ascending as the final deterministic tie-break', () => {
    expect(
      selectRepresentativeProfileId([
        representativeCandidate({
          profileId: 'test-model-z',
          coverage: 7,
          resultCount: 8,
          overallScore: 60,
          rank: 1,
        }),
        representativeCandidate({
          profileId: 'test-model-a',
          coverage: 7,
          resultCount: 8,
          overallScore: 60,
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
    ).toBe('max');
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
});
