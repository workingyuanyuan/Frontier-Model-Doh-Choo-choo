import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import type { ProductVersion } from '@llm-bench/benchmark-data';
import { buildCommonComparison } from '../lib/common-benchmarks';
import { loadProductVersion } from '../lib/load-product-version';
import { withActivePreset } from '../lib/view-model';

const product = JSON.parse(
  readFileSync('data/product/current.json', 'utf8'),
) as ProductVersion;
const selectedIds = new Set(product.comparisonEvidenceIds);
const { benchmarkDimensions } = loadProductVersion();

test('shows FrontierSWE V2 for manually selected shared profiles', async ({
  page,
}) => {
  expect(
    product.presets.every(
      (preset) => !preset.benchmarkIds.includes('frontier-swe-v2'),
    ),
  ).toBe(true);
  await page.goto('/');
  await page.getByRole('switch', { name: 'Developer mode' }).click();
  const section = page.getByRole('region', {
    name: 'Common benchmarks',
    exact: true,
  });
  await expect(section).toHaveCount(0);
  await page.getByRole('button', { name: /Search Models/ }).click();
  await page.getByRole('button', { name: 'Clear', exact: true }).click();
  for (const name of ['GPT-6 Astra', 'Gemini 3.8 Flash']) {
    await page.getByRole('checkbox', { name, exact: true }).check();
  }
  await page.keyboard.press('Escape');
  const astra = page.getByRole('combobox', {
    name: 'Select profile for GPT-6 Astra',
    exact: true,
  });
  await astra.selectOption('openai-gpt-6-astra-max');
  await page
    .getByRole('combobox', {
      name: 'Select profile for Gemini 3.8 Flash',
      exact: true,
    })
    .selectOption('google-gemini-3-8-flash-high');
  const row = section.getByRole('row').filter({
    has: page.getByRole('rowheader', { name: 'FrontierSWE V2', exact: true }),
  });
  await expect(row).toBeVisible();
  const scores = ['openai-gpt-6-astra-max', 'google-gemini-3-8-flash-high'].map(
    (profileId) =>
      product.evidence
        .find(
          (e) =>
            selectedIds.has(e.id) &&
            e.benchmarkId === 'frontier-swe-v2' &&
            e.model.profileId === profileId,
        )!
        .normalizedScore!.toFixed(1),
  );
  await expect(row.locator('strong')).toHaveText(scores);
  await expect(row.getByRole('link')).toHaveCount(2);
  for (const link of await row.getByRole('link').all()) {
    await expect(link).toHaveAttribute('href', 'https://www.frontierswe.com/');
  }
  await astra.selectOption('openai-gpt-6-astra-low');
  await expect(row).toHaveCount(0);
  await page.getByRole('button', { name: /Search Models/ }).click();
  await page.getByRole('button', { name: 'Default', exact: true }).click();
  await page.keyboard.press('Escape');
  await expect(section).toHaveCount(0);
});

test('keeps Astra medium while comparing high and removes the saved effort', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('switch', { name: 'Developer mode' }).click();
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
  await expect(page.locator('[data-ranked-row]')).toHaveCount(2);
  await expect(page.locator('[data-pinned="true"]')).toHaveAttribute(
    'data-profile-id',
    'openai-gpt-6-astra-medium',
  );
  await expect(
    effort.locator('option[value="openai-gpt-6-astra-medium"]'),
  ).toHaveJSProperty('disabled', true);
  const comparison = page.getByRole('region', {
    name: 'Common benchmarks',
    exact: true,
  });
  await expect(comparison.locator('thead')).toContainText(
    'GPT-6 Astra · medium',
  );
  await expect(comparison.locator('thead')).toContainText('GPT-6 Astra · high');
  await expect(
    comparison.getByRole('columnheader', { name: /Difference/ }),
  ).toBeVisible();
  await expect(page.locator('.series-legend')).toContainText(
    'GPT-6 Astra · medium',
  );
  const pinned = page.locator('[data-pinned="true"]');
  await pinned
    .getByRole('button', { name: 'GPT-6 Astra', exact: true })
    .click();
  await expect(page.locator('.leaderboard-expansion-row')).toHaveCount(1);
  await page
    .getByRole('button', {
      name: 'Remove GPT-6 Astra medium from comparison',
      exact: true,
    })
    .click();
  await expect(page.locator('[data-ranked-row]')).toHaveCount(1);
  await expect(page.locator('.leaderboard-expansion-row')).toHaveCount(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    ),
  ).toBe(false);
});

test('compares selected models on their shared measurements and updates profiles', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('switch', { name: 'Developer mode' }).click();
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
    const selectedProfiles = Object.fromEntries(
      ids.map((id) => [product.profiles.find((p) => p.id === id)!.modelId, id]),
    );
    const common = buildCommonComparison(
      withActivePreset(product),
      Object.keys(selectedProfiles),
      selectedProfiles,
      benchmarkDimensions,
    ).benchmarkIds;
    await expect(section.locator('tbody tr')).toHaveCount(common.length);
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

test('clears the comparison rows and radar axes', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('switch', { name: 'Developer mode' }).click();
  await page.getByRole('button', { name: /Search Models/ }).click();
  await page.getByRole('button', { name: 'Clear', exact: true }).click();
  await page.keyboard.press('Escape');
  await expect(page.locator('.radar-axis')).toHaveCount(0);
  await expect(page.locator('[data-ranked-row]')).toHaveCount(0);
});

test('compares the newly resolved Fable, Gemini and Astra models together', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('switch', { name: 'Developer mode' }).click();
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
