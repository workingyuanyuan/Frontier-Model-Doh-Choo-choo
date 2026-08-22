import {
  CandidateResultSchema,
  CostRecordSchema,
  type CandidateResult,
  type CostRecord,
} from '@llm-bench/benchmark-data';

import {
  normalizeSourceEffort,
  resolveCatalogModel,
  slugify,
} from './materializer-utils.js';

export const VALS_SOURCE_ID = 'vals-ai';
export const VALS_INDEX_URL = 'https://www.vals.ai/benchmarks';

export type ValsSourceRole = 'ORGANIZER' | 'INDEPENDENT';

export interface ApprovedValsBenchmark {
  benchmarkId: string;
  role: ValsSourceRole;
}

/** The sole scoring allow-list. A page discovered at runtime is never promoted implicitly. */
export const APPROVED_VALS_BENCHMARKS: Readonly<
  Record<string, ApprovedValsBenchmark>
> = {
  swebench: { benchmarkId: 'swe-bench', role: 'INDEPENDENT' },
  gpqa: { benchmarkId: 'gpqa-diamond', role: 'INDEPENDENT' },
  'terminal-bench-2-1': {
    benchmarkId: 'terminal-bench-2-1',
    role: 'INDEPENDENT',
  },
  lcb: { benchmarkId: 'livecodebench', role: 'INDEPENDENT' },
  mmlu_pro: { benchmarkId: 'mmlu-pro', role: 'INDEPENDENT' },
  proof_bench: { benchmarkId: 'proofbench', role: 'ORGANIZER' },
  corp_fin_v2: { benchmarkId: 'corpfin', role: 'ORGANIZER' },
  fabv2: { benchmarkId: 'finance-agent-v2', role: 'ORGANIZER' },
  'vibe-code': { benchmarkId: 'vibe-code-bench', role: 'ORGANIZER' },
  programbench: { benchmarkId: 'programbench', role: 'ORGANIZER' },
  ioi: { benchmarkId: 'ioi', role: 'INDEPENDENT' },
  'code-migration': { benchmarkId: 'code-migration', role: 'ORGANIZER' },
  skillsbench: { benchmarkId: 'skillsbench', role: 'INDEPENDENT' },
  hlab: { benchmarkId: 'hlab', role: 'INDEPENDENT' },
  emb: { benchmarkId: 'emb', role: 'ORGANIZER' },
  legal_bench: { benchmarkId: 'legal-bench', role: 'INDEPENDENT' },
  legal_research: { benchmarkId: 'legal-research', role: 'ORGANIZER' },
  medcode: { benchmarkId: 'medcode', role: 'ORGANIZER' },
  medscribe: { benchmarkId: 'medscribe', role: 'ORGANIZER' },
  tax_eval_v2: { benchmarkId: 'tax-eval-v2', role: 'ORGANIZER' },
  'public-benefits-bench': {
    benchmarkId: 'public-benefits-bench',
    role: 'ORGANIZER',
  },
  cyber: { benchmarkId: 'cyber', role: 'INDEPENDENT' },
  reverse_eng: { benchmarkId: 'reverse-eng', role: 'ORGANIZER' },
};

export const COMPOSITE_VALS_SLUGS: ReadonlySet<string> = new Set([
  'vals_index',
  'vals_multimodal_index',
  'time_horizon_index',
  'web_search',
]);

const REVIEWED_UNAPPROVED_IDS: Readonly<Record<string, string>> = {
  aime: 'aime',
  case_law_v2: 'case-law-v2',
  math500: 'math500',
  medqa: 'medqa',
  mgsm: 'mgsm',
  mmmu: 'mmmu',
  mortgage_tax: 'mortgage-tax',
  poker_agent: 'poker-agent',
  sage: 'sage',
  'terminal-bench-2': 'terminal-bench-2',
  vals_index: 'vals-index',
  vals_multimodal_index: 'vals-multimodal-index',
  time_horizon_index: 'time-horizon-index',
  web_search: 'web-search',
};

export interface ValsOverallRow {
  accuracy?: unknown;
  cost_per_test?: unknown;
  reasoning_effort?: unknown;
  compute_effort?: unknown;
  harness?: unknown;
}

export interface ParsedValsPage {
  metadata: Record<string, unknown>;
  rows: Record<string, ValsOverallRow>;
}

export interface ValsPageInput {
  slug: string;
  html: string;
  evidenceId: string;
  sourceUrl: string;
}

export interface MaterializeValsContext {
  observedAt: string;
  indexEvidenceId: string;
  discoveredSlugs: string[];
}

