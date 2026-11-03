import {
  appendFile,
  cp,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { CandidateResultSchema, SourcesConfigSchema } from './index.js';
import { chooseDefaultCohort } from './generate-frontier-set.js';
import { buildWorkspaceProduct, writeWorkspaceCurrent } from './workspace.js';

// Copy the saved build inputs; generated frontier artifacts must be private to
// this test file because every build rewrites them.
const copyWorkspaceInputs = async (
  from: string,
  to: string,
  omitFrontierSwe = false,
) => {
  const sourceConfig = SourcesConfigSchema.parse(
    JSON.parse(
      await readFile(join(from, 'data/mappings/sources.json'), 'utf8'),
    ),
  );
  await cp(join(from, 'data/mappings'), join(to, 'data/mappings'), {
    recursive: true,
  });
  const whitelist = sourceConfig.whitelist.filter(
    (source) => !omitFrontierSwe || source !== 'frontier-swe',
  );
  if (omitFrontierSwe) {
    await writeFile(
      join(to, 'data/mappings/sources.json'),
      JSON.stringify({ ...sourceConfig, whitelist }),
    );
  }
  for (const source of whitelist) {
    const destination = join(to, 'data/sources', source);
    await mkdir(destination, { recursive: true });
    for (const file of [
      'manifest.json',
      'candidates.json',
      'costs.json',
      'evidence-index.json',
    ]) {
      const origin = join(from, 'data/sources', source, file);
      if (existsSync(origin)) await cp(origin, join(destination, file));
    }
  }
};

describe('buildWorkspaceProduct', () => {
  let root: string;
  let fixtureSetupMs = 0;
  beforeAll(async () => {
    const started = performance.now();
    root = await mkdtemp(join(tmpdir(), 'workspace-inputs-'));
    try {
      await copyWorkspaceInputs(resolve(import.meta.dirname, '../../..'), root);
    } catch (error) {
      await rm(root, { recursive: true, force: true });
      throw error;
    }
    fixtureSetupMs = performance.now() - started;
  });
  afterAll(async () => {
    if (root) await rm(root, { recursive: true, force: true });
  });

  // Measured integration budget: docs/analysis/2026-10-24-workspace-build-performance.md.
  // Shared frontier inputs and indexed cost matching cut build CPU by 40%.
  // Four-CPU concurrent target runs take about 2 s; use a 15 s budget.
  it('preserves every existing preset and cost with the real FrontierSWE V2 snapshot', async () => {
    const timingOutput = process.env.WORKSPACE_TIMING_OUTPUT;
    const stages: {
      stage: string;
      wallMs: number;
      cpuUserMs: number;
      cpuSystemMs: number;
      fsRead: number;
      fsWrite: number;
    }[] = [];
    let stageStart = performance.now();
    let stageCpu = process.cpuUsage();
    let stageResources = process.resourceUsage();
    const mark = (stage: string) => {
      const now = performance.now();
      const cpu = process.cpuUsage(stageCpu);
      const resources = process.resourceUsage();
      stages.push({
        stage,
        wallMs: now - stageStart,
        cpuUserMs: cpu.user / 1000,
        cpuSystemMs: cpu.system / 1000,
        fsRead: resources.fsRead - stageResources.fsRead,
        fsWrite: resources.fsWrite - stageResources.fsWrite,
      });
      stageStart = now;
      stageCpu = process.cpuUsage();
      stageResources = resources;
    };
    const baselineRoot = await mkdtemp(join(tmpdir(), 'comparison-baseline-'));
    try {
      await copyWorkspaceInputs(root, baselineRoot, true);
      mark('setup');
      const generatedAt = '2026-10-01T00:00:00.000Z';
      const baseline = await buildWorkspaceProduct(baselineRoot, generatedAt);
      mark('baseline-build');
      const added = await buildWorkspaceProduct(root, generatedAt);
      mark('added-build');
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
      mark('assertions');
    } finally {
      const cleanupStart = performance.now();
      const cleanupCpu = process.cpuUsage();
      const cleanupResources = process.resourceUsage();
      await rm(baselineRoot, { recursive: true, force: true });
      stageStart = cleanupStart;
      stageCpu = cleanupCpu;
      stageResources = cleanupResources;
      mark('cleanup');
      if (timingOutput) {
        await appendFile(
          timingOutput,
          `${JSON.stringify({ fixtureSetupMs, stages })}\n`,
        );
      }
    }
  }, 15_000);

  it('assembles the verified workspace sources into a frontier ProductVersion', async () => {
    const product = await buildWorkspaceProduct(
      root,
      '2026-07-16T14:00:00.000Z',
    );

    const defaultLeaderboard =
      product.presets.find(({ id }) => id === product.defaultPresetId)
        ?.leaderboard ?? [];

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
      defaultPresetId: string;
      eligibility: {
        leaders: {
          modelId: string;
          profileId: string;
          organizations: string[];
        }[];
        skipped: { modelId: string; organizations: string[] }[];
      };
      benchmarkIds: string[];
      dimensions: { id: string; benchmarkIds: string[] }[];
      cohorts: { id: string; profileIds: string[]; modelIds: string[] }[];
    };
    // The frontier is the first ten AA-ranked models that pass eligibility.
    const leaders = artifact.eligibility.leaders;
    expect(product.frontier.map(({ modelId }) => modelId)).toEqual(
      leaders.map(({ modelId }) => modelId),
    );
    for (const leader of leaders)
      expect(leader.organizations.length).toBeGreaterThanOrEqual(2);
    expect(defaultPreset!.benchmarkIds).toEqual(artifact.benchmarkIds);
    expect(product.defaultPresetId).toBe(artifact.defaultPresetId);
    expect(product.frontier).toHaveLength(10);
    expect(
      product.presets.map(({ targetModelCount }) => targetModelCount),
    ).toEqual([2, 3, 4, 5, 6, 7, 8, 9, 10]);
    // Larger cohorts never share more tests, and the default follows its rule.
    product.presets
      .slice(1)
      .forEach((preset, index) =>
        expect(preset.benchmarkIds.length).toBeLessThanOrEqual(
          product.presets[index]!.benchmarkIds.length,
        ),
      );
    expect(chooseDefaultCohort(product.presets).id).toBe(
      product.defaultPresetId,
    );
    expect(
      defaultPreset!.leaderboard.map(({ profileId }) => profileId).sort(),
    ).toEqual(
      leaders
        .slice(0, defaultPreset!.targetModelCount)
        .map(({ profileId }) => profileId)
        .toSorted(),
    );

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
    const activeDimensions = artifact.dimensions.filter(
      ({ benchmarkIds }) => benchmarkIds.length > 0,
    );
    expect(
      defaultLeaderboard[0]?.dimensions.map(({ dimension }) => dimension),
    ).toEqual(activeDimensions.map(({ id }) => id));
    for (const row of defaultLeaderboard) {
      expect(
        row.dimensions.map(({ componentCount }) => componentCount),
      ).toEqual(
        activeDimensions.map(({ benchmarkIds }) => benchmarkIds.length),
      );
      // A dimension backed by a single test weighs 0.5.
      const weight = (count: number) => (count === 1 ? 0.5 : 1);
      const weightedTotal = row.dimensions.reduce(
        (sum, axis) => sum + axis.score! * weight(axis.componentCount),
        0,
      );
      const totalWeight = row.dimensions.reduce(
        (sum, axis) => sum + weight(axis.componentCount),
        0,
      );
      expect(row.overallScore).toBeCloseTo(weightedTotal / totalWeight, 10);
    }
    const comparisonIds = new Set(product.comparisonEvidenceIds);
    const comparisonBenchmarks = new Set(
      product.evidence
        .filter(({ id }) => comparisonIds.has(id))
        .map(({ benchmarkId }) => benchmarkId),
    );
    expect(product.benchmarkQuality).toEqual(
      JSON.parse(
        await readFile(
          join(root, 'data/mappings/benchmark-quality-v2.json'),
          'utf8',
        ),
      ),
    );
    for (const id of product.benchmarkQuality!.excludedBenchmarkIds) {
      expect(comparisonBenchmarks.has(id)).toBe(false);
      for (const preset of product.presets)
        expect(preset.benchmarkIds).not.toContain(id);
    }

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
    // Profiles split by effort only; every referenced profile exists.
    const profileIds = new Set(product.profiles.map(({ id }) => id));
    expect(profileIds.size).toBe(product.profiles.length);
    for (const profile of product.profiles)
      expect(profile.displayName).toBe(
        `${profile.baseModelName} · ${profile.attributes.effort}`,
      );
    for (const row of product.evidence)
      if (row.model.profileId !== null)
        expect(profileIds.has(row.model.profileId)).toBe(true);
    expect(
      product.profiles.some(({ displayName }) =>
        /tools|attempt|context|thinking/iu.test(displayName),
      ),
    ).toBe(false);
    expect(product.profiles.some(({ id }) => /unspecified/iu.test(id))).toBe(
      false,
    );
    for (const cost of product.costs)
      if (cost.profileId !== null)
        expect(profileIds.has(cost.profileId)).toBe(true);
    expect(
      product.costs.every(({ sourceUrl }) => sourceUrl.startsWith('https://')),
    ).toBe(true);
  }, 15_000);

  it('ignores frozen or non-whitelisted source directories in data/sources without error', async () => {
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
  }, 15_000);

  it('fails a fresh AA needs-review audit and preserves the current product', async () => {
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
