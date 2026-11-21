import { describe, expect, it } from 'vitest';
import { materializeMaxxBench } from './maxxbench-materializer.js';

const context = {
  evidenceId: `sha256:${'a'.repeat(64)}`,
  observedAt: '2026-11-09T00:00:00Z',
  visualRowCount: 1,
};
const model = {
  id: 'astra',
  name: 'GPT-6 Astra',
  effort: 'xhigh',
  maxxBenchScore: 50,
  averageCost: 2,
  passed: 1,
  attempts: 2,
  taskCount: 1,
  evaluations: 2,
};
const trials = [
  {
    id: 'run-1',
    modelId: 'astra',
    taskId: 'task-1',
    outcome: 'passed',
    cost: 1,
  },
  {
    id: 'run-2',
    modelId: 'astra',
    taskId: 'task-1',
    outcome: 'failed',
    cost: 3,
  },
];
function encode(value: unknown): unknown {
  if (Array.isArray(value)) return [1, value.map(encode)];
  if (value !== null && typeof value === 'object') {
    return [
      0,
      Object.fromEntries(
        Object.entries(value).map(([key, item]) => [key, encode(item)]),
      ),
    ];
  }
  return [0, value];
}
function page(
  options: {
    model?: object;
    trials?: object[];
    completionData?: object;
    displayedScore?: number;
    displayedCost?: number;
    hidden?: boolean;
  } = {},
) {
  const models = [{ ...model, ...options.model }];
  if (options.hidden)
    models.push({ ...model, id: 'hidden', name: 'Hidden model' });
  const props = JSON.stringify({
    models: encode(models),
    ...(options.completionData
      ? { completionData: encode(JSON.stringify(options.completionData)) }
      : { trials: encode(options.trials ?? trials) }),
  }).replace(/"/gu, '&quot;');
  return `<astro-island component-url="/_astro/BenchmarkLeaderboard.test.js" props="${props}"></astro-island>
    <table><tbody><tr id="score-astra"><th><button aria-label="Pin GPT-6 Astra, xhigh effort"></button></th>
    <td class="number score-cell">${options.displayedScore ?? 50}<span>%</span></td>
    <td><span>Cost:</span> $${(options.displayedCost ?? 2).toFixed(2)}</td></tr></tbody></table>`;
}

describe('MaxxBench acquisition', () => {
  it('materializes visible rows and mean costs with attempt evidence', () => {
    const result = materializeMaxxBench(page({ hidden: true }), context);
    expect(result.candidates).toHaveLength(1);
    expect(result.costs).toHaveLength(1);
    expect(result.candidates[0]).toMatchObject({
      benchmarkId: 'maxxbench',
      benchmarkVersion: null,
      normalizedScore: 50,
      sourceRole: 'ORGANIZER',
      model: { canonicalModelId: 'openai-gpt-6-astra' },
      profile: { effort: 'xhigh', attempts: 2, harness: null, tools: null },
    });
    expect(result.costs[0]).toMatchObject({
      cost: 2,
      costType: 'AGENT_TASK',
      unit: 'USD_PER_TASK',
      benchmarkVersion: null,
    });
    expect(result.validationReport).toContain('Hidden model');
  });
  it('checks scores and costs against both rendered text and trials', () => {
    expect(() =>
      materializeMaxxBench(page({ displayedScore: 51 }), context),
    ).toThrow('visible identity or score');
    expect(() =>
      materializeMaxxBench(page({ displayedCost: 3 }), context),
    ).toThrow('mean attempt cost');
    expect(() =>
      materializeMaxxBench(page({ trials: [trials[0]!] }), context),
    ).toThrow('trial totals');
    expect(() =>
      materializeMaxxBench(
        page({ trials: [trials[0]!, { ...trials[1], cost: 4 }] }),
        context,
      ),
    ).toThrow('mean attempt cost');
    expect(() =>
      materializeMaxxBench(page({ model: { maxxBenchScore: 51 } }), context),
    ).toThrow('Invalid MaxxBench');
  });
  it('validates model report labels and keeps baseline scores separate', () => {
    const reportPage = (displayedScore: number) =>
      page({ displayedScore })
        .replace(
          'aria-label="Pin GPT-6 Astra, xhigh effort"',
          'aria-label="View GPT-6 Astra, xhigh effort model report"',
        )
        .replace(
          '<td class="number score-cell">',
          '<td class="bar-cell">DeepSWE 91.2%</td><td class="number score-cell">',
        );
    expect(
      materializeMaxxBench(reportPage(50), context).candidates[0],
    ).toMatchObject({ normalizedScore: 50 });
    expect(
      materializeMaxxBench(
        reportPage(50).replace(
          'effort model report"',
          'effort model report; released after MaxxBench launched"',
        ),
        context,
      ).candidates[0],
    ).toMatchObject({ normalizedScore: 50 });
    expect(() => materializeMaxxBench(reportPage(51), context)).toThrow(
      'visible identity or score',
    );
  });
  it('checks completionData curves when the page no longer embeds trials', () => {
    // One passed attempt costing 1 of two attempts averaging 2.
    const curves = (cost: number[], steps: number[] = [40, 0.5]) => ({
      averageCost: [['astra', 1, cost]],
      outputTokens: [['astra', 1, [1000, 0.5]]],
      agentSteps: [['astra', 1, steps]],
    });
    const result = materializeMaxxBench(
      page({ completionData: curves([1, 0.5]) }),
      context,
    );
    expect(result.costs[0]).toMatchObject({ cost: 2 });
    expect(result.validationReport).toContain('completionData');
    expect(() =>
      materializeMaxxBench(page({ completionData: curves([1, 1]) }), context),
    ).toThrow('completion curve disagrees');
    expect(() =>
      materializeMaxxBench(
        page({ completionData: curves([1, 0.5], [40, 0.5, 41, 1]) }),
        context,
      ),
    ).toThrow('completion curve disagrees');
    // Passed attempts alone cost more than all attempts at the stated mean.
    expect(() =>
      materializeMaxxBench(page({ completionData: curves([5, 0.5]) }), context),
    ).toThrow('mean attempt cost');
  });
  it('requires every supplied curve to cover the model and an exact mean when all attempts passed', () => {
    expect(() =>
      materializeMaxxBench(
        page({
          completionData: {
            averageCost: [['astra', 1, [1, 0.5]]],
            outputTokens: [],
          },
        }),
        context,
      ),
    ).toThrow('completion curve missing');
    const allPassed = {
      passed: 2,
      attempts: 2,
      taskCount: 1,
      maxxBenchScore: 100,
    };
    const run = (costs: number[]) =>
      materializeMaxxBench(
        page({
          model: allPassed,
          displayedScore: 100,
          completionData: { averageCost: [['astra', 1, costs]] },
        }),
        context,
      );
    expect(run([1, 0.5, 3, 1]).costs[0]).toMatchObject({ cost: 2 });
    expect(() => run([1, 0.5, 1, 1])).toThrow('mean attempt cost');
  });
  it('lets attempts with equal values share one curve point', () => {
    const model = { passed: 2, attempts: 4, taskCount: 2, maxxBenchScore: 50 };
    const curve = [['astra', 2, [1, 1]]];
    expect(
      materializeMaxxBench(
        page({
          model,
          completionData: { averageCost: curve, agentSteps: curve },
        }),
        context,
      ).candidates,
    ).toHaveLength(1);
  });
  it('rejects missing, duplicate and unsupported configurations', () => {
    expect(() =>
      materializeMaxxBench(page(), { ...context, visualRowCount: 2 }),
    ).toThrow('count mismatch');
    expect(() =>
      materializeMaxxBench(page({ trials: [trials[0]!, trials[0]!] }), context),
    ).toThrow('Duplicate');
    expect(() =>
      materializeMaxxBench(page({ model: { effort: 'unknown' } }), context),
    ).toThrow('Invalid MaxxBench');
    expect(() =>
      materializeMaxxBench(
        '<script>throw new Error("never execute source")</script>',
        context,
      ),
    ).toThrow('Expected one');
  });
});
