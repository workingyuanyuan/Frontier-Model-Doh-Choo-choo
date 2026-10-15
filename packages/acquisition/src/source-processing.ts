import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { EvidenceRecord } from '@llm-bench/benchmark-data';
import { EvidenceStore } from './evidence-store.js';
import { acquisitionClient, type AcquisitionResponse } from './safe-network.js';

export class EvidencePersistenceError extends Error {}

export const acquireEvidenceResponse = async (
  context: { root: string; sourceId: string; url: string; retrievedAt: string },
  options?: { headers?: Record<string, string> },
): Promise<AcquisitionResponse> => {
  let response: AcquisitionResponse;
  try {
    response = await acquisitionClient.get(context.url, options);
  } catch (error) {
    recordCaptureFailure(context, error);
    throw error;
  }
  if (!response.ok) {
    const failure = new Error(
      `${context.url} returned HTTP ${response.status}`,
    );
    recordCaptureFailure(context, failure, response.status);
    throw failure;
  }
  return response;
};

const recordCaptureFailure = (
  context: { root: string; sourceId: string; url: string; retrievedAt: string },
  error: unknown,
  status?: number,
): void => {
  try {
    const store = new EvidenceStore(context.root);
    try {
      store.recordFailure({
        sourceId: context.sourceId,
        requestUrl: context.url,
        retrievedAt: context.retrievedAt,
        error: String(error),
        ...(status !== undefined ? { status } : {}),
      });
    } finally {
      store.close();
    }
  } catch (cause) {
    throw new EvidencePersistenceError(
      'Failed to persist acquisition attempt',
      { cause },
    );
  }
};

export type SourceFiles = Record<string, string>;

export const readSourceFiles = (
  root: string,
  sourceId: string,
): SourceFiles => {
  const directory = join(root, 'data', 'sources', sourceId);
  if (!existsSync(directory)) return {};
  return directoryContents(directory);
};

const directoryContents = (
  directory: string,
  extension?: string,
): SourceFiles => {
  if (!existsSync(directory)) return {};
  const files: SourceFiles = {};
  for (const entry of readdirSync(directory, { withFileTypes: true }).sort(
    (a, b) => a.name.localeCompare(b.name),
  )) {
    if (entry.isDirectory()) {
      for (const [path, text] of Object.entries(
        directoryContents(join(directory, entry.name), extension),
      ))
        files[`${entry.name}/${path}`] = text;
    } else if (!extension || entry.name.endsWith(extension)) {
      files[entry.name] = readFileSync(join(directory, entry.name), 'utf8');
    }
  }
  return files;
};

/** Fingerprint the executing parser sources, including shared identity/schema code. */
export const parserRevision = (): string => {
  const acquisition = fileURLToPath(new URL('.', import.meta.url));
  const benchmark = fileURLToPath(
    new URL('../../benchmark-data/src/', import.meta.url),
  );
  return createHash('sha256')
    .update(
      JSON.stringify({
        acquisition: directoryContents(acquisition, '.ts'),
        benchmark: directoryContents(benchmark),
      }),
    )
    .digest('hex');
};

export const processingConfig = (root: string): SourceFiles =>
  directoryContents(join(root, 'data', 'mappings'));

export const recordCapturedEvidence = (
  root: string,
  record: EvidenceRecord,
  response?: { status?: number; headers?: Record<string, string> },
): void => {
  try {
    const store = new EvidenceStore(root);
    try {
      store.recordCapture(record, response);
    } finally {
      store.close();
    }
  } catch (cause) {
    throw new EvidencePersistenceError(
      'Failed to persist acquisition capture',
      { cause },
    );
  }
};

/** Persist all source files before the recoverable export updates the working tree. */
export const publishSourceFiles = (
  root: string,
  sourceId: string,
  files: SourceFiles,
  kind = 'materialization',
): string => {
  const store = new EvidenceStore(root);
  try {
    const id = store.importSnapshot(sourceId, files, {
      kind,
      revision: parserRevision(),
    });
    store.exportSnapshot(id);
    return id;
  } finally {
    store.close();
  }
};

export const publishSourceDirectories = (
  root: string,
  sourceIds: readonly string[],
): void => {
  for (const sourceId of sourceIds)
    publishSourceFiles(root, sourceId, readSourceFiles(root, sourceId));
};

export interface ProcessingStats {
  hits: number;
  misses: number;
  parsedSources: number;
  elapsedMs: number;
}

/** Cache extraction only. Derived cross-source audits and effort reports run after staging. */
export const processSource = <T>(input: {
  store: EvidenceStore;
  sourceId: string;
  evidence: EvidenceRecord[];
  parserVersion: string;
  config: unknown;
  force?: boolean;
  materialize: () => T;
  encode: (result: T) => SourceFiles;
  decode: (files: SourceFiles) => T;
  stats: ProcessingStats;
}): T => {
  const key = {
    sourceId: input.sourceId,
    inputs: input.evidence,
    parserVersion: input.parserVersion,
    config: input.config,
  };
  const cached = input.store.lookupProcess(key, { force: input.force });
  console.log(
    `Cache ${input.sourceId}: ${cached.hit ? 'hit' : 'miss'} (${cached.reason})`,
  );
  if (cached.hit && cached.files) {
    input.stats.hits++;
    return input.decode(cached.files);
  }
  input.stats.misses++;
  input.stats.parsedSources++;
  const result = input.materialize();
  input.store.storeProcess(key, input.encode(result));
  return result;
};
