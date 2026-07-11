import { defineConfig } from 'drizzle-kit';

import { getDatabaseUrl } from './src/database-url.js';

export default defineConfig({
  schema: './src/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: getDatabaseUrl(),
  },
  strict: true,
  verbose: true,
});
