import { describe, expect, it } from 'vitest';

import {
  materializeArtificialAnalysisCosts,
  materializeDeepSweCosts,
  materializeLiveBenchCosts,
} from './pricing-materializers.js';

const context = {
  sourceUrl: 'https://example.com/data',
  evidenceId:
    'sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  observedAt: '2026-08-12T00:00:00.000Z',
  method: 'EXPORT' as const,
};

describe('pricing materializers', () => {
  it('extracts Artificial Analysis task cost with canonical identity', () => {
    const rows = materializeArtificialAnalysisCosts(
      '{"label":"GPT-5.6 Sol (max)","costPerIntelligenceIndexTask":1.0373,"detailsUrl":"/models/gpt-5-6-sol"}',
      context,
    );
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      model: { profileId: 'openai-gpt-5-6-sol-max' },
      metricId: 'cost-per-intelligence-index-task',
      cost: 1.0373,
    });
  });

  it('keeps DeepSWE effort and raw harness provenance', () => {
    const rows = materializeDeepSweCosts(
      JSON.stringify({
        rows: [
          {
            model: 'gpt-5-6-sol',
            reasoning_effort: 'high',
            harness: 'mini-swe-agent',
            config: 'sol_high',
            mean_cost_usd: 3.47,
          },
        ],
      }),
      context,
    );
    expect(rows[0]).toMatchObject({
      model: { profileId: 'openai-gpt-5-6-sol-high' },
      profile: { effort: 'high', harness: 'mini-swe-agent' },
      costType: 'AGENT_TASK',
    });
  });

  it('keeps an unlabelled DeepSWE cost null instead of defaulting to max', () => {
    const rows = materializeDeepSweCosts(
      JSON.stringify({
        rows: [
          {
            model: 'deepseek-v4-pro',
            reasoning_effort: null,
            harness: 'mini-swe-agent',
            config: 'deepseek_default',
            mean_cost_usd: 0.24,
          },
        ],
      }),
      context,
    );
    expect(rows[0]).toMatchObject({
      model: {
        canonicalModelId: 'deepseek-deepseek-v4-pro',
        profileId: null,
      },
      profile: { effort: null },
    });
  });

  it('emits separate LiveBench API and successful-task costs', () => {
    const rows = materializeLiveBenchCosts(
      'model,input_price_per_million,output_price_per_million,cost_per_successful_task\n' +
        'gpt-5.6-sol-max,5,30,0.5070\n',
      context,
    );
    expect(rows.map(({ costType }) => costType)).toEqual([
      'API_STANDARDIZED',
      'MEASURED_TASK',
    ]);
    expect(rows[1]?.metricId).toBe('cost-per-successful-task');
  });

  it('omits superseded bare DeepSeek builds from LiveBench costs', () => {
    const rows = materializeLiveBenchCosts(
      'model,input_price_per_million,output_price_per_million,cost_per_successful_task\n' +
        'deepseek-v4-flash,0.14,0.28,0.0161\n' +
        'deepseek-v4-pro,0.435,0.87,0.0498\n' +
        'gpt-5.6-sol-max,5,30,0.5070\n',
      context,
    );

    expect(rows).toHaveLength(2);
    expect(rows.map(({ model }) => model.rawName)).toEqual([
      'gpt-5.6-sol-max',
      'gpt-5.6-sol-max',
    ]);
  });
});
