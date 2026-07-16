import type { ProductVersion } from '@llm-bench/benchmark-data';

import { profileById, type LeaderboardRow } from '../lib/view-model';

type LeaderboardProps = {
  product: ProductVersion;
  rows: LeaderboardRow[];
  query: string;
  selectedModelId: string;
  onQueryChange: (value: string) => void;
  onSelect: (modelId: string, profileId: string) => void;
};

const score = (value: number | null) =>
  value === null ? 'N/A' : value.toFixed(1);

export function Leaderboard({
  product,
  rows,
  query,
  selectedModelId,
  onQueryChange,
  onSelect,
}: LeaderboardProps) {
  return (
    <section
      className="panel leaderboard-panel"
      aria-labelledby="leaderboard-title"
    >
      <div className="section-heading">
        <div>
          <p className="eyebrow">Representative profiles</p>
          <h2 id="leaderboard-title">Leaderboard</h2>
          <p>
            One ranked row per base model. Missing categories are not scored as
            zero.
          </p>
        </div>
        <label className="search-field">
          <span>Search models or profiles</span>
          <input
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="e.g. Claude or high effort"
          />
        </label>
      </div>

      <div className="table-scroll">
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th scope="col">Rank</th>
              <th scope="col">Model</th>
              <th scope="col">Overall</th>
              <th scope="col">Coverage</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const profile = profileById(product, row.profileId);
              const profileCount = product.profiles.filter(
                ({ modelId }) => modelId === row.modelId,
              ).length;
              const available = row.dimensions.filter(
                ({ score: dimensionScore }) => dimensionScore !== null,
              ).length;
              const selected = row.modelId === selectedModelId;

              return (
                <tr
                  key={row.modelId}
                  className={selected ? 'is-selected' : undefined}
                  data-ranked-row
                >
                  <td className="rank-cell" data-label="Rank">
                    {row.rank ?? '—'}
                  </td>
                  <th scope="row" data-label="Model">
                    <button
                      className="model-button"
                      type="button"
                      aria-pressed={selected}
                      onClick={() => onSelect(row.modelId, row.profileId)}
                    >
                      <strong>{profile?.baseModelName ?? row.modelId}</strong>
                      <span>
                        {profile?.displayName ?? row.profileId}
                        {profileCount > 1 ? ` · ${profileCount} profiles` : ''}
                      </span>
                    </button>
                  </th>
                  <td data-label="Overall">
                    <strong className="overall-score">
                      {score(row.overallScore)}
                    </strong>
                  </td>
                  <td data-label="Coverage">
                    <span className="coverage">{available}/8 dimensions</span>
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
          <span>
            Try a provider, base model, effort level, or harness name.
          </span>
        </div>
      ) : null}
    </section>
  );
}
