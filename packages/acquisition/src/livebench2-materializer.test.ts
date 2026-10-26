import { describe, expect, it } from 'vitest';

import {
  LIVEBENCH2_SUITES,
  extractLiveBench2Release,
  materializeLiveBench2,
  readLiveBench2Registry,
} from './livebench2-materializer.js';
import {
  LIVEBENCH_V1_COST_SUPERSEDED_REASON,
  LIVEBENCH_V1_SUPERSEDED_REASON,
  buildLiveBenchSnapshot,
  type LiveBenchFile,
} from './livebench-snapshot.js';
import { materializeLiveBench2Costs } from './pricing-materializers.js';

const sha = (char: string) => `sha256:${char.repeat(64)}`;

// Shape of the 2026-10-14 bundle: a 1.0 ISO release list, a 2.0 YYYYMMDD
// list, a cache version, and 2.0 registry entries starting with displayName.
const mainJs = [
  'Oe=[...["2026-01-08","2026-06-25"].map(e=>e),..._e];_e=["20261014"];',
  'fetch(`./v1/table_${n}.csv?v=1792480668`);',
  'Ye={"claude-opus-5.5":{displayName:"Claude Opus 5.5",organization:"Anthropic",effort:"max",reasoner:!0},',
  'inkling:{displayName:"Inkling",organization:"Thinking Machines",effort:"xhigh",reasoner:!0}};',
  '"claude-opus-4-5":{url:"https://www.anthropic.com",displayName:"Claude Opus 4.5"}',
].join('');

const categories2 = JSON.stringify(
  Object.fromEntries(
    LIVEBENCH2_SUITES.map(({ category, column }) => [category, [column]]),
  ),
);
const table2 = [
  'model,long_agentic,reasoning,coding,browser,data_analysis,research,design',
  'claude-opus-5.5,80.1,91.0,96.3,0.0,82.0,85.0,',
].join('\n');
const context2 = {
  release: { path: '20261014', date: '2026-10-14' },
  tableEvidenceId: sha('a'),
  categoriesEvidenceId: sha('b'),
  jsEvidenceId: sha('c'),
  tableUrl: 'https://livebench.ai/data/20261014/table.csv?v=1',
  observedAt: '2026-10-23T00:00:00.000Z',
};

describe('LiveBench 2.0 materializer', () => {
  it('reads both release lists and the 2.0 registry', () => {
    expect(extractLiveBench2Release(mainJs)).toEqual({
      path: '20261014',
      date: '2026-10-14',
    });
    expect(readLiveBench2Registry(mainJs, 'claude-opus-5.5')).toEqual({
      displayName: 'Claude Opus 5.5',
      effort: 'max',
    });
    expect(readLiveBench2Registry(mainJs, 'inkling')?.effort).toBe('xhigh');
    // 1.0 entries start with url: and are not 2.0 registry entries.
    expect(readLiveBench2Registry(mainJs, 'claude-opus-4-5')).toBeNull();
  });

  it('keeps published zeros, skips blank cells and records suite tools', () => {
    const result = materializeLiveBench2(mainJs, table2, categories2, context2);
    expect(result.blankCells).toEqual(['claude-opus-5.5/design']);
    expect(result.candidates).toHaveLength(6);
    const browser = result.candidates.find(
      ({ benchmarkId }) => benchmarkId === 'livebench-browser',
    )!;
    expect(browser).toMatchObject({
      rawScore: 0,
      benchmarkVersion: '2026-10-14',
      model: { profileId: 'anthropic-claude-opus-5-5-max-livebench-2' },
      profile: { effort: 'max', tools: true, harness: 'LiveBench 2.0' },
    });
    expect(
      result.candidates.find(
        ({ benchmarkId }) => benchmarkId === 'livebench-reasoning',
      )?.profile.tools,
    ).toBe(false);
  });

  it('fails closed on unreviewed categories or unregistered models', () => {
    const extra = JSON.stringify({
      ...JSON.parse(categories2),
      Video: ['video'],
    });
    expect(() =>
      materializeLiveBench2(mainJs, table2, extra, context2),
    ).toThrow(/Unreviewed LiveBench 2.0 categories: Video/u);
    expect(() =>
      materializeLiveBench2(
        mainJs,
        table2.replace('claude-opus-5.5', 'unknown-model'),
        categories2,
        context2,
      ),
    ).toThrow(/registry has no entry for unknown-model/u);
  });

  it('reads the 2026-10-25 Overall weights without scoring them', () => {
    const weighted = (weights: unknown) =>
      JSON.stringify({ ...JSON.parse(categories2), _overall_weights: weights });
    const result = materializeLiveBench2(
      mainJs,
      table2,
      weighted({ 'Long Agentic': 2, Coding: 1.5, Design: 1.5 }),
      context2,
    );
    expect(result.overallWeights).toEqual({
      'Long Agentic': 2,
      Coding: 1.5,
      Design: 1.5,
    });
    expect(result.candidates).toEqual(
      materializeLiveBench2(mainJs, table2, categories2, context2).candidates,
    );
    expect(
      materializeLiveBench2(mainJs, table2, categories2, context2)
        .overallWeights,
    ).toEqual({});
    expect(() =>
      materializeLiveBench2(mainJs, table2, weighted({ Video: 2 }), context2),
    ).toThrow(/_overall_weights names unknown category Video/u);
    expect(() =>
      materializeLiveBench2(mainJs, table2, weighted({ Coding: 0 }), context2),
    ).toThrow(/Invalid LiveBench 2.0 weight Coding: 0/u);
    expect(() =>
      materializeLiveBench2(mainJs, table2, weighted([2]), context2),
    ).toThrow(/_overall_weights is not an object/u);
  });
});

