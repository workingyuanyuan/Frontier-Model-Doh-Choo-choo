import {
  CandidateResultSchema,
  type CandidateResult,
} from '@llm-bench/benchmark-data';
import { resolveCatalogModel, slugify } from './materializer-utils.js';

export const CORECRAFT_PAGE_URL =
  'https://surgehq.ai/benchmarks/enterprisebench-corecraft';

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
    throw new Error(`Unrecognized CoreCraft configuration: ${label}`);
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
  const sections = [
    ...html.matchAll(
      /<section\b[^>]*class="[^"]*\blead-main\b[^"]*"[^>]*>([\s\S]*?)<\/section>/gu,
    ),
  ];
  if (sections.length !== 1)
    throw new Error('Expected one CoreCraft main leaderboard');
  const section = sections[0]![1]!;
  if ((section.match(/data-leaderboard-table=""/gu) ?? []).length !== 1) {
    throw new Error('Expected one CoreCraft leaderboard table');
  }
  if (/w-pagination-next|fs-list-element="pagination"/u.test(section)) {
    throw new Error('CoreCraft pagination requires review');
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
      `CoreCraft row count mismatch: extracted ${rows.length}, rendered ${context.visualRowCount}`,
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
        throw new Error(`Invalid CoreCraft row ${index + 1}`);
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
          `Invalid or conflicting CoreCraft score in row ${index + 1}`,
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
