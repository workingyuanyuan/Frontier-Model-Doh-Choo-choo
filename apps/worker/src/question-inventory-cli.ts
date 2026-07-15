import { fileURLToPath } from 'node:url';

import { acquireLiveBenchQuestionInventoryEvidence } from './livebench-question-evidence.js';

const rawStorageRoot =
  process.env.RAW_STORAGE_DIR ??
  fileURLToPath(new URL('../../../data/raw', import.meta.url));
console.info(
  JSON.stringify(
    await acquireLiveBenchQuestionInventoryEvidence(rawStorageRoot),
    null,
    2,
  ),
);
