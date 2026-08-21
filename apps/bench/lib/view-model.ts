import type {
  ModelProfile,
  ProductEvidence,
  ProductVersion,
} from '@llm-bench/benchmark-data';

export type LeaderboardRow = ProductVersion['leaderboard'][number];
type CostPoint = ProductVersion['costs'][number];

export const COST_SOURCE_WEIGHTS = {
  'artificial-analysis': 0.25,
  livebench: 0.25,
  deepswe: 0.25,
  'frontier-code': 0.25,
} as const;

export const ADVANCED_COST_SOURCE_IDS = [
  'artificial-analysis',
  'deepswe',
  'frontier-code',
] as const;

export type AdvancedCostSourceId = (typeof ADVANCED_COST_SOURCE_IDS)[number];

export const COST_EFFORT_ORDER = [
  'non-reasoning',
  'low',
  'medium',
  'high',
  'xhigh',
  'max',
] as const;

const COST_EFFORT_RANK: ReadonlyMap<string, number> = new Map(
  COST_EFFORT_ORDER.map((effort, index) => [effort, index]),
);

const isTaskCost = (point: CostPoint): boolean =>
  (point.costType === 'MEASURED_TASK' || point.costType === 'AGENT_TASK') &&
  point.unit === 'USD_PER_TASK';

export interface WeightedCostPoint {
  modelId: string;
  profileId: string;
  /** Profiles selected independently for each source in this blended point. */
  selectedProfileIds: string[];
  providerId: string;
  displayName: string;
  performance: number;
  normalizedCost: number;
  sourceCount: number;
  sourceWeight: number;
  sourceCosts: Array<{
    sourceId: string;
    cost: number;
    normalizedCost: number;
    weight: number;
    profileId: string;
    performance: number;
    sourceScore: number | null;
    metricName: string;
    sourceUrl: string;
  }>;
}

export interface AdvancedCostSourceDetail {
  sourceId: AdvancedCostSourceId;
  cost: number;
  normalizedCost: number;
  score: number;
  /** The score is intentionally source-local; it is never ProductCost.performance. */
  scoreBasis: 'AA_INTELLIGENCE_INDEX' | 'DEEPSWE_1_1' | 'FRONTIER_CODE_1_1';
  scoreBenchmarkId: string;
  metricName: string;
  sourceUrl: string;
  benchmarkId: string | null;
  evidenceIds: string[];
}

export interface AdvancedCostPoint {
  modelId: string;
  profileId: string;
  providerId: string;
  displayName: string;
  effort: string;
  isDefaultEffort: boolean;
  /**
   * The three-source blended cost index (0-100), NOT dollars. Per-source USD
   * lives on `sources[].cost`; the two must never be confused on an axis.
   */
  costIndex: number;
  /** Arithmetic mean of the three sources' own scores, raw and unnormalized. */
  score: number;
  sources: AdvancedCostSourceDetail[];
}

export interface AdvancedCostSeries {
  seriesId: string;
  modelId: string;
  providerId: string;
  displayName: string;
  points: AdvancedCostPoint[];
}

export const compareDefaultLeaderboardRows = (
  left: LeaderboardRow,
  right: LeaderboardRow,
): number =>
  (right.overallScore ?? Number.NEGATIVE_INFINITY) -
    (left.overallScore ?? Number.NEGATIVE_INFINITY) ||
  left.profileId.localeCompare(right.profileId);

const compareRepresentativeCandidates = (
  left: LeaderboardRow,
  right: LeaderboardRow,
): number => {
  const leftScore = left.overallScore ?? Number.NEGATIVE_INFINITY;
  const rightScore = right.overallScore ?? Number.NEGATIVE_INFINITY;
  if (leftScore !== rightScore) {
    return rightScore - leftScore;
  }
  return left.profileId.localeCompare(right.profileId);
};

export const profileById = (
  product: ProductVersion,
  profileId: string,
): ModelProfile | undefined =>
  product.profiles.find((profile) => profile.id === profileId);

