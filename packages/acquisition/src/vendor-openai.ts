import {
  CandidateResultSchema,
  type CandidateResult,
  type CostRecord,
} from '@llm-bench/benchmark-data';
import { materializeVendorTaskCost } from './vendor-costs.js';

const SOURCE_URL = 'https://openai.com/zh-Hant/index/introducing-gpt-6-1-sol/';
const CHARTS = {
  deepswe: {
    version: '1.1',
    count: 15,
    benchmarkId: 'deepswe-1-1',
    metricId: 'pass-at-1',
    metricName: 'Pass@1',
  },
  automationbench: {
    version: '1.0.6',
    count: 21,
    benchmarkId: 'automationbench',
    metricId: 'task-completed-correctly',
    metricName: 'Task completed correctly',
  },
} as const;
type ChartId = keyof typeof CHARTS;

const MODELS: ReadonlyMap<string, string> = new Map([
  ['GPT-6 Astra', 'openai-gpt-6-astra'],
  ['GPT-6 Sol', 'openai-gpt-6-sol'],
  ['GPT-6.1 Sol', 'openai-gpt-6-1-sol'],
]);
const EFFORTS = ['low', 'medium', 'high', 'xhigh', 'max'] as const;
const EFFORT_LABELS: ReadonlyMap<string, (typeof EFFORTS)[number]> = new Map([
  ['低', 'low'],
  ['中', 'medium'],
  ['高', 'high'],
  ['極高', 'xhigh'],
  ['low', 'low'],
  ['medium', 'medium'],
  ['high', 'high'],
  ['xhigh', 'xhigh'],
  ['extra high', 'xhigh'],
  ['max', 'max'],
]);

function object(value: unknown, field: string): Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`Invalid OpenAI capture ${field}: expected an object`);
  }
  return value as Record<string, unknown>;
}

function label(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(
      `Invalid OpenAI capture ${field}: expected a nonempty label`,
    );
  }
  return value;
}

function number(value: unknown, field: string, maximum?: number): number {
  if (
    typeof value !== 'number' ||
    !Number.isFinite(value) ||
    value < 0 ||
    (maximum !== undefined && value > maximum)
  ) {
    throw new Error(
      `Invalid OpenAI capture ${field}: numeric value out of range`,
    );
  }
  return value;
}

