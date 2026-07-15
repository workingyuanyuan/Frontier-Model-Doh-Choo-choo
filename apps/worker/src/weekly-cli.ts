import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import { createDatabase } from '@llm-bench/db';

import { executeEditionCommand } from './edition-publication.js';
import { getLiveBenchAggregationReadinessReport } from './livebench-aggregation-readiness.js';
import {
  validateLiveBenchAliasPersistence,
  type LiveBenchAliasPersistenceRow,
} from './livebench-alias-adjudication.js';
import { syncLiveBenchAliasManifest } from './livebench-alias-sync.js';
import {
  getLiveBenchAliasReviewReport,
  resolveLiveBenchAliases,
} from './livebench-aliases.js';
import { ingestLiveBenchParquetDataset } from './livebench-parquet-ingestion.js';
import { promoteLiveBenchResults } from './livebench-promotion.js';
import {
  acquireLiveBenchQuestionInventoryEvidence,
  loadLiveBenchQuestionInventoryEvidence,
} from './livebench-question-evidence.js';
import { publishLiveBenchScoreSnapshot } from './livebench-score-publication.js';
import {
  parseWeeklyOrchestrationArguments,
  runWeeklyOrchestration,
  type WeeklyOrchestrationDependencies,
} from './weekly-orchestration.js';
import { runWeeklyPreviewRender } from './weekly-render.js';

const projectDirectory = fileURLToPath(new URL('../../..', import.meta.url));
const rawStorageRoot =
  process.env.RAW_STORAGE_DIR ??
  fileURLToPath(new URL('../../../data/raw', import.meta.url));
const artifactDirectory = fileURLToPath(
  new URL('../../../artifacts', import.meta.url),
);
const summaryPath = fileURLToPath(
  new URL('../../../artifacts/weekly-orchestration.json', import.meta.url),
);
const command = parseWeeklyOrchestrationArguments(process.argv.slice(2));
const pnpmCliPath = process.env.npm_execpath;
if (!pnpmCliPath) {
  throw new Error('npm_execpath is required for shell-free weekly rendering');
}

const { db, pool } = createDatabase();
const dependencies: WeeklyOrchestrationDependencies = {
  acquireQuestionInventory: () =>
    acquireLiveBenchQuestionInventoryEvidence(rawStorageRoot),
  ingestJudgments: () => ingestLiveBenchParquetDataset(db, { rawStorageRoot }),
  reviewAliases: async (ingestionRunId) => {
    const manifest = await syncLiveBenchAliasManifest(db);
    const resolution = await resolveLiveBenchAliases(db, ingestionRunId);
    const persistenceRows = await pool.query<LiveBenchAliasPersistenceRow>(
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
    const persistence = validateLiveBenchAliasPersistence(persistenceRows.rows);
    const review = await getLiveBenchAliasReviewReport(db, ingestionRunId);
    return {
      manifest,
      resolution,
      persistence,
      review: {
        recordsSeen: review.recordsSeen,
        aliasCount: review.aliases.length,
      },
    };
  },
  createReadinessReport: async (ingestionRunId) => {
    const inventory =
      await loadLiveBenchQuestionInventoryEvidence(rawStorageRoot);
    return getLiveBenchAggregationReadinessReport(
      db,
      ingestionRunId,
      inventory,
    );
  },
  promoteResults: (report, options) =>
    promoteLiveBenchResults(
      db,
      report as Parameters<typeof promoteLiveBenchResults>[1],
      options,
    ),
  createScoreSnapshot: (options) =>
    publishLiveBenchScoreSnapshot(db, {
      dryRun: options.dryRun,
      editionDate: undefined,
    }),
  activatePreview: (rankingSnapshotId) =>
    executeEditionCommand(db, {
      action: 'ACTIVATE',
      actor: 'weekly-orchestrator',
      dryRun: false,
      mode: 'PREVIEW',
      snapshotId: rankingSnapshotId,
    }),
  renderPreview: (input) =>
    runWeeklyPreviewRender(
      {
        nodePath: process.execPath,
        pnpmCliPath,
        projectDirectory,
      },
      input,
    ),
  wait: async (milliseconds) =>
    new Promise((resolve) => setTimeout(resolve, milliseconds)),
};

try {
  const summary = await runWeeklyOrchestration(command, dependencies);
  await mkdir(artifactDirectory, { recursive: true });
  await writeFile(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
  console.info(JSON.stringify(summary, null, 2));
  if (summary.status !== 'SUCCEEDED') process.exitCode = 1;
} finally {
  await pool.end();
}
