import { createHash } from 'node:crypto';

import type { DimensionId } from '@llm-bench/contracts';

export const dimensionSeed = [
  {
    id: 'reasoning',
    displayOrder: 0,
    nameZhTw: '科學推理',
    nameEn: 'Reasoning',
    descriptionZhTw: '科學、邏輯與複合問題的推理能力。',
    descriptionEn: 'Scientific, logical, and multi-step problem solving.',
  },
  {
    id: 'math',
    displayOrder: 1,
    nameZhTw: '數學',
    nameEn: 'Mathematics',
    descriptionZhTw: '數學理解、計算與證明能力。',
    descriptionEn: 'Mathematical understanding, calculation, and proof.',
  },
  {
    id: 'knowledge',
    displayOrder: 2,
    nameZhTw: '知識',
    nameEn: 'Knowledge',
    descriptionZhTw: '跨領域知識的準確性與涵蓋度。',
    descriptionEn: 'Accuracy and breadth of cross-domain knowledge.',
  },
  {
    id: 'language',
    displayOrder: 3,
    nameZhTw: '長文本推理',
    nameEn: 'Long-context Language',
    descriptionZhTw: '長文本理解、整合與一致性。',
    descriptionEn: 'Long-context comprehension, synthesis, and consistency.',
  },
  {
    id: 'instruction',
    displayOrder: 4,
    nameZhTw: '指令遵循',
    nameEn: 'Instruction Following',
    descriptionZhTw: '遵循限制、格式與使用者意圖的能力。',
    descriptionEn: 'Ability to follow constraints, formats, and user intent.',
  },
  {
    id: 'coding',
    displayOrder: 5,
    nameZhTw: '程式設計',
    nameEn: 'Coding',
    descriptionZhTw: '程式生成、理解、除錯與軟體工程能力。',
    descriptionEn:
      'Code generation, comprehension, debugging, and engineering.',
  },
  {
    id: 'agentic',
    displayOrder: 6,
    nameZhTw: '工具調用',
    nameEn: 'Agentic Tool Use',
    descriptionZhTw: '規劃並可靠運用工具完成任務的能力。',
    descriptionEn: 'Planning and reliable tool use to complete tasks.',
  },
  {
    id: 'context',
    displayOrder: 7,
    nameZhTw: '事實可靠性',
    nameEn: 'Factual Reliability',
    descriptionZhTw: '回答可查證、校準與避免幻覺的程度。',
    descriptionEn:
      'Verifiability, calibration, and resistance to hallucination.',
  },
] as const;

export const liveBenchBenchmarkSeed = {
  slug: 'livebench',
  displayName: 'LiveBench',
  homepageUrl: 'https://livebench.ai/',
  licenseSpdx: 'Apache-2.0',
  description:
    'Contamination-limited benchmark with date-versioned questions and official model judgments.',
  version: '2024-11-25',
  releasedAt: '2024-11-25T00:00:00.000Z',
  methodologyUrl: 'https://github.com/LiveBench/LiveBench',
  inventoryContentSha256:
    'b8a90d2f2308b774fbee982178d433412fd6f349429be2a41def4331b0ee4027',
  inventoryObservationCount: 1_000,
} as const;

type LiveBenchCategory =
  | 'reasoning'
  | 'math'
  | 'coding'
  | 'language'
  | 'data_analysis'
  | 'instruction_following';

interface LiveBenchMetricSeed {
  readonly slug: string;
  readonly displayName: string;
  readonly sourceTask: string;
  readonly category: LiveBenchCategory;
  readonly expectedObservations: number;
  readonly unit: 'PERCENT';
  readonly higherIsBetter: true;
  readonly theoreticalMin: '0';
  readonly theoreticalMax: '100';
  readonly taskType: string;
  readonly atomicCapabilities: readonly string[];
}

const metric = (
  input: Omit<
    LiveBenchMetricSeed,
    'unit' | 'higherIsBetter' | 'theoreticalMin' | 'theoreticalMax'
  >,
): LiveBenchMetricSeed => ({
  ...input,
  unit: 'PERCENT',
  higherIsBetter: true,
  theoreticalMin: '0',
  theoreticalMax: '100',
});

