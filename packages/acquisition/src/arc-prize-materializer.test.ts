import { describe, expect, it } from 'vitest';

import {
  BENCHMARK_ID,
  BENCHMARK_VERSION,
  materializeArcPrize,
} from './arc-prize-materializer.js';

const mockContext = {
  evaluationsEvidenceId: `sha256:${'a'.repeat(64)}`,
  modelsEvidenceId: `sha256:${'b'.repeat(64)}`,
  datasetsEvidenceId: `sha256:${'c'.repeat(64)}`,
  pageEvidenceId: `sha256:${'d'.repeat(64)}`,
  observedAt: '2026-08-22T00:00:00.000Z',
};

const mockDatasets = JSON.stringify([
  { id: 'v1_Semi_Private', displayName: 'ARC-AGI-1' },
  { id: 'v2_Public_Eval', displayName: 'ARC-AGI-2 Public' },
  { id: 'v2_Semi_Private', displayName: 'ARC-AGI-2' },
  { id: 'v3_Semi_Private', displayName: 'ARC-AGI-3' },
]);

const mockModels = JSON.stringify([
  {
    id: 'sol-max',
    displayName: 'GPT-5.6 Sol (Max)',
    modelReleaseDate: '2026-07-09T00:00:00.000Z',
  },
  {
    id: 'opus-high-120k',
    displayName: 'Claude Opus 4.6 (120K, High)',
    modelReleaseDate: '2026-01-15T00:00:00.000Z',
  },
  {
    id: 'gemini-thinking-16k',
    displayName: 'Gemini 2.5 Pro (Thinking 16K)',
    modelReleaseDate: '2025-06-01T00:00:00.000Z',
  },
  {
    id: 'claude-37-16k',
    displayName: 'Claude 3.7 (16K)',
    modelReleaseDate: '2025-02-24T00:00:00.000Z',
  },
  {
    id: 'human-panel',
    displayName: 'Human Panel',
    modelReleaseDate: null,
  },
  {
    id: 'v3-only-model',
    displayName: 'GPT-5.6 Sol',
    modelReleaseDate: '2026-07-09T00:00:00.000Z',
  },
]);

const mockEvaluations = JSON.stringify([
  // Promoted v2_Semi_Private with display: true and cost
  {
    datasetId: 'v2_Semi_Private',
    modelId: 'sol-max',
    score: 0.255,
    costPerTask: 1.5,
    display: true,
  },
  // Promoted v2_Semi_Private with display: true and comma-separated token/effort
  {
    datasetId: 'v2_Semi_Private',
    modelId: 'opus-high-120k',
    score: 0.18,
    costPerTask: 2.3,
    display: true,
  },
  // Promoted v2_Semi_Private with token budget in parenthetical (effort should be null)
  {
    datasetId: 'v2_Semi_Private',
    modelId: 'gemini-thinking-16k',
    score: 0.12,
    costPerTask: 0.5,
    display: true,
  },
  // Promoted v2_Semi_Private with unresolved identity and no cost
  {
    datasetId: 'v2_Semi_Private',
    modelId: 'human-panel',
    score: 0.98,
    costPerTask: null,
    display: true,
  },
  // Promoted v2_Semi_Private with unresolved 2025 model and numeric cost
  {
    datasetId: 'v2_Semi_Private',
    modelId: 'claude-37-16k',
    score: 0.1,
    costPerTask: 0.05,
    display: true,
  },
  // Excluded: display is false
  {
    datasetId: 'v2_Semi_Private',
    modelId: 'sol-max',
    score: 0.25,
    costPerTask: 1.5,
    display: false,
  },
  // Excluded: wrong dataset (v3_Semi_Private)
  {
    datasetId: 'v3_Semi_Private',
    modelId: 'v3-only-model',
    score: 0.05,
    costPerTask: null,
    display: true,
  },
  // Excluded: wrong dataset (v2_Public_Eval)
  {
    datasetId: 'v2_Public_Eval',
    modelId: 'sol-max',
    score: 0.3,
    costPerTask: 1.0,
    display: true,
  },
]);

