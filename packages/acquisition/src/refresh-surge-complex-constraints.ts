import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { existsSync } from 'node:fs';
import {
  CandidateResultSchema,
  EvidenceRecordSchema,
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
import { retainSurgeRows, surgeRetentionReport } from './surge-version.js';

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
  const directory = join(root, 'data', 'sources', 'surge-complex-constraints');
  const baselineOption = process.argv
    .find((arg) => arg.startsWith('--baseline-directory='))
    ?.slice('--baseline-directory='.length);
  const baseline = baselineOption ? resolve(root, baselineOption) : directory;
  if (
    baselineOption &&
    (!existsSync(join(baseline, 'candidates.json')) ||
      !existsSync(join(baseline, 'evidence-index.json')))
  ) {
    throw new Error(
      'Baseline directory must contain candidates.json and evidence-index.json',
    );
  }
  const previousCandidates = existsSync(join(baseline, 'candidates.json'))
    ? CandidateResultSchema.array().parse(
        JSON.parse(await readFile(join(baseline, 'candidates.json'), 'utf8')),
      )
    : [];
  const previousEvidence = existsSync(join(baseline, 'evidence-index.json'))
    ? EvidenceRecordSchema.array().parse(
        JSON.parse(
          await readFile(join(baseline, 'evidence-index.json'), 'utf8'),
        ),
      )
    : [];
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
  await mkdir(directory, { recursive: true });
  await writeMetadataJson(join(directory, 'manifest.json'), manifest);
  await writeMetadataJson(
    join(directory, 'evidence-index.json'),
    merged.evidence,
  );
  await writeFile(
    join(directory, 'candidates.json'),
    deterministicJson(merged.candidates),
  );
  await writeFile(
    join(directory, 'validation-report.md'),
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
