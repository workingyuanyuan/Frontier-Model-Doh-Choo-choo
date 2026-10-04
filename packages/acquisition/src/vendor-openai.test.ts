import { CandidateResultSchema } from '@llm-bench/benchmark-data';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import {
  materializeOpenAIRelease,
  materializeOpenAIReleaseCaptures,
} from './vendor-openai.js';

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

describe('reviewed multi-page OpenAI release captures', () => {
  const readCapture = (page: string) =>
    readFileSync(
      new URL(
        `../../../data/sources/openai-releases/reviewed-${page}-capture.json`,
        import.meta.url,
      ),
      'utf8',
    );
  const expandedCapture = (page: string) =>
    JSON.parse(readCapture(page)) as {
      pageId: string;
      sourceUrl: string;
      charts: Array<{ id: string; values: Array<Record<string, unknown>> }>;
    };

  it('preserves exact Luna score/task cost pairs and complete selected chart populations', () => {
    const result = materializeOpenAIRelease(readCapture('sol-luna'), context);
    expect(result.chartCounts).toEqual({
      automationbench: 31,
      'frontiercode-extended': 35,
      deepswe: 35,
    });
    const luna = result.candidates.filter(
      (row) =>
        row.benchmarkId === 'deepswe-1-1' &&
        row.model.canonicalModelId === 'openai-gpt-6-luna',
    );
    expect(
      luna.map((row) => [
        row.profile.effort,
        row.normalizedScore,
        result.costs.find((cost) => cost.id === `${row.id}:cost`)?.cost,
      ]),
    ).toEqual([
      ['low', 2.43, 0.0057],
      ['medium', 44.47, 0.0518],
      ['high', 59.29, 0.0838],
      ['xhigh', 61.28, 0.1096],
      ['max', 66.59, 0.2169],
    ]);
    expect(
      luna.every(
        (row) =>
          row.inclusion === 'INCLUDED' &&
          row.evidenceIds[0] === context.evidenceId,
      ),
    ).toBe(true);
    expect(
      result.candidates.filter(
        (row) => row.benchmarkId === 'frontier-code-1-1',
      ),
    ).toHaveLength(35);
  });

  it('preserves all source rows while excluding pinned historical score conflicts and their costs', () => {
    const result = materializeOpenAIRelease(readCapture('astra'), context);
    expect(result.candidates).toHaveLength(37);
    expect(
      result.candidates.filter((row) => row.inclusion === 'EXCLUDED'),
    ).toHaveLength(7);
    const astraMax = result.candidates.find(
      (row) =>
        row.benchmarkId === 'deepswe-1-1' &&
        row.model.canonicalModelId === 'openai-gpt-6-astra' &&
        row.profile.effort === 'max',
    )!;
    expect(astraMax).toMatchObject({
      normalizedScore: 73,
      inclusion: 'EXCLUDED',
    });
    expect(astraMax.provenance.exclusionReason?.locator).toContain(
      '73.23008849557522',
    );
    expect(
      result.costs.find((row) => row.id === `${astraMax.id}:cost`),
    ).toMatchObject({ cost: 7.5, inclusion: 'EXCLUDED' });
  });

  it('keeps none effort distinct and source simulation costs at full precision', () => {
    const result = materializeOpenAIRelease(readCapture('gpt56'), context);
    const none = result.candidates.find(
      (row) =>
        row.model.canonicalModelId === 'openai-gpt-5-6-sol' &&
        row.profile.effort === 'none',
    )!;
    expect(none).toMatchObject({
      normalizedScore: 44.469,
      model: { profileId: 'openai-gpt-5-6-sol-none' },
    });
    expect(result.costs.find((row) => row.id === `${none.id}:cost`)?.cost).toBe(
      2.430281475,
    );
  });

  it('aggregates distinct pages without losing original IDs, evidence or observation times', () => {
    const old = JSON.stringify(capture());
    const result = materializeOpenAIReleaseCaptures([
      { captureText: old, context },
      {
        captureText: readCapture('sol-luna'),
        context: {
          ...context,
          evidenceId: `sha256:${'b'.repeat(64)}`,
          observedAt: '2026-10-04T04:26:16.028Z',
        },
      },
      { captureText: readCapture('astra'), context },
      { captureText: readCapture('gpt56'), context },
    ]);
    expect(result.candidates).toHaveLength(207);
    expect(result.costs).toHaveLength(207);
    expect(
      result.candidates.filter((row) => row.inclusion === 'INCLUDED'),
    ).toHaveLength(187);
    expect(
      result.candidates.find((row) => row.id === 'openai-releases:deepswe:0'),
    ).toMatchObject({
      observedAt: context.observedAt,
      evidenceIds: [context.evidenceId],
    });
    expect(
      result.candidates.find(
        (row) => row.id === 'openai-releases:sol-luna:deepswe:25',
      ),
    ).toMatchObject({
      observedAt: '2026-10-04T04:26:16.028Z',
      evidenceIds: [`sha256:${'b'.repeat(64)}`],
    });
    expect(() =>
      materializeOpenAIReleaseCaptures([
        { captureText: old, context },
        { captureText: old, context },
      ]),
    ).toThrow('Duplicate OpenAI release page');
    expect(() => materializeOpenAIReleaseCaptures([])).toThrow(
      'cannot be empty',
    );
  });

  it.each(['page', 'precision', 'source', 'exclusion', 'score'])(
    'rejects %s changes outside the reviewed page contract',
    (kind) => {
      const cap = expandedCapture('astra');
      const row = cap.charts
        .find((chart) => chart.id === 'deepswe')!
        .values.find(
          (value) =>
            value.model === 'GPT-6 Astra' && value.effortLabel === 'Max',
        )!;
      if (kind === 'page') cap.pageId = 'sol-luna';
      if (kind === 'precision') row.scorePrecisionPercent = 100;
      if (kind === 'source') row.cost = 8;
      if (kind === 'exclusion') delete row.reviewExclusion;
      if (kind === 'score') {
        row.score = 0.75;
        (row.rawRow as Record<string, unknown>).score = 0.75;
      }
      expect(() =>
        materializeOpenAIRelease(JSON.stringify(cap), context),
      ).toThrow();
    },
  );
});
