import { expect, test } from '@playwright/test';

test('compares ComplexConstraints scores with organizer evidence for selected profiles', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('switch', { name: 'Developer mode' }).click();
  await page.getByRole('button', { name: /Search Models/ }).click();
  await page.getByRole('button', { name: 'Clear', exact: true }).click();
  for (const name of ['GPT-6 Astra', 'Gemini 3.8 Flash']) {
    await page.getByRole('checkbox', { name, exact: true }).check();
  }
  await page.keyboard.press('Escape');
  await page
    .getByRole('combobox', {
      name: 'Select profile for GPT-6 Astra',
      exact: true,
    })
    .selectOption('openai-gpt-6-astra-max');
  await page
    .getByRole('combobox', {
      name: 'Select profile for Gemini 3.8 Flash',
      exact: true,
    })
    .selectOption('google-gemini-3-8-flash-high');
  const row = page
    .getByRole('region', { name: 'Common benchmarks', exact: true })
    .getByRole('row')
    .filter({
      has: page.getByRole('rowheader', {
        name: 'ComplexConstraints',
        exact: true,
      }),
    });
  await expect(row).toBeVisible();
  await expect(row.locator('strong')).toHaveText(['57.7', '48.4']);
  await expect(row.getByRole('link')).toHaveCount(2);
  for (const link of await row.getByRole('link').all()) {
    await expect(link).toHaveAttribute(
      'href',
      'https://surgehq.ai/benchmarks/complex-constraints',
    );
  }
  await page
    .getByRole('combobox', {
      name: 'Select profile for GPT-6 Astra',
      exact: true,
    })
    .selectOption('openai-gpt-6-astra-low');
  await expect(row).toHaveCount(0);
});
