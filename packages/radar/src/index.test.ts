import { describe, expect, it } from 'vitest';

import { createRadarGeometry, createRadarPresentation } from './index.js';

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

describe('createRadarPresentation', () => {
  it('builds ordered multi-model series and an equivalent data table', () => {
    const presentation = createRadarPresentation([
      { id: 'a', label: 'Model A', values: fullValues },
      {
        id: 'b',
        label: 'Model B',
        values: { ...fullValues, knowledge: null },
      },
    ]);

    expect(presentation.series.map(({ id }) => id)).toEqual(['a', 'b']);
    expect(presentation.series[1]?.geometry.fillPath).toBeNull();
    expect(presentation.tableRows).toHaveLength(8);
    expect(presentation.tableRows[2]).toEqual({
      dimension: 'knowledge',
      values: { a: 50, b: null },
    });
  });

  it('keeps zero and 100 at their absolute-scale extremes', () => {
    const presentation = createRadarPresentation([
      { id: 'model', label: 'Model', values: fullValues },
    ]);

    expect(presentation.series[0]?.geometry.points[0]).toMatchObject({
      value: 100,
      y: 10,
    });
    expect(presentation.series[0]?.geometry.points[4]).toMatchObject({
      value: 0,
      x: 50,
      y: 50,
    });
  });

  it('uses final values under reduced motion instead of animation progress', () => {
    const animated = createRadarPresentation(
      [{ id: 'model', label: 'Model', values: fullValues }],
      { progress: 0 },
    );
    const reduced = createRadarPresentation(
      [{ id: 'model', label: 'Model', values: fullValues }],
      { progress: 0, reducedMotion: true },
    );

    expect(animated.series[0]?.geometry.points[0]).toMatchObject({ y: 50 });
    expect(reduced.series[0]?.geometry.points[0]).toMatchObject({ y: 10 });
  });

  it('rejects duplicate or excessive series', () => {
    expect(() =>
      createRadarPresentation([
        { id: 'same', label: 'A', values: fullValues },
        { id: 'same', label: 'B', values: fullValues },
      ]),
    ).toThrow('non-empty and unique');
    expect(() =>
      createRadarPresentation(
        Array.from({ length: 6 }, (_, index) => ({
          id: String(index),
          label: String(index),
          values: fullValues,
        })),
      ),
    ).toThrow('one to five');
  });
});
