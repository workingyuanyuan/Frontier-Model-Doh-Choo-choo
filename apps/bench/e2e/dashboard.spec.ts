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

  // Radar chart is always rendered by default
  await expect(page.locator('.radar-chart')).toBeVisible();
  await expect(page.locator('#radar-chart-description')).toBeAttached();
  const initialRadarLegend = await page.locator('.series-legend').innerText();

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
  await expect(developerModelButton).toHaveAttribute('aria-expanded', 'false');
  await developerModelButton.click();
  await expect(developerModelButton).toHaveAttribute('aria-expanded', 'true');
  await expect(
    page.locator('[data-developer-model] [data-model-detail]').first(),
  ).toBeVisible();

  // Radar chart is unchanged after clicking developer model
  await expect(page.locator('.radar-chart')).toBeVisible();
  expect(await page.locator('.series-legend').innerText()).toBe(
    initialRadarLegend,
  );

  const developerAxe = await new AxeBuilder({ page }).analyze();
  expect(
    developerAxe.violations.filter(({ impact }) =>
      ['critical', 'serious'].includes(impact ?? ''),
    ),
  ).toEqual([]);
});

test('supports in-row leaderboard expansion with multiple rows open simultaneously', async ({
  page,
}) => {
  await page.goto('/');

  const modelButtons = page.locator('[data-ranked-row] .model-button');
  const count = await modelButtons.count();
  expect(count).toBeGreaterThanOrEqual(1);

  // Initially, no expansion rows
  await expect(page.locator('.leaderboard-expansion-row')).toHaveCount(0);
  await expect(modelButtons.first()).toHaveAttribute('aria-expanded', 'false');

  // Click first model row to expand
  await modelButtons.first().click();
  await expect(modelButtons.first()).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('.leaderboard-expansion-row')).toHaveCount(1);
  await expect(
    page.locator('.leaderboard-expansion-row').first(),
  ).toBeVisible();

  if (count >= 2) {
    // Click second model row to expand - first remains open
    await modelButtons.nth(1).click();
    await expect(modelButtons.nth(1)).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('.leaderboard-expansion-row')).toHaveCount(2);

    // Click first model row again to collapse it
    await modelButtons.first().click();
    await expect(modelButtons.first()).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    await expect(modelButtons.nth(1)).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('.leaderboard-expansion-row')).toHaveCount(1);
  }
});

test('expanding a leaderboard row does not change radar chart series or cost chart highlight', async ({
  page,
}) => {
  await page.goto('/');

  // Initial state: radar chart has exactly 1 series (Overall rank 1 model)
  await expect(page.locator('.series-legend .legend-chip')).toHaveCount(1);
  const initialRadarLegend = await page.locator('.series-legend').innerText();

  // Cost chart has no selected point or legend highlight initially
  await expect(page.locator('.cost-point.is-selected')).toHaveCount(0);
  await expect(page.locator('.cost-model-legend li.is-selected')).toHaveCount(
    0,
  );

  // Expand a leaderboard row
  const modelButtons = page.locator('[data-ranked-row] .model-button');
  const count = await modelButtons.count();
  expect(count).toBeGreaterThan(0);
  await modelButtons.first().click();
  await expect(modelButtons.first()).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('.leaderboard-expansion-row')).toHaveCount(1);

  // Radar chart series list is NOT affected by leaderboard expansion
  await expect(page.locator('.series-legend .legend-chip')).toHaveCount(1);
  expect(await page.locator('.series-legend').innerText()).toBe(
    initialRadarLegend,
  );

  // Cost chart selection is NOT affected by leaderboard expansion
  await expect(page.locator('.cost-point.is-selected')).toHaveCount(0);
  await expect(page.locator('.cost-model-legend li.is-selected')).toHaveCount(
    0,
  );

  // Cost chart owns its highlight: clicking a point toggles highlight
  const costPoint = page.locator('.cost-point').first();
  await costPoint.click();
  await expect(page.locator('.cost-point.is-selected')).toHaveCount(1);
  await expect(page.locator('.cost-model-legend li.is-selected')).toHaveCount(
    1,
  );

  // Toggle off on re-click
  await costPoint.click();
  await expect(page.locator('.cost-point.is-selected')).toHaveCount(0);
  await expect(page.locator('.cost-model-legend li.is-selected')).toHaveCount(
    0,
  );

  // Clicking a legend entry in default plot toggles highlight
  const legendItem = page.locator('.cost-model-legend li').first();
  await legendItem.click();
  await expect(page.locator('.cost-point.is-selected')).toHaveCount(1);
  await expect(legendItem).toHaveClass(/is-selected/);

  // Re-clicking the legend entry toggles it off
  await legendItem.click();
  await expect(page.locator('.cost-point.is-selected')).toHaveCount(0);
  await expect(legendItem).not.toHaveClass(/is-selected/);

  // Keyboard toggling: Enter / Space on a focused point
  await costPoint.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.cost-point.is-selected')).toHaveCount(1);
  await page.keyboard.press('Space');
  await expect(page.locator('.cost-point.is-selected')).toHaveCount(0);
});

