import { fileURLToPath } from 'node:url';

import { createDatabase } from '@llm-bench/db';

import { getLiveBenchAggregationReadinessReport } from './livebench-aggregation-readiness.js';
import { parseIngestionRunId } from './livebench-aliases.js';
import { loadLiveBenchQuestionInventoryEvidence } from './livebench-question-evidence.js';

const ingestionRunId = parseIngestionRunId(
  process.env.LIVEBENCH_INGESTION_RUN_ID,
);
const summaryOnly = process.argv.includes('--summary-only');
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
  console.info(
    JSON.stringify(
      summaryOnly
        ? {
            ingestionRun: report.ingestionRun,
            questionInventory: report.questionInventory,
            inventory: report.aggregation.inventory,
            summary: report.aggregation.summary,
          }
        : report,
      null,
      2,
    ),
  );
} finally {
  await pool.end();
}
