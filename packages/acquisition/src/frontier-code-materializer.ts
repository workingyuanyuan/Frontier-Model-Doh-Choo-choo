import {
  CandidateResultSchema,
  CostRecordSchema,
  type CandidateResult,
  type CostRecord,
} from '@llm-bench/benchmark-data';

import {
  normalizeSourceEffort,
  resolveCatalogModel,
  slugify,
} from './materializer-utils.js';

/**
 * Cognition publishes FrontierCode 1.1 and FrontierCode 2.0 as different
 * benchmarks. Since 2026-10-27 the main page renders only the 2.0 board; the
 * 1.1 rows stay in the original static export, which is no longer rendered.
 */
export const FRONTIER_CODE_PAGE_URL = 'https://cognition.com/frontiercode';
/** The FrontierCode 1.1 export (`v1_1`); the page no longer renders it. */
export const FRONTIER_CODE_DATA_URL =
  'https://cognition.com/data/frontiercode-leaderboard/data.json';
/** The FrontierCode 2.0 export the main page renders. */
export const FRONTIER_CODE_2_0_DATA_URL =
  'https://cognition.com/data/frontier-code-2.0/data.json';

export const FRONTIER_CODE_1_1_BENCHMARK_ID = 'frontier-code-1-1';
export const FRONTIER_CODE_2_0_BENCHMARK_ID = 'frontier-code-2-0';
export const FRONTIER_CODE_2_0_ITEM_LIST = 'FrontierCode 2.0 Leaderboard';

/**
 * User decision 2026-10-28: the FrontierCode 2.0 rollout cost replaces 1.1 in
 * the cost chart. The 1.1 cost records stay with stable IDs as evidence only,
 * so the chart never takes a median across the two versions.
 */
export const FRONTIER_CODE_1_1_COST_SUPERSEDED_REASON =
  'Superseded by the FrontierCode 2.0 mean rollout cost (user decision 2026-10-28); the 1.1 cost remains as evidence only.';

interface FrontierCodeMetrics {
  correct?: number | null;
  new_score?: number | null;
  tokens?: number | null;
  cost?: number | null;
  tool_calls?: number | null;
  steps?: number | null;
  ote?: number | null;
  flagged_rate?: number | null;
}

interface FrontierCodeConfiguration {
  main?: FrontierCodeMetrics;
  extended?: FrontierCodeMetrics;
}

interface FrontierCodeVersion {
  models?: string[];
  harness?: Record<string, string>;
  efforts?: Record<string, string[]>;
  data?: Record<string, Record<string, FrontierCodeConfiguration>>;
}

interface CompleteFrontierCodeVersion {
  models: string[];
  harness: Record<string, string>;
  efforts: Record<string, string[]>;
  data: Record<string, Record<string, FrontierCodeConfiguration>>;
}

export interface FrontierCodeTopTenRow {
  position: number;
  name: string;
  score: number;
}

export interface MaterializeFrontierCode11Context {
  dataEvidenceId: string;
  observedAt: string;
}

export interface FrontierCodePreviousSnapshot {
  candidates: readonly CandidateResult[];
  costs: readonly CostRecord[];
}

export interface MaterializeFrontierCode11Result {
  candidates: CandidateResult[];
  costs: CostRecord[];
  /** Models in the current `v1_1` export. */
  exportModelCount: number;
  /** Main configurations in the current `v1_1` export. */
  exportConfigurationCount: number;
  exportCostCount: number;
  /** Distinct models after preserving upstream-removed rows. */
  modelCount: number;
  modelsWithMultipleEfforts: number;
  modelsWithFiveEfforts: number;
  unresolvedModels: string[];
  /** Previous-snapshot models whose rows the export no longer carries. */
  preservedModels: string[];
  preservedCandidateIds: string[];
  preservedCostIds: string[];
  /** Export rows not present in the previous snapshot. */
  addedCandidateIds: string[];
  /** Rows whose score or cost differs from the previous snapshot. */
  valueChanges: string[];
  /** Evidence IDs that preserved rows still reference. */
  preservedEvidenceIds: string[];
}

export interface MaterializeFrontierCode20Context {
  dataEvidenceId: string;
  pageEvidenceId: string;
  observedAt: string;
  /** Rows in the rendered "Best reasoning mode" board. */
  visualBestRowCount: number;
  /** Rows in the rendered "All reasoning levels" board. */
  visualAllRowCount: number;
  visualTopTenMatched: boolean;
  /** Export models the page does not render (its `hiddenModels`). */
  hiddenModels: readonly string[];
}

