import { createDatabase } from '@llm-bench/db';

import {
  parseIngestionRunId,
  resolveLiveBenchAliases,
} from './livebench-aliases.js';

const ingestionRunId = parseIngestionRunId(
  process.env.LIVEBENCH_INGESTION_RUN_ID,
);
const { db, pool } = createDatabase();

try {
  const summary = await resolveLiveBenchAliases(db, ingestionRunId);
  console.info(JSON.stringify(summary, null, 2));
} finally {
  await pool.end();
}
