import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import type { ProductVersion } from '@llm-bench/benchmark-data';

const product = JSON.parse(
  readFileSync('data/product/current.json', 'utf8'),
) as ProductVersion;
const selectedIds = new Set(product.comparisonEvidenceIds);

test('compares selected models on their shared measurements and updates profiles', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Search Models/ }).click();
  await page.getByRole('button', { name: 'Clear', exact: true }).click();
  await page
    .getByRole('checkbox', { name: 'GPT-6 Astra', exact: true })
    .check();
  await page
    .getByRole('checkbox', { name: 'Gemini 3.8 Flash', exact: true })
    .check();
  await page.keyboard.press('Escape');
  const section = page.getByRole('region', {
    name: 'Common benchmarks',
    exact: true,
  });
  await expect(section).toBeVisible();
  await expect(page.locator('[data-ranked-row]')).toHaveCount(2);
  const astra = page.getByRole('combobox', {
    name: 'Select profile for GPT-6 Astra',
    exact: true,
  });
  const gemini = page.getByRole('combobox', {
    name: 'Select profile for Gemini 3.8 Flash',
    exact: true,
  });
  const checkBasis = async () => {
    const ids = [await astra.inputValue(), await gemini.inputValue()];
    const measurements = ids.map((id) =>
      product.evidence.filter(
        (e) => selectedIds.has(e.id) && e.model.profileId === id,
      ),
    );
    const common = [
      ...new Set(measurements[0]!.map((e) => e.benchmarkId)),
    ].filter((id) => measurements[1]!.some((e) => e.benchmarkId === id));
    await expect(section.locator('tbody tr')).toHaveCount(common.length);
    await expect(page.locator('.comparison-summary')).toContainText(
      `${common.length} common benchmarks`,
    );
    await expect(
      section.getByRole('columnheader', { name: /Difference/ }),
    ).toBeVisible();
    await expect(section.locator('tbody a')).toHaveCount(common.length * 2);
    for (const id of ids) {
      const p = product.profiles.find((p) => p.id === id)!;
      await expect(page.locator('.series-legend')).toContainText(
        p.baseModelName,
      );
    }
    return common.length;
  };
  const before = await checkBasis();
  await astra.selectOption('openai-gpt-6-astra-low');
  const after = await checkBasis();
  expect(after).not.toBe(before);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(overflow).toBe(false);
  await page.screenshot({
    path: `test-results/common-benchmarks-${test.info().project.name}.png`,
    fullPage: true,
  });
  await page.getByRole('button', { name: /Search Models/ }).click();
  await page.getByRole('button', { name: 'Default', exact: true }).click();
  await page.keyboard.press('Escape');
  await expect(section).toHaveCount(0);
});

test('shows selection guidance after clearing models', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Search Models/ }).click();
  await page.getByRole('button', { name: 'Clear', exact: true }).click();
  await page.keyboard.press('Escape');
  await expect(
    page.getByText('Select models in Search Models to begin.'),
  ).toBeVisible();
  await expect(page.locator('[data-ranked-row]')).toHaveCount(0);
});

test('compares the newly resolved Fable, Gemini and Astra models together', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Search Models/ }).click();
  await page.getByRole('button', { name: 'Clear', exact: true }).click();
  for (const name of ['GPT-6 Astra', 'Gemini 3.8 Flash', 'Claude Fable 5.1']) {
    await page.getByRole('checkbox', { name, exact: true }).check();
  }
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-ranked-row]')).toHaveCount(3);
  await page
    .getByRole('combobox', {
      name: 'Select profile for Claude Fable 5.1',
      exact: true,
    })
    .selectOption('anthropic-claude-fable-5-1-max');
  const section = page.getByRole('region', {
    name: 'Common benchmarks',
    exact: true,
  });
  await expect(section.locator('tbody tr').first()).toBeVisible();
  await expect(section.locator('thead th')).toHaveCount(4);
  await expect(section.locator('tbody tr').first().locator('a')).toHaveCount(3);
  await expect(page.locator('.series-legend')).toContainText(
    'Claude Fable 5.1',
  );
});
