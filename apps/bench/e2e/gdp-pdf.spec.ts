import { expect, test } from '@playwright/test';

test('compares GDP.pdf All-pass scores from AA across effort settings', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('switch', { name: 'Developer mode' }).click();
  await page.getByRole('button', { name: /Search Models/ }).click();
  await page.getByRole('button', { name: 'Clear', exact: true }).click();
  for (const name of ['GPT-6 Astra', 'Claude Opus 5.5']) {
    await page.getByRole('checkbox', { name, exact: true }).check();
  }
  await page.keyboard.press('Escape');
  await page
    .getByRole('combobox', {
      name: 'Select profile for GPT-6 Astra',
      exact: true,
    })
    .selectOption('openai-gpt-6-astra-xhigh');
  await page
    .getByRole('combobox', {
      name: 'Select profile for Claude Opus 5.5',
      exact: true,
    })
    .selectOption('anthropic-claude-opus-5-5-high');
  const row = page
    .getByRole('region', { name: 'Common benchmarks', exact: true })
    .getByRole('row')
    .filter({
      has: page.getByRole('rowheader', { name: 'GDP.pdf', exact: true }),
    });
  await expect(row).toBeVisible();
  await expect(row.locator('strong')).toHaveText(['32.2', '28.8']);
  await expect(row.getByRole('link')).toHaveCount(2);
  for (const link of await row.getByRole('link').all()) {
    await expect(link).toHaveAttribute(
      'href',
      /^https:\/\/artificialanalysis\.ai\/models\//,
    );
  }
  await page
    .getByRole('combobox', {
      name: 'Select profile for GPT-6 Astra',
      exact: true,
    })
    .selectOption('openai-gpt-6-astra-max');
  await expect(row.locator('strong')).toHaveText(['31.0', '28.8']);
});
