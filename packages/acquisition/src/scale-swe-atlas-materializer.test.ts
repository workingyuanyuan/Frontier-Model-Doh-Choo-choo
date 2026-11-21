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
  options: {
    rows?: unknown[];
    tab?: string;
    version?: string;
    overallLabel?: string;
  } = {},
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
        label:
          key === 'overall'
            ? (options.overallLabel ?? 'SWE Atlas - Overall')
            : key,
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

  it('splits "<model> (<harness>) <effort>" labels and matches the model part exactly', () => {
    const [labelled, dated, inexact] = materializeScaleSweAtlas(
      page({
        rows: [
          { ...row, model: 'Example model (Example CLI) xhigh' },
          { ...row, model: 'Example model (0902) (mini-swe-agent) max' },
          { ...row, model: 'Example-model (Example CLI) high' },
        ],
      }),
      { ...context, visualRowCount: 3 },
    ).candidates;
    const byName = new Map(
      [labelled, dated, inexact].map((c) => [c!.model.rawName, c!]),
    );
    expect(byName.get('Example model (Example CLI) xhigh')!).toMatchObject({
      model: {
        canonicalModelId: 'example-model',
        profileId: 'example-model-xhigh',
      },
      profile: { effort: 'xhigh', harness: 'Example CLI' },
    });
    // Only the last parenthesised group is the harness.
    expect(
      byName.get('Example model (0902) (mini-swe-agent) max')!,
    ).toMatchObject({
      model: { canonicalModelId: null },
      profile: { effort: 'max', harness: 'mini-swe-agent' },
    });
    expect(
      byName.get('Example-model (Example CLI) high')!.model.canonicalModelId,
    ).toBeNull();
  });

  it('prefers a full-label catalog match and never records a blank harness', () => {
    const models = [
      ...context.models,
      {
        modelId: 'example-preview',
        displayName: 'Example model (Preview) max',
      },
    ];
    const [blank, full] = materializeScaleSweAtlas(
      page({
        rows: [
          { ...row, model: 'Example model (Preview) max' },
          { ...row, model: 'Example model ( ) max' },
        ],
      }),
      { ...context, models, visualRowCount: 2 },
    ).candidates;
    expect(full).toMatchObject({
      model: { canonicalModelId: 'example-preview' },
      profile: { effort: null, harness: null },
    });
    expect(blank).toMatchObject({
      model: { canonicalModelId: null },
      profile: { harness: null },
    });
    expect(blank!.provenance['profile.harness']).toBeUndefined();
  });
  it('accepts the exact RSC v1.1 catalog marker when methodology moves to an iframe', () => {
    const catalog = (version: string) =>
      `<script>self.__next_f.push(${JSON.stringify([
        1,
        `2:${JSON.stringify({
          id: 'swe-atlas',
          airtableTableName: `sweatlas_${version} Overall`,
          deprecated: false,
        })}\n`,
      ])})</script>`;
    const redesigned = page().replace(
      '<strong>SWE Atlas v1.1 is live.</strong>',
      '<iframe src="/embeds/swe-atlas-index.html"></iframe>',
    );
    expect(
      materializeScaleSweAtlas(redesigned + catalog('1.1'), context)
        .candidates[0]?.benchmarkVersion,
    ).toBe('v1.1');
    expect(() =>
      materializeScaleSweAtlas(redesigned + catalog('1.2'), context),
    ).toThrow('methodology marker');
    expect(() =>
      materializeScaleSweAtlas(
        redesigned + catalog('1.1') + catalog('1.2'),
        context,
      ),
    ).toThrow('methodology marker');
    expect(() =>
      materializeScaleSweAtlas(
        page({ version: '1.2' }) + catalog('1.1'),
        context,
      ),
    ).toThrow('methodology marker');
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
    expect(
      materializeScaleSweAtlas(page({ overallLabel: 'Overall' }), context)
        .candidates,
    ).toHaveLength(1);
    expect(() =>
      materializeScaleSweAtlas(page({ overallLabel: 'Details' }), context),
    ).toThrow('overall label changed');
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
