import { createHash } from 'node:crypto';

import {
  DIMENSION_IDS,
  type DimensionId,
  type DimensionScore,
  type QualityFlag,
  type RankingEntry,
} from '@llm-bench/contracts';
import {
  aggregateDimension,
  calculateOverallScore,
  normalizeScore,
  type MetricDirection,
} from '@llm-bench/scoring';

export interface LiveBenchScoreMapping {
  readonly metricId: string;
  readonly dimension: DimensionId;
  readonly weight: number;
  readonly lowerAnchor: number;
  readonly upperAnchor: number;
  readonly direction: MetricDirection;
}

export interface LiveBenchScoreResult {
  readonly resultId: string;
  readonly metricId: string;
  readonly value: number;
  readonly evidenceQuality: number;
  readonly isIndependent: boolean;
  readonly sourceSnapshotId: string;
}

export interface LiveBenchScoreModel {
  readonly modelVariantId: string;
  readonly slug: string;
  readonly displayName: string;
  readonly providerName: string;
  readonly results: readonly LiveBenchScoreResult[];
}

export interface LiveBenchScoreInput {
  readonly scoringMethodVersion: string;
  readonly mappings: readonly LiveBenchScoreMapping[];
  readonly models: readonly LiveBenchScoreModel[];
}

export interface ComputedDimensionScore extends DimensionScore {
  readonly componentResultIds: readonly string[];
}

export interface ComputedModelScore {
  readonly modelVariantId: string;
  readonly dimensions: readonly ComputedDimensionScore[];
  readonly overallScore: number | null;
  readonly overallCoverage: number;
  readonly overallConfidence: number;
  readonly independentEvidenceShare: number;
  readonly rankingStatus: RankingEntry['rankingStatus'];
  readonly qualityFlags: readonly QualityFlag[];
}

export interface LiveBenchScorePlan {
  readonly scoringMethodVersion: string;
  readonly sourceSnapshotIds: readonly string[];
  readonly models: readonly ComputedModelScore[];
  readonly entries: readonly RankingEntry[];
}

export interface LiveBenchScoringArguments {
  readonly dryRun: boolean;
  readonly editionDate: string | undefined;
}

export interface ScoreSnapshotMetadata {
  readonly editionDate: string;
  readonly dataCutoffAt: string;
}

export function reconcileScoreSnapshot(
  existingContentHash: string | undefined,
  nextContentHash: string,
): 'CREATE' | 'REUSE' {
  if (existingContentHash === undefined) return 'CREATE';
  if (existingContentHash === nextContentHash) return 'REUSE';
  throw new Error('Immutable ranking snapshot conflict');
}

function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return (
    !Number.isNaN(parsed.valueOf()) && parsed.toISOString().startsWith(value)
  );
}

export function parseLiveBenchScoringArguments(
  arguments_: readonly string[],
): LiveBenchScoringArguments {
  let applyCount = 0;
  let editionDate: string | undefined;
  for (let index = 0; index < arguments_.length; index += 1) {
    const argument = arguments_[index];
    if (argument === '--') continue;
    if (argument === '--apply') {
      applyCount += 1;
      continue;
    }
    if (argument === '--edition') {
      if (editionDate !== undefined) {
        throw new Error('Scoring edition may only be provided once');
      }
      const value = arguments_[index + 1];
      if (!value || !isIsoDate(value)) {
        throw new Error('Scoring edition must use YYYY-MM-DD');
      }
      editionDate = value;
      index += 1;
      continue;
    }
    throw new Error(`Unknown scoring argument: ${argument}`);
  }
  if (applyCount > 1) {
    throw new Error('Scoring --apply argument may only appear once');
  }
  return { dryRun: applyCount === 0, editionDate };
}

function insufficientDimension(dimension: DimensionId): ComputedDimensionScore {
  return {
    dimension,
    score: null,
    coverage: 0,
    confidence: 0,
    status: 'INSUFFICIENT_DATA',
    componentResultIds: [],
  };
}

function compareModel(
  left: Pick<LiveBenchScoreModel, 'slug' | 'modelVariantId'>,
  right: Pick<LiveBenchScoreModel, 'slug' | 'modelVariantId'>,
): number {
  const leftKey = `${left.slug}\0${left.modelVariantId}`;
  const rightKey = `${right.slug}\0${right.modelVariantId}`;
  return leftKey < rightKey ? -1 : leftKey > rightKey ? 1 : 0;
}

function rankEntries(entries: readonly RankingEntry[]): RankingEntry[] {
  const output = entries.map((entry) => ({ ...entry }));
  for (const status of ['VERIFIED', 'PROVISIONAL'] as const) {
    const cohort = output
      .filter(
        (entry): entry is RankingEntry & { overallScore: number } =>
          entry.rankingStatus === status && entry.overallScore !== null,
      )
      .sort(
        (left, right) =>
          right.overallScore - left.overallScore || compareModel(left, right),
      );
    cohort.forEach((entry, index) => {
      entry.rank = index + 1;
    });
  }
  return output.sort((left, right) => compareModel(left, right));
}

