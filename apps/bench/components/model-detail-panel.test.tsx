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

const displaySet = {
  schemaVersion: 'display-set-v1' as const,
  benchmarkIds: [
    'terminal-bench-2-1',
    'frontiermath',
    'gpqa-diamond',
    'livebench-language',
  ],
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
      displaySet:
        props.displaySet !== undefined ? props.displaySet : displaySet,
    }),
  );
};

describe('ModelDetailPanel (Task E1)', () => {
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
});
