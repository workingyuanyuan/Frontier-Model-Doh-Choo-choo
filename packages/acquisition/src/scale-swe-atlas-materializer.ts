import {
  CandidateResultSchema,
  type CandidateResult,
} from '@llm-bench/benchmark-data';
import { asRecord, slugify } from './materializer-utils.js';

export const SCALE_SWE_ATLAS_PAGE_URL =
  'https://scale.com/leaderboard/swe-atlas';

interface CatalogModel {
  modelId: string;
  displayName: string;
  aliases?: string[];
}

/** Parse JSON transport chunks without evaluating any source JavaScript. */
function pageObjects(
  html: string,
): { value: Record<string, unknown>; locator: string }[] {
  const chunks = [
    ...html.matchAll(/self\.__next_f\.push\((\[.*?\])\)<\/script>/gsu),
  ]
    .map((match) => JSON.parse(match[1]!) as unknown[])
    .filter((chunk) => chunk[0] === 1 && typeof chunk[1] === 'string')
    .map((chunk) => chunk[1] as string)
    .join('');
  const objects: { value: Record<string, unknown>; locator: string }[] = [];
  const visit = (value: unknown, locator: string): void => {
    if (Array.isArray(value))
      value.forEach((item, index) => visit(item, `${locator}[${index}]`));
    else {
      const record = asRecord(value);
      if (record) {
        objects.push({ value: record, locator });
        Object.entries(record).forEach(([key, item]) =>
          visit(item, `${locator}.${key}`),
        );
      }
    }
  };
  for (const line of chunks.split('\n')) {
    const separator = line.indexOf(':');
    const body = line.slice(separator + 1);
    if (!body.startsWith('[') && !body.startsWith('{')) continue;
    let parsed: unknown;
    try {
      parsed = JSON.parse(body);
    } catch {
      continue;
    }
    visit(parsed, `Next RSC ${line.slice(0, separator)}`);
  }
  return objects;
}

