import { DataStatusSchema, type DataStatus } from '@llm-bench/contracts';
import { count, eq } from 'drizzle-orm';

import type { Database } from './client.js';
import { benchmarkResults } from './schema/evidence.js';
import { rankingSnapshots, weeklyEditions } from './schema/scoring.js';

export interface DataStatusActiveRow {
  readonly id: string;
  readonly editionDate: string;
  readonly publicationMode: string;
  readonly activatedAt: Date | null;
  readonly snapshotId: string;
  readonly entryCount: number;
}

export function assembleDataStatus(
  activeRow: DataStatusActiveRow | null,
  publishedResultCount: number,
): DataStatus {
  if (activeRow?.activatedAt === null) {
    throw new Error('Active weekly edition is missing activated timestamp');
  }

  return DataStatusSchema.parse({
    status: 'READY',
    activeEdition:
      activeRow === null
        ? null
        : {
            ...activeRow,
            activatedAt: activeRow.activatedAt.toISOString(),
          },
    publishedResultCount,
  });
}

export async function getDataStatus(db: Database): Promise<DataStatus> {
  const [activeRows, resultCountRows] = await Promise.all([
    db
      .select({
        id: weeklyEditions.id,
        editionDate: weeklyEditions.editionDate,
        publicationMode: weeklyEditions.publicationMode,
        activatedAt: weeklyEditions.activatedAt,
        snapshotId: rankingSnapshots.id,
        entryCount: rankingSnapshots.entryCount,
      })
      .from(weeklyEditions)
      .innerJoin(
        rankingSnapshots,
        eq(weeklyEditions.rankingSnapshotId, rankingSnapshots.id),
      )
      .where(eq(weeklyEditions.isActive, true))
      .limit(2),
    db.select({ value: count() }).from(benchmarkResults),
  ]);

  if (activeRows.length > 1) {
    throw new Error('Multiple active weekly editions violate repository state');
  }

  return assembleDataStatus(
    activeRows[0] ?? null,
    resultCountRows[0]?.value ?? 0,
  );
}
