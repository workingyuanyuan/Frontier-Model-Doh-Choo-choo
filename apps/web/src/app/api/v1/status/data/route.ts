import { getDataStatus } from '@llm-bench/db';

import { handleDataStatusRequest } from '../../../../../lib/data-status';
import { getWebDatabase } from '../../../../../lib/database';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  return handleDataStatusRequest(() => getDataStatus(getWebDatabase().db));
}
