import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Dashboard } from './dashboard';
import * as comparison from '../lib/common-benchmarks';
import * as viewModel from '../lib/view-model';
import { productFixture } from '../test/fixture';

const benchmarkDimensions = {
  'terminal-bench-2-1': 'coding',
  frontiermath: 'reasoning',
} as const;

afterEach(() => vi.restoreAllMocks());

describe('dashboard computation boundaries', () => {
  it('uses preset scores without calculating a hidden comparison or diagnostics', () => {
    const compare = vi.spyOn(comparison, 'buildCommonComparison');
    const developer = vi.spyOn(viewModel, 'getDeveloperModelRows');
    const partial = vi.spyOn(viewModel, 'getPartialCoverageRows');

    const html = renderToStaticMarkup(
      createElement(Dashboard, {
        product: productFixture,
        benchmarkDimensions,
      }),
    );

    expect(html).toContain('data-ranked-row');
    expect(compare).not.toHaveBeenCalled();
    expect(developer).not.toHaveBeenCalled();
    expect(partial).not.toHaveBeenCalled();
  });

  it('calculates diagnostics when developer mode is visible', () => {
    const developer = vi.spyOn(viewModel, 'getDeveloperModelRows');
    const partial = vi.spyOn(viewModel, 'getPartialCoverageRows');

    const html = renderToStaticMarkup(
      createElement(Dashboard, {
        product: productFixture,
        benchmarkDimensions,
        initialDeveloperMode: true,
      }),
    );

    expect(html).toContain('data-developer-models');
    expect(developer).toHaveBeenCalledTimes(1);
    expect(partial).toHaveBeenCalledTimes(1);
  });
});
