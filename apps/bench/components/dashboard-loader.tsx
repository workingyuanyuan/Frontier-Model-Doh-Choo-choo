'use client';

import type { DimensionId } from '@llm-bench/benchmark-data';
import { useEffect } from 'react';
import { useDashboardLoadStatus, useDashboardPayload } from '#dashboard-source';

import { Dashboard } from './dashboard';

/**
 * The dashboard with its data fetched rather than embedded in the page.
 *
 * The prerender reads the product file and writes the complete default view
 * into the HTML. In the browser this component suspends until the same data
 * has been fetched; React leaves the prerendered HTML in place meanwhile and
 * makes it interactive once the data is there.
 */
export function DashboardLoader({
  benchmarkDimensions,
  versionId,
}: {
  benchmarkDimensions: Record<string, DimensionId>;
  versionId: string;
}) {
  const product = useDashboardPayload(versionId);
  // The controls respond from here on; scripts driving the page wait for it.
  useEffect(() => {
    document.documentElement.dataset.dashboard = 'interactive';
  }, []);
  return (
    <Dashboard benchmarkDimensions={benchmarkDimensions} product={product} />
  );
}

/** Says why the controls do not respond yet, or that they never will. */
export function DashboardLoadNotice() {
  const status = useDashboardLoadStatus();
  if (status === 'ready') return null;
  return status === 'loading' ? (
    <p className="load-notice" role="status">
      Loading interactive controls…
    </p>
  ) : (
    <p className="load-notice" role="alert">
      The interactive controls could not load, so this page is read-only.
      <button type="button" onClick={() => window.location.reload()}>
        Reload
      </button>
    </p>
  );
}
