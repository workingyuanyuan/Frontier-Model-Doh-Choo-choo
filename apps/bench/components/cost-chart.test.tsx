import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { AdvancedCostPlot, CostChart, DefaultCostPlot } from './cost-chart';
import {
  buildWeightedCostCurve,
  type AdvancedCostSeries,
  type WeightedCostPoint,
} from '../lib/view-model';
import { productFixture } from '../test/fixture';

const sampleAdvancedSeries: AdvancedCostSeries[] = [
  {
    seriesId: 'anthropic-claude-fable-5:deepswe',
    modelId: 'anthropic-claude-fable-5',
    providerId: 'anthropic',
    displayName: 'Claude Fable 5',
    sourceId: 'deepswe',
    points: [
      {
        profileId: 'anthropic-claude-fable-5-standard',
        modelId: 'anthropic-claude-fable-5',
        providerId: 'anthropic',
        displayName: 'Claude Fable 5',
        effort: 'standard',
        cost: 2.36,
        score: 85.6,
        sourceId: 'deepswe',
        benchmarkId: 'deepswe',
        isDefaultEffort: true,
        scoreBasis: 'DEEPSWE_1_1',
        scoreBenchmarkId: 'deepswe-1-1',
        metricName: 'Mean agent task cost',
        sourceUrl: 'https://deepswe.datacurve.ai/',
        evidenceIds: [],
      },
      {
        profileId: 'anthropic-claude-fable-5-high',
        modelId: 'anthropic-claude-fable-5',
        providerId: 'anthropic',
        displayName: 'Claude Fable 5',
        effort: 'high',
        cost: 3.45,
        score: 89.2,
        sourceId: 'deepswe',
        benchmarkId: 'deepswe',
        isDefaultEffort: false,
        scoreBasis: 'DEEPSWE_1_1',
        scoreBenchmarkId: 'deepswe-1-1',
        metricName: 'Mean agent task cost',
        sourceUrl: 'https://deepswe.datacurve.ai/',
        evidenceIds: [],
      },
    ],
  },
];

