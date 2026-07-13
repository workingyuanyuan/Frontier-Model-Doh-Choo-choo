import { fileURLToPath } from 'node:url';

import {
  fetchLiveBenchQuestionInventory,
  writeContentAddressedArtifact,
} from '@llm-bench/connectors';

const rawStorageRoot =
  process.env.RAW_STORAGE_DIR ??
  fileURLToPath(new URL('../../../data/raw', import.meta.url));

const fetched = await fetchLiveBenchQuestionInventory();
const body = new TextEncoder().encode(
  `${JSON.stringify(fetched.evidence, null, 2)}\n`,
);
const stored = await writeContentAddressedArtifact(
  rawStorageRoot,
  body,
  'json',
);
const categories = fetched.evidence.sources.map(({ category }) => ({
  category,
  observations: fetched.evidence.inventory.filter(
    (observation) => observation.category === category,
  ).length,
  tasks: [
    ...new Set(
      fetched.evidence.inventory
        .filter((observation) => observation.category === category)
        .map(({ task }) => task),
    ),
  ].sort(),
}));

console.info(
  JSON.stringify(
    {
      schemaVersion: fetched.evidence.schemaVersion,
      release: fetched.evidence.release,
      sourceRowCount: fetched.datasets.reduce(
        (sum, dataset) => sum + dataset.rows.length,
        0,
      ),
      inventoryObservationCount: fetched.evidence.inventory.length,
      taskCount: new Set(
        fetched.evidence.inventory.map(
          ({ category, task }) => `${category}/${task}`,
        ),
      ).size,
      downloadedByteLength: fetched.datasets.reduce(
        (sum, dataset) => sum + dataset.downloadedByteLength,
        0,
      ),
      rangeRequestCount: fetched.datasets.reduce(
        (sum, dataset) => sum + dataset.rangeRequestCount,
        0,
      ),
      categories,
      sources: fetched.evidence.sources,
      ...stored,
    },
    null,
    2,
  ),
);
