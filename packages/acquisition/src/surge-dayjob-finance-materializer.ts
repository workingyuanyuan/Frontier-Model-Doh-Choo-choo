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

export const DAYJOB_FINANCE_PAGE_URL =
  'https://surgehq.ai/benchmarks/dayjob-finance';

/** Parse only the main leaderboard's HTML. Related benchmark cards and the
 * independently maintained cost/token charts are outside this snapshot. */
export function materializeDayjobFinance(
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
    'DAYJOB: Finance'
  ) {
    throw new Error('DAYJOB Finance page marker missing');
  }
  const rows = surgeLeaderboardRows(
    html,
    context.visualRowCount,
    'DAYJOB Finance',
  );
  const candidates = rows
    .map((row, index) => {
      const { brand, name, score } = surgePercentRow(
        row,
        index,
        'DAYJOB Finance',
      );
      // Inkling's CMS row repeats its brand as the entire model name.
      const rawName =
        name === brand || name.startsWith(`${brand} `)
          ? name
          : `${brand} ${name}`;
      const config = surgeConfiguration(rawName, 'DAYJOB Finance');
      const canonicalModelId = resolveSurgeModel(config.modelName);
      const locator = `.lead-main [data-leaderboard-row] (zero-based index ${index})`;
      return CandidateResultSchema.parse({
        schemaVersion: 'candidate-result-v1',
        id: `surge-dayjob-finance:dayjob-finance:${slugify(rawName)}`,
        sourceId: 'surge-dayjob-finance',
        sourceRole: 'ORGANIZER',
        benchmarkId: 'dayjob-finance',
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
          attempts: 5,
        },
        metric: {
          id: 'mean-reward',
          name: 'Mean reward',
          unit: 'percent',
          higherIsBetter: true,
        },
        rawScore: score,
        normalizedScore: score,
        acquisitionStatus: 'FULL',
        inclusion: 'INCLUDED',
        exclusionReason: null,
        sourceUrl: DAYJOB_FINANCE_PAGE_URL,
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
    throw new Error('Duplicate DAYJOB Finance model/configuration');
  const unresolved = candidates
    .filter((c) => c.model.canonicalModelId === null)
    .map((c) => c.model.rawName);
  return {
    candidates,
    visibleRows: rows.length,
    validationReport: [
      '# Surge DAYJOB Finance acquisition validation',
      '',
      `- Source: <${DAYJOB_FINANCE_PAGE_URL}>`,
      `- Evidence: \`${context.evidenceId}\``,
      `- Main leaderboard: ${rows.length} rows; rendered browser count: ${context.visualRowCount}.`,
      '- Every row contains one numeric score; empty score attributes require the published percent marker. Numeric attributes agree with displayed text; no pagination.',
      `- Unresolved catalog identities (${unresolved.length}): ${unresolved.join('; ') || 'none'}.`,
      '',
      'Scores are the main leaderboard mean reward percentages (0–100). Explicit reasoning tiers are retained; Adaptive/Max maps to max, Adaptive/High to high, Minimal reasoning to low, and No reasoning / Thinking off to non-reasoning. Thinking on and Auto reasoning do not declare an effort tier. Fast is a model variant and stays in the identity lookup. Unresolved model variants retain null canonical identity.',
      '',
      'The official DAYJOB repository defines a trial reward on 0–1, each task score as the mean reward over five attempts excluding errored trials, and the domain score as the unweighted mean of task scores. The main leaderboard displays that domain score as a percentage. The repository explicitly identifies five attempts per task for leaderboard runs, so attempts is 5.',
      '',
      'The official blog describes long-horizon finance work spanning corporate finance, banking, credit, investing, and real assets, assessed with task-specific rubrics. The public repository documents a Harbor adapter and OpenHands SDK agent harness, with Claude Opus 4.8 grading. These published general descriptions do not establish exact tools or harness metadata for each current row, so those profile fields remain null. Benchmark version, context windows and leaderboard publication dates are unpublished and remain null.',
      '',
      '- Methodology: <https://surgehq.ai/blog/dayjob> and <https://github.com/surge-ai/dayjob#grading>. The blog publication date is not the leaderboard publication date.',
      '',
    ].join('\n'),
  };
}
