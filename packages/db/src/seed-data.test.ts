import { describe, expect, it } from 'vitest';

import { dimensionSeed, themePresetSeed } from './seed-data.js';

describe('database seed data', () => {
  it('preserves the canonical eight-axis order', () => {
    expect(dimensionSeed.map(({ id }) => id)).toEqual([
      'reasoning',
      'math',
      'knowledge',
      'language',
      'instruction',
      'coding',
      'agentic',
      'context',
    ]);
    expect(dimensionSeed.map(({ displayOrder }) => displayOrder)).toEqual([
      0, 1, 2, 3, 4, 5, 6, 7,
    ]);
  });

  it('ships only all-light presets with one shared geometry version', () => {
    expect(themePresetSeed.map(({ slug }) => slug)).toEqual([
      'editorial-light',
      'studio-light',
    ]);
    expect(
      new Set(themePresetSeed.map(({ geometryVersion }) => geometryVersion)),
    ).toEqual(new Set(['radar-v1']));
    expect(
      themePresetSeed.every(({ tokens }) => tokens.colorScheme === 'light'),
    ).toBe(true);
  });
});
