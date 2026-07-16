import type { DimensionId } from '@llm-bench/benchmark-data';

export type ProductChannel = 'DRAFT' | 'PUBLISHED';

export const UI_DIMENSION_IDS = [
  'reasoning',
  'math',
  'knowledge',
  'language',
  'instruction',
  'coding',
  'agentic',
  'context',
] as const satisfies readonly DimensionId[];
