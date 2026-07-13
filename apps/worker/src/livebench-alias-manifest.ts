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

export interface LiveBenchAliasManifestSummary {
  readonly entriesSeen: number;
  readonly providersEnsured: number;
  readonly familiesEnsured: number;
  readonly modelsEnsured: number;
  readonly variantsEnsured: number;
  readonly aliasesEnsured: number;
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

export function summarizeLiveBenchAliasManifest(
  entries: readonly LiveBenchAliasManifestEntry[],
): LiveBenchAliasManifestSummary {
  validateLiveBenchAliasManifest(entries);

  return {
    entriesSeen: entries.length,
    providersEnsured: new Set(entries.map((entry) => entry.provider.slug)).size,
    familiesEnsured: new Set(
      entries.map((entry) => `${entry.provider.slug}/${entry.family.slug}`),
    ).size,
    modelsEnsured: new Set(
      entries.map(
        (entry) =>
          `${entry.provider.slug}/${entry.family.slug}/${entry.model.slug}`,
      ),
    ).size,
    variantsEnsured: new Set(entries.map((entry) => entry.variant.slug)).size,
    aliasesEnsured: entries.reduce(
      (total, entry) => total + entry.aliases.length,
      0,
    ),
  };
}

const anthropicModelEvidenceUrl =
  'https://docs.anthropic.com/en/api/claude-on-vertex-ai';
const openAiGpt4oEvidenceUrl =
  'https://developers.openai.com/api/docs/models/gpt-4o';
const openAiGpt4oMiniEvidenceUrl =
  'https://developers.openai.com/api/docs/models/gpt-4o-mini';
const openAiO1MiniEvidenceUrl =
  'https://developers.openai.com/api/docs/models/o1-mini';
const cohereModelEvidenceUrl = 'https://docs.cohere.com/docs/models';
const cohereCommandAEvidenceUrl = 'https://docs.cohere.com/changelog/command-a';
const geminiModelEvidenceUrl =
  'https://ai.google.dev/gemini-api/docs/changelog';
const amazonNovaEvidenceUrl =
  'https://docs.aws.amazon.com/nova/latest/userguide/additional-resources.html';

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
  {
    provider: { slug: 'openai', displayName: 'OpenAI' },
    family: { slug: 'gpt-4o', displayName: 'GPT-4o' },
    model: { slug: 'gpt-4o', displayName: 'GPT-4o' },
    variant: {
      slug: 'gpt-4o-2024-08-06',
      displayName: 'GPT-4o (2024-08-06)',
      releaseDate: '2024-08-06',
      lifecycleStatus: 'DEPRECATED',
    },
    aliases: ['gpt-4o-2024-08-06'],
    evidenceUrls: [openAiGpt4oEvidenceUrl],
  },
  {
    provider: { slug: 'openai', displayName: 'OpenAI' },
    family: { slug: 'gpt-4o', displayName: 'GPT-4o' },
    model: { slug: 'gpt-4o', displayName: 'GPT-4o' },
    variant: {
      slug: 'gpt-4o-2024-11-20',
      displayName: 'GPT-4o (2024-11-20)',
      releaseDate: '2024-11-20',
      lifecycleStatus: 'DEPRECATED',
    },
    aliases: ['gpt-4o-2024-11-20'],
    evidenceUrls: [openAiGpt4oEvidenceUrl],
  },
  {
    provider: { slug: 'openai', displayName: 'OpenAI' },
    family: { slug: 'gpt-4o', displayName: 'GPT-4o' },
    model: { slug: 'gpt-4o-mini', displayName: 'GPT-4o mini' },
    variant: {
      slug: 'gpt-4o-mini-2024-07-18',
      displayName: 'GPT-4o mini (2024-07-18)',
      releaseDate: '2024-07-18',
      lifecycleStatus: 'ACTIVE',
    },
    aliases: ['gpt-4o-mini-2024-07-18'],
    evidenceUrls: [openAiGpt4oMiniEvidenceUrl],
  },
  {
    provider: { slug: 'openai', displayName: 'OpenAI' },
    family: { slug: 'o1', displayName: 'o1' },
    model: { slug: 'o1-mini', displayName: 'o1-mini' },
    variant: {
      slug: 'o1-mini-2024-09-12',
      displayName: 'o1-mini (2024-09-12)',
      releaseDate: '2024-09-12',
      lifecycleStatus: 'DEPRECATED',
    },
    aliases: ['o1-mini-2024-09-12'],
    evidenceUrls: [openAiO1MiniEvidenceUrl],
  },
  {
    provider: { slug: 'cohere', displayName: 'Cohere' },
    family: { slug: 'command-r', displayName: 'Command R' },
    model: { slug: 'command-r', displayName: 'Command R' },
    variant: {
      slug: 'command-r-08-2024',
      displayName: 'Command R (08-2024)',
      releaseDate: '2024-08-30',
      lifecycleStatus: 'ACTIVE',
    },
    aliases: ['command-r-08-2024'],
    evidenceUrls: [cohereModelEvidenceUrl],
  },
  {
    provider: { slug: 'cohere', displayName: 'Cohere' },
    family: { slug: 'command-r', displayName: 'Command R' },
    model: { slug: 'command-r-plus', displayName: 'Command R+' },
    variant: {
      slug: 'command-r-plus-08-2024',
      displayName: 'Command R+ (08-2024)',
      releaseDate: '2024-08-30',
      lifecycleStatus: 'ACTIVE',
    },
    aliases: ['command-r-plus-08-2024'],
    evidenceUrls: [cohereModelEvidenceUrl],
  },
  {
    provider: { slug: 'cohere', displayName: 'Cohere' },
    family: { slug: 'command-a', displayName: 'Command A' },
    model: { slug: 'command-a', displayName: 'Command A' },
    variant: {
      slug: 'command-a-03-2025',
      displayName: 'Command A (03-2025)',
      releaseDate: '2025-03-13',
      lifecycleStatus: 'ACTIVE',
    },
    aliases: ['command-a-03-2025'],
    evidenceUrls: [cohereCommandAEvidenceUrl, cohereModelEvidenceUrl],
  },
  {
    provider: { slug: 'google', displayName: 'Google' },
    family: { slug: 'gemini-1-5', displayName: 'Gemini 1.5' },
    model: { slug: 'gemini-1-5-pro', displayName: 'Gemini 1.5 Pro' },
    variant: {
      slug: 'gemini-1-5-pro-002',
      displayName: 'Gemini 1.5 Pro 002',
      releaseDate: '2024-09-24',
      lifecycleStatus: 'DEPRECATED',
    },
    aliases: ['gemini-1.5-pro-002'],
    evidenceUrls: [geminiModelEvidenceUrl],
  },
  {
    provider: { slug: 'amazon', displayName: 'Amazon' },
    family: { slug: 'nova-1', displayName: 'Amazon Nova 1' },
    model: { slug: 'nova-micro', displayName: 'Amazon Nova Micro' },
    variant: {
      slug: 'amazon-nova-micro-v1-0',
      displayName: 'Amazon Nova Micro v1.0',
      releaseDate: '2024-12-02',
      lifecycleStatus: 'ACTIVE',
    },
    aliases: ['amazon.nova-micro-v1:0'],
    evidenceUrls: [amazonNovaEvidenceUrl],
  },
  {
    provider: { slug: 'amazon', displayName: 'Amazon' },
    family: { slug: 'nova-1', displayName: 'Amazon Nova 1' },
    model: { slug: 'nova-lite', displayName: 'Amazon Nova Lite' },
    variant: {
      slug: 'amazon-nova-lite-v1-0',
      displayName: 'Amazon Nova Lite v1.0',
      releaseDate: '2024-12-02',
      lifecycleStatus: 'ACTIVE',
    },
    aliases: ['amazon.nova-lite-v1:0'],
    evidenceUrls: [amazonNovaEvidenceUrl],
  },
  {
    provider: { slug: 'amazon', displayName: 'Amazon' },
    family: { slug: 'nova-1', displayName: 'Amazon Nova 1' },
    model: { slug: 'nova-pro', displayName: 'Amazon Nova Pro' },
    variant: {
      slug: 'amazon-nova-pro-v1-0',
      displayName: 'Amazon Nova Pro v1.0',
      releaseDate: '2024-12-02',
      lifecycleStatus: 'ACTIVE',
    },
    aliases: ['amazon.nova-pro-v1:0'],
    evidenceUrls: [amazonNovaEvidenceUrl],
  },
] as const satisfies readonly LiveBenchAliasManifestEntry[];
