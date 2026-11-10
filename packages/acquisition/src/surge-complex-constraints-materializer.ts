import {
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

export const COMPLEX_CONSTRAINTS_PAGE_URL =
  'https://surgehq.ai/benchmarks/complex-constraints';

function configuration(name: string) {
  const label = name.match(/\(([^()]*)\)$/u)?.[1] ?? null;
  const tier = label
    ?.match(/^(minimal|low|medium|high|xhigh|max) reasoning$/iu)?.[1]
    ?.toLowerCase();
  if (
    label !== null &&
    !tier &&
    ![
      'Adaptive/Max',
      'Adaptive/High',
      'Thinking on',
      'Thinking off',
      'No reasoning',
    ].includes(label)
  ) {
    throw new Error(`Unrecognized ComplexConstraints configuration: ${label}`);
  }
  return {
    modelName:
      label === null ? name : name.slice(0, name.lastIndexOf('(')).trim(),
    effort:
      tier === 'minimal'
        ? 'low'
        : (tier ??
          (label === 'Adaptive/Max'
            ? 'max'
            : label === 'Adaptive/High'
              ? 'high'
              : label === 'Thinking off' || label === 'No reasoning'
                ? 'non-reasoning'
                : null)),
    thinking: label,
  };
}

/** Parse only the main leaderboard's HTML. Related benchmark cards and the
 * independently maintained cost/token charts are outside this snapshot. */
export function materializeComplexConstraints(
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
    ) !== 'ComplexConstraints'
  ) {
    throw new Error('ComplexConstraints page marker missing');
  }
  const benchmarkVersion = surgeBenchmarkVersion(html);
  const rows = surgeLeaderboardRows(
    html,
    context.visualRowCount,
    'ComplexConstraints',
  );
  const candidates = rows
    .map((row, index) => {
      const { brand, name, score } = surgePercentRow(
        row,
        index,
        'ComplexConstraints',
      );
      // Inkling's CMS row repeats its brand as the entire model name.
      const rawName =
        name === brand || name.startsWith(`${brand} `)
          ? name
          : `${brand} ${name}`;
      const config = configuration(rawName);
      const canonicalModelId = resolveSurgeModel(config.modelName);
      const locator = `.lead-main [data-leaderboard-row] (zero-based index ${index})`;
      return CandidateResultSchema.parse({
        schemaVersion: 'candidate-result-v1',
        id: `surge-complex-constraints:complex-constraints:${slugify(rawName)}`,
        sourceId: 'surge-complex-constraints',
        sourceRole: 'ORGANIZER',
        benchmarkId: 'complex-constraints',
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
        sourceUrl: COMPLEX_CONSTRAINTS_PAGE_URL,
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
    throw new Error('Duplicate ComplexConstraints model/configuration');
  const unresolved = candidates
    .filter((c) => c.model.canonicalModelId === null)
    .map((c) => c.model.rawName);
  return {
    candidates,
    visibleRows: rows.length,
    benchmarkVersion,
    validationReport: [
      '# Surge ComplexConstraints acquisition validation',
      '',
      `- Source: <${COMPLEX_CONSTRAINTS_PAGE_URL}>`,
      `- Benchmark version: ${benchmarkVersion ?? 'unpublished'}.`,
      `- Evidence: \`${context.evidenceId}\``,
      `- Main leaderboard: ${rows.length} rows; rendered browser count: ${context.visualRowCount}.`,
      '- Every row contains one numeric score; empty score attributes require the published percent marker. Numeric attributes agree with displayed text; no pagination.',
      `- Unresolved catalog identities (${unresolved.length}): ${unresolved.join('; ') || 'none'}.`,
      '',
      'Scores are the main leaderboard pass@1 percentages (0–100). Explicit reasoning tiers are retained; Adaptive/Max maps to max, Adaptive/High to high, Minimal reasoning to low, and No reasoning / Thinking off to non-reasoning. Thinking on does not declare an effort tier. Unresolved model variants retain null canonical identity.',
      '',
      'The official harness defines the leaderboard task pass rate as all_pass/mean (Pass@1): every rubric criterion must pass. Mean criteria satisfaction is a separate metric. Each response is a single completion; per-row repeated trial counts and publication dates are unpublished and remain null.',
      '',
    ].join('\n'),
  };
}
