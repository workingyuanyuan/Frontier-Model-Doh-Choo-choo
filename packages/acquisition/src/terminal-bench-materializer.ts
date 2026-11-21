import {
  CandidateResultSchema,
  SourceManifestSchema,
  type CandidateResult,
  type SourceManifest,
} from '@llm-bench/benchmark-data';
import {
  normalizeSourceEffort,
  resolveCatalogModel,
  slugify,
} from './materializer-utils.js';

export const TERMINAL_BENCH_SOURCE_ID = 'terminal-bench';
export const TERMINAL_BENCH_PAGE_URL = 'https://www.tbench.ai/leaderboard';
const BENCHMARK_ID = 'terminal-bench-4-1';
const LEADERBOARD = {
  package: 'terminal-bench/terminal-bench',
  name: '4-1-0',
  title: 'Terminal-Bench 4.1',
} as const;
/** 66 tasks, five trials each (pass@1 with pass@2–5 reported). */
const TRIALS = 330;
const ATTEMPTS = 5;

/**
 * The leaderboard writes the model's short product name. These Anthropic rows
 * link to the vendor's own announcement for exactly that model, and the
 * catalog has no alias without the "Claude" prefix. Reviewed exact entries
 * only; never widen into a prefix rule.
 */
const REVIEWED_IDENTITIES: Readonly<
  Record<string, { canonicalModelId: string; modelUrl: string }>
> = {
  'Fable 5': {
    canonicalModelId: 'anthropic-claude-fable-5',
    modelUrl: 'https://www.anthropic.com/news/claude-fable-5-mythos-5',
  },
  'Opus 4.8': {
    canonicalModelId: 'anthropic-claude-opus-4-8',
    modelUrl: 'https://www.anthropic.com/news/claude-opus-4-8',
  },
  'Sonnet 5': {
    canonicalModelId: 'anthropic-claude-sonnet-5',
    modelUrl: 'https://www.anthropic.com/news/claude-sonnet-5',
  },
};

interface Link {
  url: string;
  label: string;
}
interface Row {
  id: string;
  rank: number;
  status: string;
  updated_at: string;
  metadata: {
    date: string;
    agent_display: Link;
    model_display: Link;
    model_org: Link;
    reasoning_effort: string;
  };
  metrics: {
    accuracy: number;
    n_trials: number;
    successes: number;
    pass_at_5: number;
    accuracy_ci95_half_width: number;
  };
}
interface Payload {
  leaderboard: {
    package: string;
    name: string;
    title: string;
    updated_at: string;
    rank_by: { accessor: string; direction: string }[];
  };
  rows: Row[];
}

