import {
  CandidateResultSchema,
  type CandidateResult,
} from '@llm-bench/benchmark-data';
import {
  parseCsv,
  resolveCatalogModel,
  slugify,
} from './materializer-utils.js';

export interface LiveBenchMetadata {
  latestRelease: string;
  cacheVersion: string;
}

export const APPROVED_LIVEBENCH_CATEGORIES: Record<
  string,
  { benchmarkId: string; metricName: string }
> = {
  Reasoning: {
    benchmarkId: 'livebench-reasoning',
    metricName: 'Reasoning category average',
  },
  Mathematics: {
    benchmarkId: 'livebench-mathematics',
    metricName: 'Mathematics category average',
  },
  Language: {
    benchmarkId: 'livebench-language',
    metricName: 'Language category average',
  },
  IF: {
    benchmarkId: 'livebench-instruction-following',
    metricName: 'Instruction Following category average',
  },
};

export const UNAPPROVED_LIVEBENCH_CATEGORIES = [
  'Coding',
  'Agentic Coding',
  'Data Analysis',
] as const;

export type LiveBenchResolutionRule =
  | 'exact-catalog'
  | 'effort-suffix'
  | 'claude-thinking-effort'
  | 'dated-effort'
  | 'dated-model-alias'
  | 'thinking-marker'
  | 'unresolved';

export interface LiveBenchModelResolution {
  canonicalModelId: string | null;
  effort: string | null;
  rule: LiveBenchResolutionRule;
  reason: string;
}

type Effort = 'xhigh' | 'max' | 'high' | 'medium' | 'low';

const EFFORT_PATTERN = '(xhigh|max|high|medium|low)';
const DATE_PATTERN = '(?:\\d{8}|\\d{4}-\\d{2}-\\d{2}|\\d{4})';

function catalogMatch(modelSlug: string): string | null {
  return resolveCatalogModel(modelSlug, 'livebench').canonicalModelId;
}

function resolved(
  canonicalModelId: string,
  effort: string | null,
  rule: LiveBenchResolutionRule,
  reason: string,
): LiveBenchModelResolution {
  return { canonicalModelId, effort, rule, reason };
}

/**
 * Resolve LiveBench's model slugs without fuzzy matching.
 *
 * The complete slug is always tried first. This is important for catalog
 * models whose names end in `max` (for example `qwen3.7-max`): that token is
 * part of the model name unless a documented effort suffix is present.
 */
