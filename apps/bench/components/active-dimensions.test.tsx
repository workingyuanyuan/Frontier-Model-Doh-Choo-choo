import type { DimensionId } from '@llm-bench/benchmark-data';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { leaderboardMarkdown } from '../lib/leaderboard-markdown';
import {
  UI_DIMENSION_ABBREVIATIONS,
  UI_DIMENSION_IDS,
} from '../lib/ui-contract';
import type { LeaderboardRow } from '../lib/view-model';
import { productFixture } from '../test/fixture';
import { LeaderboardTable } from './leaderboard-table';
import { RadarChart } from './radar-chart';

const makeRow = (dimensions: readonly DimensionId[]): LeaderboardRow => ({
  ...productFixture.leaderboard[0]!,
  dimensions: dimensions.map((dimension, index) => ({
    dimension,
    score: 70 + index,
    componentCount: 1,
  })),
});

const renderViews = (rows: LeaderboardRow[], expanded = false) => {
  const product = { ...productFixture, leaderboard: rows };
  const table = renderToStaticMarkup(
    createElement(LeaderboardTable, {
      product,
      rows,
      sort: { key: 'overall', direction: 'descending' },
      onSort: () => {},
      heatMap: {},
      modelProfiles: {},
      onProfileChange: () => {},
      benchmarkDimensions: {},
      preset: { ...product.activePreset, benchmarkIds: [] },
      expandedModelIds: expanded ? rows.map((row) => row.profileId) : [],
      onToggleExpand: () => {},
      developerMode: false,
      commonMode: true,
    }),
  );
  const radar = renderToStaticMarkup(
    createElement(RadarChart, {
      product,
      fixedProfileIds: rows.map((row) => row.profileId),
    }),
  );
  return { table, radar, markdown: leaderboardMarkdown(product, rows) };
};

describe('active comparison dimensions', () => {
  it.each([
    {
      dimensions: UI_DIMENSION_IDS.filter(
        (dimension) => dimension !== 'language',
      ),
    },
    { dimensions: [...UI_DIMENSION_IDS] },
  ])(
    'uses the same scored axes in table, radar, details, and Markdown: $dimensions',
    ({ dimensions }) => {
      const { table, radar, markdown } = renderViews(
        [makeRow(dimensions)],
        true,
      );
      expect(radar.match(/class="radar-axis"/g)).toHaveLength(
        dimensions.length,
      );
      expect(table).toContain(`colSpan="${3 + dimensions.length}"`);
      expect(table.match(/data-dimension-group=/g)).toHaveLength(
        dimensions.length,
      );
      dimensions.forEach((dimension, index) => {
        const abbreviation = UI_DIMENSION_ABBREVIATIONS[dimension];
        expect(table).toContain(`Sort by ${abbreviation}`);
        expect(radar).toContain(`>${abbreviation}</text>`);
        expect(markdown.split('\n')[0]).toContain(
          dimension[0]!.toUpperCase() + dimension.slice(1),
        );
        if (index > 0) {
          const previous = UI_DIMENSION_ABBREVIATIONS[dimensions[index - 1]!];
          expect(table.indexOf(`Sort by ${previous}`)).toBeLessThan(
            table.indexOf(`Sort by ${abbreviation}`),
          );
          expect(radar.indexOf(`>${previous}</text>`)).toBeLessThan(
            radar.indexOf(`>${abbreviation}</text>`),
          );
        }
      });
      expect(radar).toContain(
        `${dimensions.length === 5 ? 'Five' : 'Six'} Dimensions`,
      );
      if (!dimensions.includes('language')) {
        expect(table).not.toContain('Sort by LNG');
        expect(radar).not.toContain('>LNG</text>');
        expect(markdown).not.toContain('Language');
      }
    },
  );

  it('draws no axes or polygons for an empty selection', () => {
    const { table, radar, markdown } = renderViews([]);
    expect(table).not.toContain('dimension-cell');
    expect(table).not.toContain('Sort by CMP');
    expect(radar).not.toContain('<polygon');
    expect(radar).not.toContain('class="radar-axis"');
    expect(radar).not.toContain('class="dimension-bar-row"');
    expect(markdown).toBe(
      '| Model | Reasoning Effort | Overall |\n| --- | --- | --- |',
    );
  });

  it('keeps a missing measurement as a gap when another selected profile has that axis', () => {
    const complete = makeRow(UI_DIMENSION_IDS);
    const incomplete = {
      ...complete,
      profileId: 'openai-gpt-5-6-sol-high',
      dimensions: complete.dimensions.map((entry) =>
        entry.dimension === 'language'
          ? { ...entry, score: null, componentCount: 0 }
          : entry,
      ),
    };
    const { radar } = renderViews([complete, incomplete]);
    expect(radar.match(/class="radar-axis"/g)).toHaveLength(6);
    expect(radar).toContain('LNG: N/A');
    expect(radar).toContain('<polyline');
    expect(radar.match(/<polygon[^>]*class="radar-area/g)).toHaveLength(1);
  });
});
