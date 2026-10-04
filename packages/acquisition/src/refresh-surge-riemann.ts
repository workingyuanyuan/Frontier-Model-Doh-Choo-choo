import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import {
  SourceManifestSchema,
  deterministicJson,
} from '@llm-bench/benchmark-data';
import {
  RIEMANN_PAGE_URL,
  materializeRiemann,
} from './surge-riemann-materializer.js';
import {
  captureArtifact,
  getWorkspaceRoot,
  writeMetadataJson,
} from './refresh-utils.js';

async function main() {
  const visualRowCount = Number(
    process.argv
      .find((arg) => arg.startsWith('--visual-row-count='))
      ?.split('=')[1],
  );
  if (!Number.isInteger(visualRowCount) || visualRowCount < 1)
    throw new Error(
      'First verify the rendered Riemann-bench leaderboard, then pass --visual-row-count=<count>',
    );
  const root = getWorkspaceRoot();
  const observedAt = new Date().toISOString();
  const page = await captureArtifact({
    root,
    sourceId: 'surge-riemann',
    url: RIEMANN_PAGE_URL,
    retrievedAt: observedAt,
    mediaType: 'text/html',
    method: 'DOM',
    metadata: { renderedRows: visualRowCount, scope: 'main leaderboard' },
  });
  const result = materializeRiemann(page.text, {
    evidenceId: page.record.id,
    observedAt,
    visualRowCount,
  });
  const manifest = SourceManifestSchema.parse({
    schemaVersion: 'source-manifest-v1',
    sourceId: 'surge-riemann',
    displayName: 'Surge AI Riemann-bench',
    role: 'ORGANIZER',
    baseUrl: RIEMANN_PAGE_URL,
    targetUrls: [RIEMANN_PAGE_URL],
    benchmarkIds: ['riemann-bench'],
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
      'Main leaderboard pass rate percentages; private research mathematics problems with programmatically verified answers.',
      'Official methodology: https://surgehq.ai/blog/riemann-bench-a-benchmark-for-moonshot-mathematics and https://arxiv.org/html/2604.06802v3. Historical paper pass@1 uses 100 runs per problem; the blog records removal of an initial one-hour timeout. Current per-row estimator, run count, harness and tools are unconfirmed and remain null.',
      'Per-row trial count, benchmark version and publication date are unpublished.',
    ],
  });
  const directory = join(root, 'data', 'sources', 'surge-riemann');
  await mkdir(directory, { recursive: true });
  await writeMetadataJson(join(directory, 'manifest.json'), manifest);
  await writeMetadataJson(join(directory, 'evidence-index.json'), [
    page.record,
  ]);
  await writeFile(
    join(directory, 'candidates.json'),
    deterministicJson(result.candidates),
  );
  await writeFile(
    join(directory, 'validation-report.md'),
    result.validationReport,
  );
  console.log(
    JSON.stringify({
      candidates: result.candidates.length,
      renderedRows: result.visibleRows,
    }),
  );
}
await main();
