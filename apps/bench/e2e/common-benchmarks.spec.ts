import { expect, test } from '@playwright/test';
import {
  commonRow,
  findPair,
  commonIds,
  commonSection,
  effortDeltas,
  effortSelect,
  expectCommonRow,
  findModels,
  hasEfforts,
  sharedEfforts,
  product,
  profile,
  profileLabel,
  profilesOf,
  rowsFor,
  selectModels,
  type Pick,
} from './product-data';

type Row = ReturnType<typeof rowsFor>[number];
const first = (benchmarkId: string, p: Pick) =>
  rowsFor(benchmarkId, p.profileId)[0]!;
const score = (row: Row) => row.normalizedScore!.toFixed(1);

// Each source-backed benchmark: two profiles that share it show their own
// scores, publisher labels and evidence links. Provenance scenarios are
// required where listed; missing data skips the test visibly.
const sourceBenchmarks: [
  string,
  string,
  string?,
  ((a: Row, b: Row) => boolean)?,
][] = [
  ['chartography', 'Chartography'],
  ['complex-constraints', 'ComplexConstraints'],
  ['enterprisebench-corecraft', 'EnterpriseBench: CoreCraft'],
  ['dayjob-finance', 'DAYJOB: Finance'],
  ['dayjob-healthcare', 'DAYJOB: Healthcare'],
  ['gdp-pdf', 'GDP.pdf'],
  ['gdp-xlsx', 'GDP.xlsx'],
  ['riemann-bench', 'Riemann-bench'],
  ['frontier-swe-v2', 'FrontierSWE V2'],
  ['automationbench', 'AutomationBench'],
  [
    'deepswe-1-1',
    'DeepSWE 1.1',
    'a vendor preview beside an organizer measurement',
    (a, b) => a.sourceRole === 'VENDOR' && b.sourceRole !== 'VENDOR',
  ],
  [
    'cursorbench-4',
    'CursorBench 4.0',
    'two different publishers',
    (a, b) => a.sourceId !== b.sourceId,
  ],
];

for (const [benchmarkId, label, scenario, rule] of sourceBenchmarks) {
  test(`compares ${label} scores with ${scenario ?? 'their evidence'}`, async ({
    page,
  }) => {
    const pair = findPair(
      benchmarkId,
      (a, b) => !rule || rule(first(benchmarkId, a), first(benchmarkId, b)),
    );
    test.skip(
      !pair,
      `no two pickable profiles share ${label}${scenario ? ` with ${scenario}` : ''}`,
    );
    await selectModels(page, pair!);
    await expectCommonRow(page, label, benchmarkId, pair!);
  });
}

// Changing one model's effort either updates its score (another measured
// effort) or removes the row (an unmeasured effort).
for (const measured of [true, false]) {
  test(`${measured ? 'updates the score for another measured' : 'removes the row for an unmeasured'} effort`, async ({
    page,
  }) => {
    const found = sourceBenchmarks.flatMap(([benchmarkId, label]) => {
      let alt: string | undefined;
      const pair = findPair(benchmarkId, (a, b) => {
        alt = profilesOf(a.modelId).find((id) => {
          const rows = rowsFor(benchmarkId, id);
          if (!measured) return rows.length === 0;
          return (
            id !== a.profileId &&
            rows.length === 1 &&
            score(rows[0]!) !== score(first(benchmarkId, a)) &&
            commonIds([{ ...a, profileId: id }, b]).includes(benchmarkId)
          );
        });
        return Boolean(alt);
      });
      return pair ? [{ benchmarkId, label, pair, alt: alt! }] : [];
    })[0];
    test.skip(
      !found,
      `no source benchmark has a ${measured ? 'measured' : 'missing'} alternative effort`,
    );
    const { benchmarkId, label, pair, alt } = found!;
    await selectModels(page, pair);
    await expectCommonRow(page, label, benchmarkId, pair);
    await effortSelect(page, pair[0]).selectOption(alt);
    if (measured)
      await expectCommonRow(page, label, benchmarkId, [
        { ...pair[0], profileId: alt },
        pair[1],
      ]);
    else await expect(commonRow(page, label)).toHaveCount(0);
  });
}

