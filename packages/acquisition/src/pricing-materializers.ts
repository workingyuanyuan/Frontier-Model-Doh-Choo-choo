import { CostRecordSchema, type CostRecord } from '@llm-bench/benchmark-data';
import { DEEPSWE_MODELS } from './deepswe-materializer.js';
import { normalizeSourceEffort } from './materializer-utils.js';

type Identity = { modelId: string; effort: string | null };

const AA_MODELS: Record<string, Identity> = {
  'DeepSeek V4 Pro (max)': {
    modelId: 'deepseek-deepseek-v4-pro',
    effort: 'max',
  },
  'MiniMax-M3': { modelId: 'minimax-minimax-m3', effort: 'max' },
  'Nemotron 3 Ultra': { modelId: 'nvidia-nemotron-3-ultra', effort: 'max' },
  'Muse Spark 1.1 (xhigh)': { modelId: 'meta-muse-spark-1-1', effort: 'xhigh' },
  'Grok 4.5 (high)': { modelId: 'xai-grok-4-5', effort: 'high' },
  'GLM-5.2 (max)': { modelId: 'zai-glm-5-2', effort: 'max' },
  'Gemini 3.5 Flash': { modelId: 'google-gemini-3-5-flash', effort: 'high' },
  'GPT-5.6 Sol (max)': { modelId: 'openai-gpt-5-6-sol', effort: 'max' },
  'Claude Fable 5 (with fallback)': {
    modelId: 'anthropic-claude-fable-5',
    effort: 'max',
  },
};

const LIVEBENCH_MODELS: Record<string, Identity> = {
  'deepseek-v4-flash': { modelId: 'deepseek-deepseek-v4-flash', effort: 'max' },
  'deepseek-v4-pro': { modelId: 'deepseek-deepseek-v4-pro', effort: 'max' },
  'minimax-m3': { modelId: 'minimax-minimax-m3', effort: 'max' },
  'kimi-k2.6-thinking': { modelId: 'moonshot-kimi-k2-6', effort: 'max' },
  'qwen3.7-max': { modelId: 'alibaba-qwen3-7-max', effort: 'max' },
  'glm-5.2': { modelId: 'zai-glm-5-2', effort: 'max' },
  'gpt-5.2-2025-12-11-high': { modelId: 'openai-gpt-5-2', effort: 'high' },
  'gemini-3.5-flash-high': {
    modelId: 'google-gemini-3-5-flash',
    effort: 'high',
  },
  'gemini-3.1-pro-preview-high': {
    modelId: 'google-gemini-3-1-pro-preview',
    effort: 'high',
  },
  'claude-sonnet-4-6-thinking-auto-medium-effort': {
    modelId: 'anthropic-claude-sonnet-4-6',
    effort: 'medium',
  },
  'gpt-5.4-mini-xhigh': { modelId: 'openai-gpt-5-4-mini', effort: 'xhigh' },
  'claude-opus-4-6-thinking-auto-high-effort': {
    modelId: 'anthropic-claude-opus-4-6',
    effort: 'high',
  },
  'claude-opus-4-7-xhigh-effort': {
    modelId: 'anthropic-claude-opus-4-7',
    effort: 'xhigh',
  },
  'claude-sonnet-5-xhigh-effort': {
    modelId: 'anthropic-claude-sonnet-5',
    effort: 'xhigh',
  },
  'gpt-5.4-xhigh': { modelId: 'openai-gpt-5-4', effort: 'xhigh' },
  'gpt-5.5-xhigh': { modelId: 'openai-gpt-5-5', effort: 'xhigh' },
  'gpt-5.6-sol-max': { modelId: 'openai-gpt-5-6-sol', effort: 'max' },
  'gpt-5.6-terra-max': { modelId: 'openai-gpt-5-6-terra', effort: 'max' },
  'gpt-5.6-luna-max': { modelId: 'openai-gpt-5-6-luna', effort: 'max' },
  'grok-4.5': { modelId: 'xai-grok-4-5', effort: 'high' },
  'claude-fable-5-max-effort': {
    modelId: 'anthropic-claude-fable-5',
    effort: 'max',
  },
  'muse-spark-1.1-xhigh': { modelId: 'meta-muse-spark-1-1', effort: 'xhigh' },
  'inkling-xhigh': { modelId: 'thinking-machines-inkling', effort: 'xhigh' },
  'claude-opus-4-8-max-effort': {
    modelId: 'anthropic-claude-opus-4-8',
    effort: 'max',
  },
};

