import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import {
  CandidateResultSchema,
  CostRecordSchema,
  deterministicJson,
  EvidenceRecordSchema,
  SourceManifestSchema,
  type CandidateResult,
  type EvidenceRecord,
  type SourceManifest,
} from '@llm-bench/benchmark-data';

import {
  buildArtifactRecord,
  buildCompletenessReport,
  findMissingEvidenceIds,
  renderCompletenessMarkdown,
  writeContentAddressedArtifact,
} from './index.js';
import {
  materializeArcPrize,
  materializeLechWriting,
  materializeOsworld,
  materializeScaleHle,
  materializeZapierAutomationBench,
} from './organizer-materializers.js';

type OrganizerMaterialized = ReturnType<typeof materializeArcPrize>;

export interface OrganizerMaterializerOptions {
  repositoryRoot?: string;
  observedAt?: string;
  fetcher?: typeof fetch;
}

interface OrganizerContext {
  sourceId: string;
  sourceUrl: string;
  evidenceId: string;
  observedAt: string;
  method: EvidenceRecord['method'];
  sourcePublishedAt?: string | null;
}

interface RetrievedEvidence {
  record: EvidenceRecord;
  bytes: Uint8Array;
  text: string | undefined;
}

interface SourceBundleInput {
  manifest: SourceManifest;
  evidence: RetrievedEvidence[];
  materialized: OrganizerMaterialized;
  expectedVisibleRows: number | null;
  expectedPages?: number | null;
  processedPages?: number;
  structuredVisualConflict?: boolean;
}

const DEFAULT_HEADERS = {
  accept:
    'application/json, text/html, text/plain, application/javascript;q=0.9, */*;q=0.8',
  'user-agent': 'LLM-Bench-acquisition/2.0 (+https://github.com/llm-bench)',
};

