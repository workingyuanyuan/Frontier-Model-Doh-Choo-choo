import { createHash } from 'node:crypto';

import { parquetReadObjects } from 'hyparquet';
import * as z from 'zod';

import {
  LIVEBENCH_DATASET_ID,
  LIVEBENCH_HUB_ORIGIN,
  LiveBenchJudgmentSchema,
  type LiveBenchJudgment,
} from './livebench.js';

export const LIVEBENCH_PARQUET_PATH = 'data/leaderboard-00000-of-00001.parquet';
export const LIVEBENCH_MAX_PARQUET_BYTES = 2 * 1024 * 1024;
export const LIVEBENCH_MAX_PARQUET_ROWS = 100_000;

const RevisionSchema = z.string().regex(/^[a-f0-9]{40}$/);

export type LiveBenchParquetReader = (
  file: ArrayBuffer,
) => Promise<Record<string, unknown>[]>;

export interface FetchedLiveBenchParquet {
  readonly revision: string;
  readonly requestUrl: string;
  readonly fetchedAt: string;
  readonly responseStatus: number;
  readonly contentType: string;
  readonly contentSha256: string;
  readonly byteLength: number;
  readonly linkedEtag: string;
  readonly downloadOrigin: string;
  readonly body: Uint8Array;
}

function createLiveBenchParquetUrl(revision: string): URL {
  const url = new URL(
    `/datasets/${LIVEBENCH_DATASET_ID}/resolve/${revision}/${LIVEBENCH_PARQUET_PATH}`,
    LIVEBENCH_HUB_ORIGIN,
  );
  url.searchParams.set('download', 'true');
  return url;
}

function isApprovedHuggingFaceCdn(url: URL): boolean {
  return (
    url.protocol === 'https:' &&
    (url.hostname === 'cdn-lfs.hf.co' ||
      /^[a-z0-9-]+\.aws\.cdn\.hf\.co$/u.test(url.hostname))
  );
}

export async function fetchLiveBenchParquet(
  inputRevision: string,
  fetchImplementation: typeof fetch = fetch,
): Promise<FetchedLiveBenchParquet> {
  const revision = RevisionSchema.parse(inputRevision);
  const url = createLiveBenchParquetUrl(revision);
  if (url.protocol !== 'https:' || url.origin !== LIVEBENCH_HUB_ORIGIN) {
    throw new Error(
      'LiveBench Parquet request URL is outside the approved HTTPS origin',
    );
  }

  const resolverResponse = await fetchImplementation(url, {
    method: 'GET',
    redirect: 'manual',
    headers: {
      accept: 'application/octet-stream',
      'user-agent': 'llm-bench-radar/0.0.0',
    },
    signal: AbortSignal.timeout(30_000),
  });
  if (resolverResponse.status !== 302) {
    throw new Error(
      `LiveBench resolver returned unexpected status ${resolverResponse.status}`,
    );
  }

  const responseRevision = resolverResponse.headers.get('x-repo-commit');
  if (responseRevision !== revision) {
    throw new Error('LiveBench resolver returned an unexpected revision');
  }

  const linkedSize = Number(resolverResponse.headers.get('x-linked-size'));
  if (
    !Number.isSafeInteger(linkedSize) ||
    linkedSize < 1 ||
    linkedSize > LIVEBENCH_MAX_PARQUET_BYTES
  ) {
    throw new Error('LiveBench Parquet linked size is invalid');
  }
  const linkedEtag = resolverResponse.headers.get('x-linked-etag') ?? '';
  if (linkedEtag.length < 1 || linkedEtag.length > 200) {
    throw new Error('LiveBench Parquet linked ETag is invalid');
  }

  const location = resolverResponse.headers.get('location') ?? '';
  let downloadUrl: URL;
  try {
    downloadUrl = new URL(location);
  } catch (error) {
    throw new Error('LiveBench resolver returned an invalid CDN URL', {
      cause: error,
    });
  }
  if (!isApprovedHuggingFaceCdn(downloadUrl)) {
    throw new Error('LiveBench resolver returned an unapproved CDN URL');
  }

  const response = await fetchImplementation(downloadUrl, {
    method: 'GET',
    redirect: 'manual',
    headers: {
      accept: 'application/octet-stream',
      'user-agent': 'llm-bench-radar/0.0.0',
    },
    signal: AbortSignal.timeout(60_000),
  });
  if (!response.ok || (response.status >= 300 && response.status < 400)) {
    throw new Error(
      `LiveBench Parquet download failed with status ${response.status}`,
    );
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (
    !/^(?:application|binary)\/(?:octet-stream|vnd\.apache\.parquet)(?:\s*;|$)/iu.test(
      contentType,
    )
  ) {
    throw new Error(
      `Unexpected LiveBench Parquet content type: ${contentType || 'missing'}`,
    );
  }
  const declaredLength = Number(response.headers.get('content-length'));
  if (
    Number.isFinite(declaredLength) &&
    declaredLength > 0 &&
    declaredLength !== linkedSize
  ) {
    throw new Error('LiveBench Parquet content length does not match metadata');
  }

  const body = new Uint8Array(await response.arrayBuffer());
  if (body.byteLength !== linkedSize) {
    throw new Error('LiveBench Parquet body length does not match metadata');
  }

  return {
    revision,
    requestUrl: url.href,
    fetchedAt: new Date().toISOString(),
    responseStatus: response.status,
    contentType,
    contentSha256: createHash('sha256').update(body).digest('hex'),
    byteLength: body.byteLength,
    linkedEtag,
    downloadOrigin: downloadUrl.origin,
    body,
  };
}

function hasParquetMagic(body: Uint8Array): boolean {
  if (body.byteLength < 8) {
    return false;
  }
  const decoder = new TextDecoder('ascii');
  return (
    decoder.decode(body.subarray(0, 4)) === 'PAR1' &&
    decoder.decode(body.subarray(body.byteLength - 4)) === 'PAR1'
  );
}

const defaultParquetReader: LiveBenchParquetReader = async (file) =>
  parquetReadObjects({ file });

export async function parseLiveBenchParquet(
  body: Uint8Array,
  reader: LiveBenchParquetReader = defaultParquetReader,
): Promise<LiveBenchJudgment[]> {
  if (body.byteLength > LIVEBENCH_MAX_PARQUET_BYTES || !hasParquetMagic(body)) {
    throw new Error('LiveBench Parquet file boundary validation failed');
  }

  const file = body.buffer.slice(
    body.byteOffset,
    body.byteOffset + body.byteLength,
  ) as ArrayBuffer;
  const decoded = await reader(file);
  if (decoded.length > LIVEBENCH_MAX_PARQUET_ROWS) {
    throw new Error('LiveBench Parquet file exceeds the maximum row count');
  }

  return decoded.map((row) => {
    const rawTurn = row.turn;
    const turn =
      typeof rawTurn === 'bigint'
        ? Number.isSafeInteger(Number(rawTurn))
          ? Number(rawTurn)
          : rawTurn
        : rawTurn;
    return LiveBenchJudgmentSchema.parse({ ...row, turn });
  });
}
