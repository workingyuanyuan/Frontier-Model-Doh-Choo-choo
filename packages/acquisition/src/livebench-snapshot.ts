import {
  CandidateResultSchema,
  CostRecordSchema,
  type CandidateResult,
  type CostRecord,
} from '@llm-bench/benchmark-data';

import {
  LIVEBENCH2_SUITES,
  materializeLiveBench2,
  readLiveBench2Registry,
  type LiveBench2Release,
} from './livebench2-materializer.js';
import { materializeLiveBench } from './livebench-materializer.js';
import {
  materializeLiveBench2Costs,
  materializeLiveBenchCosts,
} from './pricing-materializers.js';

export interface LiveBenchFile {
  text: string;
  evidenceId: string;
  url: string;
  retrievedAt: string;
  method: CostRecord['provenance'][string]['method'];
}

export interface LiveBenchReleaseFiles {
  table: LiveBenchFile;
  categories: LiveBenchFile;
  cost: LiveBenchFile;
}

/**
 * LiveBench 1.0 benchmarks that 2.0 dropped. The owner's rule keeps data for
 * removed benchmarks, so these stay on the frozen 1.0 release.
 */
export const LIVEBENCH_V1_RETAINED = [
  'livebench-language',
  'livebench-instruction-following',
  'livebench-mathematics',
] as const;

export const LIVEBENCH_V1_COST_SUPERSEDED_REASON =
  'Superseded by LiveBench 2.0 cost per task; the 1.0 cost per successful task remains as evidence only.';

export const LIVEBENCH_V1_SUPERSEDED_REASON =
  'Superseded by LiveBench 2.0 Reasoning; the 1.0 row remains as evidence only.';

export interface LiveBenchSnapshotInput {
  mainJs: string;
  jsEvidenceId: string;
  jsUrl: string;
  v1: LiveBenchReleaseFiles;
  v2: LiveBenchReleaseFiles;
  release2: LiveBench2Release;
  /** Retained 1.0 rows must match these exactly; null skips the check. */
  previousCandidates: readonly CandidateResult[] | null;
}

export interface LiveBenchSnapshot {
  candidates: CandidateResult[];
  costs: CostRecord[];
  validationReport: string;
  v1Release: string;
  v1PopulationRows: number;
  v2Models: string[];
  unresolvedModels: string[];
}

