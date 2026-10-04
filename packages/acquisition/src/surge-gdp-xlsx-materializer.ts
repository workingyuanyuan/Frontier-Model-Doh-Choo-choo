import {
  CandidateResultSchema,
  type CandidateResult,
} from '@llm-bench/benchmark-data';
import { resolveCatalogModel, slugify } from './materializer-utils.js';

export const GDP_XLSX_PAGE_URL = 'https://surgehq.ai/benchmarks/gdp-xlsx';

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
    throw new Error(`Unrecognized GDP.xlsx configuration: ${label}`);
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
export function materializeGdpXlsx(
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
    text(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/u)?.[1] ?? '') !== 'GDP.xlsx'
  ) {
    throw new Error('GDP.xlsx page marker missing');
  }
  const sections = [
    ...html.matchAll(
      /<section\b[^>]*class="[^"]*\blead-main\b[^"]*"[^>]*>([\s\S]*?)<\/section>/gu,
    ),
  ];
  if (sections.length !== 1)
    throw new Error('Expected one GDP.xlsx main leaderboard');
  const section = sections[0]![1]!;
  if ((section.match(/data-leaderboard-table=""/gu) ?? []).length !== 1) {
    throw new Error('Expected one GDP.xlsx leaderboard table');
  }
  if (/w-pagination-next|fs-list-element="pagination"/u.test(section)) {
    throw new Error('GDP.xlsx pagination requires review');
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
      `GDP.xlsx row count mismatch: extracted ${rows.length}, rendered ${context.visualRowCount}`,
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
      // GDP.xlsx publishes an empty data-score attribute on the numeric cell.
      // Its percent unit is an adjacent sibling without that attribute.
      const scores = scoreNodes.filter((node) => text(node[2]!) !== '%');
      const units = scoreNodes.filter((node) => text(node[2]!) === '%');
      const percentMarkers = [
        ...row.matchAll(
          /<div\b[^>]*data-score="[^"]*"[^>]*>[\s\S]*?<\/div>\s*<div\b[^>]*>\s*%\s*<\/div>/gu,
        ),
      ];
      if (
        !brand ||
        !name ||
        scores.length !== 1 ||
        units.length > 1 ||
        units.some((node) => node[1] !== '') ||
        (scores[0]![1] === '' && percentMarkers.length !== 1)
      )
        throw new Error(`Invalid GDP.xlsx row ${index + 1}`);
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
          `Invalid or conflicting GDP.xlsx score in row ${index + 1}`,
        );
      }
      // Some CMS rows repeat their brand as part of the full model name.
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
        id: `surge-gdp-xlsx:gdp-xlsx:${slugify(rawName)}`,
        sourceId: 'surge-gdp-xlsx',
        sourceRole: 'ORGANIZER',
        benchmarkId: 'gdp-xlsx',
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
        sourceUrl: GDP_XLSX_PAGE_URL,
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
    throw new Error('Duplicate GDP.xlsx model/configuration');
  const unresolved = candidates
    .filter((c) => c.model.canonicalModelId === null)
    .map((c) => c.model.rawName);
  return {
    candidates,
    visibleRows: rows.length,
    validationReport: [
      '# Surge GDP.xlsx acquisition validation',
      '',
      `- Source: <${GDP_XLSX_PAGE_URL}>`,
      `- Evidence: \`${context.evidenceId}\``,
      `- Main leaderboard: ${rows.length} rows; rendered browser count: ${context.visualRowCount}.`,
      '- Every row contains one numeric score; empty score attributes require the published percent marker. Numeric attributes agree with displayed text; no pagination.',
      `- Unresolved catalog identities (${unresolved.length}): ${unresolved.join('; ') || 'none'}.`,
      '',
      'Scores are the main leaderboard mean reward percentages (0–100). Explicit reasoning tiers are retained; Adaptive/Max maps to max, Adaptive/High to high, Minimal reasoning to low, and No reasoning / Thinking off to non-reasoning. Thinking on and Auto reasoning do not declare an effort tier. Fast is a model variant and stays in the identity lookup. Unresolved model variants retain null canonical identity.',
      '',
      'The official GDP.xlsx repository defines each trial reward as the mean of binary rubric verdicts on 0–1, each task score as the mean reward over five attempts excluding errored trials, and the benchmark score as the unweighted mean of task scores. The main leaderboard displays that benchmark score as a percentage. The repository explicitly specifies five attempts per task, so attempts is 5. Tasks with no successful attempts are missing rather than zero.',
      '',
      'GDP.xlsx covers 70 professional spreadsheet tasks across 12 domains. The official repository documents a Harbor adapter and OpenHands SDK agent harness, with Gemini 3.8 Flash as an agentic judge grading final response text. These published general descriptions do not establish exact tools or harness metadata for each current row, so those profile fields remain null. Benchmark version, context windows and leaderboard publication dates are unpublished and remain null.',
      '',
      '- Methodology: <https://surgehq.ai/blog/gdp-xlsx> and <https://github.com/surge-ai/gdp-xlsx#grading>. The blog publication date is not the leaderboard publication date.',
      '',
    ].join('\n'),
  };
}
