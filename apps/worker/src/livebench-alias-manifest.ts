import { normalizeModelAlias } from './model-alias-resolution.js';

interface CanonicalIdentity {
  readonly slug: string;
  readonly displayName: string;
}

export interface LiveBenchAliasManifestEntry {
  readonly provider: CanonicalIdentity;
  readonly family: CanonicalIdentity;
  readonly model: CanonicalIdentity;
  readonly variant: CanonicalIdentity;
  readonly aliases: readonly string[];
}

const stableSlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;

function validateIdentity(
  kind: 'provider' | 'family' | 'model' | 'variant',
  identity: CanonicalIdentity,
): void {
  if (!stableSlugPattern.test(identity.slug)) {
    throw new Error(`Invalid ${kind} slug: ${identity.slug}`);
  }
  if (identity.displayName.trim().length === 0) {
    throw new Error(`${kind} display name must be non-empty`);
  }
}

export function validateLiveBenchAliasManifest(
  entries: readonly LiveBenchAliasManifestEntry[],
): void {
  const variantSlugs = new Set<string>();
  const aliasOwners = new Map<string, string>();

  for (const entry of entries) {
    validateIdentity('provider', entry.provider);
    validateIdentity('family', entry.family);
    validateIdentity('model', entry.model);
    validateIdentity('variant', entry.variant);

    if (variantSlugs.has(entry.variant.slug)) {
      throw new Error(`Duplicate variant slug: ${entry.variant.slug}`);
    }
    variantSlugs.add(entry.variant.slug);

    if (entry.aliases.length === 0) {
      throw new Error(`${entry.variant.slug} must declare a non-empty alias`);
    }
    for (const alias of entry.aliases) {
      const normalizedAlias = normalizeModelAlias(alias);
      if (normalizedAlias.length === 0) {
        throw new Error(`${entry.variant.slug} must declare a non-empty alias`);
      }

      const existingOwner = aliasOwners.get(normalizedAlias);
      if (existingOwner !== undefined) {
        throw new Error(
          `Alias collision: ${normalizedAlias} belongs to ${existingOwner} and ${entry.variant.slug}`,
        );
      }
      aliasOwners.set(normalizedAlias, entry.variant.slug);
    }
  }
}
