import { describe, expect, it } from 'vitest';

import {
  applyProductProfilePolicy,
  applyProductProfilePolicyToCosts,
  buildFrontierSet,
  buildProduct,
  buildProductVersion,
  deriveModelProfiles,
  decideProductEffort,
  scoreProfiles,
  selectCurrentResults,
  toProductEvidence,
  type CandidateResult,
  type CostRecord,
  type ModelCatalog,
  type ModelProfile,
  type ProfilePolicy,
} from './index.js';

const evidenceId =
  'sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' as const;

const profilePolicy: ProfilePolicy = {
  schemaVersion: 'profile-policy-v2',
  effortOrder: ['non-reasoning', 'low', 'medium', 'high', 'xhigh', 'max'],
  defaultEffort: 'default',
};

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

const makeCost = (overrides: Partial<CostRecord> = {}): CostRecord => ({
  schemaVersion: 'cost-record-v1',
  id: 'cost-vendor',
  sourceId: 'openai',
  model: {
    rawName: 'GPT-5.6 Sol',
    canonicalModelId: 'openai-gpt-5-6-sol',
    profileId: 'openai-gpt-5-6-sol-max',
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
  costType: 'AGENT_TASK',
  metricId: 'mean-cost',
  metricName: 'Mean cost',
  unit: 'USD_PER_TASK',
  inputPerMillionTokens: null,
  outputPerMillionTokens: null,
  cost: 1,
  assumptionId: null,
  benchmarkId: 'terminal-bench-2-1',
  benchmarkVersion: '2.1',
  inclusion: 'INCLUDED',
  exclusionReason: null,
  sourceUrl: 'https://example.test/cost',
  observedAt: '2026-07-16T00:00:00.000Z',
  sourcePublishedAt: null,
  evidenceIds: [evidenceId],
  provenance: {
    cost: {
      evidenceId,
      method: 'MANUAL',
      locator: '$.cost',
    },
  },
  ...overrides,
});

describe('selectCurrentResults', () => {
  it('uses organizer evidence over a vendor value for the same profile/config', () => {
    const vendor = makeCandidate({
      profile: {
        effort: 'max',
        thinking: 'reasoning',
        tools: true,
        harness: null,
        contextWindowTokens: 1_000_000,
        quantization: null,
        attempts: 5,
      },
    });
    const organizer = makeCandidate({
      id: 'result-organizer',
      sourceId: 'terminal-bench',
      sourceRole: 'ORGANIZER',
      sourceUrl: 'https://www.tbench.ai/leaderboard/terminal-bench/2.1',
      rawScore: 85.8,
      normalizedScore: 85.8,
      profile: {
        effort: 'max',
        thinking: null,
        tools: false,
        harness: null,
        contextWindowTokens: null,
        quantization: null,
        attempts: 1,
      },
    });

    expect(selectCurrentResults([vendor, organizer])).toEqual([organizer]);
  });

  it('uses a full snapshot over a partial row at the same source tier', () => {
    const partial = makeCandidate({ acquisitionStatus: 'PARTIAL_SOURCE' });
    const full = makeCandidate({
      id: 'full',
      sourceId: 'artificial-analysis',
      sourceRole: 'INDEPENDENT',
      acquisitionStatus: 'FULL',
      rawScore: 84,
      normalizedScore: 84,
    });

    expect(
      selectCurrentResults([{ ...partial, sourceRole: 'INDEPENDENT' }, full]),
    ).toEqual([full]);
  });

  it('takes the higher score between equal-standing sources but never lets a partial snapshot win', () => {
    // AA, Epoch, and Vals all rerun GPQA Diamond as INDEPENDENT. The user's
    // rule (2026-08-21) is cross-source max, and it is limited to sources of
    // equal standing (§4.3.1, restored 2026-08-22): Epoch and Vals are both
    // FULL, so the higher of the two wins even though Vals labels its
    // benchmarkVersion "1" and Epoch leaves it null. AA scores highest of all
    // three but is PARTIAL_SOURCE at the site level, so it cannot take the row.
    const shared = {
      benchmarkId: 'gpqa-diamond',
      sourceRole: 'INDEPENDENT',
      profile: { ...makeCandidate().profile, harness: null },
    } as const;
    const artificialAnalysis = makeCandidate({
      ...shared,
      id: 'aa-gpqa',
      sourceId: 'artificial-analysis',
      benchmarkVersion: null,
      acquisitionStatus: 'PARTIAL_SOURCE',
      rawScore: 95.11,
      normalizedScore: 95.11,
    });
    const epoch = makeCandidate({
      ...shared,
      id: 'epoch-gpqa',
      sourceId: 'epoch-ai',
      benchmarkVersion: null,
      acquisitionStatus: 'FULL',
      rawScore: 93.88,
      normalizedScore: 93.88,
    });
    const vals = makeCandidate({
      ...shared,
      id: 'vals-gpqa',
      sourceId: 'vals-ai',
      benchmarkVersion: '1',
      acquisitionStatus: 'FULL',
      rawScore: 94.55,
      normalizedScore: 94.55,
    });

    expect(selectCurrentResults([artificialAnalysis, epoch, vals])).toEqual([
      vals,
    ]);
    expect(selectCurrentResults([vals, epoch, artificialAnalysis])).toEqual([
      vals,
    ]);
  });

  it('keeps organizer precedence over a vendor claim that scores higher', () => {
    const organizer = makeCandidate({
      id: 'organizer-lower',
      sourceId: 'terminal-bench',
      sourceRole: 'ORGANIZER',
      rawScore: 70,
      normalizedScore: 70,
    });
    const vendor = makeCandidate({
      id: 'vendor-higher',
      sourceId: 'openai',
      sourceRole: 'VENDOR',
      rawScore: 99,
      normalizedScore: 99,
    });

    expect(selectCurrentResults([organizer, vendor])).toEqual([organizer]);
    expect(selectCurrentResults([vendor, organizer])).toEqual([organizer]);
  });

  it('does not put the excluded Artificial Analysis Intelligence Index into any dimension', () => {
    const intelligenceIndex = makeCandidate({
      benchmarkId: 'artificial-analysis-intelligence-index',
      inclusion: 'EXCLUDED',
      exclusionReason:
        'External composite is used for frontier selection and display only; including it would double-count constituent benchmarks.',
    });

    expect(selectCurrentResults([intelligenceIndex])).toEqual([]);
    expect(
      scoreProfiles(
        [intelligenceIndex],
        new Map([['artificial-analysis-intelligence-index', 'reasoning']]),
      ),
    ).toEqual([]);
  });
});

describe('buildFrontierSet', () => {
  it('selects active models within qualification window and manual models', () => {
    const catalog: ModelCatalog = {
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
        {
          modelId: 'legacy-model',
          providerId: 'openai',
          displayName: 'Legacy Model',
          releaseDate: '2023-01-01',
          pricing: [],
          profilePricing: {},
        },
      ],
    };

    const frontier = buildFrontierSet({
      catalog,
      manualModels: [
        {
          modelId: 'manual-new-model',
          reason: 'Manually specified new release',
        },
      ],
      referenceDate: '2026-07-16T00:00:00.000Z',
      qualificationWindowMonths: 12,
    });

    expect(frontier).toHaveLength(2);
    expect(frontier.map(({ modelId }) => modelId)).toEqual([
      'manual-new-model',
      'openai-gpt-5-6-sol',
    ]);
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

    expect(scored[0]?.overallScore).toBeNull();
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
      defaultPresetId: 'test-preset',
      presets: [
        {
          id: 'test-preset',
          targetModelCount: 1,
          requireAllSources: false,
          benchmarkIds: ['terminal-bench-2-1'],
          leaderboard: scoreProfiles(
            [makeCandidate()],
            new Map([['terminal-bench-2-1', 'coding']]),
          ),
        },
      ],
      costs: [],
      evidence: [toProductEvidence(makeCandidate())],
    };

    const version = buildProductVersion(input);

    expect(version).toEqual(buildProductVersion(input));
    expect(version).not.toHaveProperty('state');
  });
});

