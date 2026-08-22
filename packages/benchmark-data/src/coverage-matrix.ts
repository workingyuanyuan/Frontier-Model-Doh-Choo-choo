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

export interface SourceCompositionEntry {
  sourceId: string;
  benchmarkCount: number; // benchmarks in the subset this source can provide
  exclusiveBenchmarkCount: number; // of those, ones no other source provides
}

export interface SourceComposition {
  sourceSpan: number; // distinct sources providing >= 1 benchmark of the subset
  exclusiveSources: number; // distinct sources that are the sole provider of >= 1 benchmark
  maxSourceShare: number; // max over sources of exclusiveBenchmarkCount / N, 0 when N = 0
  bySource: SourceCompositionEntry[]; // sorted by sourceId
}

export interface TradeoffCandidate {
  benchmarkIds: string[];
  completeModelCount: number;
  coveredDimensionCount: number;
  coveredDimensions: DimensionId[];
  matchingModels: QualifiedModel[];
  sourceComposition: SourceComposition;
}

export interface TradeoffResult {
  benchmarkCount: number;
  candidates: TradeoffCandidate[]; // ranked best-first, length <= candidatesPerScale
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
  requiredBenchmarkIds: string[];
  candidatesPerScale: number;
  qualifiedModels: QualifiedModel[];
  matrix: ModelBenchmarkPresence[];
  tradeoffs: TradeoffResult[];
  maskFrequencies: MaskFrequency[];
  benchmarkDimensions: Record<string, BenchmarkDimensionInfo>;
  benchmarkSources: Record<string, string[]>;
}

export interface CoverageAnalysisInput {
  catalog: ModelCatalog;
  frontierConfig: FrontierConfig;
  benchmarkMapping: BenchmarkDimensionMapping;
  profilePolicy: ProfilePolicy;
  whitelist: readonly string[];
  sourceCandidates: readonly CandidateResult[];
  referenceDate: string;
  candidatesPerScale?: number;
  /**
   * Benchmarks every candidate combination must contain.
   *
   * An id that is not an active benchmark throws rather than being ignored: a
   * typo would otherwise silently produce the unconstrained curve.
   */
  requiredBenchmarkIds?: readonly string[];
}

export interface WorkspaceCoverageData {
  catalog: ModelCatalog;
  frontierConfig: FrontierConfig;
  benchmarkMapping: BenchmarkDimensionMapping;
  profilePolicy: ProfilePolicy;
  whitelist: string[];
  sourceCandidates: CandidateResult[];
}

export interface CandidateRankingMetrics {
  completeModelCount: number;
  coveredDimensionCount: number;
  exclusiveSources: number;
  maxSourceShare: number;
  benchmarkIds: readonly string[];
}

