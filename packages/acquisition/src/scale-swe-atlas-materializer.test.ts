import { describe, expect, it } from 'vitest';
import { materializeScaleSweAtlas } from './scale-swe-atlas-materializer.js';

const context = {
  evidenceId: `sha256:${'a'.repeat(64)}`,
  observedAt: '2026-11-12T00:00:00Z',
  visualRowCount: 1,
  models: [
    {
      modelId: 'example-model',
      displayName: 'Example model',
      aliases: ['Example model (high)'],
    },
  ],
};
const row = {
  model: 'Example model',
  version: '',
  rank: 1,
  score: 45.6,
  confidenceInterval_upper: 2.1,
  createdAt: '2026-11-11T00:00:00Z',
  deprecated: false,
  contaminationMessage: '',
  maxScore: 70,
};
function page(
  options: { rows?: unknown[]; tab?: string; version?: string } = {},
) {
  const payload = [
    '$',
    '$L1',
    null,
    {
      slug: 'swe-atlas',
      activeTab: options.tab ?? 'overall',
      variants: ['overall', 'qna', 'testwriting', 'refactoring'].map((key) => ({
        key,
        label: key === 'overall' ? 'SWE Atlas - Overall' : key,
        entries: options.rows ?? [row],
      })),
    },
  ];
  const data = `1:${JSON.stringify(payload)}\n`;
  // Exercise transport chunks split in the middle of JSON data.
  const middle = Math.floor(data.length / 2);
  return `<strong>SWE Atlas v${options.version ?? '1.1'} is live.</strong>${[data.slice(0, middle), data.slice(middle)].map((chunk) => `<script>self.__next_f.push(${JSON.stringify([1, chunk])})</script>`).join('')}`;
}

describe('Scale SWE Atlas materializer', () => {
  it('uses only Overall on its published scale and preserves CI provenance', () => {
    const result = materializeScaleSweAtlas(page(), context);
    expect(result.candidates).toHaveLength(1);
    expect(result.candidates[0]).toMatchObject({
      benchmarkId: 'swe-atlas',
      benchmarkVersion: 'v1.1',
      sourceRole: 'ORGANIZER',
      normalizedScore: 45.6,
      model: { canonicalModelId: 'example-model' },
      profile: { effort: null, attempts: null, tools: null, harness: null },
    });
    expect(
      result.candidates[0]!.provenance.confidenceIntervalUpper!.locator,
    ).toContain('variants[0].entries[0].confidenceInterval_upper');
    expect(result.confidenceIntervals).toEqual([
      {
        model: 'Example model',
        confidenceInterval_upper: 2.1,
        confidenceInterval_lower: null,
      },
    ]);
    expect(result.rawVariantCounts).toEqual({
      overall: 1,
      qna: 1,
      testwriting: 1,
      refactoring: 1,
    });
  });
  it('resolves exact catalog strings and retains only explicit effort', () => {
    const explicit = materializeScaleSweAtlas(
      page({ rows: [{ ...row, model: 'Example model (high)' }] }),
      context,
    ).candidates[0]!;
    expect(explicit.profile.effort).toBe('high');
    expect(explicit.model.canonicalModelId).toBe('example-model');
    const unknown = materializeScaleSweAtlas(
      page({ rows: [{ ...row, model: 'Example-model' }] }),
      context,
    ).candidates[0]!;
    expect(unknown.model).toMatchObject({
      canonicalModelId: null,
      profileId: null,
    });
    expect(unknown.profile.effort).toBeNull();
  });
  it('stops on incomplete, duplicate, invalid or changed source data', () => {
    expect(() =>
      materializeScaleSweAtlas(page(), { ...context, visualRowCount: 2 }),
    ).toThrow('count mismatch');
    expect(() =>
      materializeScaleSweAtlas(page({ rows: [row, row] }), {
        ...context,
        visualRowCount: 2,
      }),
    ).toThrow('Duplicate');
    expect(() =>
      materializeScaleSweAtlas(
        page({ rows: [{ ...row, score: 101 }] }),
        context,
      ),
    ).toThrow('Invalid');
    expect(() =>
      materializeScaleSweAtlas(
        page({ rows: [{ ...row, confidenceInterval_upper: -1 }] }),
        context,
      ),
    ).toThrow('confidence interval');
    expect(() =>
      materializeScaleSweAtlas(page({ tab: 'qna' }), context),
    ).toThrow('default tab changed');
    expect(() =>
      materializeScaleSweAtlas(page({ version: '1.2' }), context),
    ).toThrow('methodology marker');
    expect(() =>
      materializeScaleSweAtlas(
        '<script>throw new Error("never execute source")</script>',
        context,
      ),
    ).toThrow('methodology marker');
  });
});
