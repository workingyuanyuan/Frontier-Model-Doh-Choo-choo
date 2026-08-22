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
  stripTrailingConfiguration,
} from './materializer-utils.js';

export const ZAPIER_SOURCE_ID = 'zapier-automationbench';
export const ZAPIER_PAGE_URL = 'https://zapier.com/benchmarks';
export const ZAPIER_BENCHMARK_ID = 'automationbench';
export const ZAPIER_ROUTE_FEATURE = 'task_completed_correctly';
export const ZAPIER_ADOPTION_PENDING_REASON =
  'Zapier is retained as reviewed source data but is not approved for product scoring or cost aggregation until the post-N source-adoption review.';

export const ZAPIER_PROMO_NOTE =
  '*Gemini 3.7 Flash launch promo: $0.30 / task through Dec 31, 2026 ($0.75 in / $3.75 out per MTok). Ranking and Cost / task reflect standard list pricing; the promo is noted but does not affect rank.';
export const ZAPIER_DEDICATED_NOTE =
  '†Dedicated-deployment pricing; not directly comparable to per-token API cost.';

export interface ZapierLeaderboardRow {
  rank: number;
  model: string;
  scoreText: string;
  rawCost: string;
}

export interface ParsedZapierModule {
  version: string;
  rows: ZapierLeaderboardRow[];
  promoNote: string | null;
  dedicatedDeploymentNote: string | null;
}

export interface FoundZapierRouteModule {
  url: string;
  text: string;
  discoveredModuleCount: number;
}

export interface MaterializeZapierContext {
  moduleEvidenceId: string;
  pageEvidenceId: string;
  moduleUrl: string;
  observedAt: string;
  discoveredModuleCount: number;
}

export interface MaterializeZapierResult {
  candidates: CandidateResult[];
  costs: CostRecord[];
  validationReport: string;
  version: string;
  rowCount: number;
  maxRank: number;
  resolvedRowsCount: number;
  unresolvedRowsCount: number;
  unresolvedModels: string[];
  excludedCandidatesCount: number;
  missingCostRowsCount: number;
  starredCostRowsCount: number;
  dedicatedCostRowsCount: number;
}