export interface MaterializeValsResult {
  candidates: CandidateResult[];
  costs: CostRecord[];
  validationReport: string;
  parsedPages: number;
  unavailablePages: string[];
  approvedSlugs: string[];
  unapprovedSlugs: string[];
  newlyDiscoveredSlugs: string[];
  unresolvedModels: string[];
}

export function decodeHtmlEntities(value: string): string {
  return value.replace(
    /&(?:quot|amp|lt|gt|apos|#39|#x[0-9a-f]+|#[0-9]+);/giu,
    (entity) => {
      const key = entity.slice(1, -1).toLowerCase();
      if (key === 'quot') return '"';
      if (key === 'amp') return '&';
      if (key === 'lt') return '<';
      if (key === 'gt') return '>';
      if (key === 'apos' || key === '#39') return "'";
      const radix = key.startsWith('#x') ? 16 : 10;
      const digits = key.slice(radix === 16 ? 2 : 1);
      const codePoint = Number.parseInt(digits, radix);
      return Number.isFinite(codePoint)
        ? String.fromCodePoint(codePoint)
        : entity;
    },
  );
}

/** Recursively removes Astro's serialized `[type, value]` envelopes. */
export function unwrapAstroValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    if (
      value.length === 2 &&
      typeof value[0] === 'number' &&
      Number.isInteger(value[0])
    ) {
      return unwrapAstroValue(value[1]);
    }
    return value.map(unwrapAstroValue);
  }
  if (typeof value === 'object' && value !== null) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, unwrapAstroValue(item)]),
    );
  }
  return value;
}

const attributeValue = (tag: string, name: string): string | null => {
  const match = tag.match(new RegExp(`\\b${name}="([^"]*)"`, 'u'));
  return match?.[1] ?? null;
};

export function extractValsBenchmarkSlugs(indexHtml: string): string[] {
  const slugs = new Set<string>();
  for (const match of indexHtml.matchAll(
    /href=["']\/benchmarks\/([^"'/?#]+)["']/gu,
  )) {
    if (match[1]) slugs.add(decodeURIComponent(match[1]));
  }
  return [...slugs].toSorted((left, right) => left.localeCompare(right));
}

export function parseValsBenchmarkPage(html: string): ParsedValsPage | null {
  const benchmarkTags = [...html.matchAll(/<astro-island\b[^>]*>/gu)]
    .map(([tag]) => tag)
    .filter((tag) =>
      attributeValue(tag, 'component-url')?.includes('BenchmarkView'),
    );
  if (benchmarkTags.length === 0) return null;
  if (benchmarkTags.length !== 1) {
    throw new Error(
      `Expected one BenchmarkView Astro island, found ${benchmarkTags.length}`,
    );
  }
  const encodedProps = attributeValue(benchmarkTags[0]!, 'props');
  if (!encodedProps) throw new Error('BenchmarkView Astro island has no props');
  const decoded = decodeHtmlEntities(encodedProps);
  const root = unwrapAstroValue(JSON.parse(decoded)) as Record<string, unknown>;
  const wrappedView = root.benchmarkView;
  if (typeof wrappedView !== 'object' || wrappedView === null) {
    // Vals may render a BenchmarkView shell before a benchmark has published
    // any data (currently rsi_index). The page is still captured and reported.
    return null;
  }
  const maybeDefault = (wrappedView as Record<string, unknown>).default;
  const view =
    typeof maybeDefault === 'object' && maybeDefault !== null
      ? (maybeDefault as Record<string, unknown>)
      : (wrappedView as Record<string, unknown>);
  const metadata = view.metadata;
  const tasks = view.tasks;
  if (typeof metadata !== 'object' || metadata === null) {
    throw new Error('BenchmarkView has no metadata object');
  }
  if (typeof tasks !== 'object' || tasks === null) {
    throw new Error('BenchmarkView has no tasks object');
  }
  const overall = (tasks as Record<string, unknown>).overall;
  if (
    typeof overall !== 'object' ||
    overall === null ||
    Array.isArray(overall)
  ) {
    throw new Error('BenchmarkView has no tasks.overall object');
  }
  const rows = overall as Record<string, ValsOverallRow>;
  const totalModels = Number(
    (metadata as Record<string, unknown>).total_models,
  );
  if (!Number.isInteger(totalModels) || totalModels < 0) {
    throw new Error(
      'BenchmarkView metadata.total_models is not a non-negative integer',
    );
  }
  if (Object.keys(rows).length !== totalModels) {
    throw new Error(
      `BenchmarkView total_models mismatch: metadata=${totalModels}, overall=${Object.keys(rows).length}`,
    );
  }
  return { metadata: metadata as Record<string, unknown>, rows };
}

