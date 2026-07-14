import {
  DIMENSION_IDS,
  type ActiveEdition,
  type DimensionId,
  type RankingEntry,
  type RankingSnapshot,
} from '@llm-bench/contracts';

import { previewSnapshot } from './preview';

export interface HomepageData {
  readonly edition: ActiveEdition | null;
  readonly snapshot: RankingSnapshot;
  readonly source: 'ACTIVE_EDITION' | 'PREVIEW_FALLBACK';
}

export function resolveHomepageData(
  activeEdition: ActiveEdition | null,
): HomepageData {
  return activeEdition === null
    ? {
        edition: null,
        snapshot: previewSnapshot,
        source: 'PREVIEW_FALLBACK',
      }
    : {
        edition: activeEdition,
        snapshot: activeEdition.snapshot,
        source: 'ACTIVE_EDITION',
      };
}

export function calculateFieldAverage(
  entries: readonly RankingEntry[],
): Record<DimensionId, number | null> {
  return Object.fromEntries(
    DIMENSION_IDS.map((dimension) => {
      const scores = entries.flatMap((entry) => {
        const score = entry.dimensions.find(
          (item) => item.dimension === dimension,
        )?.score;
        return score === null || score === undefined ? [] : [score];
      });
      if (scores.length === 0) return [dimension, null];
      const average =
        scores.reduce((sum, score) => sum + score, 0) / scores.length;
      return [dimension, Math.round(average * 10) / 10];
    }),
  ) as Record<DimensionId, number | null>;
}
