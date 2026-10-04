import { expect, test } from '@playwright/test';

test('plots vendor score and task cost pairs for DeepSWE, AutomationBench and CursorBench', async ({
  page,
}) => {
  await page.goto('/');
  await page.locator('.cost-mode-toggle').click();
  const toggles = page.locator('.advanced-source-toggle');
  for (const toggle of await toggles.all()) {
    const id = await toggle.getAttribute('data-source-id');
    const enabled = (await toggle.getAttribute('aria-pressed')) === 'true';
    if (enabled !== (id === 'deepswe')) await toggle.click();
  }
  const points = page.locator(
    '.advanced-cost-point[data-series-id="openai-gpt-6-1-sol"]',
  );
  await expect(points).toHaveCount(5);
  // Each SVG point is focusable, including on touch-sized viewports.
  const highPoint = page.locator(
    '.advanced-cost-point[data-profile-id="openai-gpt-6-1-sol-high"]',
  );
  await highPoint.focus();
  const tooltip = page.getByRole('tooltip', { includeHidden: true });
  await expect(tooltip).toContainText('score 75.2 · $0.646');
  await expect(
    tooltip.getByRole('link', {
      name: /OpenAI \(vendor\)/,
      includeHidden: true,
    }),
  ).toHaveAttribute(
    'href',
    'https://openai.com/zh-Hant/index/introducing-gpt-6-1-sol/',
  );
  await page
    .locator('.advanced-source-toggle[data-source-id="deepswe"]')
    .click();
  await page
    .locator('.advanced-source-toggle[data-source-id="zapier-automationbench"]')
    .click();
  await expect(points).toHaveCount(5);
  await highPoint.focus();
  await expect(tooltip).toContainText(`score 33.2 · $${(0.2255).toFixed(3)}`);
  await page
    .locator('.advanced-source-toggle[data-source-id="zapier-automationbench"]')
    .click();
  await page
    .locator('.advanced-source-toggle[data-source-id="cursorbench"]')
    .click();
  const opus = page.locator(
    '.advanced-cost-point[data-series-id="anthropic-claude-opus-5-5"]',
  );
  await expect(opus).toHaveCount(5);
  await page
    .locator(
      '.advanced-cost-point[data-profile-id="anthropic-claude-opus-5-5-max"]',
    )
    .focus();
  await expect(tooltip).toContainText('score 57.8');
  await expect(
    tooltip.getByRole('link', {
      name: /Anthropic \(vendor\)/,
      includeHidden: true,
    }),
  ).toHaveAttribute('href', 'https://www.anthropic.com/claude-opus-5-5');
});

test('compares vendor previews with organizer measurements and preserves source links', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('switch', { name: 'Developer mode' }).click();
  await page.getByRole('button', { name: /Search Models/ }).click();
  await page.getByRole('button', { name: 'Clear', exact: true }).click();
  for (const name of ['GPT-6.1 Sol', 'GPT-6 Astra']) {
    await page.getByRole('checkbox', { name, exact: true }).check();
  }
  await page.keyboard.press('Escape');
  await page
    .getByRole('combobox', {
      name: 'Select profile for GPT-6.1 Sol',
      exact: true,
    })
    .selectOption('openai-gpt-6-1-sol-high');
  await page
    .getByRole('combobox', {
      name: 'Select profile for GPT-6 Astra',
      exact: true,
    })
    .selectOption('openai-gpt-6-astra-xhigh');
  const region = page.getByRole('region', {
    name: 'Common benchmarks',
    exact: true,
  });
  const deepswe = region.getByRole('row').filter({
    has: page.getByRole('rowheader', { name: 'DeepSWE 1.1', exact: true }),
  });
  await expect(deepswe).toBeVisible();
  await expect(deepswe.locator('strong')).toHaveText(['75.2', '74.1']);
  await expect(
    deepswe.getByRole('link', { name: /OpenAI \(vendor\)/ }),
  ).toHaveAttribute(
    'href',
    'https://openai.com/zh-Hant/index/introducing-gpt-6-1-sol/',
  );
  await expect(deepswe.getByRole('link', { name: /^DeepSWE/ })).toHaveCount(1);
  const automation = region.getByRole('row').filter({
    has: page.getByRole('rowheader', {
      name: 'AutomationBench',
      exact: true,
    }),
  });
  await expect(automation).toBeVisible();
  await expect(automation.locator('strong')).toHaveText(['33.2', '39.0']);
});

test('shows CursorBench 4.0 with Anthropic release provenance', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('switch', { name: 'Developer mode' }).click();
  await page.getByRole('button', { name: /Search Models/ }).click();
  await page.getByRole('button', { name: 'Clear', exact: true }).click();
  for (const name of ['Claude Opus 5.5', 'Claude Fable 5.1']) {
    await page.getByRole('checkbox', { name, exact: true }).check();
  }
  await page.keyboard.press('Escape');
  await page
    .getByRole('combobox', {
      name: 'Select profile for Claude Opus 5.5',
      exact: true,
    })
    .selectOption('anthropic-claude-opus-5-5-max');
  await page
    .getByRole('combobox', {
      name: 'Select profile for Claude Fable 5.1',
      exact: true,
    })
    .selectOption('anthropic-claude-fable-5-1-max');
  const row = page
    .getByRole('region', { name: 'Common benchmarks', exact: true })
    .getByRole('row')
    .filter({
      has: page.getByRole('rowheader', {
        name: 'CursorBench 4.0',
        exact: true,
      }),
    });
  await expect(row).toBeVisible();
  await expect(row.locator('strong')).toHaveText(['57.8', '51.8']);
  await expect(
    row.getByRole('link', { name: /Anthropic \(vendor\)/ }),
  ).toHaveCount(2);
  for (const link of await row.getByRole('link').all()) {
    await expect(link).toHaveAttribute(
      'href',
      'https://www.anthropic.com/claude-opus-5-5',
    );
  }
});
