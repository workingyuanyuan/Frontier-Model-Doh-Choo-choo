import { llmsTxt, projectPresets } from '../../lib/agent-surfaces';
import { loadProductVersion } from '../../lib/load-product-version';

export const dynamic = 'force-static';

export function GET() {
  const { benchmarkDimensions, product } = loadProductVersion();
  return new Response(
    llmsTxt(product, projectPresets(product, benchmarkDimensions)),
    { headers: { 'content-type': 'text/plain; charset=utf-8' } },
  );
}
