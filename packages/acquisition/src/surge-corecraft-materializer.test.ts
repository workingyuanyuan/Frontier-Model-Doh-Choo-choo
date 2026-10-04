import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { materializeCorecraft } from './surge-corecraft-materializer.js';

const fixture = readFileSync(
  new URL('../test-fixtures/corecraft-page.html', import.meta.url),
  'utf8',
);
const context = {
  evidenceId: `sha256:${'a'.repeat(64)}`,
  observedAt: '2026-10-03T00:00:00.000Z',
  visualRowCount: 50,
};
const row = (brand: string, name: string, score: string, visible = score) =>
  `<div data-leaderboard-row=""><div><div class="head-rank-table-brand">${brand}</div></div><div><div class="head-rank-table-name">${name}</div></div><div><div data-score="${score}">${visible}</div></div></div>`;
const page = (...rows: string[]) =>
  `<h1>EnterpriseBench: CoreCraft Agents</h1><section class="lead-main"><div data-leaderboard-table="">${rows.join('')}</div></section>`;

describe('Surge CoreCraft acquisition', () => {
  it('captures the official 50-row main leaderboard with exact scores and provenance', () => {
    const result = materializeCorecraft(fixture, context);
    expect(result.visibleRows).toBe(50);
    expect(result.candidates).toHaveLength(50);
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
      sourceId: 'surge-corecraft',
      benchmarkId: 'enterprisebench-corecraft',
      sourceRole: 'ORGANIZER',
      metric: {
        id: 'task-pass-rate',
        name: 'Task pass rate',
        unit: 'percent',
        higherIsBetter: true,
      },
      rawScore: 42.6,
      normalizedScore: 42.6,
      profile: { effort: 'max', thinking: 'Max reasoning', attempts: null },
    });
    expect(
      result.candidates.find(
        ({ model }) => model.rawName === 'Claude Opus 4.7 (Adaptive/Max)',
      ),
    ).toMatchObject({ rawScore: 35.9, profile: { effort: 'max' } });
    expect(
      result.candidates.find(
        ({ model }) => model.rawName === 'Nova 2 Pro (High reasoning)',
      ),
    ).toMatchObject({ rawScore: 8.9, profile: { effort: 'high' } });
    expect(
      result.candidates.find(
        ({ model }) =>
          model.rawName ===
          'DeepSeek V4 Flash Vision (experimental) (Max reasoning)',
      ),
    ).toMatchObject({ model: { canonicalModelId: null }, rawScore: 45.6 });
  });

  it('keeps Fast in model identity and Auto reasoning outside the effort ladder', () => {
    const candidates = materializeCorecraft(fixture, context).candidates;
    const fast = candidates.find(
      ({ model }) => model.rawName === 'Grok 4.1 (Fast)',
    );
    expect(fast).toMatchObject({
      rawScore: 20.5,
      profile: { effort: null, thinking: null },
      model: { profileId: null },
    });
    expect(fast?.model.canonicalModelId).not.toBe('xai-grok-4-1');
    expect(
      candidates.find(
        ({ model }) => model.rawName === 'GLM 5 (Auto reasoning)',
      ),
    ).toMatchObject({
      rawScore: 17.4,
      profile: { effort: null, thinking: 'Auto reasoning' },
    });
    expect(
      candidates.every(
        ({ profile, benchmarkVersion, sourcePublishedAt }) =>
          profile.harness === null &&
          profile.tools === null &&
          profile.attempts === null &&
          benchmarkVersion === null &&
          sourcePublishedAt === null,
      ),
    ).toBe(true);
  });

  it('ignores scores and rows outside the main section', () => {
    const html = `${page(row('GPT', '6 Astra (Max reasoning)', '57.7'))}<section class="related">${row('GPT', '6 Astra (Max reasoning)', '1099')}</section><script>var DATA={"score":0.999};</script>`;
    expect(
      materializeCorecraft(html, { ...context, visualRowCount: 1 }).candidates,
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
    const candidate = materializeCorecraft(
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
    const result = materializeCorecraft(
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
      materializeCorecraft(page(row('Example', 'Unknown', score, visible)), {
        ...context,
        visualRowCount: 1,
      }),
    ).toThrow(/Invalid.*CoreCraft/u);
  });

  it('validates the published empty attributes and percent marker', () => {
    const published = row('GPT', '6 Astra (Max reasoning)', '', '57.7').replace(
      '</div></div></div>',
      '</div><div data-score="">%</div></div></div>',
    );
    expect(
      materializeCorecraft(page(published), {
        ...context,
        visualRowCount: 1,
      }).candidates[0],
    ).toMatchObject({ rawScore: 57.7 });
    expect(() =>
      materializeCorecraft(page(published.replace('>%<', '>points<')), {
        ...context,
        visualRowCount: 1,
      }),
    ).toThrow('Invalid CoreCraft row');
    expect(() =>
      materializeCorecraft(
        page(row('GPT', '6 Astra (Max reasoning)', '57.70', '57.7')),
        { ...context, visualRowCount: 1 },
      ),
    ).toThrow('conflicting CoreCraft score');
  });

  it('fails on missing identity, duplicate configurations, or unrecognized labels', () => {
    expect(() =>
      materializeCorecraft(page(row('', 'Unknown', '10')), {
        ...context,
        visualRowCount: 1,
      }),
    ).toThrow('Invalid CoreCraft row');
    expect(() =>
      materializeCorecraft(
        page(
          row('GPT', '6 Astra (Max reasoning)', '10'),
          row('GPT', '6 Astra (Max reasoning)', '11'),
        ),
        { ...context, visualRowCount: 2 },
      ),
    ).toThrow('Duplicate CoreCraft');
    expect(() =>
      materializeCorecraft(
        page(row('GPT', '6 Astra (Super reasoning)', '10')),
        { ...context, visualRowCount: 1 },
      ),
    ).toThrow('Unrecognized CoreCraft configuration');
  });

  it('fails on incomplete or ambiguous leaderboard extraction', () => {
    const html = page(row('GPT', '6 Astra (Max reasoning)', '57.7'));
    expect(() => materializeCorecraft(html, context)).toThrow(
      'row count mismatch',
    );
    expect(() =>
      materializeCorecraft(html.replace('CoreCraft', 'Other'), {
        ...context,
        visualRowCount: 1,
      }),
    ).toThrow('page marker missing');
    expect(() =>
      materializeCorecraft(html + html, {
        ...context,
        visualRowCount: 1,
      }),
    ).toThrow('one CoreCraft main leaderboard');
    expect(() =>
      materializeCorecraft(
        html.replace('</section>', '<div w-pagination-next></div></section>'),
        { ...context, visualRowCount: 1 },
      ),
    ).toThrow('pagination requires review');
    expect(() =>
      materializeCorecraft(html.replace('data-leaderboard-table=""', ''), {
        ...context,
        visualRowCount: 1,
      }),
    ).toThrow('one CoreCraft leaderboard table');
    expect(() =>
      materializeCorecraft(
        html.replace(
          '</section>',
          '<div data-score="57.7">57.7</div></section>',
        ),
        { ...context, visualRowCount: 1 },
      ),
    ).toThrow('Invalid CoreCraft row');
  });
});
