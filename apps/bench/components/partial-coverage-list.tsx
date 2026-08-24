import {
  UI_DIMENSION_ABBREVIATIONS,
  UI_DIMENSION_IDS,
} from '../lib/ui-contract';
import { DIMENSION_DISPLAY_NAMES } from './model-detail-panel';
import type { PartialCoverageRow } from '../lib/view-model';

export interface PartialCoverageListProps {
  rows: PartialCoverageRow[];
}

const formatScore = (score: number | null) =>
  score === null ? 'N/A' : score.toFixed(1);

/**
 * Ruling R19: a profile holding four of the five dimensions is disclosed here
 * instead of ranked. No overall score, no rank, and no shared ordering with the
 * main table -- the two sets are not measured on the same basis.
 */
export function PartialCoverageList({ rows }: PartialCoverageListProps) {
  const dominantGap = [...UI_DIMENSION_IDS]
    .map((dimension) => ({
      dimension,
      count: rows.filter((row) => row.missingDimension === dimension).length,
    }))
    .sort((a, b) => b.count - a.count)[0];

  return (
    <section
      className="panel partial-coverage-panel"
      aria-labelledby="partial-coverage-title"
      data-partial-coverage
    >
      <div className="section-heading compact">
        <div>
          <p className="eyebrow">Data gap</p>
          <h2 id="partial-coverage-title">Partial coverage</h2>
          <p>
            These profiles carry four of the five dimensions, so they get no
            overall score and no rank. The gap is not random: on the benchmarks
            they do hold, profiles covering all five average +0.114 standard
            deviations and those covering four average −0.188
            {dominantGap && dominantGap.count > 0
              ? `, and ${dominantGap.count} of the ${rows.length} here are missing ${DIMENSION_DISPLAY_NAMES[dominantGap.dimension]}`
              : ''}
            . Scoring them on what they have would place a different measurement
            beside the ranked table.
          </p>
        </div>
        <p data-partial-coverage-count={rows.length}>{rows.length} profiles</p>
      </div>
      {rows.length > 0 ? (
        <div className="table-scroll">
          <table className="compact-data-table">
            <caption>
              Profiles missing one capability dimension, without an overall
              score or rank
            </caption>
            <thead>
              <tr>
                <th scope="col">Model</th>
                <th scope="col">Missing</th>
                {UI_DIMENSION_IDS.map((dimension) => (
                  <th key={dimension} scope="col">
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
                    {UI_DIMENSION_IDS.map((dimension) => (
                      <td key={dimension}>
                        {formatScore(scoreByDimension.get(dimension) ?? null)}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="empty-state" role="status">
          No profile is missing exactly one dimension.
        </p>
      )}
    </section>
  );
}
