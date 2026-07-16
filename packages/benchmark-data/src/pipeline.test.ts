import { describe, expect, it } from 'vitest';

import {
  buildFrontierSet,
  buildDraftProduct,
  buildProductVersion,
  deriveModelProfiles,
  scoreProfiles,
  selectCurrentResults,
  type CandidateResult,
  type ModelProfile,
} from './index.js';

const evidenceId =
  'sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' as const;

const makeCandidate = (
  overrides: Partial<CandidateResult> = {},
): CandidateResult => ({
  schemaVersion: 'candidate-result-v1',
  id: 'result-vendor',
  sourceId: 'openai',
  sourceRole: 'VENDOR',
  benchmarkId: 'terminal-bench-2-1',
  benchmarkVersion: '2.1',
  model: {
    rawName: 'GPT-5.6 Sol (max)',
    canonicalModelId: 'openai-gpt-5-6-sol',
    profileId: 'openai-gpt-5-6-sol-max',
  },
  profile: {
    effort: 'max',
    thinking: null,
    tools: true,
    harness: 'terminus-2',
    contextWindowTokens: null,
    quantization: null,
    attempts: 1,
  },
  metric: {
    id: 'terminal-bench-score',
    name: 'Score',
    unit: 'percent',
    higherIsBetter: true,
  },
  rawScore: 82,
  normalizedScore: 82,
  acquisitionStatus: 'FULL',
  inclusion: 'INCLUDED',
  exclusionReason: null,
  sourceUrl: 'https://openai.com/index/gpt-5-6/',
  observedAt: '2026-07-16T00:00:00.000Z',
  sourcePublishedAt: '2026-07-09T00:00:00.000Z',
  evidenceIds: [evidenceId],
  provenance: {
    rawScore: {
      evidenceId,
      method: 'DOM',
      locator: 'Terminal-Bench 2.1 table',
    },
  },
  ...overrides,
});

describe('selectCurrentResults', () => {
  it('uses organizer evidence over a vendor value for the same profile/config', () => {
    const vendor = makeCandidate();
    const organizer = makeCandidate({
      id: 'result-organizer',
      sourceId: 'terminal-bench',
      sourceRole: 'ORGANIZER',
      sourceUrl: 'https://www.tbench.ai/leaderboard/terminal-bench/2.1',
      rawScore: 85.8,
      normalizedScore: 85.8,
    });

    expect(selectCurrentResults([vendor, organizer])).toEqual([organizer]);
  });

  it('uses a full snapshot over a partial row at the same source tier', () => {
    const partial = makeCandidate({ acquisitionStatus: 'PARTIAL_SOURCE' });
    const full = makeCandidate({
      id: 'full',
      sourceId: 'vals-ai',
      sourceRole: 'INDEPENDENT',
      acquisitionStatus: 'FULL',
      rawScore: 84,
      normalizedScore: 84,
    });

    expect(
      selectCurrentResults([{ ...partial, sourceRole: 'INDEPENDENT' }, full]),
    ).toEqual([full]);
  });

  it('does not score excluded or display-only rows', () => {
    expect(
      selectCurrentResults([
        makeCandidate({
          inclusion: 'EXCLUDED',
          exclusionReason: 'Composite index is selection-only',
        }),
      ]),
    ).toEqual([]);
  });
});

describe('buildFrontierSet', () => {
  it('takes at most twenty base models per source and keeps one profile slot', () => {
    const rows = [
      {
        sourceId: 'aa',
        rank: 1,
        modelId: 'model-a',
        profileId: 'model-a-max',
        score: 60,
      },
      {
        sourceId: 'aa',
        rank: 2,
        modelId: 'model-a',
        profileId: 'model-a-high',
        score: 58,
      },
      ...Array.from({ length: 24 }, (_, index) => ({
        sourceId: 'aa',
        rank: index + 3,
        modelId: `model-${index + 2}`,
        profileId: `model-${index + 2}-default`,
        score: 50 - index,
      })),
    ];

    const frontier = buildFrontierSet(rows, [
      {
        modelId: 'manual-new-model',
        profileId: 'manual-new-model-default',
        reason: 'Manually specified new release',
      },
    ]);

    expect(frontier).toHaveLength(21);
    expect(
      frontier.filter(({ modelId }) => modelId === 'model-a'),
    ).toHaveLength(1);
    expect(frontier.at(-1)?.modelId).toBe('manual-new-model');
  });

  it('does not pad a source that has fewer than twenty models', () => {
    expect(
      buildFrontierSet(
        [
          {
            sourceId: 'short',
            rank: 1,
            modelId: 'only-model',
            profileId: 'only-model-default',
            score: 10,
          },
        ],
        [],
      ),
    ).toHaveLength(1);
  });
});

describe('scoreProfiles', () => {
  it('renormalizes over available dimensions and preserves missing axes', () => {
    const scored = scoreProfiles(
      [
        makeCandidate(),
        makeCandidate({
          id: 'math',
          benchmarkId: 'aime',
          benchmarkVersion: '2026',
          metric: {
            id: 'accuracy',
            name: 'Accuracy',
            unit: 'percent',
            higherIsBetter: true,
          },
          rawScore: 90,
          normalizedScore: 90,
        }),
      ],
      new Map([
        ['terminal-bench-2-1', 'coding'],
        ['aime', 'math'],
      ]),
    );

    expect(scored[0]?.overallScore).toBe(86);
    expect(scored[0]?.dimensions).toEqual(
      expect.arrayContaining([
        { dimension: 'math', score: 90, componentCount: 1 },
        { dimension: 'coding', score: 82, componentCount: 1 },
        { dimension: 'knowledge', score: null, componentCount: 0 },
      ]),
    );
  });

  it('does not produce an overall score without a mapped normalized result', () => {
    const scored = scoreProfiles(
      [makeCandidate({ normalizedScore: null })],
      new Map([['terminal-bench-2-1', 'coding']]),
    );

    expect(scored[0]?.overallScore).toBeNull();
  });
});

