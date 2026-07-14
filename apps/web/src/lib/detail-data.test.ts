import { describe, expect, it } from 'vitest';

import type { BenchmarkDetail } from '@llm-bench/contracts';

import { selectMetricLeaders } from './detail-data';

const detail = {
  leaderboard: [
    { metricSlug: 'a', modelSlug: 'one' },
    { metricSlug: 'a', modelSlug: 'two' },
    { metricSlug: 'b', modelSlug: 'three' },
    { metricSlug: 'b', modelSlug: 'four' },
  ],
} as BenchmarkDetail;

describe('benchmark detail view', () => {
  it('keeps deterministic source order while limiting each metric', () => {
    expect(selectMetricLeaders(detail, 1).map((row) => row.modelSlug)).toEqual([
      'one',
      'three',
    ]);
  });

  it('rejects unbounded or invalid limits', () => {
    expect(() => selectMetricLeaders(detail, 101)).toThrow('1 to 100');
  });
});
