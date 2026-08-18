import { writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

import {
  SourceManifestSchema,
  deterministicJson,
  type CandidateResult,
  type CostRecord,
} from '@llm-bench/benchmark-data';

import { materializeDeepSwe } from './deepswe-materializer.js';
import { materializeDeepSweCosts } from './pricing-materializers.js';
import {
  captureArtifact,
  getWorkspaceRoot,
  manifestJson,
  prettyDeterministicJson,
  readJson,
  readText,
  previousSnapshotValue,
  snapshotDeltaMarkdown,
} from './refresh-utils.js';

const SOURCE_ID = 'deepswe';
const PAGE_URL = 'https://deepswe.datacurve.ai/';
const DATA_URL =
  'https://deepswe.datacurve.ai/artifacts/v1.1/leaderboard-live.json';

async function main() {
  const rootArgument = process.argv
    .slice(2)
    .find((argument) => !argument.startsWith('--'));
  const root = resolve(rootArgument ?? getWorkspaceRoot());
  const visualModelCountArgument = process.argv.find((argument) =>
    argument.startsWith('--visual-model-count='),
  );
  const visualModelCount = visualModelCountArgument
    ? Number(visualModelCountArgument.split('=', 2)[1])
    : null;
  if (!Number.isInteger(visualModelCount) || visualModelCount === null) {
    throw new Error(
      'A verified --visual-model-count=<integer> is required for DeepSWE refresh',
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
  const previousModels = new Set(
    previousCandidates.map(({ model }) => model.rawName),
  ).size;

  const [page, data] = await Promise.all([
    captureArtifact({
      root,
      sourceId: SOURCE_ID,
      url: PAGE_URL,
      retrievedAt,
      mediaType: 'text/html',
      method: 'DOM',
      metadata: { captureScope: 'leaderboard page', version: '1.1' },
    }),
    captureArtifact({
      root,
      sourceId: SOURCE_ID,
      url: DATA_URL,
      retrievedAt,
      mediaType: 'application/json',
      method: 'API_RESPONSE',
      metadata: { captureScope: 'complete leaderboard export', version: '1.1' },
    }),
  ]);
  const result = materializeDeepSwe(data.text, retrievedAt, {
    evidenceId: data.record.id,
    sourceUrl: DATA_URL,
  });
  if (visualModelCount !== result.distinctModels) {
    throw new Error(
      `Visible DeepSWE model count ${visualModelCount} does not match export count ${result.distinctModels}`,
    );
  }
  const costs = materializeDeepSweCosts(data.text, {
    sourceUrl: DATA_URL,
    evidenceId: data.record.id,
    observedAt: retrievedAt,
    method: 'API_RESPONSE',
  });
  const parsed = JSON.parse(data.text) as { generated_at?: string };
  data.record.metadata = {
    ...data.record.metadata,
    configurationRows: result.configurationRows,
    distinctModels: result.distinctModels,
    generatedAt: parsed.generated_at ?? null,
  };
  page.record.metadata = {
    ...page.record.metadata,
    visibleModels: visualModelCount,
    visibleComparisonMatched: true,
  };
  const report = `${result.validationReport.trimEnd()}\n\n## Visible comparison\n\n- Fresh rendered page model count: ${visualModelCount}\n- Complete export distinct model count: ${result.distinctModels}\n- Result: matched\n\n${snapshotDeltaMarkdown(
    [
      {
        label: 'Configuration rows',
        previous: previousSnapshotValue(
          previousReport,
          'Configuration rows',
          previousCandidates.length,
        ),
        refreshed: result.candidates.length,
      },
      {
        label: 'Distinct models',
        previous: previousSnapshotValue(
          previousReport,
          'Distinct models',
          previousModels,
        ),
        refreshed: result.distinctModels,
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
  const manifest = SourceManifestSchema.parse({
    schemaVersion: 'source-manifest-v1',
    sourceId: SOURCE_ID,
    displayName: 'DeepSWE',
    role: 'ORGANIZER',
    baseUrl: 'https://deepswe.datacurve.ai',
    targetUrls: [PAGE_URL, DATA_URL],
    benchmarkIds: ['deepswe-1-1'],
    accessMethods: ['API_RESPONSE', 'DOM'],
    completeness: {
      expectedCountMethod:
        'Count every configuration and distinct model in the complete official v1.1 leaderboard export, then compare the visible leaderboard.',
      pagination: null,
      visibleComparisonRequired: true,
    },
    fieldMapping: {
      generated_at: 'sourcePublishedAt',
      'rows[].harness': 'profile.harness',
      'rows[].mean_cost_usd': 'CostRecord.cost',
      'rows[].model': 'model.rawName',
      'rows[].pass_rate': 'normalizedScore',
      'rows[].reasoning_effort': 'profile.effort',
    },
    fallbackMethods: ['EMBEDDED_JSON', 'DOM', 'VISUAL'],
    lastVerifiedAt: retrievedAt,
    notes: [
      `${result.configurationRows} configurations / ${result.distinctModels} models; every configuration is retained.`,
      `${result.modelsWithMultipleEfforts.length} models expose multi-effort ladders.`,
      `Exact catalog identities only; ${result.unresolvedCount} configuration rows remain unresolved.`,
      'Harness and n_runs remain provenance, not separate Product Profiles.',
    ],
  });

  await Promise.all([
    writeFile(
      join(sourceDirectory, 'evidence-index.json'),
      prettyDeterministicJson(
        [data.record, page.record].toSorted((left, right) =>
          left.requestUrl.localeCompare(right.requestUrl),
        ),
      ),
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
      configurations: result.configurationRows,
      models: result.distinctModels,
      costs: costs.length,
      generatedAt: parsed.generated_at ?? null,
    }),
  );
}

await main();
