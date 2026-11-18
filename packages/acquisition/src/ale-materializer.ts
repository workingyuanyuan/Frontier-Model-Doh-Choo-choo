import {
  CandidateResultSchema,
  CostRecordSchema,
  type CandidateResult,
  type CostRecord,
} from '@llm-bench/benchmark-data';

import {
  LEGAL_SOURCE_EFFORTS,
  normalizeSourceEffort,
  resolveCatalogModel,
  slugify,
} from './materializer-utils.js';

export const ALE_SOURCE_ID = 'agents-last-exam';
export const ALE_BENCHMARK_ID = 'agents-last-exam';
export const ALE_ORIGIN = 'https://agents-last-exam.org';
export const ALE_PAGE_URL = `${ALE_ORIGIN}/leaderboard`;
/** The leaderboard page bundle fetches `${ALE_API_PATH}${version}`. */
export const ALE_API_PATH = '/api/demo/leaderboard/';
export const ALE_API_FEATURE = '/api/demo/leaderboard/${';
export const ALE_MULTIPLE_HARNESS_REASON =
  'multiple harnesses publish this profile; not reviewed';
export const ALE_UNRECOGNISED_VARIANT_PREFIX = 'Unrecognised harness variant';

export const aleApiUrl = (version: string): string =>
  `${ALE_ORIGIN}${ALE_API_PATH}v${version}`;

/**
 * The board version is read from the server-rendered page, never assumed: the
 * header eyebrow (`ALE v1.1`) and the version prop handed to the client
 * leaderboard component must name exactly one version between them.
 */
export function parseAlePageVersion(html: string): string {
  const eyebrow = [
    ...html.matchAll(/>\s*ALE v(\d+(?:\.\d+)*)\s*</gu),
    ...html.matchAll(/\\?"children\\?":\\?"ALE v(\d+(?:\.\d+)*)\\?"/gu),
  ].map((match) => match[1]!);
  const prop = [
    ...html.matchAll(/\\?"version\\?":\\?"v(\d+(?:\.\d+)*)\\?"/gu),
  ].map((match) => match[1]!);
  if (eyebrow.length === 0) {
    throw new Error('ALE leaderboard page does not name an "ALE v<version>"');
  }
  if (prop.length === 0) {
    throw new Error(
      'ALE leaderboard page does not pass a version to the leaderboard',
    );
  }
  const versions = new Set([...eyebrow, ...prop]);
  if (versions.size !== 1) {
    throw new Error(
      `ALE leaderboard page names several versions: ${[...versions].join(', ')}`,
    );
  }
  return [...versions][0]!;
}

/** Leaderboard page chunks, discovered from the HTML; hashes are never hard-coded. */
export function extractAleLeaderboardBundleUrls(html: string): string[] {
  const urls = new Set<string>();
  for (const match of html.matchAll(/src="([^"]+)"/gu)) {
    const raw = match[1]!;
    if (!/\/app\/leaderboard\/page-[^/]*\.js$/u.test(raw)) continue;
    urls.add(new URL(raw, ALE_PAGE_URL).href);
  }
  return [...urls].toSorted((left, right) => left.localeCompare(right));
}

export interface AleRow {
  split: string;
  harness: string;
  model: string;
  harnessVariant: string;
  runs: number;
  tasks: number;
  splitTasks: number;
  passes: number;
  passRate: number;
  avgScore: number;
  totalCostUsd: number;
  costSource: string;
}

interface AlePlatform {
  taskCount: number;
  rows: AleRow[];
}

export interface AlePayload {
  rows: AleRow[];
  platforms: Record<string, AlePlatform>;
  costRatesAsOf: string;
  resultsUpdatedAt: string;
  benchmarkReference: {
    repository: string;
    commit: string;
    committedAt: string;
  };
}

export const ALE_PLATFORMS = ['linux', 'windows'] as const;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const requireString = (
  row: Record<string, unknown>,
  field: string,
  where: string,
): string => {
  const value = row[field];
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`ALE ${where} is missing string field ${field}`);
  }
  return value;
};

const requireNumber = (
  row: Record<string, unknown>,
  field: string,
  where: string,
): number => {
  const value = row[field];
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`ALE ${where} has a missing or non-finite ${field}`);
  }
  return value;
};

