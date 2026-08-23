import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import {
  ModelDetailPanel,
  type ModelDetailPanelProps,
} from './model-detail-panel';
import { productFixture } from '../test/fixture';

const benchmarkDimensions = {
  'terminal-bench-2-1': 'coding' as const,
  frontiermath: 'math' as const,
  'gpqa-diamond': 'reasoning' as const,
  'livebench-language': 'language' as const,
};

const preset = {
  id: 'fixture-preset',
  targetModelCount: 2,
  requireAllSources: false,
  benchmarkIds: [
    'terminal-bench-2-1',
    'frontiermath',
    'gpqa-diamond',
    'livebench-language',
  ],
  leaderboard: [],
};

const renderPanel = (props: Partial<ModelDetailPanelProps> = {}) => {
  const profile =
    props.profile ??
    productFixture.profiles.find((p) => p.id === 'openai-gpt-5-6-sol-max')!;
  const selectedResult =
    props.selectedResult !== undefined
      ? props.selectedResult
      : productFixture.leaderboard.find((r) => r.profileId === profile.id);

  return renderToStaticMarkup(
    createElement(ModelDetailPanel, {
      profile,
      product: props.product ?? productFixture,
      benchmarkDimensions: props.benchmarkDimensions ?? benchmarkDimensions,
      selectedResult,
      preset: props.preset !== undefined ? props.preset : preset,
    }),
  );
};

describe('ModelDetailPanel (Task E1)', () => {
  it('marks a measurement the preset does not score instead of listing it like one', () => {
    // The reported case: GPT-5.6 Sol carried an AA `ifbench` row whose primary
    // dimension is instruction while the preset scored only LiveBench's. The
    // card therefore showed two children under a number computed from one, and
    // nothing on the row said which. The score was right; the row was not.
    const html = renderPanel({
      benchmarkDimensions: {
        ...benchmarkDimensions,
        'terminal-bench-2-1': 'coding' as const,
        frontiermath: 'math' as const,
      },
      preset: {
        ...preset,
        // Drop one benchmark the profile has evidence for. It must stay
        // visible -- the measurement is real -- but must not read as scored.
        benchmarkIds: preset.benchmarkIds.filter(
          (id) => id !== 'terminal-bench-2-1',
        ),
      },
    });

    expect(html).toContain('data-benchmark-id="terminal-bench-2-1"');
    expect(html).toContain('not scored here');
    expect(html).toContain('data-outside-basis="true"');

    // A benchmark the preset does score carries no such marker.
    const scoredRow = html.slice(
      html.indexOf('data-benchmark-id="frontiermath"'),
    );
    expect(scoredRow.slice(0, scoredRow.indexOf('</li>'))).not.toContain(
      'not scored here',
    );
  });

  it('renders complete capability breakdown grouped by dimension for main leaderboard model', () => {
    const html = renderPanel();

    // Contains container data attribute
    expect(html).toContain('data-model-detail-panel');

    // Contains model name and overall score badge
    expect(html).toContain('GPT-5.6 Sol · max');
    expect(html).toContain('Overall 88.1');

    // Groups by all 8 dimensions
    expect(html.match(/data-dimension-group/g)).toHaveLength(8);
    expect(html).toContain('Coding');
    expect(html).toContain('Math');
    expect(html).toContain('Reasoning');

    // Lists benchmark
    expect(html).toContain('Terminal-Bench 2.1');
    expect(html).toContain('FrontierMath');
  });

  it('serves developer mode for partial/excluded models using the EXACT same component and showing missing cells as empty', () => {
    // Model with partial/missing dimensions
    const devProfile = productFixture.profiles.find(
      (p) => p.id === 'google-gemini-3-1-pro-high',
    )!;

    // In developer mode, overall score and missing dimension scores are null
    const devResult = {
      overallScore: null,
      dimensions: [
        { dimension: 'coding' as const, score: 70.0 },
        { dimension: 'math' as const, score: null },
        { dimension: 'reasoning' as const, score: null },
        { dimension: 'knowledge' as const, score: null },
        { dimension: 'language' as const, score: null },
        { dimension: 'instruction' as const, score: null },
        { dimension: 'agentic' as const, score: null },
        { dimension: 'context' as const, score: null },
      ],
    };

    const html = renderPanel({
      profile: devProfile,
      selectedResult: devResult,
    });

    // Same component data attribute
    expect(html).toContain('data-model-detail-panel');
    expect(html).toContain('Gemini 3.1 Pro · high');
    expect(html).toContain('Overall —');

    // Missing benchmark cells display empty/dash
    expect(html).toContain('data-benchmark-id="frontiermath"');
    expect(html).toContain('is-missing');
    expect(html).toContain('—');
  });

  it('provides interactive provenance markup with source URL, rawScore, locator, and retrievedAt', () => {
    const profile = productFixture.profiles.find(
      (p) => p.id === 'openai-gpt-5-6-sol-max',
    )!;
    const html = renderPanel({ profile });

    expect(html).toContain('provenance-toggle-btn');
    expect(html).toContain(
      'aria-label="View provenance for Terminal-Bench 2.1"',
    );
  });

  it('shows the selected AutomationBench contributor instead of a duplicate unlabelled effort row', () => {
    const profile = productFixture.profiles.find(
      (p) => p.id === 'openai-gpt-5-6-sol-max',
    )!;
    const explicitMax = {
      ...productFixture.evidence[0]!,
      id: 'zapier:sol:max',
      sourceId: 'zapier-automationbench',
      benchmarkId: 'automationbench',
      normalizedScore: 19.63,
      rawScore: 19.63,
      metric: {
        id: 'task-completed-correctly',
        name: 'task_completed_correctly',
        unit: 'percent',
        higherIsBetter: true,
      },
    };
    const unlabelled = {
      ...explicitMax,
      id: 'zapier:sol:unlabelled',
      normalizedScore: 2.89,
      rawScore: 2.89,
    };
    const product = {
      ...productFixture,
      evidence: [...productFixture.evidence, explicitMax, unlabelled],
    };
    const selected = productFixture.leaderboard.find(
      (row) => row.profileId === profile.id,
    )!;
    const html = renderPanel({
      profile,
      product,
      benchmarkDimensions: {
        ...benchmarkDimensions,
        automationbench: 'agentic',
      },
      selectedResult: {
        ...selected,
        evidenceResultIds: [...selected.evidenceResultIds, explicitMax.id],
      },
    });

    expect(html).toContain('AutomationBench');
    expect(html).toContain('(zapier)');
    expect(html).toContain('19.6');
    expect(html).not.toContain('2.9');
  });
});
