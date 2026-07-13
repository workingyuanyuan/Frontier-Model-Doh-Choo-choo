import { type Database, modelAliases, stagedResults } from '@llm-bench/db';
import { and, eq } from 'drizzle-orm';

import {
  type ModelAliasCandidate,
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
