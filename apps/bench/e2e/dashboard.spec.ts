import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import type { ProductVersion } from '@llm-bench/benchmark-data';
import {
  ADVANCED_COST_SOURCE_IDS,
  buildAdvancedCostSeries,
  withActivePreset,
  getPartialCoverageRows,
  isMainEligibleRow,
} from '../lib/view-model';

const currentProduct = JSON.parse(
  readFileSync('data/product/current.json', 'utf8'),
) as ProductVersion;

test('switches and persists the icon-only color theme', async ({ page }) => {
  await page.goto('/');

  const themeGroup = page.getByRole('group', { name: 'Theme' });
  const developerMode = page.getByRole('switch', { name: 'Developer mode' });
  const lightTheme = page.getByRole('button', { name: 'Light theme' });
  const darkTheme = page.getByRole('button', { name: 'Dark theme' });
  const blueTheme = page.getByRole('button', { name: 'Blue theme' });

  await expect(themeGroup).toBeVisible();
  await expect(blueTheme).toHaveAttribute('aria-pressed', 'true');
  await expect(lightTheme).toHaveText('');
  await expect(darkTheme).toHaveText('');
  await expect(blueTheme).toHaveText('');

  const themeBox = await themeGroup.boundingBox();
  const developerBox = await developerMode.boundingBox();
  expect(themeBox).not.toBeNull();
  expect(developerBox).not.toBeNull();
  expect(themeBox!.x).toBeLessThan(developerBox!.x);

  await darkTheme.focus();
  await darkTheme.press('Enter');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(darkTheme).toHaveAttribute('aria-pressed', 'true');
  const darkThemeStyle = await page.evaluate(() => {
    const tokens = getComputedStyle(document.documentElement);
    return {
      accent: tokens.getPropertyValue('--accent').trim(),
      radius: tokens.getPropertyValue('--radius-md').trim(),
      leak: getComputedStyle(document.body, '::before').backgroundImage,
      grain: getComputedStyle(document.body, '::after').backgroundImage,
    };
  });
  expect(darkThemeStyle.accent).toBe('#a95d35');
  expect(darkThemeStyle.radius).toBe('2px');
  expect(darkThemeStyle.leak).not.toBe('none');
  expect(darkThemeStyle.grain).not.toBe('none');
  expect(await page.evaluate(() => localStorage.getItem('fm-dcc-theme'))).toBe(
    'dark',
  );

  await lightTheme.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(lightTheme).toHaveAttribute('aria-pressed', 'true');
  const lightThemeStyle = await page.evaluate(() => {
    const tokens = getComputedStyle(document.documentElement);
    return {
      accent: tokens.getPropertyValue('--accent').trim(),
      displayFont: tokens.getPropertyValue('--font-display').trim(),
      canvas: tokens.getPropertyValue('--surface-subtle').trim(),
    };
  });
  expect(lightThemeStyle.accent).toBe('#cc785c');
  expect(lightThemeStyle.displayFont).toContain('Copernicus');
  expect(lightThemeStyle.canvas).toBe('#faf9f5');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(lightTheme).toHaveAttribute('aria-pressed', 'true');
});

