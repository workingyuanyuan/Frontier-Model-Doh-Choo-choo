import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';

import {
  EvidenceRecordSchema,
  SourceManifestSchema,
  deterministicJson,
  type EvidenceRecord,
} from '@llm-bench/benchmark-data';

import {
  FRONTIER_CODE_DATA_URL,
  FRONTIER_CODE_PAGE_URL,
  materializeFrontierCode,
} from './frontier-code-materializer.js';
import { writeContentAddressedArtifact } from './index.js';

const prettyDeterministicJson = (value: unknown): string =>
  `${JSON.stringify(JSON.parse(deterministicJson(value)), null, 2)}\n`;

const manifestJson = (
  manifest: Record<
    'accessMethods' | 'benchmarkIds' | 'fallbackMethods',
    string[]
  > &
    object,
): string => {
  let json = prettyDeterministicJson(manifest);
  for (const key of [
    'accessMethods',
    'benchmarkIds',
    'fallbackMethods',
  ] as const) {
    const expanded = `  ${JSON.stringify(key)}: [\n${manifest[key]
      .map((value) => `    ${JSON.stringify(value)}`)
      .join(',\n')}\n  ]`;
    const compact = `  ${JSON.stringify(key)}: [${manifest[key]
      .map((value) => JSON.stringify(value))
      .join(', ')}]`;
    json = json.replace(expanded, compact);
  }
  return json;
};

const getWorkspaceRoot = (): string => {
  let directory = process.cwd();
  while (true) {
    if (existsSync(join(directory, 'data-v2'))) return directory;
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
  existing: EvidenceRecord[],
  metadata: Record<string, unknown>,
): Promise<{ bytes: Uint8Array; evidence: EvidenceRecord }> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`${url} returned HTTP ${response.status}`);
  }
  const bytes = new Uint8Array(await response.arrayBuffer());
  const stored = await writeContentAddressedArtifact(
    join(root, 'artifacts-v2', 'sha256'),
    bytes,
    mediaType,
  );
  const prior = existing.find(
    ({ requestUrl, id }) => requestUrl === url && id === stored.record.id,
  );
  return {
    bytes,
    evidence: EvidenceRecordSchema.parse({
      ...stored.record,
      sourceId,
      retrievedAt: prior?.retrievedAt ?? new Date().toISOString(),
      requestUrl: url,
      finalUrl: response.url || url,
      artifactPath: `artifacts-v2/sha256/${stored.record.artifactPath}`,
      method,
      metadata,
    }),
  };
};

const option = (name: string): string | null => {
  const index = process.argv.indexOf(name);
  return index === -1 ? null : (process.argv[index + 1] ?? null);
};

