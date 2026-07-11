import { describe, expect, it } from 'vitest';

import {
  DIMENSION_IDS,
  DimensionScoreSchema,
  RankingSnapshotSchema,
} from './index.js';

const completeDimensions = [
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
  score: 75,
  coverage: 0.8,
  confidence: 72,
  status: 'FORMAL',
}));

describe('dimension contracts', () => {
  it('keeps the product-defined eight-axis order', () => {
    expect(DIMENSION_IDS).toEqual([
      'reasoning',
      'math',
      'knowledge',
      'language',
      'instruction',
      'coding',
      'agentic',
      'context',
    ]);
  });

  it('accepts an explicit missing score without treating it as zero', () => {
    const parsed = DimensionScoreSchema.parse({
      dimension: 'context',
      score: null,
      coverage: 0,
      confidence: 0,
      status: 'INSUFFICIENT_DATA',
    });

    expect(parsed.score).toBeNull();
  });

  it('rejects coverage outside zero to one', () => {
    const result = DimensionScoreSchema.safeParse({
      dimension: 'coding',
      score: 80,
      coverage: 1.01,
      confidence: 80,
      status: 'FORMAL',
    });

    expect(result.success).toBe(false);
  });
});

describe('ranking snapshot contract', () => {
  it('accepts exactly one score for every axis in fixed order', () => {
    const snapshot = RankingSnapshotSchema.parse({
      id: '019d1234-5678-7abc-8def-0123456789ab',
      editionDate: '2026-07-11',
      dataCutoffAt: '2026-07-11T00:00:00.000Z',
      scoringMethodVersion: 'absolute-v1',
      sourceSnapshotIds: ['019d1234-5678-7abc-8def-0123456789ac'],
      entries: [
        {
          modelVariantId: '019d1234-5678-7abc-8def-0123456789ad',
          slug: 'example-model',
          displayName: 'Example Model',
          providerName: 'Example Provider',
          rank: 1,
          overallScore: 75,
          overallCoverage: 0.8,
          overallConfidence: 72,
          rankingStatus: 'VERIFIED',
          dimensions: completeDimensions,
          qualityFlags: [],
        },
      ],
    });

    expect(snapshot.entries[0]?.dimensions).toHaveLength(8);
  });

  it('rejects a snapshot whose axes are reordered', () => {
    const reordered = [...completeDimensions];
    [reordered[0], reordered[1]] = [reordered[1]!, reordered[0]!];

    const result = RankingSnapshotSchema.safeParse({
      id: '019d1234-5678-7abc-8def-0123456789ab',
      editionDate: '2026-07-11',
      dataCutoffAt: '2026-07-11T00:00:00.000Z',
      scoringMethodVersion: 'absolute-v1',
      sourceSnapshotIds: ['019d1234-5678-7abc-8def-0123456789ac'],
      entries: [
        {
          modelVariantId: '019d1234-5678-7abc-8def-0123456789ad',
          slug: 'example-model',
          displayName: 'Example Model',
          providerName: 'Example Provider',
          rank: null,
          overallScore: null,
          overallCoverage: 0,
          overallConfidence: 0,
          rankingStatus: 'UNRANKED',
          dimensions: reordered,
          qualityFlags: ['LOW_COVERAGE'],
        },
      ],
    });

    expect(result.success).toBe(false);
  });
});
