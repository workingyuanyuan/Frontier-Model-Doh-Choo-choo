import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';

import { PUBLIC_SITE_URL } from '../lib/site-paths';
import { expect, test } from './test';

const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? '').replace(/\/+$/, '');

const markdownLinks = (markdown: string): string[] =>
  [...markdown.matchAll(/\]\(([^)]+)\)/g)].map((match) => match[1]!);

test('a reader without JavaScript can walk from the page to the data', async ({
  request,
}) => {
  const home = `${basePath}/`;
  const html = await (await request.get(home)).text();
  const footerLinks = [...html.matchAll(/<a href="([^"]+)"/g)]
    .map((match) => match[1]!)
    .filter((href) => href.startsWith(`${basePath}/`));
  const llms = footerLinks.find((href) => href.endsWith('/llms.txt'));
  const leaderboard = footerLinks.find((href) => href.endsWith('.md'));
  expect(llms).toBeDefined();
  expect(leaderboard).toBeDefined();

  // Every file llms.txt points at exists in the export.
  const index = await (await request.get(llms!)).text();
  const indexed = markdownLinks(index).filter((href) => !/^https?:/.test(href));
  expect(indexed.length).toBeGreaterThan(1);
  for (const href of indexed)
    expect((await request.get(`${basePath}/${href}`)).status(), href).toBe(200);

  // The linked leaderboard carries the page's ranked models, and each row's
  // evidence file exists.
  const markdown = await (await request.get(leaderboard!)).text();
  const evidence = markdownLinks(markdown).filter((href) =>
    href.includes('evidence/'),
  );
  expect(evidence.length).toBe(
    [...html.matchAll(/<tr data-ranked-row/g)].length,
  );
  const directory = leaderboard!.slice(0, leaderboard!.lastIndexOf('/') + 1);
  for (const href of evidence)
    expect(
      (
        await request.get(new URL(directory + href, 'http://x').pathname)
      ).status(),
      href,
    ).toBe(200);
});

test('the sitemap lists every page by the public URL its canonical link names', async ({
  request,
}) => {
  // The export served to this suite; Next's error pages are not content.
  const exported = readdirSync(resolve('apps/bench/out'), { recursive: true })
    .map((file) => String(file).replaceAll('\\', '/'))
    .filter((file) => file.endsWith('.html') && !file.startsWith('_next/'))
    .filter((file) => !['404.html', '_not-found.html'].includes(file))
    .map((file) => (file === 'index.html' ? '' : file))
    .sort();

  const response = await request.get(`${basePath}/sitemap.xml`);
  expect(response.status()).toBe(200);
  const locs = [
    ...(await response.text()).matchAll(/<loc>([^<]+)<\/loc>/g),
  ].map((match) => match[1]!);
  for (const loc of locs)
    expect(loc.startsWith(PUBLIC_SITE_URL), loc).toBe(true);
  const listed = locs.map((loc) => loc.slice(PUBLIC_SITE_URL.length)).sort();
  expect(listed).toEqual(exported);

  for (const path of listed) {
    const html = await (await request.get(`${basePath}/${path}`)).text();
    const canonical = [
      ...html.matchAll(/<link rel="canonical" href="([^"]+)"/g),
    ].map((match) => match[1]);
    expect(canonical, path).toEqual([`${PUBLIC_SITE_URL}${path}`]);
  }
});

test('the default table states provider and effort as text', async ({
  page,
}) => {
  await page.goto('/');

  const firstRow = page.locator('tr[data-ranked-row]').first();
  await expect(firstRow.locator('th')).toContainText(/Provider: \S+\./);
});

interface PublishedPreset {
  versionId: string;
  dimensionIds: string[];
  leaderboard: Array<{
    rank: number | null;
    modelName: string;
    providerId: string;
    reasoningEffort: string;
    overallScore: number | null;
    dimensionScores: Record<string, number | null>;
    costIndex: number | null;
    economyScore: number | null;
  }>;
  costs: Array<{
    displayName: string;
    costIndex: number;
    onValueFrontier: boolean;
    sources: Array<{ usdPerTask: number }>;
  }>;
}

