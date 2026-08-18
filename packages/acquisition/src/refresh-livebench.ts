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
  materializeLiveBench,
} from './livebench-materializer.js';
import { materializeLiveBenchCosts } from './pricing-materializers.js';
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

const SOURCE_ID = 'livebench';
const PAGE_URL = 'https://livebench.ai/';

const csvRows = (text: string): number =>
  Math.max(0, text.trim().split(/\r?\n/u).length - 1);

async function main() {
  const rootArgument = process.argv
    .slice(2)
    .find((argument) => !argument.startsWith('--'));
  const root = resolve(rootArgument ?? getWorkspaceRoot());
  const visualProfileCountArgument = process.argv.find((argument) =>
    argument.startsWith('--visual-profile-count='),
  );
  const visualProfileCount = visualProfileCountArgument
    ? Number(visualProfileCountArgument.split('=', 2)[1])
    : null;
  if (!Number.isInteger(visualProfileCount) || visualProfileCount === null) {
    throw new Error(
      'A verified --visual-profile-count=<integer> is required for LiveBench refresh',
    );
  }
  const retrievedAt = new Date().toISOString();
  const sourceDirectory = join(root, 'data-v2', 'sources', SOURCE_ID);
  const previousCandidates = await readJson<CandidateResult[]>(
    join(sourceDirectory, 'candidates.json'),
  );
  const previousCosts = await readJson<CostRecord[]>(
    join(sourceDirectory, 'costs.json'),
  );
  const previousReport = await readText(
    join(sourceDirectory, 'validation-report.md'),
  );

  const page = await captureArtifact({
    root,
    sourceId: SOURCE_ID,
    url: PAGE_URL,
    retrievedAt,
    mediaType: 'text/html',
    method: 'DOM',
    metadata: { application: 'JavaScript SPA' },
  });
  const scriptMatch = page.text.match(/static\/js\/main\.[^"']+\.js/u);
  if (!scriptMatch) throw new Error('LiveBench main bundle URL was not found');
  const scriptUrl = new URL(scriptMatch[0], PAGE_URL).href;
  const script = await captureArtifact({
    root,
    sourceId: SOURCE_ID,
    url: scriptUrl,
    retrievedAt,
    mediaType: 'text/javascript',
    method: 'API_RESPONSE',
    metadata: { captureScope: 'complete application bundle' },
  });
  const { latestRelease, cacheVersion } = extractLiveBenchMetadata(script.text);
  const releasePath = latestRelease.replaceAll('-', '_');
  const tableUrl = `${PAGE_URL}table_${releasePath}.csv?v=${cacheVersion}`;
  const categoriesUrl = `${PAGE_URL}categories_${releasePath}.json?v=${cacheVersion}`;
  const costUrl = `${PAGE_URL}cost_${releasePath}.csv?v=${cacheVersion}`;
  const [table, categories, cost] = await Promise.all([
    captureArtifact({
      root,
      sourceId: SOURCE_ID,
      url: tableUrl,
      retrievedAt,
      mediaType: 'text/csv',
      method: 'EXPORT',
      metadata: { release: latestRelease },
    }),
    captureArtifact({
      root,
      sourceId: SOURCE_ID,
      url: categoriesUrl,
      retrievedAt,
      mediaType: 'application/json',
      method: 'EXPORT',
      metadata: { release: latestRelease },
    }),
    captureArtifact({
      root,
      sourceId: SOURCE_ID,
      url: costUrl,
      retrievedAt,
      mediaType: 'text/csv',
      method: 'EXPORT',
      metadata: { release: latestRelease },
    }),
  ]);
  const result = materializeLiveBench(
    script.text,
    table.text,
    categories.text,
    retrievedAt,
    {
      tableEvidenceId: table.record.id,
      categoriesEvidenceId: categories.record.id,
      jsEvidenceId: script.record.id,
      tableUrl,
      categoriesUrl,
      jsUrl: scriptUrl,
    },
  );
  if (visualProfileCount !== result.populationRows) {
    throw new Error(
      `Visible LiveBench profile count ${visualProfileCount} does not match export count ${result.populationRows}`,
    );
  }
  const costs = materializeLiveBenchCosts(cost.text, {
    sourceUrl: costUrl,
    evidenceId: cost.record.id,
    observedAt: retrievedAt,
    method: 'EXPORT',
  });
  script.record.metadata = { latestRelease, cacheVersion };
  table.record.metadata = {
    ...table.record.metadata,
    rows: result.populationRows,
  };
  categories.record.metadata = {
    ...categories.record.metadata,
    categories: Object.keys(JSON.parse(categories.text) as object).length,
  };
  cost.record.metadata = {
    ...cost.record.metadata,
    rows: csvRows(cost.text),
  };
  page.record.metadata = {
    ...page.record.metadata,
    latestRelease,
    visibleProfiles: visualProfileCount,
    visibleComparisonMatched: true,
  };
  const previousProfiles = new Set(
    previousCandidates.map(({ model }) => model.rawName),
  ).size;
  const report = `${result.validationReport.trimEnd()}\n\n## Visible comparison\n\n- Fresh rendered page profile count: ${visualProfileCount}\n- Complete table export profile count: ${result.populationRows}\n- Result: matched\n\n${snapshotDeltaMarkdown(
    [
      {
        label: 'Raw model profiles',
        previous: previousSnapshotValue(
          previousReport,
          'Raw model profiles',
          previousProfiles,
        ),
        refreshed: result.populationRows,
      },
      {
        label: 'Candidate results',
        previous: previousSnapshotValue(
          previousReport,
          'Candidate results',
          previousCandidates.length,
        ),
        refreshed: result.candidates.length,
      },
      {
        label: 'Cost export profiles',
        previous: previousSnapshotValue(
          previousReport,
          'Cost export profiles',
          previousProfiles,
        ),
        refreshed: csvRows(cost.text),
      },
      {
        label: 'Materialized costs',
        previous: previousSnapshotValue(
          previousReport,
          'Materialized costs',
          previousCosts.length,
        ),
        refreshed: costs.length,
      },
    ],
  )}`;
  const unresolvedNames = new Set(
    result.candidates
      .filter(({ model }) => model.canonicalModelId === null)
      .map(({ model }) => model.rawName),
  );
  const manifest = SourceManifestSchema.parse({
    schemaVersion: 'source-manifest-v1',
    sourceId: SOURCE_ID,
    displayName: 'LiveBench',
    role: 'ORGANIZER',
    baseUrl: 'https://livebench.ai',
    targetUrls: [PAGE_URL, scriptUrl, tableUrl, categoriesUrl, costUrl],
    benchmarkIds: [
      'livebench-reasoning',
      'livebench-mathematics',
      'livebench-language',
      'livebench-instruction-following',
    ],
    accessMethods: ['EXPORT', 'API_RESPONSE', 'DOM'],
    completeness: {
      expectedCountMethod:
        'Read the latest release/cache version from the official bundle, then count every table, category and cost-export row.',
      pagination: null,
      visibleComparisonRequired: true,
    },
    fieldMapping: {
      'arithmetic mean of category tasks': 'rawScore',
      'categories JSON': 'category-to-task membership',
      'cost CSV cost_per_successful_task': 'MEASURED_TASK cost',
      'cost CSV token price columns': 'API_STANDARDIZED pricing',
      'table CSV model': 'model.rawName/profile',
      'table CSV task columns': 'raw subtask scores',
    },
    fallbackMethods: ['DOM', 'VISUAL'],
    lastVerifiedAt: retrievedAt,
    notes: [
      `Bundle declares ${latestRelease}; refreshed exports contain ${result.populationRows} profiles and ${Object.keys(JSON.parse(categories.text) as object).length} categories.`,
      `Exact identities only; ${unresolvedNames.size} profile names remain unresolved without fuzzy matching.`,
      'Four approved category families are materialized; Coding, Agentic Coding and Data Analysis stay excluded.',
      `${csvRows(cost.text)} cost rows emit ${costs.length} CostRecords from exact identities.`,
    ],
  });
  const evidence = [
    page.record,
    script.record,
    table.record,
    categories.record,
    cost.record,
  ].toSorted((left, right) => left.requestUrl.localeCompare(right.requestUrl));

  await Promise.all([
    writeFile(
      join(sourceDirectory, 'evidence-index.json'),
      prettyDeterministicJson(evidence),
    ),
    writeFile(
      join(sourceDirectory, 'candidates.json'),
      deterministicJson(result.candidates),
    ),
    writeFile(
      join(sourceDirectory, 'costs.json'),
      prettyDeterministicJson(costs),
    ),
    writeFile(join(sourceDirectory, 'validation-report.md'), report),
    writeFile(join(sourceDirectory, 'manifest.json'), manifestJson(manifest)),
  ]);
  console.log(
    JSON.stringify({
      release: latestRelease,
      cacheVersion,
      profiles: result.populationRows,
      candidates: result.candidates.length,
      unresolvedProfiles: unresolvedNames.size,
      costs: costs.length,
    }),
  );
}

await main();
