import {
  CandidateResultSchema,
  type CandidateResult,
  type EvidenceRecord,
} from '@llm-bench/benchmark-data';

import {
  withCurrentIdentity,
  type CurrentIdentity,
} from './materializer-utils.js';

/** The official page inserts its version chip with inline JavaScript. Both
 * raw HTTP HTML and the rendered DOM contain this explicit span markup. */
export function surgeBenchmarkVersion(html: string): string | null {
  const versions = new Set(
    [
      ...html.matchAll(
        /<span\b[^>]*class="v2-chip"[^>]*>\s*(v\d+(?:\.\d+)+)\s*<\/span>/gu,
      ),
    ].map((match) => match[1]!),
  );
  if (versions.size > 1)
    throw new Error('Conflicting Surge benchmark versions');
  return [...versions][0] ?? null;
}

export function latestSurgeEvidence(
  records: EvidenceRecord[],
  url: string,
): EvidenceRecord {
  const record = records
    .filter((value) => value.requestUrl === url)
    .toSorted((a, b) => b.retrievedAt.localeCompare(a.retrievedAt))[0];
  if (!record) throw new Error(`Missing Surge evidence: ${url}`);
  return record;
}

export function surgeRetentionReport(
  report: string,
  visibleRows: number,
  merged: ReturnType<typeof retainSurgeRows>,
): string {
  return (
    report +
    '\n## Preserved rows omitted from the current leaderboard\n\n' +
    `Current rendered rows: ${visibleRows}; preserved: ${merged.retained.length}; total stored: ${merged.candidates.length}. Preserved rows retain their original version, timestamp, score and Evidence and are not current-version reruns; their model identity and effort follow the current catalog and configuration rules.\n\n` +
    merged.retained
      .map(
        (row) =>
          `- ${row.id}: ${row.rawScore}; version ${row.benchmarkVersion ?? 'unpublished'}; observed ${row.observedAt}; Evidence ${row.evidenceIds.join(', ')}.`,
      )
      .join('\n') +
    '\n' +
    (merged.reresolved.length === 0
      ? ''
      : `\nPreserved rows re-resolved against the current model catalog: ${merged.reresolved.join('; ')}.\n`)
  );
}

/** Keep removed source rows with their original version, time and evidence.
 * Their identity and effort are re-derived from the raw name with the current
 * catalog and configuration rules first, so a current exact canonical model/effort supersedes a renamed old
 * row even when the catalog gained the model after the row was captured. */
export function retainSurgeRows(
  current: CandidateResult[],
  previous: CandidateResult[],
  evidence: EvidenceRecord[],
  identity: (row: CandidateResult) => CurrentIdentity,
): {
  candidates: CandidateResult[];
  retained: CandidateResult[];
  /** Retained rows whose identity the current catalog changed. */
  reresolved: string[];
  evidence: EvidenceRecord[];
} {
  const key = (row: CandidateResult): string =>
    row.model.canonicalModelId !== null && row.profile.effort !== null
      ? JSON.stringify([
          row.sourceId,
          row.benchmarkId,
          row.metric.id,
          row.model.canonicalModelId,
          row.profile.effort,
        ])
      : row.id;
  const currentKeys = new Set(current.map(key));
  const currentIds = new Set(current.map((row) => row.id));
  const removed = withCurrentIdentity(
    previous.filter((row) => !currentIds.has(row.id)),
    identity,
  );
  const retained = removed.rows.filter((row) => !currentKeys.has(key(row)));
  const reresolved = retained.flatMap(
    ({ id }) => removed.changes.get(id) ?? [],
  );
  const candidates = [...current, ...retained].toSorted((a, b) =>
    a.id.localeCompare(b.id),
  );
  const ids = new Set(candidates.flatMap((row) => row.evidenceIds));
  const records = new Map(evidence.map((record) => [record.id, record]));
  for (const id of ids) {
    if (!records.has(id))
      throw new Error(`Missing retained Surge evidence: ${id}`);
  }
  return {
    candidates,
    retained,
    reresolved,
    evidence: [...ids].toSorted().map((id) => records.get(id)!),
  };
}

export function retainSurgeSnapshot(
  result: {
    candidates: CandidateResult[];
    validationReport: string;
    visibleRows: number;
  },
  previousCandidatesJson: string | undefined,
  evidence: EvidenceRecord[],
  identity: (row: CandidateResult) => CurrentIdentity,
) {
  const merged = retainSurgeRows(
    result.candidates,
    CandidateResultSchema.array().parse(
      JSON.parse(previousCandidatesJson ?? '[]'),
    ),
    evidence,
    identity,
  );
  return {
    candidates: merged.candidates,
    validationReport: surgeRetentionReport(
      result.validationReport,
      result.visibleRows,
      merged,
    ),
  };
}
