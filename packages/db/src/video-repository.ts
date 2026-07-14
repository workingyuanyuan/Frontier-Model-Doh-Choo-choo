import type { ActiveEdition, PublicationMode } from '@llm-bench/contracts';
import { and, eq } from 'drizzle-orm';

import type { DatabaseExecutor } from './client.js';
import {
  assembleActiveEdition,
  type ActiveEditionHeaderRow,
  type ActiveEditionRankingRow,
} from './ranking-repository.js';
import {
  modelFamilies,
  models,
  modelVariants,
  providers,
} from './schema/identity.js';
import { themePresets, videoJobs } from './schema/operations.js';
import {
  rankingEntries,
  rankingSnapshots,
  scoringMethodVersions,
  weeklyEditions,
} from './schema/scoring.js';

export type VideoJobStatus = 'QUEUED' | 'RUNNING' | 'SUCCEEDED' | 'FAILED';

export type VideoEditionSelector =
  | { readonly editionId: string; readonly snapshotId?: never }
  | { readonly editionId?: never; readonly snapshotId: string };

export function shouldPersistVideoJob(mode: PublicationMode): boolean {
  return mode === 'FORMAL';
}

export function assertVideoJobTransition(
  from: VideoJobStatus,
  to: VideoJobStatus,
): void {
  const valid =
    (from === 'QUEUED' && to === 'RUNNING') ||
    (from === 'RUNNING' && (to === 'SUCCEEDED' || to === 'FAILED'));
  if (!valid) {
    throw new Error(`Invalid video job transition: ${from} → ${to}`);
  }
}

export async function getEditionForVideo(
  db: DatabaseExecutor,
  selector: VideoEditionSelector,
): Promise<ActiveEdition | null> {
  const condition =
    'editionId' in selector
      ? eq(weeklyEditions.id, selector.editionId)
      : eq(rankingSnapshots.id, selector.snapshotId);
  const headerRows: ActiveEditionHeaderRow[] = await db
    .select({
      id: weeklyEditions.id,
      publicationMode: weeklyEditions.publicationMode,
      titleZhTw: weeklyEditions.titleZhTw,
      titleEn: weeklyEditions.titleEn,
      summaryZhTw: weeklyEditions.summaryZhTw,
      summaryEn: weeklyEditions.summaryEn,
      activatedAt: weeklyEditions.activatedAt,
      snapshotSha256: rankingSnapshots.contentSha256,
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
    .where(condition)
    .limit(2);
  if (headerRows.length === 0) return null;
  if (headerRows.length !== 1) {
    throw new Error('Video snapshot is attached to multiple weekly editions');
  }
  const header = headerRows[0]!;

  const rows: ActiveEditionRankingRow[] = await db
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

export interface QueueVideoJobInput {
  readonly weeklyEditionId: string;
  readonly themePresetSlug: string;
  readonly locale: string;
  readonly compositionId: string;
  readonly inputSnapshotSha256: string;
}

export async function queueFormalVideoJob(
  db: DatabaseExecutor,
  input: QueueVideoJobInput,
): Promise<string> {
  return db.transaction(async (transaction) => {
    const [edition] = await transaction
      .select({ publicationMode: weeklyEditions.publicationMode })
      .from(weeklyEditions)
      .where(eq(weeklyEditions.id, input.weeklyEditionId))
      .limit(1);
    if (!edition || edition.publicationMode !== 'FORMAL') {
      throw new Error('Video jobs may only be persisted for formal editions');
    }
    const [theme] = await transaction
      .select({ id: themePresets.id })
      .from(themePresets)
      .where(eq(themePresets.slug, input.themePresetSlug))
      .limit(1);
    if (!theme) throw new Error('Video theme preset is not registered');

    const [job] = await transaction
      .insert(videoJobs)
      .values({
        weeklyEditionId: input.weeklyEditionId,
        themePresetId: theme.id,
        locale: input.locale,
        compositionId: input.compositionId,
        inputSnapshotSha256: input.inputSnapshotSha256,
      })
      .returning({ id: videoJobs.id });
    if (!job) throw new Error('Video job insert returned no row');
    return job.id;
  });
}

export async function startVideoJob(
  db: DatabaseExecutor,
  jobId: string,
  startedAt = new Date(),
): Promise<void> {
  assertVideoJobTransition('QUEUED', 'RUNNING');
  const rows = await db
    .update(videoJobs)
    .set({ status: 'RUNNING', startedAt })
    .where(and(eq(videoJobs.id, jobId), eq(videoJobs.status, 'QUEUED')))
    .returning({ id: videoJobs.id });
  if (rows.length !== 1) throw new Error('Video job is not queued');
}

export type CompleteVideoJobInput =
  | {
      readonly status: 'SUCCEEDED';
      readonly outputPath: string;
      readonly outputSha256: string;
      readonly completedAt?: Date;
    }
  | {
      readonly status: 'FAILED';
      readonly errorSummary: string;
      readonly completedAt?: Date;
    };

export async function completeVideoJob(
  db: DatabaseExecutor,
  jobId: string,
  input: CompleteVideoJobInput,
): Promise<void> {
  assertVideoJobTransition('RUNNING', input.status);
  const values =
    input.status === 'SUCCEEDED'
      ? {
          status: input.status,
          outputPath: input.outputPath,
          outputSha256: input.outputSha256,
          errorSummary: null,
          completedAt: input.completedAt ?? new Date(),
        }
      : {
          status: input.status,
          outputPath: null,
          outputSha256: null,
          errorSummary: input.errorSummary.slice(0, 2_000),
          completedAt: input.completedAt ?? new Date(),
        };
  const rows = await db
    .update(videoJobs)
    .set(values)
    .where(and(eq(videoJobs.id, jobId), eq(videoJobs.status, 'RUNNING')))
    .returning({ id: videoJobs.id });
  if (rows.length !== 1) throw new Error('Video job is not running');
}