export function materializeScaleSweAtlas(
  html: string,
  context: {
    evidenceId: string;
    observedAt: string;
    visualRowCount: number;
    models: readonly CatalogModel[];
  },
): {
  candidates: CandidateResult[];
  visibleRows: number;
  confidenceIntervals: {
    model: string;
    confidenceInterval_upper: number | null;
    confidenceInterval_lower: number | null;
  }[];
  rawVariantCounts: Record<string, number>;
  validationReport: string;
} {
  if (!Number.isInteger(context.visualRowCount) || context.visualRowCount <= 0)
    throw new Error('A verified positive visual row count is required');
  if (!/SWE Atlas v1\.1 is live\./u.test(html))
    throw new Error('SWE Atlas v1.1 methodology marker missing');
  const boards = pageObjects(html).filter(
    ({ value }) => value.slug === 'swe-atlas' && Array.isArray(value.variants),
  );
  if (boards.length !== 1)
    throw new Error('Expected one SWE Atlas variant leaderboard');
  const board = boards[0]!;
  if (board.value.activeTab !== 'overall')
    throw new Error('SWE Atlas default tab changed');
  const variants = board.value.variants as Record<string, unknown>[];
  const keys = variants.map((variant) => variant.key);
  if (
    JSON.stringify(keys) !==
    JSON.stringify(['overall', 'qna', 'testwriting', 'refactoring'])
  )
    throw new Error('SWE Atlas variant scope changed');
  const rawVariantCounts: Record<string, number> = {};
  for (const variant of variants) {
    if (!Array.isArray(variant.entries) || !variant.entries.length)
      throw new Error('Empty SWE Atlas variant');
    rawVariantCounts[String(variant.key)] = variant.entries.length;
  }
  const overall = variants[0]!;
  if (overall.label !== 'SWE Atlas - Overall')
    throw new Error('SWE Atlas overall label changed');
  const rows = overall.entries as unknown[];
  if (rows.length !== context.visualRowCount)
    throw new Error('SWE Atlas rendered and embedded row count mismatch');
  const aliases = new Map<string, string>();
  for (const model of context.models) {
    for (const alias of [model.displayName, ...(model.aliases ?? [])]) {
      if (aliases.has(alias) && aliases.get(alias) !== model.modelId)
        throw new Error(`Ambiguous exact catalog alias ${alias}`);
      aliases.set(alias, model.modelId);
    }
  }
  const seen = new Set<string>();
  const confidenceIntervals: ReturnType<
    typeof materializeScaleSweAtlas
  >['confidenceIntervals'] = [];
  const candidates = rows
    .map((value, index) => {
      const row = asRecord(value);
      if (
        !row ||
        typeof row.model !== 'string' ||
        !row.model.trim() ||
        typeof row.score !== 'number' ||
        !Number.isFinite(row.score) ||
        row.score < 0 ||
        row.score > 100 ||
        typeof row.version !== 'string' ||
        row.version !== '' ||
        row.deprecated !== false ||
        typeof row.rank !== 'number' ||
        !Number.isInteger(row.rank) ||
        row.rank < 1 ||
        typeof row.createdAt !== 'string' ||
        !Number.isFinite(Date.parse(row.createdAt)) ||
        typeof row.contaminationMessage !== 'string' ||
        row.contaminationMessage !== ''
      )
        throw new Error(
          `Invalid or unsupported SWE Atlas overall row ${index}`,
        );
      for (const field of [
        'confidenceInterval_upper',
        'confidenceInterval_lower',
      ]) {
        if (
          row[field] !== undefined &&
          row[field] !== null &&
          (typeof row[field] !== 'number' ||
            !Number.isFinite(row[field]) ||
            row[field] < 0 ||
            row[field] > 100)
        )
          throw new Error(`Invalid SWE Atlas confidence interval ${index}`);
      }
      const key = slugify(row.model);
      if (seen.has(key)) throw new Error('Duplicate SWE Atlas overall model');
      seen.add(key);
      const canonicalModelId = aliases.get(row.model) ?? null;
      const effort =
        row.model.match(
          /\s\((non-reasoning|low|medium|high|xhigh|max)\)$/u,
        )?.[1] ?? null;
      const locator = `${board.locator}.variants[0].entries[${index}]`;
      const field = (name: string) => ({
        evidenceId: context.evidenceId,
        method: 'NEXT_RSC' as const,
        locator: `${locator}.${name}`,
      });
      confidenceIntervals.push({
        model: row.model,
        confidenceInterval_upper:
          (row.confidenceInterval_upper as number | null) ?? null,
        confidenceInterval_lower:
          (row.confidenceInterval_lower as number | null) ?? null,
      });
      return CandidateResultSchema.parse({
        schemaVersion: 'candidate-result-v1',
        id: `scale-swe-atlas:swe-atlas:${key}`,
        sourceId: 'scale-swe-atlas',
        sourceRole: 'ORGANIZER',
        benchmarkId: 'swe-atlas',
        benchmarkVersion: 'v1.1',
        model: {
          rawName: row.model,
          canonicalModelId,
          profileId: canonicalModelId
            ? `${canonicalModelId}-${effort ?? 'default'}`
            : null,
        },
        profile: {
          effort,
          thinking: null,
          tools: null,
          harness: null,
          contextWindowTokens: null,
          quantization: null,
          attempts: null,
        },
        metric: {
          id: 'overall-score',
          name: 'SWE Atlas Overall score',
          unit: 'percent',
          higherIsBetter: true,
        },
        rawScore: row.score,
        normalizedScore: row.score,
        acquisitionStatus: 'FULL',
        inclusion: 'INCLUDED',
        exclusionReason: null,
        sourceUrl: SCALE_SWE_ATLAS_PAGE_URL,
        observedAt: context.observedAt,
        sourcePublishedAt: null,
        evidenceIds: [context.evidenceId],
        provenance: {
          rawScore: field('score'),
          'model.rawName': field('model'),
          'profile.effort': {
            ...field('model'),
            locator: `${locator}.model; effort is retained only when explicitly named`,
          },
          sourceCreatedAt: field('createdAt'),
          ...(row.confidenceInterval_upper == null
            ? {}
            : { confidenceIntervalUpper: field('confidenceInterval_upper') }),
          ...(row.confidenceInterval_lower == null
            ? {}
            : { confidenceIntervalLower: field('confidenceInterval_lower') }),
        },
      });
    })
    .sort((a, b) => a.id.localeCompare(b.id));
  return {
    candidates,
    visibleRows: rows.length,
    confidenceIntervals,
    rawVariantCounts,
    validationReport: [
      '# Scale SWE Atlas acquisition validation',
      '',
      `- Source ${SCALE_SWE_ATLAS_PAGE_URL}`,
      `- Observed ${context.observedAt}`,
      `- Evidence \`${context.evidenceId}\``,
      `- Rendered Overall rows ${context.visualRowCount}; embedded Overall rows ${rows.length}; candidates ${candidates.length}.`,
      `- Embedded variant populations: ${JSON.stringify(rawVariantCounts)}.`,
      '- Only Overall contributes one SWE Atlas v1.1 score per model. QnA, Test Writing and Refactoring remain in the raw HTML artifact.',
      '- Published scores use the 0–100 scale directly. maxScore is chart-axis metadata, not the normalization denominator.',
      '- The official v1.1 notice describes 284 tasks and reruns with GPT-6.1 Sol as judge (majority of three votes), refined grading and restricted networking. Judge votes are not agent attempts.',
      '- Unpublished effort, tools, harness, thinking, context, quantization and attempts remain null. Row createdAt is retained in provenance and is not treated as a score publication timestamp.',
      '- Published confidenceInterval_upper/lower fields are retained verbatim in artifact metadata and field provenance. No confidence level or missing bound is inferred.',
      '',
      '## Exact model identities',
      '',
      '| Source model | Canonical identity | Source effort |',
      '|---|---|---|',
      ...candidates.map(
        (row) =>
          `| ${row.model.rawName} | ${row.model.canonicalModelId ?? 'null'} | ${row.profile.effort ?? 'null'} |`,
      ),
      '',
    ].join('\n'),
  };
}
