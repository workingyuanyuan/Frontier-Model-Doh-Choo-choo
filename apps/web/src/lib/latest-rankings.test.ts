import { afterEach, describe, expect, it, vi } from 'vitest';

import type { ActiveEdition } from '@llm-bench/contracts';

import { handleLatestRankingsRequest } from './latest-rankings';

const edition: ActiveEdition = {
  id: '019f513f-132a-7dc0-805d-0b036ea0d520',
  publicationMode: 'PREVIEW',
  titleZhTw: '測試版',
  titleEn: 'Test edition',
  summaryZhTw: null,
  summaryEn: null,
  activatedAt: '2026-07-14T00:00:00.000Z',
  snapshot: {
    id: '019f513f-132a-7dc0-805d-0b036ea0d521',
    editionDate: '2026-07-14',
    dataCutoffAt: '2026-07-13T00:00:00.000Z',
    scoringMethodVersion: 'preview-v1',
    sourceSnapshotIds: ['019f513f-132a-7dc0-805d-0b036ea0d522'],
    entries: [],
  },
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe('latest rankings API handler', () => {
  it('returns a versioned active edition with bounded public caching', async () => {
    const response = await handleLatestRankingsRequest(async () => edition);

    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe(
      'public, max-age=60, stale-while-revalidate=300',
    );
    await expect(response.json()).resolves.toEqual({
      apiVersion: 'v1',
      data: edition,
    });
  });

  it('returns a stable non-cacheable 404 when no edition is active', async () => {
    const response = await handleLatestRankingsRequest(async () => null);

    expect(response.status).toBe(404);
    expect(response.headers.get('cache-control')).toBe('no-store');
    await expect(response.json()).resolves.toMatchObject({
      apiVersion: 'v1',
      error: { code: 'ACTIVE_EDITION_NOT_FOUND' },
    });
  });

  it('contains repository and configuration failures behind a stable 503', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    const response = await handleLatestRankingsRequest(async () => {
      throw new Error('database secret must not reach the client');
    });

    expect(consoleError).toHaveBeenCalledOnce();
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toBe('no-store');
    await expect(response.json()).resolves.toEqual({
      apiVersion: 'v1',
      error: {
        code: 'ACTIVE_EDITION_UNAVAILABLE',
        message: 'The active edition is temporarily unavailable.',
      },
    });
  });
});
