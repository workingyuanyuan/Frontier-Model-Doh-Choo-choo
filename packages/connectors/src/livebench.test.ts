import { describe, expect, it, vi } from 'vitest';

import {
  LIVEBENCH_ROWS_ORIGIN,
  fetchLiveBenchPage,
  planLiveBenchPages,
  parseLiveBenchPage,
} from './livebench.js';

const validPayload = {
  features: [],
  rows: [
    {
      row_idx: 0,
      row: {
        question_id:
          '02af5e41681a8e07cb79f87ba76a79f75210e2887e0dc3006f913a952d25dd00',
        task: 'typos',
        model: 'claude-3-5-sonnet-20241022',
        score: 1,
        turn: 1,
        tstamp: 1_738_872_686.283_047,
        category: 'language',
      },
      truncated_cells: [],
    },
  ],
  num_rows_total: 60_372,
  num_rows_per_page: 100,
  partial: false,
};

describe('LiveBench page parser', () => {
  it('accepts the current official rows API shape', () => {
    const page = parseLiveBenchPage(JSON.stringify(validPayload));

    expect(page.rows).toHaveLength(1);
    expect(page.rows[0]?.row.model).toBe('claude-3-5-sonnet-20241022');
    expect(page.num_rows_total).toBe(60_372);
  });

  it.each([
    ['out-of-range score', { score: 1.1 }],
    ['unknown category', { category: 'marketing' }],
    ['empty model', { model: '' }],
  ])('rejects %s', (_name, replacement) => {
    const payload = structuredClone(validPayload);
    Object.assign(payload.rows[0]!.row, replacement);

    expect(() => parseLiveBenchPage(JSON.stringify(payload))).toThrow();
  });
});

describe('LiveBench fetch boundary', () => {
  it('uses the fixed HTTPS host, manual redirects, and returns evidence metadata', async () => {
    const fetchImplementation = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify(validPayload), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );

    const result = await fetchLiveBenchPage(
      { offset: 0, length: 100 },
      fetchImplementation,
    );

    const [requestUrl, requestInit] = fetchImplementation.mock.calls[0]!;
    expect(new URL(String(requestUrl)).origin).toBe(LIVEBENCH_ROWS_ORIGIN);
    expect(requestInit).toMatchObject({ redirect: 'manual' });
    expect(result.contentSha256).toMatch(/^[a-f0-9]{64}$/);
    expect(result.byteLength).toBeGreaterThan(0);
    expect(result.page.rows).toHaveLength(1);
  });

  it('rejects redirects instead of following them', async () => {
    const fetchImplementation = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(null, { status: 302 }));

    await expect(
      fetchLiveBenchPage({ offset: 0, length: 100 }, fetchImplementation),
    ).rejects.toThrow('redirect');
  });

  it('rejects non-JSON responses', async () => {
    const fetchImplementation = vi.fn<typeof fetch>().mockResolvedValue(
      new Response('<html>untrusted</html>', {
        status: 200,
        headers: { 'content-type': 'text/html' },
      }),
    );

    await expect(
      fetchLiveBenchPage({ offset: 0, length: 100 }, fetchImplementation),
    ).rejects.toThrow('content type');
  });

  it('rejects dataset responses marked partial', async () => {
    const partialPayload = { ...validPayload, partial: true };
    const fetchImplementation = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify(partialPayload), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );

    await expect(
      fetchLiveBenchPage({ offset: 0, length: 100 }, fetchImplementation),
    ).rejects.toThrow('partial');
  });

  it('validates pagination before any network request', async () => {
    const fetchImplementation = vi.fn<typeof fetch>();

    await expect(
      fetchLiveBenchPage({ offset: -1, length: 101 }, fetchImplementation),
    ).rejects.toThrow();
    expect(fetchImplementation).not.toHaveBeenCalled();
  });
});

describe('LiveBench pagination plan', () => {
  it('covers every row exactly once and shortens the final page', () => {
    expect(planLiveBenchPages(201)).toEqual([
      { offset: 0, length: 100 },
      { offset: 100, length: 100 },
      { offset: 200, length: 1 },
    ]);
  });

  it('returns no requests for an empty dataset', () => {
    expect(planLiveBenchPages(0)).toEqual([]);
  });

  it.each([-1, 1.5, Number.NaN])(
    'rejects invalid total row count %s',
    (totalRows) => {
      expect(() => planLiveBenchPages(totalRows)).toThrow('total rows');
    },
  );
});
