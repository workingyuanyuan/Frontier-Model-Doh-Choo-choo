import {
  asyncBufferFromUrl,
  parquetReadObjects,
  type AsyncBuffer,
} from 'hyparquet';
import * as z from 'zod';

import { isApprovedHuggingFaceCdnUrl } from './livebench-parquet.js';
import {
  LIVEBENCH_MAX_QUESTION_ROWS,
  LIVEBENCH_PUBLIC_RELEASE,
  parseLiveBenchQuestionRows,
  selectLiveBenchQuestionInventory,
  type LiveBenchQuestionCategory,
  type LiveBenchQuestionInventoryObservation,
  type LiveBenchQuestionSourceRow,
} from './livebench-question-inventory.js';
import { LIVEBENCH_HUB_ORIGIN, LiveBenchCategorySchema } from './livebench.js';

export const LIVEBENCH_QUESTION_ARTIFACT_PATH =
  'data/test-00000-of-00001.parquet';
export const LIVEBENCH_QUESTION_INVENTORY_COLUMNS = [
  'question_id',
  'category',
  'task',
  'turns',
  'livebench_release_date',
  'livebench_removal_date',
] as const;
export const LIVEBENCH_PUBLIC_RELEASES = [
  '2024-06-24',
  '2024-07-26',
  '2024-08-31',
  LIVEBENCH_PUBLIC_RELEASE,
] as const;

export interface LiveBenchQuestionDatasetPin {
  readonly category: LiveBenchQuestionCategory;
  readonly datasetId: `livebench/${string}`;
  readonly revision: string;
  readonly lastModified: string;
  readonly artifactPath: typeof LIVEBENCH_QUESTION_ARTIFACT_PATH;
  readonly artifactByteLength: number;
  readonly linkedEtag: string;
}

export const LIVEBENCH_QUESTION_DATASET_PINS = [
  {
    category: 'reasoning',
    datasetId: 'livebench/reasoning',
    revision: '6fc6498a5dfba553f69f4413feabade1f1a2d384',
    lastModified: '2025-04-07T20:34:13.000Z',
    artifactPath: LIVEBENCH_QUESTION_ARTIFACT_PATH,
    artifactByteLength: 88_219,
    linkedEtag:
      '"4204bb94c812690ef8ba5f4c1f10b5b1082ca0b7bc532166834f798aa56e2a3c"',
  },
  {
    category: 'math',
    datasetId: 'livebench/math',
    revision: 'bb66571c8ccf32d3df9e6f48b920d3770ff4aacb',
    lastModified: '2025-04-07T20:34:11.000Z',
    artifactPath: LIVEBENCH_QUESTION_ARTIFACT_PATH,
    artifactByteLength: 185_605,
    linkedEtag:
      '"3d365cad1f9b8d7c5416d63866653d6854b270d9c93b51323d405ed5fd51df54"',
  },
  {
    category: 'coding',
    datasetId: 'livebench/coding',
    revision: 'a958549fdd8aa57be0a3fafe7b205ffc160ed5f4',
    lastModified: '2025-04-07T20:34:05.000Z',
    artifactPath: LIVEBENCH_QUESTION_ARTIFACT_PATH,
    artifactByteLength: 244_785_858,
    linkedEtag:
      '"5f02d01fb21672f5d84169f940adab46ff3ca09b9159fd42fdd289bc9be23502"',
  },
  {
    category: 'language',
    datasetId: 'livebench/language',
    revision: '3ada32a2e53d5e04e57fa503384cb85ce9116c40',
    lastModified: '2025-04-07T20:33:47.000Z',
    artifactPath: LIVEBENCH_QUESTION_ARTIFACT_PATH,
    artifactByteLength: 287_876,
    linkedEtag:
      '"76ba142afd242ca02d6baa8bb737608d2b416674f311d8f9d798b4e3908a499c"',
  },
  {
    category: 'data_analysis',
    datasetId: 'livebench/data_analysis',
    revision: '31b9661ff678df9958e2f7fa228427f4c858c1a1',
    lastModified: '2025-04-07T20:34:15.000Z',
    artifactPath: LIVEBENCH_QUESTION_ARTIFACT_PATH,
    artifactByteLength: 144_796,
    linkedEtag:
      '"fb86a7a02fa9eabf785d9e8af85955990cf6d228cc9d3f805a54f863bc8c4c52"',
  },
  {
    category: 'instruction_following',
    datasetId: 'livebench/instruction_following',
    revision: '0868379c4b5cf62aeacaf8be4f08fced815c81bb',
    lastModified: '2025-04-07T20:34:07.000Z',
    artifactPath: LIVEBENCH_QUESTION_ARTIFACT_PATH,
    artifactByteLength: 537_024,
    linkedEtag:
      '"a9bb97bbaf8788142c310bcb33d50e2f6f5df8cbd8b8c3db677816b06f0f4f25"',
  },
] as const satisfies readonly LiveBenchQuestionDatasetPin[];