test('shows the cost point hover card immediately on hover and on focus', async ({
  page,
}) => {
  await page.goto('/');

  const point = page.locator('.cost-point').first();
  await expect(point).toBeVisible();
  // The native SVG tooltip is gone; nothing may re-introduce its ~1s delay.
  expect(await page.locator('.cost-point title').count()).toBe(0);
  await expect(page.locator('.cost-hover-card')).toHaveCount(0);

  await point.hover();
  await expect(page.locator('.cost-hover-card')).toBeVisible({ timeout: 300 });
  await expect(page.locator('.cost-hover-card')).toContainText('Overall Score');

  await page.mouse.move(0, 0);
  await expect(page.locator('.cost-hover-card')).toHaveCount(0);

  await point.focus();
  await expect(page.locator('.cost-hover-card')).toBeVisible({ timeout: 300 });
  await point.blur();
  await expect(page.locator('.cost-hover-card')).toHaveCount(0);
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

test('scales the cost chart default plot axes to the plotted data range', async ({
  page,
}) => {
  await page.goto('/');

  const yAxisTitle = page.locator('.cost-curve-chart .cost-axis-title').nth(1);
  await expect(yAxisTitle).toBeVisible();

  // SVG <text> has no innerText; textContent is the only way to read it.
  const titleText = (await yAxisTitle.textContent()) ?? '';
  expect(titleText).toMatch(/Overall Score \(\d+–\d+, higher is better\)/);
  expect(titleText).not.toContain('0–100');

  const match = titleText.match(
    /Overall Score \((\d+)–(\d+), higher is better\)/,
  );
  expect(match).not.toBeNull();
  if (match) {
    const min = parseInt(match[1]!, 10);
    const max = parseInt(match[2]!, 10);
    expect(max - min).toBeLessThan(100);
    expect(min).toBeGreaterThan(0);
  }
});

test('toggles the advanced source-local cost curves by keyboard', async ({
  page,
}) => {
  await page.goto('/');

  const toggle = page.locator('.cost-mode-toggle');
  await expect(toggle).toHaveText('Show advanced effort curves');
  await toggle.focus();
  await expect(toggle).toBeFocused();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await page.keyboard.press('Enter');
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('.advanced-cost-chart')).toBeVisible();
  await expect(
    page.getByText('LiveBench is excluded.', { exact: false }),
  ).toBeVisible();
  await toggle.press('Enter');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('.cost-curve-chart')).toBeVisible();
});

