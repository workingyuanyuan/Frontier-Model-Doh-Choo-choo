import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { materializeDayjobTax } from './surge-dayjob-tax-materializer.js';

const fixture = readFileSync(
  new URL('../test-fixtures/dayjob-tax-page.html', import.meta.url),
  'utf8',
);
const context = {
  evidenceId: `sha256:${'a'.repeat(64)}`,
  observedAt: '2026-10-28T00:00:00.000Z',
  visualRowCount: 16,
};
const row = (brand: string, name: string, score: string, visible = score) =>
  `<div data-leaderboard-row=""><div><div class="head-rank-table-brand">${brand}</div></div><div><div class="head-rank-table-name">${name}</div></div><div><div data-score="${score}">${visible}</div></div></div>`;
const page = (...rows: string[]) =>
  `<h1>DAYJOB: Tax</h1><section class="lead-main"><div data-leaderboard-table="">${rows.join('')}</div></section>`;

describe('Surge DAYJOB Tax acquisition', () => {
  it('captures the official 16-row main leaderboard with exact scores and provenance', () => {
    const result = materializeDayjobTax(fixture, context);
    expect(result.visibleRows).toBe(16);
    expect(result.candidates).toHaveLength(16);
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
      sourceId: 'surge-dayjob-tax',
      benchmarkId: 'dayjob-tax',
      sourceRole: 'ORGANIZER',
      metric: {
        id: 'pass-at-1',
        name: 'Pass@1',
        unit: 'percent',
        higherIsBetter: true,
      },
      rawScore: 4.8,
      normalizedScore: 4.8,
      profile: { effort: 'max', thinking: 'Max reasoning', attempts: 5 },
    });
    expect(
      result.candidates.find(
        ({ model }) => model.rawName === 'Claude Opus 5.5 (Adaptive/Max)',
      ),
    ).toMatchObject({ rawScore: 9.2, profile: { effort: 'max' } });
    expect(
      result.candidates.find(
        ({ model }) => model.rawName === 'Claude Sonnet 5.5 (Adaptive/Max)',
      ),
    ).toMatchObject({
      model: {
        canonicalModelId: 'anthropic-claude-sonnet-5-5',
        profileId: 'anthropic-claude-sonnet-5-5-max',
      },
      rawScore: 10.8,
    });
    expect(
      result.candidates.find(
        ({ model }) => model.rawName === 'Grok 4.7 (xHigh reasoning)',
      ),
    ).toMatchObject({ rawScore: 5, profile: { effort: 'xhigh' } });
    expect(
      result.candidates.find(
        ({ model }) => model.rawName === 'Gemini 3.8 Flash (High reasoning)',
      ),
    ).toMatchObject({ rawScore: 0.8, profile: { effort: 'high' } });
    expect(
      result.candidates.filter(({ rawScore }) => rawScore === 0),
    ).toHaveLength(3);
    expect(
      result.candidates.find(
        ({ model }) => model.rawName === 'Kimi K3 (Max reasoning)',
      ),
    ).toMatchObject({
      model: { canonicalModelId: 'moonshot-kimi-k3' },
      rawScore: 0,
    });
    expect(
      result.candidates
        .filter(({ model }) => model.canonicalModelId === null)
        .map(({ model }) => model.rawName),
    ).toEqual([
      'DeepSeek V4.1 Flash 1017 (Max reasoning)',
      'GLM 5.3 (Max reasoning)',
      'Hy Hy4 Preview (High reasoning)',
      'Mistral Large 4 (High reasoning)',
    ]);
  });

  it('uses the official pass@1 at 95% rubric threshold convention and five attempts', () => {
    const result = materializeDayjobTax(fixture, context);
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
    expect(result.validationReport).toContain('95% rubric threshold');
    expect(result.validationReport).toContain('50 environments');
    expect(result.validationReport).toContain('not the Tax tasks');
    expect(result.validationReport).toContain('OpenHands SDK');
  });

  it('ignores scores and rows outside the main section', () => {
    const html = `${page(row('GPT', '6 Astra (Max reasoning)', '57.7'))}<section class="related">${row('GPT', '6 Astra (Max reasoning)', '1099')}</section><script>var DATA={"score":0.999};</script>`;
    expect(
      materializeDayjobTax(html, { ...context, visualRowCount: 1 }).candidates,
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
    const candidate = materializeDayjobTax(
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
    const result = materializeDayjobTax(
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
      materializeDayjobTax(page(row('Example', 'Unknown', score, visible)), {
        ...context,
        visualRowCount: 1,
      }),
    ).toThrow(/Invalid.*DAYJOB Tax/u);
  });

  it('validates the published empty attributes and percent marker', () => {
    const published = row('GPT', '6 Astra (Max reasoning)', '', '57.7').replace(
      '</div></div></div>',
      '</div><div data-score="">%</div></div></div>',
    );
    expect(
      materializeDayjobTax(page(published), {
        ...context,
        visualRowCount: 1,
      }).candidates[0],
    ).toMatchObject({ rawScore: 57.7 });
    expect(() =>
      materializeDayjobTax(page(published.replace('>%<', '>points<')), {
        ...context,
        visualRowCount: 1,
      }),
    ).toThrow('Invalid DAYJOB Tax row');
    expect(() =>
      materializeDayjobTax(
        page(row('GPT', '6 Astra (Max reasoning)', '57.70', '57.7')),
        { ...context, visualRowCount: 1 },
      ),
    ).toThrow('conflicting DAYJOB Tax score');
  });

  it('preserves zero and full-score boundaries without changing variants', () => {
    const result = materializeDayjobTax(
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
      materializeDayjobTax(page(row('', 'Unknown', '10')), {
        ...context,
        visualRowCount: 1,
      }),
    ).toThrow('Invalid DAYJOB Tax row');
    expect(() =>
      materializeDayjobTax(
        page(
          row('GPT', '6 Astra (Max reasoning)', '10'),
          row('GPT', '6 Astra (Max reasoning)', '11'),
        ),
        { ...context, visualRowCount: 2 },
      ),
    ).toThrow('Duplicate DAYJOB Tax');
    expect(() =>
      materializeDayjobTax(
        page(row('GPT', '6 Astra (Super reasoning)', '10')),
        {
          ...context,
          visualRowCount: 1,
        },
      ),
    ).toThrow('Unrecognized DAYJOB Tax configuration');
  });

  it('fails on incomplete or ambiguous leaderboard extraction', () => {
    const html = page(row('GPT', '6 Astra (Max reasoning)', '57.7'));
    expect(() => materializeDayjobTax(html, context)).toThrow(
      'row count mismatch',
    );
    expect(() =>
      materializeDayjobTax(html.replace('DAYJOB: Tax', 'Other'), {
        ...context,
        visualRowCount: 1,
      }),
    ).toThrow('page marker missing');
    expect(() =>
      materializeDayjobTax(html + html, {
        ...context,
        visualRowCount: 1,
      }),
    ).toThrow('one DAYJOB Tax main leaderboard');
    expect(() =>
      materializeDayjobTax(
        html.replace('</section>', '<div w-pagination-next></div></section>'),
        { ...context, visualRowCount: 1 },
      ),
    ).toThrow('pagination requires review');
    expect(() =>
      materializeDayjobTax(html.replace('data-leaderboard-table=""', ''), {
        ...context,
        visualRowCount: 1,
      }),
    ).toThrow('one DAYJOB Tax leaderboard table');
    expect(() =>
      materializeDayjobTax(
        html.replace(
          '</section>',
          '<div data-score="57.7">57.7</div></section>',
        ),
        { ...context, visualRowCount: 1 },
      ),
    ).toThrow('Invalid DAYJOB Tax row');
  });
});
