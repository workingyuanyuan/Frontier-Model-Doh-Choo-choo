import { join } from 'node:path';
import {
  captureArtifact,
  getWorkspaceRoot,
  writeSourceSnapshot,
} from './refresh-utils.js';
import {
  materializeSurgePercentLeaderboard,
  surgePercentLeaderboardManifest,
} from './surge-percent-leaderboard.js';
import {
  SURGE_PERCENT_LEADERBOARDS,
  isSurgePercentLeaderboardId,
} from './surge-percent-leaderboard-specs.js';
import { surgeVisualRowCount } from './surge-refresh-utils.js';

/** Usage: refresh-surge-leaderboard <source-id> --visual-row-count=<count> */
async function main() {
  const sourceId = process.argv.slice(2).find((arg) => !arg.startsWith('--'));
  if (!sourceId || !isSurgePercentLeaderboardId(sourceId)) {
    throw new Error(
      `Pass one of: ${Object.keys(SURGE_PERCENT_LEADERBOARDS).join(', ')}`,
    );
  }
  const spec = SURGE_PERCENT_LEADERBOARDS[sourceId];
  const visualRowCount = surgeVisualRowCount(spec.label);
  const root = getWorkspaceRoot();
  const observedAt = new Date().toISOString();
  const page = await captureArtifact({
    root,
    sourceId: spec.sourceId,
    url: spec.pageUrl,
    retrievedAt: observedAt,
    mediaType: 'text/html',
    method: 'DOM',
    metadata: { renderedRows: visualRowCount, scope: 'main leaderboard' },
  });
  const result = materializeSurgePercentLeaderboard(spec, page.text, {
    evidenceId: page.record.id,
    observedAt,
    visualRowCount,
  });
  await writeSourceSnapshot(
    join(root, 'data', 'sources', spec.sourceId),
    surgePercentLeaderboardManifest(spec, observedAt),
    [page.record],
    result.candidates,
    () => result.validationReport,
  );
  console.log(
    JSON.stringify({
      candidates: result.candidates.length,
      renderedRows: result.visibleRows,
    }),
  );
}
await main();
