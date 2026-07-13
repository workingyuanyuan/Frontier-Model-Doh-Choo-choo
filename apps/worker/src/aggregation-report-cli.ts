import { createDatabase } from '@llm-bench/db';

import { getLiveBenchAggregationReadinessReport } from './livebench-aggregation-readiness.js';
import { parseIngestionRunId } from './livebench-aliases.js';

const ingestionRunId = parseIngestionRunId(
  process.env.LIVEBENCH_INGESTION_RUN_ID,
);
const summaryOnly = process.argv.includes('--summary-only');
const { db, pool } = createDatabase();

try {
  const report = await getLiveBenchAggregationReadinessReport(
    db,
    ingestionRunId,
  );
  console.info(
    JSON.stringify(
      summaryOnly
        ? {
            ingestionRun: report.ingestionRun,
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
