import {
  CandidateResultSchema,
  type CandidateResult,
} from '@llm-bench/benchmark-data';
import { resolveCatalogModel, slugify } from './materializer-utils.js';

export const RIEMANN_PAGE_URL = 'https://surgehq.ai/benchmarks/riemann-bench';

const text = (html: string): string =>
  html
    .replace(/<[^>]*>/gu, ' ')
    .replace(/&nbsp;|&#160;/gu, ' ')
    .replace(/&amp;/gu, '&')
    .replace(/&quot;/gu, '"')
    .replace(/&#39;|&apos;/gu, "'")
    .replace(/\s+/gu, ' ')
    .trim();

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
      'Auto reasoning',
      'Fast',
    ].includes(label)
  ) {
    throw new Error(`Unrecognized Riemann-bench configuration: ${label}`);
  }
  return {
    modelName:
      label === null || label === 'Fast'
        ? name
        : name.slice(0, name.lastIndexOf('(')).trim(),
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
    thinking: label === 'Fast' ? null : label,
  };
}

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
  validationReport: string;
} {
  if (
    text(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/u)?.[1] ?? '') !==
    'Riemann-bench'
  ) {
    throw new Error('Riemann-bench page marker missing');
  }
  const sections = [
    ...html.matchAll(
      /<section\b[^>]*class="[^"]*\blead-main\b[^"]*"[^>]*>([\s\S]*?)<\/section>/gu,
    ),
  ];
  if (sections.length !== 1)
    throw new Error('Expected one Riemann-bench main leaderboard');
  const section = sections[0]![1]!;
  if ((section.match(/data-leaderboard-table=""/gu) ?? []).length !== 1) {
    throw new Error('Expected one Riemann-bench leaderboard table');
  }
  if (/w-pagination-next|fs-list-element="pagination"/u.test(section)) {
    throw new Error('Riemann-bench pagination requires review');
  }
  const rows = section
    .split(/<div\b[^>]*data-leaderboard-row=""[^>]*>/u)
    .slice(1);
  if (
    !Number.isInteger(context.visualRowCount) ||
    context.visualRowCount < 1 ||
    rows.length !== context.visualRowCount
  ) {
    throw new Error(
      `Riemann-bench row count mismatch: extracted ${rows.length}, rendered ${context.visualRowCount}`,
    );
  }
  const candidates = rows
    .map((row, index) => {
      const brand = text(
        row.match(
          /class="head-rank-table-brand"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/u,
        )?.[1] ?? '',
      );
      const name = text(
        row.match(
          /class="head-rank-table-name"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/u,
        )?.[1] ?? '',
      );
      const scoreNodes = [
        ...row.matchAll(
          /<div\b[^>]*data-score="([^"]*)"[^>]*>([\s\S]*?)<\/div>/gu,
        ),
      ];
      // This leaderboard publishes an empty data-score attribute on both
      // the numeric cell and the adjacent percent marker.
      const scores = scoreNodes.filter((node) => text(node[2]!) !== '%');
      const units = scoreNodes.filter((node) => text(node[2]!) === '%');
      if (
        !brand ||
        !name ||
        scores.length !== 1 ||
        units.length > 1 ||
        units.some((node) => node[1] !== '') ||
        (scores[0]![1] === '' && units.length !== 1)
      )
        throw new Error(`Invalid Riemann-bench row ${index + 1}`);
      const attributeScore = scores[0]![1]!;
      const visibleScore = text(scores[0]![2]!);
      const scoreText = attributeScore || visibleScore;
      const score = Number(scoreText);
      if (
        !/^\d+(?:\.\d+)?$/u.test(scoreText) ||
        !/^\d+(?:\.\d+)?$/u.test(visibleScore) ||
        !Number.isFinite(score) ||
        score < 0 ||
        score > 100 ||
        (attributeScore !== '' && attributeScore !== visibleScore)
      ) {
        throw new Error(
          `Invalid or conflicting Riemann-bench score in row ${index + 1}`,
        );
      }
      // Inkling's CMS row repeats its brand as the entire model name.
      const rawName =
        name === brand || name.startsWith(`${brand} `)
          ? name
          : `${brand} ${name}`;
      const config = configuration(rawName);
      // The source inserts a space in Qwen's model family; keep all version,
      // size and variant tokens when resolving that typographic difference.
      const lookupName = config.modelName.replace(/^Qwen (?=\d)/u, 'Qwen');
      const model = resolveCatalogModel(config.modelName);
      const canonicalModelId =
        model.canonicalModelId ??
        resolveCatalogModel(lookupName).canonicalModelId;
      const locator = `.lead-main [data-leaderboard-row] (zero-based index ${index})`;
      return CandidateResultSchema.parse({
        schemaVersion: 'candidate-result-v1',
        id: `surge-riemann:riemann-bench:${slugify(rawName)}`,
        sourceId: 'surge-riemann',
        sourceRole: 'ORGANIZER',
        benchmarkId: 'riemann-bench',
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
    validationReport: [
      '# Surge Riemann-bench acquisition validation',
      '',
      `- Source: <${RIEMANN_PAGE_URL}>`,
      `- Evidence: \`${context.evidenceId}\``,
      `- Main leaderboard: ${rows.length} rows; rendered browser count: ${context.visualRowCount}.`,
      '- Every row contains one numeric score; empty score attributes require the published percent marker. Numeric attributes agree with displayed text; no pagination.',
      `- Unresolved catalog identities (${unresolved.length}): ${unresolved.join('; ') || 'none'}.`,
      '',
      'Scores are the main leaderboard pass rate percentages (0–100). Explicit reasoning tiers are retained; Adaptive/Max maps to max, Adaptive/High to high, Minimal reasoning to low, and No reasoning / Thinking off to non-reasoning. Thinking on and Auto reasoning do not declare an effort tier. Fast is a model variant and stays in the identity lookup. Unresolved model variants retain null canonical identity.',
      '',
      'The official paper describes 25 private research mathematics problems with unique closed-form answers, programmatic verification, and historical pass@1 estimates from 100 independent runs per problem. The official blog records a pipeline update removing the initial one-hour timeout. The current leaderboard does not label its estimator or confirm current per-row run counts, tools, or harness, so the metric remains pass rate and those profile fields remain null. Benchmark version, context windows, and leaderboard publication dates are unpublished and remain null.',
      '',
      '- Methodology: <https://surgehq.ai/blog/riemann-bench-a-benchmark-for-moonshot-mathematics> and <https://arxiv.org/html/2604.06802v3>. The paper version is not a leaderboard benchmark version.',
      '',
    ].join('\n'),
  };
}