export const LIVEBENCH_MAX_QUESTION_ARTIFACT_BYTES = 300 * 1024 * 1024;
export const LIVEBENCH_MAX_QUESTION_RANGE_BYTES = 2 * 1024 * 1024;
export const LIVEBENCH_MAX_QUESTION_DOWNLOADED_BYTES = 4 * 1024 * 1024;
export const LIVEBENCH_MAX_QUESTION_RANGE_REQUESTS = 32;
export const LIVEBENCH_MAX_QUESTION_DATASET_ROWS = 1_000;

const RevisionSchema = z.string().regex(/^[a-f0-9]{40}$/u);
const RangeHeaderSchema = z
  .string()
  .regex(/^bytes=(0|[1-9]\d*)-(0|[1-9]\d*)$/u);

export type LiveBenchQuestionParquetReader = (
  file: AsyncBuffer,
  columns: readonly string[],
) => Promise<Record<string, unknown>[]>;

export interface FetchedLiveBenchQuestionDataset extends LiveBenchQuestionDatasetPin {
  readonly requestUrl: string;
  readonly fetchedAt: string;
  readonly downloadOrigin: string;
  readonly downloadedByteLength: number;
  readonly rangeRequestCount: number;
  readonly rows: readonly LiveBenchQuestionSourceRow[];
}

export interface LiveBenchQuestionInventoryEvidence {
  readonly schemaVersion: 'livebench-question-inventory-v1';
  readonly release: typeof LIVEBENCH_PUBLIC_RELEASE;
  readonly sources: readonly {
    readonly category: LiveBenchQuestionCategory;
    readonly datasetId: string;
    readonly revision: string;
    readonly lastModified: string;
    readonly artifactPath: string;
    readonly artifactByteLength: number;
    readonly linkedEtag: string;
  }[];
  readonly inventory: readonly LiveBenchQuestionInventoryObservation[];
}

const LiveBenchQuestionEvidenceSourceSchema = z.strictObject({
  category: LiveBenchCategorySchema,
  datasetId: z.string().regex(/^livebench\/[a-z_]+$/u),
  revision: RevisionSchema,
  lastModified: z.iso.datetime(),
  artifactPath: z.literal(LIVEBENCH_QUESTION_ARTIFACT_PATH),
  artifactByteLength: z.int().positive(),
  linkedEtag: z.string().min(1).max(200),
});

const LiveBenchQuestionEvidenceObservationSchema = z.strictObject({
  category: LiveBenchCategorySchema,
  task: z.string().trim().min(1).max(120),
  questionId: z.string().regex(/^[a-f0-9]{64}$/u),
  turn: z.int().min(1).max(10),
});

const LiveBenchQuestionInventoryEvidenceSchema = z.strictObject({
  schemaVersion: z.literal('livebench-question-inventory-v1'),
  release: z.literal(LIVEBENCH_PUBLIC_RELEASE),
  sources: z
    .array(LiveBenchQuestionEvidenceSourceSchema)
    .length(LIVEBENCH_QUESTION_DATASET_PINS.length),
  inventory: z
    .array(LiveBenchQuestionEvidenceObservationSchema)
    .min(1)
    .max(LIVEBENCH_MAX_QUESTION_ROWS),
});

