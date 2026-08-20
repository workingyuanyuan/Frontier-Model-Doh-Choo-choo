import type {
  ModelProfile,
  ProductEvidence,
  ProductVersion,
} from '@llm-bench/benchmark-data';

export type LeaderboardRow = ProductVersion['leaderboard'][number];
type CostPoint = ProductVersion['costs'][number];

export const COST_SOURCE_WEIGHTS = {
  'artificial-analysis': 0.4,
  livebench: 0.4,
  deepswe: 0.2,
} as const;

export interface WeightedCostPoint {
  modelId: string;
  profileId: string;
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
    metricName: string;
    sourceUrl: string;
  }>;
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

export const resolveActiveProfile = (
  product: ProductVersion,
  modelId: string,
  selectedProfileId: string,
  representativeProfileId: string,
): ModelProfile | undefined => {
  const profiles = getProfilesForModel(
    product,
    modelId,
    representativeProfileId,
  );
  return (
    profiles.find(({ id }) => id === selectedProfileId) ??
    profiles.find(({ id }) => id === representativeProfileId) ??
    profiles[0]
  );
};

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
 * Keep excluded models on a small, non-aggregated diagnostic route. The
 * representative row is used only to identify the profile and its missing
 * cells; no overall or dimension values are returned to the caller.
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

  const representatives = new Map(
    getRepresentativeRows(product).map(({ modelId, profileId }) => [
      modelId,
      profileId,
    ]),
  );
  product.frontier.forEach(({ modelId, profileId }) => {
    if (!representatives.has(modelId)) representatives.set(modelId, profileId);
  });

  return [...representatives.entries()]
    .filter(([modelId]) => !eligibleModelIds.has(modelId))
    .map(([modelId, profileId]) => {
      const profile = profileById(product, profileId);
      return {
        modelId,
        profileId,
        displayName: profile ? getProfileDisplayName(profile) : profileId,
        missingBenchmarkIds: getMissingDisplaySetBenchmarks(
          product,
          profileId,
          displaySet,
        ),
      };
    });
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

export const buildWeightedCostCurve = (
  product: ProductVersion,
  weights: Readonly<Record<string, number>> = COST_SOURCE_WEIGHTS,
): WeightedCostPoint[] => {
  const representativeRows = getRepresentativeRows(product);
  const representativeByProfileId = new Map(
    representativeRows.map((row) => [row.profileId, row]),
  );

  const taskCosts = product.costs.filter(
    ({ costType, sourceId, profileId, performance }) =>
      ['MEASURED_TASK', 'AGENT_TASK'].includes(costType) &&
      (weights[sourceId] ?? 0) > 0 &&
      representativeByProfileId.has(profileId) &&
      performance !== null,
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

  const grouped = new Map<string, Map<string, CostPoint[]>>();
  taskCosts.forEach((point) => {
    const bySource = grouped.get(point.profileId) ?? new Map();
    const rows = bySource.get(point.sourceId) ?? [];
    rows.push(point);
    bySource.set(point.sourceId, rows);
    grouped.set(point.profileId, bySource);
  });

  return [...grouped.entries()]
    .flatMap(([profileId, bySource]) => {
      const profile = profileById(product, profileId);
      const representativeRow = representativeByProfileId.get(profileId);
      if (
        !profile ||
        !representativeRow ||
        representativeRow.overallScore === null
      ) {
        return [];
      }
      const sourceCosts = [...bySource.entries()].flatMap(
        ([sourceId, rows]) => {
          const range = sourceRanges.get(sourceId);
          const weight = weights[sourceId] ?? 0;
          const cost = median(rows.map((row) => row.cost));
          if (!range || weight <= 0 || cost <= 0) return [];
          const normalizedCost =
            range.max === range.min
              ? 50
              : ((Math.log(cost) - range.min) / (range.max - range.min)) * 100;
          const exemplar = rows.toSorted((left, right) =>
            left.metricId.localeCompare(right.metricId),
          )[0]!;
          return [
            {
              sourceId,
              cost,
              normalizedCost,
              weight,
              metricName: exemplar.metricName,
              sourceUrl: exemplar.sourceUrl,
            },
          ];
        },
      );
      const sourceWeight = sourceCosts.reduce(
        (total, source) => total + source.weight,
        0,
      );
      if (sourceWeight === 0) return [];
      return [
        {
          modelId: profile.modelId,
          profileId,
          providerId: profile.providerId,
          displayName: getProfileDisplayName(profile),
          performance: representativeRow.overallScore,
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
