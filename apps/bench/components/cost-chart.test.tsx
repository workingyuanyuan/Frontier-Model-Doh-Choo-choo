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

describe('CostChart Hover Cards (Task J3)', () => {
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

    it('positions and flips hover card correctly near edges', () => {
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
          points: [rightEdgePoint],
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