export function parseLiveBenchQuestionInventoryEvidence(
  input: unknown,
): LiveBenchQuestionInventoryEvidence {
  const evidence = LiveBenchQuestionInventoryEvidenceSchema.parse(input);
  evidence.sources.forEach((source, index) => {
    const pin = LIVEBENCH_QUESTION_DATASET_PINS[index];
    if (
      !pin ||
      source.category !== pin.category ||
      source.datasetId !== pin.datasetId ||
      source.revision !== pin.revision ||
      source.lastModified !== pin.lastModified ||
      source.artifactPath !== pin.artifactPath ||
      source.artifactByteLength !== pin.artifactByteLength ||
      source.linkedEtag !== pin.linkedEtag
    ) {
      throw new Error('LiveBench question evidence source does not match pin');
    }
  });

  const questionTurns = evidence.inventory.map(({ questionId, turn }) =>
    JSON.stringify([questionId, turn]),
  );
  if (new Set(questionTurns).size !== questionTurns.length) {
    throw new Error('Duplicate LiveBench question evidence observation');
  }
  const inventoryCategories = new Set(
    evidence.inventory.map(({ category }) => category),
  );
  if (
    inventoryCategories.size !== LIVEBENCH_QUESTION_DATASET_PINS.length ||
    LIVEBENCH_QUESTION_DATASET_PINS.some(
      ({ category }) => !inventoryCategories.has(category),
    )
  ) {
    throw new Error(
      'LiveBench question evidence must include all pinned categories',
    );
  }
  return evidence;
}

export interface FetchedLiveBenchQuestionInventory {
  readonly evidence: LiveBenchQuestionInventoryEvidence;
  readonly datasets: readonly FetchedLiveBenchQuestionDataset[];
}

function pinForCategory(
  category: LiveBenchQuestionCategory,
): LiveBenchQuestionDatasetPin {
  const pin = LIVEBENCH_QUESTION_DATASET_PINS.find(
    (candidate) => candidate.category === category,
  );
  if (!pin) {
    throw new Error('LiveBench question dataset category is not pinned');
  }
  RevisionSchema.parse(pin.revision);
  return pin;
}

function createResolverUrl(pin: LiveBenchQuestionDatasetPin): URL {
  const url = new URL(
    `/datasets/${pin.datasetId}/resolve/${pin.revision}/${pin.artifactPath}`,
    LIVEBENCH_HUB_ORIGIN,
  );
  url.searchParams.set('download', 'true');
  return url;
}

function parseRangeHeader(input: string): {
  readonly start: number;
  readonly end: number;
} {
  const range = RangeHeaderSchema.parse(input);
  const [start, end] = range.slice('bytes='.length).split('-').map(Number);
  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end)) {
    throw new Error('LiveBench question range is not a safe integer');
  }
  return { start: start!, end: end! };
}

