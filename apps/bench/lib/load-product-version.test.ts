import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { CATALOG_DIMENSION_IDS } from '@llm-bench/benchmark-data';

import { loadProductVersion } from './load-product-version';
import { productFixture } from '../test/fixture';

const originalCwd = process.cwd();
const temporaryRoots: string[] = [];

afterEach(() => {
  process.chdir(originalCwd);
  temporaryRoots
    .splice(0)
    .forEach((root) => rmSync(root, { recursive: true, force: true }));
});

// productFixture carries the resolved-preset conveniences the app adds; the
// file on disk does not.
const {
  activePreset: _activePreset,
  leaderboard: _leaderboard,
  ...onDisk
} = productFixture;

const presetBenchmarkIds = [
  ...new Set(onDisk.presets.flatMap(({ benchmarkIds }) => benchmarkIds)),
];

const writeWorkspace = (
  product: unknown,
  benchmarkIds: readonly string[] | null,
): void => {
  const root = mkdtempSync(join(tmpdir(), 'llm-bench-product-'));
  temporaryRoots.push(root);
  const productRoot = join(root, 'data', 'product');
  const mappingRoot = join(root, 'data', 'mappings');
  mkdirSync(productRoot, { recursive: true });
  mkdirSync(mappingRoot, { recursive: true });
  writeFileSync(join(productRoot, 'current.json'), JSON.stringify(product));
  if (benchmarkIds !== null) {
    writeFileSync(
      join(mappingRoot, 'benchmarks-v2.json'),
      JSON.stringify({
        schemaVersion: 'benchmark-dimensions-v2',
        dimensions: CATALOG_DIMENSION_IDS,
        benchmarks: benchmarkIds.map((id) => ({
          id,
          primaryDimension: 'comprehension',
          secondaryDimensions: [],
        })),
      }),
    );
  }
  process.chdir(root);
};

describe('loadProductVersion', () => {
  it('loads the current product and the v2 taxonomy without sources, artifacts, network, or a database', () => {
    writeWorkspace(onDisk, presetBenchmarkIds);

    const loaded = loadProductVersion();

    expect(loaded.product).toEqual(onDisk);
    expect(Object.keys(loaded.benchmarkDimensions).toSorted()).toEqual(
      presetBenchmarkIds.toSorted(),
    );
    expect(
      Object.values(loaded.benchmarkDimensions).every(
        (dimension) => dimension === 'comprehension',
      ),
    ).toBe(true);
  });

  it('requires the v2 benchmark mapping', () => {
    writeWorkspace(onDisk, null);

    expect(() => loadProductVersion()).toThrow(
      'v2 benchmark mapping does not exist',
    );
  });

  it('rejects a preset benchmark the taxonomy does not classify', () => {
    writeWorkspace(onDisk, presetBenchmarkIds.slice(1));

    expect(() => loadProductVersion()).toThrow('Unknown benchmark in preset');
  });

  it('rejects current content whose bytes no longer match its version hash', () => {
    writeWorkspace(
      { ...onDisk, generatedAt: '2026-07-16T13:00:00.000Z' },
      presetBenchmarkIds,
    );

    expect(() => loadProductVersion()).toThrow('versionId');
  });
});