const SOURCE_MANIFESTS: Record<string, SourceManifest> = {
  'arc-prize': {
    schemaVersion: 'source-manifest-v1',
    sourceId: 'arc-prize',
    displayName: 'ARC Prize official leaderboard',
    role: 'ORGANIZER',
    baseUrl: 'https://arcprize.org',
    targetUrls: ['https://arcprize.org/leaderboard'],
    benchmarkIds: ['arc-agi'],
    accessMethods: ['DOM', 'API_RESPONSE'],
    completeness: {
      expectedCountMethod:
        'Enumerate every display=true row in the official evaluations.json for the semi-private ARC-AGI split and join model metadata from models.json.',
      pagination: null,
      visibleComparisonRequired: true,
    },
    fieldMapping: {
      modelId: 'models.json id',
      displayName: 'models.json displayName',
      score: 'evaluations.json score',
      modelReleaseDate: 'models.json modelReleaseDate',
    },
    fallbackMethods: ['DOM', 'VISUAL'],
    lastVerifiedAt: '2026-08-13T00:00:00.000Z',
    notes: [
      'Only official display=true rows are promoted; hidden and preview rows remain outside the materialized candidate set.',
      'ARC-AGI versions and evaluation splits must not be mixed in a later refresh.',
    ],
  },
  'scale-hle': {
    schemaVersion: 'source-manifest-v1',
    sourceId: 'scale-hle',
    displayName: "Scale AI / CAIS Humanity's Last Exam leaderboard",
    role: 'ORGANIZER',
    baseUrl: 'https://labs.scale.com',
    targetUrls: ['https://labs.scale.com/leaderboard/humanitys_last_exam'],
    benchmarkIds: ['humanitys-last-exam'],
    accessMethods: ['DOM'],
    completeness: {
      expectedCountMethod:
        'Count every row between the official Performance Comparison and Legend boundaries.',
      pagination: null,
      visibleComparisonRequired: true,
    },
    fieldMapping: {
      rank: 'Performance Comparison rank',
      model: 'Performance Comparison model label',
      accuracy: 'Performance Comparison accuracy',
    },
    fallbackMethods: ['VISUAL'],
    lastVerifiedAt: '2026-08-13T00:00:00.000Z',
    notes: [
      'The 2025 dataset date is not treated as the model update date; this source stores the retrieved leaderboard evidence date.',
      'HLE preview and final 2,500 results remain separate benchmark versions.',
    ],
  },
  'zapier-automationbench': {
    schemaVersion: 'source-manifest-v1',
    sourceId: 'zapier-automationbench',
    displayName: 'Zapier AutomationBench official leaderboard',
    role: 'ORGANIZER',
    baseUrl: 'https://zapier.com',
    targetUrls: ['https://zapier.com/benchmarks'],
    benchmarkIds: ['automationbench'],
    accessMethods: ['DOM', 'EMBEDDED_JSON'],
    completeness: {
      expectedCountMethod:
        'Read the route module embedded in the official Framer page and compare all displayed rank values with the largest rank in the module table.',
      pagination: null,
      visibleComparisonRequired: true,
    },
    fieldMapping: {
      version: 'route module z value',
      rank: 'route module leaderboard rank',
      model: 'route module leaderboard model',
      successRate: 'route module task_completed_correctly percentage',
      cost: 'route module API-mode cost per task',
    },
    fallbackMethods: ['DOM', 'VISUAL'],
    lastVerifiedAt: '2026-08-13T00:00:00.000Z',
    notes: [
      'The source is a Framer page; the materializer follows script_main to the /benchmarks route module before parsing its embedded table.',
      'API mode scores are the primary AutomationBench metric; missing costs remain null.',
    ],
  },
  osworld: {
    schemaVersion: 'source-manifest-v1',
    sourceId: 'osworld',
    displayName: 'XLANG Lab OSWorld 2.0 official leaderboard',
    role: 'ORGANIZER',
    baseUrl: 'https://osworld-v2.xlang.ai',
    targetUrls: ['https://osworld-v2.xlang.ai/'],
    benchmarkIds: ['osworld'],
    accessMethods: ['DOM', 'API_RESPONSE'],
    completeness: {
      expectedCountMethod:
        'Use leaderboard.js to locate official-results.json, then count official rows at the default step budget.',
      pagination: null,
      visibleComparisonRequired: true,
    },
    fieldMapping: {
      model: 'official-results.json results.model',
      reasoning: 'official-results.json results.reasoning',
      toolSetting: 'official-results.json results.toolSetting',
      binaryAccuracy: 'official-results.json results.binaryAccuracy',
      estimatedCostUsd: 'official-results.json results.estimatedCostUsd',
    },
    fallbackMethods: ['DOM', 'VISUAL'],
    lastVerifiedAt: '2026-08-13T00:00:00.000Z',
    notes: [
      'Only official rows at the payload default step budget enter the candidate set.',
      'Original tool setting is retained in evidence provenance and does not create a Product Profile.',
    ],
  },
  'lech-writing': {
    schemaVersion: 'source-manifest-v1',
    sourceId: 'lech-writing',
    displayName: 'Lech Mazur LLM Creative Story-Writing Benchmark',
    role: 'ORGANIZER',
    baseUrl: 'https://github.com',
    targetUrls: [
      'https://raw.githubusercontent.com/lechmazur/writing/main/README.md',
    ],
    benchmarkIds: ['lech-mazur-writing'],
    accessMethods: ['EXPORT'],
    completeness: {
      expectedCountMethod:
        'Compare parsed markdown table rows with the rated-model count in the Current Results note.',
      pagination: null,
      visibleComparisonRequired: true,
    },
    fieldMapping: {
      rank: 'Current Results Leaderboard Rank',
      model: 'Current Results Model',
      estimatedWinChance: 'Current Results Estimated win chance',
    },
    fallbackMethods: ['DOM', 'VISUAL'],
    lastVerifiedAt: '2026-08-13T00:00:00.000Z',
    notes: [
      'Current pairwise comparison results are separate from archived absolute ratings.',
      'Reasoning labels are retained as effort metadata and do not create a harness-specific Product Profile.',
    ],
  },
};

