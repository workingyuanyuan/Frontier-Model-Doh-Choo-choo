import {
  UI_DIMENSION_ABBREVIATIONS,
  UI_DIMENSION_IDS,
  getActiveDimensionIds,
} from '../lib/ui-contract';
import { DIMENSION_DISPLAY_NAMES } from './model-detail-panel';
import type { PartialCoverageRow } from '../lib/view-model';

export interface PartialCoverageListProps {
  rows: PartialCoverageRow[];
}

const formatScore = (score: number | null) =>
  score === null ? 'N/A' : score.toFixed(1);

/**
 * Ruling R19: a profile missing one scored dimension is disclosed here
 * instead of ranked. No overall score, no rank, and no shared ordering with the
 * main table -- the two sets are not measured on the same basis. Like the
 * excluded-cells list, this is a developer-mode diagnostic: it reports a gap in
 * the data, so it does not belong beside the numbers the main screen publishes.
 */
export function PartialCoverageList({ rows }: PartialCoverageListProps) {
  const scoredDimensionIds = getActiveDimensionIds(rows);
  const dimensionIds = UI_DIMENSION_IDS.filter(
    (dimension) =>
      scoredDimensionIds.includes(dimension) ||
      rows.some((row) => row.missingDimension === dimension),
  );

  return (
    <section
      className="diagnostics-section"
      aria-labelledby="partial-coverage-title"
      data-partial-coverage
    >
      <div className="diagnostics-heading">
        <h2 id="partial-coverage-title">Partial coverage</h2>
        <span data-partial-coverage-count={rows.length}>{rows.length}</span>
      </div>
      {rows.length > 0 ? (
        <div
          className="table-scroll"
          role="region"
          aria-label="Partial coverage scores"
          tabIndex={0}
        >
          <table className="diagnostics-table">
            <thead>
              <tr>
                <th scope="col">Model</th>
                <th scope="col">Missing</th>
                {dimensionIds.map((dimension) => (
                  <th key={dimension} scope="col" className="diagnostics-num">
                    <abbr title={DIMENSION_DISPLAY_NAMES[dimension]}>
                      {UI_DIMENSION_ABBREVIATIONS[dimension]}
                    </abbr>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const scoreByDimension = new Map(
                  row.dimensions.map(({ dimension, score }) => [
                    dimension,
                    score,
                  ]),
                );

                return (
                  <tr
                    key={row.profileId}
                    data-partial-coverage-row={row.profileId}
                  >
                    <th scope="row">{row.displayName}</th>
                    <td data-missing-dimension={row.missingDimension}>
                      {DIMENSION_DISPLAY_NAMES[row.missingDimension]}
                    </td>
                    {dimensionIds.map((dimension) => {
                      const score = scoreByDimension.get(dimension) ?? null;
                      return (
                        <td
                          key={dimension}
                          className={`diagnostics-num${score === null ? ' is-missing' : ''}`}
                        >
                          {formatScore(score)}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="diagnostics-empty" role="status">
          No profile is missing exactly one dimension.
        </p>
      )}
    </section>
  );
}