const moduleUrlPattern =
  /(?:https?:\/\/|\/)[^"'\s<>]+\.mjs(?:\?[^"'\s<>]*)?/giu;

export function extractZapierModuleUrls(
  html: string,
  pageUrl = ZAPIER_PAGE_URL,
): string[] {
  const urls = new Set<string>();
  for (const match of html.matchAll(moduleUrlPattern)) {
    const raw = match[0]?.replaceAll('&amp;', '&');
    if (!raw) continue;
    try {
      const url = new URL(raw, pageUrl);
      if (url.protocol === 'http:' || url.protocol === 'https:') {
        urls.add(url.href);
      }
    } catch {
      // Ignore malformed unrelated markup; the required feature search below
      // still fails closed when no route module can be found.
    }
  }
  return [...urls].toSorted((left, right) => left.localeCompare(right));
}

export async function findZapierRouteModule(
  html: string,
  loadModule: (url: string) => Promise<string>,
  pageUrl = ZAPIER_PAGE_URL,
): Promise<FoundZapierRouteModule> {
  const urls = extractZapierModuleUrls(html, pageUrl);
  if (urls.length === 0) {
    throw new Error('Zapier benchmarks page contains no .mjs module URLs');
  }

  const loaded = await Promise.all(
    urls.map(async (url) => {
      try {
        return { url, text: await loadModule(url) };
      } catch {
        return null;
      }
    }),
  );
  const matches = loaded.filter(
    (entry): entry is { url: string; text: string } =>
      entry !== null && entry.text.includes(ZAPIER_ROUTE_FEATURE),
  );

  if (matches.length === 0) {
    throw new Error(
      `No Zapier route module contains required feature ${JSON.stringify(ZAPIER_ROUTE_FEATURE)}`,
    );
  }
  if (matches.length > 1) {
    throw new Error(
      `Multiple Zapier route modules contain required feature ${JSON.stringify(ZAPIER_ROUTE_FEATURE)}: ${matches.map(({ url }) => url).join(', ')}`,
    );
  }

  return { ...matches[0]!, discoveredModuleCount: urls.length };
}

const leaderboardRowPattern =
  /\[\s*(\d+)\s*,\s*`([^`]*)`\s*,\s*`([0-9]+(?:\.[0-9]+)?%)`\s*,\s*`([^`]*)`\s*\]/gu;

export function parseZapierRouteModule(moduleText: string): ParsedZapierModule {
  if (!moduleText.includes(ZAPIER_ROUTE_FEATURE)) {
    throw new Error(
      `Zapier route module is missing required feature ${JSON.stringify(ZAPIER_ROUTE_FEATURE)}`,
    );
  }

  const rowMatches = [...moduleText.matchAll(leaderboardRowPattern)];
  const rows = rowMatches.map((match): ZapierLeaderboardRow => ({
    rank: Number(match[1]),
    model: match[2]!,
    scoreText: match[3]!,
    rawCost: match[4]!,
  }));
  if (rows.length === 0) {
    throw new Error('Zapier route module contains no leaderboard rows');
  }

  const firstRowOffset = rowMatches[0]?.index ?? 0;
  const nearbyPrefix = moduleText.slice(
    Math.max(0, firstRowOffset - 1_500),
    firstRowOffset,
  );
  const versionMatches = [
    ...nearbyPrefix.matchAll(/\b[A-Za-z_$][\w$]*\s*=\s*`(\d+\.\d+\.\d+)`/gu),
  ];
  const version = versionMatches.at(-1)?.[1];
  if (!version) {
    throw new Error('Zapier AutomationBench version was not found');
  }

  const ranks = rows.map(({ rank }) => rank);
  const maxRank = Math.max(...ranks);
  if (maxRank !== rows.length) {
    throw new Error(
      `Zapier visible row comparison failed: maximum rank ${maxRank} != parsed rows ${rows.length}`,
    );
  }
  const uniqueRanks = new Set(ranks);
  if (
    uniqueRanks.size !== rows.length ||
    rows.some(({ rank }) => rank < 1 || rank > rows.length)
  ) {
    throw new Error('Zapier leaderboard ranks are not a unique 1..N sequence');
  }

  const promoNote = moduleText.includes(ZAPIER_PROMO_NOTE)
    ? ZAPIER_PROMO_NOTE
    : null;
  const dedicatedDeploymentNote = moduleText.includes(ZAPIER_DEDICATED_NOTE)
    ? ZAPIER_DEDICATED_NOTE
    : null;
  if (rows.some(({ rawCost }) => rawCost.endsWith('*')) && !promoNote) {
    throw new Error(
      'Zapier starred cost exists but its promo footnote is missing',
    );
  }
  if (
    rows.some(({ rawCost }) => rawCost.endsWith('†')) &&
    !dedicatedDeploymentNote
  ) {
    throw new Error(
      'Zapier dedicated-deployment cost exists but its footnote is missing',
    );
  }

  return {
    version,
    rows: rows.toSorted((left, right) => left.rank - right.rank),
    promoNote,
    dedicatedDeploymentNote,
  };
}

interface ParsedCost {
  value: number | null;
  kind: 'STANDARD' | 'STARRED_STANDARD' | 'MISSING' | 'DEDICATED';
}

export function parseZapierCost(rawCost: string): ParsedCost {
  if (rawCost === '—') return { value: null, kind: 'MISSING' };
  const dedicated = rawCost.match(/^\$(\d+(?:\.\d+)?)†$/u);
  if (dedicated) return { value: null, kind: 'DEDICATED' };
  const starred = rawCost.match(/^\$(\d+(?:\.\d+)?)\*$/u);
  if (starred) {
    return { value: Number(starred[1]), kind: 'STARRED_STANDARD' };
  }
  const standard = rawCost.match(/^\$(\d+(?:\.\d+)?)$/u);
  if (standard) return { value: Number(standard[1]), kind: 'STANDARD' };
  throw new Error(`Unsupported Zapier cost value: ${JSON.stringify(rawCost)}`);
}

const trailingSegment = (rawName: string): string | null =>
  rawName.match(/\s*\(([^()]*)\)\s*$/u)?.[1]?.trim() ?? null;

const parseEffort = (
  rawName: string,
): {
  effort: string | null;
  minimal: boolean;
  low: boolean;
  recognized: boolean;
} => {
  const segment = trailingSegment(rawName);
  if (segment === null) {
    return { effort: null, minimal: false, low: false, recognized: true };
  }
  const normalized = normalizeSourceEffort(segment);
  if (normalized === 'minimal') {
    return { effort: 'low', minimal: true, low: false, recognized: true };
  }
  if (normalized !== null) {
    return {
      effort: normalized,
      minimal: false,
      low: normalized === 'low',
      recognized: true,
    };
  }
  return { effort: null, minimal: false, low: false, recognized: false };
};

const profileIdFor = (
  canonicalModelId: string | null,
  effort: string | null,
): string | null =>
  canonicalModelId && effort ? `${canonicalModelId}-${slugify(effort)}` : null;

interface ParsedEntry {
  candidate: CandidateResult;
  cost: CostRecord | null;
  cleanName: string;
  minimal: boolean;
  low: boolean;
}

const appendExclusionReason = (
  current: string | null,
  additional: string,
): string => (current ? `${current} ${additional}` : additional);

export function materializeZapier(
  moduleText: string,
  context: MaterializeZapierContext,
): MaterializeZapierResult {
  const parsed = parseZapierRouteModule(moduleText);
  const versionSlug = slugify(parsed.version);
  const entries: ParsedEntry[] = [];
  const unresolvedModels = new Set<string>();

  for (const row of parsed.rows) {
    const score = Number(row.scoreText.slice(0, -1));
    if (!Number.isFinite(score) || score < 0 || score > 100) {
      throw new Error(
        `Invalid Zapier score at rank ${row.rank}: ${row.scoreText}`,
      );
    }

    const cleanName = stripTrailingConfiguration(row.model);
    const canonicalModelId = resolveCatalogModel(cleanName).canonicalModelId;
    const effort = parseEffort(row.model);
    const profileId = profileIdFor(canonicalModelId, effort.effort);
    if (canonicalModelId === null) unresolvedModels.add(row.model);

    const inclusion = 'EXCLUDED' as const;
    let exclusionReason: string | null = ZAPIER_ADOPTION_PENDING_REASON;
    if (canonicalModelId !== null && !effort.recognized) {
      exclusionReason = appendExclusionReason(
        exclusionReason,
        `Unrecognised configuration segment ${JSON.stringify(trailingSegment(row.model))} has not been reviewed as an effort tier.`,
      );
    }

    const model = { rawName: row.model, canonicalModelId, profileId };
    const profile = {
      effort: effort.effort,
      thinking: null,
      tools: null,
      harness: 'Zapier API mode',
      contextWindowTokens: null,
      quantization: null,
      attempts: null,
    };
    const rowSlug = `${slugify(row.model)}-rank-${row.rank}`;
    const rawCost = parseZapierCost(row.rawCost);
    const rawCostLocator = `leaderboard rank ${row.rank} raw Cost / task ${JSON.stringify(row.rawCost)}`;

    const candidate = CandidateResultSchema.parse({
      schemaVersion: 'candidate-result-v1',
      id: `${ZAPIER_SOURCE_ID}:${ZAPIER_BENCHMARK_ID}:${rowSlug}:${versionSlug}`,
      sourceId: ZAPIER_SOURCE_ID,
      sourceRole: 'ORGANIZER',
      benchmarkId: ZAPIER_BENCHMARK_ID,
      benchmarkVersion: parsed.version,
      model,
      profile,
      metric: {
        id: 'task-completed-correctly',
        name: ZAPIER_ROUTE_FEATURE,
        unit: 'percent',
        higherIsBetter: true,
      },
      rawScore: score,
      normalizedScore: score,
      acquisitionStatus: 'FULL',
      inclusion,
      exclusionReason,
      sourceUrl: ZAPIER_PAGE_URL,
      observedAt: context.observedAt,
      sourcePublishedAt: null,
      evidenceIds: [context.moduleEvidenceId, context.pageEvidenceId],
      provenance: {
        profile: {
          evidenceId: context.moduleEvidenceId,
          locator: `leaderboard rank ${row.rank} model ${JSON.stringify(row.model)}; API mode`,
          method: 'EMBEDDED_JSON',
        },
        rawScore: {
          evidenceId: context.moduleEvidenceId,
          locator: `leaderboard rank ${row.rank} score ${JSON.stringify(row.scoreText)}`,
          method: 'EMBEDDED_JSON',
        },
        cost: {
          evidenceId: context.moduleEvidenceId,
          locator: rawCostLocator,
          method: 'EMBEDDED_JSON',
        },
      },
    });

    const cost =
      rawCost.value === null
        ? null
        : CostRecordSchema.parse({
            schemaVersion: 'cost-record-v1',
            id: `${ZAPIER_SOURCE_ID}:cost-per-task:${rowSlug}:${versionSlug}`,
            sourceId: ZAPIER_SOURCE_ID,
            model,
            profile,
            costType: 'AGENT_TASK',
            metricId: 'cost-per-task',
            metricName: 'AutomationBench cost per task',
            unit: 'USD_PER_TASK',
            inputPerMillionTokens: null,
            outputPerMillionTokens: null,
            cost: rawCost.value,
            assumptionId: null,
            benchmarkId: ZAPIER_BENCHMARK_ID,
            benchmarkVersion: parsed.version,
            inclusion,
            exclusionReason,
            sourceUrl: ZAPIER_PAGE_URL,
            observedAt: context.observedAt,
            sourcePublishedAt: null,
            evidenceIds: [context.moduleEvidenceId, context.pageEvidenceId],
            provenance: {
              cost: {
                evidenceId: context.moduleEvidenceId,
                locator: rawCostLocator,
                method: 'EMBEDDED_JSON',
              },
            },
          });

    entries.push({
      candidate,
      cost,
      cleanName,
      minimal: effort.minimal,
      low: effort.low,
    });
  }

  const entriesByModel = new Map<string, ParsedEntry[]>();
  for (const entry of entries) {
    const group = entriesByModel.get(entry.cleanName) ?? [];
    group.push(entry);
    entriesByModel.set(entry.cleanName, group);
  }
  for (const group of entriesByModel.values()) {
    if (group.some(({ minimal }) => minimal) && group.some(({ low }) => low)) {
      for (const entry of group.filter(({ minimal }) => minimal)) {
        const reason =
          'Zapier published both Minimal and Low labels for this model; minimal cannot represent low.';
        entry.candidate.inclusion = 'EXCLUDED';
        entry.candidate.exclusionReason = appendExclusionReason(
          entry.candidate.exclusionReason,
          reason,
        );
        if (entry.cost) {
          entry.cost.inclusion = 'EXCLUDED';
          entry.cost.exclusionReason = appendExclusionReason(
            entry.cost.exclusionReason,
            reason,
          );
        }
      }
    }
  }

  const candidates = entries
    .map(({ candidate }) => candidate)
    .toSorted((left, right) => left.id.localeCompare(right.id));
  const costs = entries
    .map(({ cost }) => cost)
    .filter((cost): cost is CostRecord => cost !== null)
    .toSorted((left, right) => left.id.localeCompare(right.id));
  const unresolved = [...unresolvedModels].toSorted((left, right) =>
    left.localeCompare(right),
  );
  const resolvedRowsCount = candidates.filter(
    ({ model }) => model.canonicalModelId !== null,
  ).length;
  const unresolvedRowsCount = candidates.length - resolvedRowsCount;
  const excluded = candidates.filter(
    ({ inclusion }) => inclusion === 'EXCLUDED',
  );
  const excludedReasonGroups = new Map<string, string[]>();
  for (const candidate of excluded) {
    const reason = candidate.exclusionReason ?? 'No exclusion reason recorded.';
    const names = excludedReasonGroups.get(reason) ?? [];
    names.push(candidate.model.rawName);
    excludedReasonGroups.set(reason, names);
  }
  const missingCostRowsCount = parsed.rows.filter(
    ({ rawCost }) => parseZapierCost(rawCost).kind === 'MISSING',
  ).length;
  const starredCostRowsCount = parsed.rows.filter(
    ({ rawCost }) => parseZapierCost(rawCost).kind === 'STARRED_STANDARD',
  ).length;
  const dedicatedCostRowsCount = parsed.rows.filter(
    ({ rawCost }) => parseZapierCost(rawCost).kind === 'DEDICATED',
  ).length;

  const validationReport = [
    '# Zapier AutomationBench acquisition validation',
    '',
    `- Page: <${ZAPIER_PAGE_URL}>`,
    `- Discovered route module: <${context.moduleUrl}>`,
    `- Module evidence: \`${context.moduleEvidenceId}\``,
    `- Page evidence: \`${context.pageEvidenceId}\``,
    `- Observed at: ${context.observedAt}`,
    '',
    '## Exact counts',
    '',
    '| Check | Count |',
    '|---|---:|',
    `| Framer .mjs modules discovered from page HTML | ${context.discoveredModuleCount} |`,
    `| Leaderboard rows parsed | ${candidates.length} |`,
    `| Maximum visible rank | ${Math.max(...parsed.rows.map(({ rank }) => rank))} |`,
    `| Cost records emitted | ${costs.length} |`,
    `| Missing-cost rows (—) | ${missingCostRowsCount} |`,
    `| Starred standard-price rows | ${starredCostRowsCount} |`,
    `| Dedicated-deployment cost rows excluded from costs | ${dedicatedCostRowsCount} |`,
    `| Canonically resolved rows | ${resolvedRowsCount} |`,
    `| Canonically unresolved rows | ${unresolvedRowsCount} |`,
    `| Distinct canonically unresolved names | ${unresolved.length} |`,
    `| Excluded candidate rows | ${excluded.length} |`,
    `| Excluded cost records | ${costs.filter(({ inclusion }) => inclusion === 'EXCLUDED').length} |`,
    '',
    '## Benchmark contract and visible comparison',
    '',
    `- AutomationBench version: \`${parsed.version}\`.`,
    `- Required content feature: \`${ZAPIER_ROUTE_FEATURE}\`. The route module is selected by content, never by its deployment hash.`,
    `- Visible comparison: maximum rank ${Math.max(...parsed.rows.map(({ rank }) => rank))} equals ${candidates.length} parsed rows.`,
    `- Headline metric: API-mode \`${ZAPIER_ROUTE_FEATURE}\` (strict pass/fail). \`partial_credit\` is diagnostic-only and is not materialized.`,
    '',
    '## Adoption status',
    '',
    `- User ruling 2026-08-22: ${ZAPIER_ADOPTION_PENDING_REASON}`,
    '- All parsed scores and comparable costs remain in the source artifacts as EXCLUDED records. They do not affect capability dimensions, Overall Score, leaderboard eligibility, ranking, or cost charts.',
    '- Revisit whether to adopt the Zapier source only after the N phase is complete.',
    '',
    '## Cost policy',
    '',
    `- Starred raw value: \`$0.61*\` → numeric cost \`0.61\` by user ruling 2026-08-22. Source note: ${parsed.promoNote ?? 'MISSING'}`,
    `- Missing raw value: \`—\` → no CostRecord; it is never written as zero.`,
    `- Dedicated raw value: \`$0.09†\` → no CostRecord by user ruling 2026-08-22. Source note: ${parsed.dedicatedDeploymentNote ?? 'MISSING'}`,
    '- Every raw Cost / task string remains in the CandidateResult provenance locator, including `*`, `†`, and `—`.',
    '',
    '## Excluded rows',
    '',
    ...(excluded.length === 0
      ? ['- None', '']
      : [
          '| Reason | Rows | Examples |',
          '|---|---:|---|',
          ...[...excludedReasonGroups.entries()].map(
            ([reason, names]) =>
              `| ${reason} | ${names.length} | ${names.slice(0, 5).join('; ')}${names.length > 5 ? '; …' : ''} |`,
          ),
          '',
        ]),
    '## Unresolved model names',
    '',
    ...(unresolved.length === 0
      ? ['- None']
      : unresolved.map((name) => `- ${name}`)),
    '',
  ].join('\n');

  return {
    candidates,
    costs,
    validationReport,
    version: parsed.version,
    rowCount: candidates.length,
    maxRank: Math.max(...parsed.rows.map(({ rank }) => rank)),
    resolvedRowsCount,
    unresolvedRowsCount,
    unresolvedModels: unresolved,
    excludedCandidatesCount: excluded.length,
    missingCostRowsCount,
    starredCostRowsCount,
    dedicatedCostRowsCount,
  };
}
