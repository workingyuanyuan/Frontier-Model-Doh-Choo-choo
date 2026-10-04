import { CandidateResultSchema } from '@llm-bench/benchmark-data';
import { describe, expect, it } from 'vitest';

import { materializeOpenAIRelease } from './vendor-openai.js';

const context = {
  evidenceId: `sha256:${'a'.repeat(64)}`,
  observedAt: '2026-10-02T00:00:00.000Z',
};
const efforts = ['低', '中', '高', '極高', 'Max'];
const models = ['GPT-6 Astra', 'GPT-6 Sol', 'GPT-6.1 Sol'];

function rows(names: string[]): Record<string, unknown>[] {
  return names.flatMap((model) =>
    efforts.map((effortLabel, order) => ({
      model,
      modelLabel: model,
      score: 0.6704,
      cost: 1.5952,
      effortLabel,
      order,
    })),
  );
}

function capture() {
  return {
    schemaVersion: 'vendor-chart-capture-v1',
    sourceUrl: 'https://openai.com/zh-Hant/index/introducing-gpt-6-1-sol/',
    chartVersions: { deepswe: '1.1', automationbench: '1.0.6' },
    charts: [
      { id: 'deepswe', values: rows(models) },
      {
        id: 'automationbench',
        values: [
          ...rows(models),
          ...rows(['Opus 5.5 w/ fallbacks']).map(
            (row): Record<string, unknown> => ({
              ...row,
              modelLabel: 'Opus 5.5（含備援機制）',
            }),
          ),
          {
            model: 'Fable 5.1 w/ Opus 5 fallback',
            modelLabel: 'Fable 5.1（以 Opus 5 作為備援）',
            score: 0.314,
            cost: 2.45,
            effortLabel: 'Max',
            order: 4,
          },
        ],
      },
    ],
  };
}

const materialize = (value: ReturnType<typeof capture>) =>
  materializeOpenAIRelease(JSON.stringify(value), context);

