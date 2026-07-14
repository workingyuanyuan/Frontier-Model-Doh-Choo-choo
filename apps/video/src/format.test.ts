import { describe, expect, it } from 'vitest';

import { formatVideoScore } from './format';

describe('video score formatting', () => {
  it.each([
    [null, 'N/A'],
    [0, '0.0'],
    [27.461538500000003, '27.5'],
    [57.10000000000001, '57.1'],
  ])('formats %s as %s', (value, expected) => {
    expect(formatVideoScore(value)).toBe(expected);
  });
});
