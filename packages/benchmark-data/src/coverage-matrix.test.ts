import { describe, expect, it } from 'vitest';
import { resolve } from 'node:path';

import {
  analyzeCoverageMatrix,
  formatCoverageMatrixMarkdown,
  loadWorkspaceCoverageData,
  type CoverageMatrixAnalysis,
} from './coverage-matrix.js';
import { parseReportArgs } from './report-coverage-matrix.js';
import { DIMENSION_IDS } from './index.js';
import type {
  BenchmarkDimensionMapping,
  CandidateResult,
  FrontierConfig,
  ModelCatalog,
  ProfilePolicy,
} from './index.js';

const mockProfilePolicy: ProfilePolicy = {
  schemaVersion: 'profile-policy-v2',
  effortOrder: ['non-reasoning', 'low', 'medium', 'high', 'xhigh', 'max'],
  defaultEffort: 'default',
};

const createMockCandidate = ({
  id,
  sourceId,
  modelId,
  rawName,
  benchmarkId,
  normalizedScore = 80,
  inclusion = 'INCLUDED',
  effort = 'high',
}: {
  id: string;
  sourceId: string;
  modelId: string;
  rawName: string;
  benchmarkId: string;
  normalizedScore?: number | null;
  inclusion?: 'INCLUDED' | 'EXCLUDED';
  effort?: string | null;
}): CandidateResult => ({
  schemaVersion: 'candidate-result-v1',
  id,
  sourceId,
  sourceRole: 'INDEPENDENT',
  benchmarkId,
  benchmarkVersion: null,
  model: {
    rawName,
    canonicalModelId: modelId,
    profileId: `${modelId}-${effort ?? 'default'}`,
  },
  profile: {
    effort,
    thinking: null,
    tools: null,
    harness: null,
    contextWindowTokens: null,
    quantization: null,
    attempts: null,
  },
  metric: {
    id: 'score',
    name: 'Score',
    unit: '%',
    higherIsBetter: true,
  },
  rawScore: normalizedScore ?? 0,
  normalizedScore,
  acquisitionStatus: 'FULL',
  inclusion,
  exclusionReason: inclusion === 'EXCLUDED' ? 'excluded for test' : null,
  sourceUrl: 'https://example.com/source',
  observedAt: '2026-08-20T00:00:00.000Z',
  sourcePublishedAt: '2026-08-20T00:00:00.000Z',
  evidenceIds: [
    'sha256:0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
  ],
  provenance: {
    rawScore: {
      evidenceId:
        'sha256:0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
      method: 'EXPORT',
      locator: 'row 1',
    },
  },
});

