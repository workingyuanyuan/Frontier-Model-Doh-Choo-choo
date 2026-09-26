import { acquisitionClient } from './safe-network.js';
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { format, resolveConfig } from 'prettier';

import {
  EvidenceRecordSchema,
  deterministicJson,
  type EvidenceRecord,
} from '@llm-bench/benchmark-data';

import { writeContentAddressedArtifact } from './index.js';

export const getWorkspaceRoot = (): string => {
  let directory = process.cwd();
  while (true) {
    if (existsSync(join(directory, 'data'))) return directory;
    const parent = dirname(directory);
    if (parent === directory) throw new Error('Workspace root not found');
    directory = parent;
  }
};

export const readJson = async <T>(path: string): Promise<T> =>
  JSON.parse(await readFile(path, 'utf8')) as T;

export const readText = async (path: string): Promise<string> =>
  readFile(path, 'utf8');

export const previousSnapshotValue = (
  report: string,
  label: string,
  fallback: number,
): number => {
  const cells = report
    .split(/\r?\n/u)
    .map((row) =>
      row
        .split('|')
        .slice(1, -1)
        .map((cell) => cell.trim()),
    )
    .find((row) => row[0] === label && row.length === 4);
  // The prior report's Refreshed value is this run's starting snapshot.
  const value = cells?.[2];
  if (!value) return fallback;
  const previous = Number(value);
  return Number.isFinite(previous) ? previous : fallback;
};

export const prettyDeterministicJson = (value: unknown): string =>
  `${JSON.stringify(JSON.parse(deterministicJson(value)), null, 2)}\n`;

export const formatMetadataJson = async (
  value: unknown,
  path: string,
): Promise<string> =>
  format(prettyDeterministicJson(value), {
    ...(await resolveConfig(path)),
    filepath: path,
    parser: 'json',
  });

export const writeMetadataJson = async (
  path: string,
  value: unknown,
): Promise<void> => {
  await writeFile(path, await formatMetadataJson(value, path));
};

export interface CapturedArtifact {
  bytes: Uint8Array;
  text: string;
  record: EvidenceRecord;
}

export const captureArtifact = async (input: {
  root: string;
  sourceId: string;
  url: string;
  retrievedAt: string;
  mediaType: string;
  method: EvidenceRecord['method'];
  metadata: Record<string, unknown>;
}): Promise<CapturedArtifact> => {
  const response = await acquisitionClient.get(input.url);
  if (!response.ok) {
    throw new Error(`${input.url} returned HTTP ${response.status}`);
  }
  const bytes = response.bytes;
  const stored = await writeContentAddressedArtifact(
    join(input.root, 'artifacts', 'sha256'),
    bytes,
    input.mediaType,
  );
  return {
    bytes,
    text: new TextDecoder().decode(bytes),
    record: EvidenceRecordSchema.parse({
      ...stored.record,
      sourceId: input.sourceId,
      retrievedAt: input.retrievedAt,
      requestUrl: input.url,
      finalUrl: response.url || input.url,
      artifactPath: `artifacts/sha256/${stored.record.artifactPath}`,
      method: input.method,
      metadata: input.metadata,
    }),
  };
};

export const snapshotDeltaMarkdown = (
  rows: ReadonlyArray<{
    label: string;
    previous: number;
    refreshed: number;
  }>,
): string =>
  [
    '## Snapshot delta',
    '',
    '| Check | Previous | Refreshed | Delta |',
    '|---|---:|---:|---:|',
    ...rows.map(
      ({ label, previous, refreshed }) =>
        `| ${label} | ${previous} | ${refreshed} | ${refreshed - previous >= 0 ? '+' : ''}${refreshed - previous} |`,
    ),
    '',
    'Previous content-addressed artifacts remain preserved; this report compares the prior tracked snapshot with the refreshed snapshot.',
    '',
  ].join('\n');
