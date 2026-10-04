import {
  CandidateResultSchema,
  type CandidateResult,
} from '@llm-bench/benchmark-data';
import { resolveCatalogModel, slugify } from './materializer-utils.js';

export const FRONTIER_SWE_PAGE_URL = 'https://www.frontierswe.com/';

type Row = { model: string; harness: string; overall: number };
const record = (value: unknown): Record<string, unknown> | null =>
  value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;

/** Read JSON data only; never execute scripts supplied by the source. */
function pageObjects(html: string): Record<string, unknown>[] {
  const chunks = [
    ...html.matchAll(/self\.__next_f\.push\((\[.*?\])\)<\/script>/gsu),
  ]
    .map((match) => JSON.parse(match[1]!) as unknown[])
    .filter((chunk) => chunk[0] === 1 && typeof chunk[1] === 'string')
    .map((chunk) => chunk[1] as string)
    .join('');
  const objects: Record<string, unknown>[] = [];
  const visit = (value: unknown): void => {
    if (Array.isArray(value)) value.forEach(visit);
    else {
      const item = record(value);
      if (item) {
        objects.push(item);
        Object.values(item).forEach(visit);
      }
    }
  };
  for (const line of chunks.split('\n')) {
    const body = line.slice(line.indexOf(':') + 1);
    if (!body.startsWith('[') && !body.startsWith('{')) continue;
    let parsed: unknown;
    try {
      parsed = JSON.parse(body);
    } catch {
      continue;
    }
    visit(parsed);
  }
  return objects;
}

export function materializeFrontierSwe(
  html: string,
  context: { evidenceId: string; observedAt: string },
): {
  candidates: CandidateResult[];
  validationReport: string;
  visibleRows: number;
} {
  const heading = html
    .match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/u)?.[1]
    ?.replace(/<[^>]*>/gu, ' ')
    .replace(/\s+/gu, ' ')
    .trim();
  if (heading !== 'FrontierSWE V2')
    throw new Error('FrontierSWE V2 page marker missing');
  const objects = pageObjects(html);
  const leaderboards = objects.filter(
    (object) => record(record(object.entries)?.abs)?.mean !== undefined,
  );
  if (leaderboards.length !== 1)
    throw new Error('Expected one FrontierSWE V2 mean@5 leaderboard');
  const board = leaderboards[0]!;
  if (
    typeof board.note !== 'string' ||
    !board.note.includes('5 trials per task')
  ) {
    throw new Error('FrontierSWE trial methodology changed');
  }
  const rawRows = record(record(board.entries)?.abs)?.mean;
  if (!Array.isArray(rawRows) || !rawRows.length)
    throw new Error('Empty FrontierSWE mean@5 results');
  const rows: Row[] = rawRows.map((value) => {
    const row = record(value);
    if (
      !row ||
      typeof row.model !== 'string' ||
      !row.model.trim() ||
      typeof row.harness !== 'string' ||
      !row.harness.trim() ||
      typeof row.overall !== 'number' ||
      !Number.isFinite(row.overall) ||
      row.overall < 0 ||
      row.overall > 100
    ) {
      throw new Error('Invalid FrontierSWE mean@5 row');
    }
    return { model: row.model, harness: row.harness, overall: row.overall };
  });
  const key = (row: { model: string; harness: string }) =>
    `${row.model} + ${row.harness}`;
  if (new Set(rows.map(key)).size !== rows.length)
    throw new Error('Duplicate FrontierSWE model/harness');
  const matrix = objects.find(
    (object) => Array.isArray(object.models) && Array.isArray(object.cells),
  );
  const matrixKeys = Array.isArray(matrix?.models)
    ? matrix.models
        .map((value) => {
          const item = record(value);
          return `${String(item?.model)} + ${String(item?.harness)}`;
        })
        .sort()
    : [];
  if (JSON.stringify(rows.map(key).sort()) !== JSON.stringify(matrixKeys)) {
    throw new Error(
      'FrontierSWE leaderboard and coverage model lists disagree',
    );
  }
  // The server-rendered Best view shows a subset; the embedded mean list includes All.
  const visible = [
    ...html.matchAll(/title="([^"<>]+): mean@5 ([\d.]+)%, worst@5 [^"<>]+"/gu),
  ];
  if (!visible.length)
    throw new Error('FrontierSWE visible leaderboard rows missing');
  for (const match of visible) {
    const row = rows.find((item) => match[1]!.endsWith(key(item)));
    if (!row || Number(row.overall.toFixed(1)) !== Number(match[2])) {
      throw new Error(`FrontierSWE visible mean@5 mismatch: ${match[1]}`);
    }
  }
  const candidates = rows
    .map((row, index) =>
      CandidateResultSchema.parse({
        schemaVersion: 'candidate-result-v1',
        id: `frontier-swe:frontier-swe-v2:${slugify(row.model)}-${slugify(row.harness)}`,
        sourceId: 'frontier-swe',
        sourceRole: 'ORGANIZER',
        benchmarkId: 'frontier-swe-v2',
        benchmarkVersion: '2',
        model: {
          rawName: row.model,
          canonicalModelId: resolveCatalogModel(row.model).canonicalModelId,
          profileId: null,
        },
        profile: {
          effort: null,
          thinking: null,
          tools: null,
          harness: row.harness,
          contextWindowTokens: null,
          quantization: null,
          attempts: 5,
        },
        metric: {
          id: 'mean-at-5',
          name: 'Mean@5',
          unit: 'percent',
          higherIsBetter: true,
        },
        rawScore: row.overall,
        normalizedScore: row.overall,
        acquisitionStatus: 'FULL',
        inclusion: 'INCLUDED',
        exclusionReason: null,
        sourceUrl: FRONTIER_SWE_PAGE_URL,
        observedAt: context.observedAt,
        sourcePublishedAt: null,
        evidenceIds: [context.evidenceId],
        provenance: {
          rawScore: {
            evidenceId: context.evidenceId,
            locator: `RSC.entries.abs.mean[${index}].overall`,
            method: 'EMBEDDED_JSON',
          },
          profile: {
            evidenceId: context.evidenceId,
            locator: `RSC.entries.abs.mean[${index}]`,
            method: 'EMBEDDED_JSON',
          },
        },
      }),
    )
    .sort((a, b) => a.id.localeCompare(b.id));
  if (
    new Set(candidates.map((candidate) => candidate.id)).size !==
    candidates.length
  ) {
    throw new Error('Duplicate FrontierSWE candidate IDs');
  }
  const unresolved = candidates
    .filter((candidate) => !candidate.model.canonicalModelId)
    .map((candidate) => candidate.model.rawName);
  return {
    candidates,
    visibleRows: visible.length,
    validationReport: [
      '# FrontierSWE V2 acquisition validation',
      '',
      `- Source: <${FRONTIER_SWE_PAGE_URL}>`,
      `- Evidence: \`${context.evidenceId}\``,
      `- Complete mean@5 configurations: ${candidates.length}; coverage matrix identities matched.`,
      `- Server-rendered leaderboard rows cross-checked at displayed precision: ${visible.length}.`,
      `- Methodology: ${board.note}`,
      `- Unresolved catalog names: ${unresolved.join(', ') || 'none'}.`,
      '',
      'The embedded entries.abs.mean array supplies all configurations, including models hidden by the default Best filter. Scores are already percentages (0–100). Raw effort remains null because the source does not publish it. Harness and five trials are retained as provenance. The benchmark mapping limits these results to manual profile comparisons.',
      '',
    ].join('\n'),
  };
}
