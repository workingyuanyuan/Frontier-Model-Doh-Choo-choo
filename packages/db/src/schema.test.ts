import { describe, expect, it } from 'vitest';

import { schemaTables } from './index.js';

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
});