export function decodeValsEffort(row: ValsOverallRow): string | null {
  const raw = row.reasoning_effort ?? row.compute_effort;
  return typeof raw === 'string' ? normalizeSourceEffort(raw) : null;
}

const benchmarkIdFor = (slug: string): string =>
  APPROVED_VALS_BENCHMARKS[slug]?.benchmarkId ??
  REVIEWED_UNAPPROVED_IDS[slug] ??
  slugify(slug.replaceAll('_', '-'));

const sourceRoleFor = (slug: string): ValsSourceRole =>
  APPROVED_VALS_BENCHMARKS[slug]?.role ??
  (COMPOSITE_VALS_SLUGS.has(slug) ? 'ORGANIZER' : 'INDEPENDENT');

const exclusionReasonFor = (slug: string): string | null => {
  if (COMPOSITE_VALS_SLUGS.has(slug)) {
    return 'Composite index is retained as source evidence but is never used as a direct capability score.';
  }
  if (!APPROVED_VALS_BENCHMARKS[slug]) {
    return 'Vals benchmark has not been approved for capability scoring.';
  }
  return null;
};

const isoDateOrNull = (value: unknown): string | null => {
  if (typeof value !== 'string' || value.trim().length === 0) return null;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : null;
};

const stringOrNull = (value: unknown): string | null =>
  typeof value === 'string' && value.trim().length > 0 ? value : null;

const versionOrNull = (value: unknown): string | null => {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return null;
};

