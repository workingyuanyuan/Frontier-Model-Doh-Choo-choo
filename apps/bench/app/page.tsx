import type { Metadata } from 'next';
import { preload } from 'react-dom';

import { DashboardLoader } from '../components/dashboard-loader';
import { loadProductVersion } from '../lib/load-product-version';
import { dashboardDataUrl, publicUrl } from '../lib/site-paths';

export const dynamic = 'force-static';

// Set per page rather than in the layout, so the 404 page claims no address.
export const metadata: Metadata = { alternates: { canonical: publicUrl('') } };

export default function Page() {
  // The display set is loaded and validated here; the product already
  // carries the scored presets, so the dashboard reads those.
  const { benchmarkDimensions, product } = loadProductVersion();
  // The page carries the rendered view but not its data, so start the fetch
  // the dashboard is waiting for before its script runs.
  preload(dashboardDataUrl(product.versionId), {
    as: 'fetch',
    crossOrigin: 'anonymous',
  });
  return (
    <DashboardLoader
      benchmarkDimensions={benchmarkDimensions}
      versionId={product.versionId}
    />
  );
}
