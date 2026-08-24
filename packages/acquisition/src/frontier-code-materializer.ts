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

export const FRONTIER_CODE_PAGE_URL = 'https://cognition.com/frontiercode';
export const FRONTIER_CODE_DATA_URL =
  'https://cognition.com/data/frontiercode-leaderboard/data.json';

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

interface FrontierCodePayload {
  v1_1?: FrontierCodeVersion;
}

export interface FrontierCodeTopTenRow {
  position: number;
  name: string;
  score: number;
}

export interface MaterializeFrontierCodeContext {
  dataEvidenceId: string;
  pageEvidenceId: string;
  observedAt: string;
  visualRowCount: number;
  visualTopTenMatched: boolean;
}

export interface MaterializeFrontierCodeResult {
  candidates: CandidateResult[];
  costs: CostRecord[];
  validationReport: string;
  modelCount: number;
  configurationCount: number;
  costCount: number;
  modelsWithMultipleEfforts: number;
  modelsWithFiveEfforts: number;
  unresolvedModels: string[];
  topTenMatches: number;
  topTenMismatches: string[];
}

const asRecord = (value: unknown): Record<string, unknown> | null =>
  typeof value === 'object' && value !== null
    ? (value as Record<string, unknown>)
    : null;

const findItemList = (value: unknown): Record<string, unknown> | null => {
  if (Array.isArray(value)) {
    for (const child of value) {
      const found = findItemList(child);
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
    record.name === 'FrontierCode 1.1 Leaderboard (Main)'
  ) {
    return record;
  }
  for (const child of Object.values(record)) {
    const found = findItemList(child);
    if (found) return found;
  }
  return null;
};

export function extractFrontierCodeTopTen(
  html: string,
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
    const itemList = findItemList(parsed);
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
  throw new Error('FrontierCode 1.1 Main JSON-LD ItemList was not found');
}

// FrontierCode keys some configurations by a sampling parameter rather than a
// reasoning effort (Inkling is keyed "0.99"). Only the efforts declared in
// data/mappings/profile-policy.json may become a product profile; anything
// else is treated as unlabelled. The raw key stays in the provenance locator.
const sourceEffort = (rawEffort: string): string | null =>
  normalizeSourceEffort(rawEffort);

const profileIdFor = (
  canonicalModelId: string | null,
  effort: string | null,
): string | null =>
  canonicalModelId && effort ? `${canonicalModelId}-${slugify(effort)}` : null;

const mainLocator = (model: string, effort: string, field: string): string =>
  `$.v1_1.data[${JSON.stringify(model)}][${JSON.stringify(effort)}].main.${field}`;

const profileLocator = (model: string, effort: string): string =>
  `$.v1_1.{harness[${JSON.stringify(model)}],efforts[${JSON.stringify(model)}],data[${JSON.stringify(model)}][${JSON.stringify(effort)}]}`;

export function materializeFrontierCode(
  json: string,
  html: string,
  context: MaterializeFrontierCodeContext,
): MaterializeFrontierCodeResult {
  const parsed = JSON.parse(json) as FrontierCodePayload;
  const version = parsed.v1_1;
  if (!version?.models || !version.data || !version.efforts) {
    throw new Error('FrontierCode data has no complete v1_1 dataset');
  }

  const topTen = extractFrontierCodeTopTen(html);
  if (topTen.length !== 10) {
    throw new Error(
      `FrontierCode JSON-LD contains ${topTen.length} rows instead of 10`,
    );
  }

  const candidates: CandidateResult[] = [];
  const costs: CostRecord[] = [];
  const unresolvedModels = new Set<string>();
  const effortsByModel = new Map<string, string[]>();

  for (const model of version.models) {
    const configurations = version.data[model];
    const efforts = version.efforts[model];
    if (!configurations || !efforts || efforts.length === 0) {
      throw new Error(`FrontierCode has no configurations for ${model}`);
    }
    effortsByModel.set(model, efforts);
    const canonicalModelId = resolveCatalogModel(model).canonicalModelId;
    if (!canonicalModelId) unresolvedModels.add(model);
    const harness = version.harness?.[model] ?? null;

    for (const rawEffort of efforts) {
      const metrics = configurations[rawEffort]?.main;
      if (!metrics || !Number.isFinite(metrics.new_score)) {
        throw new Error(
          `FrontierCode Main score is missing for ${model} / ${rawEffort}`,
        );
      }
      const effort = sourceEffort(rawEffort);
      const profileId = profileIdFor(canonicalModelId, effort);
      const score = metrics.new_score as number;
      const suffix = `${slugify(model)}-${slugify(rawEffort)}`;
      const commonModel = { rawName: model, canonicalModelId, profileId };
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
          id: `frontier-code:frontier-code-1-1:${suffix}`,
          sourceId: 'frontier-code',
          sourceRole: 'ORGANIZER',
          benchmarkId: 'frontier-code-1-1',
          benchmarkVersion: '1.1',
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
          observedAt: context.observedAt,
          sourcePublishedAt: null,
          evidenceIds: [context.dataEvidenceId, context.pageEvidenceId],
          provenance: {
            profile: {
              evidenceId: context.dataEvidenceId,
              locator: profileLocator(model, rawEffort),
              method: 'EXPORT',
            },
            rawScore: {
              evidenceId: context.dataEvidenceId,
              locator: mainLocator(model, rawEffort, 'new_score'),
              method: 'EXPORT',
            },
          },
        }),
      );

      if (metrics.cost !== null && metrics.cost !== undefined) {
        if (!Number.isFinite(metrics.cost) || metrics.cost < 0) {
          throw new Error(
            `FrontierCode Main cost is invalid for ${model} / ${rawEffort}`,
          );
        }
        costs.push(
          CostRecordSchema.parse({
            schemaVersion: 'cost-record-v1',
            id: `frontier-code:mean-rollout-cost:${suffix}`,
            sourceId: 'frontier-code',
            model: commonModel,
            profile: commonProfile,
            costType: 'AGENT_TASK',
            metricId: 'mean-rollout-cost',
            metricName: 'Mean FrontierCode rollout cost',
            unit: 'USD_PER_TASK',
            inputPerMillionTokens: null,
            outputPerMillionTokens: null,
            cost: metrics.cost,
            assumptionId: null,
            benchmarkId: 'frontier-code-1-1',
            benchmarkVersion: '1.1',
            inclusion: 'INCLUDED',
            exclusionReason: null,
            sourceUrl: FRONTIER_CODE_PAGE_URL,
            observedAt: context.observedAt,
            sourcePublishedAt: null,
            evidenceIds: [context.dataEvidenceId],
            provenance: {
              cost: {
                evidenceId: context.dataEvidenceId,
                locator: mainLocator(model, rawEffort, 'cost'),
                method: 'EXPORT',
              },
            },
          }),
        );
      }
    }
  }

  candidates.sort((left, right) => left.id.localeCompare(right.id));
  costs.sort((left, right) => left.id.localeCompare(right.id));

  const bestByModel = new Map<string, number>();
  for (const candidate of candidates) {
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

  const modelsWithMultipleEfforts = [...effortsByModel.values()].filter(
    (efforts) => efforts.length > 1,
  ).length;
  const modelsWithFiveEfforts = [...effortsByModel.values()].filter(
    (efforts) => efforts.length === 5,
  ).length;
  const unresolved = [...unresolvedModels].toSorted();
  const topTenMatches = topTen.length - topTenMismatches.length;

  const validationReport = [
    '# Frontier Code acquisition validation',
    '',
    `- Page: <${FRONTIER_CODE_PAGE_URL}>`,
    `- Official static export: <${FRONTIER_CODE_DATA_URL}>`,
    `- Export evidence: \`${context.dataEvidenceId}\``,
    `- Page/JSON-LD evidence: \`${context.pageEvidenceId}\``,
    '',
    '## Acquirable scope',
    '',
    '| Check | Count |',
    '|---|---:|',
    `| Models in FrontierCode 1.1 | ${version.models.length} |`,
    `| Main effort configurations | ${candidates.length} |`,
    `| Main configurations with scores | ${candidates.length} |`,
    `| Main configurations with costs | ${costs.length} |`,
    `| Models with multiple efforts | ${modelsWithMultipleEfforts} |`,
    `| Models with five efforts | ${modelsWithFiveEfforts} |`,
    `| Canonically unresolved models | ${unresolved.length} |`,
    '',
    'The official export contains both `main` and `extended` results. This source materializes all current `v1_1` Main configurations because Main is the default leaderboard and the JSON-LD comparison target. Extended remains preserved in the content-addressed raw artifact and is not silently mixed into `frontier-code-1-1`.',
    '',
    '## Cross-checks',
    '',
    `- JSON-LD Top 10 exact rank/name/one-decimal-score matches: ${topTenMatches}/10.`,
    `- JSON-LD mismatches: ${topTenMismatches.length === 0 ? 'none' : topTenMismatches.join('; ')}.`,
    `- Rendered DOM rows observed: ${context.visualRowCount}; the visible leaderboard showed the same Top 10: ${context.visualTopTenMatched ? 'yes' : 'no'}.`,
    '- The rendered UI labels `cost` as mean USD cost per rollout; it is preserved as `AGENT_TASK` / `USD_PER_TASK`.',
    '',
    '## Identity and missing-value policy',
    '',
    `Exact catalog resolution succeeded for ${version.models.length - unresolved.length}/${version.models.length} models. Unresolved names are retained with null canonical/profile identity: ${unresolved.join(', ')}.`,
    '',
    'Source effort `none` is preserved as null effort and null profile ID. It is not guessed as max/default. Missing costs would be omitted rather than written as zero; this snapshot has a finite cost for every Main configuration.',
    '',
    '## Known documentation conflict',
    '',
    'Cognition FrontierCode 1.1 percentage scores use the dedicated `frontier-code-1-1` benchmark ID. `frontierswe` belongs to Proximal FrontierSWE, a different organiser scoring model+harness rank and dominance; the two are never merged. See `REFACTOR_SPEC_V2.md` §4.2.',
    '',
  ].join('\n');

  return {
    candidates,
    costs,
    validationReport,
    modelCount: version.models.length,
    configurationCount: candidates.length,
    costCount: costs.length,
    modelsWithMultipleEfforts,
    modelsWithFiveEfforts,
    unresolvedModels: unresolved,
    topTenMatches,
    topTenMismatches,
  };
}
