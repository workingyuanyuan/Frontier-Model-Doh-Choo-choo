import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import { getDatabaseUrl } from './database-url.js';
import * as schema from './schema/index.js';

export function createDatabase(databaseUrl = getDatabaseUrl()) {
  const pool = new Pool({
    connectionString: databaseUrl,
    max: 10,
    connectionTimeoutMillis: 10_000,
    idleTimeoutMillis: 30_000,
  });

  return {
    db: drizzle(pool, { schema }),
    pool,
  };
}

export type Database = ReturnType<typeof createDatabase>['db'];
