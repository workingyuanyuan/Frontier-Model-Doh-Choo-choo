import type { DimensionId, RankingEntry } from '@llm-bench/contracts';
import { createRadarPresentation } from '@llm-bench/radar';

import type { Dictionary } from '../lib/i18n';

interface ComparisonRadarProps {
  dictionary: Dictionary;
  entries: RankingEntry[];
  title: string;
}

const colors = ['#277cab', '#d66d4b', '#167858', '#7755a8', '#a26b19'];

const values = (entry: RankingEntry): Record<DimensionId, number | null> =>
  Object.fromEntries(
    entry.dimensions.map(({ dimension, score }) => [dimension, score]),
  ) as Record<DimensionId, number | null>;

const format = (value: number | null | undefined): string =>
  value === null || value === undefined ? 'N/A' : value.toFixed(1);

export function ComparisonRadar({
  dictionary,
  entries,
  title,
}: ComparisonRadarProps) {
  const presentation = createRadarPresentation(
    entries.map((entry) => ({
      id: entry.slug,
      label: entry.displayName,
      values: values(entry),
    })),
    { centerX: 280, centerY: 245, radius: 150, labelRadius: 198 },
  );

  return (
    <figure className="comparisonRadar">
      <svg
        aria-labelledby="comparison-radar-title comparison-radar-description"
        role="img"
        viewBox="0 0 560 490"
      >
        <title id="comparison-radar-title">{title}</title>
        <desc id="comparison-radar-description">
          {dictionary.capabilityDescription}
        </desc>
        <g className="comparisonRadarGrid">
          {presentation.rings.map((ring, index) => (
            <path d={ring.fillPath ?? undefined} key={index} />
          ))}
          {presentation.axes.map((axis) => (
            <line
              key={axis.dimension}
              x1="280"
              x2={axis.x}
              y1="245"
              y2={axis.y}
            />
          ))}
        </g>
        {presentation.series.map((series, index) => {
          const color = colors[index]!;
          return (
            <g key={series.id}>
              {series.geometry.fillPath && (
                <path
                  d={series.geometry.fillPath}
                  fill={color}
                  fillOpacity="0.1"
                />
              )}
              {series.geometry.linePaths.map((path) => (
                <path
                  d={path}
                  fill="none"
                  key={path}
                  stroke={color}
                  strokeLinejoin="round"
                  strokeWidth="3"
                />
              ))}
              {series.geometry.points.map((point) =>
                point ? (
                  <circle
                    cx={point.x}
                    cy={point.y}
                    fill="#fff"
                    key={point.dimension}
                    r="3.5"
                    stroke={color}
                    strokeWidth="2.5"
                  />
                ) : null,
              )}
            </g>
          );
        })}
        <g className="comparisonRadarLabels">
          {presentation.labelAxes.map((axis) => {
            const anchor =
              axis.x < 260 ? 'end' : axis.x > 300 ? 'start' : 'middle';
            return (
              <text
                dominantBaseline="middle"
                key={axis.dimension}
                textAnchor={anchor}
                x={axis.x}
                y={axis.y}
              >
                {dictionary.dimensions[axis.dimension]}
              </text>
            );
          })}
        </g>
      </svg>
      <figcaption>
        <ul className="comparisonRadarLegend">
          {entries.map((entry, index) => (
            <li key={entry.slug}>
              <i className={`seriesColor${index}`} />
              {entry.displayName}
            </li>
          ))}
        </ul>
      </figcaption>
      <table className="srOnly">
        <caption>{title}</caption>
        <thead>
          <tr>
            <th>{dictionary.capabilityProfile}</th>
            {entries.map((entry) => (
              <th key={entry.slug}>{entry.displayName}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {presentation.tableRows.map((row) => (
            <tr key={row.dimension}>
              <th>{dictionary.dimensions[row.dimension]}</th>
              {entries.map((entry) => (
                <td key={entry.slug}>{format(row.values[entry.slug])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
