import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { CandidateResultSchema, SourcesConfigSchema } from './index.js';
import { buildWorkspaceProduct, writeWorkspaceCurrent } from './workspace.js';

describe('buildWorkspaceProduct', () => {
  // Full-workspace assembly needs headroom on shared CI runners.
  it('preserves every existing preset and cost with the real FrontierSWE V2 snapshot', async () => {
    const root = resolve(import.meta.dirname, '../../..');
    const baselineRoot = await mkdtemp(join(tmpdir(), 'comparison-baseline-'));
    const sourceConfig = SourcesConfigSchema.parse(
      JSON.parse(
        await readFile(join(root, 'data', 'mappings', 'sources.json'), 'utf8'),
      ),
    );
    try {
      await cp(
        join(root, 'data', 'mappings'),
        join(baselineRoot, 'data', 'mappings'),
        {
          recursive: true,
        },
      );
      const whitelist = sourceConfig.whitelist.filter(
        (source) => source !== 'frontier-swe',
      );
      await writeFile(
        join(baselineRoot, 'data', 'mappings', 'sources.json'),
        JSON.stringify({
          ...sourceConfig,
          whitelist,
        }),
      );
      for (const source of whitelist) {
        const destination = join(baselineRoot, 'data', 'sources', source);
        await mkdir(destination, { recursive: true });
        for (const file of [
          'manifest.json',
          'candidates.json',
          'costs.json',
          'evidence-index.json',
        ]) {
          const origin = join(root, 'data', 'sources', source, file);
          if (existsSync(origin)) await cp(origin, join(destination, file));
        }
      }
      const generatedAt = '2026-10-01T00:00:00.000Z';
      const baseline = await buildWorkspaceProduct(baselineRoot, generatedAt);
      const added = await buildWorkspaceProduct(root, generatedAt);
      expect(added.presets).toEqual(baseline.presets);
      expect(added.defaultPresetId).toEqual(baseline.defaultPresetId);
      expect(added.costs).toEqual(baseline.costs);
      expect(added.frontier).toEqual(baseline.frontier);
      expect(
        added.evidence.filter((row) => row.sourceId !== 'frontier-swe'),
      ).toEqual(baseline.evidence);
      const comparisonIds = new Set(added.comparisonEvidenceIds);
      expect(
        added.evidence.some(
          (row) => row.sourceId === 'frontier-swe' && comparisonIds.has(row.id),
        ),
      ).toBe(true);
      const existingProfiles = new Set(baseline.profiles.map(({ id }) => id));
      expect(
        added.profiles.filter(({ id }) => existingProfiles.has(id)),
      ).toEqual(baseline.profiles);
    } finally {
      await rm(baselineRoot, { recursive: true, force: true });
    }
  }, 15_000);

  it('assembles the verified workspace sources into a frontier ProductVersion', async () => {
    const root = resolve(import.meta.dirname, '../../..');
    const product = await buildWorkspaceProduct(
      root,
      '2026-07-16T14:00:00.000Z',
    );

    const defaultLeaderboard =
      product.presets.find(({ id }) => id === product.defaultPresetId)
        ?.leaderboard ?? [];

    expect(product.frontier.length).toBeGreaterThanOrEqual(5);
    expect(defaultLeaderboard.length).toBeGreaterThan(0);
    expect(product.schemaVersion).toBe('product-version-v4');

    // The live preset is tied to the freshly selected AA winning profiles.
    expect(product.presets.length).toBeGreaterThan(0);
    const defaultPreset = product.presets.find(
      ({ id }) => id === product.defaultPresetId,
    );
    expect(defaultPreset).toBeDefined();

    // Completeness is per PROFILE: a model counts only when one of its
    // profiles carries the whole preset, which is the bar the main screen
    // applies. Unioning across profiles is what used to overstate the count.
    const benchmarksByProfile = new Map<string, Set<string>>();
    const modelOfProfile = new Map<string, string>();
    for (const row of product.evidence) {
      const modelId = row.model.canonicalModelId;
      const profileId = row.model.profileId;
      if (
        modelId === null ||
        profileId === null ||
        row.inclusion !== 'INCLUDED' ||
        row.normalizedScore === null
      ) {
        continue;
      }
      const owned = benchmarksByProfile.get(profileId) ?? new Set<string>();
      owned.add(row.benchmarkId);
      benchmarksByProfile.set(profileId, owned);
      modelOfProfile.set(profileId, modelId);
    }

    const completeModelsFor = (
      benchmarkIds: readonly string[],
    ): Set<string> => {
      const models = new Set<string>();
      for (const [profileId, owned] of benchmarksByProfile) {
        if (benchmarkIds.every((benchmarkId) => owned.has(benchmarkId))) {
          models.add(modelOfProfile.get(profileId)!);
        }
      }
      return models;
    };
    const artifact = JSON.parse(
      await readFile(
        join(root, 'data', 'mappings', 'frontier-set.json'),
        'utf8',
      ),
    ) as {
      selection: { selectedModelIds: string[]; selectedProfileIds: string[] };
      benchmarkIds: string[];
      cohorts: { id: string; profileIds: string[]; modelIds: string[] }[];
    };
    expect(product.frontier.map(({ modelId }) => modelId)).toEqual(
      artifact.selection.selectedModelIds,
    );
    expect(defaultPreset!.benchmarkIds).toEqual(artifact.benchmarkIds);
    expect(product.defaultPresetId).toBe('aa-frontier');
    expect(product.frontier).toHaveLength(10);
    expect(
      product.presets.map(({ targetModelCount }) => targetModelCount),
    ).toEqual([2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(defaultPreset!.targetModelCount).toBe(8);
    expect(defaultPreset!.benchmarkIds).toHaveLength(17);
    expect(
      defaultPreset!.leaderboard.map(({ profileId }) => profileId).sort(),
    ).toEqual(artifact.selection.selectedProfileIds.slice(0, 8).toSorted());

    for (const preset of product.presets) {
      const completeModels = completeModelsFor(preset.benchmarkIds);
      expect(preset.leaderboard).toHaveLength(preset.targetModelCount);
      const cohort = artifact.cohorts.find(({ id }) => id === preset.id)!;
      expect(
        preset.leaderboard.map(({ profileId }) => profileId).sort(),
      ).toEqual(cohort.profileIds.toSorted());
      for (const modelId of cohort.modelIds) {
        expect({
          preset: preset.id,
          modelId,
          complete: completeModels.has(modelId),
        }).toEqual({ preset: preset.id, modelId, complete: true });
      }

      // A preset scores only its own benchmarks, so nothing outside it may be
      // cited as the evidence behind a score.
      const allowed = new Set(preset.benchmarkIds);
      const evidenceById = new Map(
        product.evidence.map((row) => [row.id, row]),
      );
      for (const row of preset.leaderboard) {
        const axes = row.dimensions.filter(({ score }) => score !== null);
        const effectiveWeight = axes.reduce(
          (sum, axis) => sum + (axis.componentCount === 1 ? 0.5 : 1),
          0,
        );
        const weightedTotal = axes.reduce(
          (sum, axis) =>
            sum + axis.score! * (axis.componentCount === 1 ? 0.5 : 1),
          0,
        );
        expect(row.overallScore).toBeCloseTo(
          weightedTotal / effectiveWeight,
          10,
        );
        for (const evidenceId of row.evidenceResultIds) {
          expect(allowed.has(evidenceById.get(evidenceId)!.benchmarkId)).toBe(
            true,
          );
        }
      }
    }
    expect(
      defaultLeaderboard.every((row) => !Object.hasOwn(row, 'status')),
    ).toBe(true);
    expect(
      defaultLeaderboard[0]?.dimensions.map(({ dimension }) => dimension),
    ).toEqual(['reasoning', 'knowledge', 'comprehension', 'coding', 'agentic']);
    for (const row of defaultLeaderboard) {
      expect(row.dimensions[0]!.componentCount).toBe(1);
      const weightedTotal = row.dimensions.reduce(
        (sum, axis) =>
          sum + axis.score! * (axis.componentCount === 1 ? 0.5 : 1),
        0,
      );
      expect(row.overallScore).toBeCloseTo(weightedTotal / 4.5, 10);
    }
    const comparisonIds = new Set(product.comparisonEvidenceIds);
    const comparisonBenchmarks = new Set(
      product.evidence
        .filter(({ id }) => comparisonIds.has(id))
        .map(({ benchmarkId }) => benchmarkId),
    );
    expect(product.benchmarkQuality!.excludedBenchmarkIds).toEqual([
      'aime',
      'programbench',
      'proofbench',
    ]);
    for (const id of ['aime', 'programbench', 'proofbench'])
      expect(comparisonBenchmarks.has(id)).toBe(false);
    expect(comparisonBenchmarks.has('frontier-swe-v2')).toBe(true);
    // Limited tests remain available; ratios apply after selection intersection.
    expect(comparisonBenchmarks.has('gpqa-diamond')).toBe(true);
    expect(comparisonBenchmarks.has('mmlu-pro')).toBe(true);
    const mapping = JSON.parse(
      await readFile(join(root, 'data/mappings/benchmarks-v2.json'), 'utf8'),
    ) as { benchmarks: { id: string; primaryDimension: string }[] };
    expect(
      mapping.benchmarks.some(
        ({ id, primaryDimension }) =>
          primaryDimension === 'language' && comparisonBenchmarks.has(id),
      ),
    ).toBe(true);
    expect(
      product.profiles.some(
        ({ modelId }) => !artifact.selection.selectedModelIds.includes(modelId),
      ),
    ).toBe(true);
    expect(
      product.evidence.some(({ inclusion }) => inclusion === 'INCLUDED'),
    ).toBe(true);
    expect(
      product.evidence.some(({ inclusion }) => inclusion === 'EXCLUDED'),
    ).toBe(true);

    const profilesByModel = new Map<string, typeof product.profiles>();
    product.profiles.forEach((profile) => {
      const profiles = profilesByModel.get(profile.modelId) ?? [];
      profiles.push(profile);
      profilesByModel.set(profile.modelId, profiles);
    });
    profilesByModel.forEach((profiles) => {
      expect(
        profiles.every(({ attributes }) => attributes.harness === null),
      ).toBe(true);
      expect(
        profiles.every(({ attributes }) => attributes.effort !== null),
      ).toBe(true);
    });
    expect(
      product.profiles
        .filter(({ modelId }) => modelId === 'openai-gpt-5-6-sol')
        .map(({ displayName }) => displayName)
        .toSorted(),
    ).toEqual([
      'GPT-5.6 Sol · high',
      'GPT-5.6 Sol · low',
      'GPT-5.6 Sol · max',
      'GPT-5.6 Sol · medium',
      'GPT-5.6 Sol · non-reasoning',
      'GPT-5.6 Sol · xhigh',
    ]);
    expect(
      product.evidence
        .filter(
          ({ model }) =>
            model.canonicalModelId === 'openai-gpt-5-6-sol' &&
            model.profileId === 'openai-gpt-5-6-sol-max',
        )
        .map(({ profile }) => profile.harness),
    ).toEqual(expect.arrayContaining(['mini-swe-agent']));
    expect(
      product.profiles.some(({ attributes }) =>
        /mini-swe/iu.test(attributes.harness ?? ''),
      ),
    ).toBe(false);
    expect(
      product.profiles.some(({ displayName }) =>
        /tools|attempt|context|thinking/iu.test(displayName),
      ),
    ).toBe(false);
    expect(product.profiles.some(({ id }) => /unspecified/iu.test(id))).toBe(
      false,
    );
    expect(product.costs.length).toBeGreaterThanOrEqual(10);
    // Lower bound rather than an exact count: the number of qualifying models
    // moves whenever the catalog or the eligibility window changes, and pinning
    // it here previously encoded the bug where a missing releaseDate silently
    // dropped a model. What matters is that LiveBench task costs exist and stay
    // separate from its token pricing.
    expect(
      product.costs.filter(
        ({ sourceId, costType }) =>
          sourceId === 'livebench' && costType === 'MEASURED_TASK',
      ).length,
    ).toBeGreaterThanOrEqual(4);
    expect(
      product.costs.some(
        ({ sourceId, costType }) =>
          sourceId === 'livebench' && costType === 'API_STANDARDIZED',
      ),
    ).toBe(true);
    expect(
      product.costs.filter(({ sourceId }) => sourceId === 'artificial-analysis')
        .length,
    ).toBeGreaterThanOrEqual(1);
    expect(
      product.costs.filter(
        ({ sourceId, costType }) =>
          sourceId === 'deepswe' && costType === 'AGENT_TASK',
      ).length,
    ).toBeGreaterThanOrEqual(3);
    expect(
      product.costs.every(({ sourceUrl }) => sourceUrl.startsWith('https://')),
    ).toBe(true);
  }, 15_000);

  it('ignores frozen or non-whitelisted source directories in data/sources without error', async () => {
    const root = resolve(import.meta.dirname, '../../..');
    const baseline = await buildWorkspaceProduct(
      root,
      '2026-07-16T14:00:00.000Z',
    );

    const dummyDir = join(
      root,
      'data',
      'sources',
      'dummy-unwhitelisted-source',
    );
    await mkdir(dummyDir, { recursive: true });
    await writeFile(
      join(dummyDir, 'invalid.json'),
      'invalid json content that would throw if read',
    );

    try {
      const productWithDummy = await buildWorkspaceProduct(
        root,
        '2026-07-16T14:00:00.000Z',
      );
      expect(productWithDummy.versionId).toBe(baseline.versionId);
      expect(productWithDummy.sourceSnapshotIds).toEqual(
        baseline.sourceSnapshotIds,
      );
      expect(productWithDummy.evidence.length).toBe(baseline.evidence.length);
      expect(productWithDummy.costs.length).toBe(baseline.costs.length);
      expect(productWithDummy.presets[0]!.leaderboard.length).toBe(
        baseline.presets[0]!.leaderboard.length,
      );
    } finally {
      await rm(dummyDir, { recursive: true, force: true });
    }
  });

  it('fails a fresh AA needs-review audit and preserves the current product', async () => {
    const root = resolve(import.meta.dirname, '../../..');
    const temporaryRoot = await mkdtemp(join(tmpdir(), 'aa-review-build-'));
    try {
      await cp(
        join(root, 'data/mappings'),
        join(temporaryRoot, 'data/mappings'),
        { recursive: true },
      );
      const sourceRoot = join(
        temporaryRoot,
        'data/sources/artificial-analysis',
      );
      await mkdir(sourceRoot, { recursive: true });
      await cp(
        join(root, 'data/sources/artificial-analysis/manifest.json'),
        join(sourceRoot, 'manifest.json'),
      );
      const candidates = CandidateResultSchema.array().parse(
        JSON.parse(
          await readFile(
            join(root, 'data/sources/artificial-analysis/candidates.json'),
            'utf8',
          ),
        ),
      );
      candidates.find(
        ({ benchmarkId }) =>
          benchmarkId === 'artificial-analysis-intelligence-index',
      )!.benchmarkVersion = 'incompatible-index-version';
      await writeFile(
        join(sourceRoot, 'candidates.json'),
        JSON.stringify(candidates),
      );
      const productRoot = join(temporaryRoot, 'data/product');
      await mkdir(productRoot, { recursive: true });
      const currentPath = join(productRoot, 'current.json');
      await writeFile(currentPath, 'preserved current bytes');
      await expect(
        writeWorkspaceCurrent(temporaryRoot, '2026-10-04T00:00:00.000Z'),
      ).rejects.toThrow('AA frontier needs review');
      const audit = JSON.parse(
        await readFile(
          join(temporaryRoot, 'data/mappings/frontier-selection-audit.json'),
          'utf8',
        ),
      ) as { status: string };
      expect(audit.status).toBe('needs-review');
      expect(await readFile(currentPath, 'utf8')).toBe(
        'preserved current bytes',
      );
    } finally {
      await rm(temporaryRoot, { recursive: true, force: true });
    }
  });
});
