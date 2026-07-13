import { createDatabase } from '@llm-bench/db';

import { syncLiveBenchAliasManifest } from './livebench-alias-sync.js';

const { db, pool } = createDatabase();

try {
  const summary = await syncLiveBenchAliasManifest(db);
  console.info(JSON.stringify(summary, null, 2));
} finally {
  await pool.end();
}
