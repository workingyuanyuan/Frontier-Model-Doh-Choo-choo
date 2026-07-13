import { describe, expect, it } from 'vitest';

import {
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
  },
  aliases: ['claude-3-5-sonnet-20241022'],
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
});
