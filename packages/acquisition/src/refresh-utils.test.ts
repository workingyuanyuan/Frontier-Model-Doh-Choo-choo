import { join } from 'node:path';
import { check, resolveConfig } from 'prettier';
import { describe, expect, it } from 'vitest';

import { formatMetadataJson, getWorkspaceRoot } from './refresh-utils.js';

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
