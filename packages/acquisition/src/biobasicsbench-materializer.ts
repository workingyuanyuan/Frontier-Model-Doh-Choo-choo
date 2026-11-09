import {
  CandidateResultSchema,
  type CandidateResult,
} from '@llm-bench/benchmark-data';

export const BIOBASICS_PAGE_URL =
  'https://openai.com/index/measuring-how-ai-agents-handle-wet-lab-science/';

const MODELS = new Map([
  ['GPT-5.2', 'openai-gpt-5-2'],
  ['GPT-5.4', 'openai-gpt-5-4'],
  ['GPT-5.5', 'openai-gpt-5-5'],
  ['GPT-5.6 Sol', 'openai-gpt-5-6-sol'],
  ['GPT-6.1 Sol', 'openai-gpt-6-1-sol'],
  ['GPT-6 Luna', 'openai-gpt-6-luna'],
  ['GPT-6 Astra', 'openai-gpt-6-astra'],
]);
const EFFORTS = ['none', 'low', 'medium', 'high', 'xhigh', 'max'];
const COLUMNS = [
  'model_label',
  'effort_label',
  'effort_order',
  'mean_credit_pct',
  'mean_output_tokens_per_problem',
  'ci95_lower_pct',
  'ci95_upper_pct',
];
const PRINTED_COLUMNS = [
  'model_label',
  'mean_credit_pct',
  'ci95_lower_pct',
  'ci95_upper_pct',
  'mean_output_tokens_per_problem',
];

function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error('Invalid BioBasicsBench capture object');
  return value as Record<string, unknown>;
}

function numeric(value: unknown, maximum = Infinity): number {
  if (
    typeof value !== 'number' ||
    !Number.isFinite(value) ||
    value < 0 ||
    value > maximum
  )
    throw new Error('Invalid BioBasicsBench numeric field');
  return value;
}

