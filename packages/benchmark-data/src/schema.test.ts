import { describe, expect, it } from 'vitest';
import benchmarkMappings from '../../../data/mappings/benchmarks.json';
import displaySetConfig from '../../../data/mappings/display-set.json';
import frontierConfig from '../../../data/mappings/frontier.json';
import sourcesConfig from '../../../data/mappings/sources.json';

import {
  BenchmarkDimensionMappingSchema,
  CandidateResultSchema,
  DisplaySetSchema,
  FrontierConfigSchema,
  ModelCatalogSchema,
  ProductCostSchema,
  ProductEvidenceSchema,
  ProductVersionSchema,
  SourcesConfigSchema,
  buildFrontierSet,
  buildProductVersion,
  deterministicJson,
  decideProductEffort,
  isModelQualified,
  isReleaseDateQualified,
  toProductEvidence,
  validateDisplaySet,
} from './index.js';

describe('ModelCatalogSchema', () => {
  it('preserves reviewed exact source aliases as catalog data', () => {
    const catalog = ModelCatalogSchema.parse({
      schemaVersion: 'model-catalog-v1',
      models: [
        {
          modelId: 'openai-gpt-5-3-codex',
          providerId: 'openai',
          displayName: 'GPT-5.3 Codex',
          releaseDate: null,
          aliases: ['GPT-5.3 Codex (high)', 'openai/gpt-5.3-codex'],
          pricing: [],
          profilePricing: {},
        },
      ],
    });

    expect(catalog.models[0]?.aliases).toEqual([
      'GPT-5.3 Codex (high)',
      'openai/gpt-5.3-codex',
    ]);
  });
});

