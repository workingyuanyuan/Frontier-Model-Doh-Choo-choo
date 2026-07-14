import { describe, expect, it } from 'vitest';

import {
  auditLogs,
  createDatabase,
  modelFamilies,
  models,
  modelVariants,
  providers,
  rankingEntries,
  rankingSnapshots,
  scoringMethodVersions,
  weeklyEditions,
} from '@llm-bench/db';
import { eq } from 'drizzle-orm';

import { executeEditionCommandInTransaction } from './edition-publication.js';

const runDatabaseTests = process.env.RUN_DB_INTEGRATION_TESTS === '1';

describe.runIf(runDatabaseTests)(
  'weekly edition PostgreSQL transaction',
  () => {
    it('activates one preview edition and appends its audit entry atomically', async () => {
      const { db, pool } = createDatabase();
      const rollbackMarker = 'ROLLBACK_EDITION_INTEGRATION_FIXTURE';
      let reachedRollback = false;
      let rollbackError: unknown;

      try {
        try {
          await db.transaction(async (transaction) => {
            await transaction.insert(providers).values({
              id: '019f513f-132a-7dc0-805d-0b036ea0d500',
              slug: 'edition-integration-provider',
              displayName: 'Edition Integration Provider',
            });
            await transaction.insert(modelFamilies).values({
              id: '019f513f-132a-7dc0-805d-0b036ea0d501',
              providerId: '019f513f-132a-7dc0-805d-0b036ea0d500',
              slug: 'edition-integration-family',
              displayName: 'Edition Integration Family',
            });
            await transaction.insert(models).values({
              id: '019f513f-132a-7dc0-805d-0b036ea0d502',
              familyId: '019f513f-132a-7dc0-805d-0b036ea0d501',
              slug: 'edition-integration-model',
              displayName: 'Edition Integration Model',
            });
            await transaction.insert(modelVariants).values({
              id: '019f513f-132a-7dc0-805d-0b036ea0d503',
              modelId: '019f513f-132a-7dc0-805d-0b036ea0d502',
              slug: 'edition-integration-variant',
              displayName: 'Edition Integration Variant',
            });
            await transaction.insert(scoringMethodVersions).values({
              id: '019f513f-132a-7dc0-805d-0b036ea0d504',
              version: 'edition-integration-v1',
              status: 'DRAFT',
              config: { formalPublicationEnabled: false },
              methodologyMarkdown: 'Transaction integration fixture.',
            });
            await transaction.insert(rankingSnapshots).values({
              id: '019f513f-132a-7dc0-805d-0b036ea0d505',
              editionDate: '2099-01-01',
              dataCutoffAt: new Date('2098-12-31T00:00:00.000Z'),
              scoringMethodVersionId: '019f513f-132a-7dc0-805d-0b036ea0d504',
              sourceSnapshotIds: ['019f513f-132a-7dc0-805d-0b036ea0d506'],
              entryCount: 1,
              contentSha256:
                'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
            });
            await transaction.insert(rankingEntries).values({
              rankingSnapshotId: '019f513f-132a-7dc0-805d-0b036ea0d505',
              modelVariantId: '019f513f-132a-7dc0-805d-0b036ea0d503',
              rank: null,
              overallScore: null,
              overallCoverage: '0.125',
              overallConfidence: '12.5',
              rankingStatus: 'UNRANKED',
              dimensions: [],
              qualityFlags: ['LOW_COVERAGE'],
            });

            const summary = await executeEditionCommandInTransaction(
              transaction,
              {
                action: 'ACTIVATE',
                actor: 'integration-test',
                dryRun: false,
                mode: 'PREVIEW',
                snapshotId: '019f513f-132a-7dc0-805d-0b036ea0d505',
              },
            );
            expect(summary).toMatchObject({
              result: 'CHANGED',
              publicationMode: 'PREVIEW',
              editionDate: '2099-01-01',
            });

            const activeRows = await transaction
              .select({ id: weeklyEditions.id })
              .from(weeklyEditions)
              .where(eq(weeklyEditions.isActive, true));
            expect(activeRows).toHaveLength(1);
            expect(activeRows[0]?.id).toBe(summary.editionId);

            const auditRows = await transaction
              .select({ entryHash: auditLogs.entryHash })
              .from(auditLogs)
              .where(eq(auditLogs.resourceId, summary.editionId!));
            expect(auditRows).toEqual([{ entryHash: summary.auditEntryHash }]);

            reachedRollback = true;
            throw new Error(rollbackMarker);
          });
        } catch (error) {
          rollbackError = error;
        }
        expect(
          reachedRollback,
          rollbackError instanceof Error
            ? `Edition fixture failed before rollback: ${rollbackError.message}`
            : 'Edition fixture failed before rollback without an Error object',
        ).toBe(true);
        expect(rollbackError).toBeInstanceOf(Error);
      } finally {
        await pool.end();
      }
    });
  },
);