export const liveBenchMetricSeeds = [
  metric({
    slug: 'coding-completion',
    displayName: 'Coding Completion',
    sourceTask: 'coding_completion',
    category: 'coding',
    expectedObservations: 50,
    taskType: 'code_completion',
    atomicCapabilities: ['code_generation', 'program_correctness'],
  }),
  metric({
    slug: 'lcb-generation',
    displayName: 'LiveCodeBench Generation',
    sourceTask: 'LCB_generation',
    category: 'coding',
    expectedObservations: 78,
    taskType: 'code_generation',
    atomicCapabilities: ['algorithms', 'program_correctness'],
  }),
  metric({
    slug: 'cta',
    displayName: 'Call Type Annotation',
    sourceTask: 'cta',
    category: 'data_analysis',
    expectedObservations: 50,
    taskType: 'structured_data_reasoning',
    atomicCapabilities: ['table_understanding', 'schema_reasoning'],
  }),
  metric({
    slug: 'tablejoin',
    displayName: 'Table Join',
    sourceTask: 'tablejoin',
    category: 'data_analysis',
    expectedObservations: 50,
    taskType: 'structured_data_reasoning',
    atomicCapabilities: ['relational_reasoning', 'table_understanding'],
  }),
  metric({
    slug: 'tablereformat',
    displayName: 'Table Reformat',
    sourceTask: 'tablereformat',
    category: 'data_analysis',
    expectedObservations: 50,
    taskType: 'structured_data_transformation',
    atomicCapabilities: ['format_conversion', 'table_understanding'],
  }),
  metric({
    slug: 'paraphrase',
    displayName: 'Paraphrase',
    sourceTask: 'paraphrase',
    category: 'instruction_following',
    expectedObservations: 50,
    taskType: 'constraint_following',
    atomicCapabilities: ['instruction_following', 'meaning_preservation'],
  }),
  metric({
    slug: 'simplify',
    displayName: 'Simplify',
    sourceTask: 'simplify',
    category: 'instruction_following',
    expectedObservations: 50,
    taskType: 'constraint_following',
    atomicCapabilities: ['instruction_following', 'controlled_generation'],
  }),
  metric({
    slug: 'story-generation',
    displayName: 'Story Generation',
    sourceTask: 'story_generation',
    category: 'instruction_following',
    expectedObservations: 50,
    taskType: 'constraint_following',
    atomicCapabilities: ['instruction_following', 'creative_constraints'],
  }),
  metric({
    slug: 'summarize',
    displayName: 'Summarize',
    sourceTask: 'summarize',
    category: 'instruction_following',
    expectedObservations: 50,
    taskType: 'constraint_following',
    atomicCapabilities: ['instruction_following', 'summarization'],
  }),
  metric({
    slug: 'connections',
    displayName: 'Connections',
    sourceTask: 'connections',
    category: 'language',
    expectedObservations: 50,
    taskType: 'language_understanding',
    atomicCapabilities: ['semantic_association', 'lexical_reasoning'],
  }),
  metric({
    slug: 'plot-unscrambling',
    displayName: 'Plot Unscrambling',
    sourceTask: 'plot_unscrambling',
    category: 'language',
    expectedObservations: 40,
    taskType: 'discourse_understanding',
    atomicCapabilities: ['narrative_coherence', 'text_ordering'],
  }),
  metric({
    slug: 'typos',
    displayName: 'Typos',
    sourceTask: 'typos',
    category: 'language',
    expectedObservations: 50,
    taskType: 'language_understanding',
    atomicCapabilities: ['error_detection', 'text_correction'],
  }),
  metric({
    slug: 'amps-hard',
    displayName: 'AMPS Hard',
    sourceTask: 'AMPS_Hard',
    category: 'math',
    expectedObservations: 100,
    taskType: 'mathematical_problem_solving',
    atomicCapabilities: ['algebra', 'multi_step_math'],
  }),
  metric({
    slug: 'math-comp',
    displayName: 'Math Competition',
    sourceTask: 'math_comp',
    category: 'math',
    expectedObservations: 96,
    taskType: 'mathematical_problem_solving',
    atomicCapabilities: ['competition_math', 'multi_step_math'],
  }),
  metric({
    slug: 'olympiad',
    displayName: 'Olympiad',
    sourceTask: 'olympiad',
    category: 'math',
    expectedObservations: 36,
    taskType: 'mathematical_proof',
    atomicCapabilities: ['olympiad_math', 'proof_reasoning'],
  }),
  metric({
    slug: 'spatial',
    displayName: 'Spatial',
    sourceTask: 'spatial',
    category: 'reasoning',
    expectedObservations: 50,
    taskType: 'abstract_reasoning',
    atomicCapabilities: ['spatial_reasoning', 'constraint_solving'],
  }),
  metric({
    slug: 'web-of-lies-v2',
    displayName: 'Web of Lies v2',
    sourceTask: 'web_of_lies_v2',
    category: 'reasoning',
    expectedObservations: 50,
    taskType: 'logical_reasoning',
    atomicCapabilities: ['deduction', 'consistency_reasoning'],
  }),
  metric({
    slug: 'zebra-puzzle',
    displayName: 'Zebra Puzzle',
    sourceTask: 'zebra_puzzle',
    category: 'reasoning',
    expectedObservations: 50,
    taskType: 'logical_reasoning',
    atomicCapabilities: ['constraint_satisfaction', 'deduction'],
  }),
] as const satisfies readonly LiveBenchMetricSeed[];

const liveBenchEvaluationConfig = {
  release: liveBenchBenchmarkSeed.version,
  inventoryContentSha256: liveBenchBenchmarkSeed.inventoryContentSha256,
  judge: 'official_livebench_ground_truth',
  harness: 'LiveBench',
  toolAccess: false,
  internetAccess: false,
  scoreScale: '0_to_1_per_observation_then_task_mean_percent',
} as const;

