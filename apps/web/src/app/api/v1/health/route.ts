import { HealthResponseSchema } from '@llm-bench/contracts';

export const dynamic = 'force-dynamic';

export function GET(): Response {
  return Response.json(
    HealthResponseSchema.parse({
      apiVersion: 'v1',
      data: { status: 'OK' },
    }),
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
