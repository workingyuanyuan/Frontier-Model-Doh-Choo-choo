import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { loadWorkspaceCoverageData } from './coverage-matrix.js';
import {
  FrontierIdentitiesSchema,
  resolveFrontierIdentities,
} from './frontier-identities.js';

import {
  AA_FRONTIER_POLICY,
  selectAaFrontier,
  type FrontierSelectionEvidence,
} from './frontier-selection.js';
import type { CandidateResult, ProductEvidence } from './index.js';
import { applyProductProfilePolicy } from './index.js';

const evidenceId = `sha256:${'1'.repeat(64)}`;
const row = (score: number, index: number): ProductEvidence => ({
  id: `aa-${index}`,
  sourceId: 'artificial-analysis',
  sourceRole: 'ORGANIZER',
  benchmarkId: AA_FRONTIER_POLICY.benchmarkId,
  benchmarkVersion: 'v4.3.2',
  model: {
    canonicalModelId: `model-${index}`,
    profileId: `model-${index}-max`,
    rawName: `Model ${index}`,
  },
  profile: {
    effort: 'max',
    thinking: null,
    tools: null,
    harness: null,
    contextWindowTokens: null,
    quantization: null,
    attempts: null,
  },
  metric: {
    id: 'intelligence-index',
    name: 'Intelligence Index',
    unit: 'index points',
    higherIsBetter: true,
  },
  rawScore: score,
  normalizedScore: null,
  acquisitionStatus: 'PARTIAL_SOURCE',
  inclusion: 'EXCLUDED',
  exclusionReason: 'Composite used for frontier selection and comparison.',
  provenance: {
    evidenceId,
    sourceUrl: 'https://artificialanalysis.ai/models',
    locator: `model-${index}.intelligenceIndex`,
    method: 'NEXT_RSC',
    retrievedAt: '2026-10-03T00:00:00Z',
  },
});
const rows = (scores: number[]): ProductEvidence[] => scores.map(row);
const separated = (): ProductEvidence[] =>
  rows([100, 99, 98, 97, 90, 89, 88, 87, 86, 85]);

const candidate = (value: ProductEvidence): CandidateResult => {
  const { provenance, ...score } = value;
  return {
    ...score,
    schemaVersion: 'candidate-result-v1',
    sourceUrl: provenance.sourceUrl,
    observedAt: provenance.retrievedAt,
    sourcePublishedAt: null,
    evidenceIds: [provenance.evidenceId],
    provenance: {
      rawScore: {
        evidenceId: provenance.evidenceId,
        method: provenance.method,
        locator: provenance.locator,
      },
    },
  };
};

