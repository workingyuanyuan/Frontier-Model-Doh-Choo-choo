import { describe, expect, it } from 'vitest';

import {
  presetForFamily,
  presetScope,
  presetScopeSentence,
} from './preset-family';

// Synthetic window of four models; m1 is ranked first.
const frontier = ['m1', 'm2', 'm3', 'm4'].map((modelId) => ({
  modelId,
  reasons: ['fixture'],
  externalCompositeScores: {},
}));
const profiles = frontier.map(({ modelId }) => ({
  id: `${modelId}-max`,
  modelId,
  baseModelName: `Model ${modelId.slice(1)}`,
})) as never;
const preset = (
  id: string,
  family: 'aa-frontier' | 'coverage',
  modelIds: string[],
) => ({
  id,
  family,
  targetModelCount: modelIds.length,
  benchmarkIds: ['b'],
  leaderboard: modelIds.map((modelId) => ({
    modelId,
    profileId: `${modelId}-max`,
    rank: 1,
    overallScore: 50,
    dimensions: [],
    evidenceResultIds: [],
  })),
});
const presets = [
  preset('aa-top-2', 'aa-frontier', ['m1', 'm2']),
  preset('aa-top-3', 'aa-frontier', ['m1', 'm2', 'm3']),
  preset('aa-top-4', 'aa-frontier', ['m1', 'm2', 'm3', 'm4']),
  preset('coverage-2', 'coverage', ['m2', 'm4']),
  preset('coverage-4', 'coverage', ['m1', 'm2', 'm3', 'm4']),
];
const product = { frontier, profiles, presets };

describe('preset families', () => {
  it('names the window models a coverage preset leaves out', () => {
    const scope = presetScope(product, 'coverage-2')!;
    expect(scope).toMatchObject({
      family: 'coverage',
      windowSize: 4,
      counterpartId: 'aa-top-2',
      sameModelsAsCounterpart: false,
    });
    expect(scope.omitted).toEqual([
      { modelId: 'm1', modelName: 'Model 1', windowRank: 1 },
      { modelId: 'm3', modelName: 'Model 3', windowRank: 3 },
    ]);
    expect(presetScopeSentence(scope, 2)).toContain(
      'Not included: Model 1 (#1), Model 3 (#3).',
    );
  });

  it('says when a coverage preset scores the same models as its counterpart', () => {
    const scope = presetScope(product, 'coverage-4')!;
    expect(scope.sameModelsAsCounterpart).toBe(true);
    expect(presetScopeSentence(scope, 4)).toContain(
      'Same models as the AA frontier set',
    );
    expect(presetScope(product, 'aa-top-3')!.counterpartId).toBe(null);
    expect(presetScope(product, 'missing')).toBe(null);
  });

  it('keeps the model count on a family switch, else the nearest larger', () => {
    const active = (id: string) => presets.find((p) => p.id === id)!;
    expect(presetForFamily(presets, active('aa-top-2'), 'coverage')!.id).toBe(
      'coverage-2',
    );
    // Three is one away from both 2 and 4; the larger count wins.
    expect(presetForFamily(presets, active('aa-top-3'), 'coverage')!.id).toBe(
      'coverage-4',
    );
    expect(
      presetForFamily(presets, active('coverage-4'), 'aa-frontier')!.id,
    ).toBe('aa-top-4');
  });
});