const shown = (value: number | null): string =>
  value === null ? 'N/A' : value.toFixed(1);

/** Leaderboard cells as every format prints them: one decimal, N/A for null. */
const leaderboardCells = (preset: PublishedPreset): string[][] =>
  preset.leaderboard.map((row) => [
    row.rank === null ? 'N/A' : String(row.rank),
    row.modelName,
    row.providerId,
    row.reasoningEffort,
    shown(row.overallScore),
    ...preset.dimensionIds.map((id) => shown(row.dimensionScores[id] ?? null)),
  ]);

const costCells = (preset: PublishedPreset): string[][] =>
  preset.costs.map((row) => [
    row.displayName,
    row.costIndex.toFixed(1),
    row.onValueFrontier ? 'yes' : 'no',
  ]);

test('the plain HTML of the dashboard names only the effort each row shows', async ({
  browser,
  request,
}) => {
  const index = await (await request.get(`${basePath}/data/index.json`)).json();
  const preset: PublishedPreset = await (
    await request.get(`${basePath}/data/presets/${index.defaultPresetId}.json`)
  ).json();
  // The alternatives of a profile menu arrive with the script that runs it.
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto(`${basePath}/`);
    expect(
      await page
        .locator('tr[data-ranked-row] th')
        .evaluateAll((cells) =>
          cells.map((cell) => cell.textContent!.replace(/\s+/g, ' ').trim()),
        ),
    ).toEqual(
      preset.leaderboard.map(
        (row) =>
          `${row.modelName} Provider: ${row.providerId}. Reasoning effort: ${row.reasoningEffort}`,
      ),
    );
  } finally {
    await context.close();
  }
});

/** One row per source of a model: the model and the USD task cost. */
const costSourceCells = (preset: PublishedPreset): string[][] =>
  preset.costs.flatMap((row) =>
    row.sources.map((source) => [
      row.displayName,
      '$' + source.usdPerTask.toFixed(3),
    ]),
  );

/** Cells of the Markdown table under a heading, up to the next heading. */
const markdownTable = (markdown: string, heading: string): string[][] => {
  const start = markdown.indexOf(heading) + heading.length;
  const end = markdown.indexOf('\n## ', start);
  return markdown
    .slice(start, end === -1 ? undefined : end)
    .split('\n')
    .filter((line) => line.startsWith('|'))
    .slice(2)
    .map((line) => line.slice(2, -2).split(' | '));
};

// Anything but inline text in a table cell breaks the table for text extraction.
const blocksInCells = 'td :not(a, span, strong, code)';

