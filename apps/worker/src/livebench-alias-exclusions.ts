import {
  liveBenchAliasManifest,
  type LiveBenchAliasManifestEntry,
} from './livebench-alias-manifest.js';
import { normalizeModelAlias } from './model-alias-resolution.js';

export type LiveBenchAliasExclusionReason =
  | 'BENCHMARK_PRIVATE_CHECKPOINT'
  | 'INVALID_MODEL_IDENTITY'
  | 'NON_MODEL_AGGREGATE'
  | 'UNVERIFIED_SOURCE_ALIAS';

export interface LiveBenchAliasExclusionManifestEntry {
  readonly alias: string;
  readonly reason: LiveBenchAliasExclusionReason;
  readonly evidenceUrls: readonly string[];
}

export interface LiveBenchAliasExclusionManifestSummary {
  readonly exclusionsSeen: number;
  readonly aliasesExcluded: number;
}

function validateHttpsEvidenceUrl(evidenceUrl: string): void {
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

export function validateLiveBenchAliasExclusionManifest(
  exclusions: readonly LiveBenchAliasExclusionManifestEntry[],
  mappings: readonly LiveBenchAliasManifestEntry[] = liveBenchAliasManifest,
): void {
  const mappedAliases = new Set(
    mappings.flatMap((entry) => entry.aliases.map(normalizeModelAlias)),
  );
  const excludedAliases = new Set<string>();

  for (const exclusion of exclusions) {
    const normalizedAlias = normalizeModelAlias(exclusion.alias);
    if (normalizedAlias.length === 0) {
      throw new Error('Exclusion alias must be non-empty');
    }
    if (exclusion.reason.trim().length === 0) {
      throw new Error(`${normalizedAlias} exclusion reason must be non-empty`);
    }
    if (exclusion.evidenceUrls.length === 0) {
      throw new Error(`${normalizedAlias} must declare an HTTPS evidence URL`);
    }
    exclusion.evidenceUrls.forEach(validateHttpsEvidenceUrl);

    if (excludedAliases.has(normalizedAlias)) {
      throw new Error(`Duplicate exclusion alias: ${normalizedAlias}`);
    }
    if (mappedAliases.has(normalizedAlias)) {
      throw new Error(`Alias is both mapped and excluded: ${normalizedAlias}`);
    }
    excludedAliases.add(normalizedAlias);
  }
}

export function summarizeLiveBenchAliasExclusionManifest(
  exclusions: readonly LiveBenchAliasExclusionManifestEntry[],
  mappings: readonly LiveBenchAliasManifestEntry[] = liveBenchAliasManifest,
): LiveBenchAliasExclusionManifestSummary {
  validateLiveBenchAliasExclusionManifest(exclusions, mappings);
  return {
    exclusionsSeen: exclusions.length,
    aliasesExcluded: exclusions.length,
  };
}

export const liveBenchAliasExclusionManifest: readonly LiveBenchAliasExclusionManifestEntry[] =
  [];
