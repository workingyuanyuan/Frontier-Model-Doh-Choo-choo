import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  commonQualityBenchmarks,
  createAaCohorts,
} from './generate-frontier-set.js';
import { loadWorkspaceCoverageData } from './coverage-matrix.js';
import { selectAaTopTen } from './frontier-selection.js';
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
  it('produces eight complete default profiles and seventeen tests in five active categories', async () => {
    const { candidates, mapping, quality } = await workspace();
    const selection = selectAaTopTen(candidates);
    expect(selection.status, JSON.stringify(selection.issues)).toBe('selected');
    expect(selection.selectedProfileIds).toHaveLength(10);
    const result = commonQualityBenchmarks(
      candidates,
      selection.selectedProfileIds.slice(0, 8),
      mapping,
      quality,
    );
    expect(result.benchmarkIds).toHaveLength(17);
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
        ['comprehension', 3],
        ['coding', 3],
        ['agentic', 7],
        ['language', 0],
      ],
    );
    expect(result.profiles.every((p) => p.results.length === 17)).toBe(true);
  });

  it('never pools missing tests from another effort profile', async () => {
    const { candidates, mapping, quality } = await workspace();
    const selectedProfileIds = selectAaTopTen(
      candidates,
    ).selectedProfileIds.slice(0, 8);
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
    const selectedProfileIds = selectAaTopTen(
      candidates,
    ).selectedProfileIds.slice(0, 8);
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

  it('builds exact AA prefixes with independently derived quality intersections', async () => {
    const { candidates, mapping, quality } = await workspace();
    const selection = selectAaTopTen(candidates);
    const cohorts = createAaCohorts(
      candidates,
      selection.topTen,
      mapping,
      quality,
    );
    expect(cohorts.map(({ targetModelCount }) => targetModelCount)).toEqual([
      2, 3, 4, 5, 6, 7, 8, 9, 10,
    ]);
    expect(cohorts.map(({ benchmarkIds }) => benchmarkIds.length)).toEqual([
      29, 29, 27, 20, 20, 19, 17, 14, 14,
    ]);
    expect(cohorts[6]!.id).toBe('aa-frontier');
    for (const cohort of cohorts) {
      expect(cohort.profileIds).toEqual(
        selection.selectedProfileIds.slice(0, cohort.targetModelCount),
      );
      expect(cohort.profiles.map(({ profileId }) => profileId)).toEqual(
        cohort.profileIds,
      );
      expect(
        cohort.profiles.every(
          ({ results }) => results.length === cohort.benchmarkIds.length,
        ),
      ).toBe(true);
      expect(cohort.benchmarkIds).toEqual(
        commonQualityBenchmarks(candidates, cohort.profileIds, mapping, quality)
          .benchmarkIds,
      );
    }
    const skipNinth = commonQualityBenchmarks(
      candidates,
      [
        ...selection.selectedProfileIds.slice(0, 8),
        selection.selectedProfileIds[9]!,
      ],
      mapping,
      quality,
    );
    expect(skipNinth.benchmarkIds).toEqual(cohorts[6]!.benchmarkIds);
    expect(
      cohorts[6]!.benchmarkIds.filter(
        (id) => !cohorts[7]!.benchmarkIds.includes(id),
      ),
    ).toEqual(['aa-lcr', 'medcode', 'medscribe']);
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
