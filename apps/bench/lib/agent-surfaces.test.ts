import { describe, expect, it } from 'vitest';

import {
  dataIndexJson,
  llmsTxt,
  methodologyMarkdown,
  presetJson,
  presetMarkdown,
  profilesJson,
  projectPresets,
} from './agent-surfaces';
import { projectPreset } from './preset-projection';
import {
  DATA_INDEX_PATH,
  PROFILES_PATH,
  presetJsonPath,
  presetMarkdownPath,
  presetPagePath,
  profileEvidencePath,
} from './site-paths';
import { UI_DIMENSION_IDS, UI_DIMENSION_NAMES } from './ui-contract';
import { getRepresentativeRows, mainScreenProduct } from './view-model';
import { productFixture } from '../test/fixture';

const benchmarkDimensions = {
  'terminal-bench-2-1': 'coding',
  frontiermath: 'reasoning',
} as const;

const presetId = productFixture.activePreset.id;
const presets = projectPresets(productFixture, benchmarkDimensions);
const projection = presets.find(({ preset }) => preset.id === presetId)!;

/** Data rows of the first Markdown table after a heading. */
const tableRows = (markdown: string, heading: string): string[][] =>
  markdown
    .slice(markdown.indexOf(heading))
    .split('\n')
    .filter((row) => row.startsWith('|'))
    .slice(2)
    .map((row) => row.split(' | ').map((cell) => cell.replace(/^\| /, '')));

/** The site-root path a link in a published file points at. */
const resolveFrom = (file: string, href: string): string =>
  new URL(href, `http://site/${file}`).pathname.slice(1);

describe('published agent files', () => {
  it('projects the profiles of the main screen in the same order', () => {
    const expected = getRepresentativeRows(mainScreenProduct(productFixture));

    expect(expected.length).toBeGreaterThan(0);
    expect(
      projection.leaderboard.map((row) => [
        row.rank,
        row.profileId,
        row.overallScore,
      ]),
    ).toEqual(
      expected.map((row) => [row.rank, row.profileId, row.overallScore]),
    );
  });

  it('writes the same rows to Markdown and JSON', () => {
    const markdown = presetMarkdown(projection, presets);
    const document = JSON.parse(presetJson(projection));
    const leaderboard = markdown.slice(
      0,
      markdown.indexOf('## Quality vs. cost'),
    );

    expect(
      tableRows(leaderboard, '## Leaderboard').map((cells) => [
        cells[0],
        cells[5],
        resolveFrom(
          presetMarkdownPath(presetId),
          cells.at(-1)!.match(/\]\(([^)]+)\)/)![1]!,
        ),
      ]),
    ).toEqual(
      document.leaderboard.map(
        (row: { rank: number; overallScore: number; evidence: string }) => [
          String(row.rank),
          row.overallScore.toFixed(1),
          resolveFrom(presetJsonPath(presetId), row.evidence),
        ],
      ),
    );
    expect(document.versionId).toBe(productFixture.versionId);
    expect(markdown).toContain(productFixture.versionId);
  });

  it('links each JSON row to the evidence file of its profile', () => {
    const document = JSON.parse(presetJson(projection));

    expect(
      document.leaderboard.map((row: { evidence: string }) =>
        resolveFrom(presetJsonPath(presetId), row.evidence),
      ),
    ).toEqual(
      projection.leaderboard.map(({ profileId }) =>
        profileEvidencePath(productFixture.versionId, profileId),
      ),
    );
  });

  it('has no projection for a preset the product does not carry', () => {
    expect(projectPreset(productFixture, 'missing', benchmarkDimensions)).toBe(
      null,
    );
  });

  it('indexes every preset in every format', () => {
    const index = llmsTxt(productFixture, presets);
    const data = JSON.parse(dataIndexJson(productFixture, presets));

    expect(
      data.presets.map((entry: Record<string, string>) =>
        [entry.markdown, entry.json, entry.html].map((href) =>
          resolveFrom(DATA_INDEX_PATH, href!),
        ),
      ),
    ).toEqual(
      productFixture.presets.map(({ id }) => [
        presetMarkdownPath(id),
        presetJsonPath(id),
        presetPagePath(id),
      ]),
    );
    for (const { id } of productFixture.presets)
      for (const path of [
        presetMarkdownPath(id),
        presetJsonPath(id),
        presetPagePath(id),
      ])
        expect(index).toContain(`](${path})`);
  });

  it('lists every profile with its evidence file', () => {
    const { profiles } = JSON.parse(profilesJson(productFixture));

    expect(
      profiles.map((profile: { evidence: string }) =>
        resolveFrom(PROFILES_PATH, profile.evidence),
      ),
    ).toEqual(
      productFixture.profiles.map(({ id }) =>
        profileEvidencePath(productFixture.versionId, id),
      ),
    );
  });

  it('states how many presets score each dimension', () => {
    const markdown = methodologyMarkdown(productFixture, benchmarkDimensions);
    const scoring = UI_DIMENSION_IDS.map(
      (dimension) =>
        presets.filter(({ dimensionIds }) => dimensionIds.includes(dimension))
          .length,
    );

    expect(scoring.some((count) => count > 0)).toBe(true);
    expect(scoring.some((count) => count === 0)).toBe(true);
    expect(
      tableRows(
        markdown.slice(0, markdown.indexOf('## Which models')),
        '## Dimensions',
      ).map((row) => [row[0], row[4]!.replace(/ \|$/, '')]),
    ).toEqual(
      UI_DIMENSION_IDS.map((dimension, index) => [
        UI_DIMENSION_NAMES[dimension],
        `${scoring[index]} of ${presets.length}`,
      ]),
    );

    const unscored = markdown
      .split('\n')
      .find((line) => line.startsWith('Scored in no preset'))!;
    UI_DIMENSION_IDS.forEach((dimension, index) => {
      expect(unscored.includes(`${UI_DIMENSION_NAMES[dimension]} (`)).toBe(
        scoring[index] === 0,
      );
    });
  });
});
