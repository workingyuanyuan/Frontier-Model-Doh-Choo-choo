import type { CandidateResult } from '@llm-bench/benchmark-data';

export interface VendorCrossCheck {
  candidateId: string;
  benchmarkId: string;
  modelId: string | null;
  effort: string | null;
  vendorScore: number | null;
  referenceScore: number | null;
  referenceUrl: string | null;
  status: 'MATCH' | 'SUPPLEMENT' | 'EXCLUDED';
  note: string;
}

/** Only the reviewed benchmark releases and scoring metrics may share a key. */
export function auditVendorReleases(
  candidates: CandidateResult[],
  organizerCandidates: CandidateResult[],
  cursorHtml: string,
): VendorCrossCheck[] {
  if (!cursorHtml.includes('CursorBench 4.0')) {
    throw new Error(
      'Cursor reference is not the reviewed CursorBench 4.0 release',
    );
  }
  const cursorRows = new Map<string, number>();
  const effortNames: Record<string, string> = {
    Low: 'low',
    Medium: 'medium',
    High: 'high',
    'Extra High': 'xhigh',
    Max: 'max',
  };
  const models: Record<string, string> = {
    'Opus 5.5': 'anthropic-claude-opus-5-5',
    'Fable 5.1': 'anthropic-claude-fable-5-1',
    'Opus 5': 'anthropic-claude-opus-5',
    'GPT-5.6 Sol': 'openai-gpt-5-6-sol',
  };
  for (const match of cursorHtml.matchAll(
    /aria-label="([^"<>]+?) (Extra High|Medium|High|Low|Max): ([\d.]+)%,/gu,
  )) {
    const modelId = models[match[1]!];
    if (!modelId) continue;
    const key = `${modelId}:${effortNames[match[2]!]}`;
    const score = Number(match[3]);
    if (!Number.isFinite(score) || score < 0 || score > 100)
      throw new Error('Invalid Cursor reference score');
    if (cursorRows.has(key) && cursorRows.get(key) !== score)
      throw new Error(`Conflicting Cursor reference: ${key}`);
    cursorRows.set(key, score);
  }
  if (cursorRows.size < 15)
    throw new Error('Cursor reference is missing the reviewed overlap');

  const checks = candidates.map((row): VendorCrossCheck => {
    const base = {
      candidateId: row.id,
      benchmarkId: row.benchmarkId,
      modelId: row.model.canonicalModelId,
      effort: row.profile.effort,
      vendorScore: row.normalizedScore,
    };
    if (row.inclusion === 'EXCLUDED')
      return {
        ...base,
        referenceScore: null,
        referenceUrl: null,
        status: 'EXCLUDED',
        note: row.exclusionReason!,
      };
    let referenceScore: number | null;
    let referenceUrl: string | null;
    if (row.benchmarkId === 'cursorbench-4') {
      referenceScore =
        cursorRows.get(`${row.model.canonicalModelId}:${row.profile.effort}`) ??
        null;
      referenceUrl = 'https://prod.cursor.com/evals';
    } else {
      const matches = organizerCandidates.filter(
        (reference) =>
          reference.sourceRole === 'ORGANIZER' &&
          reference.inclusion === 'INCLUDED' &&
          reference.benchmarkId === row.benchmarkId &&
          reference.benchmarkVersion === row.benchmarkVersion &&
          reference.metric.id === row.metric.id &&
          reference.model.canonicalModelId === row.model.canonicalModelId &&
          reference.profile.effort === row.profile.effort &&
          reference.normalizedScore !== null,
      );
      // These reviewed organizer snapshots each use one harness per model.
      if (matches.length > 1)
        throw new Error(`Ambiguous organizer configuration: ${row.id}`);
      referenceScore = matches[0]?.normalizedScore ?? null;
      referenceUrl = matches[0]?.sourceUrl ?? null;
    }
    if (referenceScore === null)
      return {
        ...base,
        referenceScore,
        referenceUrl,
        status: 'SUPPLEMENT',
        note: 'No matching row in the captured organizer snapshot; retained as a vendor-reported preview, not independent verification of this row.',
      };
    // AutomationBench is displayed to 0.1 points on one side of the comparison;
    // DeepSWE's release chart has 2 decimal points; other selected charts are exact.
    const tolerance =
      row.benchmarkId === 'automationbench'
        ? 0.05
        : row.benchmarkId === 'deepswe-1-1'
          ? 0.005
          : 0.000001;
    if (Math.abs(row.normalizedScore! - referenceScore) > tolerance + 1e-9) {
      throw new Error(
        `Vendor/organizer mismatch: ${row.id}: ${row.normalizedScore} vs ${referenceScore}`,
      );
    }
    return {
      ...base,
      referenceScore,
      referenceUrl,
      status: 'MATCH',
      note: 'Same benchmark release, metric, model and explicit effort; score agrees within published rounding precision. This does not establish a common evaluator.',
    };
  });
  for (const benchmarkId of new Set(
    candidates
      .filter((r) => r.inclusion === 'INCLUDED')
      .map((r) => r.benchmarkId),
  )) {
    if (
      !checks.some((r) => r.benchmarkId === benchmarkId && r.status === 'MATCH')
    )
      throw new Error(`No organizer anchor for ${benchmarkId}`);
  }
  return checks;
}
