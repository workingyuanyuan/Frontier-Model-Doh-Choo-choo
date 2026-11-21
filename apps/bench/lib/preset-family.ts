import type { PresetFamily, ProductVersion } from '@llm-bench/benchmark-data';

/** How each preset family chooses its models, for controls and agent pages. */
export const PRESET_FAMILY_INFO: Record<
  PresetFamily,
  { label: string; name: string; rule: string }
> = {
  'aa-frontier': {
    label: 'Frontier',
    name: 'AA frontier',
    rule: 'the top N models of the frontier window by Artificial Analysis Intelligence Index',
  },
  coverage: {
    label: 'Coverage',
    name: 'Max coverage',
    rule: 'the N frontier-window models whose representative profiles share the most scoring-eligible benchmarks after the quality rules (ties: more scored dimensions, then higher AA ranks)',
  },
};

export interface PresetWindowModel {
  modelId: string;
  modelName: string;
  /** 1-based position in the frontier window, which follows AA rank. */
  windowRank: number;
}

export interface PresetScope {
  family: PresetFamily;
  windowSize: number;
  /** Window models this preset leaves out, in window order. */
  omitted: PresetWindowModel[];
  /** The other family's preset with the same model count, if any. */
  counterpartId: string | null;
  /** Whether that counterpart scores exactly the same models. */
  sameModelsAsCounterpart: boolean;
}

type ScopeProduct = Pick<ProductVersion, 'frontier' | 'presets' | 'profiles'>;
type PresetLike = Pick<
  ProductVersion['presets'][number],
  'id' | 'family' | 'targetModelCount'
>;

/**
 * The preset a family switch lands on: the same model count when the other
 * family has it, otherwise the nearest count, preferring the larger one.
 */
export const presetForFamily = <T extends PresetLike>(
  presets: readonly T[],
  active: PresetLike,
  family: PresetFamily,
): T | undefined =>
  presets
    .filter((preset) => preset.family === family)
    .toSorted(
      (left, right) =>
        Math.abs(left.targetModelCount - active.targetModelCount) -
          Math.abs(right.targetModelCount - active.targetModelCount) ||
        right.targetModelCount - left.targetModelCount,
    )[0];

const modelIdsOf = (preset: ProductVersion['presets'][number]): Set<string> =>
  new Set(preset.leaderboard.map(({ modelId }) => modelId));

/**
 * Which frontier-window models a preset scores and leaves out, and how it
 * relates to the other family at the same size. Coverage presets can omit
 * top-ranked models, so every surface states the omissions instead of letting
 * a reader assume the preset is the top N.
 */
export const presetScope = (
  product: ScopeProduct,
  presetId: string,
): PresetScope | null => {
  const preset = product.presets.find(({ id }) => id === presetId);
  if (!preset) return null;
  const members = modelIdsOf(preset);
  const nameOf = (modelId: string) =>
    product.profiles.find((profile) => profile.modelId === modelId)
      ?.baseModelName ?? modelId;
  const omitted = product.frontier.flatMap(({ modelId }, index) =>
    members.has(modelId)
      ? []
      : [{ modelId, modelName: nameOf(modelId), windowRank: index + 1 }],
  );
  const counterpart = product.presets.find(
    (other) =>
      other.family !== preset.family &&
      other.targetModelCount === preset.targetModelCount,
  );
  const counterpartMembers = counterpart ? modelIdsOf(counterpart) : null;
  return {
    family: preset.family,
    windowSize: product.frontier.length,
    omitted,
    counterpartId: counterpart?.id ?? null,
    sameModelsAsCounterpart:
      counterpartMembers !== null &&
      counterpartMembers.size === members.size &&
      [...members].every((modelId) => counterpartMembers.has(modelId)),
  };
};

/** One sentence describing a preset's scope, shared by the UI and agent pages. */
export const presetScopeSentence = (
  scope: PresetScope,
  modelCount: number,
): string => {
  const base =
    scope.family === 'coverage'
      ? `Max coverage: ${modelCount} of the ${scope.windowSize} frontier-window models, chosen to share the most benchmarks.`
      : `AA frontier: the top ${modelCount} of the ${scope.windowSize} frontier-window models by AA Intelligence Index.`;
  const omitted =
    scope.family === 'coverage' && scope.omitted.length
      ? ` Not included: ${scope.omitted
          .map(({ modelName, windowRank }) => `${modelName} (#${windowRank})`)
          .join(', ')}.`
      : '';
  const same =
    scope.family === 'coverage' && scope.sameModelsAsCounterpart
      ? ' Same models as the AA frontier set of this size.'
      : '';
  return `${base}${omitted}${same}`;
};
