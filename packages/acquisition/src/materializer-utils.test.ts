import { describe, expect, it } from 'vitest';

import profilePolicy from '../../../data-v2/mappings/profile-policy.json';

import {
  LEGAL_SOURCE_EFFORTS,
  currentBuildCanonicalId,
  isSupersededBuild,
  resolveCatalogModel,
  normalizeSourceEffort,
  parseCsv,
  parseEffort,
  slugify,
} from './materializer-utils.js';

describe('materializer utilities', () => {
  it('keeps the legal effort tiers identical to profile-policy.json', () => {
    expect([...LEGAL_SOURCE_EFFORTS].toSorted()).toEqual(
      [...profilePolicy.effortOrder].toSorted(),
    );
  });

  it('parses quoted CSV cells and CRLF rows', () => {
    expect(parseCsv('"model, name",score\r\n"A""B",42\r\n')).toEqual([
      ['model, name', 'score'],
      ['A"B', '42'],
    ]);
  });

  it('normalizes aliases and effort labels deterministically', () => {
    expect(slugify(' Claude Fable 5 (max) ')).toBe('claude-fable-5-max');
    expect(parseEffort('Claude Fable 5 (xhigh)')).toBe('xhigh');
    expect(parseEffort('Gemini 3.5 Flash (Non-reasoning)')).toBe(
      'non-reasoning',
    );
    expect(parseEffort('Gemini 3.5 Flash (minimal)')).toBe('low');
    expect(parseEffort('Claude Fable 5')).toBeNull();
    expect(normalizeSourceEffort('minimal')).toBe('minimal');
    expect(normalizeSourceEffort('0.99')).toBeNull();
    expect(normalizeSourceEffort('none')).toBeNull();
  });

  it('resolves the Zapier Fable 5.0 label through its reviewed catalog alias', () => {
    expect(resolveCatalogModel('Claude Fable 5.0').canonicalModelId).toBe(
      'anthropic-claude-fable-5',
    );
  });
});

describe('parseEffort on comma-separated parentheticals', () => {
  it('lets an explicit non-reasoning marker win over a tier named beside it', () => {
    // REFACTOR_SPEC_V2.md 4.4: the reasoning switch and the tier are one axis.
    // These rows previously parsed to null, fell through to the cross-source
    // inference in 4.5, and came out labelled `max`.
    expect(parseEffort('Claude Sonnet 5 (Non-reasoning, High Effort)')).toBe(
      'non-reasoning',
    );
    expect(parseEffort('Claude Sonnet 4.6 (Non-reasoning, Low Effort)')).toBe(
      'non-reasoning',
    );
  });

  it('reads the tier out of a multi-segment parenthetical', () => {
    expect(
      parseEffort('Claude Sonnet 5 (Adaptive Reasoning, Max Effort)'),
    ).toBe('max');
    expect(parseEffort('DeepSeek V4 Pro (Reasoning, High Effort)')).toBe(
      'high',
    );
    expect(
      parseEffort(
        'Claude Fable 5 (Adaptive Reasoning, Max Effort, Opus 4.8 Fallback)',
      ),
    ).toBe('max');
  });

  it('keeps single-segment and unlabelled names behaving as before', () => {
    expect(parseEffort('GPT-5.6 Sol (Non-reasoning)')).toBe('non-reasoning');
    expect(parseEffort('GPT-5.6 Sol (max)')).toBe('max');
    expect(parseEffort('Gemini 3.5 Flash (minimal)')).toBe('low');
    expect(parseEffort('MiniMax-M3')).toBeNull();
    expect(parseEffort('Gemini 3.1 Pro Preview')).toBeNull();
  });
});

describe('superseded DeepSeek builds', () => {
  it('keeps only the current release and drops the superseded build', () => {
    // The user decided on 2026-08-18 to keep only the current release rather
    // than merging it with the April build under one identity. Artificial
    // Analysis is filtered by its own release_date field instead of a slug
    // list; LiveBench publishes no date, so its dated slugs remain the signal.
    expect(isSupersededBuild('livebench', 'deepseek-v4-pro')).toBe(true);
    expect(isSupersededBuild('livebench', 'deepseek-v4-flash')).toBe(true);
    expect(
      isSupersededBuild('artificial-analysis', 'deepseek-v4-pro-0424'),
    ).toBe(false);
  });

  it('leaves a bare name alone on sources with no dated sibling', () => {
    // DeepSWE and Frontier Code publish one DeepSeek row each, so the bare name
    // is the current model there. Widening the rule to all sources would drop
    // it from both.
    expect(isSupersededBuild('deepswe', 'deepseek-v4-pro')).toBe(false);
    expect(isSupersededBuild('frontier-code', 'deepseek-v4-pro')).toBe(false);
  });

  it('maps the dated current-release names onto the canonical id', () => {
    expect(currentBuildCanonicalId('deepseek-v4-pro-0813')).toBe(
      'deepseek-deepseek-v4-pro',
    );
    expect(currentBuildCanonicalId('DeepSeek V4 Flash 0731')).toBe(
      'deepseek-deepseek-v4-flash',
    );
    expect(currentBuildCanonicalId('deepseek-v4-pro')).toBeNull();
  });

  it('routes livebench rows through the source-aware resolver', () => {
    expect(
      resolveCatalogModel('deepseek-v4-pro', 'livebench').canonicalModelId,
    ).toBeNull();
    expect(
      resolveCatalogModel('deepseek-v4-pro-0813', 'livebench').canonicalModelId,
    ).toBe('deepseek-deepseek-v4-pro');
    expect(
      resolveCatalogModel('deepseek-v4-pro', 'deepswe').canonicalModelId,
    ).toBe('deepseek-deepseek-v4-pro');
  });
  it('resolves the Vals-form xAI names that the catalog now carries', () => {
    // Vals writes `provider/model` and the resolver slugifies the whole
    // string, so `grok/grok-4.5` keys on `grok-grok-4-5` and matches nothing
    // the modelId or displayName produce. Without the alias, 21 included Vals
    // benchmarks per Grok release resolve to null and never reach the product.
    expect(resolveCatalogModel('grok/grok-4.5').canonicalModelId).toBe(
      'xai-grok-4-5',
    );
    expect(resolveCatalogModel('grok/grok-4.6').canonicalModelId).toBe(
      'xai-grok-4-6',
    );
    // Exactly these two were reviewed. Neighbouring Vals rows stay unresolved
    // rather than being pattern-matched into an identity.
    expect(
      resolveCatalogModel('grok/grok-4.5-exa').canonicalModelId,
    ).toBeNull();
  });
});
