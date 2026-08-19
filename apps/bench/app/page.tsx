import { Dashboard } from '../components/dashboard';
import { loadProductVersion } from '../lib/load-product-version';

export const dynamic = 'force-static';

export default function Page() {
  const { benchmarkDimensions, displaySet, product } = loadProductVersion();
  return (
    <Dashboard
      benchmarkDimensions={benchmarkDimensions}
      displaySet={displaySet}
      product={product}
    />
  );
}