/**
 * A one-preset display set covering the benchmarks a test actually uses.
 * Ruling R1 makes the preset the scoring basis, so `buildProduct` needs one;
 * these fixtures only care that their own benchmark is inside it.
 */
const displaySetFor = (
  benchmarkIds: string[],
): Parameters<typeof buildProduct>[0]['displaySet'] => ({
  schemaVersion: 'display-set-v2',
  defaultPresetId: 'test-preset',
  presets: [
    {
      id: 'test-preset',
      targetModelCount: 1,
      requireAllSources: false,
      benchmarkIds,
    },
  ],
});

describe('buildProduct', () => {
  it('selects the frontier from qualified models in catalog and scores from direct evidence', () => {
    const catalog: ModelCatalog = {
      schemaVersion: 'model-catalog-v1',
      models: [
        {
          modelId: 'openai-gpt-5-6-sol',
          providerId: 'openai',
          displayName: 'GPT-5.6 Sol',
          releaseDate: '2026-07-09',
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
          profilePricing: {},
        },
      ],
    };
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

    const product = buildProduct({
      generatedAt: '2026-07-16T00:00:00.000Z',
      sourceSnapshotIds: ['livebench:2026-06-25'],
      candidates: [
        {
          ...direct,
          model: {
            ...direct.model,
            canonicalModelId: 'openai-gpt-5-6-sol',
            profileId: 'openai-gpt-5-6-sol-max',
          },
        },
      ],
      costRecords: [
        makeCost({
          sourceId: 'artificial-analysis',
          costType: 'MEASURED_TASK',
          cost: 0.42,
        }),
      ],
      profiles: [profile],
      benchmarkDimensions: new Map([['livebench-reasoning', 'reasoning']]),
      displaySet: displaySetFor(['livebench-reasoning']),
      catalog,
      manualModels: [],
    });

    expect(product.frontier).toHaveLength(1);
    // Frontier is a model-level set derived from the catalog. It must not
    // invent a profile id: those placeholders resolved to nothing and broke
    // the spec's own ban on an `unspecified` effort. See SPEC 5.4.
    product.frontier.forEach((entry) => {
      expect(entry).not.toHaveProperty('profileId');
    });
    expect(product.presets[0]!.leaderboard[0]?.overallScore).toBeNull();
    expect(product.evidence.map(({ id }) => id)).toEqual(['direct']);
    expect(product.costs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          sourceId: 'artificial-analysis',
          cost: 0.42,
          performance: null,
        }),
      ]),
    );

    // Manual catalog pricing carries no evidence, so it cannot be audited back
    // to a source and must not reach the product. See SPEC 6.3.
    expect(
      product.costs.filter(({ sourceId }) => sourceId === 'model-catalog'),
    ).toEqual([]);
    product.costs.forEach((cost) => {
      expect(cost.evidenceIds.length).toBeGreaterThan(0);
    });
  });

  it('rejects a scored profile that is absent from the model catalog', () => {
    expect(() =>
      buildProduct({
        generatedAt: '2026-07-16T00:00:00.000Z',
        sourceSnapshotIds: [],
        candidates: [makeCandidate()],
        profiles: [],
        benchmarkDimensions: new Map([['terminal-bench-2-1', 'coding']]),
        displaySet: displaySetFor(['terminal-bench-2-1']),
        manualModels: [
          {
            modelId: 'openai-gpt-5-6-sol',
            reason: 'New release',
          },
        ],
      }),
    ).toThrow('model catalog is missing profiles');
  });
});

