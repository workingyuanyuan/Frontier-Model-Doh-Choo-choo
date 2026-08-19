import type {
  DimensionId,
  ProductEvidence,
  ProductVersion,
} from '@llm-bench/benchmark-data';

import { UI_DIMENSION_IDS } from './ui-contract';
import { type LeaderboardRow } from './view-model';

export type SortDirection = 'ascending' | 'descending';
export type LeaderboardSortKey = 'rank' | 'model' | 'overall' | DimensionId;
export type EvidenceSortKey =
  'benchmark' | 'profile' | 'score' | 'source' | 'acquisition' | 'decision';

const compareText = (left: string, right: string): number =>
  left.localeCompare(right, undefined, { sensitivity: 'base' });

const compareNullable = <T>(
  left: T | null | undefined,
  right: T | null | undefined,
  compare: (a: T, b: T) => number,
  sign: number,
): number => {
  if (left == null && right == null) return 0;
  if (left == null) return 1;
  if (right == null) return -1;
  return compare(left, right) * sign;
};

export const sortLeaderboardRows = (
  product: ProductVersion,
  rows: LeaderboardRow[],
  sort: { key: LeaderboardSortKey; direction: SortDirection },
): LeaderboardRow[] => {
  const profileNames = new Map(
    product.profiles.map((profile) => [profile.id, profile.baseModelName]),
  );
  const indexed = rows.map((row, index) => ({ row, index }));
  const sign = sort.direction === 'ascending' ? 1 : -1;
  indexed.sort((left, right) => {
    const a = left.row;
    const b = right.row;
    let result: number;
    if (sort.key === 'model') {
      result =
        compareText(
          profileNames.get(a.profileId) ?? a.modelId,
          profileNames.get(b.profileId) ?? b.modelId,
        ) * sign;
      if (result === 0) result = compareText(a.profileId, b.profileId) * sign;
    } else if (sort.key === 'rank') {
      result = compareNullable(a.rank, b.rank, (x, y) => x - y, sign);
    } else if (sort.key === 'overall') {
      result = compareNullable(
        a.overallScore,
        b.overallScore,
        (x, y) => x - y,
        sign,
      );
    } else {
      const dimension = a.dimensions.find(
        ({ dimension }) => dimension === sort.key,
      );
      const otherDimension = b.dimensions.find(
        ({ dimension }) => dimension === sort.key,
      );
      result = compareNullable(
        dimension?.score,
        otherDimension?.score,
        (x, y) => x - y,
        sign,
      );
    }
    return result === 0 ? left.index - right.index : result;
  });
  return indexed.map(({ row }) => row);
};

export const sortEvidenceRows = (
  rows: ProductEvidence[],
  sort: { key: EvidenceSortKey; direction: SortDirection },
): ProductEvidence[] => {
  const sign = sort.direction === 'ascending' ? 1 : -1;
  return rows
    .map((row, index) => ({ row, index }))
    .toSorted((left, right) => {
      const a = left.row;
      const b = right.row;
      let result = 0;
      switch (sort.key) {
        case 'benchmark':
          result = compareText(a.benchmarkId, b.benchmarkId) * sign;
          break;
        case 'profile':
          result =
            compareText(a.profile.harness ?? '', b.profile.harness ?? '') *
            sign;
          break;
        case 'score':
          result = compareNullable(
            a.rawScore,
            b.rawScore,
            (x, y) => x - y,
            sign,
          );
          break;
        case 'source':
          result = compareText(a.sourceId, b.sourceId) * sign;
          break;
        case 'acquisition':
          result = compareText(a.acquisitionStatus, b.acquisitionStatus) * sign;
          break;
        case 'decision':
          result = compareText(a.inclusion, b.inclusion) * sign;
          break;
      }
      return result === 0 ? left.index - right.index : result;
    })
    .map(({ row }) => row);
};

export interface EvidenceGroups {
  groups: Array<{ dimension: DimensionId; rows: ProductEvidence[] }>;
  unmapped: ProductEvidence[];
}

export const groupEvidenceByDimension = (
  rows: ProductEvidence[],
  benchmarkDimensions:
    ReadonlyMap<string, DimensionId> | Readonly<Record<string, DimensionId>>,
): EvidenceGroups => {
  const lookup =
    benchmarkDimensions instanceof Map
      ? benchmarkDimensions
      : new Map(Object.entries(benchmarkDimensions));
  const grouped = new Map<DimensionId, ProductEvidence[]>(
    UI_DIMENSION_IDS.map((dimension) => [dimension, []]),
  );
  const unmapped: ProductEvidence[] = [];
  rows.forEach((row) => {
    const dimension = lookup.get(row.benchmarkId);
    if (!dimension || !grouped.has(dimension)) unmapped.push(row);
    else grouped.get(dimension)?.push(row);
  });
  return {
    groups: UI_DIMENSION_IDS.map((dimension) => ({
      dimension,
      rows: grouped.get(dimension) ?? [],
    })),
    unmapped,
  };
};
