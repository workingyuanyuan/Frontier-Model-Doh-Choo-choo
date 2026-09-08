import { describe, expect, it } from 'vitest';
import {
  BenchmarkDimensionMappingSchema,
  BenchmarkQualityPolicySchema,
  DisplaySetSchema,
  validateDisplaySet,
} from './index.js';
import mappingJson from '../../../data/mappings/benchmarks.json';
import displayJson from '../../../data/mappings/display-set.json';
import policyJson from '../../../data/mappings/display-set-policy.json';

describe('benchmark quality policy validation', () => {
  const mapping = BenchmarkDimensionMappingSchema.parse(mappingJson);
  const quality = BenchmarkQualityPolicySchema.parse(
    policyJson.benchmarkQuality,
  );
  it('accepts every generated preset under the reviewed cap', () => {
    expect(() =>
      validateDisplaySet(DisplaySetSchema.parse(displayJson), mapping, quality),
    ).not.toThrow();
  });
  it('rejects stale sets with an excluded benchmark', () => {
    const display = DisplaySetSchema.parse(displayJson);
    display.presets[0]!.benchmarkIds.push('aime');
    expect(() => validateDisplaySet(display, mapping, quality)).toThrow(
      /quality-excluded/,
    );
  });
  it('rejects a set whose dimension consists only of limited benchmarks', () => {
    const display = DisplaySetSchema.parse(displayJson);
    display.presets[0]!.benchmarkIds = display.presets[0]!.benchmarkIds.filter(
      (id) =>
        mapping.benchmarks.find((b) => b.id === id)!.primaryDimension !==
        'knowledge',
    );
    display.presets[0]!.benchmarkIds.push('mmlu-pro');
    expect(() => validateDisplaySet(display, mapping, quality)).toThrow(
      /quality share in knowledge/,
    );
  });
  it('rejects overlapping policy IDs and invalid ratio settings', () => {
    expect(() =>
      BenchmarkQualityPolicySchema.parse({
        ...quality,
        limitedBenchmarkIds: ['aime'],
      }),
    ).toThrow(/unique and disjoint/);
    expect(() =>
      BenchmarkQualityPolicySchema.parse({
        ...quality,
        minOtherBenchmarksPerLimited: 0,
      }),
    ).toThrow();
    expect(() =>
      validateDisplaySet(DisplaySetSchema.parse(displayJson), mapping, {
        ...quality,
        limitedBenchmarkIds: ['typo'],
      }),
    ).toThrow(/Unknown quality benchmark/);
  });
});