export interface MaterializeFrontierCode20Result {
  candidates: CandidateResult[];
  /** INCLUDED mean rollout costs of the visible configurations. */
  costs: CostRecord[];
  modelCount: number;
  configurationCount: number;
  /** Visible configurations that carry a cost; equals costs.length. */
  configurationsWithCost: number;
  modelsWithMultipleEfforts: number;
  unresolvedModels: string[];
  hiddenModels: string[];
  topTen: FrontierCodeTopTenRow[];
  topTenMatches: number;
  topTenMismatches: string[];
}

const asRecord = (value: unknown): Record<string, unknown> | null =>
  typeof value === 'object' && value !== null
    ? (value as Record<string, unknown>)
    : null;

const findItemList = (
  value: unknown,
  listName: string,
): Record<string, unknown> | null => {
  if (Array.isArray(value)) {
    for (const child of value) {
      const found = findItemList(child, listName);
      if (found) return found;
    }
    return null;
  }
  const record = asRecord(value);
  if (!record) return null;
  const type = record['@type'];
  if (
    (type === 'ItemList' ||
      (Array.isArray(type) && type.includes('ItemList'))) &&
    record.name === listName
  ) {
    return record;
  }
  for (const child of Object.values(record)) {
    const found = findItemList(child, listName);
    if (found) return found;
  }
  return null;
};

export function extractFrontierCodeTopTen(
  html: string,
  listName: string = FRONTIER_CODE_2_0_ITEM_LIST,
): FrontierCodeTopTenRow[] {
  const scripts = [
    ...html.matchAll(
      /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/giu,
    ),
  ];
  for (const match of scripts) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(match[1] ?? '');
    } catch {
      continue;
    }
    const itemList = findItemList(parsed, listName);
    if (!itemList || !Array.isArray(itemList.itemListElement)) continue;
    const rows = itemList.itemListElement.map((value) => {
      const item = asRecord(value);
      const position = Number(item?.position);
      const name = item?.name;
      const scoreMatch =
        typeof item?.description === 'string'
          ? item.description.match(/^Score\s+([0-9]+(?:\.[0-9]+)?)%$/u)
          : null;
      if (
        !Number.isInteger(position) ||
        typeof name !== 'string' ||
        !scoreMatch
      ) {
        throw new Error('FrontierCode JSON-LD ItemList row is malformed');
      }
      return { position, name, score: Number(scoreMatch[1]) };
    });
    return rows.toSorted((left, right) => left.position - right.position);
  }
  throw new Error(`FrontierCode JSON-LD ItemList "${listName}" was not found`);
}

// FrontierCode keys some configurations by a sampling parameter rather than a
// reasoning effort (Inkling is keyed "0.99"), and 2.0 keys unlabelled SWE
// models "na". Only the efforts declared in data/mappings/profile-policy.json
// may become a product profile; anything else is treated as unlabelled. The
// raw key stays in the provenance locator.
const profileIdFor = (
  canonicalModelId: string | null,
  effort: string | null,
): string | null =>
  canonicalModelId && effort ? `${canonicalModelId}-${slugify(effort)}` : null;

interface VersionSpec {
  benchmarkId: string;
  benchmarkVersion: string;
  /** JSONPath prefix of the version object inside its export. */
  root: string;
  label: string;
  /** Cost ID prefix; 1.1 keeps its original IDs, 2.0 must not collide. */
  costIdPrefix: string;
  costMetricName: string;
  /** Null when the cost feeds the cost chart. */
  costExclusionReason: string | null;
}

const V1_1: VersionSpec = {
  benchmarkId: FRONTIER_CODE_1_1_BENCHMARK_ID,
  benchmarkVersion: '1.1',
  root: '$.v1_1',
  label: 'FrontierCode 1.1',
  costIdPrefix: 'frontier-code:mean-rollout-cost',
  costMetricName: 'Mean FrontierCode rollout cost',
  costExclusionReason: FRONTIER_CODE_1_1_COST_SUPERSEDED_REASON,
};

