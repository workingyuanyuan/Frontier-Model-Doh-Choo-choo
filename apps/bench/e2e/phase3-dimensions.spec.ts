import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import type { DimensionId, ProductVersion } from '@llm-bench/benchmark-data';
import { buildCommonComparison } from '../lib/common-benchmarks';
import {
  getActiveDimensionIds,
  UI_DIMENSION_ABBREVIATIONS,
} from '../lib/ui-contract';
import {
  withActivePreset,
  type LeaderboardRow as Row,
} from '../lib/view-model';

const raw = JSON.parse(
  readFileSync('data/product/current.json', 'utf8'),
) as ProductVersion;
const product = withActivePreset(raw);
// The default cohort size follows the data (FRONTIER_POLICY), not a constant.
const defaultModelCount = raw.presets.find(
  ({ id }) => id === raw.defaultPresetId,
)!.targetModelCount;

const mapping = JSON.parse(
  readFileSync('data/mappings/benchmarks-v2.json', 'utf8'),
);
const dimensions: Record<string, DimensionId> = Object.fromEntries(
  mapping.benchmarks.map((b: { id: string; primaryDimension: DimensionId }) => [
    b.id,
    b.primaryDimension,
  ]),
);
const compare = (ids: string[]) => {
  const profiles = ids.map((id) => raw.profiles.find((p) => p.id === id)!);
  return buildCommonComparison(
    product,
    profiles.map((p) => p.modelId),
    Object.fromEntries(profiles.map((p) => [p.modelId, p.id])),
    dimensions,
  );
};
const labels = (rows: readonly { dimensions: Row['dimensions'] }[]) =>
  getActiveDimensionIds(rows).map((id) => UI_DIMENSION_ABBREVIATIONS[id]);
const defaultLabels = labels(product.leaderboard);
// A profile whose comparison with a default-cohort peer drops one of its
// dimensions, chosen from the current data.
const scenario = (() => {
  const singles = raw.profiles
    .map((p) => ({ p, dims: labels(compare([p.id]).product.leaderboard) }))
    .filter(({ dims }) => dims.length)
    .sort((x, y) => y.dims.length - x.dims.length);
  for (const { p, dims } of singles)
    for (const peer of product.leaderboard) {
      if (peer.modelId === p.modelId) continue;
      const pairDims = labels(
        compare([p.id, peer.profileId]).product.leaderboard,
      );
      const dropped = dims.find((d) => !pairDims.includes(d));
      if (dropped && pairDims.length)
        return {
          wide: p,
          dims,
          peerProfileId: peer.profileId,
          pairDims,
          dropped,
        };
    }
  return null;
})();
const droppedName = (abbr: string) => {
  const id = Object.entries(UI_DIMENSION_ABBREVIATIONS).find(
    ([, value]) => value === abbr,
  )![0];
  return `| ${id[0]!.toUpperCase()}${id.slice(1)} |`;
};

async function picker(page: Page, action: () => Promise<void>) {
  await page.getByRole('button', { name: /Search Models/ }).click();
  await action();
  await page.keyboard.press('Escape');
}

async function axes(page: Page, count: number) {
  await expect(
    page.locator('.leaderboard-table thead th[aria-label]'),
  ).toHaveCount(count);
  await expect(page.locator('.radar-axis')).toHaveCount(count);
  await expect(page.locator('.dimension-bar-row')).toHaveCount(count);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - innerWidth,
    ),
  ).toBeLessThanOrEqual(1);
}

