import { describe, expect, it } from 'vitest';

import { assembleDataStatus } from './data-status-repository';

describe('data status repository assembly', () => {
  it('reports a reachable empty publication state without using preview data', () => {
    expect(assembleDataStatus(null, 0)).toEqual({
      status: 'READY',
      activeEdition: null,
      publishedResultCount: 0,
    });
  });

  it('validates the active edition summary and published result count', () => {
    expect(
      assembleDataStatus(
        {
          id: '019f513f-132a-7dc0-805d-0b036ea0d530',
          editionDate: '2026-07-13',
          publicationMode: 'PREVIEW',
          activatedAt: new Date('2026-07-14T00:00:00.000Z'),
          snapshotId: '019f513f-132a-7dc0-805d-0b036ea0d531',
          entryCount: 152,
        },
        737,
      ),
    ).toMatchObject({
      status: 'READY',
      activeEdition: { entryCount: 152, publicationMode: 'PREVIEW' },
      publishedResultCount: 737,
    });
  });

  it('fails closed when an active row has no activation timestamp', () => {
    expect(() =>
      assembleDataStatus(
        {
          id: '019f513f-132a-7dc0-805d-0b036ea0d530',
          editionDate: '2026-07-13',
          publicationMode: 'PREVIEW',
          activatedAt: null,
          snapshotId: '019f513f-132a-7dc0-805d-0b036ea0d531',
          entryCount: 152,
        },
        737,
      ),
    ).toThrow('activated timestamp');
  });
});
