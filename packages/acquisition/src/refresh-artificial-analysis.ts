import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

import {
  EvidenceRecordSchema,
  deterministicJson,
  type EvidenceRecord,
} from '@llm-bench/benchmark-data';

import {
  ARTIFICIAL_ANALYSIS_EVALUATION_SLUGS,
  extractArtificialAnalysisRscRows,
  isArtificialAnalysisActiveRow,
  materializeArtificialAnalysisRsc,
  type ArtificialAnalysisApiPage,
  type ArtificialAnalysisPage,
  type ArtificialAnalysisRow,
} from './artificial-analysis-rsc.js';
import { writeContentAddressedArtifact } from './index.js';
import {
  previousSnapshotValue,
  snapshotDeltaMarkdown,
} from './refresh-utils.js';

const MODELS_URL = 'https://artificialanalysis.ai/models';
const API_URL = 'https://artificialanalysis.ai/api/v2/data/llms/models';
const ARTICLE_URL = 'https://artificialanalysis.ai/articles/gpt-5-6-has-landed';
const SOURCE_ID = 'artificial-analysis';
const DETAIL_CONCURRENCY = 8;

const getWorkspaceRoot = (): string => {
  let directory = process.cwd();
  while (true) {
    if (existsSync(join(directory, 'data'))) return directory;
    const parent = resolve(directory, '..');
    if (parent === directory) throw new Error('Workspace root not found');
    directory = parent;
  }
};

const readJson = async <T>(path: string): Promise<T> =>
  JSON.parse(await readFile(path, 'utf8')) as T;

const prettyDeterministicJson = (value: unknown): string =>
  `${JSON.stringify(JSON.parse(deterministicJson(value)), null, 2)}\n`;

const responseMediaType = (contentType: string | null, fallback: string) => {
  if (contentType?.includes('json')) return 'application/json';
  if (contentType?.includes('html')) return 'text/html';
  return fallback;
};

interface CaptureResult {
  record: EvidenceRecord;
  body: string;
}

const capture = async (
  root: string,
  url: string,
  retrievedAt: string,
  method: EvidenceRecord['method'],
  metadata: Record<string, unknown>,
): Promise<CaptureResult> => {
  const response = await fetch(url, {
    headers: { Accept: 'text/html,application/json;q=0.9,*/*;q=0.8' },
    signal: AbortSignal.timeout(120_000),
  });
  if (!response.ok) {
    throw new Error(`${url} returned HTTP ${response.status}`);
  }
  const bytes = new Uint8Array(await response.arrayBuffer());
  const mediaType = responseMediaType(
    response.headers.get('content-type'),
    url.endsWith('.json') ? 'application/json' : 'text/html',
  );
  const stored = await writeContentAddressedArtifact(
    join(root, 'artifacts', 'sha256'),
    bytes,
    mediaType,
  );
  const record = EvidenceRecordSchema.parse({
    ...stored.record,
    sourceId: SOURCE_ID,
    retrievedAt,
    requestUrl: url,
    finalUrl: response.url || url,
    artifactPath: `artifacts/sha256/${stored.record.artifactPath}`,
    method,
    metadata,
  });
  return {
    record,
    body: new TextDecoder().decode(bytes),
  };
};

const parseRows = (captureResult: CaptureResult): ArtificialAnalysisRow[] =>
  extractArtificialAnalysisRscRows(captureResult.body);

const activeDetailSlugs = (
  pageRows: readonly ArtificialAnalysisRow[],
): string[] =>
  [
    ...new Set(
      pageRows
        .filter(isArtificialAnalysisActiveRow)
        .map((row) => row.slug)
        .filter(
          (slug): slug is string => typeof slug === 'string' && slug.length > 0,
        ),
    ),
  ].toSorted();