export function computeLiveBenchScores(
  input: LiveBenchScoreInput,
): LiveBenchScorePlan {
  if (!input.scoringMethodVersion) {
    throw new Error('Scoring method version is required');
  }
  const mappingByMetricId = new Map<string, LiveBenchScoreMapping>();
  const totalEligibleWeight = new Map<DimensionId, number>();
  for (const mapping of input.mappings) {
    if (mappingByMetricId.has(mapping.metricId)) {
      throw new Error(`Duplicate score mapping: ${mapping.metricId}`);
    }
    if (!Number.isFinite(mapping.weight) || mapping.weight <= 0) {
      throw new Error('Score mapping weight must be greater than zero');
    }
    mappingByMetricId.set(mapping.metricId, mapping);
    totalEligibleWeight.set(
      mapping.dimension,
      (totalEligibleWeight.get(mapping.dimension) ?? 0) + mapping.weight,
    );
  }

  const sourceSnapshotIds = new Set<string>();
  const entries: RankingEntry[] = [];
  const models: ComputedModelScore[] = [];

  for (const model of [...input.models].sort(compareModel)) {
    const resultByMetricId = new Map<string, LiveBenchScoreResult>();
    for (const result of model.results) {
      if (resultByMetricId.has(result.metricId)) {
        throw new Error(
          `Duplicate published result: ${model.modelVariantId}/${result.metricId}`,
        );
      }
      if (!mappingByMetricId.has(result.metricId)) {
        throw new Error(
          `Published result has no score mapping: ${result.metricId}`,
        );
      }
      resultByMetricId.set(result.metricId, result);
      sourceSnapshotIds.add(result.sourceSnapshotId);
    }

    const dimensions = DIMENSION_IDS.map((dimension) => {
      const eligibleWeight = totalEligibleWeight.get(dimension) ?? 0;
      if (eligibleWeight === 0) return insufficientDimension(dimension);

      const components = input.mappings
        .filter((mapping) => mapping.dimension === dimension)
        .map((mapping) => ({
          mapping,
          result: resultByMetricId.get(mapping.metricId),
        }))
        .filter(
          (
            component,
          ): component is {
            mapping: LiveBenchScoreMapping;
            result: LiveBenchScoreResult;
          } => component.result !== undefined,
        );
      const score = aggregateDimension({
        dimension,
        totalEligibleWeight: eligibleWeight,
        contributions: components.map(({ mapping, result }) => ({
          normalizedScore: normalizeScore({
            rawValue: result.value,
            lowerAnchor: mapping.lowerAnchor,
            upperAnchor: mapping.upperAnchor,
            direction: mapping.direction,
          }).normalizedScore,
          configuredWeight: mapping.weight,
          evidenceQuality: result.evidenceQuality,
          isIndependent: result.isIndependent,
        })),
      });
      return {
        ...score,
        componentResultIds: components
          .map(({ result }) => result.resultId)
          .sort(),
      };
    });

    const availableResults = [...resultByMetricId.values()];
    const availableEvidenceWeight = availableResults.reduce(
      (sum, result) => sum + mappingByMetricId.get(result.metricId)!.weight,
      0,
    );
    const independentEvidenceWeight = availableResults.reduce(
      (sum, result) =>
        sum +
        (result.isIndependent
          ? mappingByMetricId.get(result.metricId)!.weight
          : 0),
      0,
    );
    const independentEvidenceShare =
      availableEvidenceWeight === 0
        ? 0
        : independentEvidenceWeight / availableEvidenceWeight;
    const overall = calculateOverallScore({
      dimensions,
      independentSourceShare: independentEvidenceShare,
    });
    const qualityFlags: QualityFlag[] =
      overall.rankingStatus === 'UNRANKED'
        ? ['LOW_COVERAGE']
        : overall.rankingStatus === 'PROVISIONAL'
          ? ['PROVISIONAL']
          : [];

    models.push({
      modelVariantId: model.modelVariantId,
      dimensions,
      overallScore: overall.overallScore,
      overallCoverage: overall.overallCoverage,
      overallConfidence: overall.overallConfidence,
      independentEvidenceShare,
      rankingStatus: overall.rankingStatus,
      qualityFlags,
    });
    entries.push({
      modelVariantId: model.modelVariantId,
      slug: model.slug,
      displayName: model.displayName,
      providerName: model.providerName,
      rank: null,
      overallScore: overall.overallScore,
      overallCoverage: overall.overallCoverage,
      overallConfidence: overall.overallConfidence,
      rankingStatus: overall.rankingStatus,
      dimensions: dimensions.map(
        ({ componentResultIds: _, ...score }) => score,
      ),
      qualityFlags,
    });
  }

  return {
    scoringMethodVersion: input.scoringMethodVersion,
    sourceSnapshotIds: [...sourceSnapshotIds].sort(),
    models,
    entries: rankEntries(entries),
  };
}

export function createScoreSnapshotContentHash(
  plan: LiveBenchScorePlan,
  metadata: ScoreSnapshotMetadata,
): string {
  return createHash('sha256')
    .update(
      JSON.stringify({
        schemaVersion: 1,
        editionDate: metadata.editionDate,
        dataCutoffAt: metadata.dataCutoffAt,
        scoringMethodVersion: plan.scoringMethodVersion,
        sourceSnapshotIds: plan.sourceSnapshotIds,
        entries: plan.entries,
      }),
    )
    .digest('hex');
}