export function materializeVals(
  pages: ValsPageInput[],
  context: MaterializeValsContext,
): MaterializeValsResult {
  const candidates: CandidateResult[] = [];
  const costs: CostRecord[] = [];
  const unavailablePages: string[] = [];
  const unresolvedModels = new Set<string>();
  const pageCounts: Array<{ slug: string; rows: number; approved: boolean }> =
    [];

  for (const page of pages.toSorted((left, right) =>
    left.slug.localeCompare(right.slug),
  )) {
    let parsed: ParsedValsPage | null;
    try {
      parsed = parseValsBenchmarkPage(page.html);
    } catch (error) {
      throw new Error(
        `Failed to parse Vals page ${page.slug}: ${error instanceof Error ? error.message : String(error)}`,
        { cause: error },
      );
    }
    if (!parsed) {
      unavailablePages.push(page.slug);
      pageCounts.push({ slug: page.slug, rows: 0, approved: false });
      continue;
    }
    const approved = APPROVED_VALS_BENCHMARKS[page.slug] !== undefined;
    pageCounts.push({
      slug: page.slug,
      rows: Object.keys(parsed.rows).length,
      approved,
    });
    const benchmarkId = benchmarkIdFor(page.slug);
    const sourceRole = sourceRoleFor(page.slug);
    const exclusionReason = exclusionReasonFor(page.slug);
    const benchmarkVersion = versionOrNull(parsed.metadata.version);
    const sourcePublishedAt = isoDateOrNull(parsed.metadata.updated);
    const benchmarkName = stringOrNull(parsed.metadata.benchmark) ?? page.slug;
    const seenIds = new Map<string, number>();

    for (const [rawName, row] of Object.entries(parsed.rows).toSorted(
      ([a], [b]) => a.localeCompare(b),
    )) {
      if (typeof row !== 'object' || row === null) {
        throw new Error(`${page.slug}/${rawName} is not a result object`);
      }
      const rawScore = row.accuracy;
      if (typeof rawScore !== 'number' || !Number.isFinite(rawScore)) {
        throw new Error(
          `${page.slug}/${rawName} has invalid accuracy: ${String(rawScore)}`,
        );
      }
      if (approved && (rawScore < 0 || rawScore > 100)) {
        throw new Error(
          `${page.slug}/${rawName} approved accuracy is outside 0-100: ${rawScore}`,
        );
      }
      const normalizedScore =
        rawScore >= 0 && rawScore <= 100 ? rawScore : null;
      const resolved = resolveCatalogModel(rawName);
      const canonicalModelId = resolved.canonicalModelId;
      const effort = decodeValsEffort(row);
      const profileId =
        canonicalModelId && effort ? `${canonicalModelId}-${effort}` : null;
      if (!canonicalModelId) unresolvedModels.add(rawName);
      const baseSuffix = slugify(rawName) || 'model';
      const occurrence = (seenIds.get(baseSuffix) ?? 0) + 1;
      seenIds.set(baseSuffix, occurrence);
      const suffix =
        occurrence === 1 ? baseSuffix : `${baseSuffix}-${occurrence}`;
      const profile = {
        effort,
        thinking: null,
        tools: null,
        harness: stringOrNull(row.harness),
        contextWindowTokens: null,
        quantization: null,
        attempts: null,
      };
      const model = { rawName, canonicalModelId, profileId };
      const locatorBase = `benchmarkView.tasks.overall[${JSON.stringify(rawName)}]`;
      candidates.push(
        CandidateResultSchema.parse({
          schemaVersion: 'candidate-result-v1',
          id: `${VALS_SOURCE_ID}:${benchmarkId}:${suffix}`,
          sourceId: VALS_SOURCE_ID,
          sourceRole,
          benchmarkId,
          benchmarkVersion,
          model,
          profile,
          metric: {
            id: 'accuracy',
            name:
              normalizedScore === null
                ? `${benchmarkName} source score`
                : `${benchmarkName} accuracy`,
            unit: normalizedScore === null ? 'source-score' : 'percent',
            higherIsBetter: true,
          },
          rawScore,
          normalizedScore,
          acquisitionStatus: 'FULL',
          inclusion: approved ? 'INCLUDED' : 'EXCLUDED',
          exclusionReason,
          sourceUrl: page.sourceUrl,
          observedAt: context.observedAt,
          sourcePublishedAt,
          evidenceIds: [page.evidenceId],
          provenance: {
            profile: {
              evidenceId: page.evidenceId,
              locator: `${locatorBase}.{reasoning_effort,compute_effort,harness}`,
              method: 'EMBEDDED_JSON',
            },
            rawScore: {
              evidenceId: page.evidenceId,
              locator: `${locatorBase}.accuracy`,
              method: 'EMBEDDED_JSON',
            },
            sourceRole: {
              evidenceId: page.evidenceId,
              locator: `approved benchmark role table[${JSON.stringify(page.slug)}]`,
              method: 'MANUAL',
            },
          },
        }),
      );

      if (row.cost_per_test !== null && row.cost_per_test !== undefined) {
        if (
          typeof row.cost_per_test !== 'number' ||
          !Number.isFinite(row.cost_per_test) ||
          row.cost_per_test < 0
        ) {
          throw new Error(`${page.slug}/${rawName} has invalid cost_per_test`);
        }
        const costApproved = page.slug === 'vals_index';
        costs.push(
          CostRecordSchema.parse({
            schemaVersion: 'cost-record-v1',
            id: `${VALS_SOURCE_ID}:cost-per-test:${benchmarkId}:${suffix}`,
            sourceId: VALS_SOURCE_ID,
            model,
            profile,
            costType: 'AGENT_TASK',
            metricId: 'cost-per-test',
            metricName: `${benchmarkName} cost per test`,
            unit: 'USD_PER_TASK',
            inputPerMillionTokens: null,
            outputPerMillionTokens: null,
            cost: row.cost_per_test,
            assumptionId: null,
            benchmarkId,
            benchmarkVersion,
            inclusion: costApproved ? 'INCLUDED' : 'EXCLUDED',
            exclusionReason: costApproved
              ? null
              : 'Only vals_index cost_per_test is approved as the Vals source cost for the default chart.',
            sourceUrl: page.sourceUrl,
            observedAt: context.observedAt,
            sourcePublishedAt,
            evidenceIds: [page.evidenceId],
            provenance: {
              cost: {
                evidenceId: page.evidenceId,
                locator: `${locatorBase}.cost_per_test`,
                method: 'EMBEDDED_JSON',
              },
            },
          }),
        );
      }
    }
  }

  candidates.sort((left, right) => left.id.localeCompare(right.id));
  costs.sort((left, right) => left.id.localeCompare(right.id));
  const discovered = [...new Set(context.discoveredSlugs)].toSorted((a, b) =>
    a.localeCompare(b),
  );
  const approvedSlugs = discovered.filter(
    (slug) => APPROVED_VALS_BENCHMARKS[slug],
  );
  const unapprovedSlugs = discovered.filter(
    (slug) => !APPROVED_VALS_BENCHMARKS[slug],
  );
  const knownAtReview = new Set([
    ...Object.keys(APPROVED_VALS_BENCHMARKS),
    ...Object.keys(REVIEWED_UNAPPROVED_IDS),
  ]);
  const newlyDiscoveredSlugs = discovered.filter(
    (slug) => !knownAtReview.has(slug),
  );
  const unresolved = [...unresolvedModels].toSorted((a, b) =>
    a.localeCompare(b),
  );
  const included = candidates.filter(
    ({ inclusion }) => inclusion === 'INCLUDED',
  ).length;
  const includedOutsideAllowList = candidates.filter(
    (candidate) =>
      candidate.inclusion === 'INCLUDED' &&
      !approvedSlugs.some(
        (slug) => benchmarkIdFor(slug) === candidate.benchmarkId,
      ),
  );
  if (includedOutsideAllowList.length > 0) {
    throw new Error(
      'Vals materializer promoted results outside the approved allow-list',
    );
  }

  const roleRows = Object.entries(APPROVED_VALS_BENCHMARKS)
    .toSorted(([a], [b]) => a.localeCompare(b))
    .map(
      ([slug, value]) =>
        `| \`${slug}\` | \`${value.benchmarkId}\` | ${value.role} |`,
    );
  const report = [
    '# Vals AI acquisition validation',
    '',
    `- Index evidence: \`${context.indexEvidenceId}\``,
    `- Observed at: ${context.observedAt}`,
    '',
    '## Exact counts',
    '',
    '| Check | Count |',
    '|---|---:|',
    `| Benchmark slugs discovered from index | ${discovered.length} |`,
    `| Benchmark pages with BenchmarkView data | ${pageCounts.filter(({ rows }) => rows > 0).length} |`,
    `| CandidateResults | ${candidates.length} |`,
    `| Included CandidateResults | ${included} |`,
    `| Excluded CandidateResults | ${candidates.length - included} |`,
    `| Non-percent raw scores retained without normalization | ${candidates.filter(({ normalizedScore }) => normalizedScore === null).length} |`,
    `| CostRecords retained | ${costs.length} |`,
    `| Included vals_index CostRecords | ${costs.filter(({ inclusion }) => inclusion === 'INCLUDED').length} |`,
    `| Canonically unresolved rows | ${candidates.filter(({ model }) => model.canonicalModelId === null).length} |`,
    `| Distinct canonically unresolved models | ${unresolved.length} |`,
    '',
    '## Per-page completeness',
    '',
    '| Slug | Parsed overall rows | Scoring status |',
    '|---|---:|---|',
    ...pageCounts.map(
      ({ slug, rows, approved }) =>
        `| \`${slug}\` | ${rows} | ${approved ? 'APPROVED' : 'EXCLUDED'} |`,
    ),
    '',
    'Every parsed page passed the strict `metadata.total_models === Object.keys(tasks.overall).length` check.',
    '',
    '## Approved benchmark and role table',
    '',
    '| Vals slug | Source-neutral benchmark ID | Source role |',
    '|---|---|---|',
    ...roleRows,
    '',
    'Roles are decided benchmark by benchmark: Vals-owned benchmark programs are ORGANIZER; Vals reruns of externally organized benchmarks are INDEPENDENT.',
    '',
    '## Unapproved benchmark pages',
    '',
    ...(unapprovedSlugs.length
      ? unapprovedSlugs.map((slug) => `- \`${slug}\``)
      : ['- None']),
    '',
    'All rows from these pages are retained as EXCLUDED CandidateResults. Composite indices remain excluded regardless of later mapping changes.',
    'Unapproved pages whose `accuracy` field is not a 0–100 percentage (currently Agent Poker Bench ratings) retain the finite raw value but use `normalizedScore: null`; no capability percentage is invented.',
    '',
    '## Newly discovered since the reviewed table',
    '',
    ...(newlyDiscoveredSlugs.length
      ? newlyDiscoveredSlugs.map((slug) => `- \`${slug}\` (not auto-promoted)`)
      : ['- None']),
    '',
    '## Pages without BenchmarkView data',
    '',
    ...(unavailablePages.length
      ? unavailablePages.map((slug) => `- \`${slug}\``)
      : ['- None']),
    '',
    '## Identity and effort policy',
    '',
    'Identity resolution is exact catalog/alias resolution only. Unknown names retain their raw source rows with both canonicalModelId and profileId null. No catalog entries or inferred aliases are created by this refresh.',
    'Effort uses the first source-declared value (`reasoning_effort`, otherwise `compute_effort`) only when it is a legal tier. Values such as `0.99` remain null and never create an illegal profile ID.',
    '',
    '## Complete unresolved model-name list',
    '',
    ...(unresolved.length ? unresolved.map((name) => `- ${name}`) : ['- None']),
    '',
  ].join('\n');

  return {
    candidates,
    costs,
    validationReport: report,
    parsedPages: pageCounts.filter(({ rows }) => rows > 0).length,
    unavailablePages,
    approvedSlugs,
    unapprovedSlugs,
    newlyDiscoveredSlugs,
    unresolvedModels: unresolved,
  };
}
