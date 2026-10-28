import {
  acquireEvidenceResponse,
  recordCapturedEvidence,
} from './source-processing.js';
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';

import {
  CandidateResultSchema,
  CostRecordSchema,
  EvidenceRecordSchema,
  SourceManifestSchema,
  deterministicJson,
  type EvidenceRecord,
} from '@llm-bench/benchmark-data';

import {
  FRONTIER_CODE_1_1_BENCHMARK_ID,
  FRONTIER_CODE_2_0_BENCHMARK_ID,
  FRONTIER_CODE_2_0_DATA_URL,
  FRONTIER_CODE_DATA_URL,
  FRONTIER_CODE_PAGE_URL,
  frontierCodeValidationReport,
  assertFrontierCode11Unchanged,
  materializeFrontierCode11,
  materializeFrontierCode20,
} from './frontier-code-materializer.js';
import { writeContentAddressedArtifact } from './index.js';
import {
  previousSnapshotValue,
  snapshotDeltaMarkdown,
  writeMetadataJson,
} from './refresh-utils.js';

const prettyDeterministicJson = (value: unknown): string =>
  `${JSON.stringify(JSON.parse(deterministicJson(value)), null, 2)}\n`;

const getWorkspaceRoot = (): string => {
  let directory = process.cwd();
  while (true) {
    if (existsSync(join(directory, 'data'))) return directory;
    const parent = dirname(directory);
    if (parent === directory) throw new Error('Workspace root not found');
    directory = parent;
  }
};

const readExistingEvidence = async (
  path: string,
): Promise<EvidenceRecord[]> => {
  if (!existsSync(path)) return [];
  return EvidenceRecordSchema.array().parse(
    JSON.parse(await readFile(path, 'utf8')),
  );
};

const fetchArtifact = async (
  root: string,
  sourceId: string,
  url: string,
  mediaType: 'application/json' | 'text/html',
  method: 'EXPORT' | 'EMBEDDED_JSON',
  retrievedAt: string,
  metadata: Record<string, unknown>,
): Promise<{ bytes: Uint8Array; evidence: EvidenceRecord }> => {
  const response = await acquireEvidenceResponse({
    root,
    sourceId,
    url,
    retrievedAt,
  });
  if (!response.ok) {
    throw new Error(`${url} returned HTTP ${response.status}`);
  }
  const bytes = response.bytes;
  const stored = await writeContentAddressedArtifact(
    join(root, 'artifacts', 'sha256'),
    bytes,
    mediaType,
  );
  const evidence = EvidenceRecordSchema.parse({
    ...stored.record,
    sourceId,
    retrievedAt,
    requestUrl: url,
    finalUrl: response.url || url,
    artifactPath: `artifacts/sha256/${stored.record.artifactPath}`,
    method,
    metadata,
  });
  recordCapturedEvidence(root, evidence, {
    status: response.status,
    headers: Object.fromEntries(response.headers),
  });
  return { bytes, evidence };
};

// Accepts both `--name value` and `--name=value`, like the other refresh CLIs.
const option = (name: string): string | null => {
  const inline = process.argv.find((arg) => arg.startsWith(`${name}=`));
  if (inline) return inline.slice(name.length + 1);
  const index = process.argv.indexOf(name);
  return index === -1 ? null : (process.argv[index + 1] ?? null);
};

const repeatedOption = (name: string): string[] =>
  process.argv.flatMap((arg, index) => {
    if (arg.startsWith(`${name}=`)) return [arg.slice(name.length + 1)];
    if (arg === name) {
      const value = process.argv[index + 1];
      return value === undefined ? [] : [value];
    }
    return [];
  });

const positiveInteger = (name: string, purpose: string): number => {
  const value = Number(option(name));
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(
      `Run a rendered DOM check first, then pass ${name}=<count> (${purpose})`,
    );
  }
  return value;
};

/** These checked the 1.1 board, which the page no longer renders. */
const RETIRED_FLAGS = ['--visual-row-count', '--visual-top-ten-matched'];

