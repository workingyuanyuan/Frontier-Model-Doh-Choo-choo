import { createHash } from 'node:crypto';

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

/** The CursorBench release the vendor charts report. */
export const REVIEWED_CURSORBENCH_VERSION = '4.0';

/**
 * The last reviewed capture of Cursor's chart while it showed CursorBench 4.0
 * (retrieved 2026-11-18T04:58:48.889Z). Cursor moved the chart to 4.1 later
 * that day, so 4.0 vendor rows are cross-checked against this capture only.
 */
export const REVIEWED_CURSORBENCH_CAPTURE_ID =
  'sha256:b408dbffdabb64f17648ddb4e6b1cae2a0765f8010bd80924a3ae20b853dff8a';

/**
 * The CursorBench results sections of a Cursor evals page. Older releases
 * also appear in the page's changelog, so the release is read from the results
 * section label, and scores are read only from inside those sections.
 */
export function cursorBenchResults(html: string): {
  version: string;
  body: string;
} {
  const sections = [
    ...html
      .replace(/<!--[\s\S]*?-->/gu, '')
      .matchAll(
        /<section\b[^>]*\baria-label="CursorBench (\d+(?:\.\d+)+) results"[^>]*>([\s\S]*?)<\/section>/gu,
      ),
  ];
  const versions = new Set(sections.map((match) => match[1]!));
  if (versions.size !== 1)
    throw new Error(
      `Cursor reference must show exactly one CursorBench results release (found ${versions.size})`,
    );
  if (sections.some((match) => /<section\b/u.test(match[2]!)))
    throw new Error('Cursor results section has an unexpected nested section');
  return {
    version: [...versions][0]!,
    body: sections.map((match) => match[2]!).join('\n'),
  };
}

export const cursorBenchActiveVersion = (html: string): string =>
  cursorBenchResults(html).version;

/**
 * Releases after 4.0 whose arrival has been reviewed: on these the refresh
 * falls back to the pinned 4.0 capture. Any other release stops the refresh
 * for review.
 */
export const REVIEWED_CURSORBENCH_SUCCESSORS: readonly string[] = ['4.1'];

/**
 * Returns the reviewed 4.0 capture's text after checking the record is the
 * pinned capture and the bytes hash to it, so a different capture cannot be
 * substituted through the generated cross-check file.
 */
export function verifyReviewedCursorCapture(
  record: { id: string; sha256: string; byteLength: number },
  bytes: Uint8Array,
): string {
  const digest = `sha256:${createHash('sha256').update(bytes).digest('hex')}`;
  if (
    record.id !== REVIEWED_CURSORBENCH_CAPTURE_ID ||
    record.sha256 !== REVIEWED_CURSORBENCH_CAPTURE_ID ||
    digest !== REVIEWED_CURSORBENCH_CAPTURE_ID ||
    bytes.byteLength !== record.byteLength
  )
    throw new Error(
      `Cursor fallback ${record.id} is not the reviewed CursorBench ${REVIEWED_CURSORBENCH_VERSION} capture ${REVIEWED_CURSORBENCH_CAPTURE_ID}`,
    );
  const text = new TextDecoder().decode(bytes);
  if (cursorBenchActiveVersion(text) !== REVIEWED_CURSORBENCH_VERSION)
    throw new Error('Reviewed Cursor capture does not show CursorBench 4.0');
  return text;
}

/** Disclosure shared by the online refresh and the offline replay. */
export const cursorFallbackNote = (
  live: { id: string; retrievedAt: string },
  liveVersion: string,
  reviewed: { id: string; retrievedAt: string },
): string =>
  `Cursor's live chart now shows CursorBench ${liveVersion} (${live.id}, retrieved ${live.retrievedAt}). CursorBench ${REVIEWED_CURSORBENCH_VERSION} rows are cross-checked against the last reviewed ${REVIEWED_CURSORBENCH_VERSION} capture (${reviewed.id}, retrieved ${reviewed.retrievedAt}).`;

/** Only the reviewed benchmark releases and scoring metrics may share a key. */
export function auditVendorReleases(
  candidates: CandidateResult[],
  organizerCandidates: CandidateResult[],
  cursorHtml: string,
): VendorCrossCheck[] {
  const { version: cursorVersion, body: cursorBody } =
    cursorBenchResults(cursorHtml);
  if (cursorVersion !== REVIEWED_CURSORBENCH_VERSION) {
    throw new Error(
      `Cursor reference shows CursorBench ${cursorVersion}, not the reviewed ${REVIEWED_CURSORBENCH_VERSION} release`,
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
    'GPT-5.6 Terra': 'openai-gpt-5-6-terra',
    'GPT-5.6 Luna': 'openai-gpt-5-6-luna',
    'Sonnet 5': 'anthropic-claude-sonnet-5',
    'Sonnet 5.5': 'anthropic-claude-sonnet-5-5',
    'Grok 4.7': 'xai-grok-4-7',
    'Gemini 3.8 Flash': 'google-gemini-3-8-flash',
    'Muse Spark 1.3': 'meta-muse-spark-1-3',
  };
  for (const match of cursorBody.matchAll(
    /<[a-z][^<>]*\saria-label="([^"<>]+?) (Extra High|Medium|High|Low|Max): ([\d.]+)%,/gu,
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
      if (
        row.benchmarkVersion !== REVIEWED_CURSORBENCH_VERSION ||
        row.metric.id !== 'accuracy'
      )
        throw new Error(
          `CursorBench row ${row.id} is ${row.benchmarkVersion}/${row.metric.id}, not the reviewed ${REVIEWED_CURSORBENCH_VERSION}/accuracy chart`,
        );
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
    const baseTolerance =
      row.benchmarkId === 'automationbench'
        ? 0.05
        : row.benchmarkId === 'frontier-code-1-1' &&
            row.sourceUrl === 'https://www.anthropic.com/claude-sonnet-5-5'
          ? 0.05
          : row.benchmarkId === 'deepswe-1-1'
            ? 0.005
            : 0.000001;
    const precision =
      row.sourceId === 'openai-releases'
        ? Number(
            /captured=([\d.]+)/u.exec(
              row.provenance.scorePrecisionPercent?.locator ?? '',
            )?.[1],
          )
        : NaN;
    const tolerance =
      Number.isFinite(precision) && precision > 0 && precision <= 0.1
        ? Math.max(baseTolerance, precision / 2)
        : baseTolerance;
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
