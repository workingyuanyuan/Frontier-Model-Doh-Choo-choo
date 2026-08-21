export interface ChartDomain {
  min: number;
  max: number;
  ticks: number[];
}

export interface ChartScaleOptions {
  /** Target number of ticks (default: 5) */
  targetTicks?: number;
  /** Minimum number of ticks (default: 4) */
  minTicks?: number;
  /** Maximum number of ticks (default: 6) */
  maxTicks?: number;
}

function getDecimals(num: number): number {
  if (Number.isInteger(num)) return 0;
  const str = num.toString();
  if (str.includes('e-')) {
    const [coeff, exp] = str.split('e-');
    return parseInt(exp!, 10) + (coeff?.split('.')[1]?.length ?? 0);
  }
  return str.split('.')[1]?.length ?? 0;
}

function getPrecision(step: number, min: number): number {
  return Math.max(getDecimals(step), getDecimals(min));
}

/**
 * Computes a dynamic chart domain and round tick values based on plotted data values.
 *
 * Ensures:
 * - A small padding beyond the data range so edge points are not flush with axis borders
 * - Snapped round min/max and tick values (no fractional noise like 61.37)
 * - 4 to 6 clean ticks
 * - Safe behavior for degenerate inputs: empty array, single value, identical values, non-finites
 * - min !== max and no divide-by-zero / NaN output
 */
export function getChartDomain(
  values: readonly number[] | number[],
  options: ChartScaleOptions = {},
): ChartDomain {
  const { targetTicks = 5, minTicks = 4, maxTicks = 6 } = options;

  const valid = values.filter(
    (v): v is number => typeof v === 'number' && Number.isFinite(v),
  );

  // Degenerate case 1: Empty or no valid finite numbers
  if (valid.length === 0) {
    return {
      min: 0,
      max: 100,
      ticks: [0, 25, 50, 75, 100],
    };
  }

  let dataMin = Math.min(...valid);
  let dataMax = Math.max(...valid);

  // Degenerate case 2 & 3: Single value or all identical values
  if (dataMin === dataMax) {
    const val = dataMin;
    if (val === 0) {
      dataMin = 0;
      dataMax = 10;
    } else if (val > 0) {
      const delta = Math.max(val * 0.1, 1);
      dataMin = Math.max(0, val - delta);
      dataMax = val + delta;
    } else {
      const delta = Math.max(Math.abs(val) * 0.1, 1);
      dataMin = val - delta;
      dataMax = val + delta;
    }
  }

  // No explicit padding: snapping the bounds out to the nearest round tick is
  // itself the breathing room. Padding first and snapping afterwards compounds
  // the two, which pushed the 0-100 cost index out to a nonsensical 0-125.
  const paddedMin = dataMin;
  const paddedMax = dataMax;

  const targetSpan = paddedMax - paddedMin;
  const roughStep = targetSpan / Math.max(1, targetTicks - 1);
  const exponent = Math.floor(Math.log10(roughStep || 1));
  const base = Math.pow(10, exponent);

  // Multipliers for nice steps in base 10
  const multipliers = [0.1, 0.2, 0.25, 0.5, 1, 2, 2.5, 5, 10, 20, 25, 50];
  const candidateSteps = multipliers
    .map((m) => m * base)
    .filter((s) => s > 0 && Number.isFinite(s));

  let bestStep = candidateSteps[0] ?? 1;
  let bestMin = Math.floor(paddedMin);
  let bestMax = Math.ceil(paddedMax);
  let bestScore = Number.POSITIVE_INFINITY;

  for (const step of candidateSteps) {
    let niceMin = Math.floor(paddedMin / step) * step;
    if (dataMin >= 0 && niceMin < 0) {
      niceMin = 0;
    }
    const niceMax = Math.ceil(paddedMax / step) * step;
    const tickCount = Math.round((niceMax - niceMin) / step) + 1;

    if (tickCount < 2) continue;

    // Penalty for distance from targetTicks (5)
    let score = Math.abs(tickCount - targetTicks) * 10;

    // Heavy penalty if outside desired 4-6 range
    if (tickCount < minTicks || tickCount > maxTicks) {
      score +=
        100 *
        (tickCount < minTicks ? minTicks - tickCount : tickCount - maxTicks);
    }

    // Slight preference for integer steps when dealing with integer-like spans
    if (targetSpan >= 5 && step % 1 !== 0) {
      score += 3;
    }

    if (score < bestScore) {
      bestScore = score;
      bestStep = step;
      bestMin = niceMin;
      bestMax = niceMax;
    }
  }

  // Safety fallback if min === max
  if (bestMin === bestMax) {
    bestMax = bestMin + bestStep;
  }

  // Determine precision to prevent JS floating point inaccuracies (e.g. 0.30000000000000004)
  const precision = getPrecision(bestStep, bestMin);
  const count = Math.round((bestMax - bestMin) / bestStep);
  const ticks: number[] = [];

  for (let i = 0; i <= count; i++) {
    ticks.push(Number((bestMin + i * bestStep).toFixed(precision)));
  }

  return {
    min: ticks[0] ?? bestMin,
    max: ticks[ticks.length - 1] ?? bestMax,
    ticks,
  };
}
