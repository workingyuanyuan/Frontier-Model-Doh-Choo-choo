import type { DimensionId } from '@llm-bench/benchmark-data';

export type ProductChannel = 'DRAFT' | 'PUBLISHED';

export const UI_DIMENSION_IDS = [
  'agentic',
  'coding',
  'reasoning',
  'math',
  'knowledge',
  'language',
  'context',
  'instruction',
] as const satisfies readonly DimensionId[];

export const UI_DIMENSION_ABBREVIATIONS: Record<DimensionId, string> = {
  agentic: 'AGT',
  coding: 'COD',
  reasoning: 'RSN',
  math: 'MAT',
  knowledge: 'KNG',
  language: 'LNG',
  context: 'CTX',
  instruction: 'IF',
};
