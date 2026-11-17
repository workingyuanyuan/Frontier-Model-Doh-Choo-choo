import { dataIndexJson, projectPresets } from '../../../lib/agent-surfaces';
import { loadProductVersion } from '../../../lib/load-product-version';

export const dynamic = 'force-static';

const headers = { 'content-type': 'application/json; charset=utf-8' };

export function GET() {
  const { benchmarkDimensions, product } = loadProductVersion();
  return new Response(
    dataIndexJson(product, projectPresets(product, benchmarkDimensions)),
    { headers },
  );
}
