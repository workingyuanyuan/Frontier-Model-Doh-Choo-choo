import {
  AcquisitionBudget,
  AcquisitionLimitError,
  mapAcquisitionItems,
} from './acquisition-policy.js';
import { publicHttpsUrl } from './safe-network.js';
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
/**
 * Adopted for product scoring and cost aggregation on 2026-08-23. Before that
 * ruling every parsed row carried this reason and was EXCLUDED wholesale; the
 * constant stays exported so the ruling that lifted it is greppable and so a
 * future re-freeze does not have to reinvent the wording.
 */
export const ZAPIER_ADOPTION_PENDING_REASON =
  'Zapier is retained as reviewed source data but is not approved for product scoring or cost aggregation until the post-N source-adoption review.';

export const ZAPIER_ADOPTED_NOTE =
  'Adopted for product scoring and cost aggregation by user ruling on 2026-08-23. Rows are excluded only for a row-specific reason.';

export const ZAPIER_UNRESOLVED_EFFORT_REASON_PREFIX =
  'Unrecognised configuration segment';

export const ZAPIER_PROMO_NOTE =
  '*Promotional pricing is available for both Gemini models; Ranking and Cost / task reflect standard list pricing. Gemini 3.7 Flash: $0.30 / task through Dec 31, 2026. Gemini 3.8 Flash: $0.27 (Medium) / $0.31 (High) per task.';
export const ZAPIER_FALLBACK_NOTE =
  "§ Rank 5 is Fable 5.1 with an Opus 5 fallback: when Fable 5.1's safety classifier refuses a step, Opus 5 completes it and Fable finishes the task. Opus 5 handled ~40% of tasks (260 of 657); the 31.4% score includes those fallback completions. Cost/task shown is Fable 5.1 alone and excludes fallback tokens, so the true combo cost is higher.";
