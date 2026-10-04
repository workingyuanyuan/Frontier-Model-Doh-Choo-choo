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
  'frontiercode-extended': {
    version: '1.1',
    count: 35,
    benchmarkId: 'frontier-code-1-1',
    metricId: 'weighted-rubric-score',
    metricName: 'Weighted rubric score',
  },
} as const;
type ChartId = keyof typeof CHARTS;

const RELEASES: ReadonlyMap<
  string,
  { pageId: string | null; counts: Partial<Record<ChartId, number>> }
> = new Map([
  [SOURCE_URL, { pageId: null, counts: { deepswe: 15, automationbench: 21 } }],
  [
    'https://openai.com/zh-Hant/index/introducing-gpt-6-sol-and-luna/',
    {
      pageId: 'sol-luna',
      counts: { deepswe: 35, automationbench: 31, 'frontiercode-extended': 35 },
    },
  ],
  [
    'https://openai.com/zh-Hant/index/gpt-6-astra/',
    { pageId: 'astra', counts: { deepswe: 22, automationbench: 15 } },
  ],
  [
    'https://openai.com/zh-Hant/index/gpt-5-6/',
    { pageId: 'gpt56', counts: { deepswe: 33 } },
  ],
]);

// Source fractions are pinned so a historical conflict cannot silently change.
const REVIEWED_CONFLICTS: ReadonlyMap<string, number> = new Map([
  ['sol-luna:deepswe:GPT-5.6 Luna:low', 0.0122],
  ['sol-luna:deepswe:GPT-5.6 Luna:medium', 0.0929],
  ['sol-luna:deepswe:GPT-5.6 Luna:high', 0.4237],
  ['sol-luna:deepswe:GPT-5.6 Luna:xhigh', 0.5619],
  ['sol-luna:deepswe:GPT-5.6 Luna:max', 0.6217],
  ['astra:deepswe:GPT-6 Astra:max', 0.73],
  ['astra:automationbench:Claude Fable 5:max', 0.174],
  ['astra:automationbench:GPT-5.6 Sol:low', 0.096],
  ['astra:automationbench:GPT-5.6 Sol:medium', 0.126],
  ['astra:automationbench:GPT-5.6 Sol:high', 0.123],
  ['astra:automationbench:GPT-5.6 Sol:xhigh', 0.17],
  ['astra:automationbench:GPT-5.6 Sol:max', 0.181],
  ['gpt56:deepswe:Gemini 3.1 Pro Preview:high', 0.117517],
]);

