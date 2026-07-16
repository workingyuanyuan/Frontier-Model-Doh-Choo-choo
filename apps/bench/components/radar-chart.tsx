import type { ProductVersion } from '@llm-bench/benchmark-data';

import {
  buildRadarPoints,
  pointsAttribute,
  polarPoint,
} from '../lib/visualization';
import { UI_DIMENSION_IDS } from '../lib/ui-contract';

type Dimensions = ProductVersion['leaderboard'][number]['dimensions'];

const label = (dimension: string) =>
  dimension.charAt(0).toUpperCase() + dimension.slice(1);

export function RadarChart({
  dimensions,
  modelName,
}: {
  dimensions: Dimensions;
  modelName: string;
}) {
  const center = 140;
  const radius = 92;
  const values = buildRadarPoints(dimensions, center, center, radius);
  const completePoints = values.filter(
    (point): point is NonNullable<typeof point> => point !== null,
  );
  const isComplete = completePoints.length === UI_DIMENSION_IDS.length;

  return (
    <section className="panel chart-panel" aria-labelledby="profile-title">
      <div className="section-heading compact">
        <div>
          <p className="eyebrow">Eight dimensions</p>
          <h2 id="profile-title">Category profile</h2>
          <p>{modelName}</p>
        </div>
      </div>

      <div className="radar-layout">
        <div>
          <svg
            className="radar-chart"
            viewBox="0 0 280 280"
            role="img"
            aria-label={`Category profile for ${modelName}. Missing values are omitted rather than drawn at zero.`}
          >
            {[25, 50, 75, 100].map((level) => {
              const grid = UI_DIMENSION_IDS.map((_, index) =>
                polarPoint(
                  index,
                  UI_DIMENSION_IDS.length,
                  radius * (level / 100),
                  center,
                  center,
                ),
              );
              return (
                <polygon
                  key={level}
                  className="radar-grid"
                  points={pointsAttribute(grid)}
                />
              );
            })}
            {UI_DIMENSION_IDS.map((dimension, index) => {
              const endpoint = polarPoint(
                index,
                UI_DIMENSION_IDS.length,
                radius,
                center,
                center,
              );
              const textPoint = polarPoint(
                index,
                UI_DIMENSION_IDS.length,
                radius + 25,
                center,
                center,
              );
              return (
                <g key={dimension}>
                  <line
                    className="radar-axis"
                    x1={center}
                    y1={center}
                    x2={endpoint.x}
                    y2={endpoint.y}
                  />
                  <text
                    className="radar-label"
                    x={textPoint.x}
                    y={textPoint.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {label(dimension)}
                  </text>
                </g>
              );
            })}
            {isComplete ? (
              <polygon
                className="radar-area"
                points={pointsAttribute(completePoints)}
              />
            ) : null}
            {values.map((point, index) =>
              point ? (
                <circle
                  key={UI_DIMENSION_IDS[index]}
                  className="radar-point"
                  cx={point.x}
                  cy={point.y}
                  r="4"
                  aria-label={`${label(UI_DIMENSION_IDS[index]!)} ${dimensions[index]?.score?.toFixed(1)}`}
                />
              ) : null,
            )}
          </svg>
          {!isComplete ? (
            <p className="chart-note">
              Incomplete profile: missing axes are omitted, not plotted as zero.
            </p>
          ) : null}
        </div>

        <table className="compact-data-table">
          <caption>Category score table</caption>
          <tbody>
            {dimensions.map(({ dimension, score, componentCount }) => (
              <tr key={dimension}>
                <th scope="row">{label(dimension)}</th>
                <td>{score === null ? 'N/A' : score.toFixed(1)}</td>
                <td>{componentCount} sources</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
