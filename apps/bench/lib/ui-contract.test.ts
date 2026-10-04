import { CATALOG_DIMENSION_IDS } from '@llm-bench/benchmark-data';
import { describe, expect, it } from 'vitest';

import {
  getActiveDimensionIds,
  UI_DIMENSION_ABBREVIATIONS,
  UI_DIMENSION_IDS,
} from './ui-contract';

describe('UI dimension contract', () => {
  it('draws exactly the scored dimensions, reordered but never re-membered', () => {
    expect([...UI_DIMENSION_IDS].sort()).toEqual(
      [...CATALOG_DIMENSION_IDS].sort(),
    );
  });

  it('gives every scored dimension a distinct abbreviation', () => {
    const abbreviations = CATALOG_DIMENSION_IDS.map(
      (dimension) => UI_DIMENSION_ABBREVIATIONS[dimension],
    );

    expect(abbreviations.every(Boolean)).toBe(true);
    expect(new Set(abbreviations).size).toBe(abbreviations.length);
  });

  it('selects scored dimensions in UI order including comprehension and zero scores', () => {
    expect(
      getActiveDimensionIds([
        {
          dimensions: [
            { dimension: 'language', score: null, componentCount: 0 },
            { dimension: 'comprehension', score: 0, componentCount: 1 },
            { dimension: 'coding', score: 72, componentCount: 2 },
            { dimension: 'reasoning', score: null, componentCount: 1 },
          ],
        },
      ]),
    ).toEqual(['coding', 'comprehension']);
    expect(getActiveDimensionIds([])).toEqual([]);
  });
});
