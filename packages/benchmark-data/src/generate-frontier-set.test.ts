import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { commonQualityBenchmarks } from './generate-frontier-set.js';
import { loadWorkspaceCoverageData } from './coverage-matrix.js';
import { selectAaFrontier } from './frontier-selection.js';
import {
  FrontierIdentitiesSchema,
  resolveFrontierIdentities,
} from './frontier-identities.js';
import {
  BenchmarkDimensionMappingSchema,
  BenchmarkQualityPolicySchema,
  applyProductProfilePolicy,
  getComparisonOnlyBenchmarkIds,
  type CandidateResult,
} from './index.js';

const root = resolve(import.meta.dirname, '../../..');
const read = async (name: string) =>
  JSON.parse(await readFile(resolve(root, 'data/mappings', name), 'utf8'));

async function workspace() {
  const input = await loadWorkspaceCoverageData(root);
  const mapping = BenchmarkDimensionMappingSchema.parse(
    await read('benchmarks-v2.json'),
  );
  const quality = BenchmarkQualityPolicySchema.parse(
    await read('benchmark-quality-v2.json'),
  );
  const identities = FrontierIdentitiesSchema.parse(
    await read('frontier-identities.json'),
  );
  const candidates = applyProductProfilePolicy(
    resolveFrontierIdentities(input.sourceCandidates, identities),
    input.catalog,
    input.profilePolicy,
    getComparisonOnlyBenchmarkIds(mapping),
  );
  return { candidates, mapping, quality };
}

describe('frontier common quality core', () => {
  it('produces six complete profiles and twenty tests in five active categories', async () => {
    const { candidates, mapping, quality } = await workspace();
    const selection = selectAaFrontier(candidates);
    expect(selection.status, JSON.stringify(selection.issues)).toBe('selected');
    expect(selection.selectedProfileIds).toHaveLength(6);
    const result = commonQualityBenchmarks(
      candidates,
      selection.selectedProfileIds,
      mapping,
      quality,
    );
    expect(result.benchmarkIds).toHaveLength(20);
    expect(result.excludedBenchmarkIds).toContain('proofbench');
    expect(result.activeDimensionIds).toEqual([
      'reasoning',
      'knowledge',
      'comprehension',
      'coding',
      'agentic',
    ]);
    expect(result.dimensions.map((d) => [d.id, d.benchmarkIds.length])).toEqual(
      [
        ['reasoning', 1],
        ['knowledge', 3],
        ['comprehension', 4],
        ['coding', 5],
        ['agentic', 7],
        ['language', 0],
      ],
    );
    expect(result.profiles.every((p) => p.results.length === 20)).toBe(true);
  });

  it('never pools missing tests from another effort profile', async () => {
    const { candidates, mapping, quality } = await workspace();
    const { selectedProfileIds } = selectAaFrontier(candidates);
    const moved = candidates.map((c) =>
      c.model.profileId === selectedProfileIds[0] && c.benchmarkId === 'critpt'
        ? {
            ...c,
            model: { ...c.model, profileId: `${c.model.profileId}-other` },
          }
        : c,
    );
    const result = commonQualityBenchmarks(
      moved,
      selectedProfileIds,
      mapping,
      quality,
    );
    expect(result.benchmarkIds).not.toContain('critpt');
    expect(result.activeDimensionIds).not.toContain('reasoning');
  });

  it('enforces limited-test share after the profile intersection', async () => {
    const { candidates, mapping, quality } = await workspace();
    const { selectedProfileIds } = selectAaFrontier(candidates);
    const reduced = candidates.filter(
      (c) => !['medscribe', 'gdp-pdf', 'gdp-xlsx'].includes(c.benchmarkId),
    );
    const result = commonQualityBenchmarks(
      reduced,
      selectedProfileIds,
      mapping,
      quality,
    );
    expect(result.benchmarkIds).not.toContain('aa-lcr');
    expect(result.qualityShareRemovedBenchmarkIds).toContain('aa-lcr');
  });

  it('requires at least one common test and rejects duplicate profiles', async () => {
    const { mapping, quality } = await workspace();
    expect(() =>
      commonQualityBenchmarks([], ['missing'], mapping, quality),
    ).toThrow('no common');
    expect(() =>
      commonQualityBenchmarks(
        [] as CandidateResult[],
        ['a', 'a'],
        mapping,
        quality,
      ),
    ).toThrow('distinct');
  });
});
