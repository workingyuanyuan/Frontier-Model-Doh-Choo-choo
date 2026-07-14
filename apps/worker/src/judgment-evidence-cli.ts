import { fileURLToPath } from 'node:url';

import {
  createLiveBenchJudgmentCoverageEvidence,
  fetchLiveBenchPinnedJudgmentDatasets,
  writeContentAddressedArtifact,
} from '@llm-bench/connectors';

import { loadLiveBenchQuestionInventoryEvidence } from './livebench-question-evidence.js';

const rawStorageRoot =
  process.env.RAW_STORAGE_DIR ??
  fileURLToPath(new URL('../../../data/raw', import.meta.url));
const questionInventory =
  await loadLiveBenchQuestionInventoryEvidence(rawStorageRoot);
const datasets = await fetchLiveBenchPinnedJudgmentDatasets();
const storedSources = [];

for (const dataset of datasets) {
  const stored = await writeContentAddressedArtifact(
    rawStorageRoot,
    dataset.fetched.body,
    'parquet',
  );
  if (stored.contentSha256 !== dataset.pin.contentSha256) {
    throw new Error('Stored LiveBench judgment artifact SHA-256 changed');
  }
  storedSources.push({
    revision: dataset.pin.revision,
    ...stored,
  });
}

const evidence = createLiveBenchJudgmentCoverageEvidence(
  datasets,
  questionInventory.observations,
);
const evidenceBody = new TextEncoder().encode(
  `${JSON.stringify(evidence, null, 2)}\n`,
);
const storedEvidence = await writeContentAddressedArtifact(
  rawStorageRoot,
  evidenceBody,
  'json',
);

console.info(
  JSON.stringify(
    {
      ...evidence,
      storedSources,
      storedEvidence,
    },
    null,
    2,
  ),
);
