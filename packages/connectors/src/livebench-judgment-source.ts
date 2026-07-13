import { createHash } from 'node:crypto';

import * as z from 'zod';

import {
  LIVEBENCH_MAX_QUESTION_ROWS,
  LIVEBENCH_PUBLIC_RELEASE,
  type LiveBenchQuestionInventoryObservation,
} from './livebench-question-inventory.js';
import {
  LiveBenchCategorySchema,
  LIVEBENCH_DATASET_ID,
  LiveBenchJudgmentSchema,
  type LiveBenchJudgment,
} from './livebench.js';
import {
  LIVEBENCH_MAX_PARQUET_BYTES,
  LIVEBENCH_MAX_PARQUET_ROWS,
  LIVEBENCH_PARQUET_PATH,
  fetchLiveBenchParquet,
  parseLiveBenchParquet,
  type FetchedLiveBenchParquet,
} from './livebench-parquet.js';

export interface LiveBenchJudgmentDatasetPin {
  readonly revision: string;
  readonly lastModified: string;
  readonly artifactPath: typeof LIVEBENCH_PARQUET_PATH;
  readonly contentSha256: string;
  readonly artifactByteLength: number;
  readonly rowCount: number;
  readonly categories: readonly LiveBenchJudgment['category'][];
}

export const LIVEBENCH_JUDGMENT_DATASET_PINS = [
  {
    revision: '9704e5da7bfbefe75ac1482a13de827127295993',
    lastModified: '2025-04-07T20:34:22.000Z',
    artifactPath: LIVEBENCH_PARQUET_PATH,
    contentSha256:
      '35ad896970151776145c96b31c5ddb3a2749ea9a1d91e6b7f1a4c4c04735182a',
    artifactByteLength: 737_444,
    rowCount: 60_372,
    categories: ['coding', 'instruction_following', 'language'],
  },
  {
    revision: '5896e3b11081702c7f93f4733605fa4f5a072a11',
    lastModified: '2024-10-22T03:09:21.000Z',
    artifactPath: LIVEBENCH_PARQUET_PATH,
    contentSha256:
      '8f490d557d86b5dab0da9db1169142f69ebe69907fbaba361b4f00e4fe4f171d',
    artifactByteLength: 1_152_090,
    rowCount: 93_624,
    categories: [
      'coding',
      'data_analysis',
      'instruction_following',
      'language',
      'math',
      'reasoning',
    ],
  },
] as const satisfies readonly LiveBenchJudgmentDatasetPin[];

const LiveBenchJudgmentDatasetPinSchema = z.strictObject({
  revision: z.string().regex(/^[a-f0-9]{40}$/u),
  lastModified: z.iso.datetime(),
  artifactPath: z.literal(LIVEBENCH_PARQUET_PATH),
  contentSha256: z.string().regex(/^[a-f0-9]{64}$/u),
  artifactByteLength: z.int().positive().max(LIVEBENCH_MAX_PARQUET_BYTES),
  rowCount: z.int().positive().max(LIVEBENCH_MAX_PARQUET_ROWS),
  categories: z.array(LiveBenchCategorySchema).min(1).max(6),
});

export interface LiveBenchPinnedJudgmentDataset {
  readonly pin: LiveBenchJudgmentDatasetPin;
  readonly fetched: FetchedLiveBenchParquet;
  readonly rows: readonly LiveBenchJudgment[];
}

export interface LiveBenchJudgmentCoverageEvidence {
  readonly schemaVersion: 'livebench-judgment-coverage-v1';
  readonly release: typeof LIVEBENCH_PUBLIC_RELEASE;
  readonly inventoryObservationCount: number;
  readonly coveredObservationKeyCount: number;
  readonly missingObservationCount: number;
  readonly sources: readonly {
    readonly datasetId: typeof LIVEBENCH_DATASET_ID;
    readonly revision: string;
    readonly lastModified: string;
    readonly artifactPath: string;
    readonly contentSha256: string;
    readonly artifactByteLength: number;
    readonly rowCount: number;
    readonly categories: readonly LiveBenchJudgment['category'][];
    readonly coveredObservationKeyCount: number;
  }[];
  readonly categories: readonly {
    readonly category: LiveBenchJudgment['category'];
    readonly coverage: number;
    readonly expectedObservations: number;
    readonly coveredObservationKeys: number;
    readonly missingObservations: number;
    readonly sourceRevisions: readonly string[];
  }[];
}

