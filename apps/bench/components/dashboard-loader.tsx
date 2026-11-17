'use client';

import type { DimensionId } from '@llm-bench/benchmark-data';
import { useEffect } from 'react';
import { useDashboardPayload } from '#dashboard-source';

import { Dashboard } from './dashboard';

/**
 * The dashboard with its data fetched rather than embedded in the page.
 *
 * The prerender reads the product file and writes the complete default view
 * into the HTML. In the browser this component suspends until the same data
 * has been fetched; React leaves the prerendered HTML in place meanwhile and
 * makes it interactive once the data is there.
 *
 * It must not sit inside a Suspense boundary: React moves a large boundary
 * out of the document flow and reveals it with a script, which would leave
 * the page blank for a reader that does not run scripts.
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
