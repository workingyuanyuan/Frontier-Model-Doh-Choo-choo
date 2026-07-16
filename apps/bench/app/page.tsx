import { Dashboard } from '../components/dashboard';
import { loadProductVersion } from '../lib/load-product-version';

export const dynamic = 'force-static';

export default function Page() {
  const { channel, product } = loadProductVersion();
  return <Dashboard product={product} channel={channel} />;
}
