import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import {
  SourceManifestSchema,
  deterministicJson,
} from '@llm-bench/benchmark-data';
import {
  COMPLEX_CONSTRAINTS_PAGE_URL,
  materializeComplexConstraints,
} from './surge-complex-constraints-materializer.js';
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
      'First verify the rendered ComplexConstraints leaderboard, then pass --visual-row-count=<count>',
    );
  const root = getWorkspaceRoot();
  const observedAt = new Date().toISOString();
  const page = await captureArtifact({
    root,
    sourceId: 'surge-complex-constraints',
    url: COMPLEX_CONSTRAINTS_PAGE_URL,
    retrievedAt: observedAt,
    mediaType: 'text/html',
    method: 'DOM',
    metadata: { renderedRows: visualRowCount, scope: 'main leaderboard' },
  });
  const result = materializeComplexConstraints(page.text, {
    evidenceId: page.record.id,
    observedAt,
    visualRowCount,
  });
  const manifest = SourceManifestSchema.parse({
    schemaVersion: 'source-manifest-v1',
    sourceId: 'surge-complex-constraints',
    displayName: 'Surge AI ComplexConstraints',
    role: 'ORGANIZER',
    baseUrl: COMPLEX_CONSTRAINTS_PAGE_URL,
    targetUrls: [COMPLEX_CONSTRAINTS_PAGE_URL],
    benchmarkIds: ['complex-constraints'],
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
      'Main leaderboard all-criteria task pass@1 percentages; professional instruction following.',
      'The official harness defines all_pass/mean as the leaderboard task pass rate; mean_criteria/mean is separate.',
      'Per-row trial count, benchmark version and publication date are unpublished.',
    ],
  });
  const directory = join(root, 'data', 'sources', 'surge-complex-constraints');
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