const parseRow = (value: unknown, where: string): AleRow => {
  if (!isRecord(value)) throw new Error(`ALE ${where} is not an object`);
  const row: AleRow = {
    split: requireString(value, 'split', where),
    harness: requireString(value, 'harness', where),
    model: requireString(value, 'model', where),
    harnessVariant: requireString(value, 'harnessVariant', where),
    runs: requireNumber(value, 'runs', where),
    tasks: requireNumber(value, 'tasks', where),
    splitTasks: requireNumber(value, 'splitTasks', where),
    passes: requireNumber(value, 'passes', where),
    passRate: requireNumber(value, 'passRate', where),
    avgScore: requireNumber(value, 'avgScore', where),
    totalCostUsd: requireNumber(value, 'totalCostUsd', where),
    costSource: requireString(value, 'costSource', where),
  };
  const label = `${where} (${row.harness} / ${row.model} / ${row.harnessVariant})`;
  if (row.runs !== row.tasks) {
    throw new Error(`ALE ${label}: runs ${row.runs} != tasks ${row.tasks}`);
  }
  if (
    !Number.isInteger(row.tasks) ||
    !Number.isInteger(row.splitTasks) ||
    !Number.isInteger(row.passes) ||
    row.tasks <= 0 ||
    row.tasks > row.splitTasks ||
    row.passes < 0 ||
    row.passes > row.tasks
  ) {
    throw new Error(`ALE ${label}: inconsistent task or pass counts`);
  }
  if (row.avgScore < 0 || row.avgScore > 1) {
    throw new Error(`ALE ${label}: avgScore ${row.avgScore} is outside 0..1`);
  }
  // passRate is diagnostic and its denominator is not uniform on the board
  // (tasks for some partial rows, splitTasks for others), so it is only
  // range-checked here and never recomputed.
  if (row.passRate < 0 || row.passRate > 1) {
    throw new Error(`ALE ${label}: passRate ${row.passRate} is outside 0..1`);
  }
  if (row.totalCostUsd < 0) {
    throw new Error(`ALE ${label}: negative totalCostUsd`);
  }
  if (row.costSource !== 'list') {
    throw new Error(
      `ALE ${label}: unsupported costSource ${JSON.stringify(row.costSource)}`,
    );
  }
  return row;
};

const rowKey = (row: Pick<AleRow, 'harness' | 'model' | 'harnessVariant'>) =>
  JSON.stringify([row.harness, row.model, row.harnessVariant]);

