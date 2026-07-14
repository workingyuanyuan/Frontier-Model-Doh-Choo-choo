import { describe, expect, it } from 'vitest';

import {
  formatVideoRank,
  formatVideoScore,
  formatVideoTimestamp,
} from './format';

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

describe('video metadata formatting', () => {
  it('shows missing ranks as N/A', () => {
    expect(formatVideoRank(null)).toBe('N/A');
    expect(formatVideoRank(3)).toBe('03');
  });

  it('formats the immutable UTC cutoff without local-time drift', () => {
    expect(formatVideoTimestamp('2026-07-13T03:37:10.792Z')).toBe(
      '2026-07-13 03:37 UTC',
    );
  });
});