test('allows toggling series visibility in advanced cost chart to rescale axes', async ({
  page,
}) => {
  await page.goto('/');

  const toggle = page.locator('.cost-mode-toggle');
  await toggle.click();
  await expect(page.locator('.advanced-cost-chart')).toBeVisible();

  const xAxisTitle = page
    .locator('.advanced-cost-chart .cost-axis-title')
    .first();
  await expect(xAxisTitle).toBeVisible();

  const initialXTitle = (await xAxisTitle.textContent()) ?? '';
  expect(initialXTitle).toMatch(
    /Source task cost \(\$?\d+(\.\d+)?–\$?(\d+(\.\d+)?), lower is better\)/,
  );

  const initialMatch = initialXTitle.match(/–\$?(\d+(?:\.\d+)?)/);
  expect(initialMatch).not.toBeNull();
  const initialMax = parseFloat(initialMatch![1]!);

  // Find all points in the chart to identify the most expensive series
  const points = page.locator('.advanced-cost-point');
  const pointCount = await points.count();
  expect(pointCount).toBeGreaterThan(0);

  let maxCost = -1;
  let mostExpensiveSeriesName = '';

  for (let i = 0; i < pointCount; i++) {
    const label = (await points.nth(i).getAttribute('aria-label')) ?? '';
    const costMatch = label.match(/Cost \$(\d+(?:\.\d+)?)/);
    if (costMatch) {
      const cost = parseFloat(costMatch[1]!);
      if (cost > maxCost) {
        maxCost = cost;
        const parts = label.split(',');
        if (parts[0] && parts[1]) {
          mostExpensiveSeriesName = `${parts[0].trim()} · ${parts[1].trim()}`;
        }
      }
    }
  }

  expect(maxCost).toBeGreaterThan(0);
  expect(mostExpensiveSeriesName).not.toBe('');

  // Uncheck the most expensive series. Click the label rather than the 14px
  // input: the label is the full-width control a user actually taps, and the
  // input's own hit target sits inside a 42-row scrolling list whose exact
  // position differs between machines.
  const seriesRow = page
    .locator('.cost-model-legend li')
    .filter({ hasText: mostExpensiveSeriesName });
  const seriesCheckbox = seriesRow.locator('input[type="checkbox"]');
  const seriesLabel = seriesRow.locator('label');

  await expect(seriesCheckbox).toBeChecked();
  // Toggle it from the keyboard. A pointer click needs a hit test, and this
  // checkbox sits in a 42-row scrolling list inside a page that scrolls
  // horizontally at mobile widths on the CI runner, so the resolved point kept
  // landing on the chart, the aside, or a neighbouring row. Space on a focused
  // checkbox is a real user path, needs no coordinates, and asserts the same
  // outcome — plus it proves the control is keyboard operable.
  await seriesCheckbox.focus();
  await page.keyboard.press('Space');
  await expect(seriesCheckbox).not.toBeChecked();

  // Assert the X axis title's upper bound decreased
  const newXTitle = (await xAxisTitle.textContent()) ?? '';
  const newMatch = newXTitle.match(/–\$?(\d+(?:\.\d+)?)/);
  expect(newMatch).not.toBeNull();
  const newMax = parseFloat(newMatch![1]!);
  expect(newMax).toBeLessThan(initialMax);

  // Assert that the most expensive series' points are gone
  const remainingPoints = page.locator('.advanced-cost-point');
  const remainingCount = await remainingPoints.count();
  expect(remainingCount).toBeLessThan(pointCount);

  for (let i = 0; i < remainingCount; i++) {
    const label =
      (await remainingPoints.nth(i).getAttribute('aria-label')) ?? '';
    const costMatch = label.match(/Cost \$(\d+(?:\.\d+)?)/);
    if (costMatch) {
      const cost = parseFloat(costMatch[1]!);
      expect(cost).toBeLessThan(maxCost);
    }
  }
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

    // The advanced chart adds a second legend layout; it must not push the
    // page sideways either. A CI trace showed the whole document scrolled
    // horizontally in this mode, which the default-mode check above misses.
    await page.locator('.cost-mode-toggle').click();
    await expect(page.locator('.advanced-cost-chart')).toBeVisible();
    const advancedOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(advancedOverflow).toBeLessThanOrEqual(1);
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