test('keeps comparison-only benchmarks out of presets and restores the default', async ({
  page,
}) => {
  expect(
    product.presets.every(
      (preset) => !preset.benchmarkIds.includes('frontier-swe-v2'),
    ),
  ).toBe(true);
  await page.goto('/');
  await page.getByRole('switch', { name: 'Developer mode' }).click();
  const section = commonSection(page);
  // The default selection is compared before the user touches the picker.
  await expect(section).toBeVisible();
  await expect(section.locator('thead th')).toHaveCount(
    product.activePreset.targetModelCount + 1,
  );
  await page.getByRole('button', { name: /Search Models/ }).click();
  await page.getByRole('button', { name: 'Clear', exact: true }).click();
  await page.getByRole('button', { name: 'Default', exact: true }).click();
  await page.keyboard.press('Escape');
  await expect(section.locator('thead th')).toHaveCount(
    product.activePreset.targetModelCount + 1,
  );
});

test('keeps one effort while comparing another and removes the saved effort', async ({
  page,
}) => {
  const [model] = findModels(1, ([p]) => Boolean(sharedEfforts(p!)));
  const [kept, compared] = sharedEfforts(model!)!;
  const keptLabel = profileLabel(kept!).replace(' · ', ' ');
  await selectModels(page, [{ ...model!, profileId: kept! }]);
  const effort = effortSelect(page, model!);
  await page
    .getByRole('button', {
      name: `Keep ${keptLabel} for comparison`,
      exact: true,
    })
    .click();
  await effort.selectOption(compared!);
  await expect(page.locator('[data-ranked-row]')).toHaveCount(2);
  await expect(page.locator('[data-pinned="true"]')).toHaveAttribute(
    'data-profile-id',
    kept!,
  );
  await expect(effort.locator(`option[value="${kept}"]`)).toHaveJSProperty(
    'disabled',
    true,
  );
  const comparison = commonSection(page);
  await expect(comparison.locator('thead')).toContainText(profileLabel(kept!));
  await expect(comparison.locator('thead')).toContainText(
    profileLabel(compared!),
  );
  await expect(
    comparison.getByRole('columnheader', { name: /Difference/ }),
  ).toBeVisible();
  await expect(page.locator('.series-legend')).toContainText(
    profileLabel(kept!),
  );
  await page
    .locator('[data-pinned="true"]')
    .getByRole('button', { name: model!.name, exact: true })
    .click();
  await expect(page.locator('.leaderboard-expansion-row')).toHaveCount(1);
  await page
    .getByRole('button', {
      name: `Remove ${keptLabel} from comparison`,
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
  // A pair where switching the first model's effort changes, but keeps, the
  // common basis.
  const switchOf = (picks: Pick[]) =>
    Object.entries(effortDeltas(picks)).find(
      ([id, delta]) =>
        profile(id).modelId === picks[0]!.modelId &&
        commonIds(picks).length + delta > 0,
    )?.[0];
  const pair = findModels(
    2,
    (picks) =>
      hasEfforts(picks[0]!) &&
      commonIds(picks).length > 0 &&
      Boolean(switchOf(picks)),
  );
  const switchTo = switchOf(pair)!;
  await selectModels(page, pair);
  const section = commonSection(page);
  await expect(section).toBeVisible();
  await expect(page.locator('[data-ranked-row]')).toHaveCount(2);
  const checkBasis = async (picks: Pick[]) => {
    const common = commonIds(picks);
    await expect(section.locator('tbody tr')).toHaveCount(common.length);
    await expect(
      section.getByRole('columnheader', { name: /Difference/ }),
    ).toBeVisible();
    await expect(section.locator('tbody a')).toHaveCount(common.length * 2);
    for (const p of picks)
      await expect(page.locator('.series-legend')).toContainText(p.name);
    return common.length;
  };
  const before = await checkBasis(pair);
  await effortSelect(page, pair[0]!).selectOption(switchTo);
  const after = await checkBasis([
    { ...pair[0]!, profileId: switchTo },
    pair[1]!,
  ]);
  expect(after).not.toBe(before);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(overflow).toBe(false);
  await page.screenshot({
    path: `test-results/common-benchmarks-${test.info().project.name}.png`,
    fullPage: true,
  });
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

test('compares three selected models together', async ({ page }) => {
  const picks = findModels(3, (p) => commonIds(p).length > 0);
  await selectModels(page, picks);
  await expect(page.locator('[data-ranked-row]')).toHaveCount(3);
  const section = commonSection(page);
  await expect(section.locator('tbody tr')).toHaveCount(
    commonIds(picks).length,
  );
  await expect(section.locator('thead th')).toHaveCount(4);
  await expect(section.locator('tbody tr').first().locator('a')).toHaveCount(3);
  for (const p of picks)
    await expect(page.locator('.series-legend')).toContainText(p.name);
});
