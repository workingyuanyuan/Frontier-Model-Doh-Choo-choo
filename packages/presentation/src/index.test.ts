import { describe, expect, it } from 'vitest';

import { RankingSnapshotSchema } from '@llm-bench/contracts';

import { previewSnapshot } from './index.js';

describe('shared presentation snapshot', () => {
  it('is valid and explicitly provisional', () => {
    expect(() => RankingSnapshotSchema.parse(previewSnapshot)).not.toThrow();
    expect(
      previewSnapshot.entries.every(
        ({ rankingStatus }) => rankingStatus === 'PROVISIONAL',
      ),
    ).toBe(true);
  });
});