const V2_0: VersionSpec = {
  benchmarkId: FRONTIER_CODE_2_0_BENCHMARK_ID,
  benchmarkVersion: '2.0',
  root: '$',
  label: 'FrontierCode 2.0',
  costIdPrefix: `frontier-code:${FRONTIER_CODE_2_0_BENCHMARK_ID}:mean-rollout-cost`,
  costMetricName: 'Mean FrontierCode 2.0 rollout cost',
  costExclusionReason: null,
};

/** Mark a 1.1 cost (fresh or preserved from an older snapshot) superseded. */
const supersedeV11Cost = (cost: CostRecord): CostRecord =>
  CostRecordSchema.parse({
    ...cost,
    inclusion: 'EXCLUDED',
    exclusionReason: FRONTIER_CODE_1_1_COST_SUPERSEDED_REASON,
  });

const mainLocator = (
  spec: VersionSpec,
  model: string,
  effort: string,
  field: string,
): string =>
  `${spec.root}.data[${JSON.stringify(model)}][${JSON.stringify(effort)}].main.${field}`;

const profileLocator = (
  spec: VersionSpec,
  model: string,
  effort: string,
): string =>
  `${spec.root}.{harness[${JSON.stringify(model)}],efforts[${JSON.stringify(model)}],data[${JSON.stringify(model)}][${JSON.stringify(effort)}]}`;

const requireComplete = (
  version: FrontierCodeVersion | undefined,
  label: string,
): CompleteFrontierCodeVersion => {
  if (!version?.models || !version.data || !version.efforts) {
    throw new Error(`${label} export has no complete dataset`);
  }
  return {
    models: version.models,
    harness: version.harness ?? {},
    efforts: version.efforts,
    data: version.data,
  };
};

interface BuiltRows {
  candidates: CandidateResult[];
  costs: CostRecord[];
  unresolvedModels: string[];
  effortsByModel: Map<string, string[]>;
  configurationsWithCost: number;
}

