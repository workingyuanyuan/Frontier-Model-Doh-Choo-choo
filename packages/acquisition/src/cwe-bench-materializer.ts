import {
  CandidateResultSchema,
  SourceManifestSchema,
  type CandidateResult,
  type SourceManifest,
} from '@llm-bench/benchmark-data';
import { resolveCatalogModel, slugify } from './materializer-utils.js';

export const CWE_BENCH_SOURCE_ID = 'cwe-bench';
export const CWE_BENCH_PAGE_URL = 'https://cwe-bench.com/';
const BENCHMARK_ID = 'cwe-bench-v2';

/** Published methodology the scores depend on; a change means a new review. */
const METHODOLOGY = {
  version: 'v2',
  tasks: 250,
  attempts: 4,
  effort: 'high',
  scope: 'all 250 tasks, public and held-out',
} as const;

const decodeEntities = (value: string): string =>
  value
    .replace(/&#(\d+);/gu, (_, code: string) =>
      String.fromCodePoint(Number(code)),
    )
    .replace(/&#x([0-9a-f]+);/giu, (_, code: string) =>
      String.fromCodePoint(Number.parseInt(code, 16)),
    )
    .replace(/&nbsp;/gu, ' ')
    .replace(/&quot;/gu, '"')
    .replace(/&#39;/gu, "'")
    .replace(/&lt;/gu, '<')
    .replace(/&gt;/gu, '>')
    .replace(/&amp;/gu, '&');

const text = (html: string): string =>
  decodeEntities(html.replace(/<[^>]+>/gu, ' '))
    .replace(/\s+/gu, ' ')
    .trim();

const attribute = (tag: string, name: string): string | null => {
  const match = tag.match(new RegExp(`\\s${name}="([^"]*)"`, 'u'));
  return match ? decodeEntities(match[1]!) : null;
};

const percent = (value: string | null, label: string): number => {
  if (value === null || !/^\d{1,3}(?:\.\d+)?$/u.test(value))
    throw new Error(`Invalid CWE-bench ${label}`);
  const score = Number(value);
  if (score < 0 || score > 100) throw new Error(`Invalid CWE-bench ${label}`);
  return score;
};

export interface CweBenchContext {
  evidenceId: string;
  observedAt: string;
  visualRowCount: number;
}

/**
 * Parse the server-rendered CWE-bench leaderboard. The default Combined view
 * (all 250 tasks) is scored; the per-set Public and Held-out values stay in
 * the row attributes and are not materialized.
 */
export function materializeCweBench(
  html: string,
  context: CweBenchContext,
): {
  candidates: CandidateResult[];
  visibleRows: number;
  resultsAsOf: string;
  validationReport: string;
} {
  const leaderboard = html.match(
    /<section\b[^>]*\sid="leaderboard"[^>]*>([\s\S]*?)<\/section>/u,
  )?.[1];
  if (!leaderboard || !/CWE-bench leaderboard/u.test(leaderboard))
    throw new Error('CWE-bench leaderboard section missing');
  const resultsAsOf =
    leaderboard.match(
      /Results as of <time datetime="(\d{4}-\d{2}-\d{2})">/u,
    )?.[1] ?? null;
  if (resultsAsOf === null) throw new Error('CWE-bench results date missing');
  const scope = text(
    leaderboard.match(/<span data-set-label>([\s\S]*?)<\/span>/u)?.[1] ?? '',
  );
  const methodology = text(
    html.match(/How the scores are computed\.([\s\S]*?)<\/p>/u)?.[1] ?? '',
  );
  if (
    scope !== METHODOLOGY.scope ||
    !/four rollouts on each of the 250 tasks, at high reasoning\. Each rollout has a one-hour limit/u.test(
      methodology,
    ) ||
    !/<button\b[^>]*\sdata-set="all"[^>]*\saria-pressed="true"[^>]*>Combined \(250\)/u.test(
      leaderboard,
    ) ||
    !/<html\b[^>]*\sdata-page-ver="v2"/u.test(html)
  )
    throw new Error('CWE-bench scope or methodology drift');

  if (html.match(/<section\b[^>]*\sid="leaderboard"/gu)?.length !== 1)
    throw new Error('Expected exactly one CWE-bench leaderboard section');
  const rows = [...leaderboard.matchAll(/<tr\b[^>]*\sdata-model="[^>]*>/gu)];
  if (rows.length !== context.visualRowCount)
    throw new Error(
      `CWE-bench rows ${rows.length} do not match rendered count ${context.visualRowCount}`,
    );
  const candidates = rows
    .map((match, index) => {
      const tag = match[0];
      const start = match.index + tag.length;
      const modelKey = attribute(tag, 'data-model');
      if (!modelKey) throw new Error(`CWE-bench row ${index + 1} has no model`);
      const body = leaderboard.slice(
        start,
        leaderboard.indexOf('</tr>', start),
      );
      // The displayed name keeps the dated build that `data-model` drops:
      // `Qwen3.8-Max (0902)` against `Qwen 3.8 Max`.
      const rawName = text(
        body.match(/<td class="lb-name">([\s\S]*?)<\/td>/u)?.[1] ?? '',
      );
      const harness = text(
        body.match(/<td class="lb-harness-cell[^"]*">([\s\S]*?)<\/td>/u)?.[1] ??
          '',
      );
      const displayedPass1 = text(
        body.match(/<td\b[^>]*\sdata-k="p1"[^>]*>([\s\S]*?)<\/td>/u)?.[1] ?? '',
      );
      const score = percent(attribute(tag, 'data-p1-all'), 'Pass@1');
      const pass4 = percent(attribute(tag, 'data-p4-all'), 'Pass@4');
      if (
        rawName.length === 0 ||
        harness.length === 0 ||
        attribute(tag, 'data-p1') !== attribute(tag, 'data-p1-all') ||
        displayedPass1 !== `${attribute(tag, 'data-p1-all')}%` ||
        pass4 < score
      )
        throw new Error(
          `CWE-bench row ${index + 1} (${modelKey}) is inconsistent`,
        );
      const canonicalModelId = resolveCatalogModel(rawName).canonicalModelId;
      const locator = `#leaderboard tr[data-model="${modelKey}"] (zero-based index ${index})`;
      const field = (name: string) => ({
        evidenceId: context.evidenceId,
        method: 'DOM' as const,
        locator: `${locator} ${name}`,
      });
      return CandidateResultSchema.parse({
        schemaVersion: 'candidate-result-v1',
        id: `${CWE_BENCH_SOURCE_ID}:${BENCHMARK_ID}:${slugify(rawName)}`,
        sourceId: CWE_BENCH_SOURCE_ID,
        sourceRole: 'ORGANIZER',
        benchmarkId: BENCHMARK_ID,
        benchmarkVersion: METHODOLOGY.version,
        model: {
          rawName,
          canonicalModelId,
          profileId: canonicalModelId
            ? `${canonicalModelId}-${METHODOLOGY.effort}`
            : null,
        },
        profile: {
          effort: METHODOLOGY.effort,
          thinking: null,
          tools: true,
          harness,
          contextWindowTokens: null,
          quantization: null,
          attempts: METHODOLOGY.attempts,
        },
        metric: {
          id: 'pass-at-1',
          name: 'Pass@1',
          unit: 'percent',
          higherIsBetter: true,
        },
        rawScore: score,
        normalizedScore: score,
        acquisitionStatus: 'FULL',
        inclusion: 'INCLUDED',
        exclusionReason: null,
        sourceUrl: CWE_BENCH_PAGE_URL,
        observedAt: context.observedAt,
        sourcePublishedAt: `${resultsAsOf}T00:00:00.000Z`,
        evidenceIds: [context.evidenceId],
        provenance: {
          rawScore: field('[data-p1-all] (Combined Pass@1)'),
          'model.rawName': field('td.lb-name'),
          'profile.harness': field('td.lb-harness-cell'),
          'profile.effort': {
            evidenceId: context.evidenceId,
            method: 'DOM',
            locator:
              'How the scores are computed: "four rollouts on each of the 250 tasks, at high reasoning"',
          },
          'profile.attempts': {
            evidenceId: context.evidenceId,
            method: 'DOM',
            locator: 'Grading card: Attempts "4 per task, per model"',
          },
          sourcePublishedAt: {
            evidenceId: context.evidenceId,
            method: 'DOM',
            locator: `#leaderboard .lb-attribution time[datetime="${resultsAsOf}"]`,
          },
        },
      });
    })
    .sort((a, b) => a.id.localeCompare(b.id));
  if (new Set(candidates.map(({ id }) => id)).size !== candidates.length)
    throw new Error('Duplicate CWE-bench model');
  const unresolved = candidates
    .filter((row) => row.model.canonicalModelId === null)
    .map((row) => row.model.rawName);
  return {
    candidates,
    visibleRows: rows.length,
    resultsAsOf,
    validationReport: [
      '# CWE-bench v2 acquisition validation',
      '',
      `- Source: <${CWE_BENCH_PAGE_URL}>`,
      `- Evidence: \`${context.evidenceId}\``,
      `- Results as of ${resultsAsOf}; leaderboard rows: ${rows.length}; rendered browser count: ${context.visualRowCount}.`,
      "- Each row's Combined Pass@1 attribute equals the displayed default column, and Pass@4 is never below Pass@1.",
      `- Unresolved catalog identities (${unresolved.length}): ${unresolved.join('; ') || 'none'}.`,
      '',
      'Collinear AI organizes CWE-bench and runs every model itself, so rows are ORGANIZER results. Scores are the default Combined view: Pass@1 over all 250 tasks (100 public and 150 held-out), four rollouts per task. The Public (100) and Held-out (150) views are not materialized.',
      '',
      'The organizer states every model runs at high reasoning, so each row records effort high. Harness differs by row (Claude Code, Codex, Antigravity, opencode) and is kept in the profile. Average cost per rollout is not materialized.',
      '',
      'Model names resolve only through exact catalog aliases. Dated builds such as Qwen3.8-Max (0902) stay unresolved.',
      '',
    ].join('\n'),
  };
}

export const cweBenchManifest = (
  observedAt: string,
  rows: number,
): SourceManifest =>
  SourceManifestSchema.parse({
    schemaVersion: 'source-manifest-v1',
    sourceId: CWE_BENCH_SOURCE_ID,
    displayName: 'CWE-bench (Collinear AI)',
    role: 'ORGANIZER',
    baseUrl: CWE_BENCH_PAGE_URL,
    targetUrls: [CWE_BENCH_PAGE_URL],
    benchmarkIds: [BENCHMARK_ID],
    accessMethods: ['DOM'],
    completeness: {
      expectedCountMethod:
        'Count every leaderboard row with data-model in the server-rendered Combined view and compare with the rendered browser table.',
      pagination: null,
      visibleComparisonRequired: true,
    },
    fieldMapping: {
      'tr[data-model]': 'model.rawName',
      'tr[data-p1-all]': 'rawScore / normalizedScore',
      'td.lb-harness-cell': 'profile.harness',
      'How the scores are computed (high reasoning)': 'profile.effort',
      'Grading card (4 attempts per task)': 'profile.attempts',
    },
    fallbackMethods: ['VISUAL'],
    lastVerifiedAt: observedAt,
    notes: [
      `${rows} rows, Combined view (250 tasks: 100 public, 150 held-out). Public and Held-out views are not materialized.`,
      'All models run at high reasoning per the organizer; harness is per row.',
      'Average cost per rollout is not materialized.',
    ],
  });