export type LiveBenchJudgmentParquetFetcher = (
  revision: string,
) => Promise<FetchedLiveBenchParquet>;
export type LiveBenchJudgmentParquetParser = (
  body: Uint8Array,
) => Promise<LiveBenchJudgment[]>;

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function observationKey(
  row:
    | LiveBenchQuestionInventoryObservation
    | {
        readonly category: LiveBenchJudgment['category'];
        readonly task: string;
        readonly questionId: string;
        readonly turn: number;
      },
): string {
  return JSON.stringify([row.category, row.task, row.questionId, row.turn]);
}

function questionTurnKey(row: {
  readonly questionId: string;
  readonly turn: number;
}): string {
  return JSON.stringify([row.questionId, row.turn]);
}

export function assertLiveBenchPinnedJudgmentArtifact(
  inputPin: LiveBenchJudgmentDatasetPin,
  fetched: FetchedLiveBenchParquet,
  rows: readonly LiveBenchJudgment[],
): void {
  const pin = LiveBenchJudgmentDatasetPinSchema.parse(inputPin);
  if (new Set(pin.categories).size !== pin.categories.length) {
    throw new Error('LiveBench judgment pin categories are duplicated');
  }
  const sortedPinCategories = [...pin.categories].sort(compareText);
  if (
    pin.categories.some(
      (category, index) => category !== sortedPinCategories[index],
    )
  ) {
    throw new Error('LiveBench judgment pin categories are not sorted');
  }
  if (fetched.revision !== pin.revision) {
    throw new Error('LiveBench judgment artifact revision does not match pin');
  }
  if (
    fetched.byteLength !== pin.artifactByteLength ||
    fetched.body.byteLength !== pin.artifactByteLength
  ) {
    throw new Error(
      'LiveBench judgment artifact byte length does not match pin',
    );
  }
  const contentSha256 = createHash('sha256').update(fetched.body).digest('hex');
  if (
    contentSha256 !== pin.contentSha256 ||
    fetched.contentSha256 !== pin.contentSha256
  ) {
    throw new Error('LiveBench judgment artifact SHA-256 does not match pin');
  }
  if (rows.length !== pin.rowCount) {
    throw new Error('LiveBench judgment artifact row count does not match pin');
  }
  const rowCategories = [
    ...new Set(rows.map((row) => LiveBenchJudgmentSchema.parse(row).category)),
  ].sort(compareText);
  if (
    rowCategories.length !== pin.categories.length ||
    rowCategories.some((category, index) => category !== pin.categories[index])
  ) {
    throw new Error('LiveBench judgment artifact categories do not match pin');
  }
}

async function fetchLiveBenchJudgmentDatasetsForPins(
  pins: readonly LiveBenchJudgmentDatasetPin[],
  parquetFetcher: LiveBenchJudgmentParquetFetcher = fetchLiveBenchParquet,
  parquetParser: LiveBenchJudgmentParquetParser = parseLiveBenchParquet,
): Promise<readonly LiveBenchPinnedJudgmentDataset[]> {
  const revisions = pins.map(({ revision }) => revision);
  if (pins.length < 1 || new Set(revisions).size !== pins.length) {
    throw new Error(
      'LiveBench judgment dataset pins must be non-empty and unique',
    );
  }

  const datasets: LiveBenchPinnedJudgmentDataset[] = [];
  for (const pin of pins) {
    const fetched = await parquetFetcher(pin.revision);
    const rows = await parquetParser(fetched.body);
    assertLiveBenchPinnedJudgmentArtifact(pin, fetched, rows);
    datasets.push({ pin, fetched, rows });
  }
  return datasets;
}

export function fetchLiveBenchPinnedJudgmentDatasets(
  parquetFetcher: LiveBenchJudgmentParquetFetcher = fetchLiveBenchParquet,
  parquetParser: LiveBenchJudgmentParquetParser = parseLiveBenchParquet,
): Promise<readonly LiveBenchPinnedJudgmentDataset[]> {
  return fetchLiveBenchJudgmentDatasetsForPins(
    LIVEBENCH_JUDGMENT_DATASET_PINS,
    parquetFetcher,
    parquetParser,
  );
}

