import type {
  DimensionId,
  DimensionScore,
  RankingStatus,
} from '@llm-bench/contracts';

export type MetricDirection = 'HIGHER_IS_BETTER' | 'LOWER_IS_BETTER';

export interface NormalizeScoreInput {
  rawValue: number;
  lowerAnchor: number;
  upperAnchor: number;
  direction: MetricDirection;
}

export interface NormalizedScore {
  normalizedScore: number;
  wasClipped: boolean;
}

export function normalizeScore(input: NormalizeScoreInput): NormalizedScore {
  const { rawValue, lowerAnchor, upperAnchor, direction } = input;

  if (![rawValue, lowerAnchor, upperAnchor].every(Number.isFinite)) {
    throw new Error('score and anchors must be finite numbers');
  }

  if (upperAnchor <= lowerAnchor) {
    throw new Error('upperAnchor must be greater than lowerAnchor');
  }

  const ratio =
    direction === 'HIGHER_IS_BETTER'
      ? (rawValue - lowerAnchor) / (upperAnchor - lowerAnchor)
      : (upperAnchor - rawValue) / (upperAnchor - lowerAnchor);
  const unclippedScore = ratio * 100;
  const normalizedScore = Math.min(100, Math.max(0, unclippedScore));

  return {
    normalizedScore,
    wasClipped: normalizedScore !== unclippedScore,
  };
}

export interface DimensionContribution {
  normalizedScore: number;
  configuredWeight: number;
  evidenceQuality: number;
  isIndependent: boolean;
}

export interface AggregateDimensionInput {
  dimension: DimensionId;
  totalEligibleWeight: number;
  contributions: DimensionContribution[];
}

export function aggregateDimension({
  dimension,
  totalEligibleWeight,
  contributions,
}: AggregateDimensionInput): DimensionScore {
  if (!Number.isFinite(totalEligibleWeight) || totalEligibleWeight <= 0) {
    throw new Error('totalEligibleWeight must be greater than zero');
  }

  if (contributions.length === 0) {
    return {
      dimension,
      score: null,
      coverage: 0,
      confidence: 0,
      status: 'INSUFFICIENT_DATA',
    };
  }

  contributions.forEach((contribution) => {
    if (
      !Number.isFinite(contribution.normalizedScore) ||
      contribution.normalizedScore < 0 ||
      contribution.normalizedScore > 100
    ) {
      throw new Error('normalizedScore must be between zero and 100');
    }

    if (
      !Number.isFinite(contribution.configuredWeight) ||
      contribution.configuredWeight <= 0
    ) {
      throw new Error('configuredWeight must be greater than zero');
    }

    if (
      !Number.isFinite(contribution.evidenceQuality) ||
      contribution.evidenceQuality < 0 ||
      contribution.evidenceQuality > 1
    ) {
      throw new Error('evidenceQuality must be between zero and one');
    }
  });

  const availableWeight = contributions.reduce(
    (sum, contribution) => sum + contribution.configuredWeight,
    0,
  );

  if (availableWeight > totalEligibleWeight) {
    throw new Error('available weight cannot exceed total eligible weight');
  }

  const score =
    contributions.reduce(
      (sum, contribution) =>
        sum + contribution.normalizedScore * contribution.configuredWeight,
      0,
    ) / availableWeight;
  const coverage = availableWeight / totalEligibleWeight;
  const evidenceQuality =
    contributions.reduce(
      (sum, contribution) =>
        sum + contribution.evidenceQuality * contribution.configuredWeight,
      0,
    ) / availableWeight;
  const confidence = coverage * evidenceQuality * 100;
  const hasIndependentEvidence = contributions.some(
    (contribution) => contribution.isIndependent,
  );

  return {
    dimension,
    score,
    coverage,
    confidence,
    status:
      coverage >= 0.5 && hasIndependentEvidence ? 'FORMAL' : 'PROVISIONAL',
  };
}

export interface CalculateOverallScoreInput {
  dimensions: DimensionScore[];
  independentSourceShare: number;
}

export interface OverallScoreResult {
  overallScore: number | null;
  overallCoverage: number;
  overallConfidence: number;
  rankingStatus: RankingStatus;
}

export function calculateOverallScore({
  dimensions,
  independentSourceShare,
}: CalculateOverallScoreInput): OverallScoreResult {
  if (dimensions.length !== 8) {
    throw new Error('exactly eight dimension scores are required');
  }

  if (
    !Number.isFinite(independentSourceShare) ||
    independentSourceShare < 0 ||
    independentSourceShare > 1
  ) {
    throw new Error('independentSourceShare must be between zero and one');
  }

  const overallCoverage =
    dimensions.reduce((sum, dimension) => sum + dimension.coverage, 0) /
    dimensions.length;
  const overallConfidence =
    dimensions.reduce((sum, dimension) => sum + dimension.confidence, 0) /
    dimensions.length;
  const formalScores = dimensions.filter(
    (dimension): dimension is DimensionScore & { score: number } =>
      dimension.status === 'FORMAL' && dimension.score !== null,
  );
  const verified =
    formalScores.length === 8 &&
    overallCoverage >= 0.65 &&
    independentSourceShare >= 0.5;
  const provisional = formalScores.length >= 6 && overallCoverage >= 0.5;
  const rankingStatus: RankingStatus = verified
    ? 'VERIFIED'
    : provisional
      ? 'PROVISIONAL'
      : 'UNRANKED';
  const overallScore =
    rankingStatus === 'UNRANKED'
      ? null
      : formalScores.reduce((sum, dimension) => sum + dimension.score, 0) /
        formalScores.length;

  return {
    overallScore,
    overallCoverage,
    overallConfidence,
    rankingStatus,
  };
}

export interface FormalPublicationEligibilityInput {
  scoringMethodVersion: string;
  scoringMethodStatus: string;
  formalPublicationEnabled: boolean;
  entries: readonly {
    rankingStatus: RankingStatus;
    rank: number | null;
    overallScore: number | null;
  }[];
}

export function assertFormalPublicationEligible({
  scoringMethodVersion,
  scoringMethodStatus,
  formalPublicationEnabled,
  entries,
}: FormalPublicationEligibilityInput): void {
  if (scoringMethodVersion.startsWith('preview-')) {
    throw new Error('Preview scoring methods cannot be formally published');
  }
  if (scoringMethodStatus !== 'PUBLISHED' || !formalPublicationEnabled) {
    throw new Error(
      'Formal publication is not enabled for this scoring method',
    );
  }
  if (
    entries.length === 0 ||
    entries.some(
      ({ rankingStatus, rank, overallScore }) =>
        rankingStatus !== 'VERIFIED' || rank === null || overallScore === null,
    )
  ) {
    throw new Error('Formal publication requires verified ranked entries');
  }
}