const buildRows = (
  spec: VersionSpec,
  version: CompleteFrontierCodeVersion,
  models: readonly string[],
  evidence: {
    dataEvidenceId: string;
    candidateEvidenceIds: string[];
    observedAt: string;
  },
): BuiltRows => {
  const candidates: CandidateResult[] = [];
  const costs: CostRecord[] = [];
  const unresolvedModels = new Set<string>();
  const effortsByModel = new Map<string, string[]>();
  let configurationsWithCost = 0;

  for (const model of models) {
    const configurations = version.data[model];
    const efforts = version.efforts[model];
    if (!configurations || !efforts || efforts.length === 0) {
      throw new Error(`${spec.label} has no configurations for ${model}`);
    }
    effortsByModel.set(model, efforts);
    const canonicalModelId = resolveCatalogModel(model).canonicalModelId;
    if (!canonicalModelId) unresolvedModels.add(model);
    const harness = version.harness[model] ?? null;

    for (const rawEffort of efforts) {
      const metrics = configurations[rawEffort]?.main;
      if (!metrics || !Number.isFinite(metrics.new_score)) {
        throw new Error(
          `${spec.label} Main score is missing for ${model} / ${rawEffort}`,
        );
      }
      const effort = normalizeSourceEffort(rawEffort);
      const profileId = profileIdFor(canonicalModelId, effort);
      const score = metrics.new_score as number;
      const suffix = `${slugify(model)}-${slugify(rawEffort)}`;
      const commonModel = { rawName: model, canonicalModelId, profileId };
      // Neither export nor methodology states a per-configuration rollout
      // count, so attempts stays null.
      const commonProfile = {
        effort,
        thinking: null,
        tools: null,
        harness,
        contextWindowTokens: null,
        quantization: null,
        attempts: null,
      };

      candidates.push(
        CandidateResultSchema.parse({
          schemaVersion: 'candidate-result-v1',
          id: `frontier-code:${spec.benchmarkId}:${suffix}`,
          sourceId: 'frontier-code',
          sourceRole: 'ORGANIZER',
          benchmarkId: spec.benchmarkId,
          benchmarkVersion: spec.benchmarkVersion,
          model: commonModel,
          profile: commonProfile,
          metric: {
            id: 'weighted-rubric-score',
            name: 'Weighted rubric score',
            unit: 'percent',
            higherIsBetter: true,
          },
          rawScore: score,
          normalizedScore: score * 100,
          acquisitionStatus: 'FULL',
          inclusion: 'INCLUDED',
          exclusionReason: null,
          sourceUrl: FRONTIER_CODE_PAGE_URL,
          observedAt: evidence.observedAt,
          sourcePublishedAt: null,
          evidenceIds: evidence.candidateEvidenceIds,
          provenance: {
            profile: {
              evidenceId: evidence.dataEvidenceId,
              locator: profileLocator(spec, model, rawEffort),
              method: 'EXPORT',
            },
            rawScore: {
              evidenceId: evidence.dataEvidenceId,
              locator: mainLocator(spec, model, rawEffort, 'new_score'),
              method: 'EXPORT',
            },
          },
        }),
      );

      if (metrics.cost === null || metrics.cost === undefined) continue;
      if (!Number.isFinite(metrics.cost) || metrics.cost < 0) {
        throw new Error(
          `${spec.label} Main cost is invalid for ${model} / ${rawEffort}`,
        );
      }
      configurationsWithCost += 1;
      // Cognition: "Cost is the mean USD spend per rollout at list API
      // pricing, including public discounts" -- a per-attempt agent cost.
      costs.push(
        CostRecordSchema.parse({
          schemaVersion: 'cost-record-v1',
          id: `${spec.costIdPrefix}:${suffix}`,
          sourceId: 'frontier-code',
          model: commonModel,
          profile: commonProfile,
          costType: 'AGENT_TASK',
          metricId: 'mean-rollout-cost',
          metricName: spec.costMetricName,
          unit: 'USD_PER_TASK',
          inputPerMillionTokens: null,
          outputPerMillionTokens: null,
          cost: metrics.cost,
          assumptionId: null,
          benchmarkId: spec.benchmarkId,
          benchmarkVersion: spec.benchmarkVersion,
          inclusion: spec.costExclusionReason ? 'EXCLUDED' : 'INCLUDED',
          exclusionReason: spec.costExclusionReason,
          sourceUrl: FRONTIER_CODE_PAGE_URL,
          observedAt: evidence.observedAt,
          sourcePublishedAt: null,
          evidenceIds: [evidence.dataEvidenceId],
          provenance: {
            cost: {
              evidenceId: evidence.dataEvidenceId,
              locator: mainLocator(spec, model, rawEffort, 'cost'),
              method: 'EXPORT',
            },
          },
        }),
      );
    }
  }

  return {
    candidates,
    costs,
    unresolvedModels: [...unresolvedModels].toSorted(),
    effortsByModel,
    configurationsWithCost,
  };
};

const byId = <T extends { id: string }>(left: T, right: T): number =>
  left.id.localeCompare(right.id);

/**
 * FrontierCode 1.1 is frozen upstream, so a changed score or cost needs a
 * reviewer. Online refreshes may accept it explicitly; offline rebuilds must
 * reproduce the saved snapshot and always reject it.
 */
export function assertFrontierCode11Unchanged(
  v11: Pick<MaterializeFrontierCode11Result, 'valueChanges'>,
  acceptHint: string | null,
): void {
  if (v11.valueChanges.length === 0) return;
  throw new Error(
    `FrontierCode 1.1 export changed against the previous snapshot; ${
      acceptHint ?? 'offline rebuilds cannot accept value changes'
    }: ${v11.valueChanges.join('; ')}`,
  );
}

/**
 * FrontierCode 1.1 from the `v1_1` export. The page no longer renders 1.1, so
 * the export is checked against the previous snapshot instead: every previous
 * 1.1 row the export dropped is carried forward unchanged (AGENTS.md: keep
 * existing data when a source removes it), and every changed value is listed.
 */
