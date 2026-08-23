import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

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
  it('loads and validates the fixed current product path synchronously', () => {
    const root = mkdtempSync(join(tmpdir(), 'llm-bench-product-'));
    temporaryRoots.push(root);
    const productRoot = join(root, 'data-v2', 'product');
    const mappingRoot = join(root, 'data-v2', 'mappings');
    mkdirSync(mappingRoot, { recursive: true });
    writeFileSync(
      join(mappingRoot, 'benchmarks.json'),
      JSON.stringify({
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
            id: 'terminal-bench-2-1',
            primaryDimension: 'coding',
            secondaryDimensions: ['agentic'],
          },
          ...(
            [
              'reasoning',
              'math',
              'knowledge',
              'language',
              'instruction',
              'agentic',
              'context',
            ] as const
          ).map((dimension) => ({
            id: `bench-${dimension}`,
            primaryDimension: dimension,
            secondaryDimensions: [],
          })),
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
              'bench-math',
              'bench-knowledge',
              'bench-language',
              'bench-instruction',
              'bench-agentic',
              'bench-context',
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

    expect(loaded.product).toEqual(productFixture);
    expect(loaded.benchmarkDimensions).toMatchObject({
      'terminal-bench-2-1': 'coding',
      'bench-context': 'context',
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
            'bench-math',
            'bench-knowledge',
            'bench-language',
            'bench-instruction',
            'bench-agentic',
            'bench-context',
          ],
        },
      ],
    });
  });

  it('loads the current product without sources, artifacts, network, or a database', () => {
    const root = mkdtempSync(join(tmpdir(), 'llm-bench-current-'));
    temporaryRoots.push(root);
    const productRoot = join(root, 'data-v2', 'product');
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
    const productRoot = join(root, 'data-v2', 'product');
    const mappingRoot = join(root, 'data-v2', 'mappings');
    mkdirSync(mappingRoot, { recursive: true });
    writeFileSync(
      join(mappingRoot, 'benchmarks.json'),
      JSON.stringify({
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
            id: 'terminal-bench-2-1',
            primaryDimension: 'coding',
            secondaryDimensions: ['agentic'],
          },
          ...(
            [
              'reasoning',
              'math',
              'knowledge',
              'language',
              'instruction',
              'agentic',
              'context',
            ] as const
          ).map((dimension) => ({
            id: `bench-${dimension}`,
            primaryDimension: dimension,
            secondaryDimensions: [],
          })),
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
    const productRoot = join(root, 'data-v2', 'product');
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
