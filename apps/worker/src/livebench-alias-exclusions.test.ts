import { describe, expect, it } from 'vitest';

import {
  liveBenchAliasExclusionManifest,
  summarizeLiveBenchAliasExclusionManifest,
  validateLiveBenchAliasExclusionManifest,
  type LiveBenchAliasExclusionManifestEntry,
} from './livebench-alias-exclusions.js';

const privateCheckpoint: LiveBenchAliasExclusionManifestEntry = {
  alias: 'private-checkpoint',
  reason: 'BENCHMARK_PRIVATE_CHECKPOINT',
  evidenceUrls: ['https://github.com/LiveBench/LiveBench'],
};

describe('LiveBench alias exclusion manifest', () => {
  it('accepts an evidence-backed exclusion and summarizes it', () => {
    expect(() =>
      validateLiveBenchAliasExclusionManifest([privateCheckpoint], []),
    ).not.toThrow();
    expect(
      summarizeLiveBenchAliasExclusionManifest([privateCheckpoint], []),
    ).toEqual({ exclusionsSeen: 1, aliasesExcluded: 1 });
  });

  it('rejects duplicate exclusions and mapping conflicts', () => {
    expect(() =>
      validateLiveBenchAliasExclusionManifest(
        [
          privateCheckpoint,
          { ...privateCheckpoint, alias: ' PRIVATE-CHECKPOINT ' },
        ],
        [],
      ),
    ).toThrow('Duplicate exclusion alias');
    expect(() =>
      validateLiveBenchAliasExclusionManifest(
        [privateCheckpoint],
        [
          {
            provider: { slug: 'test', displayName: 'Test' },
            family: { slug: 'test', displayName: 'Test' },
            model: { slug: 'test', displayName: 'Test' },
            variant: { slug: 'test', displayName: 'Test' },
            aliases: ['private-checkpoint'],
            evidenceUrls: ['https://example.com/model'],
          },
        ],
      ),
    ).toThrow('both mapped and excluded');
  });

  it('requires a non-empty reason and HTTPS evidence', () => {
    expect(() =>
      validateLiveBenchAliasExclusionManifest(
        [
          {
            ...privateCheckpoint,
            reason: ' ' as LiveBenchAliasExclusionManifestEntry['reason'],
          },
        ],
        [],
      ),
    ).toThrow('reason');
    expect(() =>
      validateLiveBenchAliasExclusionManifest(
        [{ ...privateCheckpoint, evidenceUrls: ['http://example.com'] }],
        [],
      ),
    ).toThrow('HTTPS evidence URL');
  });

  it('ships all reviewed exclusions without mapping conflicts', () => {
    expect(() =>
      validateLiveBenchAliasExclusionManifest(liveBenchAliasExclusionManifest),
    ).not.toThrow();
    expect(
      summarizeLiveBenchAliasExclusionManifest(liveBenchAliasExclusionManifest),
    ).toEqual({ exclusionsSeen: 9, aliasesExcluded: 9 });
  });
});
