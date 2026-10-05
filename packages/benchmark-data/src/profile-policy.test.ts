import { describe, expect, it } from 'vitest';

import {
  applyProductProfilePolicy,
  applyProductProfilePolicyToCosts,
  decideProductEffort,
  type CandidateResult,
  type CostRecord,
  type ModelCatalog,
  type ProfilePolicy,
} from './index.js';

const catalog: ModelCatalog = { schemaVersion: 'model-catalog-v1', models: [] };
const policy: ProfilePolicy = {
  schemaVersion: 'profile-policy-v2',
  effortOrder: ['non-reasoning', 'low', 'medium', 'high', 'xhigh', 'max'],
  defaultEffort: 'default',
};
const comparisonOnly = new Set(['comparison']);
const evidenceId = `sha256:${'a'.repeat(64)}`;

const candidate = (
  id: string,
  sourceId: string,
  modelId: string | null,
  effort: string | null = null,
  overrides: Partial<CandidateResult> = {},
): CandidateResult => ({
  schemaVersion: 'candidate-result-v1',
  id,
  sourceId,
  sourceRole: 'INDEPENDENT',
  benchmarkId: 'benchmark',
  benchmarkVersion: null,
  model: { rawName: modelId ?? 'Unknown', canonicalModelId: modelId, profileId: null },
  profile: {
    effort,
    thinking: null,
    tools: null,
    harness: null,
    contextWindowTokens: null,
    quantization: null,
    attempts: null,
  },
  metric: { id: 'score', name: 'Score', unit: 'percent', higherIsBetter: true },
  rawScore: 50,
  normalizedScore: 50,
  acquisitionStatus: 'FULL',
  inclusion: 'INCLUDED',
  exclusionReason: null,
  sourceUrl: 'https://example.test/result',
  observedAt: '2026-07-16T00:00:00.000Z',
  sourcePublishedAt: null,
  evidenceIds: [evidenceId],
  provenance: { rawScore: { evidenceId, method: 'MANUAL', locator: '$.score' } },
  ...overrides,
});

const cost = (row: CandidateResult, id = `cost-${row.id}`): CostRecord => ({
  schemaVersion: 'cost-record-v1',
  id,
  sourceId: row.sourceId,
  model: { ...row.model },
  profile: { ...row.profile },
  costType: 'AGENT_TASK',
  metricId: 'mean-cost',
  metricName: 'Mean cost',
  unit: 'USD_PER_TASK',
  inputPerMillionTokens: null,
  outputPerMillionTokens: null,
  cost: 1,
  assumptionId: null,
  benchmarkId: row.benchmarkId,
  benchmarkVersion: null,
  inclusion: 'INCLUDED',
  exclusionReason: null,
  sourceUrl: 'https://example.test/cost',
  observedAt: row.observedAt,
  sourcePublishedAt: null,
  evidenceIds: [evidenceId],
  provenance: { cost: { evidenceId, method: 'MANUAL', locator: '$.cost' } },
});