test('places dashboard labels above and outside their panels with section spacing', async ({
  page,
}) => {
  await page.goto('/');

  const sections = page.locator('.dashboard-section');
  const labels = page.locator('.section-eyebrow');
  await expect(sections).toHaveCount(3);
  await expect(labels).toHaveCount(3);

  for (let index = 0; index < 3; index += 1) {
    const label = labels.nth(index);
    expect(
      await label.evaluate(
        (element) =>
          element.closest('section') === null &&
          element.nextElementSibling?.tagName === 'SECTION',
      ),
    ).toBe(true);
  }

  for (let index = 1; index < 3; index += 1) {
    const previous = await sections.nth(index - 1).boundingBox();
    const current = await sections.nth(index).boundingBox();
    expect(previous).not.toBeNull();
    expect(current).not.toBeNull();
    expect(
      current!.y - (previous!.y + previous!.height),
    ).toBeGreaterThanOrEqual(24);
  }
});

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
  const partialCoverageRegion = page.getByRole('region', {
    name: 'Partial coverage scores',
  });
  if (getPartialCoverageRows(withActivePreset(currentProduct)).length > 0) {
    await expect(partialCoverageRegion).toBeVisible();
    await developerModelButton.focus();
    await page.keyboard.press('Shift+Tab');
    await expect(partialCoverageRegion).toBeFocused();
    const isHorizontallyScrollable = await partialCoverageRegion.evaluate(
      (element) => {
        element.scrollLeft = 0;
        return element.scrollWidth > element.clientWidth;
      },
    );
    if (isHorizontallyScrollable) {
      await page.keyboard.press('ArrowRight');
      await expect
        .poll(() =>
          partialCoverageRegion.evaluate((element) => element.scrollLeft),
        )
        .toBeGreaterThan(0);
    }
  } else {
    await expect(page.locator('[data-partial-coverage]')).toContainText(
      'No profile is missing exactly one dimension.',
    );
  }
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
  await expect(
    page.locator('.cost-model-menu-list li.is-selected'),
  ).toHaveCount(0);

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
  await expect(
    page.locator('.cost-model-menu-list li.is-selected'),
  ).toHaveCount(0);

  // Cost chart owns its highlight: clicking a point toggles highlight
  const costPoint = page.locator('.cost-point').first();
  await costPoint.click();
  await expect(page.locator('.cost-point.is-selected')).toHaveCount(1);
  await expect(
    page.locator('.cost-model-menu-list li.is-selected'),
  ).toHaveCount(1);

  // Toggle off on re-click
  await costPoint.click();
  await expect(page.locator('.cost-point.is-selected')).toHaveCount(0);
  await expect(
    page.locator('.cost-model-menu-list li.is-selected'),
  ).toHaveCount(0);

  // The shared Models menu controls the default plot highlight.
  await page.locator('.cost-model-overflow-trigger').click();
  const modelItem = page.locator('.cost-model-menu-list li').first();
  await modelItem.getByRole('button').click();
  await expect(page.locator('.cost-point.is-selected')).toHaveCount(1);
  await expect(modelItem).toHaveClass(/is-selected/);

  // Re-clicking the model entry toggles it off.
  await modelItem.getByRole('button').click();
  await expect(page.locator('.cost-point.is-selected')).toHaveCount(0);
  await expect(modelItem).not.toHaveClass(/is-selected/);

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
  await expect(count).toHaveText(/^[1-8] of 8$/);

  // Table: the same count per row, plus a named basis for every source.
  await page.getByRole('switch', { name: 'Developer mode' }).click();
  await page.locator('.cost-chart-data > summary').click();

  const counts = page.getByTestId('cost-row-source-count');
  const total = await counts.count();
  expect(total).toBeGreaterThan(0);
  for (let index = 0; index < total; index += 1) {
    await expect(counts.nth(index)).toHaveText(/^[1-8] of 8$/);
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
    exact: true,
  });
  test.skip(
    (await select.count()) === 0,
    'Current product has no alternative Fable profile',
  );

  const row = page.locator('[data-ranked-row]').filter({ has: select });
  const before = await row.innerText();
  const values = await select
    .locator('option')
    .evaluateAll((options) =>
      options.map((option) => (option as HTMLOptionElement).value),
    );
  expect(values.length).toBeGreaterThan(1);
  const current = await select.inputValue();
  await select.selectOption(values.find((value) => value !== current)!);
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
  await expect(toggle).toHaveText('Advanced');
  await toggle.focus();
  await expect(toggle).toBeFocused();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await page.keyboard.press('Enter');
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(toggle).toHaveText('Default');
  await expect(page.locator('.advanced-cost-chart')).toBeVisible();
  await expect(
    page
      .locator('.cost-panel')
      .getByText('Lower cost is better. Higher Overall Score is better.'),
  ).toBeVisible();
  const sourceButtons = page.locator('.advanced-source-toggle');
  await expect(sourceButtons).toHaveCount(6);
  for (let i = 0; i < (await sourceButtons.count()); i++) {
    const button = sourceButtons.nth(i);
    const sourceId = await button.getAttribute('data-source-id');
    await expect(button).toHaveAttribute(
      'aria-pressed',
      sourceId === 'cursorbench' ? 'false' : 'true',
    );
  }
  const zapier = page.locator(
    '.advanced-source-toggle[data-source-id="zapier-automationbench"]',
  );
  await expect(zapier).toHaveText('Zapier');
  const scoreAxis = page
    .locator('.advanced-cost-chart .cost-axis-title')
    .last();
  await expect(scoreAxis).toContainText('5-source mean score');
  await zapier.press('Enter');
  await expect(zapier).toHaveAttribute('aria-pressed', 'false');
  await expect(scoreAxis).toContainText('4-source mean score');
  await zapier.press('Enter');
  await expect(scoreAxis).toContainText('5-source mean score');
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
  await page.locator('.cost-model-overflow-trigger').click();

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
    `.cost-model-menu-list li[data-series-id="${mostExpensiveSeriesId}"]`,
  );
  const seriesCheckbox = seriesRow.locator('input[type="checkbox"]');

  await expect(seriesCheckbox).toBeEnabled();
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
    '.cost-model-menu-list li input[type="checkbox"]',
  );
  for (let i = 0; i < (await allCheckboxes.count()); i++) {
    const box = allCheckboxes.nth(i);
    const row = page.locator('.cost-model-menu-list li').nth(i);
    const seriesId = (await row.getAttribute('data-series-id')) ?? '';
    const visibleSeriesPoints = page.locator(
      `.advanced-cost-point[data-series-id="${seriesId}"]`,
    );
    if (seriesId !== cheapestSeriesId && (await visibleSeriesPoints.count())) {
      await box.focus();
      await page.keyboard.press('Space');
    }
  }

  // Keep only the cheapest effort, since another effort in its model may
  // still set the original rounded axis bound.
  const surviving = await page
    .locator('.advanced-cost-point')
    .evaluateAll((nodes) =>
      nodes.map((node) => ({
        id: node.getAttribute('data-profile-id')!,
        cost: Number(node.getAttribute('data-cost-index')),
      })),
    );
  surviving.sort((a, b) => a.cost - b.cost);
  for (const point of surviving.slice(1)) {
    const button = page.locator(
      `.cost-effort-toggle[data-profile-id="${point.id}"]`,
    );
    await button.focus();
    await page.keyboard.press('Space');
  }

  const finalXTitle = (await xAxisTitle.textContent()) ?? '';
  const finalMatch = finalXTitle.match(/–(\d+(?:\.\d+)?)/);
  expect(finalMatch).not.toBeNull();
  expect(parseFloat(finalMatch![1]!)).toBeLessThan(initialMax);
});

