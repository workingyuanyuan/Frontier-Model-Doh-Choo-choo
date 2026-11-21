import { describe, expect, it } from 'vitest';
import { materializeGbench } from './gbench-materializer.js';

const context = {
  evidenceId: `sha256:${'a'.repeat(64)}`,
  observedAt: '2026-11-21T00:00:00Z',
  visualRowCount: 3,
  models: [
    {
      modelId: 'example-model',
      displayName: 'Example Model',
      aliases: ['example/example-model'],
    },
  ],
};

function row(index: number, overrides: Record<string, unknown> = {}) {
  const gscore = 0.9 - index / 10;
  return {
    rank: index + 1,
    model_id: `example/model-${index}`,
    model: `model-${index}`,
    provider: 'example',
    is_agentic: true,
    gscore,
    ci_low: gscore - 0.01,
    ci_high: gscore + 0.01,
    agentic_coding: { gscore },
    ...overrides,
  };
}

const response = (rows: unknown[]) =>
  JSON.stringify({ data: { rankings: rows }, meta: {} });

describe('GBENCH materializer', () => {
  it('scores the Agentic Coding GScore on 0–100 and resolves exact aliases only', () => {
    const result = materializeGbench(
      response([
        row(0, { model_id: 'example/example-model', model: 'example-model' }),
        // The short label equals a catalog name, but the provider differs.
        row(1, { model_id: 'other/example-model', model: 'Example Model' }),
        row(2),
      ]),
      context,
    );
    expect(result.candidates).toHaveLength(3);
    const byName = new Map(result.candidates.map((c) => [c.model.rawName, c]));
    expect(byName.get('example/example-model')).toMatchObject({
      sourceId: 'gbench',
      sourceRole: 'ORGANIZER',
      benchmarkId: 'gbench-agentic-coding',
      benchmarkVersion: null,
      rawScore: 0.9,
      normalizedScore: 90,
      model: {
        canonicalModelId: 'example-model',
        profileId: 'example-model-default',
      },
      profile: { effort: null, harness: null, tools: null },
    });
    expect(
      byName.get('example/example-model')!.provenance.confidenceIntervalLow!
        .locator,
    ).toBe('$.data.rankings[0].ci_low');
    expect(byName.get('other/example-model')!.model).toMatchObject({
      canonicalModelId: null,
      profileId: null,
    });
  });

  it('excludes baseline and human rows from candidates', () => {
    const result = materializeGbench(
      response([
        row(0),
        // Non-model rows carry no agentic-mode fields.
        row(1, {
          model_id: 'custom/human',
          provider: 'custom',
          is_agentic: undefined,
          agentic_coding: undefined,
        }),
        row(2, {
          model_id: 'baseline/random',
          provider: 'baseline',
          is_agentic: undefined,
          agentic_coding: undefined,
        }),
      ]),
      context,
    );
    expect(result.candidates.map((c) => c.model.rawName)).toEqual([
      'example/model-0',
    ]);
    expect(result.nonModelRows).toEqual(['custom/human', 'baseline/random']);
  });

  it('rejects a response that is not the agentic board or is not complete', () => {
    expect(() =>
      materializeGbench(
        response([row(0, { agentic_coding: { gscore: 0.5 } }), row(1), row(2)]),
        context,
      ),
    ).toThrow('Invalid or unsupported GBENCH agentic row 0');
    expect(() =>
      materializeGbench(response([row(0), row(1), row(2)]), {
        ...context,
        visualRowCount: 2,
      }),
    ).toThrow('rendered and API row counts differ');
    expect(() =>
      materializeGbench(
        response(Array.from({ length: 500 }, (_, index) => row(index % 9))),
        { ...context, visualRowCount: 100 },
      ),
    ).toThrow('truncated');
    expect(() =>
      materializeGbench(
        response([row(0), row(1), row(1, { rank: 3 })]),
        context,
      ),
    ).toThrow('Duplicate GBENCH model');
  });

  it('rejects slug collisions and a response of exactly one page', () => {
    expect(() =>
      materializeGbench(
        response([
          row(0, { model_id: 'example/foo-bar' }),
          row(1, { model_id: 'example/foo_bar' }),
          row(2),
        ]),
        context,
      ),
    ).toThrow('Duplicate GBENCH model');
    expect(() =>
      materializeGbench(
        response(Array.from({ length: 100 }, (_, index) => row(index))),
        { ...context, visualRowCount: 100 },
      ),
    ).toThrow('completeness is unknown');
  });

  it('leaves a ranked model without a published score as a missing cell', () => {
    const result = materializeGbench(
      response([
        row(0),
        row(1, { gscore: null, agentic_coding: { gscore: null } }),
        row(2),
      ]),
      context,
    );
    expect(result.candidates.map((c) => c.model.rawName)).toEqual([
      'example/model-0',
      'example/model-2',
    ]);
    expect(result.missingScoreRows).toEqual(['example/model-1']);
  });

  it('compares the rendered page with the first 100 rows of a larger population', () => {
    const rows = Array.from({ length: 120 }, (_, index) =>
      row(index, {
        gscore: 0.5,
        ci_low: null,
        ci_high: null,
        agentic_coding: { gscore: 0.5 },
      }),
    );
    const result = materializeGbench(response(rows), {
      ...context,
      visualRowCount: 100,
    });
    expect(result.rankedRows).toBe(120);
    expect(result.candidates).toHaveLength(120);
    expect(
      result.candidates[0]!.provenance.confidenceIntervalLow,
    ).toBeUndefined();
  });
});
