import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { LIVEBENCH_QUESTION_DATASET_PINS } from '@llm-bench/connectors';
import { describe, expect, it } from 'vitest';

import { loadLiveBenchQuestionInventoryEvidence } from './livebench-question-evidence.js';

function evidence(overrides: Record<string, unknown> = {}) {
  return {
    schemaVersion: 'livebench-question-inventory-v1',
    release: '2024-11-25',
    sources: LIVEBENCH_QUESTION_DATASET_PINS.map((pin) => ({
      category: pin.category,
      datasetId: pin.datasetId,
      revision: pin.revision,
      lastModified: pin.lastModified,
      artifactPath: pin.artifactPath,
      artifactByteLength: pin.artifactByteLength,
      linkedEtag: pin.linkedEtag,
    })),
    inventory: LIVEBENCH_QUESTION_DATASET_PINS.map((pin, index) => ({
      category: pin.category,
      task: `task-${index}`,
      questionId: String(index + 1).padStart(64, '0'),
      turn: 1,
    })),
    ...overrides,
  };
}

async function writeFixture(root: string, value: unknown, pathSha256?: string) {
  const body = Buffer.from(`${JSON.stringify(value)}\n`);
  const contentSha256 = createHash('sha256').update(body).digest('hex');
  const storageSha256 = pathSha256 ?? contentSha256;
  const directory = join(root, 'sha256', storageSha256.slice(0, 2));
  await mkdir(directory, { recursive: true });
  await writeFile(join(directory, `${storageSha256}.json`), body);
  return { body, contentSha256: storageSha256 };
}

describe('loadLiveBenchQuestionInventoryEvidence', () => {
  it('loads a bounded content-addressed inventory and validates every pinned source', async () => {
    const root = join(tmpdir(), `livebench-evidence-${crypto.randomUUID()}`);
    const stored = await writeFixture(root, evidence());

    const loaded = await loadLiveBenchQuestionInventoryEvidence(root, {
      contentSha256: stored.contentSha256,
      byteLength: stored.body.byteLength,
    });

    expect(loaded).toMatchObject({
      contentSha256: stored.contentSha256,
      byteLength: stored.body.byteLength,
      release: '2024-11-25',
    });
    expect(loaded.observations).toHaveLength(6);
  });

  it('rejects a body whose bytes do not match its SHA-256 path', async () => {
    const root = join(tmpdir(), `livebench-evidence-${crypto.randomUUID()}`);
    const wrongSha256 = '0'.repeat(64);
    const stored = await writeFixture(root, evidence(), wrongSha256);

    await expect(
      loadLiveBenchQuestionInventoryEvidence(root, {
        contentSha256: wrongSha256,
        byteLength: stored.body.byteLength,
      }),
    ).rejects.toThrow('SHA-256');
  });

  it('rejects evidence whose source metadata drifts from the allowlist', async () => {
    const root = join(tmpdir(), `livebench-evidence-${crypto.randomUUID()}`);
    const sources = evidence().sources.map((source, index) =>
      index === 0 ? { ...source, revision: 'a'.repeat(40) } : source,
    );
    const stored = await writeFixture(root, evidence({ sources }));

    await expect(
      loadLiveBenchQuestionInventoryEvidence(root, {
        contentSha256: stored.contentSha256,
        byteLength: stored.body.byteLength,
      }),
    ).rejects.toThrow('pin');
  });

  it('rejects an inventory that omits any pinned category', async () => {
    const root = join(tmpdir(), `livebench-evidence-${crypto.randomUUID()}`);
    const inventory = evidence().inventory.slice(1);
    const stored = await writeFixture(root, evidence({ inventory }));

    await expect(
      loadLiveBenchQuestionInventoryEvidence(root, {
        contentSha256: stored.contentSha256,
        byteLength: stored.body.byteLength,
      }),
    ).rejects.toThrow('categories');
  });
});
