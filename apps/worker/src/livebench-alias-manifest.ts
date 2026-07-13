import { normalizeModelAlias } from './model-alias-resolution.js';

interface CanonicalIdentity {
  readonly slug: string;
  readonly displayName: string;
}

export interface LiveBenchAliasManifestEntry {
  readonly provider: CanonicalIdentity;
  readonly family: CanonicalIdentity;
  readonly model: CanonicalIdentity;
  readonly variant: CanonicalIdentity & {
    readonly releaseDate?: string;
    readonly lifecycleStatus?: 'ACTIVE' | 'DEPRECATED';
  };
  readonly aliases: readonly string[];
  readonly evidenceUrls: readonly string[];
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

    if (entry.evidenceUrls.length === 0) {
      throw new Error(
        `${entry.variant.slug} must declare an HTTPS evidence URL`,
      );
    }
    for (const evidenceUrl of entry.evidenceUrls) {
      let parsedUrl: URL;
      try {
        parsedUrl = new URL(evidenceUrl);
      } catch {
        throw new Error(`Invalid HTTPS evidence URL: ${evidenceUrl}`);
      }
      if (parsedUrl.protocol !== 'https:') {
        throw new Error(`Invalid HTTPS evidence URL: ${evidenceUrl}`);
      }
    }
  }
}

const anthropicModelEvidenceUrl =
  'https://docs.anthropic.com/en/api/claude-on-vertex-ai';

export const liveBenchAliasManifest = [
  {
    provider: { slug: 'anthropic', displayName: 'Anthropic' },
    family: { slug: 'claude-3', displayName: 'Claude 3' },
    model: { slug: 'claude-3-5-haiku', displayName: 'Claude 3.5 Haiku' },
    variant: {
      slug: 'claude-3-5-haiku-20241022',
      displayName: 'Claude 3.5 Haiku (2024-10-22)',
      releaseDate: '2024-10-22',
      lifecycleStatus: 'ACTIVE',
    },
    aliases: ['claude-3-5-haiku-20241022'],
    evidenceUrls: [anthropicModelEvidenceUrl],
  },
  {
    provider: { slug: 'anthropic', displayName: 'Anthropic' },
    family: { slug: 'claude-3', displayName: 'Claude 3' },
    model: { slug: 'claude-3-5-sonnet', displayName: 'Claude 3.5 Sonnet' },
    variant: {
      slug: 'claude-3-5-sonnet-20241022',
      displayName: 'Claude 3.5 Sonnet (2024-10-22)',
      releaseDate: '2024-10-22',
      lifecycleStatus: 'DEPRECATED',
    },
    aliases: ['claude-3-5-sonnet-20241022'],
    evidenceUrls: [anthropicModelEvidenceUrl],
  },
  {
    provider: { slug: 'anthropic', displayName: 'Anthropic' },
    family: { slug: 'claude-3', displayName: 'Claude 3' },
    model: { slug: 'claude-3-opus', displayName: 'Claude 3 Opus' },
    variant: {
      slug: 'claude-3-opus-20240229',
      displayName: 'Claude 3 Opus (2024-02-29)',
      releaseDate: '2024-02-29',
      lifecycleStatus: 'DEPRECATED',
    },
    aliases: ['claude-3-opus-20240229'],
    evidenceUrls: [anthropicModelEvidenceUrl],
  },
] as const satisfies readonly LiveBenchAliasManifestEntry[];
