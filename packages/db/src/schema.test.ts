import { describe, expect, it } from 'vitest';
import { getTableColumns } from 'drizzle-orm';

import { benchmarkResults, schemaTables, weeklyEditions } from './index.js';

describe('database schema', () => {
  it('contains every core entity required by the product spec', () => {
    expect(schemaTables).toEqual([
      'providers',
      'model_families',
      'models',
      'model_variants',
      'model_aliases',
      'benchmarks',
      'benchmark_versions',
      'benchmark_metrics',
      'evaluation_configs',
      'sources',
      'source_snapshots',
      'ingestion_runs',
      'staged_results',
      'benchmark_results',
      'result_evidence',
      'dimensions',
      'benchmark_dimension_mappings',
      'scoring_method_versions',
      'dimension_scores',
      'overall_scores',
      'ranking_snapshots',
      'ranking_entries',
      'weekly_editions',
      'theme_presets',
      'video_jobs',
      'review_events',
      'audit_logs',
    ]);
  });

  it('gives promoted benchmark results a deterministic idempotency key', () => {
    const columns = getTableColumns(benchmarkResults);

    expect(Object.keys(columns)).toContain('publicationKey');
  });

  it('tracks one explicitly active weekly edition and its publication mode', () => {
    const columns = getTableColumns(weeklyEditions);

    expect(Object.keys(columns)).toEqual(
      expect.arrayContaining([
        'publicationMode',
        'isActive',
        'activatedAt',
        'deactivatedAt',
      ]),
    );
  });
});
