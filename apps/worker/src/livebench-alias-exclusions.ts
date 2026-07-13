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

const liveBenchSourceEvidenceUrl = 'https://github.com/LiveBench/LiveBench';

export const liveBenchAliasExclusionManifest = [
  {
    alias: 'codegen3_5k-qwen2.5-72b-instruct-2-chk-50',
    reason: 'BENCHMARK_PRIVATE_CHECKPOINT',
    evidenceUrls: [liveBenchSourceEvidenceUrl],
  },
  {
    alias: 'coding-meta-llama-3.1-70b-instruct-chk-50',
    reason: 'BENCHMARK_PRIVATE_CHECKPOINT',
    evidenceUrls: [liveBenchSourceEvidenceUrl],
  },
  {
    alias:
      'coding2-amcfull-apifull-mmlu12k-meta-llama-3.1-70b-instruct-chk-150',
    reason: 'BENCHMARK_PRIVATE_CHECKPOINT',
    evidenceUrls: [liveBenchSourceEvidenceUrl],
  },
  {
    alias: 'lcb-math-qwen2-72b-instructv3-merged-50',
    reason: 'BENCHMARK_PRIVATE_CHECKPOINT',
    evidenceUrls: [liveBenchSourceEvidenceUrl],
  },
  {
    alias: 'acm_rewrite_qwen2-72b-chat',
    reason: 'BENCHMARK_PRIVATE_CHECKPOINT',
    evidenceUrls: [liveBenchSourceEvidenceUrl],
  },
  {
    alias: 'deepseek-r1-local',
    reason: 'UNVERIFIED_SOURCE_ALIAS',
    evidenceUrls: [liveBenchSourceEvidenceUrl],
  },
  {
    alias: 'deepseek-r1-local-2',
    reason: 'UNVERIFIED_SOURCE_ALIAS',
    evidenceUrls: [liveBenchSourceEvidenceUrl],
  },
  {
    alias: 'wbot-4:347b_no_s',
    reason: 'UNVERIFIED_SOURCE_ALIAS',
    evidenceUrls: [liveBenchSourceEvidenceUrl],
  },
  {
    alias: 'claude-3-5-opus-20240229',
    reason: 'INVALID_MODEL_IDENTITY',
    evidenceUrls: [
      'https://docs.anthropic.com/en/docs/about-claude/models/overview',
    ],
  },
] as const satisfies readonly LiveBenchAliasExclusionManifestEntry[];
