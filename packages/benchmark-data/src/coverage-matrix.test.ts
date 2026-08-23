import { describe, expect, it } from 'vitest';
import { resolve } from 'node:path';

import {
  analyzeCoverageMatrix,
  compareTradeoffCandidates,
  compareTradeoffCurves,
  computeSourceComposition,
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
      expect(analysis.benchmarkSources).toEqual({
        'bench-active': ['active-source'],
      });

      // Assert tradeoff recommendations only contain active benchmarks and qualified models
      expect(analysis.tradeoffs).toHaveLength(1);
      expect(analysis.tradeoffs[0]?.candidates[0]?.benchmarkIds).toEqual([
        'bench-active',
      ]);
      expect(analysis.tradeoffs[0]?.candidates[0]?.completeModelCount).toBe(2);
      expect(
        analysis.tradeoffs[0]?.candidates[0]?.matchingModels.map(
          (m) => m.modelId,
        ),
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

      const mask3 = analysis.maskFrequencies.find((f) => f.mask === 3);
      expect(mask3).toBeDefined();
      expect(mask3?.count).toBe(3);
      expect(mask3?.modelIds).toEqual(['m1', 'm2', 'm3']);

      // N=1: {b1} or {b2} gives 4 complete models (m1,m2,m3,m4); {b3} gives 2 (m4, m5)
      expect(analysis.tradeoffs[0]?.benchmarkCount).toBe(1);
      expect(analysis.tradeoffs[0]?.candidates[0]?.completeModelCount).toBe(4);

      // N=2: {b1, b2} gives 4 complete models (m1, m2, m3, m4)
      expect(analysis.tradeoffs[1]?.benchmarkCount).toBe(2);
      expect(analysis.tradeoffs[1]?.candidates[0]?.benchmarkIds).toEqual([
        'b1',
        'b2',
      ]);
      expect(analysis.tradeoffs[1]?.candidates[0]?.completeModelCount).toBe(4);
      expect(
        analysis.tradeoffs[1]?.candidates[0]?.matchingModels.map(
          (m) => m.modelId,
        ),
      ).toEqual(['m1', 'm2', 'm3', 'm4']);

      // N=3: {b1, b2, b3} gives 1 complete model (m4)
      expect(analysis.tradeoffs[2]?.benchmarkCount).toBe(3);
      expect(analysis.tradeoffs[2]?.candidates[0]?.benchmarkIds).toEqual([
        'b1',
        'b2',
        'b3',
      ]);
      expect(analysis.tradeoffs[2]?.candidates[0]?.completeModelCount).toBe(1);
      expect(
        analysis.tradeoffs[2]?.candidates[0]?.matchingModels.map(
          (m) => m.modelId,
        ),
      ).toEqual(['m4']);
    });

    it('supports more than 30 active benchmarks without 32-bit mask overflow', () => {
      const benchmarkIds = Array.from(
        { length: 31 },
        (_, index) => `bench-${String(index + 1).padStart(2, '0')}`,
      );
      const catalog: ModelCatalog = {
        schemaVersion: 'model-catalog-v1',
        models: [
          {
            modelId: 'model-wide',
            providerId: 'provider',
            displayName: 'Model Wide',
            releaseDate: '2026-01-01',
            pricing: [],
            profilePricing: {},
          },
        ],
      };
      const analysis = analyzeCoverageMatrix({
        catalog,
        frontierConfig: {
          schemaVersion: 'frontier-config-v2',
          qualificationWindowMonths: 12,
          manualModels: [],
        },
        benchmarkMapping: {
          schemaVersion: 'benchmark-dimensions-v1',
          dimensions: [...DIMENSION_IDS],
          benchmarks: benchmarkIds.map((id) => ({
            id,
            primaryDimension: 'reasoning' as const,
            secondaryDimensions: [],
          })),
        },
        profilePolicy: mockProfilePolicy,
        whitelist: ['source'],
        sourceCandidates: benchmarkIds.map((benchmarkId, index) =>
          createMockCandidate({
            id: `candidate-${index}`,
            sourceId: 'source',
            modelId: 'model-wide',
            rawName: 'Model Wide',
            benchmarkId,
          }),
        ),
        referenceDate: '2026-08-20',
      });

      expect(analysis.activeBenchmarkIds).toHaveLength(31);
      expect(analysis.tradeoffs).toHaveLength(31);
      expect(analysis.tradeoffs[30]?.candidates[0]).toMatchObject({
        benchmarkIds,
        completeModelCount: 1,
      });
      expect(analysis.maskFrequencies[0]?.mask).toBe(2 ** 31 - 1);
    });
  });

  describe('source composition and ranking order', () => {
    it('ranks candidate with higher exclusiveSources first when model count and covered dimensions tie', () => {
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
        ],
      };

      const benchmarkMapping: BenchmarkDimensionMapping = {
        schemaVersion: 'benchmark-dimensions-v1',
        dimensions: [...DIMENSION_IDS],
        benchmarks: [
          {
            id: 'b-src1-1',
            primaryDimension: 'reasoning',
            secondaryDimensions: [],
          },
          {
            id: 'b-src1-2',
            primaryDimension: 'reasoning',
            secondaryDimensions: [],
          },
          {
            id: 'b-src2-1',
            primaryDimension: 'reasoning',
            secondaryDimensions: [],
          },
        ],
      };

      // Model m1 has all three benchmarks
      // b-src1-1 is exclusive to src-1
      // b-src1-2 is exclusive to src-1
      // b-src2-1 is exclusive to src-2
      const sourceCandidates: CandidateResult[] = [
        createMockCandidate({
          id: 'c1',
          sourceId: 'src-1',
          modelId: 'm1',
          rawName: 'M1',
          benchmarkId: 'b-src1-1',
        }),
        createMockCandidate({
          id: 'c2',
          sourceId: 'src-1',
          modelId: 'm1',
          rawName: 'M1',
          benchmarkId: 'b-src1-2',
        }),
        createMockCandidate({
          id: 'c3',
          sourceId: 'src-2',
          modelId: 'm1',
          rawName: 'M1',
          benchmarkId: 'b-src2-1',
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
        whitelist: ['src-1', 'src-2'],
        sourceCandidates,
        referenceDate: '2026-08-20',
        candidatesPerScale: 5,
      });

      // At N=2:
      // Subset {b-src1-1, b-src2-1} -> exclusiveSources = 2, maxSourceShare = 0.5
      // Subset {b-src1-2, b-src2-1} -> exclusiveSources = 2, maxSourceShare = 0.5
      // Subset {b-src1-1, b-src1-2} -> exclusiveSources = 1, maxSourceShare = 1.0
      // Subsets with 2 exclusiveSources rank above subset with 1 exclusiveSource
      const t2 = analysis.tradeoffs.find((t) => t.benchmarkCount === 2);
      expect(t2).toBeDefined();
      expect(t2!.candidates.length).toBe(3);

      expect(t2!.candidates[0]!.sourceComposition.exclusiveSources).toBe(2);
      expect(t2!.candidates[1]!.sourceComposition.exclusiveSources).toBe(2);
      expect(t2!.candidates[2]!.sourceComposition.exclusiveSources).toBe(1);
      expect(t2!.candidates[2]!.benchmarkIds).toEqual(['b-src1-1', 'b-src1-2']);
    });

    it('ranks candidate with lower maxSourceShare first when exclusiveSources also tie', () => {
      // Comparison between:
      // a: 2 benchmarks from src-1, 2 from src-2 (excl=2, maxSourceShare=2/4=0.5)
      // b: 3 benchmarks from src-1, 1 from src-2 (excl=2, maxSourceShare=3/4=0.75)
      const candA = {
        completeModelCount: 5,
        coveredDimensionCount: 8,
        exclusiveSources: 2,
        maxSourceShare: 0.5,
        benchmarkIds: ['b1', 'b2', 'b3', 'b4'],
      };
      const candB = {
        completeModelCount: 5,
        coveredDimensionCount: 8,
        exclusiveSources: 2,
        maxSourceShare: 0.75,
        benchmarkIds: ['b1', 'b2', 'b3', 'b5'],
      };

      expect(compareTradeoffCandidates(candA, candB)).toBeLessThan(0);
      expect(compareTradeoffCandidates(candB, candA)).toBeGreaterThan(0);
    });

    it('computes source composition metrics correctly', () => {
      const benchmarkSources: Record<string, string[]> = {
        b1: ['src-a'],
        b2: ['src-a'],
        b3: ['src-b'],
        b4: ['src-a', 'src-b'], // multi-source (not exclusive)
      };

      const comp = computeSourceComposition(
        ['b1', 'b2', 'b3', 'b4'],
        benchmarkSources,
        ['src-a', 'src-b'],
      );

      expect(comp.sourceSpan).toBe(2);
      expect(comp.exclusiveSources).toBe(2);
      // exclusive: b1, b2 -> src-a (2); b3 -> src-b (1); max is 2/4 = 0.5
      expect(comp.maxSourceShare).toBe(0.5);
      expect(comp.bySource).toEqual([
        {
          sourceId: 'src-a',
          benchmarkCount: 3, // b1, b2, b4
          exclusiveBenchmarkCount: 2, // b1, b2
        },
        {
          sourceId: 'src-b',
          benchmarkCount: 2, // b3, b4
          exclusiveBenchmarkCount: 1, // b3
        },
      ]);
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
        // Coverage counts the primary dimension only, matching how
        // `scoreProfiles` maps a benchmark into exactly one dimension. The
        // secondary lists below are deliberately non-empty and deliberately
        // ignored.
        benchmarks: [
          {
            id: 'bench-a',
            primaryDimension: 'reasoning',
            secondaryDimensions: ['math', 'coding'],
          },
          {
            id: 'bench-b',
            primaryDimension: 'math',
            secondaryDimensions: [],
          },
          {
            id: 'bench-c',
            primaryDimension: 'reasoning',
            secondaryDimensions: ['coding'],
          },
        ],
      };

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

      // N=1: every singleton has both models and covers exactly one primary
      // dimension, so the lexicographic tie-break decides. bench-a would carry
      // three dimensions if secondaries counted; they do not.
      expect(analysis.tradeoffs[0]?.benchmarkCount).toBe(1);
      expect(analysis.tradeoffs[0]?.candidates[0]?.benchmarkIds).toEqual([
        'bench-a',
      ]);
      expect(analysis.tradeoffs[0]?.candidates[0]?.coveredDimensionCount).toBe(
        1,
      );

      // N=2: {bench-a, bench-b} covers reasoning and math, while
      // {bench-a, bench-c} covers reasoning twice. Dimension count outranks
      // lexicographic order, so the pair spanning two dimensions wins even
      // though 'bench-c' never gets a chance to break the tie.
      expect(analysis.tradeoffs[1]?.candidates[0]?.benchmarkIds).toEqual([
        'bench-a',
        'bench-b',
      ]);
      expect(analysis.tradeoffs[1]?.candidates[0]?.coveredDimensionCount).toBe(
        2,
      );
    });
  });

  describe('required benchmarks and no default requirements', () => {
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
        // More than one candidate per scale, so "pinned appears as an option
        // but is never forced" is actually observable.
        candidatesPerScale: 5,
        ...(required ? { requiredBenchmarkIds: required } : {}),
      });
    };

    it('has no default requirements and yields empty requiredBenchmarkIds', () => {
      const free = build();
      expect(free.requiredBenchmarkIds).toEqual([]);
      expect(free.tradeoffs[0]?.candidates[0]?.benchmarkIds).toEqual(['wide']);
      expect(free.tradeoffs[0]?.candidates[0]?.completeModelCount).toBe(3);
      // 'pinned' is offered as a lower-ranked alternative, never forced into
      // every candidate the way an implicit default requirement would force it.
      expect(
        free.tradeoffs[0]?.candidates.every((c) =>
          c.benchmarkIds.includes('pinned'),
        ),
      ).toBe(false);
      expect(
        free.tradeoffs[0]?.candidates.some((c) =>
          c.benchmarkIds.includes('pinned'),
        ),
      ).toBe(true);
    });

    it('keeps a pinned benchmark in every combination when requiredBenchmarkIds is passed', () => {
      const pinned = build(['pinned']);
      expect(pinned.requiredBenchmarkIds).toEqual(['pinned']);
      expect(
        pinned.tradeoffs.every(({ candidates }) =>
          candidates.every(({ benchmarkIds }) =>
            benchmarkIds.includes('pinned'),
          ),
        ),
      ).toBe(true);
      expect(pinned.tradeoffs[0]?.candidates[0]?.benchmarkIds).toEqual([
        'pinned',
      ]);
      expect(pinned.tradeoffs[0]?.candidates[0]?.completeModelCount).toBe(1);
    });

    it('throws on a required benchmark that is not active rather than ignoring it', () => {
      expect(() => build(['deepswe-1-1'])).toThrow(
        /required benchmarks are not active: deepswe-1-1/u,
      );
    });
  });

  describe('requiredModelIds', () => {
    // m1 has both benchmarks, m2 only b1. Maximising the model count alone
    // prefers {b1}; pinning m1 is what forces the subset that keeps measuring
    // it on both.
    const build = (requiredModelIds?: string[]) => {
      const catalog: ModelCatalog = {
        schemaVersion: 'model-catalog-v1',
        models: ['m1', 'm2'].map((modelId) => ({
          modelId,
          providerId: 'p',
          displayName: modelId.toUpperCase(),
          releaseDate: '2026-01-01',
          pricing: [],
          profilePricing: {},
        })),
      };
      const rows: [string, string][] = [
        ['m1', 'b1'],
        ['m2', 'b1'],
        ['m1', 'b2'],
      ];
      return analyzeCoverageMatrix({
        catalog,
        frontierConfig: {
          schemaVersion: 'frontier-config-v2',
          qualificationWindowMonths: 12,
          manualModels: [],
        },
        benchmarkMapping: {
          schemaVersion: 'benchmark-dimensions-v1',
          dimensions: [...DIMENSION_IDS],
          benchmarks: [
            { id: 'b1', primaryDimension: 'coding', secondaryDimensions: [] },
            { id: 'b2', primaryDimension: 'math', secondaryDimensions: [] },
          ],
        },
        profilePolicy: mockProfilePolicy,
        whitelist: ['s'],
        sourceCandidates: rows.map(([modelId, benchmarkId], index) =>
          createMockCandidate({
            id: `c${index}`,
            sourceId: 's',
            modelId,
            rawName: modelId.toUpperCase(),
            benchmarkId,
          }),
        ),
        referenceDate: '2026-08-20',
        ...(requiredModelIds ? { requiredModelIds } : {}),
      });
    };

    it('defaults to pinning nothing', () => {
      const free = build();
      expect(free.requiredModelIds).toEqual([]);
      expect(free.tradeoffs[0]?.candidates[0]?.completeModelCount).toBe(2);
    });

    it('keeps a pinned model complete in every reported subset', () => {
      const pinned = build(['m1']);
      expect(pinned.requiredModelIds).toEqual(['m1']);
      const m1Index = pinned.qualifiedModels.findIndex(
        ({ modelId }) => modelId === 'm1',
      );
      expect(m1Index).toBeGreaterThanOrEqual(0);
      for (const { candidates } of pinned.tradeoffs) {
        for (const candidate of candidates) {
          expect(
            candidate.matchingModels.map(({ modelId }) => modelId),
          ).toContain('m1');
        }
      }
      // m2 lacks b2, so pinning m1 does not stop the optimum keeping both at
      // the scale where both are possible.
      expect(pinned.tradeoffs[0]?.candidates[0]?.completeModelCount).toBe(2);
      expect(pinned.tradeoffs[1]?.candidates[0]?.benchmarkIds).toEqual([
        'b1',
        'b2',
      ]);
      expect(pinned.tradeoffs[1]?.candidates[0]?.completeModelCount).toBe(1);
    });

    it('throws on a pinned model that is not qualified rather than ignoring it', () => {
      expect(() => build(['not-a-model'])).toThrowError(
        /required models are not qualified: not-a-model/u,
      );
    });
  });

  describe('requireAllSources', () => {
    // src-a holds two benchmarks, src-b holds one. Dropping src-b buys a model,
    // which is exactly the trade the constraint is there to expose.
    const build = (requireAllSources: boolean) => {
      const catalog: ModelCatalog = {
        schemaVersion: 'model-catalog-v1',
        models: ['m1', 'm2'].map((modelId) => ({
          modelId,
          providerId: 'p',
          displayName: modelId.toUpperCase(),
          releaseDate: '2026-01-01',
          pricing: [],
          profilePricing: {},
        })),
      };
      const rows: [string, string, string][] = [
        ['src-a', 'm1', 'a1'],
        ['src-a', 'm2', 'a1'],
        ['src-a', 'm1', 'a2'],
        ['src-a', 'm2', 'a2'],
        ['src-b', 'm1', 'b1'],
      ];
      return analyzeCoverageMatrix({
        catalog,
        frontierConfig: {
          schemaVersion: 'frontier-config-v2',
          qualificationWindowMonths: 12,
          manualModels: [],
        },
        benchmarkMapping: {
          schemaVersion: 'benchmark-dimensions-v1',
          dimensions: [...DIMENSION_IDS],
          benchmarks: ['a1', 'a2', 'b1'].map((id) => ({
            id,
            primaryDimension: 'coding' as const,
            secondaryDimensions: [],
          })),
        },
        profilePolicy: mockProfilePolicy,
        whitelist: ['src-a', 'src-b'],
        sourceCandidates: rows.map(([sourceId, modelId, benchmarkId], index) =>
          createMockCandidate({
            id: `c${index}`,
            sourceId,
            modelId,
            rawName: modelId.toUpperCase(),
            benchmarkId,
          }),
        ),
        referenceDate: '2026-08-20',
        requireAllSources,
      });
    };

    it('reports both sources as coverable', () => {
      expect(build(false).coverableSourceIds).toEqual(['src-a', 'src-b']);
      expect(build(false).requireAllSources).toBe(false);
      expect(build(true).requireAllSources).toBe(true);
    });

    it('lets the free curve drop a whole source to gain a model', () => {
      const free = build(false);
      const atN2 = free.tradeoffs.find(
        ({ benchmarkCount }) => benchmarkCount === 2,
      );
      expect(atN2?.candidates[0]?.benchmarkIds).toEqual(['a1', 'a2']);
      expect(atN2?.candidates[0]?.completeModelCount).toBe(2);
      expect(atN2?.candidates[0]?.sourceComposition.sourceSpan).toBe(1);
    });

    it('forces every source into every combination when set', () => {
      const all = build(true);
      expect(all.tradeoffs.length).toBeGreaterThan(0);
      for (const { candidates } of all.tradeoffs) {
        for (const candidate of candidates) {
          expect(candidate.sourceComposition.sourceSpan).toBe(2);
          expect(candidate.benchmarkIds).toContain('b1');
        }
      }
      const atN2 = all.tradeoffs.find(
        ({ benchmarkCount }) => benchmarkCount === 2,
      );
      expect(atN2?.candidates[0]?.completeModelCount).toBe(1);
    });

    it('never reports a scale smaller than one benchmark per covered source', () => {
      const all = build(true);
      expect(all.tradeoffs[0]?.benchmarkCount).toBe(2);
    });
  });

  describe('candidatesPerScale truncation and validation', () => {
    it('truncates candidates to candidatesPerScale', () => {
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
        ],
      };

      const benchmarkIds = ['b1', 'b2', 'b3', 'b4', 'b5'];
      const benchmarkMapping: BenchmarkDimensionMapping = {
        schemaVersion: 'benchmark-dimensions-v1',
        dimensions: [...DIMENSION_IDS],
        benchmarks: benchmarkIds.map((id) => ({
          id,
          primaryDimension: 'reasoning' as const,
          secondaryDimensions: [],
        })),
      };

      const sourceCandidates = benchmarkIds.map((id, index) =>
        createMockCandidate({
          id: `c${index}`,
          sourceId: 's',
          modelId: 'm1',
          rawName: 'M1',
          benchmarkId: id,
        }),
      );

      const k = 3;
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
        candidatesPerScale: k,
      });

      expect(analysis.candidatesPerScale).toBe(3);
      for (const t of analysis.tradeoffs) {
        expect(t.candidates.length).toBeLessThanOrEqual(k);
      }

      // At N=1 there are 5 individual benchmarks; should return exactly 3
      expect(analysis.tradeoffs[0]?.candidates).toHaveLength(3);
      expect(
        analysis.tradeoffs[0]?.candidates.map((c) => c.benchmarkIds),
      ).toEqual([['b1'], ['b2'], ['b3']]);
    });

    it('rejects candidatesPerScale < 1 or non-integer', () => {
      const baseInput = {
        catalog: { schemaVersion: 'model-catalog-v1' as const, models: [] },
        frontierConfig: {
          schemaVersion: 'frontier-config-v2' as const,
          manualModels: [],
          qualificationWindowMonths: 12,
        },
        benchmarkMapping: {
          schemaVersion: 'benchmark-dimensions-v1' as const,
          dimensions: [...DIMENSION_IDS],
          benchmarks: [],
        },
        profilePolicy: mockProfilePolicy,
        whitelist: ['s'],
        sourceCandidates: [],
        referenceDate: '2026-08-20',
      };

      expect(() =>
        analyzeCoverageMatrix({ ...baseInput, candidatesPerScale: 0 }),
      ).toThrow(/candidatesPerScale must be an integer >= 1/u);

      expect(() =>
        analyzeCoverageMatrix({ ...baseInput, candidatesPerScale: -2 }),
      ).toThrow(/candidatesPerScale must be an integer >= 1/u);

      expect(() =>
        analyzeCoverageMatrix({ ...baseInput, candidatesPerScale: 2.5 }),
      ).toThrow(/candidatesPerScale must be an integer >= 1/u);
    });
  });

  describe('compareTradeoffCurves', () => {
    it('compares unconstrained and baseline curves including null cases', () => {
      const makeAnalysis = (
        tradeoffs: {
          benchmarkCount: number;
          completeModelCount: number;
        }[],
      ): CoverageMatrixAnalysis => ({
        referenceDate: '2026-08-20',
        qualificationWindowMonths: 12,
        whitelist: ['s'],
        activeBenchmarkIds: ['b1', 'b2', 'b3', 'b4'],
        requiredBenchmarkIds: [],
        requireAllSources: false,
        requireAllDimensions: false,
        requiredModelIds: [],
        coverableSourceIds: ['source-1'],
        candidatesPerScale: 5,
        qualifiedModels: [],
        matrix: [],
        tradeoffs: tradeoffs.map(({ benchmarkCount, completeModelCount }) => ({
          benchmarkCount,
          candidates: [
            {
              benchmarkIds: [`b${benchmarkCount}`],
              completeModelCount,
              coveredDimensionCount: 1,
              coveredDimensions: ['reasoning'],
              matchingModels: [],
              sourceComposition: {
                sourceSpan: 1,
                exclusiveSources: 1,
                maxSourceShare: 1,
                bySource: [
                  {
                    sourceId: 's',
                    benchmarkCount: 1,
                    exclusiveBenchmarkCount: 1,
                  },
                ],
              },
            },
          ],
        })),
        maskFrequencies: [],
        benchmarkDimensions: {},
        benchmarkSources: {},
      });

      const unconstrained = makeAnalysis([
        { benchmarkCount: 1, completeModelCount: 10 },
        { benchmarkCount: 2, completeModelCount: 8 },
        { benchmarkCount: 3, completeModelCount: 5 },
      ]);

      const baseline = makeAnalysis([
        { benchmarkCount: 2, completeModelCount: 7 },
        { benchmarkCount: 3, completeModelCount: 5 },
        { benchmarkCount: 4, completeModelCount: 2 },
      ]);

      const rows = compareTradeoffCurves(unconstrained, baseline);

      expect(rows).toEqual([
        {
          benchmarkCount: 1,
          unconstrainedCompleteModelCount: 10,
          baselineCompleteModelCount: null,
          deltaVsSourceCompleteBaseline: null,
        },
        {
          benchmarkCount: 2,
          unconstrainedCompleteModelCount: 8,
          baselineCompleteModelCount: 7,
          deltaVsSourceCompleteBaseline: 1,
        },
        {
          benchmarkCount: 3,
          unconstrainedCompleteModelCount: 5,
          baselineCompleteModelCount: 5,
          deltaVsSourceCompleteBaseline: 0,
        },
        {
          benchmarkCount: 4,
          unconstrainedCompleteModelCount: null,
          baselineCompleteModelCount: 2,
          deltaVsSourceCompleteBaseline: null,
        },
      ]);
    });
  });

  describe('formatCoverageMatrixMarkdown', () => {
    it('produces valid markdown with definitions, disclosure, and candidate details', () => {
      const mockAnalysis: CoverageMatrixAnalysis = {
        referenceDate: '2026-08-20',
        qualificationWindowMonths: 12,
        whitelist: ['source-1'],
        activeBenchmarkIds: ['bench-x', 'bench-y'],
        requiredBenchmarkIds: [],
        requireAllSources: false,
        requireAllDimensions: false,
        requiredModelIds: [],
        coverableSourceIds: ['source-1'],
        candidatesPerScale: 5,
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
            candidates: [
              {
                benchmarkIds: ['bench-x'],
                completeModelCount: 2,
                coveredDimensionCount: 1,
                coveredDimensions: ['reasoning'],
                matchingModels: [
                  { modelId: 'model-1', displayName: 'Model 1' },
                  { modelId: 'model-2', displayName: 'Model 2' },
                ],
                sourceComposition: {
                  sourceSpan: 1,
                  exclusiveSources: 1,
                  maxSourceShare: 1,
                  bySource: [
                    {
                      sourceId: 'source-1',
                      benchmarkCount: 1,
                      exclusiveBenchmarkCount: 1,
                    },
                  ],
                },
              },
            ],
          },
          {
            benchmarkCount: 2,
            candidates: [
              {
                benchmarkIds: ['bench-x', 'bench-y'],
                completeModelCount: 1,
                coveredDimensionCount: 2,
                coveredDimensions: ['reasoning', 'coding'],
                matchingModels: [
                  { modelId: 'model-1', displayName: 'Model 1' },
                ],
                sourceComposition: {
                  sourceSpan: 1,
                  exclusiveSources: 1,
                  maxSourceShare: 1,
                  bySource: [
                    {
                      sourceId: 'source-1',
                      benchmarkCount: 2,
                      exclusiveBenchmarkCount: 2,
                    },
                  ],
                },
              },
            ],
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
        benchmarkSources: {
          'bench-x': ['source-1'],
          'bench-y': ['source-1'],
        },
      };

      const markdown = formatCoverageMatrixMarkdown(mockAnalysis);

      expect(markdown).toContain('# Coverage Matrix Report');
      expect(markdown).toContain('## Definitions');
      expect(markdown).toContain('`sourceSpan`');
      expect(markdown).toContain('`exclusiveSources`');
      expect(markdown).toContain('`maxSourceShare`');
      expect(markdown).toContain('`deltaVsSourceCompleteBaseline`');
      expect(markdown).toContain('Search & Pruning Disclosure');
      expect(markdown).toContain('## 1. Tradeoff Curve (Unconstrained)');
      expect(markdown).toContain('## 2. Tradeoff Combination Model Details');
      expect(markdown).toContain(
        '## 3. Qualified Model × Active Benchmark Presence Matrix',
      );
      expect(markdown).toContain(
        '### Scale N = 1, Candidate #1 (2 complete models)',
      );
      expect(markdown).toContain(
        '### Scale N = 2, Candidate #1 (1 complete models)',
      );
      expect(markdown).toContain('`model-1`');
      expect(markdown).toContain('`model-2`');
      expect(markdown).toContain('`source-1` 1 (1 exclusive)');
      expect(markdown).toContain(
        '| Model | Model ID | Total | `bench-x` | `bench-y` |',
      );
      expect(markdown).toContain('**Total Models Covered**');
    });

    it('renders comparison and all-sources sections when a baseline is provided', () => {
      const mockAnalysis: CoverageMatrixAnalysis = {
        referenceDate: '2026-08-20',
        qualificationWindowMonths: 12,
        whitelist: ['source-1'],
        activeBenchmarkIds: ['bench-x', 'bench-y'],
        requiredBenchmarkIds: [],
        requireAllSources: false,
        requireAllDimensions: false,
        requiredModelIds: [],
        coverableSourceIds: ['source-1'],
        candidatesPerScale: 5,
        qualifiedModels: [{ modelId: 'model-1', displayName: 'Model 1' }],
        matrix: [],
        tradeoffs: [
          {
            benchmarkCount: 1,
            candidates: [
              {
                benchmarkIds: ['bench-x'],
                completeModelCount: 1,
                coveredDimensionCount: 1,
                coveredDimensions: ['reasoning'],
                matchingModels: [
                  { modelId: 'model-1', displayName: 'Model 1' },
                ],
                sourceComposition: {
                  sourceSpan: 1,
                  exclusiveSources: 1,
                  maxSourceShare: 1,
                  bySource: [
                    {
                      sourceId: 'source-1',
                      benchmarkCount: 1,
                      exclusiveBenchmarkCount: 1,
                    },
                  ],
                },
              },
            ],
          },
        ],
        maskFrequencies: [],
        benchmarkDimensions: {},
        benchmarkSources: { 'bench-x': ['source-1'] },
      };

      const baselineAnalysis: CoverageMatrixAnalysis = {
        ...mockAnalysis,
        requireAllSources: true,
      };

      const markdown = formatCoverageMatrixMarkdown(mockAnalysis, {
        baseline: baselineAnalysis,
        minBenchmarkCount: 1,
      });

      expect(markdown).toContain(
        '## 2. Curve Comparison (Unconstrained vs. All Sources)',
      );
      expect(markdown).toContain(
        '## 3. Tradeoff Curve (Every Source Represented)',
      );
      expect(markdown).toContain('## 4. Unconstrained Candidate Details');
      expect(markdown).toContain('## 5. All-Sources Candidate Details');
      expect(markdown).toContain(
        '## 6. Qualified Model × Active Benchmark Presence Matrix',
      );
      // The scale filter is what keeps unreachable scales out of both curves.
      expect(
        formatCoverageMatrixMarkdown(mockAnalysis, {
          baseline: baselineAnalysis,
          minBenchmarkCount: 2,
        }),
      ).not.toContain('Scale N = 1, Candidate #1');
    });
  });

  describe('CLI arguments parser and workspace loader', () => {
    it('parses various CLI argument formats including candidates', () => {
      const opts1 = parseReportArgs([
        '--reference-date',
        '2026-08-20',
        '--out',
        'out.md',
        '--candidates',
        '3',
      ]);
      expect(opts1.referenceDate).toBe('2026-08-20');
      expect(opts1.outputPath).toBe('out.md');
      expect(opts1.candidatesPerScale).toBe(3);

      const opts2 = parseReportArgs([
        '--reference-date=2026-07-01',
        '--root=/path/to/repo',
        '--candidates=7',
      ]);
      expect(opts2.referenceDate).toBe('2026-07-01');
      expect(opts2.repositoryRoot).toBe('/path/to/repo');
      expect(opts2.candidatesPerScale).toBe(7);

      const opts3 = parseReportArgs([
        '/positional/repo/root',
        '-d',
        '2026-05-15',
        '-k',
        '2',
      ]);
      expect(opts3.repositoryRoot).toBe('/positional/repo/root');
      expect(opts3.referenceDate).toBe('2026-05-15');
      expect(opts3.candidatesPerScale).toBe(2);

      expect(parseReportArgs([]).requiredBenchmarkIds).toBeUndefined();
      expect(parseReportArgs([]).candidatesPerScale).toBeUndefined();
      expect(
        parseReportArgs(['--require=deepswe-1-1, frontier-code-1-1'])
          .requiredBenchmarkIds,
      ).toEqual(['deepswe-1-1', 'frontier-code-1-1']);
      expect(
        parseReportArgs(['--require', 'deepswe-1-1', '--require', 'bench-x'])
          .requiredBenchmarkIds,
      ).toEqual(['deepswe-1-1', 'bench-x']);

      // Error cases for invalid --candidates
      expect(() => parseReportArgs(['--candidates=0'])).toThrow(
        /Invalid value for --candidates: 0/u,
      );
      expect(() => parseReportArgs(['--candidates=-1'])).toThrow(
        /Invalid value for --candidates: -1/u,
      );
      expect(() => parseReportArgs(['--candidates', 'abc'])).toThrow(
        /Invalid value for --candidates: abc/u,
      );
      expect(() => parseReportArgs(['--candidates=1.5'])).toThrow(
        /Invalid value for --candidates: 1.5/u,
      );
      expect(parseReportArgs([]).minBenchmarkCount).toBeUndefined();
      expect(parseReportArgs(['--min-n=12']).minBenchmarkCount).toBe(12);
      expect(parseReportArgs(['--min-n', '12']).minBenchmarkCount).toBe(12);
      expect(() => parseReportArgs(['--min-n=0'])).toThrow(
        /Invalid value for --min-n: 0/u,
      );
    });

    // The real matrix is 45 active benchmarks x 53 qualified models. The DP is
    // measured at ~1.9s / 333MB with k = 1 and ~10.5s / 1.1GB with k = 5, so the
    // smoke test pins k = 1; k-truncation is covered by the fixtures above.
    it('loads workspace data and runs report on current repo', async () => {
      const repoRoot = resolve(import.meta.dirname, '../../..');
      const data = await loadWorkspaceCoverageData(repoRoot);

      expect(data.whitelist).toEqual([
        'arc-prize',
        'artificial-analysis',
        'deepswe',
        'epoch-ai',
        'frontier-code',
        'livebench',
        'vals-ai',
        'zapier-automationbench',
      ]);
      expect(data.sourceCandidates.length).toBeGreaterThan(0);
      expect(data.catalog.models.length).toBeGreaterThan(0);

      const analysis = analyzeCoverageMatrix({
        ...data,
        referenceDate: '2026-08-20',
        candidatesPerScale: 1,
      });

      expect(analysis.qualifiedModels.length).toBeGreaterThan(0);
      expect(analysis.activeBenchmarkIds.length).toBeGreaterThan(0);
      expect(analysis.tradeoffs.length).toBe(
        analysis.activeBenchmarkIds.length,
      );
      expect(analysis.matrix.length).toBe(analysis.qualifiedModels.length);
      expect(Object.keys(analysis.benchmarkSources).length).toBe(
        analysis.activeBenchmarkIds.length,
      );

      // Verify every tradeoff row has candidates with matching models
      for (const t of analysis.tradeoffs) {
        expect(t.candidates.length).toBeGreaterThan(0);
        for (const cand of t.candidates) {
          expect(cand.completeModelCount).toBe(cand.matchingModels.length);
          expect(cand.sourceComposition.sourceSpan).toBeGreaterThan(0);
        }
      }
    }, 60_000);
  });
});
