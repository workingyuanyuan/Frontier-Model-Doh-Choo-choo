import { describe, expect, it } from 'vitest';

import { llmsTxt, presetMarkdown } from './agent-surfaces';
import { presetMarkdownPath } from './site-paths';
import { getRepresentativeRows, mainScreenProduct } from './view-model';
import { productFixture } from '../test/fixture';

const benchmarkDimensions = {
  'terminal-bench-2-1': 'coding',
  frontiermath: 'reasoning',
} as const;

/** Data rows of the first Markdown table after a heading. */
const tableRows = (markdown: string, heading: string): string[][] =>
  markdown
    .slice(markdown.indexOf(heading))
    .split('\n')
    .filter((row) => row.startsWith('|'))
    .slice(2)
    .map((row) => row.split(' | ').map((cell) => cell.replace(/^\| /, '')));

describe('published agent files', () => {
  it('ranks the same profiles in the same order as the main screen', () => {
    const presetId = productFixture.activePreset.id;
    const markdown = presetMarkdown(
      productFixture,
      presetId,
      benchmarkDimensions,
    )!;
    const expected = getRepresentativeRows(mainScreenProduct(productFixture));
    const leaderboard = markdown.slice(
      0,
      markdown.indexOf('## Quality vs. cost'),
    );

    expect(expected.length).toBeGreaterThan(0);
    expect(
      tableRows(leaderboard, '## Leaderboard').map((cells) => [
        cells[0],
        cells[4],
        cells.at(-1),
      ]),
    ).toEqual(
      expected.map((row) => [
        String(row.rank),
        row.overallScore!.toFixed(1),
        expect.stringContaining(`${row.profileId}.json`),
      ]),
    );
  });

  it('has no file for a preset the product does not carry', () => {
    expect(presetMarkdown(productFixture, 'missing', benchmarkDimensions)).toBe(
      null,
    );
  });

  it('indexes every preset from llms.txt', () => {
    const index = llmsTxt(productFixture);

    for (const { id } of productFixture.presets)
      expect(index).toContain(`](${presetMarkdownPath(id)})`);
  });
});
