import { describe, expect, it } from 'vitest';

import { liveBenchAliasInventory } from './livebench-alias-inventory.js';
import { normalizeModelAlias } from './model-alias-resolution.js';

describe('pinned LiveBench alias inventory', () => {
  it('captures all 60,372 rows in 166 unique normalized aliases', () => {
    expect(liveBenchAliasInventory).toHaveLength(166);
    expect(
      liveBenchAliasInventory.reduce((sum, entry) => sum + entry.rows, 0),
    ).toBe(60_372);
    expect(
      new Set(
        liveBenchAliasInventory.map((entry) =>
          normalizeModelAlias(entry.alias),
        ),
      ).size,
    ).toBe(166);
  });
});
