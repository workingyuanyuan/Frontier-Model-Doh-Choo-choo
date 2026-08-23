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

test('every cost point discloses its source count and each source score basis', async ({
  page,
}) => {
  await page.goto('/');

  // Hover card: how many of the weighted sources placed this point.
  const point = page.locator('.cost-point').first();
  await point.hover();
  const count = page.getByTestId('cost-hover-source-count');
  await expect(count).toBeVisible({ timeout: 300 });
  await expect(count).toHaveText(/^[1-7] of 7$/);

  // Table: the same count per row, plus a named basis for every source.
  await page.locator('.cost-chart-data > summary').click();

  const counts = page.getByTestId('cost-row-source-count');
  const total = await counts.count();
  expect(total).toBeGreaterThan(0);
  for (let index = 0; index < total; index += 1) {
    await expect(counts.nth(index)).toHaveText(/^[1-7] of 7$/);
  }

  // No source may contribute an unnamed, floating average. LiveBench is in
  // the weight table but has no pairable score, and must say so.
  const rows = page.locator('.cost-chart-data tbody tr');
  const contributions = await rows.evaluateAll((elements) =>
    elements.map((element) => element.lastElementChild?.textContent ?? ''),
  );
  expect(contributions.length).toBeGreaterThan(0);
  contributions.forEach((text) => {
    expect(text).not.toBe('');
    if (text.includes('LiveBench')) {
      expect(text).toContain('cost only, no pairable score');
    }
  });
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

test('toggles the advanced aggregate cost curves by keyboard', async ({
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
    page.getByText('LiveBench, Vals AI, Zapier are excluded', { exact: false }),
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
    /Weighted normalized task cost index \((\d+(?:\.\d+)?)–(\d+(?:\.\d+)?), lower is better\)/,
  );

  const initialMatch = initialXTitle.match(/–(\d+(?:\.\d+)?)/);
  expect(initialMatch).not.toBeNull();
  const initialMax = parseFloat(initialMatch![1]!);

  // Find the most expensive point, and the series it belongs to. Match on the
  // data attributes rather than by parsing the aria-label: the label is prose
  // meant for screen readers, and splitting it on separators broke as soon as
  // the label text changed. data-series-id is an exact key on both the point
  // and its legend row.
  const points = page.locator('.advanced-cost-point');
  const pointCount = await points.count();
  expect(pointCount).toBeGreaterThan(0);

  let maxCost = -1;
  let mostExpensiveSeriesId = '';

  for (let i = 0; i < pointCount; i++) {
    const point = points.nth(i);
    const cost = parseFloat(
      (await point.getAttribute('data-cost-index')) ?? '',
    );
    const seriesId = (await point.getAttribute('data-series-id')) ?? '';
    if (Number.isFinite(cost) && cost > maxCost) {
      maxCost = cost;
      mostExpensiveSeriesId = seriesId;
    }
  }

  expect(maxCost).toBeGreaterThan(0);
  expect(mostExpensiveSeriesId).not.toBe('');

  // Hide the most expensive series.
  const seriesRow = page.locator(
    `.cost-model-legend li[data-series-id="${mostExpensiveSeriesId}"]`,
  );
  const seriesCheckbox = seriesRow.locator('input[type="checkbox"]');

  await expect(seriesCheckbox).toBeChecked();
  // Toggle it from the keyboard. A pointer click needs a hit test, and this
  // checkbox sits in a scrolling list inside a page that scrolls
  // horizontally at mobile widths on the CI runner, so the resolved point kept
  // landing on the chart, the aside, or a neighbouring row. Space on a focused
  // checkbox is a real user path, needs no coordinates, and asserts the same
  // outcome — plus it proves the control is keyboard operable.
  await seriesCheckbox.focus();
  await page.keyboard.press('Space');
  await expect(seriesCheckbox).not.toBeChecked();

  // The upper bound must never grow when a series is removed. It need not
  // shrink on a single removal: the X axis is a bounded 0-100 index snapped
  // to round ticks, so one model can no longer stretch it the way raw USD
  // did. The strict shrink is asserted further down, after enough series are
  // hidden that the bound has to move.
  const newXTitle = (await xAxisTitle.textContent()) ?? '';
  const newMatch = newXTitle.match(/–(\d+(?:\.\d+)?)/);
  expect(newMatch).not.toBeNull();
  const newMax = parseFloat(newMatch![1]!);
  expect(newMax).toBeLessThanOrEqual(initialMax);

  // Assert the hidden series' points are gone, and that nothing which
  // survives is more expensive than the point we removed.
  const remainingPoints = page.locator('.advanced-cost-point');
  const remainingCount = await remainingPoints.count();
  expect(remainingCount).toBeLessThan(pointCount);
  await expect(
    page.locator(
      `.advanced-cost-point[data-series-id="${mostExpensiveSeriesId}"]`,
    ),
  ).toHaveCount(0);

  for (let i = 0; i < remainingCount; i++) {
    const cost = parseFloat(
      (await remainingPoints.nth(i).getAttribute('data-cost-index')) ?? '',
    );
    expect(cost).toBeLessThanOrEqual(maxCost);
  }

  // Now prove the axis really does rescale. The X axis is a 0-100 index whose
  // bounds snap to round ticks, so dropping one series need not move it —
  // that is the scale working as designed, not a missing feature. Hide every
  // series except the one holding the cheapest point; the upper bound then
  // has no choice but to come down.
  const cheapestSeriesId = await (async () => {
    let min = Number.POSITIVE_INFINITY;
    let id = '';
    const live = page.locator('.advanced-cost-point');
    for (let i = 0; i < (await live.count()); i++) {
      const cost = parseFloat(
        (await live.nth(i).getAttribute('data-cost-index')) ?? '',
      );
      if (Number.isFinite(cost) && cost < min) {
        min = cost;
        id = (await live.nth(i).getAttribute('data-series-id')) ?? '';
      }
    }
    return id;
  })();
  expect(cheapestSeriesId).not.toBe('');

  const allCheckboxes = page.locator(
    '.cost-model-legend li input[type="checkbox"]',
  );
  for (let i = 0; i < (await allCheckboxes.count()); i++) {
    const box = allCheckboxes.nth(i);
    const row = page.locator('.cost-model-legend li').nth(i);
    const seriesId = (await row.getAttribute('data-series-id')) ?? '';
    if (seriesId !== cheapestSeriesId && (await box.isChecked())) {
      await box.focus();
      await page.keyboard.press('Space');
    }
  }

  const finalXTitle = (await xAxisTitle.textContent()) ?? '';
  const finalMatch = finalXTitle.match(/–(\d+(?:\.\d+)?)/);
  expect(finalMatch).not.toBeNull();
  expect(parseFloat(finalMatch![1]!)).toBeLessThan(initialMax);
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

test('switches the scored preset from the model-count slider and keeps it in the URL', async ({
  page,
}) => {
  await page.goto('/');

  const slider = page.locator('#preset-model-count');
  const count = page.getByTestId('preset-model-count');
  const sourcesSwitch = page.locator('.preset-sources-switch');

  // Which mode the default preset is in is a user ruling and changes; what
  // must always hold is that the switch's label and its state agree, since the
  // label is the only thing a reader sees.
  const requiresAllSources =
    (await sourcesSwitch.getAttribute('aria-checked')) === 'true';
  await expect(sourcesSwitch).toHaveText(
    requiresAllSources ? 'All sources' : 'Any sources',
  );
  const defaultCount = (await count.textContent()) ?? '';
  const defaultRows = await page
    .locator('.leaderboard-table tbody tr[data-ranked-row]')
    .count();

  // Completeness is judged per profile, so the number on the slider is the
  // number of rows, not an upper bound on it.
  expect(defaultRows).toBe(Number(defaultCount));

  const max = Number(await slider.getAttribute('max'));
  await slider.fill(String(max));
  await expect(count).not.toHaveText(defaultCount);
  await expect(page).toHaveURL(/preset=/u);

  const switchedRows = await page
    .locator('.leaderboard-table tbody tr[data-ranked-row]')
    .count();
  expect(switchedRows).toBe(Number(await count.textContent()));
  expect(switchedRows).not.toBe(defaultRows);

  // The preset survives a reload, which is the point of putting it in the URL.
  const url = page.url();
  await page.goto(url);
  await expect(count).not.toHaveText(defaultCount);
});
