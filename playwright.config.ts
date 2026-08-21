import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './apps/bench/e2e',
  outputDir: './test-results/bench',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI
    ? [['html', { outputFolder: 'playwright-report', open: 'never' }]]
    : 'list',
  use: {
    baseURL: 'http://127.0.0.1:3910',
    trace: 'retain-on-failure',
    // `html { scroll-behavior: smooth }` makes click targets move while
    // Playwright is still resolving them, so a scrolled-to control gets the
    // click stolen by whatever sat at the old coordinates. The stylesheet
    // already turns smooth scrolling off under reduced motion; run the suite
    // that way instead of adding waits to individual tests.
    reducedMotion: 'reduce',
  },
  projects: [
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chromium', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: 'node scripts/serve-static.mjs apps/bench/out 3910',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    url: 'http://127.0.0.1:3910',
  },
});
