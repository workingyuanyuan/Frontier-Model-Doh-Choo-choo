import { describe, expect, it } from 'vitest';

import { commonBenchmarksMarkdown } from './leaderboard-markdown';

describe('common benchmarks markdown', () => {
  it('copies normalized scores and the difference of a pair', () => {
    expect(
      commonBenchmarksMarkdown(
        ['A · high', 'B | x'],
        [{ label: 'SWE-bench', scores: [71.25, 70], difference: 1.25 }],
      ),
    ).toBe(
      [
        '| Benchmark | A · high | B \\| x | Difference (first − second) |',
        '| --- | --- | --- | --- |',
        '| SWE-bench | 71.3 | 70.0 | +1.3 |',
      ].join('\n'),
    );
  });

  it('omits the difference column beyond two profiles', () => {
    expect(
      commonBenchmarksMarkdown(
        ['A', 'B', 'C'],
        [{ label: 'HLE', scores: [1, 2, 3], difference: null }],
      ),
    ).toBe(
      [
        '| Benchmark | A | B | C |',
        '| --- | --- | --- | --- |',
        '| HLE | 1.0 | 2.0 | 3.0 |',
      ].join('\n'),
    );
  });
});
