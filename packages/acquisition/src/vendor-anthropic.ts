import {
  CandidateResultSchema,
  type CandidateResult,
  type CostRecord,
} from '@llm-bench/benchmark-data';
import { materializeVendorTaskCost } from './vendor-costs.js';

import { resolveCatalogModel } from './materializer-utils.js';

export const ANTHROPIC_OPUS_5_5_RELEASE_URL =
  'https://www.anthropic.com/claude-opus-5-5';
export const ANTHROPIC_SONNET_5_5_RELEASE_URL =
  'https://www.anthropic.com/claude-sonnet-5-5';
export const ANTHROPIC_FABLE_MYTHOS_5_1_RELEASE_URL =
  'https://www.anthropic.com/claude-fable-and-mythos-5-1';
export const ANTHROPIC_OPUS_5_RELEASE_URL =
  'https://www.anthropic.com/news/claude-opus-5';
export const ANTHROPIC_RELEASE_URLS = [
  ANTHROPIC_OPUS_5_5_RELEASE_URL,
  ANTHROPIC_SONNET_5_5_RELEASE_URL,
  ANTHROPIC_FABLE_MYTHOS_5_1_RELEASE_URL,
  ANTHROPIC_OPUS_5_RELEASE_URL,
] as const;

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
  benchmarkVersion: string | null;
  benchmarkMarker: string;
  metric: {
    id: string;
    name: string;
    unit: 'percent' | 'elo';
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

export interface AnthropicReleasePage extends MaterializeAnthropicReleaseContext {
  sourceUrl: string;
  text: string;
}

interface ReleaseMetadata {
  sourceUrl: string;
  publishedAt: string | null;
  idScope: string;
  note: string;
  exclusionReason?: string;
  tools?: Readonly<Record<string, boolean>>;
  costAxisLabel?: string;
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

    const effort =
      EFFORT_LABELS[sourceEffort] ??
      EFFORT_LABELS[sourceEffort[0]!.toUpperCase() + sourceEffort.slice(1)];
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
    if (
      !Number.isFinite(score) ||
      score < 0 ||
      (chart.metric.unit === 'percent' && score > 100)
    ) {
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

  return materializeReviewedRows(chart, rows, context, costs, {
    sourceUrl: ANTHROPIC_OPUS_5_5_RELEASE_URL,
    publishedAt: SOURCE_PUBLISHED_AT,
    idScope: '',
    note: SOURCE_NOTE,
  });
}

function materializeReviewedRows(
  chart: AnthropicChartDefinition,
  rows: AnthropicChartRow[],
  context: MaterializeAnthropicReleaseContext,
  costs: CostRecord[],
  release: ReleaseMetadata,
): CandidateResult[] {
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
      release.sourceUrl === ANTHROPIC_OPUS_5_5_RELEASE_URL &&
      chart.benchmarkId === FRONTIER_CODE_CONFLICT.benchmarkId &&
      row.series === FRONTIER_CODE_CONFLICT.series &&
      row.effort === FRONTIER_CODE_CONFLICT.effort &&
      row.score === FRONTIER_CODE_CONFLICT.anthropicScore;
    const exclusionReason =
      release.exclusionReason ??
      (isReviewedConflict
        ? `Known cross-source conflict: Anthropic reports ${FRONTIER_CODE_CONFLICT.anthropicScore}%, while Cognition's FrontierCode 1.1 leaderboard reports ${FRONTIER_CODE_CONFLICT.organizerScore}% for this row. Excluded pending configuration reconciliation. ${FRONTIER_CODE_CONFLICT.organizerUrl}`
        : null);
    const rowLocator = `RSC ${chart.key} CSV row ${row.sourceRow} (series=${row.series}, effort=${row.sourceEffort})`;
    const caveatLocator = `${rowLocator}; y is the plotted ${chart.metric.unit} score; ${release.note}`;

    const candidate = CandidateResultSchema.parse({
      schemaVersion: 'candidate-result-v1',
      id: `${SOURCE_ID}:${release.idScope}${chart.benchmarkId}:${row.series}-${row.effort}`,
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
        tools: release.tools?.[row.series] ?? null,
        harness: null,
        contextWindowTokens: null,
        quantization: null,
        attempts: null,
      },
      metric: chart.metric,
      rawScore: row.score,
      normalizedScore: chart.metric.unit === 'percent' ? row.score : null,
      acquisitionStatus: 'PARTIAL_SOURCE',
      inclusion: exclusionReason !== null ? 'EXCLUDED' : 'INCLUDED',
      exclusionReason,
      sourceUrl: release.sourceUrl,
      observedAt: context.observedAt,
      sourcePublishedAt: release.publishedAt,
      evidenceIds: [context.evidenceId],
      provenance: {
        model: {
          evidenceId: context.evidenceId,
          locator: `${rowLocator}; explicit series-key mapping to ${seriesModel.rawName}`,
          method: 'NEXT_RSC',
        },
        profile: {
          evidenceId: context.evidenceId,
          locator: `${rowLocator}; effort taken from explicit CSV label; tools=${release.tools?.[row.series] ?? 'unknown'}; ${release.note}`,
          method: 'NEXT_RSC',
        },
        rawScore: {
          evidenceId: context.evidenceId,
          locator: caveatLocator,
          method: 'NEXT_RSC',
        },
        cost: {
          evidenceId: context.evidenceId,
          locator: `${rowLocator}; x=${row.cost}; xAxis.label=${release.costAxisLabel ?? 'Cost per task (USD, log scale)'}`,
          method: 'NEXT_RSC',
        },
      },
    });
    costs.push(
      materializeVendorTaskCost(
        candidate,
        row.cost,
        `RSC ${chart.key} xAxis.label=${release.costAxisLabel ?? 'Cost per task (USD, log scale)'}; ${rowLocator}`,
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

export interface AnthropicEmbeddedChart {
  _key: string;
  _type: 'chart';
  title: string;
  data: string;
  series?: { id: string; name: string }[];
  xAxis?: { label: string };
  yAxis?: { label: string; format: string };
}

/** Parse serialized RSC values as data, without evaluating page scripts. */
export function extractAnthropicReleaseCharts(
  html: string,
): AnthropicEmbeddedChart[] {
  let payload = '';
  for (const match of html.matchAll(
    /<script[^>]*>self\.__next_f\.push\((\[[\s\S]*?\])\)<\/script>/gu,
  )) {
    const entry: unknown = JSON.parse(match[1]!);
    if (Array.isArray(entry) && typeof entry[1] === 'string')
      payload += entry[1];
  }
  const charts: AnthropicEmbeddedChart[] = [];
  const walk = (value: unknown): void => {
    if (Array.isArray(value)) {
      value.forEach(walk);
    } else if (value !== null && typeof value === 'object') {
      const object = value as Record<string, unknown>;
      if (object._type === 'chart') {
        if (
          typeof object._key !== 'string' ||
          typeof object.title !== 'string' ||
          typeof object.data !== 'string'
        ) {
          throw new Error('Anthropic embedded chart schema changed');
        }
        charts.push(object as unknown as AnthropicEmbeddedChart);
      }
      Object.values(object).forEach(walk);
    }
  };
  for (const line of payload.split('\n')) {
    const delimiter = line.indexOf(':');
    if (delimiter < 0) continue;
    let value: unknown;
    try {
      value = JSON.parse(line.slice(delimiter + 1));
    } catch {
      // RSC also carries non-JSON import/text records. Only JSON records count.
      continue;
    }
    walk(value);
  }
  return charts;
}

const SONNET_MODELS: Readonly<Record<string, AnthropicSeriesModel>> = {
  sonnet55: {
    rawName: 'Claude Sonnet 5.5',
    expectedCanonicalModelId: 'anthropic-claude-sonnet-5-5',
  },
  sonnet5: {
    rawName: 'Claude Sonnet 5',
    expectedCanonicalModelId: 'anthropic-claude-sonnet-5',
  },
  opus55: SERIES_MODELS.opus55!,
  gpt6sol: {
    rawName: 'GPT-6 Sol',
    expectedCanonicalModelId: 'openai-gpt-6-sol',
  },
};
const FABLE_5_MODEL: AnthropicSeriesModel = {
  rawName: 'Claude Fable 5',
  expectedCanonicalModelId: 'anthropic-claude-fable-5',
};
const FABLE_NOTE =
  'Fable 5.1 and Fable 5 were evaluated with production safeguards enabled. The page says cybersecurity interventions fall back to Claude Opus 4.8 and biology interventions to Claude Opus 5; these mixed-model HLE rows are excluded. The chart separates with-tools and no-tools series. No HLE dataset version or harness is stated. The displayed release date is September 2026, so no exact day is inferred.';
const SONNET_NOTE =
  'Each CSV row explicitly labels effort. Sonnet 5.5 FrontierCode Max (46.2%) is lower than Xhigh (52.1%); the footnote attributes this to code-review subagents causing timeouts or extra changes in two examined cases. The page discusses production cyber fallback to Sonnet 5; no per-task intervention counts are provided for these coding charts. No harness is named for each chart row. Sonnet 5.5 AA-Briefcase was run by Artificial Analysis on a pre-release deployment with a structured-output bug since fixed; GPT-6 Sol may predate an image-understanding fix.';

function materializeExpandedRelease(
  page: AnthropicReleasePage,
): MaterializeAnthropicReleaseResult {
  const isSonnet = page.sourceUrl === ANTHROPIC_SONNET_5_5_RELEASE_URL;
  const isFable = page.sourceUrl === ANTHROPIC_FABLE_MYTHOS_5_1_RELEASE_URL;
  if (!isSonnet && !isFable) {
    if (
      page.sourceUrl !== ANTHROPIC_OPUS_5_RELEASE_URL ||
      !page.text.includes('Introducing Claude Opus 5') ||
      !page.text.includes('Frontier-Bench v0.1')
    ) {
      throw new Error(
        `Unreviewed Anthropic release URL or page markers: ${page.sourceUrl}`,
      );
    }
    return {
      candidates: [],
      costs: [],
      chartCounts: {},
      validationReport: `# Claude Opus 5 release review\n\n- Source: <${page.sourceUrl}>.\n- Evidence: \`${page.evidenceId}\`.\n- Benchmark comparisons are raster images without exact embedded chart coordinates; research findings and quarantine are recorded in docs/research/anthropic-release-expansion.md.\n- Frontier-Bench v0.1 uses mini-SWE-agent, GKE, mean reward over five attempts, and Opus 4.8 fallback for Opus 5/Fable 5.\n`,
    };
  }
  if (
    !page.text.includes(isSonnet ? 'September 28, 2026' : 'September 2026') ||
    !page.text.includes(isSonnet ? 'Claude Sonnet 5.5' : 'Fable 5.1')
  ) {
    throw new Error(
      `Anthropic release identity/date marker is missing: ${page.sourceUrl}`,
    );
  }
  if (
    isFable &&
    (!page.text.includes(
      'cybersecurity tasks were completed by Claude Opus 4.8',
    ) ||
      !page.text.includes('biology tasks were completed by Claude Opus 5'))
  ) {
    throw new Error(
      'Anthropic Fable release fallback disclosure changed; re-audit exclusions',
    );
  }
  const embedded = extractAnthropicReleaseCharts(page.text);
  const percentMetric = {
    id: 'accuracy',
    name: 'Accuracy',
    unit: 'percent',
    higherIsBetter: true,
  } as const;
  const definitions: Omit<AnthropicChartDefinition, 'key'>[] = isSonnet
    ? [
        {
          ...CHARTS[0]!,
          benchmarkMarker: 'FrontierCode v1.1, main set',
          series: SONNET_MODELS,
        },
        {
          ...CHARTS[1]!,
          series: {
            sonnet55: SONNET_MODELS.sonnet55!,
            sonnet5: SONNET_MODELS.sonnet5!,
            opus55: SERIES_MODELS.opus55!,
            gpt56sol: SERIES_MODELS.gpt56sol!,
          },
        },
        {
          benchmarkId: 'aa-briefcase',
          benchmarkVersion: '1.1',
          benchmarkMarker: 'AA-Briefcase v1.1',
          metric: { id: 'elo', name: 'Elo', unit: 'elo', higherIsBetter: true },
          series: SONNET_MODELS,
        },
      ]
    : [
        {
          benchmarkId: 'humanitys-last-exam',
          benchmarkVersion: null,
          benchmarkMarker: "Humanity's Last Exam",
          metric: percentMetric,
          series: {
            f51tools: SERIES_MODELS.fable51!,
            f51notools: SERIES_MODELS.fable51!,
            f5tools: FABLE_5_MODEL,
            f5notools: FABLE_5_MODEL,
          },
        },
      ];
  const costs: CostRecord[] = [];
  const chartCounts: Record<string, number> = {};
  const candidates = definitions.flatMap((definition) => {
    const matching = embedded.filter(
      ({ title }) => title === definition.benchmarkMarker,
    );
    if (matching.length !== 1)
      throw new Error(
        `Expected exactly one Anthropic chart ${definition.benchmarkMarker}; found ${matching.length}`,
      );
    const chart = matching[0]!;
    const expectedAxis = isSonnet
      ? 'Cost per task (USD, log scale)'
      : 'Mean cost per task (USD, log scale)';
    if (chart.xAxis?.label !== expectedAxis)
      throw new Error(`Anthropic chart ${chart._key} cost unit drift`);
    if (
      chart.yAxis?.label !==
      (definition.metric.unit === 'elo'
        ? 'Elo'
        : isFable
          ? 'Pass rate (%)'
          : 'Score (%)')
    )
      throw new Error(`Anthropic chart ${chart._key} score metric drift`);
    const expectedSeries = Object.keys(definition.series).sort();
    if (
      JSON.stringify(chart.series?.map(({ id }) => id).sort()) !==
      JSON.stringify(expectedSeries)
    )
      throw new Error(`Anthropic chart ${chart._key} series mapping drift`);
    for (const series of chart.series!) {
      const expectedName = definition.series[series.id]!.rawName.replace(
        /^Claude /u,
        '',
      );
      if (series.name.replaceAll('**', '').split(' (')[0] !== expectedName)
        throw new Error(
          `Anthropic chart ${chart._key} model name drift: ${series.id}`,
        );
      if (
        isFable &&
        !series.name.endsWith(
          series.id.endsWith('notools') ? '(no tools)' : '(with tools)',
        )
      )
        throw new Error(
          `Anthropic chart ${chart._key} tools mapping drift: ${series.id}`,
        );
    }
    const reviewed = { ...definition, key: chart._key };
    const rows = parseChartRows(chart.data, reviewed);
    chartCounts[chart._key] = rows.length;
    const exclusionReason = isFable
      ? 'Mixed-model fallback: HLE safeguards may route cybersecurity tasks to Claude Opus 4.8 and biology tasks to Claude Opus 5; no per-row intervention counts or dataset version are disclosed.'
      : definition.metric.unit === 'elo'
        ? 'AA-Briefcase v1.1 Elo is not the rubric pass-rate metric used by this project; no approved Elo normalization.'
        : undefined;
    const materialized = materializeReviewedRows(reviewed, rows, page, costs, {
      sourceUrl: page.sourceUrl,
      publishedAt: isSonnet ? '2026-09-28T00:00:00.000Z' : null,
      idScope: isSonnet ? 'sonnet-5-5:' : 'fable-mythos-5-1:',
      note: isSonnet ? SONNET_NOTE : FABLE_NOTE,
      costAxisLabel: expectedAxis,
      ...(exclusionReason ? { exclusionReason } : {}),
      ...(isFable
        ? {
            tools: {
              f51tools: true,
              f5tools: true,
              f51notools: false,
              f5notools: false,
            },
          }
        : {}),
    });
    return materialized;
  });
  return {
    candidates,
    costs,
    chartCounts,
    validationReport: `# Anthropic expanded release acquisition\n\n- Source: <${page.sourceUrl}>.\n- Evidence: \`${page.evidenceId}\`.\n- Selected charts: ${Object.entries(
      chartCounts,
    )
      .map(([key, count]) => `${key} (${count} rows)`)
      .join(
        '; ',
      )}.\n- Included: ${candidates.filter(({ inclusion }) => inclusion === 'INCLUDED').length}; excluded: ${candidates.filter(({ inclusion }) => inclusion === 'EXCLUDED').length}.\n- Explicit effort labels, tools configuration, chart score units, task-cost units, and source notes are retained in provenance.\n- ${isSonnet ? SONNET_NOTE : FABLE_NOTE}\n- Full page findings and chart quarantine: docs/research/anthropic-release-expansion.md.\n`,
  };
}

/** Page identity remains part of every candidate ID and its evidence lineage. */
export function materializeAnthropicReleases(
  pages: readonly AnthropicReleasePage[],
): MaterializeAnthropicReleaseResult {
  if (pages.length === 0) throw new Error('No Anthropic release pages');
  if (new Set(pages.map(({ sourceUrl }) => sourceUrl)).size !== pages.length)
    throw new Error('Duplicate Anthropic release URL');
  const results = pages.map((page) =>
    page.sourceUrl === ANTHROPIC_OPUS_5_5_RELEASE_URL
      ? materializeAnthropicRelease(page.text, page)
      : materializeExpandedRelease(page),
  );
  const candidates = results
    .flatMap(({ candidates }) => candidates)
    .sort((a, b) => a.id.localeCompare(b.id));
  if (new Set(candidates.map(({ id }) => id)).size !== candidates.length)
    throw new Error('Duplicate Anthropic candidate IDs');
  return {
    candidates,
    costs: results
      .flatMap(({ costs }) => costs)
      .sort((a, b) => a.id.localeCompare(b.id)),
    chartCounts: Object.assign(
      {},
      ...results.map(({ chartCounts }) => chartCounts),
    ),
    validationReport: results
      .map(({ validationReport }) => validationReport)
      .join('\n'),
  };
}