test('recomputes source eligibility and supports model and effort controls', async ({
  page,
}) => {
  const before = buildAdvancedCostSeries(currentProduct);
  const scenario = ADVANCED_COST_SOURCE_IDS.flatMap((sourceId) =>
    buildAdvancedCostSeries(
      currentProduct,
      ADVANCED_COST_SOURCE_IDS.filter((id) => id !== sourceId),
    ).flatMap((model) => {
      const oldPoints =
        before.find((line) => line.seriesId === model.seriesId)?.points ?? [];
      const gained = model.points.find(
        (point) => !oldPoints.some((old) => old.profileId === point.profileId),
      );
      return model.points.length >= 2 && gained
        ? [{ sourceId, model, oldPoints, gained }]
        : [];
    }),
  )[0];
  expect(scenario).toBeDefined();
  const { sourceId, model, oldPoints, gained } = scenario!;
  await page.goto('/');
  await page.locator('.cost-mode-toggle').click();
  await page.locator('.cost-model-overflow-trigger').click();
  const row = page.locator(
    `.cost-model-menu-list li[data-series-id="${model.seriesId}"]`,
  );
  const total = await row.locator('.cost-effort-toggle').count();
  await expect(row).toContainText(`${oldPoints.length}/${total}`);
  const effort = row.locator(
    `.cost-effort-toggle[data-profile-id="${gained.profileId}"]`,
  );
  await expect(effort).toBeDisabled();
  const source = page.locator(
    `.advanced-source-toggle[data-source-id="${sourceId}"]`,
  );
  await source.focus();
  await page.keyboard.press('Enter');
  await expect(source).toHaveAttribute('aria-pressed', 'false');
  await expect(effort).toBeEnabled();
  await expect(effort).toHaveAttribute('aria-pressed', 'true');
  const points = page.locator(
    `.advanced-cost-point[data-series-id="${model.seriesId}"]`,
  );
  await expect(points).toHaveCount(model.points.length);
  await expect(
    page.locator('.advanced-cost-chart .cost-axis-title').last(),
  ).toContainText(`${ADVANCED_COST_SOURCE_IDS.length - 1}-source mean score`);
  const checkbox = row.locator('input[type="checkbox"]');
  await checkbox.focus();
  await page.keyboard.press('Space');
  await expect(points).toHaveCount(0);
  await expect(row).toContainText(`0/${total}`);
  await checkbox.focus();
  await page.keyboard.press('Space');
  await expect(points).toHaveCount(model.points.length);
  await effort.focus();
  await page.keyboard.press('Space');
  await expect(effort).toHaveAttribute('aria-pressed', 'false');
  await expect(points).toHaveCount(model.points.length - 1);
  await expect(checkbox).toHaveJSProperty('indeterminate', true);
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

    await page.locator('.cost-model-overflow-trigger').click();
    await expect(page.locator('.cost-model-overflow-menu')).toBeVisible();
    const menuOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(menuOverflow).toBeLessThanOrEqual(1);
    await page.locator('.cost-model-overflow-trigger').click();

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
    name: /Search Models/,
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

test('keeps the model picker visible on wide screens', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await expect(page.locator('.picker-trigger-btn')).toBeVisible();
  await expect(page.locator('.preset-slider')).toBeVisible();
});

test('uses an equal-width cost toolbar and full-width charts in both modes', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');

  await expect(page.locator('.cost-model-legend')).toHaveCount(0);
  const modeTrigger = page.locator('.cost-mode-toggle');
  const modelsTrigger = page.locator('.cost-model-overflow-trigger');
  const modelsLabel = modelsTrigger.locator('span');
  const modelsChevron = modelsTrigger.locator('svg');
  const weightNote = page.locator('.cost-weight-note');
  const weightBox = await weightNote.boundingBox();
  const modeBox = await modeTrigger.boundingBox();
  const modelsBox = await modelsTrigger.boundingBox();
  const modelsLabelBox = await modelsLabel.boundingBox();
  const modelsChevronBox = await modelsChevron.boundingBox();
  expect(weightBox).not.toBeNull();
  expect(modeBox).not.toBeNull();
  expect(modelsBox).not.toBeNull();
  expect(modelsLabelBox).not.toBeNull();
  expect(modelsChevronBox).not.toBeNull();
  if (weightBox && modeBox && modelsBox) {
    expect(weightBox.x + weightBox.width).toBeLessThanOrEqual(modeBox.x);
    expect(modeBox.x).toBeLessThan(modelsBox.x);
    expect(Math.abs(modeBox.width - modelsBox.width)).toBeLessThanOrEqual(1);
    expect(Math.abs(modeBox.height - modelsBox.height)).toBeLessThanOrEqual(1);
  }
  if (modelsLabelBox && modelsChevronBox) {
    expect(
      Math.abs(
        modelsLabelBox.y +
          modelsLabelBox.height / 2 -
          (modelsChevronBox.y + modelsChevronBox.height / 2),
      ),
    ).toBeLessThanOrEqual(1);
  }

  const defaultLayout = await page.locator('.cost-curve-layout').boundingBox();
  const defaultPlot = await page.locator('.cost-plot-wrap').boundingBox();
  expect(defaultLayout).not.toBeNull();
  expect(defaultPlot).not.toBeNull();
  if (defaultLayout && defaultPlot) {
    expect(
      Math.abs(defaultLayout.width - 40 - defaultPlot.width),
    ).toBeLessThanOrEqual(1);
  }

  const panel = page.locator('.cost-panel');
  const panelHeightBefore = (await panel.boundingBox())?.height;
  await modelsTrigger.focus();
  await page.keyboard.press('Enter');
  await expect(modelsTrigger).toHaveAttribute('aria-expanded', 'true');
  await expect(
    page.getByRole('list', { name: 'Models in default cost chart' }),
  ).toBeVisible();
  const panelHeightAfter = (await panel.boundingBox())?.height;
  expect(panelHeightAfter).toBe(panelHeightBefore);

  await modeTrigger.click();
  await expect(page.locator('.advanced-cost-chart')).toBeVisible();
  const sourceControlsBox = await page
    .locator('.advanced-source-controls')
    .boundingBox();
  const advancedModeBox = await modeTrigger.boundingBox();
  expect(sourceControlsBox).not.toBeNull();
  expect(advancedModeBox).not.toBeNull();
  if (sourceControlsBox && advancedModeBox) {
    expect(sourceControlsBox.x + sourceControlsBox.width).toBeLessThanOrEqual(
      advancedModeBox.x,
    );
  }
  await expect(modelsTrigger).toHaveAttribute('aria-expanded', 'false');
  await modelsTrigger.click();
  await expect(
    page.getByRole('list', { name: 'Models in advanced cost chart' }),
  ).toBeVisible();
  const advancedLayout = await page
    .locator('.advanced-cost-layout')
    .boundingBox();
  const advancedPlot = await page
    .locator('.advanced-cost-layout .cost-plot-wrap')
    .boundingBox();
  expect(advancedLayout).not.toBeNull();
  expect(advancedPlot).not.toBeNull();
  if (advancedLayout && advancedPlot) {
    expect(
      Math.abs(advancedLayout.width - 40 - advancedPlot.width),
    ).toBeLessThanOrEqual(1);
  }
});

