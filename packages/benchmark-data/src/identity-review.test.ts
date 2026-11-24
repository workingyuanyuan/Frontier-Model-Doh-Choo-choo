import { describe, expect, it } from 'vitest';

import {
  IdentityReviewSchema,
  checkIdentityReview,
  type IdentityReview,
} from './identity-review.js';
import type { CandidateResult } from './index.js';

const evidenceId = `sha256:${'b'.repeat(64)}`;
const aaRow = (
  rawName: string,
  options: {
    canonicalModelId?: string | null;
    observedAt?: string;
    benchmarkId?: string;
  } = {},
): CandidateResult => ({
  schemaVersion: 'candidate-result-v1',
  id: `aa:${rawName}:${options.benchmarkId ?? 'index'}`,
  sourceId: 'artificial-analysis',
  sourceRole: 'ORGANIZER',
  benchmarkId: options.benchmarkId ?? 'artificial-analysis-intelligence-index',
  benchmarkVersion: 'v1',
  model: {
    rawName,
    canonicalModelId: options.canonicalModelId ?? null,
    profileId: null,
  },
  profile: {
    effort: null,
    thinking: null,
    tools: null,
    harness: null,
    contextWindowTokens: null,
    quantization: null,
    attempts: null,
  },
  metric: {
    id: 'index-score',
    name: 'Index',
    unit: 'index points',
    higherIsBetter: true,
  },
  rawScore: 30,
  normalizedScore: null,
  acquisitionStatus: 'PARTIAL_SOURCE',
  inclusion: 'EXCLUDED',
  exclusionReason: 'Composite.',
  sourceUrl: 'https://example.com/model',
  observedAt: options.observedAt ?? '2026-01-10T12:00:00Z',
  sourcePublishedAt: null,
  evidenceIds: [evidenceId],
  provenance: {
    rawScore: { evidenceId, method: 'NEXT_RSC', locator: 'model.index' },
  },
});
const review = (
  entries: Partial<IdentityReview['entries'][number]>[],
): IdentityReview => ({
  schemaVersion: 'identity-review-v1',
  entries: entries.map((entry) => ({
    sourceId: 'artificial-analysis',
    rawName: 'Model A',
    decision: 'awaiting-evidence',
    reason: 'Not checked yet.',
    reviewedOn: '2026-01-01',
    ...entry,
  })),
});
const codes = (
  candidates: CandidateResult[],
  config: IdentityReview,
): string[] =>
  checkIdentityReview(candidates, config).map(
    ({ code, rawName }) => `${code}:${rawName}`,
  );

describe('identity review ledger', () => {
  it('requires a decision for every unresolved AA index name', () => {
    expect(codes([aaRow('Model A')], review([]))).toEqual([
      'unreviewed:Model A',
    ]);
  });

  it('ignores resolved rows and other AA benchmarks', () => {
    const rows = [
      aaRow('Model B', { canonicalModelId: 'vendor-model-b' }),
      aaRow('Model C', { benchmarkId: 'aa-briefcase' }),
    ];
    expect(codes(rows, review([]))).toEqual([]);
  });

  it('accepts an awaiting decision up to the day limit and fails after it', () => {
    const config = review([{ reviewedOn: '2026-01-01' }]);
    expect(
      codes([aaRow('Model A', { observedAt: '2026-01-15T23:59:59Z' })], config),
    ).toEqual([]);
    expect(
      codes([aaRow('Model A', { observedAt: '2026-01-16T00:00:00Z' })], config),
    ).toEqual(['awaiting-evidence-expired:Model A']);
  });

  it('keeps a not-tracked decision without expiry', () => {
    const config = review([
      { decision: 'not-tracked', reason: 'Vendor configuration.' },
    ]);
    expect(
      codes([aaRow('Model A', { observedAt: '2027-01-01T00:00:00Z' })], config),
    ).toEqual([]);
  });

  it('fails when a reviewed name now resolves to a catalog model', () => {
    const rows = [aaRow('Model A', { canonicalModelId: 'vendor-model-a' })];
    expect(codes(rows, review([{}]))).toEqual([
      'reviewed-name-resolves:Model A',
    ]);
  });

  it('rejects duplicate entries for one name', () => {
    expect(IdentityReviewSchema.safeParse(review([{}, {}])).success).toBe(
      false,
    );
  });
});