const captureDetailPages = async (
  root: string,
  slugs: readonly string[],
  retrievedAt: string,
): Promise<{
  pages: ArtificialAnalysisPage[];
  records: EvidenceRecord[];
  warnings: string[];
}> => {
  const pages: ArtificialAnalysisPage[] = [];
  const records: EvidenceRecord[] = [];
  const warnings: string[] = [];
  for (let index = 0; index < slugs.length; index += DETAIL_CONCURRENCY) {
    const batch = slugs.slice(index, index + DETAIL_CONCURRENCY);
    const results = await Promise.allSettled(
      batch.map(async (slug) => {
        const sourceUrl = `${MODELS_URL}/${encodeURIComponent(slug)}`;
        const result = await capture(root, sourceUrl, retrievedAt, 'NEXT_RSC', {
          captureScope: 'complete model detail response',
          kind: 'model-detail',
          slug,
        });
        return {
          record: result.record,
          rows: parseRows(result),
          sourceUrl,
          slug,
        };
      }),
    );
    for (const [offset, result] of results.entries()) {
      const slug = batch[offset]!;
      if (result.status === 'rejected') {
        warnings.push(`Model detail ${slug} failed: ${String(result.reason)}`);
        continue;
      }
      records.push(result.value.record);
      pages.push({
        kind: 'model-detail',
        slug: result.value.slug,
        sourceUrl: result.value.sourceUrl,
        evidenceId: result.value.record.id,
        retrievedAt,
        rows: result.value.rows,
      });
    }
    console.log(
      `Captured model details ${Math.min(index + DETAIL_CONCURRENCY, slugs.length)}/${slugs.length}`,
    );
  }
  return { pages, records, warnings };
};

const fetchApi = async (
  root: string,
  retrievedAt: string,
): Promise<{
  page: ArtificialAnalysisApiPage | null;
  record: EvidenceRecord | null;
  warning: string | null;
}> => {
  const key = process.env.ARTIFICIAL_ANALYSIS_API_KEY;
  if (!key) {
    return {
      page: null,
      record: null,
      warning:
        'ARTIFICIAL_ANALYSIS_API_KEY is not set; API cross-validation skipped.',
    };
  }
  try {
    const response = await fetch(API_URL, {
      headers: { Accept: 'application/json', 'x-api-key': key },
      signal: AbortSignal.timeout(120_000),
    });
    if (!response.ok) {
      return {
        page: null,
        record: null,
        warning: `API cross-validation returned HTTP ${response.status}; page pipeline continued.`,
      };
    }
    const bytes = new Uint8Array(await response.arrayBuffer());
    const stored = await writeContentAddressedArtifact(
      join(root, 'artifacts', 'sha256'),
      bytes,
      'application/json',
    );
    const record = EvidenceRecordSchema.parse({
      ...stored.record,
      sourceId: SOURCE_ID,
      retrievedAt,
      requestUrl: API_URL,
      finalUrl: response.url || API_URL,
      artifactPath: `artifacts/sha256/${stored.record.artifactPath}`,
      method: 'API_RESPONSE',
      metadata: {
        captureScope: 'complete API response; request credentials excluded',
        rowCount: Array.isArray(JSON.parse(new TextDecoder().decode(bytes)))
          ? (JSON.parse(new TextDecoder().decode(bytes)) as unknown[]).length
          : null,
      },
    });
    return {
      page: {
        sourceUrl: API_URL,
        evidenceId: record.id,
        retrievedAt,
        payload: JSON.parse(new TextDecoder().decode(bytes)) as unknown,
      },
      record,
      warning: null,
    };
  } catch (error) {
    return {
      page: null,
      record: null,
      warning: `API cross-validation failed; page pipeline continued: ${String(error)}`,
    };
  }
};