export function buildLiveBenchSnapshot(
  input: LiveBenchSnapshotInput,
): LiveBenchSnapshot {
  const v1 = materializeLiveBench(
    input.mainJs,
    input.v1.table.text,
    input.v1.categories.text,
    input.v1.table.retrievedAt,
    {
      tableEvidenceId: input.v1.table.evidenceId,
      categoriesEvidenceId: input.v1.categories.evidenceId,
      jsEvidenceId: input.jsEvidenceId,
      tableUrl: input.v1.table.url,
      categoriesUrl: input.v1.categories.url,
      jsUrl: input.jsUrl,
    },
  );
  // Every 1.0 Reasoning row is superseded, including models 2.0 does not
  // list: the selector does not compare benchmark versions.
  const v1Candidates = v1.candidates.map((candidate) =>
    candidate.benchmarkId === 'livebench-reasoning'
      ? CandidateResultSchema.parse({
          ...candidate,
          inclusion: 'EXCLUDED',
          exclusionReason: LIVEBENCH_V1_SUPERSEDED_REASON,
        })
      : candidate,
  );

  const previous = new Map(
    (input.previousCandidates ?? []).map((candidate) => [
      candidate.id,
      candidate,
    ]),
  );
  // The 1.0 release still gains models after 2.0 launched; additions are
  // accepted, but a saved row may not disappear or change its score.
  const retained = v1Candidates.filter(({ benchmarkId }) =>
    (LIVEBENCH_V1_RETAINED as readonly string[]).includes(benchmarkId),
  );
  const retainedIds = new Set(retained.map(({ id }) => id));
  const changed = retained.filter((candidate) => {
    const before = previous.get(candidate.id);
    return before !== undefined && before.rawScore !== candidate.rawScore;
  });
  const missing = [...previous.values()].filter(
    ({ id, benchmarkId }) =>
      (LIVEBENCH_V1_RETAINED as readonly string[]).includes(benchmarkId) &&
      !retainedIds.has(id),
  );
  const added = retained.filter(({ id }) => !previous.has(id));
  if (input.previousCandidates !== null && (changed.length || missing.length)) {
    throw new Error(
      `LiveBench 1.0 retained rows changed: ${[...changed, ...missing]
        .slice(0, 5)
        .map(({ id }) => id)
        .join(', ')}`,
    );
  }

  const v2 = materializeLiveBench2(
    input.mainJs,
    input.v2.table.text,
    input.v2.categories.text,
    {
      release: input.release2,
      tableEvidenceId: input.v2.table.evidenceId,
      categoriesEvidenceId: input.v2.categories.evidenceId,
      jsEvidenceId: input.jsEvidenceId,
      tableUrl: input.v2.table.url,
      observedAt: input.v2.table.retrievedAt,
    },
  );

  const efforts = new Map(
    v2.models.map((model) => [
      model,
      readLiveBench2Registry(input.mainJs, model)?.effort ?? null,
    ]),
  );
  // Token prices are current facts, so 2.0 replaces a 1.0 price for the same
  // profile; 1.0 cost-per-successful-task records keep their own IDs.
  const costs = new Map<string, CostRecord>();
  for (const cost of materializeLiveBenchCosts(input.v1.cost.text, {
    sourceUrl: input.v1.cost.url,
    evidenceId: input.v1.cost.evidenceId,
    observedAt: input.v1.cost.retrievedAt,
    method: input.v1.cost.method,
  })) {
    // A 1.0 task cost would be blended with the 2.0 one for the same profile;
    // 2.0 supersedes it, so the 1.0 figure stays only as evidence.
    costs.set(
      cost.id,
      cost.costType === 'MEASURED_TASK'
        ? CostRecordSchema.parse({
            ...cost,
            inclusion: 'EXCLUDED',
            exclusionReason: LIVEBENCH_V1_COST_SUPERSEDED_REASON,
          })
        : cost,
    );
  }
  for (const cost of materializeLiveBench2Costs(input.v2.cost.text, efforts, {
    sourceUrl: input.v2.cost.url,
    evidenceId: input.v2.cost.evidenceId,
    observedAt: input.v2.cost.retrievedAt,
    method: input.v2.cost.method,
    benchmarkVersion: input.release2.date,
  })) {
    costs.set(cost.id, cost);
  }

  const candidates = [...v1Candidates, ...v2.candidates].toSorted(
    (left, right) => left.id.localeCompare(right.id),
  );
  const unresolvedModels = [
    ...new Set([
      ...v1.unresolvedModels.map(({ rawName }) => rawName),
      ...v2.unresolvedModels,
    ]),
  ].toSorted();
  const validationReport = [
    '# LiveBench acquisition validation',
    '',
    `LiveBench now publishes two generations. Release ${input.release2.date} (LiveBench 2.0) supplies seven suites; the frozen 1.0 release ${v1.release} keeps the benchmarks that 2.0 dropped.`,
    '',
    '## Exact counts',
    '',
    '| Check | Count |',
    '|---|---:|',
    `| 2.0 model rows (\`${input.v2.table.url}\`) | ${v2.models.length} |`,
    `| 2.0 suite candidates | ${v2.candidates.length} |`,
    `| 2.0 blank (still running) cells | ${v2.blankCells.length} |`,
    `| 1.0 model rows (\`${input.v1.table.url}\`) | ${v1.populationRows} |`,
    `| 1.0 retained candidates (Language, IF, Mathematics) | ${retained.length} |`,
    `| 1.0 Reasoning candidates excluded as superseded | ${v1Candidates.length - retained.length} |`,
    `| Cost records | ${costs.size} |`,
    `| Distinct unresolved raw model names | ${unresolvedModels.length} |`,
    '',
    '## LiveBench 2.0 suites',
    '',
    '| Suite | Benchmark ID | Tools |',
    '|---|---|---|',
    ...LIVEBENCH2_SUITES.map(
      ({ category, benchmarkId, tools }) =>
        `| ${category} | \`${benchmarkId}\` | ${tools ? 'yes' : 'no'} |`,
    ),
    '',
    '- Each cell is the official suite score (mean task score 0–100, single run); unmeasured tasks score 0 upstream and a blank cell is not materialized.',
    '- Effort comes from the 2.0 model registry in the application bundle; models run at their highest supported effort unless the registry says otherwise.',
    '- `livebench-reasoning` continues on the 2.0 Reasoning suite (same task family, new release).',
    Object.keys(v2.overallWeights).length === 0
      ? '- The release weights every suite equally in its own Overall; Overall is not materialized.'
      : `- The release's own Overall weights ${Object.entries(v2.overallWeights)
          .map(([category, weight]) => `${category} ×${weight}`)
          .join(
            ', ',
          )} and every other suite ×1 (\`_overall_weights\`); Overall is not materialized, so the weights do not affect suite scores.`,
    input.previousCandidates === null
      ? '- Retained 1.0 rows were not compared (no saved snapshot supplied).'
      : `- Retained 1.0 rows compared with the saved snapshot by candidate ID and score: none removed or changed; ${added.length} added since the last capture${added.length ? ` (${[...new Set(added.map(({ model }) => model.rawName))].join(', ')})` : ''}.`,
    '- 2.0 cost per task is Σ suite cost / Σ suite tasks, as the methodology defines it. 1.0 cost-per-successful-task records are kept but EXCLUDED, so the two generations are never blended.',
    '',
    '## Unresolved model names',
    '',
    unresolvedModels.length === 0
      ? '- None.'
      : unresolvedModels.map((name) => `- \`${name}\``).join('\n'),
    '',
  ].join('\n');

  return {
    candidates,
    costs: [...costs.values()].toSorted((left, right) =>
      left.id.localeCompare(right.id),
    ),
    validationReport,
    v1Release: v1.release,
    v1PopulationRows: v1.populationRows,
    v2Models: v2.models,
    unresolvedModels,
  };
}

