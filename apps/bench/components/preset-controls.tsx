'use client';

import type { ProductPreset } from '../lib/view-model';

/**
 * Picks which scored preset the page is showing.
 *
 * The slider's axis is the number of models, not the number of benchmarks: a
 * preset is "the largest benchmark set that still leaves this many models
 * complete", so model count is the quantity a reader actually chooses between.
 * Positions are the model counts the data reaches, which is not every integer.
 *
 * The switch reports whether the shown preset keeps every source represented.
 * It is only operable where two presets share a model count and differ; where a
 * model count has one preset it is disabled and reads as a state indicator,
 * which is what it currently is for every position.
 */
export function PresetControls({
  presets,
  activePreset,
  onSelectPreset,
}: {
  presets: readonly ProductPreset[];
  activePreset: ProductPreset;
  onSelectPreset: (presetId: string) => void;
}) {
  const modelCounts = [
    ...new Set(presets.map(({ targetModelCount }) => targetModelCount)),
  ].toSorted((left, right) => left - right);
  const activeIndex = modelCounts.indexOf(activePreset.targetModelCount);

  const atCount = (modelCount: number): ProductPreset[] =>
    presets.filter((preset) => preset.targetModelCount === modelCount);
  const alternative = atCount(activePreset.targetModelCount).find(
    (preset) => preset.requireAllSources !== activePreset.requireAllSources,
  );

  const selectIndex = (index: number): void => {
    const modelCount = modelCounts[index];
    if (modelCount === undefined) return;
    const candidates = atCount(modelCount);
    const sameMode = candidates.find(
      (preset) => preset.requireAllSources === activePreset.requireAllSources,
    );
    const next = sameMode ?? candidates[0];
    if (next) onSelectPreset(next.id);
  };

  return (
    <div className="preset-controls">
      <button
        type="button"
        role="switch"
        className="preset-sources-switch"
        aria-checked={activePreset.requireAllSources}
        disabled={alternative === undefined}
        title={
          alternative === undefined
            ? `Only one benchmark set reaches ${activePreset.targetModelCount} models, so there is nothing to switch to.`
            : 'Switch between requiring every source and letting the set drop sources.'
        }
        onClick={() => {
          if (alternative) onSelectPreset(alternative.id);
        }}
      >
        {activePreset.requireAllSources ? 'All sources' : 'Any sources'}
      </button>

      <label className="preset-slider" htmlFor="preset-model-count">
        <span className="preset-label">Models</span>
        <input
          id="preset-model-count"
          type="range"
          min={0}
          max={Math.max(modelCounts.length - 1, 0)}
          step={1}
          value={Math.max(activeIndex, 0)}
          onChange={(event) => selectIndex(Number(event.target.value))}
          aria-valuetext={`${activePreset.targetModelCount} models`}
          data-model-count={activePreset.targetModelCount}
        />
        <output
          className="preset-count"
          htmlFor="preset-model-count"
          data-testid="preset-model-count"
        >
          {activePreset.targetModelCount}
        </output>
      </label>
    </div>
  );
}
