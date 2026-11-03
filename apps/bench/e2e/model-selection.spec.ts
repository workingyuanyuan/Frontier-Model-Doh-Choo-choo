import { expect, test } from '@playwright/test';
import {
  buildCommonComparison,
  commonBenchmarkCountDeltas,
  comparisonOptions,
} from '../lib/common-benchmarks';
import {
  ADVANCED_COST_SOURCE_IDS,
  buildAdvancedCostModelOptions,
  buildAdvancedCostSeries,
  missingAdvancedCostSources,
} from '../lib/view-model';
import {
  benchmarkDimensions,
  commonIds,
  effortDeltas,
  effortSelect,
  findModels,
  hasEfforts,
  product,
  profile,
  profileLabel,
  selectModels,
  type Pick,
} from './product-data';

// A pair whose first model has other efforts that change the common count.
const pair = findModels(
  2,
  (picks) =>
    picks.every(hasEfforts) &&
    commonIds(picks).length > 0 &&
    Object.keys(effortDeltas(picks)).some(
      (id) => profile(id).modelId === picks[0]!.modelId,
    ),
);
const [first, second] = pair as [Pick, Pick];
const firstId = first.modelId;
const secondId = second.modelId;
const selected = {
  [firstId]: first.profileId,
  [secondId]: second.profileId,
};

test('shows effort deltas, copies the common table and restores the comparison from the URL', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  const deltas = commonBenchmarkCountDeltas(
    product,
    [firstId, secondId],
    selected,
    benchmarkDimensions,
    comparisonOptions(product, benchmarkDimensions),
  );
  const firstDeltas = Object.entries(deltas).filter(
    ([id]) => profile(id).modelId === firstId,
  );
  expect(firstDeltas.length).toBeGreaterThan(0);

  await selectModels(page, pair);
  const firstEffort = effortSelect(page, first);
  const secondEffort = effortSelect(page, second);

  // The current effort is the baseline, so it never carries a delta.
  await expect(
    firstEffort.locator(`option[value="${first.profileId}"] .effort-delta`),
  ).toHaveCount(0);
  for (const [profileId, delta] of firstDeltas) {
    const badge = firstEffort.locator(
      `option[value="${profileId}"] .effort-delta`,
    );
    await expect(badge).toHaveText(
      `${delta > 0 ? '+' : '−'}${Math.abs(delta)}`,
    );
    await expect(badge).toHaveAttribute(
      'data-direction',
      delta > 0 ? 'up' : 'down',
    );
  }

  const comparison = buildCommonComparison(
    product,
    [firstId, secondId],
    selected,
    benchmarkDimensions,
  );
  const section = page.getByRole('region', {
    name: 'Common benchmarks',
    exact: true,
  });
  await section
    .getByRole('button', { name: 'Copy common benchmarks as Markdown' })
    .click();
  await expect(
    section.getByRole('status').filter({ hasText: 'Copied!' }),
  ).toBeVisible();
  const lines = (
    await page.evaluate(() => navigator.clipboard.readText())
  ).split(/\r?\n/);
  expect(lines[0]).toBe(
    `| Benchmark | ${profileLabel(first.profileId)} | ${profileLabel(second.profileId)} | Difference (first − second) |`,
  );
  expect(lines).toHaveLength(2 + (await section.locator('tbody tr').count()));
  expect(lines.join('\n')).not.toMatch(/https?:|Original score/);
  expect(comparison.benchmarkIds.length).toBeGreaterThan(0);

  await expect(page).toHaveURL(/[?&]dev=1/);
  await expect(page).toHaveURL(
    new RegExp(
      `[?&]models=${firstId}%2C${secondId}|[?&]models=${firstId},${secondId}`,
    ),
  );
  await page.reload();
  await expect(section).toBeVisible();
  await expect(firstEffort).toHaveValue(first.profileId);
  await expect(secondEffort).toHaveValue(second.profileId);
  await expect(
    page.getByRole('button', { name: /Search Models/ }),
  ).toContainText('2 selected');
});

