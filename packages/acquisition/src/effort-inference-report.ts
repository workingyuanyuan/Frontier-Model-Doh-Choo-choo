import {
  decideProductEffort,
  type CandidateResult,
  type EffortDecision,
  type ProfilePolicy,
} from '@llm-bench/benchmark-data';

export const EFFORT_INFERENCE_START = '<!-- C6-EFFORT-INFERENCE:START -->';
export const EFFORT_INFERENCE_END = '<!-- C6-EFFORT-INFERENCE:END -->';

export interface EffortInferenceReportRow {
  model: string;
  canonicalModelId: string;
  candidateId: string;
  sourceId: string;
  rawEffort: string | null;
  effort: string;
  basis: EffortDecision['basis'];
  basisSourceId: string | null;
  basisCandidateId: string | null;
}

const rowFor = (
  candidate: CandidateResult,
  decision: EffortDecision,
): EffortInferenceReportRow | null => {
  if (candidate.model.canonicalModelId === null) return null;
  if (!['CROSS_SOURCE', 'DEFAULT'].includes(decision.basis)) return null;
  return {
    model: candidate.model.rawName,
    canonicalModelId: candidate.model.canonicalModelId,
    candidateId: candidate.id,
    sourceId: candidate.sourceId,
    rawEffort: candidate.profile.effort,
    effort: decision.effort,
    basis: decision.basis,
    basisSourceId: decision.basisSourceId,
    basisCandidateId: decision.basisCandidateId,
  };
};

const sortRows = (
  rows: EffortInferenceReportRow[],
): EffortInferenceReportRow[] =>
  rows.toSorted(
    (left, right) =>
      left.model.localeCompare(right.model) ||
      left.candidateId.localeCompare(right.candidateId),
  );

const cell = (value: string | null): string =>
  value === null ? '—' : value.replaceAll('|', '\\|');

const renderTable = (rows: readonly EffortInferenceReportRow[]): string[] => {
  if (rows.length === 0) return ['- None.'];
  return [
    '| Model | Target candidate | Raw effort | Product effort | Basis source | Basis candidate |',
    '|---|---|---|---|---|---|',
    ...rows.map(
      (row) =>
        `| ${cell(row.model)} | \`${cell(row.candidateId)}\` | ${cell(row.rawEffort)} | \`${row.effort}\` | ${cell(row.basisSourceId)} | ${cell(row.basisCandidateId)} |`,
    ),
  ];
};

/**
 * Render the deterministic, tagged C6 section for one source report.
 *
 * Only inference/default rows are listed. Direct source/name-derived rows are
 * already represented by the materializer's normal validation report and do
 * not need a second, duplicative table.
 */
export const renderEffortInferenceSection = (
  sourceId: string,
  sourceCandidates: readonly CandidateResult[],
  allCandidates: readonly CandidateResult[],
  policy: ProfilePolicy,
): string => {
  const rows = sortRows(
    sourceCandidates.flatMap((candidate) => {
      const decision = decideProductEffort(candidate, allCandidates);
      const row = rowFor(candidate, decision);
      return row === null ? [] : [row];
    }),
  );
  const crossSourceRows = rows.filter(({ basis }) => basis === 'CROSS_SOURCE');
  const defaultRows = rows.filter(({ basis }) => basis === 'DEFAULT');

  return [
    EFFORT_INFERENCE_START,
    '## C6 effort inference — PENDING USER REVIEW',
    '',
    `This tagged section is generated deterministically for \`${sourceId}\`. Raw \`profile.effort\` remains unchanged; \`productProfile.effort\` is the transient product decision. Policy default: \`${policy.defaultEffort}\`.`,
    '',
    '### Cross-source inferences — PENDING USER REVIEW',
    '',
    ...renderTable(crossSourceRows),
    '',
    '### Unlabelled rows assigned the outside-the-ladder default',
    '',
    ...renderTable(defaultRows),
    '',
    EFFORT_INFERENCE_END,
  ].join('\n');
};

/** Replace an existing generated section, or append it exactly once. */
export const upsertEffortInferenceSection = (
  report: string,
  section: string,
): string => {
  const start = report.indexOf(EFFORT_INFERENCE_START);
  const endMarkerIndex = report.indexOf(EFFORT_INFERENCE_END);
  if (start >= 0 && endMarkerIndex >= start) {
    const end = endMarkerIndex + EFFORT_INFERENCE_END.length;
    return `${report.slice(0, start).replace(/\s*$/u, '')}\n\n${section}\n${report.slice(end).replace(/^\s*/u, '')}`;
  }
  return `${report.replace(/\s*$/u, '')}\n\n${section}\n`;
};