export interface CurveComparisonRow {
  benchmarkCount: number;
  unconstrainedCompleteModelCount: number | null; // null when that N has no candidate
  baselineCompleteModelCount: number | null;
  deltaVsSourceCompleteBaseline: number | null; // unconstrained - baseline, null if either null
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

function popcountBigInt(n: bigint): number {
  let count = 0;
  let value = n;
  while (value > 0n) {
    count += Number(value & 1n);
    value >>= 1n;
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
 * Strict ranking comparator for tradeoff candidates:
 * 1. completeModelCount - descending
 * 2. coveredDimensionCount - descending
 * 3. sourceComposition.exclusiveSources - descending
 * 4. sourceComposition.maxSourceShare - ascending
 * 5. benchmarkIds - lexicographical ascending
 */
export const compareTradeoffCandidates = (
  a: CandidateRankingMetrics,
  b: CandidateRankingMetrics,
): number => {
  if (a.completeModelCount !== b.completeModelCount) {
    return b.completeModelCount - a.completeModelCount;
  }
  if (a.coveredDimensionCount !== b.coveredDimensionCount) {
    return b.coveredDimensionCount - a.coveredDimensionCount;
  }
  if (a.exclusiveSources !== b.exclusiveSources) {
    return b.exclusiveSources - a.exclusiveSources;
  }
  if (a.maxSourceShare !== b.maxSourceShare) {
    return a.maxSourceShare - b.maxSourceShare;
  }
  return compareLexicographically(a.benchmarkIds, b.benchmarkIds);
};

/**
 * Compute detailed source composition for a benchmark subset.
 */
export const computeSourceComposition = (
  benchmarkIds: readonly string[],
  benchmarkSources: Record<string, string[]>,
  _whitelist?: readonly string[],
): SourceComposition => {
  const N = benchmarkIds.length;
  if (N === 0) {
    return {
      sourceSpan: 0,
      exclusiveSources: 0,
      maxSourceShare: 0,
      bySource: [],
    };
  }

  const countsBySource = new Map<
    string,
    { benchmarkCount: number; exclusiveBenchmarkCount: number }
  >();

  for (const bId of benchmarkIds) {
    const sources = benchmarkSources[bId] ?? [];
    const isExclusive = sources.length === 1;
    for (const sId of sources) {
      const entry = countsBySource.get(sId) ?? {
        benchmarkCount: 0,
        exclusiveBenchmarkCount: 0,
      };
      entry.benchmarkCount += 1;
      if (isExclusive) {
        entry.exclusiveBenchmarkCount += 1;
      }
      countsBySource.set(sId, entry);
    }
  }

  const bySource: SourceCompositionEntry[] = [...countsBySource.entries()]
    .map(([sourceId, { benchmarkCount, exclusiveBenchmarkCount }]) => ({
      sourceId,
      benchmarkCount,
      exclusiveBenchmarkCount,
    }))
    .toSorted((left, right) => left.sourceId.localeCompare(right.sourceId));

  const sourceSpan = bySource.filter((e) => e.benchmarkCount > 0).length;
  const exclusiveSources = bySource.filter(
    (e) => e.exclusiveBenchmarkCount > 0,
  ).length;
  let maxExclusive = 0;
  for (const e of bySource) {
    if (e.exclusiveBenchmarkCount > maxExclusive) {
      maxExclusive = e.exclusiveBenchmarkCount;
    }
  }
  const maxSourceShare = N === 0 ? 0 : maxExclusive / N;

  return {
    sourceSpan,
    exclusiveSources,
    maxSourceShare,
    bySource,
  };
};

/**
 * Compare unconstrained tradeoff curve against a source-complete baseline curve.
 */
export const compareTradeoffCurves = (
  unconstrained: CoverageMatrixAnalysis,
  baseline: CoverageMatrixAnalysis,
): CurveComparisonRow[] => {
  const unconstrainedByN = new Map<number, number>();
  for (const t of unconstrained.tradeoffs) {
    if (t.candidates.length > 0 && t.candidates[0] !== undefined) {
      unconstrainedByN.set(
        t.benchmarkCount,
        t.candidates[0].completeModelCount,
      );
    }
  }

  const baselineByN = new Map<number, number>();
  for (const t of baseline.tradeoffs) {
    if (t.candidates.length > 0 && t.candidates[0] !== undefined) {
      baselineByN.set(t.benchmarkCount, t.candidates[0].completeModelCount);
    }
  }

  const allN = [
    ...new Set([...unconstrainedByN.keys(), ...baselineByN.keys()]),
  ].sort((a, b) => a - b);

  return allN.map((benchmarkCount) => {
    const unconstrainedCompleteModelCount =
      unconstrainedByN.get(benchmarkCount) ?? null;
    const baselineCompleteModelCount = baselineByN.get(benchmarkCount) ?? null;
    const deltaVsSourceCompleteBaseline =
      unconstrainedCompleteModelCount !== null &&
      baselineCompleteModelCount !== null
        ? unconstrainedCompleteModelCount - baselineCompleteModelCount
        : null;

    return {
      benchmarkCount,
      unconstrainedCompleteModelCount,
      baselineCompleteModelCount,
      deltaVsSourceCompleteBaseline,
    };
  });
};

/**
 * Pure coverage analysis function.
 */
export const analyzeCoverageMatrix = (
  input: CoverageAnalysisInput,
): CoverageMatrixAnalysis => {
  const qualificationWindowMonths =
    input.frontierConfig.qualificationWindowMonths ?? 12;

  const candidatesPerScale = input.candidatesPerScale ?? 5;
  if (!Number.isInteger(candidatesPerScale) || candidatesPerScale < 1) {
    throw new Error(
      `candidatesPerScale must be an integer >= 1; received ${candidatesPerScale}`,
    );
  }

  // 1. Model qualification using canonical B4 implementation
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

  // 7. Active benchmarks and benchmark sources: only those present in active evidence for qualified models
  const eligibleSelectedResults = selectedResults.filter(
    ({ model, benchmarkId }) =>
      model.canonicalModelId !== null &&
      qualifiedModelIdSet.has(model.canonicalModelId) &&
      Object.hasOwn(benchmarkDimensions, benchmarkId),
  );

  const activeBenchmarkIds = [
    ...new Set(eligibleSelectedResults.map((r) => r.benchmarkId)),
  ].toSorted((left, right) => left.localeCompare(right));

  const rawBenchmarkSourcesMap = new Map<string, Set<string>>();
  for (const bId of activeBenchmarkIds) {
    rawBenchmarkSourcesMap.set(bId, new Set<string>());
  }
  for (const result of eligibleSelectedResults) {
    if (rawBenchmarkSourcesMap.has(result.benchmarkId)) {
      rawBenchmarkSourcesMap.get(result.benchmarkId)!.add(result.sourceId);
    }
  }

  const benchmarkSources: Record<string, string[]> = {};
  for (const bId of activeBenchmarkIds) {
    benchmarkSources[bId] = [...rawBenchmarkSourcesMap.get(bId)!].toSorted(
      (left, right) => left.localeCompare(right),
    );
  }

  const benchmarkIndexMap = new Map(
    activeBenchmarkIds.map((id, idx) => [id, idx]),
  );

  // 8. Model x Benchmark presence map
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
        mask += 2 ** bit;
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

  // 10. Exact tradeoff search with DP keeping top-k candidates per (count, key)
  const M = activeBenchmarkIds.length;
  const tradeoffs: TradeoffResult[] = [];

  const requiredBenchmarkIds = [
    ...new Set(input.requiredBenchmarkIds ?? []),
  ].toSorted((left, right) => left.localeCompare(right));
  const unknownRequired = requiredBenchmarkIds.filter(
    (id) => !activeBenchmarkIds.includes(id),
  );
  if (unknownRequired.length > 0) {
    throw new Error(
      `required benchmarks are not active: ${unknownRequired.join(', ')}`,
    );
  }
  if (M > 53) {
    throw new Error(
      `coverage-matrix supports at most 53 active benchmarks in its exact numeric presence masks; received ${M}`,
    );
  }

  const whitelist = [...whitelistSet].sort();

  if (M > 0) {
    const requiredSet = new Set(requiredBenchmarkIds);
    const modelIndexMap = new Map(
      qualifiedModels.map(({ modelId }, index) => [modelId, index]),
    );
    const benchmarkSupportMasks = activeBenchmarkIds.map((benchmarkId) => {
      let support = 0n;
      for (const row of matrix) {
        if (row.presence[benchmarkId]) {
          support |= 1n << BigInt(modelIndexMap.get(row.model.modelId)!);
        }
      }
      return support;
    });
    const allModelSupport = (1n << BigInt(qualifiedModels.length)) - 1n;

    const benchmarkDimMaskByIndex = activeBenchmarkIds.map((bId) => {
      const dims = benchmarkDimensions[bId]?.allDimensions ?? [];
      let dMask = 0;
      for (const d of dims) {
        const idx = DIMENSION_IDS.indexOf(d);
        if (idx >= 0) dMask |= 1 << idx;
      }
      return dMask;
    });

    const whitelistIndexMap = new Map(
      whitelist.map((id, index) => [id, index]),
    );
    const benchmarkSourceSpanMasks = activeBenchmarkIds.map((bId) => {
      const sources = benchmarkSources[bId] ?? [];
      let spanMask = 0;
      for (const sId of sources) {
        const idx = whitelistIndexMap.get(sId);
        if (idx !== undefined) spanMask |= 1 << idx;
      }
      return spanMask;
    });

    const benchmarkExclusiveSourceIndex = activeBenchmarkIds.map((bId) => {
      const sources = benchmarkSources[bId] ?? [];
      if (sources.length === 1) {
        const idx = whitelistIndexMap.get(sources[0]!);
        return idx !== undefined ? idx : -1;
      }
      return -1;
    });

    interface SubsetState {
      benchmarkIds: string[];
      supportMask: bigint;
      dimensionMask: number;
      sourceSpanMask: number;
      exclusiveCounts: number[];
      exclusiveSources: number;
      maxExclusiveCount: number;
      maxSourceShare: number;
      completeModelCount: number;
      coveredDimensionCount: number;
    }

    const initialExclusiveCounts = new Array(whitelist.length).fill(0);
    let statesByCount = new Map<number, Map<string, SubsetState[]>>([
      [
        0,
        new Map([
          [
            `${allModelSupport.toString(16)}:0`,
            [
              {
                benchmarkIds: [],
                supportMask: allModelSupport,
                dimensionMask: 0,
                sourceSpanMask: 0,
                exclusiveCounts: initialExclusiveCounts,
                exclusiveSources: 0,
                maxExclusiveCount: 0,
                maxSourceShare: 0,
                completeModelCount: qualifiedModels.length,
                coveredDimensionCount: 0,
              },
            ],
          ],
        ]),
      ],
    ]);

    for (let benchmarkIndex = 0; benchmarkIndex < M; benchmarkIndex += 1) {
      const benchmarkId = activeBenchmarkIds[benchmarkIndex]!;
      const mustInclude = requiredSet.has(benchmarkId);
      const nextByCount = new Map<number, Map<string, SubsetState[]>>();

      const retain = (count: number, state: SubsetState): void => {
        const bucket =
          nextByCount.get(count) ?? new Map<string, SubsetState[]>();
        const key = `${state.supportMask.toString(16)}:${state.dimensionMask}`;
        const existingList = bucket.get(key);
        if (!existingList) {
          bucket.set(key, [state]);
        } else {
          let insertIndex = 0;
          while (
            insertIndex < existingList.length &&
            compareTradeoffCandidates(existingList[insertIndex]!, state) <= 0
          ) {
            insertIndex += 1;
          }
          if (insertIndex < candidatesPerScale) {
            existingList.splice(insertIndex, 0, state);
            if (existingList.length > candidatesPerScale) {
              existingList.pop();
            }
          }
        }
        nextByCount.set(count, bucket);
      };

      for (const [count, bucket] of statesByCount) {
        for (const stateList of bucket.values()) {
          for (const state of stateList) {
            if (!mustInclude) {
              retain(count, state);
            }

            const nextCount = count + 1;
            const nextSupportMask =
              state.supportMask & benchmarkSupportMasks[benchmarkIndex]!;
            const nextDimensionMask =
              state.dimensionMask | benchmarkDimMaskByIndex[benchmarkIndex]!;
            const nextSourceSpanMask =
              state.sourceSpanMask | benchmarkSourceSpanMasks[benchmarkIndex]!;

            const exIdx = benchmarkExclusiveSourceIndex[benchmarkIndex]!;
            let nextExclusiveCounts = state.exclusiveCounts;
            let nextExclusiveSources = state.exclusiveSources;
            let nextMaxExclusiveCount = state.maxExclusiveCount;

            if (exIdx !== -1) {
              nextExclusiveCounts = [...state.exclusiveCounts];
              const prevSlot = nextExclusiveCounts[exIdx]!;
              nextExclusiveCounts[exIdx] = prevSlot + 1;
              if (prevSlot === 0) {
                nextExclusiveSources += 1;
              }
              if (nextExclusiveCounts[exIdx]! > nextMaxExclusiveCount) {
                nextMaxExclusiveCount = nextExclusiveCounts[exIdx]!;
              }
            }

            const nextMaxSourceShare =
              nextCount === 0 ? 0 : nextMaxExclusiveCount / nextCount;
            const nextCompleteModelCount = popcountBigInt(nextSupportMask);
            const nextCoveredDimensionCount = popcount(nextDimensionMask);

            retain(nextCount, {
              benchmarkIds: [...state.benchmarkIds, benchmarkId],
              supportMask: nextSupportMask,
              dimensionMask: nextDimensionMask,
              sourceSpanMask: nextSourceSpanMask,
              exclusiveCounts: nextExclusiveCounts,
              exclusiveSources: nextExclusiveSources,
              maxExclusiveCount: nextMaxExclusiveCount,
              maxSourceShare: nextMaxSourceShare,
              completeModelCount: nextCompleteModelCount,
              coveredDimensionCount: nextCoveredDimensionCount,
            });
          }
        }
      }
      statesByCount = nextByCount;
    }

    for (let N = 1; N <= M; N++) {
      const bucket = statesByCount.get(N);
      if (!bucket) continue;

      const allStatesForN: SubsetState[] = [];
      for (const stateList of bucket.values()) {
        allStatesForN.push(...stateList);
      }

      allStatesForN.sort(compareTradeoffCandidates);
      const topStates = allStatesForN.slice(0, candidatesPerScale);

      if (topStates.length === 0) continue;

      const candidates: TradeoffCandidate[] = topStates.map((state) => ({
        benchmarkIds: state.benchmarkIds,
        completeModelCount: state.completeModelCount,
        coveredDimensionCount: state.coveredDimensionCount,
        coveredDimensions: DIMENSION_IDS.filter(
          (_, idx) => (state.dimensionMask & (1 << idx)) !== 0,
        ),
        matchingModels: qualifiedModels.filter((_, modelIndex) =>
          Boolean(state.supportMask & (1n << BigInt(modelIndex))),
        ),
        sourceComposition: computeSourceComposition(
          state.benchmarkIds,
          benchmarkSources,
          whitelist,
        ),
      }));

      tradeoffs.push({
        benchmarkCount: N,
        candidates,
      });
    }
  }

  return {
    referenceDate: input.referenceDate,
    qualificationWindowMonths,
    whitelist,
    activeBenchmarkIds,
    requiredBenchmarkIds,
    candidatesPerScale,
    qualifiedModels,
    matrix,
    tradeoffs,
    maskFrequencies,
    benchmarkDimensions,
    benchmarkSources,
  };
};

export interface FormatCoverageMatrixOptions {
  baseline?: CoverageMatrixAnalysis;
}

/**
 * Format the analysis into Markdown review material.
 */
export const formatCoverageMatrixMarkdown = (
  analysis: CoverageMatrixAnalysis,
  options?: FormatCoverageMatrixOptions,
): string => {
  const lines: string[] = [];

  const pushCurveHeader = (): void => {
    lines.push(
      '| $N$ | Rank | Complete Models | Covered Dimensions | Sources (Span / Excl / MaxShare) | Chosen Benchmarks |',
    );
    lines.push(
      '| --: | :--: | --------------: | :----------------: | :------------------------------: | --- |',
    );
  };

  const pushCurveRows = (
    tradeoffs: readonly TradeoffResult[],
    anchorPrefix: string,
  ): void => {
    for (const tradeoff of tradeoffs) {
      for (let cIdx = 0; cIdx < tradeoff.candidates.length; cIdx += 1) {
        const candidate = tradeoff.candidates[cIdx]!;
        const rank = cIdx + 1;
        const comp = candidate.sourceComposition;
        const sharePct = (comp.maxSourceShare * 100).toFixed(1);
        const anchor = `#${anchorPrefix}scale-n--${tradeoff.benchmarkCount}-candidate-${rank}-${candidate.completeModelCount}-complete-models`;
        lines.push(
          `| ${tradeoff.benchmarkCount} | #${rank} | **${candidate.completeModelCount}** | ${candidate.coveredDimensionCount}/8 (${candidate.coveredDimensions.join(', ')}) | ${comp.sourceSpan} / ${comp.exclusiveSources} / ${sharePct}% | [list + models](${anchor}) |`,
        );
      }
    }
    lines.push('');
  };

  /**
   * Candidate detail blocks. Every candidate keeps its full benchmark list,
   * source breakdown and model list, but each is rendered on one line: the
   * 45 x 5 candidate grid would otherwise run to roughly fourteen thousand
   * lines and stop being reviewable. Display names are not repeated here --
   * the presence matrix section maps every model id to its display name.
   */
  const pushCandidateDetails = (
    tradeoffs: readonly TradeoffResult[],
    headingPrefix: string,
  ): void => {
    for (const tradeoff of tradeoffs) {
      for (let cIdx = 0; cIdx < tradeoff.candidates.length; cIdx += 1) {
        const candidate = tradeoff.candidates[cIdx]!;
        const comp = candidate.sourceComposition;
        const sharePct = (comp.maxSourceShare * 100).toFixed(1);
        const breakdown = comp.bySource
          .map(
            (s) =>
              `\`${s.sourceId}\` ${s.benchmarkCount} (${s.exclusiveBenchmarkCount} exclusive)`,
          )
          .join(', ');
        lines.push(
          `### ${headingPrefix}Scale N = ${tradeoff.benchmarkCount}, Candidate #${cIdx + 1} (${candidate.completeModelCount} complete models)`,
          '',
          `- **Chosen Benchmarks (${candidate.benchmarkIds.length})**: ${candidate.benchmarkIds.map((id) => `\`${id}\``).join(', ')}`,
          `- **Covered Dimensions (${candidate.coveredDimensionCount}/8)**: ${candidate.coveredDimensions.join(', ')}`,
          `- **Source Composition**: \`sourceSpan\` ${comp.sourceSpan}, \`exclusiveSources\` ${comp.exclusiveSources}, \`maxSourceShare\` ${sharePct}% -- ${breakdown}`,
          `- **Complete Models (${candidate.matchingModels.length})**: ${
            candidate.matchingModels.length === 0
              ? '*(none)*'
              : candidate.matchingModels
                  .map((model) => `\`${model.modelId}\``)
                  .join(', ')
          }`,
          '',
        );
      }
    }
  };

  const baseline = options?.baseline;

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
  lines.push(
    `- **Candidates per Scale ($k$)**: ${analysis.candidatesPerScale}`,
  );
  lines.push(
    `- **Required Benchmarks (Baseline)**: ${
      baseline && baseline.requiredBenchmarkIds.length > 0
        ? baseline.requiredBenchmarkIds.map((id) => `\`${id}\``).join(', ')
        : 'none (unconstrained only)'
    }`,
  );
  lines.push('');
  lines.push(
    '> [!NOTE]',
    '> This report is Gate 2 review material (`docs/REFACTOR_SPEC_V2.md` §5.3, `tasks/claude-code-plan.md` D3).',
    '> It details the empirical coverage tradeoff between retained benchmark count and complete qualified base-model count to inform manual configuration of `data-v2/mappings/display-set.json`.',
    '> It does not modify `display-set.json`.',
    "> Coverage is unioned across a canonical base model's product profiles, as required by the §5.3 model bitmask. D2 main-screen eligibility is stricter: one profile must pass the selected matrix and have all eight rendered dimensions. Complete-model counts here are therefore review upper bounds, not predicted main-screen row counts.",
  );
  if (baseline && baseline.requiredBenchmarkIds.length > 0) {
    lines.push(
      '>',
      `> Requirements are not pinned by default (ruling R7). The primary tradeoff curve is unconstrained, and the baseline curve below reflects the \`--require\` constraints for side-by-side cost comparison.`,
    );
  } else {
    lines.push(
      '>',
      `> Requirements are not pinned by default (ruling R7). The curve below is unconstrained. To compare against a source-complete baseline, pass \`--require=<benchmark-ids>\`.`,
    );
  }
  lines.push('');

  // Definitions
  lines.push('## Definitions');
  lines.push('');
  lines.push(
    '- **`sourceSpan`**: The number of distinct whitelisted data sources providing at least one benchmark in the candidate subset.',
  );
  lines.push(
    '- **`exclusiveSources`**: The number of distinct whitelisted data sources that are the sole provider of at least one benchmark in the candidate subset. Higher indicates more sources are load-bearing.',
  );
  lines.push(
    '- **`maxSourceShare`**: The maximum proportion of the candidate subset provided exclusively by any single data source ($\\max(\\text{exclusive benchmarks per source}) / N$, or $0$ when $N = 0$). Lower indicates less concentration in a single source.',
  );
  lines.push(
    '- **`deltaVsSourceCompleteBaseline`**: Best unconstrained complete-model count at scale $N$ minus best baseline complete-model count at scale $N$ ($\\text{unconstrained} - \\text{baseline}$). Evaluated as `null` (N/A) when either curve has no candidate at scale $N$.',
  );
  lines.push('');

  // Search & Pruning Honesty Disclosure
  lines.push(
    '> [!NOTE]',
    `> **Search & Pruning Disclosure**: Dynamic programming groups benchmark subsets by model support bitmask and dimension coverage mask, retaining up to $k = ${analysis.candidatesPerScale}$ candidate states per $(N, \\text{key})$ ordered strictly by complete model count (descending), covered dimension count (descending), exclusive sources count (descending), maximum source share (ascending), and lexicographical benchmark IDs (ascending). The candidates presented at each scale $N$ are the top subsets across retained keys, not an unpruned global exhaustive enumeration across all $2^M$ subsets. Subsets with identical model support and dimension coverage may have different source compositions; DP pruning at intermediate steps retains the top $k$ states per key.`,
  );
  lines.push('');

  // Section 1: Unconstrained Tradeoff Curve
  lines.push('## 1. Tradeoff Curve (Unconstrained)');
  lines.push('');
  lines.push(
    `For each retained benchmark count $N$ from 1 to the active benchmark count, the table below lists up to ${analysis.candidatesPerScale} candidate combinations that maximize the number of complete qualified base models. Deterministic ranking order strictly favors:`,
  );
  lines.push('1. Complete model count (descending)');
  lines.push('2. Covered dimension count (descending)');
  lines.push('3. Exclusive sources count (descending)');
  lines.push('4. Maximum exclusive source share (ascending)');
  lines.push('5. Lexicographical benchmark ID order (ascending)');
  lines.push('');
  lines.push(
    'The chosen benchmark IDs and the complete-model list of every candidate live in the candidate detail sections below; each row links to its own block. Keeping the full 45-item ID lists out of the curve tables is what keeps the curve scannable.',
  );
  lines.push('');

  pushCurveHeader();
  pushCurveRows(analysis.tradeoffs, '');

  let nextSectionNumber = 2;

  if (baseline) {
    const requiredList = baseline.requiredBenchmarkIds
      .map((id) => `\`${id}\``)
      .join(', ');

    lines.push(
      `## ${nextSectionNumber++}. Curve Comparison (Unconstrained vs. Baseline)`,
    );
    lines.push('');
    lines.push(
      `Comparison of the best complete-model count at each scale $N$ between the unconstrained curve and the source-complete baseline curve (${requiredList}).`,
    );
    lines.push(
      '`deltaVsSourceCompleteBaseline` is defined as best unconstrained complete-model count at this $N$ minus best baseline complete-model count at this $N$. This report states the difference and never labels it large or small; that judgement belongs to the review gate.',
    );
    lines.push('');
    lines.push(
      '| $N$ | Unconstrained Complete Models | Baseline Complete Models | $\\Delta$ vs. Baseline |',
    );
    lines.push('| --: | --: | --: | --: |');
    for (const row of compareTradeoffCurves(analysis, baseline)) {
      const unconstrained = row.unconstrainedCompleteModelCount;
      const base = row.baselineCompleteModelCount;
      const delta = row.deltaVsSourceCompleteBaseline;
      lines.push(
        `| ${row.benchmarkCount} | ${unconstrained === null ? '—' : `**${unconstrained}**`} | ${base === null ? '—' : `**${base}**`} | ${delta === null ? '—' : delta > 0 ? `+${delta}` : `${delta}`} |`,
      );
    }
    lines.push('');

    lines.push(
      `## ${nextSectionNumber++}. Baseline Tradeoff Curve (${requiredList})`,
    );
    lines.push('');
    lines.push(
      `For each retained benchmark count $N$ from ${baseline.requiredBenchmarkIds.length} to the active benchmark count, the table below lists up to ${baseline.candidatesPerScale} candidate combinations subject to the required benchmarks baseline.`,
    );
    lines.push('');
    pushCurveHeader();
    pushCurveRows(baseline.tradeoffs, 'baseline-');
  }

  lines.push(
    baseline
      ? `## ${nextSectionNumber++}. Unconstrained Candidate Details`
      : `## ${nextSectionNumber++}. Tradeoff Combination Model Details`,
  );
  lines.push('');
  lines.push(
    'Complete qualified base-model lists and source composition for each optimal candidate combination in the unconstrained tradeoff curve.',
  );
  lines.push('');

  pushCandidateDetails(analysis.tradeoffs, '');

  if (baseline) {
    lines.push(`## ${nextSectionNumber++}. Baseline Candidate Details`);
    lines.push('');
    lines.push(
      'Complete qualified base-model lists and source composition for each candidate combination in the baseline tradeoff curve.',
    );
    lines.push('');

    pushCandidateDetails(baseline.tradeoffs, 'Baseline ');
  }

  // Presence Matrix
  lines.push(
    `## ${nextSectionNumber}. Qualified Model × Active Benchmark Presence Matrix`,
  );
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
