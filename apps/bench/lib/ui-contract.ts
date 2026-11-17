import type { DimensionId } from '@llm-bench/benchmark-data';

export const UI_DIMENSION_IDS = [
  'agentic',
  'coding',
  'reasoning',
  'knowledge',
  'comprehension',
  'language',
] as const satisfies readonly DimensionId[];

export const UI_DIMENSION_ABBREVIATIONS: Record<DimensionId, string> = {
  comprehension: 'CMP',
  agentic: 'AGT',
  coding: 'COD',
  reasoning: 'RSN',
  knowledge: 'KNG',
  language: 'LNG',
};

export const UI_DIMENSION_NAMES: Record<DimensionId, string> = {
  comprehension: 'Comprehension',
  agentic: 'Agentic',
  coding: 'Coding',
  reasoning: 'Reasoning',
  knowledge: 'Knowledge',
  language: 'Language',
};

/** Keep every view in the same order, omitting dimensions without scored tests. */
export const getActiveDimensionIds = (
  rows: readonly {
    dimensions: readonly {
      dimension: DimensionId;
      score: number | null;
      componentCount?: number;
    }[];
  }[],
): DimensionId[] =>
  UI_DIMENSION_IDS.filter((dimensionId) =>
    rows.some((row) =>
      row.dimensions.some(
        ({ dimension, score }) =>
          dimension === dimensionId && score !== null && Number.isFinite(score),
      ),
    ),
  );
