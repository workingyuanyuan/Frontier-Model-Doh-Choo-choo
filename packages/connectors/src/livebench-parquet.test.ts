import { describe, expect, it, vi } from 'vitest';

import {
  LIVEBENCH_PARQUET_PATH,
  fetchLiveBenchParquet,
  isApprovedHuggingFaceArtifactContentType,
  isApprovedHuggingFaceCdnUrl,
  parseLiveBenchParquet,
} from './livebench-parquet.js';

const revision = '9704e5da7bfbefe75ac1482a13de827127295993';
const parquetBody = new TextEncoder().encode('PAR1fixturePAR1');
const cdnUrl =
  'https://us.aws.cdn.hf.co/xet-bridge-us/repository/object?Policy=signed';

function resolverResponse(overrides: Record<string, string> = {}) {
  return new Response(null, {
    status: 302,
    headers: {
      location: cdnUrl,
      'x-repo-commit': revision,
      'x-linked-size': String(parquetBody.byteLength),
      'x-linked-etag': 'fixture-etag',
      ...overrides,
    },
  });
}

describe('LiveBench revision-pinned Parquet fetch', () => {
  it('allows the exact Hugging Face Xet bridge host without allowing suffix tricks', () => {
    expect(
      isApprovedHuggingFaceCdnUrl(
        new URL('https://cas-bridge.xethub.hf.co/object'),
      ),
    ).toBe(true);
    expect(
      isApprovedHuggingFaceCdnUrl(
        new URL('https://cas-bridge.xethub.hf.co.attacker.example/object'),
      ),
    ).toBe(false);
  });

  it('accepts a missing content type only from the exact Xet bridge', () => {
    expect(
      isApprovedHuggingFaceArtifactContentType(
        new URL('https://cas-bridge.xethub.hf.co/object'),
        '',
      ),
    ).toBe(true);
    expect(
      isApprovedHuggingFaceArtifactContentType(
        new URL('https://us.aws.cdn.hf.co/object'),
        '',
      ),
    ).toBe(false);
    expect(
      isApprovedHuggingFaceArtifactContentType(
        new URL('http://cas-bridge.xethub.hf.co/object'),
        '',
      ),
    ).toBe(false);
    expect(
      isApprovedHuggingFaceArtifactContentType(
        new URL('https://cas-bridge.xethub.hf.co/object'),
        'text/html',
      ),
    ).toBe(false);
  });

  it('manually validates the Hub resolver and one approved CDN redirect', async () => {
    const fetchImplementation = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(resolverResponse())
      .mockResolvedValueOnce(
        new Response(parquetBody, {
          status: 200,
          headers: {
            'content-type': 'application/octet-stream',
            'content-length': String(parquetBody.byteLength),
          },
        }),
      );

    const fetched = await fetchLiveBenchParquet(revision, fetchImplementation);

    expect(fetchImplementation).toHaveBeenCalledTimes(2);
    const [resolverUrl, resolverInit] = fetchImplementation.mock.calls[0]!;
    expect(String(resolverUrl)).toContain(`/resolve/${revision}/`);
    expect(String(resolverUrl)).toContain(LIVEBENCH_PARQUET_PATH);
    expect(resolverInit).toMatchObject({ redirect: 'manual' });
    const [downloadUrl, downloadInit] = fetchImplementation.mock.calls[1]!;
    expect(new URL(String(downloadUrl)).hostname).toBe('us.aws.cdn.hf.co');
    expect(downloadInit).toMatchObject({ redirect: 'manual' });
    expect(fetched).toMatchObject({
      revision,
      byteLength: parquetBody.byteLength,
      linkedEtag: 'fixture-etag',
      downloadOrigin: 'https://us.aws.cdn.hf.co',
    });
    expect(fetched.contentSha256).toMatch(/^[a-f0-9]{64}$/);
  });

  it('rejects a resolver response for a different revision', async () => {
    const fetchImplementation = vi
      .fn<typeof fetch>()
      .mockResolvedValue(resolverResponse({ 'x-repo-commit': 'a'.repeat(40) }));

    await expect(
      fetchLiveBenchParquet(revision, fetchImplementation),
    ).rejects.toThrow('revision');
    expect(fetchImplementation).toHaveBeenCalledTimes(1);
  });

  it('rejects a redirect outside the approved Hugging Face CDN', async () => {
    const fetchImplementation = vi.fn<typeof fetch>().mockResolvedValue(
      resolverResponse({
        location: 'https://attacker.example/livebench.parquet',
      }),
    );

    await expect(
      fetchLiveBenchParquet(revision, fetchImplementation),
    ).rejects.toThrow('CDN');
    expect(fetchImplementation).toHaveBeenCalledTimes(1);
  });
});

describe('LiveBench Parquet parser', () => {
  it('normalizes safe bigint integers and validates every row', async () => {
    const reader = vi.fn().mockResolvedValue([
      {
        question_id:
          '02af5e41681a8e07cb79f87ba76a79f75210e2887e0dc3006f913a952d25dd00',
        task: 'typos',
        model: 'amazon.nova-lite-v1:0',
        score: 0,
        turn: 1n,
        tstamp: 1_738_872_686.287_573_8,
        category: 'language',
      },
    ]);

    const rows = await parseLiveBenchParquet(parquetBody, reader);

    expect(rows).toHaveLength(1);
    expect(rows[0]?.turn).toBe(1);
  });

  it('rejects unsafe bigint values from the Parquet reader', async () => {
    const reader = vi.fn().mockResolvedValue([
      {
        question_id:
          '02af5e41681a8e07cb79f87ba76a79f75210e2887e0dc3006f913a952d25dd00',
        task: 'typos',
        model: 'amazon.nova-lite-v1:0',
        score: 0,
        turn: BigInt(Number.MAX_SAFE_INTEGER) + 1n,
        tstamp: 1_738_872_686.287_573_8,
        category: 'language',
      },
    ]);

    await expect(parseLiveBenchParquet(parquetBody, reader)).rejects.toThrow();
  });
});
