import { describe, expect, it } from 'vitest';

import type { RankingEntry } from '@llm-bench/contracts';

import {
  InvalidComparisonSelectionError,
  resolveComparisonEntries,
} from './comparison';

const entry = (slug: string): RankingEntry => ({
  modelVariantId: '019d1234-5678-7abc-8def-0123456789ad',
  slug,
  displayName: slug,
  providerName: 'Provider',
  rank: null,
  overallScore: null,
  overallCoverage: 0,
  overallConfidence: 0,
  rankingStatus: 'UNRANKED',
  dimensions: [
    'reasoning',
    'math',
    'knowledge',
    'language',
    'instruction',
    'coding',
    'agentic',
    'context',
  ].map((dimension) => ({
    dimension,
    score: null,
    coverage: 0,
    confidence: 0,
    status: 'INSUFFICIENT_DATA',
  })) as RankingEntry['dimensions'],
  qualityFlags: ['LOW_COVERAGE'],
});

const entries = [entry('model-a'), entry('model-b'), entry('model-c')];

describe('comparison query boundary', () => {
  it('defaults to the first two stable snapshot entries', () => {
    expect(
      resolveComparisonEntries(entries, undefined).map((x) => x.slug),
    ).toEqual(['model-a', 'model-b']);
  });

  it('preserves repeated query parameter order', () => {
    expect(
      resolveComparisonEntries(entries, ['model-c', 'model-a']).map(
        (x) => x.slug,
      ),
    ).toEqual(['model-c', 'model-a']);
  });

  it.each([
    [['model-a']],
    [['model-a', 'model-a']],
    [['model-a', 'model-b', 'model-c', 'model-d', 'model-e', 'model-f']],
    [['model-a', 'unknown-model']],
  ])('rejects invalid, duplicate, excessive, or unknown IDs', (value) => {
    expect(() => resolveComparisonEntries(entries, value)).toThrow(
      InvalidComparisonSelectionError,
    );
  });
});
