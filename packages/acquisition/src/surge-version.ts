import {
  CandidateResultSchema,
  type CandidateResult,
  type EvidenceRecord,
} from '@llm-bench/benchmark-data';

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
    `Current rendered rows: ${visibleRows}; preserved: ${merged.retained.length}; total stored: ${merged.candidates.length}. Preserved rows retain their original version, timestamp, score and Evidence and are not current-version reruns.\n\n` +
    merged.retained
      .map(
        (row) =>
          `- ${row.id}: ${row.rawScore}; version ${row.benchmarkVersion ?? 'unpublished'}; observed ${row.observedAt}; Evidence ${row.evidenceIds.join(', ')}.`,
      )
      .join('\n') +
    '\n'
  );
}

/** Keep removed source rows with their original version, time and evidence.
 * A current exact canonical model/effort supersedes a renamed old row. */
export function retainSurgeRows(
  current: CandidateResult[],
  previous: CandidateResult[],
  evidence: EvidenceRecord[],
): {
  candidates: CandidateResult[];
  retained: CandidateResult[];
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
  const retained = previous.filter(
    (row) => !currentIds.has(row.id) && !currentKeys.has(key(row)),
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
) {
  const merged = retainSurgeRows(
    result.candidates,
    CandidateResultSchema.array().parse(
      JSON.parse(previousCandidatesJson ?? '[]'),
    ),
    evidence,
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
