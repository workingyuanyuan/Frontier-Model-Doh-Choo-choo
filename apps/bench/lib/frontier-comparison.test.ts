import { describe, expect, it } from 'vitest';
import { loadProductVersion } from './load-product-version';
import { withActivePreset } from './view-model';
import { buildCommonComparison } from './common-benchmarks';

// Language retention and quality exclusions are covered synthetically in
// common-benchmarks.test.ts; this file checks only the published default.
describe('published frontier comparison', () => {
  it('reproduces the published default from the same selected profiles', () => {
    const { product: raw, benchmarkDimensions } = loadProductVersion();
    const product = withActivePreset(raw);
    const selected = Object.fromEntries(
      product.leaderboard.map((row) => [row.modelId, row.profileId]),
    );
    const comparison = buildCommonComparison(
      product,
      Object.keys(selected),
      selected,
      benchmarkDimensions,
    );
    expect(product.activePreset.id).toBe(product.defaultPresetId);
    expect(comparison.benchmarkIds).toEqual(
      [...product.activePreset.benchmarkIds].sort(),
    );
    for (const id of product.benchmarkQuality!.excludedBenchmarkIds)
      expect(comparison.benchmarkIds).not.toContain(id);
    expect(comparison.product.leaderboard.map((row) => row.profileId)).toEqual(
      product.leaderboard.map((row) => row.profileId),
    );
    for (const expected of product.leaderboard) {
      const actual = comparison.product.leaderboard.find(
        (row) => row.profileId === expected.profileId,
      )!;
      expect(actual.overallScore).toBeCloseTo(expected.overallScore!, 10);
      expect(actual.evidenceResultIds).toEqual(expected.evidenceResultIds);
      expect(actual.dimensions).toHaveLength(expected.dimensions.length);
      for (const dimension of expected.dimensions) {
        const scored = actual.dimensions.find(
          (d) => d.dimension === dimension.dimension,
        )!;
        expect(scored.componentCount).toBe(dimension.componentCount);
        expect(scored.score).toBeCloseTo(dimension.score!, 10);
      }
    }
    expect(
      buildCommonComparison(product, [], {}, benchmarkDimensions).product
        .leaderboard,
    ).toEqual([]);
  });
});
