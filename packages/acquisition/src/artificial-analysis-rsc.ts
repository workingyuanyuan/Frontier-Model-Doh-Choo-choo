import {
  CandidateResultSchema,
  CostRecordSchema,
  type CandidateResult,
  type CostRecord,
} from '@llm-bench/benchmark-data';

import {
  isSupersededBuild,
  normalizeSourceEffort,
  parseEffort,
  resolveModel,
  slugify,
} from './materializer-utils.js';

export const ARTIFICIAL_ANALYSIS_EVALUATION_SLUGS = [
  'omniscience',
  'gdpval-aa',
  'apex-agents-aa',
  'aa-briefcase',
  'critpt',
  'tau3-banking',
  'gpqa-diamond',
  'humanitys-last-exam',
  'ifbench',
  'scicode',
  'terminalbench-v2-1',
  'artificial-analysis-long-context-reasoning',
  'mmmu-pro',
  'aa-analyst-agent',
  'automationbench-aa',
  'enterprise-ops-gym-aa',
  'harvey-lab-aa',
  'itbench-aa',
] as const;

export type ArtificialAnalysisEvaluationSlug =
  (typeof ARTIFICIAL_ANALYSIS_EVALUATION_SLUGS)[number];

export type ArtificialAnalysisRow = Record<string, unknown>;

export interface ArtificialAnalysisPage {
  kind: 'evaluation' | 'models' | 'model-detail';
  slug: string;
  sourceUrl: string;
  evidenceId: string;
  retrievedAt: string;
  html?: string;
  rows?: readonly ArtificialAnalysisRow[];
}

export interface ArtificialAnalysisApiPage {
  sourceUrl: string;
  evidenceId?: string;
  retrievedAt: string;
  payload: unknown;
}

export interface ArtificialAnalysisDiscrepancy {
  key: string;
  field: string;
  pageValue: number;
  apiValue: number;
}

/**
 * The API rounds every evaluation value to three decimals while the embedded
 * page payload carries full precision, so a direct equality check reports a
 * difference on roughly two thirds of all comparisons and drowns out real
 * structural drift. Anything within half of the API's last digit is a
 * representation difference, not a disagreement.
 */
export const API_COMPARISON_TOLERANCE = 5e-4;
const API_COMPARISON_FLOAT_EPSILON = 1e-12;

export interface ArtificialAnalysisApiComparison {
  matchedRows: number;
  comparedValues: number;
  /** Values differing by more than API_COMPARISON_TOLERANCE: real drift. */
  mismatches: ArtificialAnalysisDiscrepancy[];
  /** Values differing only because the API rounds to three decimals. */
  precisionDifferences: number;
  pageOnlyRows: string[];
  apiOnlyRows: string[];
}

export interface ArtificialAnalysisMaterializeResult {
  candidates: CandidateResult[];
  costs: CostRecord[];
  validationReport: string;
  pageRows: number;
  activeRows: number;
  taskCostRows: number;
  tokenPriceRows: number;
  unresolvedCandidates: number;
  apiComparison: ArtificialAnalysisApiComparison | null;
  warnings: string[];
}

const MISSING_SENTINEL = '$undefined';
const SOURCE_ID = 'artificial-analysis';
const TASK_COST_BENCHMARK_ID = 'artificial-analysis-intelligence-index';
const ACTIVE_CUTOFF = '2025-08-17';

const EVALUATION_PRIORITY = new Map<string, number>([
  ['omniscience', 0],
  ['gdpval-aa', 0],
  ['apex-agents-aa', 0],
  ['aa-briefcase', 0],
  ['critpt', 0],
  ['tau3-banking', 0],
  ['gpqa-diamond', 0],
  ['humanitys-last-exam', 0],
  ['ifbench', 0],
  ['scicode', 0],
  ['terminalbench-v2-1', 0],
  ['artificial-analysis-long-context-reasoning', 0],
  ['mmmu-pro', 0],
  ['aa-analyst-agent', 0],
  ['automationbench-aa', 0],
  ['enterprise-ops-gym-aa', 0],
  ['harvey-lab-aa', 0],
  ['itbench-aa', 0],
]);

const APPROVED_SCORE_FIELDS = [
  'lcr',
  'hle',
  'gpqa',
  'scicode',
  'critpt',
  'apex_agents',
  'apexAgents',
  'terminalbench_v2_1',
  'terminalbenchV21',
  'tau_banking',
  'tauBanking',
  'livecodebench',
  'gdpval_normalized',
  'gdpvalNormalized',
  'ifbench',
  'mmlu_pro',
  'mmluPro',
  'omniscience',
  'briefcase_breakdown',
  'briefcaseBreakdown',
] as const;

interface ScoreMapping {
  field: string;
  aliases: readonly string[];
  benchmarkId: string;
  metricId: string;
  metricName: string;
  unit: string;
  sourceRole: CandidateResult['sourceRole'];
  normalize: boolean;
  preferredPage: string;
}

