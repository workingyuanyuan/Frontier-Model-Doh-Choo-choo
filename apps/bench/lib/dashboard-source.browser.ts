import { use } from 'react';

import type { DashboardPayload } from './dashboard-data';
import { dashboardDataUrl } from './site-paths';

/**
 * The browser side of `#dashboard-source`: the payload the page was
 * prerendered from, fetched once from the URL the page preloads.
 */
let request: Promise<DashboardPayload> | undefined;

/**
 * Says why the controls do not respond. React has not taken over the page
 * while the data is missing, so the notice is a plain element; it carries no
 * button because React drops clicks on a page it has yet to hydrate.
 */
const showNotice = (failed: boolean): HTMLElement => {
  const notice = document.createElement('p');
  notice.className = 'load-notice';
  notice.setAttribute('role', failed ? 'alert' : 'status');
  notice.textContent = failed
    ? 'The interactive controls could not load, so this page is read-only. Reload to try again.'
    : 'Loading interactive controls…';
  document.body.append(notice);
  return notice;
};

const load = (versionId: string): Promise<DashboardPayload> => {
  let notice: HTMLElement | undefined;
  // A load that finishes quickly never shows the notice.
  const pending = setTimeout(() => {
    notice = showNotice(false);
  }, 600);
  const settle = () => {
    clearTimeout(pending);
    notice?.remove();
  };
  return fetch(dashboardDataUrl(versionId))
    .then((response) => {
      if (!response.ok) throw new Error('Could not load dashboard data.');
      return response.json() as Promise<DashboardPayload>;
    })
    .then((payload) => {
      // A page cached from an older release can be served newer data.
      if (
        payload?.schemaVersion !== 'dashboard-payload-v1' ||
        payload.product?.versionId !== versionId
      ) {
        throw new Error('Dashboard data does not match this page.');
      }
      settle();
      return payload;
    })
    .catch(() => {
      settle();
      showNotice(true);
      // Left pending on purpose: React then keeps the prerendered page on
      // screen, which is complete as a read-only view.
      return new Promise<never>(() => {});
    });
};

/** Suspends until the data has arrived. */
export const useDashboardPayload = (versionId: string): DashboardPayload =>
  use((request ??= load(versionId)));
