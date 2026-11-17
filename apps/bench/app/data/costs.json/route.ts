import { costsJson } from '../../../lib/agent-surfaces';
import { loadProductVersion } from '../../../lib/load-product-version';

export const dynamic = 'force-static';

export function GET() {
  return new Response(costsJson(loadProductVersion().product), {
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}
