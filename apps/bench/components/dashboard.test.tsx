import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { Dashboard } from './dashboard';
import { productFixture } from '../test/fixture';

const benchmarkDimensions = {
  'terminal-bench-2-1': 'coding',
  frontiermath: 'math',
} as const;

const dashboard = () =>
  createElement(Dashboard, {
    product: productFixture,
    benchmarkDimensions,
  });

describe('Dashboard Redesign', () => {
  it('renders the current product version and all required product views', () => {
    const html = renderToStaticMarkup(dashboard());

    expect(html).toContain(`Version ${productFixture.versionId}`);
    expect(html).toContain('Leaderboard');
    expect(html).toContain('Quality vs. Cost');
    expect(html).toContain('Eight Dimensions');
    expect(html).toContain('Benchmark details');
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

  it('renders one weighted task-cost chart with explicit axes and source weights', () => {
    const html = renderToStaticMarkup(dashboard());

    expect(html).toContain('Weighted normalized task cost index');
    expect(html).toContain('Overall Score (0–100, higher is better)');
    expect(html).toContain('Artificial Analysis 40%');
    expect(html).not.toContain('API standardized');
    expect(html.match(/cost-curve-chart/g)).toHaveLength(1);
  });

  it('provides textual equivalents for SVG charts', () => {
    const html = renderToStaticMarkup(dashboard());

    expect(html).toContain('Quality vs. Cost chart data');
    expect(html).toContain('Eight Dimensions');
  });

  it('explains the frontier, ranked-model, and scored-profile counts', () => {
    const html = renderToStaticMarkup(dashboard());

    expect(html).toContain(
      'data-scope-metric="frontier"><dt>Frontier models</dt><dd>2</dd>',
    );
    expect(html).toContain(
      'data-scope-metric="ranked"><dt>Ranked models</dt><dd>2</dd>',
    );
    expect(html).toContain(
      'data-scope-metric="profiles"><dt>Scored Profiles</dt><dd>3</dd>',
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
      'COV',
    ];
    headers.slice(0, -1).forEach((header, index) => {
      expect(html.indexOf(`Sort by ${header}`)).toBeLessThan(
        html.indexOf(`Sort by ${headers[index + 1]}`),
      );
    });
  });

  it('provides an Add model selection contract up to 3 total series with abbreviated dimension bars and src counts', () => {
    const html = renderToStaticMarkup(dashboard());
    expect(html).toContain('data-max-series="3"');
    expect(html).toContain('Add model');

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

    expect(html).toContain('src');
    expect(html).not.toContain('(1 sources)');
  });

  it('orders Quality vs. Cost below Eight Dimensions', () => {
    const html = renderToStaticMarkup(dashboard());
    const eightDimensionsIndex = html.indexOf('Eight Dimensions');
    const qualityVsCostIndex = html.indexOf('Quality vs. Cost');
    expect(eightDimensionsIndex).toBeGreaterThan(0);
    expect(qualityVsCostIndex).toBeGreaterThan(eightDimensionsIndex);
  });

  it('groups score evidence into eight expandable capability sections', () => {
    const html = renderToStaticMarkup(dashboard());

    expect(html).toContain('Benchmark details');
    expect(html.match(/data-evidence-dimension/g)).toHaveLength(8);
    expect(html).toContain('<summary');
    expect(html).toContain('Agentic');
    expect(html).toContain('Instruction');
    expect(html).toContain('Other evidence');
    expect(html).toContain('$.leaderboard.score');
    expect(html).toContain('2026-07-16T12:00:00.000Z');
  });

  it('makes every Leaderboard and evidence column a sort control', () => {
    const html = renderToStaticMarkup(dashboard());
    const leaderboardSorts = html.match(/data-leaderboard-sort/g) ?? [];
    const evidenceSorts = html.match(/data-evidence-sort/g) ?? [];

    expect(leaderboardSorts.length).toBe(13);
    expect(evidenceSorts.length).toBe(6);
    expect(html).toContain('aria-sort="descending"');
    expect(html).toContain('Sort by Model');
    expect(html).toContain('Sort by Decision');
  });

  it('allows the active radar model to be removed without hard-coding a model', () => {
    const html = renderToStaticMarkup(dashboard());

    expect(html).toContain('Remove GPT-5.6 Sol · max from radar chart');
  });

  it('exposes alternative profiles without extra ranked rows', () => {
    const html = renderToStaticMarkup(dashboard());
    const rankedRows = html.match(/data-ranked-row/g) ?? [];
    expect(rankedRows.length).toBe(2);
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
    expect(rankedRows.length).toBe(2);
  });

  it('renders profile select inside the Model cell for multi-profile models', () => {
    const html = renderToStaticMarkup(dashboard());
    expect(html).toContain('profile-table-select');
    expect(html).toContain('name="profile-');
    expect(html).toContain('GPT-5.6 Sol');
  });
});
