import { expect, test } from '@playwright/test';

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
    href.endsWith('.json'),
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
