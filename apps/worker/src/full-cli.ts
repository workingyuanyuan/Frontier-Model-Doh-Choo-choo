import { fileURLToPath } from 'node:url';

import { createDatabase } from '@llm-bench/db';

import { ingestLiveBenchDataset } from './livebench-dataset.js';

function integerEnvironmentValue(name: string, fallback: number): number {
  const value = process.env[name];
  return value === undefined ? fallback : Number(value);
}

const rawStorageRoot =
  process.env.RAW_STORAGE_DIR ??
  fileURLToPath(new URL('../../../data/raw', import.meta.url));
const { db, pool } = createDatabase();

try {
  const summary = await ingestLiveBenchDataset(db, {
    pageLength: integerEnvironmentValue('LIVEBENCH_PAGE_LENGTH', 100),
    rawStorageRoot,
  });
  console.info(JSON.stringify(summary, null, 2));
} finally {
  await pool.end();
}