export function parseAlePayload(jsonText: string, version: string): AlePayload {
  const parsed: unknown = JSON.parse(jsonText);
  if (!isRecord(parsed)) throw new Error('ALE payload is not an object');
  if (!Array.isArray(parsed.rows) || parsed.rows.length === 0) {
    throw new Error('ALE payload contains no rows');
  }
  const rows = parsed.rows.map((row, index) => parseRow(row, `rows[${index}]`));
  if (!isRecord(parsed.platforms)) {
    throw new Error('ALE payload is missing platforms');
  }
  const platformNames = Object.keys(parsed.platforms).toSorted();
  if (
    platformNames.length !== ALE_PLATFORMS.length ||
    ALE_PLATFORMS.some((name) => !platformNames.includes(name))
  ) {
    throw new Error(
      `ALE platforms changed: ${platformNames.join(', ')} (expected ${ALE_PLATFORMS.join(', ')})`,
    );
  }
  const platforms: Record<string, AlePlatform> = {};
  for (const name of ALE_PLATFORMS) {
    const platform = parsed.platforms[name];
    if (!isRecord(platform) || !Array.isArray(platform.rows)) {
      throw new Error(`ALE platform ${name} has no rows`);
    }
    const taskCount = requireNumber(platform, 'taskCount', `platform ${name}`);
    if (!Number.isInteger(taskCount) || taskCount <= 0) {
      throw new Error(
        `ALE platform ${name} taskCount ${taskCount} is not a positive integer`,
      );
    }
    platforms[name] = {
      taskCount,
      rows: platform.rows.map((row, index) =>
        parseRow(row, `platforms.${name}.rows[${index}]`),
      ),
    };
  }
  for (const field of ['costRatesAsOf', 'resultsUpdatedAt'] as const) {
    if (typeof parsed[field] !== 'string' || parsed[field].length === 0) {
      throw new Error(`ALE payload is missing ${field}`);
    }
  }
  const reference = parsed.benchmarkReference;
  if (
    !isRecord(reference) ||
    typeof reference.repository !== 'string' ||
    typeof reference.commit !== 'string' ||
    typeof reference.committedAt !== 'string'
  ) {
    throw new Error('ALE payload is missing benchmarkReference');
  }

  const split = `v${version}`;
  const allRows = [
    ...rows,
    ...ALE_PLATFORMS.flatMap((name) => platforms[name]!.rows),
  ];
  const otherSplit = allRows.find((row) => row.split !== split);
  if (otherSplit) {
    throw new Error(
      `ALE row split ${JSON.stringify(otherSplit.split)} does not match the page version ${split}`,
    );
  }
  const totalTasks = ALE_PLATFORMS.reduce(
    (sum, name) => sum + platforms[name]!.taskCount,
    0,
  );
  for (const row of rows) {
    if (row.splitTasks !== totalTasks) {
      throw new Error(
        `ALE ${rowKey(row)}: splitTasks ${row.splitTasks} != platform task total ${totalTasks}`,
      );
    }
  }

  // One row per configuration in the overall table and in each platform.
  const overallKeys = new Set<string>();
  for (const row of rows) {
    if (overallKeys.has(rowKey(row))) {
      throw new Error(`ALE duplicate overall row ${rowKey(row)}`);
    }
    overallKeys.add(rowKey(row));
  }
  for (const name of ALE_PLATFORMS) {
    const platform = platforms[name]!;
    const keys = new Set<string>();
    for (const row of platform.rows) {
      if (keys.has(rowKey(row))) {
        throw new Error(`ALE duplicate ${name} row ${rowKey(row)}`);
      }
      if (!overallKeys.has(rowKey(row))) {
        throw new Error(`ALE ${name} row ${rowKey(row)} has no overall row`);
      }
      if (row.splitTasks !== platform.taskCount) {
        throw new Error(
          `ALE ${name} row ${rowKey(row)}: splitTasks ${row.splitTasks} != taskCount ${platform.taskCount}`,
        );
      }
      keys.add(rowKey(row));
    }
  }
  // Cross-check: the platform rows of every configuration add up to its
  // overall row, so the overall table is neither stale nor double-counted.
  for (const row of rows) {
    const parts = ALE_PLATFORMS.map((name) =>
      platforms[name]!.rows.find((entry) => rowKey(entry) === rowKey(row)),
    );
    const passes = parts.reduce((sum, part) => sum + (part?.passes ?? 0), 0);
    const tasks = parts.reduce((sum, part) => sum + (part?.tasks ?? 0), 0);
    if (passes !== row.passes || tasks !== row.tasks) {
      throw new Error(
        `ALE platform cross-check failed for ${rowKey(row)}: linux+windows passes ${passes} / tasks ${tasks} vs overall ${row.passes} / ${row.tasks}`,
      );
    }
    // Each published total is rounded to the cent, so allow one cent per part.
    const cost = parts.reduce(
      (sum, part) => sum + (part?.totalCostUsd ?? 0),
      0,
    );
    if (
      Math.abs(cost - row.totalCostUsd) >
      0.01 * ALE_PLATFORMS.length + 1e-9
    ) {
      throw new Error(
        `ALE platform cost cross-check failed for ${rowKey(row)}: linux+windows totalCostUsd ${cost} vs overall ${row.totalCostUsd}`,
      );
    }
  }

  return {
    rows,
    platforms,
    costRatesAsOf: parsed.costRatesAsOf as string,
    resultsUpdatedAt: parsed.resultsUpdatedAt as string,
    benchmarkReference: {
      repository: reference.repository,
      commit: reference.commit,
      committedAt: reference.committedAt,
    },
  };
}

export interface MaterializeAleContext {
  apiEvidenceId: string;
  pageEvidenceId: string;
  apiUrl: string;
  observedAt: string;
  version: string;
}

export interface MaterializeAleResult {
  candidates: CandidateResult[];
  costs: CostRecord[];
  validationReport: string;
  version: string;
  rowCount: number;
  resolvedRowsCount: number;
  unresolvedRowsCount: number;
  unresolvedModels: string[];
  excludedCandidatesCount: number;
  partialCoverageRows: string[];
  resultsUpdatedAt: string;
  costRatesAsOf: string;
  benchmarkCommit: string;
}

