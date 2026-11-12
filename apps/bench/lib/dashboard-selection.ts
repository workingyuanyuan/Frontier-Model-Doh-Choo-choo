import type { SetStateAction } from 'react';

/**
 * The dashboard shows either a preset's own models and efforts, or a custom
 * comparison the user built. Pins and effort choices exist only in a custom
 * comparison, so a preset can never carry leftovers from one.
 */
export type Comparison =
  | { mode: 'preset' }
  | {
      mode: 'custom';
      modelIds: string[];
      /** Chosen profile per model. */
      efforts: Record<string, string>;
      pins: string[];
    };

/**
 * The URL is read once after mount. A shared comparison then waits one render
 * for its preset, whose defaults it replaces; the URL is written only once
 * the state it describes has been applied.
 */
export type UrlHydration =
  | { phase: 'unread' }
  | { phase: 'restoring'; models: string[]; efforts: string[]; pins: string[] }
  | { phase: 'ready' };

export interface SelectionState {
  presetId: string;
  comparison: Comparison;
  hydration: UrlHydration;
}

/** Values derived from the active preset that a transition starts from. */
export interface SelectionContext {
  defaultModelIds: string[];
  representativeProfiles: Record<string, string>;
  /** Profile id to model id, in product order. */
  profileModelIds: ReadonlyMap<string, string>;
}

export type SelectionAction =
  | {
      type: 'hydrate';
      presetId: string | null;
      comparison: {
        models: string[];
        efforts: string[];
        pins: string[];
      } | null;
    }
  | {
      type: 'restoreComparison';
      optionIds: ReadonlySet<string>;
      context: SelectionContext;
    }
  | { type: 'selectPreset'; presetId: string }
  | {
      type: 'setModels';
      update: SetStateAction<string[]>;
      context: SelectionContext;
    }
  | {
      type: 'setEffort';
      modelId: string;
      profileId: string;
      context: SelectionContext;
    }
  | {
      type: 'pinProfile';
      modelId: string;
      profileId: string;
      context: SelectionContext;
    }
  | { type: 'unpinProfile'; profileId: string }
  | {
      type: 'applyShortlist';
      models: { modelId: string; profileIds: string[] }[];
      optionIds: ReadonlySet<string>;
      /** Benchmark count per profile, used to pick a replacement effort. */
      coverage: ReadonlyMap<string, number>;
      context: SelectionContext;
    };

export const initialSelection = (presetId: string): SelectionState => ({
  presetId,
  comparison: { mode: 'preset' },
  hydration: { phase: 'unread' },
});

/** A preset becomes a custom comparison of its own models and efforts. */
const customFrom = (
  comparison: Comparison,
  context: SelectionContext,
): Extract<Comparison, { mode: 'custom' }> =>
  comparison.mode === 'custom'
    ? comparison
    : {
        mode: 'custom',
        modelIds: context.defaultModelIds,
        efforts: context.representativeProfiles,
        pins: [],
      };

export const selectionReducer = (
  state: SelectionState,
  action: SelectionAction,
): SelectionState => {
  switch (action.type) {
    case 'hydrate':
      // A replayed effect must not re-read a URL that was already rewritten.
      if (state.hydration.phase !== 'unread') return state;
      return {
        presetId: action.presetId ?? state.presetId,
        comparison: { mode: 'preset' },
        hydration: action.comparison
          ? { phase: 'restoring', ...action.comparison }
          : { phase: 'ready' },
      };
    case 'restoreComparison': {
      if (state.hydration.phase !== 'restoring') return state;
      const { context, optionIds } = action;
      const modelIds = [...new Set(state.hydration.models)].filter((id) =>
        optionIds.has(id),
      );
      const efforts: Record<string, string> = {};
      state.hydration.efforts.forEach((id) => {
        const modelId = context.profileModelIds.get(id);
        if (modelId !== undefined && modelIds.includes(modelId))
          efforts[modelId] = id;
      });
      return {
        ...state,
        hydration: { phase: 'ready' },
        comparison: {
          mode: 'custom',
          modelIds,
          efforts: { ...context.representativeProfiles, ...efforts },
          pins: [...new Set(state.hydration.pins)].filter((id) => {
            const modelId = context.profileModelIds.get(id);
            return (
              modelId !== undefined &&
              modelIds.includes(modelId) &&
              efforts[modelId] !== id
            );
          }),
        },
      };
    }
    case 'selectPreset':
      return {
        ...state,
        presetId: action.presetId,
        comparison: { mode: 'preset' },
      };
    case 'setModels': {
      const current = customFrom(state.comparison, action.context);
      const modelIds =
        typeof action.update === 'function'
          ? action.update(current.modelIds)
          : action.update;
      return {
        ...state,
        comparison: {
          ...current,
          modelIds,
          pins: current.pins.filter((id) => {
            const modelId = action.context.profileModelIds.get(id);
            return modelId !== undefined && modelIds.includes(modelId);
          }),
        },
      };
    }
    case 'setEffort': {
      const current = customFrom(state.comparison, action.context);
      return {
        ...state,
        comparison: {
          ...current,
          efforts: {
            ...action.context.representativeProfiles,
            ...current.efforts,
            [action.modelId]: action.profileId,
          },
        },
      };
    }
    case 'pinProfile': {
      const current = customFrom(state.comparison, action.context);
      if (current.pins.includes(action.profileId)) return state;
      // The pinned effort keeps its row; the model moves to its next free one.
      const next = [...action.context.profileModelIds].find(
        ([id, modelId]) =>
          modelId === action.modelId &&
          id !== action.profileId &&
          !current.pins.includes(id),
      )?.[0];
      if (next === undefined) return state;
      return {
        ...state,
        comparison: {
          ...current,
          efforts: { ...current.efforts, [action.modelId]: next },
          pins: [...current.pins, action.profileId],
        },
      };
    }
    case 'unpinProfile':
      if (state.comparison.mode !== 'custom') return state;
      return {
        ...state,
        comparison: {
          ...state.comparison,
          pins: state.comparison.pins.filter((id) => id !== action.profileId),
        },
      };
    case 'applyShortlist': {
      const current = customFrom(state.comparison, action.context);
      const picked = action.models.filter(({ modelId }) =>
        action.optionIds.has(modelId),
      );
      const efforts = {
        ...action.context.representativeProfiles,
        ...current.efforts,
      };
      // Each chart model keeps its leaderboard effort while that effort is
      // still visible on the chart; otherwise its best-covered visible effort.
      picked.forEach(({ modelId, profileIds }) => {
        if (profileIds.includes(efforts[modelId] ?? '')) return;
        const best = profileIds.reduce<string | null>(
          (top, id) =>
            (action.coverage.get(id) ?? 0) >
            (action.coverage.get(top ?? '') ?? 0)
              ? id
              : top,
          null,
        );
        if (best) efforts[modelId] = best;
      });
      // Pins survive only while visible and distinct from the model's effort.
      const visible = new Set(picked.flatMap(({ profileIds }) => profileIds));
      const chosen = new Set(Object.values(efforts));
      return {
        ...state,
        comparison: {
          mode: 'custom',
          modelIds: picked.map(({ modelId }) => modelId),
          efforts,
          pins: current.pins.filter((id) => visible.has(id) && !chosen.has(id)),
        },
      };
    }
  }
};
