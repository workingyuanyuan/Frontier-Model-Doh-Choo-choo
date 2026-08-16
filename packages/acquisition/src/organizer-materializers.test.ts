import { describe, expect, it } from 'vitest';

import {
  materializeArcPrize,
  materializeLechWriting,
  materializeOsworld,
  materializeScaleHle,
  materializeZapierAutomationBench,
} from './organizer-materializers.js';

const context = (
  sourceId: string,
  method: 'API_RESPONSE' | 'DOM' | 'EMBEDDED_JSON' | 'EXPORT',
) => ({
  sourceId,
  sourceUrl: `https://example.test/${sourceId}`,
  evidenceId:
    'sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  observedAt: '2026-08-13T00:00:00.000Z',
  method,
});

describe('official organizer materializers', () => {
  it('joins ARC Prize evaluations to model metadata and keeps both evidence references', () => {
    const result = materializeArcPrize(
      JSON.stringify([
        {
          datasetId: 'v3_Semi_Private',
          modelId: 'gpt',
          score: 0.42,
          display: true,
        },
        { datasetId: 'v3_Public', modelId: 'gpt', score: 0.99, display: true },
        {
          datasetId: 'v3_Semi_Private',
          modelId: 'hidden',
          score: 0.8,
          display: false,
        },
      ]),
      JSON.stringify([
        {
          id: 'gpt',
          displayName: 'GPT-5.6 Sol',
          modelReleaseDate: '2026-07-09',
        },
      ]),
      context('arc-prize', 'API_RESPONSE'),
      {
        ...context('arc-prize', 'API_RESPONSE'),
        evidenceId:
          'sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
      },
    );

    expect(result.extractedRows).toBe(1);
    expect(result.candidates[0]).toMatchObject({
      benchmarkId: 'arc-agi',
      normalizedScore: 42,
      model: { canonicalModelId: 'openai-gpt-5-6-sol' },
      sourcePublishedAt: '2026-07-09T00:00:00.000Z',
    });
    expect(result.candidates[0]?.evidenceIds).toHaveLength(2);
  });

  it('extracts the Scale HLE performance table between visible boundaries', () => {
    const html = `
      <h2>Performance Comparison</h2>
      <div>1</div><div>GPT-5.6 Sol</div><div>31.25</div><div>±</div><div>1.0</div><div>Calib Err:</div><div>0.1</div>
      <div>2</div><div>Claude Fable 5</div><div>30.50</div><div>±</div><div>1.2</div><div>Calib Err:</div><div>0.2</div>
      <h2>Legend</h2>
    `;
    const result = materializeScaleHle(html, context('scale-hle', 'DOM'));

    expect(result.extractedRows).toBe(2);
    expect(result.candidates.map(({ rawScore }) => rawScore)).toEqual([
      31.25, 30.5,
    ]);
    expect(result.candidates[0]?.benchmarkVersion).toBe('final-2500');
  });

  it('materializes all 83 Zapier rows and preserves API-mode cost rows', () => {
    const rows = Array.from({ length: 83 }, (_, index) => {
      const rank = index + 1;
      return `[${rank},\`Model ${rank}\`,\`${(10 + index / 10).toFixed(1)}%\`,\`$${(0.1 + index / 100).toFixed(2)}\`]`;
    }).join(',');
    const result = materializeZapierAutomationBench(
      `z=\`1.0.6\`,B=[[${rows}]],V=[]`,
      context('zapier-automationbench', 'EMBEDDED_JSON'),
    );

    expect(result.extractedRows).toBe(83);
    expect(result.expectedRows).toBe(83);
    expect(result.candidates).toHaveLength(83);
    expect(result.costs).toHaveLength(83);
    expect(new Set(result.candidates.map(({ id }) => id)).size).toBe(83);
    expect(result.candidates[0]).toMatchObject({
      benchmarkVersion: '1.0.6',
      metric: { id: 'task-completed-correctly' },
    });
  });

  it('filters OSWorld to official default-step rows while retaining effort and tool provenance', () => {
    const result = materializeOsworld(
      JSON.stringify({
        benchmarkVersion: 'osworld-2.0',
        taskVersion: '2026.06.24',
        updatedAt: '2026-06-25',
        defaultStepBudget: 100,
        results: [
          {
            model: 'Claude Opus 4.8',
            reasoning: 'max',
            toolSetting: 'official-browser',
            stepBudget: 100,
            binaryAccuracy: 20.6,
            estimatedCostUsd: 1.2,
            official: true,
          },
          {
            model: 'GPT-5.5',
            reasoning: 'xhigh',
            toolSetting: 'official-browser',
            stepBudget: 80,
            binaryAccuracy: 19,
            estimatedCostUsd: null,
            official: true,
          },
          {
            model: 'Unverified model',
            reasoning: null,
            toolSetting: null,
            stepBudget: 100,
            binaryAccuracy: 99,
            estimatedCostUsd: null,
            official: false,
          },
        ],
      }),
      context('osworld', 'API_RESPONSE'),
    );

    expect(result.extractedRows).toBe(1);
    expect(result.candidates[0]).toMatchObject({
      benchmarkVersion: 'osworld-2.0-2026.06.24-steps-100',
      profile: { effort: 'max', harness: 'official-browser' },
      sourcePublishedAt: '2026-06-25T00:00:00.000Z',
    });
    expect(result.costs).toHaveLength(1);
  });

  it('reads the current Lech Writing pairwise table and ignores archived sections', () => {
    const markdown = `
### Leaderboard
| Rank | Model | Comparison score | Estimated win chance | Uncertainty range |
|-----:|:------|-----------------:|---------------------:|------------------:|
| 1 | Claude Fable 5 (high)§ | 3.3 | 91% | 3.2 to 3.4 |
| 2 | GPT-5.6 Sol (xhigh) | 2.9 | 87% | 2.8 to 3.0 |

* 2 rated models

### Coverage Note
Archived absolute ratings are not part of the current table.
`;
    const result = materializeLechWriting(
      markdown,
      context('lech-writing', 'EXPORT'),
    );

    expect(result.extractedRows).toBe(2);
    expect(result.expectedRows).toBe(2);
    expect(result.candidates[0]).toMatchObject({
      benchmarkId: 'lech-mazur-writing',
      normalizedScore: 91,
      model: { canonicalModelId: 'anthropic-claude-fable-5' },
    });
  });
});
