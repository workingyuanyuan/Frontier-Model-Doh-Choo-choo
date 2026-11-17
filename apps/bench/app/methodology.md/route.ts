import { methodologyMarkdown } from '../../lib/agent-surfaces';
import { loadProductVersion } from '../../lib/load-product-version';

export const dynamic = 'force-static';

export function GET() {
  const { benchmarkDimensions, product } = loadProductVersion();
  return new Response(methodologyMarkdown(product, benchmarkDimensions), {
    headers: { 'content-type': 'text/markdown; charset=utf-8' },
  });
}