test('phase3: clear, reselect, intersect, sort, export and reset dynamic dimensions', async ({
  page,
}, info) => {
  test.skip(!scenario, 'no profile loses a dimension against a default peer');
  const { wide, dims, peerProfileId, pairDims, dropped } = scenario!;
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: async (value: string) => {
          (window as unknown as { copied: string }).copied = value;
        },
      },
    });
  });
  await page.goto('/');
  await axes(page, defaultLabels.length);
  await expect(page.locator('[data-ranked-row]')).toHaveCount(
    product.leaderboard.length,
  );
  await expect(page.locator('.radar-label')).toHaveText(defaultLabels);
  await expect(
    page.getByRole('region', { name: 'Common benchmarks', exact: true }),
  ).toHaveCount(0);
  await page.screenshot({
    path: info.outputPath('default.png'),
    fullPage: true,
  });

  await picker(page, async () => {
    await page.getByRole('button', { name: 'Clear', exact: true }).click();
  });
  await axes(page, 0);
  await expect(
    page.locator('[data-ranked-row], .radar-area, .radar-point'),
  ).toHaveCount(0);
  await picker(page, async () => {
    await page
      .getByRole('checkbox', { name: wide.baseModelName, exact: true })
      .check();
  });
  const effort = page.getByRole('combobox', {
    name: `Select profile for ${wide.baseModelName}`,
    exact: true,
  });
  if (await effort.count()) await effort.selectOption(wide.id);
  await axes(page, dims.length);
  await expect(page.locator('.radar-label')).toHaveText(dims);
  await expect(page.locator('[data-ranked-row]')).toHaveCount(1);
  const expected = compare([wide.id]).product.leaderboard[0]!;
  await expect(page.locator('[data-ranked-row]')).toContainText(
    expected.overallScore!.toFixed(1),
  );
  await page.screenshot({
    path: info.outputPath('before-sort.png'),
    fullPage: true,
  });
  const languageSort = page.getByRole('button', {
    name: `Sort by ${dropped}`,
    exact: true,
  });
  await languageSort.focus();
  await languageSort.press('Enter');
  await page
    .getByRole('button', { name: 'Copy table as Markdown', exact: true })
    .click();
  await expect
    .poll(() =>
      page.evaluate(() => (window as unknown as { copied: string }).copied),
    )
    .toContain(droppedName(dropped));
  await page.screenshot({
    path: info.outputPath('selected-wide.png'),
    fullPage: true,
  });

  const peer = raw.profiles.find((p) => p.id === peerProfileId)!;
  await picker(page, async () => {
    await page
      .getByRole('checkbox', { name: peer.baseModelName, exact: true })
      .check();
  });
  const peerEffort = page.getByRole('combobox', {
    name: `Select profile for ${peer.baseModelName}`,
    exact: true,
  });
  if (await peerEffort.count()) await peerEffort.selectOption(peer.id);
  await axes(page, pairDims.length);
  await expect(
    page.locator('.leaderboard-table th[aria-sort="descending"]'),
  ).toContainText('Overall');
  await page
    .getByRole('button', { name: 'Copy table as Markdown', exact: true })
    .click();
  await expect
    .poll(() =>
      page.evaluate(() => (window as unknown as { copied: string }).copied),
    )
    .not.toContain(droppedName(dropped));
  await page.screenshot({
    path: info.outputPath('comparison-narrow.png'),
    fullPage: true,
  });
  await picker(page, async () => {
    await page
      .getByRole('checkbox', { name: peer.baseModelName, exact: true })
      .uncheck();
  });
  await axes(page, dims.length);
  await picker(page, async () => {
    await page.getByRole('button', { name: 'Default', exact: true }).click();
  });
  await axes(page, defaultLabels.length);
  expect(
    (
      await page
        .locator('[data-ranked-row]')
        .evaluateAll((rows) =>
          rows.map((r) => r.getAttribute('data-profile-id')),
        )
    ).sort(),
  ).toEqual(product.leaderboard.map((r) => r.profileId).sort());
  expect(errors).toEqual([]);
});

test('keeps the tenth frontier model when the ninth is manually excluded', async ({
  page,
}) => {
  // Presets follow the eligible frontier, not the raw AA top ten.
  const ranking = JSON.parse(
    readFileSync('data/mappings/frontier-set.json', 'utf8'),
  ).eligibility.leaders as { profileId: string }[];
  const ninth = raw.profiles.find((p) => p.id === ranking[8]!.profileId)!;
  await page.goto('/?preset=aa-top-10');
  await expect(page.locator('[data-ranked-row]')).toHaveCount(10);
  await picker(page, async () => {
    await page
      .getByRole('checkbox', { name: ninth.baseModelName, exact: true })
      .uncheck();
  });
  const ids = ranking.filter((_, i) => i !== 8).map((p) => p.profileId);
  const expected = compare(ids);
  await expect(page.locator('[data-ranked-row]')).toHaveCount(9);
  for (const row of expected.product.leaderboard) {
    await expect(
      page.locator(
        `[data-ranked-row][data-profile-id="${row.profileId}"] .overall-score`,
      ),
    ).toHaveText(row.overallScore!.toFixed(1));
  }
  await page.getByRole('switch', { name: 'Developer mode' }).click();
  await expect(
    page
      .getByRole('region', { name: 'Common benchmarks', exact: true })
      .locator('tbody tr'),
  ).toHaveCount(expected.benchmarkIds.length);
  await picker(page, async () => {
    await page.getByRole('button', { name: 'Default', exact: true }).click();
  });
  await expect(page.locator('#preset-model-count')).toHaveValue(
    String(defaultModelCount),
  );
  await expect(page.locator('[data-ranked-row]')).toHaveCount(
    defaultModelCount,
  );
});