interface Entry {
  row: AleRow;
  candidate: CandidateResult;
  cost: CostRecord;
}

const effortFor = (
  row: AleRow,
): { effort: string | null; recognized: boolean } => {
  const match = /^reasoning-([a-z0-9_-]+)$/u.exec(row.harnessVariant);
  if (!match) return { effort: null, recognized: false };
  const raw = match[1]!;
  // ALE passes the variant to the harness as an explicit reasoning-effort
  // setting, so `none` is a deliberate non-reasoning run even when it is the
  // model's only row on the board (unlike FrontierCode's unlabelled `none`).
  if (raw === 'none') return { effort: 'non-reasoning', recognized: true };
  const effort = normalizeSourceEffort(raw);
  return effort !== null && LEGAL_SOURCE_EFFORTS.has(effort)
    ? { effort, recognized: true }
    : { effort: null, recognized: false };
};

const exclude = (entry: Entry, reason: string): void => {
  for (const record of [entry.candidate, entry.cost]) {
    record.inclusion = 'EXCLUDED';
    record.exclusionReason = record.exclusionReason
      ? `${record.exclusionReason} ${reason}`
      : reason;
  }
};

export function materializeAle(
  jsonText: string,
  context: MaterializeAleContext,
): MaterializeAleResult {
  const payload = parseAlePayload(jsonText, context.version);
  const versionSlug = slugify(context.version);
  const sourcePublishedAt = new Date(payload.resultsUpdatedAt).toISOString();

  const entries: Entry[] = payload.rows.map((row) => {
    const canonicalModelId = resolveCatalogModel(row.model).canonicalModelId;
    const { effort, recognized } = effortFor(row);
    const profileId =
      canonicalModelId && effort
        ? `${canonicalModelId}-${slugify(effort)}`
        : null;
    const model = { rawName: row.model, canonicalModelId, profileId };
    const profile = {
      effort,
      thinking: null,
      tools: true,
      harness: row.harness,
      contextWindowTokens: null,
      quantization: null,
      attempts: 1,
    };
    const selector = `$.rows[harness=${JSON.stringify(row.harness)},model=${JSON.stringify(row.model)},harnessVariant=${JSON.stringify(row.harnessVariant)}]`;
    const partial = row.tasks < row.splitTasks;
    const coverage = partial
      ? `; partial coverage: ${row.tasks} of ${row.splitTasks} tasks`
      : '';
    const score = row.avgScore * 100;
    const perTask = row.totalCostUsd / row.tasks;
    const rowSlug = `${slugify(row.harness)}-${slugify(row.model)}-${slugify(row.harnessVariant)}`;
    const reason = recognized
      ? null
      : `${ALE_UNRECOGNISED_VARIANT_PREFIX} ${JSON.stringify(row.harnessVariant)} has not been reviewed as an effort tier.`;
    const inclusion = reason === null ? 'INCLUDED' : 'EXCLUDED';
    const evidenceIds = [context.apiEvidenceId, context.pageEvidenceId];
    const costLocator = `${selector}.{totalCostUsd=${row.totalCostUsd},tasks=${row.tasks},costSource=${row.costSource}}; USD per task = totalCostUsd / tasks; list prices as of ${payload.costRatesAsOf}${coverage}`;

    const candidate = CandidateResultSchema.parse({
      schemaVersion: 'candidate-result-v1',
      id: `${ALE_SOURCE_ID}:${ALE_BENCHMARK_ID}:${rowSlug}:${versionSlug}`,
      sourceId: ALE_SOURCE_ID,
      sourceRole: 'ORGANIZER',
      benchmarkId: ALE_BENCHMARK_ID,
      benchmarkVersion: context.version,
      model,
      profile,
      metric: {
        id: 'average-score',
        name: 'Average score',
        unit: 'percent',
        higherIsBetter: true,
      },
      rawScore: score,
      normalizedScore: score,
      acquisitionStatus: 'FULL',
      inclusion,
      exclusionReason: reason,
      sourceUrl: ALE_PAGE_URL,
      observedAt: context.observedAt,
      sourcePublishedAt,
      evidenceIds,
      provenance: {
        profile: {
          evidenceId: context.apiEvidenceId,
          locator: `${selector}.{model,harness,harnessVariant,runs=${row.runs},tasks=${row.tasks},splitTasks=${row.splitTasks}}${coverage}`,
          method: 'API_RESPONSE',
        },
        rawScore: {
          evidenceId: context.apiEvidenceId,
          locator: `${selector}.avgScore=${row.avgScore} (× 100)${coverage}`,
          method: 'API_RESPONSE',
        },
        passRate: {
          evidenceId: context.apiEvidenceId,
          locator: `${selector}.passRate=${row.passRate} (passes ${row.passes}, tasks ${row.tasks}, splitTasks ${row.splitTasks}); diagnostic only, not scored`,
          method: 'API_RESPONSE',
        },
        cost: {
          evidenceId: context.apiEvidenceId,
          locator: costLocator,
          method: 'API_RESPONSE',
        },
      },
    });
    const cost = CostRecordSchema.parse({
      schemaVersion: 'cost-record-v1',
      id: `${ALE_SOURCE_ID}:cost-per-task:${rowSlug}:${versionSlug}`,
      sourceId: ALE_SOURCE_ID,
      model,
      profile,
      costType: 'AGENT_TASK',
      metricId: 'cost-per-task',
      metricName: "Agents' Last Exam cost per task",
      unit: 'USD_PER_TASK',
      inputPerMillionTokens: null,
      outputPerMillionTokens: null,
      cost: perTask,
      assumptionId: null,
      benchmarkId: ALE_BENCHMARK_ID,
      benchmarkVersion: context.version,
      inclusion,
      exclusionReason: reason,
      sourceUrl: ALE_PAGE_URL,
      observedAt: context.observedAt,
      sourcePublishedAt,
      evidenceIds,
      provenance: {
        cost: {
          evidenceId: context.apiEvidenceId,
          locator: costLocator,
          method: 'API_RESPONSE',
        },
      },
    });
    return { row, candidate, cost };
  });

  // A canonical profile run under several harnesses has no reviewed choice
  // between them, so none of those rows is used.
  const byProfile = new Map<string, Entry[]>();
  for (const entry of entries) {
    const { canonicalModelId } = entry.candidate.model;
    if (canonicalModelId === null) continue;
    const key = JSON.stringify([
      canonicalModelId,
      entry.candidate.profile.effort ?? `raw:${entry.row.harnessVariant}`,
    ]);
    byProfile.set(key, [...(byProfile.get(key) ?? []), entry]);
  }
  for (const group of byProfile.values()) {
    if (new Set(group.map(({ row }) => row.harness)).size > 1) {
      for (const entry of group) exclude(entry, ALE_MULTIPLE_HARNESS_REASON);
    }
  }

  const candidates = entries
    .map(({ candidate }) => candidate)
    .toSorted((left, right) => left.id.localeCompare(right.id));
  const costs = entries
    .map(({ cost }) => cost)
    .toSorted((left, right) => left.id.localeCompare(right.id));
  // Slugs can collide (e.g. `claude_code` and `claude-code`); replay rejects
  // duplicate ids, so the refresh must fail first.
  for (const records of [candidates, costs]) {
    const ids = new Set<string>();
    for (const { id } of records) {
      if (ids.has(id)) throw new Error(`ALE duplicate record id ${id}`);
      ids.add(id);
    }
  }
  const unresolvedModels = [
    ...new Set(
      entries
        .filter(({ candidate }) => candidate.model.canonicalModelId === null)
        .map(({ row }) => row.model),
    ),
  ].toSorted((left, right) => left.localeCompare(right));
  const resolvedRowsCount = candidates.filter(
    ({ model }) => model.canonicalModelId !== null,
  ).length;
  const excluded = entries.filter(
    ({ candidate }) => candidate.inclusion === 'EXCLUDED',
  );
  const describe = ({ row }: Entry) =>
    `${row.model} / ${row.harness} / ${row.harnessVariant}`;
  const partialCoverageRows = entries
    .filter(({ row }) => row.tasks < row.splitTasks)
    .map(
      (entry) =>
        `${describe(entry)}: ${entry.row.tasks} of ${entry.row.splitTasks} tasks`,
    )
    .toSorted((left, right) => left.localeCompare(right));
  const totalTasks = ALE_PLATFORMS.reduce(
    (sum, name) => sum + payload.platforms[name]!.taskCount,
    0,
  );

  const validationReport = [
    "# Agents' Last Exam acquisition validation",
    '',
    `- Page: <${ALE_PAGE_URL}>`,
    `- Data endpoint: <${context.apiUrl}>`,
    `- API evidence: \`${context.apiEvidenceId}\``,
    `- Page evidence: \`${context.pageEvidenceId}\``,
    `- Observed at: ${context.observedAt}`,
    `- Results updated at (source): ${payload.resultsUpdatedAt}`,
    `- Cost rates as of (source): ${payload.costRatesAsOf}`,
    `- Task definitions: ${payload.benchmarkReference.repository} @ \`${payload.benchmarkReference.commit}\` (${payload.benchmarkReference.committedAt})`,
    '',
    '## Exact counts',
    '',
    '| Check | Count |',
    '|---|---:|',
    `| Leaderboard rows parsed | ${candidates.length} |`,
    ...ALE_PLATFORMS.map(
      (name) =>
        `| ${name} platform rows (taskCount ${payload.platforms[name]!.taskCount}) | ${payload.platforms[name]!.rows.length} |`,
    ),
    `| Tasks in the split | ${totalTasks} |`,
    `| Cost records emitted | ${costs.length} |`,
    `| Canonically resolved rows | ${resolvedRowsCount} |`,
    `| Canonically unresolved rows | ${candidates.length - resolvedRowsCount} |`,
    `| Distinct canonically unresolved names | ${unresolvedModels.length} |`,
    `| Partial-coverage rows (tasks < splitTasks) | ${partialCoverageRows.length} |`,
    `| Excluded candidate rows | ${excluded.length} |`,
    '',
    '## Benchmark contract',
    '',
    `- Version \`${context.version}\` is read from the page header and the leaderboard version prop; every row's split is \`v${context.version}\`.`,
    '- Score: `avgScore × 100` (average task score, percent). `passRate` is diagnostic only; it stays in each candidate provenance and is not materialized as a score. Its published denominator is not uniform on partial-coverage rows (tasks for some, splitTasks for others), so it is kept as published and never recomputed.',
    '- Cost: `totalCostUsd / tasks` as USD per task (`AGENT_TASK`), list prices (`costSource: list`) as of the source `costRatesAsOf`.',
    '- Effort: `harnessVariant` `reasoning-<effort>`. `reasoning-none` is an explicit setting passed to the harness, so it is always `non-reasoning`. Unrecognised variants are excluded row by row.',
    '- Every row must have runs equal to tasks and finite numeric fields; platform task counts must be positive integers; the linux and windows platform rows of every configuration must add up to its overall passes and tasks, and to its total cost within one cent per platform of rounding.',
    '- Who executes the runs (organizer or vendor submission) is not stated by the board or the repository README: unknown.',
    '',
    '## Partial-coverage rows (included and disclosed)',
    '',
    ...(partialCoverageRows.length === 0
      ? ['- None']
      : partialCoverageRows.map((row) => `- ${row}`)),
    '',
    '## Excluded rows',
    '',
    ...(excluded.length === 0
      ? ['- None']
      : excluded
          .map(
            (entry) =>
              `- ${describe(entry)}: ${entry.candidate.exclusionReason}`,
          )
          .toSorted((left, right) => left.localeCompare(right))),
    '',
    '## Unresolved model names',
    '',
    ...(unresolvedModels.length === 0
      ? ['- None']
      : unresolvedModels.map((name) => `- ${name}`)),
    '',
  ].join('\n');

  return {
    candidates,
    costs,
    validationReport,
    version: context.version,
    rowCount: candidates.length,
    resolvedRowsCount,
    unresolvedRowsCount: candidates.length - resolvedRowsCount,
    unresolvedModels,
    excludedCandidatesCount: excluded.length,
    partialCoverageRows,
    resultsUpdatedAt: payload.resultsUpdatedAt,
    costRatesAsOf: payload.costRatesAsOf,
    benchmarkCommit: payload.benchmarkReference.commit,
  };
}
