import { expect, type Page } from '@playwright/test';
import {
  buildCommonComparison,
  commonBenchmarkCountDeltas,
  comparisonEvidence,
  comparisonOptions,
} from '../lib/common-benchmarks';
import { getSourceDisplayName } from '../components/model-detail-panel';
import { loadProductVersion } from '../lib/load-product-version';
import { getProfileDisplayName, withActivePreset } from '../lib/view-model';

// e2e expectations come from the published product, never from literals, so a
// data refresh does not require editing specs.
const loaded = loadProductVersion();
export const benchmarkDimensions = loaded.benchmarkDimensions;
export const product = withActivePreset(loaded.product);
const comparableIds = new Set(
  comparisonEvidence(product, benchmarkDimensions).map(({ id }) => id),
);
const evidence = product.evidence.filter(({ id }) => comparableIds.has(id));
const options = comparisonOptions(product, benchmarkDimensions);
const profileById = new Map(product.profiles.map((p) => [p.id, p]));

export interface Pick {
  modelId: string;
  profileId: string;
  name: string;
}

export const profile = (id: string) => profileById.get(id)!;
export const profileLabel = (id: string) => getProfileDisplayName(profile(id));
const pickOf = (profileId: string): Pick => ({
  modelId: profile(profileId).modelId,
  profileId,
  name: profile(profileId).baseModelName,
});

/** Picker models whose checkbox name is unambiguous, by model ID. */
const pickable = (() => {
  const names = options.map(
    ({ profileId }) => profile(profileId).baseModelName,
  );
  return options
    .filter((_, i) => names.indexOf(names[i]!) === names.lastIndexOf(names[i]!))
    .map(({ profileId }) => pickOf(profileId));
})();
export const profilesOf = (modelId: string) =>
  product.profiles
    .filter((p) => p.modelId === modelId)
    .map(({ id }) => id)
    .sort();

/** Comparable rows for one benchmark and profile (one per metric). */
export const rowsFor = (benchmarkId: string, profileId: string) =>
  evidence.filter(
    (e) => e.benchmarkId === benchmarkId && e.model.profileId === profileId,
  );

export const commonIds = (picks: readonly Pick[]) =>
  buildCommonComparison(
    product,
    picks.map(({ modelId }) => modelId),
    Object.fromEntries(picks.map((p) => [p.modelId, p.profileId])),
    benchmarkDimensions,
  ).benchmarkIds;

export const effortDeltas = (picks: readonly Pick[]) =>
  commonBenchmarkCountDeltas(
    product,
    picks.map(({ modelId }) => modelId),
    Object.fromEntries(picks.map((p) => [p.modelId, p.profileId])),
    benchmarkDimensions,
    options,
  );

/** Single-metric scorers of a benchmark, one profile per pickable model. */
export function benchmarkPicks(benchmarkId: string): Pick[] {
  return pickable.flatMap(({ modelId }) => {
    const profileId = profilesOf(modelId).find(
      (id) => rowsFor(benchmarkId, id).length === 1,
    );
    return profileId ? [pickOf(profileId)] : [];
  });
}

/** First pair of picks that both score a benchmark and share it in the table. */
export function findPair(
  benchmarkId: string,
  accept: (a: Pick, b: Pick) => boolean = () => true,
): [Pick, Pick] | undefined {
  const picks = benchmarkPicks(benchmarkId);
  for (const a of picks)
    for (const b of picks)
      if (a !== b && accept(a, b) && commonIds([a, b]).includes(benchmarkId))
        return [a, b];
  return undefined;
}

/** First pickable model combination (representative profiles) meeting a rule. */
export function findModels(
  count: number,
  accept: (picks: Pick[]) => boolean,
): Pick[] {
  const search = (start: number, chosen: Pick[]): Pick[] | null => {
    if (chosen.length === count) return accept(chosen) ? chosen : null;
    for (let i = start; i < pickable.length; i++) {
      const found = search(i + 1, [...chosen, pickable[i]!]);
      if (found) return found;
    }
    return null;
  };
  const found = search(0, []);
  expect(
    found,
    `no ${count}-model selection satisfies the rule`,
  ).not.toBeNull();
  return found!;
}

export const hasEfforts = (p: Pick) => profilesOf(p.modelId).length > 1;

/** Two efforts of one model that share at least one comparable benchmark. */
export const sharedEfforts = (p: Pick): [string, string] | undefined => {
  const ids = profilesOf(p.modelId);
  for (const kept of ids)
    for (const compared of ids)
      if (
        kept !== compared &&
        buildCommonComparison(
          product,
          [p.modelId],
          { [p.modelId]: compared },
          benchmarkDimensions,
          options,
          [kept],
        ).benchmarkIds.length
      )
        return [kept, compared];
  return undefined;
};

export const commonSection = (page: Page) =>
  page.getByRole('region', { name: 'Common benchmarks', exact: true });

export const effortSelect = (page: Page, p: Pick) =>
  page.getByRole('combobox', {
    name: `Select profile for ${p.name}`,
    exact: true,
  });

/** Selects exactly these models in developer mode, in order, with their profiles. */
export async function selectModels(page: Page, picks: readonly Pick[]) {
  await page.goto('/');
  await page.getByRole('switch', { name: 'Developer mode' }).click();
  await page.getByRole('button', { name: /Search Models/ }).click();
  await page.getByRole('button', { name: 'Clear', exact: true }).click();
  for (const { name } of picks)
    await page.getByRole('checkbox', { name, exact: true }).check();
  await page.keyboard.press('Escape');
  // A single-profile model has no effort selector.
  for (const p of picks)
    if (hasEfforts(p)) await effortSelect(page, p).selectOption(p.profileId);
}

export const commonRow = (page: Page, label: string) =>
  commonSection(page)
    .getByRole('row')
    .filter({ has: page.getByRole('rowheader', { name: label, exact: true }) });

/** The row shows each profile's score, publisher label and evidence link. */
export async function expectCommonRow(
  page: Page,
  label: string,
  benchmarkId: string,
  picks: readonly Pick[],
) {
  const row = commonRow(page, label);
  const cells = picks.map((p) => rowsFor(benchmarkId, p.profileId)[0]!);
  await expect(row.locator('strong')).toHaveText(
    cells.map((cell) => cell.normalizedScore!.toFixed(1)),
  );
  const links = row.getByRole('link');
  await expect(links).toHaveCount(cells.length);
  for (const [i, cell] of cells.entries()) {
    await expect(links.nth(i)).toHaveAttribute(
      'href',
      cell.provenance.sourceUrl,
    );
    await expect(links.nth(i)).toContainText(
      getSourceDisplayName(cell.sourceId),
    );
  }
}
