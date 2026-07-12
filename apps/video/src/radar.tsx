import type { DimensionId, RankingEntry } from '@llm-bench/contracts';
import { DIMENSION_IDS } from '@llm-bench/contracts';
import { createRadarGeometry } from '@llm-bench/radar';

import type { VideoCopy } from './copy';
import type { VideoThemeTokens } from './theme';

type VideoRadarProps = {
  entry: RankingEntry;
  fieldAverage: Record<DimensionId, number>;
  progress: number;
  copy: VideoCopy;
  tokens: VideoThemeTokens;
};

export const VideoRadar = ({
  entry,
  fieldAverage,
  progress,
  copy,
  tokens,
}: VideoRadarProps) => {
  const values = Object.fromEntries(
    entry.dimensions.map(({ dimension, score }) => [
      dimension,
      score === null ? null : score * progress,
    ]),
  ) as Record<DimensionId, number | null>;
  const animatedAverage = Object.fromEntries(
    DIMENSION_IDS.map((dimension) => [
      dimension,
      fieldAverage[dimension] * progress,
    ]),
  ) as Record<DimensionId, number>;
  const chart = createRadarGeometry(values, {
    centerX: 500,
    centerY: 390,
    radius: 255,
  });
  const average = createRadarGeometry(animatedAverage, {
    centerX: 500,
    centerY: 390,
    radius: 255,
  });
  const labels = createRadarGeometry(
    Object.fromEntries(DIMENSION_IDS.map((dimension) => [dimension, 100])),
    { centerX: 500, centerY: 390, radius: 335 },
  );
  const rings = [25, 50, 75, 100].map((level) =>
    createRadarGeometry(
      Object.fromEntries(DIMENSION_IDS.map((dimension) => [dimension, level])),
      { centerX: 500, centerY: 390, radius: 255 },
    ),
  );

  return (
    <svg viewBox="0 0 1000 780" style={{ width: '100%', height: '100%' }}>
      <g>
        {rings.map((ring, index) => (
          <path
            key={index}
            d={ring.fillPath ?? undefined}
            fill="none"
            stroke={tokens.line}
            strokeWidth={2}
          />
        ))}
        {chart.axes.map((axis) => (
          <line
            key={axis.dimension}
            x1={500}
            y1={390}
            x2={axis.x}
            y2={axis.y}
            stroke={tokens.line}
            strokeWidth={2}
          />
        ))}
      </g>

      {average.fillPath ? (
        <path
          d={average.fillPath}
          fill={tokens.comparisonSoft}
          fillOpacity={0.38}
          stroke={tokens.comparison}
          strokeWidth={4}
          strokeDasharray="12 10"
        />
      ) : null}
      {chart.fillPath ? (
        <path
          d={chart.fillPath}
          fill={tokens.accent}
          fillOpacity={0.27}
          stroke={tokens.accentStrong}
          strokeLinejoin="round"
          strokeWidth={7}
        />
      ) : null}

      {chart.points.map((point) =>
        point ? (
          <circle
            key={point.dimension}
            cx={point.x}
            cy={point.y}
            r={8}
            fill={tokens.surface}
            stroke={tokens.accentStrong}
            strokeWidth={5}
          />
        ) : null,
      )}

      {labels.axes.map((axis) => {
        const score = entry.dimensions.find(
          ({ dimension }) => dimension === axis.dimension,
        )?.score;
        const anchor = axis.x < 470 ? 'end' : axis.x > 530 ? 'start' : 'middle';
        return (
          <text
            key={axis.dimension}
            x={axis.x}
            y={axis.y}
            textAnchor={anchor}
            dominantBaseline="middle"
            fill={tokens.ink}
            fontFamily="Arial, Microsoft JhengHei, sans-serif"
          >
            <tspan x={axis.x} dy="-5" fontSize={25} fontWeight={700}>
              {copy.dimensions[axis.dimension]}
            </tspan>
            <tspan
              x={axis.x}
              dy="34"
              fill={tokens.accentStrong}
              fontSize={28}
              fontWeight={700}
            >
              {score ?? 'N/A'}
            </tspan>
          </text>
        );
      })}
    </svg>
  );
};
