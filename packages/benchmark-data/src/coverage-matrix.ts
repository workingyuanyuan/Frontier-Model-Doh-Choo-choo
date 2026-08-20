import { readFile, readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';

import {
  BenchmarkDimensionMappingSchema,
  CandidateResultSchema,
  FrontierConfigSchema,
  ModelCatalogSchema,
  ProfilePolicySchema,
  SourcesConfigSchema,
  applyProductProfilePolicy,
  buildFrontierSet,
  selectCurrentResults,
  DIMENSION_IDS,
  type BenchmarkDimensionMapping,
  type CandidateResult,
  type DimensionId,
  type FrontierConfig,
  type ModelCatalog,
  type ProfilePolicy,
} from './index.js';

export interface QualifiedModel {
  modelId: string;
  displayName: string;
}

export interface ModelBenchmarkPresence {
  model: QualifiedModel;
  mask: number;
  presentBenchmarks: string[];
  presence: Record<string, boolean>;
  presentBenchmarkCount: number;
}

export interface TradeoffResult {
  benchmarkCount: number;
  benchmarkIds: string[];
  completeModelCount: number;
  coveredDimensionCount: number;
  coveredDimensions: DimensionId[];
  matchingModels: QualifiedModel[];
}

export interface MaskFrequency {
  mask: number;
  count: number;
  modelIds: string[];
}

export interface BenchmarkDimensionInfo {
  primaryDimension: DimensionId;
  secondaryDimensions: DimensionId[];
  allDimensions: DimensionId[];
}

export interface CoverageMatrixAnalysis {
  referenceDate: string;
  qualificationWindowMonths: number;
  whitelist: string[];
  activeBenchmarkIds: string[];
  qualifiedModels: QualifiedModel[];
  matrix: ModelBenchmarkPresence[];
  tradeoffs: TradeoffResult[];
  maskFrequencies: MaskFrequency[];
  benchmarkDimensions: Record<string, BenchmarkDimensionInfo>;
}

export interface CoverageAnalysisInput {
  catalog: ModelCatalog;
  frontierConfig: FrontierConfig;
  benchmarkMapping: BenchmarkDimensionMapping;
  profilePolicy: ProfilePolicy;
  whitelist: readonly string[];
  sourceCandidates: readonly CandidateResult[];
  referenceDate: string;
}

export interface WorkspaceCoverageData {
  catalog: ModelCatalog;
  frontierConfig: FrontierConfig;
  benchmarkMapping: BenchmarkDimensionMapping;
  profilePolicy: ProfilePolicy;
  whitelist: string[];
  sourceCandidates: CandidateResult[];
}

const readJson = async (path: string): Promise<unknown> =>
  JSON.parse(await readFile(path, 'utf8'));

/**
 * Load workspace input data reading strictly only whitelisted source directories.
 */
export const loadWorkspaceCoverageData = async (
  repositoryRoot: string,
): Promise<WorkspaceCoverageData> => {
  const root = resolve(repositoryRoot);
  const dataRoot = join(root, 'data-v2');

  const sourcesConfig = SourcesConfigSchema.parse(
    await readJson(join(dataRoot, 'mappings', 'sources.json')),
  );
  const whitelist = [...new Set(sourcesConfig.whitelist)].sort();
  const whitelistSet = new Set(whitelist);

  const sourceRoot = join(dataRoot, 'sources');
  const sourceDirectories = (await readdir(sourceRoot, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory() && whitelistSet.has(entry.name))
    .map(({ name }) => name)
    .sort();

  const sourceCandidates: CandidateResult[] = [];
  for (const source of sourceDirectories) {
    const candidatesPath = join(sourceRoot, source, 'candidates.json');
    const parsedCandidates = CandidateResultSchema.array().parse(
      await readJson(candidatesPath),
    );
    sourceCandidates.push(...parsedCandidates);
  }

  const benchmarkMapping = BenchmarkDimensionMappingSchema.parse(
    await readJson(join(dataRoot, 'mappings', 'benchmarks.json')),
  );
  const catalog = ModelCatalogSchema.parse(
    await readJson(join(dataRoot, 'mappings', 'models.json')),
  );
  const profilePolicy = ProfilePolicySchema.parse(
    await readJson(join(dataRoot, 'mappings', 'profile-policy.json')),
  );
  const frontierConfig = FrontierConfigSchema.parse(
    await readJson(join(dataRoot, 'mappings', 'frontier.json')),
  );

  return {
    catalog,
    frontierConfig,
    benchmarkMapping,
    profilePolicy,
    whitelist,
    sourceCandidates,
  };
};

function popcount(n: number): number {
  let count = 0;
  let val = n;
  while (val > 0) {
    count += val & 1;
    val >>>= 1;
  }
  return count;
}

function compareLexicographically(
  a: readonly string[],
  b: readonly string[],
): number {
  const minLen = Math.min(a.length, b.length);
  for (let i = 0; i < minLen; i++) {
    const cmp = a[i]!.localeCompare(b[i]!);
    if (cmp !== 0) return cmp;
  }
  return a.length - b.length;
}

/**
 * Pure coverage analysis function.
 */
export const analyzeCoverageMatrix = (
  input: CoverageAnalysisInput,
): CoverageMatrixAnalysis => {
  const qualificationWindowMonths =
    input.frontierConfig.qualificationWindowMonths ?? 12;

  // 1. Model qualification using the canonical B4 implementation
  const frontier = buildFrontierSet({
    catalog: input.catalog,
    manualModels: input.frontierConfig.manualModels,
    referenceDate: input.referenceDate,
    qualificationWindowMonths,
  });

  const catalogDisplayNameMap = new Map(
    input.catalog.models.map((m) => [m.modelId, m.displayName]),
  );

  const qualifiedModels: QualifiedModel[] = frontier
    .map((f) => ({
      modelId: f.modelId,
      displayName: catalogDisplayNameMap.get(f.modelId) ?? f.modelId,
    }))
    .toSorted((left, right) => left.modelId.localeCompare(right.modelId));

  const qualifiedModelIdSet = new Set(qualifiedModels.map((m) => m.modelId));

  // 2. Filter candidates strictly to whitelisted sources
  const whitelistSet = new Set(input.whitelist);
  const whitelistedCandidates = input.sourceCandidates.filter((c) =>
    whitelistSet.has(c.sourceId),
  );

  // 3. Apply product profile policy
  const policyCandidates = applyProductProfilePolicy(
    whitelistedCandidates,
    input.catalog,
    input.profilePolicy,
  );

  // 4. Filter only included candidates with non-null normalized score and canonical/profile IDs
  const eligibleCandidates = policyCandidates.filter(
    (c) =>
      c.inclusion === 'INCLUDED' &&
      c.normalizedScore !== null &&
      c.model.canonicalModelId !== null &&
      c.model.profileId !== null,
  );

  // 5. Apply current-result selection policy
  const selectedResults = selectCurrentResults(eligibleCandidates);

  // 6. Benchmark dimension lookup
  const benchmarkDimensions: Record<string, BenchmarkDimensionInfo> = {};
  for (const b of input.benchmarkMapping.benchmarks) {
    const all = [
      ...new Set([b.primaryDimension, ...b.secondaryDimensions]),
    ].toSorted((left, right) => left.localeCompare(right));
    benchmarkDimensions[b.id] = {
      primaryDimension: b.primaryDimension,
      secondaryDimensions: b.secondaryDimensions,
      allDimensions: all,
    };
  }

  // 7. Active benchmarks: only those benchmarks present in active (whitelisted) evidence
  const activeBenchmarkIds = [
    ...new Set(
      selectedResults
        .filter(
          ({ model }) =>
            model.canonicalModelId !== null &&
            qualifiedModelIdSet.has(model.canonicalModelId),
        )
        .map((r) => r.benchmarkId)
        .filter((id) => Object.hasOwn(benchmarkDimensions, id)),
    ),
  ].toSorted((left, right) => left.localeCompare(right));

  const benchmarkIndexMap = new Map(
    activeBenchmarkIds.map((id, idx) => [id, idx]),
  );

  // 8. Model x Benchmark presence map
  // A qualified canonical base model has a benchmark if any of its product profiles has an eligible current result for it.
  const modelPresentBenchmarksMap = new Map<string, Set<string>>();
  for (const m of qualifiedModels) {
    modelPresentBenchmarksMap.set(m.modelId, new Set<string>());
  }

  for (const result of selectedResults) {
    const modelId = result.model.canonicalModelId;
    if (
      modelId !== null &&
      qualifiedModelIdSet.has(modelId) &&
      benchmarkIndexMap.has(result.benchmarkId)
    ) {
      modelPresentBenchmarksMap.get(modelId)!.add(result.benchmarkId);
    }
  }

  const matrix: ModelBenchmarkPresence[] = qualifiedModels.map((model) => {
    const presentSet = modelPresentBenchmarksMap.get(model.modelId)!;
    const presentBenchmarks = [...presentSet].toSorted((left, right) =>
      left.localeCompare(right),
    );
    const presence: Record<string, boolean> = {};
    let mask = 0;
    for (const bId of activeBenchmarkIds) {
      const isPresent = presentSet.has(bId);
      presence[bId] = isPresent;
      if (isPresent) {
        const bit = benchmarkIndexMap.get(bId)!;
        mask |= 1 << bit;
      }
    }
    return {
      model,
      mask,
      presentBenchmarks,
      presence,
      presentBenchmarkCount: presentBenchmarks.length,
    };
  });

  // 9. Compress identical model availability masks to frequency counts
  const maskFrequencyMap = new Map<
    number,
    { count: number; modelIds: string[] }
  >();
  for (const row of matrix) {
    const entry = maskFrequencyMap.get(row.mask) ?? { count: 0, modelIds: [] };
    entry.count += 1;
    entry.modelIds.push(row.model.modelId);
    maskFrequencyMap.set(row.mask, entry);
  }

  const maskFrequencies: MaskFrequency[] = [...maskFrequencyMap.entries()]
    .map(([mask, { count, modelIds }]) => ({
      mask,
      count,
      modelIds: modelIds.toSorted((left, right) => left.localeCompare(right)),
    }))
    .toSorted((left, right) => left.mask - right.mask);

  // 10. Tradeoff search via integer bitmask subset enumeration
  const M = activeBenchmarkIds.length;
  const tradeoffs: TradeoffResult[] = [];

  if (M > 30) {
    throw new Error(
      `coverage-matrix supports at most 30 active benchmarks with 32-bit integer masks; received ${M}`,
    );
  }

  if (M > 0) {
    // Precompute dimension bitmask for each benchmark
    const benchmarkDimMaskByIndex = activeBenchmarkIds.map((bId) => {
      const dims = benchmarkDimensions[bId]?.allDimensions ?? [];
      let dMask = 0;
      for (const d of dims) {
        const idx = DIMENSION_IDS.indexOf(d);
        if (idx >= 0) dMask |= 1 << idx;
      }
      return dMask;
    });

    const getBenchmarkIdsForMask = (mask: number): string[] => {
      const ids: string[] = [];
      for (let i = 0; i < M; i++) {
        if ((mask & (1 << i)) !== 0) {
          ids.push(activeBenchmarkIds[i]!);
        }
      }
      return ids;
    };

    interface BestSubset {
      mask: number;
      benchmarkIds: string[];
      completeModelCount: number;
      coveredDimensionCount: number;
      coveredDimensions: DimensionId[];
    }

    const bestByN: (BestSubset | null)[] = new Array(M + 1).fill(null);
    const totalSubsets = 1 << M;
    const compressedList = maskFrequencies;

    for (let S = 1; S < totalSubsets; S++) {
      const N = popcount(S);

      // Complete models count using frequency compression
      let completeModelCount = 0;
      for (let i = 0; i < compressedList.length; i++) {
        const entry = compressedList[i]!;
        if ((entry.mask & S) === S) {
          completeModelCount += entry.count;
        }
      }

      // Covered dimensions mask
      let dimMask = 0;
      for (let j = 0; j < M; j++) {
        if ((S & (1 << j)) !== 0) {
          dimMask |= benchmarkDimMaskByIndex[j]!;
        }
      }
      const coveredDimensionCount = popcount(dimMask);

      const currentBest = bestByN[N];
      if (!currentBest) {
        bestByN[N] = {
          mask: S,
          benchmarkIds: getBenchmarkIdsForMask(S),
          completeModelCount,
          coveredDimensionCount,
          coveredDimensions: DIMENSION_IDS.filter(
            (_, idx) => (dimMask & (1 << idx)) !== 0,
          ),
        };
        continue;
      }

      let isBetter = false;
      if (completeModelCount > currentBest.completeModelCount) {
        isBetter = true;
      } else if (completeModelCount === currentBest.completeModelCount) {
        if (coveredDimensionCount > currentBest.coveredDimensionCount) {
          isBetter = true;
        } else if (
          coveredDimensionCount === currentBest.coveredDimensionCount
        ) {
          const candidateBenchmarkIds = getBenchmarkIdsForMask(S);
          if (
            compareLexicographically(
              candidateBenchmarkIds,
              currentBest.benchmarkIds,
            ) < 0
          ) {
            isBetter = true;
          }
        }
      }

      if (isBetter) {
        bestByN[N] = {
          mask: S,
          benchmarkIds: getBenchmarkIdsForMask(S),
          completeModelCount,
          coveredDimensionCount,
          coveredDimensions: DIMENSION_IDS.filter(
            (_, idx) => (dimMask & (1 << idx)) !== 0,
          ),
        };
      }
    }

    for (let N = 1; N <= M; N++) {
      const best = bestByN[N]!;
      const matchingModels: QualifiedModel[] = [];
      for (const row of matrix) {
        if ((row.mask & best.mask) === best.mask) {
          matchingModels.push(row.model);
        }
      }
      matchingModels.sort((a, b) => a.modelId.localeCompare(b.modelId));

      tradeoffs.push({
        benchmarkCount: N,
        benchmarkIds: best.benchmarkIds,
        completeModelCount: best.completeModelCount,
        coveredDimensionCount: best.coveredDimensionCount,
        coveredDimensions: best.coveredDimensions,
        matchingModels,
      });
    }
  }

  return {
    referenceDate: input.referenceDate,
    qualificationWindowMonths,
    whitelist: [...whitelistSet].sort(),
    activeBenchmarkIds,
    qualifiedModels,
    matrix,
    tradeoffs,
    maskFrequencies,
    benchmarkDimensions,
  };
};

/**
 * Format the analysis into Markdown review material.
 */
export const formatCoverageMatrixMarkdown = (
  analysis: CoverageMatrixAnalysis,
): string => {
  const lines: string[] = [];

  lines.push('# Coverage Matrix Report');
  lines.push('');
  lines.push(`- **Reference Date**: \`${analysis.referenceDate}\``);
  lines.push(
    `- **Qualification Window**: ${analysis.qualificationWindowMonths} months`,
  );
  lines.push(
    `- **Active Sources (${analysis.whitelist.length})**: ${analysis.whitelist.map((s) => `\`${s}\``).join(', ')}`,
  );
  lines.push(
    `- **Qualified Canonical Base Models**: ${analysis.qualifiedModels.length}`,
  );
  lines.push(`- **Active Benchmarks**: ${analysis.activeBenchmarkIds.length}`);
  lines.push('');
  lines.push(
    '> [!NOTE]',
    '> This report is Gate 2 review material (`docs/REFACTOR_SPEC_V2.md` §5.3, `tasks/claude-code-plan.md` D3).',
    '> It details the empirical coverage tradeoff between retained benchmark count and complete qualified base-model count to inform manual configuration of `data-v2/mappings/display-set.json`.',
    '> It does not modify `display-set.json`.',
    "> Coverage is unioned across a canonical base model's product profiles, as required by the §5.3 model bitmask. D2 main-screen eligibility is stricter: one profile must pass the selected matrix and have all eight rendered dimensions. Complete-model counts here are therefore review upper bounds, not predicted main-screen row counts.",
  );
  lines.push('');

  // Section 1: Tradeoff Curve
  lines.push('## 1. Tradeoff Curve');
  lines.push('');
  lines.push(
    'For each retained benchmark count $N$ from 1 to the active benchmark count, the table below lists the combination that maximizes the number of complete qualified base models. Deterministic tie-breaking favors higher covered dimension count, then lexicographically earlier benchmark ID lists.',
  );
  lines.push('');

  lines.push(
    '| $N$ | Complete Models | Covered Dimensions | Chosen Benchmark IDs | Matching Model Count & Details |',
  );
  lines.push('| --: | --: | :-: | --- | --- |');

  for (const tradeoff of analysis.tradeoffs) {
    const benchList = tradeoff.benchmarkIds.map((id) => `\`${id}\``).join(', ');
    const anchor = `#scale-n--${tradeoff.benchmarkCount}-${tradeoff.completeModelCount}-complete-models`;
    const detailsLink = `[${tradeoff.completeModelCount} models](${anchor})`;
    lines.push(
      `| ${tradeoff.benchmarkCount} | **${tradeoff.completeModelCount}** | ${tradeoff.coveredDimensionCount}/8 (${tradeoff.coveredDimensions.join(', ')}) | ${benchList} | ${detailsLink} |`,
    );
  }
  lines.push('');

  // Section 2: Tradeoff Scale Model Lists
  lines.push('## 2. Tradeoff Combination Model Details');
  lines.push('');
  lines.push(
    'Complete qualified base-model lists for each optimal combination in the tradeoff curve.',
  );
  lines.push('');

  for (const tradeoff of analysis.tradeoffs) {
    lines.push(
      `### Scale N = ${tradeoff.benchmarkCount} (${tradeoff.completeModelCount} complete models)`,
    );
    lines.push('');
    lines.push(
      `- **Chosen Benchmarks (${tradeoff.benchmarkIds.length})**: ${tradeoff.benchmarkIds.map((id) => `\`${id}\``).join(', ')}`,
    );
    lines.push(
      `- **Covered Dimensions (${tradeoff.coveredDimensionCount}/8)**: ${tradeoff.coveredDimensions.join(', ')}`,
    );
    lines.push(`- **Complete Models (${tradeoff.matchingModels.length})**:`);
    if (tradeoff.matchingModels.length === 0) {
      lines.push('  - *(None)*');
    } else {
      for (const model of tradeoff.matchingModels) {
        lines.push(`  - \`${model.modelId}\` (${model.displayName})`);
      }
    }
    lines.push('');
  }

  // Section 3: Presence Matrix
  lines.push('## 3. Qualified Model × Active Benchmark Presence Matrix');
  lines.push('');
  lines.push(
    'Presence indicates that the qualified base model has an eligible current result with non-null normalized score for the benchmark in an active whitelisted source.',
  );
  lines.push('');

  const headers = [
    'Model',
    'Model ID',
    'Total',
    ...analysis.activeBenchmarkIds.map((id) => `\`${id}\``),
  ];
  lines.push(`| ${headers.join(' | ')} |`);
  lines.push(
    `| ${headers.map((_, i) => (i === 2 ? '--:' : i >= 3 ? ':-:' : '---')).join(' | ')} |`,
  );

  for (const row of analysis.matrix) {
    const cols = [
      row.model.displayName,
      `\`${row.model.modelId}\``,
      `${row.presentBenchmarkCount}/${analysis.activeBenchmarkIds.length}`,
      ...analysis.activeBenchmarkIds.map((bId) =>
        row.presence[bId] ? '✓' : '-',
      ),
    ];
    lines.push(`| ${cols.join(' | ')} |`);
  }

  // Benchmark totals summary row
  const benchmarkTotals = analysis.activeBenchmarkIds.map((bId) => {
    let count = 0;
    for (const row of analysis.matrix) {
      if (row.presence[bId]) count++;
    }
    return count;
  });

  const totalsCols = [
    '**Total Models Covered**',
    '—',
    `—`,
    ...benchmarkTotals.map((count) => `**${count}**`),
  ];
  lines.push(`| ${totalsCols.join(' | ')} |`);
  lines.push('');

  return `${lines.join('\n')}\n`;
};
