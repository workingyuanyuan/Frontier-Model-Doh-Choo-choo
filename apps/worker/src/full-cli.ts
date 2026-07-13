import { fileURLToPath } from 'node:url';

import { createDatabase } from '@llm-bench/db';

import { ingestLiveBenchParquetDataset } from './livebench-parquet-ingestion.js';

const rawStorageRoot =
  process.env.RAW_STORAGE_DIR ??
  fileURLToPath(new URL('../../../data/raw', import.meta.url));
const { db, pool } = createDatabase();

try {
  const summary = await ingestLiveBenchParquetDataset(db, { rawStorageRoot });
  console.info(JSON.stringify(summary, null, 2));
} finally {
  await pool.end();
}
