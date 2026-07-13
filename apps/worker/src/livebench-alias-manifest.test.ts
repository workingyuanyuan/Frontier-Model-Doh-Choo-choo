import { describe, expect, it } from 'vitest';

import {
  summarizeLiveBenchAliasManifest,
  liveBenchAliasManifest,
  validateLiveBenchAliasManifest,
  type LiveBenchAliasManifestEntry,
} from './livebench-alias-manifest.js';

const claudeSonnet: LiveBenchAliasManifestEntry = {
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
  evidenceUrls: ['https://docs.anthropic.com/en/api/claude-on-vertex-ai'],
};

describe('LiveBench alias manifest validation', () => {
  it('accepts reviewed canonical identities with exact source aliases', () => {
    expect(() => validateLiveBenchAliasManifest([claudeSonnet])).not.toThrow();
  });

  it('rejects aliases that normalize to more than one model variant', () => {
    expect(() =>
      validateLiveBenchAliasManifest([
        claudeSonnet,
        {
          ...claudeSonnet,
          variant: {
            slug: 'claude-3-5-sonnet-other',
            displayName: 'Claude 3.5 Sonnet Other',
          },
          aliases: [' Claude-3-5-Sonnet-20241022 '],
        },
      ]),
    ).toThrow('Alias collision');
  });

  it('rejects unsafe slugs and empty aliases before database writes', () => {
    expect(() =>
      validateLiveBenchAliasManifest([
        {
          ...claudeSonnet,
          provider: { slug: 'Anthropic!', displayName: 'Anthropic' },
        },
      ]),
    ).toThrow('provider slug');
    expect(() =>
      validateLiveBenchAliasManifest([{ ...claudeSonnet, aliases: ['  '] }]),
    ).toThrow('non-empty alias');
  });

  it('requires HTTPS evidence for every reviewed mapping', () => {
    expect(() =>
      validateLiveBenchAliasManifest([
        { ...claudeSonnet, evidenceUrls: ['http://example.com/model'] },
      ]),
    ).toThrow('HTTPS evidence URL');
  });

  it('ships a validated first reviewed batch of exact LiveBench aliases', () => {
    expect(() =>
      validateLiveBenchAliasManifest(liveBenchAliasManifest),
    ).not.toThrow();
    expect(liveBenchAliasManifest.map((entry) => entry.variant.slug)).toEqual([
      'claude-3-5-haiku-20241022',
      'claude-3-5-sonnet-20241022',
      'claude-3-opus-20240229',
    ]);
  });

  it('summarizes deduplicated canonical identities before a transaction', () => {
    expect(summarizeLiveBenchAliasManifest(liveBenchAliasManifest)).toEqual({
      entriesSeen: 3,
      providersEnsured: 1,
      familiesEnsured: 1,
      modelsEnsured: 3,
      variantsEnsured: 3,
      aliasesEnsured: 3,
    });
  });
});
