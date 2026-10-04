import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

import * as viewModel from '../lib/view-model';
import * as visualization from '../lib/visualization';
import { productFixture } from '../test/fixture';
import { CostChart } from './cost-chart';
import { RadarChart } from './radar-chart';

afterEach(() => vi.restoreAllMocks());

describe('chart computation', () => {
  it('builds only the visible default cost dataset on initial render', () => {
    const defaultCurve = vi.spyOn(viewModel, 'buildWeightedCostCurve');
    const advancedSeries = vi.spyOn(viewModel, 'buildAdvancedCostSeries');
    const advancedOptions = vi.spyOn(
      viewModel,
      'buildAdvancedCostModelOptions',
    );

    const html = renderToStaticMarkup(
      createElement(CostChart, {
        defaultProduct: productFixture,
        advancedProduct: productFixture,
      }),
    );

    expect(defaultCurve).toHaveBeenCalledExactlyOnceWith(productFixture);
    expect(advancedSeries).not.toHaveBeenCalled();
    expect(advancedOptions).not.toHaveBeenCalled();
    expect(html).toContain('data-cost-mode="default"');
    expect(html).toContain('Show advanced effort curves');
  });

  it('shares representative rows between the initial radar selection and picker', () => {
    const representatives = vi.spyOn(viewModel, 'getRepresentativeRows');

    const html = renderToStaticMarkup(
      createElement(RadarChart, {
        product: productFixture,
      }),
    );

    expect(representatives).toHaveBeenCalledExactlyOnceWith(productFixture);
    expect(html).toContain('Add model...');
  });

  it('shares radar coordinates between a series shape and its point markers', () => {
    const buildPoints = vi.spyOn(visualization, 'buildRadarPoints');
    const profileId = productFixture.leaderboard[0]!.profileId;

    const html = renderToStaticMarkup(
      createElement(RadarChart, {
        product: productFixture,
        fixedProfileIds: [profileId],
      }),
    );

    expect(buildPoints).toHaveBeenCalledTimes(1);
    expect(html).toContain('radar-area');
    expect(html).toContain('radar-point');
  });
});
