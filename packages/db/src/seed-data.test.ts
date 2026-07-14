import { describe, expect, it } from 'vitest';

import {
  dimensionSeed,
  liveBenchBenchmarkSeed,
  liveBenchDimensionMappingSeeds,
  liveBenchEvaluationConfigSeed,
  liveBenchMetricSeeds,
  scoringMethodSeed,
  themePresetSeed,
} from './seed-data.js';

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

  it('pins all 18 LiveBench release tasks with fixed percentage anchors', () => {
    expect(liveBenchBenchmarkSeed.version).toBe('2024-11-25');
    expect(liveBenchBenchmarkSeed.inventoryObservationCount).toBe(1_000);
    expect(liveBenchMetricSeeds).toHaveLength(18);
    expect(new Set(liveBenchMetricSeeds.map(({ slug }) => slug)).size).toBe(18);
    expect(
      liveBenchMetricSeeds.reduce(
        (sum, metric) => sum + metric.expectedObservations,
        0,
      ),
    ).toBe(1_000);
    expect(
      liveBenchMetricSeeds.every(
        ({ unit, higherIsBetter, theoreticalMin, theoreticalMax }) =>
          unit === 'PERCENT' &&
          higherIsBetter &&
          theoreticalMin === '0' &&
          theoreticalMax === '100',
      ),
    ).toBe(true);
    expect(liveBenchEvaluationConfigSeed.configHash).toMatch(/^[a-f0-9]{64}$/u);
  });

  it('maps only source-supported dimensions without double counting', () => {
    const dimensionWeights = new Map<string, number[]>();
    for (const { dimensionId, weight } of liveBenchDimensionMappingSeeds) {
      const weights = dimensionWeights.get(dimensionId) ?? [];
      weights.push(weight);
      dimensionWeights.set(dimensionId, weights);
    }

    expect([...dimensionWeights.keys()].sort()).toEqual([
      'coding',
      'instruction',
      'language',
      'math',
      'reasoning',
    ]);
    for (const weights of dimensionWeights.values()) {
      expect(
        weights.every((weight) => Number.isInteger(weight * 1_000_000)),
      ).toBe(true);
      expect(
        weights.reduce(
          (sum, weight) => sum + Math.round(weight * 1_000_000),
          0,
        ),
      ).toBe(1_000_000);
    }
    expect(
      liveBenchDimensionMappingSeeds.every(
        ({ normalization, mapping }) =>
          normalization.method === 'FIXED_PERCENTAGE_V1' &&
          normalization.lowerAnchor === 0 &&
          normalization.upperAnchor === 100 &&
          mapping.primaryDimension === true &&
          mapping.rationale.length > 20,
      ),
    ).toBe(true);
  });

  it('keeps the scoring method equal-weight and draft until formal gates pass', () => {
    expect(scoringMethodSeed.version).toBe('absolute-capability-v1');
    expect(scoringMethodSeed.status).toBe('DRAFT');
    expect(scoringMethodSeed.config.dimensionWeights).toEqual(
      Object.fromEntries(dimensionSeed.map(({ id }) => [id, 0.125])),
    );
    expect(scoringMethodSeed.config.formalPublicationEnabled).toBe(false);
  });
});
