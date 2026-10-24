import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { DeveloperModelList } from './developer-model-list';

const rows = Array.from({ length: 13 }, (_, index) => ({
  modelId: `model-${index}`,
  profileId: `model-${index}-max`,
  displayName: `Model ${index}`,
  missingBenchmarkIds: ['cyber'],
}));

describe('DeveloperModelList', () => {
  it('shows the first ten excluded models behind a Show all control', () => {
    const html = renderToStaticMarkup(
      createElement(DeveloperModelList, { rows }),
    );

    expect(html.match(/data-developer-model="/g)).toHaveLength(10);
    expect(html).toContain('Show all 13');
    expect(html).not.toContain('data-developer-model="model-10"');
  });

  it('omits the control when every model already fits', () => {
    const html = renderToStaticMarkup(
      createElement(DeveloperModelList, { rows: rows.slice(0, 10) }),
    );

    expect(html.match(/data-developer-model="/g)).toHaveLength(10);
    expect(html).not.toContain('Show all');
  });
});
