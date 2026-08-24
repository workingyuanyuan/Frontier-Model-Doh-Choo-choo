import type { DimensionId } from '@llm-bench/benchmark-data';

export const UI_DIMENSION_IDS = [
  'agentic',
  'coding',
  'reasoning',
  'knowledge',
  'language',
] as const satisfies readonly DimensionId[];

export const UI_DIMENSION_ABBREVIATIONS: Record<DimensionId, string> = {
  agentic: 'AGT',
  coding: 'COD',
  reasoning: 'RSN',
  knowledge: 'KNG',
  language: 'LNG',
};
