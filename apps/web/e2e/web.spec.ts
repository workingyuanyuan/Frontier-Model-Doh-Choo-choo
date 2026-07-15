import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

import { E2E_EDITION_ID } from './fixture';

const presentation = `edition=${E2E_EDITION_ID}&theme=studio`;
const routes = [
  `/zh-TW?${presentation}`,
  `/en?${presentation}`,
  '/zh-TW/models/e2e-alpha',
  '/en/benchmarks/livebench',
  `/zh-TW/compare?${presentation}&models=e2e-alpha&models=e2e-beta`,
  '/zh-TW/methodology',
  '/zh-TW/sources',
  '/zh-TW/pipeline',
] as const;

function captureConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}

test.describe('required routes', () => {
  for (const route of routes) {
    test(`${route} renders without browser errors`, async ({ page }) => {
      const errors = captureConsoleErrors(page);
      const response = await page.goto(route, { waitUntil: 'networkidle' });
      expect(response?.status()).toBe(200);
      await expect(page.locator('h1').first()).toBeVisible();
      expect(errors).toEqual([]);
    });
  }

  test('root redirects to the Traditional Chinese homepage', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/zh-TW$/);
  });
});

test('theme and comparison state remain shareable in the URL', async ({
  page,
}) => {
  await page.goto(`/zh-TW?edition=${E2E_EDITION_ID}&theme=editorial`);
  const shell = page.locator('.siteShell');
  await expect(shell).toHaveAttribute('data-theme', 'editorial');

  await page.getByRole('button', { name: '影像棚' }).click();
  await expect(page).toHaveURL(
    new RegExp(`edition=${E2E_EDITION_ID}&theme=studio`),
  );
  await expect(shell).toHaveAttribute('data-theme', 'studio');

  await page.getByRole('link', { name: '比較' }).click();
  await expect(page).toHaveURL(/\/zh-TW\/compare\?/);
  await expect(page.locator('.comparePage')).toHaveAttribute(
    'data-theme',
    'studio',
  );
  expect(new URL(page.url()).searchParams.get('edition')).toBe(E2E_EDITION_ID);

  await page.getByRole('button', { name: '+ 新增模型' }).click();
  await page.getByRole('button', { name: '套用並更新分享連結' }).click();
  await expect
    .poll(() => new URL(page.url()).searchParams.getAll('models').length)
    .toBe(3);
  const comparisonUrl = new URL(page.url());
  expect(comparisonUrl.searchParams.getAll('models')).toEqual([
    'e2e-alpha',
    'e2e-beta',
    'e2e-gamma',
  ]);
  expect(comparisonUrl.searchParams.get('edition')).toBe(E2E_EDITION_ID);
  expect(comparisonUrl.searchParams.get('theme')).toBe('studio');

  const languageHref = await page
    .getByRole('link', { name: 'English' })
    .getAttribute('href');
  expect(languageHref).toContain(`/en/compare?edition=${E2E_EDITION_ID}`);
  expect(languageHref).toContain('theme=studio');
});

test.describe('accessibility and responsive layout', () => {
  for (const route of routes) {
    test(`${route} has no automated WCAG A/AA violations`, async ({ page }) => {
      await page.goto(route, { waitUntil: 'networkidle' });
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();
      expect(results.violations).toEqual([]);
    });
  }

  for (const width of [390, 1440]) {
    test(`homepage and comparison fit a ${width}px viewport`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      for (const route of [routes[0], routes[4]]) {
        await page.goto(route, { waitUntil: 'networkidle' });
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - window.innerWidth,
        );
        expect(overflow).toBeLessThanOrEqual(1);
        if (route === routes[4]) {
          const hiddenRadarTableWidth = await page
            .locator('table.srOnly')
            .evaluate((table) => table.getBoundingClientRect().width);
          expect(hiddenRadarTableWidth).toBeLessThanOrEqual(1);
        }
      }
    });
  }
});

test('health and data APIs expose bounded payloads and cache policies', async ({
  request,
}) => {
  for (const [route, cacheControl] of [
    ['/api/v1/health', 'no-store'],
    ['/api/v1/status/data', 'no-store'],
    ['/api/v1/rankings/latest', 'public, max-age=60'],
  ] as const) {
    const startedAt = Date.now();
    const response = await request.get(route);
    expect(response.status()).toBe(200);
    expect(Date.now() - startedAt).toBeLessThan(1_500);
    expect(response.headers()['cache-control']).toContain(cacheControl);
    expect((await response.body()).byteLength).toBeLessThan(1_000_000);
  }
});

test('representative homepage stays inside browser performance budgets', async ({
  page,
}) => {
  await page.goto(routes[0], { waitUntil: 'networkidle' });
  const metrics = await page.evaluate(() => {
    const navigation = performance.getEntriesByType(
      'navigation',
    )[0] as PerformanceNavigationTiming;
    const resources = performance.getEntriesByType(
      'resource',
    ) as PerformanceResourceTiming[];
    return {
      domContentLoadedMs: navigation.domContentLoadedEventEnd,
      encodedResourceBytes: resources.reduce(
        (total, resource) => total + resource.encodedBodySize,
        0,
      ),
    };
  });
  expect(metrics.domContentLoadedMs).toBeLessThan(3_000);
  expect(metrics.encodedResourceBytes).toBeLessThan(3_000_000);
});

test('security headers constrain browser capabilities and embedding', async ({
  request,
}) => {
  const response = await request.get('/zh-TW/methodology');
  const headers = response.headers();
  expect(headers['content-security-policy']).toContain("default-src 'self'");
  expect(headers['content-security-policy']).toContain(
    "frame-ancestors 'none'",
  );
  expect(headers['content-security-policy']).toContain("'strict-dynamic'");
  expect(headers['content-security-policy']).not.toContain(
    "script-src 'self' 'unsafe-inline'",
  );
  expect(headers['permissions-policy']).toBe(
    'camera=(), microphone=(), geolocation=()',
  );
  expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
  expect(headers['x-content-type-options']).toBe('nosniff');
  expect(headers['x-frame-options']).toBe('DENY');
});

test('crawler guidance is valid and describes the public interfaces', async ({
  request,
}) => {
  const robots = await request.get('/robots.txt');
  expect(robots.status()).toBe(200);
  expect(await robots.text()).toContain('User-agent: *\nAllow: /');

  const llms = await request.get('/llms.txt');
  expect(llms.status()).toBe(200);
  const llmsText = await llms.text();
  expect(llmsText).toContain('# LLM Bench Radar');
  expect(llmsText).toContain('[Latest ranking API]');
});

test('invalid presentation selectors fail closed', async ({ request }) => {
  expect((await request.get('/zh-TW?theme=dark')).status()).toBe(404);
  expect(
    (
      await request.get('/zh-TW?edition=019f7000-0000-7000-8000-deadbeef0000')
    ).status(),
  ).toBe(404);
});