export const ZAPIER_DEEPSEEK_NOTE =
  '‡DeepSeek V4 Flash priced at Fireworks rates ($0.14 / task uncached, $0.04 cached).';
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
  fallbackNote: string | null;
  deepseekPricingNote: string | null;
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
  fallbackCostRowsCount: number;
  deepseekPriceRowsCount: number;
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
  budget = new AcquisitionBudget(),
): Promise<FoundZapierRouteModule> {
  const urls = extractZapierModuleUrls(html, pageUrl);
  if (urls.length === 0) {
    throw new Error('Zapier benchmarks page contains no .mjs module URLs');
  }

  // Validate literal destinations and discovery count before dispatching anything.
  urls.forEach((url) => publicHttpsUrl(url));
  const loaded = await mapAcquisitionItems(urls, budget, async (url) => {
    try {
      const text = await loadModule(url);
      return text.includes(ZAPIER_ROUTE_FEATURE) ? { url, text } : null;
    } catch (error) {
      if (error instanceof AcquisitionLimitError) throw error;
      return null;
    }
  });
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

const footnotePattern = /`([*§‡†][^`\r\n]*)`/gu;

function findUniqueZapierFootnote(
  moduleText: string,
  marker: string,
  label: string,
): string | null {
  const notes = [
    ...new Set(
      [...moduleText.matchAll(footnotePattern)]
        .map((match) => match[1]!)
        .filter((note) => note.startsWith(marker)),
    ),
  ];
  if (notes.length > 1) {
    throw new Error(
      `Multiple Zapier ${label} footnotes were found: ${notes.join(' | ')}`,
    );
  }
  return notes[0] ?? null;
}

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
  // Validate every visible price while parsing the source. The exact parser
  // below deliberately rejects unknown or combined markers instead of making a
  // potentially incomparable amount look like an ordinary task cost.
  for (const row of rows) parseZapierCost(row.rawCost);

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

  // The Framer module is versioned independently of this parser. Extract the
  // displayed note text so a wording update (such as the Gemini 3.8 addition)
  // remains evidence rather than being mistaken for a missing footnote.
  const promoNote = findUniqueZapierFootnote(
    moduleText,
    '*',
    'promotional pricing',
  );
  const fallbackNote = findUniqueZapierFootnote(
    moduleText,
    '§',
    'fallback pricing',
  );
  const deepseekPricingNote = findUniqueZapierFootnote(
    moduleText,
    '‡',
    'DeepSeek pricing',
  );
  const dedicatedDeploymentNote = findUniqueZapierFootnote(
    moduleText,
    '†',
    'dedicated-deployment pricing',
  );
  if (
    promoNote !== null &&
    (!/gemini\s+(?:3\.7|3\.8)/iu.test(promoNote) ||
      !/(?:promo|promotional)/iu.test(promoNote) ||
      !/standard list pricing/iu.test(promoNote))
  ) {
    throw new Error(
      `Zapier promotional pricing footnote has unsupported semantics: ${promoNote}`,
    );
  }
  if (
    fallbackNote !== null &&
    (!/fallback/iu.test(fallbackNote) ||
      !/excludes fallback tokens/iu.test(fallbackNote))
  ) {
    throw new Error(
      `Zapier fallback pricing footnote has unsupported semantics: ${fallbackNote}`,
    );
  }
  if (
    deepseekPricingNote !== null &&
    (!/deepseek/iu.test(deepseekPricingNote) ||
      !/fireworks rates/iu.test(deepseekPricingNote))
  ) {
    throw new Error(
      `Zapier DeepSeek pricing footnote has unsupported semantics: ${deepseekPricingNote}`,
    );
  }
  if (
    dedicatedDeploymentNote !== null &&
    (!/dedicated-deployment pricing/iu.test(dedicatedDeploymentNote) ||
      !/not directly comparable/iu.test(dedicatedDeploymentNote))
  ) {
    throw new Error(
      `Zapier dedicated-deployment pricing footnote has unsupported semantics: ${dedicatedDeploymentNote}`,
    );
  }
  if (rows.some(({ rawCost }) => rawCost.endsWith('*')) && !promoNote) {
    throw new Error(
      'Zapier starred cost exists but its promo footnote is missing',
    );
  }
  if (rows.some(({ rawCost }) => rawCost.endsWith('§')) && !fallbackNote) {
    throw new Error(
      'Zapier fallback cost exists but its fallback footnote is missing',
    );
  }
  if (
    rows.some(({ rawCost }) => rawCost.endsWith('‡')) &&
    !deepseekPricingNote
  ) {
    throw new Error(
      'Zapier DeepSeek-marked cost exists but its pricing footnote is missing',
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
    fallbackNote,
    deepseekPricingNote,
    dedicatedDeploymentNote,
  };
}

interface ParsedCost {
  value: number | null;
  kind:
    | 'STANDARD'
    | 'STARRED_STANDARD'
    | 'MISSING'
    | 'DEDICATED'
    | 'FALLBACK_EXCLUDED'
    | 'FIREWORKS_STANDARD';
}

export function parseZapierCost(rawCost: string): ParsedCost {
  if (rawCost === '—') return { value: null, kind: 'MISSING' };
  const dedicated = rawCost.match(/^\$(\d+(?:\.\d+)?)†$/u);
  if (dedicated) return { value: null, kind: 'DEDICATED' };
  const fallback = rawCost.match(/^\$(\d+(?:\.\d+)?)§$/u);
  if (fallback) return { value: null, kind: 'FALLBACK_EXCLUDED' };
  const fireworks = rawCost.match(/^\$(\d+(?:\.\d+)?)‡$/u);
  if (fireworks) {
    return { value: Number(fireworks[1]), kind: 'FIREWORKS_STANDARD' };
  }
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
  const normalized =
    segment.trim().toLowerCase() === 'none'
      ? 'non-reasoning'
      : normalizeSourceEffort(segment);
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

    // Zapier was adopted on 2026-08-23. A row is now excluded only when that
    // row itself is unusable, never because of the source it came from.
    let exclusionReason: string | null = null;
    if (canonicalModelId !== null && !effort.recognized) {
      exclusionReason = appendExclusionReason(
        exclusionReason,
        `${ZAPIER_UNRESOLVED_EFFORT_REASON_PREFIX} ${JSON.stringify(trailingSegment(row.model))} has not been reviewed as an effort tier.`,
      );
    }
    const inclusion = exclusionReason === null ? 'INCLUDED' : 'EXCLUDED';

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
    const costFootnote =
      rawCost.kind === 'STARRED_STANDARD'
        ? parsed.promoNote
        : rawCost.kind === 'FALLBACK_EXCLUDED'
          ? parsed.fallbackNote
          : rawCost.kind === 'FIREWORKS_STANDARD'
            ? parsed.deepseekPricingNote
            : rawCost.kind === 'DEDICATED'
              ? parsed.dedicatedDeploymentNote
              : null;
    const rawCostLocator = [
      `leaderboard rank ${row.rank} raw Cost / task ${JSON.stringify(row.rawCost)}`,
      costFootnote === null ? null : `footnote ${JSON.stringify(costFootnote)}`,
    ]
      .filter((part): part is string => part !== null)
      .join('; ');

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
  const fallbackCostRowsCount = parsed.rows.filter(
    ({ rawCost }) => parseZapierCost(rawCost).kind === 'FALLBACK_EXCLUDED',
  ).length;
  const deepseekPriceRowsCount = parsed.rows.filter(
    ({ rawCost }) => parseZapierCost(rawCost).kind === 'FIREWORKS_STANDARD',
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
    `| Fallback-composite rows with excluded fallback cost (§) | ${fallbackCostRowsCount} |`,
    `| Fireworks-marked standard-price rows (‡) | ${deepseekPriceRowsCount} |`,
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
    `- User ruling 2026-08-23: ${ZAPIER_ADOPTED_NOTE}`,
    `- Superseded ruling 2026-08-22: ${ZAPIER_ADOPTION_PENDING_REASON}`,
    '- Parsed scores and comparable costs now feed capability dimensions, Overall Score, leaderboard eligibility, ranking, and cost charts.',
    `- Rows still excluded carry a row-specific reason (unreviewed effort segment, or a Minimal label that cannot represent Low). Excluded candidate rows: ${excluded.length}.`,
    '',
    '## Cost policy',
    '',
    `- Starred raw value: \`$0.61*\` → numeric cost \`0.61\` by user ruling 2026-08-22. Source note: ${parsed.promoNote ?? 'MISSING'}`,
    `- Fallback-composite raw value: \`$2.45§\` → no CostRecord because the displayed amount excludes Opus fallback tokens. Source note: ${parsed.fallbackNote ?? 'MISSING'}`,
    `- Fireworks-marked raw value: \`$0.14‡\` → numeric per-task cost, with the source's Fireworks pricing note preserved. Source note: ${parsed.deepseekPricingNote ?? 'MISSING'}`,
    `- Missing raw value: \`—\` → no CostRecord; it is never written as zero.`,
    `- Dedicated raw value: \`$0.09†\` → no CostRecord by user ruling 2026-08-22. Source note: ${parsed.dedicatedDeploymentNote ?? 'MISSING'}`,
    '- Every raw Cost / task string remains in the CandidateResult provenance locator, including `*`, `§`, `‡`, `†`, and `—`.',
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
    fallbackCostRowsCount,
    deepseekPriceRowsCount,
    dedicatedCostRowsCount,
  };
}
