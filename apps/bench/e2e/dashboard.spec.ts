import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('defaults to complete models and reveals partial models explicitly', async ({
  page,
}) => {
  await page.goto('/');

  const rows = page.locator('[data-ranked-row]');
  const defaultCount = await rows.count();
  expect(defaultCount).toBeGreaterThan(0);
  await expect(rows.locator('td:nth-last-child(2)')).toHaveText(
    Array(defaultCount).fill('8/8'),
  );

  const developerMode = page.getByRole('switch', {
    name: 'Developer mode',
  });
  await expect(developerMode).toHaveAttribute('aria-checked', 'false');
  await developerMode.click();
  await expect(developerMode).toHaveAttribute('aria-checked', 'true');
  expect(await rows.count()).toBeGreaterThan(defaultCount);
  await expect(
    rows.locator('td:nth-last-child(2)').filter({ hasNotText: '8/8' }).first(),
  ).toBeVisible();
});

test('switching effort updates the selected model scores', async ({ page }) => {
  await page.goto('/');
  const select = page.getByRole('combobox', {
    name: 'Select profile for Claude Fable 5',
  });
  test.skip(
    (await select.count()) === 0,
    'Current Draft has no alternative Fable profile',
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
