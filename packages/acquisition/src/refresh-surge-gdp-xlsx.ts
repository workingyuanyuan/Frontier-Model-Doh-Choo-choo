import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import {
  SourceManifestSchema,
  deterministicJson,
} from '@llm-bench/benchmark-data';
import {
  GDP_XLSX_PAGE_URL,
  materializeGdpXlsx,
} from './surge-gdp-xlsx-materializer.js';
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
      'First verify the rendered GDP.xlsx leaderboard, then pass --visual-row-count=<count>',
    );
  const root = getWorkspaceRoot();
  const observedAt = new Date().toISOString();
  const page = await captureArtifact({
    root,
    sourceId: 'surge-gdp-xlsx',
    url: GDP_XLSX_PAGE_URL,
    retrievedAt: observedAt,
    mediaType: 'text/html',
    method: 'DOM',
    metadata: { renderedRows: visualRowCount, scope: 'main leaderboard' },
  });
  const result = materializeGdpXlsx(page.text, {
    evidenceId: page.record.id,
    observedAt,
    visualRowCount,
  });
  const manifest = SourceManifestSchema.parse({
    schemaVersion: 'source-manifest-v1',
    sourceId: 'surge-gdp-xlsx',
    displayName: 'Surge AI GDP.xlsx',
    role: 'ORGANIZER',
    baseUrl: GDP_XLSX_PAGE_URL,
    targetUrls: [GDP_XLSX_PAGE_URL],
    benchmarkIds: ['gdp-xlsx'],
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
      'Main leaderboard benchmark mean reward percentages. GDP.xlsx covers 70 professional spreadsheet tasks across 12 domains.',
      'Official methodology: https://surgehq.ai/blog/gdp-xlsx and https://github.com/surge-ai/gdp-xlsx#grading. Benchmark score is the unweighted mean of task scores, each averaging five trial rewards excluding errored trials. A trial reward is the mean of binary rubric verdicts. The README explicitly specifies five attempts per task.',
      'Published harness uses Harbor and OpenHands SDK, with Gemini 3.8 Flash grading final response text; exact current per-row tools and harness remain unconfirmed and null. Benchmark version and leaderboard publication date are unpublished.',
    ],
  });
  const directory = join(root, 'data', 'sources', 'surge-gdp-xlsx');
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