const SCORE_MAPPING: readonly ScoreMapping[] = [
  {
    field: 'lcr',
    aliases: ['lcr'],
    benchmarkId: 'aa-lcr',
    metricId: 'accuracy',
    metricName: 'Accuracy',
    unit: 'percent',
    sourceRole: 'ORGANIZER' as const,
    normalize: true,
    preferredPage: 'artificial-analysis-long-context-reasoning',
  },
  {
    field: 'hle',
    aliases: ['hle'],
    benchmarkId: 'humanitys-last-exam',
    metricId: 'accuracy',
    metricName: 'Accuracy',
    unit: 'percent',
    sourceRole: 'INDEPENDENT' as const,
    normalize: true,
    preferredPage: 'humanitys-last-exam',
  },
  {
    field: 'gpqa',
    aliases: ['gpqa'],
    benchmarkId: 'gpqa-diamond',
    metricId: 'accuracy',
    metricName: 'Accuracy',
    unit: 'percent',
    sourceRole: 'INDEPENDENT' as const,
    normalize: true,
    preferredPage: 'gpqa-diamond',
  },
  {
    field: 'scicode',
    aliases: ['scicode'],
    benchmarkId: 'scicode',
    metricId: 'accuracy',
    metricName: 'Accuracy',
    unit: 'percent',
    sourceRole: 'INDEPENDENT' as const,
    normalize: true,
    preferredPage: 'scicode',
  },
  {
    field: 'critpt',
    aliases: ['critpt'],
    benchmarkId: 'critpt',
    metricId: 'accuracy',
    metricName: 'Accuracy',
    unit: 'percent',
    sourceRole: 'INDEPENDENT' as const,
    normalize: true,
    preferredPage: 'critpt',
  },
  {
    field: 'apex_agents',
    aliases: ['apex_agents', 'apexAgents'],
    benchmarkId: 'apex-agents',
    metricId: 'accuracy',
    metricName: 'Accuracy',
    unit: 'percent',
    sourceRole: 'INDEPENDENT' as const,
    normalize: true,
    preferredPage: 'apex-agents-aa',
  },
  {
    field: 'terminalbench_v2_1',
    aliases: ['terminalbench_v2_1', 'terminalbenchV21'],
    benchmarkId: 'terminal-bench-2-1',
    metricId: 'accuracy',
    metricName: 'Accuracy',
    unit: 'percent',
    sourceRole: 'INDEPENDENT' as const,
    normalize: true,
    preferredPage: 'terminalbench-v2-1',
  },
  {
    field: 'tau_banking',
    aliases: ['tau_banking', 'tauBanking'],
    benchmarkId: 'tau3-banking',
    metricId: 'accuracy',
    metricName: 'Accuracy',
    unit: 'percent',
    sourceRole: 'INDEPENDENT' as const,
    normalize: true,
    preferredPage: 'tau3-banking',
  },
  {
    field: 'livecodebench',
    aliases: ['livecodebench'],
    benchmarkId: 'livecodebench',
    metricId: 'accuracy',
    metricName: 'Accuracy',
    unit: 'percent',
    sourceRole: 'INDEPENDENT' as const,
    normalize: true,
    preferredPage: 'models',
  },
  {
    field: 'gdpval_normalized',
    aliases: ['gdpval_normalized', 'gdpvalNormalized'],
    benchmarkId: 'gdpval-aa',
    metricId: 'normalized-score',
    metricName: 'GDPval-AA normalized score',
    unit: 'percent',
    sourceRole: 'INDEPENDENT' as const,
    normalize: true,
    preferredPage: 'gdpval-aa',
  },
  {
    field: 'ifbench',
    aliases: ['ifbench'],
    benchmarkId: 'ifbench',
    metricId: 'accuracy',
    metricName: 'Accuracy',
    unit: 'percent',
    sourceRole: 'INDEPENDENT' as const,
    normalize: true,
    preferredPage: 'ifbench',
  },
  {
    field: 'mmlu_pro',
    aliases: ['mmlu_pro', 'mmluPro'],
    benchmarkId: 'mmlu-pro',
    metricId: 'accuracy',
    metricName: 'Accuracy',
    unit: 'percent',
    sourceRole: 'INDEPENDENT' as const,
    normalize: true,
    preferredPage: 'models',
  },
];

const asRecord = (value: unknown): ArtificialAnalysisRow | null =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as ArtificialAnalysisRow)
    : null;

export const isArtificialAnalysisValuePresent = (
  value: unknown,
): value is number =>
  value !== null && value !== undefined && value !== MISSING_SENTINEL;

const readPath = (value: unknown, path: readonly string[]): unknown => {
  let current: unknown = value;
  for (const part of path) {
    const record = asRecord(current);
    if (!record) return null;
    current = record[part];
  }
  return isArtificialAnalysisValuePresent(current) ? current : null;
};

