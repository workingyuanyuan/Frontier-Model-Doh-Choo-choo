import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import {
  SourceManifestSchema,
  deterministicJson,
} from '@llm-bench/benchmark-data';
import {
  DAYJOB_TAX_PAGE_URL,
  materializeDayjobTax,
} from './surge-dayjob-tax-materializer.js';
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
      'First verify the rendered DAYJOB Tax leaderboard, then pass --visual-row-count=<count>',
    );
  const root = getWorkspaceRoot();
  const observedAt = new Date().toISOString();
  const page = await captureArtifact({
    root,
    sourceId: 'surge-dayjob-tax',
    url: DAYJOB_TAX_PAGE_URL,
    retrievedAt: observedAt,
    mediaType: 'text/html',
    method: 'DOM',
    metadata: { renderedRows: visualRowCount, scope: 'main leaderboard' },
  });
  const result = materializeDayjobTax(page.text, {
    evidenceId: page.record.id,
    observedAt,
    visualRowCount,
  });
  const manifest = SourceManifestSchema.parse({
    schemaVersion: 'source-manifest-v1',
    sourceId: 'surge-dayjob-tax',
    displayName: 'Surge AI DAYJOB Tax',
    role: 'ORGANIZER',
    baseUrl: DAYJOB_TAX_PAGE_URL,
    targetUrls: [DAYJOB_TAX_PAGE_URL],
    benchmarkIds: ['dayjob-tax'],
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
      'Main leaderboard Pass@1 percentages at a 95% rubric threshold over 50 tax environments. Tax tasks are not in the public DAYJOB repository; full benchmark access is by request.',
      'Official methodology: https://surgehq.ai/blog/dayjob-tax (2026-10-27). An attempt passes when it satisfies at least 95% of the task criteria; the score is the share of passing attempts. Five attempts per task: the announcement describes per-task outcomes across five attempts and the DAYJOB README identifies five attempts per task for leaderboard runs.',
      'The DAYJOB family harness uses Harbor and OpenHands SDK, with Claude Opus 4.8 grading; exact current per-row tools and harness for Tax remain unconfirmed and null. Benchmark version and leaderboard publication date are unpublished.',
    ],
  });
  const directory = join(root, 'data', 'sources', 'surge-dayjob-tax');
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
