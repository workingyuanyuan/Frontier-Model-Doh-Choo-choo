import { getActiveEdition } from '@llm-bench/db';

import { getWebDatabase } from '../../../../../lib/database';
import { handleLatestRankingsRequest } from '../../../../../lib/latest-rankings';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  return handleLatestRankingsRequest(() =>
    getActiveEdition(getWebDatabase().db),
  );
}
