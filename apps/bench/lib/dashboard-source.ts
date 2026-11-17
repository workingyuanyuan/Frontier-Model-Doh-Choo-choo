import {
  packDashboardProduct,
  toDashboardProduct,
  type DashboardPayload,
} from './dashboard-data';
import { loadProductVersion } from './load-product-version';

export type DashboardLoadStatus = 'loading' | 'ready' | 'failed';

/**
 * Where the dashboard gets its data while the page is prerendered: straight
 * from the product file. The browser build resolves `#dashboard-source` to
 * `dashboard-source.browser.ts` instead (see `imports` in package.json), which
 * fetches the same payload, so the data is not embedded in the page.
 */
let payload: DashboardPayload | undefined;

export const dashboardPayload = (): DashboardPayload =>
  (payload ??= packDashboardProduct(
    toDashboardProduct(loadProductVersion().product),
  ));

export const useDashboardPayload = (versionId: string): DashboardPayload => {
  const current = dashboardPayload();
  if (current.product.versionId !== versionId) {
    throw new Error(`page was rendered for ${versionId}, not the product file`);
  }
  return current;
};

export const useDashboardLoadStatus = (): DashboardLoadStatus => 'ready';
