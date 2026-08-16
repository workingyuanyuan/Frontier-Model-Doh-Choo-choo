import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { loadProductVersion } from './load-product-version';
import { productFixture } from '../test/fixture';

const originalCwd = process.cwd();
const originalChannel = process.env.LLM_BENCH_CHANNEL;
const temporaryRoots: string[] = [];

afterEach(() => {
  process.chdir(originalCwd);
  if (originalChannel === undefined) {
    delete process.env.LLM_BENCH_CHANNEL;
  } else {
    process.env.LLM_BENCH_CHANNEL = originalChannel;
  }
  temporaryRoots
    .splice(0)
    .forEach((root) => rmSync(root, { recursive: true, force: true }));
});

describe('loadProductVersion', () => {
  it('loads and validates the Draft pointer and immutable version synchronously', () => {
    const root = mkdtempSync(join(tmpdir(), 'llm-bench-product-'));
    temporaryRoots.push(root);
    const productRoot = join(root, 'data-v2', 'product');
    const mappingRoot = join(root, 'data-v2', 'mappings');
    mkdirSync(join(productRoot, 'pointers'), { recursive: true });
    mkdirSync(join(productRoot, 'versions'), { recursive: true });
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
    writeFileSync(
      join(productRoot, 'pointers', 'draft.json'),
      JSON.stringify({
        schemaVersion: 'product-pointer-v1',
        channel: 'DRAFT',
        versionId: productFixture.versionId,
        previousVersionId: null,
        updatedAt: '2026-07-16T12:00:00.000Z',
      }),
    );
    writeFileSync(
      join(
        productRoot,
        'versions',
        `${productFixture.versionId.slice(7)}.json`,
      ),
      JSON.stringify(productFixture),
    );
    process.chdir(root);
    delete process.env.LLM_BENCH_CHANNEL;

    const loaded = loadProductVersion();

    expect(loaded.channel).toBe('DRAFT');
    expect(loaded.pointer.versionId).toBe(productFixture.versionId);
    expect(loaded.product).toEqual(productFixture);
    expect(loaded.benchmarkDimensions).toEqual({
      'terminal-bench-2-1': 'coding',
    });
  });

  it('rejects an unsupported channel before reading product data', () => {
    process.env.LLM_BENCH_CHANNEL = 'PREVIEW';

    expect(() => loadProductVersion()).toThrow(
      'LLM_BENCH_CHANNEL must be DRAFT or PUBLISHED',
    );
  });

  it('loads Published from static files without sources, artifacts, network, or a database', () => {
    const root = mkdtempSync(join(tmpdir(), 'llm-bench-published-'));
    temporaryRoots.push(root);
    const productRoot = join(root, 'data-v2', 'product');
    mkdirSync(join(productRoot, 'pointers'), { recursive: true });
    mkdirSync(join(productRoot, 'versions'), { recursive: true });
    writeFileSync(
      join(productRoot, 'pointers', 'published.json'),
      JSON.stringify({
        schemaVersion: 'product-pointer-v1',
        channel: 'PUBLISHED',
        versionId: productFixture.versionId,
        previousVersionId: null,
        updatedAt: '2026-07-16T12:00:00.000Z',
      }),
    );
    writeFileSync(
      join(
        productRoot,
        'versions',
        `${productFixture.versionId.slice(7)}.json`,
      ),
      JSON.stringify(productFixture),
    );
    process.chdir(root);
    process.env.LLM_BENCH_CHANNEL = 'PUBLISHED';

    const loaded = loadProductVersion();

    expect(loaded.channel).toBe('PUBLISHED');
    expect(loaded.product.versionId).toBe(productFixture.versionId);
    expect(loaded.benchmarkDimensions).toEqual({});
  });

  it('rejects a version whose bytes no longer match its content hash', () => {
    const root = mkdtempSync(join(tmpdir(), 'llm-bench-product-'));
    temporaryRoots.push(root);
    const productRoot = join(root, 'data-v2', 'product');
    mkdirSync(join(productRoot, 'pointers'), { recursive: true });
    mkdirSync(join(productRoot, 'versions'), { recursive: true });
    writeFileSync(
      join(productRoot, 'pointers', 'draft.json'),
      JSON.stringify({
        schemaVersion: 'product-pointer-v1',
        channel: 'DRAFT',
        versionId: productFixture.versionId,
        previousVersionId: null,
        updatedAt: '2026-07-16T12:00:00.000Z',
      }),
    );
    writeFileSync(
      join(
        productRoot,
        'versions',
        `${productFixture.versionId.slice(7)}.json`,
      ),
      JSON.stringify({
        ...productFixture,
        generatedAt: '2026-07-16T13:00:00.000Z',
      }),
    );
    process.chdir(root);

    expect(() => loadProductVersion()).toThrow('versionId');
  });
});
