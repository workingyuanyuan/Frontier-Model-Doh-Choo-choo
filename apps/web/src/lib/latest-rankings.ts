import {
  ActiveEditionResponseSchema,
  ApiErrorResponseSchema,
  type ActiveEdition,
} from '@llm-bench/contracts';

const successCacheHeaders = {
  'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
} as const;

const errorCacheHeaders = { 'Cache-Control': 'no-store' } as const;

export type ActiveEditionLoader = () => Promise<ActiveEdition | null>;

export async function handleLatestRankingsRequest(
  loadActiveEdition: ActiveEditionLoader,
): Promise<Response> {
  try {
    const edition = await loadActiveEdition();
    if (!edition) {
      return Response.json(
        ApiErrorResponseSchema.parse({
          apiVersion: 'v1',
          error: {
            code: 'ACTIVE_EDITION_NOT_FOUND',
            message: 'No active edition is available.',
          },
        }),
        { status: 404, headers: errorCacheHeaders },
      );
    }

    return Response.json(
      ActiveEditionResponseSchema.parse({ apiVersion: 'v1', data: edition }),
      { headers: successCacheHeaders },
    );
  } catch (error) {
    console.error('Active edition repository failed', error);
    return Response.json(
      ApiErrorResponseSchema.parse({
        apiVersion: 'v1',
        error: {
          code: 'ACTIVE_EDITION_UNAVAILABLE',
          message: 'The active edition is temporarily unavailable.',
        },
      }),
      { status: 503, headers: errorCacheHeaders },
    );
  }
}