interface Context {
  sourceId: string;
  sourceUrl: string;
  evidenceId: string;
  observedAt: string;
  benchmarkId: string | null;
  benchmarkVersion: string | null;
  method: CostRecord['provenance'][string]['method'];
}

const makeRecord = (
  context: Context,
  rawName: string,
  identity: Identity,
  options: {
    suffix: string;
    costType: CostRecord['costType'];
    metricId: string;
    metricName: string;
    unit: CostRecord['unit'];
    cost: number | null;
    input: number | null;
    output: number | null;
    assumptionId: string | null;
    locator: string;
    harness?: string | null;
  },
): CostRecord =>
  CostRecordSchema.parse({
    schemaVersion: 'cost-record-v1',
    id: `${context.sourceId}:${options.suffix}:${identity.modelId}-${identity.effort ?? 'unlabelled'}`,
    sourceId: context.sourceId,
    model: {
      rawName,
      canonicalModelId: identity.modelId,
      profileId:
        identity.effort === null
          ? null
          : `${identity.modelId}-${identity.effort}`,
    },
    profile: {
      effort: identity.effort,
      thinking: null,
      tools: null,
      harness: options.harness ?? null,
      contextWindowTokens: null,
      quantization: null,
      attempts: null,
    },
    costType: options.costType,
    metricId: options.metricId,
    metricName: options.metricName,
    unit: options.unit,
    inputPerMillionTokens: options.input,
    outputPerMillionTokens: options.output,
    cost: options.cost,
    assumptionId: options.assumptionId,
    benchmarkId: context.benchmarkId,
    benchmarkVersion: context.benchmarkVersion,
    inclusion: 'INCLUDED',
    exclusionReason: null,
    sourceUrl: context.sourceUrl,
    observedAt: context.observedAt,
    sourcePublishedAt: null,
    evidenceIds: [context.evidenceId],
    provenance: {
      cost: {
        evidenceId: context.evidenceId,
        method: context.method,
        locator: options.locator,
      },
    },
  });

export function materializeArtificialAnalysisCosts(
  html: string,
  context: Omit<Context, 'sourceId' | 'benchmarkId' | 'benchmarkVersion'>,
): CostRecord[] {
  const pattern =
    /\{"label":"([^"]+)","costPerIntelligenceIndexTask":([0-9.]+),"detailsUrl":"[^"]+"\}/gu;
  return [...html.matchAll(pattern)].flatMap((match) => {
    const identity = AA_MODELS[match[1]!];
    const cost = Number(match[2]);
    if (!identity || !Number.isFinite(cost)) return [];
    return [
      makeRecord(
        {
          ...context,
          sourceId: 'artificial-analysis',
          benchmarkId: 'artificial-analysis-intelligence-index',
          benchmarkVersion: null,
        },
        match[1]!,
        identity,
        {
          suffix: 'cost-per-intelligence-index-task',
          costType: 'MEASURED_TASK',
          metricId: 'cost-per-intelligence-index-task',
          metricName: 'Cost per Intelligence Index task',
          unit: 'USD_PER_TASK',
          cost,
          input: null,
          output: null,
          assumptionId: null,
          locator: `JSON-LD Cost per Task row for ${match[1]}`,
        },
      ),
    ];
  });
}

