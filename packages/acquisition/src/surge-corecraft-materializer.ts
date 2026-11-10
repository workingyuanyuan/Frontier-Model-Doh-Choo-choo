import {
  surgeConfiguration,
  resolveSurgeModel,
  surgeLeaderboardRows,
  surgePercentRow,
  surgeText as text,
} from './surge-materializer-utils.js';
import {
  CandidateResultSchema,
  type CandidateResult,
} from '@llm-bench/benchmark-data';
import { slugify } from './materializer-utils.js';

export const CORECRAFT_PAGE_URL =
  'https://surgehq.ai/benchmarks/enterprisebench-corecraft';

/** Parse only the main leaderboard's HTML. Related benchmark cards and the
 * independently maintained cost/token charts are outside this snapshot. */
export function materializeCorecraft(
  html: string,
  context: {
    evidenceId: string;
    observedAt: string;
    visualRowCount: number;
  },
): {
  candidates: CandidateResult[];
  visibleRows: number;
  validationReport: string;
} {
  if (
    text(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/u)?.[1] ?? '') !==
    'EnterpriseBench: CoreCraft Agents'
  ) {
    throw new Error('CoreCraft page marker missing');
  }
  const rows = surgeLeaderboardRows(html, context.visualRowCount, 'CoreCraft');
  const candidates = rows
    .map((row, index) => {
      const { brand, name, score } = surgePercentRow(row, index, 'CoreCraft');
      // Inkling's CMS row repeats its brand as the entire model name.
      const rawName =
        name === brand || name.startsWith(`${brand} `)
          ? name
          : `${brand} ${name}`;
      const config = surgeConfiguration(rawName, 'CoreCraft');
      const canonicalModelId = resolveSurgeModel(config.modelName);
      const locator = `.lead-main [data-leaderboard-row] (zero-based index ${index})`;
      return CandidateResultSchema.parse({
        schemaVersion: 'candidate-result-v1',
        id: `surge-corecraft:enterprisebench-corecraft:${slugify(rawName)}`,
        sourceId: 'surge-corecraft',
        sourceRole: 'ORGANIZER',
        benchmarkId: 'enterprisebench-corecraft',
        benchmarkVersion: null,
        model: {
          rawName,
          canonicalModelId,
          profileId:
            canonicalModelId && config.effort
              ? `${canonicalModelId}-${config.effort}`
              : null,
        },
        profile: {
          effort: config.effort,
          thinking: config.thinking,
          tools: null,
          harness: null,
          contextWindowTokens: null,
          quantization: null,
          attempts: null,
        },
        metric: {
          id: 'task-pass-rate',
          name: 'Task pass rate',
          unit: 'percent',
          higherIsBetter: true,
        },
        rawScore: score,
        normalizedScore: score,
        acquisitionStatus: 'FULL',
        inclusion: 'INCLUDED',
        exclusionReason: null,
        sourceUrl: CORECRAFT_PAGE_URL,
        observedAt: context.observedAt,
        sourcePublishedAt: null,
        evidenceIds: [context.evidenceId],
        provenance: {
          rawScore: {
            evidenceId: context.evidenceId,
            locator: `${locator} [data-score] (row ${index + 1}: ${rawName})`,
            method: 'DOM',
          },
          profile: {
            evidenceId: context.evidenceId,
            locator: `${locator} .head-rank-table-name (row ${index + 1}: ${rawName})`,
            method: 'DOM',
          },
        },
      });
    })
    .sort((a, b) => a.id.localeCompare(b.id));
  if (new Set(candidates.map(({ id }) => id)).size !== candidates.length)
    throw new Error('Duplicate CoreCraft model/configuration');
  const unresolved = candidates
    .filter((c) => c.model.canonicalModelId === null)
    .map((c) => c.model.rawName);
  return {
    candidates,
    visibleRows: rows.length,
    validationReport: [
      '# Surge CoreCraft acquisition validation',
      '',
      `- Source: <${CORECRAFT_PAGE_URL}>`,
      `- Evidence: \`${context.evidenceId}\``,
      `- Main leaderboard: ${rows.length} rows; rendered browser count: ${context.visualRowCount}.`,
      '- Every row contains one numeric score; empty score attributes require the published percent marker. Numeric attributes agree with displayed text; no pagination.',
      `- Unresolved catalog identities (${unresolved.length}): ${unresolved.join('; ') || 'none'}.`,
      '',
      'Scores are the main leaderboard task pass rate percentages (0–100). Explicit reasoning tiers are retained; Adaptive/Max maps to max, Adaptive/High to high, Minimal reasoning to low, and No reasoning / Thinking off to non-reasoning. Thinking on and Auto reasoning do not declare an effort tier. Fast is a model variant and stays in the identity lookup. Unresolved model variants retain null canonical identity.',
      '',
      'The official paper defines task pass rate as satisfying every expert-authored rubric criterion. The official blog describes a lightweight Vercel AI SDK harness, one conversation turn with up to 1000 tool-loop steps, MCP tools and company policy. These general methodology descriptions do not establish current per-row harness or tools metadata; those fields remain null. Current benchmark version, per-row repeated trial counts, context windows and publication dates are unpublished and remain null.',
      '',
      '- Methodology: <https://surgehq.ai/blog/enterprisebench-corecraft> and <https://arxiv.org/html/2602.16179v5>. The paper version is not a leaderboard benchmark version.',
      '',
    ].join('\n'),
  };
}
