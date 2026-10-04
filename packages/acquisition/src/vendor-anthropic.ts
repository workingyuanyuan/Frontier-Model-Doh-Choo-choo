import {
  CandidateResultSchema,
  type CandidateResult,
  type CostRecord,
} from '@llm-bench/benchmark-data';
import { materializeVendorTaskCost } from './vendor-costs.js';

import { resolveCatalogModel } from './materializer-utils.js';

export const ANTHROPIC_OPUS_5_5_RELEASE_URL =
  'https://www.anthropic.com/claude-opus-5-5';

const SOURCE_ID = 'anthropic-releases';
const SOURCE_PUBLISHED_AT = '2026-09-22T00:00:00.000Z';
const FRONTIER_CODE_CONFLICT = {
  benchmarkId: 'frontier-code-1-1',
  series: 'fable51',
  effort: 'low',
  anthropicScore: 52.8,
  organizerScore: 49.82,
  organizerUrl: 'https://cognition.com/frontiercode',
} as const;
const SOURCE_NOTE =
  'Anthropic states that Claude Opus 5.5 figures use adaptive thinking at max effort unless noted; each selected chart row has an explicit effort label. Claude Opus 5.5 was evaluated with production safeguards enabled; when they intervened, cybersecurity tasks were completed by Claude Opus 4.8, and biology and frontier LLM development tasks were completed by Claude Opus 5, which Anthropic says likely lowers these scores. The charts do not state a harness, so harness is unknown.';

interface AnthropicSeriesModel {
  rawName: string;
  expectedCanonicalModelId: string;
}

interface AnthropicChartDefinition {
  key: string;
  benchmarkId: string;
  benchmarkVersion: string;
  benchmarkMarker: string;
  metric: {
    id: string;
    name: string;
    unit: 'percent';
    higherIsBetter: true;
  };
  series: Readonly<Record<string, AnthropicSeriesModel>>;
}

interface AnthropicChartRow {
  series: string;
  cost: number;
  score: number;
  sourceEffort: string;
  effort: string;
  sourceRow: number;
}

export interface MaterializeAnthropicReleaseContext {
  evidenceId: string;
  observedAt: string;
}

export interface MaterializeAnthropicReleaseResult {
  candidates: CandidateResult[];
  costs: CostRecord[];
  validationReport: string;
  chartCounts: Record<string, number>;
}

const SERIES_MODELS: Readonly<Record<string, AnthropicSeriesModel>> = {
  opus55: {
    rawName: 'Claude Opus 5.5',
    expectedCanonicalModelId: 'anthropic-claude-opus-5-5',
  },
  fable51: {
    rawName: 'Claude Fable 5.1',
    expectedCanonicalModelId: 'anthropic-claude-fable-5-1',
  },
  opus5: {
    rawName: 'Claude Opus 5',
    expectedCanonicalModelId: 'anthropic-claude-opus-5',
  },
  gpt56sol: {
    rawName: 'GPT-5.6 Sol',
    expectedCanonicalModelId: 'openai-gpt-5-6-sol',
  },
  gpt6astra: {
    rawName: 'GPT-6 Astra',
    expectedCanonicalModelId: 'openai-gpt-6-astra',
  },
};

const CHARTS: readonly AnthropicChartDefinition[] = [
  {
    key: 'tuskchartfrontiercode',
    benchmarkId: 'frontier-code-1-1',
    benchmarkVersion: '1.1',
    benchmarkMarker: 'FrontierCode v1.1 (Main)',
    metric: {
      id: 'weighted-rubric-score',
      name: 'Weighted rubric score',
      unit: 'percent',
      higherIsBetter: true,
    },
    series: SERIES_MODELS,
  },
  {
    key: 'tuskchartcursorbench',
    benchmarkId: 'cursorbench-4',
    benchmarkVersion: '4.0',
    benchmarkMarker: 'CursorBench 4.0',
    metric: {
      id: 'accuracy',
      name: 'Accuracy',
      unit: 'percent',
      higherIsBetter: true,
    },
    series: {
      opus55: SERIES_MODELS.opus55!,
      fable51: SERIES_MODELS.fable51!,
      opus5: SERIES_MODELS.opus5!,
      gpt56sol: SERIES_MODELS.gpt56sol!,
    },
  },
];

const EFFORT_LABELS: Readonly<Record<string, string>> = {
  Low: 'low',
  Med: 'medium',
  High: 'high',
  Xhigh: 'xhigh',
  Max: 'max',
};

