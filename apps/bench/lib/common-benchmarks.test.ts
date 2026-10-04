import { describe, expect, it } from 'vitest';
import { productFixture } from '../test/fixture';
import { buildCommonComparison, comparisonOptions } from './common-benchmarks';
import type { ProductEvidence } from '@llm-bench/benchmark-data';

const dimensions = {
  a: 'agentic',
  b: 'coding',
  c: 'reasoning',
  d: 'knowledge',
  e: 'language',
} as const;
function fixture() {
  const profiles = [
    ['a-high', 'a'],
    ['a-low', 'a'],
    ['b-high', 'b'],
    ['c-high', 'c'],
  ].map(([id, modelId]) => ({
    ...productFixture.profiles[0]!,
    id: id!,
    modelId: modelId!,
    baseModelName: modelId!,
    displayName: id!,
  }));
  const evidence: ProductEvidence[] = profiles.flatMap((p) =>
    Object.keys(dimensions)
      .filter((b) => p.id !== 'a-low' || b === 'b')
      .map((benchmarkId, i) => ({
        ...productFixture.evidence[0]!,
        id: `${p.id}-${benchmarkId}`,
        model: { rawName: p.id, canonicalModelId: p.modelId, profileId: p.id },
        benchmarkId,
        inclusion: 'INCLUDED' as const,
        exclusionReason: null,
        normalizedScore: (p.modelId === 'a' ? 80 : 60) + i,
        rawScore: 80,
      })),
  );
  return {
    ...productFixture,
    profiles,
    evidence,
    comparisonEvidenceIds: evidence.map((e) => e.id),
  };
}