export const getProfileIdentity = (profile: ModelProfile): string => {
  const effort = profile.attributes.effort ?? 'default';
  return effort.toLocaleLowerCase() === 'xhigh' ? 'xHigh' : effort;
};

export const getProfileDisplayName = (profile: ModelProfile): string =>
  `${profile.baseModelName} · ${getProfileIdentity(profile)}`;

export const getRepresentativeRows = (
  product: ProductVersion,
): LeaderboardRow[] => {
  const rows = new Map<string, LeaderboardRow>();
  product.leaderboard.forEach((row) => {
    const current = rows.get(row.modelId);
    if (!current || compareRepresentativeCandidates(row, current) < 0) {
      rows.set(row.modelId, row);
    }
  });
  return [...rows.values()]
    .sort(compareDefaultLeaderboardRows)
    .map((row, index) => ({
      ...row,
      rank: row.overallScore === null ? null : index + 1,
    }));
};

const includedEvidenceForProfile = (
  product: ProductVersion,
  profileId: string,
): ProductEvidence[] =>
  product.evidence.filter(
    (result) =>
      result.inclusion === 'INCLUDED' &&
      result.model.profileId === profileId &&
      result.normalizedScore !== null,
  );

/**
 * Return the display-set cells that are absent for a product profile.
 * Completeness is based on explicit included evidence, not on an aggregate
 * dimension score, so a benchmark mapped to the same dimension as another
 * benchmark cannot mask a missing cell.
 */
export const getMissingDisplaySetBenchmarks = (
  product: ProductVersion,
  profileId: string,
  displaySet: { benchmarkIds: readonly string[] } | null,
): string[] => {
  if (!displaySet) return [];
  const available = new Set(
    includedEvidenceForProfile(product, profileId).map(
      ({ benchmarkId }) => benchmarkId,
    ),
  );
  return displaySet.benchmarkIds.filter(
    (benchmarkId) => !available.has(benchmarkId),
  );
};

export const hasCompleteDisplaySet = (
  product: ProductVersion,
  profileId: string,
  displaySet: { benchmarkIds: readonly string[] } | null,
): boolean =>
  displaySet !== null &&
  getMissingDisplaySetBenchmarks(product, profileId, displaySet).length === 0;

export const hasCompleteDimensionScores = (row: LeaderboardRow): boolean =>
  row.overallScore !== null &&
  row.dimensions.every(({ score }) => score !== null);

/**
 * A main-screen profile must pass both the explicit benchmark matrix and the
 * no-N/A rendered-dimension invariant. The latter is deliberately separate:
 * display-set benchmarks do not necessarily span all eight dimensions.
 */
export const isMainEligibleRow = (
  product: ProductVersion,
  row: LeaderboardRow,
  displaySet: { benchmarkIds: readonly string[] } | null,
): boolean =>
  hasCompleteDisplaySet(product, row.profileId, displaySet) &&
  hasCompleteDimensionScores(row);

export interface DeveloperModelRow {
  modelId: string;
  profileId: string;
  displayName: string;
  missingBenchmarkIds: string[];
}

/**
 * Keep excluded models on a small, non-aggregated diagnostic route. For
 * diagnostic clarity, select the candidate profile with the fewest missing
 * display-set benchmarks, then highest overallScore, then profileId order.
 * No overall or dimension values are returned to the caller.
 */
