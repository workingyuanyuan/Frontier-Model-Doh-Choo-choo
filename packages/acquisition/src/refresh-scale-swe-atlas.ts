import { mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { SourceManifestSchema } from '@llm-bench/benchmark-data';
import {
  SCALE_SWE_ATLAS_PAGE_URL,
  materializeScaleSweAtlas,
} from './scale-swe-atlas-materializer.js';
import {
  captureArtifact,
  getWorkspaceRoot,
  readJson,
  writeMetadataJson,
} from './refresh-utils.js';

async function main() {
  const args = process.argv.slice(2).filter((argument) => argument !== '--');
  const root = resolve(
    args.find((argument) => !argument.startsWith('--')) ?? getWorkspaceRoot(),
  );
  const visualRowCount = Number(
    args
      .find((argument) => argument.startsWith('--visual-row-count='))
      ?.split('=')[1],
  );
  if (!Number.isInteger(visualRowCount) || visualRowCount <= 0)
    throw new Error(
      'A verified --visual-row-count=<positive integer> is required',
    );
  const observedAt = new Date().toISOString();
  const page = await captureArtifact({
    root,
    sourceId: 'scale-swe-atlas',
    url: SCALE_SWE_ATLAS_PAGE_URL,
    retrievedAt: observedAt,
    mediaType: 'text/html',
    method: 'NEXT_RSC',
    metadata: {
      captureScope: 'complete HTML with Next RSC leaderboard variants',
      renderedOverallRows: visualRowCount,
    },
  });
  const catalog = await readJson<{
    models: { modelId: string; displayName: string; aliases?: string[] }[];
  }>(join(root, 'data/mappings/models.json'));
  const result = materializeScaleSweAtlas(page.text, {
    evidenceId: page.record.id,
    observedAt,
    visualRowCount,
    models: catalog.models,
  });
  page.record.metadata = {
    ...page.record.metadata,
    materializedOverallRows: result.candidates.length,
    rawVariantCounts: result.rawVariantCounts,
    confidenceIntervals: result.confidenceIntervals,
    excludedFromScoring: ['qna', 'testwriting', 'refactoring'],
  };
  const manifest = SourceManifestSchema.parse({
    schemaVersion: 'source-manifest-v1',
    sourceId: 'scale-swe-atlas',
    displayName: 'Scale SWE Atlas',
    role: 'ORGANIZER',
    baseUrl: SCALE_SWE_ATLAS_PAGE_URL,
    targetUrls: [SCALE_SWE_ATLAS_PAGE_URL],
    benchmarkIds: ['swe-atlas'],
    accessMethods: ['NEXT_RSC', 'DOM'],
    completeness: {
      expectedCountMethod:
        'Compare rendered Overall population with complete Next RSC overall variant entries.',
      pagination: null,
      visibleComparisonRequired: true,
    },
    fieldMapping: {
      'variants[overall].entries[].model': 'model.rawName',
      'variants[overall].entries[].score': 'normalizedScore',
      'variants[overall].entries[].confidenceInterval_upper':
        'Evidence.metadata.confidenceIntervals; provenance.confidenceIntervalUpper',
      'variants[overall].entries[].confidenceInterval_lower':
        'Evidence.metadata.confidenceIntervals; provenance.confidenceIntervalLower',
    },
    fallbackMethods: ['DOM', 'VISUAL'],
    lastVerifiedAt: observedAt,
    notes: [
      'Overall only, benchmark version v1.1. QnA, Test Writing and Refactoring are preserved in raw evidence.',
      'Exact catalog display names and aliases resolve existing model identities; unresolved identities remain null.',
      'Effort is retained only when explicitly named. Configuration fields not disclosed for each model remain null.',
      'Confidence interval fields remain verbatim; unpublished confidence level and missing lower bound remain unknown.',
      'No cost records are materialized.',
    ],
  });
  const directory = join(root, 'data/sources/scale-swe-atlas');
  await mkdir(directory, { recursive: true });
  await writeMetadataJson(join(directory, 'manifest.json'), manifest);
  await writeMetadataJson(join(directory, 'evidence-index.json'), [
    page.record,
  ]);
  await writeMetadataJson(
    join(directory, 'candidates.json'),
    result.candidates,
  );
  await writeMetadataJson(join(directory, 'costs.json'), []);
  await writeFile(
    join(directory, 'validation-report.md'),
    result.validationReport,
  );
  console.log(
    JSON.stringify({
      configurations: result.candidates.length,
      visibleRows: result.visibleRows,
      costs: 0,
      rawVariantCounts: result.rawVariantCounts,
    }),
  );
}

await main();
