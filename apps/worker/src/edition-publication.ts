import { createHash } from 'node:crypto';

import {
  type Database,
  auditLogs,
  rankingEntries,
  rankingSnapshots,
  scoringMethodVersions,
  weeklyEditions,
} from '@llm-bench/db';
import type { RankingStatus } from '@llm-bench/contracts';
import { assertFormalPublicationEligible } from '@llm-bench/scoring';
import { desc, eq, sql } from 'drizzle-orm';

export type EditionPublicationMode = 'FORMAL' | 'PREVIEW';

export type EditionCommand =
  | {
      readonly action: 'ACTIVATE';
      readonly actor: string;
      readonly dryRun: boolean;
      readonly mode: EditionPublicationMode;
      readonly snapshotId: string;
    }
  | {
      readonly action: 'ROLLBACK';
      readonly actor: string;
      readonly dryRun: boolean;
      readonly editionDate: string;
    };

export interface EditionPolicyInput {
  readonly mode: EditionPublicationMode;
  readonly scoringMethodVersion: string;
  readonly scoringMethodStatus: string;
  readonly formalPublicationEnabled: boolean;
  readonly entries: readonly {
    readonly rankingStatus: RankingStatus;
    readonly rank: number | null;
    readonly overallScore: number | null;
  }[];
}

export interface EditionAuditInput {
  readonly occurredAt: string;
  readonly actor: string;
  readonly action: string;
  readonly resourceType: string;
  readonly resourceId: string;
  readonly metadata: Readonly<Record<string, unknown>>;
}

export interface EditionCommandSummary {
  readonly dryRun: boolean;
  readonly operation: 'ACTIVATE' | 'ROLLBACK';
  readonly result: 'NOOP' | 'WOULD_CHANGE' | 'CHANGED';
  readonly editionId: string | null;
  readonly editionDate: string;
  readonly rankingSnapshotId: string;
  readonly publicationMode: EditionPublicationMode;
  readonly previousEditionId: string | null;
  readonly auditEntryHash: string | null;
}

const uuidV7Pattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/u;
const actorPattern = /^[A-Za-z0-9._@-]{1,80}$/u;

function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return (
    !Number.isNaN(parsed.valueOf()) && parsed.toISOString().startsWith(value)
  );
}

export function parseEditionCommandArguments(
  arguments_: readonly string[],
): EditionCommand {
  let snapshotId: string | undefined;
  let editionDate: string | undefined;
  let mode: EditionPublicationMode | undefined;
  let actor = 'local-operator';
  let actorWasSet = false;
  let applyCount = 0;

  for (let index = 0; index < arguments_.length; index += 1) {
    const argument = arguments_[index];
    if (argument === '--') continue;
    if (argument === '--apply') {
      applyCount += 1;
      continue;
    }
    const value = arguments_[index + 1];
    if (argument === '--activate-snapshot') {
      if (snapshotId !== undefined || !value || !uuidV7Pattern.test(value)) {
        throw new Error('Activation snapshot must be one UUIDv7');
      }
      snapshotId = value;
      index += 1;
      continue;
    }
    if (argument === '--rollback-edition') {
      if (editionDate !== undefined || !value || !isIsoDate(value)) {
        throw new Error('Rollback edition must be one YYYY-MM-DD date');
      }
      editionDate = value;
      index += 1;
      continue;
    }
    if (argument === '--mode') {
      if (mode !== undefined || (value !== 'formal' && value !== 'preview')) {
        throw new Error('Edition mode must be formal or preview');
      }
      mode = value.toUpperCase() as EditionPublicationMode;
      index += 1;
      continue;
    }
    if (argument === '--actor') {
      if (!value || !actorPattern.test(value) || actorWasSet) {
        throw new Error('Edition actor is invalid or duplicated');
      }
      actor = value;
      actorWasSet = true;
      index += 1;
      continue;
    }
    throw new Error(`Unknown edition argument: ${argument}`);
  }

  if (applyCount > 1) {
    throw new Error('Edition --apply argument may only appear once');
  }
  if ((snapshotId === undefined) === (editionDate === undefined)) {
    throw new Error('Edition command requires exactly one action');
  }
  if (snapshotId !== undefined) {
    if (!mode) throw new Error('Edition activation requires --mode');
    return {
      action: 'ACTIVATE',
      actor,
      dryRun: applyCount === 0,
      mode,
      snapshotId,
    };
  }
  if (mode) throw new Error('Rollback reuses the recorded publication mode');
  return {
    action: 'ROLLBACK',
    actor,
    dryRun: applyCount === 0,
    editionDate: editionDate!,
  };
}

export function assertEditionActivationPolicy(input: EditionPolicyInput): void {
  if (input.entries.length === 0) {
    throw new Error('Edition activation requires at least one ranking entry');
  }
  if (input.mode === 'PREVIEW') return;
  assertFormalPublicationEligible(input);
}