const readNumber = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) ? value : null;

const balancedSlice = (
  text: string,
  start: number,
  open: string,
  close: string,
): string | null => {
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let index = start; index < text.length; index += 1) {
    const char = text[index];
    if (inString) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === '"') inString = false;
      continue;
    }
    if (char === '"') {
      inString = true;
      continue;
    }
    if (char === open) depth += 1;
    else if (char === close) {
      depth -= 1;
      if (depth === 0) return text.slice(start, index + 1);
    }
  }
  return null;
};

/** Decode the JSON fragments embedded in the Next.js flight stream. */
export const decodeArtificialAnalysisRsc = (html: string): string =>
  html.replaceAll('\\"', '"');

const parseObjectAtMarker = (
  text: string,
  marker: number,
  requiredKey: string,
): ArtificialAnalysisRow | null => {
  let start = text.lastIndexOf('{', marker);
  let attempts = 0;
  while (start >= 0 && attempts < 240) {
    attempts += 1;
    const candidate = balancedSlice(text, start, '{', '}');
    if (candidate?.includes(requiredKey)) {
      try {
        const parsed = asRecord(JSON.parse(candidate));
        if (parsed?.[requiredKey] !== undefined) return parsed;
      } catch {
        // The previous opening brace may belong to an embedded child object.
      }
    }
    start = text.lastIndexOf('{', start - 1);
  }
  return null;
};

const extractObjectsWithMarker = (
  text: string,
  markerText: string,
  requiredKey: string,
): ArtificialAnalysisRow[] => {
  const rows: ArtificialAnalysisRow[] = [];
  let from = 0;
  while (true) {
    const marker = text.indexOf(markerText, from);
    if (marker < 0) break;
    const row = parseObjectAtMarker(text, marker, requiredKey);
    if (row) rows.push(row);
    from = marker + markerText.length;
  }
  return rows;
};

const extractInitialModels = (text: string): ArtificialAnalysisRow[] => {
  const arrays: ArtificialAnalysisRow[][] = [];
  let from = 0;
  while (true) {
    const marker = text.indexOf('initialModels', from);
    if (marker < 0) break;
    const start = text.indexOf('[', marker);
    if (start >= 0) {
      const candidate = balancedSlice(text, start, '[', ']');
      if (candidate) {
        try {
          const parsed: unknown = JSON.parse(candidate);
          if (Array.isArray(parsed)) {
            const rows = parsed
              .map(asRecord)
              .filter((row): row is ArtificialAnalysisRow => row !== null);
            if (rows.length > 0) arrays.push(rows);
          }
        } catch {
          // Other RSC arrays (references, children) are not model rows.
        }
      }
    }
    from = marker + 'initialModels'.length;
  }
  return arrays.toSorted((left, right) => right.length - left.length)[0] ?? [];
};

const modelRowKey = (row: ArtificialAnalysisRow): string | null => {
  for (const key of ['slug', 'id', 'model_creator_id']) {
    const value = row[key];
    if (typeof value === 'string' && value.length > 0) return value;
  }
  return null;
};

/** Extract full model rows from both the model objects and initialModels arrays. */
export const extractArtificialAnalysisRscRows = (
  html: string,
): ArtificialAnalysisRow[] => {
  const text = decodeArtificialAnalysisRsc(html);
  const rows = [
    ...extractObjectsWithMarker(text, 'model_creator_id', 'model_creator_id'),
    ...extractInitialModels(text),
    ...extractObjectsWithMarker(
      text,
      'intelligenceIndexCostPerTask',
      'intelligenceIndexCostPerTask',
    ),
  ];
  const byKey = new Map<string, ArtificialAnalysisRow>();
  for (const row of rows) {
    const key = modelRowKey(row);
    if (!key) continue;
    const current = byKey.get(key);
    if (!current || Object.keys(row).length > Object.keys(current).length) {
      byKey.set(key, row);
    }
  }
  return [...byKey.values()].toSorted((left, right) =>
    (modelRowKey(left) ?? '').localeCompare(modelRowKey(right) ?? ''),
  );
};

const pageRowKey = (row: ArtificialAnalysisRow): string | null =>
  modelRowKey(row) ?? (typeof row.name === 'string' ? row.name : null) ?? null;

interface RowObservation {
  page: ArtificialAnalysisPage;
  row: ArtificialAnalysisRow;
}

export const ARTIFICIAL_ANALYSIS_MODELS_URL =
  'https://artificialanalysis.ai/models';

/**
 * A /models/<slug> detail payload carries rows for the whole catalog, not just
 * its own model, so a detail page must only outrank other pages for its own
 * row. Without this every model was attributed to whichever detail page sorted
 * first alphabetically.
 */