export function materializeFrontierCode11(
  json: string,
  context: MaterializeFrontierCode11Context,
  previous: FrontierCodePreviousSnapshot,
): MaterializeFrontierCode11Result {
  const version = requireComplete(
    (JSON.parse(json) as { v1_1?: FrontierCodeVersion }).v1_1,
    'FrontierCode 1.1',
  );
  const built = buildRows(V1_1, version, version.models, {
    dataEvidenceId: context.dataEvidenceId,
    candidateEvidenceIds: [context.dataEvidenceId],
    observedAt: context.observedAt,
  });

  const currentCandidates = new Map(
    built.candidates.map((candidate) => [candidate.id, candidate]),
  );
  const currentCosts = new Map(built.costs.map((cost) => [cost.id, cost]));
  const previousCandidates = previous.candidates.filter(
    ({ benchmarkId }) => benchmarkId === FRONTIER_CODE_1_1_BENCHMARK_ID,
  );
  const previousCosts = previous.costs.filter(
    ({ benchmarkId }) => benchmarkId === FRONTIER_CODE_1_1_BENCHMARK_ID,
  );
  const preservedCandidates = previousCandidates.filter(
    ({ id }) => !currentCandidates.has(id),
  );
  const preservedCosts = previousCosts.filter(
    ({ id }) => !currentCosts.has(id),
  );
  const previousCandidateIds = new Set(previousCandidates.map(({ id }) => id));
  const valueChanges = [
    ...previousCandidates.flatMap((prior) => {
      const current = currentCandidates.get(prior.id);
      return current && current.rawScore !== prior.rawScore
        ? [`${prior.id} score ${prior.rawScore} -> ${current.rawScore}`]
        : [];
    }),
    ...previousCosts.flatMap((prior) => {
      const current = currentCosts.get(prior.id);
      return current && current.cost !== prior.cost
        ? [`${prior.id} cost ${prior.cost} -> ${current.cost}`]
        : [];
    }),
  ].toSorted();

  const candidates = [...built.candidates, ...preservedCandidates].toSorted(
    byId,
  );
  // Value changes compare the cost only, so older INCLUDED snapshots still gate.
  const costs = [...built.costs, ...preservedCosts]
    .map(supersedeV11Cost)
    .toSorted(byId);
  const exportModels = new Set(version.models);
  const preservedModels = [
    ...new Set(
      preservedCandidates
        .map(({ model }) => model.rawName)
        .filter((name) => !exportModels.has(name)),
    ),
  ].toSorted();
  // Per-model configuration keys; preserved rows count by candidate ID.
  const effortsByModel = new Map(built.effortsByModel);
  for (const candidate of preservedCandidates) {
    const efforts = effortsByModel.get(candidate.model.rawName) ?? [];
    effortsByModel.set(candidate.model.rawName, [...efforts, candidate.id]);
  }
  const unresolvedModels = [
    ...new Set([
      ...built.unresolvedModels,
      ...preservedCandidates
        .filter(({ model }) => model.canonicalModelId === null)
        .map(({ model }) => model.rawName),
    ]),
  ].toSorted();
  const preservedEvidenceIds = [
    ...new Set(
      [...preservedCandidates, ...preservedCosts].flatMap(
        ({ evidenceIds }) => evidenceIds,
      ),
    ),
  ].toSorted();

  return {
    candidates,
    costs,
    exportModelCount: version.models.length,
    exportConfigurationCount: built.candidates.length,
    exportCostCount: built.costs.length,
    modelCount: effortsByModel.size,
    modelsWithMultipleEfforts: [...effortsByModel.values()].filter(
      (efforts) => efforts.length > 1,
    ).length,
    modelsWithFiveEfforts: [...effortsByModel.values()].filter(
      (efforts) => efforts.length === 5,
    ).length,
    unresolvedModels,
    preservedModels,
    preservedCandidateIds: preservedCandidates.map(({ id }) => id).toSorted(),
    preservedCostIds: preservedCosts.map(({ id }) => id).toSorted(),
    addedCandidateIds: built.candidates
      .filter(({ id }) => !previousCandidateIds.has(id))
      .map(({ id }) => id)
      .toSorted(),
    valueChanges,
    preservedEvidenceIds,
  };
}

/**
 * FrontierCode 2.0 from its own export, checked against the rendered main
 * page: the operator-observed Best/All row counts must equal the export minus
 * the page's hidden models, and the JSON-LD Top 10 must match the export.
 * Its mean rollout costs are INCLUDED and feed the Frontier Code cost-chart
 * group (user decision 2026-10-28); 1.1 costs are EXCLUDED as superseded.
 */
