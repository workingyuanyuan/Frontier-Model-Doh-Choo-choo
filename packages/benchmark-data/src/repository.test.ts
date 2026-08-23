import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  buildProductVersion,
  deterministicJson,
  readCurrentProductVersion,
  writeCurrentProductVersion,
} from './index.js';

const makeVersion = (generatedAt: string) =>
  buildProductVersion({
    generatedAt,
    sourceSnapshotIds: [],
    frontier: [],
    profiles: [],
    leaderboard: [],
    defaultPresetId: 'sample-preset',
    presets: [
      {
        id: 'sample-preset',
        targetModelCount: 1,
        requireAllSources: false,
        benchmarkIds: ['terminal-bench-2-1'],
        leaderboard: [],
      },
    ],
    costs: [],
    evidence: [],
  });

describe('product version repository', () => {
  it('writes deterministic JSON to the single current product path', async () => {
    const root = await mkdtemp(join(tmpdir(), 'llm-bench-product-'));
    const version = makeVersion('2026-07-16T00:00:00.000Z');

    const path = await writeCurrentProductVersion(root, version);

    expect(path).toBe(join(root, 'current.json'));
    expect(await readFile(path, 'utf8')).toBe(deterministicJson(version));
    expect(await readCurrentProductVersion(root)).toEqual(version);
  });

  it('replaces the current product with a new verified version', async () => {
    const root = await mkdtemp(join(tmpdir(), 'llm-bench-product-'));
    const versionA = makeVersion('2026-07-16T00:00:00.000Z');
    const versionB = makeVersion('2026-07-16T01:00:00.000Z');

    await writeCurrentProductVersion(root, versionA);
    await writeCurrentProductVersion(root, versionB);

    expect(await readCurrentProductVersion(root)).toEqual(versionB);
  });

  it('rejects current bytes whose content hash no longer matches', async () => {
    const root = await mkdtemp(join(tmpdir(), 'llm-bench-product-'));
    const version = makeVersion('2026-07-16T00:00:00.000Z');
    await writeCurrentProductVersion(root, version);
    await writeFile(
      join(root, 'current.json'),
      deterministicJson({
        ...version,
        generatedAt: '2026-07-16T02:00:00.000Z',
      }),
    );

    await expect(readCurrentProductVersion(root)).rejects.toThrow('versionId');
  });
});
