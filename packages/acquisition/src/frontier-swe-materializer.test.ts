import { describe, expect, it } from 'vitest';
import { materializeFrontierSwe } from './frontier-swe-materializer.js';

const context = {
  evidenceId: `sha256:${'a'.repeat(64)}`,
  observedAt: '2026-10-01T00:00:00Z',
};
const rows = [
  { model: 'GPT-6 Astra', harness: 'proximus', overall: 65.50757455882352 },
  { model: 'Unknown future model', harness: 'proximus', overall: 0 },
];
const page = (
  options: {
    rows?: unknown[];
    matrix?: unknown[];
    visibleScore?: number;
    version?: string;
    split?: boolean;
  } = {},
) => {
  const data = options.rows ?? rows;
  const payload = `17:${JSON.stringify(['$', '$L25', null, { entries: { abs: { mean: data, best: [{ ...rows[0], overall: 73 }], worst: [] } }, note: 'Scores across all 34 tasks. Each model runs 5 trials per task with a 20-hour budget.' }])}\n18:${JSON.stringify(['$', '$L26', null, { models: options.matrix ?? data, cells: [] }])}\n`;
  const chunks = options.split
    ? [payload.slice(0, 91), payload.slice(91)]
    : [payload];
  return `<h1>FrontierSWE <span>${options.version ?? 'V2'}</span></h1><div title="OpenAI GPT-6 Astra + proximus: mean@5 ${options.visibleScore ?? 65.5}%, worst@5 55.1%, best@5 73.0%"></div>${chunks.map((chunk) => `<script>self.__next_f.push(${JSON.stringify([1, chunk])})</script>`).join('')}`;
};

describe('FrontierSWE V2 acquisition', () => {
  it('captures all mean@5 rows with full percentage precision across split RSC chunks', () => {
    const result = materializeFrontierSwe(page({ split: true }), context);
    expect(result.visibleRows).toBe(1);
    expect(result.candidates).toHaveLength(2);
    expect(result.candidates[0]).toMatchObject({
      benchmarkId: 'frontier-swe-v2',
      benchmarkVersion: '2',
      rawScore: rows[0]!.overall,
      normalizedScore: rows[0]!.overall,
      model: { canonicalModelId: 'openai-gpt-6-astra', profileId: null },
      profile: { effort: null, harness: 'proximus', attempts: 5 },
      metric: { id: 'mean-at-5', unit: 'percent' },
      evidenceIds: [context.evidenceId],
    });
    expect(result.candidates[1]).toMatchObject({
      normalizedScore: 0,
      model: { canonicalModelId: null, profileId: null },
    });
  });
  it.each([null, '65.5', -1, 101])(
    'rejects invalid or missing score %s',
    (overall) => {
      expect(() =>
        materializeFrontierSwe(
          page({ rows: [{ ...rows[0], overall }] }),
          context,
        ),
      ).toThrow('Invalid FrontierSWE');
    },
  );
  it('fails when embedded scores disagree with server-rendered scores', () => {
    expect(() =>
      materializeFrontierSwe(page({ visibleScore: 73 }), context),
    ).toThrow('visible mean@5 mismatch');
  });
  it('rejects truncated data and repeated identities', () => {
    expect(() =>
      materializeFrontierSwe(page({ matrix: rows.slice(0, 1) }), context),
    ).toThrow('model lists disagree');
    expect(() =>
      materializeFrontierSwe(page({ rows: [rows[0], rows[0]] }), context),
    ).toThrow('Duplicate');
  });
  it('rejects another version and missing embedded data', () => {
    expect(() =>
      materializeFrontierSwe(page({ version: 'V1' }), context),
    ).toThrow('V2 page marker');
    expect(() =>
      materializeFrontierSwe('<h1>FrontierSWE V2</h1>', context),
    ).toThrow('Expected one');
  });
});
