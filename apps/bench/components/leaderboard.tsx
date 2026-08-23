import type { DimensionId } from '@llm-bench/benchmark-data';
import { useMemo, useState } from 'react';

import { UI_DIMENSION_IDS } from '../lib/ui-contract';
import {
  sortLeaderboardRows,
  type LeaderboardSortKey,
  type SortDirection,
} from '../lib/table-sort';
import {
  getRepresentativeRows,
  type LeaderboardRow,
  type ProductPreset,
  type PresetProductVersion,
} from '../lib/view-model';
import { ModelPicker } from './leaderboard-controls';
import { LeaderboardTable } from './leaderboard-table';
import { PresetControls } from './preset-controls';

type HeatMap = Record<string, Record<number, number>>;

export type LeaderboardProps = {
  product: PresetProductVersion;
  rows: LeaderboardRow[];
  representatives: LeaderboardRow[];
  checkedModelIds: string[];
  setCheckedModelIds: React.Dispatch<React.SetStateAction<string[]>>;
  benchmarkDimensions: Record<string, DimensionId>;
  preset: ProductPreset | null;
  onSelectPreset: (presetId: string) => void;
  initialExpandedModelIds?: string[] | undefined;
  developerMode: boolean;
};

export function Leaderboard({
  product,
  rows,
  representatives,
  checkedModelIds,
  setCheckedModelIds,
  benchmarkDimensions,
  preset,
  onSelectPreset,
  initialExpandedModelIds,
  developerMode,
}: LeaderboardProps) {
  const [expandedModelIds, setExpandedModelIds] = useState<string[]>(
    initialExpandedModelIds ?? [],
  );

  const toggleExpand = (modelId: string) => {
    setExpandedModelIds((prev) =>
      prev.includes(modelId)
        ? prev.filter((id) => id !== modelId)
        : [...prev, modelId],
    );
  };
  const [sort, setSort] = useState<{
    key: LeaderboardSortKey;
    direction: SortDirection;
  }>({ key: 'overall', direction: 'descending' });

  const [modelProfiles, setModelProfiles] = useState<Record<string, string>>(
    () => {
      const initialProfiles: Record<string, string> = {};
      const allRepresentatives = getRepresentativeRows(product);
      allRepresentatives.forEach((row) => {
        initialProfiles[row.modelId] = row.profileId;
      });
      product.leaderboard.forEach((row) => {
        if (!initialProfiles[row.modelId]) {
          initialProfiles[row.modelId] = row.profileId;
        }
      });
      return initialProfiles;
    },
  );

  const handleProfileChange = (modelId: string, profileId: string) => {
    setModelProfiles((prev) => ({ ...prev, [modelId]: profileId }));
  };

  const activeRows = useMemo(
    () =>
      rows.map((representative) => {
        const profileId =
          modelProfiles[representative.modelId] ?? representative.profileId;
        const selected = product.leaderboard.find(
          (row) => row.profileId === profileId,
        );
        return selected
          ? { ...selected, rank: representative.rank }
          : representative;
      }),
    [modelProfiles, product.leaderboard, rows],
  );

  const sortedRows = useMemo(
    () => sortLeaderboardRows(product, activeRows, sort),
    [activeRows, product, sort],
  );

  const onSort = (key: LeaderboardSortKey) =>
    setSort((current) => ({
      key,
      direction:
        current.key === key && current.direction === 'ascending'
          ? 'descending'
          : 'ascending',
    }));

  const heatMap = useMemo<HeatMap>(() => {
    const map: HeatMap = {};
    UI_DIMENSION_IDS.forEach((dimensionId) => {
      const values = activeRows
        .map(
          (row) =>
            row.dimensions.find(({ dimension }) => dimension === dimensionId)
              ?.score ?? null,
        )
        .filter((value): value is number => value !== null);
      const dimensionMap: Record<number, number> = {};
      [...new Set(values)]
        .sort((left, right) => right - left)
        .slice(0, 5)
        .forEach((value, index) => {
          dimensionMap[value] = index + 1;
        });
      map[dimensionId] = dimensionMap;
    });
    return map;
  }, [activeRows]);

  return (
    <section
      className="panel leaderboard-panel"
      aria-labelledby="leaderboard-title"
    >
      <div className="section-heading">
        <div>
          <p className="eyebrow">Representative profiles</p>
          <h2 id="leaderboard-title">Leaderboard</h2>
          <p>One row per base model.</p>
        </div>
        <div className="leaderboard-toolbar">
          <PresetControls
            presets={product.presets}
            activePreset={product.activePreset}
            onSelectPreset={onSelectPreset}
          />
          <ModelPicker
            product={product}
            representatives={representatives}
            checkedModelIds={checkedModelIds}
            setCheckedModelIds={setCheckedModelIds}
          />
        </div>
      </div>

      <LeaderboardTable
        developerMode={developerMode}
        product={product}
        rows={sortedRows}
        sort={sort}
        onSort={onSort}
        heatMap={heatMap}
        modelProfiles={modelProfiles}
        onProfileChange={handleProfileChange}
        benchmarkDimensions={benchmarkDimensions}
        preset={preset}
        expandedModelIds={expandedModelIds}
        onToggleExpand={toggleExpand}
      />

      {rows.length === 0 ? (
        <div className="empty-state" role="status">
          <strong>No matching models</strong>
          <span>Try a provider, base model, or effort level.</span>
        </div>
      ) : null}
    </section>
  );
}
