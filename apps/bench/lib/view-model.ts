import type {
  CandidateResult,
  ModelProfile,
  ProductVersion,
} from '@llm-bench/benchmark-data';

export type LeaderboardRow = ProductVersion['leaderboard'][number];
type CostPoint = ProductVersion['costs'][number];

const compareRows = (left: LeaderboardRow, right: LeaderboardRow): number => {
  const leftRank = left.rank ?? Number.POSITIVE_INFINITY;
  const rightRank = right.rank ?? Number.POSITIVE_INFINITY;
  return (
    leftRank - rightRank ||
    (right.overallScore ?? -1) - (left.overallScore ?? -1) ||
    left.profileId.localeCompare(right.profileId)
  );
};

export const profileById = (
  product: ProductVersion,
  profileId: string,
): ModelProfile | undefined =>
  product.profiles.find((profile) => profile.id === profileId);

export const getRepresentativeRows = (
  product: ProductVersion,
): LeaderboardRow[] => {
  const rows = new Map<string, LeaderboardRow>();
  product.leaderboard.forEach((row) => {
    const current = rows.get(row.modelId);
    if (!current || compareRows(row, current) < 0) {
      rows.set(row.modelId, row);
    }
  });
  return [...rows.values()].sort(compareRows).map((row, index) => ({
    ...row,
    rank: row.overallScore === null ? null : index + 1,
  }));
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
          profile.attributes.harness,
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
): CandidateResult[] =>
  product.evidence
    .filter((result) => result.model.profileId === profileId)
    .sort((left, right) => {
      if (left.inclusion !== right.inclusion) {
        return left.inclusion === 'INCLUDED' ? -1 : 1;
      }
      return left.benchmarkId.localeCompare(right.benchmarkId);
    });

export const splitCostSeries = (
  product: ProductVersion,
): { api: CostPoint[]; task: CostPoint[] } => ({
  api: product.costs.filter((point) => point.costType === 'API_STANDARDIZED'),
  task: product.costs.filter((point) =>
    ['MEASURED_TASK', 'AGENT_TASK'].includes(point.costType),
  ),
});