describe('AA frontier selection', () => {
  it('selects the expected six from the complete saved source population after identity and effort mapping', async () => {
    const root = fileURLToPath(new URL('../../../', import.meta.url));
    const input = await loadWorkspaceCoverageData(root);
    const unresolvedResult = selectAaFrontier(
      applyProductProfilePolicy(
        input.sourceCandidates,
        input.catalog,
        input.profilePolicy,
        new Set([AA_FRONTIER_POLICY.benchmarkId]),
      ),
    );
    expect(unresolvedResult.status).toBe('needs-review');
    expect(unresolvedResult.issues[0]).toMatchObject({
      code: 'unresolved-leaders',
    });
    expect(unresolvedResult.issues[0]?.resultIds).toHaveLength(3);
    const identities = FrontierIdentitiesSchema.parse(
      JSON.parse(
        await readFile(
          new URL(
            '../../../data/mappings/frontier-identities.json',
            import.meta.url,
          ),
          'utf8',
        ),
      ),
    );
    const mapped = applyProductProfilePolicy(
      resolveFrontierIdentities(input.sourceCandidates, identities),
      input.catalog,
      input.profilePolicy,
      new Set([AA_FRONTIER_POLICY.benchmarkId]),
    );
    const aaPopulation = mapped.filter(
      ({ sourceId, benchmarkId }) =>
        sourceId === AA_FRONTIER_POLICY.sourceId &&
        benchmarkId === AA_FRONTIER_POLICY.benchmarkId,
    );
    expect(
      aaPopulation.some(({ model }) => model.canonicalModelId === null),
    ).toBe(true);
    const result = selectAaFrontier(mapped);
    expect(result.status).toBe('selected');
    expect(result.issues).toEqual([]);
    expect(result.selectedModelIds).toEqual([
      'anthropic-claude-opus-5-5',
      'anthropic-claude-sonnet-5-5',
      'anthropic-claude-fable-5-1',
      'openai-gpt-6-astra',
      'google-gemini-4-argon',
      'openai-gpt-6-1-sol',
    ]);
    expect(result.selectedProfileIds).toEqual([
      'anthropic-claude-opus-5-5-max',
      'anthropic-claude-sonnet-5-5-max',
      'anthropic-claude-fable-5-1-max',
      'openai-gpt-6-astra-max',
      'google-gemini-4-argon-high',
      'openai-gpt-6-1-sol-max',
    ]);
    expect(result.resolvedModelCount).toBe(25);
    expect(result.topTen[8]?.modelId).toBe('xiaomi-mimo-v2-6-pro');
    expect(result.boundary?.gapRatio).toBeCloseTo(4.572437814863763, 12);
  });

  it('selects the models above the gap and preserves version, scores and evidence', () => {
    const result = selectAaFrontier(separated());
    expect(result).toMatchObject({
      status: 'selected',
      benchmarkVersion: 'v4.3.2',
      resolvedModelCount: 10,
      selectedModelIds: ['model-0', 'model-1', 'model-2', 'model-3'],
      selectedProfileIds: [
        'model-0-max',
        'model-1-max',
        'model-2-max',
        'model-3-max',
      ],
      gaps: [1, 1, 1, 7, 1, 1, 1, 1, 1],
      boundary: {
        afterRank: 4,
        largestGap: 7,
        otherGapMedian: 1,
        gapRatio: 7,
        multiplier: 2,
      },
      issues: [],
    });
    expect(result.topTen[0]).toEqual({
      rank: 1,
      modelId: 'model-0',
      profileId: 'model-0-max',
      score: 100,
      resultId: 'aa-0',
      evidenceIds: [evidenceId],
    });
    expect(selectAaFrontier(separated().map(candidate))).toEqual(result);
  });

  it('reproduces the saved top-six boundary using full precision', () => {
    const result = selectAaFrontier(
      rows([
        57.6223698102963, 56.0001286580794, 53.3549259623252, 52.673669395513,
        52.5605655745982, 51.8332597011541, 48.0923107719685, 46.4465506302286,
        45.4152084980521, 43.5938229518782,
      ]),
    );
    expect(result.status).toBe('selected');
    expect(result.selectedModelIds).toHaveLength(6);
    expect(result.boundary?.largestGap).toBeCloseTo(3.7409489291856, 12);
    expect(result.boundary?.gapRatio).toBeCloseTo(2.8195, 4);
  });

  it('deduplicates canonical models across efforts and keeps the highest-score profile', () => {
    const input = separated();
    const stronger = row(105, 20);
    stronger.model.canonicalModelId = 'model-0';
    stronger.model.profileId = 'model-0-xhigh';
    const result = selectAaFrontier([...input, stronger]);
    expect(result.resolvedModelCount).toBe(10);
    expect(result.topTen[0]).toMatchObject({
      modelId: 'model-0',
      score: 105,
      profileId: 'model-0-xhigh',
    });
    expect(result.topTen.map(({ modelId }) => modelId)).toHaveLength(10);
    expect(new Set(result.topTen.map(({ modelId }) => modelId)).size).toBe(10);
  });

  it('uses exactly the top ten and remains deterministic with tied scores or efforts', () => {
    const input = rows([100, 100, 100, 100, 90, 90, 90, 90, 90, 90, 0]);
    const tiedEffort = { ...input[0]!, id: 'aa-0-other' };
    expect(selectAaFrontier([...input, tiedEffort].reverse())).toEqual(
      selectAaFrontier([...input, tiedEffort]),
    );
    const result = selectAaFrontier(input);
    expect(result.status).toBe('selected');
    expect(result.topTen).toHaveLength(10);
    expect(result.selectedModelIds).toHaveLength(4);
    expect(result.boundary).toMatchObject({
      otherGapMedian: 0,
      gapRatio: null,
    });
  });

  it.each([
    {
      scores: [10, 10, 10, 10, 10, 10, 10, 10, 10, 10],
      code: 'no-positive-gap',
    },
    {
      scores: [20, 19, 18, 17, 16, 15, 14, 13, 12, 11],
      code: 'tied-largest-gap',
    },
    {
      scores: [20, 19, 18, 17, 16, 15, 14, 13, 12, 10.5],
      code: 'gap-below-threshold',
    },
  ])(
    'requires review for $code without selecting a fallback',
    ({ scores, code }) => {
      const result = selectAaFrontier(rows(scores));
      expect(result.status).toBe('needs-review');
      expect(result.issues.map(({ code: issueCode }) => issueCode)).toContain(
        code,
      );
      expect(result.selectedModelIds).toEqual([]);
      expect(result.selectedProfileIds).toEqual([]);
    },
  );

  it('accepts a gap exactly twice the median of the other eight gaps', () => {
    const result = selectAaFrontier(
      rows([20, 19, 18, 17, 15, 14, 13, 12, 11, 10]),
    );
    expect(result.status).toBe('selected');
    expect(result.boundary).toMatchObject({ afterRank: 4, gapRatio: 2 });
  });

  it('requires ten distinct mapped models', () => {
    const input = separated().slice(0, 9);
    expect(selectAaFrontier([...input, input[0]!])).toMatchObject({
      status: 'needs-review',
      resolvedModelCount: 9,
      selectedModelIds: [],
      issues: [{ code: 'too-few-models', resultIds: [] }],
    });
  });

  it.each([null, 'v4.2'])(
    'requires review for absent or mixed benchmark version %s',
    (version) => {
      const input = separated();
      input[9]!.benchmarkVersion = version;
      const result = selectAaFrontier(input);
      expect(result.status).toBe('needs-review');
      expect(result.benchmarkVersion).toBeNull();
      expect(result.topTen).toEqual([]);
      expect(result.selectedModelIds).toEqual([]);
      expect(result.issues.map(({ code }) => code)).toContain('mixed-versions');
      if (version === null)
        expect(result.issues.map(({ code }) => code)).toContain(
          'missing-version',
        );
    },
  );

  it.each([NaN, Infinity, -Infinity])(
    'rejects nonfinite scores %s',
    (score) => {
      const input = separated();
      input[9]!.rawScore = score;
      expect(selectAaFrontier(input)).toMatchObject({
        status: 'needs-review',
        selectedModelIds: [],
        issues: [{ code: 'invalid-score', resultIds: ['aa-9'] }],
      });
    },
  );

  it.each([106, 85])(
    'blocks unresolved population rows at or above tenth place (%s)',
    (score) => {
      const unresolved = row(score, 30);
      unresolved.model.canonicalModelId = null;
      unresolved.model.profileId = null;
      expect(selectAaFrontier([...separated(), unresolved])).toMatchObject({
        status: 'needs-review',
        selectedModelIds: [],
        issues: [{ code: 'unresolved-leaders', resultIds: ['aa-30'] }],
      });
    },
  );

  it('allows unresolved rows below tenth place and blocks missing leader profiles', () => {
    const unresolved = row(84, 30);
    unresolved.model.canonicalModelId = null;
    unresolved.model.profileId = null;
    expect(selectAaFrontier([...separated(), unresolved]).status).toBe(
      'selected',
    );
    const input = separated();
    input[0]!.model.profileId = null;
    expect(selectAaFrontier(input).issues[0]?.code).toBe('unresolved-leaders');
  });

  it('uses only the AA Intelligence Index, including composite rows excluded from scoring', () => {
    const unrelated = [row(Infinity, 11), row(999, 12), row(999, 13)];
    unrelated[0]!.benchmarkId = 'gpqa-diamond';
    unrelated[1]!.sourceId = 'other-source';
    unrelated[2]!.benchmarkId = 'artificial-analysis-coding-index';
    unrelated[0]!.benchmarkVersion = 'v9';
    expect(selectAaFrontier([...separated(), ...unrelated])).toEqual(
      selectAaFrontier(separated()),
    );
  });

  it('requires valid score direction and linked raw-score provenance', () => {
    const input = separated().map(candidate);
    input[0]!.metric.higherIsBetter = false;
    input[1]!.evidenceIds = [];
    const result = selectAaFrontier(input as FrontierSelectionEvidence[]);
    expect(result.status).toBe('needs-review');
    expect(result.issues.map(({ code }) => code)).toEqual([
      'invalid-metric',
      'missing-evidence',
    ]);
    expect(result.selectedModelIds).toEqual([]);
  });
});
