import { Dashboard } from '../components/dashboard';
import { loadProductVersion } from '../lib/load-product-version';

export const dynamic = 'force-static';

export default function Page() {
  const { benchmarkDimensions, channel, product } = loadProductVersion();
  return (
    <Dashboard
      benchmarkDimensions={benchmarkDimensions}
      product={product}
      channel={channel}
    />
  );
}
