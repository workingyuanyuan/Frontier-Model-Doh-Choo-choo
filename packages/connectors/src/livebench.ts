import { createHash } from 'node:crypto';

import * as z from 'zod';

export const LIVEBENCH_ROWS_ORIGIN = 'https://datasets-server.huggingface.co';
export const LIVEBENCH_HUB_ORIGIN = 'https://huggingface.co';
export const LIVEBENCH_DATASET_ID = 'livebench/model_judgment';
export const LIVEBENCH_MAX_PAGE_LENGTH = 100;
export const LIVEBENCH_MAX_RESPONSE_BYTES = 5 * 1024 * 1024;
export const LIVEBENCH_MAX_HUB_RESPONSE_BYTES = 1024 * 1024;

const LiveBenchDatasetRevisionSchema = z.object({
  id: z.literal(LIVEBENCH_DATASET_ID),
  sha: z.string().regex(/^[a-f0-9]{40}$/),
  lastModified: z.iso.datetime(),
});

export const LiveBenchCategorySchema = z.enum([
  'reasoning',
  'math',
  'coding',
  'language',
  'data_analysis',
  'instruction_following',
]);

export const LiveBenchJudgmentSchema = z.strictObject({
  question_id: z.string().regex(/^[a-f0-9]{64}$/),
  task: z.string().trim().min(1).max(120),
  model: z.string().trim().min(1).max(200),
  score: z.number().finite().min(0).max(1),
  turn: z.int().min(1),
  tstamp: z.number().finite().positive(),
  category: LiveBenchCategorySchema,
});

const LiveBenchRowSchema = z.strictObject({
  row_idx: z.int().nonnegative(),
  row: LiveBenchJudgmentSchema,
  truncated_cells: z.array(z.string()),
});

export const LiveBenchPageSchema = z.strictObject({
  features: z.array(z.unknown()),
  rows: z.array(LiveBenchRowSchema).max(LIVEBENCH_MAX_PAGE_LENGTH),
  num_rows_total: z.int().nonnegative(),
  num_rows_per_page: z.int().positive().max(LIVEBENCH_MAX_PAGE_LENGTH),
  partial: z.boolean(),
});

const LiveBenchPageRequestSchema = z.strictObject({
  offset: z.int().nonnegative(),
  length: z.int().min(1).max(LIVEBENCH_MAX_PAGE_LENGTH),
});

export type LiveBenchJudgment = z.infer<typeof LiveBenchJudgmentSchema>;
export type LiveBenchPage = z.infer<typeof LiveBenchPageSchema>;
export type LiveBenchPageRequest = z.infer<typeof LiveBenchPageRequestSchema>;

export interface FetchedLiveBenchPage {
  readonly requestUrl: string;
  readonly fetchedAt: string;
  readonly responseStatus: number;
  readonly contentType: string;
  readonly contentSha256: string;
  readonly byteLength: number;
  readonly body: Uint8Array;
  readonly page: LiveBenchPage;
}

export interface FetchedLiveBenchDatasetRevision {
  readonly datasetId: typeof LIVEBENCH_DATASET_ID;
  readonly revision: string;
  readonly lastModified: string;
  readonly requestUrl: string;
  readonly fetchedAt: string;
}

export function planLiveBenchPages(
  totalRows: number,
  pageLength = LIVEBENCH_MAX_PAGE_LENGTH,
): LiveBenchPageRequest[] {
  if (!Number.isInteger(totalRows) || totalRows < 0) {
    throw new Error('LiveBench total rows must be a non-negative integer');
  }
  if (
    !Number.isInteger(pageLength) ||
    pageLength < 1 ||
    pageLength > LIVEBENCH_MAX_PAGE_LENGTH
  ) {
    throw new Error(
      `LiveBench page length must be between 1 and ${LIVEBENCH_MAX_PAGE_LENGTH}`,
    );
  }

  const requests: LiveBenchPageRequest[] = [];
  for (let offset = 0; offset < totalRows; offset += pageLength) {
    requests.push({
      offset,
      length: Math.min(pageLength, totalRows - offset),
    });
  }
  return requests;
}

export function parseLiveBenchPage(input: string): LiveBenchPage {
  if (Buffer.byteLength(input, 'utf8') > LIVEBENCH_MAX_RESPONSE_BYTES) {
    throw new Error('LiveBench response exceeds the maximum byte length');
  }

  let decoded: unknown;
  try {
    decoded = JSON.parse(input);
  } catch (error) {
    throw new Error('LiveBench response is not valid JSON', { cause: error });
  }

  return LiveBenchPageSchema.parse(decoded);
}

function createLiveBenchRowsUrl(request: LiveBenchPageRequest): URL {
  const url = new URL('/rows', LIVEBENCH_ROWS_ORIGIN);
  url.searchParams.set('dataset', LIVEBENCH_DATASET_ID);
  url.searchParams.set('config', 'default');
  url.searchParams.set('split', 'leaderboard');
  url.searchParams.set('offset', String(request.offset));
  url.searchParams.set('length', String(request.length));
  return url;
}