const main = async () => {
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
      'A verified --visual-profile-count=<integer> is required for Artificial Analysis refresh',
    );
  }
  const retrievedAt = new Date().toISOString();
  const sourceDirectory = join(root, 'data', 'sources', SOURCE_ID);
  const previousManifest = await readJson<{ notes?: string[] }>(
    join(sourceDirectory, 'manifest.json'),
  );
  const previousCandidates = await readJson<unknown[]>(
    join(sourceDirectory, 'candidates.json'),
  );
  const previousCosts = await readJson<unknown[]>(
    join(sourceDirectory, 'costs.json'),
  );
  const previousReport = await readFile(
    join(sourceDirectory, 'validation-report.md'),
    'utf8',
  );
  const priorScope = (previousManifest.notes ?? [])
    .join(' ')
    .match(
      /Capture observed (\d+) unique profiles, (\d+) active profiles, (\d+) task-cost rows, and (\d+) token-price rows/u,
    );
  const existingEvidence = await readJson<EvidenceRecord[]>(
    join(sourceDirectory, 'evidence-index.json'),
  );
  const pages: ArtificialAnalysisPage[] = [];
  const records: EvidenceRecord[] = [];

  const modelsCapture = await capture(
    root,
    MODELS_URL,
    retrievedAt,
    'NEXT_RSC',
    { captureScope: 'complete models response', kind: 'models' },
  );
  records.push(modelsCapture.record);
  pages.push({
    kind: 'models',
    slug: 'models',
    sourceUrl: MODELS_URL,
    evidenceId: modelsCapture.record.id,
    retrievedAt,
    rows: parseRows(modelsCapture),
  });

  for (const slug of ARTIFICIAL_ANALYSIS_EVALUATION_SLUGS) {
    const sourceUrl = `https://artificialanalysis.ai/evaluations/${slug}`;
    const result = await capture(root, sourceUrl, retrievedAt, 'NEXT_RSC', {
      captureScope: 'complete evaluation response',
      kind: 'evaluation',
      slug,
    });
    records.push(result.record);
    pages.push({
      kind: 'evaluation',
      slug,
      sourceUrl,
      evidenceId: result.record.id,
      retrievedAt,
      rows: parseRows(result),
    });
    console.log(
      `Captured evaluation ${slug}: ${pages.at(-1)?.rows?.length ?? 0} rows`,
    );
  }

  const allPageRows = pages.flatMap(({ rows }) => rows ?? []);
  const detail = await captureDetailPages(
    root,
    activeDetailSlugs(allPageRows),
    retrievedAt,
  );
  pages.push(...detail.pages);
  records.push(...detail.records);

  const api = await fetchApi(root, retrievedAt);
  if (api.record) records.push(api.record);
  const result = materializeArtificialAnalysisRsc(pages, api.page);
  if (visualProfileCount < result.pageRows) {
    throw new Error(
      `Visible Artificial Analysis catalog count ${visualProfileCount} is smaller than the evaluation-page profile union ${result.pageRows}`,
    );
  }
  modelsCapture.record.metadata = {
    ...modelsCapture.record.metadata,
    visibleCatalogModels: visualProfileCount,
    materializedEvaluationProfiles: result.pageRows,
    visibleComparisonCompleted: true,
    visibleComparisonScopeComparable: false,
  };
  const warnings = [...detail.warnings];
  if (api.warning) warnings.push(api.warning);
  let baseReport = result.validationReport.trimEnd();
  if (api.warning) {
    baseReport = baseReport.replace(
      '- Warning: API cross-validation was not attempted.',
      `- Warning: ${api.warning}`,
    );
  }
  const report = [
    baseReport,
    ...warnings
      .filter((warning) => warning !== api.warning)
      .map((warning) => `- Warning: ${warning}`),
    '',
    '## Visible comparison',
    '',
    `- Fresh rendered models page catalog total: ${visualProfileCount}`,
    `- Unique profiles across the captured models, evaluation, and model-detail payloads: ${result.pageRows}`,
    '- Result: scopes differ. The catalog total includes models outside the selected evaluation pages; it is recorded for visual validation but is not used to synthesize missing score rows.',
    '',
    snapshotDeltaMarkdown([
      {
        label: 'Unique source profiles',
        previous: previousSnapshotValue(
          previousReport,
          'Unique source profiles',
          Number(priorScope?.[1] ?? result.pageRows),
        ),
        refreshed: result.pageRows,
      },
      {
        label: 'Active source profiles',
        previous: previousSnapshotValue(
          previousReport,
          'Active source profiles',
          Number(priorScope?.[2] ?? result.activeRows),
        ),
        refreshed: result.activeRows,
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
        label: 'Materialized costs',
        previous: previousSnapshotValue(
          previousReport,
          'Materialized costs',
          previousCosts.length,
        ),
        refreshed: result.costs.length,
      },
    ]),
  ].join('\n');

  const legacyEvidence = existingEvidence.filter(
    ({ requestUrl }) =>
      requestUrl === ARTICLE_URL ||
      (!requestUrl.includes('/evaluations/') &&
        requestUrl !== MODELS_URL &&
        !requestUrl.startsWith(`${MODELS_URL}/`) &&
        requestUrl !== API_URL),
  );
  const mergedEvidence = [...legacyEvidence, ...records].toSorted(
    (left, right) =>
      left.requestUrl.localeCompare(right.requestUrl) ||
      left.id.localeCompare(right.id),
  );

  await writeFile(
    join(sourceDirectory, 'evidence-index.json'),
    prettyDeterministicJson(mergedEvidence),
  );
  await writeFile(
    join(sourceDirectory, 'candidates.json'),
    prettyDeterministicJson(result.candidates),
  );
  await writeFile(
    join(sourceDirectory, 'costs.json'),
    prettyDeterministicJson(result.costs),
  );
  await writeFile(join(sourceDirectory, 'validation-report.md'), report);

  const manifest = previousManifest as Record<string, unknown>;
  const benchmarkIds = Array.isArray(manifest.benchmarkIds)
    ? manifest.benchmarkIds
    : [];
  const updatedManifest = {
    ...manifest,
    completeness: {
      ...(manifest.completeness as Record<string, unknown>),
      expectedCountMethod:
        'Union every listed evaluation page by profile slug, filter active non-deprecated profiles, then compare score coverage and detail-page task costs; $undefined and null are missing.',
    },
    targetUrls: [
      MODELS_URL,
      API_URL,
      ...ARTIFICIAL_ANALYSIS_EVALUATION_SLUGS.map(
        (slug) => `https://artificialanalysis.ai/evaluations/${slug}`,
      ),
      ARTICLE_URL,
    ].toSorted(),
    accessMethods: ['NEXT_RSC', 'API_RESPONSE', 'DOM'],
    lastVerifiedAt: retrievedAt,
    benchmarkIds,
    notes: [
      'Evaluation pages are unioned by profile slug; detail pages are fetched for every active profile to obtain intelligenceIndexCostPerTask and token prices.',
      'The API response is used only for overlap validation. Credentials are never written to artifacts or ProductVersion.',
      '`$undefined` and null are both treated as missing values.',
      `Capture observed ${result.pageRows} unique profiles, ${result.activeRows} active profiles, ${result.taskCostRows} task-cost rows, and ${result.tokenPriceRows} token-price rows.`,
      `Materialized ${result.intelligenceIndexRows} Intelligence Index candidates (all EXCLUDED) and ${result.gdpvalRows} GDPval-AA normalized candidates.`,
    ],
  };
  await writeFile(
    join(sourceDirectory, 'manifest.json'),
    prettyDeterministicJson(updatedManifest),
  );

  console.log(
    JSON.stringify({
      pageRows: result.pageRows,
      activeRows: result.activeRows,
      candidates: result.candidates.length,
      intelligenceIndexRows: result.intelligenceIndexRows,
      gdpvalRows: result.gdpvalRows,
      taskCostRows: result.taskCostRows,
      tokenPriceRows: result.tokenPriceRows,
      apiWarning: api.warning,
      warnings: warnings.length,
    }),
  );
};

await main();
