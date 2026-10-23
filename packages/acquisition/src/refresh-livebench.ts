import { writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

import {
  SourceManifestSchema,
  deterministicJson,
  type CandidateResult,
  type CostRecord,
} from '@llm-bench/benchmark-data';

import {
  extractLiveBenchMetadata,
  liveBenchExportOnlyNames,
  liveBenchCollapsedVariants,
} from './livebench-materializer.js';
import {
  LIVEBENCH2_SUITES,
  extractLiveBench2Release,
} from './livebench2-materializer.js';
import {
  LIVEBENCH_V1_RETAINED,
  buildLiveBenchSnapshot,
  type LiveBenchFile,
} from './livebench-snapshot.js';
import {
  captureArtifact,
  getWorkspaceRoot,
  prettyDeterministicJson,
  writeMetadataJson,
  previousSnapshotValue,
  readJson,
  readText,
  snapshotDeltaMarkdown,
  type CapturedArtifact,
} from './refresh-utils.js';

const SOURCE_ID = 'livebench';
const PAGE_URL = 'https://livebench.ai/';

const csvRows = (text: string): number =>
  Math.max(0, text.trim().split(/\r?\n/u).length - 1);

const integerOption = (name: string, purpose: string): number => {
  const argument = process.argv.find((value) => value.startsWith(`${name}=`));
  const value = argument ? Number(argument.split('=', 2)[1]) : NaN;
  if (!Number.isInteger(value)) {
    throw new Error(`A verified ${name}=<integer> is required: ${purpose}`);
  }
  return value;
};

const asFile = (artifact: CapturedArtifact): LiveBenchFile => ({
  text: artifact.text,
  evidenceId: artifact.record.id,
  url: artifact.record.requestUrl,
  retrievedAt: artifact.record.retrievedAt,
  method: artifact.record.method,
});

async function main() {
  const rootArgument = process.argv
    .slice(2)
    .find((argument) => !argument.startsWith('--'));
  const root = resolve(rootArgument ?? getWorkspaceRoot());
  const visibleV2 = integerOption(
    '--visual-profile-count',
    'rendered LiveBench 2.0 leaderboard rows',
  );
  const visibleV1 = integerOption(
    '--visual-v1-profile-count',
    'rendered LiveBench 1.0 release page rows with Include finetunes enabled',
  );
  const retrievedAt = new Date().toISOString();
  const sourceDirectory = join(root, 'data', 'sources', SOURCE_ID);
  const previousCandidates = await readJson<CandidateResult[]>(
    join(sourceDirectory, 'candidates.json'),
  );
  const previousCosts = await readJson<CostRecord[]>(
    join(sourceDirectory, 'costs.json'),
  );
  const previousReport = await readText(
    join(sourceDirectory, 'validation-report.md'),
  );

  const capture = (
    url: string,
    mediaType: string,
    method: CapturedArtifact['record']['method'],
    metadata: Record<string, unknown>,
  ) =>
    captureArtifact({
      root,
      sourceId: SOURCE_ID,
      url,
      retrievedAt,
      mediaType,
      method,
      metadata,
    });
  const page = await capture(PAGE_URL, 'text/html', 'DOM', {
    application: 'JavaScript SPA',
  });
  const scriptMatch = page.text.match(/static\/js\/main\.[^"']+\.js/u);
  if (!scriptMatch) throw new Error('LiveBench main bundle URL was not found');
  const scriptUrl = new URL(scriptMatch[0], PAGE_URL).href;
  const script = await capture(scriptUrl, 'text/javascript', 'API_RESPONSE', {
    captureScope: 'complete application bundle',
  });
  const { latestRelease: v1Release, cacheVersion } = extractLiveBenchMetadata(
    script.text,
  );
  const release2 = extractLiveBench2Release(script.text);
  const v1Path = v1Release.replaceAll('-', '_');
  const v1Urls = {
    table: `${PAGE_URL}v1/table_${v1Path}.csv?v=${cacheVersion}`,
    categories: `${PAGE_URL}v1/categories_${v1Path}.json?v=${cacheVersion}`,
    cost: `${PAGE_URL}v1/cost_${v1Path}.csv?v=${cacheVersion}`,
  };
  const v2Urls = {
    table: `${PAGE_URL}data/${release2.path}/table.csv?v=${cacheVersion}`,
    categories: `${PAGE_URL}data/${release2.path}/categories.json?v=${cacheVersion}`,
    cost: `${PAGE_URL}data/${release2.path}/cost.csv?v=${cacheVersion}`,
  };
  const [v1Table, v1Categories, v1Cost, v2Table, v2Categories, v2Cost] =
    await Promise.all([
      capture(v1Urls.table, 'text/csv', 'EXPORT', { release: v1Release }),
      capture(v1Urls.categories, 'application/json', 'EXPORT', {
        release: v1Release,
      }),
      capture(v1Urls.cost, 'text/csv', 'EXPORT', { release: v1Release }),
      capture(v2Urls.table, 'text/csv', 'EXPORT', { release: release2.date }),
      capture(v2Urls.categories, 'application/json', 'EXPORT', {
        release: release2.date,
      }),
      capture(v2Urls.cost, 'text/csv', 'EXPORT', { release: release2.date }),
    ]);

  const snapshot = buildLiveBenchSnapshot({
    mainJs: script.text,
    jsEvidenceId: script.record.id,
    jsUrl: scriptUrl,
    v1: {
      table: asFile(v1Table),
      categories: asFile(v1Categories),
      cost: asFile(v1Cost),
    },
    v2: {
      table: asFile(v2Table),
      categories: asFile(v2Categories),
      cost: asFile(v2Cost),
    },
    release2,
    previousCandidates,
  });

  if (visibleV2 !== snapshot.v2Models.length) {
    throw new Error(
      `Visible LiveBench 2.0 row count ${visibleV2} does not match export rows ${snapshot.v2Models.length}`,
    );
  }
  const supersededNames = liveBenchExportOnlyNames(v1Table.text);
  const collapsedVariants = liveBenchCollapsedVariants(
    script.text,
    v1Table.text,
  );
  const collapsedCount = collapsedVariants.reduce(
    (sum, group) => sum + group.length - 1,
    0,
  );
  const expectedV1Rows =
    snapshot.v1PopulationRows - supersededNames.length - collapsedCount;
  if (visibleV1 !== expectedV1Rows) {
    throw new Error(
      `Visible LiveBench 1.0 row count ${visibleV1} does not match export count ${expectedV1Rows} (raw ${snapshot.v1PopulationRows}; superseded ${supersededNames.join(', ')}; collapsed variants ${collapsedCount})`,
    );
  }

  script.record.metadata = {
    v1Release,
    v2Release: release2.date,
    cacheVersion,
  };
  v1Table.record.metadata = {
    ...v1Table.record.metadata,
    rows: snapshot.v1PopulationRows,
    collapsedVariants,
  };
  v2Table.record.metadata = {
    ...v2Table.record.metadata,
    rows: snapshot.v2Models.length,
  };
  for (const cost of [v1Cost, v2Cost]) {
    cost.record.metadata = {
      ...cost.record.metadata,
      rows: csvRows(cost.text),
    };
  }
  page.record.metadata = {
    ...page.record.metadata,
    v2Release: release2.date,
    visibleV2Rows: visibleV2,
    visibleV1Rows: visibleV1,
    supersededExportNames: supersededNames,
    visibleComparisonMatched: true,
  };

  const previousProfiles = new Set(
    previousCandidates.map(({ model }) => model.rawName),
  ).size;
  const report = `${snapshot.validationReport.trimEnd()}\n\n## Visible comparison\n\n- LiveBench 2.0 rendered leaderboard rows: ${visibleV2}; table rows: ${snapshot.v2Models.length}.\n- LiveBench 1.0 release ${v1Release} rendered rows with Include finetunes enabled: ${visibleV1}; export rows ${snapshot.v1PopulationRows} minus superseded export-only names (${supersededNames.join(', ') || 'none'}) and ${collapsedCount} collapsed variant rows.\n- Result: both rendered counts matched.\n\n${snapshotDeltaMarkdown(
    [
      {
        label: 'Raw model profiles',
        previous: previousSnapshotValue(
          previousReport,
          'Raw model profiles',
          previousProfiles,
        ),
        refreshed: new Set(
          snapshot.candidates.map(({ model }) => model.rawName),
        ).size,
      },
      {
        label: 'Candidate results',
        previous: previousSnapshotValue(
          previousReport,
          'Candidate results',
          previousCandidates.length,
        ),
        refreshed: snapshot.candidates.length,
      },
      {
        label: 'Materialized costs',
        previous: previousSnapshotValue(
          previousReport,
          'Materialized costs',
          previousCosts.length,
        ),
        refreshed: snapshot.costs.length,
      },
    ],
  )}`;
  const manifest = SourceManifestSchema.parse({
    schemaVersion: 'source-manifest-v1',
    sourceId: SOURCE_ID,
    displayName: 'LiveBench',
    role: 'ORGANIZER',
    baseUrl: 'https://livebench.ai',
    targetUrls: [
      PAGE_URL,
      scriptUrl,
      ...Object.values(v2Urls),
      ...Object.values(v1Urls),
    ],
    benchmarkIds: [
      ...LIVEBENCH2_SUITES.map(({ benchmarkId }) => benchmarkId),
      ...LIVEBENCH_V1_RETAINED,
    ],
    accessMethods: ['EXPORT', 'API_RESPONSE', 'DOM'],
    completeness: {
      expectedCountMethod:
        'Read both release identifiers from the official bundle, then compare every 2.0 and frozen 1.0 export row with the rendered leaderboards.',
      pagination: null,
      visibleComparisonRequired: true,
    },
    fieldMapping: {
      '2.0 table CSV suite columns': 'rawScore per suite benchmark',
      '2.0 model registry effort': 'profile.effort',
      '2.0 cost CSV suite totals / nq_*': 'MEASURED_TASK cost per task',
      '1.0 table CSV task columns': 'retained Language, IF and Mathematics',
      'cost CSV token price columns': 'API_STANDARDIZED pricing',
    },
    fallbackMethods: ['DOM', 'VISUAL'],
    lastVerifiedAt: retrievedAt,
    notes: [
      `LiveBench 2.0 release ${release2.date}: ${snapshot.v2Models.length} models across ${LIVEBENCH2_SUITES.length} suites.`,
      `Frozen 1.0 release ${v1Release}: Language, IF and Mathematics retained because 2.0 dropped them; 1.0 Reasoning is superseded by 2.0.`,
      `Exact identities only; ${snapshot.unresolvedModels.length} raw names remain unresolved without fuzzy matching.`,
    ],
  });
  const evidence = [
    page.record,
    script.record,
    v1Table.record,
    v1Categories.record,
    v1Cost.record,
    v2Table.record,
    v2Categories.record,
    v2Cost.record,
  ].toSorted((left, right) => left.requestUrl.localeCompare(right.requestUrl));

  await Promise.all([
    writeMetadataJson(join(sourceDirectory, 'evidence-index.json'), evidence),
    writeFile(
      join(sourceDirectory, 'candidates.json'),
      deterministicJson(snapshot.candidates),
    ),
    writeFile(
      join(sourceDirectory, 'costs.json'),
      prettyDeterministicJson(snapshot.costs),
    ),
    writeFile(join(sourceDirectory, 'validation-report.md'), report),
    writeMetadataJson(join(sourceDirectory, 'manifest.json'), manifest),
  ]);
  console.log(
    JSON.stringify({
      v2Release: release2.date,
      v1Release,
      v2Models: snapshot.v2Models.length,
      candidates: snapshot.candidates.length,
      unresolved: snapshot.unresolvedModels.length,
      costs: snapshot.costs.length,
    }),
  );
}

await main();