export function resolveLiveBenchModel(
  rawName: string,
): LiveBenchModelResolution {
  const trimmed = rawName.trim();
  const fullSlug = slugify(trimmed);
  const exactModelId = catalogMatch(trimmed);
  if (exactModelId) {
    return resolved(
      exactModelId,
      null,
      'exact-catalog',
      `full slug "${fullSlug}" exactly matches a catalog display name or alias`,
    );
  }

  const attempts: string[] = [];

  // Claude's published thinking configuration includes an optional release
  // date and a context marker before the explicit effort tier.
  const claudeThinkingMatch = fullSlug.match(
    new RegExp(
      `^(claude-.+?)(?:-${DATE_PATTERN})?-thinking-(?:64k|auto)-${EFFORT_PATTERN}-effort$`,
      'u',
    ),
  );
  if (claudeThinkingMatch) {
    const modelSlug = claudeThinkingMatch[1]!;
    const effort = claudeThinkingMatch[2]! as Effort;
    const modelId = catalogMatch(modelSlug);
    if (modelId) {
      return resolved(
        modelId,
        effort,
        'claude-thinking-effort',
        `removed Claude thinking/date configuration from "${fullSlug}" and exactly matched catalog slug "${modelSlug}"`,
      );
    }
    attempts.push(
      `Claude thinking/date transform produced "${modelSlug}", which is not an exact catalog slug`,
    );
  }

  // Some LiveBench rows use a date between the model and an explicit effort,
  // e.g. gpt-5.2-2025-12-11-high. Keep this transform exact and bounded.
  const datedEffortMatch = fullSlug.match(
    new RegExp(`^(.+)-${DATE_PATTERN}-${EFFORT_PATTERN}(?:-effort)?$`, 'u'),
  );
  if (datedEffortMatch) {
    const modelSlug = datedEffortMatch[1]!;
    const effort = datedEffortMatch[2]! as Effort;
    const modelId = catalogMatch(modelSlug);
    if (modelId) {
      return resolved(
        modelId,
        effort,
        'dated-effort',
        `removed release date and explicit effort from "${fullSlug}" and exactly matched catalog slug "${modelSlug}"`,
      );
    }
    attempts.push(
      `dated-effort transform produced "${modelSlug}", which is not an exact catalog slug`,
    );
  }

  // Standard LiveBench effort suffixes. The explicit `-effort` spelling is
  // checked first, then the shorter `<model>-<effort>` form.
  for (const suffix of ['-effort', ''] as const) {
    const match = fullSlug.match(
      new RegExp(`^(.+)-${EFFORT_PATTERN}${suffix}$`, 'u'),
    );
    if (!match) continue;
    const modelSlug = match[1]!;
    const effort = match[2]! as Effort;
    const modelId = catalogMatch(modelSlug);
    if (modelId) {
      return resolved(
        modelId,
        effort,
        'effort-suffix',
        `removed explicit effort suffix from "${fullSlug}" and exactly matched catalog slug "${modelSlug}"`,
      );
    }
    attempts.push(
      `effort-suffix transform produced "${modelSlug}", which is not an exact catalog slug`,
    );
    break;
  }

  // `thinking` is a source configuration marker, not one of the legal
  // product effort tiers. It can still be removed when the remaining model
  // slug is an exact catalog name.
  if (fullSlug.endsWith('-thinking')) {
    const modelSlug = fullSlug.slice(0, -'-thinking'.length);
    const modelId = catalogMatch(modelSlug);
    if (modelId) {
      return resolved(
        modelId,
        null,
        'thinking-marker',
        `removed the non-tier thinking marker from "${fullSlug}" and exactly matched catalog slug "${modelSlug}"`,
      );
    }
    attempts.push(
      `thinking-marker transform produced "${modelSlug}", which is not an exact catalog slug`,
    );
  }

  // A small number of rows carry only a release suffix (not an effort), such
  // as deepseek-v4-flash-0731. The base model must still exact-match catalog.
  const datedAliasMatch = fullSlug.match(
    new RegExp(`^(.+)-${DATE_PATTERN}$`, 'u'),
  );
  if (datedAliasMatch) {
    const modelSlug = datedAliasMatch[1]!;
    const modelId = catalogMatch(modelSlug);
    if (modelId) {
      return resolved(
        modelId,
        null,
        'dated-model-alias',
        `removed release date suffix from "${fullSlug}" and exactly matched catalog slug "${modelSlug}"`,
      );
    }
    attempts.push(
      `dated-model-alias transform produced "${modelSlug}", which is not an exact catalog slug`,
    );
  }

  return {
    canonicalModelId: null,
    effort: null,
    rule: 'unresolved',
    reason:
      attempts.length > 0
        ? `no exact catalog match; ${attempts.join('; ')}`
        : `full slug "${fullSlug}" has no documented exact LiveBench transform to a catalog slug`,
  };
}

export function extractLiveBenchMetadata(mainJs: string): LiveBenchMetadata {
  const releasesMatch = mainJs.match(
    /\["20\d\d-\d\d-\d\d"(?:,"20\d\d-\d\d-\d\d")*\]/u,
  );
  if (!releasesMatch) {
    throw new Error(
      'Could not extract releases array from LiveBench main.js bundle',
    );
  }
  const releases = JSON.parse(releasesMatch[0]) as string[];
  if (releases.length === 0) {
    throw new Error('Releases array in LiveBench main.js is empty');
  }
  const latestRelease = releases[releases.length - 1]!;

  const cacheMatch = mainJs.match(/\?v=(\d+)/u);
  if (!cacheMatch || !cacheMatch[1]) {
    throw new Error(
      'Could not extract cacheVersion (?v=...) from LiveBench main.js bundle',
    );
  }
  const cacheVersion = cacheMatch[1];

  return { latestRelease, cacheVersion };
}