/** Concatenate the `self.__next_f.push([1, "…"])` RSC string chunks. */
export function decodeNextFlight(html: string): string {
  const chunks = [
    ...html.matchAll(/self\.__next_f\.push\(\[1,("(?:[^"\\]|\\.)*")\]\)/gu),
  ].map(([, literal]) => JSON.parse(literal!) as string);
  if (chunks.length === 0) throw new Error('No Next.js flight data found');
  return chunks.join('');
}

/** Read one JSON object starting at `start` without evaluating page code. */
function readJsonObject(text: string, start: number): unknown {
  if (text[start] !== '{') throw new Error('Expected a JSON object');
  let depth = 0;
  let inString = false;
  for (let index = start; index < text.length; index += 1) {
    const char = text[index];
    if (inString) {
      if (char === '\\') index += 1;
      else if (char === '"') inString = false;
    } else if (char === '"') inString = true;
    else if (char === '{' || char === '[') depth += 1;
    else if (char === '}' || char === ']') {
      depth -= 1;
      if (depth === 0) return JSON.parse(text.slice(start, index + 1));
    }
  }
  throw new Error('Unterminated JSON object');
}

const isNumber = (value: unknown, max = Infinity): value is number =>
  typeof value === 'number' &&
  Number.isFinite(value) &&
  value >= 0 &&
  value <= max;

function readPayload(html: string): Payload {
  const flight = decodeNextFlight(html);
  const marker = '"state":{"data":{"leaderboard":';
  const at = flight.indexOf(marker);
  if (at < 0 || flight.indexOf(marker, at + 1) >= 0)
    throw new Error('Expected exactly one Terminal-Bench leaderboard query');
  const payload = readJsonObject(
    flight,
    at + '"state":{"data":'.length,
  ) as Payload;
  const { leaderboard, rows } = payload;
  if (
    leaderboard?.package !== LEADERBOARD.package ||
    leaderboard.name !== LEADERBOARD.name ||
    leaderboard.title !== LEADERBOARD.title ||
    JSON.stringify(leaderboard.rank_by) !==
      JSON.stringify([{ accessor: 'metrics.accuracy', direction: 'desc' }]) ||
    !Array.isArray(rows) ||
    rows.length === 0
  )
    throw new Error('Terminal-Bench leaderboard identity drift');
  return payload;
}

export interface TerminalBenchContext {
  evidenceId: string;
  observedAt: string;
  /** Rendered table rows; the table shows each model's best configuration. */
  visualModelCount: number;
}

export function materializeTerminalBench(
  html: string,
  context: TerminalBenchContext,
): {
  candidates: CandidateResult[];
  configurations: number;
  distinctModels: number;
  leaderboardUpdatedAt: string;
  validationReport: string;
} {
  const { leaderboard, rows } = readPayload(html);
  const displayed = rows.filter((row) => row.status === 'display');
  if (displayed.length !== rows.length)
    throw new Error('Terminal-Bench rows with a non-display status');
  const models = new Set(
    displayed.map((row) => row.metadata.model_display.label),
  );
  if (models.size !== context.visualModelCount)
    throw new Error(
      `Terminal-Bench models ${models.size} do not match rendered count ${context.visualModelCount}`,
    );
  // The rendered count only covers each model's best row. Competition ranks
  // (1, 2, 2, 4) over all configurations catch a missing interior row; a
  // missing lowest-ranked row stays undetectable from this page.
  for (const row of displayed) {
    const higher = displayed.filter(
      (other) => other.metrics.accuracy > row.metrics.accuracy,
    ).length;
    if (row.rank !== higher + 1)
      throw new Error(
        `Terminal-Bench rank ${row.rank} for ${row.metadata.model_display.label} implies missing rows`,
      );
  }

  const candidates = displayed
    .map((row, index) => {
      const { metadata, metrics } = row;
      const rawName = metadata.model_display?.label;
      const agent = metadata.agent_display?.label;
      const rawEffort = metadata.reasoning_effort;
      if (
        typeof rawName !== 'string' ||
        typeof agent !== 'string' ||
        typeof rawEffort !== 'string' ||
        metrics.n_trials !== TRIALS ||
        !Number.isInteger(metrics.successes) ||
        !isNumber(metrics.successes, TRIALS) ||
        !isNumber(metrics.accuracy, 100) ||
        !isNumber(metrics.pass_at_5, 1) ||
        !isNumber(metrics.accuracy_ci95_half_width, 100) ||
        Math.round((metrics.successes / TRIALS) * 10000) / 100 !==
          metrics.accuracy
      )
        throw new Error(`Invalid Terminal-Bench row ${index + 1}`);
      const reviewed = REVIEWED_IDENTITIES[rawName];
      if (reviewed && metadata.model_display.url !== reviewed.modelUrl)
        throw new Error(`Terminal-Bench ${rawName} model link changed`);
      const canonicalModelId =
        reviewed?.canonicalModelId ??
        resolveCatalogModel(rawName).canonicalModelId;
      const effort = normalizeSourceEffort(rawEffort);
      const locator = `self.__next_f leaderboard query $.rows[id="${row.id}"]`;
      const field = (path: string) => ({
        evidenceId: context.evidenceId,
        method: 'NEXT_RSC' as const,
        locator: `${locator}.${path} (${rawName}, ${agent}, ${rawEffort})`,
      });
      return CandidateResultSchema.parse({
        schemaVersion: 'candidate-result-v1',
        id: `${TERMINAL_BENCH_SOURCE_ID}:${BENCHMARK_ID}:${slugify(rawName)}-${slugify(agent)}-${slugify(rawEffort)}`,
        sourceId: TERMINAL_BENCH_SOURCE_ID,
        sourceRole: 'ORGANIZER',
        benchmarkId: BENCHMARK_ID,
        benchmarkVersion: '4.1',
        model: {
          rawName,
          canonicalModelId,
          profileId:
            canonicalModelId && effort
              ? `${canonicalModelId}-${slugify(agent)}-${effort}`
              : null,
        },
        profile: {
          effort,
          thinking: null,
          tools: true,
          harness: agent,
          contextWindowTokens: null,
          quantization: null,
          attempts: ATTEMPTS,
        },
        metric: {
          id: 'resolution-rate',
          name: 'Resolution rate',
          unit: 'percent',
          higherIsBetter: true,
        },
        rawScore: metrics.accuracy,
        normalizedScore: metrics.accuracy,
        acquisitionStatus: 'FULL',
        inclusion: 'INCLUDED',
        exclusionReason: null,
        sourceUrl: TERMINAL_BENCH_PAGE_URL,
        observedAt: context.observedAt,
        sourcePublishedAt: new Date(row.updated_at).toISOString(),
        evidenceIds: [context.evidenceId],
        provenance: {
          rawScore: field('metrics.accuracy'),
          'model.rawName': field('metadata.model_display.label'),
          'profile.effort': field('metadata.reasoning_effort'),
          'profile.harness': field('metadata.agent_display.label'),
          'profile.attempts': field('metrics.n_trials (330 = 66 tasks x 5)'),
          sourcePublishedAt: field('updated_at'),
        },
      });
    })
    .sort((a, b) => a.id.localeCompare(b.id));
  if (new Set(candidates.map(({ id }) => id)).size !== candidates.length)
    throw new Error('Duplicate Terminal-Bench configuration');
  const unresolved = [
    ...new Set(
      candidates
        .filter((row) => row.model.canonicalModelId === null)
        .map((row) => row.model.rawName),
    ),
  ];
  const unlabelled = candidates.filter((row) => row.profile.effort === null);
  const leaderboardUpdatedAt = new Date(leaderboard.updated_at).toISOString();
  return {
    candidates,
    configurations: candidates.length,
    distinctModels: models.size,
    leaderboardUpdatedAt,
    validationReport: [
      '# Terminal-Bench 4.1 acquisition validation',
      '',
      `- Source: <${TERMINAL_BENCH_PAGE_URL}>`,
      `- Evidence: \`${context.evidenceId}\``,
      `- Leaderboard \`${LEADERBOARD.package}\` / \`${LEADERBOARD.name}\` ("${LEADERBOARD.title}"), updated ${leaderboardUpdatedAt}.`,
      `- Configurations: ${candidates.length}; distinct models: ${models.size}; rendered browser rows: ${context.visualModelCount}.`,
      `- Every row has ${TRIALS} trials and its resolution rate equals successes / trials.`,
      `- Unresolved catalog identities (${unresolved.length}): ${unresolved.join('; ') || 'none'}.`,
      `- Rows whose source effort is not a product tier (${unlabelled.length}): retained with null effort.`,
      '',
      "The Stanford / Laude Institute Terminal-Bench team hosts this leaderboard, so rows are ORGANIZER results. The page embeds the complete leaderboard query in its Next.js flight data; the rendered table shows only each model's best configuration, so every effort configuration is materialized and the rendered row count is compared with distinct models.",
      '',
      'Terminal-Bench 4.1 keeps the 4.0 tasks and replaces verifiers for reward-hack resistance and correctness. The organizer regraded saved 4.0 artifacts; trials without stored artifacts or regrade results keep their 4.0 score.',
      '',
      "Each row records the agent harness (Claude Code, Codex, Antigravity CLI, mini-swe-agent and others) and the published reasoning effort. Source effort none is not a product tier and stays null. Fable 5, Opus 4.8 and Sonnet 5 resolve through reviewed exact entries that require the row to link to the vendor's announcement of that model. Tokens and cost are not materialized.",
      '',
    ].join('\n'),
  };
}

export const terminalBenchManifest = (
  observedAt: string,
  configurations: number,
  models: number,
): SourceManifest =>
  SourceManifestSchema.parse({
    schemaVersion: 'source-manifest-v1',
    sourceId: TERMINAL_BENCH_SOURCE_ID,
    displayName: 'Terminal-Bench (tbench.ai)',
    role: 'ORGANIZER',
    baseUrl: 'https://www.tbench.ai',
    targetUrls: [TERMINAL_BENCH_PAGE_URL],
    benchmarkIds: [BENCHMARK_ID],
    accessMethods: ['NEXT_RSC'],
    completeness: {
      expectedCountMethod:
        'Read every row of the embedded leaderboard query and compare its distinct models with the rendered table, which shows one best configuration per model.',
      pagination: null,
      visibleComparisonRequired: true,
    },
    fieldMapping: {
      'rows[].metadata.model_display.label': 'model.rawName',
      'rows[].metadata.reasoning_effort': 'profile.effort',
      'rows[].metadata.agent_display.label': 'profile.harness',
      'rows[].metrics.accuracy': 'rawScore / normalizedScore',
      'rows[].metrics.n_trials': 'profile.attempts',
    },
    fallbackMethods: ['DOM', 'VISUAL'],
    lastVerifiedAt: observedAt,
    notes: [
      `${configurations} configurations / ${models} models; every configuration is retained.`,
      'Terminal-Bench 4.1 regrades the 4.0 tasks with hardened verifiers.',
      'Source effort none stays null. Tokens and cost are not materialized.',
    ],
  });
