import { DIMENSION_IDS } from '@llm-bench/contracts';
import type { DimensionId } from '@llm-bench/contracts';

export type RadarValues = Partial<Record<DimensionId, number | null>>;

export interface RadarGeometryOptions {
  centerX?: number;
  centerY?: number;
  radius?: number;
}

export interface RadarAxis {
  dimension: DimensionId;
  angle: number;
  x: number;
  y: number;
}

export interface RadarPoint extends RadarAxis {
  value: number;
}

export interface RadarGeometry {
  axes: RadarAxis[];
  points: Array<RadarPoint | null>;
  isComplete: boolean;
  fillPath: string | null;
  linePaths: string[];
  missingDimensions: DimensionId[];
}

export interface RadarSeriesInput {
  id: string;
  label: string;
  values: RadarValues;
}

export interface RadarSeriesPresentation extends RadarSeriesInput {
  geometry: RadarGeometry;
}

export interface RadarTableRow {
  dimension: DimensionId;
  values: Record<string, number | null>;
}

export interface RadarPresentationOptions extends RadarGeometryOptions {
  labelRadius?: number;
  ringLevels?: number[];
  progress?: number;
  reducedMotion?: boolean;
}

export interface RadarPresentation {
  axes: RadarAxis[];
  labelAxes: RadarAxis[];
  rings: RadarGeometry[];
  series: RadarSeriesPresentation[];
  tableRows: RadarTableRow[];
}

const roundCoordinate = (value: number): number => {
  const rounded = Math.round(value * 1_000_000) / 1_000_000;
  return Object.is(rounded, -0) ? 0 : rounded;
};

const formatCoordinate = (value: number): string =>
  String(Math.round(value * 1_000) / 1_000);

const pointsToPath = (points: RadarPoint[], close: boolean): string => {
  const [first, ...remaining] = points;
  if (!first) {
    return '';
  }

  const commands = [
    `M ${formatCoordinate(first.x)} ${formatCoordinate(first.y)}`,
    ...remaining.map(
      (point) => `L ${formatCoordinate(point.x)} ${formatCoordinate(point.y)}`,
    ),
  ];

  if (close) {
    commands.push('Z');
  }

  return commands.join(' ');
};

const createOpenSegments = (
  points: Array<RadarPoint | null>,
): RadarPoint[][] => {
  const firstGap = points.findIndex((point) => point === null);
  const ordered = [
    ...points.slice(firstGap + 1),
    ...points.slice(0, firstGap + 1),
  ];
  const segments: RadarPoint[][] = [];
  let current: RadarPoint[] = [];

  ordered.forEach((point) => {
    if (point) {
      current.push(point);
      return;
    }

    if (current.length > 0) {
      segments.push(current);
      current = [];
    }
  });

  if (current.length > 0) {
    segments.push(current);
  }

  return segments;
};

export function createRadarGeometry(
  values: RadarValues,
  options: RadarGeometryOptions = {},
): RadarGeometry {
  const centerX = options.centerX ?? 50;
  const centerY = options.centerY ?? 50;
  const radius = options.radius ?? 40;

  if (![centerX, centerY, radius].every(Number.isFinite) || radius <= 0) {
    throw new Error(
      'radar center and radius must be finite and radius positive',
    );
  }

  const axes = DIMENSION_IDS.map((dimension, index): RadarAxis => {
    const angle = -Math.PI / 2 + (index * Math.PI * 2) / DIMENSION_IDS.length;
    return {
      dimension,
      angle,
      x: roundCoordinate(centerX + Math.cos(angle) * radius),
      y: roundCoordinate(centerY + Math.sin(angle) * radius),
    };
  });

  const missingDimensions: DimensionId[] = [];
  const points = axes.map((axis): RadarPoint | null => {
    const value = values[axis.dimension];

    if (value === undefined) {
      throw new Error(`${axis.dimension} must be a number or null`);
    }

    if (value === null) {
      missingDimensions.push(axis.dimension);
      return null;
    }

    if (!Number.isFinite(value) || value < 0 || value > 100) {
      throw new Error(`${axis.dimension} must be between zero and 100`);
    }

    const scaledRadius = radius * (value / 100);
    return {
      ...axis,
      value,
      x: roundCoordinate(centerX + Math.cos(axis.angle) * scaledRadius),
      y: roundCoordinate(centerY + Math.sin(axis.angle) * scaledRadius),
    };
  });
  const isComplete = missingDimensions.length === 0;

  if (isComplete) {
    const completePoints = points as RadarPoint[];
    const path = pointsToPath(completePoints, true);
    return {
      axes,
      points,
      isComplete,
      fillPath: path,
      linePaths: [path],
      missingDimensions,
    };
  }

  return {
    axes,
    points,
    isComplete,
    fillPath: null,
    linePaths: createOpenSegments(points).map((segment) =>
      pointsToPath(segment, false),
    ),
    missingDimensions,
  };
}

