import { describe, expect, it } from 'vitest';

import { createRadarGeometry } from './index.js';

const fullValues = {
  reasoning: 100,
  math: 75,
  knowledge: 50,
  language: 25,
  instruction: 0,
  coding: 25,
  agentic: 50,
  context: 75,
} as const;

describe('createRadarGeometry', () => {
  it('keeps the fixed product axis order', () => {
    expect(
      createRadarGeometry(fullValues).axes.map((axis) => axis.dimension),
    ).toEqual([
      'reasoning',
      'math',
      'knowledge',
      'language',
      'instruction',
      'coding',
      'agentic',
      'context',
    ]);
  });

  it('places zero at the center and 100 at the outer radius', () => {
    const geometry = createRadarGeometry(fullValues, {
      centerX: 50,
      centerY: 50,
      radius: 40,
    });

    expect(geometry.points[0]).toMatchObject({ x: 50, y: 10, value: 100 });
    expect(geometry.points[4]).toMatchObject({ x: 50, y: 50, value: 0 });
  });

  it('creates one closed fill path only for complete data', () => {
    const geometry = createRadarGeometry(fullValues);

    expect(geometry.isComplete).toBe(true);
    expect(geometry.fillPath).toMatch(/^M .+ Z$/);
    expect(geometry.linePaths).toHaveLength(1);
  });

  it('uses explicit gaps and no fill when an axis is null', () => {
    const geometry = createRadarGeometry({
      ...fullValues,
      knowledge: null,
    });

    expect(geometry.isComplete).toBe(false);
    expect(geometry.fillPath).toBeNull();
    expect(geometry.missingDimensions).toEqual(['knowledge']);
    expect(geometry.linePaths.every((path) => !path.endsWith(' Z'))).toBe(true);
  });

  it('rejects omitted dimensions instead of interpreting them as zero', () => {
    const { context: _omitted, ...incomplete } = fullValues;

    expect(() => createRadarGeometry(incomplete)).toThrow(
      'context must be a number or null',
    );
  });

  it('rejects scores outside zero to 100', () => {
    expect(() =>
      createRadarGeometry({ ...fullValues, agentic: -0.01 }),
    ).toThrow('agentic must be between zero and 100');
  });
});