export function createEditionAuditHash(
  previousHash: string | null,
  input: EditionAuditInput,
): string {
  return createHash('sha256')
    .update(
      JSON.stringify([
        'edition-audit-v1',
        previousHash,
        input.occurredAt,
        input.actor,
        input.action,
        input.resourceType,
        input.resourceId,
        input.metadata,
      ]),
    )
    .digest('hex');
}

function asRecord(value: unknown): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error('Scoring method config must be an object');
  }
  return value as Record<string, unknown>;
}

interface TargetEdition {
  readonly editionId: string | null;
  readonly editionDate: string;
  readonly rankingSnapshotId: string;
  readonly snapshotSha256: string;
  readonly publicationMode: EditionPublicationMode;
  readonly scoringMethodVersion: string;
  readonly scoringMethodStatus: string;
  readonly formalPublicationEnabled: boolean;
}

type Transaction = Parameters<Parameters<Database['transaction']>[0]>[0];

async function getSnapshotTarget(
  transaction: Transaction,
  snapshotId: string,
  publicationMode: EditionPublicationMode,
): Promise<TargetEdition> {
  const [snapshot] = await transaction
    .select({
      rankingSnapshotId: rankingSnapshots.id,
      editionDate: rankingSnapshots.editionDate,
      snapshotSha256: rankingSnapshots.contentSha256,
      scoringMethodVersion: scoringMethodVersions.version,
      scoringMethodStatus: scoringMethodVersions.status,
      config: scoringMethodVersions.config,
    })
    .from(rankingSnapshots)
    .innerJoin(
      scoringMethodVersions,
      eq(rankingSnapshots.scoringMethodVersionId, scoringMethodVersions.id),
    )
    .where(eq(rankingSnapshots.id, snapshotId))
    .limit(1);
  if (!snapshot) throw new Error('Ranking snapshot not found');
  const [edition] = await transaction
    .select({
      id: weeklyEditions.id,
      rankingSnapshotId: weeklyEditions.rankingSnapshotId,
      publicationMode: weeklyEditions.publicationMode,
    })
    .from(weeklyEditions)
    .where(eq(weeklyEditions.editionDate, snapshot.editionDate))
    .limit(1);
  if (edition && edition.rankingSnapshotId !== snapshotId) {
    throw new Error('Immutable weekly edition snapshot conflict');
  }
  if (edition && edition.publicationMode !== publicationMode) {
    throw new Error('Immutable weekly edition mode conflict');
  }
  const config = asRecord(snapshot.config);
  return {
    editionId: edition?.id ?? null,
    editionDate: snapshot.editionDate,
    rankingSnapshotId: snapshot.rankingSnapshotId,
    snapshotSha256: snapshot.snapshotSha256,
    publicationMode,
    scoringMethodVersion: snapshot.scoringMethodVersion,
    scoringMethodStatus: snapshot.scoringMethodStatus,
    formalPublicationEnabled: config.formalPublicationEnabled === true,
  };
}

