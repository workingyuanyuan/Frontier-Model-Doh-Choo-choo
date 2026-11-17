import { test as base } from '@playwright/test';

/**
 * A plain `page.goto` of the dashboard resolves once its controls respond.
 *
 * The page arrives prerendered and becomes interactive only after its data
 * has been fetched, so a test that acts on `load` can reach a control that
 * does nothing yet. Passing `waitUntil` opts out, for the tests that look at
 * the page before that point.
 */
export const test = base.extend({
  page: async ({ page }, use) => {
    const goto = page.goto.bind(page);
    page.goto = async (url, options) => {
      const response = await goto(url, options);
      if (!options?.waitUntil && new URL(page.url()).pathname.endsWith('/')) {
        await page.locator('html[data-dashboard="interactive"]').waitFor();
      }
      return response;
    };
    await use(page);
  },
});

export { expect, type Page } from '@playwright/test';
