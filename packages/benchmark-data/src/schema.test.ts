import { describe, expect, it } from 'vitest';
import benchmarkMappings from '../../../data-v2/mappings/benchmarks.json';

import {
  BenchmarkDimensionMappingSchema,
  CandidateResultSchema,
  ProductVersionPointerSchema,
  ProductVersionSchema,
  deterministicJson,
} from './index.js';

const candidate = {
  schemaVersion: 'candidate-result-v1',
  id: 'terminal-bench:gpt-5-6-sol:max',
  sourceId: 'terminal-bench',
  sourceRole: 'ORGANIZER',
  benchmarkId: 'terminal-bench-2-1',
  benchmarkVersion: '2.1',
  model: {
    rawName: 'GPT-5.6 Sol (max)',
    canonicalModelId: 'openai-gpt-5-6-sol',
    profileId: 'openai-gpt-5-6-sol-max',
  },
  profile: {
    effort: 'max',
    thinking: null,
    tools: true,
    harness: 'terminus-2',
    contextWindowTokens: null,
    quantization: null,
    attempts: 1,
  },
  metric: {
    id: 'terminal-bench-score',
    name: 'Score',
    unit: 'percent',
    higherIsBetter: true,
  },
  rawScore: 85.8,
  normalizedScore: 85.8,
  acquisitionStatus: 'FULL',
  inclusion: 'INCLUDED',
  exclusionReason: null,
  sourceUrl: 'https://www.tbench.ai/leaderboard/terminal-bench/2.1',
  observedAt: '2026-07-16T00:00:00.000Z',
  sourcePublishedAt: '2026-07-11T00:00:00.000Z',
  evidenceIds: ['sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'],
  provenance: {
    rawScore: {
      evidenceId:
        'sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      method: 'EMBEDDED_JSON',
      locator: '$.leaderboard[0].score',
    },
  },
} as const;

describe('CandidateResultSchema', () => {
  it('accepts a complete source result with field provenance', () => {
    expect(CandidateResultSchema.parse(candidate)).toEqual(candidate);
  });

  it('accepts a complete target row from an incomplete source snapshot', () => {
    const parsed = CandidateResultSchema.parse({
      ...candidate,
      acquisitionStatus: 'PARTIAL_SOURCE',
    });

    expect(parsed.acquisitionStatus).toBe('PARTIAL_SOURCE');
  });

  it('rejects a result without an exact numeric score', () => {
    expect(() =>
      CandidateResultSchema.parse({ ...candidate, rawScore: null }),
    ).toThrow();
  });

  it('requires an exclusion reason when a row is excluded', () => {
    expect(() =>
      CandidateResultSchema.parse({
        ...candidate,
        inclusion: 'EXCLUDED',
        exclusionReason: null,
      }),
    ).toThrow('exclusionReason');
  });
});

describe('BenchmarkDimensionMappingSchema', () => {
  it('validates the committed mapping and keeps benchmark IDs unique', () => {
    const parsed = BenchmarkDimensionMappingSchema.parse(benchmarkMappings);
    const ids = parsed.benchmarks.map(({ id }) => id);

    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(parsed.benchmarks.map(({ primaryDimension }) => primaryDimension)))
      .toEqual(
        new Set([
          'reasoning',
          'math',
          'knowledge',
          'language',
          'instruction',
          'coding',
          'agentic',
          'context',
        ]),
      );
  });
});

describe('ProductVersionSchema', () => {
  it('keeps all eight dimensions in canonical order', () => {
    const product = ProductVersionSchema.parse({
      schemaVersion: 'product-version-v1',
      versionId:
        'sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
      generatedAt: '2026-07-16T00:00:00.000Z',
      sourceSnapshotIds: ['terminal-bench:2026-07-16'],
      frontier: [],
      profiles: [],
      leaderboard: [
        {
          modelId: 'openai-gpt-5-6-sol',
          profileId: 'openai-gpt-5-6-sol-max',
          rank: 1,
          overallScore: 85.8,
          status: 'ESTIMATED',
          dimensions: [
            { dimension: 'reasoning', score: null, componentCount: 0 },
            { dimension: 'math', score: null, componentCount: 0 },
            { dimension: 'knowledge', score: null, componentCount: 0 },
            { dimension: 'language', score: null, componentCount: 0 },
            { dimension: 'instruction', score: null, componentCount: 0 },
            { dimension: 'coding', score: 85.8, componentCount: 1 },
            { dimension: 'agentic', score: null, componentCount: 0 },
            { dimension: 'context', score: null, componentCount: 0 },
          ],
          evidenceResultIds: [candidate.id],
        },
      ],
      costs: [],
      evidence: [candidate],
    });

    expect(product.leaderboard[0]?.dimensions.map(({ dimension }) => dimension))
      .toEqual([
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
});

describe('ProductVersionPointerSchema', () => {
  it('allows Draft and Published to point at the same immutable version', () => {
    const versionId =
      'sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';

    expect(
      ProductVersionPointerSchema.parse({
        schemaVersion: 'product-pointer-v1',
        channel: 'DRAFT',
        versionId,
        previousVersionId: null,
        updatedAt: '2026-07-16T00:00:00.000Z',
      }).versionId,
    ).toBe(versionId);
    expect(
      ProductVersionPointerSchema.parse({
        schemaVersion: 'product-pointer-v1',
        channel: 'PUBLISHED',
        versionId,
        previousVersionId: null,
        updatedAt: '2026-07-16T00:00:00.000Z',
      }).versionId,
    ).toBe(versionId);
  });
});

describe('deterministicJson', () => {
  it('serializes object keys deterministically without changing array order', () => {
    expect(
      deterministicJson({
        z: 1,
        nested: { b: 2, a: 1 },
        list: [{ d: 4, c: 3 }, 2],
      }),
    ).toBe(
      '{"list":[{"c":3,"d":4},2],"nested":{"a":1,"b":2},"z":1}\n',
    );
  });
});
