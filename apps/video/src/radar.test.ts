import { describe, expect, it } from 'vitest';

import { previewSnapshot } from '@llm-bench/presentation';

import { createFieldAverage } from './radar';

describe('video field average', () => {
  it('keeps an axis null when every selected model is missing it', () => {
    const entries = previewSnapshot.entries.map((entry) => ({
      ...entry,
      dimensions: entry.dimensions.map((dimension) => ({
        ...dimension,
        score: dimension.dimension === 'agentic' ? null : dimension.score,
      })),
    }));

    expect(createFieldAverage(entries).agentic).toBeNull();
  });

  it('averages only observed values without treating null as zero', () => {
    const entries = previewSnapshot.entries.slice(0, 2).map((entry, index) => ({
      ...entry,
      dimensions: entry.dimensions.map((dimension) => ({
        ...dimension,
        score:
          dimension.dimension === 'reasoning' && index === 0
            ? null
            : dimension.score,
      })),
    }));
    const observed = entries[1]!.dimensions[0]!.score;

    expect(createFieldAverage(entries).reasoning).toBe(observed);
  });
});