describe('buildProductVersion', () => {
  it('produces a byte-stable immutable version identifier', () => {
    const input = {
      generatedAt: '2026-07-16T00:00:00.000Z',
      sourceSnapshotIds: ['terminal-bench:2026-07-16'],
      frontier: [],
      profiles: [],
      leaderboard: scoreProfiles(
        [makeCandidate()],
        new Map([['terminal-bench-2-1', 'coding']]),
      ),
      costs: [],
      evidence: [makeCandidate()],
    };

    const version = buildProductVersion(input);

    expect(version).toEqual(buildProductVersion(input));
    expect(version).not.toHaveProperty('state');
  });
});

describe('buildDraftProduct', () => {
  it('uses composite rankings only for selection and scores the frontier from direct evidence', () => {
    const composite = makeCandidate({
      id: 'composite',
      sourceId: 'artificial-analysis',
      sourceRole: 'INDEPENDENT',
      benchmarkId: 'artificial-analysis-intelligence-index',
      benchmarkVersion: 'v4.1',
      rawScore: 59,
      normalizedScore: null,
      inclusion: 'EXCLUDED',
      exclusionReason: 'Selection only',
    });
    const direct = makeCandidate({
      id: 'direct',
      sourceId: 'livebench',
      sourceRole: 'ORGANIZER',
      benchmarkId: 'livebench-reasoning',
      benchmarkVersion: '2026-06-25',
      rawScore: 91,
      normalizedScore: 91,
    });
    const profile: ModelProfile = {
      id: 'openai-gpt-5-6-sol-max',
      modelId: 'openai-gpt-5-6-sol',
      providerId: 'openai',
      displayName: 'GPT-5.6 Sol (max)',
      baseModelName: 'GPT-5.6 Sol',
      releaseDate: '2026-07-09',
      attributes: direct.profile,
      pricing: [
        {
          type: 'API_STANDARDIZED',
          currency: 'USD',
          inputPerMillionTokens: 5,
          outputPerMillionTokens: 30,
          costPerTask: null,
          assumptionId: 'api-blend-3-to-1',
          sourceUrl: 'https://openai.com/index/gpt-5-6/',
        },
      ],
    };

    const product = buildDraftProduct({
      generatedAt: '2026-07-16T00:00:00.000Z',
      sourceSnapshotIds: ['livebench:2026-06-25'],
      candidates: [
        {
          ...composite,
          model: {
            ...composite.model,
            canonicalModelId: 'openai-gpt-5-6-sol',
            profileId: 'openai-gpt-5-6-sol-max',
          },
        },
        {
          ...direct,
          model: {
            ...direct.model,
            canonicalModelId: 'openai-gpt-5-6-sol',
            profileId: 'openai-gpt-5-6-sol-max',
          },
        },
      ],
      profiles: [profile],
      benchmarkDimensions: new Map([['livebench-reasoning', 'reasoning']]),
      compositeSources: [
        {
          sourceId: 'artificial-analysis',
          benchmarkId: 'artificial-analysis-intelligence-index',
        },
      ],
      manualModels: [],
    });

    expect(product.frontier).toHaveLength(1);
    expect(product.leaderboard[0]?.overallScore).toBe(91);
    expect(product.evidence.map(({ id }) => id)).toEqual([
      'composite',
      'direct',
    ]);
    expect(product.costs[0]).toMatchObject({
      cost: 11.25,
      performance: 91,
      assumptionId: 'api-blend-3-to-1',
    });
  });

  it('rejects a scored profile that is absent from the model catalog', () => {
    expect(() =>
      buildDraftProduct({
        generatedAt: '2026-07-16T00:00:00.000Z',
        sourceSnapshotIds: [],
        candidates: [makeCandidate()],
        profiles: [],
        benchmarkDimensions: new Map([['terminal-bench-2-1', 'coding']]),
        compositeSources: [],
        manualModels: [
          {
            modelId: 'openai-gpt-5-6-sol',
            profileId: 'openai-gpt-5-6-sol-max',
            reason: 'New release',
          },
        ],
      }),
    ).toThrow('model catalog');
  });
});

describe('deriveModelProfiles', () => {
  it('merges shared model facts conservatively while retaining profile identity', () => {
    const first = makeCandidate({
      profile: {
        effort: 'max',
        thinking: 'reasoning',
        tools: null,
        harness: null,
        contextWindowTokens: null,
        quantization: null,
        attempts: null,
      },
    });
    const second = makeCandidate({
      id: 'second',
      sourceId: 'vals-ai',
      sourceRole: 'INDEPENDENT',
      profile: {
        effort: 'max',
        thinking: null,
        tools: true,
        harness: 'benchmark-specific',
        contextWindowTokens: 1_000_000,
        quantization: null,
        attempts: 1,
      },
    });

    expect(
      deriveModelProfiles([first, second], {
        schemaVersion: 'model-catalog-v1',
        models: [
          {
            modelId: 'openai-gpt-5-6-sol',
            providerId: 'openai',
            displayName: 'GPT-5.6 Sol',
            releaseDate: '2026-07-09',
            pricing: [],
            profilePricing: {},
          },
        ],
      }),
    ).toEqual([
      expect.objectContaining({
        id: 'openai-gpt-5-6-sol-max',
        displayName: 'GPT-5.6 Sol · max',
        attributes: {
          effort: 'max',
          thinking: 'reasoning',
          tools: null,
          harness: null,
          contextWindowTokens: 1_000_000,
          quantization: null,
          attempts: null,
        },
      }),
    ]);
  });
});