test('every preset reads the same in JSON, Markdown and static HTML', async ({
  browser,
  request,
}) => {
  const indexUrl = `${basePath}/data/index.json`;
  const index = await (await request.get(indexUrl)).json();
  const at = (href: string): string =>
    new URL(href, `http://x${indexUrl}`).pathname;
  // The static pages are for readers that do not run scripts.
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  const tableCells = (name: string): Promise<string[][]> =>
    page
      .locator(`[data-static-table="${name}"] tbody tr`)
      .evaluateAll((rows) =>
        rows.map((row) =>
          [...row.children].map((cell) => cell.textContent!.trim()),
        ),
      );

  expect(index.presets.length).toBeGreaterThan(0);
  for (const entry of index.presets) {
    const preset: PublishedPreset = await (
      await request.get(at(entry.json))
    ).json();
    const markdown = await (await request.get(at(entry.markdown))).text();
    await page.goto(at(entry.html));
    const width = 5 + preset.dimensionIds.length;
    // The column after the scores is Economy: the cost index turned around.
    const economy = preset.leaderboard.map((row) => shown(row.economyScore));
    for (const row of preset.leaderboard)
      expect(row.economyScore, `${entry.id} ${row.modelName}`).toBe(
        row.costIndex === null ? null : 100 - row.costIndex,
      );

    expect(preset.versionId, entry.id).toBe(index.versionId);
    expect(markdown, entry.id).toContain(index.versionId);
    await expect(page.locator('footer')).toContainText(index.versionId);
    await expect(page.locator(blocksInCells)).toHaveCount(0);
    expect(preset.leaderboard.length, entry.id).toBe(entry.modelCount);

    const expected = leaderboardCells(preset);
    expect(
      markdownTable(markdown, '## Leaderboard').map((row) =>
        row.slice(0, width),
      ),
      `${entry.id} Markdown`,
    ).toEqual(expected);
    expect(
      (await tableCells('leaderboard')).map((row) => row.slice(0, width)),
      `${entry.id} HTML`,
    ).toEqual(expected);
    expect(
      markdownTable(markdown, '## Leaderboard').map((row) => row[width]),
      `${entry.id} Markdown Economy`,
    ).toEqual(economy);
    expect(
      (await tableCells('leaderboard')).map((row) => row[width]),
      `${entry.id} HTML Economy`,
    ).toEqual(economy);

    const costs = costCells(preset);
    expect(
      markdownTable(markdown, '## Quality vs. cost').map((row) => [
        row[0],
        row[2],
        row[5],
      ]),
      `${entry.id} Markdown costs`,
    ).toEqual(costs);
    expect(
      (await tableCells('costs')).map((row) => [row[0], row[2], row[5]]),
      `${entry.id} HTML costs`,
    ).toEqual(costs);

    const sources = costSourceCells(preset);
    expect(
      markdownTable(markdown, '## Task costs by source').map((row) => [
        row[0],
        row[2],
      ]),
      `${entry.id} Markdown cost sources`,
    ).toEqual(sources);
    expect(
      (await tableCells('cost-sources')).map((row) => [row[0], row[2]]),
      `${entry.id} HTML cost sources`,
    ).toEqual(sources);
  }
  await context.close();
});

test('the dashboard shows what the published files state', async ({
  page,
  request,
}) => {
  const index = await (await request.get(`${basePath}/data/index.json`)).json();
  const other = index.presets.find(
    (entry: { id: string }) => entry.id !== index.defaultPresetId,
  );
  const views = [
    { id: index.defaultPresetId as string, url: '/' },
    ...(other ? [{ id: other.id as string, url: `/?preset=${other.id}` }] : []),
  ];

  for (const { id, url } of views) {
    const preset: PublishedPreset = await (
      await request.get(`${basePath}/data/presets/${id}.json`)
    ).json();
    await page.goto(url);
    const rows = page.locator('tr[data-ranked-row]');
    await expect(rows).toHaveCount(preset.leaderboard.length);

    expect(
      await rows.evaluateAll((elements) =>
        elements.map((row) => [
          row.querySelector('th strong')!.textContent!.trim(),
          ...[...row.querySelectorAll('td[data-label]')].map((cell) =>
            cell.textContent!.trim(),
          ),
        ]),
      ),
      id,
    ).toEqual(
      leaderboardCells(preset).map((cells, row) => [
        cells[1],
        cells[0],
        ...cells.slice(4),
        shown(preset.leaderboard[row]!.economyScore),
      ]),
    );
    await expect(page.locator('.site-footer')).toContainText(preset.versionId);

    // The collapsed source breakdown of the chart is in the DOM either way.
    expect(
      await page
        .locator('.cost-source-table tbody tr')
        .evaluateAll((elements) =>
          elements.map((row) => [
            row.children[0]!.textContent!.trim(),
            row.children[1]!.textContent!.trim(),
          ]),
        ),
      `${id} costs`,
    ).toEqual(costCells(preset).map((cells) => cells.slice(0, 2)));
    expect(
      await page
        .locator('.cost-source-rows tbody tr')
        .evaluateAll((elements) =>
          elements.map((row) => [
            row.children[0]!.textContent!.trim(),
            row.children[2]!.textContent!.trim(),
          ]),
        ),
      `${id} cost sources`,
    ).toEqual(costSourceCells(preset));
    await expect(
      page.locator('.cost-chart-data').locator(blocksInCells),
    ).toHaveCount(0);
  }
});
