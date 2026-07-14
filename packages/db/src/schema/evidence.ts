import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

import { modelVariants } from './identity.js';

const id = () =>
  uuid('id')
    .primaryKey()
    .default(sql`uuidv7()`);
const createdAt = () =>
  timestamp('created_at', { withTimezone: true }).notNull().defaultNow();

export const benchmarks = pgTable(
  'benchmarks',
  {
    id: id(),
    slug: text('slug').notNull(),
    displayName: text('display_name').notNull(),
    homepageUrl: text('homepage_url'),
    licenseSpdx: text('license_spdx'),
    description: text('description'),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: createdAt(),
  },
  (table) => [uniqueIndex('benchmarks_slug_uidx').on(table.slug)],
);

export const benchmarkVersions = pgTable(
  'benchmark_versions',
  {
    id: id(),
    benchmarkId: uuid('benchmark_id')
      .notNull()
      .references(() => benchmarks.id, { onDelete: 'restrict' }),
    version: text('version').notNull(),
    releasedAt: timestamp('released_at', { withTimezone: true }),
    methodologyUrl: text('methodology_url'),
    config: jsonb('config').notNull().default({}),
    createdAt: createdAt(),
  },
  (table) => [
    uniqueIndex('benchmark_versions_benchmark_version_uidx').on(
      table.benchmarkId,
      table.version,
    ),
  ],
);

export const benchmarkMetrics = pgTable(
  'benchmark_metrics',
  {
    id: id(),
    benchmarkVersionId: uuid('benchmark_version_id')
      .notNull()
      .references(() => benchmarkVersions.id, { onDelete: 'cascade' }),
    slug: text('slug').notNull(),
    displayName: text('display_name').notNull(),
    unit: text('unit').notNull(),
    higherIsBetter: boolean('higher_is_better').notNull().default(true),
    theoreticalMin: numeric('theoretical_min', { precision: 16, scale: 6 }),
    theoreticalMax: numeric('theoretical_max', { precision: 16, scale: 6 }),
    createdAt: createdAt(),
  },
  (table) => [
    uniqueIndex('benchmark_metrics_version_slug_uidx').on(
      table.benchmarkVersionId,
      table.slug,
    ),
  ],
);

export const evaluationConfigs = pgTable(
  'evaluation_configs',
  {
    id: id(),
    benchmarkVersionId: uuid('benchmark_version_id')
      .notNull()
      .references(() => benchmarkVersions.id, { onDelete: 'restrict' }),
    configHash: text('config_hash').notNull(),
    displayName: text('display_name').notNull(),
    evaluator: text('evaluator'),
    config: jsonb('config').notNull(),
    createdAt: createdAt(),
  },
  (table) => [uniqueIndex('evaluation_configs_hash_uidx').on(table.configHash)],
);

export const sources = pgTable(
  'sources',
  {
    id: id(),
    slug: text('slug').notNull(),
    displayName: text('display_name').notNull(),
    sourceType: text('source_type').notNull(),
    baseUrl: text('base_url'),
    trustTier: text('trust_tier').notNull(),
    licenseSpdx: text('license_spdx'),
    termsUrl: text('terms_url'),
    isEnabled: boolean('is_enabled').notNull().default(true),
    metadata: jsonb('metadata').notNull().default({}),
    createdAt: createdAt(),
  },
  (table) => [uniqueIndex('sources_slug_uidx').on(table.slug)],
);

export const sourceSnapshots = pgTable(
  'source_snapshots',
  {
    id: id(),
    sourceId: uuid('source_id')
      .notNull()
      .references(() => sources.id, { onDelete: 'restrict' }),
    fetchedAt: timestamp('fetched_at', { withTimezone: true }).notNull(),
    requestUrl: text('request_url').notNull(),
    responseStatus: integer('response_status'),
    contentSha256: text('content_sha256').notNull(),
    contentType: text('content_type'),
    storagePath: text('storage_path').notNull(),
    byteLength: integer('byte_length').notNull(),
    metadata: jsonb('metadata').notNull().default({}),
    createdAt: createdAt(),
  },
  (table) => [
    uniqueIndex('source_snapshots_source_hash_uidx').on(
      table.sourceId,
      table.contentSha256,
    ),
    index('source_snapshots_fetched_idx').on(table.fetchedAt),
    check('source_snapshots_byte_length_check', sql`${table.byteLength} >= 0`),
  ],
);

