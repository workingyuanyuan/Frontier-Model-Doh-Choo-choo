import { waitForPaint } from './wait-for-paint';
import { expect, test, type Page } from './test';
import { readFileSync } from 'node:fs';
import type { ProductVersion } from '@llm-bench/benchmark-data';
import { evidenceVersionPath } from '../lib/dashboard-data';
import { getProfileDisplayName } from '../lib/view-model';

const product = JSON.parse(
  readFileSync('data/product/current.json', 'utf8'),
) as ProductVersion;
// The default cohort size follows the data (FRONTIER_POLICY), not a constant.
const defaultModelCount = product.presets.find(
  ({ id }) => id === product.defaultPresetId,
)!.targetModelCount;

const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? '').replace(/\/+$/, '');
const home = `${basePath}/`;
const evidenceRequests = /\/evidence\/[^/]+\/[^/]+\.json$/;
const panel = (page: Page) => page.locator('[data-model-detail-panel]');
const retry = (page: Page) =>
  panel(page).getByRole('button', {
    name: 'Retry evidence details',
    exact: true,
  });

const endpoint = (profileId: string) =>
  `${basePath}/evidence/${encodeURIComponent(evidenceVersionPath(product.versionId))}/${encodeURIComponent(profileId)}.json`;

const dashboardData = /\/data\/dashboard\.json(\?|$)/;
const loadNotice = (page: Page) => page.locator('.load-notice');
const developerMode = (page: Page) =>
  page.getByRole('switch', { name: 'Developer mode' });

const rankedRows = (page: Page) => page.locator('[data-ranked-row]');
const expectDefaultViewVisible = async (page: Page) => {
  await expect(rankedRows(page)).toHaveCount(defaultModelCount);
  await expect(rankedRows(page).first()).toBeVisible();
  await expect(rankedRows(page).last()).toBeVisible();
};

test('serves the default view as HTML without embedding the data', async ({
  browser,
  request,
}) => {
  const html = await (await request.get(home)).text();
  expect(html).not.toContain('dashboard-payload-v1');

  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto(home);
    await expectDefaultViewVisible(page);
    await expect(loadNotice(page)).toHaveCount(0);
  } finally {
    await context.close();
  }
});

test('shows the prerendered view until the data arrives, then responds', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  const requests: string[] = [];
  let release!: () => void;
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route(dashboardData, async (route) => {
    requests.push(route.request().url());
    const response = await route.fetch();
    await held;
    await route.fulfill({ response });
  });
  try {
    await page.goto(home, { waitUntil: 'load' });
    await expectDefaultViewVisible(page);
    await expect(loadNotice(page)).toHaveText('Loading interactive controls…');
    await expect(page.locator('html')).not.toHaveAttribute('data-dashboard');
    const prerendered = await rankedRows(page).first().elementHandle();
    release();
    await expect(page.locator('html')).toHaveAttribute(
      'data-dashboard',
      'interactive',
    );
    await expect(loadNotice(page)).toHaveCount(0);
    // React took over the prerendered nodes instead of rendering new ones.
    expect(await prerendered!.evaluate((row) => row.isConnected)).toBe(true);
    await expectDefaultViewVisible(page);
    await developerMode(page).click();
    await expect(developerMode(page)).toHaveAttribute('aria-checked', 'true');
    // The preload and the dashboard share one request.
    expect(requests).toHaveLength(1);
    expect(errors).toEqual([]);
  } finally {
    release();
  }
});

for (const failure of ['http', 'format', 'version'] as const) {
  test(`stays readable and says so after a ${failure} failure of the data`, async ({
    page,
  }) => {
    await page.route(dashboardData, async (route) => {
      if (failure === 'http') {
        await route.fulfill({ status: 503, body: 'Temporarily unavailable' });
        return;
      }
      const response = await route.fetch();
      const payload = await response.json();
      if (failure === 'format') payload.schemaVersion = 'another-format';
      else payload.product.versionId = 'sha256:another-release';
      await route.fulfill({ response, json: payload });
    });
    await page.goto(home, { waitUntil: 'load' });
    await expect(loadNotice(page)).toContainText('this page is read-only');
    await expect(loadNotice(page)).toHaveAttribute('role', 'alert');
    await expectDefaultViewVisible(page);
    await expect(page.locator('html')).not.toHaveAttribute('data-dashboard');

    await page.unroute(dashboardData);
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute(
      'data-dashboard',
      'interactive',
    );
    await expect(loadNotice(page)).toHaveCount(0);
    await developerMode(page).click();
    await expect(developerMode(page)).toHaveAttribute('aria-checked', 'true');
  });
}

async function firstRow(page: Page) {
  const row = page.locator('[data-ranked-row]').first();
  await expect(row).toBeVisible();
  const profileId = await row.getAttribute('data-profile-id');
  expect(profileId).toBeTruthy();
  return { row, profileId: profileId! };
}

