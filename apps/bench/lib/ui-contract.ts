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

/**
 * Economy sits beside the capability dimensions in the table and on the radar.
 * It is 100 minus the weighted cost index, so higher is cheaper like every
 * other column, but no benchmark feeds it and it never enters Overall.
 */
export const ECONOMY_AXIS_ID = 'economy';
export const ECONOMY_NAME = 'Economy';
export const ECONOMY_ABBREVIATION = 'ECO';
export const ECONOMY_HEADING = `${ECONOMY_NAME} (${ECONOMY_ABBREVIATION})`;
export const ECONOMY_NOTE =
  'Economy is 100 minus the weighted cost index, so higher is cheaper.';

export type AxisId = DimensionId | typeof ECONOMY_AXIS_ID;

export const UI_AXIS_ABBREVIATIONS: Record<AxisId, string> = {
  ...UI_DIMENSION_ABBREVIATIONS,
  [ECONOMY_AXIS_ID]: ECONOMY_ABBREVIATION,
};