const rowPriority = (
  page: ArtificialAnalysisPage,
  row: ArtificialAnalysisRow,
): number => {
  if (page.kind === 'model-detail') {
    return pageRowKey(row) === page.slug ? 1 : 3;
  }
  if (page.kind === 'models') return 2;
  return 4 + (EVALUATION_PRIORITY.get(page.slug) ?? 100);
};

/**
 * Where a human can verify this row. A detail page only shows its own model, so
 * a row observed on a foreign detail payload points at that row's own model
 * page instead of the page it happened to be parsed from.
 */
const observationSourceUrl = (observation: RowObservation): string => {
  const { page, row } = observation;
  if (page.kind !== 'model-detail') return page.sourceUrl;
  const slug = pageRowKey(row);
  if (!slug || slug === page.slug) return page.sourceUrl;
  return `${ARTIFICIAL_ANALYSIS_MODELS_URL}/${encodeURIComponent(slug)}`;
};

const chooseObservation = (
  observations: readonly RowObservation[],
  preferredPage?: string,
): RowObservation | null => {
  const present = observations.filter(({ row }) => pageRowKey(row) !== null);
  if (present.length === 0) return null;
  return present.toSorted((left, right) => {
    const leftPreferred = left.page.slug === preferredPage ? 0 : 1;
    const rightPreferred = right.page.slug === preferredPage ? 0 : 1;
    return (
      leftPreferred - rightPreferred ||
      rowPriority(left.page, left.row) - rowPriority(right.page, right.row) ||
      left.page.slug.localeCompare(right.page.slug)
    );
  })[0]!;
};

const readRowField = (
  row: ArtificialAnalysisRow,
  aliases: readonly string[],
): unknown => {
  for (const alias of aliases) {
    const value = row[alias];
    if (isArtificialAnalysisValuePresent(value)) return value;
  }
  return null;
};

export const isArtificialAnalysisActiveRow = (
  row: ArtificialAnalysisRow,
): boolean => {
  if (row.deprecated === true || row.deleted === true) return false;
  const rawDate = readRowField(row, ['release_date', 'releaseDate']);
  if (typeof rawDate !== 'string') return false;
  const date = new Date(rawDate);
  return (
    Number.isFinite(date.getTime()) && rawDate.slice(0, 10) >= ACTIVE_CUTOFF
  );
};

const modelIdentity = (row: ArtificialAnalysisRow) => {
  const rawName = readRowField(row, ['name', 'shortName']);
  if (typeof rawName !== 'string' || rawName.length === 0) return null;
  // Artificial Analysis identifies the superseded DeepSeek builds by slug, not
  // by display name: `DeepSeek V4 Pro (Reasoning, Max Effort)` carries slug
  // `deepseek-v4-pro-0424` while the current release is `DeepSeek V4 Pro 0813`.
  // Resolving on the display name alone bound the canonical id to the April
  // build. See SUPERSEDED_BUILDS in materializer-utils.
  const slug = readRowField(row, ['slug']);
  const resolved =
    typeof slug === 'string' && isSupersededBuild('artificial-analysis', slug)
      ? { canonicalModelId: null, profileId: null, rawName }
      : resolveModel(rawName, 'artificial-analysis');
  const effortValue = readRowField(row, ['effort']);
  const effort =
    typeof effortValue === 'string'
      ? normalizeSourceEffort(effortValue)
      : parseEffort(rawName);
  return { rawName, resolved, effort };
};

const makeScoreCandidate = (
  observation: RowObservation,
  row: ArtificialAnalysisRow,
  mapping: ScoreMapping,
  rawScore: number,
  locator: string,
): CandidateResult | null => {
  const identity = modelIdentity(row);
  const key = pageRowKey(row);
  if (!identity || !key) return null;
  const canonicalModelId = identity.resolved.canonicalModelId;
  const profileId = identity.resolved.profileId;
  const effort = identity.effort;
  const candidate = {
    schemaVersion: 'candidate-result-v1' as const,
    id: `${SOURCE_ID}:${mapping.benchmarkId}:${slugify(key)}`,
    sourceId: SOURCE_ID,
    sourceRole: mapping.sourceRole,
    benchmarkId: mapping.benchmarkId,
    benchmarkVersion: null,
    model: {
      rawName: identity.rawName,
      canonicalModelId,
      profileId,
    },
    profile: {
      effort,
      thinking:
        typeof row.reasoning_model === 'boolean' ||
        typeof row.isReasoning === 'boolean'
          ? 'reasoning'
          : null,
      tools: null,
      harness: null,
      contextWindowTokens:
        readNumber(
          readRowField(row, ['context_window_tokens', 'contextWindowTokens']),
        ) ?? null,
      quantization: null,
      attempts: null,
    },
    metric: {
      id: mapping.metricId,
      name: mapping.metricName,
      unit: mapping.unit,
      higherIsBetter: true,
    },
    rawScore,
    normalizedScore: mapping.normalize ? rawScore * 100 : null,
    acquisitionStatus: 'PARTIAL_SOURCE' as const,
    inclusion: 'INCLUDED' as const,
    exclusionReason: null,
    sourceUrl: observationSourceUrl(observation),
    observedAt: observation.page.retrievedAt,
    sourcePublishedAt: null,
    evidenceIds: [observation.page.evidenceId],
    provenance: {
      'model.rawName': {
        evidenceId: observation.page.evidenceId,
        method: 'NEXT_RSC' as const,
        locator: `${locator}; model.name`,
      },
      rawScore: {
        evidenceId: observation.page.evidenceId,
        method: 'NEXT_RSC' as const,
        locator,
      },
    },
  };
  return CandidateResultSchema.parse(candidate);
};

