import type { CandidateResult, ProductEvidence } from './index.js';

export const AA_FRONTIER_POLICY = {
  sourceId: 'artificial-analysis',
  benchmarkId: 'artificial-analysis-intelligence-index',
  searchWindowModels: 10,
  gapToOtherMedianMultiplier: 2,
} as const;

type SharedEvidenceFields =
  | 'id'
  | 'sourceId'
  | 'benchmarkId'
  | 'benchmarkVersion'
  | 'model'
  | 'metric'
  | 'rawScore';

/** Accept source candidates before product filtering, or saved product evidence. */
export type FrontierSelectionEvidence =
  | Pick<CandidateResult, SharedEvidenceFields | 'evidenceIds' | 'provenance'>
  | Pick<ProductEvidence, SharedEvidenceFields | 'provenance'>;

export interface AaFrontierLeader {
  rank: number;
  modelId: string;
  profileId: string | null;
  score: number;
  resultId: string;
  evidenceIds: string[];
}

export interface AaFrontierBoundary {
  /** The largest gap is between afterRank and afterRank + 1. */
  afterRank: number;
  largestGap: number;
  otherGapMedian: number;
  /** Null when the other-gap median is zero; the threshold still applies. */
  gapRatio: number | null;
  multiplier: 2;
}

export interface AaFrontierIssue {
  code:
    | 'missing-version'
    | 'mixed-versions'
    | 'invalid-score'
    | 'invalid-metric'
    | 'missing-evidence'
    | 'too-few-models'
    | 'unresolved-leaders'
    | 'no-positive-gap'
    | 'tied-largest-gap'
    | 'gap-below-threshold';
  message: string;
  resultIds: string[];
}

export interface AaFrontierSelection {
  status: 'selected' | 'needs-review';
  policy: typeof AA_FRONTIER_POLICY;
  benchmarkVersion: string | null;
  resolvedModelCount: number;
  topTen: AaFrontierLeader[];
  gaps: number[];
  boundary: AaFrontierBoundary | null;
  selectedModelIds: string[];
  selectedProfileIds: string[];
  issues: AaFrontierIssue[];
}

const compareText = (left: string, right: string): number =>
  left < right ? -1 : left > right ? 1 : 0;

const evidenceIdsFor = (row: FrontierSelectionEvidence): string[] => {
  if ('evidenceIds' in row) {
    const scoreEvidenceId = row.provenance.rawScore?.evidenceId;
    return scoreEvidenceId && row.evidenceIds.includes(scoreEvidenceId)
      ? [scoreEvidenceId]
      : [];
  }
  return row.provenance.evidenceId ? [row.provenance.evidenceId] : [];
};

/**
 * Rank ten canonical models by their best raw AA index score, then accept only
 * a unique positive largest adjacent gap at least twice the other eight gaps'
 * median. Composite rows excluded from preset scoring remain selection inputs.
 * Pass the whole AA candidate population so unresolved leaders can block review.
 */
