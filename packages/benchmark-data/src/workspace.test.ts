import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { buildWorkspaceProduct } from './workspace.js';

describe('buildWorkspaceProduct', () => {
  it('assembles the verified workspace sources into a frontier Draft', async () => {
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

    const profilesByModel = new Map<string, typeof product.profiles>();
    product.profiles.forEach((profile) => {
      const profiles = profilesByModel.get(profile.modelId) ?? [];
      profiles.push(profile);
      profilesByModel.set(profile.modelId, profiles);
    });
    profilesByModel.forEach((profiles) => {
      expect(
        profiles.every(({ attributes }) => attributes.harness === null),
      ).toBe(true);
      expect(
        profiles.every(({ attributes }) => attributes.effort !== null),
      ).toBe(true);
    });
    expect(
      product.profiles
        .filter(({ modelId }) => modelId === 'openai-gpt-5-6-sol')
        .map(({ displayName }) => displayName)
        .toSorted(),
    ).toEqual([
      'GPT-5.6 Sol · high',
      'GPT-5.6 Sol · low',
      'GPT-5.6 Sol · max',
      'GPT-5.6 Sol · medium',
      'GPT-5.6 Sol · xhigh',
    ]);
    expect(
      product.evidence
        .filter(
          ({ model }) =>
            model.canonicalModelId === 'openai-gpt-5-6-sol' &&
            model.profileId === 'openai-gpt-5-6-sol-max',
        )
        .map(({ profile }) => profile.harness),
    ).toEqual(expect.arrayContaining(['Epoch AI Inspect', 'mini-swe-agent']));
    expect(
      product.profiles.some(({ attributes }) =>
        /epoch|mini-swe/iu.test(attributes.harness ?? ''),
      ),
    ).toBe(false);
    expect(
      product.profiles.some(({ displayName }) =>
        /tools|attempt|context|thinking/iu.test(displayName),
      ),
    ).toBe(false);
    expect(product.profiles.some(({ id }) => /unspecified/iu.test(id))).toBe(
      false,
    );
    expect(product.costs.length).toBeGreaterThanOrEqual(80);
    expect(
      product.costs.filter(
        ({ sourceId, costType }) =>
          sourceId === 'livebench' && costType === 'MEASURED_TASK',
      ),
    ).toHaveLength(22);
    expect(
      product.costs.filter(({ sourceId }) => sourceId === 'artificial-analysis')
        .length,
    ).toBeGreaterThanOrEqual(8);
    expect(
      product.costs.filter(
        ({ sourceId, costType }) =>
          sourceId === 'deepswe' && costType === 'AGENT_TASK',
      ).length,
    ).toBeGreaterThanOrEqual(21);
    expect(
      product.costs.every(({ sourceUrl }) => sourceUrl.startsWith('https://')),
    ).toBe(true);
  });
});
