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
