import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { DisplaySetPolicySchema } from './index.js';
import { buildWorkspaceProduct } from './workspace.js';

describe('buildWorkspaceProduct', () => {
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

    // Every preset is scored on its own benchmarks (R1), and each one's
    // `targetModelCount` is the coverage report's promise: exactly that many
    // qualified base models carry every benchmark in the preset. Checking it
    // here is what stops a stale display-set.json going unnoticed.
    expect(product.presets.length).toBeGreaterThan(0);
    const defaultPreset = product.presets.find(
      ({ id }) => id === product.defaultPresetId,
    );
    expect(defaultPreset).toBeDefined();

    const benchmarksByModel = new Map<string, Set<string>>();
    for (const row of product.evidence) {
      const modelId = row.model.canonicalModelId;
      if (
        modelId === null ||
        row.inclusion !== 'INCLUDED' ||
        row.normalizedScore === null
      ) {
        continue;
      }
      const owned = benchmarksByModel.get(modelId) ?? new Set<string>();
      owned.add(row.benchmarkId);
      benchmarksByModel.set(modelId, owned);
    }
    // Every model named in display-set-policy.json must survive every preset.
    // This is what stops the optimiser reaching its model count by dropping a
    // model the leaderboard exists to show.
    const policy = DisplaySetPolicySchema.parse(
      JSON.parse(
        await readFile(
          join(root, 'data-v2', 'mappings', 'display-set-policy.json'),
          'utf8',
        ),
      ),
    );

    for (const preset of product.presets) {
      const completeModels = [...benchmarksByModel.values()].filter((owned) =>
        preset.benchmarkIds.every((benchmarkId) => owned.has(benchmarkId)),
      ).length;
      expect({
        id: preset.id,
        completeModels,
      }).toEqual({ id: preset.id, completeModels: preset.targetModelCount });

      for (const modelId of policy.requiredModelIds) {
        expect({
          preset: preset.id,
          modelId,
          complete: preset.benchmarkIds.every((benchmarkId) =>
            benchmarksByModel.get(modelId)?.has(benchmarkId),
          ),
        }).toEqual({ preset: preset.id, modelId, complete: true });
      }

      // A preset scores only its own benchmarks, so nothing outside it may be
      // cited as the evidence behind a score.
      const allowed = new Set(preset.benchmarkIds);
      const evidenceById = new Map(
        product.evidence.map((row) => [row.id, row]),
      );
      for (const row of preset.leaderboard) {
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
    expect(defaultLeaderboard[0]?.dimensions).toHaveLength(8);
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
  });

  it('ignores frozen or non-whitelisted source directories in data-v2/sources without error', async () => {
    const root = resolve(import.meta.dirname, '../../..');
    const baseline = await buildWorkspaceProduct(
      root,
      '2026-07-16T14:00:00.000Z',
    );

    const dummyDir = join(
      root,
      'data-v2',
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
});
