import { mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import {
  SourceManifestSchema,
  deterministicJson,
} from '@llm-bench/benchmark-data';
import {
  FRONTIER_SWE_PAGE_URL,
  materializeFrontierSwe,
} from './frontier-swe-materializer.js';
import {
  captureArtifact,
  getWorkspaceRoot,
  writeMetadataJson,
} from './refresh-utils.js';

async function main() {
  const root = resolve(process.argv[2] ?? getWorkspaceRoot());
  const observedAt = new Date().toISOString();
  const page = await captureArtifact({
    root,
    sourceId: 'frontier-swe',
    url: FRONTIER_SWE_PAGE_URL,
    retrievedAt: observedAt,
    mediaType: 'text/html',
    method: 'EMBEDDED_JSON',
    metadata: { version: '2', metric: 'mean@5', scope: 'all configurations' },
  });
  const result = materializeFrontierSwe(page.text, {
    evidenceId: page.record.id,
    observedAt,
  });
  page.record.metadata = {
    ...page.record.metadata,
    configurations: result.candidates.length,
    serverRenderedRowsMatched: result.visibleRows,
  };
  const manifest = SourceManifestSchema.parse({
    schemaVersion: 'source-manifest-v1',
    sourceId: 'frontier-swe',
    displayName: 'FrontierSWE V2',
    role: 'ORGANIZER',
    baseUrl: FRONTIER_SWE_PAGE_URL,
    targetUrls: [FRONTIER_SWE_PAGE_URL],
    benchmarkIds: ['frontier-swe-v2'],
    accessMethods: ['EMBEDDED_JSON', 'DOM'],
    completeness: {
      expectedCountMethod:
        'Cross-check all entries.abs.mean model/harness identities against the coverage matrix and server-rendered leaderboard scores.',
      pagination: null,
      visibleComparisonRequired: true,
    },
    fieldMapping: {
      'entries.abs.mean[].model': 'model.rawName',
      'entries.abs.mean[].harness': 'profile.harness',
      'entries.abs.mean[].overall': 'normalizedScore',
    },
    fallbackMethods: ['DOM', 'VISUAL'],
    lastVerifiedAt: observedAt,
    notes: [
      'Mean@5 percentage across V2 tasks; benchmark scope is manual profile comparisons.',
      'Source reasoning effort is unpublished and preserved as null.',
    ],
  });
  const directory = join(root, 'data', 'sources', 'frontier-swe');
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
      configurations: result.candidates.length,
      visibleRowsMatched: result.visibleRows,
    }),
  );
}
await main();
