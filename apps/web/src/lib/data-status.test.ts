import { afterEach, describe, expect, it, vi } from 'vitest';

import { handleDataStatusRequest } from './data-status';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('data status API handler', () => {
  it('distinguishes a reachable empty database from an unavailable database', async () => {
    const response = await handleDataStatusRequest(async () => ({
      status: 'READY',
      activeEdition: null,
      publishedResultCount: 0,
    }));

    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('no-store');
    await expect(response.json()).resolves.toMatchObject({
      apiVersion: 'v1',
      data: { status: 'READY', activeEdition: null },
    });
  });

  it('returns a generic non-cacheable 503 on repository failure', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const response = await handleDataStatusRequest(async () => {
      throw new Error('private database detail');
    });

    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toBe('no-store');
    await expect(response.json()).resolves.toEqual({
      apiVersion: 'v1',
      error: {
        code: 'DATA_STATUS_UNAVAILABLE',
        message: 'Data status is temporarily unavailable.',
      },
    });
  });
});
