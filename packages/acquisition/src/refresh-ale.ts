import { mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

import { SourceManifestSchema } from '@llm-bench/benchmark-data';

import { acquisitionClient } from './safe-network.js';
import { mapAcquisitionItems } from './acquisition-policy.js';
import {
  ALE_API_FEATURE,
  ALE_BENCHMARK_ID,
  ALE_ORIGIN,
  ALE_PAGE_URL,
  ALE_SOURCE_ID,
  aleApiUrl,
  extractAleLeaderboardBundleUrls,
  materializeAle,
  parseAlePageVersion,
} from './ale-materializer.js';
import {
  captureArtifact,
  getWorkspaceRoot,
  prettyDeterministicJson,
  previousSnapshotValue,
  readOptionalSnapshotComparison,
  snapshotDeltaMarkdown,
  writeMetadataJson,
} from './refresh-utils.js';

async function main() {
  const rootArgument = process.argv
    .slice(2)
    .find((argument) => !argument.startsWith('--'));
  const root = resolve(rootArgument ?? getWorkspaceRoot());
  const retrievedAt = new Date().toISOString();
  const sourceDirectory = join(root, 'data', 'sources', ALE_SOURCE_ID);
  await mkdir(sourceDirectory, { recursive: true });

  const { previousCandidates, previousCosts, previousReport } =
    await readOptionalSnapshotComparison(sourceDirectory);

  const page = await captureArtifact({
    root,
    sourceId: ALE_SOURCE_ID,
    url: ALE_PAGE_URL,
    retrievedAt,
    mediaType: 'text/html',
    method: 'DOM',
    metadata: { captureScope: 'official leaderboard page (version header)' },
  });
  const version = parseAlePageVersion(page.text);

  // The page is a client shell: confirm from its own bundle that the
  // leaderboard reads the versioned endpoint before trusting that endpoint.
  const bundleUrls = extractAleLeaderboardBundleUrls(page.text);
  if (bundleUrls.length === 0) {
    throw new Error('ALE leaderboard page references no leaderboard bundle');
  }
  const bundles = await mapAcquisitionItems(
    bundleUrls,
    acquisitionClient.budget,
    async (url) =>
      captureArtifact({
        root,
        sourceId: ALE_SOURCE_ID,
        url,
        retrievedAt,
        mediaType: 'text/javascript',
        method: 'EMBEDDED_JSON',
        metadata: { captureScope: 'leaderboard page bundle (data endpoint)' },
      }),
  );
  const endpointBundles = bundles.filter(({ text }) =>
    text.includes(ALE_API_FEATURE),
  );
  if (endpointBundles.length !== 1) {
    throw new Error(
      `Expected one ALE leaderboard bundle that fetches ${ALE_API_FEATURE}; found ${endpointBundles.length}`,
    );
  }
  const bundle = endpointBundles[0]!;

  const apiUrl = aleApiUrl(version);
  const api = await captureArtifact({
    root,
    sourceId: ALE_SOURCE_ID,
    url: apiUrl,
    retrievedAt,
    mediaType: 'application/json',
    method: 'API_RESPONSE',
    metadata: { captureScope: 'complete leaderboard data', version },
  });

  const result = materializeAle(api.text, {
    apiEvidenceId: api.record.id,
    pageEvidenceId: page.record.id,
    apiUrl,
    observedAt: retrievedAt,
    version,
  });

  const previousRows = previousSnapshotValue(
    previousReport,
    'Leaderboard rows parsed',
    previousCandidates.length,
  );
  if (previousRows > 0 && result.candidates.length < previousRows) {
    throw new Error(
      `ALE row count decreased from ${previousRows} to ${result.candidates.length}`,
    );
  }

  page.record.metadata = { ...page.record.metadata, version };
  bundle.record.metadata = {
    ...bundle.record.metadata,
    endpointFeature: ALE_API_FEATURE,
  };
  api.record.metadata = {
    ...api.record.metadata,
    rows: result.rowCount,
    resultsUpdatedAt: result.resultsUpdatedAt,
    costRatesAsOf: result.costRatesAsOf,
    benchmarkCommit: result.benchmarkCommit,
  };

  const delta = snapshotDeltaMarkdown([
    {
      label: 'Candidate rows',
      previous: previousRows,
      refreshed: result.candidates.length,
    },
    {
      label: 'Cost records',
      previous: previousSnapshotValue(
        previousReport,
        'Cost records emitted',
        previousCosts.length,
      ),
      refreshed: result.costs.length,
    },
    {
      label: 'Canonically unresolved rows',
      previous: previousSnapshotValue(
        previousReport,
        'Canonically unresolved rows',
        previousCandidates.filter(
          ({ model }) => model.canonicalModelId === null,
        ).length,
      ),
      refreshed: result.unresolvedRowsCount,
    },
  ]);

  const manifest = SourceManifestSchema.parse({
    schemaVersion: 'source-manifest-v1',
    sourceId: ALE_SOURCE_ID,
    displayName: "Agents' Last Exam official leaderboard",
    role: 'ORGANIZER',
    baseUrl: ALE_ORIGIN,
    targetUrls: [ALE_PAGE_URL, bundle.record.requestUrl, apiUrl],
    benchmarkIds: [ALE_BENCHMARK_ID],
    accessMethods: ['API_RESPONSE', 'DOM', 'EMBEDDED_JSON'],
    completeness: {
      expectedCountMethod:
        'Read the version from the page header and leaderboard version prop, confirm the page bundle fetches the versioned endpoint, then parse every overall row and require the linux and windows platform rows of each configuration to add up to its passes and tasks.',
      pagination: null,
      visibleComparisonRequired: false,
    },
    fieldMapping: {
      'rows[].model': 'model.rawName',
      'rows[].harness': 'profile.harness',
      'rows[].harnessVariant': 'profile.effort (reasoning-<effort>)',
      'rows[].avgScore': 'rawScore and normalizedScore (× 100)',
      'rows[].passRate': 'provenance only (diagnostic)',
      'rows[].totalCostUsd / rows[].tasks': 'CostRecord.cost (USD per task)',
      resultsUpdatedAt: 'sourcePublishedAt',
    },
    fallbackMethods: ['DOM', 'VISUAL'],
    lastVerifiedAt: retrievedAt,
    notes: [
      `ALE v${version}; ${result.rowCount} rows; results updated ${result.resultsUpdatedAt}; list cost rates as of ${result.costRatesAsOf}; task definitions commit ${result.benchmarkCommit}.`,
      'Organizer: UC Berkeley RDI. Who executes each run (organizer or vendor submission) is not stated by the board or the repository README: unknown.',
      'The page is a client shell; its leaderboard bundle is discovered from the HTML and must fetch the versioned endpoint. Deployment hashes are never hard-coded.',
      'Score is avgScore × 100; passRate is diagnostic only. Cost is totalCostUsd / tasks at list prices.',
      `Rows that cover fewer tasks than the split are included and disclosed: ${result.partialCoverageRows.join('; ') || 'none'}.`,
      'A canonical model and effort published under more than one harness is excluded until reviewed.',
      `Exact catalog identities only; ${result.unresolvedRowsCount} rows remain unresolved.`,
    ],
  });

  const evidenceRecords = [page.record, bundle.record, api.record].toSorted(
    (left, right) => left.requestUrl.localeCompare(right.requestUrl),
  );
  await Promise.all([
    writeMetadataJson(
      join(sourceDirectory, 'evidence-index.json'),
      evidenceRecords,
    ),
    writeFile(
      join(sourceDirectory, 'candidates.json'),
      prettyDeterministicJson(result.candidates),
    ),
    writeFile(
      join(sourceDirectory, 'costs.json'),
      prettyDeterministicJson(result.costs),
    ),
    writeFile(
      join(sourceDirectory, 'validation-report.md'),
      `${result.validationReport.trimEnd()}\n\n${delta}`,
    ),
    writeMetadataJson(join(sourceDirectory, 'manifest.json'), manifest),
  ]);

  console.log(
    JSON.stringify({
      version,
      rows: result.rowCount,
      costs: result.costs.length,
      unresolvedRows: result.unresolvedRowsCount,
      excludedRows: result.excludedCandidatesCount,
      partialCoverageRows: result.partialCoverageRows.length,
    }),
  );
}

await main();
