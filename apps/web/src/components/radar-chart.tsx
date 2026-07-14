import { type DimensionId, type RankingEntry } from '@llm-bench/contracts';
import { createRadarPresentation } from '@llm-bench/radar';

import type { Dictionary } from '../lib/i18n';

interface RadarChartProps {
  entry: RankingEntry;
  fieldAverage: Record<DimensionId, number | null>;
  dictionary: Dictionary;
}

const toValues = (entry: RankingEntry): Record<DimensionId, number | null> =>
  Object.fromEntries(
    entry.dimensions.map(({ dimension, score }) => [dimension, score]),
  ) as Record<DimensionId, number | null>;

const formatScore = (score: number | null | undefined): string =>
  score === null || score === undefined
    ? 'N/A'
    : (Math.round(score * 10) / 10).toString();

export function RadarChart({
  entry,
  fieldAverage,
  dictionary,
}: RadarChartProps) {
  const presentation = createRadarPresentation(
    [
      { id: 'average', label: dictionary.fieldAverage, values: fieldAverage },
      { id: 'model', label: entry.displayName, values: toValues(entry) },
    ],
    {
      centerX: 280,
      centerY: 250,
      radius: 158,
      labelRadius: 207,
    },
  );
  const average = presentation.series[0]!.geometry;
  const chart = presentation.series[1]!.geometry;

  return (
    <div className="radarWrap">
      <svg
        className="radarSvg"
        viewBox="0 0 560 500"
        role="img"
        aria-labelledby="radar-title radar-description"
      >
        <title id="radar-title">{`${entry.displayName} · ${dictionary.capabilityProfile}`}</title>
        <desc id="radar-description">{dictionary.capabilityDescription}</desc>
        <defs>
          <linearGradient id="model-fill" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="var(--accent)" stopOpacity="0.42" />
            <stop
              offset="1"
              stopColor="var(--accent-strong)"
              stopOpacity="0.16"
            />
          </linearGradient>
        </defs>

        <g className="radarGrid">
          {presentation.rings.map((ring, index) => (
            <path key={index} d={ring.fillPath ?? undefined} />
          ))}
          {presentation.axes.map((axis) => (
            <line
              key={axis.dimension}
              x1="280"
              y1="250"
              x2={axis.x}
              y2={axis.y}
            />
          ))}
        </g>

        {average.fillPath ? (
          <path className="radarAverage" d={average.fillPath} />
        ) : null}
        {chart.fillPath ? (
          <path className="radarModelFill" d={chart.fillPath} />
        ) : null}
        {chart.linePaths.map((path) => (
          <path key={path} className="radarModelLine" d={path} />
        ))}

        {chart.points.map((point) =>
          point ? (
            <circle
              key={point.dimension}
              className="radarPoint"
              cx={point.x}
              cy={point.y}
              r="4.5"
            >
              <title>{`${dictionary.dimensions[point.dimension]}: ${point.value}`}</title>
            </circle>
          ) : null,
        )}

        <g className="radarLabels">
          {presentation.labelAxes.map((axis) => {
            const score = entry.dimensions.find(
              ({ dimension }) => dimension === axis.dimension,
            )?.score;
            const textAnchor =
              axis.x < 260 ? 'end' : axis.x > 300 ? 'start' : 'middle';

            return (
              <text
                key={axis.dimension}
                x={axis.x}
                y={axis.y}
                textAnchor={textAnchor}
                dominantBaseline="middle"
              >
                <tspan className="radarLabelName" x={axis.x} dy="-0.2em">
                  {dictionary.dimensions[axis.dimension]}
                </tspan>
                <tspan className="radarLabelScore" x={axis.x} dy="1.4em">
                  {formatScore(score)}
                </tspan>
              </text>
            );
          })}
        </g>
      </svg>

      <table className="srOnly">
        <caption>{`${entry.displayName} · ${dictionary.capabilityProfile}`}</caption>
        <tbody>
          {presentation.tableRows.map(({ dimension, values }) => (
            <tr key={dimension}>
              <th>{dictionary.dimensions[dimension]}</th>
              <td>{formatScore(values.model)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
