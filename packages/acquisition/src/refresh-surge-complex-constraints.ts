import {
  readSurgeBaseline,
  surgeVisualRowCount,
} from './surge-refresh-utils.js';
import { join } from 'node:path';
import { SourceManifestSchema } from '@llm-bench/benchmark-data';
import {
  COMPLEX_CONSTRAINTS_PAGE_URL,
  materializeComplexConstraints,
} from './surge-complex-constraints-materializer.js';
import {
  captureArtifact,
  getWorkspaceRoot,
  writeSourceSnapshot,
} from './refresh-utils.js';
import { retainSurgeRows, surgeRetentionReport } from './surge-version.js';

async function main() {
  const visualRowCount = surgeVisualRowCount('ComplexConstraints');
  const root = getWorkspaceRoot();
  const directory = join(root, 'data', 'sources', 'surge-complex-constraints');
  const { previousCandidates, previousEvidence } = await readSurgeBaseline(
    root,
    directory,
  );
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
  const merged = retainSurgeRows(result.candidates, previousCandidates, [
    ...previousEvidence,
    page.record,
  ]);
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
      '.lead-hero-title h1 .v2-chip': 'benchmarkVersion',
    },
    fallbackMethods: ['VISUAL'],
    lastVerifiedAt: observedAt,
    notes: [
      'Main leaderboard all-criteria task pass@1 percentages; professional instruction following.',
      'The official harness defines all_pass/mean as the leaderboard task pass rate; mean_criteria/mean is separate.',
      `Current benchmark version: ${result.benchmarkVersion ?? 'unpublished'}. Per-row trial count and publication date remain unpublished.`,
      `Current rendered rows: ${result.visibleRows}; preserved rows omitted from the current leaderboard: ${merged.retained.length}. Preserved rows keep their original version, observedAt, scores and Evidence; they are not current-version reruns.`,
    ],
  });
  await writeSourceSnapshot(
    directory,
    manifest,
    merged.evidence,
    merged.candidates,
    () =>
      surgeRetentionReport(result.validationReport, result.visibleRows, merged),
  );
  console.log(
    JSON.stringify({
      candidates: merged.candidates.length,
      retained: merged.retained.length,
      benchmarkVersion: result.benchmarkVersion,
      renderedRows: result.visibleRows,
    }),
  );
}
await main();
