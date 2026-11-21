import { join, resolve } from 'node:path';
import {
  CWE_BENCH_PAGE_URL,
  CWE_BENCH_SOURCE_ID,
  cweBenchManifest,
  materializeCweBench,
} from './cwe-bench-materializer.js';
import {
  captureArtifact,
  getWorkspaceRoot,
  writeSourceSnapshot,
} from './refresh-utils.js';
import { surgeVisualRowCount as visualRowCountArgument } from './surge-refresh-utils.js';

/** Usage: refresh-cwe-bench [root] --visual-row-count=<rendered rows> */
async function main() {
  const root = resolve(
    process.argv.slice(2).find((arg) => !arg.startsWith('--')) ??
      getWorkspaceRoot(),
  );
  const visualRowCount = visualRowCountArgument('CWE-bench');
  const observedAt = new Date().toISOString();
  const page = await captureArtifact({
    root,
    sourceId: CWE_BENCH_SOURCE_ID,
    url: CWE_BENCH_PAGE_URL,
    retrievedAt: observedAt,
    mediaType: 'text/html',
    method: 'DOM',
    metadata: {
      captureScope: 'server-rendered leaderboard, Combined view',
      renderedRows: visualRowCount,
    },
  });
  const result = materializeCweBench(page.text, {
    evidenceId: page.record.id,
    observedAt,
    visualRowCount,
  });
  page.record.metadata = {
    ...page.record.metadata,
    resultsAsOf: result.resultsAsOf,
    visibleComparisonMatched: true,
  };
  const directory = join(root, 'data', 'sources', CWE_BENCH_SOURCE_ID);
  await writeSourceSnapshot(
    directory,
    cweBenchManifest(observedAt, result.visibleRows),
    [page.record],
    result.candidates,
    () => result.validationReport,
  );
  console.log(
    JSON.stringify({
      candidates: result.candidates.length,
      renderedRows: result.visibleRows,
      resultsAsOf: result.resultsAsOf,
    }),
  );
}

await main();