const makeOmniscienceIndexCandidate = (
  observation: RowObservation,
  row: ArtificialAnalysisRow,
): CandidateResult | null => {
  const identity = modelIdentity(row);
  const key = pageRowKey(row);
  const rawScore = readNumber(readRowField(row, ['omniscience']));
  if (!identity || !key || rawScore === null) return null;
  return CandidateResultSchema.parse({
    schemaVersion: 'candidate-result-v1',
    id: `${SOURCE_ID}:aa-omniscience:${slugify(key)}:index`,
    sourceId: SOURCE_ID,
    sourceRole: 'ORGANIZER',
    benchmarkId: 'aa-omniscience',
    benchmarkVersion: null,
    model: {
      rawName: identity.rawName,
      canonicalModelId: identity.resolved.canonicalModelId,
      profileId: identity.resolved.profileId,
    },
    profile: {
      effort: identity.effort,
      thinking: null,
      tools: null,
      harness: null,
      contextWindowTokens: null,
      quantization: null,
      attempts: null,
    },
    metric: {
      id: 'omniscience-index',
      name: 'AA Omniscience Index',
      unit: 'index-points',
      higherIsBetter: true,
    },
    rawScore,
    normalizedScore: null,
    acquisitionStatus: 'PARTIAL_SOURCE',
    inclusion: 'EXCLUDED',
    exclusionReason:
      'Raw omniscience index is retained as display-only evidence and is not an eight-dimension score.',
    sourceUrl: observationSourceUrl(observation),
    observedAt: observation.page.retrievedAt,
    sourcePublishedAt: null,
    evidenceIds: [observation.page.evidenceId],
    provenance: {
      rawScore: {
        evidenceId: observation.page.evidenceId,
        method: 'NEXT_RSC',
        locator: `model slug=${key}; field=omniscience`,
      },
    },
  });
};

const readOmniscienceAccuracy = (row: ArtificialAnalysisRow): number | null => {
  const breakdown = readRowField(row, [
    'omniscience_breakdown',
    'omniscienceBreakdown',
  ]);
  const direct = readNumber(readPath(breakdown, ['accuracy']));
  if (direct !== null) return direct;
  return readNumber(readPath(breakdown, ['total', 'accuracy']));
};

const readBriefcaseRubric = (row: ArtificialAnalysisRow): number | null => {
  const breakdown = readRowField(row, [
    'briefcase_breakdown',
    'briefcaseBreakdown',
  ]);
  return (
    readNumber(readPath(breakdown, ['rubricPassRate'])) ??
    readNumber(readPath(breakdown, ['rubric', 'pass_rate']))
  );
};

const extractApiRows = (payload: unknown): ArtificialAnalysisRow[] => {
  if (Array.isArray(payload)) {
    return payload
      .map(asRecord)
      .filter((row): row is ArtificialAnalysisRow => row !== null);
  }
  const root = asRecord(payload);
  if (!root) return [];
  for (const key of ['data', 'models', 'results']) {
    const nested = root[key];
    if (Array.isArray(nested)) {
      return nested
        .map(asRecord)
        .filter((row): row is ArtificialAnalysisRow => row !== null);
    }
    const nestedRecord = asRecord(nested);
    if (nestedRecord && Array.isArray(nestedRecord.models)) {
      return nestedRecord.models
        .map(asRecord)
        .filter((row): row is ArtificialAnalysisRow => row !== null);
    }
  }
  return [];
};

const apiRowKey = (row: ArtificialAnalysisRow): string | null => {
  const value = readRowField(row, [
    'slug',
    'model_slug',
    'modelId',
    'id',
    'name',
  ]);
  return typeof value === 'string' ? slugify(value) : null;
};

const apiFieldValue = (
  row: ArtificialAnalysisRow,
  field: (typeof SCORE_MAPPING)[number],
): number | null => {
  const evaluations = asRecord(row.evaluations);
  const direct = readNumber(readRowField(row, field.aliases));
  const nested = evaluations
    ? readNumber(readRowField(evaluations, field.aliases))
    : null;
  return direct ?? nested;
};

