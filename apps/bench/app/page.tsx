import { Dashboard } from '../components/dashboard';
import { loadProductVersion } from '../lib/load-product-version';

export const dynamic = 'force-static';

export default function Page() {
  const { benchmarkDimensions, product } = loadProductVersion();
  return (
    <Dashboard benchmarkDimensions={benchmarkDimensions} product={product} />
  );
}