interface LiveBenchEvidence {
  id: string;
  requestUrl: string;
  retrievedAt: string;
  mediaType: string;
  method: LiveBenchFile['method'];
}

/** Locates both releases' saved files in a snapshot's evidence index. */
export function liveBenchInputFromEvidence<T extends LiveBenchEvidence>(
  evidence: readonly T[],
  readText: (record: T) => string,
  previousCandidates: readonly CandidateResult[] | null,
): LiveBenchSnapshotInput {
  const find = (pattern: RegExp, label: string) => {
    const record = evidence.find(({ requestUrl }) => pattern.test(requestUrl));
    if (!record) throw new Error(`LiveBench evidence for ${label} not found`);
    return record;
  };
  const file = (pattern: RegExp, label: string): LiveBenchFile => {
    const record = find(pattern, label);
    return {
      text: readText(record),
      evidenceId: record.id,
      url: record.requestUrl,
      retrievedAt: record.retrievedAt,
      method: record.method,
    };
  };
  const js = find(/\/static\/js\/main\.[^/]+\.js$/u, 'main.js');
  const v2Table = find(/\/data\/\d{8}\/table\.csv(?:\?|$)/u, '2.0 table');
  const path = /\/data\/(\d{8})\//u.exec(v2Table.requestUrl)![1]!;
  return {
    mainJs: readText(js),
    jsEvidenceId: js.id,
    jsUrl: js.requestUrl,
    release2: {
      path,
      date: `${path.slice(0, 4)}-${path.slice(4, 6)}-${path.slice(6, 8)}`,
    },
    v1: {
      table: file(/\/v1\/table_\d{4}_\d{2}_\d{2}\.csv/u, '1.0 table'),
      categories: file(
        /\/v1\/categories_\d{4}_\d{2}_\d{2}\.json/u,
        '1.0 categories',
      ),
      cost: file(/\/v1\/cost_\d{4}_\d{2}_\d{2}\.csv/u, '1.0 cost'),
    },
    v2: {
      table: file(/\/data\/\d{8}\/table\.csv(?:\?|$)/u, '2.0 table'),
      categories: file(
        /\/data\/\d{8}\/categories\.json(?:\?|$)/u,
        '2.0 categories',
      ),
      cost: file(/\/data\/\d{8}\/cost\.csv(?:\?|$)/u, '2.0 cost'),
    },
    previousCandidates,
  };
}
