import { createDatabase } from '@llm-bench/db';

import { publishLiveBenchScoreSnapshot } from './livebench-score-publication.js';
import { parseLiveBenchScoringArguments } from './livebench-scoring.js';

const options = parseLiveBenchScoringArguments(process.argv.slice(2));
const { db, pool } = createDatabase();

try {
  const summary = await publishLiveBenchScoreSnapshot(db, options);
  console.info(JSON.stringify(summary, null, 2));
} finally {
  await pool.end();
}
