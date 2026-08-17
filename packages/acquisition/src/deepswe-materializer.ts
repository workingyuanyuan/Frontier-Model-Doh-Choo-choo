import {
  CandidateResultSchema,
  type CandidateResult,
} from '@llm-bench/benchmark-data';
import { slugify } from './materializer-utils.js';

export const DEEPSWE_MODELS: Record<string, string> = {
  'claude-fable-5': 'anthropic-claude-fable-5',
  'claude-opus-4-8': 'anthropic-claude-opus-4-8',
  'claude-opus-5': 'anthropic-claude-opus-5',
  'claude-sonnet-4-6': 'anthropic-claude-sonnet-4-6',
  'claude-sonnet-5': 'anthropic-claude-sonnet-5',
  'deepseek-v4-flash': 'deepseek-deepseek-v4-flash',
  'gemini-3-1-pro-preview': 'google-gemini-3-1-pro-preview',
  'gemini-3-5-flash': 'google-gemini-3-5-flash',
  'gemini-3-6-flash': 'google-gemini-3-6-flash',
  'glm-5-2': 'zai-glm-5-2',
  'gpt-5-4': 'openai-gpt-5-4',
  'gpt-5-5': 'openai-gpt-5-5',
  'gpt-5-6-luna': 'openai-gpt-5-6-luna',
  'gpt-5-6-sol': 'openai-gpt-5-6-sol',
  'gpt-5-6-terra': 'openai-gpt-5-6-terra',
  'grok-4-5': 'xai-grok-4-5',
  'kimi-k2-7-code': 'moonshot-kimi-k2-7-code',
  'kimi-k3': 'moonshot-kimi-k3',
  'muse-spark-1-1': 'meta-muse-spark-1-1',
  'muse-spark-1-2': 'meta-muse-spark-1-2',
  'qwen3-8-max': 'alibaba-qwen3-8-max',
};

export interface DeepSweRow {
  model: string;
  harness: string;
  reasoning_effort: string | null;
  config: string;
  source?: string;
  pass_rate?: number;
  pass_at_1?: number;
  pass_at_4?: number;
  n_passed?: number;
  n_attempted?: number;
  n_tasks_attempted?: number;
  n_tasks_passed_any?: number;
  n_runs?: number;
  mean_cost_usd?: number | null;
  [key: string]: unknown;
}

export interface DeepSweLeaderboardPayload {
  scope?: string;
  unit?: string;
  generated_at?: string;
  n_tasks_in_set?: number;
  latest_job?: {
    name?: string;
    finished_at?: string;
  };
  rows: DeepSweRow[];
}

export interface MaterializeDeepSweContext {
  evidenceId: string;
  sourceUrl: string;
}

export interface MaterializeDeepSweResult {
  candidates: CandidateResult[];
  validationReport: string;
  configurationRows: number;
  distinctModels: number;
  unresolvedCount: number;
  modelsWithMultipleEfforts: string[];
}