export const getDeveloperModelRows = (
  product: ProductVersion,
  displaySet: { benchmarkIds: readonly string[] } | null,
): DeveloperModelRow[] => {
  const eligibleModelIds = new Set(
    product.leaderboard
      .filter((row) => isMainEligibleRow(product, row, displaySet))
      .map(({ modelId }) => modelId),
  );

  const modelProfilesMap = new Map<string, string[]>();

  product.profiles.forEach((p) => {
    if (!eligibleModelIds.has(p.modelId)) {
      const list = modelProfilesMap.get(p.modelId) ?? [];
      list.push(p.id);
      modelProfilesMap.set(p.modelId, list);
    }
  });

  const rows: DeveloperModelRow[] = [];

  for (const [modelId, profileIds] of modelProfilesMap.entries()) {
    const candidateRankings = profileIds.map((pId) => {
      const missing = getMissingDisplaySetBenchmarks(product, pId, displaySet);
      const score =
        product.leaderboard.find((r) => r.profileId === pId)?.overallScore ??
        null;
      return {
        profileId: pId,
        missingBenchmarkIds: missing,
        missingCount: missing.length,
        overallScore: score,
      };
    });

    candidateRankings.sort((a, b) => {
      if (a.missingCount !== b.missingCount) {
        return a.missingCount - b.missingCount;
      }
      const scoreA = a.overallScore ?? Number.NEGATIVE_INFINITY;
      const scoreB = b.overallScore ?? Number.NEGATIVE_INFINITY;
      if (scoreA !== scoreB) {
        return scoreB - scoreA;
      }
      return a.profileId.localeCompare(b.profileId);
    });

    const best = candidateRankings[0];
    if (best) {
      const profile = profileById(product, best.profileId);
      rows.push({
        modelId,
        profileId: best.profileId,
        displayName: profile ? getProfileDisplayName(profile) : best.profileId,
        missingBenchmarkIds: best.missingBenchmarkIds,
      });
    }
  }

  rows.sort((a, b) => a.displayName.localeCompare(b.displayName));
  return rows;
};

export const filterLeaderboard = (
  product: ProductVersion,
  query: string,
): LeaderboardRow[] => {
  const representatives = getRepresentativeRows(product);
  const normalizedQuery = query.trim().toLocaleLowerCase();
  if (!normalizedQuery) return representatives;

  return representatives.filter((row) =>
    product.profiles
      .filter((profile) => profile.modelId === row.modelId)
      .some((profile) =>
        [
          profile.displayName,
          profile.baseModelName,
          profile.providerId,
          profile.attributes.effort,
        ]
          .filter((value): value is string => Boolean(value))
          .some((value) => value.toLocaleLowerCase().includes(normalizedQuery)),
      ),
  );
};

export const getProfilesForModel = (
  product: ProductVersion,
  modelId: string,
  representativeProfileId: string,
): ModelProfile[] =>
  product.profiles
    .filter((profile) => profile.modelId === modelId)
    .sort((left, right) => {
      if (left.id === representativeProfileId) return -1;
      if (right.id === representativeProfileId) return 1;
      return left.displayName.localeCompare(right.displayName);
    });

export const getEvidenceForProfile = (
  product: ProductVersion,
  profileId: string,
): ProductEvidence[] => {
  const profile = profileById(product, profileId);
  if (!profile) return [];

  return product.evidence
    .filter(
      (result) =>
        (result.inclusion === 'INCLUDED' &&
          result.model.profileId === profileId) ||
        (result.inclusion === 'EXCLUDED' &&
          result.model.canonicalModelId === profile.modelId),
    )
    .sort((left, right) => {
      if (left.inclusion !== right.inclusion) {
        return left.inclusion === 'INCLUDED' ? -1 : 1;
      }
      return (
        left.benchmarkId.localeCompare(right.benchmarkId) ||
        left.sourceId.localeCompare(right.sourceId) ||
        left.id.localeCompare(right.id)
      );
    });
};

export const splitCostSeries = (
  product: ProductVersion,
): { api: CostPoint[]; task: CostPoint[] } => ({
  api: product.costs.filter((point) => point.costType === 'API_STANDARDIZED'),
  task: product.costs.filter((point) =>
    ['MEASURED_TASK', 'AGENT_TASK'].includes(point.costType),
  ),
});

