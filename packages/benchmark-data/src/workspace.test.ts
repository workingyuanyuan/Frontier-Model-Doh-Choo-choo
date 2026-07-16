import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { buildWorkspaceProduct } from './workspace.js';

describe('buildWorkspaceProduct', () => {
  it('assembles the verified eight-source snapshot into a frontier Draft', async () => {
    const root = resolve(import.meta.dirname, '../../..');
    const product = await buildWorkspaceProduct(
      root,
      '2026-07-16T14:00:00.000Z',
    );

    expect(product.frontier.length).toBeGreaterThanOrEqual(20);
    expect(product.leaderboard.length).toBeGreaterThan(0);
    expect(
      product.leaderboard.every(({ status }) => status === 'ESTIMATED'),
    ).toBe(true);
    expect(product.leaderboard[0]?.dimensions).toHaveLength(8);
    expect(
      product.evidence.some(({ inclusion }) => inclusion === 'INCLUDED'),
    ).toBe(true);
    expect(
      product.evidence.some(({ inclusion }) => inclusion === 'EXCLUDED'),
    ).toBe(true);
  });
});
