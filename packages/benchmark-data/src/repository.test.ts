import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  buildProductVersion,
  deterministicJson,
  publishDraft,
  readProductPointer,
  rollbackPublished,
  setDraftPointer,
  writeImmutableProductVersion,
} from './index.js';

const makeVersion = (generatedAt: string) =>
  buildProductVersion({
    generatedAt,
    sourceSnapshotIds: [],
    frontier: [],
    profiles: [],
    leaderboard: [],
    costs: [],
    evidence: [],
  });

describe('product version repository', () => {
  it('writes immutable deterministic JSON and points Draft at it', async () => {
    const root = await mkdtemp(join(tmpdir(), 'llm-bench-product-'));
    const version = makeVersion('2026-07-16T00:00:00.000Z');

    const path = await writeImmutableProductVersion(root, version);
    await setDraftPointer(root, version.versionId, '2026-07-16T00:01:00.000Z');

    expect(JSON.parse(await readFile(path, 'utf8'))).toEqual(version);
    expect((await readProductPointer(root, 'DRAFT'))?.versionId).toBe(
      version.versionId,
    );
  });

  it('publishes A, publishes B, then rolls back atomically to A', async () => {
    const root = await mkdtemp(join(tmpdir(), 'llm-bench-product-'));
    const versionA = makeVersion('2026-07-16T00:00:00.000Z');
    const versionB = makeVersion('2026-07-16T01:00:00.000Z');
    await writeImmutableProductVersion(root, versionA);
    await writeImmutableProductVersion(root, versionB);

    await setDraftPointer(root, versionA.versionId, '2026-07-16T00:01:00.000Z');
    await publishDraft(root, '2026-07-16T00:02:00.000Z');
    await setDraftPointer(root, versionB.versionId, '2026-07-16T01:01:00.000Z');
    await publishDraft(root, '2026-07-16T01:02:00.000Z');

    expect(await readProductPointer(root, 'PUBLISHED')).toMatchObject({
      versionId: versionB.versionId,
      previousVersionId: versionA.versionId,
    });

    await rollbackPublished(root, '2026-07-16T01:03:00.000Z');
    expect(await readProductPointer(root, 'PUBLISHED')).toMatchObject({
      versionId: versionA.versionId,
      previousVersionId: versionB.versionId,
    });
  });

  it('does not change Published when Draft references a missing version', async () => {
    const root = await mkdtemp(join(tmpdir(), 'llm-bench-product-'));
    const version = makeVersion('2026-07-16T00:00:00.000Z');
    await writeImmutableProductVersion(root, version);
    await setDraftPointer(root, version.versionId, '2026-07-16T00:01:00.000Z');
    await publishDraft(root, '2026-07-16T00:02:00.000Z');
    const publishedBefore = await readProductPointer(root, 'PUBLISHED');

    await mkdir(join(root, 'pointers'), { recursive: true });
    await writeFile(
      join(root, 'pointers', 'draft.json'),
      deterministicJson({
        schemaVersion: 'product-pointer-v1',
        channel: 'DRAFT',
        versionId:
          'sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
        previousVersionId: null,
        updatedAt: '2026-07-16T00:03:00.000Z',
      }),
    );

    await expect(
      publishDraft(root, '2026-07-16T00:04:00.000Z'),
    ).rejects.toThrow('does not exist');
    expect(await readProductPointer(root, 'PUBLISHED')).toEqual(
      publishedBefore,
    );
  });
});
