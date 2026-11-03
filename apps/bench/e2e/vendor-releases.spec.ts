import { expect, test } from '@playwright/test';
import { getSourceDisplayName } from '../components/model-detail-panel';
import { buildAdvancedCostSeries } from '../lib/view-model';
import { product } from './product-data';

// Vendor-reported score/task-cost pairs are plotted per source with their
// publisher and evidence link; vendor-vs-organizer table rows live in
// common-benchmarks.
for (const sourceId of [
  'deepswe',
  'zapier-automationbench',
  'cursorbench',
] as const) {
  test(`plots vendor score and task cost pairs for ${sourceId}`, async ({
    page,
  }) => {
    const series = buildAdvancedCostSeries(product, [sourceId]);
    const points = series.flatMap((line) => line.points);
    const point = points.find(({ sources }) => sources[0]!.reportedSourceId);
    test.skip(!point, `${sourceId} has no vendor-reported cost pair`);
    await page.goto('/');
    await page.locator('.cost-mode-toggle').click();
    for (const toggle of await page.locator('.advanced-source-toggle').all()) {
      const id = await toggle.getAttribute('data-source-id');
      const enabled = (await toggle.getAttribute('aria-pressed')) === 'true';
      if (enabled !== (id === sourceId)) await toggle.click();
    }
    await expect(page.locator('.advanced-cost-point')).toHaveCount(
      points.length,
    );
    for (const line of series)
      await expect(
        page.locator(`.advanced-cost-point[data-series-id="${line.seriesId}"]`),
      ).toHaveCount(line.points.length);
    const source = point!.sources[0]!;
    await page
      .locator(`.advanced-cost-point[data-profile-id="${point!.profileId}"]`)
      .focus();
    const tooltip = page.getByRole('tooltip', { includeHidden: true });
    await expect(tooltip).toContainText(`score ${source.score.toFixed(1)}`);
    await expect(tooltip).toContainText(`$${source.cost.toFixed(3)}`);
    const link = tooltip.getByRole('link', {
      name: getSourceDisplayName(source.reportedSourceId!),
      includeHidden: true,
    });
    await expect(link).toHaveAttribute('href', source.sourceUrl);
    await expect(link).toContainText('(vendor)');
  });
}
