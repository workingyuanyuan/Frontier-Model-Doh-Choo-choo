import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import approvedMapping from '../../../data/mappings/benchmarks-v2.json';
import qualityPolicy from '../../../data/mappings/benchmark-quality-v2.json';
import {
  BenchmarkDimensionMappingSchema,
  CATALOG_DIMENSION_IDS,
} from './index.js';

const readArtifact = (name: string) =>
  JSON.parse(
    readFileSync(
      new URL(`../../../docs/analysis/${name}`, import.meta.url),
      'utf8',
    ),
  );

describe('approved capability taxonomy v2', () => {
  it('validates the six canonical dimensions and their benchmark relationships', () => {
    const mapping = BenchmarkDimensionMappingSchema.parse(approvedMapping);
    expect(mapping.dimensions).toEqual(CATALOG_DIMENSION_IDS);
    expect(new Set(mapping.benchmarks.map(({ id }) => id)).size).toBe(
      mapping.benchmarks.length,
    );
    for (const benchmark of mapping.benchmarks) {
      expect(benchmark.secondaryDimensions).not.toContain(
        benchmark.primaryDimension,
      );
      expect(new Set(benchmark.secondaryDimensions).size).toBe(
        benchmark.secondaryDimensions.length,
      );
    }
  });

  it('implements every assignment in the 54-benchmark approved proposal', () => {
    const proposal = readArtifact(
      '2026-10-03-dimension-proposal-mapping.json',
    ) as {
      rows: { benchmarkId: string; proposedDimension: string }[];
    };
    const approvedDimensions: Record<string, string> = {
      推理與解題: 'reasoning',
      知識與專業判斷: 'knowledge',
      資料理解與整合: 'comprehension',
      程式與軟體工程: 'coding',
      工具與工作流程: 'agentic',
      語言與指令遵循: 'language',
    };
    expect(proposal.rows).toHaveLength(54);
    expect(
      new Set(proposal.rows.map(({ benchmarkId }) => benchmarkId)).size,
    ).toBe(54);
    const primaryDimensions = new Set<string>();
    for (const row of proposal.rows) {
      const expected = approvedDimensions[row.proposedDimension];
      expect(expected).toBeDefined();
      expect(
        approvedMapping.benchmarks.find(({ id }) => id === row.benchmarkId)
          ?.primaryDimension,
      ).toBe(expected);
      primaryDimensions.add(expected!);
    }
    expect([...primaryDimensions].sort()).toEqual(
      [...CATALOG_DIMENSION_IDS].sort(),
    );
  });

  it('keeps document tasks, specialist rules, software repair and terminal actions distinct', () => {
    const primary = (id: string) =>
      approvedMapping.benchmarks.find((benchmark) => benchmark.id === id)
        ?.primaryDimension;
    for (const id of [
      'gdp-xlsx',
      'gdp-pdf',
      'chartography',
      'aa-lcr',
      'corpfin',
      'medscribe',
    ]) {
      expect(primary(id)).toBe('comprehension');
    }
    expect(primary('legal-bench')).toBe('knowledge');
    expect(primary('cyber')).toBe('coding');
    expect(primary('terminal-bench-2-1')).toBe('agentic');
    expect(primary('proofbench')).toBe('reasoning');
  });
});

describe('approved ProofBench quality review', () => {
  it('excludes ProofBench while retaining the reviewed limitation rule', () => {
    expect(qualityPolicy.excludedBenchmarkIds).toEqual([
      'aime',
      'programbench',
      'proofbench',
    ]);
    expect(qualityPolicy.limitedBenchmarkIds).toEqual([
      'aa-lcr',
      'gpqa-diamond',
      'legal-bench',
      'mmlu-pro',
      'tax-eval-v2',
    ]);
    expect(qualityPolicy.minOtherBenchmarksPerLimited).toBe(2);
    expect(qualityPolicy.reviewedAt).toBe('2026-10-03');
  });

  it('ties the exclusion to six exact frontier scores and source evidence locators', () => {
    const review = readArtifact('2026-10-03-proofbench-quality-review.json');
    const cohort = readArtifact('2026-10-03-frontier-cohort.json');
    expect(qualityPolicy.evidencePath).toBe(
      'docs/analysis/2026-10-03-proofbench-quality-review.json',
    );
    expect(review.productVersion).toBe(cohort.productVersion);
    expect(review.productSha256).toBe(cohort.productSha256);
    expect(review.rows).toHaveLength(6);
    expect(review.statistics).toMatchObject({
      modelCount: 6,
      min: 99,
      max: 100,
      mean: 99.5,
      range: 1,
      populationStandardDeviation: 0.5,
      distinctScoreCount: 2,
    });
    for (const row of review.rows) {
      const benchmark = cohort.matrix.find(
        (model: { modelId: string }) => model.modelId === row.modelId,
      ).benchmarks.proofbench;
      expect(row.score).toBe(benchmark.score);
      expect(row.profileId).toBe(benchmark.profileId);
      expect(row.candidateId).toBe(benchmark.id);
      expect(row.scoreProvenance).toEqual(benchmark.provenance.rawScore);
    }
  });
});
