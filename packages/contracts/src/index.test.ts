import { describe, expect, it } from 'vitest';

import {
  ActiveEditionResponseSchema,
  ApiErrorResponseSchema,
  ComparisonSelectionSchema,
  DataStatusResponseSchema,
  DetailSlugSchema,
  DIMENSION_IDS,
  DimensionScoreSchema,
  HttpUrlSchema,
  RankingSnapshotSchema,
} from './index.js';

describe('detail route contracts', () => {
  it('accepts stable lowercase slugs used by model and benchmark routes', () => {
    expect(DetailSlugSchema.parse('amazon-nova-lite-v1-0')).toBe(
      'amazon-nova-lite-v1-0',
    );
  });

  it('rejects path traversal and non-canonical route identifiers', () => {
    expect(DetailSlugSchema.safeParse('../models').success).toBe(false);
    expect(DetailSlugSchema.safeParse('LiveBench').success).toBe(false);
  });

  it('permits only HTTP(S) external links in detail DTOs', () => {
    expect(HttpUrlSchema.parse('https://example.com/evidence')).toBe(
      'https://example.com/evidence',
    );
    expect(HttpUrlSchema.safeParse('javascript:alert(1)').success).toBe(false);
  });

  it('accepts two to five unique canonical comparison IDs', () => {
    expect(
      ComparisonSelectionSchema.parse(['model-a', 'model-b', 'model-c']),
    ).toEqual(['model-a', 'model-b', 'model-c']);
    expect(
      ComparisonSelectionSchema.safeParse(['model-a', 'model-a']).success,
    ).toBe(false);
    expect(
      ComparisonSelectionSchema.safeParse(['a', 'b', 'c', 'd', 'e', 'f'])
        .success,
    ).toBe(false);
  });
});

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

describe('v1 API contracts', () => {
  it('wraps one active edition with an explicit publication mode', () => {
    const snapshot = RankingSnapshotSchema.parse({
      id: '019d1234-5678-7abc-8def-0123456789ab',
      editionDate: '2026-07-11',
      dataCutoffAt: '2026-07-11T00:00:00.000Z',
      scoringMethodVersion: 'absolute-v1',
      sourceSnapshotIds: ['019d1234-5678-7abc-8def-0123456789ac'],
      entries: [],
    });

    expect(
      ActiveEditionResponseSchema.parse({
        apiVersion: 'v1',
        data: {
          id: '019d1234-5678-7abc-8def-0123456789ae',
          publicationMode: 'PREVIEW',
          titleZhTw: '2026-07-11 LLM 基準週報（預覽）',
          titleEn: '2026-07-11 LLM benchmark weekly (Preview)',
          summaryZhTw: null,
          summaryEn: null,
          activatedAt: '2026-07-11T01:00:00.000Z',
          snapshotSha256:
            'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
          snapshot,
        },
      }).data.publicationMode,
    ).toBe('PREVIEW');
  });

  it('represents a reachable database with or without an active edition', () => {
    expect(
      DataStatusResponseSchema.parse({
        apiVersion: 'v1',
        data: {
          status: 'READY',
          activeEdition: null,
          publishedResultCount: 737,
        },
      }).data,
    ).toEqual({
      status: 'READY',
      activeEdition: null,
      publishedResultCount: 737,
    });
  });

  it('uses a stable machine-readable not-found error envelope', () => {
    expect(
      ApiErrorResponseSchema.parse({
        apiVersion: 'v1',
        error: {
          code: 'ACTIVE_EDITION_NOT_FOUND',
          message: 'No active edition is available.',
        },
      }).error.code,
    ).toBe('ACTIVE_EDITION_NOT_FOUND');
  });
});
