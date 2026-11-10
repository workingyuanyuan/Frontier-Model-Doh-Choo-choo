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
import { surgeBenchmarkVersion } from './surge-version.js';

export const RIEMANN_PAGE_URL = 'https://surgehq.ai/benchmarks/riemann-bench';

/** Parse only the main leaderboard's HTML. Related benchmark cards and the
 * independently maintained cost/token charts are outside this snapshot. */
export function materializeRiemann(
  html: string,
  context: {
    evidenceId: string;
    observedAt: string;
    visualRowCount: number;
  },
): {
  candidates: CandidateResult[];
  visibleRows: number;
  benchmarkVersion: string | null;
  validationReport: string;
} {
  if (
    text(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/u)?.[1] ?? '').replace(
      /\s*v\d+(?:\.\d+)+$/u,
      '',
    ) !== 'Riemann-bench'
  ) {
    throw new Error('Riemann-bench page marker missing');
  }
  const benchmarkVersion = surgeBenchmarkVersion(html);
  const rows = surgeLeaderboardRows(
    html,
    context.visualRowCount,
    'Riemann-bench',
  );
  const candidates = rows
    .map((row, index) => {
      const { brand, name, score } = surgePercentRow(
        row,
        index,
        'Riemann-bench',
      );
      // Inkling's CMS row repeats its brand as the entire model name.
      const rawName =
        name === brand || name.startsWith(`${brand} `)
          ? name
          : `${brand} ${name}`;
      const config = surgeConfiguration(rawName, 'Riemann-bench');
      const canonicalModelId = resolveSurgeModel(config.modelName);
      const locator = `.lead-main [data-leaderboard-row] (zero-based index ${index})`;
      return CandidateResultSchema.parse({
        schemaVersion: 'candidate-result-v1',
        id: `surge-riemann:riemann-bench:${slugify(rawName)}`,
        sourceId: 'surge-riemann',
        sourceRole: 'ORGANIZER',
        benchmarkId: 'riemann-bench',
        benchmarkVersion,
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
          id: 'pass-rate',
          name: 'Pass rate',
          unit: 'percent',
          higherIsBetter: true,
        },
        rawScore: score,
        normalizedScore: score,
        acquisitionStatus: 'FULL',
        inclusion: 'INCLUDED',
        exclusionReason: null,
        sourceUrl: RIEMANN_PAGE_URL,
        observedAt: context.observedAt,
        sourcePublishedAt: null,
        evidenceIds: [context.evidenceId],
        provenance: {
          ...(benchmarkVersion === null
            ? {}
            : {
                benchmarkVersion: {
                  evidenceId: context.evidenceId,
                  locator:
                    '.lead-hero-title h1 .v2-chip (official inline version markup)',
                  method: 'DOM',
                },
              }),
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
    throw new Error('Duplicate Riemann-bench model/configuration');
  const unresolved = candidates
    .filter((c) => c.model.canonicalModelId === null)
    .map((c) => c.model.rawName);
  return {
    candidates,
    visibleRows: rows.length,
    benchmarkVersion,
    validationReport: [
      '# Surge Riemann-bench acquisition validation',
      '',
      `- Source: <${RIEMANN_PAGE_URL}>`,
      `- Benchmark version: ${benchmarkVersion ?? 'unpublished'}.`,
      `- Evidence: \`${context.evidenceId}\``,
      `- Main leaderboard: ${rows.length} rows; rendered browser count: ${context.visualRowCount}.`,
      '- Every row contains one numeric score; empty score attributes require the published percent marker. Numeric attributes agree with displayed text; no pagination.',
      `- Unresolved catalog identities (${unresolved.length}): ${unresolved.join('; ') || 'none'}.`,
      '',
      'Scores are the main leaderboard pass rate percentages (0–100). Explicit reasoning tiers are retained; Adaptive/Max maps to max, Adaptive/High to high, Minimal reasoning to low, and No reasoning / Thinking off to non-reasoning. Thinking on and Auto reasoning do not declare an effort tier. Fast is a model variant and stays in the identity lookup. Unresolved model variants retain null canonical identity.',
      '',
      'The official paper describes 25 private research mathematics problems with unique closed-form answers, programmatic verification, and historical pass@1 estimates from 100 independent runs per problem. The official blog records a pipeline update removing the initial one-hour timeout. The current leaderboard does not label its estimator or confirm current per-row run counts, tools, or harness, so the metric remains pass rate and those profile fields remain null. Context windows and leaderboard publication dates are unpublished and remain null.',
      '',
      '- Methodology: <https://surgehq.ai/blog/riemann-bench-a-benchmark-for-moonshot-mathematics> and <https://arxiv.org/html/2604.06802v3>. The paper version is not a leaderboard benchmark version.',
      '',
    ].join('\n'),
  };
}
