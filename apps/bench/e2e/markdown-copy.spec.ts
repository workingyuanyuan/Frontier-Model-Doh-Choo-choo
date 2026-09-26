import { expect, test } from '@playwright/test';

test('copies the visible scores, selected efforts and sort order as Markdown', async ({
  page,
  context,
  isMobile,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/');
  const copy = page.getByRole('button', { name: 'Copy table as Markdown' });
  const checkCopy = async () => {
    const expectedRows = await page
      .locator('[data-ranked-row]')
      .evaluateAll((rows) =>
        rows.map((row) => {
          const model = row.querySelector('strong')!.textContent!.trim();
          const effort =
            row.querySelector('select option:checked')?.textContent?.trim() ??
            row.querySelector('.pinned-profile-label')?.textContent?.trim() ??
            row.querySelector('.model-button span')!.textContent!.trim();
          const scores = Array.from(row.querySelectorAll('td'))
            .slice(1)
            .map((cell) => cell.textContent!.trim());
          return `| ${[model, effort, ...scores].join(' | ')} |`;
        }),
      );
    await copy.click();
    await expect(
      page.getByRole('status').filter({ hasText: 'Copied!' }),
    ).toBeVisible();
    const markdown = await page.evaluate(() => navigator.clipboard.readText());
    expect(markdown.split(/\r?\n/)).toEqual([
      '| Model | Reasoning Effort | Overall | Agentic | Coding | Reasoning | Knowledge | Language |',
      '| --- | --- | --- | --- | --- | --- | --- | --- |',
      ...expectedRows,
    ]);
  };
  await checkCopy();
  await page.getByRole('button', { name: /Search Models/ }).click();
  await page.getByRole('button', { name: 'Clear', exact: true }).click();
  await page
    .getByRole('checkbox', { name: 'GPT-6 Astra', exact: true })
    .check();
  await page.keyboard.press('Escape');
  const effort = page.getByRole('combobox', {
    name: 'Select profile for GPT-6 Astra',
    exact: true,
  });
  await effort.selectOption('openai-gpt-6-astra-medium');
  await page
    .getByRole('button', {
      name: 'Keep GPT-6 Astra medium for comparison',
      exact: true,
    })
    .click();
  await effort.selectOption('openai-gpt-6-astra-high');
  if (!isMobile) {
    await page
      .locator('.leaderboard-table')
      .getByRole('button', { name: /Overall/ })
      .click();
  }
  await checkCopy();
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
