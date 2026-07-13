import { createDatabase } from '@llm-bench/db';

import {
  getLiveBenchAliasReviewReport,
  parseIngestionRunId,
} from './livebench-aliases.js';

const ingestionRunId = parseIngestionRunId(
  process.env.LIVEBENCH_INGESTION_RUN_ID,
);
const { db, pool } = createDatabase();

try {
  const report = await getLiveBenchAliasReviewReport(db, ingestionRunId);
  console.info(JSON.stringify(report, null, 2));
} finally {
  await pool.end();
}
