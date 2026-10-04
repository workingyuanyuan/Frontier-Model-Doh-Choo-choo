import type {
  ProductEvidence,
  ProductVersion,
} from '@llm-bench/benchmark-data';
import { COST_SOURCE_SCORE_BASES } from './view-model';

/** Evidence fields needed to calculate and display the dashboard. */
export type DashboardEvidence = Pick<
  ProductEvidence,
  | 'id'
  | 'sourceId'
  | 'benchmarkId'
  | 'benchmarkVersion'
  | 'rawScore'
  | 'normalizedScore'
  | 'inclusion'
  | 'metric'
> & {
  model: Pick<ProductEvidence['model'], 'profileId' | 'canonicalModelId'>;
  profile: Pick<ProductEvidence['profile'], 'effort'>;
  provenance: Pick<ProductEvidence['provenance'], 'sourceUrl'>;
};

export type DashboardProduct = Omit<ProductVersion, 'evidence'> & {
  evidence: DashboardEvidence[];
  evidenceDetails?: { schemaVersion: 'profile-evidence-v1' };
};

export interface ProfileEvidencePayload {
  schemaVersion: 'profile-evidence-v1';
  versionId: string;
  profileId: string;
  evidence: ProductEvidence[];
}

/** Product hashes use a colon, which cannot name a Windows export directory. */
export const evidenceVersionPath = (versionId: string): string =>
  versionId.replace(':', '-');

type EvidenceTuple = [
  id: number,
  sourceId: number,
  benchmarkId: number,
  benchmarkVersion: number | null,
  rawScore: DashboardEvidence['rawScore'],
  normalizedScore: DashboardEvidence['normalizedScore'],
  included: 0 | 1,
  metric: number,
  profileId: number | null,
  canonicalModelId: number | null,
  effort: number | null,
  sourceUrl: number,
];

/** Dictionary encoded transport, decoded once before dashboard calculations. */
export interface DashboardPayload {
  schemaVersion: 'dashboard-payload-v1';
  product: Omit<DashboardProduct, 'evidence'>;
  strings: string[];
  metrics: DashboardEvidence['metric'][];
  evidence: EvidenceTuple[];
}

const excludedCostBenchmarks = new Set(
  Object.values(COST_SOURCE_SCORE_BASES)
    .filter((basis) => basis?.inclusion === 'EXCLUDED')
    .map((basis) => basis!.benchmarkId),
);

export const toDashboardProduct = (
  product: ProductVersion,
): DashboardProduct => ({
  ...product,
  evidenceDetails: { schemaVersion: 'profile-evidence-v1' },
  evidence: product.evidence
    .filter((row) => {
      if (row.inclusion === 'INCLUDED') return true;
      return excludedCostBenchmarks.has(row.benchmarkId);
    })
    .map((row) => ({
      id: row.id,
      sourceId: row.sourceId,
      benchmarkId: row.benchmarkId,
      benchmarkVersion: row.benchmarkVersion,
      rawScore: row.rawScore,
      normalizedScore: row.normalizedScore,
      inclusion: row.inclusion,
      metric: row.metric,
      model: {
        profileId: row.model.profileId,
        canonicalModelId: row.model.canonicalModelId,
      },
      profile: { effort: row.profile.effort },
      provenance: { sourceUrl: row.provenance.sourceUrl },
    })),
});

export const packDashboardProduct = (
  dashboard: DashboardProduct,
): DashboardPayload => {
  const { evidence, ...product } = dashboard;
  const strings: string[] = [];
  const stringIds = new Map<string, number>();
  const intern = (value: string): number => {
    const existing = stringIds.get(value);
    if (existing !== undefined) return existing;
    const index = strings.push(value) - 1;
    stringIds.set(value, index);
    return index;
  };
  const nullableString = (value: string | null): number | null =>
    value === null ? null : intern(value);
  const metrics: DashboardEvidence['metric'][] = [];
  const metricIds = new Map<string, number>();
  const internMetric = (metric: DashboardEvidence['metric']): number => {
    const key = JSON.stringify(metric);
    const existing = metricIds.get(key);
    if (existing !== undefined) return existing;
    const index = metrics.push(metric) - 1;
    metricIds.set(key, index);
    return index;
  };
  const tuples: EvidenceTuple[] = evidence.map((row) => [
    intern(row.id),
    intern(row.sourceId),
    intern(row.benchmarkId),
    nullableString(row.benchmarkVersion),
    row.rawScore,
    row.normalizedScore,
    row.inclusion === 'INCLUDED' ? 1 : 0,
    internMetric(row.metric),
    nullableString(row.model.profileId),
    nullableString(row.model.canonicalModelId),
    nullableString(row.profile.effort),
    intern(row.provenance.sourceUrl),
  ]);
  return {
    schemaVersion: 'dashboard-payload-v1',
    product,
    strings,
    metrics,
    evidence: tuples,
  };
};

export const unpackDashboardProduct = (
  payload: DashboardPayload,
): DashboardProduct => {
  const stringAt = (index: number): string => payload.strings[index]!;
  const nullableString = (index: number | null): string | null =>
    index === null ? null : stringAt(index);
  return {
    ...payload.product,
    evidence: payload.evidence.map((row) => ({
      id: stringAt(row[0]),
      sourceId: stringAt(row[1]),
      benchmarkId: stringAt(row[2]),
      benchmarkVersion: nullableString(row[3]),
      rawScore: row[4],
      normalizedScore: row[5],
      inclusion: row[6] === 1 ? 'INCLUDED' : 'EXCLUDED',
      metric: payload.metrics[row[7]]!,
      model: {
        profileId: nullableString(row[8]),
        canonicalModelId: nullableString(row[9]),
      },
      profile: { effort: nullableString(row[10]) },
      provenance: { sourceUrl: stringAt(row[11]) },
    })),
  };
};

/** Full profile details, including rejected measurements for the same model. */
export const buildProfileEvidencePayload = (
  product: ProductVersion,
  profileId: string,
): ProfileEvidencePayload | null => {
  const profile = product.profiles.find(({ id }) => id === profileId);
  if (!profile) return null;

  const evidence = product.evidence
    .filter(
      (row) =>
        (row.inclusion === 'INCLUDED' && row.model.profileId === profileId) ||
        (row.inclusion === 'EXCLUDED' &&
          row.model.canonicalModelId === profile.modelId),
    )
    .sort((left, right) => {
      if (left.inclusion !== right.inclusion) {
        return left.inclusion === 'INCLUDED' ? -1 : 1;
      }
      return (
        left.benchmarkId.localeCompare(right.benchmarkId) ||
        left.sourceId.localeCompare(right.sourceId) ||
        left.id.localeCompare(right.id)
      );
    });

  return {
    schemaVersion: 'profile-evidence-v1',
    versionId: product.versionId,
    profileId,
    evidence,
  };
};
