import { describe, expect, it } from 'vitest';

import profilePolicy from '../../../data-v2/mappings/profile-policy.json';

import {
  LEGAL_SOURCE_EFFORTS,
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
