import { DIMENSION_IDS } from '@llm-bench/benchmark-data';
import { describe, expect, it } from 'vitest';

import { UI_DIMENSION_ABBREVIATIONS, UI_DIMENSION_IDS } from './ui-contract';

describe('UI dimension contract', () => {
  it('draws exactly the scored dimensions, reordered but never re-membered', () => {
    expect([...UI_DIMENSION_IDS].sort()).toEqual([...DIMENSION_IDS].sort());
  });

  it('gives every scored dimension a distinct abbreviation', () => {
    const abbreviations = DIMENSION_IDS.map(
      (dimension) => UI_DIMENSION_ABBREVIATIONS[dimension],
    );

    expect(abbreviations.every(Boolean)).toBe(true);
    expect(new Set(abbreviations).size).toBe(abbreviations.length);
  });
});
