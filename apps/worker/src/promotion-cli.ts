import { fileURLToPath } from 'node:url';

import { createDatabase } from '@llm-bench/db';

import { getLiveBenchAggregationReadinessReport } from './livebench-aggregation-readiness.js';
import { parseIngestionRunId } from './livebench-aliases.js';
import {
  parseLiveBenchPromotionArguments,
  promoteLiveBenchResults,
} from './livebench-promotion.js';
import { loadLiveBenchQuestionInventoryEvidence } from './livebench-question-evidence.js';

const ingestionRunId = parseIngestionRunId(
  process.env.LIVEBENCH_INGESTION_RUN_ID,
);
const { dryRun } = parseLiveBenchPromotionArguments(process.argv.slice(2));
const rawStorageRoot =
  process.env.RAW_STORAGE_DIR ??
  fileURLToPath(new URL('../../../data/raw', import.meta.url));
const questionInventory =
  await loadLiveBenchQuestionInventoryEvidence(rawStorageRoot);
const { db, pool } = createDatabase();

try {
  const report = await getLiveBenchAggregationReadinessReport(
    db,
    ingestionRunId,
    questionInventory,
  );
  const summary = await promoteLiveBenchResults(db, report, { dryRun });
  console.info(JSON.stringify({ ingestionRunId, ...summary }, null, 2));
} finally {
  await pool.end();
}
