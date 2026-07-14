import type { BenchmarkDetail } from '@llm-bench/contracts';

export function selectMetricLeaders(
  detail: BenchmarkDetail,
  limit = 10,
): BenchmarkDetail['leaderboard'] {
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new Error('Leaderboard limit must be an integer from 1 to 100');
  }
  const counts = new Map<string, number>();
  return detail.leaderboard.filter((row) => {
    const seen = counts.get(row.metricSlug) ?? 0;
    if (seen >= limit) return false;
    counts.set(row.metricSlug, seen + 1);
    return true;
  });
}
