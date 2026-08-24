import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

import {
  EvidenceRecordSchema,
  deterministicJson,
  type EvidenceRecord,
} from '@llm-bench/benchmark-data';

import { writeContentAddressedArtifact } from './index.js';

export const getWorkspaceRoot = (): string => {
  let directory = process.cwd();
  while (true) {
    if (existsSync(join(directory, 'data-v2'))) return directory;
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
  const prefix = `| ${label} |`;
  const line = report.split(/\r?\n/u).find((row) => row.startsWith(prefix));
  if (!line) return fallback;
  const previous = Number(line.split('|')[2]?.trim());
  return Number.isFinite(previous) ? previous : fallback;
};

export const prettyDeterministicJson = (value: unknown): string =>
  `${JSON.stringify(JSON.parse(deterministicJson(value)), null, 2)}\n`;

export const manifestJson = (
  manifest: Record<
    'accessMethods' | 'benchmarkIds' | 'fallbackMethods',
    string[]
  > &
    object,
): string => {
  let json = prettyDeterministicJson(manifest);
  for (const key of [
    'accessMethods',
    'benchmarkIds',
    'fallbackMethods',
  ] as const) {
    const expanded = `  ${JSON.stringify(key)}: [\n${manifest[key]
      .map((value) => `    ${JSON.stringify(value)}`)
      .join(',\n')}\n  ]`;
    const compact = `  ${JSON.stringify(key)}: [${manifest[key]
      .map((value) => JSON.stringify(value))
      .join(', ')}]`;
    json = json.replace(expanded, compact);
  }
  return json;
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
  const response = await fetch(input.url, {
    signal: AbortSignal.timeout(120_000),
  });
  if (!response.ok) {
    throw new Error(`${input.url} returned HTTP ${response.status}`);
  }
  const bytes = new Uint8Array(await response.arrayBuffer());
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
