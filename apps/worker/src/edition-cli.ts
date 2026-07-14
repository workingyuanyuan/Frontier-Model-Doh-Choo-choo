import { createDatabase } from '@llm-bench/db';

import {
  executeEditionCommand,
  parseEditionCommandArguments,
} from './edition-publication.js';

const command = parseEditionCommandArguments(process.argv.slice(2));
const { db, pool } = createDatabase();

try {
  const summary = await executeEditionCommand(db, command);
  console.info(JSON.stringify(summary, null, 2));
} finally {
  await pool.end();
}
