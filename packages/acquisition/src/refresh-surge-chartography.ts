import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import {
  SourceManifestSchema,
  deterministicJson,
} from '@llm-bench/benchmark-data';
import {
  CHARTOGRAPHY_PAGE_URL,
  materializeChartography,
} from './surge-chartography-materializer.js';
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
      'First verify the rendered Chartography leaderboard, then pass --visual-row-count=<count>',
    );
  const root = getWorkspaceRoot();
  const observedAt = new Date().toISOString();
  const page = await captureArtifact({
    root,
    sourceId: 'surge-chartography',
    url: CHARTOGRAPHY_PAGE_URL,
    retrievedAt: observedAt,
    mediaType: 'text/html',
    method: 'DOM',
    metadata: { renderedRows: visualRowCount, scope: 'main leaderboard' },
  });
  const result = materializeChartography(page.text, {
    evidenceId: page.record.id,
    observedAt,
    visualRowCount,
  });
  const manifest = SourceManifestSchema.parse({
    schemaVersion: 'source-manifest-v1',
    sourceId: 'surge-chartography',
    displayName: 'Surge AI Chartography',
    role: 'ORGANIZER',
    baseUrl: CHARTOGRAPHY_PAGE_URL,
    targetUrls: [CHARTOGRAPHY_PAGE_URL],
    benchmarkIds: ['chartography'],
    accessMethods: ['DOM'],
    completeness: {
      expectedCountMethod:
        'Compare main leaderboard rows with rendered browser count and cross-check each data-score attribute against visible text.',
      pagination: null,
      visibleComparisonRequired: true,
    },
    fieldMapping: {
      '.head-rank-table-brand + .head-rank-table-name':
        'model.rawName / profile.effort / profile.thinking',
      '[data-score]': 'rawScore / normalizedScore',
    },
    fallbackMethods: ['VISUAL'],
    lastVerifiedAt: observedAt,
    notes: [
      'Main leaderboard pass@1 percentages; reasoning primary, knowledge secondary.',
      'Separate cost/token chart configurations are outside this snapshot.',
      'Per-row trial count, benchmark version and publication date are unpublished.',
    ],
  });
  const directory = join(root, 'data', 'sources', 'surge-chartography');
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
