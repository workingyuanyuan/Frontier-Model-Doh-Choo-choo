import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { materializeBioBasicsBench } from './biobasicsbench-materializer.js';

function syntheticCapture() {
  const capture = JSON.parse(
    readFileSync(
      new URL(
        '../../../data/sources/biobasicsbench/reviewed-capture.json',
        import.meta.url,
      ),
      'utf8',
    ),
  );
  // Keep source labels and shape, replacing every measured value with a fixture.
  capture.values = capture.values.map((row: unknown[]) => [
    ...row.slice(0, 3),
    50,
    1000,
    40,
    60,
  ]);
  capture.printedXhighRows = capture.printedXhighRows.map((row: unknown[]) => [
    row[0],
    50,
    40,
    60,
    1000,
  ]);
  return capture;
}

const context = {
  evidenceId: `sha256:${'a'.repeat(64)}`,
  observedAt: '2026-11-09T01:51:32.016Z',
};

describe('BioBasicsBench materializer', () => {
  it('preserves percentage rubric rewards and explicit efforts', () => {
    const result = materializeBioBasicsBench(
      JSON.stringify(syntheticCapture()),
      context,
    );
    expect(result.candidates).toHaveLength(37);
    expect(result.candidates.every((row) => row.sourceRole === 'VENDOR')).toBe(
      true,
    );
    expect(result.candidates.every((row) => row.normalizedScore === 50)).toBe(
      true,
    );
    expect(result.candidates.every((row) => row.profile.attempts === 5)).toBe(
      true,
    );
    expect(
      result.candidates.every((row) => row.benchmarkVersion === null),
    ).toBe(true);
    expect(result.candidates.some((row) => row.profile.effort === 'none')).toBe(
      true,
    );
    expect(
      result.candidates[0]!.provenance.outputTokensPerTask?.locator,
    ).toContain('mean_output_tokens_per_problem');
    expect(result.candidates[0]!.provenance.cost).toBeUndefined();
  });

  it('rejects duplicate settings and incomplete coverage', () => {
    const capture = syntheticCapture();
    capture.values[1] = capture.values[0];
    expect(() =>
      materializeBioBasicsBench(JSON.stringify(capture), context),
    ).toThrow('Duplicate');
    capture.values.pop();
    expect(() =>
      materializeBioBasicsBench(JSON.stringify(capture), context),
    ).toThrow('37 settings');
  });

  it('rejects chart and printed-table conflicts', () => {
    const capture = syntheticCapture();
    capture.printedXhighRows[0][1] = 51;
    expect(() =>
      materializeBioBasicsBench(JSON.stringify(capture), context),
    ).toThrow('disagree');
  });

  it('rejects out-of-range scores and inverted confidence intervals', () => {
    const capture = syntheticCapture();
    capture.values[0][3] = 101;
    expect(() =>
      materializeBioBasicsBench(JSON.stringify(capture), context),
    ).toThrow('numeric');
    capture.values[0][3] = 50;
    capture.values[0][5] = 51;
    expect(() =>
      materializeBioBasicsBench(JSON.stringify(capture), context),
    ).toThrow('confidence');
  });
});
