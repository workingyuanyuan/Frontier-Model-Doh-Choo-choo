import { sql } from 'drizzle-orm';
import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

const id = () =>
  uuid('id')
    .primaryKey()
    .default(sql`uuidv7()`);
const createdAt = () =>
  timestamp('created_at', { withTimezone: true }).notNull().defaultNow();
const updatedAt = () =>
  timestamp('updated_at', { withTimezone: true }).notNull().defaultNow();

export const providers = pgTable(
  'providers',
  {
    id: id(),
    slug: text('slug').notNull(),
    displayName: text('display_name').notNull(),
    websiteUrl: text('website_url'),
    countryCode: text('country_code'),
    isActive: boolean('is_active').notNull().default(true),
    metadata: jsonb('metadata').notNull().default({}),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [uniqueIndex('providers_slug_uidx').on(table.slug)],
);

export const modelFamilies = pgTable(
  'model_families',
  {
    id: id(),
    providerId: uuid('provider_id')
      .notNull()
      .references(() => providers.id, { onDelete: 'restrict' }),
    slug: text('slug').notNull(),
    displayName: text('display_name').notNull(),
    description: text('description'),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex('model_families_provider_slug_uidx').on(
      table.providerId,
      table.slug,
    ),
    index('model_families_provider_idx').on(table.providerId),
  ],
);

export const models = pgTable(
  'models',
  {
    id: id(),
    familyId: uuid('family_id')
      .notNull()
      .references(() => modelFamilies.id, { onDelete: 'restrict' }),
    slug: text('slug').notNull(),
    displayName: text('display_name').notNull(),
    architecture: text('architecture'),
    modality: jsonb('modality').notNull().default({ input: [], output: [] }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex('models_family_slug_uidx').on(table.familyId, table.slug),
    index('models_family_idx').on(table.familyId),
  ],
);

export const modelVariants = pgTable(
  'model_variants',
  {
    id: id(),
    modelId: uuid('model_id')
      .notNull()
      .references(() => models.id, { onDelete: 'restrict' }),
    slug: text('slug').notNull(),
    displayName: text('display_name').notNull(),
    releaseDate: date('release_date'),
    lifecycleStatus: text('lifecycle_status').notNull().default('ACTIVE'),
    parameterCountMillions: integer('parameter_count_millions'),
    contextWindowTokens: integer('context_window_tokens'),
    isOpenWeights: boolean('is_open_weights').notNull().default(false),
    metadata: jsonb('metadata').notNull().default({}),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex('model_variants_slug_uidx').on(table.slug),
    index('model_variants_model_idx').on(table.modelId),
  ],
);

export const modelAliases = pgTable(
  'model_aliases',
  {
    id: id(),
    modelVariantId: uuid('model_variant_id')
      .notNull()
      .references(() => modelVariants.id, { onDelete: 'cascade' }),
    namespace: text('namespace').notNull(),
    alias: text('alias').notNull(),
    isCanonical: boolean('is_canonical').notNull().default(false),
    priority: integer('priority').notNull().default(0),
    createdAt: createdAt(),
  },
  (table) => [
    uniqueIndex('model_aliases_namespace_alias_uidx').on(
      table.namespace,
      table.alias,
    ),
    index('model_aliases_variant_idx').on(table.modelVariantId),
  ],
);
