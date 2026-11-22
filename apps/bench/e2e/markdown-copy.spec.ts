import { expect, openAdvancedCostChartWithEveryModel, test } from './test';
import {
  effortSelect,
  findModels,
  hasTaskCost,
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
  // Pin one effort of a multi-effort model, then compare another. Both need a
  // task cost, or the cost chart has no points to check against the table.
  const [model] = findModels(1, ([p]) =>
    Boolean(sharedEfforts(p!, hasTaskCost)),
  );
  const [kept, compared] = sharedEfforts(model!, hasTaskCost)!;
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

test('copies the plotted cost chart points as Markdown', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/');
  const copy = page.getByRole('button', {
    name: 'Copy chart data as Markdown',
  });
  const copied = async () => {
    await copy.click();
    await expect(
      page.getByRole('status').filter({ hasText: 'Copied!' }),
    ).toBeVisible();
    return (await page.evaluate(() => navigator.clipboard.readText())).split(
      /\r?\n/,
    );
  };

  // The default chart: one row per point, in the source breakdown's order.
  const defaultRows = await page
    .locator('.cost-source-table tbody tr')
    .evaluateAll((rows) =>
      rows.map((row) => {
        const [model, effort] = row
          .querySelector('th')!
          .textContent!.trim()
          .split(' · ');
        const [cost, overall] = Array.from(row.querySelectorAll('td')).map(
          (cell) => cell.textContent!.trim(),
        );
        return `| ${model} | ${effort} | ${overall} | ${cost} |`;
      }),
    );
  expect(defaultRows.length).toBeGreaterThan(0);
  expect(await copied()).toEqual([
    '| Model | Effort | Overall Score | Cost index |',
    '| --- | --- | --- | --- |',
    ...defaultRows,
  ]);

  // The advanced chart: only the efforts it plots, scored on its sources.
  await openAdvancedCostChartWithEveryModel(page);
  const hidden = page
    .locator('.cost-effort-toggle[aria-pressed="true"]')
    .first();
  const hiddenProfileId = await hidden.getAttribute('data-profile-id');
  await hidden.click();
  await page.locator('.cost-model-overflow-trigger').click();
  const sources = await page
    .locator('.advanced-source-toggle[aria-pressed="true"]')
    .allTextContents();
  const plotted = await page
    .locator('.advanced-cost-point')
    .evaluateAll((points) =>
      points.map((point) => ({
        profileId: point.getAttribute('data-profile-id')!,
        cost: Number(point.getAttribute('data-cost-index')),
      })),
    );
  expect(plotted.map(({ profileId }) => profileId)).not.toContain(
    hiddenProfileId,
  );
  const [header, divider, ...rows] = await copied();
  expect(header).toBe(
    `| Model | Effort | Score (mean of ${sources.join(', ')}) | Cost index |`,
  );
  expect(divider).toBe('| --- | --- | --- | --- |');
  expect(rows).toHaveLength(plotted.length);
  const byValue = (left: number, right: number) => left - right;
  const copiedCosts = rows
    .map((row) => Number(row.split(' | ').at(-1)!.slice(0, -2)))
    .toSorted(byValue);
  const plottedCosts = plotted.map(({ cost }) => cost).toSorted(byValue);
  // The points carry two decimals and the table one.
  copiedCosts.forEach((cost, index) =>
    expect(Math.abs(cost - plottedCosts[index]!)).toBeLessThan(0.06),
  );
});
