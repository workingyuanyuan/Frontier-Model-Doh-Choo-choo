import { llmsTxt } from '../../lib/agent-surfaces';
import { loadProductVersion } from '../../lib/load-product-version';

export const dynamic = 'force-static';

export function GET() {
  return new Response(llmsTxt(loadProductVersion().product), {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
}