function createLiveBenchDatasetRevisionUrl(): URL {
  return new URL(`/api/datasets/${LIVEBENCH_DATASET_ID}`, LIVEBENCH_HUB_ORIGIN);
}

export async function fetchLiveBenchDatasetRevision(
  fetchImplementation: typeof fetch = fetch,
): Promise<FetchedLiveBenchDatasetRevision> {
  const url = createLiveBenchDatasetRevisionUrl();

  if (url.protocol !== 'https:' || url.origin !== LIVEBENCH_HUB_ORIGIN) {
    throw new Error(
      'LiveBench Hub request URL is outside the approved HTTPS origin',
    );
  }

  const response = await fetchImplementation(url, {
    method: 'GET',
    redirect: 'manual',
    headers: {
      accept: 'application/json',
      'user-agent': 'llm-bench-radar/0.0.0',
    },
    signal: AbortSignal.timeout(30_000),
  });

  if (response.status >= 300 && response.status < 400) {
    throw new Error(
      `LiveBench Hub redirect rejected with status ${response.status}`,
    );
  }
  if (!response.ok) {
    throw new Error(
      `LiveBench Hub request failed with status ${response.status}`,
    );
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (!/^application\/json(?:\s*;|$)/i.test(contentType)) {
    throw new Error(
      `Unexpected LiveBench Hub content type: ${contentType || 'missing'}`,
    );
  }

  const declaredLength = Number(response.headers.get('content-length'));
  if (
    Number.isFinite(declaredLength) &&
    declaredLength > LIVEBENCH_MAX_HUB_RESPONSE_BYTES
  ) {
    throw new Error('LiveBench Hub response exceeds the maximum byte length');
  }

  const body = new Uint8Array(await response.arrayBuffer());
  if (body.byteLength > LIVEBENCH_MAX_HUB_RESPONSE_BYTES) {
    throw new Error('LiveBench Hub response exceeds the maximum byte length');
  }

  let text: string;
  try {
    text = new TextDecoder('utf-8', { fatal: true }).decode(body);
  } catch (error) {
    throw new Error('LiveBench Hub response is not valid UTF-8', {
      cause: error,
    });
  }

  let decoded: unknown;
  try {
    decoded = JSON.parse(text);
  } catch (error) {
    throw new Error('LiveBench Hub response is not valid JSON', {
      cause: error,
    });
  }

  const revision = LiveBenchDatasetRevisionSchema.parse(decoded);
  return {
    datasetId: revision.id,
    revision: revision.sha,
    lastModified: revision.lastModified,
    requestUrl: url.href,
    fetchedAt: new Date().toISOString(),
  };
}

export async function fetchLiveBenchPage(
  input: LiveBenchPageRequest,
  fetchImplementation: typeof fetch = fetch,
): Promise<FetchedLiveBenchPage> {
  const request = LiveBenchPageRequestSchema.parse(input);
  const url = createLiveBenchRowsUrl(request);

  if (url.protocol !== 'https:' || url.origin !== LIVEBENCH_ROWS_ORIGIN) {
    throw new Error(
      'LiveBench request URL is outside the approved HTTPS origin',
    );
  }

  const response = await fetchImplementation(url, {
    method: 'GET',
    redirect: 'manual',
    headers: {
      accept: 'application/json',
      'user-agent': 'llm-bench-radar/0.0.0',
    },
    signal: AbortSignal.timeout(30_000),
  });

  if (response.status >= 300 && response.status < 400) {
    throw new Error(
      `LiveBench redirect rejected with status ${response.status}`,
    );
  }

  if (!response.ok) {
    throw new Error(`LiveBench request failed with status ${response.status}`);
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (!/^application\/json(?:\s*;|$)/i.test(contentType)) {
    throw new Error(
      `Unexpected LiveBench content type: ${contentType || 'missing'}`,
    );
  }

  const declaredLength = Number(response.headers.get('content-length'));
  if (
    Number.isFinite(declaredLength) &&
    declaredLength > LIVEBENCH_MAX_RESPONSE_BYTES
  ) {
    throw new Error('LiveBench response exceeds the maximum byte length');
  }

  const body = new Uint8Array(await response.arrayBuffer());
  if (body.byteLength > LIVEBENCH_MAX_RESPONSE_BYTES) {
    throw new Error('LiveBench response exceeds the maximum byte length');
  }

  let text: string;
  try {
    text = new TextDecoder('utf-8', { fatal: true }).decode(body);
  } catch (error) {
    throw new Error('LiveBench response is not valid UTF-8', { cause: error });
  }

  const page = parseLiveBenchPage(text);
  if (page.partial) {
    throw new Error('LiveBench returned a partial dataset response');
  }

  page.rows.forEach(({ row_idx: rowIndex }, index) => {
    if (rowIndex !== request.offset + index) {
      throw new Error('LiveBench returned an unexpected row index sequence');
    }
  });

  return {
    requestUrl: url.href,
    fetchedAt: new Date().toISOString(),
    responseStatus: response.status,
    contentType,
    contentSha256: createHash('sha256').update(body).digest('hex'),
    byteLength: body.byteLength,
    body,
    page,
  };
}
