import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { materializeDayjobHealthcare } from './surge-dayjob-healthcare-materializer.js';

const fixture = readFileSync(
  new URL('../test-fixtures/dayjob-healthcare-page.html', import.meta.url),
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
  `<h1>DAYJOB: Healthcare</h1><section class="lead-main"><div data-leaderboard-table="">${rows.join('')}</div></section>`;

describe('Surge DAYJOB Healthcare acquisition', () => {
  it('captures the official 32-row main leaderboard with exact scores and provenance', () => {
    const result = materializeDayjobHealthcare(fixture, context);
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
      sourceId: 'surge-dayjob-healthcare',
      benchmarkId: 'dayjob-healthcare',
      sourceRole: 'ORGANIZER',
      metric: {
        id: 'mean-reward',
        name: 'Mean reward',
        unit: 'percent',
        higherIsBetter: true,
      },
      rawScore: 11.6,
      normalizedScore: 11.6,
      profile: { effort: 'max', thinking: 'Max reasoning', attempts: 5 },
    });
    expect(
      result.candidates.find(
        ({ model }) => model.rawName === 'Claude Opus 5.5 (Adaptive/Max)',
      ),
    ).toMatchObject({ rawScore: 24.7, profile: { effort: 'max' } });
    expect(
      result.candidates.find(
        ({ model }) => model.rawName === 'Gemini 3.8 Flash (High reasoning)',
      ),
    ).toMatchObject({ rawScore: 0.8, profile: { effort: 'high' } });
    expect(
      result.candidates.filter(({ rawScore }) => rawScore === 0),
    ).toHaveLength(10);
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
    const result = materializeDayjobHealthcare(fixture, context);
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
      materializeDayjobHealthcare(html, { ...context, visualRowCount: 1 })
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
    const candidate = materializeDayjobHealthcare(
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
    const result = materializeDayjobHealthcare(
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
      materializeDayjobHealthcare(
        page(row('Example', 'Unknown', score, visible)),
        {
          ...context,
          visualRowCount: 1,
        },
      ),
    ).toThrow(/Invalid.*DAYJOB Healthcare/u);
  });

  it('validates the published empty attributes and percent marker', () => {
    const published = row('GPT', '6 Astra (Max reasoning)', '', '57.7').replace(
      '</div></div></div>',
      '</div><div data-score="">%</div></div></div>',
    );
    expect(
      materializeDayjobHealthcare(page(published), {
        ...context,
        visualRowCount: 1,
      }).candidates[0],
    ).toMatchObject({ rawScore: 57.7 });
    expect(() =>
      materializeDayjobHealthcare(page(published.replace('>%<', '>points<')), {
        ...context,
        visualRowCount: 1,
      }),
    ).toThrow('Invalid DAYJOB Healthcare row');
    expect(() =>
      materializeDayjobHealthcare(
        page(row('GPT', '6 Astra (Max reasoning)', '57.70', '57.7')),
        { ...context, visualRowCount: 1 },
      ),
    ).toThrow('conflicting DAYJOB Healthcare score');
  });

  it('preserves zero and full-score boundaries without changing variants', () => {
    const result = materializeDayjobHealthcare(
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
      materializeDayjobHealthcare(page(row('', 'Unknown', '10')), {
        ...context,
        visualRowCount: 1,
      }),
    ).toThrow('Invalid DAYJOB Healthcare row');
    expect(() =>
      materializeDayjobHealthcare(
        page(
          row('GPT', '6 Astra (Max reasoning)', '10'),
          row('GPT', '6 Astra (Max reasoning)', '11'),
        ),
        { ...context, visualRowCount: 2 },
      ),
    ).toThrow('Duplicate DAYJOB Healthcare');
    expect(() =>
      materializeDayjobHealthcare(
        page(row('GPT', '6 Astra (Super reasoning)', '10')),
        {
          ...context,
          visualRowCount: 1,
        },
      ),
    ).toThrow('Unrecognized DAYJOB Healthcare configuration');
  });

  it('fails on incomplete or ambiguous leaderboard extraction', () => {
    const html = page(row('GPT', '6 Astra (Max reasoning)', '57.7'));
    expect(() => materializeDayjobHealthcare(html, context)).toThrow(
      'row count mismatch',
    );
    expect(() =>
      materializeDayjobHealthcare(html.replace('DAYJOB: Healthcare', 'Other'), {
        ...context,
        visualRowCount: 1,
      }),
    ).toThrow('page marker missing');
    expect(() =>
      materializeDayjobHealthcare(html + html, {
        ...context,
        visualRowCount: 1,
      }),
    ).toThrow('one DAYJOB Healthcare main leaderboard');
    expect(() =>
      materializeDayjobHealthcare(
        html.replace('</section>', '<div w-pagination-next></div></section>'),
        { ...context, visualRowCount: 1 },
      ),
    ).toThrow('pagination requires review');
    expect(() =>
      materializeDayjobHealthcare(
        html.replace('data-leaderboard-table=""', ''),
        {
          ...context,
          visualRowCount: 1,
        },
      ),
    ).toThrow('one DAYJOB Healthcare leaderboard table');
    expect(() =>
      materializeDayjobHealthcare(
        html.replace(
          '</section>',
          '<div data-score="57.7">57.7</div></section>',
        ),
        { ...context, visualRowCount: 1 },
      ),
    ).toThrow('Invalid DAYJOB Healthcare row');
  });
});