describe('CostChart Dynamic Scaling and Hover Cards (Tasks J3 & K1)', () => {
  const defaultPoints = buildWeightedCostCurve(productFixture);

  describe('DefaultCostPlot', () => {
    it('does not render hover card initially and removes native <title> elements from points', () => {
      const html = renderToStaticMarkup(
        createElement(DefaultCostPlot, {
          points: defaultPoints,
          selectedProfileId: 'openai-gpt-5-6-sol-max',
        }),
      );

      // No hover card rendered initially
      expect(html).not.toContain('cost-hover-card');

      // No <title> tag inside <circle> elements
      expect(html).not.toContain('<title>');

      // Points are focusable and retain full aria-label accessibility information
      expect(html).toContain('class="cost-point');
      expect(html).toContain('tabindex="0"');
      expect(html).toContain('aria-label=');
      expect(html).toContain('GPT-5.6 Sol');
      expect(html).toContain('Overall Score 88.1');
      expect(html).toContain('Weighted normalized task cost');
    });

    it('renders axis titles and SVG aria-label with dynamic data range instead of hardcoded 0-100', () => {
      const spreadPoints: WeightedCostPoint[] = [
        {
          modelId: 'model-a',
          profileId: 'model-a-p',
          providerId: 'openai',
          displayName: 'Model A',
          normalizedCost: 18.2,
          performance: 61.2,
          sourceCosts: [],
          sourceCount: 1,
          sourceWeight: 0.25,
          selectedProfileIds: ['model-a-p'],
        },
        {
          modelId: 'model-b',
          profileId: 'model-b-p',
          providerId: 'anthropic',
          displayName: 'Model B',
          normalizedCost: 92.5,
          performance: 72.8,
          sourceCosts: [],
          sourceCount: 1,
          sourceWeight: 0.25,
          selectedProfileIds: ['model-b-p'],
        },
      ];

      const html = renderToStaticMarkup(
        createElement(DefaultCostPlot, {
          points: spreadPoints,
        }),
      );

      // Axis titles disclose real data domain snapped to clean bounds (e.g. 60–75 for 61.2–72.8)
      expect(html).toContain('Overall Score (60–75, higher is better)');
      expect(html).toContain(
        'Weighted normalized task cost index (0–100, lower is better)',
      );
      expect(html).not.toContain('Overall Score (0–100, higher is better)');

      // SVG aria-label discloses the dynamic domains
      expect(html).toContain(
        'aria-label="Overall Score (60–75) versus weighted normalized task cost (0–100)',
      );
    });

    it('renders hover card with all metrics when a point is active (hover / focus)', () => {
      const targetPoint = defaultPoints[0]!;
      const html = renderToStaticMarkup(
        createElement(DefaultCostPlot, {
          points: defaultPoints,
          selectedProfileId: 'openai-gpt-5-6-sol-max',
          initialActivePoint: targetPoint,
        }),
      );

      expect(html).toContain('cost-hover-card');
      expect(html).toContain('role="tooltip"');
      expect(html).toContain('aria-hidden="true"');
      expect(html).toContain(targetPoint.displayName);
      expect(html).toContain('Overall Score:');
      expect(html).toContain(targetPoint.performance.toFixed(1));
      expect(html).toContain('Weighted cost index:');
      expect(html).toContain(targetPoint.normalizedCost.toFixed(1));

      // Contains per-source cost summary
      for (const source of targetPoint.sourceCosts) {
        expect(html).toContain(source.profileId);
        expect(html).toContain(`$${source.cost.toFixed(3)}`);
      }
    });

    it('disappears when point is blurred or mouse leaves (active point is null)', () => {
      const html = renderToStaticMarkup(
        createElement(DefaultCostPlot, {
          points: defaultPoints,
          selectedProfileId: 'openai-gpt-5-6-sol-max',
          initialActivePoint: null,
        }),
      );

      expect(html).not.toContain('cost-hover-card');
    });

    it('positions and flips hover card correctly near edges with dynamic domain', () => {
      const originPoint: WeightedCostPoint = {
        modelId: 'test-origin-model',
        profileId: 'test-origin-profile',
        providerId: 'openai',
        displayName: 'Origin Model',
        normalizedCost: 10,
        performance: 10,
        sourceCosts: [],
        sourceCount: 1,
        sourceWeight: 0.25,
        selectedProfileIds: ['test-origin-profile'],
      };
      const rightEdgePoint: WeightedCostPoint = {
        modelId: 'test-edge-model',
        profileId: 'test-edge-profile',
        providerId: 'openai',
        displayName: 'Edge Model',
        normalizedCost: 95, // Near right edge: x > 340
        performance: 95, // Near top edge: y < 110
        sourceCosts: [],
        sourceCount: 1,
        sourceWeight: 0.25,
        selectedProfileIds: ['test-edge-profile'],
      };

      const html = renderToStaticMarkup(
        createElement(DefaultCostPlot, {
          points: [originPoint, rightEdgePoint],
          selectedProfileId: 'test-edge-profile',
          initialActivePoint: rightEdgePoint,
        }),
      );

      // Card flips left and down near top-right edge
      expect(html).toContain('translate(calc(-100% - 12px), 6px)');
    });
  });

  describe('AdvancedCostPlot', () => {
    it('does not render hover card initially and removes native <title> elements from points', () => {
      const html = renderToStaticMarkup(
        createElement(AdvancedCostPlot, {
          series: sampleAdvancedSeries,
          selectedProfileId: 'anthropic-claude-fable-5-standard',
        }),
      );

      expect(html).not.toContain('cost-hover-card');
      expect(html).not.toContain('<title>');
      expect(html).toContain('class="advanced-cost-point');
      expect(html).toContain('tabindex="0"');
      expect(html).toContain('aria-label=');
    });

    it('renders dynamic Y axis title and aria-label matching source scores instead of 0-100', () => {
      const html = renderToStaticMarkup(
        createElement(AdvancedCostPlot, {
          series: sampleAdvancedSeries,
        }),
      );

      // For scores 85.6 and 89.2, snapped domain is 85–90
      expect(html).toContain('Source score (85–90, higher is better)');
      expect(html).not.toContain('Source score (0–100, higher is better)');
      expect(html).toContain(
        'aria-label="Source-local score (85–90) versus USD per task cost',
      );
    });

    it('renders hover card with all metrics when an advanced point is active (hover / focus)', () => {
      const firstSeries = sampleAdvancedSeries[0]!;
      const firstPoint = firstSeries.points[0]!;

      const html = renderToStaticMarkup(
        createElement(AdvancedCostPlot, {
          series: sampleAdvancedSeries,
          selectedProfileId: 'anthropic-claude-fable-5-standard',
          initialActivePoint: { series: firstSeries, point: firstPoint },
        }),
      );

      expect(html).toContain('cost-hover-card');
      expect(html).toContain('role="tooltip"');
      expect(html).toContain('aria-hidden="true"');
      expect(html).toContain(firstSeries.displayName);
      expect(html).toContain('DeepSWE');
      expect(html).toContain('default effort');
      expect(html).toContain('Source score:');
      expect(html).toContain(firstPoint.score.toFixed(1));
      expect(html).toContain('Cost:');
      expect(html).toContain(`$${firstPoint.cost.toFixed(3)} per task`);
    });

    it('renders native checkbox for each series in legend checked by default with accessible label', () => {
      const html = renderToStaticMarkup(
        createElement(AdvancedCostPlot, {
          series: sampleAdvancedSeries,
        }),
      );

      expect(html).toContain('type="checkbox"');
      expect(html).toContain('checked=""');
      expect(html).toContain('class="cost-series-checkbox"');
      expect(html).toContain('class="cost-legend-checkbox-label"');
      expect(html).toContain(
        'for="series-toggle-anthropic-claude-fable-5-deepswe"',
      );
      expect(html).toContain('Claude Fable 5 · DeepSWE');
    });

    it('recalculates X and Y domains and excludes points when a series is hidden', () => {
      const multiSeries: AdvancedCostSeries[] = [
        sampleAdvancedSeries[0]!,
        {
          seriesId: 'openai-gpt-5-6-sol:deepswe',
          modelId: 'openai-gpt-5-6-sol',
          providerId: 'openai',
          displayName: 'GPT-5.6 Sol',
          sourceId: 'deepswe',
          points: [
            {
              profileId: 'openai-gpt-5-6-sol-high',
              modelId: 'openai-gpt-5-6-sol',
              providerId: 'openai',
              displayName: 'GPT-5.6 Sol',
              effort: 'high',
              cost: 15.8,
              score: 95.0,
              sourceId: 'deepswe',
              benchmarkId: 'deepswe',
              isDefaultEffort: false,
              scoreBasis: 'DEEPSWE_1_1',
              scoreBenchmarkId: 'deepswe-1-1',
              metricName: 'Mean agent task cost',
              sourceUrl: 'https://deepswe.datacurve.ai/',
              evidenceIds: [],
            },
          ],
        },
      ];

      // With both series visible, domain includes the expensive GPT-5.6 Sol ($15.80)
      const allVisibleHtml = renderToStaticMarkup(
        createElement(AdvancedCostPlot, {
          series: multiSeries,
        }),
      );
      expect(allVisibleHtml).toContain('GPT-5.6 Sol');
      expect(allVisibleHtml).toContain(
        'Source score (85–95, higher is better)',
      );
      // Domain with $15.80 max expands to 0-20
      expect(allVisibleHtml).toContain(
        'Source task cost ($0–$20, lower is better)',
      );

      // Hide the expensive GPT-5.6 Sol series
      const filteredHtml = renderToStaticMarkup(
        createElement(AdvancedCostPlot, {
          series: multiSeries,
          initialHiddenSeriesIds: ['openai-gpt-5-6-sol:deepswe'],
        }),
      );

      // Points from the hidden series are excluded from SVG
      expect(filteredHtml).not.toContain('openai-gpt-5-6-sol-high');
      // Domain pulls in to only the remaining series (costs 2.36 and 3.45 -> domain 2.25-3.5)
      expect(filteredHtml).toContain(
        'Source task cost ($2.25–$3.5, lower is better)',
      );
      expect(filteredHtml).toContain('Source score (85–90, higher is better)');
    });

    it('renders plot empty state and preserves valid axes when all series are hidden', () => {
      const html = renderToStaticMarkup(
        createElement(AdvancedCostPlot, {
          series: sampleAdvancedSeries,
          initialHiddenSeriesIds: ['anthropic-claude-fable-5:deepswe'],
        }),
      );

      // Plot area shows understandable empty state
      expect(html).toContain('cost-plot-empty');
      expect(html).toContain('All series hidden');
      expect(html).toContain(
        'Check at least one series in the legend to display its effort curve.',
      );

      // Axes stay valid without NaN or crash
      expect(html).toContain('cost-axis-title');
      expect(html).toContain('Source task cost ($0–$100, lower is better)');
      expect(html).toContain('Source score (0–100, higher is better)');

      // Legend checkboxes remain reachable
      expect(html).toContain('cost-model-legend');
      expect(html).toContain('type="checkbox"');
    });

    it('disappears when advanced point is blurred or pointer leaves (active point is null)', () => {
      const html = renderToStaticMarkup(
        createElement(AdvancedCostPlot, {
          series: sampleAdvancedSeries,
          selectedProfileId: 'anthropic-claude-fable-5-standard',
          initialActivePoint: null,
        }),
      );

      expect(html).not.toContain('cost-hover-card');
    });
  });

  describe('Integrated CostChart', () => {
    it('renders default and advanced cost charts cleanly without <title> tags', () => {
      const html = renderToStaticMarkup(
        createElement(CostChart, {
          defaultProduct: productFixture,
          advancedProduct: productFixture,
        }),
      );

      expect(html).toContain('Quality vs. Cost');
      expect(html).toContain('cost-curve-chart');
      expect(html).not.toContain('<title>');
    });
  });
});
