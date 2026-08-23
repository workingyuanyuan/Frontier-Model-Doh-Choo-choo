import { Dashboard } from '../components/dashboard';
import { loadProductVersion } from '../lib/load-product-version';

export const dynamic = 'force-static';

export default function Page() {
  // The display set is loaded and validated here; the product already
  // carries the scored presets, so the dashboard reads those.
  const { benchmarkDimensions, product } = loadProductVersion();
  return (
    <Dashboard benchmarkDimensions={benchmarkDimensions} product={product} />
  );
}
