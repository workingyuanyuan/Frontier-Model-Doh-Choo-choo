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

test('the default table states provider, effort and column meaning as text', async ({
  page,
}) => {
  await page.goto('/');

  const firstRow = page.locator('tr[data-ranked-row]').first();
  await expect(firstRow.locator('th')).toContainText(/Provider: \S+\./);
  await expect(page.locator('.leaderboard-table caption')).toContainText(
    'Scores are 0–100',
  );
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
  }>;
  costs: Array<{
    displayName: string;
    costIndex: number;
    onValueFrontier: boolean;
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

    expect(preset.versionId, entry.id).toBe(index.versionId);
    expect(markdown, entry.id).toContain(index.versionId);
    await expect(page.locator('footer')).toContainText(index.versionId);
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
      leaderboardCells(preset).map((cells) => [
        cells[1],
        cells[0],
        ...cells.slice(4),
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
  }
});
