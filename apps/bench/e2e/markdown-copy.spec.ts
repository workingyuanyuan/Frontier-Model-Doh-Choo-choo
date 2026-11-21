import { expect, test } from './test';
import {
  effortSelect,
  findModels,
  sharedEfforts,
  profileLabel,
} from './product-data';

test('copies the visible scores, selected efforts and sort order as Markdown', async ({
  page,
  context,
  isMobile,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/');
  const copy = page.getByRole('button', { name: 'Copy table as Markdown' });
  // Economy in the table and the cost index on the chart are one number seen
  // from two sides, for whichever profiles the table ranks.
  const checkCost = async () => {
    const economy = await page
      .locator('[data-ranked-row]')
      .evaluateAll((rows) =>
        rows.map((row) => {
          const model = row.querySelector('strong')!.textContent!.trim();
          const effort =
            row.querySelector('select option:checked')?.textContent?.trim() ??
            row.querySelector('.pinned-profile-label')?.textContent?.trim() ??
            row
              .querySelector('.model-button span:not(.sr-only)')!
              .textContent!.trim();
          return [
            `${model} · ${effort}`,
            row.querySelector('[data-economy-cell]')!.textContent!.trim(),
          ] as const;
        }),
      );
    const plotted = await page
      .locator('.cost-source-table tbody tr')
      .evaluateAll((rows) =>
        rows.map(
          (row) =>
            [
              row.querySelector('th')!.textContent!.trim(),
              row.querySelector('td')!.textContent!.trim(),
            ] as const,
        ),
      );
    expect(plotted.length).toBeGreaterThan(0);
    for (const [name, costIndex] of plotted) {
      const cell = economy.find(([rowName]) => rowName === name)?.[1];
      expect(cell, name).toBeDefined();
      expect(
        Math.abs(100 - Number(cell) - Number(costIndex)),
        name,
      ).toBeLessThan(0.11);
    }
  };
  const checkCopy = async () => {
    const dimensions = await page
      .locator('.leaderboard-table thead th[aria-label]')
      .evaluateAll((cells) =>
        cells.map((cell) => {
          const id = cell.getAttribute('aria-label')!;
          return id[0]!.toUpperCase() + id.slice(1);
        }),
      );
    const headers = [
      'Model',
      'Reasoning Effort',
      'Overall',
      ...dimensions,
      'Economy',
    ];
    const expectedRows = await page
      .locator('[data-ranked-row]')
      .evaluateAll((rows) =>
        rows.map((row) => {
          const model = row.querySelector('strong')!.textContent!.trim();
          const effort =
            row.querySelector('select option:checked')?.textContent?.trim() ??
            row.querySelector('.pinned-profile-label')?.textContent?.trim() ??
            row
              .querySelector('.model-button span:not(.sr-only)')!
              .textContent!.trim();
          const scores = Array.from(row.querySelectorAll('td'))
            .slice(1)
            .map((cell) => cell.textContent!.trim());
          return `| ${[model, effort, ...scores].join(' | ')} |`;
        }),
      );
    // A preset table carries its scope line; an edited comparison has none.
    const scope = page.getByTestId('preset-scope');
    const scopeLines = (await scope.count())
      ? [(await scope.textContent())!.trim(), '']
      : [];
    await copy.click();
    await expect(
      page.getByRole('status').filter({ hasText: 'Copied!' }),
    ).toBeVisible();
    const markdown = await page.evaluate(() => navigator.clipboard.readText());
    expect(markdown.split(/\r?\n/)).toEqual([
      ...scopeLines,
      `| ${headers.join(' | ')} |`,
      `| ${headers.map(() => '---').join(' | ')} |`,
      ...expectedRows,
    ]);
  };
  await checkCopy();
  await checkCost();
  // Pin one effort of a multi-effort model, then compare another.
  const [model] = findModels(1, ([p]) => Boolean(sharedEfforts(p!)));
  const [kept, compared] = sharedEfforts(model!)!;
  await page.getByRole('button', { name: /Search Models/ }).click();
  await page.getByRole('button', { name: 'Clear', exact: true }).click();
  await page.getByRole('checkbox', { name: model!.name, exact: true }).check();
  await page.keyboard.press('Escape');
  const effort = effortSelect(page, model!);
  await effort.selectOption(kept!);
  await page
    .getByRole('button', {
      name: `Keep ${profileLabel(kept!).replace(' · ', ' ')} for comparison`,
      exact: true,
    })
    .click();
  await effort.selectOption(compared!);
  if (!isMobile) {
    await page
      .locator('.leaderboard-table')
      .getByRole('button', { name: /Overall/ })
      .click();
  }
  await checkCopy();
  await checkCost();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    ),
  ).toBe(false);
});

test('reports clipboard failure and allows retry', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: () => Promise.reject(new Error('Permission denied')),
      },
    });
  });
  const copy = page.getByRole('button', { name: 'Copy table as Markdown' });
  await copy.click();
  await expect(
    page.getByRole('status').filter({ hasText: 'Copy failed.' }),
  ).toBeVisible();
  await expect(copy).toBeEnabled();
});
