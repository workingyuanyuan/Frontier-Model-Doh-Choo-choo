import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import type { DimensionId, ProductVersion } from '@llm-bench/benchmark-data';
import { buildCommonComparison } from '../lib/common-benchmarks';
import { withActivePreset } from '../lib/view-model';

const raw = JSON.parse(
  readFileSync('data/product/current.json', 'utf8'),
) as ProductVersion;
const product = withActivePreset(raw);
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
const six = raw.profiles.find(
  (p) =>
    compare([p.id]).product.leaderboard[0]?.dimensions.length === 6 &&
    product.leaderboard.some(
      (peer) =>
        peer.modelId !== p.modelId &&
        compare([p.id, peer.profileId]).product.leaderboard[0]?.dimensions
          .length === 5,
    ),
)!;
const fivePeer = product.leaderboard.find(
  (p) =>
    p.modelId !== six.modelId &&
    compare([six.id, p.profileId]).product.leaderboard[0]?.dimensions.length ===
      5,
)!;

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
  await axes(page, 5);
  await expect(page.locator('[data-ranked-row]')).toHaveCount(6);
  await expect(page.locator('.radar-label')).toHaveText([
    'AGT',
    'COD',
    'RSN',
    'KNG',
    'CMP',
  ]);
  await expect(
    page.getByRole('region', { name: 'Common benchmarks', exact: true }),
  ).toHaveCount(0);
  await page.screenshot({
    path: info.outputPath('default-five.png'),
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
      .getByRole('checkbox', { name: six.baseModelName, exact: true })
      .check();
  });
  const effort = page.getByRole('combobox', {
    name: `Select profile for ${six.baseModelName}`,
    exact: true,
  });
  if (await effort.count()) await effort.selectOption(six.id);
  await axes(page, 6);
  await expect(page.locator('.radar-label').last()).toHaveText('LNG');
  await expect(page.locator('[data-ranked-row]')).toHaveCount(1);
  const expected = compare([six.id]).product.leaderboard[0]!;
  await expect(page.locator('[data-ranked-row]')).toContainText(
    expected.overallScore!.toFixed(1),
  );
  await page.screenshot({
    path: info.outputPath('before-sort.png'),
    fullPage: true,
  });
  const languageSort = page.getByRole('button', {
    name: 'Sort by LNG',
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
    .toContain('Language');
  await page.screenshot({
    path: info.outputPath('selected-six.png'),
    fullPage: true,
  });

  const peer = raw.profiles.find((p) => p.id === fivePeer.profileId)!;
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
  await axes(page, 5);
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
    .not.toContain('Language');
  await page.screenshot({
    path: info.outputPath('comparison-five.png'),
    fullPage: true,
  });
  await picker(page, async () => {
    await page
      .getByRole('checkbox', { name: peer.baseModelName, exact: true })
      .uncheck();
  });
  await axes(page, 6);
  await picker(page, async () => {
    await page.getByRole('button', { name: 'Default', exact: true }).click();
  });
  await axes(page, 5);
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
