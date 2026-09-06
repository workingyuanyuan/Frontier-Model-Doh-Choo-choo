import { lookup } from 'node:dns/promises';
import { request } from 'node:https';
import { BlockList, isIP, type LookupFunction } from 'node:net';
import type { IncomingMessage } from 'node:http';
import {
  AcquisitionBudget,
  AcquisitionLimitError,
} from './acquisition-policy.js';

// Deny non-public destinations, including IPv4-mapped IPv6 and transition ranges.
const nonPublic = new BlockList();
for (const [address, prefix] of [
  ['0.0.0.0', 8],
  ['10.0.0.0', 8],
  ['100.64.0.0', 10],
  ['127.0.0.0', 8],
  ['169.254.0.0', 16],
  ['172.16.0.0', 12],
  ['192.0.0.0', 24],
  ['192.0.2.0', 24],
  ['192.88.99.0', 24],
  ['192.168.0.0', 16],
  ['198.18.0.0', 15],
  ['198.51.100.0', 24],
  ['203.0.113.0', 24],
  ['224.0.0.0', 4],
  ['240.0.0.0', 4],
] as const)
  nonPublic.addSubnet(address, prefix, 'ipv4');
for (const [address, prefix] of [
  ['2001::', 23],
  ['2001:db8::', 32],
  ['2002::', 16],
  ['3fff::', 20],
] as const)
  nonPublic.addSubnet(address, prefix, 'ipv6');
const globalV6 = new BlockList();
globalV6.addSubnet('2000::', 3, 'ipv6');

export function isPublicAddress(address: string): boolean {
  const family = isIP(address);
  if (family === 4) return !nonPublic.check(address, 'ipv4');
  return (
    family === 6 &&
    globalV6.check(address, 'ipv6') &&
    !nonPublic.check(address, 'ipv6')
  );
}

export function publicHttpsUrl(input: string): URL {
  const url = new URL(input);
  if (
    url.protocol !== 'https:' ||
    url.username ||
    url.password ||
    (url.port !== '' && url.port !== '443')
  ) {
    throw new Error(
      'Acquisition requires HTTPS on port 443 without URL credentials',
    );
  }
  const host = url.hostname.replace(/^\[|\]$/gu, '');
  if (isIP(host) && !isPublicAddress(host)) {
    throw new Error('Acquisition destination is not public');
  }
  url.hash = '';
  return url;
}

type Address = { address: string; family: number };
export type ResolveAddresses = (hostname: string) => Promise<Address[]>;

/** Reject mixed public/private DNS answers. Connect using this exact validated IP. */
export async function publicDestination(
  url: URL,
  resolveAddresses: ResolveAddresses = (hostname) =>
    lookup(hostname, { all: true }),
): Promise<Address> {
  publicHttpsUrl(url.href);
  const hostname = url.hostname.replace(/^\[|\]$/gu, '');
  const answers = isIP(hostname)
    ? [{ address: hostname, family: isIP(hostname) }]
    : await resolveAddresses(hostname);
  if (
    answers.length === 0 ||
    answers.some(
      ({ address, family }) =>
        !isPublicAddress(address) || isIP(address) !== family,
    )
  ) {
    throw new Error('Acquisition DNS destination is not public');
  }
  return answers[0]!;
}

export interface AcquisitionResponse {
  url: string;
  status: number;
  ok: boolean;
  headers: Headers;
  bytes: Uint8Array;
}

/** Testable transport contract. Production transport pins DNS and verifies TLS. */
export type HttpsTransport = (
  url: URL,
  destination: Address,
  headers: Record<string, string>,
  signal: AbortSignal,
) => Promise<IncomingMessage>;

const pinnedHttps: HttpsTransport = (url, destination, headers, signal) =>
  new Promise((resolve, reject) => {
    const pinnedLookup: LookupFunction = (_hostname, options, callback) => {
      if (options.all) callback(null, [destination]);
      else callback(null, destination.address, destination.family);
    };
    const req = request(
      url,
      {
        method: 'GET',
        headers,
        signal,
        lookup: pinnedLookup,
        // Never reuse a socket whose destination was resolved for another request.
        agent: false,
      },
      resolve,
    );
    req.on('error', reject);
    req.end();
  });

async function abortable<T>(
  promise: Promise<T>,
  signal: AbortSignal,
): Promise<T> {
  signal.throwIfAborted();
  return new Promise((resolve, reject) => {
    const abort = () => reject(signal.reason);
    signal.addEventListener('abort', abort, { once: true });
    promise
      .then(resolve, reject)
      .finally(() => signal.removeEventListener('abort', abort));
  });
}

