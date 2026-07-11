import { sql } from 'drizzle-orm';
import {
  check,
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

import { benchmarkMetrics } from './evidence.js';
import { modelVariants } from './identity.js';

const id = () =>
  uuid('id')
    .primaryKey()
    .default(sql`uuidv7()`);
const createdAt = () =>
  timestamp('created_at', { withTimezone: true }).notNull().defaultNow();

export const dimensions = pgTable('dimensions', {
  id: text('id').primaryKey(),
  displayOrder: integer('display_order').notNull(),
  nameZhTw: text('name_zh_tw').notNull(),
  nameEn: text('name_en').notNull(),
  descriptionZhTw: text('description_zh_tw'),
  descriptionEn: text('description_en'),
  createdAt: createdAt(),
});

export const scoringMethodVersions = pgTable(
  'scoring_method_versions',
  {
    id: id(),
    version: text('version').notNull(),
    status: text('status').notNull().default('DRAFT'),
    config: jsonb('config').notNull(),
    methodologyMarkdown: text('methodology_markdown').notNull(),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    createdAt: createdAt(),
  },
  (table) => [
    uniqueIndex('scoring_method_versions_version_uidx').on(table.version),
  ],
);

export const benchmarkDimensionMappings = pgTable(
  'benchmark_dimension_mappings',
  {
    scoringMethodVersionId: uuid('scoring_method_version_id')
      .notNull()
      .references(() => scoringMethodVersions.id, { onDelete: 'cascade' }),
    benchmarkMetricId: uuid('benchmark_metric_id')
      .notNull()
      .references(() => benchmarkMetrics.id, { onDelete: 'restrict' }),
    dimensionId: text('dimension_id')
      .notNull()
      .references(() => dimensions.id, { onDelete: 'restrict' }),
    weight: numeric('weight', { precision: 8, scale: 6 }).notNull(),
    normalization: jsonb('normalization').notNull(),
    createdAt: createdAt(),
  },
  (table) => [
    primaryKey({
      name: 'benchmark_dimension_mappings_pk',
      columns: [
        table.scoringMethodVersionId,
        table.benchmarkMetricId,
        table.dimensionId,
      ],
    }),
    check(
      'benchmark_dimension_mappings_weight_check',
      sql`${table.weight} > 0 AND ${table.weight} <= 1`,
    ),
  ],
);

export const dimensionScores = pgTable(
  'dimension_scores',
  {
    id: id(),
    scoringMethodVersionId: uuid('scoring_method_version_id')
      .notNull()
      .references(() => scoringMethodVersions.id, { onDelete: 'restrict' }),
    modelVariantId: uuid('model_variant_id')
      .notNull()
      .references(() => modelVariants.id, { onDelete: 'restrict' }),
    dimensionId: text('dimension_id')
      .notNull()
      .references(() => dimensions.id, { onDelete: 'restrict' }),
    score: numeric('score', { precision: 8, scale: 4 }),
    coverage: numeric('coverage', { precision: 7, scale: 6 }).notNull(),
    confidence: numeric('confidence', { precision: 7, scale: 4 }).notNull(),
    status: text('status').notNull(),
    componentResults: jsonb('component_results').notNull().default([]),
    computedAt: timestamp('computed_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex('dimension_scores_method_variant_dimension_uidx').on(
      table.scoringMethodVersionId,
      table.modelVariantId,
      table.dimensionId,
    ),
    check(
      'dimension_scores_score_check',
      sql`${table.score} IS NULL OR (${table.score} >= 0 AND ${table.score} <= 100)`,
    ),
    check(
      'dimension_scores_coverage_check',
      sql`${table.coverage} >= 0 AND ${table.coverage} <= 1`,
    ),
    check(
      'dimension_scores_confidence_check',
      sql`${table.confidence} >= 0 AND ${table.confidence} <= 100`,
    ),
  ],
);

export const overallScores = pgTable(
  'overall_scores',
  {
    id: id(),
    scoringMethodVersionId: uuid('scoring_method_version_id')
      .notNull()
      .references(() => scoringMethodVersions.id, { onDelete: 'restrict' }),
    modelVariantId: uuid('model_variant_id')
      .notNull()
      .references(() => modelVariants.id, { onDelete: 'restrict' }),
    score: numeric('score', { precision: 8, scale: 4 }),
    coverage: numeric('coverage', { precision: 7, scale: 6 }).notNull(),
    confidence: numeric('confidence', { precision: 7, scale: 4 }).notNull(),
    independentEvidenceShare: numeric('independent_evidence_share', {
      precision: 7,
      scale: 6,
    }).notNull(),
    rankingStatus: text('ranking_status').notNull(),
    qualityFlags: jsonb('quality_flags').notNull().default([]),
    computedAt: timestamp('computed_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex('overall_scores_method_variant_uidx').on(
      table.scoringMethodVersionId,
      table.modelVariantId,
    ),
    check(
      'overall_scores_score_check',
      sql`${table.score} IS NULL OR (${table.score} >= 0 AND ${table.score} <= 100)`,
    ),
    check(
      'overall_scores_coverage_check',
      sql`${table.coverage} >= 0 AND ${table.coverage} <= 1`,
    ),
    check(
      'overall_scores_confidence_check',
      sql`${table.confidence} >= 0 AND ${table.confidence} <= 100`,
    ),
  ],
);

export const rankingSnapshots = pgTable(
  'ranking_snapshots',
  {
    id: id(),
    editionDate: date('edition_date').notNull(),
    dataCutoffAt: timestamp('data_cutoff_at', { withTimezone: true }).notNull(),
    scoringMethodVersionId: uuid('scoring_method_version_id')
      .notNull()
      .references(() => scoringMethodVersions.id, { onDelete: 'restrict' }),
    sourceSnapshotIds: uuid('source_snapshot_ids').array().notNull(),
    entryCount: integer('entry_count').notNull(),
    contentSha256: text('content_sha256').notNull(),
    createdAt: createdAt(),
  },
  (table) => [
    uniqueIndex('ranking_snapshots_edition_method_uidx').on(
      table.editionDate,
      table.scoringMethodVersionId,
    ),
    check('ranking_snapshots_entry_count_check', sql`${table.entryCount} >= 0`),
  ],
);

export const rankingEntries = pgTable(
  'ranking_entries',
  {
    id: id(),
    rankingSnapshotId: uuid('ranking_snapshot_id')
      .notNull()
      .references(() => rankingSnapshots.id, { onDelete: 'cascade' }),
    modelVariantId: uuid('model_variant_id')
      .notNull()
      .references(() => modelVariants.id, { onDelete: 'restrict' }),
    rank: integer('rank'),
    overallScore: numeric('overall_score', { precision: 8, scale: 4 }),
    overallCoverage: numeric('overall_coverage', {
      precision: 7,
      scale: 6,
    }).notNull(),
    overallConfidence: numeric('overall_confidence', {
      precision: 7,
      scale: 4,
    }).notNull(),
    rankingStatus: text('ranking_status').notNull(),
    dimensions: jsonb('dimensions').notNull(),
    qualityFlags: jsonb('quality_flags').notNull().default([]),
    createdAt: createdAt(),
  },
  (table) => [
    uniqueIndex('ranking_entries_snapshot_variant_uidx').on(
      table.rankingSnapshotId,
      table.modelVariantId,
    ),
    index('ranking_entries_snapshot_rank_idx').on(
      table.rankingSnapshotId,
      table.rank,
    ),
    check(
      'ranking_entries_rank_check',
      sql`${table.rank} IS NULL OR ${table.rank} > 0`,
    ),
  ],
);

export const weeklyEditions = pgTable(
  'weekly_editions',
  {
    id: id(),
    editionDate: date('edition_date').notNull(),
    rankingSnapshotId: uuid('ranking_snapshot_id')
      .notNull()
      .references(() => rankingSnapshots.id, { onDelete: 'restrict' }),
    status: text('status').notNull().default('DRAFT'),
    titleZhTw: text('title_zh_tw').notNull(),
    titleEn: text('title_en').notNull(),
    summaryZhTw: text('summary_zh_tw'),
    summaryEn: text('summary_en'),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    createdAt: createdAt(),
  },
  (table) => [uniqueIndex('weekly_editions_date_uidx').on(table.editionDate)],
);