export function materializeFrontierCode20(
  json: string,
  html: string,
  context: MaterializeFrontierCode20Context,
): MaterializeFrontierCode20Result {
  const version = requireComplete(
    JSON.parse(json) as FrontierCodeVersion,
    'FrontierCode 2.0',
  );
  const hidden = [...new Set(context.hiddenModels)].toSorted();
  const unknownHidden = hidden.filter((name) => !version.models.includes(name));
  if (unknownHidden.length > 0) {
    throw new Error(
      `FrontierCode 2.0 hidden models are not in the export: ${unknownHidden.join(', ')}`,
    );
  }
  const visibleModels = version.models.filter(
    (model) => !hidden.includes(model),
  );
  const built = buildRows(V2_0, version, visibleModels, {
    dataEvidenceId: context.dataEvidenceId,
    candidateEvidenceIds: [context.dataEvidenceId, context.pageEvidenceId],
    observedAt: context.observedAt,
  });

  const countErrors = [
    visibleModels.length === context.visualBestRowCount
      ? null
      : `rendered Best reasoning mode rows ${context.visualBestRowCount}, export has ${visibleModels.length} visible models (${version.models.length} minus ${hidden.length} hidden)`,
    built.candidates.length === context.visualAllRowCount
      ? null
      : `rendered All reasoning levels rows ${context.visualAllRowCount}, export has ${built.candidates.length} visible configurations`,
  ].filter((error): error is string => error !== null);
  if (countErrors.length > 0) {
    throw new Error(
      `FrontierCode 2.0 rendered count mismatch: ${countErrors.join('; ')}`,
    );
  }

  const topTen = extractFrontierCodeTopTen(html, FRONTIER_CODE_2_0_ITEM_LIST);
  if (topTen.length !== 10) {
    throw new Error(
      `FrontierCode 2.0 JSON-LD contains ${topTen.length} rows instead of 10`,
    );
  }
  const bestByModel = new Map<string, number>();
  for (const candidate of built.candidates) {
    const prior = bestByModel.get(candidate.model.rawName);
    if (prior === undefined || candidate.normalizedScore! > prior) {
      bestByModel.set(candidate.model.rawName, candidate.normalizedScore!);
    }
  }
  const ranked = [...bestByModel.entries()].toSorted(
    ([leftName, leftScore], [rightName, rightScore]) =>
      rightScore - leftScore || leftName.localeCompare(rightName),
  );
  const topTenMismatches = topTen.flatMap((expected, index) => {
    const actual = ranked[index];
    if (
      !actual ||
      expected.position !== index + 1 ||
      expected.name !== actual[0] ||
      expected.score !== Number(actual[1].toFixed(1))
    ) {
      return [
        `rank ${index + 1}: JSON-LD ${expected.name} ${expected.score.toFixed(1)}%, export ${actual?.[0] ?? 'missing'} ${actual ? actual[1].toFixed(1) : 'missing'}%`,
      ];
    }
    return [];
  });

  return {
    candidates: built.candidates.toSorted(byId),
    costs: built.costs.toSorted(byId),
    modelCount: visibleModels.length,
    configurationCount: built.candidates.length,
    configurationsWithCost: built.configurationsWithCost,
    modelsWithMultipleEfforts: [...built.effortsByModel.values()].filter(
      (efforts) => efforts.length > 1,
    ).length,
    unresolvedModels: built.unresolvedModels,
    hiddenModels: hidden,
    topTen,
    topTenMatches: topTen.length - topTenMismatches.length,
    topTenMismatches,
  };
}

export interface FrontierCode20Check {
  result: MaterializeFrontierCode20Result;
  dataEvidenceId: string;
  visualBestRowCount: number;
  visualAllRowCount: number;
  visualTopTenMatched: boolean;
}

export interface FrontierCodeReportInput {
  v11: MaterializeFrontierCode11Result;
  v11DataEvidenceId: string;
  pageEvidenceId: string;
  /** Null when the evidence set predates the FrontierCode 2.0 capture. */
  v20: FrontierCode20Check | null;
}

const list = (values: readonly string[]): string =>
  values.length === 0 ? 'none' : values.join(', ');

