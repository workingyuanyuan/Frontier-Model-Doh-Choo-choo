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

  it('ships validated reviewed batches of exact LiveBench aliases', () => {
    expect(() =>
      validateLiveBenchAliasManifest(liveBenchAliasManifest),
    ).not.toThrow();
    expect(liveBenchAliasManifest.map((entry) => entry.variant.slug)).toEqual([
      'claude-3-5-haiku-20241022',
      'claude-3-5-sonnet-20241022',
      'claude-3-opus-20240229',
      'gpt-4o-2024-08-06',
      'gpt-4o-2024-11-20',
      'gpt-4o-mini-2024-07-18',
      'o1-mini-2024-09-12',
      'command-r-08-2024',
      'command-r-plus-08-2024',
      'command-a-03-2025',
      'gemini-1-5-pro-002',
      'amazon-nova-micro-v1-0',
      'amazon-nova-lite-v1-0',
      'amazon-nova-pro-v1-0',
    ]);
  });

  it('summarizes deduplicated canonical identities before a transaction', () => {
    expect(summarizeLiveBenchAliasManifest(liveBenchAliasManifest)).toEqual({
      entriesSeen: 14,
      providersEnsured: 5,
      familiesEnsured: 7,
      modelsEnsured: 13,
      variantsEnsured: 14,
      aliasesEnsured: 14,
    });
  });
});