function createBoundedRangeFetch(
  downloadUrl: URL,
  artifactByteLength: number,
  fetchImplementation: typeof fetch,
  metrics: { downloadedByteLength: number; rangeRequestCount: number },
): typeof fetch {
  return async (input, init) => {
    const requestedUrl = new URL(
      input instanceof Request ? input.url : String(input),
    );
    if (requestedUrl.href !== downloadUrl.href) {
      throw new Error('LiveBench question range URL is not allowlisted');
    }
    const headers = new Headers(init?.headers);
    const { start, end } = parseRangeHeader(headers.get('range') ?? '');
    const requestedByteLength = end - start + 1;
    if (
      start < 0 ||
      end < start ||
      end >= artifactByteLength ||
      requestedByteLength > LIVEBENCH_MAX_QUESTION_RANGE_BYTES
    ) {
      throw new Error('LiveBench question range is outside the allowed bounds');
    }
    if (
      metrics.rangeRequestCount >= LIVEBENCH_MAX_QUESTION_RANGE_REQUESTS ||
      metrics.downloadedByteLength + requestedByteLength >
        LIVEBENCH_MAX_QUESTION_DOWNLOADED_BYTES
    ) {
      throw new Error('LiveBench question range budget is exhausted');
    }

    metrics.rangeRequestCount += 1;
    const response = await fetchImplementation(downloadUrl, {
      method: 'GET',
      redirect: 'manual',
      headers: {
        accept: 'application/octet-stream',
        range: `bytes=${start}-${end}`,
        'user-agent': 'llm-bench-radar/0.0.0',
      },
      signal: AbortSignal.timeout(30_000),
    });
    if (response.status !== 206) {
      throw new Error('LiveBench question CDN did not return partial content');
    }
    const contentType = response.headers.get('content-type') ?? '';
    if (
      !/^(?:application|binary)\/(?:octet-stream|vnd\.apache\.parquet)(?:\s*;|$)/iu.test(
        contentType,
      )
    ) {
      throw new Error('LiveBench question range content type is invalid');
    }
    const expectedContentRange = `bytes ${start}-${end}/${artifactByteLength}`;
    if (response.headers.get('content-range') !== expectedContentRange) {
      throw new Error('LiveBench question Content-Range is invalid');
    }
    const declaredLengthHeader = response.headers.get('content-length');
    if (declaredLengthHeader !== null) {
      const declaredLength = Number(declaredLengthHeader);
      if (
        !Number.isSafeInteger(declaredLength) ||
        declaredLength !== requestedByteLength
      ) {
        throw new Error('LiveBench question range content length is invalid');
      }
    }

    const body = new Uint8Array(await response.arrayBuffer());
    if (body.byteLength !== requestedByteLength) {
      throw new Error('LiveBench question range body length is invalid');
    }
    metrics.downloadedByteLength += body.byteLength;
    return new Response(body, {
      status: response.status,
      headers: response.headers,
    });
  };
}

// Hyparquet's documented AsyncBuffer + columns projection reads only required
// remote Parquet column chunks through byte ranges.
// Source: https://github.com/hyparam/hyparquet#browser-example
const defaultParquetReader: LiveBenchQuestionParquetReader = async (
  file,
  columns,
) => parquetReadObjects({ file, columns: [...columns] });

export async function fetchLiveBenchQuestionDataset(
  category: LiveBenchQuestionCategory,
  fetchImplementation: typeof fetch = fetch,
  reader: LiveBenchQuestionParquetReader = defaultParquetReader,
): Promise<FetchedLiveBenchQuestionDataset> {
  const pin = pinForCategory(category);
  const resolverUrl = createResolverUrl(pin);
  const resolverResponse = await fetchImplementation(resolverUrl, {
    method: 'GET',
    redirect: 'manual',
    headers: {
      accept: 'application/octet-stream',
      'user-agent': 'llm-bench-radar/0.0.0',
    },
    signal: AbortSignal.timeout(30_000),
  });
  if (resolverResponse.status !== 302) {
    throw new Error('LiveBench question resolver returned an invalid status');
  }
  if (resolverResponse.headers.get('x-repo-commit') !== pin.revision) {
    throw new Error('LiveBench question resolver returned an invalid revision');
  }
  const artifactByteLength = Number(
    resolverResponse.headers.get('x-linked-size'),
  );
  if (
    !Number.isSafeInteger(artifactByteLength) ||
    artifactByteLength < 8 ||
    artifactByteLength > LIVEBENCH_MAX_QUESTION_ARTIFACT_BYTES ||
    artifactByteLength !== pin.artifactByteLength
  ) {
    throw new Error('LiveBench question linked artifact size is invalid');
  }
  const linkedEtag = resolverResponse.headers.get('x-linked-etag') ?? '';
  if (
    linkedEtag.length < 1 ||
    linkedEtag.length > 200 ||
    linkedEtag !== pin.linkedEtag
  ) {
    throw new Error('LiveBench question linked ETag is invalid');
  }

  let downloadUrl: URL;
  try {
    downloadUrl = new URL(resolverResponse.headers.get('location') ?? '');
  } catch (error) {
    throw new Error('LiveBench question resolver CDN URL is invalid', {
      cause: error,
    });
  }
  if (!isApprovedHuggingFaceCdnUrl(downloadUrl)) {
    throw new Error('LiveBench question resolver CDN URL is not approved');
  }

  const metrics = { downloadedByteLength: 0, rangeRequestCount: 0 };
  const file = await asyncBufferFromUrl({
    url: downloadUrl.href,
    byteLength: artifactByteLength,
    fetch: createBoundedRangeFetch(
      downloadUrl,
      artifactByteLength,
      fetchImplementation,
      metrics,
    ),
    requestInit: { redirect: 'manual' },
  });
  const decoded = await reader(file, LIVEBENCH_QUESTION_INVENTORY_COLUMNS);
  if (decoded.length > LIVEBENCH_MAX_QUESTION_DATASET_ROWS) {
    throw new Error('LiveBench question dataset exceeds the row limit');
  }
  const rows = parseLiveBenchQuestionRows(decoded, category);

  return {
    ...pin,
    requestUrl: resolverUrl.href,
    fetchedAt: new Date().toISOString(),
    artifactByteLength,
    linkedEtag,
    downloadOrigin: downloadUrl.origin,
    downloadedByteLength: metrics.downloadedByteLength,
    rangeRequestCount: metrics.rangeRequestCount,
    rows,
  };
}