const v20Section = (check: FrontierCode20Check | null): string[] => {
  if (!check) {
    return [
      '## FrontierCode 2.0',
      '',
      'This evidence set has no FrontierCode 2.0 export capture; no `frontier-code-2-0` rows are materialized.',
      '',
    ];
  }
  const v20 = check.result;
  return [
    '## FrontierCode 2.0',
    '',
    `- 2.0 export evidence: \`${check.dataEvidenceId}\``,
    '',
    '| Check | Count |',
    '|---|---:|',
    `| 2.0 visible models | ${v20.modelCount} |`,
    `| 2.0 Main configurations | ${v20.configurationCount} |`,
    `| 2.0 configurations with costs (materialized, INCLUDED) | ${v20.configurationsWithCost} |`,
    `| 2.0 models with multiple efforts | ${v20.modelsWithMultipleEfforts} |`,
    `| 2.0 hidden export models | ${v20.hiddenModels.length} |`,
    `| 2.0 canonically unresolved models | ${v20.unresolvedModels.length} |`,
    '',
    `- Rendered Best reasoning mode rows: ${check.visualBestRowCount}; All reasoning levels rows: ${check.visualAllRowCount}; both equal the export after removing the page's hidden models (${list(v20.hiddenModels)}).`,
    `- JSON-LD \`${FRONTIER_CODE_2_0_ITEM_LIST}\` Top 10 exact rank/name/one-decimal-score matches: ${v20.topTenMatches}/10; mismatches: ${list(v20.topTenMismatches)}.`,
    `- The rendered Top 10 matched the JSON-LD and export: ${check.visualTopTenMatched ? 'yes' : 'no'}.`,
    '- Hidden models stay in the raw artifact and are not materialized; neither are their costs.',
    '- Cost is the mean USD spend per rollout at list API pricing (page methodology), stored as `AGENT_TASK` / `USD_PER_TASK`. Since the 2026-10-28 user decision the cost chart pairs Frontier Code costs with `frontier-code-2-0`; 1.1 costs are kept EXCLUDED as superseded and are never blended with 2.0.',
    '- Effort `na` (SWE-1.6, SWE-1.7) and other non-policy keys stay null. Neither the export nor the methodology states a per-configuration rollout count, so attempts stays null.',
    `- Unresolved names keep null canonical/profile identity: ${list(v20.unresolvedModels)}.`,
    '',
  ];
};

export function frontierCodeValidationReport({
  v11,
  v11DataEvidenceId,
  pageEvidenceId,
  v20,
}: FrontierCodeReportInput): string {
  return [
    '# Frontier Code acquisition validation',
    '',
    `- Page (renders FrontierCode 2.0 only since 2026-10-27): <${FRONTIER_CODE_PAGE_URL}>`,
    `- FrontierCode 2.0 export: <${FRONTIER_CODE_2_0_DATA_URL}>`,
    `- FrontierCode 1.1 export (no longer rendered): <${FRONTIER_CODE_DATA_URL}>`,
    `- Page/JSON-LD evidence: \`${pageEvidenceId}\``,
    `- 1.1 export evidence: \`${v11DataEvidenceId}\``,
    '',
    'FrontierCode 1.1 (`frontier-code-1-1`) and FrontierCode 2.0 (`frontier-code-2-0`) are different benchmarks. Neither replaces the other; their scores are never merged.',
    '',
    ...v20Section(v20),
    '## FrontierCode 1.1',
    '',
    '| Check | Count |',
    '|---|---:|',
    `| 1.1 export models | ${v11.exportModelCount} |`,
    `| 1.1 export Main configurations | ${v11.exportConfigurationCount} |`,
    `| Rows preserved from the previous snapshot | ${v11.preservedCandidateIds.length} |`,
    `| Costs preserved from the previous snapshot | ${v11.preservedCostIds.length} |`,
    `| Export rows new since the previous snapshot | ${v11.addedCandidateIds.length} |`,
    `| Score/cost changes against the previous snapshot | ${v11.valueChanges.length} |`,
    `| Models with multiple efforts | ${v11.modelsWithMultipleEfforts} |`,
    `| Models with five efforts | ${v11.modelsWithFiveEfforts} |`,
    `| Canonically unresolved models | ${v11.unresolvedModels.length} |`,
    '',
    '- The main page no longer renders 1.1; the 1.1 post shows only its launch chart. The `v1_1` export is therefore checked against the previous snapshot instead of a rendered board.',
    `- Models removed upstream and preserved unchanged: ${list(v11.preservedModels)}.`,
    `- New export rows: ${list(v11.addedCandidateIds)}.`,
    `- Value changes: ${list(v11.valueChanges)}.`,
    '- The export contains both `main` and `extended`; only Main is materialized. Source effort `none` stays null. Missing costs are omitted, never zero.',
    `- All ${v11.costs.length} 1.1 cost records keep their IDs but are EXCLUDED: ${FRONTIER_CODE_1_1_COST_SUPERSEDED_REASON}`,
    `- Unresolved names keep null canonical/profile identity: ${list(v11.unresolvedModels)}.`,
    '',
    '## Known documentation conflict',
    '',
    'Cognition FrontierCode percentages use the dedicated `frontier-code-1-1` and `frontier-code-2-0` IDs. `frontierswe` belongs to Proximal FrontierSWE, a different organiser scoring model+harness rank and dominance; they are never merged. See `SPEC.md` §4.2.',
    '',
  ].join('\n');
}

