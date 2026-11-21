import type {
  DimensionId,
  PresetFamily,
  ProductVersion,
} from '@llm-bench/benchmark-data';

import { WEIGHTED_SOURCE_COUNT } from './cost-labels';
import {
  PRESET_FAMILY_INFO,
  presetScope,
  presetScopeSentence,
  type PresetWindowModel,
} from './preset-family';
import { toDashboardProduct } from './dashboard-data';
import { profileEvidencePath } from './site-paths';
import { getActiveDimensionIds } from './ui-contract';
import {
  buildWeightedCostCurve,
  economyScore,
  getCostParetoFrontier,
  getProfileIdentity,
  getRepresentativeRows,
  mainScreenProduct,
  profileById,
  withActivePreset,
  type CostSourceScoreBasisId,
} from './view-model';

/**
 * What the main screen shows for one preset, as plain data.
 *
 * The published Markdown, JSON and static HTML page are three renderings of
 * this one object, and it is built from the same view-model functions the
 * interactive dashboard calls, so the formats cannot drift apart. Numbers are
 * unrounded here; each renderer decides its own precision. Paths are relative
 * to the site root.
 */
export interface PresetProjection {
  versionId: string;
  generatedAt: string;
  preset: {
    id: string;
    isDefault: boolean;
    /** How the models were chosen; scores never compare across presets. */
    family: PresetFamily;
    familyName: string;
    selectionRule: string;
    /** One sentence naming the family, size and any omitted window models. */
    scopeNote: string;
    modelCount: number;
    benchmarkCount: number;
    /** Frontier-window models this preset does not score, in window order. */
    omittedFrontierModels: PresetWindowModel[];
    /** The other family's preset with the same model count, if any. */
    counterpartPresetId: string | null;
    sameModelsAsCounterpart: boolean;
  };
  /** Dimensions with a score in this preset, in display order. */
  dimensionIds: DimensionId[];
  /** One row per base model at its representative effort, in rank order. */
  leaderboard: PresetLeaderboardRow[];
  /** Models with a comparable task cost, cheapest cost index first. */
  costs: PresetCostRow[];
  weightedCostSourceCount: number;
  benchmarks: Array<{ id: string; dimension: DimensionId }>;
}

export interface PresetLeaderboardRow {
  rank: number | null;
  modelId: string;
  modelName: string;
  /** 1-based position in the AA-ordered frontier window. */
  frontierWindowRank: number | null;
  providerId: string;
  profileId: string;
  reasoningEffort: string;
  overallScore: number | null;
  dimensionScores: Partial<Record<DimensionId, number | null>>;
  /** Null when the model has no point on the cost chart. */
  costIndex: number | null;
  /** 100 minus `costIndex`: higher is cheaper. Null with it. */
  economyScore: number | null;
  evidencePath: string;
}

export interface PresetCostRow {
  modelId: string;
  profileId: string;
  displayName: string;
  providerId: string;
  costIndex: number;
  overallScore: number;
  sourceCount: number;
  onValueFrontier: boolean;
  sources: PresetCostSource[];
}

export interface PresetCostSource {
  sourceId: string;
  /** The vendor that published the pair when it is not the benchmark's own site. */
  reportedBySourceId: string | null;
  usdPerTask: number;
  /** This source's cost on its own 0–100 log scale. */
  normalizedCost: number;
  /** The profile the cost was measured on; it can differ from the row's. */
  profileId: string;
  /** The score this source published alongside the cost, on its own basis. */
  pairedScore: {
    basis: Exclude<CostSourceScoreBasisId, 'NONE'>;
    benchmarkId: string | null;
    benchmarkVersion: string | null;
    score: number;
  } | null;
  metricName: string;
  sourceUrl: string;
}

const economyOf = (costIndex: number | undefined): number | null =>
  costIndex === undefined ? null : economyScore(costIndex);

export const projectPreset = (
  product: ProductVersion,
  presetId: string,
  benchmarkDimensions: Record<string, DimensionId>,
): PresetProjection | null => {
  const scope = presetScope(product, presetId);
  if (!scope) return null;
  const windowRankOf = (modelId: string): number | null => {
    const index = product.frontier.findIndex((row) => row.modelId === modelId);
    return index === -1 ? null : index + 1;
  };
  const main = mainScreenProduct(
    withActivePreset(toDashboardProduct(product), presetId),
  );
  const rows = getRepresentativeRows(main);
  const dimensionIds = getActiveDimensionIds(rows);
  const points = buildWeightedCostCurve(main);
  const frontier = new Set(
    getCostParetoFrontier(points).map(({ profileId }) => profileId),
  );
  const costIndexByModel = new Map(
    points.map((point) => [point.modelId, point.normalizedCost]),
  );

  return {
    versionId: product.versionId,
    generatedAt: product.generatedAt,
    preset: {
      id: presetId,
      isDefault: presetId === product.defaultPresetId,
      family: scope.family,
      familyName: PRESET_FAMILY_INFO[scope.family].name,
      selectionRule: PRESET_FAMILY_INFO[scope.family].rule,
      scopeNote: presetScopeSentence(scope, rows.length),
      modelCount: rows.length,
      benchmarkCount: main.activePreset.benchmarkIds.length,
      omittedFrontierModels: scope.omitted,
      counterpartPresetId: scope.counterpartId,
      sameModelsAsCounterpart: scope.sameModelsAsCounterpart,
    },
    dimensionIds,
    leaderboard: rows.map((row) => {
      const profile = profileById(main, row.profileId);
      return {
        rank: row.rank,
        modelId: row.modelId,
        modelName: profile?.baseModelName ?? row.modelId,
        frontierWindowRank: windowRankOf(row.modelId),
        providerId: profile?.providerId ?? 'unknown',
        profileId: row.profileId,
        reasoningEffort: profile ? getProfileIdentity(profile) : 'unknown',
        overallScore: row.overallScore,
        dimensionScores: Object.fromEntries(
          dimensionIds.map((dimension) => [
            dimension,
            row.dimensions.find((entry) => entry.dimension === dimension)
              ?.score ?? null,
          ]),
        ),
        costIndex: costIndexByModel.get(row.modelId) ?? null,
        economyScore: economyOf(costIndexByModel.get(row.modelId)),
        evidencePath: profileEvidencePath(product.versionId, row.profileId),
      };
    }),
    costs: points.map((point) => ({
      modelId: point.modelId,
      profileId: point.profileId,
      displayName: point.displayName,
      providerId: point.providerId,
      costIndex: point.normalizedCost,
      overallScore: point.performance,
      sourceCount: point.sourceCount,
      onValueFrontier: frontier.has(point.profileId),
      sources: point.sourceCosts.map((source) => ({
        sourceId: source.sourceId,
        reportedBySourceId: source.reportedSourceId ?? null,
        usdPerTask: source.cost,
        normalizedCost: source.normalizedCost,
        profileId: source.profileId,
        pairedScore:
          source.scoreBasis === 'NONE' || source.sourceScore === null
            ? null
            : {
                basis: source.scoreBasis,
                benchmarkId: source.scoreBenchmarkId,
                benchmarkVersion: source.scoreBenchmarkVersion ?? null,
                score: source.sourceScore,
              },
        metricName: source.metricName,
        sourceUrl: source.sourceUrl,
      })),
    })),
    weightedCostSourceCount: WEIGHTED_SOURCE_COUNT,
    benchmarks: main.activePreset.benchmarkIds.toSorted().map((id) => ({
      id,
      dimension: benchmarkDimensions[id]!,
    })),
  };
};
