import {
  ApiErrorResponseSchema,
  DataStatusResponseSchema,
  type DataStatus,
} from '@llm-bench/contracts';

const noStoreHeaders = { 'Cache-Control': 'no-store' } as const;

export type DataStatusLoader = () => Promise<DataStatus>;

export async function handleDataStatusRequest(
  loadDataStatus: DataStatusLoader,
): Promise<Response> {
  try {
    const status = await loadDataStatus();
    return Response.json(
      DataStatusResponseSchema.parse({ apiVersion: 'v1', data: status }),
      { headers: noStoreHeaders },
    );
  } catch (error) {
    console.error('Data status repository failed', error);
    return Response.json(
      ApiErrorResponseSchema.parse({
        apiVersion: 'v1',
        error: {
          code: 'DATA_STATUS_UNAVAILABLE',
          message: 'Data status is temporarily unavailable.',
        },
      }),
      { status: 503, headers: noStoreHeaders },
    );
  }
}
