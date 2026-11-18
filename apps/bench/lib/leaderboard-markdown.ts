export const markdownLine = (cells: string[]): string =>
  `| ${cells.join(' | ')} |`;

import { getActiveDimensionIds } from './ui-contract';
import {
  getProfileIdentity,
  profileById,
  type LeaderboardRow,
  type PresetProductVersion,
} from './view-model';

export const escapeCell = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/\\/g, '\\\\')
    .replace(/\|/g, '\\|')
    .replace(/\r\n|\r|\n/g, '<br>');

export const COPIED_COST_INDEX_HEADING =
  'Weighted cost index (0–100, lower is cheaper)';

const score = (value: number | null | undefined): string =>
  value == null ? 'N/A' : value.toFixed(1);

/**
 * `costIndexByProfile` holds the weighted cost index of the profiles that are
 * points on the cost chart. A row at another reasoning effort has no index of
 * its own, so its cell is N/A rather than the index of a different profile.
 */
export function leaderboardMarkdown(
  product: PresetProductVersion,
  rows: LeaderboardRow[],
  costIndexByProfile: ReadonlyMap<string, number> = new Map(),
): string {
  const dimensionIds = getActiveDimensionIds(rows);
  const headers = [
    'Model',
    'Reasoning Effort',
    'Overall',
    ...dimensionIds.map(
      (dimension) => dimension[0]!.toUpperCase() + dimension.slice(1),
    ),
    COPIED_COST_INDEX_HEADING,
  ];
  return [
    markdownLine(headers),
    markdownLine(headers.map(() => '---')),
    ...rows.map((row) => {
      const profile = profileById(product, row.profileId);
      return markdownLine([
        escapeCell(profile?.baseModelName ?? row.modelId),
        escapeCell(profile ? getProfileIdentity(profile) : row.profileId),
        score(row.overallScore),
        ...dimensionIds.map((dimension) =>
          score(
            row.dimensions.find((entry) => entry.dimension === dimension)
              ?.score,
          ),
        ),
        score(costIndexByProfile.get(row.profileId)),
      ]);
    }),
  ].join('\n');
}

export function commonBenchmarksMarkdown(
  profileNames: string[],
  rows: { label: string; scores: number[]; difference: number | null }[],
): string {
  const withDifference = profileNames.length === 2;
  const headers = [
    'Benchmark',
    ...profileNames,
    ...(withDifference ? ['Difference (first − second)'] : []),
  ];
  return [
    markdownLine(headers.map(escapeCell)),
    markdownLine(headers.map(() => '---')),
    ...rows.map((row) =>
      markdownLine([
        escapeCell(row.label),
        ...row.scores.map(score),
        ...(withDifference && row.difference !== null
          ? [`${row.difference > 0 ? '+' : ''}${row.difference.toFixed(1)}`]
          : []),
      ]),
    ),
  ].join('\n');
}
