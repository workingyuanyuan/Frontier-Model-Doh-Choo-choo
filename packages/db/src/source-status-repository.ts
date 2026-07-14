import {
  IngestionRunSummarySchema,
  PipelineStatusSchema,
  SourceRegistrySchema,
  type DataStatus,
  type PipelineStatus,
  type SourceRegistryEntry,
} from '@llm-bench/contracts';
import { count, desc, eq, max } from 'drizzle-orm';

import type { Database } from './client.js';
import { getDataStatus } from './data-status-repository.js';
import {
  ingestionRuns,
  sourceSnapshots,
  sources,
  stagedResults,
} from './schema/evidence.js';
import { rankingSnapshots, weeklyEditions } from './schema/scoring.js';

export interface IngestionRunSummaryRow {
  readonly sourceSlug: string;
  readonly status: string;
  readonly connectorVersion: string;
  readonly startedAt: Date;
  readonly completedAt: Date | null;
  readonly recordsSeen: number;
  readonly recordsAccepted: number;
}

export function assembleIngestionRunSummary(row: IngestionRunSummaryRow) {
  return IngestionRunSummarySchema.parse({
    ...row,
    startedAt: row.startedAt.toISOString(),
    completedAt: row.completedAt?.toISOString() ?? null,
  });
}

interface SourceAggregateRow {
  readonly slug: string;
  readonly displayName: string;
  readonly sourceType: string;
  readonly baseUrl: string | null;
  readonly trustTier: string;
  readonly licenseSpdx: string | null;
  readonly termsUrl: string | null;
  readonly isEnabled: boolean;
  readonly snapshotCount: number;
  readonly latestFetchedAt: Date | null;
}

export function assembleSourceRegistry(
  sourceRows: SourceAggregateRow[],
  latestRuns: Map<string, IngestionRunSummaryRow>,
): SourceRegistryEntry[] {
  return SourceRegistrySchema.parse(
    sourceRows.map((source) => {
      const latestRun = latestRuns.get(source.slug);
      return {
        ...source,
        latestFetchedAt: source.latestFetchedAt?.toISOString() ?? null,
        latestRun: latestRun ? assembleIngestionRunSummary(latestRun) : null,
      };
    }),
  );
}

export async function getSourceRegistry(
  db: Database,
): Promise<SourceRegistryEntry[]> {
  const sourceRows = await db
    .select({
      id: sources.id,
      slug: sources.slug,
      displayName: sources.displayName,
      sourceType: sources.sourceType,
      baseUrl: sources.baseUrl,
      trustTier: sources.trustTier,
      licenseSpdx: sources.licenseSpdx,
      termsUrl: sources.termsUrl,
      isEnabled: sources.isEnabled,
      snapshotCount: count(sourceSnapshots.id),
      latestFetchedAt: max(sourceSnapshots.fetchedAt),
    })
    .from(sources)
    .leftJoin(sourceSnapshots, eq(sourceSnapshots.sourceId, sources.id))
    .groupBy(sources.id)
    .orderBy(sources.slug);

  const latestRunPairs = await Promise.all(
    sourceRows.map(async (source) => {
      const [run] = await db
        .select({
          sourceSlug: sources.slug,
          status: ingestionRuns.status,
          connectorVersion: ingestionRuns.connectorVersion,
          startedAt: ingestionRuns.startedAt,
          completedAt: ingestionRuns.completedAt,
          recordsSeen: ingestionRuns.recordsSeen,
          recordsAccepted: ingestionRuns.recordsAccepted,
        })
        .from(ingestionRuns)
        .innerJoin(sources, eq(ingestionRuns.sourceId, sources.id))
        .where(eq(ingestionRuns.sourceId, source.id))
        .orderBy(desc(ingestionRuns.startedAt))
        .limit(1);
      return run ? ([source.slug, run] as const) : null;
    }),
  );

  return assembleSourceRegistry(
    sourceRows,
    new Map(latestRunPairs.filter((pair) => pair !== null)),
  );
}

interface PipelineCounts {
  readonly sourceCount: number;
  readonly snapshotCount: number;
  readonly ingestionRunCount: number;
  readonly stagedRowCount: number;
  readonly rankingSnapshotCount: number;
  readonly editionCount: number;
}

export function assemblePipelineStatus(
  data: DataStatus,
  counts: PipelineCounts,
  latestRun: IngestionRunSummaryRow | null,
): PipelineStatus {
  return PipelineStatusSchema.parse({
    data,
    ...counts,
    latestRun: latestRun ? assembleIngestionRunSummary(latestRun) : null,
  });
}

export async function getPipelineStatus(db: Database): Promise<PipelineStatus> {
  const [
    data,
    sourceCountRows,
    snapshotCountRows,
    ingestionRunCountRows,
    stagedRowCountRows,
    rankingSnapshotCountRows,
    editionCountRows,
    latestRunRows,
  ] = await Promise.all([
    getDataStatus(db),
    db.select({ value: count() }).from(sources),
    db.select({ value: count() }).from(sourceSnapshots),
    db.select({ value: count() }).from(ingestionRuns),
    db.select({ value: count() }).from(stagedResults),
    db.select({ value: count() }).from(rankingSnapshots),
    db.select({ value: count() }).from(weeklyEditions),
    db
      .select({
        sourceSlug: sources.slug,
        status: ingestionRuns.status,
        connectorVersion: ingestionRuns.connectorVersion,
        startedAt: ingestionRuns.startedAt,
        completedAt: ingestionRuns.completedAt,
        recordsSeen: ingestionRuns.recordsSeen,
        recordsAccepted: ingestionRuns.recordsAccepted,
      })
      .from(ingestionRuns)
      .innerJoin(sources, eq(ingestionRuns.sourceId, sources.id))
      .orderBy(desc(ingestionRuns.startedAt))
      .limit(1),
  ]);

  return assemblePipelineStatus(
    data,
    {
      sourceCount: sourceCountRows[0]?.value ?? 0,
      snapshotCount: snapshotCountRows[0]?.value ?? 0,
      ingestionRunCount: ingestionRunCountRows[0]?.value ?? 0,
      stagedRowCount: stagedRowCountRows[0]?.value ?? 0,
      rankingSnapshotCount: rankingSnapshotCountRows[0]?.value ?? 0,
      editionCount: editionCountRows[0]?.value ?? 0,
    },
    latestRunRows[0] ?? null,
  );
}
