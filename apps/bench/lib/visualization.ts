import type { DimensionId, ProductVersion } from '@llm-bench/benchmark-data';

type DimensionScore =
  ProductVersion['presets'][number]['leaderboard'][number]['dimensions'][number];

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

/**
 * Plot one point per axis, in the order the axes are drawn.
 *
 * `order` is required rather than defaulted because the two orders in this app
 * genuinely differ: `ProductVersion` stores dimensions in scoring order
 * (reasoning first) while the UI draws them in `UI_DIMENSION_IDS` order
 * (agentic first). Mapping over the stored array and trusting the array index
 * silently rotated every value onto the wrong axis -- the picture disagreed
 * with the table beside it and with this chart's own accessible description,
 * which had always looked values up by id.
 */
export const buildRadarPoints = (
  dimensions: readonly DimensionScore[],
  order: readonly DimensionId[],
  centerX: number,
  centerY: number,
  radius: number,
): Array<ChartPoint | null> =>
  order.map((dimensionId, index) => {
    const score =
      dimensions.find((dimension) => dimension.dimension === dimensionId)
        ?.score ?? null;
    return score === null
      ? null
      : polarPoint(
          index,
          order.length,
          radius * (score / 100),
          centerX,
          centerY,
        );
  });

/**
 * Return only contiguous runs of available radar points. A missing dimension
 * is a deliberate gap: it must not be converted into a center point or cause
 * a polygon to close across the missing value.
 */
export const buildRadarSegments = (
  dimensions: readonly DimensionScore[],
  order: readonly DimensionId[],
  centerX: number,
  centerY: number,
  radius: number,
): ChartPoint[][] => {
  const segments: ChartPoint[][] = [];
  let current: ChartPoint[] = [];

  buildRadarPoints(dimensions, order, centerX, centerY, radius).forEach(
    (point) => {
      if (point) {
        current.push(point);
        return;
      }
      if (current.length > 1) segments.push(current);
      current = [];
    },
  );

  if (current.length > 1) segments.push(current);
  return segments;
};

export const pointsAttribute = (points: ChartPoint[]): string =>
  points.map(({ x, y }) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' ');