test('loads full evidence only on expansion and reuses it after reopening', async ({
  page,
}) => {
  const requests: string[] = [];
  let release!: () => void;
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route(evidenceRequests, async (route) => {
    requests.push(new URL(route.request().url()).pathname);
    const response = await route.fetch();
    await held;
    await route.fulfill({ response });
  });
  await page.goto(home);
  await expect(page.locator('[data-ranked-row]')).toHaveCount(
    defaultModelCount,
  );
  await expect(panel(page)).toHaveCount(0);
  expect(requests).toEqual([]);

  for (const count of [2, 10, 8]) {
    await page.locator('#preset-model-count').fill(String(count));
    await expect(page.locator('[data-ranked-row]')).toHaveCount(count);
  }
  await expect(page).not.toHaveURL(/preset=aa-top-10/);
  expect(requests).toEqual([]);

  const { row, profileId } = await firstRow(page);
  const expand = row.locator('.model-button');
  try {
    await expand.click();
    await expect(panel(page).getByRole('status')).toHaveText(
      'Loading evidence details…',
    );
    await expect.poll(() => requests).toEqual([endpoint(profileId)]);
    const provenance = panel(page).locator('.provenance-toggle-btn').first();
    const benchmarkId = await provenance
      .locator('xpath=ancestor::li')
      .getAttribute('data-benchmark-id');
    await provenance.click();
    const details = panel(page).locator('[data-provenance-details]');
    await expect(details).toContainText('Source URL');
    await expect(details).not.toContainText('Retrieved At');
    release();
    await expect(panel(page).getByRole('status')).toHaveCount(0);
    await expect(details).toContainText('Retrieved At');
    const locator = await details.locator('code').innerText();
    const evidence = product.evidence.find(
      (record) =>
        record.model.profileId === profileId &&
        record.benchmarkId === benchmarkId &&
        record.provenance.locator === locator,
    );
    expect(evidence).toBeDefined();
    await expect(details.getByRole('link')).toHaveAttribute(
      'href',
      evidence!.provenance.sourceUrl,
    );
    await expect(details).toContainText(evidence!.provenance.retrievedAt);
    await expect(details).toContainText(evidence!.rawScore.toFixed(1));

    await expand.click();
    await expect(panel(page)).toHaveCount(0);
    await expand.click();
    await panel(page).locator('.provenance-toggle-btn').first().click();
    await expect(
      panel(page).locator('[data-provenance-details]'),
    ).toContainText(evidence!.provenance.locator);
    expect(requests).toEqual([endpoint(profileId)]);
  } finally {
    release();
  }
});

for (const failure of ['http', 'version', 'profile'] as const) {
  test(`recovers full evidence after a ${failure} response failure`, async ({
    page,
  }) => {
    let requests = 0;
    await page.route(evidenceRequests, async (route) => {
      requests += 1;
      if (requests !== 1) {
        await route.continue();
        return;
      }
      if (failure === 'http') {
        await route.fulfill({ status: 503, body: 'Temporarily unavailable' });
        return;
      }
      const response = await route.fetch();
      const payload = await response.json();
      if (failure === 'version') payload.versionId = 'sha256:wrong-version';
      else payload.profileId = 'wrong-profile';
      await route.fulfill({ response, json: payload });
    });
    await page.goto(home);
    const { row } = await firstRow(page);
    await row.locator('.model-button').click();
    await expect(panel(page).getByRole('alert')).toContainText(
      'Could not load evidence details.',
    );
    await expect(retry(page)).toBeVisible();
    await panel(page).locator('.provenance-toggle-btn').first().click();
    await expect(
      panel(page).locator('[data-provenance-details]'),
    ).not.toContainText('Retrieved At');
    await retry(page).click();
    await expect(panel(page).getByRole('alert')).toHaveCount(0);
    await expect(
      panel(page).locator('[data-provenance-details]'),
    ).toContainText('Retrieved At');
    expect(requests).toBe(2);
  });
}

test('keeps the selected profile when an older evidence request finishes late', async ({
  page,
}) => {
  await page.goto(home);
  const row = page
    .locator('[data-ranked-row]')
    .filter({
      has: page.locator('.profile-table-select'),
    })
    .first();
  const profileSelect = row.getByRole('combobox');
  const originalId = await profileSelect.inputValue();
  const otherId = await profileSelect
    .locator('option')
    .evaluateAll(
      (options, original) =>
        options
          .map((option) => (option as HTMLOptionElement).value)
          .find((id) => id !== original),
      originalId,
    );
  expect(otherId).toBeDefined();
  let release!: () => void;
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  let oldResponseReleased = false;
  let oldRequestStarted = false;
  await page.route(`**${endpoint(originalId)}`, async (route) => {
    const response = await route.fetch();
    oldRequestStarted = true;
    await held;
    await route.fulfill({ response });
    oldResponseReleased = true;
  });
  try {
    await row.locator('.model-button').click();
    await expect.poll(() => oldRequestStarted).toBe(true);
    await profileSelect.selectOption(otherId!);
    // A profile change can remount its row; expand the selected row if needed.
    const selected = page.locator(
      `[data-ranked-row][data-profile-id="${otherId}"]`,
    );
    if (
      (await selected
        .locator('.model-button')
        .getAttribute('aria-expanded')) === 'false'
    ) {
      await selected.locator('.model-button').click();
    }
    const profile = product.profiles.find(
      (candidate) => candidate.id === otherId,
    )!;
    await expect(panel(page).getByRole('heading')).toHaveText(
      getProfileDisplayName(profile),
    );
    await expect(panel(page).getByRole('status')).toHaveCount(0);
    await panel(page).locator('.provenance-toggle-btn').first().click();
    const details = panel(page).locator('[data-provenance-details]');
    await expect(details).toContainText('Retrieved At');
    const selectedProvenance = await details.innerText();
    release();
    await expect.poll(() => oldResponseReleased).toBe(true);
    await page.evaluate(waitForPaint);
    await expect(panel(page).getByRole('heading')).toHaveText(
      getProfileDisplayName(profile),
    );
    await expect(details).toHaveText(selectedProvenance, {
      useInnerText: true,
    });
    await expect(selected).toHaveAttribute('data-profile-id', otherId!);
  } finally {
    release();
  }
});
