import { createDatabase } from '@llm-bench/db';

import {
  validateLiveBenchAliasPersistence,
  type LiveBenchAliasPersistenceRow,
} from './livebench-alias-adjudication.js';
import { parseIngestionRunId } from './livebench-aliases.js';

const ingestionRunId = parseIngestionRunId(
  process.env.LIVEBENCH_INGESTION_RUN_ID,
);
const { pool } = createDatabase();

try {
  const result = await pool.query<LiveBenchAliasPersistenceRow>(
    `select
       validation_status as "validationStatus",
       count(*)::integer as records,
       count(resolved_model_variant_id)::integer as "resolvedRecords"
     from staged_results
     where ingestion_run_id = $1
     group by validation_status
     order by validation_status`,
    [ingestionRunId],
  );
  console.info(
    JSON.stringify(
      {
        ingestionRunId,
        ...validateLiveBenchAliasPersistence(result.rows),
      },
      null,
      2,
    ),
  );
} finally {
  await pool.end();
}
