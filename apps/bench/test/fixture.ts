import {
  DIMENSION_IDS,
  buildProductVersion,
  toProductEvidence,
  type CandidateResult,
  type DimensionId,
  type ProductEvidence,
} from '@llm-bench/benchmark-data';

import { withActivePreset } from '../lib/view-model';

const dimensions = (
  values: Array<number | null>,
): Array<{
  dimension: DimensionId;
  score: number | null;
  componentCount: number;
}> =>
  DIMENSION_IDS.map((dimension, index) => ({
    dimension,
    score: values[index] ?? null,
    componentCount: values[index] === null ? 0 : 1,
  }));

const profile = (
  id: string,
  modelId: string,
  providerId: string,
  displayName: string,
  baseModelName: string,
  effort: string,
) => ({
  id,
  modelId,
  providerId,
  displayName,
  baseModelName,
  releaseDate: '2026-07-09',
  attributes: {
    effort,
    harness: null,
  },
  pricing: [],
});

const makeCandidateEvidence = (
  id: string,
  profileId: string,
  modelId: string,
  benchmarkId: string,
  inclusion: 'INCLUDED' | 'EXCLUDED',
  acquisitionStatus: 'FULL' | 'PARTIAL_SOURCE',
  score: number,
): CandidateResult => ({
  schemaVersion: 'candidate-result-v1' as const,
  id,
  sourceId: 'terminal-bench',
  sourceRole:
    inclusion === 'INCLUDED' ? ('ORGANIZER' as const) : ('AGGREGATOR' as const),
  benchmarkId,
  benchmarkVersion: '2.1',
  model: {
    rawName: profileId,
    canonicalModelId: modelId,
    profileId,
  },
  profile: {
    effort: profileId.includes('max') ? 'max' : 'high',
    thinking: 'enabled',
    tools: true,
    harness: null,
    contextWindowTokens: 400000,
    quantization: null,
    attempts: 1,
  },
  metric: {
    id: 'score',
    name: 'Score',
    unit: 'percent',
    higherIsBetter: true,
  },
  rawScore: score,
  normalizedScore: inclusion === 'INCLUDED' ? score : null,
  acquisitionStatus,
  inclusion,
  exclusionReason:
    inclusion === 'EXCLUDED'
      ? 'External composite is used for frontier selection only.'
      : null,
  sourceUrl: 'https://www.tbench.ai/leaderboard/terminal-bench/2.1',
  observedAt: '2026-07-16T12:00:00.000Z',
  sourcePublishedAt: '2026-07-11T00:00:00.000Z',
  evidenceIds: [
    'sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  ],
  provenance: {
    rawScore: {
      evidenceId:
        'sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      method: 'EMBEDDED_JSON' as const,
      locator: '$.leaderboard.score',
    },
  },
});

const evidence = (
  id: string,
  profileId: string,
  modelId: string,
  benchmarkId: string,
  inclusion: 'INCLUDED' | 'EXCLUDED',
  acquisitionStatus: 'FULL' | 'PARTIAL_SOURCE',
  score: number,
): ProductEvidence =>
  toProductEvidence(
    makeCandidateEvidence(
      id,
      profileId,
      modelId,
      benchmarkId,
      inclusion,
      acquisitionStatus,
      score,
    ),
  );

const fixtureLeaderboard = [
  {
    modelId: 'openai-gpt-5-6-sol',
    profileId: 'openai-gpt-5-6-sol-max',
    rank: 1,
    overallScore: 88.1,
    dimensions: dimensions([91.2, 86.4, 92.4, 87.6, 82.8]),
    evidenceResultIds: ['terminal:max'],
  },
  {
    modelId: 'anthropic-claude-fable-5',
    profileId: 'anthropic-claude-fable-5-standard',
    rank: 2,
    overallScore: 85.6,
    dimensions: dimensions([88.6, 89.1, 86.8, 80.3, null]),
    evidenceResultIds: ['terminal:claude'],
  },
  {
    modelId: 'openai-gpt-5-6-sol',
    profileId: 'openai-gpt-5-6-sol-high',
    rank: 3,
    overallScore: 84.2,
    dimensions: dimensions([87, 83, 88, 82, 80]),
    evidenceResultIds: ['terminal:high'],
  },
  {
    modelId: 'google-gemini-3-1-pro',
    profileId: 'google-gemini-3-1-pro-high',
    rank: 4,
    overallScore: 82.9,
    dimensions: dimensions([86.3, 84.5, 78.4, 74.9, 85.2]),
    evidenceResultIds: ['terminal:gemini'],
  },
];

const builtFixture = buildProductVersion({
  generatedAt: '2026-07-16T12:00:00.000Z',
  sourceSnapshotIds: ['terminal-bench:2026-07-16'],
  frontier: [
    {
      modelId: 'openai-gpt-5-6-sol',
      reasons: ['Composite top cohort'],
      externalCompositeScores: { intelligence: 78.4 },
    },
    {
      modelId: 'anthropic-claude-fable-5',
      reasons: ['Composite top cohort'],
      externalCompositeScores: { intelligence: 76.9 },
    },
    {
      modelId: 'google-gemini-3-1-pro',
      reasons: ['Composite top cohort'],
      externalCompositeScores: { intelligence: 74.8 },
    },
  ],
  profiles: [
    profile(
      'openai-gpt-5-6-sol-max',
      'openai-gpt-5-6-sol',
      'openai',
      'GPT-5.6 Sol · max',
      'GPT-5.6 Sol',
      'max',
    ),
    profile(
      'openai-gpt-5-6-sol-high',
      'openai-gpt-5-6-sol',
      'openai',
      'GPT-5.6 Sol · high',
      'GPT-5.6 Sol',
      'high',
    ),
    profile(
      'anthropic-claude-fable-5-standard',
      'anthropic-claude-fable-5',
      'anthropic',
      'Claude Fable 5 · standard',
      'Claude Fable 5',
      'standard',
    ),
    profile(
      'google-gemini-3-1-pro-high',
      'google-gemini-3-1-pro',
      'google',
      'Gemini 3.1 Pro · high',
      'Gemini 3.1 Pro',
      'high',
    ),
  ],
  defaultPresetId: 'fixture-preset',
  presets: [
    {
      id: 'fixture-preset',
      targetModelCount: 2,
      requireAllSources: false,
      benchmarkIds: ['terminal-bench-2-1'],
      leaderboard: fixtureLeaderboard,
    },
  ],
  costs: [
    {
      modelId: 'openai-gpt-5-6-sol',
      profileId: 'openai-gpt-5-6-sol-max',
      costType: 'API_STANDARDIZED',
      cost: 12.25,
      performance: 88.1,
      assumptionId: 'blended-token-v1',
      sourceUrl: 'https://artificialanalysis.ai/models',
      sourceId: 'artificial-analysis',
      metricId: 'blended-token-price',
      metricName: 'Blended token price',
      unit: 'USD_PER_MILLION_TOKENS',
      benchmarkId: null,
      benchmarkVersion: null,
      evidenceIds: [
        'sha256:ccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc051',
      ],
    },
    {
      modelId: 'anthropic-claude-fable-5',
      profileId: 'anthropic-claude-fable-5-standard',
      costType: 'API_STANDARDIZED',
      cost: 12,
      performance: 85.6,
      assumptionId: 'blended-token-v1',
      sourceUrl: 'https://livebench.ai/',
      sourceId: 'livebench',
      metricId: 'blended-token-price',
      metricName: 'Blended token price',
      unit: 'USD_PER_MILLION_TOKENS',
      benchmarkId: null,
      benchmarkVersion: null,
      evidenceIds: [
        'sha256:ccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc052',
      ],
    },
    {
      modelId: 'openai-gpt-5-6-sol',
      profileId: 'openai-gpt-5-6-sol-max',
      costType: 'MEASURED_TASK',
      cost: 1.42,
      performance: 88.1,
      assumptionId: null,
      sourceUrl: 'https://artificialanalysis.ai/models',
      sourceId: 'artificial-analysis',
      metricId: 'cost-per-intelligence-index-task',
      metricName: 'Cost per Intelligence Index task',
      unit: 'USD_PER_TASK',
      benchmarkId: 'artificial-analysis-intelligence-index',
      benchmarkVersion: null,
      evidenceIds: [
        'sha256:ccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc053',
      ],
    },
    {
      modelId: 'anthropic-claude-fable-5',
      profileId: 'anthropic-claude-fable-5-standard',
      costType: 'AGENT_TASK',
      cost: 2.36,
      performance: 85.6,
      assumptionId: null,
      sourceUrl: 'https://deepswe.datacurve.ai/',
      sourceId: 'deepswe',
      metricId: 'mean-cost-usd',
      metricName: 'Mean agent task cost',
      unit: 'USD_PER_TASK',
      benchmarkId: 'deepswe',
      benchmarkVersion: '1.1',
      evidenceIds: [
        'sha256:ccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc054',
      ],
    },
  ],
  evidence: [
    evidence(
      'terminal:max',
      'openai-gpt-5-6-sol-max',
      'openai-gpt-5-6-sol',
      'terminal-bench-2-1',
      'INCLUDED',
      'FULL',
      92.4,
    ),
    evidence(
      'epoch:max',
      'openai-gpt-5-6-sol-max',
      'openai-gpt-5-6-sol',
      'frontiermath',
      'INCLUDED',
      'PARTIAL_SOURCE',
      94.7,
    ),
    toProductEvidence({
      ...makeCandidateEvidence(
        'aggregate:max',
        'openai-gpt-5-6-sol-max-mini-swe-agent',
        'openai-gpt-5-6-sol',
        'intelligence-index',
        'EXCLUDED',
        'FULL',
        78.4,
      ),
      profile: {
        effort: 'max',
        thinking: 'enabled',
        tools: true,
        harness: 'mini-swe-agent',
        contextWindowTokens: 400000,
        quantization: null,
        attempts: 1,
      },
    }),
    evidence(
      'terminal:high',
      'openai-gpt-5-6-sol-high',
      'openai-gpt-5-6-sol',
      'terminal-bench-2-1',
      'INCLUDED',
      'FULL',
      88,
    ),
  ],
});

/**
 * Tests read `productFixture.leaderboard`, which after ruling R1 only exists
 * relative to a preset. Resolving the default here keeps every existing
 * assertion meaningful and pins what "the leaderboard" means in a test.
 */
export const productFixture = withActivePreset(builtFixture);