const asJson = (bytes: Uint8Array): string =>
  Buffer.from(bytes).toString('utf8');

const uniqueById = <T extends { id: string }>(values: T[]): T[] => {
  const seen = new Set<string>();
  return values.filter((value) => {
    if (seen.has(value.id)) return false;
    seen.add(value.id);
    return true;
  });
};

const normaliseUrl = (base: string, value: string): string => {
  try {
    return new URL(value, base).toString();
  } catch {
    return value;
  }
};

const discoverUrl = (
  html: string,
  pattern: RegExp,
  baseUrl: string,
): string | null => {
  const match = html.match(pattern);
  return match?.[1] ? normaliseUrl(baseUrl, match[1]) : null;
};

const discoverJsonArray = (json: string, keys: string[]): string => {
  const parsed = JSON.parse(json) as unknown;
  if (Array.isArray(parsed)) return json;
  if (parsed && typeof parsed === 'object') {
    for (const key of keys) {
      const candidate = (parsed as Record<string, unknown>)[key];
      if (Array.isArray(candidate)) return JSON.stringify(candidate);
    }
    const data = (parsed as Record<string, unknown>).data;
    if (Array.isArray(data)) return JSON.stringify(data);
  }
  throw new Error(`Expected a JSON array in ${keys.join(', ')}`);
};

const discoverResultsPayload = (json: string): string => {
  const parsed = JSON.parse(json) as Record<string, unknown>;
  if (Array.isArray(parsed.results)) return json;
  for (const key of ['officialResults', 'leaderboard', 'data']) {
    const rows = parsed[key];
    if (Array.isArray(rows))
      return JSON.stringify({ ...parsed, results: rows });
  }
  throw new Error('OSWorld official-results payload has no results array');
};

const fetchEvidence = async (
  repoRoot: string,
  sourceId: string,
  sourceUrl: string,
  method: EvidenceRecord['method'],
  observedAt: string,
  fetcher: typeof fetch,
): Promise<RetrievedEvidence> => {
  const response = await fetcher(sourceUrl, { headers: DEFAULT_HEADERS });
  if (!response.ok) {
    throw new Error(
      `${sourceId} fetch failed (${response.status}) ${sourceUrl}`,
    );
  }
  const bytes = new Uint8Array(await response.arrayBuffer());
  const artifactRoot = join(repoRoot, 'artifacts-v2', 'sha256');
  const persisted = await writeContentAddressedArtifact(
    artifactRoot,
    bytes,
    response.headers.get('content-type')?.split(';')[0] || 'text/plain',
  );
  const artifactPath = relative(repoRoot, persisted.path).replaceAll('\\', '/');
  const record = buildArtifactRecord(
    bytes,
    persisted.record.mediaType,
    artifactPath,
    {
      sourceId,
      retrievedAt: observedAt,
      requestUrl: sourceUrl,
      finalUrl: response.url || sourceUrl,
      method,
      metadata: { httpStatus: response.status },
    },
  );
  return {
    record,
    bytes,
    text:
      record.mediaType.includes('text') || record.mediaType.includes('json')
        ? asJson(bytes)
        : undefined,
  };
};

const contextFor = (
  evidence: RetrievedEvidence,
  observedAt: string,
  method: EvidenceRecord['method'],
): OrganizerContext => ({
  sourceId: evidence.record.sourceId,
  sourceUrl: evidence.record.requestUrl,
  evidenceId: evidence.record.id,
  observedAt,
  method,
});