const median = (values: number[]): number => {
  const sorted = values.toSorted((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[middle - 1]! + sorted[middle]!) / 2
    : sorted[middle]!;
};

const sourceEvidenceForProfile = (
  product: ProductVersion,
  sourceId: string,
  profileId: string,
) =>
  product.evidence.filter(
    (evidence) =>
      evidence.inclusion === 'INCLUDED' &&
      evidence.sourceId === sourceId &&
      evidence.model.profileId === profileId &&
      evidence.normalizedScore !== null,
  );

const SOURCE_SCORE_BENCHMARK_IDS = {
  deepswe: 'deepswe-1-1',
  'frontier-code': 'frontier-code-1-1',
} as const;

const AA_INDEX_BENCHMARK_ID = 'artificial-analysis-intelligence-index';

type AdvancedScoreBasis = AdvancedCostSourceDetail['scoreBasis'];

interface SourceScore {
  score: number;
  basis: AdvancedScoreBasis;
  benchmarkId: string;
  sourceEffort: string | null;
}

const normalizeSourceEffort = (effort: string | null): string =>
  effort !== null && COST_EFFORT_RANK.has(effort) ? effort : 'default';

/**
 * Return the one source-native score that may be paired with an advanced
 * source cost. AA's Index is deliberately EXCLUDED from the eight-dimension
 * scoring matrix, so its published value lives in rawScore rather than
 * normalizedScore. DeepSWE and Frontier Code each have one included source
 * benchmark and use that benchmark's normalized score directly.
 */
const getAdvancedSourceScore = (
  product: ProductVersion,
  sourceId: AdvancedCostSourceId,
  profileId: string,
): SourceScore | null => {
  if (sourceId === 'artificial-analysis') {
    const evidence = product.evidence
      .filter(
        (result) =>
          result.inclusion === 'EXCLUDED' &&
          result.sourceId === sourceId &&
          result.model.profileId === profileId &&
          result.benchmarkId === AA_INDEX_BENCHMARK_ID,
      )
      .toSorted((left, right) => left.id.localeCompare(right.id))[0];
    return evidence
      ? {
          score: evidence.rawScore,
          basis: 'AA_INTELLIGENCE_INDEX',
          benchmarkId: AA_INDEX_BENCHMARK_ID,
          sourceEffort: evidence.profile.effort,
        }
      : null;
  }

  const benchmarkId = SOURCE_SCORE_BENCHMARK_IDS[sourceId];
  const evidence = product.evidence
    .filter(
      (result) =>
        result.inclusion === 'INCLUDED' &&
        result.sourceId === sourceId &&
        result.model.profileId === profileId &&
        result.benchmarkId === benchmarkId &&
        result.normalizedScore !== null,
    )
    .toSorted((left, right) => left.id.localeCompare(right.id))[0];
  return evidence?.normalizedScore === null || evidence === undefined
    ? null
    : {
        score: evidence.normalizedScore,
        basis: sourceId === 'deepswe' ? 'DEEPSWE_1_1' : 'FRONTIER_CODE_1_1',
        benchmarkId,
        sourceEffort: evidence.profile.effort,
      };
};

/**
 * Return the source-local score for one profile.
 *
 * Sources used by the advanced chart have an explicit source-native score:
 * AA uses its published EXCLUDED Intelligence Index rawScore, while DeepSWE
 * and Frontier Code use their named included benchmark. Other sources (such
 * as LiveBench in the default chart) have no single source benchmark and use
 * the mean of their included normalized rows.
 */
export const getSourcePerformance = (
  product: ProductVersion,
  sourceId: string,
  profileId: string,
): number | null => {
  if ((ADVANCED_COST_SOURCE_IDS as readonly string[]).includes(sourceId)) {
    return (
      getAdvancedSourceScore(
        product,
        sourceId as AdvancedCostSourceId,
        profileId,
      )?.score ?? null
    );
  }
  const scores = sourceEvidenceForProfile(product, sourceId, profileId).flatMap(
    ({ normalizedScore }) =>
      normalizedScore === null ? [] : [normalizedScore],
  );
  return scores.length > 0
    ? scores.reduce((total, score) => total + score, 0) / scores.length
    : null;
};

const compareCostRows = (left: CostPoint, right: CostPoint): number =>
  left.metricId.localeCompare(right.metricId) ||
  left.sourceUrl.localeCompare(right.sourceUrl) ||
  left.profileId.localeCompare(right.profileId);

const representativeProfileForModel = (
  product: ProductVersion,
  modelId: string,
): LeaderboardRow | undefined =>
  getRepresentativeRows(product).find((row) => row.modelId === modelId);

const normalizeCost = (
  cost: number,
  range: { min: number; max: number },
): number =>
  range.max === range.min
    ? 50
    : ((Math.log(cost) - range.min) / (range.max - range.min)) * 100;

interface SourceCostCandidate {
  modelId: string;
  sourceId: string;
  profileId: string;
  rows: CostPoint[];
  sourceScore: number | null;
  overallScore: number;
}

const chooseBestSourceCandidate = (
  product: ProductVersion,
  rows: CostPoint[],
): SourceCostCandidate | undefined => {
  const grouped = new Map<string, CostPoint[]>();
  rows.forEach((row) => {
    const key = `${row.modelId}\u0000${row.profileId}`;
    const profileRows = grouped.get(key) ?? [];
    profileRows.push(row);
    grouped.set(key, profileRows);
  });

  const candidates = [...grouped.values()].flatMap((profileRows) => {
    const first = profileRows[0];
    if (!first) return [];
    const performanceRows = profileRows.filter(
      ({ performance }) => performance !== null,
    );
    if (performanceRows.length === 0) return [];
    const overallScore = median(
      performanceRows.flatMap(({ performance }) =>
        performance === null ? [] : [performance],
      ),
    );
    return [
      {
        modelId: first.modelId,
        sourceId: first.sourceId,
        profileId: first.profileId,
        rows: performanceRows,
        sourceScore: getSourcePerformance(
          product,
          first.sourceId,
          first.profileId,
        ),
        overallScore,
      },
    ];
  });

  return candidates.toSorted(
    (left, right) =>
      right.overallScore - left.overallScore ||
      (right.sourceScore ?? Number.NEGATIVE_INFINITY) -
        (left.sourceScore ?? Number.NEGATIVE_INFINITY) ||
      left.profileId.localeCompare(right.profileId),
  )[0];
};

export const buildWeightedCostCurve = (
  product: ProductVersion,
  weights: Readonly<Record<string, number>> = COST_SOURCE_WEIGHTS,
): WeightedCostPoint[] => {
  const taskCosts = product.costs.filter(
    (point) =>
      isTaskCost(point) &&
      point.cost > 0 &&
      (weights[point.sourceId] ?? 0) > 0 &&
      point.performance !== null,
  );
  const sourceRanges = new Map<string, { min: number; max: number }>();
  Object.keys(weights).forEach((sourceId) => {
    const logs = taskCosts
      .filter((point) => point.sourceId === sourceId && point.cost > 0)
      .map(({ cost }) => Math.log(cost));
    if (logs.length > 0) {
      sourceRanges.set(sourceId, {
        min: Math.min(...logs),
        max: Math.max(...logs),
      });
    }
  });

  const byModelSource = new Map<string, CostPoint[]>();
  taskCosts.forEach((point) => {
    const key = `${point.modelId}\u0000${point.sourceId}`;
    const rows = byModelSource.get(key) ?? [];
    rows.push(point);
    byModelSource.set(key, rows);
  });

  const selectedByModel = new Map<string, SourceCostCandidate[]>();
  byModelSource.forEach((rows) => {
    const candidate = chooseBestSourceCandidate(product, rows);
    if (!candidate) return;
    const sourceCandidates = selectedByModel.get(candidate.modelId) ?? [];
    sourceCandidates.push(candidate);
    selectedByModel.set(candidate.modelId, sourceCandidates);
  });

  return [...selectedByModel.entries()]
    .flatMap(([modelId, sourceCandidates]) => {
      const representative = representativeProfileForModel(product, modelId);
      if (!representative || representative.overallScore === null) return [];

      const sourceCosts = sourceCandidates.flatMap((candidate) => {
        const range = sourceRanges.get(candidate.sourceId);
        const weight = weights[candidate.sourceId] ?? 0;
        const cost = median(candidate.rows.map((row) => row.cost));
        if (!range || weight <= 0 || cost <= 0) return [];
        const exemplar = candidate.rows.toSorted(compareCostRows)[0];
        if (!exemplar) return [];
        return [
          {
            sourceId: candidate.sourceId,
            cost,
            normalizedCost: normalizeCost(cost, range),
            weight,
            profileId: candidate.profileId,
            performance: candidate.overallScore,
            sourceScore: candidate.sourceScore,
            metricName: exemplar.metricName,
            sourceUrl: exemplar.sourceUrl,
          },
        ];
      });
      const sourceWeight = sourceCosts.reduce(
        (total, source) => total + source.weight,
        0,
      );
      if (sourceWeight === 0) return [];
      const selectedProfileIds = sourceCosts
        .map(({ profileId }) => profileId)
        .toSorted();
      const displayProfile = profileById(product, representative.profileId);
      if (!displayProfile) return [];
      return [
        {
          modelId,
          profileId: representative.profileId,
          selectedProfileIds,
          providerId: displayProfile.providerId,
          displayName: getProfileDisplayName(displayProfile),
          performance: representative.overallScore,
          normalizedCost:
            sourceCosts.reduce(
              (total, source) => total + source.normalizedCost * source.weight,
              0,
            ) / sourceWeight,
          sourceCount: sourceCosts.length,
          sourceWeight,
          sourceCosts,
        },
      ];
    })
    .filter(({ performance }) => performance > 0)
    .toSorted(
      (left, right) =>
        left.normalizedCost - right.normalizedCost ||
        right.performance - left.performance ||
        left.profileId.localeCompare(right.profileId),
    );
};

export const getCostParetoFrontier = (
  points: WeightedCostPoint[],
): WeightedCostPoint[] => {
  let bestPerformance = Number.NEGATIVE_INFINITY;
  return points
    .toSorted(
      (left, right) =>
        left.normalizedCost - right.normalizedCost ||
        right.performance - left.performance,
    )
    .filter((point) => {
      if (point.performance <= bestPerformance) return false;
      bestPerformance = point.performance;
      return true;
    });
};

const compareAdvancedPoints = (
  left: AdvancedCostPoint,
  right: AdvancedCostPoint,
): number => {
  const leftRank = COST_EFFORT_RANK.get(left.effort);
  const rightRank = COST_EFFORT_RANK.get(right.effort);
  if (
    leftRank !== undefined &&
    rightRank !== undefined &&
    leftRank !== rightRank
  ) {
    return leftRank - rightRank;
  }
  if (leftRank !== undefined && rightRank === undefined) return -1;
  if (leftRank === undefined && rightRank !== undefined) return 1;
  return (
    left.effort.localeCompare(right.effort) ||
    left.profileId.localeCompare(right.profileId)
  );
};

/**
 * Build one aggregate effort curve per model across Artificial Analysis,
 * DeepSWE, and Frontier Code (1/3 weight each). A profile is admitted only
 * when all three sources yield both a task cost and a source-local score.
 * Models with a single qualifying profile produce a one-point series.
 */
export const buildAdvancedCostSeries = (
  product: ProductVersion,
): AdvancedCostSeries[] => {
  const sourceRanges = new Map<
    AdvancedCostSourceId,
    { min: number; max: number }
  >();
  ADVANCED_COST_SOURCE_IDS.forEach((sourceId) => {
    const logs = product.costs
      .filter(
        (point) =>
          isTaskCost(point) && point.cost > 0 && point.sourceId === sourceId,
      )
      .map(({ cost }) => Math.log(cost));
    if (logs.length > 0) {
      sourceRanges.set(sourceId, {
        min: Math.min(...logs),
        max: Math.max(...logs),
      });
    }
  });

  const grouped = new Map<string, CostPoint[]>();
  product.costs
    .filter(
      (point) =>
        isTaskCost(point) &&
        point.cost > 0 &&
        (ADVANCED_COST_SOURCE_IDS as readonly string[]).includes(
          point.sourceId,
        ),
    )
    .forEach((point) => {
      const key = `${point.modelId}\u0000${point.profileId}\u0000${point.sourceId}`;
      const rows = grouped.get(key) ?? [];
      rows.push(point);
      grouped.set(key, rows);
    });

  const candidatePoints: AdvancedCostPoint[] = [];

  product.profiles.forEach((profile) => {
    const profileId = profile.id;
    const modelId = profile.modelId;

    const sourceDetails: AdvancedCostSourceDetail[] = [];
    let hasAllSources = true;

    for (const sourceId of ADVANCED_COST_SOURCE_IDS) {
      const key = `${modelId}\u0000${profileId}\u0000${sourceId}`;
      const rows = grouped.get(key);
      if (!rows || rows.length === 0) {
        hasAllSources = false;
        break;
      }
      const sourceScore = getAdvancedSourceScore(product, sourceId, profileId);
      if (sourceScore === null) {
        hasAllSources = false;
        break;
      }
      const range = sourceRanges.get(sourceId);
      if (!range) {
        hasAllSources = false;
        break;
      }
      const sourceCost = median(rows.map((row) => row.cost));
      if (sourceCost <= 0) {
        hasAllSources = false;
        break;
      }
      const exemplar = rows.toSorted(compareCostRows)[0];
      if (!exemplar) {
        hasAllSources = false;
        break;
      }
      const normalizedCost = normalizeCost(sourceCost, range);
      sourceDetails.push({
        sourceId,
        cost: sourceCost,
        normalizedCost,
        score: sourceScore.score,
        scoreBasis: sourceScore.basis,
        scoreBenchmarkId: sourceScore.benchmarkId,
        metricName: exemplar.metricName,
        sourceUrl: exemplar.sourceUrl,
        benchmarkId: exemplar.benchmarkId,
        evidenceIds: rows.flatMap(({ evidenceIds }) => evidenceIds).toSorted(),
      });
    }

    if (
      !hasAllSources ||
      sourceDetails.length !== ADVANCED_COST_SOURCE_IDS.length
    ) {
      return;
    }

    const effort = normalizeSourceEffort(profile.attributes.effort ?? null);
    const costIndex = sourceDetails.reduce(
      (sum, s) => sum + s.normalizedCost * (1 / 3),
      0,
    );
    const score = sourceDetails.reduce((sum, s) => sum + s.score, 0) / 3;

    candidatePoints.push({
      modelId,
      profileId,
      providerId: profile.providerId,
      displayName: getProfileDisplayName(profile),
      effort,
      isDefaultEffort: !COST_EFFORT_RANK.has(effort),
      costIndex,
      score,
      sources: sourceDetails,
    });
  });

  const byModel = new Map<string, AdvancedCostPoint[]>();
  candidatePoints.forEach((point) => {
    const list = byModel.get(point.modelId) ?? [];
    list.push(point);
    byModel.set(point.modelId, list);
  });

  const series: AdvancedCostSeries[] = [];
  byModel.forEach((points, modelId) => {
    const sortedPoints = points.toSorted(compareAdvancedPoints);
    const firstPoint = sortedPoints[0];
    if (!firstPoint) return;
    const modelProfile = profileById(product, firstPoint.profileId);
    if (!modelProfile) return;

    series.push({
      seriesId: modelId,
      modelId,
      providerId: modelProfile.providerId,
      displayName: modelProfile.baseModelName,
      points: sortedPoints,
    });
  });

  return series.toSorted(
    (left, right) =>
      left.displayName.localeCompare(right.displayName) ||
      left.modelId.localeCompare(right.modelId),
  );
};

export interface DataScopeSummary {
  frontierModels: number;
  rankedModels: number;
  scoredProfiles: number;
  awaitingDirectEvidence: number;
}

export const getDataScopeSummary = (
  product: ProductVersion,
): DataScopeSummary => {
  const frontierModelIds = new Set(
    product.frontier.map(({ modelId }) => modelId),
  );
  const scoredRows = product.leaderboard.filter(
    ({ overallScore }) => overallScore !== null,
  );
  const rankedModelIds = new Set(scoredRows.map(({ modelId }) => modelId));
  const scoredProfileIds = new Set(
    scoredRows.map(({ profileId }) => profileId),
  );

  return {
    frontierModels: frontierModelIds.size,
    rankedModels: rankedModelIds.size,
    scoredProfiles: scoredProfileIds.size,
    awaitingDirectEvidence: [...frontierModelIds].filter(
      (modelId) => !rankedModelIds.has(modelId),
    ).length,
  };
};