describe('deriveModelProfiles', () => {
  it('uses only effort in the user-facing identity', () => {
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
      sourceId: 'artificial-analysis',
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
      deriveModelProfiles(
        applyProductProfilePolicy(
          [first, second],
          {
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
          },
          profilePolicy,
        ),
        {
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
        },
      ),
    ).toEqual([
      expect.objectContaining({
        id: 'openai-gpt-5-6-sol-max',
        displayName: 'GPT-5.6 Sol · max',
        attributes: expect.objectContaining({
          effort: 'max',
          harness: null,
        }),
      }),
    ]);
  });

  it('merges tools and attempt differences into one Profile', () => {
    const toolsEnabled = makeCandidate({
      profile: {
        effort: 'max',
        thinking: 'reasoning',
        tools: true,
        harness: null,
        contextWindowTokens: null,
        quantization: null,
        attempts: 1,
      },
    });
    const toolsDisabled = makeCandidate({
      id: 'tools-disabled',
      sourceId: 'livebench',
      sourceRole: 'ORGANIZER',
      profile: {
        effort: 'max',
        thinking: 'reasoning',
        tools: false,
        harness: null,
        contextWindowTokens: null,
        quantization: null,
        attempts: 1,
      },
    });

    const candidates = applyProductProfilePolicy(
      [toolsEnabled, toolsDisabled],
      {
        schemaVersion: 'model-catalog-v1',
        models: [],
      },
      profilePolicy,
    );
    const profiles = deriveModelProfiles(candidates, {
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
    });

    expect(new Set(candidates.map(({ model }) => model.profileId))).toEqual(
      new Set(['openai-gpt-5-6-sol-max']),
    );
    expect(profiles).toHaveLength(1);
    expect(profiles[0]).toMatchObject({
      id: 'openai-gpt-5-6-sol-max',
      displayName: 'GPT-5.6 Sol · max',
      attributes: { effort: 'max', harness: null },
    });
  });

  it('merges every Harness into the effort-only Product Profile', () => {
    const bare = makeCandidate({
      id: 'bare',
      profile: {
        effort: 'max',
        thinking: null,
        tools: false,
        harness: null,
        contextWindowTokens: null,
        quantization: null,
        attempts: 1,
      },
    });
    const official = makeCandidate({
      id: 'official',
      benchmarkId: 'swe-bench',
      profile: {
        effort: 'max',
        thinking: null,
        tools: true,
        harness: 'Codex',
        contextWindowTokens: null,
        quantization: null,
        attempts: 5,
      },
    });
    const thirdParty = makeCandidate({
      id: 'third-party',
      benchmarkId: 'deepswe-1-1',
      profile: {
        effort: 'max',
        thinking: null,
        tools: true,
        harness: 'mini-SWE-agent',
        contextWindowTokens: null,
        quantization: null,
        attempts: 4,
      },
    });

    const resolved = applyProductProfilePolicy(
      [bare, official, thirdParty],
      {
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
      },
      profilePolicy,
    );

    expect(resolved.find(({ id }) => id === 'bare')?.model.profileId).toBe(
      'openai-gpt-5-6-sol-max',
    );
    expect(resolved.find(({ id }) => id === 'official')).toMatchObject({
      inclusion: 'INCLUDED',
      model: { profileId: 'openai-gpt-5-6-sol-max' },
      productProfile: { effort: 'max', harness: null },
      profile: { harness: 'Codex', attempts: 5 },
    });
    expect(resolved.find(({ id }) => id === 'third-party')).toMatchObject({
      inclusion: 'INCLUDED',
      model: { profileId: 'openai-gpt-5-6-sol-max' },
      productProfile: { effort: 'max', harness: null },
      profile: { harness: 'mini-SWE-agent', attempts: 4 },
    });
  });

  it('deduplicates merged Harness results without deleting source evidence', () => {
    const organizer = makeCandidate({
      id: 'organizer-bare',
      sourceId: 'livebench',
      sourceRole: 'ORGANIZER',
      rawScore: 91,
      normalizedScore: 91,
      profile: {
        effort: 'max',
        thinking: null,
        tools: false,
        harness: null,
        contextWindowTokens: null,
        quantization: null,
        attempts: 1,
      },
    });
    const independentHarness = makeCandidate({
      id: 'independent-epoch',
      sourceId: 'epoch-ai',
      sourceRole: 'INDEPENDENT',
      rawScore: 95,
      normalizedScore: 95,
      profile: {
        effort: 'max',
        thinking: null,
        tools: true,
        harness: 'Epoch AI Inspect',
        contextWindowTokens: null,
        quantization: null,
        attempts: 3,
      },
    });
    const catalog = {
      schemaVersion: 'model-catalog-v1' as const,
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
    };
    const candidates = applyProductProfilePolicy(
      [independentHarness, organizer],
      catalog,
      profilePolicy,
    );
    const product = buildProduct({
      generatedAt: '2026-07-16T00:00:00.000Z',
      sourceSnapshotIds: ['epoch-ai:test', 'livebench:test'],
      candidates,
      profiles: deriveModelProfiles(candidates, catalog),
      benchmarkDimensions: new Map([['terminal-bench-2-1', 'coding']]),
      displaySet: displaySetFor(['terminal-bench-2-1']),
      catalog,
      manualModels: [
        {
          modelId: 'openai-gpt-5-6-sol',
          reason: 'test frontier',
        },
      ],
    });

    expect(product.evidence.map(({ id }) => id)).toEqual([
      'independent-epoch',
      'organizer-bare',
    ]);
    expect(product.presets[0]!.leaderboard).toHaveLength(1);
    expect(product.presets[0]!.leaderboard[0]).toMatchObject({
      overallScore: null,
      dimensions: expect.arrayContaining([
        expect.objectContaining({
          dimension: 'coding',
          componentCount: 1,
          score: 95,
        }),
      ]),
    });
  });

  it('keeps an explicit non-reasoning name out of cross-source inference', () => {
    const nonReasoning = makeCandidate({
      id: 'non-reasoning',
      sourceId: 'frontier-code',
      model: {
        ...makeCandidate().model,
        rawName: 'GPT-5.6 Sol (Non-reasoning)',
      },
      profile: { ...makeCandidate().profile, effort: null },
    });
    const otherSourceMax = makeCandidate({
      id: 'other-max',
      sourceId: 'artificial-analysis',
      profile: { ...makeCandidate().profile, effort: 'max' },
    });

    const decision = decideProductEffort(nonReasoning, [
      nonReasoning,
      otherSourceMax,
    ]);
    expect(decision).toEqual({
      effort: 'non-reasoning',
      basis: 'NAME_DERIVED',
      basisSourceId: 'frontier-code',
      basisCandidateId: 'non-reasoning',
    });

    const [resolved] = applyProductProfilePolicy(
      [nonReasoning, otherSourceMax],
      { schemaVersion: 'model-catalog-v1', models: [] },
      profilePolicy,
    );
    expect(resolved).toMatchObject({
      model: { profileId: 'openai-gpt-5-6-sol-non-reasoning' },
      productProfile: { effort: 'non-reasoning' },
      profile: { effort: null },
    });
  });

  it('maps minimal to low while retaining the raw source value', () => {
    const minimal = makeCandidate({
      id: 'minimal',
      profile: { ...makeCandidate().profile, effort: 'minimal' },
    });
    const [resolved] = applyProductProfilePolicy(
      [minimal],
      { schemaVersion: 'model-catalog-v1', models: [] },
      profilePolicy,
    );

    expect(resolved).toMatchObject({
      model: { profileId: 'openai-gpt-5-6-sol-low' },
      productProfile: { effort: 'low' },
      profile: { effort: 'minimal' },
    });
  });

  it('infers only from other sources and returns the highest direct tier with basis IDs', () => {
    const missing = makeCandidate({
      id: 'frontier-missing',
      sourceId: 'frontier-code',
      model: { ...makeCandidate().model, rawName: 'GPT-5.6 Sol' },
      profile: { ...makeCandidate().profile, effort: null },
    });
    const sameSourceMax = makeCandidate({
      id: 'frontier-max',
      sourceId: 'frontier-code',
      profile: { ...makeCandidate().profile, effort: 'max' },
    });
    const otherSourceHigh = makeCandidate({
      id: 'aa-high',
      sourceId: 'artificial-analysis',
      profile: { ...makeCandidate().profile, effort: 'high' },
    });
    const otherSourceXhigh = makeCandidate({
      id: 'livebench-xhigh',
      sourceId: 'livebench',
      profile: { ...makeCandidate().profile, effort: 'xhigh' },
    });
    const decision = decideProductEffort(missing, [
      missing,
      sameSourceMax,
      otherSourceHigh,
      otherSourceXhigh,
    ]);

    expect(decision).toEqual({
      effort: 'xhigh',
      basis: 'CROSS_SOURCE',
      basisSourceId: 'livebench',
      basisCandidateId: 'livebench-xhigh',
    });
  });

  it('counts one vote per tier per source, so a sweeping source cannot flip the result', () => {
    // The real Grok 4.6 shape, which is what forced this rule (spec 4.5,
    // decided 2026-08-21). LiveBench publishes the row unlabelled; Artificial
    // Analysis and Frontier Code ran only high; DeepSWE swept low..xhigh; Epoch
    // ran high and xhigh.
    //
    // Collapsing each source to its own highest tier gives high 2 / xhigh 2,
    // and the tie rule would hand it xhigh. Counting every tier each source
    // published gives high 4 / xhigh 2 with no tie to break.
    const unlabelled = makeCandidate({
      id: 'livebench-unlabelled',
      sourceId: 'livebench',
      model: { ...makeCandidate().model, rawName: 'GPT-5.6 Sol' },
      profile: { ...makeCandidate().profile, effort: null },
    });
    const published = (
      sourceId: string,
      efforts: readonly string[],
    ): ReturnType<typeof makeCandidate>[] =>
      efforts.map((effort) =>
        makeCandidate({
          id: `${sourceId}-${effort}`,
          sourceId,
          profile: { ...makeCandidate().profile, effort },
        }),
      );

    const decision = decideProductEffort(unlabelled, [
      unlabelled,
      ...published('artificial-analysis', ['high']),
      ...published('frontier-code', ['high']),
      ...published('deepswe', ['low', 'medium', 'high', 'xhigh']),
      ...published('epoch-ai', ['high', 'xhigh']),
    ]);

    expect(decision).toEqual({
      effort: 'high',
      basis: 'CROSS_SOURCE',
      basisSourceId: 'artificial-analysis',
      basisCandidateId: 'artificial-analysis-high',
    });
  });

  it('uses default when no other source has direct effort evidence', () => {
    const missing = makeCandidate({
      id: 'missing',
      sourceId: 'frontier-code',
      model: { ...makeCandidate().model, rawName: 'GPT-5.6 Sol' },
      profile: { ...makeCandidate().profile, effort: null },
    });
    const sameSourceMax = makeCandidate({
      id: 'same-source-max',
      sourceId: 'frontier-code',
      profile: { ...makeCandidate().profile, effort: 'max' },
    });

    const [resolved] = applyProductProfilePolicy(
      [missing, sameSourceMax],
      { schemaVersion: 'model-catalog-v1', models: [] },
      profilePolicy,
    );
    expect(resolved).toMatchObject({
      model: { profileId: 'openai-gpt-5-6-sol-default' },
      productProfile: { effort: 'default' },
      profile: { effort: null },
    });
  });

  it('does not let an excluded source cast a cross-source effort vote', () => {
    const missing = makeCandidate({
      id: 'included-unlabelled',
      sourceId: 'artificial-analysis',
      model: { ...makeCandidate().model, rawName: 'GPT-5.6 Sol' },
      profile: { ...makeCandidate().profile, effort: null },
    });
    const excludedMax = makeCandidate({
      id: 'excluded-zapier-max',
      sourceId: 'zapier-automationbench',
      inclusion: 'EXCLUDED',
      exclusionReason: 'Source adoption deferred until after N phase.',
      profile: { ...makeCandidate().profile, effort: 'max' },
    });

    expect(decideProductEffort(missing, [missing, excludedMax])).toEqual({
      effort: 'default',
      basis: 'DEFAULT',
      basisSourceId: null,
      basisCandidateId: null,
    });
  });

  it('treats invalid source effort as unlabelled without changing the raw field', () => {
    const invalid = makeCandidate({
      id: 'invalid',
      model: { ...makeCandidate().model, rawName: 'GPT-5.6 Sol (max)' },
      profile: { ...makeCandidate().profile, effort: '0.99' },
    });
    const [resolved] = applyProductProfilePolicy(
      [invalid],
      { schemaVersion: 'model-catalog-v1', models: [] },
      profilePolicy,
    );
    expect(resolved).toMatchObject({
      model: { profileId: 'openai-gpt-5-6-sol-default' },
      productProfile: { effort: 'default' },
      profile: { effort: '0.99' },
    });
  });

  it('aligns costs to the chosen product profile while preserving raw cost profile', () => {
    const candidate = makeCandidate({
      id: 'candidate-missing',
      sourceId: 'frontier-code',
      profile: { ...makeCandidate().profile, effort: null },
    });
    const cost = makeCost({
      sourceId: 'frontier-code',
      model: {
        ...makeCost().model,
        profileId: 'openai-gpt-5-6-sol-old',
      },
      profile: { ...makeCost().profile, effort: null },
    });
    const [aligned] = applyProductProfilePolicyToCosts(
      [cost],
      [candidate],
      { schemaVersion: 'model-catalog-v1', models: [] },
      profilePolicy,
    );
    expect(aligned).toMatchObject({
      model: { profileId: 'openai-gpt-5-6-sol-default' },
      profile: { effort: null },
    });
  });
});
