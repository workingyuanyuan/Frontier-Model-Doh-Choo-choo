import {
  CandidateResultSchema,
  CostRecordSchema,
  type CandidateResult,
  type CostRecord,
} from '@llm-bench/benchmark-data';

import {
  resolveCatalogModel,
  slugify,
  stripTrailingConfiguration,
} from './materializer-utils.js';

export const ARC_PRIZE_PAGE_URL = 'https://arcprize.org/leaderboard';
export const ARC_PRIZE_EVALUATIONS_URL =
  'https://arcprize.org/media/data/evaluations.json';
export const ARC_PRIZE_MODELS_URL =
  'https://arcprize.org/media/data/models.json';
export const ARC_PRIZE_DATASETS_URL =
  'https://arcprize.org/media/data/datasets.json';

export const PROMOTED_DATASET_ID = 'v2_Semi_Private';
export const BENCHMARK_ID = 'arc-agi-2';
export const BENCHMARK_VERSION = 'ARC-AGI-2-v2_Semi_Private';

export interface ArcPrizeEvaluationRow {
  datasetId: string;
  modelId: string;
  score: number;
  costPerTask?: number | null;
  resultsUrl?: string;
  display?: boolean;
}

export interface ArcPrizeModelRow {
  id: string;
  displayName: string;
  modelReleaseDate?: string | null;
  providerId?: string | null;
  modelType?: string | null;
  modelGroup?: string | null;
  paperUrl?: string | null;
  codeUrl?: string | null;
  dataUrl?: string | null;
  featured?: boolean | null;
}

export interface ArcPrizeDatasetRow {
  id: string;
  displayName: string;
  url?: string;
}

export interface MaterializeArcPrizeContext {
  evaluationsEvidenceId: string;
  modelsEvidenceId: string;
  datasetsEvidenceId: string;
  pageEvidenceId: string;
  observedAt: string;
}

export interface MaterializeArcPrizeResult {
  candidates: CandidateResult[];
  costs: CostRecord[];
  validationReport: string;
  totalEvaluations: number;
  totalModels: number;
  totalDatasets: number;
  v2TotalRows: number;
  v2PromotedRows: number;
  v2PromotedCosts: number;
  resolvedRowsCount: number;
  unresolvedRowsCount: number;
  unresolvedModels: string[];
  missingModelIds: string[];
  excludedCandidatesCount: number;
}

const profileIdFor = (
  canonicalModelId: string | null,
  effort: string | null,
): string | null =>
  canonicalModelId && effort ? `${canonicalModelId}-${slugify(effort)}` : null;

const LEGAL_EFFORT_TIERS = new Set([
  'max',
  'xhigh',
  'high',
  'medium',
  'low',
  'minimal',
  'none',
]);

const REASONING_MODE_WORDS = new Set(['thinking', 'reasoning']);

function normalizeSegmentKey(segment: string): string {
  return segment
    .trim()
    .toLowerCase()
    .replace(/-+effort$/u, '')
    .replace(/[_\s]+/g, ' ');
}

function isRecognizedSegment(segment: string): boolean {
  const norm = normalizeSegmentKey(segment);
  if (norm.length === 0) return true;
  if (LEGAL_EFFORT_TIERS.has(norm)) return true;
  if (REASONING_MODE_WORDS.has(norm)) return true;
  // Token budgets: e.g. "16K", "120K", "1K", "8K", "32K", "64K", "120000", "Thinking 16K", "Reasoning 32K"
  if (/^(?:(?:thinking|reasoning)\s+)?\d+\s*[km]?$/iu.test(norm)) {
    return true;
  }
  return false;
}

function extractTrailingParentheticalSegments(rawName: string): string[] {
  const match = rawName.match(/\s*\(([^()]+)\)\s*$/u);
  if (!match || !match[1]) return [];
  return match[1]
    .split(',')
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0);
}

