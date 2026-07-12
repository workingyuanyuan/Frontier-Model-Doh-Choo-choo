import { describe, expect, it } from 'vitest';

import {
  normalizeModelAlias,
  resolveExactModelAlias,
  type ModelAliasCandidate,
} from './model-alias-resolution.js';

const liveBenchCandidates: readonly ModelAliasCandidate[] = [
  {
    namespace: 'livebench',
    alias: 'Claude 3.5 Sonnet',
    modelVariantId: 'variant-claude-sonnet',
  },
  {
    namespace: 'other-source',
    alias: 'Claude 3.5 Sonnet',
    modelVariantId: 'variant-other-source',
  },
];

describe('model alias normalization', () => {
  it('applies NFC, trim, case folding, and whitespace collapse only', () => {
    expect(normalizeModelAlias('  CAFÉ\u00a0 Model  ')).toBe('café model');
    expect(normalizeModelAlias('CAFE\u0301 Model')).toBe('café model');
    expect(normalizeModelAlias('model-v1.0')).not.toBe(
      normalizeModelAlias('model-v1-0'),
    );
  });
});

describe('exact model alias resolution', () => {
  it('resolves one normalized alias within the requested namespace', () => {
    expect(
      resolveExactModelAlias(
        'livebench',
        '  claude 3.5 SONNET ',
        liveBenchCandidates,
      ),
    ).toEqual({
      status: 'RESOLVED',
      normalizedAlias: 'claude 3.5 sonnet',
      modelVariantId: 'variant-claude-sonnet',
    });
  });

  it('returns unresolved instead of guessing a similar alias', () => {
    expect(
      resolveExactModelAlias(
        'livebench',
        'Claude-3.5-Sonnet',
        liveBenchCandidates,
      ),
    ).toEqual({
      status: 'UNRESOLVED',
      normalizedAlias: 'claude-3.5-sonnet',
    });
  });

  it('deduplicates multiple aliases that identify the same variant', () => {
    const candidates = [
      ...liveBenchCandidates,
      {
        namespace: 'livebench',
        alias: 'claude 3.5 sonnet',
        modelVariantId: 'variant-claude-sonnet',
      },
    ];

    expect(
      resolveExactModelAlias('livebench', 'Claude 3.5 Sonnet', candidates),
    ).toMatchObject({
      status: 'RESOLVED',
      modelVariantId: 'variant-claude-sonnet',
    });
  });

  it('returns a deterministic ambiguity instead of choosing by priority', () => {
    const candidates = [
      {
        namespace: 'livebench',
        alias: 'GPT 4o',
        modelVariantId: 'variant-z',
        priority: 100,
      },
      {
        namespace: 'livebench',
        alias: 'gpt 4o',
        modelVariantId: 'variant-a',
        priority: 0,
      },
    ];

    expect(resolveExactModelAlias('livebench', 'GPT 4O', candidates)).toEqual({
      status: 'AMBIGUOUS',
      normalizedAlias: 'gpt 4o',
      candidateModelVariantIds: ['variant-a', 'variant-z'],
    });
  });
});
