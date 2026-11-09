import {
  CandidateResultSchema,
  CostRecordSchema,
  type CandidateResult,
  type CostRecord,
} from '@llm-bench/benchmark-data';
import { resolveCatalogModel } from './materializer-utils.js';

export const MAXXBENCH_PAGE_URL = 'https://maxxbench.unlap.ai/';

function decodeHtml(value: string): string {
  return value
    .replace(/&quot;/gu, '"')
    .replace(/&#39;/gu, "'")
    .replace(/&lt;/gu, '<')
    .replace(/&gt;/gu, '>')
    .replace(/&amp;/gu, '&');
}

/** Decode Astro's JSON tuples without evaluating source JavaScript. */
function decodeAstro(value: unknown): unknown {
  if (Array.isArray(value)) {
    if (value.length !== 2 || ![0, 1].includes(value[0] as number)) {
      throw new Error('Unsupported MaxxBench Astro data encoding');
    }
    if (value[0] === 1) {
      if (!Array.isArray(value[1])) throw new Error('Invalid Astro array');
      return value[1].map(decodeAstro);
    }
    return decodeAstro(value[1]);
  }
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, decodeAstro(item)]),
    );
  }
  return value;
}

interface Model {
  id: string;
  name: string;
  effort: string;
  maxxBenchScore: number;
  averageCost: number | null;
  passed: number;
  attempts: number;
  taskCount: number;
  evaluations: number;
}

interface Trial {
  id: string;
  modelId: string;
  taskId: string;
  outcome: string;
  cost: number | null;
}

