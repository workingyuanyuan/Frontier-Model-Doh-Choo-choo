import { describe, expect, it } from 'vitest';

import {
  initialSelection,
  selectionReducer,
  type SelectionContext,
  type SelectionState,
} from './dashboard-selection';

const context: SelectionContext = {
  defaultModelIds: ['a', 'b'],
  representativeProfiles: { a: 'a-high', b: 'b-high' },
  profileModelIds: new Map([
    ['a-high', 'a'],
    ['a-low', 'a'],
    ['b-high', 'b'],
    ['c-high', 'c'],
  ]),
};
const optionIds = new Set(['a', 'b', 'c']);
const ready: SelectionState = {
  ...initialSelection('base'),
  hydration: { phase: 'ready' },
};

describe('dashboard selection', () => {
  it('starts a custom comparison from the preset and drops it on a preset change', () => {
    const pinned = selectionReducer(ready, {
      type: 'pinProfile',
      modelId: 'a',
      profileId: 'a-high',
      context,
    });
    expect(pinned.comparison).toEqual({
      mode: 'custom',
      modelIds: ['a', 'b'],
      efforts: { a: 'a-low', b: 'b-high' },
      pins: ['a-high'],
    });
    // The only other effort is now the model's own, so nothing is left to pin.
    expect(
      selectionReducer(pinned, {
        type: 'pinProfile',
        modelId: 'a',
        profileId: 'a-low',
        context,
      }),
    ).toBe(pinned);
    const withoutA = selectionReducer(pinned, {
      type: 'setModels',
      update: (ids) => ids.filter((id) => id !== 'a'),
      context,
    });
    expect(withoutA.comparison).toMatchObject({ modelIds: ['b'], pins: [] });
    expect(
      selectionReducer(withoutA, { type: 'selectPreset', presetId: 'other' }),
    ).toEqual({ ...ready, presetId: 'other' });
  });

  it('reads the URL once and restores a comparison on the preset in effect', () => {
    const shared = {
      models: ['a', 'a', 'zzz', 'c'],
      efforts: ['a-low', 'b-high'],
      pins: ['a-high', 'a-low', 'b-high'],
    };
    const restoring = selectionReducer(initialSelection('opened'), {
      type: 'hydrate',
      presetId: null,
      comparison: shared,
    });
    expect(restoring.presetId).toBe('opened');
    expect(
      selectionReducer(restoring, {
        type: 'hydrate',
        presetId: 'other',
        comparison: null,
      }),
    ).toBe(restoring);
    const restored = selectionReducer(restoring, {
      type: 'restoreComparison',
      optionIds,
      context,
    });
    expect(restored).toEqual({
      presetId: 'opened',
      hydration: { phase: 'ready' },
      comparison: {
        mode: 'custom',
        modelIds: ['a', 'c'],
        efforts: { a: 'a-low', b: 'b-high' },
        pins: ['a-high'],
      },
    });
  });

  it('keeps a visible effort and prunes pins when a chart shortlist is applied', () => {
    const custom: SelectionState = {
      ...ready,
      comparison: {
        mode: 'custom',
        modelIds: ['a', 'b'],
        efforts: { a: 'a-low', b: 'b-high' },
        pins: ['a-high', 'b-high'],
      },
    };
    const next = selectionReducer(custom, {
      type: 'applyShortlist',
      models: [
        { modelId: 'a', profileIds: ['a-high', 'a-low'] },
        { modelId: 'c', profileIds: ['c-high'] },
        { modelId: 'unknown', profileIds: ['x'] },
      ],
      optionIds,
      coverage: new Map([['c-high', 3]]),
      context,
    });
    expect(next.comparison).toEqual({
      mode: 'custom',
      modelIds: ['a', 'c'],
      efforts: { a: 'a-low', b: 'b-high', c: 'c-high' },
      pins: ['a-high'],
    });
  });
});
