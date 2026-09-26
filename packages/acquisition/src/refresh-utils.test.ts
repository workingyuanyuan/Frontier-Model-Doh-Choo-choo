import { join } from 'node:path';
import { check, resolveConfig } from 'prettier';
import { describe, expect, it } from 'vitest';

import {
  formatMetadataJson,
  getWorkspaceRoot,
  previousSnapshotValue,
} from './refresh-utils.js';

describe('snapshot comparison baseline', () => {
  it('compares the next refresh against the prior refreshed count', () => {
    const prior = '| Candidate results | 1223 | 1167 | -56 |';
    expect(previousSnapshotValue(prior, 'Candidate results', 0)).toBe(1167);
    const repeated = '| Candidate results   | 1167 | 1167 | 0 |';
    expect(previousSnapshotValue(repeated, 'Candidate results', 0)).toBe(1167);
  });

  it('preserves a zero count and falls back for missing or invalid rows', () => {
    expect(previousSnapshotValue('| Costs | 5 | 0 | -5 |', 'Costs', 9)).toBe(0);
    for (const report of [
      '',
      '| Costs | 5 | | -5 |',
      '| Costs | 5 | unknown | 0 |',
      '| Costs | 5 |',
    ]) {
      expect(previousSnapshotValue(report, 'Costs', 9)).toBe(9);
    }
  });
});

const cases = [
  {
    file: 'manifest.json',
    value: {
      accessMethods: ['EXPORT', 'DOM'],
      benchmarkIds: [
        'aime',
        'chess-puzzles',
        'epoch-capabilities-index',
        'frontiermath',
        'frontiermath-tier-4',
        'gpqa-diamond',
        'math-level-5',
        'simpleqa-verified',
        'swe-bench',
      ],
      fallbackMethods: ['VISUAL'],
    },
  },
  {
    file: 'evidence-index.json',
    value: [
      {
        metadata: {
          supersededExportNames: ['deepseek-v4-flash', 'deepseek-v4-pro'],
        },
        requestUrl: 'https://example.com/export.csv',
      },
    ],
  },
];

describe('generated metadata JSON', () => {
  it.each(cases)(
    '$file preserves data and matches Prettier on repeated runs',
    async ({ file, value }) => {
      const path = join(getWorkspaceRoot(), 'data', 'sources', 'test', file);
      const output = await formatMetadataJson(value, path);
      expect(JSON.parse(output)).toEqual(value);
      expect(
        await check(output, {
          ...(await resolveConfig(path)),
          filepath: path,
          parser: 'json',
        }),
      ).toBe(true);
      expect(await formatMetadataJson(JSON.parse(output), path)).toBe(output);
    },
  );
});
