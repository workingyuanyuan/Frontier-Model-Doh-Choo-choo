import { mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import {
  SourceManifestSchema,
  deterministicJson,
} from '@llm-bench/benchmark-data';
import {
  MAXXBENCH_PAGE_URL,
  materializeMaxxBench,
} from './maxxbench-materializer.js';
import {
  captureArtifact,
  getWorkspaceRoot,
  writeMetadataJson,
} from './refresh-utils.js';

async function main() {
  const args = process.argv.slice(2);
  const root = resolve(
    args.find((arg) => !arg.startsWith('--')) ?? getWorkspaceRoot(),
  );
  const visualRowCount = Number(
    args.find((arg) => arg.startsWith('--visual-row-count='))?.split('=')[1],
  );
  if (!Number.isInteger(visualRowCount) || visualRowCount <= 0) {
    throw new Error(
      'A verified --visual-row-count=<positive integer> is required',
    );
  }
  const observedAt = new Date().toISOString();
  const page = await captureArtifact({
    root,
    sourceId: 'maxxbench',
    url: MAXXBENCH_PAGE_URL,
    retrievedAt: observedAt,
    mediaType: 'text/html',
    method: 'EMBEDDED_JSON',
    metadata: {
      captureScope:
        'complete HTML with Astro leaderboard and evaluation trials',
      renderedRows: visualRowCount,
    },
  });
  const result = materializeMaxxBench(page.text, {
    evidenceId: page.record.id,
    observedAt,
    visualRowCount,
  });
  page.record.metadata = {
    ...page.record.metadata,
    visibleComparisonMatched: true,
    materializedConfigurations: result.candidates.length,
    materializedCosts: result.costs.length,
  };
  const manifest = SourceManifestSchema.parse({
    schemaVersion: 'source-manifest-v1',
    sourceId: 'maxxbench',
    displayName: 'MaxxBench',
    role: 'ORGANIZER',
    baseUrl: MAXXBENCH_PAGE_URL,
    targetUrls: [MAXXBENCH_PAGE_URL],
    benchmarkIds: ['maxxbench'],
    accessMethods: ['EMBEDDED_JSON', 'DOM'],
    completeness: {
      expectedCountMethod:
        'Match each default visible leaderboard row to Astro models and verify aggregate values against all evaluation trials.',
      pagination: null,
      visibleComparisonRequired: true,
    },
    fieldMapping: {
      'models[].name': 'model.rawName',
      'models[].effort': 'profile.effort',
      'models[].evaluations': 'profile.attempts',
      'models[].maxxBenchScore': 'normalizedScore',
      'models[].averageCost': 'CostRecord.cost',
    },
    fallbackMethods: ['DOM', 'VISUAL'],
    lastVerifiedAt: observedAt,
    notes: [
      'Only default visible leaderboard configurations are materialized.',
      'Benchmark version and unpublished configuration fields remain null.',
      'USD cost is the arithmetic mean over all evaluation attempts.',
    ],
  });
  const directory = join(root, 'data', 'sources', 'maxxbench');
  await mkdir(directory, { recursive: true });
  await Promise.all([
    writeMetadataJson(join(directory, 'manifest.json'), manifest),
    writeMetadataJson(join(directory, 'evidence-index.json'), [page.record]),
    writeFile(
      join(directory, 'candidates.json'),
      deterministicJson(result.candidates),
    ),
    writeFile(join(directory, 'costs.json'), deterministicJson(result.costs)),
    writeFile(join(directory, 'validation-report.md'), result.validationReport),
  ]);
  console.log(
    JSON.stringify({
      configurations: result.candidates.length,
      costs: result.costs.length,
      visibleRows: result.visibleRows,
    }),
  );
}

await main();