export const compareArtificialAnalysisApi = (
  pageRows: readonly ArtificialAnalysisRow[],
  payload: unknown,
): ArtificialAnalysisApiComparison => {
  const apiRows = extractApiRows(payload);
  const pagesByKey = new Map<string, ArtificialAnalysisRow>();
  for (const row of pageRows) {
    const key = apiRowKey(row);
    if (key) pagesByKey.set(key, row);
  }
  const apiByKey = new Map<string, ArtificialAnalysisRow>();
  for (const row of apiRows) {
    const key = apiRowKey(row);
    if (key) apiByKey.set(key, row);
  }
  const mismatches: ArtificialAnalysisDiscrepancy[] = [];
  let comparedValues = 0;
  let precisionDifferences = 0;
  for (const [key, pageRow] of pagesByKey) {
    const apiRow = apiByKey.get(key);
    if (!apiRow) continue;
    for (const field of SCORE_MAPPING) {
      const pageValue = apiFieldValue(pageRow, field);
      const apiValue = apiFieldValue(apiRow, field);
      if (pageValue === null || apiValue === null) continue;
      comparedValues += 1;
      const delta = Math.abs(pageValue - apiValue);
      if (delta <= 1e-9) continue;
      if (delta <= API_COMPARISON_TOLERANCE + API_COMPARISON_FLOAT_EPSILON) {
        precisionDifferences += 1;
        continue;
      }
      mismatches.push({
        key,
        field: field.field,
        pageValue,
        apiValue,
      });
    }
  }
  return {
    matchedRows: [...pagesByKey.keys()].filter((key) => apiByKey.has(key))
      .length,
    comparedValues,
    mismatches,
    precisionDifferences,
    pageOnlyRows: [...pagesByKey.keys()]
      .filter((key) => !apiByKey.has(key))
      .toSorted(),
    apiOnlyRows: [...apiByKey.keys()]
      .filter((key) => !pagesByKey.has(key))
      .toSorted(),
  };
};

const makeCostRecord = (
  observation: RowObservation,
  row: ArtificialAnalysisRow,
  cost: number | null,
  input: number | null,
  output: number | null,
): CostRecord[] => {
  const identity = modelIdentity(row);
  const key = pageRowKey(row);
  if (!identity || !key) return [];
  const normalizedProfileId =
    identity.resolved.canonicalModelId !== null && identity.effort !== null
      ? `${identity.resolved.canonicalModelId}-${slugify(identity.effort)}`
      : null;
  const common = {
    sourceId: SOURCE_ID,
    model: {
      rawName: identity.rawName,
      canonicalModelId: identity.resolved.canonicalModelId,
      profileId: normalizedProfileId,
    },
    profile: {
      effort: identity.effort,
      thinking: null,
      tools: null,
      harness: null,
      contextWindowTokens: null,
      quantization: null,
      attempts: null,
    },
    benchmarkId: TASK_COST_BENCHMARK_ID,
    benchmarkVersion: null,
    sourceUrl: observationSourceUrl(observation),
    observedAt: observation.page.retrievedAt,
    sourcePublishedAt: null,
    evidenceIds: [observation.page.evidenceId],
    inclusion: 'INCLUDED' as const,
    exclusionReason: null,
  };
  const records: CostRecord[] = [];
  if (cost !== null) {
    records.push(
      CostRecordSchema.parse({
        schemaVersion: 'cost-record-v1',
        id: `${SOURCE_ID}:cost-per-intelligence-index-task:${slugify(key)}`,
        ...common,
        costType: 'MEASURED_TASK',
        metricId: 'cost-per-intelligence-index-task',
        metricName: 'Cost per Intelligence Index task',
        unit: 'USD_PER_TASK',
        inputPerMillionTokens: null,
        outputPerMillionTokens: null,
        cost,
        assumptionId: null,
        provenance: {
          cost: {
            evidenceId: observation.page.evidenceId,
            method: 'NEXT_RSC',
            locator: `model slug=${key}; field=intelligenceIndexCostPerTask.cost.total`,
          },
        },
      }),
    );
  }
  if (input !== null && output !== null) {
    records.push(
      CostRecordSchema.parse({
        schemaVersion: 'cost-record-v1',
        id: `${SOURCE_ID}:api-token-price:${slugify(key)}`,
        ...common,
        costType: 'API_STANDARDIZED',
        metricId: 'token-price',
        metricName: 'Artificial Analysis API token price',
        unit: 'USD_PER_MILLION_TOKENS',
        inputPerMillionTokens: input,
        outputPerMillionTokens: output,
        cost: null,
        assumptionId: null,
        provenance: {
          cost: {
            evidenceId: observation.page.evidenceId,
            method: 'NEXT_RSC',
            locator: `model slug=${key}; fields=price1mInputTokens,price1mOutputTokens`,
          },
        },
      }),
    );
  }
  return records;
};

