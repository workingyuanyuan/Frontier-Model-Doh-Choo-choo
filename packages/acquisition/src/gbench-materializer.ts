import {
  CandidateResultSchema,
  type CandidateResult,
} from '@llm-bench/benchmark-data';
import { asRecord, slugify } from './materializer-utils.js';

export const GBENCH_PAGE_URL =
  'https://gertlabs.com/rankings?mode=agentic_coding';
/**
 * The page asks for this endpoint without `limit`, which returns the first
 * 100 rows. Asking for a limit above the population returns every ranked row.
 */
export const GBENCH_AGENTIC_API_URL =
  'https://gertlabs.com/api/v1/global/rankings?mode=agentic_coding&limit=500';
const REQUESTED_LIMIT = 500;
/** Rows the rankings page renders for one mode. */
const PAGE_SIZE = 100;
/** Providers that are not models: the random baseline and the human player. */
const NON_MODEL_PROVIDERS = new Set(['baseline', 'custom']);

interface CatalogModel {
  modelId: string;
  displayName: string;
  aliases?: string[];
}

const isUnitInterval = (value: unknown): value is number =>
  typeof value === 'number' &&
  Number.isFinite(value) &&
  value >= 0 &&
  value <= 1;

export function materializeGbench(
  text: string,
  context: {
    evidenceId: string;
    observedAt: string;
    visualRowCount: number;
    models: readonly CatalogModel[];
  },
): {
  candidates: CandidateResult[];
  rankedRows: number;
  nonModelRows: string[];
  missingScoreRows: string[];
  validationReport: string;
} {
  if (!Number.isInteger(context.visualRowCount) || context.visualRowCount <= 0)
    throw new Error('A verified positive visual row count is required');
  const body = asRecord(JSON.parse(text));
  const rows = asRecord(body?.data)?.rankings;
  if (!Array.isArray(rows) || !rows.length)
    throw new Error('GBENCH response has no rankings');
  if (rows.length >= REQUESTED_LIMIT)
    throw new Error('GBENCH rankings may be truncated at the requested limit');
  // Exactly one page of rows means the server may have ignored `limit` and
  // returned only what the page shows; the tail cannot be verified then.
  if (rows.length === PAGE_SIZE)
    throw new Error(
      'GBENCH returned exactly one page of rows; completeness is unknown',
    );
  if (context.visualRowCount !== Math.min(rows.length, PAGE_SIZE))
    throw new Error('GBENCH rendered and API row counts differ');

  const aliases = new Map<string, string>();
  for (const model of context.models) {
    for (const alias of [model.displayName, ...(model.aliases ?? [])]) {
      if (aliases.has(alias) && aliases.get(alias) !== model.modelId)
        throw new Error(`Ambiguous exact catalog alias ${alias}`);
      aliases.set(alias, model.modelId);
    }
  }

  const seen = new Set<string>();
  const nonModelRows: string[] = [];
  const missingScoreRows: string[] = [];
  const candidates: CandidateResult[] = [];
  rows.forEach((value, index) => {
    const row = asRecord(value);
    if (
      !row ||
      typeof row.model_id !== 'string' ||
      !row.model_id.trim() ||
      typeof row.model !== 'string' ||
      typeof row.provider !== 'string' ||
      row.rank !== index + 1
    )
      throw new Error(`Invalid or unsupported GBENCH agentic row ${index}`);
    // Candidate IDs use the slug, so distinct source IDs must not share one.
    const key = slugify(row.model_id);
    if (seen.has(key)) throw new Error('Duplicate GBENCH model');
    seen.add(key);
    // Baseline and human rows carry no agentic-mode fields.
    if (NON_MODEL_PROVIDERS.has(row.provider)) {
      nonModelRows.push(row.model_id);
      return;
    }
    const mode = asRecord(row.agentic_coding);
    // A ranked model without a published score stays a missing cell rather
    // than blocking every other model's update.
    if (
      row.is_agentic === true &&
      row.gscore === null &&
      mode?.gscore === null
    ) {
      missingScoreRows.push(row.model_id);
      return;
    }
    if (
      row.is_agentic !== true ||
      !isUnitInterval(row.gscore) ||
      // The agentic-mode response repeats the mode's own GScore at the top
      // level; a mismatch means the response is not the agentic board.
      !mode ||
      mode.gscore !== row.gscore
    )
      throw new Error(`Invalid or unsupported GBENCH agentic row ${index}`);
    for (const field of ['ci_low', 'ci_high'] as const)
      if (row[field] != null && !isUnitInterval(row[field]))
        throw new Error(`Invalid GBENCH confidence interval ${index}`);
    // Only the provider-qualified ID resolves: the short `model` label could
    // match another provider's catalog name.
    const canonicalModelId = aliases.get(row.model_id) ?? null;
    const locator = `$.data.rankings[${index}]`;
    const field = (name: string) => ({
      evidenceId: context.evidenceId,
      method: 'API_RESPONSE' as const,
      locator: `${locator}.${name}`,
    });
    candidates.push(
      CandidateResultSchema.parse({
        schemaVersion: 'candidate-result-v1',
        id: `gbench:gbench-agentic-coding:${slugify(row.model_id)}`,
        sourceId: 'gbench',
        sourceRole: 'ORGANIZER',
        benchmarkId: 'gbench-agentic-coding',
        // The game catalog grows continuously and results are rebalanced;
        // GBENCH publishes no version.
        benchmarkVersion: null,
        model: {
          rawName: row.model_id,
          canonicalModelId,
          profileId: canonicalModelId ? `${canonicalModelId}-default` : null,
        },
        profile: {
          effort: null,
          thinking: null,
          tools: null,
          harness: null,
          contextWindowTokens: null,
          quantization: null,
          attempts: null,
        },
        metric: {
          id: 'agentic-coding-gscore',
          name: 'GBENCH Agentic Coding GScore',
          unit: 'gscore points',
          higherIsBetter: true,
        },
        rawScore: row.gscore,
        // GScore is published on 0–1 to four decimals and displayed as 0–100.
        normalizedScore: Number((row.gscore * 100).toFixed(2)),
        acquisitionStatus: 'FULL',
        inclusion: 'INCLUDED',
        exclusionReason: null,
        sourceUrl: GBENCH_PAGE_URL,
        observedAt: context.observedAt,
        sourcePublishedAt: null,
        evidenceIds: [context.evidenceId],
        provenance: {
          rawScore: field('gscore'),
          'model.rawName': field('model_id'),
          'profile.effort': {
            ...field('model_id'),
            locator: `${locator}; the response names no effort or reasoning setting`,
          },
          agenticCodingGscore: field('agentic_coding.gscore'),
          ...(row.ci_low == null
            ? {}
            : { confidenceIntervalLow: field('ci_low') }),
          ...(row.ci_high == null
            ? {}
            : { confidenceIntervalHigh: field('ci_high') }),
        },
      }),
    );
  });
  candidates.sort((a, b) => a.id.localeCompare(b.id));
  const resolved = candidates.filter((row) => row.model.canonicalModelId);
  return {
    candidates,
    rankedRows: rows.length,
    nonModelRows,
    missingScoreRows,
    validationReport: [
      '# GBENCH acquisition validation',
      '',
      `- Source ${GBENCH_PAGE_URL}; data ${GBENCH_AGENTIC_API_URL}`,
      `- Observed ${context.observedAt}`,
      `- Evidence \`${context.evidenceId}\``,
      `- Ranked rows ${rows.length}; rendered Agentic Coding rows ${context.visualRowCount} (the page shows the first ${PAGE_SIZE}); non-model rows excluded ${nonModelRows.length} (${nonModelRows.join(', ') || 'none'}); rows without a published score ${missingScoreRows.length} (${missingScoreRows.join(', ') || 'none'}); candidates ${candidates.length}; resolved identities ${resolved.length}.`,
      '- Only the Agentic Coding GScore is scored, as `gbench-agentic-coding` (2026-11-21 user decision). The combined, one-shot and decision-making scores remain in the raw artifact.',
      '- GScore is published on 0–1 and multiplied by 100. It is a relative score: population-adjusted percentiles against the other ranked models, so earlier models move when models or games are added. GBENCH publishes no benchmark version, so `benchmarkVersion` is null.',
      '- The response names no effort, reasoning, thinking or harness setting for any row; those fields stay null and product effort comes from the cross-source vote. Confidence bounds are kept in provenance.',
      '- Identities resolve only through exact catalog display names or aliases matching the provider-qualified source `model_id`; the short `model` label is never used. Unresolved rows keep their raw name.',
      '',
      '## Exact model identities',
      '',
      '| Source model | Canonical identity | GScore |',
      '|---|---|---:|',
      ...candidates.map(
        (row) =>
          `| ${row.model.rawName} | ${row.model.canonicalModelId ?? 'null'} | ${row.normalizedScore} |`,
      ),
      '',
    ].join('\n'),
  };
}