const candidate = {
  schemaVersion: 'candidate-result-v1',
  id: 'terminal-bench:gpt-5-6-sol:max',
  sourceId: 'terminal-bench',
  sourceRole: 'ORGANIZER',
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
  rawScore: 85.8,
  normalizedScore: 85.8,
  acquisitionStatus: 'FULL',
  inclusion: 'INCLUDED',
  exclusionReason: null,
  sourceUrl: 'https://www.tbench.ai/leaderboard/terminal-bench/2.1',
  observedAt: '2026-07-16T00:00:00.000Z',
  sourcePublishedAt: '2026-07-11T00:00:00.000Z',
  evidenceIds: [
    'sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  ],
  provenance: {
    rawScore: {
      evidenceId:
        'sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      method: 'EMBEDDED_JSON',
      locator: '$.leaderboard[0].score',
    },
  },
} as const;

describe('CandidateResultSchema', () => {
  it('accepts a complete source result with field provenance', () => {
    expect(CandidateResultSchema.parse(candidate)).toEqual(candidate);
  });

  it('accepts a complete target row from an incomplete source snapshot', () => {
    const parsed = CandidateResultSchema.parse({
      ...candidate,
      acquisitionStatus: 'PARTIAL_SOURCE',
    });

    expect(parsed.acquisitionStatus).toBe('PARTIAL_SOURCE');
  });

  it('rejects a result without an exact numeric score', () => {
    expect(() =>
      CandidateResultSchema.parse({ ...candidate, rawScore: null }),
    ).toThrow();
  });

  it('requires an exclusion reason when a row is excluded', () => {
    expect(() =>
      CandidateResultSchema.parse({
        ...candidate,
        inclusion: 'EXCLUDED',
        exclusionReason: null,
      }),
    ).toThrow('exclusionReason');
  });
});

describe('ProductEvidenceSchema', () => {
  it('collapses field provenance to one strict score provenance record', () => {
    const evidence = toProductEvidence(CandidateResultSchema.parse(candidate));

    expect(evidence.provenance).toEqual({
      sourceUrl: candidate.sourceUrl,
      locator: candidate.provenance.rawScore.locator,
      method: candidate.provenance.rawScore.method,
      retrievedAt: candidate.observedAt,
      evidenceId: candidate.provenance.rawScore.evidenceId,
    });
    expect(evidence).not.toHaveProperty('evidenceIds');
    expect(evidence).not.toHaveProperty('observedAt');
    expect(evidence).not.toHaveProperty('sourcePublishedAt');
    expect(evidence).not.toHaveProperty('sourceUrl');
  });

  it('rejects the old field-level provenance map', () => {
    const evidence = toProductEvidence(CandidateResultSchema.parse(candidate));

    expect(() =>
      ProductEvidenceSchema.parse({
        ...evidence,
        provenance: candidate.provenance,
      }),
    ).toThrow();
  });
});

describe('BenchmarkDimensionMappingSchema', () => {
  it('validates the committed mapping and keeps benchmark IDs unique', () => {
    const parsed = BenchmarkDimensionMappingSchema.parse(benchmarkMappings);
    const ids = parsed.benchmarks.map(({ id }) => id);

    expect(new Set(ids).size).toBe(ids.length);
    expect(
      new Set(
        parsed.benchmarks.map(({ primaryDimension }) => primaryDimension),
      ),
    ).toEqual(
      new Set([
        'reasoning',
        'math',
        'knowledge',
        'language',
        'instruction',
        'coding',
        'agentic',
        'context',
      ]),
    );
  });
});

describe('ProductVersionSchema', () => {
  it('keeps all eight dimensions in canonical order', () => {
    const evidence = toProductEvidence(CandidateResultSchema.parse(candidate));
    const product = ProductVersionSchema.parse({
      schemaVersion: 'product-version-v4',
      versionId:
        'sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
      generatedAt: '2026-07-16T00:00:00.000Z',
      sourceSnapshotIds: ['terminal-bench:2026-07-16'],
      frontier: [],
      profiles: [],
      defaultPresetId: 'sample-preset',
      presets: [
        {
          id: 'sample-preset',
          targetModelCount: 1,
          requireAllSources: false,
          benchmarkIds: ['terminal-bench-2-1'],
          leaderboard: [
            {
              modelId: 'openai-gpt-5-6-sol',
              profileId: 'openai-gpt-5-6-sol-max',
              rank: 1,
              overallScore: 85.8,
              dimensions: [
                { dimension: 'reasoning', score: null, componentCount: 0 },
                { dimension: 'math', score: null, componentCount: 0 },
                { dimension: 'knowledge', score: null, componentCount: 0 },
                { dimension: 'language', score: null, componentCount: 0 },
                { dimension: 'instruction', score: null, componentCount: 0 },
                { dimension: 'coding', score: 85.8, componentCount: 1 },
                { dimension: 'agentic', score: null, componentCount: 0 },
                { dimension: 'context', score: null, componentCount: 0 },
              ],
              evidenceResultIds: [candidate.id],
            },
          ],
        },
      ],
      costs: [],
      evidence: [evidence],
    });

    expect(
      product.presets[0]?.leaderboard[0]?.dimensions.map(
        ({ dimension }) => dimension,
      ),
    ).toEqual([
      'reasoning',
      'math',
      'knowledge',
      'language',
      'instruction',
      'coding',
      'agentic',
      'context',
    ]);

    expect(() =>
      ProductVersionSchema.parse({
        ...product,
        presets: product.presets.map((preset) => ({
          ...preset,
          leaderboard: preset.leaderboard.map((row) => ({
            ...row,
            status: 'ESTIMATED',
          })),
        })),
      }),
    ).toThrow();
  });

  it('accepts product cost rows with null performance', () => {
    expect(
      ProductCostSchema.parse({
        modelId: 'openai-gpt-5-6-sol',
        profileId: 'openai-gpt-5-6-sol-high',
        costType: 'MEASURED_TASK',
        cost: 0.85,
        performance: null,
        assumptionId: null,
        sourceUrl: 'https://artificialanalysis.ai/models',
        sourceId: 'artificial-analysis',
        metricId: 'cost-per-intelligence-index-task',
        metricName: 'Cost per Intelligence Index task',
        unit: 'USD_PER_TASK',
        benchmarkId: 'artificial-analysis-intelligence-index',
        benchmarkVersion: null,
        evidenceIds: [
          'sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        ],
      }).performance,
    ).toBeNull();
  });

  it('rejects a product cost row that carries no evidence', () => {
    expect(() =>
      ProductCostSchema.parse({
        modelId: 'openai-gpt-5-6-sol',
        profileId: 'openai-gpt-5-6-sol-high',
        costType: 'MEASURED_TASK',
        cost: 0.85,
        performance: null,
        assumptionId: null,
        sourceUrl: 'https://artificialanalysis.ai/models',
        sourceId: 'artificial-analysis',
        metricId: 'cost-per-intelligence-index-task',
        metricName: 'Cost per Intelligence Index task',
        unit: 'USD_PER_TASK',
        benchmarkId: 'artificial-analysis-intelligence-index',
        benchmarkVersion: null,
        evidenceIds: [],
      }),
    ).toThrow();
  });

  it('keeps the version hash deterministic for identical v4 input', () => {
    const evidence = toProductEvidence(CandidateResultSchema.parse(candidate));
    const input = {
      generatedAt: '2026-07-16T00:00:00.000Z',
      sourceSnapshotIds: ['terminal-bench:2026-07-16'],
      frontier: [],
      profiles: [],
      defaultPresetId: 'sample-preset',
      presets: [
        {
          id: 'sample-preset',
          targetModelCount: 1,
          requireAllSources: false,
          benchmarkIds: ['terminal-bench-2-1'],
          leaderboard: [],
        },
      ],
      costs: [],
      evidence: [evidence],
    };

    expect(buildProductVersion(input).versionId).toBe(
      buildProductVersion(input).versionId,
    );
  });
});

describe('deterministicJson', () => {
  it('serializes object keys deterministically without changing array order', () => {
    expect(
      deterministicJson({
        z: 1,
        nested: { b: 2, a: 1 },
        list: [{ d: 4, c: 3 }, 2],
      }),
    ).toBe('{"list":[{"c":3,"d":4},2],"nested":{"a":1,"b":2},"z":1}\n');
  });
});

describe('SourcesConfigSchema', () => {
  it('validates the committed sources.json whitelist', () => {
    const parsed = SourcesConfigSchema.parse(sourcesConfig);
    expect(parsed.schemaVersion).toBe('sources-config-v1');
    expect(parsed.whitelist).toEqual([
      'artificial-analysis',
      'livebench',
      'deepswe',
      'frontier-code',
      'epoch-ai',
      'arc-prize',
      'zapier-automationbench',
      'vals-ai',
    ]);
  });

  it('rejects an empty whitelist or invalid source slug', () => {
    expect(() =>
      SourcesConfigSchema.parse({
        schemaVersion: 'sources-config-v1',
        whitelist: [],
      }),
    ).toThrow();

    expect(() =>
      SourcesConfigSchema.parse({
        schemaVersion: 'sources-config-v1',
        whitelist: ['INVALID_SLUG!'],
      }),
    ).toThrow();
  });
});

describe('DisplaySetSchema and validateDisplaySet', () => {
  const mapping = () =>
    BenchmarkDimensionMappingSchema.parse(benchmarkMappings);
  // One benchmark per primary dimension, so the eight-dimension rule passes and
  // each test below fails for the single reason it is about.
  const eightDimensionIds = [
    'livebench-reasoning',
    'livebench-mathematics',
    'livebench-language',
    'livebench-instruction-following',
    'mmlu-pro',
    'swe-bench',
    'tau3-banking',
    'aa-lcr',
  ];
  const preset = (overrides: Record<string, unknown> = {}) => ({
    id: 'sample-preset',
    targetModelCount: 4,
    requireAllSources: false,
    benchmarkIds: eightDimensionIds,
    ...overrides,
  });
  const displaySet = (overrides: Record<string, unknown> = {}) => ({
    schemaVersion: 'display-set-v2',
    defaultPresetId: 'sample-preset',
    presets: [preset()],
    ...overrides,
  });

  it('validates the committed display-set.json mapping', () => {
    const parsed = DisplaySetSchema.parse(displaySetConfig);
    expect(parsed.schemaVersion).toBe('display-set-v2');
    expect(parsed.presets.length).toBeGreaterThan(0);
    expect(
      parsed.presets.map(({ id }) => id).includes(parsed.defaultPresetId),
    ).toBe(true);
    expect(() => validateDisplaySet(parsed, mapping())).not.toThrow();
  });

  it('rejects an empty benchmark list, an invalid slug, or no presets', () => {
    expect(() =>
      DisplaySetSchema.parse(
        displaySet({ presets: [preset({ benchmarkIds: [] })] }),
      ),
    ).toThrow();
    expect(() =>
      DisplaySetSchema.parse(
        displaySet({
          presets: [preset({ benchmarkIds: ['NOT_A_VALID_SLUG!'] })],
        }),
      ),
    ).toThrow();
    expect(() => DisplaySetSchema.parse(displaySet({ presets: [] }))).toThrow();
  });

  it('throws an explicit error identifying unknown benchmark IDs', () => {
    expect(() =>
      validateDisplaySet(
        DisplaySetSchema.parse(
          displaySet({
            presets: [
              preset({
                benchmarkIds: [
                  ...eightDimensionIds,
                  'non-existent-bench-foo',
                  'another-missing-bench-bar',
                ],
              }),
            ],
          }),
        ),
        mapping(),
      ),
    ).toThrowError(
      'Display set preset sample-preset contains unknown benchmark IDs: non-existent-bench-foo, another-missing-bench-bar',
    );
  });

  it('rejects a preset that leaves a dimension with no primary benchmark', () => {
    // Ruling D-N10-3: a preset is the scoring basis, so one that cannot fill
    // every dimension would publish an Overall Score nobody can reach.
    expect(() =>
      validateDisplaySet(
        DisplaySetSchema.parse(
          displaySet({
            presets: [
              preset({
                benchmarkIds: eightDimensionIds.filter((id) => id !== 'aa-lcr'),
              }),
            ],
          }),
        ),
        mapping(),
      ),
    ).toThrowError(
      'Display set preset sample-preset leaves dimensions with no benchmark: context',
    );
  });

  it('rejects duplicate preset ids, repeated benchmarks, and a dangling default', () => {
    expect(() =>
      validateDisplaySet(
        DisplaySetSchema.parse(displaySet({ presets: [preset(), preset()] })),
        mapping(),
      ),
    ).toThrowError('Display set has duplicate preset id: sample-preset');

    expect(() =>
      validateDisplaySet(
        DisplaySetSchema.parse(
          displaySet({
            presets: [
              preset({ benchmarkIds: [...eightDimensionIds, 'aa-lcr'] }),
            ],
          }),
        ),
        mapping(),
      ),
    ).toThrowError(
      'Display set preset sample-preset repeats benchmark IDs: aa-lcr',
    );

    expect(() =>
      validateDisplaySet(
        DisplaySetSchema.parse(displaySet({ defaultPresetId: 'not-a-preset' })),
        mapping(),
      ),
    ).toThrowError(
      'Display set defaultPresetId not-a-preset is not one of its presets',
    );
  });
});

describe('FrontierConfigSchema and model qualification', () => {
  it('validates the committed frontier-config-v2 configuration without compositeSources', () => {
    const parsed = FrontierConfigSchema.parse(frontierConfig);
    expect(parsed.schemaVersion).toBe('frontier-config-v2');
    expect(parsed.qualificationWindowMonths).toBe(12);
    expect(parsed.manualModels).toEqual([]);
    expect(parsed).not.toHaveProperty('compositeSources');
    expect(parsed).not.toHaveProperty('perSourceLimit');
  });

  describe('isReleaseDateQualified boundary tests', () => {
    const referenceDate = '2026-07-16T14:00:00.000Z';

    it('qualifies a model released exactly 12 months ago', () => {
      expect(isReleaseDateQualified('2025-07-16', referenceDate, 12)).toBe(
        true,
      );
    });

    it('disqualifies a model released 12 months and 1 day ago', () => {
      expect(isReleaseDateQualified('2025-07-15', referenceDate, 12)).toBe(
        false,
      );
    });

    it('qualifies a model released recently within 12 months', () => {
      expect(isReleaseDateQualified('2026-03-01', referenceDate, 12)).toBe(
        true,
      );
    });

    it('respects a custom qualification window in months', () => {
      expect(isReleaseDateQualified('2026-01-01', referenceDate, 6)).toBe(
        false,
      );
      expect(isReleaseDateQualified('2026-02-01', referenceDate, 6)).toBe(true);
    });
  });

  describe('isModelQualified', () => {
    const referenceDate = '2026-07-16T14:00:00.000Z';

    it('qualifies an active model with a valid releaseDate within window', () => {
      expect(
        isModelQualified(
          {
            modelId: 'test-model',
            releaseDate: '2026-05-01',
            deprecated: false,
          },
          referenceDate,
          12,
        ),
      ).toBe(true);
    });

    it('qualifies a model with no releaseDate at all', () => {
      // REFACTOR_SPEC_V2.md section 5.1: the window only removes models known
      // to be old. A missing date must never silently drop a model, because
      // frontier eligibility is decided by measured availability, not by whether the
      // catalog row happens to carry a date.
      expect(
        isModelQualified(
          {
            modelId: 'test-model',
            releaseDate: null,
            deprecated: false,
          },
          referenceDate,
          12,
        ),
      ).toBe(true);
    });

    it('disqualifies a deprecated model with no releaseDate', () => {
      expect(
        isModelQualified(
          {
            modelId: 'test-model',
            releaseDate: null,
            deprecated: true,
          },
          referenceDate,
          12,
        ),
      ).toBe(false);
    });

    it('disqualifies a deprecated model even if released within window', () => {
      expect(
        isModelQualified(
          {
            modelId: 'test-model',
            releaseDate: '2026-05-01',
            deprecated: true,
          },
          referenceDate,
          12,
        ),
      ).toBe(false);
    });

    it('disqualifies an active model released before the window', () => {
      expect(
        isModelQualified(
          {
            modelId: 'test-model',
            releaseDate: '2024-01-01',
            deprecated: false,
          },
          referenceDate,
          12,
        ),
      ).toBe(false);
    });
  });

  describe('buildFrontierSet', () => {
    it('populates frontier models from qualified catalog models and manualModels', () => {
      const catalog = ModelCatalogSchema.parse({
        schemaVersion: 'model-catalog-v1',
        models: [
          {
            modelId: 'qualified-model',
            providerId: 'provider-a',
            displayName: 'Qualified Model',
            releaseDate: '2026-01-01',
            pricing: [],
            profilePricing: {},
          },
          {
            modelId: 'expired-model',
            providerId: 'provider-b',
            displayName: 'Expired Model',
            releaseDate: '2024-01-01',
            pricing: [],
            profilePricing: {},
          },
          {
            modelId: 'deprecated-model',
            providerId: 'provider-c',
            displayName: 'Deprecated Model',
            releaseDate: '2026-05-01',
            deprecated: true,
            pricing: [],
            profilePricing: {},
          },
          {
            modelId: 'nodate-model',
            providerId: 'provider-d',
            displayName: 'No Date Model',
            releaseDate: null,
            pricing: [],
            profilePricing: {},
          },
        ],
      });

      const frontier = buildFrontierSet({
        catalog,
        manualModels: [
          {
            modelId: 'manual-model',
            reason: 'Manual inclusion for early preview',
          },
        ],
        referenceDate: '2026-07-16T14:00:00.000Z',
        qualificationWindowMonths: 12,
      });

      expect(frontier.map(({ modelId }) => modelId).toSorted()).toEqual([
        'manual-model',
        'nodate-model',
        'qualified-model',
      ]);
      expect(
        frontier.find(({ modelId }) => modelId === 'manual-model')?.reasons,
      ).toEqual(['Manual inclusion for early preview']);
      expect(
        frontier.find(({ modelId }) => modelId === 'qualified-model')?.reasons,
      ).toEqual(['Active model within 12 month qualification window']);
      expect(
        frontier.find(({ modelId }) => modelId === 'nodate-model')?.reasons,
      ).toEqual([
        'Active model with no known release date; not excluded by the release-date window',
      ]);
      // The window still removes models that are known to be old, and
      // deprecation still wins regardless of date.
      expect(frontier.map(({ modelId }) => modelId)).not.toContain(
        'expired-model',
      );
      expect(frontier.map(({ modelId }) => modelId)).not.toContain(
        'deprecated-model',
      );
    });
  });
});

describe('decideProductEffort non-reasoning exclusion', () => {
  const row = (
    id: string,
    sourceId: string,
    rawName: string,
    effort: string | null,
  ) => ({
    id,
    sourceId,
    model: { canonicalModelId: 'vendor-model', rawName },
    profile: { effort },
  });

  it('never infers non-reasoning onto another source', () => {
    // Qwen3.6 27B: AA lists (Reasoning) with no tier, which resolves to
    // `default`, plus (Non-reasoning). Before this rule non-reasoning was the
    // only named tier left, so LiveBench's plain row was filed as reasoning-off.
    const all = [
      row('aa:reasoning', 'artificial-analysis', 'Model (Reasoning)', null),
      row(
        'aa:non',
        'artificial-analysis',
        'Model (Non-reasoning)',
        'non-reasoning',
      ),
      row('lb:bare', 'livebench', 'model', null),
    ];
    const decision = decideProductEffort(all[2]!, all);
    expect(decision.effort).toBe('default');
    expect(decision.basis).toBe('DEFAULT');
  });

  it('still infers a named tier across sources', () => {
    const all = [
      row('aa:max', 'artificial-analysis', 'Model (max)', 'max'),
      row(
        'aa:non',
        'artificial-analysis',
        'Model (Non-reasoning)',
        'non-reasoning',
      ),
      row('fc:bare', 'frontier-code', 'Model', null),
    ];
    const decision = decideProductEffort(all[2]!, all);
    expect(decision.effort).toBe('max');
    expect(decision.basis).toBe('CROSS_SOURCE');
  });

  it('lets each source vote once instead of letting one sweep decide', () => {
    // Grok 4.6: DeepSWE swept low..xhigh, AA and Frontier Code both ran only
    // high. Taking the single highest tier handed LiveBench `xhigh`.
    const all = [
      row('aa:high', 'artificial-analysis', 'Model (high)', 'high'),
      row('ds:low', 'deepswe', 'Model (low)', 'low'),
      row('ds:medium', 'deepswe', 'Model (medium)', 'medium'),
      row('ds:high', 'deepswe', 'Model (high)', 'high'),
      row('ds:xhigh', 'deepswe', 'Model (xhigh)', 'xhigh'),
      row('fc:high', 'frontier-code', 'Model (high)', 'high'),
      row('lb:bare', 'livebench', 'model', null),
    ];
    const decision = decideProductEffort(all[6]!, all);
    expect(decision.effort).toBe('high');
    expect(decision.basis).toBe('CROSS_SOURCE');
  });

  it('breaks a tied vote toward the higher tier', () => {
    const all = [
      row('aa:max', 'artificial-analysis', 'Model (max)', 'max'),
      row('ds:high', 'deepswe', 'Model (high)', 'high'),
      row('lb:bare', 'livebench', 'model', null),
    ];
    expect(decideProductEffort(all[2]!, all).effort).toBe('max');
  });

  it('keeps a row the source already described as non-reasoning', () => {
    const all = [
      row('aa:max', 'artificial-analysis', 'Model (max)', 'max'),
      row('lb:non', 'livebench', 'Model (Non-reasoning)', 'non-reasoning'),
    ];
    expect(decideProductEffort(all[1]!, all).effort).toBe('non-reasoning');
  });
});