const uniqueRows = (pages: readonly ArtificialAnalysisPage[]) => {
  const rows = new Map<string, RowObservation[]>();
  for (const page of pages) {
    const parsedRows =
      page.rows ?? extractArtificialAnalysisRscRows(page.html ?? '');
    for (const row of parsedRows) {
      const key = pageRowKey(row);
      if (!key) continue;
      const observations = rows.get(key) ?? [];
      observations.push({ page, row });
      rows.set(key, observations);
    }
  }
  return rows;
};

const hasScore = (observations: readonly RowObservation[]): boolean =>
  APPROVED_SCORE_FIELDS.some((field) =>
    observations.some(({ row }) =>
      isArtificialAnalysisValuePresent(row[field]),
    ),
  );

export const materializeArtificialAnalysisRsc = (
  pages: readonly ArtificialAnalysisPage[],
  api: ArtificialAnalysisApiPage | null = null,
): ArtificialAnalysisMaterializeResult => {
  if (pages.length === 0)
    throw new Error('Artificial Analysis pages are empty');
  const rowsByKey = uniqueRows(pages);
  const allRows = [...rowsByKey.values()]
    .map((observations) => chooseObservation(observations)?.row)
    .filter((row): row is ArtificialAnalysisRow => row !== undefined);
  const activeEntries = [...rowsByKey.entries()].filter(([, observations]) => {
    const observation = chooseObservation(observations);
    return (
      observation !== null &&
      isArtificialAnalysisActiveRow(observation.row) &&
      hasScore(observations)
    );
  });

  const candidates: CandidateResult[] = [];
  const candidateIds = new Set<string>();
  for (const [, observations] of activeEntries) {
    const base = chooseObservation(observations);
    if (!base) continue;
    const row = base.row;
    for (const mapping of SCORE_MAPPING) {
      const observation =
        chooseObservation(observations, mapping.preferredPage) ?? base;
      const value = readNumber(readRowField(observation.row, mapping.aliases));
      if (value === null) continue;
      const candidate = makeScoreCandidate(
        observation,
        observation.row,
        mapping,
        value,
        `model slug=${pageRowKey(observation.row) ?? 'unknown'}; field=${mapping.field}`,
      );
      if (candidate && !candidateIds.has(candidate.id)) {
        candidateIds.add(candidate.id);
        candidates.push(candidate);
      }
    }
    const omniscienceObservation =
      chooseObservation(observations, 'omniscience') ?? base;
    const omniscienceIndex = makeOmniscienceIndexCandidate(
      omniscienceObservation,
      omniscienceObservation.row,
    );
    if (omniscienceIndex && !candidateIds.has(omniscienceIndex.id)) {
      candidateIds.add(omniscienceIndex.id);
      candidates.push(omniscienceIndex);
    }
    const accuracy = readOmniscienceAccuracy(omniscienceObservation.row);
    if (accuracy !== null) {
      const candidate = makeScoreCandidate(
        omniscienceObservation,
        omniscienceObservation.row,
        {
          field: 'omniscience_accuracy',
          aliases: [],
          benchmarkId: 'aa-omniscience',
          metricId: 'accuracy',
          metricName: 'Accuracy',
          unit: 'percent',
          sourceRole: 'ORGANIZER',
          normalize: true,
          preferredPage: 'omniscience',
        },
        accuracy,
        `model slug=${pageRowKey(omniscienceObservation.row) ?? 'unknown'}; field=omniscience_breakdown.total.accuracy`,
      );
      if (candidate && !candidateIds.has(candidate.id)) {
        candidateIds.add(candidate.id);
        candidates.push(candidate);
      }
    }
    const rubric = readBriefcaseRubric(
      chooseObservation(observations, 'aa-briefcase')?.row ?? row,
    );
    if (rubric !== null) {
      const observation =
        chooseObservation(observations, 'aa-briefcase') ?? base;
      const candidate = makeScoreCandidate(
        observation,
        observation.row,
        {
          field: 'briefcase_rubric',
          aliases: [],
          benchmarkId: 'aa-briefcase',
          metricId: 'rubric-score',
          metricName: 'Rubric Score',
          unit: 'percent',
          sourceRole: 'ORGANIZER',
          normalize: true,
          preferredPage: 'aa-briefcase',
        },
        rubric,
        `model slug=${pageRowKey(observation.row) ?? 'unknown'}; field=briefcase_breakdown.rubric`,
      );
      if (candidate && !candidateIds.has(candidate.id)) {
        candidateIds.add(candidate.id);
        candidates.push(candidate);
      }
    }
  }

  const costsById = new Map<string, CostRecord>();
  let taskCostRows = 0;
  let tokenPriceRows = 0;
  for (const [, observations] of activeEntries) {
    const observation =
      chooseObservation(observations, 'model-detail') ??
      chooseObservation(observations, 'models');
    if (!observation) continue;
    const row = observation.row;
    const cost = readNumber(
      readPath(readRowField(row, ['intelligenceIndexCostPerTask']), [
        'cost',
        'total',
      ]),
    );
    const input = readNumber(
      readRowField(row, ['price1mInputTokens', 'price_1m_input_tokens']),
    );
    const output = readNumber(
      readRowField(row, ['price1mOutputTokens', 'price_1m_output_tokens']),
    );
    if (cost === null && (input === null || output === null)) continue;
    const records = makeCostRecord(observation, row, cost, input, output);
    for (const record of records) {
      if (!costsById.has(record.id)) {
        costsById.set(record.id, record);
        if (record.costType === 'MEASURED_TASK') taskCostRows += 1;
        if (record.costType === 'API_STANDARDIZED') tokenPriceRows += 1;
      }
    }
  }

  const pageRows = rowsByKey.size;
  const activeRows = activeEntries.length;
  const unresolvedCandidates = candidates.filter(
    ({ model }) => model.canonicalModelId === null,
  ).length;
  const apiComparison = api
    ? compareArtificialAnalysisApi(allRows, api.payload)
    : null;
  const warnings: string[] = [];
  if (!api) warnings.push('API cross-validation was not attempted.');
  if (api && apiComparison && apiComparison.mismatches.length > 0) {
    warnings.push(
      `API cross-validation found ${apiComparison.mismatches.length} overlapping values differing beyond rounding tolerance.`,
    );
  }

  candidates.sort((left, right) => left.id.localeCompare(right.id));
  const costs = [...costsById.values()].toSorted((left, right) =>
    left.id.localeCompare(right.id),
  );
  const validationReport = [
    '# Artificial Analysis acquisition validation',
    '',
    `- Evaluation pages combined: ${ARTIFICIAL_ANALYSIS_EVALUATION_SLUGS.map((slug) => `\`${slug}\``).join(', ')}`,
    '- Model-set composition: union every page row, keep only non-deprecated rows released on or after 2025-08-17, then fetch `/models/<slug>` detail payloads for task cost and token-price fields.',
    '- `$undefined` is treated as missing data together with `null`; it never creates a CandidateResult or CostRecord.',
    '',
    '## Exact counts',
    '',
    '| Check | Count |',
    '|---|---:|',
    `| Unique profile rows across evaluation pages | ${pageRows} |`,
    `| Active profile rows (2025-08-17 cutoff, not deprecated) | ${activeRows} |`,
    `| Generated CandidateResults | ${candidates.length} |`,
    `| Canonically unresolved candidates | ${unresolvedCandidates} |`,
    `| MEASURED_TASK cost rows | ${taskCostRows} |`,
    `| API_STANDARDIZED token-price rows | ${tokenPriceRows} |`,
    '',
    '## Page composition finding',
    '',
    '- `/evaluations/omniscience` exposes the broad 479-row model-object payload but its task-cost field is sparse for current profiles.',
    '- The combined evaluation-page union contains the complete current profile population; `/models` alone exposes 28 rows and 23 task costs in this capture.',
    '- Detail pages are therefore part of the acquisition contract for task costs. Missing task cost remains absent; it is not estimated or filled with zero.',
    '',
    '## API cross-validation',
    '',
    api && apiComparison
      ? `- API source: \`${api.sourceUrl}\`; matched rows ${apiComparison.matchedRows}, compared values ${apiComparison.comparedValues}.`
      : '- API source unavailable; page pipeline remains authoritative.',
    ...(api && apiComparison
      ? [
          `- Precision-only differences (API rounds to three decimals, within ${API_COMPARISON_TOLERANCE}): ${apiComparison.precisionDifferences}. These are representation differences, not disagreements.`,
          `- Real differences (beyond ${API_COMPARISON_TOLERANCE}): ${apiComparison.mismatches.length}.`,
        ]
      : []),
    ...(apiComparison && apiComparison.mismatches.length > 0
      ? apiComparison.mismatches
          .slice(0, 50)
          .map(
            ({ key, field, pageValue, apiValue }) =>
              `- Real difference ${key} / ${field}: page=${pageValue}, api=${apiValue}`,
          )
      : ['- No real API differences recorded beyond rounding.']),
    ...warnings.map((warning) => `- Warning: ${warning}`),
    '',
    '## Scope and semantics',
    '',
    '- Artificial Analysis composite indices remain `EXCLUDED`; direct evaluation scores are the only AA rows eligible for the eight-dimensional product score.',
    '- Token prices are `API_STANDARDIZED` and task costs are `MEASURED_TASK`; the two cost semantics are emitted as separate records.',
    '- No missing score, identity, or cost is inferred.',
    '',
  ].join('\n');

  return {
    candidates,
    costs,
    validationReport,
    pageRows,
    activeRows,
    taskCostRows,
    tokenPriceRows,
    unresolvedCandidates,
    apiComparison,
    warnings,
  };
};