describe('OpenAI release chart materializer', () => {
  it('materializes the same chart rows as USD task costs including excluded fallback rows', () => {
    const result = materialize(capture());
    expect(result.costs).toHaveLength(36);
    expect(
      result.costs.filter(({ inclusion }) => inclusion === 'INCLUDED'),
    ).toHaveLength(30);
    const cost = result.costs.find(
      ({ id }) => id === 'openai-releases:deepswe:10:cost',
    )!;
    expect(cost).toMatchObject({
      sourceId: 'openai-releases',
      benchmarkId: 'deepswe-1-1',
      benchmarkVersion: '1.1',
      model: {
        canonicalModelId: 'openai-gpt-6-1-sol',
        profileId: 'openai-gpt-6-1-sol-low',
      },
      profile: { effort: 'low', harness: null },
      cost: 1.5952,
      unit: 'USD_PER_TASK',
      costType: 'AGENT_TASK',
      evidenceIds: [context.evidenceId],
      observedAt: context.observedAt,
    });
    expect(cost.provenance.cost?.locator).toContain(
      '$.charts[0].values[10].cost',
    );
    expect(cost.provenance.unit?.locator).toContain('USD per task');
    expect(
      result.costs.filter(({ inclusion }) => inclusion === 'EXCLUDED'),
    ).toHaveLength(6);
  });
  it('preserves complete selected charts, explicit efforts, percent scores, and source fraction provenance', () => {
    const result = materialize(capture());
    CandidateResultSchema.array().parse(result.candidates);
    expect(result.chartCounts).toEqual({ deepswe: 15, automationbench: 21 });
    expect(result.candidates).toHaveLength(36);
    const astra = result.candidates.find(
      ({ benchmarkId, model, profile }) =>
        benchmarkId === 'deepswe-1-1' &&
        model.canonicalModelId === 'openai-gpt-6-astra' &&
        profile.effort === 'low',
    )!;
    expect(astra).toMatchObject({
      sourceId: 'openai-releases',
      sourceRole: 'VENDOR',
      benchmarkVersion: '1.1',
      metric: { id: 'pass-at-1', unit: 'percent' },
      acquisitionStatus: 'PARTIAL_SOURCE',
      inclusion: 'INCLUDED',
      rawScore: 67.04,
      normalizedScore: 67.04,
      sourcePublishedAt: null,
      profile: { harness: null },
      model: { rawName: 'GPT-6 Astra', profileId: 'openai-gpt-6-astra-low' },
    });
    expect(astra.provenance['profile.effort']!.locator).toContain('"低"');
    expect(astra.provenance.rawScore!.locator).toContain('captured=0.6704');
    expect(astra.provenance.rawScore!.locator).toContain(
      'fraction * 100 = 67.04 percent',
    );
    expect(astra.provenance.model!.locator).toContain('"GPT-6 Astra"');
    expect(astra.provenance.cost!.locator).toContain('1.5952');
    expect(astra.provenance.benchmarkVersion!.locator).toContain('"1.1"');
    expect(result.validationReport).toContain('Included: 30; excluded: 6');
    const fallback = result.candidates.filter(
      ({ inclusion }) => inclusion === 'EXCLUDED',
    );
    expect(fallback).toHaveLength(6);
    for (const row of fallback) {
      expect(row.model.canonicalModelId).toBeNull();
      expect(row.model.profileId).toBeNull();
      expect(row.exclusionReason).toContain('Multi-model fallback');
    }
    expect(
      result.candidates
        .filter(({ inclusion }) => inclusion === 'INCLUDED')
        .map(({ model }) => model.canonicalModelId),
    ).toEqual(
      expect.arrayContaining([
        'openai-gpt-6-astra',
        'openai-gpt-6-sol',
        'openai-gpt-6-1-sol',
      ]),
    );
  });

  it('accepts explicit English efforts and legitimate zero scores/costs', () => {
    const value = capture();
    const english = ['Low', 'Medium', 'High', 'Extra High', 'MAX'];
    value.charts[0]!.values.forEach((row) => {
      row.effortLabel = english[row.order as number];
    });
    value.charts[0]!.values[0]!.score = 0;
    value.charts[0]!.values[0]!.cost = 0;
    expect(materialize(value).candidates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ rawScore: 0, normalizedScore: 0 }),
      ]),
    );
  });

  it.each(['model', 'modelLabel'])(
    'detects fallback configurations in %s even when the other label names a known model',
    (field) => {
      const value = capture();
      value.charts[0]!.values[0]![field] = 'GPT-6 Astra with fallbacks';
      const row = materialize(value).candidates.find(
        ({ id }) => id === 'openai-releases:deepswe:0',
      )!;
      expect(row).toMatchObject({
        inclusion: 'EXCLUDED',
        model: { canonicalModelId: null, profileId: null },
      });
      expect(row.exclusionReason).toContain('Multi-model fallback');
    },
  );

  it('preserves an unknown model with null identity', () => {
    const value = capture();
    Object.assign(value.charts[0]!.values[0]!, {
      model: 'New Model',
      modelLabel: 'New Model',
    });
    expect(materialize(value).candidates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          inclusion: 'EXCLUDED',
          model: {
            rawName: 'New Model',
            canonicalModelId: null,
            profileId: null,
          },
        }),
      ]),
    );
  });

  it('detects a Chinese fallback display label paired with a known model', () => {
    const value = capture();
    value.charts[0]!.values[0]!.modelLabel = 'GPT-6 Astra（含備援機制）';
    expect(materialize(value).candidates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          exclusionReason:
            'Multi-model fallback configuration; single-model identity unavailable',
        }),
      ]),
    );
  });

  it.each([
    ['score', null],
    ['score', ''],
    ['score', '0.5'],
    ['score', -0.1],
    ['score', 1.1],
    ['score', Number.NaN],
    ['cost', null],
    ['cost', ''],
    ['cost', -1],
    ['cost', Number.POSITIVE_INFINITY],
  ])('rejects invalid %s value %s without coercion', (field, invalid) => {
    const value = capture();
    value.charts[0]!.values[0]![field as string] = invalid;
    expect(() => materialize(value)).toThrow('numeric value out of range');
  });

  it.each(['effort', 'order', 'duplicate'])(
    'rejects %s configuration drift',
    (kind) => {
      const value = capture();
      const row = value.charts[0]!.values[0]!;
      if (kind === 'effort') row.effortLabel = 'Automatic';
      if (kind === 'order') row.order = 4;
      if (kind === 'duplicate') value.charts[0]!.values[1] = { ...row };
      expect(() => materialize(value)).toThrow(
        kind === 'effort'
          ? 'Unknown OpenAI effort'
          : kind === 'order'
            ? 'effort/order conflict'
            : 'Duplicate OpenAI model/effort',
      );
    },
  );

  it.each([
    'schema',
    'url',
    'version',
    'missing',
    'duplicate',
    'unexpected',
    'count',
  ])('rejects %s capture drift', (kind) => {
    const value = capture();
    if (kind === 'schema') value.schemaVersion = 'new-schema';
    if (kind === 'url') value.sourceUrl = 'https://example.test/';
    if (kind === 'version') value.chartVersions.deepswe = '1.2';
    if (kind === 'missing') value.charts.pop();
    if (kind === 'duplicate') value.charts[1]!.id = 'deepswe';
    if (kind === 'unexpected') value.charts[1]!.id = 'other-chart';
    if (kind === 'count') value.charts[0]!.values.pop();
    expect(() => materialize(value)).toThrow();
  });
});