export function createLiveBenchQuestionInventoryEvidence(
  datasets: readonly FetchedLiveBenchQuestionDataset[],
): LiveBenchQuestionInventoryEvidence {
  const byCategory = new Map(
    datasets.map((dataset) => [dataset.category, dataset]),
  );
  if (
    datasets.length !== LIVEBENCH_QUESTION_DATASET_PINS.length ||
    byCategory.size !== LIVEBENCH_QUESTION_DATASET_PINS.length
  ) {
    throw new Error(
      'LiveBench question evidence requires every pinned dataset',
    );
  }

  const orderedDatasets = LIVEBENCH_QUESTION_DATASET_PINS.map((pin) => {
    const dataset = byCategory.get(pin.category);
    if (
      !dataset ||
      dataset.datasetId !== pin.datasetId ||
      dataset.revision !== pin.revision ||
      dataset.lastModified !== pin.lastModified ||
      dataset.artifactPath !== pin.artifactPath ||
      dataset.artifactByteLength !== pin.artifactByteLength ||
      dataset.linkedEtag !== pin.linkedEtag ||
      dataset.rows.some(({ category }) => category !== pin.category)
    ) {
      throw new Error('LiveBench question evidence does not match its pin');
    }
    return dataset;
  });
  const inventory = selectLiveBenchQuestionInventory({
    release: LIVEBENCH_PUBLIC_RELEASE,
    availableReleases: LIVEBENCH_PUBLIC_RELEASES,
    rows: orderedDatasets.flatMap(({ rows }) => rows),
  });

  return {
    schemaVersion: 'livebench-question-inventory-v1',
    release: LIVEBENCH_PUBLIC_RELEASE,
    sources: orderedDatasets.map((dataset) => ({
      category: dataset.category,
      datasetId: dataset.datasetId,
      revision: dataset.revision,
      lastModified: dataset.lastModified,
      artifactPath: dataset.artifactPath,
      artifactByteLength: dataset.artifactByteLength,
      linkedEtag: dataset.linkedEtag,
    })),
    inventory,
  };
}

export async function fetchLiveBenchQuestionInventory(
  fetchImplementation: typeof fetch = fetch,
  reader: LiveBenchQuestionParquetReader = defaultParquetReader,
): Promise<FetchedLiveBenchQuestionInventory> {
  const datasets: FetchedLiveBenchQuestionDataset[] = [];
  for (const pin of LIVEBENCH_QUESTION_DATASET_PINS) {
    datasets.push(
      await fetchLiveBenchQuestionDataset(
        pin.category,
        fetchImplementation,
        reader,
      ),
    );
  }
  return {
    evidence: createLiveBenchQuestionInventoryEvidence(datasets),
    datasets,
  };
}
