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

function describeError(error: unknown): string {
  if (!(error instanceof Error)) return String(error);
  const cause = 'cause' in error ? error.cause : undefined;
  const details = ['code', 'detail', 'table', 'constraint']
    .map((key) => {
      const value = (error as unknown as Record<string, unknown>)[key];
      return value === undefined ? null : `${key}=${String(value)}`;
    })
    .filter((value): value is string => value !== null);
  const summary = `${error.name}: ${error.message || '<empty message>'}${
    details.length === 0 ? '' : ` (${details.join(', ')})`
  }`;
  return cause === undefined
    ? summary
    : `${summary}; cause: ${describeError(cause)}`;
}

describe.runIf(runDatabaseTests)(
  'weekly edition PostgreSQL transaction',
  () => {
    it('activates one preview edition and appends its audit entry atomically', async () => {
      const { db, pool } = createDatabase();
      const rollbackMarker = 'ROLLBACK_EDITION_INTEGRATION_FIXTURE';
      let reachedRollback = false;
      let rollbackError: unknown;
      let fixtureStage = 'opening transaction';

      try {
        try {
          await db.transaction(async (transaction) => {
            fixtureStage = 'inserting provider';
            await transaction.insert(providers).values({
              id: '019f513f-132a-7dc0-805d-0b036ea0d500',
              slug: 'edition-integration-provider',
              displayName: 'Edition Integration Provider',
            });
            fixtureStage = 'inserting model family';
            await transaction.insert(modelFamilies).values({
              id: '019f513f-132a-7dc0-805d-0b036ea0d501',
              providerId: '019f513f-132a-7dc0-805d-0b036ea0d500',
              slug: 'edition-integration-family',
              displayName: 'Edition Integration Family',
            });
            fixtureStage = 'inserting model';
            await transaction.insert(models).values({
              id: '019f513f-132a-7dc0-805d-0b036ea0d502',
              familyId: '019f513f-132a-7dc0-805d-0b036ea0d501',
              slug: 'edition-integration-model',
              displayName: 'Edition Integration Model',
            });
            fixtureStage = 'inserting model variant';
            await transaction.insert(modelVariants).values({
              id: '019f513f-132a-7dc0-805d-0b036ea0d503',
              modelId: '019f513f-132a-7dc0-805d-0b036ea0d502',
              slug: 'edition-integration-variant',
              displayName: 'Edition Integration Variant',
            });
            fixtureStage = 'inserting scoring method';
            await transaction.insert(scoringMethodVersions).values({
              id: '019f513f-132a-7dc0-805d-0b036ea0d504',
              version: 'edition-integration-v1',
              status: 'DRAFT',
              config: { formalPublicationEnabled: false },
              methodologyMarkdown: 'Transaction integration fixture.',
            });
            fixtureStage = 'inserting ranking snapshot';
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
            fixtureStage = 'inserting ranking entry';
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

            fixtureStage = 'activating preview edition';
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

            fixtureStage = 'verifying active edition';
            const activeRows = await transaction
              .select({ id: weeklyEditions.id })
              .from(weeklyEditions)
              .where(eq(weeklyEditions.isActive, true));
            expect(activeRows).toHaveLength(1);
            expect(activeRows[0]?.id).toBe(summary.editionId);

            fixtureStage = 'verifying audit entry';
            const auditRows = await transaction
              .select({ entryHash: auditLogs.entryHash })
              .from(auditLogs)
              .where(eq(auditLogs.resourceId, summary.editionId!));
            expect(auditRows).toEqual([{ entryHash: summary.auditEntryHash }]);

            fixtureStage = 'rolling back fixture';
            reachedRollback = true;
            throw new Error(rollbackMarker);
          });
        } catch (error) {
          rollbackError = error;
        }
        expect(
          reachedRollback,
          rollbackError instanceof Error
            ? `Edition fixture failed during ${fixtureStage}: ${describeError(rollbackError)}`
            : 'Edition fixture failed before rollback without an Error object',
        ).toBe(true);
        expect(rollbackError).toBeInstanceOf(Error);
      } finally {
        await pool.end();
      }
    });
  },
);
