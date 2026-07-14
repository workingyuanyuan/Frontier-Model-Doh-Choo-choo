import { ActiveEditionSchema, type ActiveEdition } from '@llm-bench/contracts';
import { eq } from 'drizzle-orm';

import type { Database } from './client.js';
import {
  modelFamilies,
  models,
  modelVariants,
  providers,
} from './schema/identity.js';
import {
  rankingEntries,
  rankingSnapshots,
  scoringMethodVersions,
  weeklyEditions,
} from './schema/scoring.js';

export interface ActiveEditionHeaderRow {
  readonly id: string;
  readonly publicationMode: string;
  readonly titleZhTw: string;
  readonly titleEn: string;
  readonly summaryZhTw: string | null;
  readonly summaryEn: string | null;
  readonly activatedAt: Date | null;
  readonly snapshotId: string;
  readonly editionDate: string;
  readonly dataCutoffAt: Date;
  readonly scoringMethodVersion: string;
  readonly sourceSnapshotIds: string[];
  readonly entryCount: number;
}

export interface ActiveEditionRankingRow {
  readonly modelVariantId: string;
  readonly slug: string;
  readonly displayName: string;
  readonly providerName: string;
  readonly rank: number | null;
  readonly overallScore: string | null;
  readonly overallCoverage: string;
  readonly overallConfidence: string;
  readonly rankingStatus: string;
  readonly dimensions: unknown;
  readonly qualityFlags: unknown;
}

function compareRankingRows(
  left: ActiveEditionRankingRow,
  right: ActiveEditionRankingRow,
): number {
  if (left.rank !== null || right.rank !== null) {
    if (left.rank === null) return 1;
    if (right.rank === null) return -1;
    if (left.rank !== right.rank) return left.rank - right.rank;
  }
  const leftKey = `${left.slug}\0${left.modelVariantId}`;
  const rightKey = `${right.slug}\0${right.modelVariantId}`;
  return leftKey < rightKey ? -1 : leftKey > rightKey ? 1 : 0;
}

export function assembleActiveEdition(
  header: ActiveEditionHeaderRow,
  rows: readonly ActiveEditionRankingRow[],
): ActiveEdition {
  if (rows.length !== header.entryCount) {
    throw new Error('Active ranking snapshot entry count does not match rows');
  }
  if (header.activatedAt === null) {
    throw new Error('Active weekly edition is missing activated timestamp');
  }

  return ActiveEditionSchema.parse({
    id: header.id,
    publicationMode: header.publicationMode,
    titleZhTw: header.titleZhTw,
    titleEn: header.titleEn,
    summaryZhTw: header.summaryZhTw,
    summaryEn: header.summaryEn,
    activatedAt: header.activatedAt.toISOString(),
    snapshot: {
      id: header.snapshotId,
      editionDate: header.editionDate,
      dataCutoffAt: header.dataCutoffAt.toISOString(),
      scoringMethodVersion: header.scoringMethodVersion,
      sourceSnapshotIds: header.sourceSnapshotIds,
      entries: [...rows].sort(compareRankingRows).map((row) => ({
        modelVariantId: row.modelVariantId,
        slug: row.slug,
        displayName: row.displayName,
        providerName: row.providerName,
        rank: row.rank,
        overallScore:
          row.overallScore === null ? null : Number(row.overallScore),
        overallCoverage: Number(row.overallCoverage),
        overallConfidence: Number(row.overallConfidence),
        rankingStatus: row.rankingStatus,
        dimensions: row.dimensions,
        qualityFlags: row.qualityFlags,
      })),
    },
  });
}

export async function getActiveEdition(
  db: Database,
): Promise<ActiveEdition | null> {
  const headerRows = await db
    .select({
      id: weeklyEditions.id,
      publicationMode: weeklyEditions.publicationMode,
      titleZhTw: weeklyEditions.titleZhTw,
      titleEn: weeklyEditions.titleEn,
      summaryZhTw: weeklyEditions.summaryZhTw,
      summaryEn: weeklyEditions.summaryEn,
      activatedAt: weeklyEditions.activatedAt,
      snapshotId: rankingSnapshots.id,
      editionDate: rankingSnapshots.editionDate,
      dataCutoffAt: rankingSnapshots.dataCutoffAt,
      scoringMethodVersion: scoringMethodVersions.version,
      sourceSnapshotIds: rankingSnapshots.sourceSnapshotIds,
      entryCount: rankingSnapshots.entryCount,
    })
    .from(weeklyEditions)
    .innerJoin(
      rankingSnapshots,
      eq(weeklyEditions.rankingSnapshotId, rankingSnapshots.id),
    )
    .innerJoin(
      scoringMethodVersions,
      eq(rankingSnapshots.scoringMethodVersionId, scoringMethodVersions.id),
    )
    .where(eq(weeklyEditions.isActive, true))
    .limit(2);
  if (headerRows.length === 0) return null;
  if (headerRows.length !== 1) {
    throw new Error('Multiple active weekly editions violate repository state');
  }
  const header = headerRows[0]!;

  const rows = await db
    .select({
      modelVariantId: rankingEntries.modelVariantId,
      slug: modelVariants.slug,
      displayName: modelVariants.displayName,
      providerName: providers.displayName,
      rank: rankingEntries.rank,
      overallScore: rankingEntries.overallScore,
      overallCoverage: rankingEntries.overallCoverage,
      overallConfidence: rankingEntries.overallConfidence,
      rankingStatus: rankingEntries.rankingStatus,
      dimensions: rankingEntries.dimensions,
      qualityFlags: rankingEntries.qualityFlags,
    })
    .from(rankingEntries)
    .innerJoin(
      modelVariants,
      eq(rankingEntries.modelVariantId, modelVariants.id),
    )
    .innerJoin(models, eq(modelVariants.modelId, models.id))
    .innerJoin(modelFamilies, eq(models.familyId, modelFamilies.id))
    .innerJoin(providers, eq(modelFamilies.providerId, providers.id))
    .where(eq(rankingEntries.rankingSnapshotId, header.snapshotId));

  return assembleActiveEdition(header, rows);
}