export function materializeDeepSweCosts(
  json: string,
  context: Omit<Context, 'sourceId' | 'benchmarkId' | 'benchmarkVersion'>,
): CostRecord[] {
  const parsed = JSON.parse(json) as {
    rows?: Array<{
      model?: string;
      reasoning_effort?: string | null;
      config?: string;
      harness?: string;
      mean_cost_usd?: number | null;
    }>;
  };
  return (parsed.rows ?? []).flatMap((row) => {
    const modelId = row.model ? DEEPSWE_MODELS[row.model] : undefined;
    if (
      !modelId ||
      row.mean_cost_usd == null ||
      !Number.isFinite(row.mean_cost_usd)
    )
      return [];
    const identity = {
      modelId,
      effort: normalizeSourceEffort(row.reasoning_effort),
    };
    return [
      makeRecord(
        {
          ...context,
          sourceId: 'deepswe',
          benchmarkId: 'deepswe',
          benchmarkVersion: '1.1',
        },
        row.model!,
        identity,
        {
          suffix: `mean-cost-${row.config ?? row.model}`,
          costType: 'AGENT_TASK',
          metricId: 'mean-cost-usd',
          metricName: 'Mean DeepSWE agent task cost',
          unit: 'USD_PER_TASK',
          cost: row.mean_cost_usd,
          input: null,
          output: null,
          assumptionId: null,
          locator: `rows[config=${row.config ?? 'unknown'}].mean_cost_usd`,
          harness: row.harness ?? null,
        },
      ),
    ];
  });
}

const parseCsvLine = (line: string): string[] => {
  const values: string[] = [];
  let value = '';
  let quoted = false;
  for (let index = 0; index < line.length; index++) {
    const char = line[index]!;
    if (char === '"') {
      if (quoted && line[index + 1] === '"') {
        value += '"';
        index++;
      } else quoted = !quoted;
    } else if (char === ',' && !quoted) {
      values.push(value);
      value = '';
    } else value += char;
  }
  values.push(value);
  return values;
};

export function materializeLiveBenchCosts(
  csv: string,
  context: Omit<Context, 'sourceId' | 'benchmarkId' | 'benchmarkVersion'>,
): CostRecord[] {
  const lines = csv.trim().split(/\r?\n/u);
  const headers = parseCsvLine(lines.shift() ?? '');
  const index = (name: string) => headers.indexOf(name);
  const columns = {
    model: index('model'),
    input: index('input_price_per_million'),
    output: index('output_price_per_million'),
    task: index('cost_per_successful_task'),
  };
  if (Object.values(columns).includes(-1))
    throw new Error('LiveBench cost CSV is missing required columns');
  return lines.flatMap((line) => {
    const row = parseCsvLine(line);
    const rawName = row[columns.model]!;
    const identity = LIVEBENCH_MODELS[rawName];
    if (!identity) return [];
    const input = Number(row[columns.input]);
    const output = Number(row[columns.output]);
    const cost = Number(row[columns.task]);
    if (![input, output, cost].every(Number.isFinite)) return [];
    const common = {
      ...context,
      sourceId: 'livebench',
      benchmarkId: 'livebench',
      benchmarkVersion: '2026-06-25',
    };
    return [
      makeRecord(common, rawName, identity, {
        suffix: 'api-token-price',
        costType: 'API_STANDARDIZED',
        metricId: 'blended-token-price',
        metricName: 'Blended API token price',
        unit: 'USD_PER_MILLION_TOKENS',
        cost: null,
        input,
        output,
        assumptionId: 'api-blend-3-to-1',
        locator: `model=${rawName}; input/output_price_per_million`,
      }),
      makeRecord(common, rawName, identity, {
        suffix: 'cost-per-successful-task',
        costType: 'MEASURED_TASK',
        metricId: 'cost-per-successful-task',
        metricName: 'LiveBench cost per successful task',
        unit: 'USD_PER_TASK',
        cost,
        input: null,
        output: null,
        assumptionId: null,
        locator: `model=${rawName}; cost_per_successful_task`,
      }),
    ];
  });
}