async function getRollbackTarget(
  transaction: Transaction,
  editionDate: string,
): Promise<TargetEdition> {
  const [edition] = await transaction
    .select({
      editionId: weeklyEditions.id,
      editionDate: weeklyEditions.editionDate,
      rankingSnapshotId: rankingSnapshots.id,
      snapshotSha256: rankingSnapshots.contentSha256,
      publicationMode: weeklyEditions.publicationMode,
      scoringMethodVersion: scoringMethodVersions.version,
      scoringMethodStatus: scoringMethodVersions.status,
      config: scoringMethodVersions.config,
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
    .where(eq(weeklyEditions.editionDate, editionDate))
    .limit(1);
  if (!edition) throw new Error('Rollback weekly edition not found');
  if (
    edition.publicationMode !== 'FORMAL' &&
    edition.publicationMode !== 'PREVIEW'
  ) {
    throw new Error('Rollback edition has an invalid publication mode');
  }
  const config = asRecord(edition.config);
  return {
    ...edition,
    publicationMode: edition.publicationMode,
    formalPublicationEnabled: config.formalPublicationEnabled === true,
  };
}

export async function executeEditionCommandInTransaction(
  transaction: Transaction,
  command: EditionCommand,
): Promise<EditionCommandSummary> {
  if (!command.dryRun) {
    await transaction.execute(sql`select pg_advisory_xact_lock(78236491)`);
  }
  const target =
    command.action === 'ACTIVATE'
      ? await getSnapshotTarget(transaction, command.snapshotId, command.mode)
      : await getRollbackTarget(transaction, command.editionDate);
  const entryRows = await transaction
    .select({
      rankingStatus: rankingEntries.rankingStatus,
      rank: rankingEntries.rank,
      overallScore: rankingEntries.overallScore,
    })
    .from(rankingEntries)
    .where(eq(rankingEntries.rankingSnapshotId, target.rankingSnapshotId));
  assertEditionActivationPolicy({
    mode: target.publicationMode,
    scoringMethodVersion: target.scoringMethodVersion,
    scoringMethodStatus: target.scoringMethodStatus,
    formalPublicationEnabled: target.formalPublicationEnabled,
    entries: entryRows.map((entry) => ({
      rankingStatus: entry.rankingStatus as RankingStatus,
      rank: entry.rank,
      overallScore:
        entry.overallScore === null ? null : Number(entry.overallScore),
    })),
  });

  const [current] = await transaction
    .select({
      editionId: weeklyEditions.id,
      rankingSnapshotId: weeklyEditions.rankingSnapshotId,
    })
    .from(weeklyEditions)
    .where(eq(weeklyEditions.isActive, true))
    .limit(1);
  if (target.editionId !== null && current?.editionId === target.editionId) {
    return {
      dryRun: command.dryRun,
      operation: command.action,
      result: 'NOOP',
      editionId: target.editionId,
      editionDate: target.editionDate,
      rankingSnapshotId: target.rankingSnapshotId,
      publicationMode: target.publicationMode,
      previousEditionId: current.editionId,
      auditEntryHash: null,
    };
  }
  if (command.dryRun) {
    return {
      dryRun: true,
      operation: command.action,
      result: 'WOULD_CHANGE',
      editionId: target.editionId,
      editionDate: target.editionDate,
      rankingSnapshotId: target.rankingSnapshotId,
      publicationMode: target.publicationMode,
      previousEditionId: current?.editionId ?? null,
      auditEntryHash: null,
    };
  }

  const occurredAt = new Date();
  let editionId = target.editionId;
  if (editionId === null) {
    const isPreview = target.publicationMode === 'PREVIEW';
    const [inserted] = await transaction
      .insert(weeklyEditions)
      .values({
        editionDate: target.editionDate,
        rankingSnapshotId: target.rankingSnapshotId,
        status: 'INACTIVE',
        publicationMode: target.publicationMode,
        isActive: false,
        titleZhTw: `${target.editionDate} LLM 基準週報${isPreview ? '（預覽）' : ''}`,
        titleEn: `${target.editionDate} LLM benchmark weekly${isPreview ? ' (Preview)' : ''}`,
      })
      .returning({ id: weeklyEditions.id });
    if (!inserted) throw new Error('Weekly edition insert failed');
    editionId = inserted.id;
  }
  if (current) {
    await transaction
      .update(weeklyEditions)
      .set({
        status: 'INACTIVE',
        isActive: false,
        deactivatedAt: occurredAt,
      })
      .where(eq(weeklyEditions.id, current.editionId));
  }
  await transaction
    .update(weeklyEditions)
    .set({
      status: 'ACTIVE',
      isActive: true,
      activatedAt: occurredAt,
      deactivatedAt: null,
      publishedAt:
        target.publicationMode === 'FORMAL'
          ? sql`coalesce(${weeklyEditions.publishedAt}, ${occurredAt})`
          : null,
    })
    .where(eq(weeklyEditions.id, editionId));

  const [previousAudit] = await transaction
    .select({ entryHash: auditLogs.entryHash })
    .from(auditLogs)
    .orderBy(desc(auditLogs.occurredAt), desc(auditLogs.id))
    .limit(1);
  const auditAction =
    command.action === 'ROLLBACK' ? 'EDITION_ROLLED_BACK' : 'EDITION_ACTIVATED';
  const metadata = {
    schemaVersion: 1,
    operation: command.action,
    previousEditionId: current?.editionId ?? null,
    previousSnapshotId: current?.rankingSnapshotId ?? null,
    targetEditionId: editionId,
    targetSnapshotId: target.rankingSnapshotId,
    targetSnapshotSha256: target.snapshotSha256,
    publicationMode: target.publicationMode,
  } as const;
  const auditInput = {
    occurredAt: occurredAt.toISOString(),
    actor: command.actor,
    action: auditAction,
    resourceType: 'weekly_edition',
    resourceId: editionId,
    metadata,
  } as const;
  const auditEntryHash = createEditionAuditHash(
    previousAudit?.entryHash ?? null,
    auditInput,
  );
  await transaction.insert(auditLogs).values({
    occurredAt,
    actor: command.actor,
    action: auditAction,
    resourceType: 'weekly_edition',
    resourceId: editionId,
    metadata,
    previousHash: previousAudit?.entryHash ?? null,
    entryHash: auditEntryHash,
  });

  return {
    dryRun: false,
    operation: command.action,
    result: 'CHANGED',
    editionId,
    editionDate: target.editionDate,
    rankingSnapshotId: target.rankingSnapshotId,
    publicationMode: target.publicationMode,
    previousEditionId: current?.editionId ?? null,
    auditEntryHash,
  };
}

export async function executeEditionCommand(
  db: Database,
  command: EditionCommand,
): Promise<EditionCommandSummary> {
  return db.transaction(
    (transaction) => executeEditionCommandInTransaction(transaction, command),
    {
      isolationLevel: 'serializable',
      accessMode: command.dryRun ? 'read only' : 'read write',
    },
  );
}
