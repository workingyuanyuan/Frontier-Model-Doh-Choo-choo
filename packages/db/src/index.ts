export * from './schema/index.js';
export * from './seed-data.js';
export * from './ranking-repository.js';
export * from './data-status-repository.js';
export * from './detail-repository.js';
export { createDatabase, type Database } from './client.js';
export { getDatabaseUrl } from './database-url.js';

export const schemaTables = [
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
] as const;