export function materializeOpenAIRelease(
  captureText: string,
  context: { evidenceId: string; observedAt: string },
): {
  candidates: CandidateResult[];
  costs: CostRecord[];
  validationReport: string;
  chartCounts: Record<string, number>;
} {
  const capture = object(JSON.parse(captureText) as unknown, 'root');
  if (capture.schemaVersion !== 'vendor-chart-capture-v1') {
    throw new Error('Invalid OpenAI capture schemaVersion');
  }
  if (capture.sourceUrl !== SOURCE_URL) {
    throw new Error('Invalid OpenAI capture sourceUrl');
  }
  const versions = object(capture.chartVersions, 'chartVersions');
  if (
    Object.keys(versions).length !== 2 ||
    Object.entries(CHARTS).some(([id, chart]) => versions[id] !== chart.version)
  ) {
    throw new Error('OpenAI chart version drift');
  }
  if (!Array.isArray(capture.charts) || capture.charts.length !== 2) {
    throw new Error('OpenAI capture requires exactly the two approved charts');
  }

  const candidates: CandidateResult[] = [];
  const costs: CostRecord[] = [];
  const chartCounts: Record<string, number> = {};
  const seenCharts = new Set<ChartId>();
  for (const [chartIndex, chartValue] of capture.charts.entries()) {
    const chart = object(chartValue, `charts[${chartIndex}]`);
    if (chart.id !== 'deepswe' && chart.id !== 'automationbench') {
      throw new Error('Unexpected OpenAI chart');
    }
    const chartId = chart.id;
    if (seenCharts.has(chartId)) throw new Error('Duplicate OpenAI chart');
    seenCharts.add(chartId);
    const definition = CHARTS[chartId];
    if (
      !Array.isArray(chart.values) ||
      chart.values.length !== definition.count
    ) {
      throw new Error(`OpenAI ${chartId} row count drift`);
    }
    chartCounts[chartId] = chart.values.length;
    const seenRows = new Set<string>();

    for (const [rowIndex, rowValue] of chart.values.entries()) {
      const locator = `$.charts[${chartIndex}].values[${rowIndex}]`;
      const row = object(rowValue, locator);
      const model = label(row.model, `${locator}.model`);
      const modelLabel = label(row.modelLabel, `${locator}.modelLabel`);
      const effortLabel = label(row.effortLabel, `${locator}.effortLabel`);
      const effort = EFFORT_LABELS.get(effortLabel.trim().toLowerCase());
      if (effort === undefined) {
        throw new Error(`Unknown OpenAI effort label: ${effortLabel}`);
      }
      if (
        typeof row.order !== 'number' ||
        !Number.isInteger(row.order) ||
        row.order !== EFFORTS.indexOf(effort)
      ) {
        throw new Error(`OpenAI effort/order conflict at ${locator}`);
      }
      const score = number(row.score, `${locator}.score`, 1);
      const scorePercent = Math.round(score * 100 * 1e8) / 1e8;
      const cost = number(row.cost, `${locator}.cost`);
      const fallback = /\bfallbacks?\b|備援/iu.test(`${model} ${modelLabel}`);
      const mappedModel = MODELS.get(model);
      const canonicalModelId =
        !fallback && mappedModel && MODELS.get(modelLabel) === mappedModel
          ? mappedModel
          : null;
      const rowKey = JSON.stringify([canonicalModelId ?? model, effort]);
      if (seenRows.has(rowKey)) {
        throw new Error(`Duplicate OpenAI model/effort at ${locator}`);
      }
      seenRows.add(rowKey);

      const provenance = (field: string, value: unknown) => ({
        evidenceId: context.evidenceId,
        method: 'DOM' as const,
        locator: `${locator}.${field}; captured=${JSON.stringify(value)}`,
      });
      candidates.push(
        CandidateResultSchema.parse({
          schemaVersion: 'candidate-result-v1',
          id: `openai-releases:${chartId}:${rowIndex}`,
          sourceId: 'openai-releases',
          sourceRole: 'VENDOR',
          benchmarkId: definition.benchmarkId,
          benchmarkVersion: definition.version,
          model: {
            rawName: modelLabel,
            canonicalModelId,
            profileId: canonicalModelId
              ? `${canonicalModelId}-${effort}`
              : null,
          },
          profile: {
            effort,
            thinking: null,
            tools: null,
            harness: null,
            contextWindowTokens: null,
            quantization: null,
            attempts: null,
          },
          metric: {
            id: definition.metricId,
            name: definition.metricName,
            unit: 'percent',
            higherIsBetter: true,
          },
          rawScore: scorePercent,
          normalizedScore: scorePercent,
          acquisitionStatus: 'PARTIAL_SOURCE',
          inclusion: canonicalModelId ? 'INCLUDED' : 'EXCLUDED',
          exclusionReason: canonicalModelId
            ? null
            : fallback
              ? 'Multi-model fallback configuration; single-model identity unavailable'
              : 'Unknown or conflicting exact model identity',
          sourceUrl: SOURCE_URL,
          observedAt: context.observedAt,
          sourcePublishedAt: null,
          evidenceIds: [context.evidenceId],
          provenance: {
            rawScore: {
              ...provenance('score', score),
              locator: `${locator}.score; captured=${JSON.stringify(score)}; fraction * 100 = ${scorePercent} percent`,
            },
            'model.rawName': provenance('modelLabel', modelLabel),
            model: provenance('model', model),
            'profile.effort': provenance('effortLabel', effortLabel),
            effortOrder: provenance('order', row.order),
            cost: provenance('cost', cost),
            benchmarkVersion: {
              evidenceId: context.evidenceId,
              method: 'DOM',
              locator: `$.chartVersions.${chartId}; captured=${JSON.stringify(definition.version)}`,
            },
            'profile.harness': {
              evidenceId: context.evidenceId,
              method: 'DOM',
              locator: `${locator}; harness not specified by release`,
            },
          },
        }),
      );
      costs.push(
        materializeVendorTaskCost(
          candidates.at(-1)!,
          cost,
          `Reviewed ${chartId} ${definition.version} release chart cost axis: USD per task; $.charts[${chartIndex}].values[${rowIndex}].cost`,
        ),
      );
    }
  }

  const excluded = candidates.filter(
    ({ inclusion }) => inclusion === 'EXCLUDED',
  );
  return {
    candidates: candidates.sort((left, right) =>
      left.id.localeCompare(right.id),
    ),
    chartCounts,
    costs: costs.sort((left, right) => left.id.localeCompare(right.id)),
    validationReport: [
      '# OpenAI release chart acquisition validation',
      '',
      `- Source: <${SOURCE_URL}>`,
      `- Evidence: ${context.evidenceId}`,
      `- Observed at: ${context.observedAt}`,
      '- Source role: VENDOR; acquisition status: PARTIAL_SOURCE.',
      '- Selected chart arrays: DeepSWE 1.1 (15 rows), AutomationBench 1.0.6 (21 rows).',
      `- Included: ${candidates.length - excluded.length}; excluded: ${excluded.length}.`,
      '- Raw and normalized scores use percentages; provenance preserves the source fraction and multiplication by 100. Explicit effort labels agree with chart order.',
      '- Chart costs are materialized as USD per task with the same benchmark version, model, effort, and exclusions as each score row. Cost and unit provenance retain the chart locator.',
      ...excluded.map(
        ({ model, exclusionReason }) =>
          `- Excluded ${model.rawName}: ${exclusionReason}.`,
      ),
      '',
    ].join('\n'),
  };
}
