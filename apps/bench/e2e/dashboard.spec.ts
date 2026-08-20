import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('defaults to complete matrix models and exposes excluded cells explicitly', async ({
  page,
}) => {
  await page.goto('/');

  const rows = page.locator('[data-ranked-row]');
  const defaultCount = await rows.count();
  expect(defaultCount).toBeGreaterThan(0);
  expect(
    (await rows.allTextContents()).every((text) => !text.includes('N/A')),
  ).toBe(true);

  const developerMode = page.getByRole('switch', {
    name: 'Developer mode',
  });
  await expect(developerMode).toHaveAttribute('aria-checked', 'false');
  await developerMode.click();
  await expect(developerMode).toHaveAttribute('aria-checked', 'true');
  expect(await rows.count()).toBe(defaultCount);
  await expect(page.locator('[data-developer-models]')).toBeVisible();
  expect(await page.locator('[data-developer-model]').count()).toBeGreaterThan(
    0,
  );
  await expect(page.locator('[data-developer-models]')).not.toContainText(
    'Overall',
  );

  const developerModelButton = page
    .locator('[data-developer-model] button')
    .first();
  await developerModelButton.click();
  await expect(page.locator('.radar-chart')).toBeVisible();
  await expect(page.locator('#radar-chart-description')).toBeAttached();
  const developerAxe = await new AxeBuilder({ page }).analyze();
  expect(
    developerAxe.violations.filter(({ impact }) =>
      ['critical', 'serious'].includes(impact ?? ''),
    ),
  ).toEqual([]);
});

test('switching effort updates the selected model scores', async ({ page }) => {
  await page.goto('/');
  const select = page.getByRole('combobox', {
    name: 'Select profile for Claude Fable 5',
  });
  test.skip(
    (await select.count()) === 0,
    'Current product has no alternative Fable profile',
  );

  const row = page.getByRole('row', { name: /Claude Fable 5/ });
  const before = await row.innerText();
  const values = await select
    .locator('option')
    .evaluateAll((options) =>
      options.map((option) => (option as HTMLOptionElement).value),
    );
  expect(values.length).toBeGreaterThan(1);
  await select.selectOption(values[1]!);
  await expect.poll(() => row.innerText()).not.toBe(before);
});

test('has no serious accessibility violations or page-level mobile overflow', async ({
  page,
}, testInfo) => {
  if (testInfo.project.name === 'mobile-chromium') {
    await page.setViewportSize({ width: 390, height: 844 });
  }
  await page.goto('/');

  const results = await new AxeBuilder({ page }).analyze();
  expect(
    results.violations.filter(({ impact }) =>
      ['critical', 'serious'].includes(impact ?? ''),
    ),
  ).toEqual([]);

  if (testInfo.project.name === 'mobile-chromium') {
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  }
});

test('keeps leaderboard sort, search, and effort controls keyboard reachable', async ({
  page,
}) => {
  await page.goto('/');

  const sortButton = page.getByRole('button', { name: 'Sort by Overall' });
  await sortButton.focus();
  await expect(sortButton).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('th[aria-sort="ascending"]')).toHaveCount(1);

  const pickerTrigger = page.getByRole('button', {
    name: /Search models or profiles/,
  });
  await pickerTrigger.focus();
  await expect(pickerTrigger).toBeFocused();
  await page.keyboard.press('Enter');
  const searchInput = page.getByRole('searchbox', {
    name: 'Filter models in list',
  });
  await expect(searchInput).toBeFocused();
  await searchInput.fill('GPT');
  await expect(searchInput).toHaveValue('GPT');
  await page.keyboard.press('Escape');
  await expect(pickerTrigger).toBeFocused();

  const effortSelector = page.locator('.profile-table-select').first();
  if (await effortSelector.count()) {
    await effortSelector.focus();
    await expect(effortSelector).toBeFocused();
    const options = await effortSelector.locator('option').count();
    expect(options).toBeGreaterThan(0);
  }
});
