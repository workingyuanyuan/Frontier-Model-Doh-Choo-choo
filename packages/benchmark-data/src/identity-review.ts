import * as z from 'zod';

import { AA_FRONTIER_POLICY } from './frontier-selection.js';
import type { CandidateResult } from './index.js';

/**
 * Days an `awaiting-evidence` decision stays valid, counted from `reviewedOn`
 * to the AA row's `observedAt`. Measured against the saved capture, not the
 * clock, so verify-fresh stays reproducible; the next AA refresh after the
 * window fails until the model is registered or excluded.
 */
export const AWAITING_EVIDENCE_MAX_DAYS = 14;

/**
 * Recorded decisions for AA index names that resolve to no catalog model.
 * Without one, a model with scores in many sources can stay off the dashboard
 * because nobody registered it.
 */
export const IdentityReviewSchema = z
  .strictObject({
    schemaVersion: z.literal('identity-review-v1'),
    entries: z.array(
      z.strictObject({
        sourceId: z.literal(AA_FRONTIER_POLICY.sourceId),
        rawName: z.string().min(1),
        decision: z.enum(['awaiting-evidence', 'not-tracked']),
        reason: z.string().min(1),
        reviewedOn: z.iso.date(),
      }),
    ),
  })
  .superRefine(({ entries }, context) => {
    const seen = new Set<string>();
    entries.forEach(({ sourceId, rawName }, index) => {
      const key = JSON.stringify([sourceId, rawName]);
      if (seen.has(key))
        context.addIssue({
          code: 'custom',
          message: 'Each source name needs exactly one review entry.',
          path: ['entries', index, 'rawName'],
        });
      seen.add(key);
    });
  });
export type IdentityReview = z.infer<typeof IdentityReviewSchema>;

export interface IdentityReviewIssue {
  code: 'unreviewed' | 'awaiting-evidence-expired' | 'reviewed-name-resolves';
  rawName: string;
  resultIds: string[];
}

const DAY_MS = 86_400_000;

/**
 * Every unresolved AA index name needs a review entry; an awaiting entry
 * expires; an entry whose name now resolves is stale and must be removed.
 */
export const checkIdentityReview = (
  candidates: readonly CandidateResult[],
  review: IdentityReview,
): IdentityReviewIssue[] => {
  const config = IdentityReviewSchema.parse(review);
  const entries = new Map(
    config.entries.map((entry) => [entry.rawName, entry] as const),
  );
  const unresolved = new Map<string, CandidateResult[]>();
  const resolved = new Map<string, CandidateResult[]>();
  for (const row of candidates) {
    if (
      row.sourceId !== AA_FRONTIER_POLICY.sourceId ||
      row.benchmarkId !== AA_FRONTIER_POLICY.benchmarkId
    )
      continue;
    const target = row.model.canonicalModelId === null ? unresolved : resolved;
    const rows = target.get(row.model.rawName) ?? [];
    rows.push(row);
    target.set(row.model.rawName, rows);
  }
  const issues: IdentityReviewIssue[] = [];
  const add = (
    code: IdentityReviewIssue['code'],
    rawName: string,
    rows: readonly CandidateResult[],
  ) =>
    issues.push({
      code,
      rawName,
      resultIds: rows.map(({ id }) => id).toSorted(),
    });
  for (const [rawName, rows] of unresolved) {
    const entry = entries.get(rawName);
    if (!entry) {
      add('unreviewed', rawName, rows);
      continue;
    }
    if (entry.decision !== 'awaiting-evidence') continue;
    const deadline =
      Date.parse(`${entry.reviewedOn}T00:00:00Z`) +
      (AWAITING_EVIDENCE_MAX_DAYS + 1) * DAY_MS;
    const expired = rows.filter(
      ({ observedAt }) => Date.parse(observedAt) >= deadline,
    );
    if (expired.length) add('awaiting-evidence-expired', rawName, expired);
  }
  for (const [rawName, rows] of resolved) {
    if (entries.has(rawName)) add('reviewed-name-resolves', rawName, rows);
  }
  return issues.toSorted(
    (left, right) =>
      left.code.localeCompare(right.code) ||
      left.rawName.localeCompare(right.rawName),
  );
};

/** One line per issue, for the needs-review audit and the failing command. */
export const describeIdentityReviewIssues = (
  issues: readonly IdentityReviewIssue[],
): string =>
  `AA names need an identity decision in data/mappings/identity-review.json: ${issues
    .map(({ code, rawName }) => `${code}: ${rawName}`)
    .join('; ')}`;