describe('ARC Prize materializer', () => {
  it('filters by split (v2_Semi_Private only) and display: true', () => {
    const result = materializeArcPrize(
      mockEvaluations,
      mockModels,
      mockDatasets,
      mockContext,
    );

    expect(result.candidates).toHaveLength(5);
    expect(result.costs).toHaveLength(4); // human-panel has costPerTask: null
    expect(
      result.candidates.every(
        ({ benchmarkId, benchmarkVersion }) =>
          benchmarkId === BENCHMARK_ID &&
          benchmarkVersion === BENCHMARK_VERSION,
      ),
    ).toBe(true);
    expect(
      result.costs.every(
        ({ benchmarkId, benchmarkVersion }) =>
          benchmarkId === BENCHMARK_ID &&
          benchmarkVersion === BENCHMARK_VERSION,
      ),
    ).toBe(true);
  });

  it('normalizes scores from 0-1 fraction to 0-100 percentage', () => {
    const result = materializeArcPrize(
      mockEvaluations,
      mockModels,
      mockDatasets,
      mockContext,
    );

    const sol = result.candidates.find((c) => c.model.rawName.includes('Sol'));
    expect(sol).toBeDefined();
    expect(sol?.rawScore).toBe(0.255);
    expect(sol?.normalizedScore).toBe(25.5);
    expect(sol?.metric).toEqual({
      id: 'score',
      name: 'ARC-AGI-2 score',
      unit: 'fraction',
      higherIsBetter: true,
    });
  });

  it('parses named effort tiers and resolves canonical model identity', () => {
    const result = materializeArcPrize(
      mockEvaluations,
      mockModels,
      mockDatasets,
      mockContext,
    );

    const sol = result.candidates.find((c) => c.model.rawName.includes('Sol'))!;
    expect(sol.model.canonicalModelId).toBe('openai-gpt-5-6-sol');
    expect(sol.model.profileId).toBe('openai-gpt-5-6-sol-max');
    expect(sol.profile.effort).toBe('max');

    const opus = result.candidates.find((c) =>
      c.model.rawName.includes('Opus 4.6'),
    )!;
    expect(opus.model.canonicalModelId).toBe('anthropic-claude-opus-4-6');
    expect(opus.model.profileId).toBe('anthropic-claude-opus-4-6-high');
    expect(opus.profile.effort).toBe('high');
  });

  it('treats token-budget parentheticals as null effort (not illegal effort profile IDs)', () => {
    const result = materializeArcPrize(
      mockEvaluations,
      mockModels,
      mockDatasets,
      mockContext,
    );

    const gemini = result.candidates.find((c) =>
      c.model.rawName.includes('Gemini 2.5 Pro'),
    )!;
    expect(gemini.profile.effort).toBeNull();
    // When effort is null, profileId must be null
    expect(gemini.model.profileId).toBeNull();
    expect(
      result.candidates.every(
        ({ model }) =>
          model.profileId === null ||
          /-(non-reasoning|low|medium|high|xhigh|max)$/u.test(model.profileId),
      ),
    ).toBe(true);
  });

  it('preserves unresolved models with canonicalModelId: null and profileId: null', () => {
    const result = materializeArcPrize(
      mockEvaluations,
      mockModels,
      mockDatasets,
      mockContext,
    );

    const human = result.candidates.find(
      (c) => c.model.rawName === 'Human Panel',
    )!;
    expect(human.model.canonicalModelId).toBeNull();
    expect(human.model.profileId).toBeNull();
    expect(result.unresolvedModels).toContain('Human Panel');
    expect(result.unresolvedModels).toContain('Claude 3.7 (16K)');
  });

  it('emits cost records only when costPerTask is present and numeric', () => {
    const result = materializeArcPrize(
      mockEvaluations,
      mockModels,
      mockDatasets,
      mockContext,
    );

    expect(result.costs).toHaveLength(4);
    const humanCost = result.costs.find(
      (c) => c.model.rawName === 'Human Panel',
    );
    expect(humanCost).toBeUndefined();

    const solCost = result.costs.find((c) => c.model.rawName.includes('Sol'))!;
    expect(solCost.cost).toBe(1.5);
    expect(solCost.costType).toBe('AGENT_TASK');
    expect(solCost.unit).toBe('USD_PER_TASK');
    expect(solCost.metricId).toBe('cost-per-task');
  });

  it('fails if a promoted row has a modelId not present in models.json', () => {
    const missingModelEval = JSON.stringify([
      {
        datasetId: 'v2_Semi_Private',
        modelId: 'unknown-model-not-in-models-json',
        score: 0.5,
        costPerTask: 1.0,
        display: true,
      },
    ]);

    expect(() =>
      materializeArcPrize(
        missingModelEval,
        mockModels,
        mockDatasets,
        mockContext,
      ),
    ).toThrowError(/missing modelId in models\.json/iu);
  });

  describe('Defect 1: (None) and (Thinking, None) produce non-reasoning effort', () => {
    it('files (None) and (Thinking, None) as non-reasoning, never null and never max', () => {
      const models = JSON.stringify([
        {
          id: 'deepseek-none',
          displayName: 'DeepSeek V4 Pro 0813 (None)',
        },
        {
          id: 'gpt51-thinking-none',
          displayName: 'GPT-5.1 (Thinking, None)',
        },
      ]);
      const evaluations = JSON.stringify([
        {
          datasetId: 'v2_Semi_Private',
          modelId: 'deepseek-none',
          score: 0.00833,
          costPerTask: 0.1,
          display: true,
        },
        {
          datasetId: 'v2_Semi_Private',
          modelId: 'gpt51-thinking-none',
          score: 0.0042,
          costPerTask: 0.05,
          display: true,
        },
      ]);

      const result = materializeArcPrize(
        evaluations,
        models,
        mockDatasets,
        mockContext,
      );

      const deepseek = result.candidates.find((c) =>
        c.model.rawName.includes('DeepSeek V4 Pro 0813'),
      )!;
      expect(deepseek.profile.effort).toBe('non-reasoning');
      expect(deepseek.model.canonicalModelId).toBe('deepseek-deepseek-v4-pro');
      expect(deepseek.model.profileId).toBe(
        'deepseek-deepseek-v4-pro-non-reasoning',
      );
      expect(deepseek.inclusion).toBe('INCLUDED');

      const gpt51 = result.candidates.find((c) =>
        c.model.rawName.includes('GPT-5.1'),
      )!;
      expect(gpt51.profile.effort).toBe('non-reasoning');
      expect(gpt51.model.canonicalModelId).toBeNull();
      expect(gpt51.model.profileId).toBeNull();
      expect(gpt51.inclusion).toBe('INCLUDED');
    });
  });

  describe('Defect 2: Minimal vs Low sibling rows', () => {
    it('excludes Minimal when a model has both Minimal and Low rows, while Low stays INCLUDED', () => {
      const models = JSON.stringify([
        {
          id: 'gemini-minimal',
          displayName: 'Gemini 3.6 Flash (Minimal)',
        },
        {
          id: 'gemini-low',
          displayName: 'Gemini 3.6 Flash (Low)',
        },
        {
          id: 'gemini-high',
          displayName: 'Gemini 3.6 Flash (High)',
        },
      ]);
      const evaluations = JSON.stringify([
        {
          datasetId: 'v2_Semi_Private',
          modelId: 'gemini-minimal',
          score: 0.0264,
          costPerTask: 0.01,
          display: true,
        },
        {
          datasetId: 'v2_Semi_Private',
          modelId: 'gemini-low',
          score: 0.3042,
          costPerTask: 0.05,
          display: true,
        },
        {
          datasetId: 'v2_Semi_Private',
          modelId: 'gemini-high',
          score: 0.6042,
          costPerTask: 0.15,
          display: true,
        },
      ]);

      const result = materializeArcPrize(
        evaluations,
        models,
        mockDatasets,
        mockContext,
      );

      const minRow = result.candidates.find((c) =>
        c.model.rawName.includes('(Minimal)'),
      )!;
      const lowRow = result.candidates.find((c) =>
        c.model.rawName.includes('(Low)'),
      )!;
      const minCost = result.costs.find((c) =>
        c.model.rawName.includes('(Minimal)'),
      )!;
      const lowCost = result.costs.find((c) =>
        c.model.rawName.includes('(Low)'),
      )!;

      expect(minRow.inclusion).toBe('EXCLUDED');
      expect(minRow.exclusionReason).toContain(
        'ARC published both Minimal and Low labels for this model; minimal cannot represent low.',
      );
      expect(minRow.normalizedScore).toBeCloseTo(2.64, 2);
      expect(minRow.provenance.rawScore?.locator).toContain('gemini-minimal');

      expect(minCost.inclusion).toBe('EXCLUDED');
      expect(minCost.exclusionReason).toContain(
        'ARC published both Minimal and Low labels for this model; minimal cannot represent low.',
      );

      expect(lowRow.inclusion).toBe('INCLUDED');
      expect(lowRow.exclusionReason).toBeNull();
      expect(lowRow.normalizedScore).toBeCloseTo(30.42, 2);
      expect(lowRow.profile.effort).toBe('low');

      expect(lowCost.inclusion).toBe('INCLUDED');
      expect(lowCost.exclusionReason).toBeNull();
    });

    it('keeps Minimal row INCLUDED with effort low when there is no sibling Low row', () => {
      const models = JSON.stringify([
        {
          id: 'gemini-flash-minimal',
          displayName: 'Gemini 3.5 Flash (Minimal)',
        },
        {
          id: 'gemini-flash-high',
          displayName: 'Gemini 3.5 Flash (High)',
        },
      ]);
      const evaluations = JSON.stringify([
        {
          datasetId: 'v2_Semi_Private',
          modelId: 'gemini-flash-minimal',
          score: 0.0889,
          costPerTask: 0.02,
          display: true,
        },
        {
          datasetId: 'v2_Semi_Private',
          modelId: 'gemini-flash-high',
          score: 0.7208,
          costPerTask: 0.1,
          display: true,
        },
      ]);

      const result = materializeArcPrize(
        evaluations,
        models,
        mockDatasets,
        mockContext,
      );

      const minRow = result.candidates.find((c) =>
        c.model.rawName.includes('(Minimal)'),
      )!;
      expect(minRow.inclusion).toBe('INCLUDED');
      expect(minRow.exclusionReason).toBeNull();
      expect(minRow.profile.effort).toBe('low');
      expect(minRow.model.canonicalModelId).toBe('google-gemini-3-5-flash');
      expect(minRow.model.profileId).toBe('google-gemini-3-5-flash-low');
    });
  });

  describe('Defect 3: unreviewed configuration markers exclusion', () => {
    it('excludes a resolved catalog row carrying an unrecognised segment, but not an unresolved row carrying the same segment', () => {
      const models = JSON.stringify([
        {
          id: 'gpt52-refine',
          displayName: 'GPT-5.2 (Refine.)',
        },
        {
          id: 'unresolved-refine',
          displayName: 'Custom Lab Model (Refine.)',
        },
      ]);
      const evaluations = JSON.stringify([
        {
          datasetId: 'v2_Semi_Private',
          modelId: 'gpt52-refine',
          score: 0.729,
          costPerTask: 2.0,
          display: true,
        },
        {
          datasetId: 'v2_Semi_Private',
          modelId: 'unresolved-refine',
          score: 0.5,
          costPerTask: 1.0,
          display: true,
        },
      ]);

      const result = materializeArcPrize(
        evaluations,
        models,
        mockDatasets,
        mockContext,
      );

      const resolvedRefine = result.candidates.find((c) =>
        c.model.rawName.includes('GPT-5.2 (Refine.)'),
      )!;
      expect(resolvedRefine.model.canonicalModelId).toBe('openai-gpt-5-2');
      expect(resolvedRefine.inclusion).toBe('EXCLUDED');
      expect(resolvedRefine.exclusionReason).toBe(
        'Unrecognised configuration segment "Refine." has not been reviewed as an effort tier.',
      );

      const resolvedRefineCost = result.costs.find((c) =>
        c.model.rawName.includes('GPT-5.2 (Refine.)'),
      )!;
      expect(resolvedRefineCost.inclusion).toBe('EXCLUDED');
      expect(resolvedRefineCost.exclusionReason).toBe(
        'Unrecognised configuration segment "Refine." has not been reviewed as an effort tier.',
      );

      const unresolvedRefine = result.candidates.find((c) =>
        c.model.rawName.includes('Custom Lab Model (Refine.)'),
      )!;
      expect(unresolvedRefine.model.canonicalModelId).toBeNull();
      expect(unresolvedRefine.inclusion).toBe('INCLUDED');
      expect(unresolvedRefine.exclusionReason).toBeNull();
    });

    it('recognises token budgets (120K, Thinking 16K) and produces null effort without excluding', () => {
      const models = JSON.stringify([
        {
          id: 'gemini-thinking-16k',
          displayName: 'Gemini 2.5 Pro (Thinking 16K)',
        },
        {
          id: 'claude-120k',
          displayName: 'Claude Opus 4.6 (120K)',
        },
      ]);
      const evaluations = JSON.stringify([
        {
          datasetId: 'v2_Semi_Private',
          modelId: 'gemini-thinking-16k',
          score: 0.12,
          costPerTask: 0.5,
          display: true,
        },
        {
          datasetId: 'v2_Semi_Private',
          modelId: 'claude-120k',
          score: 0.15,
          costPerTask: 0.6,
          display: true,
        },
      ]);

      const result = materializeArcPrize(
        evaluations,
        models,
        mockDatasets,
        mockContext,
      );

      const gemini = result.candidates.find((c) =>
        c.model.rawName.includes('Gemini 2.5 Pro'),
      )!;
      expect(gemini.profile.effort).toBeNull();
      expect(gemini.inclusion).toBe('INCLUDED');
      expect(gemini.exclusionReason).toBeNull();

      const opus = result.candidates.find((c) =>
        c.model.rawName.includes('Claude Opus 4.6'),
      )!;
      expect(opus.model.canonicalModelId).toBe('anthropic-claude-opus-4-6');
      expect(opus.profile.effort).toBeNull();
      expect(opus.inclusion).toBe('INCLUDED');
      expect(opus.exclusionReason).toBeNull();
    });
  });

  describe('Defect 4: validation report resolution counting and exclusion section', () => {
    it('correctly reports resolved/unresolved row counts and formats excluded section', () => {
      const result = materializeArcPrize(
        mockEvaluations,
        mockModels,
        mockDatasets,
        mockContext,
      );

      expect(result.resolvedRowsCount).toBe(2); // sol-max, opus-high-120k
      expect(result.unresolvedRowsCount).toBe(3); // gemini-thinking-16k, human-panel, claude-37-16k
      expect(result.unresolvedModels).toHaveLength(3);
      expect(result.validationReport).toContain(
        `Exact catalog resolution succeeded for 2/5 promoted rows (3 unresolved rows across 3 distinct model names).`,
      );
    });
  });
});
