import { test as base, type Page } from '@playwright/test';

/**
 * A plain `page.goto` of the dashboard resolves once its controls respond.
 *
 * The page arrives prerendered and becomes interactive only after its data
 * has been fetched, so a test that acts on `load` can reach a control that
 * does nothing yet. Passing `waitUntil` opts out, for the tests that look at
 * the page before that point.
 */
const dashboard = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/`;

export const test = base.extend({
  page: async ({ page }, use) => {
    const goto = page.goto.bind(page);
    page.goto = async (url, options) => {
      const response = await goto(url, options);
      if (!options?.waitUntil && new URL(page.url()).pathname === dashboard) {
        await page.locator('html[data-dashboard="interactive"]').waitFor();
      }
      return response;
    };
    await use(page);
  },
});

export { expect, type Page } from '@playwright/test';

/**
 * Opens the advanced cost chart with every model shown and its Models menu
 * open. The chart starts from the models the leaderboard lists, so a test
 * about some other model widens it first.
 */
export const openAdvancedCostChartWithEveryModel = async (
  page: Page,
): Promise<void> => {
  await page.locator('.cost-mode-toggle').click();
  await page.locator('.cost-model-overflow-trigger').click();
  await page
    .locator('.cost-model-menu-actions button', { hasText: 'Select all' })
    .click();
};