describe('common benchmark comparison', () => {
  it('renormalizes half weight for single-test dimensions and counts each design once', () => {
    const p = fixture();
    p.evidence = p.evidence.filter(
      (e) =>
        e.model.profileId === 'a-high' && ['a', 'b'].includes(e.benchmarkId),
    );
    p.evidence[0]!.normalizedScore = 100;
    p.evidence[1]!.normalizedScore = 20;
    p.evidence.push({
      ...p.evidence[1]!,
      id: 'second-coding',
      benchmarkId: 'b2',
      normalizedScore: 40,
    });
    p.comparisonEvidenceIds = p.evidence.map((e) => e.id);
    const result = buildCommonComparison(
      p,
      ['a'],
      {},
      { ...dimensions, b2: 'coding' },
    );
    expect(result.product.leaderboard[0]!.overallScore).toBeCloseTo(
      (100 * 0.5 + 30) / 1.5,
    );
    expect(result.product.leaderboard[0]!.dimensions).toHaveLength(2);
    // A second metric from the same benchmark cannot earn a full dimension weight.
    p.evidence[2]!.benchmarkId = 'b';
    p.evidence[2]!.metric = { ...p.evidence[2]!.metric, id: 'second-metric' };
    const multiMetric = buildCommonComparison(p, ['a'], {}, dimensions);
    expect(multiMetric.product.leaderboard[0]!.overallScore).toBe(65);
    expect(
      multiMetric.product.leaderboard[0]!.dimensions.find(
        (d) => d.dimension === 'coding',
      )!.componentCount,
    ).toBe(1);
  });

  it('applies exclusions and limited shares after the selected profiles intersect', () => {
    const p = {
      ...fixture(),
      benchmarkQuality: {
        reviewedAt: '2026-10-04',
        evidencePath: 'fixture',
        excludedBenchmarkIds: ['a'],
        limitedBenchmarkIds: ['c'],
        minOtherBenchmarksPerLimited: 2,
      },
    };
    const mapping = { ...dimensions, b: 'reasoning', d: 'reasoning' } as const;
    expect(
      buildCommonComparison(p, ['a', 'b'], {}, mapping).benchmarkIds,
    ).toEqual(['b', 'c', 'd', 'e']);
    p.evidence = p.evidence.filter(
      (e) => !(e.model.profileId === 'b-high' && e.benchmarkId === 'd'),
    );
    expect(
      buildCommonComparison(p, ['a', 'b'], {}, mapping).benchmarkIds,
    ).toEqual(['b', 'e']);
    expect(buildCommonComparison(p, ['a'], {}, mapping).benchmarkIds).toEqual([
      'b',
      'c',
      'd',
      'e',
    ]);
  });

  it('rebuilds five or six dimensions after empty, single and multi-model selections', () => {
    const p = fixture();
    const mapping = { ...dimensions, f: 'comprehension' } as const;
    for (const id of ['a-high', 'b-high']) {
      const row = p.evidence.find((e) => e.model.profileId === id)!;
      p.evidence.push({ ...row, id: `${id}-f`, benchmarkId: 'f' });
      p.comparisonEvidenceIds.push(`${id}-f`);
    }
    p.evidence = p.evidence.filter(
      (e) => !(e.model.profileId === 'b-high' && e.benchmarkId === 'e'),
    );
    const compare = (ids: string[]) =>
      buildCommonComparison(p, ids, {}, mapping);
    expect(compare([]).product.leaderboard).toEqual([]);
    expect(compare(['a']).product.leaderboard[0]!.dimensions).toHaveLength(6);
    expect(compare(['a', 'b']).product.leaderboard[0]!.dimensions).toHaveLength(
      5,
    );
    expect(
      compare(['a', 'b']).product.leaderboard[0]!.dimensions.some(
        (d) => d.dimension === 'language',
      ),
    ).toBe(false);
    expect(compare(['a']).product.leaderboard[0]!.dimensions).toHaveLength(6);
  });

  it('includes FrontierSWE V2 only when every selected profile carries its measurement', () => {
    const p = fixture();
    const extendedDimensions = {
      ...dimensions,
      'frontier-swe-v2': 'coding' as const,
    };
    for (const profileId of ['a-high', 'b-high']) {
      const first = p.evidence.find((e) => e.model.profileId === profileId)!;
      const id = `${profileId}-frontier-swe-v2`;
      p.evidence.push({
        ...first,
        id,
        sourceId: 'frontier-swe',
        benchmarkId: 'frontier-swe-v2',
        normalizedScore: profileId === 'a-high' ? 20 : 40,
      });
      p.comparisonEvidenceIds.push(id);
    }
    const presetRows = structuredClone(p.presets);
    const compared = buildCommonComparison(
      p,
      ['a', 'b'],
      { a: 'a-high', b: 'b-high' },
      extendedDimensions,
    );
    expect(compared.benchmarkIds).toContain('frontier-swe-v2');
    expect(
      compared.evidence.filter((e) => e.benchmarkId === 'frontier-swe-v2'),
    ).toHaveLength(2);
    expect(
      compared.product.leaderboard
        .find((r) => r.modelId === 'a')!
        .dimensions.find((d) => d.dimension === 'coding')!.score,
    ).toBe(50.5);
    expect(
      buildCommonComparison(
        p,
        ['a', 'b'],
        { a: 'a-low', b: 'b-high' },
        extendedDimensions,
      ).benchmarkIds,
    ).not.toContain('frontier-swe-v2');
    expect(compared.product.presets).toEqual(presetRows);
  });

  it('compares two efforts of the same model on their intersection', () => {
    const p = fixture();
    const result = buildCommonComparison(
      p,
      ['a'],
      { a: 'a-high' },
      dimensions,
      undefined,
      ['a-low'],
    );
    expect(result.profiles.map((profile) => profile.id)).toEqual([
      'a-high',
      'a-low',
    ]);
    expect(result.benchmarkIds).toEqual(['b']);
    expect(result.product.leaderboard).toHaveLength(2);
    expect(
      result.product.leaderboard.every(
        (row) => row.evidenceResultIds.length === 1,
      ),
    ).toBe(true);
  });
  it('deduplicates pinned profiles and omits pins from deselected models', () => {
    const p = fixture();
    const result = buildCommonComparison(
      p,
      ['a'],
      { a: 'a-high' },
      dimensions,
      undefined,
      ['a-high', 'a-low', 'a-low', 'b-high', 'unknown'],
    );
    expect(result.profiles.map((profile) => profile.id)).toEqual([
      'a-high',
      'a-low',
    ]);
    expect(
      buildCommonComparison(p, [], {}, dimensions, undefined, ['a-low'])
        .profiles,
    ).toEqual([]);
  });
  it('uses the same complete basis, arithmetic means and relative ranks', () => {
    const result = buildCommonComparison(fixture(), ['a', 'b'], {}, dimensions);
    expect(result.benchmarkIds).toEqual(['a', 'b', 'c', 'd', 'e']);
    expect(
      result.product.leaderboard.map((r) => [
        r.profileId,
        r.overallScore,
        r.rank,
      ]),
    ).toEqual([
      ['a-high', 82, 1],
      ['b-high', 62, 2],
    ]);
    expect(
      result.product.leaderboard.every((r) => r.evidenceResultIds.length === 5),
    ).toBe(true);
  });
  it('scores the remaining active dimension after a profile change', () => {
    const result = buildCommonComparison(
      fixture(),
      ['a', 'b'],
      { a: 'a-low' },
      dimensions,
    );
    expect(result.benchmarkIds).toEqual(['b']);
    expect(
      result.product.leaderboard.every(
        (r) =>
          r.overallScore !== null &&
          r.rank !== null &&
          r.dimensions.length === 1,
      ),
    ).toBe(true);
    expect(
      result.product.leaderboard
        .find((r) => r.modelId === 'a')
        ?.dimensions.find((d) => d.dimension === 'coding')?.score,
    ).toBe(80);
  });
  it('keeps zero scores, omits losing duplicates, excluded, null and unmapped measurements', () => {
    const p = fixture();
    const first = p.evidence[0]!;
    first.normalizedScore = 0;
    p.evidence.push(
      { ...first, id: 'losing-duplicate', normalizedScore: 99 },
      {
        ...first,
        id: 'excluded',
        benchmarkId: 'excluded',
        inclusion: 'EXCLUDED',
        normalizedScore: 100,
      },
      { ...first, id: 'unmapped', benchmarkId: 'unmapped' },
    );
    p.comparisonEvidenceIds.push('excluded', 'unmapped');
    const result = buildCommonComparison(p, ['a', 'b'], {}, dimensions);
    expect(
      result.evidence.find((e) => e.id === first.id)?.normalizedScore,
    ).toBe(0);
    expect(
      result.evidence.some((e) =>
        ['losing-duplicate', 'excluded', 'unmapped'].includes(e.id),
      ),
    ).toBe(false);
    first.normalizedScore = null;
    expect(
      buildCommonComparison(p, ['a', 'b'], { a: 'a-high' }, dimensions)
        .benchmarkIds,
    ).not.toContain('a');
  });
  it('supports empty, single, duplicate, and three-model selections without combining profiles', () => {
    const p = fixture();
    expect(
      buildCommonComparison(p, [], {}, dimensions).product.leaderboard,
    ).toEqual([]);
    expect(
      buildCommonComparison(p, ['a', 'a'], {}, dimensions).profiles,
    ).toHaveLength(1);
    p.evidence = p.evidence.filter(
      (e) => e.model.profileId !== 'c-high' || e.benchmarkId === 'a',
    );
    expect(
      buildCommonComparison(p, ['a', 'b', 'c'], {}, dimensions).benchmarkIds,
    ).toEqual(['a']);
    const none = buildCommonComparison(
      p,
      ['a', 'c'],
      { a: 'a-low' },
      dimensions,
    );
    expect(none.benchmarkIds).toEqual([]);
    expect(none.product.leaderboard).toHaveLength(2);
    expect(
      none.product.leaderboard[0]?.dimensions.every((d) => d.score === null),
    ).toBe(true);
  });
  it('offers models outside presets and keeps default profiles stable', () => {
    const p = fixture();
    const options = comparisonOptions(p, dimensions);
    expect(options.map((r) => r.modelId)).toEqual(['a', 'b', 'c']);
    expect(options.find((r) => r.modelId === 'a')?.profileId).toBe('a-high');
    const result = buildCommonComparison(p, ['a'], { a: 'b-high' }, dimensions);
    expect(result.profiles[0]?.id).toBe('a-high');
  });
  it('matches by benchmark ID despite version labels, and rejects incompatible metrics', () => {
    const p = fixture();
    const b = p.evidence.find((e) => e.id === 'b-high-a')!;
    b.benchmarkVersion = 'a different source label';
    expect(
      buildCommonComparison(p, ['a', 'b'], {}, dimensions).benchmarkIds,
    ).toContain('a');
    b.metric = { ...b.metric, id: 'different-metric' };
    expect(
      buildCommonComparison(p, ['a', 'b'], {}, dimensions).benchmarkIds,
    ).not.toContain('a');
  });
  it('only uses explicitly selected evidence in legacy snapshots', () => {
    const p = fixture();
    delete (p as { comparisonEvidenceIds?: string[] }).comparisonEvidenceIds;
    expect(
      buildCommonComparison(p, ['a', 'b'], {}, dimensions).benchmarkIds,
    ).toEqual([]);
  });
});
