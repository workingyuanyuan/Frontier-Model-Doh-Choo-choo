import type { ProductVersion } from '@llm-bench/benchmark-data';

type DimensionScore =
  ProductVersion['leaderboard'][number]['dimensions'][number];

export type ChartPoint = {
  x: number;
  y: number;
};

export const polarPoint = (
  index: number,
  total: number,
  radius: number,
  centerX: number,
  centerY: number,
): ChartPoint => {
  const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
  return {
    x: centerX + Math.cos(angle) * radius,
    y: centerY + Math.sin(angle) * radius,
  };
};

export const buildRadarPoints = (
  dimensions: DimensionScore[],
  centerX: number,
  centerY: number,
  radius: number,
): Array<ChartPoint | null> =>
  dimensions.map(({ score }, index) =>
    score === null
      ? null
      : polarPoint(
          index,
          dimensions.length,
          radius * (score / 100),
          centerX,
          centerY,
        ),
  );

/**
 * Return only contiguous runs of available radar points. A missing dimension
 * is a deliberate gap: it must not be converted into a center point or cause
 * a polygon to close across the missing value.
 */
export const buildRadarSegments = (
  dimensions: DimensionScore[],
  centerX: number,
  centerY: number,
  radius: number,
): ChartPoint[][] => {
  const segments: ChartPoint[][] = [];
  let current: ChartPoint[] = [];

  buildRadarPoints(dimensions, centerX, centerY, radius).forEach((point) => {
    if (point) {
      current.push(point);
      return;
    }
    if (current.length > 1) segments.push(current);
    current = [];
  });

  if (current.length > 1) segments.push(current);
  return segments;
};

export const pointsAttribute = (points: ChartPoint[]): string =>
  points.map(({ x, y }) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' ');
