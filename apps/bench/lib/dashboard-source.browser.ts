import { use, useSyncExternalStore } from 'react';

import type { DashboardPayload } from './dashboard-data';
import type { DashboardLoadStatus } from './dashboard-source';
import { dashboardDataUrl } from './site-paths';

/**
 * The browser side of `#dashboard-source`: the payload the page was
 * prerendered from, fetched once from the URL the page preloads.
 */
let request: Promise<DashboardPayload> | undefined;
let status: DashboardLoadStatus = 'loading';
const listeners = new Set<() => void>();

const settle = (next: DashboardLoadStatus) => {
  status = next;
  listeners.forEach((notify) => notify());
};

const load = (versionId: string): Promise<DashboardPayload> =>
  fetch(dashboardDataUrl(versionId))
    .then((response) => {
      if (!response.ok) throw new Error('Could not load dashboard data.');
      return response.json() as Promise<DashboardPayload>;
    })
    .then((payload) => {
      if (payload?.schemaVersion !== 'dashboard-payload-v1') {
        throw new Error('Dashboard data has an unknown format.');
      }
      settle('ready');
      return payload;
    })
    .catch(() => {
      settle('failed');
      // Left pending on purpose: React then keeps the prerendered page on
      // screen, which is complete as a read-only view.
      return new Promise<never>(() => {});
    });

/** Suspends until the data has arrived. */
export const useDashboardPayload = (versionId: string): DashboardPayload =>
  use((request ??= load(versionId)));

const subscribe = (notify: () => void) => {
  listeners.add(notify);
  return () => listeners.delete(notify);
};

/** `ready` while hydrating, so the prerendered page carries no notice. */
export const useDashboardLoadStatus = (): DashboardLoadStatus =>
  useSyncExternalStore(
    subscribe,
    () => status,
    () => 'ready',
  );
