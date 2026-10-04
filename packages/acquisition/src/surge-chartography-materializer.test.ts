import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { materializeChartography } from './surge-chartography-materializer.js';

const fixture = readFileSync(
  new URL('./fixtures/chartography-page.html', import.meta.url),
  'utf8',
);

const context = {
  evidenceId: `sha256:${'a'.repeat(64)}`,
  observedAt: '2026-10-02T00:00:00.000Z',
  visualRowCount: 42,
};

const row = (
  brand: string,
  name: string,
  score: string,
  visibleScore = score,
): string =>
  `<div data-leaderboard-row=""><div><div class="head-rank-table-brand">${brand}</div></div><div><div class="head-rank-table-name">${name}</div></div><div><div data-score="${score}">${visibleScore}</div></div></div>`;

const page = (...rows: string[]): string =>
  `<h1>Chartography</h1><section class="lead-main"><div data-leaderboard-table="">${rows.join('')}</div></section>`;

describe('Surge Chartography acquisition', () => {
  it('materializes the 42-row main leaderboard and ignores unrelated leaderboard scores', () => {
    const result = materializeChartography(fixture, context);

    expect(result.visibleRows).toBe(42);
    expect(result.candidates).toHaveLength(42);
    expect(new Set(result.candidates.map(({ id }) => id)).size).toBe(42);
    expect(
      result.candidates.filter(({ model }) => model.canonicalModelId !== null),
    ).toHaveLength(32);
    expect(result.candidates.every(({ rawScore }) => rawScore <= 100)).toBe(
      true,
    );
    expect(result.candidates).toEqual(
      [...result.candidates].toSorted((left, right) =>
        left.id.localeCompare(right.id),
      ),
    );
    expect(
      result.candidates.every((candidate) =>
        candidate.evidenceIds.includes(context.evidenceId),
      ),
    ).toBe(true);

    const visionVariant = result.candidates.find(({ model }) =>
      model.rawName.includes('V4 Flash Vision (experimental)'),
    );
    expect(visionVariant).toMatchObject({
      sourceId: 'surge-chartography',
      sourceRole: 'ORGANIZER',
      benchmarkId: 'chartography',
      benchmarkVersion: null,
      metric: { id: 'pass-at-1', unit: 'percent', higherIsBetter: true },
      model: {
        canonicalModelId: null,
        rawName: expect.stringContaining('(experimental) (Max reasoning)'),
      },
      profile: { effort: 'max', thinking: 'Max reasoning', attempts: null },
    });
    expect(result.candidates.some(({ rawScore }) => rawScore === 1099)).toBe(
      false,
    );
    const ranking = [...result.candidates].toSorted(
      (left, right) => right.rawScore - left.rawScore,
    );
    expect(ranking[0]).toMatchObject({
      model: { rawName: 'Gemini 4 Argon (High reasoning)' },
      rawScore: 71.6,
      normalizedScore: 71.6,
    });
    expect(ranking[20]).toMatchObject({
      model: { rawName: 'Gemini 3.1 Pro (High reasoning)' },
      rawScore: 26.1,
      normalizedScore: 26.1,
    });
  });

  it('keeps unknown model versions and experimental qualifiers in the raw identity', () => {
    const result = materializeChartography(
      page(
        row('Example Labs', 'Orion v9 (experimental) (High reasoning)', '37.5'),
      ),
      { ...context, visualRowCount: 1 },
    );

    expect(result.candidates[0]).toMatchObject({
      model: {
        rawName: 'Example Labs Orion v9 (experimental) (High reasoning)',
        canonicalModelId: null,
      },
      profile: { effort: 'high', thinking: 'High reasoning' },
      rawScore: 37.5,
      normalizedScore: 37.5,
    });
  });

  it('uses the main leaderboard when the separate cost chart has an older score', () => {
    const result = materializeChartography(
      `${fixture}<script>var DATA = {"cost":{"all":[{"label":"Grok 4.5 (high)","y":0.167}]}};</script>`,
      context,
    );
    expect(
      result.candidates.find(
        ({ model }) => model.rawName === 'Grok 4.5 (High reasoning)',
      ),
    ).toMatchObject({ rawScore: 17, normalizedScore: 17 });
  });

  it('keeps Thinking on un-tiered and normalizes Minimal reasoning to low', () => {
    const result = materializeChartography(
      page(
        row('GPT', '6.1 Sol (Thinking on)', '41.2'),
        row('Gemini', '3.5 Flash-Lite (Minimal reasoning)', '30.1'),
      ),
      { ...context, visualRowCount: 2 },
    );
    const thinkingOn = result.candidates.find(
      ({ profile }) => profile.thinking === 'Thinking on',
    );
    const minimal = result.candidates.find(
      ({ profile }) => profile.thinking === 'Minimal reasoning',
    );

    expect(thinkingOn).toMatchObject({
      model: { canonicalModelId: 'openai-gpt-6-1-sol' },
      profile: { effort: null, thinking: 'Thinking on' },
    });
    expect(minimal).toMatchObject({
      model: { canonicalModelId: 'google-gemini-3-5-flash-lite' },
      profile: { effort: 'low', thinking: 'Minimal reasoning' },
    });
  });

  it('maps Adaptive/Max to max while retaining the published label', () => {
    const result = materializeChartography(
      page(row('Claude', 'Opus 5.5 (Adaptive/Max)', '47.8')),
      { ...context, visualRowCount: 1 },
    );

    expect(result.candidates[0]).toMatchObject({
      model: { canonicalModelId: 'anthropic-claude-opus-5-5' },
      profile: { effort: 'max', thinking: 'Adaptive/Max' },
    });
  });

  it.each([
    ['missing score', row('GPT', '6.1 Sol', '')],
    ['negative score', row('GPT', '6.1 Sol', '-1')],
    ['out-of-range score', row('GPT', '6.1 Sol', '101')],
    [
      'attribute and visible text disagreement',
      row('GPT', '6.1 Sol', '41.2', '41.3'),
    ],
  ])('rejects %s', (_description, invalidRow) => {
    expect(() =>
      materializeChartography(page(invalidRow), {
        ...context,
        visualRowCount: 1,
      }),
    ).toThrow('Invalid or conflicting Chartography score');
  });

  it('rejects an unexpected visible row count, pagination, and duplicate rows', () => {
    expect(() =>
      materializeChartography(page(row('GPT', '6.1 Sol', '41.2')), {
        ...context,
        visualRowCount: 2,
      }),
    ).toThrow('row count mismatch');
    expect(() =>
      materializeChartography(
        page(row('GPT', '6.1 Sol', '41.2')).replace(
          '</div></section>',
          '<div w-pagination-next></div></div></section>',
        ),
        { ...context, visualRowCount: 1 },
      ),
    ).toThrow('pagination requires review');
    expect(() =>
      materializeChartography(
        page(row('GPT', '6.1 Sol', '41.2'), row('GPT', '6.1 Sol', '39.8')),
        { ...context, visualRowCount: 2 },
      ),
    ).toThrow('Duplicate Chartography');
  });

  it('rejects a missing page marker or ambiguous main table', () => {
    expect(() =>
      materializeChartography(
        fixture.replace(
          '<h1 class="heading h1">Chartography</h1>',
          '<h1>Other</h1>',
        ),
        context,
      ),
    ).toThrow('page marker missing');
    expect(() =>
      materializeChartography(
        `${page(row('GPT', '6.1 Sol', '41.2'))}<section class="lead-main"><div data-leaderboard-table=""></div></section>`,
        { ...context, visualRowCount: 1 },
      ),
    ).toThrow('one Chartography main leaderboard');
  });
});
