import type { ProductVersion } from '@llm-bench/benchmark-data';
import { useMemo, useState } from 'react';

import { UI_DIMENSION_IDS } from '../lib/ui-contract';
import {
  sortLeaderboardRows,
  type LeaderboardSortKey,
  type SortDirection,
} from '../lib/table-sort';
import type { LeaderboardRow } from '../lib/view-model';
import { ModelPicker } from './leaderboard-controls';
import { LeaderboardTable } from './leaderboard-table';

type HeatMap = Record<string, Record<number, number>>;

export type LeaderboardProps = {
  product: ProductVersion;
  rows: LeaderboardRow[];
  representatives: LeaderboardRow[];
  checkedModelIds: string[];
  setCheckedModelIds: React.Dispatch<React.SetStateAction<string[]>>;
  modelProfiles: Record<string, string>;
  selectedModelId: string;
  onSelect: (modelId: string, profileId: string) => void;
};

export function Leaderboard({
  product,
  rows,
  representatives,
  checkedModelIds,
  setCheckedModelIds,
  modelProfiles,
  selectedModelId,
  onSelect,
}: LeaderboardProps) {
  const [sort, setSort] = useState<{
    key: LeaderboardSortKey;
    direction: SortDirection;
  }>({ key: 'overall', direction: 'descending' });

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
        <ModelPicker
          product={product}
          representatives={representatives}
          checkedModelIds={checkedModelIds}
          setCheckedModelIds={setCheckedModelIds}
        />
      </div>

      <LeaderboardTable
        product={product}
        rows={sortedRows}
        sort={sort}
        onSort={onSort}
        heatMap={heatMap}
        modelProfiles={modelProfiles}
        selectedModelId={selectedModelId}
        onSelect={onSelect}
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
