import {
  type Database,
  ingestionRuns,
  modelAliases,
  sources,
  stagedResults,
} from '@llm-bench/db';
import { and, eq } from 'drizzle-orm';

import {
  buildModelAliasReviewQueue,
  type ModelAliasCandidate,
  type ModelAliasReviewQueueItem,
  resolveExactModelAlias,
} from './model-alias-resolution.js';

export const LIVEBENCH_ALIAS_NAMESPACE = 'livebench';

export interface StagedAliasRecord {
  readonly id: string;
  readonly rawModelName: string;
}

export type ModelAliasValidationError =
  | {
      readonly code: 'MODEL_ALIAS_UNRESOLVED';
      readonly normalizedAlias: string;
    }
  | {
      readonly code: 'MODEL_ALIAS_AMBIGUOUS';
      readonly normalizedAlias: string;
      readonly candidateModelVariantIds: readonly string[];
    };

export interface LiveBenchAliasDecision {
  readonly stagedResultId: string;
  readonly resolutionStatus: 'RESOLVED' | 'UNRESOLVED' | 'AMBIGUOUS';
  readonly resolvedModelVariantId: string | null;
  readonly validationStatus: 'VALIDATED' | 'REVIEW_REQUIRED';
  readonly validationErrors: readonly ModelAliasValidationError[];
}

export interface LiveBenchAliasResolutionSummary {
  readonly ingestionRunId: string;
  readonly recordsSeen: number;
  readonly recordsResolved: number;
  readonly recordsUnresolved: number;
  readonly recordsAmbiguous: number;
}

export interface LiveBenchAliasReviewReport {
  readonly ingestionRunId: string;
  readonly recordsSeen: number;
  readonly aliases: readonly ModelAliasReviewQueueItem[];
}

export function parseIngestionRunId(value: string | undefined): string {
  if (
    value === undefined ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu.test(
      value,
    )
  ) {
    throw new Error('LIVEBENCH_INGESTION_RUN_ID must be a UUIDv7');
  }
  return value;
}

export function planLiveBenchAliasDecisions(
  records: readonly StagedAliasRecord[],
  candidates: readonly ModelAliasCandidate[],
): LiveBenchAliasDecision[] {
  return records.map((record) => {
    const resolution = resolveExactModelAlias(
      LIVEBENCH_ALIAS_NAMESPACE,
      record.rawModelName,
      candidates,
    );

    switch (resolution.status) {
      case 'RESOLVED':
        return {
          stagedResultId: record.id,
          resolutionStatus: resolution.status,
          resolvedModelVariantId: resolution.modelVariantId,
          validationStatus: 'VALIDATED',
          validationErrors: [],
        };
      case 'UNRESOLVED':
        return {
          stagedResultId: record.id,
          resolutionStatus: resolution.status,
          resolvedModelVariantId: null,
          validationStatus: 'REVIEW_REQUIRED',
          validationErrors: [
            {
              code: 'MODEL_ALIAS_UNRESOLVED',
              normalizedAlias: resolution.normalizedAlias,
            },
          ],
        };
      case 'AMBIGUOUS':
        return {
          stagedResultId: record.id,
          resolutionStatus: resolution.status,
          resolvedModelVariantId: null,
          validationStatus: 'REVIEW_REQUIRED',
          validationErrors: [
            {
              code: 'MODEL_ALIAS_AMBIGUOUS',
              normalizedAlias: resolution.normalizedAlias,
              candidateModelVariantIds: resolution.candidateModelVariantIds,
            },
          ],
        };
    }
  });
}

export async function resolveLiveBenchAliases(
  db: Database,
  ingestionRunId: string,
): Promise<LiveBenchAliasResolutionSummary> {
  return db.transaction(async (transaction) => {
    const candidates = await transaction
      .select({
        namespace: modelAliases.namespace,
        alias: modelAliases.alias,
        modelVariantId: modelAliases.modelVariantId,
        priority: modelAliases.priority,
      })
      .from(modelAliases)
      .where(eq(modelAliases.namespace, LIVEBENCH_ALIAS_NAMESPACE));
    const records = await transaction
      .select({
        id: stagedResults.id,
        rawModelName: stagedResults.rawModelName,
      })
      .from(stagedResults)
      .where(eq(stagedResults.ingestionRunId, ingestionRunId));
    const decisions = planLiveBenchAliasDecisions(records, candidates);

    for (const decision of decisions) {
      await transaction
        .update(stagedResults)
        .set({
          resolvedModelVariantId: decision.resolvedModelVariantId,
          validationStatus: decision.validationStatus,
          validationErrors: decision.validationErrors,
        })
        .where(
          and(
            eq(stagedResults.id, decision.stagedResultId),
            eq(stagedResults.ingestionRunId, ingestionRunId),
          ),
        );
    }

    return {
      ingestionRunId,
      recordsSeen: decisions.length,
      recordsResolved: decisions.filter(
        (decision) => decision.resolutionStatus === 'RESOLVED',
      ).length,
      recordsUnresolved: decisions.filter(
        (decision) => decision.resolutionStatus === 'UNRESOLVED',
      ).length,
      recordsAmbiguous: decisions.filter(
        (decision) => decision.resolutionStatus === 'AMBIGUOUS',
      ).length,
    };
  });
}

export async function getLiveBenchAliasReviewReport(
  db: Database,
  ingestionRunId: string,
): Promise<LiveBenchAliasReviewReport> {
  return db.transaction(
    async (transaction) => {
      const [run] = await transaction
        .select({ id: ingestionRuns.id })
        .from(ingestionRuns)
        .innerJoin(sources, eq(ingestionRuns.sourceId, sources.id))
        .where(
          and(
            eq(ingestionRuns.id, ingestionRunId),
            eq(sources.slug, 'livebench-model-judgment'),
          ),
        )
        .limit(1);
      if (!run) {
        throw new Error('LiveBench ingestion run was not found');
      }

      const candidates = await transaction
        .select({
          namespace: modelAliases.namespace,
          alias: modelAliases.alias,
          modelVariantId: modelAliases.modelVariantId,
          priority: modelAliases.priority,
        })
        .from(modelAliases)
        .where(eq(modelAliases.namespace, LIVEBENCH_ALIAS_NAMESPACE));
      const records = await transaction
        .select({ rawModelName: stagedResults.rawModelName })
        .from(stagedResults)
        .where(eq(stagedResults.ingestionRunId, run.id));

      return {
        ingestionRunId: run.id,
        recordsSeen: records.length,
        aliases: buildModelAliasReviewQueue(
          LIVEBENCH_ALIAS_NAMESPACE,
          records,
          candidates,
        ),
      };
    },
    { isolationLevel: 'repeatable read', accessMode: 'read only' },
  );
}