export function materializeMaxxBench(
  html: string,
  context: { evidenceId: string; observedAt: string; visualRowCount: number },
): {
  candidates: CandidateResult[];
  costs: CostRecord[];
  validationReport: string;
  visibleRows: number;
} {
  const islands = [
    ...html.matchAll(
      /<astro-island\b[^>]*component-url="[^"]*\/BenchmarkLeaderboard\.[^"]+"[^>]*>/gu,
    ),
  ];
  if (islands.length !== 1)
    throw new Error('Expected one MaxxBench leaderboard island');
  const encoded = islands[0]![0].match(/\bprops="([^"]+)"/u)?.[1];
  if (!encoded) throw new Error('MaxxBench leaderboard props missing');
  const data = decodeAstro(JSON.parse(decodeHtml(encoded))) as {
    models: Model[];
    trials: Trial[];
  };
  if (
    !Array.isArray(data.models) ||
    !data.models.length ||
    !Array.isArray(data.trials)
  ) {
    throw new Error('MaxxBench models or trials missing');
  }
  if (
    new Set(data.models.map((model) => model.id)).size !== data.models.length ||
    new Set(data.trials.map((trial) => trial.id)).size !== data.trials.length
  ) {
    throw new Error('Duplicate MaxxBench model or trial IDs');
  }
  const visible = [
    ...html.matchAll(
      /<tr\b[^>]*\bid="score-([^"<>]+)"[^>]*>([\s\S]*?)<\/tr>/gu,
    ),
  ];
  if (
    !visible.length ||
    visible.length !== context.visualRowCount ||
    new Set(visible.map((row) => row[1])).size !== visible.length
  ) {
    throw new Error('MaxxBench visible leaderboard count mismatch');
  }
  const candidates: CandidateResult[] = [];
  const costs: CostRecord[] = [];
  for (const match of visible) {
    const modelIndex = data.models.findIndex((model) => model.id === match[1]);
    const model = data.models[modelIndex];
    if (
      !model ||
      typeof model.name !== 'string' ||
      !model.name.trim() ||
      !['non-reasoning', 'low', 'medium', 'high', 'xhigh', 'max'].includes(
        model.effort,
      ) ||
      !Number.isInteger(model.taskCount) ||
      model.taskCount <= 0 ||
      !Number.isInteger(model.evaluations) ||
      model.evaluations <= 0 ||
      !Number.isInteger(model.attempts) ||
      model.attempts !== model.taskCount * model.evaluations ||
      !Number.isInteger(model.passed) ||
      model.passed < 0 ||
      model.passed > model.attempts ||
      !Number.isFinite(model.maxxBenchScore) ||
      model.maxxBenchScore < 0 ||
      model.maxxBenchScore > 100 ||
      Math.abs(model.maxxBenchScore - (model.passed / model.attempts) * 100) >
        1e-9
    ) {
      throw new Error(`Invalid MaxxBench model ${match[1]}`);
    }
    const body = decodeHtml(match[2]!);
    const label = body.match(/aria-label="Pin ([^"]+), ([^"]+) effort"/u);
    const displayedScore = body.match(
      /<td\b[^>]*class="[^"]*\bscore-cell\b[^"]*"[^>]*>([\d.]+)/u,
    )?.[1];
    const displayedCost = body.match(/Cost:<\/span>\s*\$([\d.]+)/u)?.[1];
    if (
      !label ||
      label[1] !== model.name ||
      label[2] !== model.effort ||
      displayedScore === undefined ||
      Number(displayedScore) !== Number(model.maxxBenchScore.toFixed(1))
    ) {
      throw new Error(
        `MaxxBench visible identity or score mismatch ${model.id}`,
      );
    }
    const trials = data.trials.filter((trial) => trial.modelId === model.id);
    const tasks = new Map<string, number>();
    for (const trial of trials) {
      if (
        typeof trial.taskId !== 'string' ||
        !['passed', 'failed'].includes(trial.outcome)
      ) {
        throw new Error(`Incomplete MaxxBench trial ${trial.id}`);
      }
      tasks.set(trial.taskId, (tasks.get(trial.taskId) ?? 0) + 1);
    }
    if (
      trials.length !== model.attempts ||
      tasks.size !== model.taskCount ||
      [...tasks.values()].some((count) => count !== model.evaluations) ||
      trials.filter((trial) => trial.outcome === 'passed').length !==
        model.passed
    ) {
      throw new Error(`MaxxBench trial totals disagree ${model.id}`);
    }
    if (model.averageCost !== null) {
      if (
        !Number.isFinite(model.averageCost) ||
        model.averageCost < 0 ||
        displayedCost === undefined ||
        Number(displayedCost) !== Number(model.averageCost.toFixed(2)) ||
        trials.some(
          (trial) =>
            trial.cost === null ||
            !Number.isFinite(trial.cost) ||
            trial.cost < 0,
        ) ||
        Math.abs(
          trials.reduce((total, trial) => total + trial.cost!, 0) /
            trials.length -
            model.averageCost,
        ) > 1e-9
      ) {
        throw new Error(`MaxxBench mean attempt cost mismatch ${model.id}`);
      }
    } else if (displayedCost !== undefined) {
      throw new Error(
        `MaxxBench visible cost has no structured value ${model.id}`,
      );
    }
    const canonicalModelId = resolveCatalogModel(
      model.name,
      'maxxbench',
    ).canonicalModelId;
    const identity = {
      rawName: model.name,
      canonicalModelId,
      profileId: canonicalModelId
        ? `${canonicalModelId}-${model.effort}`
        : null,
    };
    const profile = {
      effort: model.effort,
      thinking: null,
      tools: null,
      harness: null,
      contextWindowTokens: null,
      quantization: null,
      attempts: model.evaluations,
    };
    const locator = `Astro BenchmarkLeaderboard.props.models[${modelIndex}]`;
    const provenance = {
      evidenceId: context.evidenceId,
      locator,
      method: 'EMBEDDED_JSON' as const,
    };
    const common = {
      sourceId: 'maxxbench',
      model: identity,
      profile,
      benchmarkId: 'maxxbench',
      benchmarkVersion: null,
      inclusion: 'INCLUDED',
      exclusionReason: null,
      sourceUrl: MAXXBENCH_PAGE_URL,
      observedAt: context.observedAt,
      sourcePublishedAt: null,
      evidenceIds: [context.evidenceId],
    };
    candidates.push(
      CandidateResultSchema.parse({
        ...common,
        schemaVersion: 'candidate-result-v1',
        id: `maxxbench:maxxbench:${model.id}-${model.effort}`,
        sourceRole: 'ORGANIZER',
        metric: {
          id: 'task-success-rate',
          name: 'Task success rate',
          unit: 'percent',
          higherIsBetter: true,
        },
        rawScore: model.maxxBenchScore,
        normalizedScore: model.maxxBenchScore,
        acquisitionStatus: 'FULL',
        provenance: {
          rawScore: { ...provenance, locator: `${locator}.maxxBenchScore` },
          profile: provenance,
        },
      }),
    );
    if (model.averageCost !== null)
      costs.push(
        CostRecordSchema.parse({
          ...common,
          schemaVersion: 'cost-record-v1',
          id: `maxxbench:mean-attempt-cost:${model.id}-${model.effort}`,
          costType: 'AGENT_TASK',
          metricId: 'mean-attempt-cost-usd',
          metricName: 'Mean MaxxBench evaluation attempt cost',
          unit: 'USD_PER_TASK',
          cost: model.averageCost,
          inputPerMillionTokens: null,
          outputPerMillionTokens: null,
          assumptionId: null,
          provenance: {
            cost: {
              ...provenance,
              locator: `${locator}.averageCost; arithmetic mean of all ${trials.length} trials[].cost`,
            },
            profile: provenance,
          },
        }),
      );
  }
  candidates.sort((a, b) => a.id.localeCompare(b.id));
  costs.sort((a, b) => a.id.localeCompare(b.id));
  const visibleIds = new Set(visible.map((row) => row[1]));
  const hidden = data.models
    .filter((model) => !visibleIds.has(model.id))
    .map((model) => `${model.name} (${model.effort})`);
  return {
    candidates,
    costs,
    visibleRows: visible.length,
    validationReport: [
      '# MaxxBench acquisition validation',
      '',
      `- Source ${MAXXBENCH_PAGE_URL}`,
      `- Evidence \`${context.evidenceId}\``,
      `- Observed ${context.observedAt}`,
      `- Visible leaderboard configurations ${visible.length}`,
      `- Embedded configurations ${data.models.length}`,
      `- Materialized costs ${costs.length}`,
      '- Every visible name, effort, one-decimal score and two-decimal cost matches the embedded data.',
      '- Every selected score equals passed / attempts × 100. Task counts, repetitions and mean costs match completed trial records.',
      '',
      '## Scope and settings',
      '',
      `- Embedded configurations outside the default visible leaderboard are omitted from candidates and costs. ${hidden.join(', ') || 'None'}.`,
      '- The score averages independent evaluation attempts. profile.attempts stores repetitions per task.',
      '- Costs are mean USD per evaluation attempt including failed attempts. Pricing schedules and cache assumptions are unpublished.',
      '- The benchmark release has no explicit version label. The task manifest schema version describes its file format.',
      '- Harness, tools, thinking, quantization and context window remain null where the leaderboard does not specify them.',
      `- Unresolved canonical identities ${
        candidates
          .filter((row) => row.model.canonicalModelId === null)
          .map((row) => row.model.rawName)
          .join(', ') || 'None'
      }.`,
      '',
    ].join('\n'),
  };
}
