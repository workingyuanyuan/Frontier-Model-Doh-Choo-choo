import { describe, expect, it } from 'vitest';

import { eq } from 'drizzle-orm';

import { createDatabase } from './client.js';
import {
  completeVideoJob,
  queueFormalVideoJob,
  startVideoJob,
} from './video-repository.js';
import { themePresets, videoJobs } from './schema/operations.js';
import {
  rankingSnapshots,
  scoringMethodVersions,
  weeklyEditions,
} from './schema/scoring.js';

const runDatabaseTests = process.env.RUN_DB_INTEGRATION_TESTS === '1';

describe.runIf(runDatabaseTests)(
  'formal video job PostgreSQL lifecycle',
  () => {
    it('queues, runs and completes one formal job while preview stays forbidden', async () => {
      const { db, pool } = createDatabase();
      const rollbackMarker = 'ROLLBACK_VIDEO_JOB_INTEGRATION_FIXTURE';
      let reachedRollback = false;
      let rollbackError: unknown;

      try {
        try {
          await db.transaction(async (transaction) => {
            await transaction.insert(scoringMethodVersions).values({
              id: '019f513f-132a-7dc0-805d-0b036ea0d570',
              version: 'video-job-integration-v1',
              status: 'PUBLISHED',
              config: { formalPublicationEnabled: true },
              methodologyMarkdown: 'Video job integration fixture.',
            });
            await transaction.insert(rankingSnapshots).values({
              id: '019f513f-132a-7dc0-805d-0b036ea0d571',
              editionDate: '2099-02-01',
              dataCutoffAt: new Date('2099-01-31T00:00:00.000Z'),
              scoringMethodVersionId: '019f513f-132a-7dc0-805d-0b036ea0d570',
              sourceSnapshotIds: ['019f513f-132a-7dc0-805d-0b036ea0d572'],
              entryCount: 0,
              contentSha256:
                'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
            });
            await transaction.insert(weeklyEditions).values([
              {
                id: '019f513f-132a-7dc0-805d-0b036ea0d573',
                editionDate: '2099-02-01',
                rankingSnapshotId: '019f513f-132a-7dc0-805d-0b036ea0d571',
                status: 'PUBLISHED',
                publicationMode: 'FORMAL',
                titleZhTw: '正式影片整合測試',
                titleEn: 'Formal video integration test',
                activatedAt: new Date('2099-02-01T00:00:00.000Z'),
              },
              {
                id: '019f513f-132a-7dc0-805d-0b036ea0d574',
                editionDate: '2099-02-02',
                rankingSnapshotId: '019f513f-132a-7dc0-805d-0b036ea0d571',
                status: 'PUBLISHED',
                publicationMode: 'PREVIEW',
                titleZhTw: '預覽影片整合測試',
                titleEn: 'Preview video integration test',
                activatedAt: new Date('2099-02-02T00:00:00.000Z'),
              },
            ]);
            await transaction.insert(themePresets).values({
              id: '019f513f-132a-7dc0-805d-0b036ea0d575',
              slug: 'video-job-integration-light',
              displayNameZhTw: '影片整合亮色',
              displayNameEn: 'Video integration light',
              tokens: { colorScheme: 'light' },
              geometryVersion: 'radar-v1',
            });

            await expect(
              queueFormalVideoJob(transaction, {
                weeklyEditionId: '019f513f-132a-7dc0-805d-0b036ea0d574',
                themePresetSlug: 'video-job-integration-light',
                locale: 'zh-TW',
                compositionId: 'LlmBenchWeekly',
                inputSnapshotSha256:
                  'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
              }),
            ).rejects.toThrow('formal editions');

            const jobId = await queueFormalVideoJob(transaction, {
              weeklyEditionId: '019f513f-132a-7dc0-805d-0b036ea0d573',
              themePresetSlug: 'video-job-integration-light',
              locale: 'en',
              compositionId: 'LlmBenchWeekly',
              inputSnapshotSha256:
                'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
            });
            await startVideoJob(
              transaction,
              jobId,
              new Date('2099-02-01T01:00:00.000Z'),
            );
            await completeVideoJob(transaction, jobId, {
              status: 'SUCCEEDED',
              outputPath: 'output/video/formal.mp4',
              outputSha256:
                'cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
              completedAt: new Date('2099-02-01T01:01:00.000Z'),
            });

            const [row] = await transaction
              .select({
                status: videoJobs.status,
                outputPath: videoJobs.outputPath,
                outputSha256: videoJobs.outputSha256,
                errorSummary: videoJobs.errorSummary,
              })
              .from(videoJobs)
              .where(eq(videoJobs.id, jobId));
            expect(row).toEqual({
              status: 'SUCCEEDED',
              outputPath: 'output/video/formal.mp4',
              outputSha256:
                'cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
              errorSummary: null,
            });

            reachedRollback = true;
            throw new Error(rollbackMarker);
          });
        } catch (error) {
          rollbackError = error;
        }
        expect(reachedRollback).toBe(true);
        expect(rollbackError).toMatchObject({ message: rollbackMarker });
      } finally {
        await pool.end();
      }
    });
  },
);