interface FrontierCodeEvidenceLike {
  id: string;
  requestUrl: string;
  retrievedAt: string;
  artifactPath: string;
  metadata?: Record<string, unknown> | undefined;
}

const latestEvidence = <T extends FrontierCodeEvidenceLike>(
  evidence: readonly T[],
  requestUrl: string,
): T | null =>
  evidence
    .filter((record) => record.requestUrl === requestUrl)
    .toSorted((left, right) =>
      right.retrievedAt.localeCompare(left.retrievedAt),
    )[0] ?? null;

/**
 * Offline rebuild from stored evidence (materialize:snapshots). Uses the
 * latest capture of each URL and the rendered counts the refresh recorded in
 * evidence metadata; `previous` is the tracked snapshot whose upstream-removed
 * 1.1 rows stay preserved.
 */
export function rebuildFrontierCodeFromEvidence(
  evidence: readonly FrontierCodeEvidenceLike[],
  readArtifact: (artifactPath: string) => string,
  previous: FrontierCodePreviousSnapshot,
): {
  candidates: CandidateResult[];
  costs: CostRecord[];
  validationReport: string;
} {
  const v11Record = latestEvidence(evidence, FRONTIER_CODE_DATA_URL);
  const pageRecord = latestEvidence(evidence, FRONTIER_CODE_PAGE_URL);
  if (!v11Record || !pageRecord) {
    throw new Error('Frontier Code export/page evidence not found');
  }
  const bestRows = Number(pageRecord.metadata?.renderedRows);
  const topTenMatched = pageRecord.metadata?.renderedTopTenMatched === true;
  if (!Number.isInteger(bestRows) || !topTenMatched) {
    throw new Error(
      'Frontier Code evidence has no completed rendered-DOM validation',
    );
  }
  const v11 = materializeFrontierCode11(
    readArtifact(v11Record.artifactPath),
    { dataEvidenceId: v11Record.id, observedAt: v11Record.retrievedAt },
    previous,
  );
  assertFrontierCode11Unchanged(v11, null);

  const v20Record = latestEvidence(evidence, FRONTIER_CODE_2_0_DATA_URL);
  let v20: FrontierCode20Check | null = null;
  if (v20Record) {
    const allRows = Number(pageRecord.metadata?.renderedAllRows);
    const hidden = v20Record.metadata?.hiddenModels;
    if (!Number.isInteger(allRows)) {
      throw new Error(
        'Frontier Code 2.0 evidence has no rendered All reasoning levels count',
      );
    }
    const result = materializeFrontierCode20(
      readArtifact(v20Record.artifactPath),
      readArtifact(pageRecord.artifactPath),
      {
        dataEvidenceId: v20Record.id,
        pageEvidenceId: pageRecord.id,
        observedAt: v20Record.retrievedAt,
        visualBestRowCount: bestRows,
        visualAllRowCount: allRows,
        visualTopTenMatched: topTenMatched,
        hiddenModels: Array.isArray(hidden)
          ? hidden.filter((name): name is string => typeof name === 'string')
          : [],
      },
    );
    if (result.topTenMismatches.length > 0) {
      throw new Error(result.topTenMismatches.join('; '));
    }
    v20 = {
      result,
      dataEvidenceId: v20Record.id,
      visualBestRowCount: bestRows,
      visualAllRowCount: allRows,
      visualTopTenMatched: topTenMatched,
    };
  }

  return {
    candidates: [...v11.candidates, ...(v20?.result.candidates ?? [])].toSorted(
      byId,
    ),
    costs: [...v11.costs, ...(v20?.result.costs ?? [])].toSorted(byId),
    validationReport: frontierCodeValidationReport({
      v11,
      v11DataEvidenceId: v11Record.id,
      pageEvidenceId: pageRecord.id,
      v20,
    }),
  };
}