describe('coverage-matrix', () => {
  describe('qualification and active source isolation', () => {
    it('enforces exact qualification and whitelist rules', () => {
      const referenceDate = '2026-08-20';
      const catalog: ModelCatalog = {
        schemaVersion: 'model-catalog-v1',
        models: [
          {
            modelId: 'model-recent',
            providerId: 'provider-a',
            displayName: 'Recent Model',
            releaseDate: '2026-06-01',
            pricing: [],
            profilePricing: {},
          },
          {
            modelId: 'model-null-date',
            providerId: 'provider-a',
            displayName: 'Null Date Model',
            releaseDate: null,
            pricing: [],
            profilePricing: {},
          },
          {
            modelId: 'model-out-of-window',
            providerId: 'provider-b',
            displayName: 'Old Model',
            releaseDate: '2024-01-01', // >12 months old
            pricing: [],
            profilePricing: {},
          },
          {
            modelId: 'model-deprecated-in-window',
            providerId: 'provider-b',
            displayName: 'Deprecated Recent Model',
            releaseDate: '2026-07-01',
            deprecated: true,
            pricing: [],
            profilePricing: {},
          },
        ],
      };

      const frontierConfig: FrontierConfig = {
        schemaVersion: 'frontier-config-v2',
        qualificationWindowMonths: 12,
        manualModels: [],
      };

      const benchmarkMapping: BenchmarkDimensionMapping = {
        schemaVersion: 'benchmark-dimensions-v1',
        dimensions: [
          'reasoning',
          'math',
          'knowledge',
          'language',
          'instruction',
          'coding',
          'agentic',
          'context',
        ],
        benchmarks: [
          {
            id: 'bench-active',
            primaryDimension: 'reasoning',
            secondaryDimensions: ['coding'],
          },
          {
            id: 'bench-stopped',
            primaryDimension: 'math',
            secondaryDimensions: ['knowledge'],
          },
          {
            id: 'bench-old-only',
            primaryDimension: 'language',
            secondaryDimensions: [],
          },
        ],
      };

      const whitelist = ['active-source'];

      const sourceCandidates: CandidateResult[] = [
        createMockCandidate({
          id: 'c1',
          sourceId: 'active-source',
          modelId: 'model-recent',
          rawName: 'Recent Model (high)',
          benchmarkId: 'bench-active',
          normalizedScore: 80,
        }),
        createMockCandidate({
          id: 'c2',
          sourceId: 'active-source',
          modelId: 'model-null-date',
          rawName: 'Null Date Model (high)',
          benchmarkId: 'bench-active',
          normalizedScore: 75,
        }),
        createMockCandidate({
          id: 'c3',
          sourceId: 'active-source',
          modelId: 'model-out-of-window',
          rawName: 'Old Model (high)',
          benchmarkId: 'bench-active',
          normalizedScore: 90,
        }),
        createMockCandidate({
          id: 'c4',
          sourceId: 'active-source',
          modelId: 'model-deprecated-in-window',
          rawName: 'Deprecated Model (high)',
          benchmarkId: 'bench-active',
          normalizedScore: 95,
        }),
        // Candidate from stopped / non-whitelisted source
        createMockCandidate({
          id: 'c5',
          sourceId: 'stopped-source',
          modelId: 'model-recent',
          rawName: 'Recent Model (high)',
          benchmarkId: 'bench-stopped',
          normalizedScore: 85,
        }),
        // Active-source evidence from an ineligible model must not keep a
        // benchmark in the report universe.
        createMockCandidate({
          id: 'c6',
          sourceId: 'active-source',
          modelId: 'model-out-of-window',
          rawName: 'Old Model (high)',
          benchmarkId: 'bench-old-only',
          normalizedScore: 88,
        }),
      ];

      const analysis = analyzeCoverageMatrix({
        catalog,
        frontierConfig,
        benchmarkMapping,
        profilePolicy: mockProfilePolicy,
        whitelist,
        sourceCandidates,
        referenceDate,
      });

      // Assert qualified models: recent and null-date pass; out-of-window and deprecated fail
      expect(analysis.qualifiedModels.map((m) => m.modelId)).toEqual([
        'model-null-date',
        'model-recent',
      ]);
      expect(
        analysis.qualifiedModels.some(
          (m) =>
            m.modelId === 'model-out-of-window' ||
            m.modelId === 'model-deprecated-in-window',
        ),
      ).toBe(false);

      // Assert matrix rows contain ONLY qualified models
      expect(analysis.matrix.map((r) => r.model.modelId)).toEqual([
        'model-null-date',
        'model-recent',
      ]);

      // Assert active benchmarks contain ONLY active whitelisted benchmark
      expect(analysis.activeBenchmarkIds).toEqual(['bench-active']);
      expect(analysis.activeBenchmarkIds).not.toContain('bench-stopped');
      expect(analysis.activeBenchmarkIds).not.toContain('bench-old-only');

      // Assert tradeoff recommendations only contain active benchmarks and qualified models
      expect(analysis.tradeoffs).toHaveLength(1);
      expect(analysis.tradeoffs[0]?.benchmarkIds).toEqual(['bench-active']);
      expect(analysis.tradeoffs[0]?.completeModelCount).toBe(2);
      expect(
        analysis.tradeoffs[0]?.matchingModels.map((m) => m.modelId),
      ).toEqual(['model-null-date', 'model-recent']);
    });
  });

  describe('matrix construction and base model profile aggregation', () => {
    it('aggregates multiple product profiles under the base model bitmask', () => {
      const catalog: ModelCatalog = {
        schemaVersion: 'model-catalog-v1',
        models: [
          {
            modelId: 'model-a',
            providerId: 'provider-a',
            displayName: 'Model A',
            releaseDate: '2026-06-01',
            pricing: [],
            profilePricing: {},
          },
          {
            modelId: 'model-b',
            providerId: 'provider-b',
            displayName: 'Model B',
            releaseDate: '2026-06-01',
            pricing: [],
            profilePricing: {},
          },
        ],
      };

      const frontierConfig: FrontierConfig = {
        schemaVersion: 'frontier-config-v2',
        qualificationWindowMonths: 12,
        manualModels: [],
      };

      const benchmarkMapping: BenchmarkDimensionMapping = {
        schemaVersion: 'benchmark-dimensions-v1',
        dimensions: [
          'reasoning',
          'math',
          'knowledge',
          'language',
          'instruction',
          'coding',
          'agentic',
          'context',
        ],
        benchmarks: [
          {
            id: 'bench-1',
            primaryDimension: 'reasoning',
            secondaryDimensions: [],
          },
          {
            id: 'bench-2',
            primaryDimension: 'math',
            secondaryDimensions: [],
          },
          {
            id: 'bench-3',
            primaryDimension: 'coding',
            secondaryDimensions: [],
          },
        ],
      };

      const sourceCandidates: CandidateResult[] = [
        // Model A has bench-1 on profile 'low'
        createMockCandidate({
          id: 'c1',
          sourceId: 'src-1',
          modelId: 'model-a',
          rawName: 'Model A (low)',
          benchmarkId: 'bench-1',
          effort: 'low',
        }),
        // Model A has bench-2 on profile 'high'
        createMockCandidate({
          id: 'c2',
          sourceId: 'src-1',
          modelId: 'model-a',
          rawName: 'Model A (high)',
          benchmarkId: 'bench-2',
          effort: 'high',
        }),
        // Model A has EXCLUDED result on bench-3 (should NOT grant presence)
        createMockCandidate({
          id: 'c3',
          sourceId: 'src-1',
          modelId: 'model-a',
          rawName: 'Model A (high)',
          benchmarkId: 'bench-3',
          effort: 'high',
          inclusion: 'EXCLUDED',
        }),
        // Model B has bench-1 only
        createMockCandidate({
          id: 'c4',
          sourceId: 'src-1',
          modelId: 'model-b',
          rawName: 'Model B',
          benchmarkId: 'bench-1',
        }),
      ];

      const analysis = analyzeCoverageMatrix({
        catalog,
        frontierConfig,
        benchmarkMapping,
        profilePolicy: mockProfilePolicy,
        whitelist: ['src-1'],
        sourceCandidates,
        referenceDate: '2026-08-20',
      });

      expect(analysis.activeBenchmarkIds).toEqual(['bench-1', 'bench-2']);
      const rowA = analysis.matrix.find((r) => r.model.modelId === 'model-a')!;
      const rowB = analysis.matrix.find((r) => r.model.modelId === 'model-b')!;

      expect(rowA.presence['bench-1']).toBe(true);
      expect(rowA.presence['bench-2']).toBe(true);
      expect(rowA.presentBenchmarkCount).toBe(2);

      expect(rowB.presence['bench-1']).toBe(true);
      expect(rowB.presence['bench-2']).toBe(false);
      expect(rowB.presentBenchmarkCount).toBe(1);
    });
  });

  describe('subset optimization and frequency compression', () => {
    it('correctly scores subsets using compressed mask frequencies', () => {
      const catalog: ModelCatalog = {
        schemaVersion: 'model-catalog-v1',
        models: [
          {
            modelId: 'm1',
            providerId: 'p',
            displayName: 'M1',
            releaseDate: '2026-01-01',
            pricing: [],
            profilePricing: {},
          },
          {
            modelId: 'm2',
            providerId: 'p',
            displayName: 'M2',
            releaseDate: '2026-01-01',
            pricing: [],
            profilePricing: {},
          },
          {
            modelId: 'm3',
            providerId: 'p',
            displayName: 'M3',
            releaseDate: '2026-01-01',
            pricing: [],
            profilePricing: {},
          },
          {
            modelId: 'm4',
            providerId: 'p',
            displayName: 'M4',
            releaseDate: '2026-01-01',
            pricing: [],
            profilePricing: {},
          },
          {
            modelId: 'm5',
            providerId: 'p',
            displayName: 'M5',
            releaseDate: '2026-01-01',
            pricing: [],
            profilePricing: {},
          },
        ],
      };

      const benchmarkMapping: BenchmarkDimensionMapping = {
        schemaVersion: 'benchmark-dimensions-v1',
        dimensions: [
          'reasoning',
          'math',
          'knowledge',
          'language',
          'instruction',
          'coding',
          'agentic',
          'context',
        ],
        benchmarks: [
          { id: 'b1', primaryDimension: 'reasoning', secondaryDimensions: [] },
          { id: 'b2', primaryDimension: 'math', secondaryDimensions: [] },
          { id: 'b3', primaryDimension: 'coding', secondaryDimensions: [] },
        ],
      };

      // m1, m2, m3 have {b1, b2} -> identical mask
      // m4 has {b1, b2, b3}
      // m5 has {b3}
      const sourceCandidates: CandidateResult[] = [
        createMockCandidate({
          id: 'c1',
          sourceId: 's',
          modelId: 'm1',
          rawName: 'M1',
          benchmarkId: 'b1',
        }),
        createMockCandidate({
          id: 'c2',
          sourceId: 's',
          modelId: 'm1',
          rawName: 'M1',
          benchmarkId: 'b2',
        }),
        createMockCandidate({
          id: 'c3',
          sourceId: 's',
          modelId: 'm2',
          rawName: 'M2',
          benchmarkId: 'b1',
        }),
        createMockCandidate({
          id: 'c4',
          sourceId: 's',
          modelId: 'm2',
          rawName: 'M2',
          benchmarkId: 'b2',
        }),
        createMockCandidate({
          id: 'c5',
          sourceId: 's',
          modelId: 'm3',
          rawName: 'M3',
          benchmarkId: 'b1',
        }),
        createMockCandidate({
          id: 'c6',
          sourceId: 's',
          modelId: 'm3',
          rawName: 'M3',
          benchmarkId: 'b2',
        }),
        createMockCandidate({
          id: 'c7',
          sourceId: 's',
          modelId: 'm4',
          rawName: 'M4',
          benchmarkId: 'b1',
        }),
        createMockCandidate({
          id: 'c8',
          sourceId: 's',
          modelId: 'm4',
          rawName: 'M4',
          benchmarkId: 'b2',
        }),
        createMockCandidate({
          id: 'c9',
          sourceId: 's',
          modelId: 'm4',
          rawName: 'M4',
          benchmarkId: 'b3',
        }),
        createMockCandidate({
          id: 'c10',
          sourceId: 's',
          modelId: 'm5',
          rawName: 'M5',
          benchmarkId: 'b3',
        }),
      ];

      const analysis = analyzeCoverageMatrix({
        catalog,
        frontierConfig: {
          schemaVersion: 'frontier-config-v2',
          qualificationWindowMonths: 12,
          manualModels: [],
        },
        benchmarkMapping,
        profilePolicy: mockProfilePolicy,
        whitelist: ['s'],
        sourceCandidates,
        referenceDate: '2026-08-20',
      });

      // Verify mask frequency compression
      // Masks:
      // b1 (bit 0), b2 (bit 1), b3 (bit 2)
      // {b1, b2} = mask 3 -> count 3 (m1, m2, m3)
      // {b1, b2, b3} = mask 7 -> count 1 (m4)
      // {b3} = mask 4 -> count 1 (m5)
      const mask3 = analysis.maskFrequencies.find((f) => f.mask === 3);
      expect(mask3).toBeDefined();
      expect(mask3?.count).toBe(3);
      expect(mask3?.modelIds).toEqual(['m1', 'm2', 'm3']);

      // N=1: {b1} or {b2} gives 4 complete models (m1,m2,m3,m4); {b3} gives 2 (m4, m5)
      expect(analysis.tradeoffs[0]?.benchmarkCount).toBe(1);
      expect(analysis.tradeoffs[0]?.completeModelCount).toBe(4);

      // N=2: {b1, b2} gives 4 complete models (m1, m2, m3, m4)
      expect(analysis.tradeoffs[1]?.benchmarkCount).toBe(2);
      expect(analysis.tradeoffs[1]?.benchmarkIds).toEqual(['b1', 'b2']);
      expect(analysis.tradeoffs[1]?.completeModelCount).toBe(4);
      expect(
        analysis.tradeoffs[1]?.matchingModels.map((m) => m.modelId),
      ).toEqual(['m1', 'm2', 'm3', 'm4']);

      // N=3: {b1, b2, b3} gives 1 complete model (m4)
      expect(analysis.tradeoffs[2]?.benchmarkCount).toBe(3);
      expect(analysis.tradeoffs[2]?.benchmarkIds).toEqual(['b1', 'b2', 'b3']);
      expect(analysis.tradeoffs[2]?.completeModelCount).toBe(1);
      expect(
        analysis.tradeoffs[2]?.matchingModels.map((m) => m.modelId),
      ).toEqual(['m4']);
    });
  });

  describe('deterministic tie-breaking', () => {
    it('breaks ties by covered dimensions count, then lexicographical benchmark ID order', () => {
      const catalog: ModelCatalog = {
        schemaVersion: 'model-catalog-v1',
        models: [
          {
            modelId: 'm1',
            providerId: 'p',
            displayName: 'M1',
            releaseDate: '2026-01-01',
            pricing: [],
            profilePricing: {},
          },
          {
            modelId: 'm2',
            providerId: 'p',
            displayName: 'M2',
            releaseDate: '2026-01-01',
            pricing: [],
            profilePricing: {},
          },
        ],
      };

      const benchmarkMapping: BenchmarkDimensionMapping = {
        schemaVersion: 'benchmark-dimensions-v1',
        dimensions: [
          'reasoning',
          'math',
          'knowledge',
          'language',
          'instruction',
          'coding',
          'agentic',
          'context',
        ],
        benchmarks: [
          // bench-a covers reasoning (1 dim)
          {
            id: 'bench-a',
            primaryDimension: 'reasoning',
            secondaryDimensions: [],
          },
          // bench-b covers reasoning + math + coding (3 dims)
          {
            id: 'bench-b',
            primaryDimension: 'reasoning',
            secondaryDimensions: ['math', 'coding'],
          },
          // bench-c covers reasoning + math + coding (3 dims, same as bench-b)
          {
            id: 'bench-c',
            primaryDimension: 'reasoning',
            secondaryDimensions: ['math', 'coding'],
          },
        ],
      };

      // Both m1 and m2 have bench-a, bench-b, bench-c
      const sourceCandidates: CandidateResult[] = [
        createMockCandidate({
          id: 'c1',
          sourceId: 's',
          modelId: 'm1',
          rawName: 'M1',
          benchmarkId: 'bench-a',
        }),
        createMockCandidate({
          id: 'c2',
          sourceId: 's',
          modelId: 'm1',
          rawName: 'M1',
          benchmarkId: 'bench-b',
        }),
        createMockCandidate({
          id: 'c3',
          sourceId: 's',
          modelId: 'm1',
          rawName: 'M1',
          benchmarkId: 'bench-c',
        }),
        createMockCandidate({
          id: 'c4',
          sourceId: 's',
          modelId: 'm2',
          rawName: 'M2',
          benchmarkId: 'bench-a',
        }),
        createMockCandidate({
          id: 'c5',
          sourceId: 's',
          modelId: 'm2',
          rawName: 'M2',
          benchmarkId: 'bench-b',
        }),
        createMockCandidate({
          id: 'c6',
          sourceId: 's',
          modelId: 'm2',
          rawName: 'M2',
          benchmarkId: 'bench-c',
        }),
      ];

      const analysis = analyzeCoverageMatrix({
        catalog,
        frontierConfig: {
          schemaVersion: 'frontier-config-v2',
          qualificationWindowMonths: 12,
          manualModels: [],
        },
        benchmarkMapping,
        profilePolicy: mockProfilePolicy,
        whitelist: ['s'],
        sourceCandidates,
        referenceDate: '2026-08-20',
      });

      // At N=1: all three singletons have 2 models.
      // bench-a has 1 dimension (reasoning)
      // bench-b has 3 dimensions (reasoning, math, coding)
      // bench-c has 3 dimensions (reasoning, math, coding)
      // bench-b and bench-c tie on dimensions (3 > 1).
      // Lexicographical tie-breaker between bench-b and bench-c: 'bench-b' < 'bench-c' -> bench-b wins!
      expect(analysis.tradeoffs[0]?.benchmarkCount).toBe(1);
      expect(analysis.tradeoffs[0]?.benchmarkIds).toEqual(['bench-b']);
      expect(analysis.tradeoffs[0]?.coveredDimensionCount).toBe(3);
    });
  });

  describe('required benchmarks', () => {
    const build = (required?: string[]) => {
      const catalog: ModelCatalog = {
        schemaVersion: 'model-catalog-v1',
        models: ['m1', 'm2', 'm3'].map((modelId) => ({
          modelId,
          providerId: 'p',
          displayName: modelId.toUpperCase(),
          releaseDate: '2026-01-01',
          pricing: [],
          profilePricing: {},
        })),
      };
      // `pinned` is carried by only one model; `wide` by all three. Left free,
      // the optimum at N=1 picks `wide` and reports three models. Pinning
      // `pinned` forces the honest answer for the question actually being
      // asked, which is one model.
      const sourceCandidates = [
        ['m1', 'pinned'],
        ['m1', 'wide'],
        ['m2', 'wide'],
        ['m3', 'wide'],
      ].map(([modelId, benchmarkId], index) =>
        createMockCandidate({
          id: `c${index}`,
          sourceId: 'src-1',
          modelId: modelId!,
          rawName: modelId!.toUpperCase(),
          benchmarkId: benchmarkId!,
        }),
      );
      return analyzeCoverageMatrix({
        catalog,
        frontierConfig: {
          schemaVersion: 'frontier-config-v2',
          manualModels: [],
          qualificationWindowMonths: 12,
        },
        benchmarkMapping: {
          schemaVersion: 'benchmark-dimensions-v1',
          dimensions: [...DIMENSION_IDS],
          benchmarks: [
            {
              id: 'pinned',
              primaryDimension: 'coding',
              secondaryDimensions: [],
            },
            {
              id: 'wide',
              primaryDimension: 'reasoning',
              secondaryDimensions: [],
            },
          ],
        },
        profilePolicy: mockProfilePolicy,
        whitelist: ['src-1'],
        sourceCandidates,
        referenceDate: '2026-08-20',
        ...(required ? { requiredBenchmarkIds: required } : {}),
      });
    };

    it('keeps a pinned benchmark in every combination and drops the scales below it', () => {
      const free = build();
      expect(free.requiredBenchmarkIds).toEqual([]);
      expect(free.tradeoffs[0]?.benchmarkIds).toEqual(['wide']);
      expect(free.tradeoffs[0]?.completeModelCount).toBe(3);

      const pinned = build(['pinned']);
      expect(pinned.requiredBenchmarkIds).toEqual(['pinned']);
      expect(
        pinned.tradeoffs.every(({ benchmarkIds }) =>
          benchmarkIds.includes('pinned'),
        ),
      ).toBe(true);
      // No combination of size 1 contains the pin plus anything else, so the
      // curve starts at N=1 with the pin alone.
      expect(pinned.tradeoffs[0]?.benchmarkIds).toEqual(['pinned']);
      expect(pinned.tradeoffs[0]?.completeModelCount).toBe(1);
    });

    it('throws on a required benchmark that is not active rather than ignoring it', () => {
      // A typo must not silently produce the unconstrained curve.
      expect(() => build(['deepswe-1-1'])).toThrow(
        /required benchmarks are not active: deepswe-1-1/u,
      );
    });
  });

  describe('formatCoverageMatrixMarkdown', () => {
    it('produces valid markdown with required sections and model lists', () => {
      const mockAnalysis: CoverageMatrixAnalysis = {
        referenceDate: '2026-08-20',
        qualificationWindowMonths: 12,
        whitelist: ['source-1'],
        activeBenchmarkIds: ['bench-x', 'bench-y'],
        requiredBenchmarkIds: [],
        qualifiedModels: [
          { modelId: 'model-1', displayName: 'Model 1' },
          { modelId: 'model-2', displayName: 'Model 2' },
        ],
        matrix: [
          {
            model: { modelId: 'model-1', displayName: 'Model 1' },
            mask: 3,
            presentBenchmarks: ['bench-x', 'bench-y'],
            presence: { 'bench-x': true, 'bench-y': true },
            presentBenchmarkCount: 2,
          },
          {
            model: { modelId: 'model-2', displayName: 'Model 2' },
            mask: 1,
            presentBenchmarks: ['bench-x'],
            presence: { 'bench-x': true, 'bench-y': false },
            presentBenchmarkCount: 1,
          },
        ],
        tradeoffs: [
          {
            benchmarkCount: 1,
            benchmarkIds: ['bench-x'],
            completeModelCount: 2,
            coveredDimensionCount: 1,
            coveredDimensions: ['reasoning'],
            matchingModels: [
              { modelId: 'model-1', displayName: 'Model 1' },
              { modelId: 'model-2', displayName: 'Model 2' },
            ],
          },
          {
            benchmarkCount: 2,
            benchmarkIds: ['bench-x', 'bench-y'],
            completeModelCount: 1,
            coveredDimensionCount: 2,
            coveredDimensions: ['reasoning', 'coding'],
            matchingModels: [{ modelId: 'model-1', displayName: 'Model 1' }],
          },
        ],
        maskFrequencies: [
          { mask: 1, count: 1, modelIds: ['model-2'] },
          { mask: 3, count: 1, modelIds: ['model-1'] },
        ],
        benchmarkDimensions: {
          'bench-x': {
            primaryDimension: 'reasoning',
            secondaryDimensions: [],
            allDimensions: ['reasoning'],
          },
          'bench-y': {
            primaryDimension: 'coding',
            secondaryDimensions: [],
            allDimensions: ['coding'],
          },
        },
      };

      const markdown = formatCoverageMatrixMarkdown(mockAnalysis);

      expect(markdown).toContain('# Coverage Matrix Report');
      expect(markdown).toContain('## 1. Tradeoff Curve');
      expect(markdown).toContain('## 2. Tradeoff Combination Model Details');
      expect(markdown).toContain(
        '## 3. Qualified Model × Active Benchmark Presence Matrix',
      );
      expect(markdown).toContain('### Scale N = 1 (2 complete models)');
      expect(markdown).toContain('### Scale N = 2 (1 complete models)');
      expect(markdown).toContain('`model-1` (Model 1)');
      expect(markdown).toContain('`model-2` (Model 2)');
      expect(markdown).toContain(
        '| Model | Model ID | Total | `bench-x` | `bench-y` |',
      );
      expect(markdown).toContain('**Total Models Covered**');
    });
  });

  describe('CLI arguments parser and workspace loader', () => {
    it('parses various CLI argument formats', () => {
      const opts1 = parseReportArgs([
        '--reference-date',
        '2026-08-20',
        '--out',
        'out.md',
      ]);
      expect(opts1.referenceDate).toBe('2026-08-20');
      expect(opts1.outputPath).toBe('out.md');

      const opts2 = parseReportArgs([
        '--reference-date=2026-07-01',
        '--root=/path/to/repo',
      ]);
      expect(opts2.referenceDate).toBe('2026-07-01');
      expect(opts2.repositoryRoot).toBe('/path/to/repo');

      const opts3 = parseReportArgs([
        '/positional/repo/root',
        '-d',
        '2026-05-15',
      ]);
      expect(opts3.repositoryRoot).toBe('/positional/repo/root');
      expect(opts3.referenceDate).toBe('2026-05-15');

      expect(parseReportArgs([]).requiredBenchmarkIds).toBeUndefined();
      expect(
        parseReportArgs(['--require=deepswe-1-1, frontier-code-1-1'])
          .requiredBenchmarkIds,
      ).toEqual(['deepswe-1-1', 'frontier-code-1-1']);
      expect(
        parseReportArgs(['--require', 'deepswe-1-1', '--require', 'bench-x'])
          .requiredBenchmarkIds,
      ).toEqual(['deepswe-1-1', 'bench-x']);
    });

    it('loads workspace data and runs report on current repo', async () => {
      const repoRoot = resolve(import.meta.dirname, '../../..');
      const data = await loadWorkspaceCoverageData(repoRoot);

      expect(data.whitelist).toEqual([
        'artificial-analysis',
        'deepswe',
        'epoch-ai',
        'frontier-code',
        'livebench',
      ]);
      expect(data.sourceCandidates.length).toBeGreaterThan(0);
      expect(data.catalog.models.length).toBeGreaterThan(0);

      const analysis = analyzeCoverageMatrix({
        ...data,
        referenceDate: '2026-08-20',
      });

      expect(analysis.qualifiedModels.length).toBeGreaterThan(0);
      expect(analysis.activeBenchmarkIds.length).toBeGreaterThan(0);
      expect(analysis.tradeoffs.length).toBe(
        analysis.activeBenchmarkIds.length,
      );
      expect(analysis.matrix.length).toBe(analysis.qualifiedModels.length);

      // Verify every tradeoff row has a non-empty list of matching models
      for (const t of analysis.tradeoffs) {
        expect(t.completeModelCount).toBe(t.matchingModels.length);
      }
    });
  });
});
