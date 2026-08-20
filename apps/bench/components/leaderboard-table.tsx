import type { ProductVersion } from '@llm-bench/benchmark-data';

import {
  getProfileIdentity,
  profileById,
  getProfilesForModel,
  type LeaderboardRow,
} from '../lib/view-model';
import {
  UI_DIMENSION_ABBREVIATIONS,
  UI_DIMENSION_IDS,
} from '../lib/ui-contract';
import { SortHeader } from './leaderboard-controls';
import type { LeaderboardSortKey, SortDirection } from '../lib/table-sort';

type HeatMap = Record<string, Record<number, number>>;

const score = (value: number | null) =>
  value === null ? 'N/A' : value.toFixed(1);

export function LeaderboardTable({
  product,
  rows,
  sort,
  onSort,
  heatMap,
  modelProfiles,
  selectedModelId,
  onSelect,
}: {
  product: ProductVersion;
  rows: LeaderboardRow[];
  sort: { key: LeaderboardSortKey; direction: SortDirection };
  onSort: (key: LeaderboardSortKey) => void;
  heatMap: HeatMap;
  modelProfiles: Record<string, string>;
  selectedModelId: string;
  onSelect: (modelId: string, profileId: string) => void;
}) {
  return (
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
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const chosenProfileId = modelProfiles[row.modelId] ?? row.profileId;
            const profile = profileById(product, chosenProfileId);
            const profiles = getProfilesForModel(
              product,
              row.modelId,
              row.profileId,
            );
            const selected = row.modelId === selectedModelId;
            const scoreByDimension = new Map(
              row.dimensions.map(({ dimension, score: dimensionScore }) => [
                dimension,
                dimensionScore,
              ]),
            );

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
                  {profiles.length > 1 ? (
                    <div className="model-cell-content">
                      <button
                        className="model-button"
                        type="button"
                        aria-pressed={selected}
                        onClick={() => onSelect(row.modelId, chosenProfileId)}
                      >
                        <strong>{profile?.baseModelName ?? row.modelId}</strong>
                      </button>
                      <label className="profile-select-label">
                        <span className="sr-only">
                          Select profile for {profile?.baseModelName}
                        </span>
                        <select
                          className="profile-table-select"
                          name={`profile-${row.modelId}`}
                          value={chosenProfileId}
                          onChange={(event) =>
                            onSelect(row.modelId, event.target.value)
                          }
                        >
                          {profiles.map((candidate) => (
                            <option key={candidate.id} value={candidate.id}>
                              {getProfileIdentity(candidate)}
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
                        {profile ? getProfileIdentity(profile) : row.profileId}
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
                  const scoreValue = scoreByDimension.get(dimension) ?? null;
                  const heatRank =
                    scoreValue !== null
                      ? (heatMap[dimension]?.[scoreValue] ?? null)
                      : null;
                  return (
                    <td
                      key={dimension}
                      className={`dimension-cell dimension-cell-${index + 1}`}
                      data-label={UI_DIMENSION_ABBREVIATIONS[dimension]}
                      data-heat-rank={heatRank}
                    >
                      {score(scoreValue)}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