async function main() {
  const retired = RETIRED_FLAGS.filter((flag) =>
    process.argv.some((arg) => arg === flag || arg.startsWith(`${flag}=`)),
  );
  if (retired.length > 0) {
    throw new Error(
      `${retired.join(', ')} checked the FrontierCode 1.1 board, which the page no longer renders. Use --v2-visual-row-count, --v2-visual-all-row-count and --v2-visual-top-ten-matched (docs/OPERATIONS.md §2).`,
    );
  }
  const visualBestRowCount = positiveInteger(
    '--v2-visual-row-count',
    'rendered FrontierCode 2.0 rows in "Best reasoning mode"',
  );
  const visualAllRowCount = positiveInteger(
    '--v2-visual-all-row-count',
    'rendered FrontierCode 2.0 rows in "All reasoning levels"',
  );
  const visualTopTenMatched = process.argv.includes(
    '--v2-visual-top-ten-matched',
  );
  if (!visualTopTenMatched) {
    throw new Error(
      'Pass --v2-visual-top-ten-matched only after the rendered FrontierCode 2.0 Top 10 has been checked',
    );
  }
  const hiddenModels = repeatedOption('--v2-hidden-model');
  const acceptV11Changes = process.argv.includes('--v1-1-accept-value-changes');

  const root = resolve(option('--root') ?? getWorkspaceRoot());
  const sourceDir = join(root, 'data', 'sources', 'frontier-code');
  const evidencePath = join(sourceDir, 'evidence-index.json');
  await mkdir(sourceDir, { recursive: true });
  const previousEvidence = await readExistingEvidence(evidencePath);
  const previousCandidates = CandidateResultSchema.array().parse(
    JSON.parse(await readFile(join(sourceDir, 'candidates.json'), 'utf8')),
  );
  const previousCosts = CostRecordSchema.array().parse(
    JSON.parse(await readFile(join(sourceDir, 'costs.json'), 'utf8')),
  );
  const previousReport = await readFile(
    join(sourceDir, 'validation-report.md'),
    'utf8',
  );
  const previousV11 = previousCandidates.filter(
    ({ benchmarkId }) => benchmarkId === FRONTIER_CODE_1_1_BENCHMARK_ID,
  );
  const previousV20 = previousCandidates.filter(
    ({ benchmarkId }) => benchmarkId === FRONTIER_CODE_2_0_BENCHMARK_ID,
  );
  const retrievedAt = new Date().toISOString();

  const [page, v11Data, v20Data] = await Promise.all([
    fetchArtifact(
      root,
      'frontier-code',
      FRONTIER_CODE_PAGE_URL,
      'text/html',
      'EMBEDDED_JSON',
      retrievedAt,
      { dataset: 'Main', jsonLdLeaderboardRows: 10, version: '2.0' },
    ),
    fetchArtifact(
      root,
      'frontier-code',
      FRONTIER_CODE_DATA_URL,
      'application/json',
      'EXPORT',
      retrievedAt,
      { dataset: 'Main', format: 'official-static-json', version: '1.1' },
    ),
    fetchArtifact(
      root,
      'frontier-code',
      FRONTIER_CODE_2_0_DATA_URL,
      'application/json',
      'EXPORT',
      retrievedAt,
      { dataset: 'Main', format: 'official-static-json', version: '2.0' },
    ),
  ]);
  const observedAt = retrievedAt;
  const decode = (bytes: Uint8Array): string => new TextDecoder().decode(bytes);

  const v20 = materializeFrontierCode20(
    decode(v20Data.bytes),
    decode(page.bytes),
    {
      dataEvidenceId: v20Data.evidence.id,
      pageEvidenceId: page.evidence.id,
      observedAt,
      visualBestRowCount,
      visualAllRowCount,
      visualTopTenMatched,
      hiddenModels,
    },
  );
  if (v20.topTenMismatches.length > 0) {
    throw new Error(
      `FrontierCode 2.0 JSON-LD/export mismatch: ${v20.topTenMismatches.join('; ')}`,
    );
  }
  const v11 = materializeFrontierCode11(
    decode(v11Data.bytes),
    { dataEvidenceId: v11Data.evidence.id, observedAt },
    { candidates: previousCandidates, costs: previousCosts },
  );
  if (!acceptV11Changes) {
    assertFrontierCode11Unchanged(
      v11,
      'review, then rerun with --v1-1-accept-value-changes',
    );
  }

  // Preserved 1.1 rows keep citing the export they were captured from.
  const previousById = new Map(
    previousEvidence.map((record) => [record.id, record]),
  );
  const preservedEvidence = v11.preservedEvidenceIds.map((id) => {
    const record = previousById.get(id);
    if (!record) {
      throw new Error(
        `Preserved FrontierCode 1.1 rows cite evidence missing from the previous index: ${id}`,
      );
    }
    return record;
  });

  v11Data.evidence.metadata = {
    ...v11Data.evidence.metadata,
    configurationRows: v11.exportConfigurationCount,
    costRows: v11.exportCostCount,
    distinctModels: v11.exportModelCount,
    preservedRows: v11.preservedCandidateIds.length,
  };
  v20Data.evidence.metadata = {
    ...v20Data.evidence.metadata,
    configurationRows: v20.configurationCount,
    distinctModels: v20.modelCount,
    hiddenModels: v20.hiddenModels,
    modelsWithMultipleEfforts: v20.modelsWithMultipleEfforts,
  };
  page.evidence.metadata = {
    ...page.evidence.metadata,
    renderedRows: visualBestRowCount,
    renderedAllRows: visualAllRowCount,
    renderedTopTenMatched: visualTopTenMatched,
  };
  const fresh = [page.evidence, v11Data.evidence, v20Data.evidence];
  const freshIds = new Set(fresh.map(({ id }) => id));
  const evidence = [
    ...fresh,
    ...preservedEvidence.filter(({ id }) => !freshIds.has(id)),
  ].toSorted(
    (left, right) =>
      left.requestUrl.localeCompare(right.requestUrl) ||
      left.retrievedAt.localeCompare(right.retrievedAt) ||
      left.id.localeCompare(right.id),
  );

  const candidates = [...v11.candidates, ...v20.candidates].toSorted(
    (left, right) => left.id.localeCompare(right.id),
  );
  const manifest = SourceManifestSchema.parse({
    schemaVersion: 'source-manifest-v1',
    sourceId: 'frontier-code',
    displayName: 'FrontierCode',
    role: 'ORGANIZER',
    baseUrl: 'https://cognition.com',
    targetUrls: [
      FRONTIER_CODE_PAGE_URL,
      FRONTIER_CODE_2_0_DATA_URL,
      FRONTIER_CODE_DATA_URL,
    ],
    benchmarkIds: [
      FRONTIER_CODE_1_1_BENCHMARK_ID,
      FRONTIER_CODE_2_0_BENCHMARK_ID,
    ],
    accessMethods: ['EXPORT', 'EMBEDDED_JSON', 'DOM'],
    completeness: {
      expectedCountMethod:
        'FrontierCode 2.0: the export minus the page hidden models must equal the rendered Best reasoning mode and All reasoning levels rows, and the JSON-LD Top 10. FrontierCode 1.1: the page no longer renders it; the v1_1 export is compared with the previous snapshot and upstream-removed rows are preserved.',
      pagination: null,
      visibleComparisonRequired: true,
    },
    fieldMapping: {
      'data[model][effort].main.new_score':
        'frontier-code-2-0 rawScore; normalizedScore = rawScore * 100',
      'efforts[model]': 'frontier-code-2-0 profile.effort',
      'harness[model]': 'frontier-code-2-0 profile.harness',
      'models[]': 'frontier-code-2-0 model.rawName',
      'v1_1.data[model][effort].main.cost': 'CostRecord.cost',
      'v1_1.data[model][effort].main.new_score':
        'frontier-code-1-1 rawScore; normalizedScore = rawScore * 100',
      'v1_1.efforts[model]': 'frontier-code-1-1 profile.effort',
      'v1_1.harness[model]': 'frontier-code-1-1 profile.harness',
      'v1_1.models[]': 'frontier-code-1-1 model.rawName',
    },
    fallbackMethods: ['NEXT_RSC', 'VISUAL'],
    lastVerifiedAt: observedAt,
    notes: [
      'FrontierCode 1.1 and 2.0 are different benchmarks; neither replaces the other.',
      `2.0: ${v20.modelCount} visible models and ${v20.configurationCount} Main configurations; rendered Best ${visualBestRowCount} and All ${visualAllRowCount} rows; JSON-LD Top 10 matches the export 10/10 and the rendered Top 10. Hidden export models not materialized: ${v20.hiddenModels.join(', ') || 'none'}.`,
      '2.0 costs stay in the raw artifact; Frontier Code costs pair with frontier-code-1-1.',
      `1.1: ${v11.exportModelCount} export models and ${v11.exportConfigurationCount} Main configurations; ${v11.preservedCandidateIds.length} rows preserved from the previous snapshot (${v11.preservedModels.join(', ') || 'none'}).`,
      'Extended data is retained in the raw artifact but not materialized.',
      'Exact identities only; unresolved models and non-policy efforts remain null.',
    ],
  });

  await Promise.all([
    writeMetadataJson(join(sourceDir, 'manifest.json'), manifest),
    writeMetadataJson(evidencePath, evidence),
    writeFile(
      join(sourceDir, 'candidates.json'),
      prettyDeterministicJson(candidates),
    ),
    writeFile(
      join(sourceDir, 'costs.json'),
      prettyDeterministicJson(v11.costs),
    ),
    writeFile(
      join(sourceDir, 'validation-report.md'),
      `${frontierCodeValidationReport({
        v11,
        v11DataEvidenceId: v11Data.evidence.id,
        pageEvidenceId: page.evidence.id,
        v20: {
          result: v20,
          dataEvidenceId: v20Data.evidence.id,
          visualBestRowCount,
          visualAllRowCount,
          visualTopTenMatched,
        },
      }).trimEnd()}\n\n${snapshotDeltaMarkdown([
        {
          label: 'Distinct models',
          previous: previousSnapshotValue(
            previousReport,
            'Distinct models',
            new Set(previousV11.map(({ model }) => model.rawName)).size,
          ),
          refreshed: v11.modelCount,
        },
        {
          label: 'Main configurations',
          previous: previousSnapshotValue(
            previousReport,
            'Main configurations',
            previousV11.length,
          ),
          refreshed: v11.candidates.length,
        },
        {
          label: 'Materialized costs',
          previous: previousSnapshotValue(
            previousReport,
            'Materialized costs',
            previousCosts.length,
          ),
          refreshed: v11.costs.length,
        },
        {
          label: '2.0 models',
          previous: previousSnapshotValue(
            previousReport,
            '2.0 models',
            new Set(previousV20.map(({ model }) => model.rawName)).size,
          ),
          refreshed: v20.modelCount,
        },
        {
          label: '2.0 configurations',
          previous: previousSnapshotValue(
            previousReport,
            '2.0 configurations',
            previousV20.length,
          ),
          refreshed: v20.configurationCount,
        },
      ])}`,
    ),
  ]);

  console.log(
    JSON.stringify({
      v20: {
        models: v20.modelCount,
        configurations: v20.configurationCount,
        hiddenModels: v20.hiddenModels,
        topTenMatches: v20.topTenMatches,
        unresolvedModels: v20.unresolvedModels.length,
      },
      v11: {
        exportModels: v11.exportModelCount,
        exportConfigurations: v11.exportConfigurationCount,
        preservedRows: v11.preservedCandidateIds.length,
        preservedModels: v11.preservedModels,
        addedRows: v11.addedCandidateIds.length,
        valueChanges: v11.valueChanges.length,
        costs: v11.costs.length,
      },
    }),
  );
}

await main();
