import {
  CostRecordSchema,
  type CandidateResult,
  type CostRecord,
} from '@llm-bench/benchmark-data';

/** Keep cost and score identity, exclusions, and evidence on the same chart row. */
export function materializeVendorTaskCost(
  candidate: CandidateResult,
  cost: number,
  unitLocator: string,
): CostRecord {
  const provenance = candidate.provenance.cost;
  if (!provenance)
    throw new Error(`Missing chart cost provenance: ${candidate.id}`);
  return CostRecordSchema.parse({
    schemaVersion: 'cost-record-v1',
    id: `${candidate.id}:cost`,
    sourceId: candidate.sourceId,
    model: candidate.model,
    profile: candidate.profile,
    costType: 'AGENT_TASK',
    metricId: 'cost-per-task',
    metricName: 'Cost per task',
    unit: 'USD_PER_TASK',
    inputPerMillionTokens: null,
    outputPerMillionTokens: null,
    cost,
    assumptionId: null,
    benchmarkId: candidate.benchmarkId,
    benchmarkVersion: candidate.benchmarkVersion,
    inclusion: candidate.inclusion,
    exclusionReason: candidate.exclusionReason,
    sourceUrl: candidate.sourceUrl,
    observedAt: candidate.observedAt,
    sourcePublishedAt: candidate.sourcePublishedAt,
    evidenceIds: candidate.evidenceIds,
    provenance: {
      ...candidate.provenance,
      unit: { ...provenance, locator: unitLocator },
    },
  });
}