const scaleValues = (
  values: RadarValues,
  progress: number,
): Record<DimensionId, number | null> =>
  Object.fromEntries(
    DIMENSION_IDS.map((dimension) => {
      const value = values[dimension];
      if (value === undefined) {
        throw new Error(`${dimension} must be a number or null`);
      }
      return [dimension, value === null ? null : value * progress];
    }),
  ) as Record<DimensionId, number | null>;

export function createRadarPresentation(
  inputs: RadarSeriesInput[],
  options: RadarPresentationOptions = {},
): RadarPresentation {
  if (inputs.length < 1 || inputs.length > 5) {
    throw new Error('radar presentation requires one to five series');
  }
  const ids = inputs.map(({ id }) => id);
  if (ids.some((id) => id.length === 0) || new Set(ids).size !== ids.length) {
    throw new Error('radar series IDs must be non-empty and unique');
  }

  const progress = options.reducedMotion ? 1 : (options.progress ?? 1);
  if (!Number.isFinite(progress) || progress < 0 || progress > 1) {
    throw new Error('radar progress must be between zero and one');
  }

  const centerX = options.centerX ?? 50;
  const centerY = options.centerY ?? 50;
  const radius = options.radius ?? 40;
  const labelRadius = options.labelRadius ?? radius * 1.25;
  const ringLevels = options.ringLevels ?? [25, 50, 75, 100];
  if (
    !Number.isFinite(labelRadius) ||
    labelRadius <= 0 ||
    ringLevels.length === 0 ||
    ringLevels.some(
      (level, index) =>
        !Number.isFinite(level) ||
        level <= 0 ||
        level > 100 ||
        (index > 0 && level <= ringLevels[index - 1]!),
    )
  ) {
    throw new Error('radar label radius and ring levels must be valid');
  }

  const geometryOptions = { centerX, centerY, radius };
  const series = inputs.map((input) => ({
    ...input,
    geometry: createRadarGeometry(
      scaleValues(input.values, progress),
      geometryOptions,
    ),
  }));
  const fullValues = Object.fromEntries(
    DIMENSION_IDS.map((dimension) => [dimension, 100]),
  ) as Record<DimensionId, number>;
  const axes = createRadarGeometry(fullValues, geometryOptions).axes;
  const labelAxes = createRadarGeometry(fullValues, {
    centerX,
    centerY,
    radius: labelRadius,
  }).axes;
  const rings = ringLevels.map((level) =>
    createRadarGeometry(
      Object.fromEntries(DIMENSION_IDS.map((dimension) => [dimension, level])),
      geometryOptions,
    ),
  );
  const tableRows = DIMENSION_IDS.map((dimension) => ({
    dimension,
    values: Object.fromEntries(
      inputs.map((input) => {
        const value = input.values[dimension];
        if (value === undefined) {
          throw new Error(`${dimension} must be a number or null`);
        }
        return [input.id, value];
      }),
    ),
  }));

  return { axes, labelAxes, rings, series, tableRows };
}
