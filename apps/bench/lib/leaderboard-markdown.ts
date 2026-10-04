import { getActiveDimensionIds } from './ui-contract';
import {
  getProfileIdentity,
  profileById,
  type LeaderboardRow,
  type PresetProductVersion,
} from './view-model';

const escapeCell = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/\\/g, '\\\\')
    .replace(/\|/g, '\\|')
    .replace(/\r\n|\r|\n/g, '<br>');

const score = (value: number | null | undefined): string =>
  value == null ? 'N/A' : value.toFixed(1);

export function leaderboardMarkdown(
  product: PresetProductVersion,
  rows: LeaderboardRow[],
): string {
  const dimensionIds = getActiveDimensionIds(rows);
  const headers = [
    'Model',
    'Reasoning Effort',
    'Overall',
    ...dimensionIds.map(
      (dimension) => dimension[0]!.toUpperCase() + dimension.slice(1),
    ),
  ];
  const line = (cells: string[]) => `| ${cells.join(' | ')} |`;
  return [
    line(headers),
    line(headers.map(() => '---')),
    ...rows.map((row) => {
      const profile = profileById(product, row.profileId);
      return line([
        escapeCell(profile?.baseModelName ?? row.modelId),
        escapeCell(profile ? getProfileIdentity(profile) : row.profileId),
        score(row.overallScore),
        ...dimensionIds.map((dimension) =>
          score(
            row.dimensions.find((entry) => entry.dimension === dimension)
              ?.score,
          ),
        ),
      ]);
    }),
  ].join('\n');
}