export function createLiveBenchJudgmentCoverageEvidence(
  datasets: readonly LiveBenchPinnedJudgmentDataset[],
  inventory: readonly LiveBenchQuestionInventoryObservation[],
): LiveBenchJudgmentCoverageEvidence {
  if (inventory.length < 1 || inventory.length > LIVEBENCH_MAX_QUESTION_ROWS) {
    throw new Error('LiveBench judgment coverage inventory size is invalid');
  }
  const inventoryByKey = new Map(
    inventory.map((row) => [observationKey(row), row] as const),
  );
  const inventoryByQuestionTurn = new Map(
    inventory.map((row) => [questionTurnKey(row), row] as const),
  );
  if (
    inventoryByKey.size !== inventory.length ||
    inventoryByQuestionTurn.size !== inventory.length
  ) {
    throw new Error('LiveBench judgment coverage inventory is duplicated');
  }
  const inventoryCategories = [
    ...new Set(inventory.map(({ category }) => category)),
  ].sort(compareText);
  if (
    inventoryCategories.length !== 6 ||
    LiveBenchCategorySchema.options.some(
      (category) => !inventoryCategories.includes(category),
    )
  ) {
    throw new Error(
      'LiveBench judgment coverage inventory requires six categories',
    );
  }

  const revisions = datasets.map(({ pin }) => pin.revision);
  if (datasets.length < 1 || new Set(revisions).size !== datasets.length) {
    throw new Error(
      'LiveBench judgment coverage sources must be non-empty and unique',
    );
  }
  const unionCoveredKeys = new Set<string>();
  const coveredKeysByRevision = new Map<string, Set<string>>();

  for (const dataset of datasets) {
    assertLiveBenchPinnedJudgmentArtifact(
      dataset.pin,
      dataset.fetched,
      dataset.rows,
    );
    const sourceCoveredKeys = new Set<string>();
    for (const row of dataset.rows) {
      const candidate = {
        category: row.category,
        task: row.task,
        questionId: row.question_id,
        turn: row.turn,
      };
      const expected = inventoryByQuestionTurn.get(questionTurnKey(candidate));
      if (
        expected !== undefined &&
        observationKey(expected) !== observationKey(candidate)
      ) {
        throw new Error(
          'LiveBench judgment source metadata does not match inventory',
        );
      }
      const key = observationKey(candidate);
      if (inventoryByKey.has(key)) {
        sourceCoveredKeys.add(key);
        unionCoveredKeys.add(key);
      }
    }
    coveredKeysByRevision.set(dataset.pin.revision, sourceCoveredKeys);
  }

  const categories = inventoryCategories.map((category) => {
    const categoryInventory = inventory.filter(
      (row) => row.category === category,
    );
    const categoryKeys = categoryInventory.map(observationKey);
    const coveredObservationKeys = categoryKeys.filter((key) =>
      unionCoveredKeys.has(key),
    ).length;
    return {
      category,
      coverage: coveredObservationKeys / categoryInventory.length,
      expectedObservations: categoryInventory.length,
      coveredObservationKeys,
      missingObservations: categoryInventory.length - coveredObservationKeys,
      sourceRevisions: datasets
        .filter(({ pin }) =>
          categoryKeys.some((key) =>
            coveredKeysByRevision.get(pin.revision)?.has(key),
          ),
        )
        .map(({ pin }) => pin.revision),
    };
  });

  return {
    schemaVersion: 'livebench-judgment-coverage-v1',
    release: LIVEBENCH_PUBLIC_RELEASE,
    inventoryObservationCount: inventory.length,
    coveredObservationKeyCount: unionCoveredKeys.size,
    missingObservationCount: inventory.length - unionCoveredKeys.size,
    sources: datasets.map(({ pin }) => ({
      datasetId: LIVEBENCH_DATASET_ID,
      revision: pin.revision,
      lastModified: pin.lastModified,
      artifactPath: pin.artifactPath,
      contentSha256: pin.contentSha256,
      artifactByteLength: pin.artifactByteLength,
      rowCount: pin.rowCount,
      categories: pin.categories,
      coveredObservationKeyCount:
        coveredKeysByRevision.get(pin.revision)?.size ?? 0,
    })),
    categories,
  };
}
