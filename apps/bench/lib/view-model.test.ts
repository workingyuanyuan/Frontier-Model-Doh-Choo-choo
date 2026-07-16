import { describe, expect, it } from 'vitest';

import {
  filterLeaderboard,
  getEvidenceForProfile,
  getProfilesForModel,
  getRepresentativeRows,
  splitCostSeries,
} from './view-model';
import { buildRadarPoints } from './visualization';
import { productFixture } from '../test/fixture';

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

  it('finds a base model through an alternative profile name', () => {
    const rows = filterLeaderboard(productFixture, 'high effort');

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

  it('returns included and excluded evidence for the selected profile', () => {
    const rows = getEvidenceForProfile(
      productFixture,
      'openai-gpt-5-6-sol-max',
    );

    expect(rows.map(({ inclusion }) => inclusion)).toEqual([
      'INCLUDED',
      'INCLUDED',
      'EXCLUDED',
    ]);
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
