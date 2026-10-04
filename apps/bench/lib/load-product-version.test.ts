import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import {
  DIMENSION_IDS,
  CATALOG_DIMENSION_IDS,
  buildProductVersion,
} from '@llm-bench/benchmark-data';

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

describe('loadProductVersion', () => {
  it('loads the v2 taxonomy and embedded preset for a frontier product', () => {
    const root = mkdtempSync(join(tmpdir(), 'llm-bench-frontier-'));
    temporaryRoots.push(root);
    const productRoot = join(root, 'data', 'product');
    const mappingRoot = join(root, 'data', 'mappings');
    mkdirSync(productRoot, { recursive: true });
    mkdirSync(mappingRoot, { recursive: true });
    const {
      versionId: _version,
      schemaVersion: _schema,
      activePreset: _active,
      leaderboard: _rows,
      ...content
    } = productFixture;
    const modern = buildProductVersion({
      ...content,
      benchmarkQuality: {
        reviewedAt: '2026-10-04',
        evidencePath: 'fixture',
        excludedBenchmarkIds: ['proofbench'],
        limitedBenchmarkIds: [],
        minOtherBenchmarksPerLimited: 2,
      },
    });
    writeFileSync(join(productRoot, 'current.json'), JSON.stringify(modern));
    writeFileSync(
      join(mappingRoot, 'benchmarks-v2.json'),
      JSON.stringify({
        schemaVersion: 'benchmark-dimensions-v2',
        dimensions: CATALOG_DIMENSION_IDS,
        benchmarks: [
          ...new Set(modern.presets.flatMap((p) => p.benchmarkIds)),
        ].map((id) => ({
          id,
          primaryDimension: 'comprehension',
          secondaryDimensions: [],
        })),
      }),
    );
    process.chdir(root);
    const loaded = loadProductVersion();
    expect(
      Object.values(loaded.benchmarkDimensions).every(
        (d) => d === 'comprehension',
      ),
    ).toBe(true);
    expect(loaded.displaySet?.defaultPresetId).toBe(modern.defaultPresetId);
    expect(loaded.product).toEqual(modern);
    rmSync(join(mappingRoot, 'benchmarks-v2.json'));
    expect(() => loadProductVersion()).toThrow(
      'v2 benchmark mapping does not exist',
    );
  });

  it('loads and validates the fixed current product path synchronously', () => {
    const root = mkdtempSync(join(tmpdir(), 'llm-bench-product-'));
    temporaryRoots.push(root);
    const productRoot = join(root, 'data', 'product');
    const mappingRoot = join(root, 'data', 'mappings');
    mkdirSync(mappingRoot, { recursive: true });
    writeFileSync(
      join(mappingRoot, 'benchmarks.json'),
      JSON.stringify({
        schemaVersion: 'benchmark-dimensions-v1',
        dimensions: [...DIMENSION_IDS],
        benchmarks: [
          {
            id: 'terminal-bench-2-1',
            primaryDimension: 'coding',
            secondaryDimensions: ['agentic'],
          },
          ...DIMENSION_IDS.filter((dimension) => dimension !== 'coding').map(
            (dimension) => ({
              id: `bench-${dimension}`,
              primaryDimension: dimension,
              secondaryDimensions: [],
            }),
          ),
        ],
      }),
    );
    writeFileSync(
      join(mappingRoot, 'display-set.json'),
      JSON.stringify({
        schemaVersion: 'display-set-v2',
        defaultPresetId: 'fixture-preset',
        presets: [
          {
            id: 'fixture-preset',
            targetModelCount: 2,
            requireAllSources: false,
            benchmarkIds: [
              'terminal-bench-2-1',
              'bench-reasoning',
              'bench-knowledge',
              'bench-agentic',
              'bench-language',
            ],
          },
        ],
      }),
    );
    mkdirSync(productRoot, { recursive: true });
    writeFileSync(
      join(productRoot, 'current.json'),
      JSON.stringify(productFixture),
    );
    process.chdir(root);

    const loaded = loadProductVersion();

    // productFixture carries the resolved-preset conveniences the app adds;
    // the loader returns the file as written.
    const {
      activePreset: _activePreset,
      leaderboard: _leaderboard,
      ...onDisk
    } = productFixture;
    expect(loaded.product).toEqual(onDisk);
    expect(loaded.benchmarkDimensions).toMatchObject({
      'terminal-bench-2-1': 'coding',
      'bench-language': 'language',
    });
    expect(loaded.displaySet).toEqual({
      schemaVersion: 'display-set-v2',
      defaultPresetId: 'fixture-preset',
      presets: [
        {
          id: 'fixture-preset',
          targetModelCount: 2,
          requireAllSources: false,
          benchmarkIds: [
            'terminal-bench-2-1',
            'bench-reasoning',
            'bench-knowledge',
            'bench-agentic',
            'bench-language',
          ],
        },
      ],
    });
  });

  it('loads the current product without sources, artifacts, network, or a database', () => {
    const root = mkdtempSync(join(tmpdir(), 'llm-bench-current-'));
    temporaryRoots.push(root);
    const productRoot = join(root, 'data', 'product');
    mkdirSync(productRoot, { recursive: true });
    writeFileSync(
      join(productRoot, 'current.json'),
      JSON.stringify(productFixture),
    );
    process.chdir(root);

    const loaded = loadProductVersion();

    expect(loaded.product.versionId).toBe(productFixture.versionId);
    expect(loaded.benchmarkDimensions).toEqual({});
    expect(loaded.displaySet).toBeNull();
  });

  it('does not silently disable the complete-matrix gate when display-set is missing', () => {
    const root = mkdtempSync(join(tmpdir(), 'llm-bench-missing-display-set-'));
    temporaryRoots.push(root);
    const productRoot = join(root, 'data', 'product');
    const mappingRoot = join(root, 'data', 'mappings');
    mkdirSync(mappingRoot, { recursive: true });
    writeFileSync(
      join(mappingRoot, 'benchmarks.json'),
      JSON.stringify({
        schemaVersion: 'benchmark-dimensions-v1',
        dimensions: [...DIMENSION_IDS],
        benchmarks: [
          {
            id: 'terminal-bench-2-1',
            primaryDimension: 'coding',
            secondaryDimensions: ['agentic'],
          },
          ...DIMENSION_IDS.filter((dimension) => dimension !== 'coding').map(
            (dimension) => ({
              id: `bench-${dimension}`,
              primaryDimension: dimension,
              secondaryDimensions: [],
            }),
          ),
        ],
      }),
    );
    mkdirSync(productRoot, { recursive: true });
    writeFileSync(
      join(productRoot, 'current.json'),
      JSON.stringify(productFixture),
    );
    process.chdir(root);

    expect(() => loadProductVersion()).toThrow(
      'display-set mapping does not exist',
    );
  });

  it('rejects current content whose bytes no longer match its version hash', () => {
    const root = mkdtempSync(join(tmpdir(), 'llm-bench-product-'));
    temporaryRoots.push(root);
    const productRoot = join(root, 'data', 'product');
    mkdirSync(productRoot, { recursive: true });
    writeFileSync(
      join(productRoot, 'current.json'),
      JSON.stringify({
        ...productFixture,
        generatedAt: '2026-07-16T13:00:00.000Z',
      }),
    );
    process.chdir(root);

    expect(() => loadProductVersion()).toThrow('versionId');
  });
});
