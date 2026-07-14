import { describe, expect, it } from 'vitest';

import type { DimensionScore } from '@llm-bench/contracts';

import {
  aggregateDimension,
  assertFormalPublicationEligible,
  calculateOverallScore,
  normalizeScore,
} from './index.js';

describe('normalizeScore', () => {
  it('uses fixed anchors for higher-is-better metrics', () => {
    expect(
      normalizeScore({
        rawValue: 0.75,
        lowerAnchor: 0,
        upperAnchor: 1,
        direction: 'HIGHER_IS_BETTER',
      }),
    ).toEqual({ normalizedScore: 75, wasClipped: false });
  });

  it('inverts lower-is-better metrics before scaling', () => {
    expect(
      normalizeScore({
        rawValue: 20,
        lowerAnchor: 0,
        upperAnchor: 100,
        direction: 'LOWER_IS_BETTER',
      }),
    ).toEqual({ normalizedScore: 80, wasClipped: false });
  });

  it('clips values outside documented anchors and records clipping', () => {
    expect(
      normalizeScore({
        rawValue: 120,
        lowerAnchor: 0,
        upperAnchor: 100,
        direction: 'HIGHER_IS_BETTER',
      }),
    ).toEqual({ normalizedScore: 100, wasClipped: true });
  });

  it('rejects invalid or equal anchors', () => {
    expect(() =>
      normalizeScore({
        rawValue: 50,
        lowerAnchor: 10,
        upperAnchor: 10,
        direction: 'HIGHER_IS_BETTER',
      }),
    ).toThrow('upperAnchor must be greater than lowerAnchor');
  });
});

describe('aggregateDimension', () => {
  it('keeps missing dimensions null instead of zero', () => {
    expect(
      aggregateDimension({
        dimension: 'context',
        totalEligibleWeight: 4,
        contributions: [],
      }),
    ).toEqual({
      dimension: 'context',
      score: null,
      coverage: 0,
      confidence: 0,
      status: 'INSUFFICIENT_DATA',
    });
  });

  it('calculates weighted score, coverage and evidence confidence', () => {
    const result = aggregateDimension({
      dimension: 'coding',
      totalEligibleWeight: 4,
      contributions: [
        {
          normalizedScore: 80,
          configuredWeight: 2,
          evidenceQuality: 1,
          isIndependent: true,
        },
        {
          normalizedScore: 60,
          configuredWeight: 1,
          evidenceQuality: 0.5,
          isIndependent: false,
        },
      ],
    });

    expect(result.score).toBeCloseTo(73.333333, 5);
    expect(result.coverage).toBe(0.75);
    expect(result.confidence).toBeCloseTo(62.5, 5);
    expect(result.status).toBe('FORMAL');
  });

  it('does not mark vendor-only evidence as formal', () => {
    expect(
      aggregateDimension({
        dimension: 'knowledge',
        totalEligibleWeight: 2,
        contributions: [
          {
            normalizedScore: 90,
            configuredWeight: 2,
            evidenceQuality: 0.5,
            isIndependent: false,
          },
        ],
      }).status,
    ).toBe('PROVISIONAL');
  });
});

const dimensions = [
  'reasoning',
  'math',
  'knowledge',
  'language',
  'instruction',
  'coding',
  'agentic',
  'context',
] as const;

const completeScores: DimensionScore[] = dimensions.map((dimension, index) => ({
  dimension,
  score: 70 + index,
  coverage: 0.8,
  confidence: 72,
  status: 'FORMAL',
}));

describe('calculateOverallScore', () => {
  it('verifies only complete, sufficiently covered independent evidence', () => {
    const result = calculateOverallScore({
      dimensions: completeScores,
      independentSourceShare: 0.75,
    });

    expect(result.rankingStatus).toBe('VERIFIED');
    expect(result.overallScore).toBe(73.5);
    expect(result.overallCoverage).toBeCloseTo(0.8);
  });

  it('keeps a six-dimension score in a separate provisional cohort', () => {
    const partial = completeScores.map((score, index) =>
      index < 6
        ? score
        : {
            ...score,
            score: null,
            coverage: 0,
            confidence: 0,
            status: 'INSUFFICIENT_DATA' as const,
          },
    );

    const result = calculateOverallScore({
      dimensions: partial,
      independentSourceShare: 0.75,
    });

    expect(result.rankingStatus).toBe('PROVISIONAL');
    expect(result.overallScore).toBe(72.5);
  });

  it('leaves sparse models unranked without fabricating a score', () => {
    const sparse = completeScores.map((score, index) =>
      index < 5
        ? score
        : {
            ...score,
            score: null,
            coverage: 0,
            confidence: 0,
            status: 'INSUFFICIENT_DATA' as const,
          },
    );

    expect(
      calculateOverallScore({
        dimensions: sparse,
        independentSourceShare: 1,
      }),
    ).toMatchObject({ rankingStatus: 'UNRANKED', overallScore: null });
  });
});

describe('formal publication eligibility', () => {
  const verifiedEntry = {
    rankingStatus: 'VERIFIED' as const,
    rank: 1,
    overallScore: 90,
  };

  it('rejects preview methods even if their rows claim to be verified', () => {
    expect(() =>
      assertFormalPublicationEligible({
        scoringMethodVersion: 'preview-ui-v1',
        scoringMethodStatus: 'PUBLISHED',
        formalPublicationEnabled: true,
        entries: [verifiedEntry],
      }),
    ).toThrow('Preview');
  });

  it('rejects draft methods and incomplete ranking rows', () => {
    expect(() =>
      assertFormalPublicationEligible({
        scoringMethodVersion: 'absolute-capability-v1',
        scoringMethodStatus: 'DRAFT',
        formalPublicationEnabled: false,
        entries: [verifiedEntry],
      }),
    ).toThrow('not enabled');
    expect(() =>
      assertFormalPublicationEligible({
        scoringMethodVersion: 'absolute-capability-v1',
        scoringMethodStatus: 'PUBLISHED',
        formalPublicationEnabled: true,
        entries: [
          { rankingStatus: 'UNRANKED', rank: null, overallScore: null },
        ],
      }),
    ).toThrow('verified');
  });

  it('accepts only an enabled published method with verified ranked rows', () => {
    expect(() =>
      assertFormalPublicationEligible({
        scoringMethodVersion: 'absolute-capability-v1',
        scoringMethodStatus: 'PUBLISHED',
        formalPublicationEnabled: true,
        entries: [verifiedEntry],
      }),
    ).not.toThrow();
  });
});
