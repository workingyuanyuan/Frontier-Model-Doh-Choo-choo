import {
  CandidateResultSchema,
  type CandidateResult,
} from '@llm-bench/benchmark-data';
import { parseCsv, parseEffort, slugify } from './materializer-utils.js';

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

export const LIVEBENCH_MODEL_IDENTITIES: Record<
  string,
  { modelId: string; effort: string }
> = {
  'deepseek-v4-flash': { modelId: 'deepseek-deepseek-v4-flash', effort: 'max' },
  'deepseek-v4-pro': { modelId: 'deepseek-deepseek-v4-pro', effort: 'max' },
  'minimax-m3': { modelId: 'minimax-minimax-m3', effort: 'max' },
  'kimi-k2.6-thinking': { modelId: 'moonshot-kimi-k2-6', effort: 'max' },
  'qwen3.7-max': { modelId: 'alibaba-qwen3-7-max', effort: 'max' },
  'glm-5.2': { modelId: 'zai-glm-5-2', effort: 'max' },
  'gpt-5.2-2025-12-11-high': { modelId: 'openai-gpt-5-2', effort: 'high' },
  'gemini-3.5-flash-high': {
    modelId: 'google-gemini-3-5-flash',
    effort: 'high',
  },
  'gemini-3.1-pro-preview-high': {
    modelId: 'google-gemini-3-1-pro-preview',
    effort: 'high',
  },
  'claude-sonnet-4-6-thinking-auto-medium-effort': {
    modelId: 'anthropic-claude-sonnet-4-6',
    effort: 'medium',
  },
  'gpt-5.4-mini-xhigh': { modelId: 'openai-gpt-5-4-mini', effort: 'xhigh' },
  'claude-opus-4-6-thinking-auto-high-effort': {
    modelId: 'anthropic-claude-opus-4-6',
    effort: 'high',
  },
  'claude-opus-4-7-xhigh-effort': {
    modelId: 'anthropic-claude-opus-4-7',
    effort: 'xhigh',
  },
  'claude-sonnet-5-xhigh-effort': {
    modelId: 'anthropic-claude-sonnet-5',
    effort: 'xhigh',
  },
  'gpt-5.4-xhigh': { modelId: 'openai-gpt-5-4', effort: 'xhigh' },
  'gpt-5.5-xhigh': { modelId: 'openai-gpt-5-5', effort: 'xhigh' },
  'gpt-5.6-sol-max': { modelId: 'openai-gpt-5-6-sol', effort: 'max' },
  'gpt-5.6-terra-max': { modelId: 'openai-gpt-5-6-terra', effort: 'max' },
  'gpt-5.6-luna-max': { modelId: 'openai-gpt-5-6-luna', effort: 'max' },
  'grok-4.5': { modelId: 'xai-grok-4-5', effort: 'high' },
  'claude-fable-5-max-effort': {
    modelId: 'anthropic-claude-fable-5',
    effort: 'max',
  },
  'muse-spark-1.1-xhigh': { modelId: 'meta-muse-spark-1-1', effort: 'xhigh' },
  'inkling-xhigh': { modelId: 'thinking-machines-inkling', effort: 'xhigh' },
  'claude-opus-4-8-max-effort': {
    modelId: 'anthropic-claude-opus-4-8',
    effort: 'max',
  },
};

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

    const identity = LIVEBENCH_MODEL_IDENTITIES[rawName];
    const canonicalModelId = identity?.modelId ?? null;
    const effort = identity?.effort ?? parseEffort(rawName) ?? null;
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
    ``,
    `## Category scope boundary`,
    ``,
    `Per REFACTOR_SPEC_V2.md §9.1 and §5.2, only the 4 approved categories (Reasoning, Mathematics, Language, Instruction Following) enter scoring. Coding, Agentic Coding, and Data Analysis categories are unapproved and excluded.`,
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
  };
}
