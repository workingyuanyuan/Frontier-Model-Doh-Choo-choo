import { describe, expect, it } from 'vitest';

import {
  presetForFamily,
  presetScope,
  presetScopeSentence,
} from './preset-family';

// Synthetic window of five models; m1 is ranked first. The AA family stops at
// four, so m5 is only in the coverage family's reach.
const frontier = ['m1', 'm2', 'm3', 'm4', 'm5'].map((modelId) => ({
  modelId,
  representativeProfileId: `${modelId}-max`,
  reasons: ['fixture'],
  externalCompositeScores: {},
}));
const profiles = [
  ...frontier.map(({ modelId }) => ({
    id: `${modelId}-max`,
    modelId,
    baseModelName: `Model ${modelId.slice(1)}`,
    attributes: { effort: 'max', harness: null },
  })),
  ...['m4', 'm5'].map((modelId) => ({
    id: `${modelId}-high`,
    modelId,
    baseModelName: `Model ${modelId.slice(1)}`,
    attributes: { effort: 'high', harness: null },
  })),
] as never;
const preset = (
  id: string,
  family: 'aa-frontier' | 'coverage',
  modelIds: string[],
  profileOf: (modelId: string) => string = (modelId) => `${modelId}-max`,
) => ({
  id,
  family,
  targetModelCount: modelIds.length,
  benchmarkIds: ['b'],
  leaderboard: modelIds.map((modelId) => ({
    modelId,
    profileId: profileOf(modelId),
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
  // m4 is scored at high here; its representative profile is max.
  preset('coverage-4', 'coverage', ['m1', 'm2', 'm3', 'm4'], (modelId) =>
    modelId === 'm4' ? 'm4-high' : `${modelId}-max`,
  ),
  // m5 is outside every AA preset; its representative comes from the frontier.
  preset('coverage-5', 'coverage', ['m1', 'm2', 'm3', 'm4', 'm5'], (modelId) =>
    modelId === 'm5' ? 'm5-high' : `${modelId}-max`,
  ),
];
const product = { frontier, profiles, presets };

describe('preset families', () => {
  it('names the window models a coverage preset leaves out', () => {
    const scope = presetScope(product, 'coverage-2')!;
    expect(scope).toMatchObject({
      family: 'coverage',
      windowSize: 5,
      aaWindowSize: 4,
      counterpartId: 'aa-top-2',
      sameModelsAsCounterpart: false,
    });
    expect(scope.omitted).toEqual([
      { modelId: 'm1', modelName: 'Model 1', windowRank: 1 },
      { modelId: 'm3', modelName: 'Model 3', windowRank: 3 },
      { modelId: 'm5', modelName: 'Model 5', windowRank: 5 },
    ]);
    // The sentence names only omissions from the AA top four.
    expect(presetScopeSentence(scope, 2)).toContain(
      'Not included from the AA top 4: Model 1 (#1), Model 3 (#3).',
    );
    expect(presetScopeSentence(scope, 2)).not.toContain('Model 5');
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

  it('names models a coverage preset scores at a non-representative effort', () => {
    const scope = presetScope(product, 'coverage-4')!;
    expect(scope.effortChanges).toEqual([
      {
        modelId: 'm4',
        modelName: 'Model 4',
        profileId: 'm4-high',
        effort: 'high',
        representativeProfileId: 'm4-max',
        representativeEffort: 'max',
      },
    ]);
    expect(presetScopeSentence(scope, 4)).toContain(
      'Model 4 at high (representative: max)',
    );
    expect(presetScope(product, 'coverage-2')!.effortChanges).toEqual([]);
    expect(
      presetScope(product, 'coverage-5')!.effortChanges.map(
        ({ modelId, representativeEffort }) => [modelId, representativeEffort],
      ),
    ).toEqual([['m5', 'max']]);
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
