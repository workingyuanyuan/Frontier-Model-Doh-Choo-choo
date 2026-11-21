import { describe, expect, it } from 'vitest';
import {
  BenchmarkDimensionMappingSchema,
  BenchmarkQualityPolicySchema,
  CATALOG_DIMENSION_IDS,
  DisplaySetSchema,
  validateDisplaySet,
} from './index.js';

// Three knowledge benchmarks (one limited, one excluded) and one per other
// dimension, so each case fails for the single reason it is about.
const mapping = BenchmarkDimensionMappingSchema.parse({
  schemaVersion: 'benchmark-dimensions-v2',
  dimensions: [...CATALOG_DIMENSION_IDS],
  benchmarks: [
    ...[
      'knowledge-a',
      'knowledge-b',
      'knowledge-limited',
      'knowledge-excluded',
    ].map((id) => ({
      id,
      primaryDimension: 'knowledge',
      secondaryDimensions: [],
    })),
    ...CATALOG_DIMENSION_IDS.filter(
      (dimension) => dimension !== 'knowledge',
    ).map((dimension) => ({
      id: `${dimension}-a`,
      primaryDimension: dimension,
      secondaryDimensions: [],
    })),
  ],
});
const quality = BenchmarkQualityPolicySchema.parse({
  reviewedAt: '2026-01-01',
  evidencePath: 'fixture',
  excludedBenchmarkIds: ['knowledge-excluded'],
  limitedBenchmarkIds: ['knowledge-limited'],
  minOtherBenchmarksPerLimited: 2,
});
const display = (benchmarkIds: string[]) =>
  DisplaySetSchema.parse({
    schemaVersion: 'display-set-v2',
    defaultPresetId: 'fixture',
    presets: [
      {
        id: 'fixture',
        targetModelCount: 2,
        family: 'aa-frontier' as const,
        benchmarkIds,
      },
    ],
  });
const balanced = [
  'knowledge-a',
  'knowledge-b',
  'knowledge-limited',
  'coding-a',
];

describe('benchmark quality policy validation', () => {
  it('accepts a preset within the limited-benchmark share', () => {
    expect(() =>
      validateDisplaySet(display(balanced), mapping, quality),
    ).not.toThrow();
  });
  it('rejects a preset with an excluded benchmark', () => {
    expect(() =>
      validateDisplaySet(
        display([...balanced, 'knowledge-excluded']),
        mapping,
        quality,
      ),
    ).toThrow(/quality-excluded/);
  });
  it('rejects a dimension with too few other benchmarks per limited one', () => {
    expect(() =>
      validateDisplaySet(
        display(['knowledge-a', 'knowledge-limited', 'coding-a']),
        mapping,
        quality,
      ),
    ).toThrow(/quality share in knowledge/);
  });
  it('rejects overlapping policy IDs and invalid ratio settings', () => {
    expect(() =>
      BenchmarkQualityPolicySchema.parse({
        ...quality,
        limitedBenchmarkIds: ['knowledge-excluded'],
      }),
    ).toThrow(/unique and disjoint/);
    expect(() =>
      BenchmarkQualityPolicySchema.parse({
        ...quality,
        minOtherBenchmarksPerLimited: 0,
      }),
    ).toThrow();
    expect(() =>
      validateDisplaySet(display(balanced), mapping, {
        ...quality,
        limitedBenchmarkIds: ['typo'],
      }),
    ).toThrow(/Unknown quality benchmark/);
  });
});
