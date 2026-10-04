import {
  CandidateResultSchema,
  type CandidateResult,
} from '@llm-bench/benchmark-data';
import { resolveCatalogModel, slugify } from './materializer-utils.js';

export const COMPLEX_CONSTRAINTS_PAGE_URL =
  'https://surgehq.ai/benchmarks/complex-constraints';

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
  validationReport: string;
} {
  if (
    text(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/u)?.[1] ?? '') !==
    'ComplexConstraints'
  ) {
    throw new Error('ComplexConstraints page marker missing');
  }
  const sections = [
    ...html.matchAll(
      /<section\b[^>]*class="[^"]*\blead-main\b[^"]*"[^>]*>([\s\S]*?)<\/section>/gu,
    ),
  ];
  if (sections.length !== 1)
    throw new Error('Expected one ComplexConstraints main leaderboard');
  const section = sections[0]![1]!;
  if ((section.match(/data-leaderboard-table=""/gu) ?? []).length !== 1) {
    throw new Error('Expected one ComplexConstraints leaderboard table');
  }
  if (/w-pagination-next|fs-list-element="pagination"/u.test(section)) {
    throw new Error('ComplexConstraints pagination requires review');
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
      `ComplexConstraints row count mismatch: extracted ${rows.length}, rendered ${context.visualRowCount}`,
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
        throw new Error(`Invalid ComplexConstraints row ${index + 1}`);
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
          `Invalid or conflicting ComplexConstraints score in row ${index + 1}`,
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
        id: `surge-complex-constraints:complex-constraints:${slugify(rawName)}`,
        sourceId: 'surge-complex-constraints',
        sourceRole: 'ORGANIZER',
        benchmarkId: 'complex-constraints',
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
    validationReport: [
      '# Surge ComplexConstraints acquisition validation',
      '',
      `- Source: <${COMPLEX_CONSTRAINTS_PAGE_URL}>`,
      `- Evidence: \`${context.evidenceId}\``,
      `- Main leaderboard: ${rows.length} rows; rendered browser count: ${context.visualRowCount}.`,
      '- Every row contains one numeric score; empty score attributes require the published percent marker. Numeric attributes agree with displayed text; no pagination.',
      `- Unresolved catalog identities (${unresolved.length}): ${unresolved.join('; ') || 'none'}.`,
      '',
      'Scores are the main leaderboard pass@1 percentages (0–100). Explicit reasoning tiers are retained; Adaptive/Max maps to max, Adaptive/High to high, Minimal reasoning to low, and No reasoning / Thinking off to non-reasoning. Thinking on does not declare an effort tier. Unresolved model variants retain null canonical identity.',
      '',
      'The official harness defines the leaderboard task pass rate as all_pass/mean (Pass@1): every rubric criterion must pass. Mean criteria satisfaction is a separate metric. Each response is a single completion; per-row repeated trial counts, benchmark version and publication dates are unpublished and remain null.',
      '',
    ].join('\n'),
  };
}
