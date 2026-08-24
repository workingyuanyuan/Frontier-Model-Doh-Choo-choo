import { writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

import {
  SourceManifestSchema,
  type CandidateResult,
  type CostRecord,
} from '@llm-bench/benchmark-data';

import {
  ARC_PRIZE_DATASETS_URL,
  ARC_PRIZE_EVALUATIONS_URL,
  ARC_PRIZE_MODELS_URL,
  ARC_PRIZE_PAGE_URL,
  BENCHMARK_ID,
  materializeArcPrize,
} from './arc-prize-materializer.js';
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

const SOURCE_ID = 'arc-prize';

async function main() {
  const rootArgument = process.argv
    .slice(2)
    .find((argument) => !argument.startsWith('--'));
  const root = resolve(rootArgument ?? getWorkspaceRoot());
  const retrievedAt = new Date().toISOString();
  const sourceDirectory = join(root, 'data', 'sources', SOURCE_ID);

  const previousCandidates = await readJson<CandidateResult[]>(
    join(sourceDirectory, 'candidates.json'),
  ).catch(() => [] as CandidateResult[]);

  const previousCosts = await readJson<CostRecord[]>(
    join(sourceDirectory, 'costs.json'),
  ).catch(() => [] as CostRecord[]);

  const previousReport = await readText(
    join(sourceDirectory, 'validation-report.md'),
  ).catch(() => '');

  const [evaluations, models, datasets, page] = await Promise.all([
    captureArtifact({
      root,
      sourceId: SOURCE_ID,
      url: ARC_PRIZE_EVALUATIONS_URL,
      retrievedAt,
      mediaType: 'application/json',
      method: 'API_RESPONSE',
      metadata: { captureScope: 'all evaluations across splits' },
    }),
    captureArtifact({
      root,
      sourceId: SOURCE_ID,
      url: ARC_PRIZE_MODELS_URL,
      retrievedAt,
      mediaType: 'application/json',
      method: 'API_RESPONSE',
      metadata: { captureScope: 'model metadata catalog' },
    }),
    captureArtifact({
      root,
      sourceId: SOURCE_ID,
      url: ARC_PRIZE_DATASETS_URL,
      retrievedAt,
      mediaType: 'application/json',
      method: 'API_RESPONSE',
      metadata: { captureScope: 'dataset split definitions' },
    }),
    captureArtifact({
      root,
      sourceId: SOURCE_ID,
      url: ARC_PRIZE_PAGE_URL,
      retrievedAt,
      mediaType: 'text/html',
      method: 'DOM',
      metadata: { captureScope: 'official leaderboard page' },
    }),
  ]);

  const observedAt = retrievedAt;
  const result = materializeArcPrize(
    evaluations.text,
    models.text,
    datasets.text,
    {
      evaluationsEvidenceId: evaluations.record.id,
      modelsEvidenceId: models.record.id,
      datasetsEvidenceId: datasets.record.id,
      pageEvidenceId: page.record.id,
      observedAt,
    },
  );

  if (result.missingModelIds.length > 0) {
    throw new Error(
      `ARC Prize evaluations contain missing modelIds: ${result.missingModelIds.join(', ')}`,
    );
  }

  const previousCandidateCount = previousSnapshotValue(
    previousReport,
    'Candidate rows',
    previousSnapshotValue(
      previousReport,
      'CandidateResults',
      previousCandidates.length,
    ),
  );

  if (
    result.candidates.length < previousCandidateCount &&
    previousCandidateCount > 0
  ) {
    throw new Error(
      `Promoted candidate row count decreased from ${previousCandidateCount} to ${result.candidates.length}`,
    );
  }

  evaluations.record.metadata = {
    ...evaluations.record.metadata,
    totalEvaluations: result.totalEvaluations,
    v2Evaluations: result.v2TotalRows,
    promotedRows: result.v2PromotedRows,
    promotedCosts: result.v2PromotedCosts,
  };
  models.record.metadata = {
    ...models.record.metadata,
    totalModels: result.totalModels,
    unresolvedModels: result.unresolvedModels.length,
  };
  datasets.record.metadata = {
    ...datasets.record.metadata,
    totalDatasets: result.totalDatasets,
  };
  page.record.metadata = {
    ...page.record.metadata,
    domCaptured: true,
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
      label: 'Canonically unresolved models',
      previous: previousSnapshotValue(
        previousReport,
        'Canonically unresolved models',
        previousCandidates.filter(
          ({ model }) => model.canonicalModelId === null,
        ).length,
      ),
      refreshed: result.unresolvedModels.length,
    },
  ]);

  const manifest = SourceManifestSchema.parse({
    schemaVersion: 'source-manifest-v1',
    sourceId: SOURCE_ID,
    displayName: 'ARC Prize official leaderboard',
    role: 'ORGANIZER',
    baseUrl: 'https://arcprize.org',
    targetUrls: [
      ARC_PRIZE_PAGE_URL,
      ARC_PRIZE_EVALUATIONS_URL,
      ARC_PRIZE_MODELS_URL,
      ARC_PRIZE_DATASETS_URL,
    ],
    benchmarkIds: [BENCHMARK_ID],
    accessMethods: ['API_RESPONSE', 'DOM'],
    completeness: {
      expectedCountMethod:
        'Enumerate every display=true row in evaluations.json for the v2_Semi_Private split (ARC-AGI-2) and join model metadata from models.json.',
      pagination: null,
      visibleComparisonRequired: true,
    },
    fieldMapping: {
      'evaluations.json.costPerTask': 'CostRecord.cost',
      'evaluations.json.score':
        'rawScore (0-1 fraction); normalizedScore = rawScore * 100',
      'models.json.displayName':
        'model.rawName; profile.effort from parenthetical',
      'models.json.modelReleaseDate': 'sourcePublishedAt',
    },
    fallbackMethods: ['DOM', 'VISUAL'],
    lastVerifiedAt: observedAt,
    notes: [
      'Only official v2_Semi_Private display=true rows are promoted (ARC-AGI-2).',
      'v1, v2 public/private, and v3 evaluation splits remain preserved in content-addressed raw artifacts and are not mixed into arc-agi-2.',
      'Exact identities only; unresolved models and non-effort parentheticals (e.g. token budgets) remain null.',
      'All promoted v2 rows carry numeric costPerTask in USD/task.',
    ],
  });

  const evidenceRecords = [
    evaluations.record,
    models.record,
    datasets.record,
    page.record,
  ].toSorted((left, right) => left.requestUrl.localeCompare(right.requestUrl));

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
      evaluations: result.totalEvaluations,
      models: result.totalModels,
      datasets: result.totalDatasets,
      promotedRows: result.candidates.length,
      costs: result.costs.length,
      unresolvedModels: result.unresolvedModels.length,
    }),
  );
}

await main();
