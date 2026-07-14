import { describe, expect, it } from 'vitest';

import { RankingSnapshotSchema } from '@llm-bench/contracts';

import { previewSnapshot, previewSnapshotContentSha256 } from './index.js';

describe('shared presentation snapshot', () => {
  it('is valid and explicitly provisional', () => {
    expect(() => RankingSnapshotSchema.parse(previewSnapshot)).not.toThrow();
    expect(
      previewSnapshot.entries.every(
        ({ providerName, qualityFlags, rankingStatus }) =>
          rankingStatus === 'PROVISIONAL' &&
          providerName.endsWith(' Preview') &&
          qualityFlags.includes('PROVISIONAL'),
      ),
    ).toBe(true);
    expect(previewSnapshot.scoringMethodVersion).toMatch(/^preview-/u);
  });

  it('keeps the exported preview content hash synchronized', () => {
    expect(
      createHash('sha256')
        .update(JSON.stringify(previewSnapshot))
        .digest('hex'),
    ).toBe(previewSnapshotContentSha256);
  });
});
import { createHash } from 'node:crypto';