const EXPECTED_EFFORTS = ['low', 'medium', 'high', 'xhigh', 'max'] as const;
const CSV_HEADER = 'series,x,y,label,labelPlacement';

const exactCount = (text: string, value: string): number =>
  [
    ...text.matchAll(
      new RegExp(value.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&'), 'gu'),
    ),
  ].length;

function extractChartCsv(html: string, key: string): string {
  const markerIndex = html.indexOf(key);
  if (markerIndex < 0 || exactCount(html, key) !== 1) {
    throw new Error(
      `Expected exactly one Anthropic release chart key ${key}; found ${exactCount(html, key)}`,
    );
  }

  const nextChartIndex = html.indexOf('tuskchart', markerIndex + key.length);
  const csvStart = html.indexOf(CSV_HEADER, markerIndex + key.length);
  if (csvStart < 0 || (nextChartIndex >= 0 && csvStart > nextChartIndex)) {
    throw new Error(`Anthropic chart ${key} has no embedded CSV data`);
  }

  const csvEnd = html.indexOf('"', csvStart);
  if (csvEnd < 0 || (nextChartIndex >= 0 && csvEnd > nextChartIndex)) {
    throw new Error(`Anthropic chart ${key} CSV has no closing delimiter`);
  }

  let encodedCsv = html.slice(csvStart, csvEnd);
  // In the page's React Server Component payload, the CSV is itself nested in
  // a serialized string. The delimiter quote is escaped by one trailing slash.
  if (encodedCsv.endsWith('\\')) encodedCsv = encodedCsv.slice(0, -1);
  if (encodedCsv.includes('"')) {
    throw new Error(`Anthropic chart ${key} CSV contains an unexpected quote`);
  }

  // Decode only the RSC-escaped line separator. No script or embedded code is
  // evaluated while extracting the chart payload.
  return encodedCsv.replace(/\\\\n/gu, '\n');
}

function parseChartRows(
  csv: string,
  chart: AnthropicChartDefinition,
): AnthropicChartRow[] {
  const lines = csv.split(/\r?\n/u);
  if (lines[0] !== CSV_HEADER) {
    throw new Error(`Anthropic chart ${chart.key} CSV header changed`);
  }

  const rows: AnthropicChartRow[] = [];
  const seen = new Set<string>();
  const csvRows = lines.slice(1).filter((line) => line.length > 0);
  for (const [index, line] of csvRows.entries()) {
    const cells = line.split(',');
    if (cells.length !== 5) {
      throw new Error(
        `Anthropic chart ${chart.key} row ${index + 1} has ${cells.length} columns instead of 5`,
      );
    }
    const [series, costText, scoreText, sourceEffort, labelPlacement] = cells;
    if (!series || !sourceEffort || labelPlacement === undefined) {
      throw new Error(
        `Anthropic chart ${chart.key} row ${index + 1} is incomplete`,
      );
    }
    if (!Object.hasOwn(chart.series, series)) {
      throw new Error(
        `Unknown model series ${JSON.stringify(series)} in Anthropic chart ${chart.key}`,
      );
    }

    const effort = EFFORT_LABELS[sourceEffort];
    if (!effort) {
      throw new Error(
        `Unknown effort label ${JSON.stringify(sourceEffort)} in Anthropic chart ${chart.key}`,
      );
    }

    const numericText = /^(?:\d+(?:\.\d*)?|\.\d+)$/u;
    if (!numericText.test(costText ?? '')) {
      throw new Error(
        `Anthropic chart ${chart.key} row ${index + 1} has an invalid cost coordinate`,
      );
    }
    if (!numericText.test(scoreText ?? '')) {
      throw new Error(
        `Anthropic chart ${chart.key} row ${index + 1} has a missing or invalid score; blanks are not zero`,
      );
    }
    const cost = Number(costText);
    const score = Number(scoreText);
    if (!Number.isFinite(cost) || cost < 0) {
      throw new Error(
        `Anthropic chart ${chart.key} row ${index + 1} has an out-of-range cost coordinate`,
      );
    }
    if (!Number.isFinite(score) || score < 0 || score > 100) {
      throw new Error(
        `Anthropic chart ${chart.key} row ${index + 1} score must be between 0 and 100`,
      );
    }

    const configurationKey = `${series}:${effort}`;
    if (seen.has(configurationKey)) {
      throw new Error(
        `Duplicate model/effort row ${configurationKey} in Anthropic chart ${chart.key}`,
      );
    }
    seen.add(configurationKey);
    rows.push({
      series,
      cost,
      score,
      sourceEffort,
      effort,
      sourceRow: index + 1,
    });
  }

  const expected = Object.keys(chart.series).flatMap((series) =>
    EXPECTED_EFFORTS.map((effort) => `${series}:${effort}`),
  );
  const missing = expected.filter((key) => !seen.has(key));
  if (missing.length > 0) {
    throw new Error(
      `Anthropic chart ${chart.key} is missing expected model/effort rows: ${missing.join(', ')}`,
    );
  }
  if (rows.length !== expected.length) {
    throw new Error(
      `Anthropic chart ${chart.key} has ${rows.length} rows; expected ${expected.length}`,
    );
  }

  return rows;
}

function materializeChart(
  html: string,
  chart: AnthropicChartDefinition,
  context: MaterializeAnthropicReleaseContext,
  costs: CostRecord[],
): CandidateResult[] {
  if (!html.includes(chart.benchmarkMarker)) {
    throw new Error(
      `Anthropic release page is missing benchmark/version marker ${JSON.stringify(chart.benchmarkMarker)}`,
    );
  }

  const rows = parseChartRows(extractChartCsv(html, chart.key), chart);
  const chartStart = html.indexOf(chart.key);
  const chartEnd = html.indexOf('tuskchart', chartStart + chart.key.length);
  const chartPayload = html.slice(
    chartStart,
    chartEnd < 0 ? undefined : chartEnd,
  );
  if (!chartPayload.includes('Cost per task (USD, log scale)')) {
    throw new Error(
      `Anthropic chart ${chart.key} cost unit drift; expected USD per task axis`,
    );
  }

  if (chart.benchmarkId === FRONTIER_CODE_CONFLICT.benchmarkId) {
    const reviewedRow = rows.find(
      (row) =>
        row.series === FRONTIER_CODE_CONFLICT.series &&
        row.effort === FRONTIER_CODE_CONFLICT.effort,
    );
    if (
      !reviewedRow ||
      reviewedRow.score !== FRONTIER_CODE_CONFLICT.anthropicScore
    ) {
      throw new Error(
        `Reviewed Anthropic FrontierCode conflict row changed; expected ${FRONTIER_CODE_CONFLICT.series}/${FRONTIER_CODE_CONFLICT.effort}=${FRONTIER_CODE_CONFLICT.anthropicScore}; re-audit against ${FRONTIER_CODE_CONFLICT.organizerUrl}`,
      );
    }
  }

  return rows.map((row) => {
    const seriesModel = chart.series[row.series]!;
    const resolvedModel = resolveCatalogModel(seriesModel.rawName);
    if (
      resolvedModel.canonicalModelId !== seriesModel.expectedCanonicalModelId
    ) {
      throw new Error(
        `Anthropic series ${row.series} did not exactly resolve to catalog model ${seriesModel.expectedCanonicalModelId}`,
      );
    }

    const modelId = seriesModel.expectedCanonicalModelId;
    const isReviewedConflict =
      chart.benchmarkId === FRONTIER_CODE_CONFLICT.benchmarkId &&
      row.series === FRONTIER_CODE_CONFLICT.series &&
      row.effort === FRONTIER_CODE_CONFLICT.effort &&
      row.score === FRONTIER_CODE_CONFLICT.anthropicScore;
    const exclusionReason = isReviewedConflict
      ? `Known cross-source conflict: Anthropic reports ${FRONTIER_CODE_CONFLICT.anthropicScore}%, while Cognition's FrontierCode 1.1 leaderboard reports ${FRONTIER_CODE_CONFLICT.organizerScore}% for this row. Excluded pending configuration reconciliation. ${FRONTIER_CODE_CONFLICT.organizerUrl}`
      : null;
    const rowLocator = `RSC ${chart.key} CSV row ${row.sourceRow} (series=${row.series}, effort=${row.sourceEffort})`;
    const caveatLocator = `${rowLocator}; y is the plotted score percentage; ${SOURCE_NOTE}`;

    const candidate = CandidateResultSchema.parse({
      schemaVersion: 'candidate-result-v1',
      id: `${SOURCE_ID}:${chart.benchmarkId}:${row.series}-${row.effort}`,
      sourceId: SOURCE_ID,
      sourceRole: 'VENDOR',
      benchmarkId: chart.benchmarkId,
      benchmarkVersion: chart.benchmarkVersion,
      model: {
        rawName: seriesModel.rawName,
        canonicalModelId: modelId,
        profileId: `${modelId}-${row.effort}`,
      },
      profile: {
        effort: row.effort,
        thinking: null,
        tools: null,
        harness: null,
        contextWindowTokens: null,
        quantization: null,
        attempts: null,
      },
      metric: chart.metric,
      rawScore: row.score,
      normalizedScore: row.score,
      acquisitionStatus: 'PARTIAL_SOURCE',
      inclusion: isReviewedConflict ? 'EXCLUDED' : 'INCLUDED',
      exclusionReason,
      sourceUrl: ANTHROPIC_OPUS_5_5_RELEASE_URL,
      observedAt: context.observedAt,
      sourcePublishedAt: SOURCE_PUBLISHED_AT,
      evidenceIds: [context.evidenceId],
      provenance: {
        model: {
          evidenceId: context.evidenceId,
          locator: `${rowLocator}; explicit series-key mapping to ${seriesModel.rawName}`,
          method: 'NEXT_RSC',
        },
        profile: {
          evidenceId: context.evidenceId,
          locator: `${rowLocator}; effort taken from explicit CSV label`,
          method: 'NEXT_RSC',
        },
        rawScore: {
          evidenceId: context.evidenceId,
          locator: caveatLocator,
          method: 'NEXT_RSC',
        },
        cost: {
          evidenceId: context.evidenceId,
          locator: `${rowLocator}; x=${row.cost}; xAxis.label=Cost per task (USD, log scale)`,
          method: 'NEXT_RSC',
        },
      },
    });
    costs.push(
      materializeVendorTaskCost(
        candidate,
        row.cost,
        `RSC ${chart.key} xAxis.label=Cost per task (USD, log scale); ${rowLocator}`,
      ),
    );
    return candidate;
  });
}

export function materializeAnthropicRelease(
  html: string,
  context: MaterializeAnthropicReleaseContext,
): MaterializeAnthropicReleaseResult {
  if (
    !html.includes('Claude Opus 5.5') ||
    !html.includes('September 22, 2026')
  ) {
    throw new Error('Anthropic Claude Opus 5.5 release page marker is missing');
  }

  const chartCounts: Record<string, number> = {};
  const costs: CostRecord[] = [];
  const candidates = CHARTS.flatMap((chart) => {
    const rows = materializeChart(html, chart, context, costs);
    chartCounts[chart.key] = rows.length;
    return rows;
  }).sort((left, right) => left.id.localeCompare(right.id));

  if (new Set(candidates.map(({ id }) => id)).size !== candidates.length) {
    throw new Error('Duplicate candidate IDs in Anthropic release charts');
  }
  CandidateResultSchema.array().parse(candidates);

  return {
    candidates,
    costs: costs.sort((left, right) => left.id.localeCompare(right.id)),
    validationReport: [
      '# Anthropic release-page acquisition validation',
      '',
      `- Source: <${ANTHROPIC_OPUS_5_5_RELEASE_URL}> (published 2026-09-22).`,
      `- Evidence: \`${context.evidenceId}\``,
      `- Selected RSC charts: ${CHARTS.map(({ key }) => `\`${key}\` (${chartCounts[key]} rows)`).join('; ')}.`,
      '- Each selected chart has the expected benchmark/version marker and complete Low, Med, High, Xhigh, and Max rows for every extracted series.',
      '- The plotted y coordinate is retained as a percent score. The x coordinate is materialized as USD per task; the captured xAxis label specifies Cost per task (USD, log scale). Costs retain the score row identity and exclusions.',
      '- Explicit CSV effort labels are retained. The chart data does not name a harness, so harness is null.',
      `- The FrontierCode Fable 5.1 Low row is preserved at ${FRONTIER_CODE_CONFLICT.anthropicScore}% but excluded because Cognition reports ${FRONTIER_CODE_CONFLICT.organizerScore}% for the corresponding leaderboard row; re-audit the configuration before including it (<${FRONTIER_CODE_CONFLICT.organizerUrl}>).`,
      `- Source note preserved in row provenance: ${SOURCE_NOTE}`,
      '- This is a vendor-reported partial extraction of two release-page charts; separate organizer results remain separate evidence.',
      '',
    ].join('\n'),
    chartCounts,
  };
}