const MODELS: ReadonlyMap<string, string> = new Map([
  ['GPT-6 Astra', 'openai-gpt-6-astra'],
  ['GPT-6 Sol', 'openai-gpt-6-sol'],
  ['GPT-6.1 Sol', 'openai-gpt-6-1-sol'],
  ['GPT-6 Luna', 'openai-gpt-6-luna'],
  ['GPT-5.6 Sol', 'openai-gpt-5-6-sol'],
  ['GPT-5.6 Terra', 'openai-gpt-5-6-terra'],
  ['GPT-5.6 Luna', 'openai-gpt-5-6-luna'],
  ['GPT-5.5', 'openai-gpt-5-5'],
  ['Claude Fable 5', 'anthropic-claude-fable-5'],
  ['Claude Fable 5.1', 'anthropic-claude-fable-5-1'],
  ['Claude Opus 5', 'anthropic-claude-opus-5'],
  ['Claude Opus 4.8', 'anthropic-claude-opus-4-8'],
  ['Gemini 3.8 Flash', 'google-gemini-3-8-flash'],
  ['Gemini 3.1 Pro Preview', 'google-gemini-3-1-pro-preview'],
]);
const EFFORTS = ['low', 'medium', 'high', 'xhigh', 'max', 'none'] as const;
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
  ['none', 'none'],
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
  const release =
    typeof capture.sourceUrl === 'string'
      ? RELEASES.get(capture.sourceUrl)
      : undefined;
  if (!release) {
    throw new Error('Invalid OpenAI capture sourceUrl');
  }
  const sourceUrl = capture.sourceUrl as string;
  if (release.pageId && capture.pageId !== release.pageId) {
    throw new Error('OpenAI release page identity drift');
  }
  const expectedChartIds = Object.keys(release.counts) as ChartId[];
  const versions = object(capture.chartVersions, 'chartVersions');
  if (
    Object.keys(versions).length !== expectedChartIds.length ||
    expectedChartIds.some((id) => versions[id] !== CHARTS[id].version)
  ) {
    throw new Error('OpenAI chart version drift');
  }
  if (
    !Array.isArray(capture.charts) ||
    capture.charts.length !== expectedChartIds.length
  ) {
    throw new Error('OpenAI capture requires exactly the approved charts');
  }

  const candidates: CandidateResult[] = [];
  const costs: CostRecord[] = [];
  const chartCounts: Record<string, number> = {};
  const seenCharts = new Set<ChartId>();
  for (const [chartIndex, chartValue] of capture.charts.entries()) {
    const chart = object(chartValue, `charts[${chartIndex}]`);
    if (
      typeof chart.id !== 'string' ||
      !expectedChartIds.includes(chart.id as ChartId)
    ) {
      throw new Error('Unexpected OpenAI chart');
    }
    const chartId = chart.id as ChartId;
    if (seenCharts.has(chartId)) throw new Error('Duplicate OpenAI chart');
    seenCharts.add(chartId);
    const definition = CHARTS[chartId];
    if (
      !Array.isArray(chart.values) ||
      chart.values.length !== release.counts[chartId]
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
      let expectedOrder = EFFORTS.indexOf(effort);
      if (release.pageId === 'gpt56')
        expectedOrder = effort === 'none' ? 0 : expectedOrder + 1;
      if (release.pageId === 'astra' && chartId === 'automationbench')
        expectedOrder += 1;
      if (release.pageId === 'astra' && model === 'Gemini 3.8 Flash')
        expectedOrder -= 1;
      if (
        release.pageId === 'sol-luna' &&
        /fallback|備援/iu.test(`${model} ${modelLabel}`)
      )
        expectedOrder = 0;
      if (
        typeof row.order !== 'number' ||
        !Number.isInteger(row.order) ||
        row.order !== expectedOrder
      ) {
        throw new Error(`OpenAI effort/order conflict at ${locator}`);
      }
      const score = number(row.score, `${locator}.score`, 1);
      const scorePercent = Math.round(score * 100 * 1e8) / 1e8;
      const cost = number(row.cost, `${locator}.cost`);
      if (release.pageId) {
        label(row.sourceLocator, `${locator}.sourceLocator`);
        const expectedPrecision =
          chartId === 'automationbench' || release.pageId === 'astra'
            ? 0.1
            : release.pageId === 'gpt56'
              ? 0.0001
              : chartId === 'frontiercode-extended' &&
                  !['GPT-6 Luna', 'GPT-6 Sol'].includes(model)
                ? 0.1
                : 0.01;
        if (row.scorePrecisionPercent !== expectedPrecision) {
          throw new Error(`OpenAI score precision drift at ${locator}`);
        }
        const raw = object(row.rawRow, `${locator}.rawRow`);
        if (raw.score !== score || (raw.cost ?? raw.x_value) !== cost) {
          throw new Error(
            `OpenAI source row/normalized value conflict at ${locator}`,
          );
        }
      }
      const conflictKey = `${release.pageId}:${chartId}:${model}:${effort}`;
      const conflictScore = REVIEWED_CONFLICTS.get(conflictKey);
      let reviewedExclusion: string | null = null;
      if (conflictScore !== undefined) {
        if (score !== conflictScore)
          throw new Error(`OpenAI reviewed conflict score drift at ${locator}`);
        const review = object(
          row.reviewExclusion,
          `${locator}.reviewExclusion`,
        );
        reviewedExclusion = label(
          review.reason,
          `${locator}.reviewExclusion.reason`,
        );
        label(review.referenceId, `${locator}.reviewExclusion.referenceId`);
        label(review.referenceUrl, `${locator}.reviewExclusion.referenceUrl`);
        number(
          review.referenceScore,
          `${locator}.reviewExclusion.referenceScore`,
          100,
        );
      } else if (row.reviewExclusion !== undefined) {
        throw new Error(`Unreviewed OpenAI exclusion at ${locator}`);
      }
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
          id: `openai-releases:${release.pageId ? `${release.pageId}:` : ''}${chartId}:${rowIndex}`,
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
          inclusion:
            canonicalModelId && !reviewedExclusion ? 'INCLUDED' : 'EXCLUDED',
          exclusionReason:
            reviewedExclusion ??
            (canonicalModelId
              ? null
              : fallback
                ? 'Multi-model fallback configuration; single-model identity unavailable'
                : 'Unknown or conflicting exact model identity'),
          sourceUrl,
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
            ...(release.pageId
              ? {
                  sourceLocator: provenance('sourceLocator', row.sourceLocator),
                  scorePrecisionPercent: provenance(
                    'scorePrecisionPercent',
                    row.scorePrecisionPercent,
                  ),
                  ...(reviewedExclusion
                    ? {
                        exclusionReason: provenance(
                          'reviewExclusion',
                          row.reviewExclusion,
                        ),
                      }
                    : {}),
                }
              : {}),
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
      `- Source: <${sourceUrl}>`,
      `- Evidence: ${context.evidenceId}`,
      `- Observed at: ${context.observedAt}`,
      '- Source role: VENDOR; acquisition status: PARTIAL_SOURCE.',
      `- Selected chart arrays: ${expectedChartIds.map((id) => `${id} ${CHARTS[id].version} (${release.counts[id]} rows)`).join(', ')}.`,
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

/** Each bounded page excerpt keeps its own evidence and actual observation time. */
export function materializeOpenAIReleaseCaptures(
  captures: Array<{
    captureText: string;
    context: { evidenceId: string; observedAt: string };
  }>,
): ReturnType<typeof materializeOpenAIRelease> {
  if (captures.length === 0)
    throw new Error('OpenAI release captures cannot be empty');
  const results = captures.map(({ captureText, context }) =>
    materializeOpenAIRelease(captureText, context),
  );
  const candidates = results.flatMap((result) => result.candidates);
  if (new Set(candidates.map((row) => row.id)).size !== candidates.length)
    throw new Error('Duplicate OpenAI release page');
  return {
    candidates: candidates.sort((a, b) => a.id.localeCompare(b.id)),
    costs: results
      .flatMap((result) => result.costs)
      .sort((a, b) => a.id.localeCompare(b.id)),
    validationReport: results
      .map((result) => result.validationReport)
      .join('\n'),
    chartCounts: Object.fromEntries(
      results.flatMap((result, index) =>
        Object.entries(result.chartCounts).map(([chart, count]) => [
          `${JSON.parse(captures[index]!.captureText).pageId ?? 'gpt61'}:${chart}`,
          count,
        ]),
      ),
    ),
  };
}
