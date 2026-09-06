import { PassThrough } from 'node:stream';
import type { IncomingMessage } from 'node:http';
import { describe, expect, it, vi } from 'vitest';
import {
  AcquisitionBudget,
  mapAcquisitionItems,
} from './acquisition-policy.js';
import {
  AcquisitionClient,
  isPublicAddress,
  publicDestination,
  publicHttpsUrl,
  readAcquisitionBody,
  type HttpsTransport,
} from './safe-network.js';

function response(
  body = '',
  status = 200,
  headers: Record<string, string> = {},
): IncomingMessage {
  const stream = new PassThrough();
  Object.assign(stream, { statusCode: status, headers });
  stream.end(body);
  return stream as unknown as IncomingMessage;
}

const dns = async () => [{ address: '93.184.216.34', family: 4 }];

describe('public HTTPS destination policy', () => {
  it.each([
    '127.0.0.1',
    '10.0.0.1',
    '172.31.2.3',
    '192.168.1.1',
    '169.254.169.254',
    '100.64.0.1',
    '0.0.0.0',
    '198.18.0.1',
    '224.0.0.1',
    '255.255.255.255',
    '::1',
    '::ffff:127.0.0.1',
    '::ffff:8.8.8.8',
    'fc00::1',
    'fe80::1',
    '64:ff9b::a00:1',
    '2002:7f00:1::',
    '2001:db8::1',
    '2001::1',
    '3fff::1',
  ])('rejects non-public or ambiguous address %s', (address) => {
    expect(isPublicAddress(address)).toBe(false);
  });

  it.each(['8.8.8.8', '93.184.216.34', '2606:4700:4700::1111'])(
    'accepts public address %s',
    (address) => {
      expect(isPublicAddress(address)).toBe(true);
    },
  );

  it.each([
    'http://example.com/x',
    'https://user:secret@example.com',
    'https://example.com:444/x',
    'https://2130706433/x',
    'https://0x7f000001/x',
    'https://[::ffff:7f00:1]/x',
  ])('rejects URL %s', (url) => {
    expect(() => publicHttpsUrl(url)).toThrow();
  });

  it('rejects any private answer before a connection, including mixed DNS', async () => {
    const transport = vi.fn<HttpsTransport>();
    const client = new AcquisitionClient(
      new AcquisitionBudget(),
      async () => [
        { address: '93.184.216.34', family: 4 },
        { address: '127.0.0.1', family: 4 },
      ],
      transport,
    );
    await expect(client.get('https://source.example/data')).rejects.toThrow(
      'not public',
    );
    expect(transport).not.toHaveBeenCalled();
  });

  it('passes the validated address to transport without a second DNS lookup', async () => {
    const resolve = vi
      .fn()
      .mockResolvedValueOnce(await dns())
      .mockResolvedValue([{ address: '127.0.0.1', family: 4 }]);
    const transport = vi
      .fn<HttpsTransport>()
      .mockImplementation(async (_url, destination) => {
        expect(destination).toEqual({ address: '93.184.216.34', family: 4 });
        return response('ok');
      });
    const client = new AcquisitionClient(
      new AcquisitionBudget(),
      resolve,
      transport,
    );
    expect(
      new TextDecoder().decode(
        (await client.get('https://source.example')).bytes,
      ),
    ).toBe('ok');
    expect(resolve).toHaveBeenCalledTimes(1);
  });

  it('does not resolve literal public IPs', async () => {
    const resolve = vi.fn();
    expect(
      await publicDestination(new URL('https://8.8.8.8'), resolve),
    ).toEqual({ address: '8.8.8.8', family: 4 });
    expect(resolve).not.toHaveBeenCalled();
  });
});

