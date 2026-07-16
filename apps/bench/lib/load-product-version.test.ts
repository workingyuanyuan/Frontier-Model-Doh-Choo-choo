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
      JSON.stringify(productFixture),
    );
    process.chdir(root);
    delete process.env.LLM_BENCH_CHANNEL;

    const loaded = loadProductVersion();

    expect(loaded.channel).toBe('DRAFT');
    expect(loaded.pointer.versionId).toBe(productFixture.versionId);
    expect(loaded.product).toEqual(productFixture);
  });

  it('rejects an unsupported channel before reading product data', () => {
    process.env.LLM_BENCH_CHANNEL = 'PREVIEW';

    expect(() => loadProductVersion()).toThrow(
      'LLM_BENCH_CHANNEL must be DRAFT or PUBLISHED',
    );
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