describe('product profile evidence indexing', () => {
  it('matches full-list effort decisions across models and evidence exclusions', () => {
    const rows = [
      candidate('shared', 'target', 'alpha'),
      candidate('shared', 'foreign', 'alpha', 'max'),
      candidate('same-source', 'target', 'alpha', 'max'),
      candidate('excluded', 'excluded-source', 'alpha', 'max', {
        inclusion: 'EXCLUDED', exclusionReason: 'Excluded fixture',
      }),
      candidate('comparison', 'comparison-source', 'alpha', 'max', {
        benchmarkId: 'comparison',
      }),
      candidate('alpha-high-a', 'source-a', 'alpha', 'high'),
      candidate('alpha-low', 'source-a', 'alpha', 'low'),
      candidate('shared', 'foreign', 'beta', 'low'),
      candidate('beta-target', 'target', 'beta'),
      candidate('gamma-target', 'target', 'gamma'),
      candidate('gamma-name', 'source-a', 'gamma', null, {
        model: { rawName: 'Gamma (xhigh)', canonicalModelId: 'gamma', profileId: null },
      }),
      candidate('delta-target', 'target', 'delta'),
      candidate('delta-mode', 'source-a', 'delta', 'non-reasoning'),
      candidate('null-target', 'target', null),
      candidate('null-evidence', 'source-a', null, 'max'),
    ];
    const evidence = rows.filter((row) => !comparisonOnly.has(row.benchmarkId));
    const expected = rows.map((row) => {
      if (row.model.canonicalModelId === null) return row;
      const decision = decideProductEffort(row, evidence);
      return {
        ...row,
        model: { ...row.model, profileId: `${row.model.canonicalModelId}-${decision.effort}` },
        productProfile: { effort: decision.effort, harness: null },
      };
    });

    const actual = applyProductProfilePolicy(rows, catalog, policy, comparisonOnly);
    expect(actual).toEqual(expected);
    expect([actual[0], actual[8], actual[9], actual[11]].map((row) => row?.productProfile?.effort))
      .toEqual(['high', 'low', 'xhigh', 'default']);
    expect(actual[13]).toBe(rows[13]);
  });

  it('resolves each invocation from its current candidates and comparison filter', () => {
    const target = candidate('target', 'target-source', 'alpha');
    const evidence = candidate('evidence', 'other-source', 'alpha', 'low');
    const rows = [target, evidence];
    const projectedEffort = () => applyProductProfilePolicy(rows, catalog, policy)[0]?.productProfile?.effort;

    expect(projectedEffort()).toBe('low');
    evidence.profile.effort = 'max';
    expect(projectedEffort()).toBe('max');
    expect(applyProductProfilePolicy(rows, catalog, policy, new Set(['benchmark']))[0]?.productProfile?.effort)
      .toBe('default');
    rows.pop();
    expect(projectedEffort()).toBe('default');

    const unmatched = cost(candidate('unmatched', 'cost-source', 'alpha'));
    expect(applyProductProfilePolicyToCosts([unmatched], [target, evidence], catalog, policy)[0]?.model.profileId)
      .toBe('alpha-max');
    evidence.profile.effort = 'medium';
    expect(applyProductProfilePolicyToCosts([unmatched], [target, evidence], catalog, policy)[0]?.model.profileId)
      .toBe('alpha-medium');
  });

  it('keeps matched and unmatched cost profile selection equivalent to full-list decisions', () => {
    const plain = candidate('plain', 'target', 'alpha');
    const direct = candidate('direct', 'target', 'alpha', 'low');
    const duplicate = candidate('shared', 'duplicate-source', 'alpha');
    const foreignDuplicate = candidate('shared', 'other-source', 'beta', 'max');
    const comparison = candidate('comparison', 'comparison-source', 'alpha', 'max', {
      benchmarkId: 'comparison',
    });
    const rows = [plain, direct, candidate('high', 'evidence', 'alpha', 'high'), duplicate, foreignDuplicate, comparison];
    const evidence = rows.filter((row) => !comparisonOnly.has(row.benchmarkId));
    const unmatched = cost(candidate('unmatched', 'cost-source', 'alpha'));
    const nullCost = cost(candidate('unknown', 'cost-source', null));
    const costs = [cost(plain), cost(direct), cost(duplicate), cost(comparison), unmatched, nullCost];
    // Compare with the existing full-list decision lookup for matched costs.
    const decisions = new Map(rows.map((row) => [row.id, decideProductEffort(row, evidence)]));
    const expectedEfforts = [
      decisions.get(plain.id)!.effort,
      decisions.get(direct.id)!.effort,
      decisions.get(duplicate.id)!.effort,
      decisions.get(comparison.id)!.effort,
      decideProductEffort(unmatched, evidence).effort,
    ];
    const actual = applyProductProfilePolicyToCosts(costs, rows, catalog, policy, comparisonOnly);

    expect(actual.slice(0, 5).map((row) => row.model.profileId))
      .toEqual(expectedEfforts.map((effort) => `alpha-${effort}`));
    expect(actual.map((row) => row.profile)).toEqual(costs.map((row) => row.profile));
    expect(actual[5]).toBe(nullCost);
  });
});