export interface MaterializeLiveBenchContext {
  tableEvidenceId: string;
  categoriesEvidenceId: string;
  jsEvidenceId: string;
  tableUrl: string;
  categoriesUrl: string;
  jsUrl: string;
}

export interface MaterializeLiveBenchResult {
  candidates: CandidateResult[];
  validationReport: string;
  release: string;
  cacheVersion: string;
  populationRows: number;
  extractedCandidates: number;
  unresolvedCount: number;
  discrepancies: string[];
  unresolvedModels: Array<{ rawName: string; reason: string }>;
}

export function materializeLiveBench(
  mainJs: string,
  tableCsv: string,
  categoriesJsonStr: string,
  observedAt: string,
  context: MaterializeLiveBenchContext,
): MaterializeLiveBenchResult {
  const { latestRelease, cacheVersion } = extractLiveBenchMetadata(mainJs);

  const categories = JSON.parse(categoriesJsonStr) as Record<string, string[]>;
  const tableRows = parseCsv(tableCsv.trim());
  if (tableRows.length < 2) {
    throw new Error('LiveBench table CSV contains no data rows');
  }

  const headerRow = tableRows[0]!;
  const modelColIndex = headerRow.indexOf('model');
  if (modelColIndex === -1) {
    throw new Error('LiveBench table CSV header is missing "model" column');
  }

  const taskColumnIndices = new Map<string, number>();
  headerRow.forEach((colName, index) => {
    if (index !== modelColIndex && colName.trim()) {
      taskColumnIndices.set(colName.trim(), index);
    }
  });

  const discrepancies: string[] = [];
  const resolutions = new Map<string, LiveBenchModelResolution>();

  // Check category task column mapping against CSV header
  for (const [catName, tasks] of Object.entries(categories)) {
    for (const task of tasks) {
      if (!taskColumnIndices.has(task)) {
        discrepancies.push(
          `Category "${catName}" task "${task}" is missing from table CSV columns`,
        );
      }
    }
  }

  const dataRows = tableRows.slice(1);
  const populationRows = dataRows.length;
  const candidates: CandidateResult[] = [];

  for (const row of dataRows) {
    const rawName = row[modelColIndex]?.trim();
    if (!rawName) continue;

    const resolution = resolveLiveBenchModel(rawName);
    resolutions.set(rawName, resolution);
    const { canonicalModelId, effort } = resolution;
    const profileId = canonicalModelId
      ? `${canonicalModelId}-${effort ?? 'default'}-livebench-no-tools`
      : null;

    for (const [catName, config] of Object.entries(
      APPROVED_LIVEBENCH_CATEGORIES,
    )) {
      const taskNames = categories[catName] ?? [];
      if (taskNames.length === 0) {
        discrepancies.push(
          `Approved category "${catName}" has no task list in categories JSON`,
        );
        continue;
      }

      const scores: number[] = [];
      for (const task of taskNames) {
        const colIdx = taskColumnIndices.get(task);
        if (colIdx === undefined) continue;
        const rawCell = row[colIdx];
        if (rawCell === undefined || rawCell.trim() === '') continue;
        const val = Number(rawCell);
        if (Number.isFinite(val)) {
          scores.push(val);
        }
      }

      if (scores.length !== taskNames.length) {
        discrepancies.push(
          `Model "${rawName}" category "${catName}" missing task values (${scores.length}/${taskNames.length})`,
        );
      }

      const avgScore =
        scores.length > 0
          ? scores.reduce((sum, v) => sum + v, 0) / scores.length
          : null;

      if (avgScore === null) continue;

      const benchmarkId = config.benchmarkId;
      const id = `livebench-${latestRelease}:${benchmarkId}:${slugify(rawName)}`;

      const candidate: CandidateResult = {
        schemaVersion: 'candidate-result-v1',
        id,
        sourceId: 'livebench',
        sourceRole: 'ORGANIZER',
        benchmarkId,
        benchmarkVersion: latestRelease,
        model: {
          rawName,
          canonicalModelId,
          profileId,
        },
        profile: {
          effort,
          thinking: null,
          tools: false,
          harness: null,
          contextWindowTokens: null,
          quantization: null,
          attempts: 1,
        },
        metric: {
          id: 'category-average',
          name: config.metricName,
          unit: 'percent',
          higherIsBetter: true,
        },
        rawScore: avgScore,
        normalizedScore: avgScore,
        acquisitionStatus: 'FULL',
        inclusion: 'INCLUDED',
        exclusionReason: null,
        sourceUrl: context.tableUrl,
        observedAt,
        sourcePublishedAt: `${latestRelease}T00:00:00.000Z`,
        evidenceIds: [context.tableEvidenceId, context.categoriesEvidenceId],
        provenance: {
          benchmarkId: {
            evidenceId: context.categoriesEvidenceId,
            locator: `$.${catName}`,
            method: 'EXPORT',
          },
          rawScore: {
            evidenceId: context.tableEvidenceId,
            locator: `row[model="${rawName}"] averaged over ${catName} task columns`,
            method: 'EXPORT',
          },
        },
      };

      candidates.push(CandidateResultSchema.parse(candidate));
    }
  }

  // Deterministic sort by id
  candidates.sort((a, b) => a.id.localeCompare(b.id));

  const unresolvedCount = candidates.filter(
    (c) => c.model.canonicalModelId === null,
  ).length;
  const unresolvedModels = [...resolutions.entries()]
    .filter(([, resolution]) => resolution.canonicalModelId === null)
    .map(([rawName, resolution]) => ({
      rawName,
      reason: resolution.reason,
    }))
    .sort((a, b) => a.rawName.localeCompare(b.rawName));

  const approvedCatNames = Object.keys(APPROVED_LIVEBENCH_CATEGORIES);
  const unapprovedCatNames = UNAPPROVED_LIVEBENCH_CATEGORIES;

  const validationReport = [
    `# LiveBench acquisition validation`,
    ``,
    `- Release: \`${latestRelease}\` (cacheVersion \`${cacheVersion}\`) dynamically extracted from \`${context.jsUrl}\``,
    `- Evidence: \`${context.tableUrl}\` and \`${context.categoriesUrl}\``,
    ``,
    `## Exact counts`,
    ``,
    `| Check | Count |`,
    `|---|---:|`,
    `| Raw model rows in table CSV | ${populationRows} |`,
    `| Approved scoring categories | ${approvedCatNames.length} (${approvedCatNames.join(', ')}) |`,
    `| Excluded/Unapproved categories | ${unapprovedCatNames.length} (${unapprovedCatNames.join(', ')}) |`,
    `| Generated CandidateResults | ${candidates.length} |`,
    `| Canonically resolved candidates | ${candidates.length - unresolvedCount} |`,
    `| Canonically unresolved candidates | ${unresolvedCount} |`,
    `| Distinct unresolved raw model names | ${unresolvedModels.length} |`,
    ``,
    `## Model identity resolution`,
    ``,
    `Full raw-name catalog matches are attempted first. Remaining names use only exact effort-suffix, Claude thinking/date, dated-effort, thinking-marker, or dated-model-alias transforms; no fuzzy matching is performed.`,
    ``,
    unresolvedModels.length === 0
      ? `- All distinct raw model names resolved through the catalog or a documented exact transform.`
      : unresolvedModels
          .map(({ rawName, reason }) => `- \`${rawName}\`: ${reason}`)
          .join('\n'),
    ``,
    `## Category scope boundary`,
    ``,
    `Per SPEC.md §9.1 and §5.2, only the 4 approved categories (Reasoning, Mathematics, Language, Instruction Following) enter scoring. Coding, Agentic Coding, and Data Analysis categories are unapproved and excluded.`,
    ``,
    `## Discrepancies and notes`,
    ``,
    discrepancies.length === 0
      ? `- None. All ${populationRows} model rows have complete task coverage across the 4 approved categories.`
      : discrepancies.map((d) => `- ${d}`).join('\n'),
    ``,
  ].join('\n');

  return {
    candidates,
    validationReport,
    release: latestRelease,
    cacheVersion,
    populationRows,
    extractedCandidates: candidates.length,
    unresolvedCount,
    discrepancies,
    unresolvedModels,
  };
}
