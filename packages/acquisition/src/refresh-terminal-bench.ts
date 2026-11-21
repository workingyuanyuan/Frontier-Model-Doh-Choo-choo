import { join, resolve } from 'node:path';
import {
  TERMINAL_BENCH_PAGE_URL,
  TERMINAL_BENCH_SOURCE_ID,
  materializeTerminalBench,
  terminalBenchManifest,
} from './terminal-bench-materializer.js';
import {
  captureArtifact,
  getWorkspaceRoot,
  writeSourceSnapshot,
} from './refresh-utils.js';

/** Usage: refresh-terminal-bench [root] --visual-model-count=<rendered rows> */
async function main() {
  const args = process.argv.slice(2);
  const root = resolve(
    args.find((arg) => !arg.startsWith('--')) ?? getWorkspaceRoot(),
  );
  const visualModelCount = Number(
    args.find((arg) => arg.startsWith('--visual-model-count='))?.split('=')[1],
  );
  if (!Number.isInteger(visualModelCount) || visualModelCount < 1)
    throw new Error(
      'First verify the rendered Terminal-Bench table, then pass --visual-model-count=<count>',
    );
  const observedAt = new Date().toISOString();
  const page = await captureArtifact({
    root,
    sourceId: TERMINAL_BENCH_SOURCE_ID,
    url: TERMINAL_BENCH_PAGE_URL,
    retrievedAt: observedAt,
    mediaType: 'text/html',
    method: 'NEXT_RSC',
    metadata: {
      captureScope: 'leaderboard page with embedded Terminal-Bench 4.1 query',
      renderedRows: visualModelCount,
    },
  });
  const result = materializeTerminalBench(page.text, {
    evidenceId: page.record.id,
    observedAt,
    visualModelCount,
  });
  page.record.metadata = {
    ...page.record.metadata,
    configurations: result.configurations,
    distinctModels: result.distinctModels,
    leaderboardUpdatedAt: result.leaderboardUpdatedAt,
    visibleComparisonMatched: true,
  };
  await writeSourceSnapshot(
    join(root, 'data', 'sources', TERMINAL_BENCH_SOURCE_ID),
    terminalBenchManifest(
      observedAt,
      result.configurations,
      result.distinctModels,
    ),
    [page.record],
    result.candidates,
    () => result.validationReport,
  );
  console.log(
    JSON.stringify({
      configurations: result.configurations,
      models: result.distinctModels,
      leaderboardUpdatedAt: result.leaderboardUpdatedAt,
    }),
  );
}

await main();
