import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

import { weeklyEditions } from './scoring.js';

const id = () =>
  uuid('id')
    .primaryKey()
    .default(sql`uuidv7()`);
const createdAt = () =>
  timestamp('created_at', { withTimezone: true }).notNull().defaultNow();

export const themePresets = pgTable(
  'theme_presets',
  {
    id: id(),
    slug: text('slug').notNull(),
    displayNameZhTw: text('display_name_zh_tw').notNull(),
    displayNameEn: text('display_name_en').notNull(),
    tokens: jsonb('tokens').notNull(),
    geometryVersion: text('geometry_version').notNull(),
    createdAt: createdAt(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [uniqueIndex('theme_presets_slug_uidx').on(table.slug)],
);

export const videoJobs = pgTable(
  'video_jobs',
  {
    id: id(),
    weeklyEditionId: uuid('weekly_edition_id')
      .notNull()
      .references(() => weeklyEditions.id, { onDelete: 'restrict' }),
    themePresetId: uuid('theme_preset_id')
      .notNull()
      .references(() => themePresets.id, { onDelete: 'restrict' }),
    locale: text('locale').notNull(),
    status: text('status').notNull().default('QUEUED'),
    compositionId: text('composition_id').notNull(),
    inputSnapshotSha256: text('input_snapshot_sha256').notNull(),
    outputPath: text('output_path'),
    outputSha256: text('output_sha256'),
    errorSummary: text('error_summary'),
    startedAt: timestamp('started_at', { withTimezone: true }),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    createdAt: createdAt(),
  },
  (table) => [
    index('video_jobs_edition_status_idx').on(
      table.weeklyEditionId,
      table.status,
    ),
  ],
);

export const reviewEvents = pgTable(
  'review_events',
  {
    id: id(),
    entityType: text('entity_type').notNull(),
    entityId: uuid('entity_id').notNull(),
    action: text('action').notNull(),
    actor: text('actor').notNull(),
    reason: text('reason'),
    before: jsonb('before'),
    after: jsonb('after'),
    createdAt: createdAt(),
  },
  (table) => [
    index('review_events_entity_idx').on(table.entityType, table.entityId),
  ],
);

export const auditLogs = pgTable(
  'audit_logs',
  {
    id: id(),
    occurredAt: timestamp('occurred_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    actor: text('actor').notNull(),
    action: text('action').notNull(),
    resourceType: text('resource_type').notNull(),
    resourceId: text('resource_id'),
    requestId: text('request_id'),
    metadata: jsonb('metadata').notNull().default({}),
    previousHash: text('previous_hash'),
    entryHash: text('entry_hash').notNull(),
  },
  (table) => [
    uniqueIndex('audit_logs_entry_hash_uidx').on(table.entryHash),
    index('audit_logs_occurred_idx').on(table.occurredAt),
  ],
);
