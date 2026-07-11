import { fileURLToPath } from 'node:url';

import { createDatabase } from '@llm-bench/db';

import { ingestLiveBenchPage } from './livebench-ingestion.js';

function integerEnvironmentValue(name: string, fallback: number): number {
  const value = process.env[name];
  return value === undefined ? fallback : Number(value);
}

const rawStorageRoot =
  process.env.RAW_STORAGE_DIR ??
  fileURLToPath(new URL('../../../data/raw', import.meta.url));
const { db, pool } = createDatabase();

try {
  const summary = await ingestLiveBenchPage(db, {
    offset: integerEnvironmentValue('LIVEBENCH_OFFSET', 0),
    length: integerEnvironmentValue('LIVEBENCH_LENGTH', 100),
    rawStorageRoot,
  });
  console.info(JSON.stringify(summary, null, 2));
} finally {
  await pool.end();
}