export const ingestionRuns = pgTable(
  'ingestion_runs',
  {
    id: id(),
    sourceId: uuid('source_id')
      .notNull()
      .references(() => sources.id, { onDelete: 'restrict' }),
    startedAt: timestamp('started_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    status: text('status').notNull(),
    connectorVersion: text('connector_version').notNull(),
    recordsSeen: integer('records_seen').notNull().default(0),
    recordsAccepted: integer('records_accepted').notNull().default(0),
    errorSummary: text('error_summary'),
    metadata: jsonb('metadata').notNull().default({}),
  },
  (table) => [
    index('ingestion_runs_source_started_idx').on(
      table.sourceId,
      table.startedAt,
    ),
  ],
);

export const stagedResults = pgTable(
  'staged_results',
  {
    id: id(),
    ingestionRunId: uuid('ingestion_run_id')
      .notNull()
      .references(() => ingestionRuns.id, { onDelete: 'cascade' }),
    sourceSnapshotId: uuid('source_snapshot_id')
      .notNull()
      .references(() => sourceSnapshots.id, { onDelete: 'restrict' }),
    sourceRecordKey: text('source_record_key').notNull(),
    rawModelName: text('raw_model_name').notNull(),
    resolvedModelVariantId: uuid('resolved_model_variant_id').references(
      () => modelVariants.id,
      { onDelete: 'restrict' },
    ),
    payload: jsonb('payload').notNull(),
    validationStatus: text('validation_status').notNull(),
    validationErrors: jsonb('validation_errors').notNull().default([]),
    createdAt: createdAt(),
  },
  (table) => [
    uniqueIndex('staged_results_run_record_uidx').on(
      table.ingestionRunId,
      table.sourceRecordKey,
    ),
  ],
);

export const benchmarkResults = pgTable(
  'benchmark_results',
  {
    id: id(),
    publicationKey: text('publication_key').notNull(),
    modelVariantId: uuid('model_variant_id')
      .notNull()
      .references(() => modelVariants.id, { onDelete: 'restrict' }),
    benchmarkMetricId: uuid('benchmark_metric_id')
      .notNull()
      .references(() => benchmarkMetrics.id, { onDelete: 'restrict' }),
    evaluationConfigId: uuid('evaluation_config_id').references(
      () => evaluationConfigs.id,
      { onDelete: 'restrict' },
    ),
    value: numeric('value', { precision: 16, scale: 6 }).notNull(),
    sampleSize: integer('sample_size'),
    measuredAt: timestamp('measured_at', { withTimezone: true }),
    publicationStatus: text('publication_status')
      .notNull()
      .default('PUBLISHED'),
    qualityFlags: jsonb('quality_flags').notNull().default([]),
    createdAt: createdAt(),
  },
  (table) => [
    uniqueIndex('benchmark_results_publication_key_uidx').on(
      table.publicationKey,
    ),
    index('benchmark_results_variant_metric_idx').on(
      table.modelVariantId,
      table.benchmarkMetricId,
    ),
  ],
);

export const resultEvidence = pgTable(
  'result_evidence',
  {
    id: id(),
    benchmarkResultId: uuid('benchmark_result_id')
      .notNull()
      .references(() => benchmarkResults.id, { onDelete: 'cascade' }),
    sourceSnapshotId: uuid('source_snapshot_id')
      .notNull()
      .references(() => sourceSnapshots.id, { onDelete: 'restrict' }),
    stagedResultId: uuid('staged_result_id').references(
      () => stagedResults.id,
      {
        onDelete: 'set null',
      },
    ),
    evidenceKind: text('evidence_kind').notNull(),
    locator: jsonb('locator').notNull().default({}),
    isPrimary: boolean('is_primary').notNull().default(false),
    createdAt: createdAt(),
  },
  (table) => [
    uniqueIndex('result_evidence_result_snapshot_uidx').on(
      table.benchmarkResultId,
      table.sourceSnapshotId,
    ),
  ],
);
