import { dashboardPayload } from '../../../lib/dashboard-source';

export const dynamic = 'force-static';

export function GET() {
  return new Response(JSON.stringify(dashboardPayload()), {
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}
