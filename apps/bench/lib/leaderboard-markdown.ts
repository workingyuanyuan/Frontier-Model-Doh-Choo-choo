export const markdownLine = (cells: string[]): string =>
  `| ${cells.join(' | ')} |`;

import { ECONOMY_NAME, getActiveDimensionIds } from './ui-contract';
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

const score = (value: number | null | undefined): string =>
  value == null ? 'N/A' : value.toFixed(1);

/**
 * `economyByProfile` holds the Economy score of each profile shown. A profile
 * with no comparable task cost reads N/A.
 */
export function leaderboardMarkdown(
  product: PresetProductVersion,
  rows: LeaderboardRow[],
  economyByProfile: ReadonlyMap<string, number> = new Map(),
): string {
  const dimensionIds = getActiveDimensionIds(rows);
  const headers = [
    'Model',
    'Reasoning Effort',
    'Overall',
    ...dimensionIds.map(
      (dimension) => dimension[0]!.toUpperCase() + dimension.slice(1),
    ),
    ECONOMY_NAME,
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
        score(economyByProfile.get(row.profileId)),
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

export interface CostChartMarkdownRow {
  model: string;
  effort: string;
  score: number;
  costIndex: number;
}

/** The points a cost chart plots, one row per model and effort. */
export function costChartMarkdown(
  scoreHeader: string,
  rows: readonly CostChartMarkdownRow[],
): string {
  const headers = ['Model', 'Effort', scoreHeader, 'Cost index'];
  return [
    markdownLine(headers.map(escapeCell)),
    markdownLine(headers.map(() => '---')),
    ...rows.map((row) =>
      markdownLine([
        escapeCell(row.model),
        escapeCell(row.effort),
        score(row.score),
        score(row.costIndex),
      ]),
    ),
  ].join('\n');
}
