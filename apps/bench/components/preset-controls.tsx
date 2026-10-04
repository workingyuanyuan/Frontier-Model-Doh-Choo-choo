'use client';

import type { ProductPreset } from '../lib/view-model';

/** Select a scored cohort by its model count. */
export function PresetControls({
  presets,
  activePreset,
  onSelectPreset,
}: {
  presets: readonly ProductPreset[];
  activePreset: ProductPreset;
  onSelectPreset: (presetId: string) => void;
}) {
  if (presets.length < 2) return null;
  const modelCounts = [
    ...new Set(presets.map(({ targetModelCount }) => targetModelCount)),
  ].toSorted((left, right) => left - right);

  const atCount = (modelCount: number): ProductPreset[] =>
    presets.filter((preset) => preset.targetModelCount === modelCount);
  const alternative = atCount(activePreset.targetModelCount).find(
    (preset) => preset.requireAllSources !== activePreset.requireAllSources,
  );

  const selectCount = (modelCount: number): void => {
    if (!modelCounts.includes(modelCount)) return;
    const candidates = atCount(modelCount);
    const sameMode = candidates.find(
      (preset) => preset.requireAllSources === activePreset.requireAllSources,
    );
    const next = sameMode ?? candidates[0];
    if (next) onSelectPreset(next.id);
  };

  return (
    <div className="preset-controls">
      {alternative && (
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
      )}

      <label className="preset-slider" htmlFor="preset-model-count">
        <span className="preset-label">Models</span>
        <input
          id="preset-model-count"
          type="range"
          min={modelCounts[0]}
          max={modelCounts[modelCounts.length - 1]}
          step={1}
          value={activePreset.targetModelCount}
          onChange={(event) => selectCount(Number(event.target.value))}
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
