import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { Dashboard } from './dashboard';
import { productFixture } from '../test/fixture';

describe('Dashboard', () => {
  it('renders the separate review channel and all required product views', () => {
    const html = renderToStaticMarkup(
      createElement(Dashboard, {
        product: productFixture,
        channel: 'DRAFT',
      }),
    );

    expect(html).toContain('DRAFT');
    expect(html).toContain('Leaderboard');
    expect(html).toContain('Quality vs. cost');
    expect(html).toContain('Category profile');
    expect(html).toContain('Score evidence');
  });

  it('exposes alternative profiles without adding another ranked model row', () => {
    const html = renderToStaticMarkup(
      createElement(Dashboard, {
        product: productFixture,
        channel: 'DRAFT',
      }),
    );

    expect(html).toContain('GPT-5.6 Sol · high effort');
    expect(html.match(/data-ranked-row/g)).toHaveLength(3);
  });

  it('labels standardized API cost without claiming per-task measurement', () => {
    const html = renderToStaticMarkup(
      createElement(Dashboard, {
        product: productFixture,
        channel: 'DRAFT',
      }),
    );

    expect(html).toContain('Comparable USD cost');
    expect(html).toContain('blended-token assumption');
  });

  it('provides textual equivalents for SVG charts', () => {
    const html = renderToStaticMarkup(
      createElement(Dashboard, {
        product: productFixture,
        channel: 'DRAFT',
      }),
    );

    expect(html).toContain('API standardized chart data');
    expect(html).toContain('Category score table');
  });
});