export const liveBenchEvaluationConfigSeed = {
  configHash: createHash('sha256')
    .update(JSON.stringify(liveBenchEvaluationConfig))
    .digest('hex'),
  displayName: 'LiveBench official judgments — 2024-11-25 release',
  evaluator: 'LiveBench',
  config: liveBenchEvaluationConfig,
} as const;

const categoryDimension: Record<LiveBenchCategory, DimensionId> = {
  reasoning: 'reasoning',
  math: 'math',
  coding: 'coding',
  language: 'language',
  data_analysis: 'reasoning',
  instruction_following: 'instruction',
};

const mappingRationale: Record<LiveBenchCategory, string> = {
  reasoning:
    'LiveBench reasoning tasks directly measure deduction, constraints and abstract multi-step reasoning.',
  math: 'LiveBench math tasks directly measure mathematical problem solving and proof-oriented reasoning.',
  coding:
    'LiveBench coding tasks directly measure generated program correctness and algorithmic implementation.',
  language:
    'LiveBench language tasks directly measure semantic, lexical and discourse-level text understanding.',
  data_analysis:
    'LiveBench data-analysis tasks primarily require multi-step relational and structured-data reasoning.',
  instruction_following:
    'LiveBench instruction-following tasks directly measure compliance with transformation and generation constraints.',
};

const mappedMetricCounts = liveBenchMetricSeeds.reduce(
  (counts, metricSeed) => {
    const dimensionId = categoryDimension[metricSeed.category];
    counts[dimensionId] = (counts[dimensionId] ?? 0) + 1;
    return counts;
  },
  {} as Partial<Record<DimensionId, number>>,
);
const mappedMetricOrdinals: Partial<Record<DimensionId, number>> = {};

export const liveBenchDimensionMappingSeeds = liveBenchMetricSeeds.map(
  (metricSeed) => {
    const dimensionId = categoryDimension[metricSeed.category];
    const metricCount = mappedMetricCounts[dimensionId];
    if (!metricCount) throw new Error('LiveBench mapping weight is undefined');
    const ordinal = mappedMetricOrdinals[dimensionId] ?? 0;
    mappedMetricOrdinals[dimensionId] = ordinal + 1;
    const baseWeightUnits = Math.floor(1_000_000 / metricCount);
    const finalRemainderUnits = 1_000_000 - baseWeightUnits * metricCount;
    const weightUnits =
      baseWeightUnits + (ordinal === metricCount - 1 ? finalRemainderUnits : 0);

    return {
      metricSlug: metricSeed.slug,
      dimensionId,
      weight: weightUnits / 1_000_000,
      normalization: {
        method: 'FIXED_PERCENTAGE_V1',
        direction: 'HIGHER_IS_BETTER',
        lowerAnchor: 0,
        upperAnchor: 100,
        clippingRule: 'CLAMP_0_100',
      },
      mapping: {
        primaryDimension: true,
        sourceCategory: metricSeed.category,
        secondaryDimensions: [],
        atomicCapabilities: metricSeed.atomicCapabilities,
        taskType: metricSeed.taskType,
        inputModality: ['text'],
        outputType: 'text',
        toolRequirement: 'none',
        judgeType: 'ground_truth',
        contaminationRisk: 'date_versioned',
        saturationStatus: 'unknown',
        freshnessStatus: 'pinned_release',
        rationale: mappingRationale[metricSeed.category],
      },
    } as const;
  },
);

export const scoringMethodSeed = {
  version: 'absolute-capability-v1',
  status: 'DRAFT',
  config: {
    dimensionWeights: Object.fromEntries(
      dimensionSeed.map(({ id }) => [id, 0.125]),
    ) as Record<DimensionId, number>,
    minimumFormalDimensionCoverage: 0.5,
    verifiedMinimumOverallCoverage: 0.65,
    verifiedMinimumIndependentSourceShare: 0.5,
    provisionalMinimumFormalDimensions: 6,
    provisionalMinimumOverallCoverage: 0.5,
    missingValuePolicy: 'NULL_NO_IMPUTATION',
    formalPublicationEnabled: false,
  },
  methodologyMarkdown:
    'Fixed-anchor task scores aggregate into eight equally weighted dimensions. Missing dimensions remain null; verified publication requires all eight formal dimensions and the configured coverage and independence gates.',
} as const;

export const themePresetSeed = [
  {
    slug: 'editorial-light',
    displayNameZhTw: '編輯室亮色',
    displayNameEn: 'Editorial Light',
    geometryVersion: 'radar-v1',
    tokens: {
      colorScheme: 'light',
      canvas: '#eef2f5',
      surface: '#ffffff',
      ink: '#17212b',
      muted: '#687684',
      accent: '#287fb8',
      comparison: '#d36b45',
      grid: '#cbd6de',
    },
  },
  {
    slug: 'studio-light',
    displayNameZhTw: '影像棚亮色',
    displayNameEn: 'Studio Light',
    geometryVersion: 'radar-v1',
    tokens: {
      colorScheme: 'light',
      canvas: '#e9eef2',
      surface: '#ffffff',
      ink: '#111820',
      muted: '#6e7781',
      accent: '#376aa5',
      comparison: '#d15c38',
      grid: '#c5d0d8',
    },
  },
] as const;
