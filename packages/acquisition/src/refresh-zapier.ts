import { writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

import {
  SourceManifestSchema,
  type CandidateResult,
  type CostRecord,
} from '@llm-bench/benchmark-data';

import {
  ZAPIER_BENCHMARK_ID,
  ZAPIER_DEDICATED_NOTE,
  ZAPIER_PAGE_URL,
  ZAPIER_PROMO_NOTE,
  ZAPIER_ROUTE_FEATURE,
  ZAPIER_SOURCE_ID,
  findZapierRouteModule,
  materializeZapier,
} from './zapier-materializer.js';
import {
  captureArtifact,
  getWorkspaceRoot,
  manifestJson,
  prettyDeterministicJson,
  previousSnapshotValue,
  readJson,
  readText,
  snapshotDeltaMarkdown,
} from './refresh-utils.js';

async function fetchModuleText(url: string): Promise<string> {
  const response = await fetch(url, { signal: AbortSignal.timeout(120_000) });
  if (!response.ok) throw new Error(`${url} returned HTTP ${response.status}`);
  return response.text();
}

async function main() {
  const rootArgument = process.argv
    .slice(2)
    .find((argument) => !argument.startsWith('--'));
  const root = resolve(rootArgument ?? getWorkspaceRoot());
  const retrievedAt = new Date().toISOString();
  const sourceDirectory = join(root, 'data', 'sources', ZAPIER_SOURCE_ID);

  const previousCandidates = await readJson<CandidateResult[]>(
    join(sourceDirectory, 'candidates.json'),
  ).catch(() => [] as CandidateResult[]);
  const previousCosts = await readJson<CostRecord[]>(
    join(sourceDirectory, 'costs.json'),
  ).catch(() => [] as CostRecord[]);
  const previousReport = await readText(
    join(sourceDirectory, 'validation-report.md'),
  ).catch(() => '');

  const page = await captureArtifact({
    root,
    sourceId: ZAPIER_SOURCE_ID,
    url: ZAPIER_PAGE_URL,
    retrievedAt,
    mediaType: 'text/html',
    method: 'DOM',
    metadata: { captureScope: 'official AutomationBench page and module list' },
  });
  const found = await findZapierRouteModule(page.text, fetchModuleText);
  const routeModule = await captureArtifact({
    root,
    sourceId: ZAPIER_SOURCE_ID,
    url: found.url,
    retrievedAt,
    mediaType: 'text/javascript',
    method: 'EMBEDDED_JSON',
    metadata: {
      captureScope: 'Framer route module containing AutomationBench table',
      selectedByContentFeature: ZAPIER_ROUTE_FEATURE,
    },
  });

  const result = materializeZapier(routeModule.text, {
    moduleEvidenceId: routeModule.record.id,
    pageEvidenceId: page.record.id,
    moduleUrl: found.url,
    observedAt: retrievedAt,
    discoveredModuleCount: found.discoveredModuleCount,
  });

  const previousCandidateCount = previousSnapshotValue(
    previousReport,
    'Leaderboard rows parsed',
    previousSnapshotValue(
      previousReport,
      'CandidateResults',
      previousCandidates.length,
    ),
  );
  if (
    previousCandidateCount > 0 &&
    result.candidates.length < previousCandidateCount
  ) {
    throw new Error(
      `Zapier candidate row count decreased from ${previousCandidateCount} to ${result.candidates.length}`,
    );
  }

  page.record.metadata = {
    ...page.record.metadata,
    discoveredModuleCount: found.discoveredModuleCount,
    selectedModuleUrl: found.url,
  };
  routeModule.record.metadata = {
    ...routeModule.record.metadata,
    automationBenchVersion: result.version,
    parsedRows: result.rowCount,
    maximumRank: result.maxRank,
    costRecords: result.costs.length,
  };

  const delta = snapshotDeltaMarkdown([
    {
      label: 'Candidate rows',
      previous: previousCandidateCount,
      refreshed: result.candidates.length,
    },
    {
      label: 'Cost records',
      previous: previousSnapshotValue(
        previousReport,
        'Cost records',
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
    sourceId: ZAPIER_SOURCE_ID,
    displayName: 'Zapier AutomationBench official leaderboard',
    role: 'ORGANIZER',
    baseUrl: 'https://zapier.com',
    targetUrls: [ZAPIER_PAGE_URL, found.url],
    benchmarkIds: [ZAPIER_BENCHMARK_ID],
    accessMethods: ['DOM', 'EMBEDDED_JSON'],
    completeness: {
      expectedCountMethod:
        'Enumerate every .mjs URL in the official Framer page, select the unique module containing task_completed_correctly, parse every four-column leaderboard row, and require maximum rank to equal parsed row count.',
      pagination: null,
      visibleComparisonRequired: true,
    },
    fieldMapping: {
      'route module leaderboard model': 'model.rawName / profile.effort',
      'route module leaderboard score':
        'rawScore and normalizedScore for task_completed_correctly',
      'route module leaderboard Cost / task': 'CostRecord.cost',
      'route module version': 'benchmarkVersion',
    },
    fallbackMethods: ['DOM', 'VISUAL'],
    lastVerifiedAt: retrievedAt,
    notes: [
      `AutomationBench version ${result.version}; ${result.rowCount} rows and maximum rank ${result.maxRank}.`,
      `The route module is discovered by the content feature ${ZAPIER_ROUTE_FEATURE}; deployment hashes are never hard-coded.`,
      'API-mode task_completed_correctly is the strict headline metric; partial_credit is diagnostic-only and not materialized.',
      'User ruling 2026-08-22: all Zapier scores and costs remain EXCLUDED until a separate source-adoption review after the N phase.',
      `Starred standard price ruling: ${ZAPIER_PROMO_NOTE}`,
      'Raw — means missing cost and emits no CostRecord.',
      `Dedicated-deployment price ruling: ${ZAPIER_DEDICATED_NOTE} The score value remains preserved in the excluded candidate, but the incomparable cost emits no CostRecord.`,
    ],
  });

  const evidenceRecords = [page.record, routeModule.record].toSorted(
    (left, right) => left.requestUrl.localeCompare(right.requestUrl),
  );
  await Promise.all([
    writeFile(
      join(sourceDirectory, 'evidence-index.json'),
      prettyDeterministicJson(evidenceRecords),
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
    writeFile(join(sourceDirectory, 'manifest.json'), manifestJson(manifest)),
  ]);

  console.log(
    JSON.stringify({
      version: result.version,
      modules: found.discoveredModuleCount,
      rows: result.rowCount,
      maxRank: result.maxRank,
      costs: result.costs.length,
      unresolvedRows: result.unresolvedRowsCount,
      excludedRows: result.excludedCandidatesCount,
    }),
  );
}

await main();
