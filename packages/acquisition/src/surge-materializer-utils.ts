import { resolveCatalogModel } from './materializer-utils.js';

export const surgeText = (html: string): string =>
  html
    .replace(/<[^>]*>/gu, ' ')
    .replace(/&nbsp;|&#160;/gu, ' ')
    .replace(/&amp;/gu, '&')
    .replace(/&quot;/gu, '"')
    .replace(/&#39;|&apos;/gu, "'")
    .replace(/\s+/gu, ' ')
    .trim();

export const surgeLeaderboardRows = (
  html: string,
  visualRowCount: number,
  label: string,
): string[] => {
  const sections = [
    ...html.matchAll(
      /<section\b[^>]*class="[^"]*\blead-main\b[^"]*"[^>]*>([\s\S]*?)<\/section>/gu,
    ),
  ];
  if (sections.length !== 1)
    throw new Error(`Expected one ${label} main leaderboard`);
  const section = sections[0]![1]!;
  if ((section.match(/data-leaderboard-table=""/gu) ?? []).length !== 1) {
    throw new Error(`Expected one ${label} leaderboard table`);
  }
  if (/w-pagination-next|fs-list-element="pagination"/u.test(section)) {
    throw new Error(`${label} pagination requires review`);
  }
  const rows = section
    .split(/<div\b[^>]*data-leaderboard-row=""[^>]*>/u)
    .slice(1);
  if (
    !Number.isInteger(visualRowCount) ||
    visualRowCount < 1 ||
    rows.length !== visualRowCount
  ) {
    throw new Error(
      `${label} row count mismatch: extracted ${rows.length}, rendered ${visualRowCount}`,
    );
  }
  return rows;
};

export function surgeConfiguration(name: string, sourceLabel: string) {
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
    throw new Error(`Unrecognized ${sourceLabel} configuration: ${label}`);
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

export const surgePercentRow = (
  row: string,
  index: number,
  label: string,
): { brand: string; name: string; score: number } => {
  const { brand, name } = surgeRowIdentity(row);
  const scoreNodes = [
    ...row.matchAll(/<div\b[^>]*data-score="([^"]*)"[^>]*>([\s\S]*?)<\/div>/gu),
  ];
  // This leaderboard publishes an empty data-score attribute on both
  // the numeric cell and the adjacent percent marker.
  const scores = scoreNodes.filter((node) => surgeText(node[2]!) !== '%');
  const units = scoreNodes.filter((node) => surgeText(node[2]!) === '%');
  if (
    !brand ||
    !name ||
    scores.length !== 1 ||
    units.length > 1 ||
    units.some((node) => node[1] !== '') ||
    (scores[0]![1] === '' && units.length !== 1)
  )
    throw new Error(`Invalid ${label} row ${index + 1}`);
  const attributeScore = scores[0]![1]!;
  const visibleScore = surgeText(scores[0]![2]!);
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
      `Invalid or conflicting ${label} score in row ${index + 1}`,
    );
  }
  return { brand, name, score };
};

export const resolveSurgeModel = (modelName: string): string | null => {
  // The source inserts a space in Qwen's model family; keep all version,
  // size and variant tokens when resolving that typographic difference.
  const lookupName = modelName.replace(/^Qwen (?=\d)/u, 'Qwen');
  const model = resolveCatalogModel(modelName);
  return (
    model.canonicalModelId ?? resolveCatalogModel(lookupName).canonicalModelId
  );
};

export function surgeRowIdentity(row: string): { brand: string; name: string } {
  const brand = surgeText(
    row.match(
      /class="head-rank-table-brand"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/u,
    )?.[1] ?? '',
  );
  const name = surgeText(
    row.match(
      /class="head-rank-table-name"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/u,
    )?.[1] ?? '',
  );
  return { brand, name };
}
