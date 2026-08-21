import { describe, expect, it } from 'vitest';
import { getChartDomain } from './chart-scale';

describe('getChartDomain', () => {
  it('handles a normal spread of values with round snapped bounds and 4-6 ticks', () => {
    // Scores between ~61.2 and 72.8 (typical overall scores in real data)
    const result = getChartDomain([61.2, 64.8, 67.5, 70.1, 72.8]);

    expect(result.min).toBeLessThanOrEqual(61.2);
    expect(result.max).toBeGreaterThanOrEqual(72.8);
    expect(result.min).toBe(60);
    expect(result.max).toBe(75);
    expect(result.ticks).toEqual([60, 65, 70, 75]);
    expect(result.ticks.length).toBeGreaterThanOrEqual(4);
    expect(result.ticks.length).toBeLessThanOrEqual(6);
  });

  it('handles wide range of values like normalized cost indices', () => {
    const result = getChartDomain([15.5, 34.2, 58.0, 92.4]);

    expect(result.min).toBeLessThanOrEqual(15.5);
    expect(result.max).toBeGreaterThanOrEqual(92.4);
    expect(result.ticks.length).toBeGreaterThanOrEqual(4);
    expect(result.ticks.length).toBeLessThanOrEqual(6);
    expect(result.min).toBe(0);
    expect(result.max).toBe(100);
    expect(result.ticks).toEqual([0, 25, 50, 75, 100]);
  });

  it('handles a single value without producing min === max or dividing by zero', () => {
    const result = getChartDomain([65]);

    expect(result.min).toBeLessThan(65);
    expect(result.max).toBeGreaterThan(65);
    expect(result.min).not.toBe(result.max);
    expect(result.ticks.length).toBeGreaterThanOrEqual(4);
    expect(result.ticks.length).toBeLessThanOrEqual(6);
    expect(result.ticks.every((t) => Number.isFinite(t))).toBe(true);
    expect(result.ticks.every((t) => !Number.isNaN(t))).toBe(true);
  });

  it('handles single value of zero correctly', () => {
    const result = getChartDomain([0]);

    expect(result.min).toBeLessThanOrEqual(0);
    expect(result.max).toBeGreaterThan(0);
    expect(result.ticks.length).toBeGreaterThanOrEqual(4);
    expect(result.ticks.every((t) => Number.isFinite(t))).toBe(true);
  });

  it('handles multiple identical values without crashing or producing degenerate domain', () => {
    const result = getChartDomain([70, 70, 70, 70]);

    expect(result.min).toBeLessThan(70);
    expect(result.max).toBeGreaterThan(70);
    expect(result.min).not.toBe(result.max);
    expect(result.ticks.length).toBeGreaterThanOrEqual(4);
    expect(result.ticks.length).toBeLessThanOrEqual(6);
  });

  it('handles an empty list with safe default 0-100 domain', () => {
    const result = getChartDomain([]);

    expect(result.min).toBe(0);
    expect(result.max).toBe(100);
    expect(result.ticks).toEqual([0, 25, 50, 75, 100]);
    expect(result.ticks.length).toBe(5);
  });

  it('handles arrays containing non-finite or NaN values safely', () => {
    const result = getChartDomain([
      Number.NaN,
      Number.POSITIVE_INFINITY,
      65,
      75,
    ]);

    expect(result.min).toBeLessThanOrEqual(65);
    expect(result.max).toBeGreaterThanOrEqual(75);
    expect(result.ticks.every((t) => Number.isFinite(t))).toBe(true);
  });

  it('guarantees ticks are round numbers with no floating point artifacts like 61.37', () => {
    const rawValues = [61.37, 63.89, 68.12, 71.45];
    const result = getChartDomain(rawValues);

    for (const tick of result.ticks) {
      // Step should be a clean number (e.g. 5, 2.5, 2, 1, 0.5)
      expect(Number.isFinite(tick)).toBe(true);
      // Ensure no decimal precision drift like 61.370000000000005
      expect(tick.toString()).not.toMatch(/\.\d{5,}/);
    }
  });

  it('handles small decimal USD task cost values', () => {
    const result = getChartDomain([0.15, 0.45, 1.2, 2.35]);

    expect(result.min).toBeLessThanOrEqual(0.15);
    expect(result.max).toBeGreaterThanOrEqual(2.35);
    expect(result.ticks.length).toBeGreaterThanOrEqual(4);
    expect(result.ticks.length).toBeLessThanOrEqual(6);
    expect(result.ticks[0]).toBe(result.min);
    expect(result.ticks[result.ticks.length - 1]).toBe(result.max);
  });
});
