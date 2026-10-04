import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { materializeGdpXlsx } from './surge-gdp-xlsx-materializer.js';

const fixture = readFileSync(
  new URL('../test-fixtures/gdp-xlsx-page.html', import.meta.url),
  'utf8',
);
const context = {
  evidenceId: `sha256:${'a'.repeat(64)}`,
  observedAt: '2026-10-03T00:00:00.000Z',
  visualRowCount: 20,
};
const row = (brand: string, name: string, score: string, visible = score) =>
  `<div data-leaderboard-row=""><div><div class="head-rank-table-brand">${brand}</div></div><div><div class="head-rank-table-name">${name}</div></div><div><div data-score="${score}">${visible}</div></div></div>`;
const page = (...rows: string[]) =>
  `<h1>GDP.xlsx</h1><section class="lead-main"><div data-leaderboard-table="">${rows.join('')}</div></section>`;

describe('Surge GDP.xlsx acquisition', () => {
  it('captures the official 20-row main leaderboard with exact scores and provenance', () => {
    const result = materializeGdpXlsx(fixture, context);
    expect(result.visibleRows).toBe(20);
    expect(result.candidates).toHaveLength(20);
    expect(
      Object.fromEntries(
        result.candidates.map(({ model, rawScore }) => [
          model.rawName,
          rawScore,
        ]),
      ),
    ).toEqual({
      'Gemini 4 Argon (High reasoning)': 38.3,
      'Claude Opus 5.5 (Adaptive/Max)': 30.3,
      'Claude Sonnet 5.5 (Adaptive/Max)': 29.1,
      'Claude Fable 5.1 (Adaptive/Max)': 23.1,
      'GPT 6 Astra (Max reasoning)': 22.9,
      'Muse Spark 1.3 (Max reasoning)': 22.6,
      'Grok 4.7 (xHigh reasoning)': 22.3,
      'GPT 6.1 Sol (Max reasoning)': 22,
      'GLM 5.3 (Max reasoning)': 21.4,
      'Qwen 3.8 Max (xHigh reasoning)': 20.3,
      'Gemini 3.8 Flash (High reasoning)': 18.3,
      'Hy Hy4 Preview (High reasoning)': 18.3,
      'GPT 6 Sol (Max reasoning)': 17.1,
      'Claude Sonnet 5 (Adaptive/Max)': 16.9,
      'GPT 6 Luna (Max reasoning)': 14.9,
      'Kimi K3 (Max reasoning)': 13.4,
      'Gemini 3.1 Pro (High reasoning)': 10.3,
      'DeepSeek V4 Pro (Max reasoning)': 6.9,
      'Nemotron 3 Ultra': 4.9,
      'Mistral Large 3': 0,
    });
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
      sourceId: 'surge-gdp-xlsx',
      benchmarkId: 'gdp-xlsx',
      sourceRole: 'ORGANIZER',
      metric: {
        id: 'mean-reward',
        name: 'Mean reward',
        unit: 'percent',
        higherIsBetter: true,
      },
      rawScore: 22.9,
      normalizedScore: 22.9,
      profile: { effort: 'max', thinking: 'Max reasoning', attempts: 5 },
    });
    expect(
      result.candidates.find(
        ({ model }) => model.rawName === 'Claude Opus 5.5 (Adaptive/Max)',
      ),
    ).toMatchObject({ rawScore: 30.3, profile: { effort: 'max' } });
    expect(
      result.candidates.find(
        ({ model }) => model.rawName === 'Gemini 3.8 Flash (High reasoning)',
      ),
    ).toMatchObject({ rawScore: 18.3, profile: { effort: 'high' } });
    expect(
      result.candidates.filter(({ rawScore }) => rawScore === 0),
    ).toHaveLength(1);
    expect(
      result.candidates.find(
        ({ model }) => model.rawName === 'Kimi K3 (Max reasoning)',
      ),
    ).toMatchObject({
      model: { canonicalModelId: 'moonshot-kimi-k3' },
      rawScore: 13.4,
    });
  });

  it('uses the official benchmark mean reward convention and declared five attempts', () => {
    const result = materializeGdpXlsx(fixture, context);
    expect(
      result.candidates.every(
        ({ profile, benchmarkVersion, sourcePublishedAt }) =>
          profile.attempts === 5 &&
          profile.tools === null &&
          profile.harness === null &&
          profile.contextWindowTokens === null &&
          profile.quantization === null &&
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
      materializeGdpXlsx(html, { ...context, visualRowCount: 1 }).candidates,
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
    const candidate = materializeGdpXlsx(
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
    const result = materializeGdpXlsx(
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
      materializeGdpXlsx(page(row('Example', 'Unknown', score, visible)), {
        ...context,
        visualRowCount: 1,
      }),
    ).toThrow(/Invalid.*GDP.xlsx/u);
  });

  it('validates the published empty attributes and percent marker', () => {
    const published = row('GPT', '6 Astra (Max reasoning)', '', '57.7').replace(
      '</div></div></div>',
      '</div><div fs-list-field="foundational-score">%</div></div></div>',
    );
    expect(
      materializeGdpXlsx(page(published), {
        ...context,
        visualRowCount: 1,
      }).candidates[0],
    ).toMatchObject({ rawScore: 57.7 });
    expect(() =>
      materializeGdpXlsx(page(published.replace('>%<', '>points<')), {
        ...context,
        visualRowCount: 1,
      }),
    ).toThrow('Invalid GDP.xlsx row');
    expect(() =>
      materializeGdpXlsx(
        page(row('GPT', '6 Astra (Max reasoning)', '57.70', '57.7')),
        { ...context, visualRowCount: 1 },
      ),
    ).toThrow('conflicting GDP.xlsx score');
  });

  it('preserves zero and full-score boundaries without changing variants', () => {
    const result = materializeGdpXlsx(
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
      materializeGdpXlsx(page(row('', 'Unknown', '10')), {
        ...context,
        visualRowCount: 1,
      }),
    ).toThrow('Invalid GDP.xlsx row');
    expect(() =>
      materializeGdpXlsx(
        page(
          row('GPT', '6 Astra (Max reasoning)', '10'),
          row('GPT', '6 Astra (Max reasoning)', '11'),
        ),
        { ...context, visualRowCount: 2 },
      ),
    ).toThrow('Duplicate GDP.xlsx');
    expect(() =>
      materializeGdpXlsx(page(row('GPT', '6 Astra (Super reasoning)', '10')), {
        ...context,
        visualRowCount: 1,
      }),
    ).toThrow('Unrecognized GDP.xlsx configuration');
  });

  it('fails on incomplete or ambiguous leaderboard extraction', () => {
    const html = page(row('GPT', '6 Astra (Max reasoning)', '57.7'));
    expect(() => materializeGdpXlsx(html, context)).toThrow(
      'row count mismatch',
    );
    expect(() =>
      materializeGdpXlsx(html.replace('GDP.xlsx', 'Other'), {
        ...context,
        visualRowCount: 1,
      }),
    ).toThrow('page marker missing');
    expect(() =>
      materializeGdpXlsx(html + html, {
        ...context,
        visualRowCount: 1,
      }),
    ).toThrow('one GDP.xlsx main leaderboard');
    expect(() =>
      materializeGdpXlsx(
        html.replace('</section>', '<div w-pagination-next></div></section>'),
        { ...context, visualRowCount: 1 },
      ),
    ).toThrow('pagination requires review');
    expect(() =>
      materializeGdpXlsx(html.replace('data-leaderboard-table=""', ''), {
        ...context,
        visualRowCount: 1,
      }),
    ).toThrow('one GDP.xlsx leaderboard table');
    expect(() =>
      materializeGdpXlsx(
        html.replace(
          '</section>',
          '<div data-score="57.7">57.7</div></section>',
        ),
        { ...context, visualRowCount: 1 },
      ),
    ).toThrow('Invalid GDP.xlsx row');
  });
});