function parseArcPrizeEffort(segments: string[]): {
  effort: string | null;
  hasMinimal: boolean;
  hasLow: boolean;
} {
  let hasNone = false;
  let hasMinimal = false;
  let hasLow = false;
  let tierEffort: string | null = null;

  for (const segment of segments) {
    const norm = normalizeSegmentKey(segment);
    if (norm === 'none' || norm === 'non-reasoning') {
      hasNone = true;
    } else if (norm === 'minimal') {
      hasMinimal = true;
      if (!tierEffort) tierEffort = 'low';
    } else if (norm === 'low') {
      hasLow = true;
      if (!tierEffort) tierEffort = 'low';
    } else if (LEGAL_EFFORT_TIERS.has(norm)) {
      if (!tierEffort) tierEffort = norm;
    }
  }

  // Defect 1: None / non-reasoning segment means reasoning is declared off -> non-reasoning
  if (hasNone) {
    return { effort: 'non-reasoning', hasMinimal, hasLow };
  }

  return { effort: tierEffort, hasMinimal, hasLow };
}

interface ParsedCandidateEntry {
  candidate: CandidateResult;
  cost: CostRecord | null;
  cleanName: string;
  hasMinimal: boolean;
  hasLow: boolean;
}

export function materializeArcPrize(
  evaluationsJson: string,
  modelsJson: string,
  datasetsJson: string,
  context: MaterializeArcPrizeContext,
): MaterializeArcPrizeResult {
  const evaluations = JSON.parse(evaluationsJson) as ArcPrizeEvaluationRow[];
  const models = JSON.parse(modelsJson) as ArcPrizeModelRow[];
  const datasets = JSON.parse(datasetsJson) as ArcPrizeDatasetRow[];

  if (!Array.isArray(evaluations)) {
    throw new Error('evaluations.json is not an array');
  }
  if (!Array.isArray(models)) {
    throw new Error('models.json is not an array');
  }
  if (!Array.isArray(datasets)) {
    throw new Error('datasets.json is not an array');
  }

  const modelsById = new Map<string, ArcPrizeModelRow>();
  for (const model of models) {
    if (model && typeof model.id === 'string') {
      modelsById.set(model.id, model);
    }
  }

  const v2Rows = evaluations.filter(
    (row) => row.datasetId === PROMOTED_DATASET_ID,
  );
  const promotedRows = v2Rows.filter((row) => row.display === true);

  const missingModelIds: string[] = [];
  for (const row of promotedRows) {
    if (!modelsById.has(row.modelId)) {
      missingModelIds.push(row.modelId);
    }
  }
  if (missingModelIds.length > 0) {
    throw new Error(
      `Promoted rows have missing modelId in models.json: ${missingModelIds.join(', ')}`,
    );
  }

  const parsedEntries: ParsedCandidateEntry[] = [];
  const unresolvedModelsSet = new Set<string>();
  const seenModelCounts = new Map<string, number>();

  for (let index = 0; index < evaluations.length; index += 1) {
    const row = evaluations[index]!;
    // Rule 1 & 2: Only v2_Semi_Private split with display === true is promoted
    if (row.datasetId !== PROMOTED_DATASET_ID || row.display !== true) {
      continue;
    }

    if (typeof row.score !== 'number' || !Number.isFinite(row.score)) {
      throw new Error(
        `Invalid score for row ${index} (modelId: ${row.modelId}): ${row.score}`,
      );
    }

    const model = modelsById.get(row.modelId)!;
    const rawDisplayName = model.displayName ?? row.modelId;
    const cleanName = stripTrailingConfiguration(rawDisplayName);
    const resolved = resolveCatalogModel(cleanName);
    const canonicalModelId = resolved.canonicalModelId;
    const segments = extractTrailingParentheticalSegments(rawDisplayName);
    const { effort, hasMinimal, hasLow } = parseArcPrizeEffort(segments);
    const profileId = profileIdFor(canonicalModelId, effort);

    if (!canonicalModelId) {
      unresolvedModelsSet.add(rawDisplayName);
    }

    let inclusion: 'INCLUDED' | 'EXCLUDED' = 'INCLUDED';
    let exclusionReason: string | null = null;

    // Defect 3: Unrecognised configuration segments on catalog models must be EXCLUDED
    if (canonicalModelId !== null) {
      const unrecognised = segments.filter((s) => !isRecognizedSegment(s));
      if (unrecognised.length > 0) {
        inclusion = 'EXCLUDED';
        const formattedSegments = unrecognised.map((s) => `"${s}"`).join(', ');
        exclusionReason = `Unrecognised configuration segment ${formattedSegments} has not been reviewed as an effort tier.`;
      }
    }

    const occurrence = (seenModelCounts.get(row.modelId) ?? 0) + 1;
    seenModelCounts.set(row.modelId, occurrence);
    const modelSlug = slugify(row.modelId);
    const suffix = occurrence === 1 ? modelSlug : `${modelSlug}-${occurrence}`;
    const versionSlug = slugify(BENCHMARK_VERSION);

    const candidateId = `arc-prize:${BENCHMARK_ID}:${suffix}:${versionSlug}`;
    const costId = `arc-prize:cost-per-task:${suffix}:${versionSlug}`;

    const rawScore = row.score;
    const normalizedScore = row.score * 100;
    const sourcePublishedAt = model.modelReleaseDate || null;

    const commonModel = {
      rawName: rawDisplayName,
      canonicalModelId,
      profileId,
    };

    const commonProfile = {
      effort,
      thinking: null,
      tools: null,
      harness: null,
      contextWindowTokens: null,
      quantization: null,
      attempts: null,
    };

    const candidate = CandidateResultSchema.parse({
      schemaVersion: 'candidate-result-v1',
      id: candidateId,
      sourceId: 'arc-prize',
      sourceRole: 'ORGANIZER',
      benchmarkId: BENCHMARK_ID,
      benchmarkVersion: BENCHMARK_VERSION,
      model: commonModel,
      profile: commonProfile,
      metric: {
        id: 'score',
        name: 'ARC-AGI-2 score',
        unit: 'fraction',
        higherIsBetter: true,
      },
      rawScore,
      normalizedScore,
      acquisitionStatus: 'FULL',
      inclusion,
      exclusionReason,
      sourceUrl: ARC_PRIZE_PAGE_URL,
      observedAt: context.observedAt,
      sourcePublishedAt,
      evidenceIds: [context.evaluationsEvidenceId, context.modelsEvidenceId],
      provenance: {
        profile: {
          evidenceId: context.modelsEvidenceId,
          locator: `models.json[id="${model.id}"].displayName`,
          method: 'API_RESPONSE',
        },
        rawScore: {
          evidenceId: context.evaluationsEvidenceId,
          locator: `evaluations.json[datasetId="${PROMOTED_DATASET_ID}",modelId="${row.modelId}"].score`,
          method: 'API_RESPONSE',
        },
      },
    });

    let costRecord: CostRecord | null = null;
    if (row.costPerTask !== null && row.costPerTask !== undefined) {
      if (!Number.isFinite(row.costPerTask) || row.costPerTask < 0) {
        throw new Error(
          `Invalid costPerTask for row ${index} (modelId: ${row.modelId}): ${row.costPerTask}`,
        );
      }

      costRecord = CostRecordSchema.parse({
        schemaVersion: 'cost-record-v1',
        id: costId,
        sourceId: 'arc-prize',
        model: commonModel,
        profile: commonProfile,
        costType: 'AGENT_TASK',
        metricId: 'cost-per-task',
        metricName: 'ARC-AGI-2 cost per task',
        unit: 'USD_PER_TASK',
        inputPerMillionTokens: null,
        outputPerMillionTokens: null,
        cost: row.costPerTask,
        assumptionId: null,
        benchmarkId: BENCHMARK_ID,
        benchmarkVersion: BENCHMARK_VERSION,
        inclusion,
        exclusionReason,
        sourceUrl: ARC_PRIZE_PAGE_URL,
        observedAt: context.observedAt,
        sourcePublishedAt,
        evidenceIds: [context.evaluationsEvidenceId, context.modelsEvidenceId],
        provenance: {
          cost: {
            evidenceId: context.evaluationsEvidenceId,
            locator: `evaluations.json[datasetId="${PROMOTED_DATASET_ID}",modelId="${row.modelId}"].costPerTask`,
            method: 'API_RESPONSE',
          },
        },
      });
    }

    parsedEntries.push({
      candidate,
      cost: costRecord,
      cleanName,
      hasMinimal,
      hasLow,
    });
  }

  // Defect 2: When both Minimal and Low rows exist for the same base model, Minimal is EXCLUDED
  const entriesByCleanName = new Map<string, ParsedCandidateEntry[]>();
  for (const entry of parsedEntries) {
    const list = entriesByCleanName.get(entry.cleanName) ?? [];
    list.push(entry);
    entriesByCleanName.set(entry.cleanName, list);
  }

  for (const [, entries] of entriesByCleanName.entries()) {
    const hasMinimal = entries.some((e) => e.hasMinimal);
    const hasLow = entries.some((e) => e.hasLow);
    if (hasMinimal && hasLow) {
      for (const entry of entries) {
        if (entry.hasMinimal) {
          entry.candidate.inclusion = 'EXCLUDED';
          entry.candidate.exclusionReason =
            'ARC published both Minimal and Low labels for this model; minimal cannot represent low.';
          if (entry.cost) {
            entry.cost.inclusion = 'EXCLUDED';
            entry.cost.exclusionReason =
              'ARC published both Minimal and Low labels for this model; minimal cannot represent low.';
          }
        }
      }
    }
  }

  const candidates = parsedEntries.map((e) => e.candidate);
  const costs = parsedEntries
    .map((e) => e.cost)
    .filter((c): c is CostRecord => c !== null);

  candidates.sort((left, right) => left.id.localeCompare(right.id));
  costs.sort((left, right) => left.id.localeCompare(right.id));

  const unresolvedModels = [...unresolvedModelsSet].toSorted((left, right) =>
    left.localeCompare(right),
  );

  const resolvedRowsCount = candidates.filter(
    (c) => c.model.canonicalModelId !== null,
  ).length;
  const unresolvedRowsCount = candidates.filter(
    (c) => c.model.canonicalModelId === null,
  ).length;
  const excludedCandidates = candidates.filter(
    (c) => c.inclusion === 'EXCLUDED',
  );

  const exclusionsByReason = new Map<string, CandidateResult[]>();
  for (const candidate of excludedCandidates) {
    const reason = candidate.exclusionReason ?? 'Unspecified exclusion reason';
    const group = exclusionsByReason.get(reason) ?? [];
    group.push(candidate);
    exclusionsByReason.set(reason, group);
  }

  const excludedSections: string[] = [];
  if (exclusionsByReason.size > 0) {
    excludedSections.push('## Excluded rows', '');
    excludedSections.push('| Reason | Excluded Rows |');
    excludedSections.push('|---|---:|');
    for (const [reason, group] of exclusionsByReason.entries()) {
      excludedSections.push(`| ${reason} | ${group.length} |`);
    }
    excludedSections.push('');
    for (const [reason, group] of exclusionsByReason.entries()) {
      excludedSections.push(
        `### ${reason} (${group.length} ${group.length === 1 ? 'row' : 'rows'})`,
        '',
      );
      for (const candidate of group) {
        const idAnnotation = candidate.model.canonicalModelId
          ? `(\`${candidate.model.canonicalModelId}\`)`
          : '(unresolved)';
        excludedSections.push(`- ${candidate.model.rawName} ${idAnnotation}`);
      }
      excludedSections.push('');
    }
  }

  const validationReport = [
    '# ARC Prize acquisition validation',
    '',
    `- Leaderboard Page: <${ARC_PRIZE_PAGE_URL}>`,
    `- Evaluations Export: <${ARC_PRIZE_EVALUATIONS_URL}>`,
    `- Models Export: <${ARC_PRIZE_MODELS_URL}>`,
    `- Datasets Export: <${ARC_PRIZE_DATASETS_URL}>`,
    `- Evaluations evidence: \`${context.evaluationsEvidenceId}\``,
    `- Models evidence: \`${context.modelsEvidenceId}\``,
    `- Datasets evidence: \`${context.datasetsEvidenceId}\``,
    `- Page evidence: \`${context.pageEvidenceId}\``,
    `- Observed at: ${context.observedAt}`,
    '',
    '## Exact counts',
    '',
    '| Check | Count |',
    '|---|---:|',
    `| Total evaluation rows (all splits) | ${evaluations.length} |`,
    `| Total models in models.json | ${models.length} |`,
    `| Total datasets in datasets.json | ${datasets.length} |`,
    `| Total ${PROMOTED_DATASET_ID} evaluations | ${v2Rows.length} |`,
    `| Promoted ${PROMOTED_DATASET_ID} rows (display=true) | ${candidates.length} |`,
    `| Promoted cost records (USD/task) | ${costs.length} |`,
    `| Canonically resolved rows | ${resolvedRowsCount} |`,
    `| Canonically unresolved rows | ${unresolvedRowsCount} |`,
    `| Canonically unresolved models | ${unresolvedModels.length} |`,
    `| Excluded candidate rows | ${excludedCandidates.length} |`,
    '',
    '## CandidateResults per benchmark',
    '',
    '| Benchmark | Split Version | Promoted Rows |',
    '|---|---|---:|',
    `| \`${BENCHMARK_ID}\` | \`${BENCHMARK_VERSION}\` | ${candidates.length} |`,
    '',
    '## Completeness and machine cross-checks',
    '',
    `- Model completeness: All ${candidates.length}/${candidates.length} promoted evaluation rows matched a declared modelId in \`models.json\`. Missing model IDs: 0.`,
    `- Scope restriction: Only \`${PROMOTED_DATASET_ID}\` (ARC-AGI-2) with \`display=true\` is promoted per user ruling 2026-08-22 (plan D1). Other splits (v1_*, v2_Public_Eval, v2_Private_Eval, v3_*) are preserved in raw content-addressed artifacts and not mixed into \`${BENCHMARK_ID}\`.`,
    `- Cost coverage: ${costs.length}/${candidates.length} promoted rows carry numeric \`costPerTask\` (preserved as \`AGENT_TASK\` / \`USD_PER_TASK\`).`,
    `- Page evidence captured: \`${ARC_PRIZE_PAGE_URL}\` captured with method \`DOM\` for human spot-check audit.`,
    '',
    '## Identity and effort policy',
    '',
    `Exact catalog resolution succeeded for ${resolvedRowsCount}/${candidates.length} promoted rows (${unresolvedRowsCount} unresolved rows across ${unresolvedModels.length} distinct model names).`,
    'Effort tiers are derived from the model display name trailing parentheticals using the canonical effort policy (`max/xhigh/high/medium/low/non-reasoning`). Reasoning-off indicators (`(None)`, `(Thinking, None)`) are filed as `non-reasoning` per §4.4 rule 2. Non-effort parentheticals such as token budgets (`Thinking 16K`, `120K`) remain null effort without illegal profile IDs.',
    '',
    ...excludedSections,
    '## Unresolved model names',
    '',
    `${unresolvedModels.map((name) => `- ${name}`).join('\n')}`,
    '',
  ].join('\n');

  return {
    candidates,
    costs,
    validationReport,
    totalEvaluations: evaluations.length,
    totalModels: models.length,
    totalDatasets: datasets.length,
    v2TotalRows: v2Rows.length,
    v2PromotedRows: candidates.length,
    v2PromotedCosts: costs.length,
    resolvedRowsCount,
    unresolvedRowsCount,
    unresolvedModels,
    missingModelIds,
    excludedCandidatesCount: excludedCandidates.length,
  };
}
