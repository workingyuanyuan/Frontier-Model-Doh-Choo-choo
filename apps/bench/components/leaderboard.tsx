import type { ProductVersion } from '@llm-bench/benchmark-data';
import { useEffect, useMemo, useRef, useState } from 'react';

import {
  getCoverageCount,
  getProfileIdentity,
  profileById,
  getProfilesForModel,
  getProfileDisplayName,
  type LeaderboardRow,
} from '../lib/view-model';
import {
  UI_DIMENSION_ABBREVIATIONS,
  UI_DIMENSION_IDS,
} from '../lib/ui-contract';
import {
  sortLeaderboardRows,
  type LeaderboardSortKey,
  type SortDirection,
} from '../lib/table-sort';

type LeaderboardProps = {
  product: ProductVersion;
  rows: LeaderboardRow[];
  representatives: LeaderboardRow[];
  checkedModelIds: string[];
  setCheckedModelIds: React.Dispatch<React.SetStateAction<string[]>>;
  modelProfiles: Record<string, string>;
  selectedModelId: string;
  onSelect: (modelId: string, profileId: string) => void;
};

const score = (value: number | null) =>
  value === null ? 'N/A' : value.toFixed(1);

const SortHeader = ({
  label,
  sortKey,
  active,
  direction,
  onSort,
}: {
  label: string;
  sortKey: LeaderboardSortKey;
  active: boolean;
  direction: SortDirection;
  onSort: (key: LeaderboardSortKey) => void;
}) => (
  <button
    type="button"
    className="table-sort-button"
    data-leaderboard-sort
    aria-label={`Sort by ${label}`}
    onClick={() => onSort(sortKey)}
  >
    <span>{label}</span>
    <span className="sort-indicator" aria-hidden="true">
      {active ? (direction === 'ascending' ? '↑' : '↓') : '↕'}
    </span>
  </button>
);

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
  }>({ key: 'coverage', direction: 'descending' });

  const activeRows = useMemo(
    () =>
      rows.map((representative) => {
        const chosenProfileId =
          modelProfiles[representative.modelId] ?? representative.profileId;
        const chosen = product.leaderboard.find(
          ({ profileId }) => profileId === chosenProfileId,
        );
        return chosen
          ? { ...chosen, rank: representative.rank }
          : representative;
      }),
    [modelProfiles, product.leaderboard, rows],
  );
  const sortedRows = sortLeaderboardRows(product, activeRows, sort).map(
    (row, index) =>
      sort.key === 'coverage' ? { ...row, rank: index + 1 } : row,
  );
  const onSort = (key: LeaderboardSortKey) =>
    setSort((current) => ({
      key,
      direction:
        current.key === key && current.direction === 'ascending'
          ? 'descending'
          : 'ascending',
    }));

  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerQuery, setPickerQuery] = useState('');
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const defaultCheckedIds = useMemo(
    () => representatives.map((r) => r.modelId),
    [representatives],
  );

  useEffect(() => {
    if (!isPickerOpen) return;
    searchInputRef.current?.focus();
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsPickerOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsPickerOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPickerOpen]);

  const handleCheckboxChange = (modelId: string, checked: boolean) => {
    setCheckedModelIds((prev) => {
      if (checked) {
        if (prev.includes(modelId)) return prev;
        return [...prev, modelId];
      } else {
        return prev.filter((id) => id !== modelId);
      }
    });
  };

  const filteredRepresentatives = useMemo(() => {
    const normalized = pickerQuery.trim().toLowerCase();
    if (!normalized) return representatives;
    return representatives.filter((row) => {
      const profiles = getProfilesForModel(product, row.modelId, row.profileId);
      return profiles.some((profile) => {
        const baseModelName = profile.baseModelName ?? '';
        const displayName = getProfileDisplayName(profile) ?? '';
        const identity = getProfileIdentity(profile) ?? '';
        const effort = profile.attributes?.effort ?? '';
        const providerId = profile.providerId ?? '';
        const modelId = profile.modelId ?? '';
        return (
          baseModelName.toLowerCase().includes(normalized) ||
          displayName.toLowerCase().includes(normalized) ||
          identity.toLowerCase().includes(normalized) ||
          effort.toLowerCase().includes(normalized) ||
          providerId.toLowerCase().includes(normalized) ||
          modelId.toLowerCase().includes(normalized) ||
          row.modelId.toLowerCase().includes(normalized)
        );
      });
    });
  }, [representatives, pickerQuery, product]);

  const heatMap = useMemo(() => {
    const map: Record<string, Record<number, number>> = {};
    UI_DIMENSION_IDS.forEach((dimensionId) => {
      const scores = activeRows
        .map((row) => {
          const d = row.dimensions.find((dim) => dim.dimension === dimensionId);
          return d ? d.score : null;
        })
        .filter((s): s is number => s !== null);
      const uniqueSorted = [...new Set(scores)].sort((a, b) => b - a);
      const dimMap: Record<number, number> = {};
      map[dimensionId] = dimMap;
      uniqueSorted.slice(0, 5).forEach((scoreVal, index) => {
        dimMap[scoreVal] = index + 1;
      });
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

        <div className="picker-container">
          <button
            ref={triggerRef}
            type="button"
            className="picker-trigger-btn"
            aria-haspopup="dialog"
            aria-expanded={isPickerOpen}
            aria-controls="picker-popover"
            onClick={() => setIsPickerOpen(!isPickerOpen)}
          >
            <span>Search models or profiles</span>
            <span className="selected-badge">
              {checkedModelIds.length} selected
            </span>
          </button>

          {isPickerOpen ? (
            <div
              ref={popoverRef}
              className="picker-popover is-open"
              role="dialog"
              aria-label="Model visibility options"
              id="picker-popover"
            >
              <div className="picker-search-container">
                <input
                  ref={searchInputRef}
                  type="search"
                  name="model-profile-filter"
                  className="picker-search-input"
                  placeholder="Search models or profiles..."
                  value={pickerQuery}
                  onChange={(e) => setPickerQuery(e.target.value)}
                  aria-label="Filter models in list"
                />
              </div>
              <div className="picker-list">
                {filteredRepresentatives.map((row) => {
                  const profile = product.profiles.find(
                    (p) => p.id === row.profileId,
                  );
                  const modelName = profile?.baseModelName ?? row.modelId;
                  const isChecked = checkedModelIds.includes(row.modelId);
                  return (
                    <label key={row.modelId} className="picker-item">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) =>
                          handleCheckboxChange(row.modelId, e.target.checked)
                        }
                      />
                      <span>{modelName}</span>
                    </label>
                  );
                })}
              </div>
              <div className="picker-actions">
                <button
                  type="button"
                  onClick={() =>
                    setCheckedModelIds(() =>
                      representatives.map((r) => r.modelId),
                    )
                  }
                >
                  Select all
                </button>
                <button
                  type="button"
                  onClick={() => setCheckedModelIds(() => [])}
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => setCheckedModelIds(() => defaultCheckedIds)}
                >
                  Default
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div
        className="table-scroll"
        role="region"
        aria-labelledby="leaderboard-title"
        tabIndex={0}
      >
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th
                scope="col"
                aria-sort={sort.key === 'rank' ? sort.direction : 'none'}
              >
                <SortHeader
                  label="Rank"
                  sortKey="rank"
                  active={sort.key === 'rank'}
                  direction={sort.direction}
                  onSort={onSort}
                />
              </th>
              <th
                scope="col"
                aria-sort={sort.key === 'model' ? sort.direction : 'none'}
              >
                <SortHeader
                  label="Model"
                  sortKey="model"
                  active={sort.key === 'model'}
                  direction={sort.direction}
                  onSort={onSort}
                />
              </th>
              <th
                scope="col"
                aria-sort={sort.key === 'overall' ? sort.direction : 'none'}
              >
                <SortHeader
                  label="Overall"
                  sortKey="overall"
                  active={sort.key === 'overall'}
                  direction={sort.direction}
                  onSort={onSort}
                />
              </th>
              {UI_DIMENSION_IDS.map((dimension) => (
                <th
                  key={dimension}
                  scope="col"
                  aria-label={dimension}
                  aria-sort={sort.key === dimension ? sort.direction : 'none'}
                >
                  <SortHeader
                    label={UI_DIMENSION_ABBREVIATIONS[dimension]}
                    sortKey={dimension}
                    active={sort.key === dimension}
                    direction={sort.direction}
                    onSort={onSort}
                  />
                </th>
              ))}
              <th
                scope="col"
                aria-sort={sort.key === 'coverage' ? sort.direction : 'none'}
              >
                <SortHeader
                  label="COV"
                  sortKey="coverage"
                  active={sort.key === 'coverage'}
                  direction={sort.direction}
                  onSort={onSort}
                />
              </th>
              <th
                scope="col"
                aria-sort={sort.key === 'status' ? sort.direction : 'none'}
              >
                <SortHeader
                  label="Status"
                  sortKey="status"
                  active={sort.key === 'status'}
                  direction={sort.direction}
                  onSort={onSort}
                />
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row) => {
              const chosenProfileId =
                modelProfiles[row.modelId] ?? row.profileId;
              const profile = profileById(product, chosenProfileId);
              const profiles = getProfilesForModel(
                product,
                row.modelId,
                row.profileId,
              );
              const profileCount = profiles.length;
              const available = getCoverageCount(row);
              const scoreByDimension = new Map(
                row.dimensions.map(({ dimension, score: dimensionScore }) => [
                  dimension,
                  dimensionScore,
                ]),
              );
              const selected = row.modelId === selectedModelId;

              return (
                <tr
                  key={row.modelId}
                  className={selected ? 'is-selected' : undefined}
                  data-ranked-row
                  aria-selected={selected}
                >
                  <td className="rank-cell" data-label="Rank">
                    {row.rank ?? '—'}
                  </td>
                  <th scope="row" data-label="Model">
                    {profileCount > 1 ? (
                      <div className="model-cell-content">
                        <button
                          className="model-button"
                          type="button"
                          aria-pressed={selected}
                          onClick={() => onSelect(row.modelId, chosenProfileId)}
                        >
                          <strong>
                            {profile?.baseModelName ?? row.modelId}
                          </strong>
                        </button>
                        <label className="profile-select-label">
                          <span className="sr-only">
                            Select profile for {profile?.baseModelName}
                          </span>
                          <select
                            className="profile-table-select"
                            name={`profile-${row.modelId}`}
                            value={chosenProfileId}
                            onChange={(e) =>
                              onSelect(row.modelId, e.target.value)
                            }
                          >
                            {profiles.map((p) => (
                              <option key={p.id} value={p.id}>
                                {getProfileIdentity(p)}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>
                    ) : (
                      <button
                        className="model-button"
                        type="button"
                        aria-pressed={selected}
                        onClick={() => onSelect(row.modelId, row.profileId)}
                      >
                        <strong>{profile?.baseModelName ?? row.modelId}</strong>
                        <span>
                          {profile
                            ? getProfileIdentity(profile)
                            : row.profileId}
                        </span>
                      </button>
                    )}
                  </th>
                  <td data-label="Overall">
                    <strong className="overall-score">
                      {score(row.overallScore)}
                    </strong>
                  </td>
                  {UI_DIMENSION_IDS.map((dimension, index) => {
                    const scoreVal = scoreByDimension.get(dimension) ?? null;
                    const heatRank =
                      scoreVal !== null
                        ? (heatMap[dimension]?.[scoreVal] ?? null)
                        : null;
                    return (
                      <td
                        key={dimension}
                        className={`dimension-cell dimension-cell-${index + 1}`}
                        data-label={UI_DIMENSION_ABBREVIATIONS[dimension]}
                        data-heat-rank={heatRank}
                      >
                        {score(scoreVal)}
                      </td>
                    );
                  })}
                  <td data-label="COV">
                    <span className="coverage">{available}/8</span>
                  </td>
                  <td data-label="Status">
                    <span
                      className={`status-badge status-${row.status.toLowerCase()}`}
                    >
                      {row.status === 'ESTIMATED' ? 'Estimated' : 'Supported'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {rows.length === 0 ? (
        <div className="empty-state" role="status">
          <strong>No matching models</strong>
          <span>Try a provider, base model, or effort level.</span>
        </div>
      ) : null}
    </section>
  );
}