test('shows cost chart source contributions only in developer mode', async ({
  page,
}) => {
  await page.goto('/');

  const sourceContributions = page.getByText(
    'Quality vs. Cost chart data and source contributions',
  );
  await expect(sourceContributions).toHaveCount(0);

  await page.getByRole('switch', { name: 'Developer mode' }).click();
  await expect(sourceContributions).toBeVisible();
});

test('restores the AA model-count slider and persists each cohort in the URL', async ({
  page,
}, info) => {
  test.setTimeout(90_000);
  expect(currentProduct.presets).toHaveLength(9);
  await page.goto('/');
  const slider = page.locator('#preset-model-count');
  await expect(slider).toHaveAttribute('min', '2');
  await expect(slider).toHaveAttribute('max', '10');
  await expect(slider).toHaveValue('8');
  for (const count of [2, 3, 4, 5, 6, 7, 8, 9, 10]) {
    await slider.fill(String(count));
    const preset = currentProduct.presets.find(
      (p) => p.targetModelCount === count,
    )!;
    await expect(page.locator('[data-ranked-row]')).toHaveCount(count);
    expect(
      (
        await page
          .locator('[data-ranked-row]')
          .evaluateAll((rows) =>
            rows.map((r) => r.getAttribute('data-profile-id')),
          )
      ).sort(),
    ).toEqual(preset.leaderboard.map((r) => r.profileId).sort());
    const axes = preset.leaderboard[0]!.dimensions.filter(
      (d) => d.score !== null,
    ).length;
    await expect(page.locator('.radar-axis')).toHaveCount(axes);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - innerWidth,
      ),
    ).toBeLessThanOrEqual(1);
  }
  await expect(page).toHaveURL(/preset=aa-top-10/);
  await page.reload();
  await expect(slider).toHaveValue('10');
  await expect(page.locator('[data-ranked-row]')).toHaveCount(10);
  await page.getByRole('button', { name: /Search Models/ }).click();
  await page.getByRole('button', { name: 'Clear', exact: true }).click();
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-ranked-row]')).toHaveCount(0);
  await slider.fill('8');
  await expect(page.locator('[data-ranked-row]')).toHaveCount(8);
  await page.screenshot({
    path: info.outputPath('restored-slider.png'),
    fullPage: true,
  });
});

