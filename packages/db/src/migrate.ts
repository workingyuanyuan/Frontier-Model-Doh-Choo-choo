import { fileURLToPath } from 'node:url';

import { migrate } from 'drizzle-orm/node-postgres/migrator';

import { createDatabase } from './client.js';

const migrationsFolder = fileURLToPath(new URL('../drizzle', import.meta.url));
const { db, pool } = createDatabase();

try {
  await migrate(db, { migrationsFolder });
  console.info('Database migrations applied successfully.');
} finally {
  await pool.end();
}
