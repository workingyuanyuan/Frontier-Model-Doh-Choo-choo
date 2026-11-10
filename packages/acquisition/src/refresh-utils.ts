import { readJson } from '@llm-bench/benchmark-data/node-utils';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { format, resolveConfig } from 'prettier';

import {
  EvidenceRecordSchema,
  deterministicJson,
  type EvidenceRecord,
  type CandidateResult,
  type CostRecord,
} from '@llm-bench/benchmark-data';

import { writeContentAddressedArtifact } from './index.js';
import {
  acquireEvidenceResponse,
  recordCapturedEvidence,
} from './source-processing.js';

export { getWorkspaceRoot } from './workspace-root.js';

export { readJson } from '@llm-bench/benchmark-data/node-utils';

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
  const response = await acquireEvidenceResponse(input);
  if (!response.ok) {
    throw new Error(`${input.url} returned HTTP ${response.status}`);
  }
  const bytes = response.bytes;
  const stored = await writeContentAddressedArtifact(
    join(input.root, 'artifacts', 'sha256'),
    bytes,
    input.mediaType,
  );
  const record = EvidenceRecordSchema.parse({
    ...stored.record,
    sourceId: input.sourceId,
    retrievedAt: input.retrievedAt,
    requestUrl: input.url,
    finalUrl: response.url || input.url,
    artifactPath: `artifacts/sha256/${stored.record.artifactPath}`,
    method: input.method,
    metadata: input.metadata,
  });
  recordCapturedEvidence(input.root, record, {
    status: response.status,
    headers: Object.fromEntries(response.headers),
  });
  return { bytes, text: new TextDecoder().decode(bytes), record };
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

export const writeSourceSnapshot = async (
  directory: string,
  manifest: unknown,
  evidence: EvidenceRecord[],
  candidates: CandidateResult[],
  validationReport: () => string,
): Promise<void> => {
  await mkdir(directory, { recursive: true });
  await writeMetadataJson(join(directory, 'manifest.json'), manifest);
  await writeMetadataJson(join(directory, 'evidence-index.json'), evidence);
  await writeFile(
    join(directory, 'candidates.json'),
    deterministicJson(candidates),
  );
  await writeFile(join(directory, 'validation-report.md'), validationReport());
};

export async function readRequiredSnapshotComparison(directory: string) {
  const previousCandidates = await readJson<CandidateResult[]>(
    join(directory, 'candidates.json'),
  );
  const previousCosts = await readJson<CostRecord[]>(
    join(directory, 'costs.json'),
  );
  const previousReport = await readText(
    join(directory, 'validation-report.md'),
  );
  return { previousCandidates, previousCosts, previousReport };
}

export async function readOptionalSnapshotComparison(directory: string) {
  const previousCandidates = await readJson<CandidateResult[]>(
    join(directory, 'candidates.json'),
  ).catch(() => [] as CandidateResult[]);

  const previousCosts = await readJson<CostRecord[]>(
    join(directory, 'costs.json'),
  ).catch(() => [] as CostRecord[]);

  const previousReport = await readText(
    join(directory, 'validation-report.md'),
  ).catch(() => '');
  return { previousCandidates, previousCosts, previousReport };
}