export const selectAaFrontier = (
  evidence: readonly FrontierSelectionEvidence[],
): AaFrontierSelection => {
  const rows = evidence.filter(
    (row) =>
      row.sourceId === AA_FRONTIER_POLICY.sourceId &&
      row.benchmarkId === AA_FRONTIER_POLICY.benchmarkId,
  );
  const issues: AaFrontierIssue[] = [];
  const addIssue = (
    code: AaFrontierIssue['code'],
    message: string,
    affected: readonly FrontierSelectionEvidence[] = [],
  ): void => {
    issues.push({
      code,
      message,
      resultIds: affected.map(({ id }) => id).sort(compareText),
    });
  };
  const versions = [
    ...new Set(rows.map(({ benchmarkVersion }) => benchmarkVersion)),
  ];
  const missingVersion = rows.filter(
    ({ benchmarkVersion }) => !benchmarkVersion?.trim(),
  );
  if (missingVersion.length) {
    addIssue(
      'missing-version',
      'AA frontier selection requires a known benchmark version.',
      missingVersion,
    );
  }
  if (versions.length > 1) {
    addIssue(
      'mixed-versions',
      'AA frontier selection cannot combine benchmark versions.',
      rows,
    );
  }
  const invalidScores = rows.filter(
    ({ rawScore }) => !Number.isFinite(rawScore),
  );
  if (invalidScores.length) {
    addIssue(
      'invalid-score',
      'AA frontier selection requires finite raw scores.',
      invalidScores,
    );
  }
  const invalidMetrics = rows.filter(({ metric }) => !metric.higherIsBetter);
  if (invalidMetrics.length) {
    addIssue(
      'invalid-metric',
      'AA Intelligence Index scores must be higher-is-better.',
      invalidMetrics,
    );
  }
  const missingEvidence = rows.filter(
    (row) => evidenceIdsFor(row).length === 0,
  );
  if (missingEvidence.length) {
    addIssue(
      'missing-evidence',
      'AA frontier scores require linked raw-score evidence.',
      missingEvidence,
    );
  }

  const result: AaFrontierSelection = {
    status: 'needs-review',
    policy: { ...AA_FRONTIER_POLICY },
    benchmarkVersion:
      versions.length === 1 && versions[0]?.trim() ? versions[0] : null,
    resolvedModelCount: 0,
    topTen: [],
    gaps: [],
    boundary: null,
    selectedModelIds: [],
    selectedProfileIds: [],
    issues,
  };
  // Invalid or incomparable scores cannot produce a meaningful ranking.
  if (issues.length) return result;

  const bestByModel = new Map<string, FrontierSelectionEvidence>();
  for (const row of rows) {
    const modelId = row.model.canonicalModelId;
    if (modelId === null) continue;
    const prior = bestByModel.get(modelId);
    if (
      !prior ||
      row.rawScore > prior.rawScore ||
      (row.rawScore === prior.rawScore && compareText(row.id, prior.id) < 0)
    ) {
      bestByModel.set(modelId, row);
    }
  }
  result.resolvedModelCount = bestByModel.size;
  const leaders = [...bestByModel.values()].sort(
    (left, right) =>
      right.rawScore - left.rawScore ||
      compareText(left.model.canonicalModelId!, right.model.canonicalModelId!),
  );
  const topTen = leaders.slice(0, AA_FRONTIER_POLICY.searchWindowModels);
  result.topTen = topTen.map((row, index) => ({
    rank: index + 1,
    modelId: row.model.canonicalModelId!,
    profileId: row.model.profileId,
    score: row.rawScore,
    resultId: row.id,
    evidenceIds: evidenceIdsFor(row),
  }));
  if (leaders.length < AA_FRONTIER_POLICY.searchWindowModels) {
    addIssue(
      'too-few-models',
      `AA frontier selection requires at least 10 mapped models; found ${leaders.length}.`,
    );
    return result;
  }
  const tenthScore = topTen[9]!.rawScore;
  const unresolvedLeaders = rows.filter(
    (row) =>
      (row.model.canonicalModelId === null && row.rawScore >= tenthScore) ||
      (topTen.includes(row) && row.model.profileId === null),
  );
  if (unresolvedLeaders.length) {
    addIssue(
      'unresolved-leaders',
      'Unresolved AA identities or profiles can affect the top-ten frontier boundary.',
      unresolvedLeaders,
    );
    return result;
  }

  result.gaps = topTen
    .slice(1)
    .map((row, index) => topTen[index]!.rawScore - row.rawScore);
  const largestGap = Math.max(...result.gaps);
  if (largestGap <= 0) {
    addIssue(
      'no-positive-gap',
      'The AA top ten have no positive adjacent score gap.',
    );
    return result;
  }
  const largestIndices = result.gaps.flatMap((gap, index) =>
    gap === largestGap ? [index] : [],
  );
  if (largestIndices.length !== 1) {
    addIssue('tied-largest-gap', 'The largest AA adjacent score gap is tied.');
    return result;
  }
  const boundaryIndex = largestIndices[0]!;
  const otherGaps = result.gaps
    .filter((_, index) => index !== boundaryIndex)
    .sort((a, b) => a - b);
  const otherGapMedian = (otherGaps[3]! + otherGaps[4]!) / 2;
  result.boundary = {
    afterRank: boundaryIndex + 1,
    largestGap,
    otherGapMedian,
    gapRatio: otherGapMedian === 0 ? null : largestGap / otherGapMedian,
    multiplier: AA_FRONTIER_POLICY.gapToOtherMedianMultiplier,
  };
  if (
    largestGap <
    AA_FRONTIER_POLICY.gapToOtherMedianMultiplier * otherGapMedian
  ) {
    addIssue(
      'gap-below-threshold',
      'The largest AA gap is below twice the median of the other eight gaps.',
    );
    return result;
  }
  const selected = result.topTen.slice(0, result.boundary.afterRank);
  result.status = 'selected';
  result.selectedModelIds = selected.map(({ modelId }) => modelId);
  result.selectedProfileIds = selected.map(({ profileId }) => profileId!);
  return result;
};

/** Validate the ranked population while retaining the gap calculation as audit. */
export const selectAaTopTen = (
  evidence: readonly FrontierSelectionEvidence[],
) => {
  const audit = selectAaFrontier(evidence);
  const gapCodes = new Set<AaFrontierIssue['code']>([
    'no-positive-gap',
    'tied-largest-gap',
    'gap-below-threshold',
  ]);
  const issues = audit.issues.filter(({ code }) => !gapCodes.has(code));
  const valid = issues.length === 0 && audit.topTen.length === 10;
  return {
    ...audit,
    status: valid ? ('selected' as const) : ('needs-review' as const),
    selectedModelIds: valid ? audit.topTen.map(({ modelId }) => modelId) : [],
    selectedProfileIds: valid
      ? audit.topTen.map(({ profileId }) => profileId!)
      : [],
    issues,
    gapAudit: {
      status: audit.status,
      selectedModelIds: audit.selectedModelIds,
      issues: audit.issues.filter(({ code }) => gapCodes.has(code)),
    },
  };
};
