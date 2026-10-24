import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import { DEFAULT_ACQUISITION_LIMITS } from './acquisition-policy.js';

const root = resolve(import.meta.dirname, '../../..');
const readJson = (path: string) =>
  JSON.parse(readFileSync(resolve(root, path), 'utf8')) as unknown;

describe('default acquisition limits', () => {
  // AA's detail pages reached 478 MiB of the old 512 MiB budget on
  // 2026-10-23, and the 2026-10-24 capture needed 716 MiB. Keep a third of the
  // budget free so growth shows up here before a refresh hits the limit.
  it('leaves headroom over every active source capture', () => {
    const { whitelist } = readJson('data/mappings/sources.json') as {
      whitelist: string[];
    };
    for (const sourceId of whitelist) {
      const evidence = readJson(
        `data/sources/${sourceId}/evidence-index.json`,
      ) as { byteLength: number }[];
      const bytes = evidence.reduce((sum, row) => sum + row.byteLength, 0);
      expect(
        bytes,
        `${sourceId} capture is ${Math.round(bytes / 2 ** 20)} MiB`,
      ).toBeLessThanOrEqual((DEFAULT_ACQUISITION_LIMITS.totalBytes * 2) / 3);
    }
  });
});