export function materializeBioBasicsBench(
  captureText: string,
  context: { evidenceId: string; observedAt: string },
): { candidates: CandidateResult[]; validationReport: string } {
  const capture = object(JSON.parse(captureText) as unknown);
  if (
    capture.schemaVersion !== 'biobasicsbench-browser-capture-v1' ||
    capture.sourceUrl !== BIOBASICS_PAGE_URL ||
    capture.chartId !== 'biobasicsbench-model-performance' ||
    capture.observedAt !== context.observedAt ||
    capture.publicationDate !== '2026-11-06' ||
    capture.tasks !== 100 ||
    capture.attemptsPerTask !== 5 ||
    capture.settings !== 37 ||
    capture.totalResults !== 18500 ||
    JSON.stringify(capture.columns) !== JSON.stringify(COLUMNS) ||
    JSON.stringify(capture.printedXhighColumns) !==
      JSON.stringify(PRINTED_COLUMNS)
  )
    throw new Error('BioBasicsBench capture identity or methodology drift');
  if (!Array.isArray(capture.values) || capture.values.length !== 37)
    throw new Error('BioBasicsBench requires all 37 settings');
  if (
    !Array.isArray(capture.printedXhighRows) ||
    capture.printedXhighRows.length !== 7
  )
    throw new Error('BioBasicsBench requires seven printed xhigh rows');

  const printed = new Map<string, number[]>();
  for (const value of capture.printedXhighRows) {
    if (
      !Array.isArray(value) ||
      value.length !== 5 ||
      typeof value[0] !== 'string' ||
      !MODELS.has(value[0]) ||
      printed.has(value[0])
    )
      throw new Error('Invalid or duplicate BioBasicsBench printed row');
    printed.set(
      value[0],
      value.slice(1).map((item) => numeric(item)),
    );
  }

  const seen = new Set<string>();
  const candidates = capture.values.map((value, index) => {
    if (
      !Array.isArray(value) ||
      value.length !== COLUMNS.length ||
      typeof value[0] !== 'string' ||
      typeof value[1] !== 'string' ||
      !MODELS.has(value[0]) ||
      !EFFORTS.includes(value[1]) ||
      value[2] !== EFFORTS.indexOf(value[1])
    )
      throw new Error('Invalid BioBasicsBench model or effort');
    const [model, effort] = value as [string, string, ...unknown[]];
    const canonicalModelId = MODELS.get(model)!;
    const key = `${canonicalModelId}-${effort}`;
    if (seen.has(key)) throw new Error('Duplicate BioBasicsBench model/effort');
    seen.add(key);
    const score = numeric(value[3], 100);
    const tokens = numeric(value[4]);
    const lower = numeric(value[5], 100);
    const upper = numeric(value[6], 100);
    if (tokens === 0 || lower > score || upper < score)
      throw new Error(
        'Invalid BioBasicsBench token count or confidence interval',
      );
    if (effort === 'xhigh') {
      const expected = printed.get(model);
      const actual = [
        Math.round(score * 10) / 10,
        Math.round(lower * 10) / 10,
        Math.round(upper * 10) / 10,
        Math.round(tokens),
      ];
      if (JSON.stringify(expected) !== JSON.stringify(actual))
        throw new Error(
          'BioBasicsBench chart and printed xhigh table disagree',
        );
    }
    const field = (column: number) => ({
      evidenceId: context.evidenceId,
      method: 'DOM' as const,
      locator: `$.values[${index}][${column}] (${COLUMNS[column]}); official chart linkId=biobasicsbench-model-performance, vegaLiteSpec.data.values[${index}].${COLUMNS[column]}`,
    });
    return CandidateResultSchema.parse({
      schemaVersion: 'candidate-result-v1',
      id: `biobasicsbench:${key}`,
      sourceId: 'biobasicsbench',
      sourceRole: 'VENDOR',
      benchmarkId: 'biobasicsbench',
      benchmarkVersion: null,
      model: { rawName: model, canonicalModelId, profileId: key },
      profile: {
        effort,
        thinking: null,
        tools: null,
        harness: null,
        contextWindowTokens: null,
        quantization: null,
        attempts: 5,
      },
      metric: {
        id: 'mean-reward',
        name: 'Mean reward',
        unit: 'percent',
        higherIsBetter: true,
      },
      rawScore: score,
      normalizedScore: Math.round(score * 1e8) / 1e8,
      acquisitionStatus: 'PARTIAL_SOURCE',
      inclusion: 'INCLUDED',
      exclusionReason: null,
      sourceUrl: BIOBASICS_PAGE_URL,
      observedAt: context.observedAt,
      sourcePublishedAt: null,
      evidenceIds: [context.evidenceId],
      provenance: {
        rawScore: field(3),
        'model.rawName': field(0),
        'profile.effort': field(1),
        effortOrder: field(2),
        outputTokensPerTask: field(4),
        confidenceIntervalLower: field(5),
        confidenceIntervalUpper: field(6),
        'profile.attempts': {
          evidenceId: context.evidenceId,
          method: 'DOM',
          locator:
            '$.attemptsPerTask; official Results paragraph, five attempts per task',
        },
        publicationDate: {
          evidenceId: context.evidenceId,
          method: 'DOM',
          locator:
            '$.publicationDate; official page date 2026-11-06, exact publication time unpublished',
        },
      },
    });
  });
  const expected = [...MODELS.entries()].flatMap(([model, id]) => {
    const efforts =
      model === 'GPT-6.1 Sol' || model === 'GPT-6 Astra'
        ? EFFORTS.slice(1)
        : model === 'GPT-5.6 Sol' || model === 'GPT-6 Luna'
          ? EFFORTS
          : EFFORTS.slice(0, 5);
    return efforts.map((effort) => `${id}-${effort}`);
  });
  if (expected.some((key) => !seen.has(key)))
    throw new Error('BioBasicsBench model/effort coverage drift');

  return {
    candidates,
    validationReport: [
      '# BioBasicsBench validation',
      '',
      `Observed ${context.observedAt}.`,
      '',
      'OpenAI co-developed BioBasicsBench with Ligo and published its own model evaluations as benchmark co-organizer. These self-reported model results are classified VENDOR and do not count as independent organizations for frontier eligibility. The publication date is 2026-11-06, with no exact publication time disclosed. The complete chart has 37 model/effort settings across seven models. Each setting covers 100 tasks with five attempts, yielding 18,500 results. All seven xhigh chart points match the separately printed score, confidence interval and output-token table after its published rounding.',
      '',
      'Mean reward is the average percentage of task rubric credit. Scores remain on the published 0–100 scale. Five attempts describe repeated trials. The metric is mean rubric reward.',
      '',
      'The evidence artifact is a bounded normalized transcription of the loaded official DOM/RSC chart and printed table. PARTIAL_SOURCE records that acquisition boundary. It is not an HTTP response body or a full task-level export.',
      '',
      'The benchmark version, dated model checkpoints, harness, tools, context window, quantization and grader are unpublished. They remain null. Exact published model names map to existing canonical identities. Source effort none is retained for the product effort policy.',
      '',
      'The chart x-axis is average output tokens per task. No dollar task cost, input-token count or token-pricing assumptions are supplied. costs.json is empty.',
      '',
      'Confidence intervals use whole-task bootstrap resampling with the five attempts kept together. Confidence bounds and average output tokens are preserved in the capture and field provenance.',
      '',
    ].join('\n'),
  };
}
