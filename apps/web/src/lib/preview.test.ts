import { describe, expect, it } from 'vitest';

import { DIMENSION_IDS, RankingSnapshotSchema } from '@llm-bench/contracts';

import { previewSnapshot } from './preview';

describe('web preview snapshot', () => {
  it('satisfies the production ranking snapshot contract', () => {
    expect(() => RankingSnapshotSchema.parse(previewSnapshot)).not.toThrow();
  });

  it('keeps every model on the canonical eight-axis order', () => {
    previewSnapshot.entries.forEach((entry) => {
      expect(entry.dimensions.map(({ dimension }) => dimension)).toEqual(
        DIMENSION_IDS,
      );
    });
  });

  it('cannot be mistaken for verified evidence', () => {
    previewSnapshot.entries.forEach((entry) => {
      expect(entry.rankingStatus).toBe('PROVISIONAL');
      expect(entry.qualityFlags).toContain('PROVISIONAL');
    });
  });
});