test('names missing sources and hands the chart shortlist to the leaderboard', async ({
  page,
}) => {
  const series = buildAdvancedCostSeries(product, ADVANCED_COST_SOURCE_IDS);
  const excluded = buildAdvancedCostModelOptions(product).find(
    (model) =>
      !series.some(({ seriesId }) => seriesId === model.seriesId) &&
      missingAdvancedCostSources(model, ADVANCED_COST_SOURCE_IDS).length,
  );
  expect(excluded).toBeDefined();
  const options = new Set(
    comparisonOptions(product, benchmarkDimensions).map(
      ({ modelId }) => modelId,
    ),
  );
  const kept = series.filter(({ modelId }) => options.has(modelId)).slice(0, 2);
  expect(kept).toHaveLength(2);

  await page.goto('/');
  await page.locator('.cost-mode-toggle').click();
  await page.locator('.cost-model-overflow-trigger').click();
  const missingTags = page.locator(
    `.cost-model-menu-list li[data-series-id="${excluded!.seriesId}"] .cost-model-missing-source`,
  );
  const missing = missingAdvancedCostSources(
    excluded!,
    ADVANCED_COST_SOURCE_IDS,
  );
  await expect(missingTags).toHaveCount(missing.length);
  expect(
    await missingTags.evaluateAll((tags) =>
      tags.map((tag) => tag.getAttribute('data-source-id')),
    ),
  ).toEqual(missing);

  for (const line of series) {
    if (kept.includes(line)) continue;
    await page
      .locator(
        `.cost-model-menu-list li[data-series-id="${line.seriesId}"] input[type="checkbox"]`,
      )
      .click();
  }
  await page.getByRole('button', { name: 'Use in Leaderboard' }).click();
  await expect(
    page.getByRole('button', { name: /Search Models/ }),
  ).toContainText('2 selected');
  await expect(page.locator('[data-ranked-row]')).toHaveCount(2);
  for (const line of kept) {
    const profileId = await page
      .locator('[data-ranked-row]')
      .evaluateAll(
        (rows, modelId) =>
          rows
            .map((row) => row.getAttribute('data-profile-id')!)
            .find((id) => id.startsWith(`${modelId}-`)),
        line.modelId,
      );
    expect(line.points.map((point) => point.profileId)).toContain(profileId);
  }
});

test('restores a shared comparison on a non-default preset', async ({
  page,
}) => {
  const preset = product.presets.find(
    ({ id }) => id !== product.defaultPresetId,
  )!;
  await page.goto(`/?preset=${preset.id}&models=${firstId},${secondId}`);
  await expect(
    page.getByRole('button', { name: /Search Models/ }),
  ).toContainText('2 selected');
  await expect(page.locator('[data-ranked-row]')).toHaveCount(2);
  await expect(page).toHaveURL(new RegExp(`[?&]preset=${preset.id}`));
  await expect(page).toHaveURL(/[?&]models=/);
});

test('drops pins the chart hides and never pins the handed-over effort', async ({
  page,
}) => {
  const options = new Set(
    comparisonOptions(product, benchmarkDimensions).map(
      ({ modelId }) => modelId,
    ),
  );
  const series = buildAdvancedCostSeries(product, ADVANCED_COST_SOURCE_IDS);
  const line = series.find(
    ({ modelId, points }) => options.has(modelId) && points.length >= 2,
  )!;
  expect(line).toBeDefined();
  const kept = line.points[0]!.profileId;

  await page.goto('/');
  await page.getByRole('button', { name: /Search Models/ }).click();
  await page.getByRole('button', { name: 'Clear', exact: true }).click();
  await page
    .getByRole('checkbox', { name: line.displayName, exact: true })
    .check();
  await page.keyboard.press('Escape');
  await page
    .getByRole('combobox', {
      name: `Select profile for ${line.displayName}`,
      exact: true,
    })
    .selectOption(kept);
  await page
    .getByRole('button', { name: new RegExp(`^Keep ${line.displayName} `) })
    .click();
  await expect(page.locator('[data-pinned="true"]')).toHaveAttribute(
    'data-profile-id',
    kept,
  );

  await page.locator('.cost-mode-toggle').click();
  await page.locator('.cost-model-overflow-trigger').click();
  for (const other of series) {
    if (other === line) continue;
    await page
      .locator(
        `.cost-model-menu-list li[data-series-id="${other.seriesId}"] input[type="checkbox"]`,
      )
      .click();
  }
  const row = page.locator(
    `.cost-model-menu-list li[data-series-id="${line.seriesId}"]`,
  );
  for (const point of line.points.slice(1)) {
    await row
      .locator(`.cost-effort-toggle[data-profile-id="${point.profileId}"]`)
      .click();
  }
  await page.getByRole('button', { name: 'Use in Leaderboard' }).click();
  await expect(page.locator('[data-ranked-row]')).toHaveCount(1);
  await expect(page.locator('[data-pinned="true"]')).toHaveCount(0);
  await expect(
    page.getByRole('combobox', {
      name: `Select profile for ${line.displayName}`,
      exact: true,
    }),
  ).toHaveValue(kept);
});

test('clears and restores the advanced cost chart models from the menu', async ({
  page,
}) => {
  await page.goto('/');
  await page.locator('.cost-mode-toggle').click();
  await page.locator('.cost-model-overflow-trigger').click();

  const actions = page.locator('.cost-model-menu-actions button');
  // Same order as the Search Models picker: primary action, Clear, Default.
  await expect(actions).toHaveText(['Use in Leaderboard', 'Clear', 'Default']);

  const checked = page.locator(
    '.cost-model-menu-list input[type="checkbox"]:checked',
  );
  const initialChecked = await checked.count();
  expect(initialChecked).toBeGreaterThan(0);
  const useInLeaderboard = actions.filter({ hasText: 'Use in Leaderboard' });

  await actions.filter({ hasText: 'Clear' }).click();
  await expect(checked).toHaveCount(0);
  await expect(useInLeaderboard).toBeDisabled();

  await actions.filter({ hasText: 'Default' }).click();
  await expect(checked).toHaveCount(initialChecked);
  await expect(useInLeaderboard).toBeEnabled();
});
