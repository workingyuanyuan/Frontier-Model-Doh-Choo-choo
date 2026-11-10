import { surgeVisualRowCount } from './surge-refresh-utils.js';
import { join } from 'node:path';
import { SourceManifestSchema } from '@llm-bench/benchmark-data';
import {
  CORECRAFT_PAGE_URL,
  materializeCorecraft,
} from './surge-corecraft-materializer.js';
import {
  captureArtifact,
  getWorkspaceRoot,
  writeSourceSnapshot,
} from './refresh-utils.js';

async function main() {
  const visualRowCount = surgeVisualRowCount('CoreCraft');
  const root = getWorkspaceRoot();
  const observedAt = new Date().toISOString();
  const page = await captureArtifact({
    root,
    sourceId: 'surge-corecraft',
    url: CORECRAFT_PAGE_URL,
    retrievedAt: observedAt,
    mediaType: 'text/html',
    method: 'DOM',
    metadata: { renderedRows: visualRowCount, scope: 'main leaderboard' },
  });
  const result = materializeCorecraft(page.text, {
    evidenceId: page.record.id,
    observedAt,
    visualRowCount,
  });
  const manifest = SourceManifestSchema.parse({
    schemaVersion: 'source-manifest-v1',
    sourceId: 'surge-corecraft',
    displayName: 'Surge AI CoreCraft',
    role: 'ORGANIZER',
    baseUrl: CORECRAFT_PAGE_URL,
    targetUrls: [CORECRAFT_PAGE_URL],
    benchmarkIds: ['enterprisebench-corecraft'],
    accessMethods: ['DOM'],
    completeness: {
      expectedCountMethod:
        'Compare main leaderboard rows with rendered browser count, validate one numeric score and percent marker per row, and cross-check any numeric data-score attributes against visible text.',
      pagination: null,
      visibleComparisonRequired: true,
    },
    fieldMapping: {
      '.head-rank-table-brand + .head-rank-table-name':
        'model.rawName / profile.effort / profile.thinking',
      '[data-score] numeric displayed text': 'rawScore / normalizedScore',
    },
    fallbackMethods: ['VISUAL'],
    lastVerifiedAt: observedAt,
    notes: [
      'Main leaderboard task pass rate percentages; enterprise customer support agent tasks requiring every rubric criterion to pass.',
      'Official methodology: https://surgehq.ai/blog/enterprisebench-corecraft and https://arxiv.org/html/2602.16179v5. Current per-row harness and tool metadata remain null.',
      'Per-row trial count, benchmark version and publication date are unpublished.',
    ],
  });
  const directory = join(root, 'data', 'sources', 'surge-corecraft');
  await writeSourceSnapshot(
    directory,
    manifest,
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
