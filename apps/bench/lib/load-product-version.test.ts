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
    expect(loaded.benchmarkDimensions).toEqual({
      'terminal-bench-2-1': 'coding',
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