async function main() {
  const visualRowCount = Number(option('--visual-row-count'));
  const visualTopTenMatched = process.argv.includes('--visual-top-ten-matched');
  if (!Number.isInteger(visualRowCount) || visualRowCount <= 0) {
    throw new Error(
      'Run a rendered DOM check first, then pass --visual-row-count <count>',
    );
  }
  if (!visualTopTenMatched) {
    throw new Error(
      'Pass --visual-top-ten-matched only after the rendered Top 10 has been checked',
    );
  }

  const root = resolve(option('--root') ?? getWorkspaceRoot());
  const sourceDir = join(root, 'data-v2', 'sources', 'frontier-code');
  const evidencePath = join(sourceDir, 'evidence-index.json');
  await mkdir(sourceDir, { recursive: true });
  const existing = await readExistingEvidence(evidencePath);

  const [page, data] = await Promise.all([
    fetchArtifact(
      root,
      'frontier-code',
      FRONTIER_CODE_PAGE_URL,
      'text/html',
      'EMBEDDED_JSON',
      existing,
      { dataset: 'Main', jsonLdLeaderboardRows: 10, version: '1.1' },
    ),
    fetchArtifact(
      root,
      'frontier-code',
      FRONTIER_CODE_DATA_URL,
      'application/json',
      'EXPORT',
      existing,
      { dataset: 'Main', format: 'official-static-json', version: '1.1' },
    ),
  ]);
  const evidence = [data.evidence, page.evidence].toSorted((left, right) =>
    left.requestUrl.localeCompare(right.requestUrl),
  );
  const observedAt = evidence
    .map(({ retrievedAt }) => retrievedAt)
    .toSorted()
    .at(-1)!;
  const result = materializeFrontierCode(
    new TextDecoder().decode(data.bytes),
    new TextDecoder().decode(page.bytes),
    {
      dataEvidenceId: data.evidence.id,
      pageEvidenceId: page.evidence.id,
      observedAt,
      visualRowCount,
      visualTopTenMatched,
    },
  );
  if (result.topTenMismatches.length > 0) {
    throw new Error(
      `FrontierCode JSON-LD/export mismatch: ${result.topTenMismatches.join('; ')}`,
    );
  }

  data.evidence.metadata = {
    ...data.evidence.metadata,
    configurationRows: result.configurationCount,
    costRows: result.costCount,
    distinctModels: result.modelCount,
    modelsWithMultipleEfforts: result.modelsWithMultipleEfforts,
  };
  page.evidence.metadata = {
    ...page.evidence.metadata,
    renderedRows: visualRowCount,
    renderedTopTenMatched: visualTopTenMatched,
  };

  const manifest = SourceManifestSchema.parse({
    schemaVersion: 'source-manifest-v1',
    sourceId: 'frontier-code',
    displayName: 'FrontierCode',
    role: 'ORGANIZER',
    baseUrl: 'https://cognition.com',
    targetUrls: [FRONTIER_CODE_PAGE_URL, FRONTIER_CODE_DATA_URL],
    benchmarkIds: ['frontier-code-1-1'],
    accessMethods: ['EXPORT', 'EMBEDDED_JSON', 'DOM'],
    completeness: {
      expectedCountMethod:
        'Compare all v1_1 models/efforts in the official static export with the rendered Main leaderboard and JSON-LD Top 10.',
      pagination: null,
      visibleComparisonRequired: true,
    },
    fieldMapping: {
      'v1_1.data[model][effort].main.cost': 'CostRecord.cost',
      'v1_1.data[model][effort].main.new_score':
        'rawScore; normalizedScore = rawScore * 100',
      'v1_1.efforts[model]': 'profile.effort',
      'v1_1.harness[model]': 'profile.harness',
      'v1_1.models[]': 'model.rawName',
    },
    fallbackMethods: ['NEXT_RSC', 'VISUAL'],
    lastVerifiedAt: observedAt,
    notes: [
      `${result.modelCount} models and ${result.configurationCount} Main effort configurations; all have scores and costs.`,
      `${result.modelsWithMultipleEfforts} models have multiple efforts; ${result.modelsWithFiveEfforts} have five efforts.`,
      `JSON-LD Top 10 matches the export 10/10; rendered DOM showed ${visualRowCount} rows and the same Top 10.`,
      'Extended data is retained in the raw artifact but not materialized into the Main benchmark.',
      'Exact identities only; unresolved models and source effort none remain null.',
    ],
  });

  await Promise.all([
    writeFile(join(sourceDir, 'manifest.json'), manifestJson(manifest)),
    writeFile(evidencePath, prettyDeterministicJson(evidence)),
    writeFile(
      join(sourceDir, 'candidates.json'),
      deterministicJson(result.candidates),
    ),
    writeFile(
      join(sourceDir, 'costs.json'),
      prettyDeterministicJson(result.costs),
    ),
    writeFile(join(sourceDir, 'validation-report.md'), result.validationReport),
  ]);

  console.log(
    JSON.stringify({
      models: result.modelCount,
      mainConfigurations: result.configurationCount,
      costs: result.costCount,
      multiEffortModels: result.modelsWithMultipleEfforts,
      topTenMatches: result.topTenMatches,
      unresolvedModels: result.unresolvedModels.length,
    }),
  );
}

await main();
