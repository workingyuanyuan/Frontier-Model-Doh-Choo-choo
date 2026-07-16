import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { extname, join, resolve, sep } from 'node:path';

import {
  EvidenceRecordSchema,
  sha256,
  type EvidenceRecord,
} from '@llm-bench/benchmark-data';

const EXTENSIONS: Record<string, string> = {
  'application/json': '.json',
  'application/pdf': '.pdf',
  'text/html': '.html',
  'text/plain': '.txt',
};

const extensionForMediaType = (mediaType: string): string => {
  const extension = EXTENSIONS[mediaType];
  if (!extension) {
    throw new Error(`unsupported artifact media type: ${mediaType}`);
  }
  return extension;
};

const ensureInside = (root: string, path: string): void => {
  const resolvedRoot = resolve(root);
  const resolvedPath = resolve(path);
  if (
    resolvedPath !== resolvedRoot &&
    !resolvedPath.startsWith(`${resolvedRoot}${sep}`)
  ) {
    throw new Error('artifact path escapes its configured root');
  }
};

export const buildArtifactRecord = (
  bytes: Uint8Array,
  mediaType: string,
  artifactPath: string,
  overrides: Partial<
    Pick<
      EvidenceRecord,
      | 'sourceId'
      | 'retrievedAt'
      | 'requestUrl'
      | 'finalUrl'
      | 'method'
      | 'metadata'
    >
  > = {},
): EvidenceRecord => {
  const digest = sha256(bytes);
  return EvidenceRecordSchema.parse({
    schemaVersion: 'evidence-record-v1',
    id: digest,
    sourceId: overrides.sourceId ?? 'local-fixture',
    retrievedAt: overrides.retrievedAt ?? '1970-01-01T00:00:00.000Z',
    requestUrl: overrides.requestUrl ?? 'https://example.test/evidence',
    finalUrl: overrides.finalUrl ?? 'https://example.test/evidence',
    mediaType,
    byteLength: bytes.byteLength,
    sha256: digest,
    artifactPath,
    method: overrides.method ?? 'MANUAL',
    metadata: overrides.metadata ?? {},
  });
};

export const verifyArtifactRecord = (
  record: EvidenceRecord,
  bytes: Uint8Array,
): void => {
  if (record.sha256 !== sha256(bytes)) {
    throw new Error('artifact hash does not match its evidence record');
  }
  if (record.byteLength !== bytes.byteLength) {
    throw new Error('artifact byte length does not match its evidence record');
  }
};

export const writeContentAddressedArtifact = async (
  root: string,
  bytes: Uint8Array,
  mediaType: string,
): Promise<{ path: string; record: EvidenceRecord }> => {
  const digest = sha256(bytes).slice('sha256:'.length);
  const extension = extensionForMediaType(mediaType);
  const path = join(root, digest.slice(0, 2), `${digest}${extension}`);
  ensureInside(root, path);
  await mkdir(join(root, digest.slice(0, 2)), { recursive: true });

  try {
    const existing = await readFile(path);
    if (sha256(existing) !== `sha256:${digest}`) {
      throw new Error('existing content-addressed artifact is corrupt');
    }
  } catch (error) {
    if (
      error instanceof Error &&
      'code' in error &&
      error.code === 'ENOENT'
    ) {
      await writeFile(path, bytes, { flag: 'wx' });
    } else {
      throw error;
    }
  }

  const relativePath = path
    .slice(resolve(root).length)
    .replace(/^[/\\]+/u, '')
    .replaceAll('\\', '/');
  const record = buildArtifactRecord(bytes, mediaType, relativePath);
  if (extname(path) !== extension) {
    throw new Error('artifact extension does not match its media type');
  }
  return { path, record };
};