describe('redirect and deadline enforcement', () => {
  it('rejects a public redirect to loopback before the second request', async () => {
    const first = response('', 302, { location: 'https://127.0.0.1/private' });
    const transport = vi.fn<HttpsTransport>().mockResolvedValue(first);
    const client = new AcquisitionClient(
      new AcquisitionBudget(),
      dns,
      transport,
    );
    await expect(client.get('https://source.example')).rejects.toThrow(
      'not public',
    );
    expect(transport).toHaveBeenCalledTimes(1);
    expect(first.destroyed).toBe(true);
  });

  it('checks redirect DNS again and rejects rebinding to private space', async () => {
    const resolve = vi
      .fn()
      .mockResolvedValueOnce(await dns())
      .mockResolvedValueOnce([{ address: '10.0.0.1', family: 4 }]);
    const transport = vi
      .fn<HttpsTransport>()
      .mockResolvedValue(response('', 302, { location: '/next' }));
    await expect(
      new AcquisitionClient(new AcquisitionBudget(), resolve, transport).get(
        'https://source.example',
      ),
    ).rejects.toThrow('not public');
    expect(transport).toHaveBeenCalledTimes(1);
  });

  it('permits public CDN redirects while refusing cross-origin credential forwarding', async () => {
    const transport = vi
      .fn<HttpsTransport>()
      .mockResolvedValueOnce(
        response('', 302, { location: 'https://cdn.example/data' }),
      )
      .mockResolvedValueOnce(response('data'));
    const client = new AcquisitionClient(
      new AcquisitionBudget(),
      dns,
      transport,
    );
    expect((await client.get('https://source.example')).url).toBe(
      'https://cdn.example/data',
    );
    const credentialTransport = vi
      .fn<HttpsTransport>()
      .mockResolvedValue(
        response('', 302, { location: 'https://cdn.example/data' }),
      );
    await expect(
      new AcquisitionClient(
        new AcquisitionBudget(),
        dns,
        credentialTransport,
      ).get('https://source.example', {
        headers: { 'x-api-key': 'test-only' },
      }),
    ).rejects.toThrow('changed origin');
    expect(credentialTransport).toHaveBeenCalledTimes(1);
  });

  it('bounds redirect loops', async () => {
    const transport = vi
      .fn<HttpsTransport>()
      .mockImplementation(async () => response('', 302, { location: '/loop' }));
    await expect(
      new AcquisitionClient(
        new AcquisitionBudget({ redirects: 2 }),
        dns,
        transport,
      ).get('https://source.example'),
    ).rejects.toThrow('redirect limit');
    expect(transport).toHaveBeenCalledTimes(3);
  });

  it('includes DNS time in the deadline', async () => {
    const client = new AcquisitionClient(
      new AcquisitionBudget({ requestTimeoutMs: 10 }),
      () => new Promise(() => {}),
    );
    await expect(client.get('https://source.example')).rejects.toThrow(
      'deadline',
    );
  });

  it('aborts and destroys a slow response body', async () => {
    const stream = new PassThrough();
    Object.assign(stream, { statusCode: 200, headers: {} });
    const client = new AcquisitionClient(
      new AcquisitionBudget({ requestTimeoutMs: 20 }),
      dns,
      async () => stream as unknown as IncomingMessage,
    );
    await expect(client.get('https://source.example')).rejects.toThrow(
      'deadline',
    );
    expect(stream.destroyed).toBe(true);
  });
});

describe('response and run budgets', () => {
  it.each([{}, { 'content-length': '100' }])(
    'rejects oversized bodies with headers %j',
    async (headers) => {
      const stream = response('123456', 200, headers);
      await expect(
        readAcquisitionBody(
          stream,
          new AcquisitionBudget({ responseBytes: 5 }),
          new AbortController().signal,
        ),
      ).rejects.toThrow('byte limit');
      expect(stream.destroyed).toBe(true);
    },
  );

  it('accepts exactly the limit and rejects encoded bodies outside this decoder', async () => {
    expect(
      (
        await readAcquisitionBody(
          response('12345'),
          new AcquisitionBudget({ responseBytes: 5 }),
          new AbortController().signal,
        )
      ).length,
    ).toBe(5);
    await expect(
      readAcquisitionBody(
        response('data', 200, { 'content-encoding': 'gzip' }),
        new AcquisitionBudget(),
        new AbortController().signal,
      ),
    ).rejects.toThrow('encoding');
  });

  it('shares bytes across individually small concurrent responses', async () => {
    const client = new AcquisitionClient(
      new AcquisitionBudget({ totalBytes: 5 }),
      dns,
      async () => response('abc'),
    );
    const results = await Promise.allSettled([
      client.get('https://a.example'),
      client.get('https://b.example'),
    ]);
    expect(results.filter(({ status }) => status === 'rejected')).toHaveLength(
      1,
    );
  });

  it('enforces request counts before transport', async () => {
    const transport = vi
      .fn<HttpsTransport>()
      .mockImplementation(async () => response());
    const client = new AcquisitionClient(
      new AcquisitionBudget({ requests: 1 }),
      dns,
      transport,
    );
    await client.get('https://a.example');
    await expect(client.get('https://b.example')).rejects.toThrow(
      'request budget',
    );
    expect(transport).toHaveBeenCalledTimes(1);
  });

  it('checks discovery count before any callback and bounds concurrency', async () => {
    const callback = vi.fn(async (n: number) => n);
    await expect(
      mapAcquisitionItems(
        [1, 2, 3],
        new AcquisitionBudget({ discoveredItems: 2 }),
        callback,
      ),
    ).rejects.toThrow('discovered-item');
    expect(callback).not.toHaveBeenCalled();
    let active = 0;
    let peak = 0;
    const results = await mapAcquisitionItems(
      [1, 2, 3, 4],
      new AcquisitionBudget({ concurrency: 2 }),
      async (n) => {
        peak = Math.max(peak, ++active);
        await new Promise((resolve) => setTimeout(resolve, 1));
        active--;
        return n;
      },
    );
    expect(results).toEqual([1, 2, 3, 4]);
    expect(peak).toBe(2);
  });
});