/** Reads at most the policy ceiling, including unknown/chunked body lengths. */
export async function readAcquisitionBody(
  response: IncomingMessage,
  budget: AcquisitionBudget,
  signal: AbortSignal,
): Promise<Uint8Array> {
  const chunks: Buffer[] = [];
  let size = 0;
  const abort = () => response.destroy(signal.reason as Error);
  signal.addEventListener('abort', abort, { once: true });
  try {
    signal.throwIfAborted();
    // Request identity encoding and fail closed if the server ignores it. This
    // avoids an independent HTTP decompression path outside archive budgets.
    const encoding = response.headers['content-encoding'];
    if (encoding && encoding !== 'identity')
      throw new Error('Unsupported response encoding');
    const length = response.headers['content-length'];
    if (
      length !== undefined &&
      (!/^\d+$/u.test(length) || Number(length) > budget.limits.responseBytes)
    ) {
      throw new AcquisitionLimitError(
        'Acquisition response byte limit exceeded',
      );
    }
    for await (const chunk of response) {
      signal.throwIfAborted();
      const bytes: Buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      size += bytes.length;
      if (size > budget.limits.responseBytes) {
        throw new AcquisitionLimitError(
          'Acquisition response byte limit exceeded',
        );
      }
      budget.consume(bytes.length);
      chunks.push(bytes);
    }
    return Buffer.concat(chunks, size);
  } finally {
    signal.removeEventListener('abort', abort);
    response.destroy();
  }
}

/** All source requests go through one destination policy and one run budget. */
export class AcquisitionClient {
  constructor(
    readonly budget = new AcquisitionBudget(),
    private readonly resolveAddresses: ResolveAddresses = (hostname) =>
      lookup(hostname, { all: true }),
    private readonly transport: HttpsTransport = pinnedHttps,
  ) {}

  async get(
    input: string,
    options: { headers?: Record<string, string> } = {},
  ): Promise<AcquisitionResponse> {
    let url = publicHttpsUrl(input);
    const origin = url.origin;
    const headers = Object.fromEntries(
      Object.entries(options.headers ?? {}).map(([key, value]) => [
        key.toLowerCase(),
        value,
      ]),
    );
    headers['accept-encoding'] = 'identity';
    if (
      Object.keys(headers).some((key) =>
        ['host', 'connection', 'transfer-encoding', 'content-length'].includes(
          key.toLowerCase(),
        ),
      )
    ) {
      throw new Error('Unsupported acquisition request header');
    }
    const sensitive = Object.keys(options.headers ?? {}).some(
      (key) => key.toLowerCase() !== 'accept',
    );
    const controller = new AbortController();
    const timer = setTimeout(
      () =>
        controller.abort(
          new AcquisitionLimitError('Acquisition request deadline exceeded'),
        ),
      Math.min(
        this.budget.limits.requestTimeoutMs,
        this.budget.remainingTime(),
      ),
    );
    const { signal } = controller;
    try {
      for (let redirects = 0; ; redirects++) {
        this.budget.request();
        const destination = await abortable(
          publicDestination(url, this.resolveAddresses),
          signal,
        );
        signal.throwIfAborted();
        const response = await this.transport(
          url,
          destination,
          headers,
          signal,
        );
        const status = response.statusCode ?? 0;
        if ([301, 302, 303, 307, 308].includes(status)) {
          response.destroy();
          if (
            redirects >= this.budget.limits.redirects ||
            !response.headers.location
          ) {
            throw new AcquisitionLimitError(
              'Acquisition redirect limit exceeded or missing Location',
            );
          }
          url = publicHttpsUrl(new URL(response.headers.location, url).href);
          if (sensitive && url.origin !== origin)
            throw new Error('Credential-bearing redirect changed origin');
          continue;
        }
        const responseHeaders = new Headers();
        for (const [name, value] of Object.entries(response.headers)) {
          if (value !== undefined)
            responseHeaders.set(
              name,
              Array.isArray(value) ? value.join(', ') : value,
            );
        }
        if (status < 200 || status >= 300) {
          response.destroy();
          return {
            url: url.href,
            status,
            ok: false,
            headers: responseHeaders,
            bytes: new Uint8Array(),
          };
        }
        const bytes = await readAcquisitionBody(response, this.budget, signal);
        return {
          url: url.href,
          status,
          ok: true,
          headers: responseHeaders,
          bytes,
        };
      }
    } finally {
      clearTimeout(timer);
    }
  }
}

// A refresh command is a single Node process; every helper shares its budget.
export const acquisitionClient = new AcquisitionClient();
