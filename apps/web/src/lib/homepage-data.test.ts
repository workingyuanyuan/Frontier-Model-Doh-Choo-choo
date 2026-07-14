import { describe, expect, it } from 'vitest';

import {
  ActiveEditionSchema,
  DIMENSION_IDS,
  type RankingEntry,
} from '@llm-bench/contracts';

import { calculateFieldAverage, resolveHomepageData } from './homepage-data';
import { previewSnapshot } from './preview';

const activeEdition = ActiveEditionSchema.parse({
  id: '019f513f-132a-7dc0-805d-0b036ea0d540',
  publicationMode: 'PREVIEW',
  titleZhTw: '資料預覽',
  titleEn: 'Data preview',
  summaryZhTw: null,
  summaryEn: null,
  activatedAt: '2026-07-14T00:00:00.000Z',
  snapshotSha256:
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  snapshot: {
    id: '019f513f-132a-7dc0-805d-0b036ea0d541',
    editionDate: '2026-07-13',
    dataCutoffAt: '2026-07-13T00:00:00.000Z',
    scoringMethodVersion: 'absolute-capability-v1',
    sourceSnapshotIds: ['019f513f-132a-7dc0-805d-0b036ea0d542'],
    entries: [],
  },
});

describe('homepage data selection', () => {
  it('uses the exact active database snapshot when one exists', () => {
    expect(resolveHomepageData(activeEdition)).toEqual({
      edition: activeEdition,
      snapshot: activeEdition.snapshot,
      source: 'ACTIVE_EDITION',
    });
  });

  it('uses only the explicit fictional preview when the database is reachable but empty', () => {
    expect(resolveHomepageData(null)).toEqual({
      edition: null,
      snapshot: previewSnapshot,
      source: 'PREVIEW_FALLBACK',
    });
  });
});

describe('homepage field average', () => {
  it('preserves an entirely missing axis as null instead of NaN', () => {
    const entry = {
      ...previewSnapshot.entries[0]!,
      dimensions: DIMENSION_IDS.map((dimension) => ({
        dimension,
        score: dimension === 'coding' ? 80 : null,
        coverage: dimension === 'coding' ? 1 : 0,
        confidence: dimension === 'coding' ? 100 : 0,
        status:
          dimension === 'coding'
            ? ('FORMAL' as const)
            : ('INSUFFICIENT_DATA' as const),
      })),
    } satisfies RankingEntry;

    const average = calculateFieldAverage([entry]);

    expect(average.coding).toBe(80);
    expect(average.reasoning).toBeNull();
    expect(Object.values(average)).not.toContain(Number.NaN);
  });
});
