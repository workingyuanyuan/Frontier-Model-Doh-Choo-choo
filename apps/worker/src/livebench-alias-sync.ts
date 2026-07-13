import {
  type Database,
  modelAliases,
  modelFamilies,
  models,
  modelVariants,
  providers,
} from '@llm-bench/db';
import { and, eq } from 'drizzle-orm';

import {
  liveBenchAliasManifest,
  summarizeLiveBenchAliasManifest,
  type LiveBenchAliasManifestEntry,
  type LiveBenchAliasManifestSummary,
} from './livebench-alias-manifest.js';
import { LIVEBENCH_ALIAS_NAMESPACE } from './livebench-aliases.js';
import { normalizeModelAlias } from './model-alias-resolution.js';

function assertIdentityField(
  kind: string,
  slug: string,
  field: string,
  actual: string | null,
  expected: string | null,
): void {
  if (actual !== expected) {
    throw new Error(
      `${kind} identity conflict for ${slug}: ${field} is ${String(actual)}, expected ${String(expected)}`,
    );
  }
}

export async function syncLiveBenchAliasManifest(
  db: Database,
  entries: readonly LiveBenchAliasManifestEntry[] = liveBenchAliasManifest,
): Promise<LiveBenchAliasManifestSummary> {
  const summary = summarizeLiveBenchAliasManifest(entries);

  return db.transaction(async (transaction) => {
    const existingAliases = await transaction
      .select({
        alias: modelAliases.alias,
        modelVariantId: modelAliases.modelVariantId,
      })
      .from(modelAliases)
      .where(eq(modelAliases.namespace, LIVEBENCH_ALIAS_NAMESPACE));
    const normalizedAliasOwners = new Map<string, Set<string>>();
    for (const alias of existingAliases) {
      const normalizedAlias = normalizeModelAlias(alias.alias);
      const owners = normalizedAliasOwners.get(normalizedAlias) ?? new Set();
      owners.add(alias.modelVariantId);
      normalizedAliasOwners.set(normalizedAlias, owners);
    }

    for (const entry of entries) {
      const [insertedProvider] = await transaction
        .insert(providers)
        .values({
          slug: entry.provider.slug,
          displayName: entry.provider.displayName,
        })
        .onConflictDoNothing({ target: providers.slug })
        .returning({
          id: providers.id,
          displayName: providers.displayName,
        });
      const [provider] = insertedProvider
        ? [insertedProvider]
        : await transaction
            .select({ id: providers.id, displayName: providers.displayName })
            .from(providers)
            .where(eq(providers.slug, entry.provider.slug))
            .limit(1);
      if (!provider) {
        throw new Error(`Provider was not ensured: ${entry.provider.slug}`);
      }
      assertIdentityField(
        'Provider',
        entry.provider.slug,
        'displayName',
        provider.displayName,
        entry.provider.displayName,
      );

      const [insertedFamily] = await transaction
        .insert(modelFamilies)
        .values({
          providerId: provider.id,
          slug: entry.family.slug,
          displayName: entry.family.displayName,
        })
        .onConflictDoNothing()
        .returning({
          id: modelFamilies.id,
          displayName: modelFamilies.displayName,
        });
      const [family] = insertedFamily
        ? [insertedFamily]
        : await transaction
            .select({
              id: modelFamilies.id,
              displayName: modelFamilies.displayName,
            })
            .from(modelFamilies)
            .where(
              and(
                eq(modelFamilies.providerId, provider.id),
                eq(modelFamilies.slug, entry.family.slug),
              ),
            )
            .limit(1);
      if (!family) {
        throw new Error(`Model family was not ensured: ${entry.family.slug}`);
      }
      assertIdentityField(
        'Model family',
        entry.family.slug,
        'displayName',
        family.displayName,
        entry.family.displayName,
      );

      const [insertedModel] = await transaction
        .insert(models)
        .values({
          familyId: family.id,
          slug: entry.model.slug,
          displayName: entry.model.displayName,
        })
        .onConflictDoNothing()
        .returning({ id: models.id, displayName: models.displayName });
      const [model] = insertedModel
        ? [insertedModel]
        : await transaction
            .select({ id: models.id, displayName: models.displayName })
            .from(models)
            .where(
              and(
                eq(models.familyId, family.id),
                eq(models.slug, entry.model.slug),
              ),
            )
            .limit(1);
      if (!model) {
        throw new Error(`Model was not ensured: ${entry.model.slug}`);
      }
      assertIdentityField(
        'Model',
        entry.model.slug,
        'displayName',
        model.displayName,
        entry.model.displayName,
      );

      const variantValues = {
        modelId: model.id,
        slug: entry.variant.slug,
        displayName: entry.variant.displayName,
        ...(entry.variant.releaseDate === undefined
          ? {}
          : { releaseDate: entry.variant.releaseDate }),
        ...(entry.variant.lifecycleStatus === undefined
          ? {}
          : { lifecycleStatus: entry.variant.lifecycleStatus }),
        metadata: { evidenceUrls: entry.evidenceUrls },
      };
      const [insertedVariant] = await transaction
        .insert(modelVariants)
        .values(variantValues)
        .onConflictDoNothing({ target: modelVariants.slug })
        .returning({
          id: modelVariants.id,
          modelId: modelVariants.modelId,
          displayName: modelVariants.displayName,
          releaseDate: modelVariants.releaseDate,
          lifecycleStatus: modelVariants.lifecycleStatus,
        });
      const [variant] = insertedVariant
        ? [insertedVariant]
        : await transaction
            .select({
              id: modelVariants.id,
              modelId: modelVariants.modelId,
              displayName: modelVariants.displayName,
              releaseDate: modelVariants.releaseDate,
              lifecycleStatus: modelVariants.lifecycleStatus,
            })
            .from(modelVariants)
            .where(eq(modelVariants.slug, entry.variant.slug))
            .limit(1);
      if (!variant) {
        throw new Error(`Model variant was not ensured: ${entry.variant.slug}`);
      }
      assertIdentityField(
        'Model variant',
        entry.variant.slug,
        'modelId',
        variant.modelId,
        model.id,
      );
      assertIdentityField(
        'Model variant',
        entry.variant.slug,
        'displayName',
        variant.displayName,
        entry.variant.displayName,
      );
      assertIdentityField(
        'Model variant',
        entry.variant.slug,
        'releaseDate',
        variant.releaseDate,
        entry.variant.releaseDate ?? null,
      );
      assertIdentityField(
        'Model variant',
        entry.variant.slug,
        'lifecycleStatus',
        variant.lifecycleStatus,
        entry.variant.lifecycleStatus ?? 'ACTIVE',
      );

      for (const [aliasIndex, alias] of entry.aliases.entries()) {
        const normalizedAlias = normalizeModelAlias(alias);
        const owners = normalizedAliasOwners.get(normalizedAlias) ?? new Set();
        if ([...owners].some((owner) => owner !== variant.id)) {
          throw new Error(
            `Existing alias collision: ${normalizedAlias} belongs to another model variant`,
          );
        }

        const [insertedAlias] = await transaction
          .insert(modelAliases)
          .values({
            modelVariantId: variant.id,
            namespace: LIVEBENCH_ALIAS_NAMESPACE,
            alias,
            isCanonical: aliasIndex === 0,
            priority: 100,
          })
          .onConflictDoNothing({
            target: [modelAliases.namespace, modelAliases.alias],
          })
          .returning({ modelVariantId: modelAliases.modelVariantId });
        const [storedAlias] = insertedAlias
          ? [insertedAlias]
          : await transaction
              .select({ modelVariantId: modelAliases.modelVariantId })
              .from(modelAliases)
              .where(
                and(
                  eq(modelAliases.namespace, LIVEBENCH_ALIAS_NAMESPACE),
                  eq(modelAliases.alias, alias),
                ),
              )
              .limit(1);
        if (!storedAlias || storedAlias.modelVariantId !== variant.id) {
          throw new Error(`Alias identity conflict: ${alias}`);
        }
        owners.add(variant.id);
        normalizedAliasOwners.set(normalizedAlias, owners);
      }
    }

    return summary;
  });
}
