import { createHash } from 'node:crypto';
import { open } from 'node:fs/promises';
import { join, resolve } from 'node:path';

import {
  fetchLiveBenchQuestionInventory,
  parseLiveBenchQuestionInventoryEvidence,
  writeContentAddressedArtifact,
  type LIVEBENCH_PUBLIC_RELEASE,
  type LiveBenchQuestionInventoryObservation,
} from '@llm-bench/connectors';

export const LIVEBENCH_PINNED_QUESTION_INVENTORY = {
  contentSha256:
    'b8a90d2f2308b774fbee982178d433412fd6f349429be2a41def4331b0ee4027',
  byteLength: 180_278,
} as const;

export const LIVEBENCH_MAX_QUESTION_EVIDENCE_BYTES = 1024 * 1024;

export interface LiveBenchQuestionEvidenceExpectation {
  readonly contentSha256: string;
  readonly byteLength: number;
}

export interface LoadedLiveBenchQuestionInventory {
  readonly contentSha256: string;
  readonly byteLength: number;
  readonly release: typeof LIVEBENCH_PUBLIC_RELEASE;
  readonly observations: readonly LiveBenchQuestionInventoryObservation[];
}

export interface AcquiredLiveBenchQuestionInventory {
  readonly schemaVersion: 'livebench-question-inventory-v1';
  readonly release: typeof LIVEBENCH_PUBLIC_RELEASE;
  readonly sourceRowCount: number;
  readonly inventoryObservationCount: number;
  readonly taskCount: number;
  readonly downloadedByteLength: number;
  readonly rangeRequestCount: number;
  readonly contentSha256: string;
  readonly byteLength: number;
  readonly storagePath: string;
}

export async function acquireLiveBenchQuestionInventoryEvidence(
  storageRoot: string,
): Promise<AcquiredLiveBenchQuestionInventory> {
  const fetched = await fetchLiveBenchQuestionInventory();
  const body = new TextEncoder().encode(
    `${JSON.stringify(fetched.evidence, null, 2)}\n`,
  );
  const stored = await writeContentAddressedArtifact(storageRoot, body, 'json');
  return {
    schemaVersion: fetched.evidence.schemaVersion,
    release: fetched.evidence.release,
    sourceRowCount: fetched.datasets.reduce(
      (sum, dataset) => sum + dataset.rows.length,
      0,
    ),
    inventoryObservationCount: fetched.evidence.inventory.length,
    taskCount: new Set(
      fetched.evidence.inventory.map(
        ({ category, task }) => `${category}/${task}`,
      ),
    ).size,
    downloadedByteLength: fetched.datasets.reduce(
      (sum, dataset) => sum + dataset.downloadedByteLength,
      0,
    ),
    rangeRequestCount: fetched.datasets.reduce(
      (sum, dataset) => sum + dataset.rangeRequestCount,
      0,
    ),
    ...stored,
  };
}

export async function loadLiveBenchQuestionInventoryEvidence(
  storageRoot: string,
  expected: LiveBenchQuestionEvidenceExpectation = LIVEBENCH_PINNED_QUESTION_INVENTORY,
): Promise<LoadedLiveBenchQuestionInventory> {
  if (!/^[a-f0-9]{64}$/u.test(expected.contentSha256)) {
    throw new Error('LiveBench question evidence SHA-256 is invalid');
  }
  if (
    !Number.isSafeInteger(expected.byteLength) ||
    expected.byteLength < 1 ||
    expected.byteLength > LIVEBENCH_MAX_QUESTION_EVIDENCE_BYTES
  ) {
    throw new Error('LiveBench question evidence byte length is invalid');
  }

  const storagePath = join(
    resolve(storageRoot),
    'sha256',
    expected.contentSha256.slice(0, 2),
    `${expected.contentSha256}.json`,
  );
  // FileHandle.stat() and read() keep the size gate and bounded read on one
  // descriptor. Source: https://nodejs.org/docs/latest-v24.x/api/fs.html#filehandlereadbuffer-offset-length-position
  const handle = await open(storagePath, 'r');
  let body: Buffer;
  try {
    const stats = await handle.stat();
    if (!stats.isFile() || stats.size !== expected.byteLength) {
      throw new Error('LiveBench question evidence byte length does not match');
    }
    const boundedBody = Buffer.alloc(expected.byteLength + 1);
    let offset = 0;
    while (offset < boundedBody.byteLength) {
      const { bytesRead } = await handle.read(
        boundedBody,
        offset,
        boundedBody.byteLength - offset,
        null,
      );
      if (bytesRead === 0) {
        break;
      }
      offset += bytesRead;
    }
    body = boundedBody.subarray(0, offset);
  } finally {
    await handle.close();
  }
  if (body.byteLength !== expected.byteLength) {
    throw new Error('LiveBench question evidence changed while being read');
  }
  // Source: https://nodejs.org/docs/latest-v24.x/api/crypto.html#cryptocreatehashalgorithm-options
  const contentSha256 = createHash('sha256').update(body).digest('hex');
  if (contentSha256 !== expected.contentSha256) {
    throw new Error('LiveBench question evidence SHA-256 does not match');
  }

  let text: string;
  try {
    text = new TextDecoder('utf-8', { fatal: true }).decode(body);
  } catch (error) {
    throw new Error('LiveBench question evidence is not valid UTF-8', {
      cause: error,
    });
  }
  let decoded: unknown;
  try {
    decoded = JSON.parse(text);
  } catch (error) {
    throw new Error('LiveBench question evidence is not valid JSON', {
      cause: error,
    });
  }
  const evidence = parseLiveBenchQuestionInventoryEvidence(decoded);
  return {
    contentSha256,
    byteLength: body.byteLength,
    release: evidence.release,
    observations: evidence.inventory,
  };
}
