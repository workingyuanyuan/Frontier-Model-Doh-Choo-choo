'use client';

import type { PresetFamily } from '@llm-bench/benchmark-data';

import { PRESET_FAMILY_INFO, presetForFamily } from '../lib/preset-family';
import type { ProductPreset } from '../lib/view-model';

/**
 * Select a scored cohort: the family picks how models are chosen, the slider
 * picks how many. Switching family keeps the model count when the other
 * family has it, otherwise the nearest count it does have.
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
  if (presets.length < 2) return null;
  const families = (Object.keys(PRESET_FAMILY_INFO) as PresetFamily[]).filter(
    (family) => presets.some((preset) => preset.family === family),
  );
  const inFamily = (family: PresetFamily) =>
    presets.filter((preset) => preset.family === family);
  const familyPresets = inFamily(activePreset.family);
  const modelCounts = [
    ...new Set(familyPresets.map(({ targetModelCount }) => targetModelCount)),
  ].toSorted((left, right) => left - right);

  const selectCount = (modelCount: number): void => {
    const next = familyPresets.find(
      (preset) => preset.targetModelCount === modelCount,
    );
    if (next) onSelectPreset(next.id);
  };

  const selectFamily = (family: PresetFamily): void => {
    if (family === activePreset.family) return;
    const next = presetForFamily(presets, activePreset, family);
    if (next) onSelectPreset(next.id);
  };

  return (
    <div className="preset-controls">
      {families.length > 1 && (
        <div
          className="preset-family-switch"
          role="group"
          aria-label="How models are chosen"
        >
          {families.map((family) => (
            <button
              key={family}
              type="button"
              aria-pressed={family === activePreset.family}
              data-family={family}
              title={`${PRESET_FAMILY_INFO[family].name}: ${PRESET_FAMILY_INFO[family].rule}.`}
              onClick={() => selectFamily(family)}
            >
              {PRESET_FAMILY_INFO[family].label}
            </button>
          ))}
        </div>
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
