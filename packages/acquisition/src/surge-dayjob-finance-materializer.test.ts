import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { materializeDayjobFinance } from './surge-dayjob-finance-materializer.js';

const fixture = readFileSync(
  new URL('../test-fixtures/dayjob-finance-page.html', import.meta.url),
  'utf8',
);
const context = {
  evidenceId: `sha256:${'a'.repeat(64)}`,
  observedAt: '2026-10-03T00:00:00.000Z',
  visualRowCount: 32,
};
const row = (brand: string, name: string, score: string, visible = score) =>
  `<div data-leaderboard-row=""><div><div class="head-rank-table-brand">${brand}</div></div><div><div class="head-rank-table-name">${name}</div></div><div><div data-score="${score}">${visible}</div></div></div>`;
const page = (...rows: string[]) =>
  `<h1>DAYJOB: Finance</h1><section class="lead-main"><div data-leaderboard-table="">${rows.join('')}</div></section>`;

describe('Surge DAYJOB Finance acquisition', () => {
  it('captures the official 32-row main leaderboard with exact scores and provenance', () => {
    const result = materializeDayjobFinance(fixture, context);
    expect(result.visibleRows).toBe(32);
    expect(result.candidates).toHaveLength(32);
    expect(result.candidates).toEqual(
      [...result.candidates].toSorted((a, b) => a.id.localeCompare(b.id)),
    );
    expect(
      result.candidates.every((candidate) =>
        candidate.evidenceIds.includes(context.evidenceId),
      ),
    ).toBe(true);
    expect(
      result.candidates.find(
        ({ model }) => model.rawName === 'GPT 6 Astra (Max reasoning)',
      ),
    ).toMatchObject({
      sourceId: 'surge-dayjob-finance',
      benchmarkId: 'dayjob-finance',
      sourceRole: 'ORGANIZER',
      metric: {
        id: 'mean-reward',
        name: 'Mean reward',
        unit: 'percent',
        higherIsBetter: true,
      },
      rawScore: 21.5,
      normalizedScore: 21.5,
      profile: { effort: 'max', thinking: 'Max reasoning', attempts: 5 },
    });
    expect(
      result.candidates.find(
        ({ model }) => model.rawName === 'Claude Opus 5.5 (Adaptive/Max)',
      ),
    ).toMatchObject({ rawScore: 23.9, profile: { effort: 'max' } });
    expect(
      result.candidates.find(
        ({ model }) => model.rawName === 'Gemini 4 Argon (High reasoning)',
      ),
    ).toMatchObject({ rawScore: 20.3, profile: { effort: 'high' } });
    expect(
      result.candidates.filter(({ rawScore }) => rawScore === 0),
    ).toHaveLength(7);
    expect(
      result.candidates.find(
        ({ model }) => model.rawName === 'Kimi K2.7 Code (Max reasoning)',
      ),
    ).toMatchObject({
      model: { canonicalModelId: 'moonshot-kimi-k2-7-code' },
      rawScore: 0,
    });
  });

  it('uses the official domain mean reward convention and declared five attempts', () => {
    const result = materializeDayjobFinance(fixture, context);
    expect(
      result.candidates.every(
        ({ profile, benchmarkVersion, sourcePublishedAt }) =>
          profile.attempts === 5 &&
          profile.tools === null &&
          profile.harness === null &&
          benchmarkVersion === null &&
          sourcePublishedAt === null,
      ),
    ).toBe(true);
    expect(result.validationReport).toContain('unweighted mean of task scores');
    expect(result.validationReport).toContain('excluding errored trials');
    expect(result.validationReport).toContain('OpenHands SDK');
  });

  it('ignores scores and rows outside the main section', () => {
    const html = `${page(row('GPT', '6 Astra (Max reasoning)', '57.7'))}<section class="related">${row('GPT', '6 Astra (Max reasoning)', '1099')}</section><script>var DATA={"score":0.999};</script>`;
    expect(
      materializeDayjobFinance(html, { ...context, visualRowCount: 1 })
        .candidates,
    ).toHaveLength(1);
  });

  it.each([
    ['Adaptive/Max', 'max'],
    ['Adaptive/High', 'high'],
    ['xHigh reasoning', 'xhigh'],
    ['Minimal reasoning', 'low'],
    ['No reasoning', 'non-reasoning'],
    ['Thinking off', 'non-reasoning'],
    ['Thinking on', null],
    ['Auto reasoning', null],
  ])('preserves configuration %s with effort %s', (label, effort) => {
    const candidate = materializeDayjobFinance(
      page(row('Example', `Unknown v9 (experimental) (${label})`, '12.3')),
      { ...context, visualRowCount: 1 },
    ).candidates[0];
    expect(candidate).toMatchObject({
      model: {
        rawName: `Example Unknown v9 (experimental) (${label})`,
        canonicalModelId: null,
        profileId: null,
      },
      profile: { effort, thinking: label },
    });
  });

  it('retains unlabelled effort and resolves only exact model identities', () => {
    const result = materializeDayjobFinance(
      page(
        row('Nemotron', '3 Ultra', '17.8'),
        row('Qwen', '3.7 Max (Thinking on)', '33.5'),
        row('Inkling', 'Inkling (High reasoning)', '34.1'),
        row('DeepSeek', 'V4 Pro (preview) (High reasoning)', '28'),
      ),
      { ...context, visualRowCount: 4 },
    );
    expect(
      result.candidates.find(
        ({ model }) => model.rawName === 'Nemotron 3 Ultra',
      ),
    ).toMatchObject({ profile: { effort: null, thinking: null } });
    expect(
      result.candidates.find(
        ({ model }) => model.rawName === 'Qwen 3.7 Max (Thinking on)',
      ),
    ).toMatchObject({
      model: { canonicalModelId: 'alibaba-qwen3-7-max', profileId: null },
      profile: { effort: null },
    });
    expect(
      result.candidates.find(
        ({ model }) => model.rawName === 'Inkling (High reasoning)',
      ),
    ).toMatchObject({
      model: { canonicalModelId: 'thinking-machines-inkling' },
    });
    expect(
      result.candidates.find(({ model }) =>
        model.rawName.includes('(preview)'),
      ),
    ).toMatchObject({ model: { canonicalModelId: null } });
  });

  it.each([
    ['', ''],
    ['-1', '-1'],
    ['101', '101'],
    ['NaN', 'NaN'],
    ['3e1', '30'],
    ['12.3', '12.4'],
    ['12.3', ''],
  ])('rejects malformed or conflicting scores %s / %s', (score, visible) => {
    expect(() =>
      materializeDayjobFinance(
        page(row('Example', 'Unknown', score, visible)),
        {
          ...context,
          visualRowCount: 1,
        },
      ),
    ).toThrow(/Invalid.*DAYJOB Finance/u);
  });

  it('validates the published empty attributes and percent marker', () => {
    const published = row('GPT', '6 Astra (Max reasoning)', '', '57.7').replace(
      '</div></div></div>',
      '</div><div data-score="">%</div></div></div>',
    );
    expect(
      materializeDayjobFinance(page(published), {
        ...context,
        visualRowCount: 1,
      }).candidates[0],
    ).toMatchObject({ rawScore: 57.7 });
    expect(() =>
      materializeDayjobFinance(page(published.replace('>%<', '>points<')), {
        ...context,
        visualRowCount: 1,
      }),
    ).toThrow('Invalid DAYJOB Finance row');
    expect(() =>
      materializeDayjobFinance(
        page(row('GPT', '6 Astra (Max reasoning)', '57.70', '57.7')),
        { ...context, visualRowCount: 1 },
      ),
    ).toThrow('conflicting DAYJOB Finance score');
  });

  it('preserves zero and full-score boundaries without changing variants', () => {
    const result = materializeDayjobFinance(
      page(
        row('Example', 'Unknown (Fast)', '0'),
        row('Example', 'Other (Max reasoning)', '100'),
      ),
      { ...context, visualRowCount: 2 },
    );
    expect(
      result.candidates.find(({ rawScore }) => rawScore === 0),
    ).toMatchObject({
      model: { rawName: 'Example Unknown (Fast)', canonicalModelId: null },
      profile: { thinking: null, effort: null },
    });
    expect(
      result.candidates.find(({ rawScore }) => rawScore === 100),
    ).toMatchObject({ normalizedScore: 100 });
  });

  it('fails on missing identity, duplicate configurations, or unrecognized labels', () => {
    expect(() =>
      materializeDayjobFinance(page(row('', 'Unknown', '10')), {
        ...context,
        visualRowCount: 1,
      }),
    ).toThrow('Invalid DAYJOB Finance row');
    expect(() =>
      materializeDayjobFinance(
        page(
          row('GPT', '6 Astra (Max reasoning)', '10'),
          row('GPT', '6 Astra (Max reasoning)', '11'),
        ),
        { ...context, visualRowCount: 2 },
      ),
    ).toThrow('Duplicate DAYJOB Finance');
    expect(() =>
      materializeDayjobFinance(
        page(row('GPT', '6 Astra (Super reasoning)', '10')),
        {
          ...context,
          visualRowCount: 1,
        },
      ),
    ).toThrow('Unrecognized DAYJOB Finance configuration');
  });

  it('fails on incomplete or ambiguous leaderboard extraction', () => {
    const html = page(row('GPT', '6 Astra (Max reasoning)', '57.7'));
    expect(() => materializeDayjobFinance(html, context)).toThrow(
      'row count mismatch',
    );
    expect(() =>
      materializeDayjobFinance(html.replace('DAYJOB: Finance', 'Other'), {
        ...context,
        visualRowCount: 1,
      }),
    ).toThrow('page marker missing');
    expect(() =>
      materializeDayjobFinance(html + html, {
        ...context,
        visualRowCount: 1,
      }),
    ).toThrow('one DAYJOB Finance main leaderboard');
    expect(() =>
      materializeDayjobFinance(
        html.replace('</section>', '<div w-pagination-next></div></section>'),
        { ...context, visualRowCount: 1 },
      ),
    ).toThrow('pagination requires review');
    expect(() =>
      materializeDayjobFinance(html.replace('data-leaderboard-table=""', ''), {
        ...context,
        visualRowCount: 1,
      }),
    ).toThrow('one DAYJOB Finance leaderboard table');
    expect(() =>
      materializeDayjobFinance(
        html.replace(
          '</section>',
          '<div data-score="57.7">57.7</div></section>',
        ),
        { ...context, visualRowCount: 1 },
      ),
    ).toThrow('Invalid DAYJOB Finance row');
  });
});
