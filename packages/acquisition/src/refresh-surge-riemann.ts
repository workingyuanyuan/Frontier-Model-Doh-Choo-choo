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
  RIEMANN_PAGE_URL,
  materializeRiemann,
} from './surge-riemann-materializer.js';
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
      'First verify the rendered Riemann-bench leaderboard, then pass --visual-row-count=<count>',
    );
  const root = getWorkspaceRoot();
  const directory = join(root, 'data', 'sources', 'surge-riemann');
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
  const merged = retainSurgeRows(result.candidates, previousCandidates, [
    ...previousEvidence,
    page.record,
  ]);
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
      '.lead-hero-title h1 .v2-chip': 'benchmarkVersion',
    },
    fallbackMethods: ['VISUAL'],
    lastVerifiedAt: observedAt,
    notes: [
      'Main leaderboard pass rate percentages; private research mathematics problems with programmatically verified answers.',
      'Official methodology: https://surgehq.ai/blog/riemann-bench-a-benchmark-for-moonshot-mathematics and https://arxiv.org/html/2604.06802v3. Historical paper pass@1 uses 100 runs per problem; the blog records removal of an initial one-hour timeout. Current per-row estimator, run count, harness and tools are unconfirmed and remain null.',
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
