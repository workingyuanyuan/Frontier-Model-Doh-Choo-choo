import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { Dashboard } from './dashboard';
import { RadarChart } from './radar-chart';
import {
  buildAdvancedCostSeries,
  buildWeightedCostCurve,
  getRepresentativeRows,
} from '../lib/view-model';
import { productFixture } from '../test/fixture';

const benchmarkDimensions = {
  'terminal-bench-2-1': 'coding',
  frontiermath: 'math',
} as const;

const displaySet = {
  schemaVersion: 'display-set-v1' as const,
  benchmarkIds: ['terminal-bench-2-1'],
};

const dashboard = (product = productFixture) =>
  createElement(Dashboard, {
    product,
    benchmarkDimensions,
    displaySet,
  });

describe('Dashboard Redesign', () => {
  it('renders the current product version and all required product views', () => {
    const html = renderToStaticMarkup(dashboard());

    expect(html).toContain(`Version ${productFixture.versionId}`);
    expect(html).toContain('Leaderboard');
    expect(html).toContain('Quality vs. Cost');
    expect(html).toContain('Eight Dimensions');
    expect(html).toContain('role="switch"');
    expect(html).toContain('aria-label="Developer mode"');
    expect(html).toContain('aria-checked="false"');
  });

  it('displays concise copy and removes long paragraphs', () => {
    const html = renderToStaticMarkup(dashboard());
    expect(html).not.toContain('A source-backed view');
    expect(html).not.toContain('The main table shows');
    expect(html).toContain('Eight capability scores, cost, and evidence.');
    expect(html).toContain('One row per base model.');
  });

  it('renders the collapsed model visibility picker trigger', () => {
    const html = renderToStaticMarkup(dashboard());
    expect(html).toContain('Search models or profiles');
    expect(html).toContain('selected');
    expect(html).toContain('aria-expanded="false"');
  });

  it('does not render standalone Selected model section / profile-toolbar', () => {
    const html = renderToStaticMarkup(dashboard());
    expect(html).not.toContain('class="profile-toolbar"');
    expect(html).not.toContain('Selected model');
  });

  it('renders profile select inside Model column for multi-profile models', () => {
    const html = renderToStaticMarkup(dashboard());
    // The profile select is rendered inside the table
    const tableIndex = html.indexOf('<table');
    const tableEndIndex = html.indexOf('</table>');
    const selectIndex = html.indexOf('<select');
    expect(selectIndex).toBeGreaterThan(tableIndex);
    expect(selectIndex).toBeLessThan(tableEndIndex);
    expect(html).toContain('GPT-5.6 Sol');
  });

  it('renders the default weighted task-cost chart with explicit axes and source weights', () => {
    const html = renderToStaticMarkup(dashboard());

    expect(html).toContain('Weighted normalized task cost index');
    expect(html).toContain('Overall Score');
    expect(html).toContain('higher is better');
    expect(html).toContain('Artificial Analysis 16.7%');
    expect(html).toContain('LiveBench 16.7%');
    expect(html).toContain('DeepSWE 16.7%');
    expect(html).toContain('Frontier Code 16.7%');
    expect(html).toContain('ARC Prize 16.7%');
    expect(html).toContain('Vals AI 16.7%');
    expect(html).toContain('API standardized token prices are excluded');
    expect(html.match(/cost-curve-chart/g)).toHaveLength(1);
    expect(html).toContain('Show advanced effort curves');
    expect(html).toContain('aria-expanded="false"');
  });

  it('keeps default cost data scoped to the complete display-set projection', () => {
    const html = renderToStaticMarkup(dashboard());

    // Claude Fable 5 is present in the full fixture but lacks the display-set
    // terminal-bench cell, so it belongs only in developer-mode diagnostics.
    expect(html).not.toContain('Claude Fable 5');
  });

  it('keeps advanced curves on the full product while default costs stay scoped', () => {
    const modelId = 'anthropic-claude-fable-5';
    const profileId = 'anthropic-claude-fable-5-standard';
    const baseEvidence = productFixture.evidence[0]!;
    const baseCost = productFixture.costs.find(
      ({ costType }) => costType === 'MEASURED_TASK',
    )!;
    const sourceRows = [
      {
        sourceId: 'artificial-analysis',
        benchmarkId: 'artificial-analysis-intelligence-index',
        costType: 'MEASURED_TASK' as const,
        normalizedScore: null,
        rawScore: 75,
        inclusion: 'EXCLUDED' as const,
        exclusionReason: 'External composite is used for display only.',
      },
      {
        sourceId: 'deepswe',
        benchmarkId: 'deepswe-1-1',
        costType: 'AGENT_TASK' as const,
        normalizedScore: 75,
        rawScore: 75,
        inclusion: 'INCLUDED' as const,
        exclusionReason: null,
      },
      {
        sourceId: 'frontier-code',
        benchmarkId: 'frontier-code-1-1',
        costType: 'AGENT_TASK' as const,
        normalizedScore: 75,
        rawScore: 75,
        inclusion: 'INCLUDED' as const,
        exclusionReason: null,
      },
      {
        sourceId: 'arc-prize',
        benchmarkId: 'arc-agi',
        costType: 'AGENT_TASK' as const,
        normalizedScore: 75,
        rawScore: 75,
        inclusion: 'INCLUDED' as const,
        exclusionReason: null,
      },
    ] as const;
    const fullProduct = {
      ...productFixture,
      costs: [
        ...productFixture.costs,
        ...sourceRows.map((row, index) => ({
          ...baseCost,
          modelId,
          profileId,
          sourceId: row.sourceId,
          costType: row.costType,
          cost: 1 + index,
          performance: null,
          benchmarkId: row.benchmarkId,
          metricId: `e3-${row.sourceId}`,
          metricName: `E3 ${row.sourceId} task cost`,
          unit: 'USD_PER_TASK' as const,
        })),
      ],
      evidence: [
        ...productFixture.evidence,
        ...sourceRows.map((row, index) => ({
          ...baseEvidence,
          id: `e3-dashboard:${row.sourceId}:${index}`,
          sourceId: row.sourceId,
          benchmarkId: row.benchmarkId,
          inclusion: row.inclusion,
          exclusionReason: row.exclusionReason,
          model: {
            ...baseEvidence.model,
            canonicalModelId: modelId,
            profileId,
          },
          profile: {
            ...baseEvidence.profile,
            effort: 'max',
          },
          normalizedScore: row.normalizedScore,
          rawScore: row.rawScore,
        })),
      ],
    };
    const visibleProduct = {
      ...fullProduct,
      frontier: fullProduct.frontier.filter(
        ({ modelId: frontierModelId }) => frontierModelId !== modelId,
      ),
      profiles: fullProduct.profiles.filter(({ id }) => id !== profileId),
      leaderboard: fullProduct.leaderboard.filter(
        ({ profileId: rowProfileId }) => rowProfileId !== profileId,
      ),
      costs: fullProduct.costs.filter(
        ({ profileId: rowProfileId }) => rowProfileId !== profileId,
      ),
      evidence: fullProduct.evidence.filter(
        ({ model }) => model.profileId !== profileId,
      ),
    };

    expect(
      buildWeightedCostCurve(visibleProduct).some(
        ({ modelId: pointModelId }) => pointModelId === modelId,
      ),
    ).toBe(false);
    expect(
      buildAdvancedCostSeries(fullProduct).some(
        ({ modelId: seriesModelId }) => seriesModelId === modelId,
      ),
    ).toBe(true);
  });

  it('provides textual equivalents for SVG charts', () => {
    const html = renderToStaticMarkup(dashboard());

    expect(html).toContain('Quality vs. Cost chart data');
    expect(html).toContain('Eight Dimensions');
  });

  it('explains the frontier, ranked-model, and scored-profile counts', () => {
    const html = renderToStaticMarkup(dashboard());

    expect(html).toContain(
      'data-scope-metric="frontier"><dt>Frontier models</dt><dd>1</dd>',
    );
    expect(html).toContain(
      'data-scope-metric="ranked"><dt>Ranked models</dt><dd>1</dd>',
    );
    expect(html).toContain(
      'data-scope-metric="profiles"><dt>Scored Profiles</dt><dd>2</dd>',
    );
    expect(html).toContain(
      'data-scope-metric="pending"><dt>Awaiting direct evidence</dt><dd>0</dd>',
    );
  });

  it('renders dimension columns and category rows in the requested order using abbreviations', () => {
    const html = renderToStaticMarkup(dashboard());

    const headers = [
      'Overall',
      'AGT',
      'COD',
      'RSN',
      'MAT',
      'KNG',
      'LNG',
      'CTX',
      'IF',
    ];
    headers.slice(0, -1).forEach((header, index) => {
      expect(html.indexOf(`Sort by ${header}`)).toBeLessThan(
        html.indexOf(`Sort by ${headers[index + 1]}`),
      );
    });
  });

  it('keeps the radar series contract and abbreviated dimension bars', () => {
    const html = renderToStaticMarkup(dashboard());
    expect(html).toContain('data-max-series="3"');

    const abbreviations = [
      'AGT',
      'COD',
      'RSN',
      'MAT',
      'KNG',
      'LNG',
      'CTX',
      'IF',
    ];
    abbreviations.forEach((abbr) => {
      expect(html).toContain(abbr);
    });

    expect(html).not.toContain('bar-src');
    expect(html).not.toContain('src)');
  });

  it('orders Quality vs. Cost below Eight Dimensions', () => {
    const html = renderToStaticMarkup(dashboard());
    const eightDimensionsIndex = html.indexOf('Eight Dimensions');
    const qualityVsCostIndex = html.indexOf('Quality vs. Cost');
    expect(eightDimensionsIndex).toBeGreaterThan(0);
    expect(qualityVsCostIndex).toBeGreaterThan(eightDimensionsIndex);
  });

  it('groups model benchmarks into eight capability dimensions in the detail panel when expanded', () => {
    const html = renderToStaticMarkup(
      createElement(Dashboard, {
        product: productFixture,
        benchmarkDimensions,
        displaySet,
        initialExpandedModelIds: ['openai-gpt-5-6-sol'],
      }),
    );

    expect(html).toContain('data-model-detail="openai-gpt-5-6-sol"');
    expect(html).toContain('Model capability breakdown');
    expect(html.match(/data-dimension-group/g)).toHaveLength(8);
    expect(html).toContain('Agentic');
    expect(html).toContain('Instruction');
    expect(html).toContain('Terminal-Bench 2.1');
  });

  it('supports expanding TWO rows simultaneously with both breakdowns in the DOM at the same time', () => {
    const multiModelProduct = {
      ...productFixture,
      evidence: [
        ...productFixture.evidence,
        {
          ...productFixture.evidence[0]!,
          id: 'terminal:gemini',
          model: {
            rawName: 'google-gemini-3-1-pro-high',
            canonicalModelId: 'google-gemini-3-1-pro',
            profileId: 'google-gemini-3-1-pro-high',
          },
        },
      ],
    };

    const html = renderToStaticMarkup(
      createElement(Dashboard, {
        product: multiModelProduct,
        benchmarkDimensions,
        displaySet,
        initialExpandedModelIds: [
          'openai-gpt-5-6-sol',
          'google-gemini-3-1-pro',
        ],
      }),
    );

    // Both expansion rows exist in DOM
    expect(html).toContain('data-model-detail="openai-gpt-5-6-sol"');
    expect(html).toContain('data-model-detail="google-gemini-3-1-pro"');
    expect(html.match(/data-model-detail-panel/g)).toHaveLength(2);
    expect(html).toContain('GPT-5.6 Sol · max');
    expect(html).toContain('Gemini 3.1 Pro · high');
  });

  it('makes every Leaderboard column a sort control', () => {
    const html = renderToStaticMarkup(dashboard());
    const leaderboardSorts = html.match(/data-leaderboard-sort/g) ?? [];

    expect(leaderboardSorts.length).toBe(11);
    expect(html).toContain('aria-sort="descending"');
    expect(html).toContain('Sort by Model');
  });

  it('allows the active radar model to be removed without hard-coding a model', () => {
    const html = renderToStaticMarkup(dashboard());

    expect(html).toContain('Remove GPT-5.6 Sol · max from radar chart');
  });

  it('keeps an explicit N/A textual equivalent for incomplete radar data', () => {
    const incompleteProduct = {
      ...productFixture,
      leaderboard: [
        {
          ...productFixture.leaderboard[0]!,
          dimensions: productFixture.leaderboard[0]!.dimensions.map((d) =>
            d.dimension === 'context' ? { ...d, score: null } : d,
          ),
        },
      ],
    };
    const html = renderToStaticMarkup(
      createElement(RadarChart, {
        product: incompleteProduct,
        comparisonProduct: incompleteProduct,
      }),
    );

    expect(html).toContain('Missing values are shown as N/A');
    expect(html).toContain('CTX: N/A');
    expect(html).toContain('<polyline');
    expect(html).not.toContain('<polygon class="radar-area');
    expect(html).not.toContain('bar-src');
  });

  it('renders exactly one series in radar chart by default and it is the Overall rank 1 model', () => {
    const reps = getRepresentativeRows(productFixture);
    const rank1Rep = reps[0]!;
    expect(rank1Rep.profileId).toBe('openai-gpt-5-6-sol-max');

    const html = renderToStaticMarkup(dashboard());
    const chips = html.match(/class="legend-chip /g) ?? [];
    expect(chips).toHaveLength(1);
    expect(html).toContain('Remove GPT-5.6 Sol · max from radar chart');
  });

  it('exposes alternative profiles without extra ranked rows', () => {
    const html = renderToStaticMarkup(dashboard());
    const rankedRows = html.match(/data-ranked-row/g) ?? [];
    expect(rankedRows.length).toBe(1);
  });

  it('does not contain No Harness or unspecified effort text', () => {
    const html = renderToStaticMarkup(dashboard());
    expect(html).not.toContain('No Harness');
    expect(html).not.toContain('unspecified effort');
  });

  it('removes the closed picker dialog from the accessibility tree', () => {
    const html = renderToStaticMarkup(dashboard());
    expect(html).not.toContain('id="picker-popover"');
    expect(html).not.toContain('role="dialog"');

    const rankedRows = html.match(/data-ranked-row/g) ?? [];
    expect(rankedRows.length).toBe(1);
  });

  it('renders profile select inside the Model cell for multi-profile models', () => {
    const html = renderToStaticMarkup(dashboard());
    expect(html).toContain('profile-table-select');
    expect(html).toContain('name="profile-');
    expect(html).toContain('GPT-5.6 Sol');
  });

  it('filters an incomplete alternative profile and keeps N/A out of main markup', () => {
    const adversarialProduct = {
      ...productFixture,
      leaderboard: productFixture.leaderboard.map((row) =>
        row.profileId === 'openai-gpt-5-6-sol-high'
          ? {
              ...row,
              dimensions: row.dimensions.map((dimension, index) =>
                index === 7
                  ? { ...dimension, score: null, componentCount: 0 }
                  : dimension,
              ),
            }
          : row,
      ),
    };
    const html = renderToStaticMarkup(dashboard(adversarialProduct));

    expect(html).not.toContain('GPT-5.6 Sol · high');
    expect(html).not.toContain('value="openai-gpt-5-6-sol-high"');
    const mainMarkup = html.slice(0, html.indexOf('Eight Dimensions'));
    expect(mainMarkup).not.toContain('N/A');
  });

  it('sources initial dashboard selection and radar comparison choices from getRepresentativeRows', () => {
    const reps = getRepresentativeRows(productFixture);
    const firstRep = reps[0]!;
    const html = renderToStaticMarkup(dashboard());

    // The initial selected profile is the highest-ranked representative
    expect(firstRep.profileId).toBe('openai-gpt-5-6-sol-max');
    expect(html).toContain('Remove GPT-5.6 Sol · max from radar chart');

    // Available comparison options in radar come from getRepresentativeRows for visible models
    const visibleModelIds = new Set(
      reps
        .filter((r) => r.dimensions.every((d) => d.score !== null))
        .map((r) => r.modelId),
    );
    expect(visibleModelIds).toEqual(
      new Set(['openai-gpt-5-6-sol', 'google-gemini-3-1-pro']),
    );
    expect(html).not.toContain('Add model');
  });
});