test('restores the frontier profiles after a manual effort comparison', async ({
  page,
}) => {
  await page.goto('/');
  const expectedProfiles = await page
    .locator('[data-ranked-row]')
    .evaluateAll((rows) =>
      rows.map((row) => row.getAttribute('data-profile-id')),
    );
  const effort = page.locator('.profile-table-select').first();
  const original = await effort.inputValue();
  const alternative = await effort
    .locator('option')
    .evaluateAll(
      (options, selected) =>
        options
          .map((option) => (option as HTMLOptionElement).value)
          .find((value) => value !== selected),
      original,
    );
  expect(alternative).toBeDefined();
  await effort.selectOption(alternative!);
  await page.getByRole('button', { name: /Search Models/ }).click();
  await page.getByRole('button', { name: 'Default', exact: true }).click();
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-ranked-row]')).toHaveCount(8);
  expect(
    await page
      .locator('[data-ranked-row]')
      .evaluateAll((rows) =>
        rows.map((row) => row.getAttribute('data-profile-id')),
      ),
  ).toEqual(expectedProfiles);
});

test('renders a complete refreshed ranking and the audited version', async ({
  page,
}) => {
  const preset = withActivePreset(currentProduct).activePreset;
  const expected = preset.leaderboard
    .filter((row) => isMainEligibleRow(currentProduct, row, preset))
    .toSorted((a, b) => b.overallScore! - a.overallScore!)[0]!;
  expect(
    expected,
    'The refreshed default must have a complete model',
  ).toBeDefined();
  const profile = currentProduct.profiles.find(
    (candidate) => candidate.id === expected.profileId,
  )!;
  await page.goto(`/?preset=${preset.id}`);
  const row = page
    .locator('[data-ranked-row]')
    .filter({ hasText: profile.baseModelName });
  await expect(row).toHaveCount(1);
  expect(expected.overallScore).not.toBeNull();
  await expect(row).toContainText(expected.overallScore!.toFixed(1));
  await expect(row).not.toContainText('N/A');
  await expect(page.locator('footer')).toContainText(currentProduct.versionId);
  await row.getByRole('button').first().click();
  const detail = page.locator(`[data-model-detail="${expected.modelId}"]`);
  await expect(detail).toBeVisible();
  await expect(detail).toContainText(profile.attributes.effort ?? 'default');
  await page.goto('/');
  await expect(
    page
      .locator('[data-ranked-row]')
      .filter({ hasText: profile.baseModelName }),
  ).toHaveCount(1);
});