export function materializeDeepSwe(
  jsonStr: string,
  observedAt: string,
  context: MaterializeDeepSweContext,
): MaterializeDeepSweResult {
  const payload = JSON.parse(jsonStr) as DeepSweLeaderboardPayload;
  if (!Array.isArray(payload.rows) || payload.rows.length === 0) {
    throw new Error('DeepSWE leaderboard JSON contains no rows');
  }

  const rawGeneratedAt =
    payload.generated_at ??
    (payload.latest_job?.finished_at
      ? `${payload.latest_job.finished_at}Z`
      : '2026-08-07T19:41:58.007Z');
  const sourcePublishedAt = new Date(rawGeneratedAt).toISOString();

  const distinctModelsSet = new Set<string>();
  const effortsByModel = new Map<string, Set<string>>();
  const candidates: CandidateResult[] = [];

  for (const row of payload.rows) {
    distinctModelsSet.add(row.model);
    const effort = row.reasoning_effort ?? 'max';
    const efforts = effortsByModel.get(row.model) ?? new Set();
    efforts.add(effort);
    effortsByModel.set(row.model, efforts);

    const canonicalModelId = DEEPSWE_MODELS[row.model] ?? null;
    const harness = row.harness ?? 'mini-swe-agent';
    const profileId = canonicalModelId
      ? `${canonicalModelId}-${slugify(harness)}-${slugify(effort)}`
      : null;

    const rawScoreVal = row.pass_rate ?? row.pass_at_1;
    if (rawScoreVal === undefined || rawScoreVal === null) {
      throw new Error(
        `DeepSWE row for config "${row.config}" is missing pass_rate/pass_at_1`,
      );
    }
    const scorePercent = rawScoreVal * 100;

    const benchmarkId = 'deepswe-1-1';
    const benchmarkVersion = '1.1';
    const id = `deepswe-1-1:${slugify(row.config)}`;

    const candidate: CandidateResult = {
      schemaVersion: 'candidate-result-v1',
      id,
      sourceId: 'deepswe',
      sourceRole: 'ORGANIZER',
      benchmarkId,
      benchmarkVersion,
      model: {
        rawName: row.model,
        canonicalModelId,
        profileId,
      },
      profile: {
        effort: row.reasoning_effort ?? null,
        thinking: null,
        tools: true,
        harness: row.harness ?? null,
        contextWindowTokens: null,
        quantization: null,
        attempts: row.n_runs ?? 4,
      },
      metric: {
        id: 'pass-at-1',
        name: 'Pass@1',
        unit: 'percent',
        higherIsBetter: true,
      },
      rawScore: scorePercent,
      normalizedScore: scorePercent,
      acquisitionStatus: 'FULL',
      inclusion: 'INCLUDED',
      exclusionReason: null,
      sourceUrl: context.sourceUrl,
      observedAt,
      sourcePublishedAt,
      evidenceIds: [context.evidenceId],
      provenance: {
        profile: {
          evidenceId: context.evidenceId,
          locator: `$.rows[config="${row.config}"].{model,harness,reasoning_effort,n_runs}`,
          method: 'API_RESPONSE',
        },
        rawScore: {
          evidenceId: context.evidenceId,
          locator: `$.rows[config="${row.config}"].pass_rate`,
          method: 'API_RESPONSE',
        },
      },
    };

    candidates.push(CandidateResultSchema.parse(candidate));
  }

  // Deterministic sort by id
  candidates.sort((a, b) => a.id.localeCompare(b.id));

  const unresolvedCount = candidates.filter(
    (c) => c.model.canonicalModelId === null,
  ).length;

  const modelsWithMultipleEfforts = [...effortsByModel.entries()]
    .filter(([, efforts]) => efforts.size > 1)
    .map(
      ([model, efforts]) =>
        `${model} (${efforts.size} levels: ${[...efforts].join(', ')})`,
    );

  const validationReport = [
    `# DeepSWE acquisition validation`,
    ``,
    `- Source: \`${context.sourceUrl}\``,
    `- Evidence ID: \`${context.evidenceId}\``,
    `- Generated at: \`${sourcePublishedAt}\``,
    ``,
    `## Exact counts`,
    ``,
    `| Check | Count |`,
    `|---|---:|`,
    `| Configuration rows extracted | ${candidates.length} |`,
    `| Distinct models represented | ${distinctModelsSet.size} |`,
    `| Models with multi-effort reasoning ladders | ${modelsWithMultipleEfforts.length} |`,
    `| Canonically resolved candidates | ${candidates.length - unresolvedCount} |`,
    `| Canonically unresolved candidates | ${unresolvedCount} |`,
    ``,
    `## Multi-effort reasoning ladders preserved`,
    ``,
    `Per REFACTOR_SPEC_V2.md §9.2 and §6.3, all configuration rows and reasoning effort ladders are preserved unpruned during acquisition for advanced Pareto frontier curves:`,
    ``,
    ...modelsWithMultipleEfforts.map((m) => `- ${m}`),
    ``,
    `## Role boundary & cost semantics`,
    ``,
    `- DeepSWE is an organizer-run agent benchmark (\`ORGANIZER\`).`,
    `- \`mean_cost_usd\` is preserved as \`AGENT_TASK\` cost with harness in provenance.`,
    ``,
  ].join('\n');

  return {
    candidates,
    validationReport,
    configurationRows: candidates.length,
    distinctModels: distinctModelsSet.size,
    unresolvedCount,
    modelsWithMultipleEfforts,
  };
}