const readExistingEvidence = async (
  sourceDir: string,
): Promise<EvidenceRecord[]> => {
  try {
    return EvidenceRecordSchema.array().parse(
      JSON.parse(
        await readFile(join(sourceDir, 'evidence-index.json'), 'utf8'),
      ),
    );
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
};

const writeSourceBundle = async (
  repoRoot: string,
  input: SourceBundleInput,
  observedAt: string,
): Promise<void> => {
  const sourceDir = join(
    repoRoot,
    'data-v2',
    'sources',
    input.manifest.sourceId,
  );
  await mkdir(sourceDir, { recursive: true });
  const oldEvidence = await readExistingEvidence(sourceDir);
  const evidence = uniqueById([
    ...oldEvidence,
    ...input.evidence.map(({ record }) => record),
  ]);
  const candidates = CandidateResultSchema.array().parse(
    input.materialized.candidates,
  );
  const costs = CostRecordSchema.array().parse(input.materialized.costs);
  const missingCandidateEvidence = findMissingEvidenceIds(candidates, evidence);
  const missingCostEvidence = findMissingEvidenceIds(
    costs as unknown as CandidateResult[],
    evidence,
  );
  if (missingCandidateEvidence.length || missingCostEvidence.length) {
    throw new Error(
      `${input.manifest.sourceId} references missing evidence: ${[
        ...missingCandidateEvidence,
        ...missingCostEvidence,
      ].join(', ')}`,
    );
  }
  const report = buildCompletenessReport({
    sourceId: input.manifest.sourceId,
    expectedVisibleRows: input.expectedVisibleRows,
    extractedRows: input.materialized.extractedRows,
    candidateRows: candidates.length,
    expectedPages: input.expectedPages ?? null,
    processedPages: input.processedPages ?? 1,
    structuredVisualConflict: input.structuredVisualConflict ?? false,
  });
  if (report.status === 'REVIEW_REQUIRED') {
    throw new Error(
      `${input.manifest.sourceId} requires review before writing`,
    );
  }
  const manifest = SourceManifestSchema.parse({
    ...input.manifest,
    lastVerifiedAt: observedAt,
  });
  await writeFile(
    join(sourceDir, 'manifest.json'),
    deterministicJson(manifest),
  );
  await writeFile(
    join(sourceDir, 'evidence-index.json'),
    deterministicJson(evidence),
  );
  await writeFile(
    join(sourceDir, 'candidates.json'),
    deterministicJson(
      candidates.toSorted((left, right) => left.id.localeCompare(right.id)),
    ),
  );
  await writeFile(
    join(sourceDir, 'costs.json'),
    deterministicJson(
      costs.toSorted((left, right) => left.id.localeCompare(right.id)),
    ),
  );
  await writeFile(
    join(sourceDir, 'validation-report.md'),
    `${renderCompletenessMarkdown(report)}\n## Benchmark version\n\n- ${input.materialized.benchmarkVersion ?? 'Not declared'}\n`,
  );
};

const firstDiscovered = async (
  urls: string[],
  fetchOne: (url: string) => Promise<RetrievedEvidence>,
): Promise<RetrievedEvidence> => {
  let lastError: unknown;
  for (const url of urls) {
    try {
      return await fetchOne(url);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError instanceof Error ? lastError : new Error('No URL succeeded');
};

const runArcPrize = async (
  repoRoot: string,
  observedAt: string,
  fetcher: typeof fetch,
): Promise<SourceBundleInput> => {
  const page = await fetchEvidence(
    repoRoot,
    'arc-prize',
    'https://arcprize.org/leaderboard',
    'DOM',
    observedAt,
    fetcher,
  );
  const html = page.text ?? asJson(page.bytes);
  const evalUrl =
    process.env.ARC_PRIZE_EVALUATIONS_URL ??
    discoverUrl(
      html,
      /["']([^"']*evaluations\.json[^"']*)["']/iu,
      page.record.finalUrl,
    ) ??
    'https://arcprize.org/media/data/evaluations.json';
  const modelsUrl =
    process.env.ARC_PRIZE_MODELS_URL ??
    discoverUrl(
      html,
      /["']([^"']*models\.json[^"']*)["']/iu,
      page.record.finalUrl,
    ) ??
    'https://arcprize.org/media/data/models.json';
  const evaluations = await firstDiscovered(
    [
      evalUrl,
      'https://arcprize.org/media/data/evaluations.json',
      'https://arcprize.org/data/evaluations.json',
    ],
    (url) =>
      fetchEvidence(
        repoRoot,
        'arc-prize',
        url,
        'API_RESPONSE',
        observedAt,
        fetcher,
      ),
  );
  const models = await firstDiscovered(
    [
      modelsUrl,
      'https://arcprize.org/media/data/models.json',
      'https://arcprize.org/data/models.json',
    ],
    (url) =>
      fetchEvidence(
        repoRoot,
        'arc-prize',
        url,
        'API_RESPONSE',
        observedAt,
        fetcher,
      ),
  );
  const materialized = materializeArcPrize(
    discoverJsonArray(evaluations.text ?? asJson(evaluations.bytes), [
      'evaluations',
      'results',
    ]),
    discoverJsonArray(models.text ?? asJson(models.bytes), [
      'models',
      'results',
    ]),
    contextFor(evaluations, observedAt, 'API_RESPONSE'),
    contextFor(models, observedAt, 'API_RESPONSE'),
  );
  return {
    manifest: SOURCE_MANIFESTS['arc-prize']!,
    evidence: [page, evaluations, models],
    materialized,
    expectedVisibleRows: materialized.expectedRows,
  };
};

const runScaleHle = async (
  repoRoot: string,
  observedAt: string,
  fetcher: typeof fetch,
): Promise<SourceBundleInput> => {
  const page = await fetchEvidence(
    repoRoot,
    'scale-hle',
    'https://labs.scale.com/leaderboard/humanitys_last_exam',
    'DOM',
    observedAt,
    fetcher,
  );
  const materialized = materializeScaleHle(
    page.text ?? asJson(page.bytes),
    contextFor(page, observedAt, 'DOM'),
  );
  return {
    manifest: SOURCE_MANIFESTS['scale-hle']!,
    evidence: [page],
    materialized,
    expectedVisibleRows: materialized.expectedRows,
  };
};

const runZapier = async (
  repoRoot: string,
  observedAt: string,
  fetcher: typeof fetch,
): Promise<SourceBundleInput> => {
  const page = await fetchEvidence(
    repoRoot,
    'zapier-automationbench',
    'https://zapier.com/benchmarks',
    'DOM',
    observedAt,
    fetcher,
  );
  const html = page.text ?? asJson(page.bytes);
  const scriptUrl =
    process.env.ZAPIER_SCRIPT_MAIN_URL ??
    discoverUrl(
      html,
      /<script[^>]+src=["']([^"']*script[_-]main[^"']+\.m?js[^"']*)["']/iu,
      page.record.finalUrl,
    );
  if (!scriptUrl) throw new Error('Zapier script_main URL was not found');
  const script = await fetchEvidence(
    repoRoot,
    'zapier-automationbench',
    scriptUrl,
    'EMBEDDED_JSON',
    observedAt,
    fetcher,
  );
  const scriptText = script.text ?? asJson(script.bytes);
  const routeUrl =
    process.env.ZAPIER_BENCHMARKS_ROUTE_URL ??
    discoverUrl(
      scriptText,
      /page:V\(\(\)=>import\(`([^`]+\.m?js)`\)\),path:`\/benchmarks`/u,
      script.record.finalUrl,
    ) ??
    scriptUrl;
  const route =
    routeUrl === scriptUrl
      ? script
      : await fetchEvidence(
          repoRoot,
          'zapier-automationbench',
          routeUrl,
          'EMBEDDED_JSON',
          observedAt,
          fetcher,
        );
  const materialized = materializeZapierAutomationBench(
    route.text ?? asJson(route.bytes),
    contextFor(route, observedAt, 'EMBEDDED_JSON'),
  );
  return {
    manifest: SOURCE_MANIFESTS['zapier-automationbench']!,
    evidence: [page, script, route],
    materialized,
    expectedVisibleRows: materialized.expectedRows,
  };
};

const runOsworld = async (
  repoRoot: string,
  observedAt: string,
  fetcher: typeof fetch,
): Promise<SourceBundleInput> => {
  const page = await fetchEvidence(
    repoRoot,
    'osworld',
    'https://osworld-v2.xlang.ai/',
    'DOM',
    observedAt,
    fetcher,
  );
  const html = page.text ?? asJson(page.bytes);
  const leaderboardUrl =
    process.env.OSWORLD_LEADERBOARD_JS_URL ??
    discoverUrl(
      html,
      /<script[^>]+src=["']([^"']*leaderboard\.js[^"']*)["']/iu,
      page.record.finalUrl,
    ) ??
    'https://osworld-v2.xlang.ai/leaderboard.js';
  const leaderboard = await fetchEvidence(
    repoRoot,
    'osworld',
    leaderboardUrl,
    'DOM',
    observedAt,
    fetcher,
  );
  const leaderboardText = leaderboard.text ?? asJson(leaderboard.bytes);
  const resultsUrl =
    process.env.OSWORLD_RESULTS_URL ??
    discoverUrl(
      leaderboardText,
      /["']([^"']*official-results\.json[^"']*)["']/iu,
      page.record.finalUrl,
    ) ??
    'https://osworld-v2.xlang.ai/official-results.json';
  const results = await fetchEvidence(
    repoRoot,
    'osworld',
    resultsUrl,
    'API_RESPONSE',
    observedAt,
    fetcher,
  );
  const materialized = materializeOsworld(
    discoverResultsPayload(results.text ?? asJson(results.bytes)),
    contextFor(results, observedAt, 'API_RESPONSE'),
  );
  return {
    manifest: SOURCE_MANIFESTS.osworld!,
    evidence: [page, leaderboard, results],
    materialized,
    expectedVisibleRows: materialized.expectedRows,
  };
};

const runLechWriting = async (
  repoRoot: string,
  observedAt: string,
  fetcher: typeof fetch,
): Promise<SourceBundleInput> => {
  const readme = await fetchEvidence(
    repoRoot,
    'lech-writing',
    'https://raw.githubusercontent.com/lechmazur/writing/main/README.md',
    'EXPORT',
    observedAt,
    fetcher,
  );
  const materialized = materializeLechWriting(
    readme.text ?? asJson(readme.bytes),
    contextFor(readme, observedAt, 'EXPORT'),
  );
  return {
    manifest: SOURCE_MANIFESTS['lech-writing']!,
    evidence: [readme],
    materialized,
    expectedVisibleRows: materialized.expectedRows,
  };
};

export const materializeOrganizers = async (
  options: OrganizerMaterializerOptions = {},
): Promise<
  Record<string, { candidates: number; costs: number; evidence: number }>
> => {
  const repositoryRoot = resolve(
    options.repositoryRoot ?? resolve(import.meta.dirname, '../../..'),
  );
  const observedAt = options.observedAt ?? new Date().toISOString();
  const fetcher = options.fetcher ?? fetch;
  const bundles = await Promise.all([
    runArcPrize(repositoryRoot, observedAt, fetcher),
    runScaleHle(repositoryRoot, observedAt, fetcher),
    runZapier(repositoryRoot, observedAt, fetcher),
    runOsworld(repositoryRoot, observedAt, fetcher),
    runLechWriting(repositoryRoot, observedAt, fetcher),
  ]);
  const summary: Record<
    string,
    { candidates: number; costs: number; evidence: number }
  > = {};
  for (const bundle of bundles) {
    await writeSourceBundle(repositoryRoot, bundle, observedAt);
    summary[bundle.manifest.sourceId] = {
      candidates: bundle.materialized.candidates.length,
      costs: bundle.materialized.costs.length,
      evidence: bundle.evidence.length,
    };
  }
  return summary;
};

const main = async (): Promise<void> => {
  const repositoryRoot =
    process.argv[2] ?? resolve(import.meta.dirname, '../../..');
  const summary = await materializeOrganizers({ repositoryRoot });
  console.log(JSON.stringify(summary, null, 2));
};

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  void main();
}
