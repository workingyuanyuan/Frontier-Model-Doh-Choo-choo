import { mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { SourceManifestSchema } from '@llm-bench/benchmark-data';
import {
  GBENCH_AGENTIC_API_URL,
  materializeGbench,
} from './gbench-materializer.js';
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
  const response = await captureArtifact({
    root,
    sourceId: 'gbench',
    url: GBENCH_AGENTIC_API_URL,
    retrievedAt: observedAt,
    mediaType: 'application/json',
    method: 'API_RESPONSE',
    metadata: {
      captureScope: 'complete Agentic Coding rankings JSON',
      renderedAgenticRows: visualRowCount,
    },
    // The API answers 403 to requests that carry no user agent.
    headers: { 'user-agent': 'llm-bench-acquisition' },
  });
  const catalog = await readJson<{
    models: { modelId: string; displayName: string; aliases?: string[] }[];
  }>(join(root, 'data/mappings/models.json'));
  const result = materializeGbench(response.text, {
    evidenceId: response.record.id,
    observedAt,
    visualRowCount,
    models: catalog.models,
  });
  response.record.metadata = {
    ...response.record.metadata,
    rankedRows: result.rankedRows,
    materializedRows: result.candidates.length,
    nonModelRows: result.nonModelRows,
    missingScoreRows: result.missingScoreRows,
  };
  const manifest = SourceManifestSchema.parse({
    schemaVersion: 'source-manifest-v1',
    sourceId: 'gbench',
    displayName: 'GBENCH (Gert Labs)',
    role: 'ORGANIZER',
    baseUrl: 'https://gertlabs.com/rankings',
    targetUrls: [GBENCH_AGENTIC_API_URL],
    benchmarkIds: ['gbench-agentic-coding'],
    accessMethods: ['API_RESPONSE', 'DOM'],
    completeness: {
      expectedCountMethod:
        'Request a limit above the population, require fewer rows than the limit, and compare the rendered Agentic Coding rows with the first 100 API rows.',
      pagination: 'limit query parameter; the page renders the first 100 rows',
      visibleComparisonRequired: true,
    },
    fieldMapping: {
      'data.rankings[].model_id': 'model.rawName',
      'data.rankings[].gscore': 'rawScore; normalizedScore = gscore × 100',
      'data.rankings[].ci_low': 'provenance.confidenceIntervalLow',
      'data.rankings[].ci_high': 'provenance.confidenceIntervalHigh',
    },
    fallbackMethods: ['DOM'],
    lastVerifiedAt: observedAt,
    notes: [
      'Agentic Coding GScore only (2026-11-21 user decision); combined, one-shot and decision-making scores are preserved in raw evidence.',
      'GScore is relative and rebalanced as models and games are added; no benchmark version is published.',
      'No effort, reasoning or harness setting is published per row; these remain null.',
      'Exact catalog display names and aliases resolve existing model identities; baseline and human rows are excluded.',
      'No cost records are materialized.',
    ],
  });
  const directory = join(root, 'data/sources/gbench');
  await mkdir(directory, { recursive: true });
  await writeMetadataJson(join(directory, 'manifest.json'), manifest);
  await writeMetadataJson(join(directory, 'evidence-index.json'), [
    response.record,
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
      rankedRows: result.rankedRows,
      configurations: result.candidates.length,
      nonModelRows: result.nonModelRows,
      costs: 0,
    }),
  );
}

await main();