describe('LiveBench 2.0 costs', () => {
  const header =
    'model,design,research,nq_design,nq_research,input_price_per_million,output_price_per_million';
  const context = {
    sourceUrl: 'https://livebench.ai/data/20261014/cost.csv?v=1',
    evidenceId: sha('d'),
    observedAt: '2026-10-23T00:00:00.000Z',
    method: 'EXPORT' as const,
    benchmarkVersion: '2026-10-14',
  };
  it('divides total cost by total tasks across suites', () => {
    const [price, task] = materializeLiveBench2Costs(
      `${header}\nclaude-opus-5.5,10,30,5,15,5,25`,
      new Map([['claude-opus-5.5', 'max']]),
      context,
    );
    expect(price).toMatchObject({
      costType: 'API_STANDARDIZED',
      inputPerMillionTokens: 5,
      outputPerMillionTokens: 25,
    });
    expect(task).toMatchObject({ costType: 'MEASURED_TASK', cost: 2 });
  });
  it('treats blank prices as missing rather than free', () => {
    const costs = materializeLiveBench2Costs(
      `${header}\nclaude-opus-5.5,10,30,5,15,,`,
      new Map([['claude-opus-5.5', 'max']]),
      context,
    );
    expect(costs.map(({ costType }) => costType)).toEqual(['MEASURED_TASK']);
  });
});

describe('LiveBench snapshot across generations', () => {
  const file = (text: string, url: string, char: string): LiveBenchFile => ({
    text,
    url,
    evidenceId: sha(char),
    retrievedAt: '2026-10-23T00:00:00.000Z',
    method: 'EXPORT',
  });
  const v1Categories = JSON.stringify({
    Reasoning: ['web_of_lies'],
    Mathematics: ['math_comp'],
    Language: ['typos'],
    IF: ['paraphrase'],
  });
  const v1Table = (typos: string) =>
    [
      'model,web_of_lies,math_comp,typos,paraphrase',
      `claude-opus-5-5-max-effort,90,80,${typos},60`,
    ].join('\n');
  const v1Cost =
    'model,input_price_per_million,output_price_per_million,cost_per_successful_task\nclaude-opus-5-5-max-effort,5,25,0.8';
  const v2Cost =
    'model,coding,nq_coding,input_price_per_million,output_price_per_million\nclaude-opus-5.5,29,29,6,30';
  const input = (
    typos: string,
    previous: Parameters<
      typeof buildLiveBenchSnapshot
    >[0]['previousCandidates'],
  ) => ({
    mainJs,
    jsEvidenceId: sha('c'),
    jsUrl: 'https://livebench.ai/static/js/main.x.js',
    release2: { path: '20261014', date: '2026-10-14' },
    v1: {
      table: file(
        v1Table(typos),
        'https://livebench.ai/v1/table_2026_06_25.csv',
        '1',
      ),
      categories: file(
        v1Categories,
        'https://livebench.ai/v1/categories_2026_06_25.json',
        '2',
      ),
      cost: file(v1Cost, 'https://livebench.ai/v1/cost_2026_06_25.csv', '3'),
    },
    v2: {
      table: file(table2, context2.tableUrl, '4'),
      categories: file(
        categories2,
        'https://livebench.ai/data/20261014/categories.json',
        '5',
      ),
      cost: file(v2Cost, 'https://livebench.ai/data/20261014/cost.csv', '6'),
    },
    previousCandidates: previous,
  });

  it('supersedes 1.0 Reasoning and task cost but keeps dropped benchmarks', () => {
    const snapshot = buildLiveBenchSnapshot(input('70', null));
    const v1 = snapshot.candidates.filter(
      ({ benchmarkVersion }) => benchmarkVersion === '2026-06-25',
    );
    expect(
      v1.find(({ benchmarkId }) => benchmarkId === 'livebench-reasoning'),
    ).toMatchObject({
      inclusion: 'EXCLUDED',
      exclusionReason: LIVEBENCH_V1_SUPERSEDED_REASON,
    });
    expect(
      v1.find(({ benchmarkId }) => benchmarkId === 'livebench-language'),
    ).toMatchObject({ inclusion: 'INCLUDED', rawScore: 70 });
    const v1Task = snapshot.costs.find(
      ({ metricId }) => metricId === 'cost-per-successful-task',
    );
    expect(v1Task).toMatchObject({
      inclusion: 'EXCLUDED',
      exclusionReason: LIVEBENCH_V1_COST_SUPERSEDED_REASON,
    });
    // The 2.0 token price replaces the 1.0 price for the same profile.
    expect(
      snapshot.costs.filter(({ costType }) => costType === 'API_STANDARDIZED'),
    ).toEqual([
      expect.objectContaining({
        inputPerMillionTokens: 6,
        benchmarkVersion: '2026-10-14',
      }),
    ]);
  });

  it('fails when a retained 1.0 score changes but accepts added rows', () => {
    const saved = buildLiveBenchSnapshot(input('70', null)).candidates;
    expect(() => buildLiveBenchSnapshot(input('71', saved))).toThrow(
      /LiveBench 1.0 retained rows changed/u,
    );
    const withoutLanguage = saved.filter(
      ({ benchmarkId }) => benchmarkId !== 'livebench-language',
    );
    expect(
      buildLiveBenchSnapshot(input('70', withoutLanguage)).validationReport,
    ).toMatch(/1 added since the last capture/u);
  });
});