test('discloses partial-coverage profiles in developer mode, outside the ranked table', async ({
  page,
}) => {
  await page.goto('/');

  const panel = page.locator('[data-partial-coverage]');
  await expect(panel).toHaveCount(0);

  await page.getByRole('switch', { name: 'Developer mode' }).click();
  await expect(panel).toBeVisible();

  const partialRows = page.locator('[data-partial-coverage-row]');
  const partialCount = await partialRows.count();
  expect(partialCount).toBe(
    getPartialCoverageRows(withActivePreset(currentProduct)).length,
  );
  await expect(
    page.locator(`[data-partial-coverage-count="${partialCount}"]`),
  ).toBeVisible();

  // R19: the list carries no aggregate and no position.
  await expect(panel).not.toContainText('Overall');
  await expect(panel).not.toContainText('Rank');

  // The ranked table is one row per model at the preset's target count, and it
  // never shows an N/A cell; every profile listed above has one.
  const rankedRows = page.locator('[data-ranked-row]');
  expect(await rankedRows.count()).toBe(
    withActivePreset(currentProduct).activePreset.targetModelCount,
  );
  expect(
    (await rankedRows.allTextContents()).every((text) => !text.includes('N/A')),
  ).toBe(true);

  // Every listed profile shows exactly one N/A dimension cell.
  const naCounts = await partialRows.evaluateAll((nodes) =>
    nodes.map(
      (node) =>
        [...node.querySelectorAll('td')].filter(
          (cell) => cell.textContent?.trim() === 'N/A',
        ).length,
    ),
  );
  expect(naCounts.every((count) => count === 1)).toBe(true);
});
