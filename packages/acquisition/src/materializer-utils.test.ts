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
