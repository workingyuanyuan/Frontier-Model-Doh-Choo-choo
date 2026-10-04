import type {
  DashboardProduct as ProductVersion,
  DashboardEvidence as ProductEvidence,
} from './dashboard-data';
import type { DimensionId } from '@llm-bench/benchmark-data';
import { UI_DIMENSION_IDS } from './ui-contract';
import type { LeaderboardRow, PresetProductVersion } from './view-model';

export function comparisonEvidence(
  product: ProductVersion,
  dimensions: Record<string, DimensionId>,
) {
  // Legacy snapshots can safely compare only measurements already selected by a preset.
  const ids = new Set(
    product.comparisonEvidenceIds ??
      product.presets.flatMap((preset) =>
        preset.leaderboard.flatMap((row) => row.evidenceResultIds),
      ),
  );
  return product.evidence.filter(
    (e) =>
      ids.has(e.id) &&
      e.inclusion === 'INCLUDED' &&
      e.normalizedScore !== null &&
      Number.isFinite(e.normalizedScore) &&
      e.model.profileId !== null &&
      dimensions[e.benchmarkId],
  );
}

function scoreRow(
  profile: ProductVersion['profiles'][number],
  evidence: ProductEvidence[],
  dimensions: Record<string, DimensionId>,
): LeaderboardRow {
  const byBenchmark = new Map<string, { sum: number; count: number }>();
  for (const item of evidence) {
    const aggregate = byBenchmark.get(item.benchmarkId) ?? { sum: 0, count: 0 };
    aggregate.sum += item.normalizedScore!;
    aggregate.count += 1;
    byBenchmark.set(item.benchmarkId, aggregate);
  }
  const byDimension = new Map<DimensionId, number[]>();
  for (const [id, aggregate] of byBenchmark) {
    const dimension = dimensions[id]!;
    const means = byDimension.get(dimension) ?? [];
    means.push(aggregate.sum / aggregate.count);
    byDimension.set(dimension, means);
  }
  const scores = UI_DIMENSION_IDS.flatMap((dimension) => {
    const means = byDimension.get(dimension);
    if (!means?.length) return [];
    // Each benchmark design contributes once, regardless of metric count.
    return [
      {
        dimension,
        score: means.reduce((sum, score) => sum + score, 0) / means.length,
        componentCount: means.length,
      },
    ];
  });
  const weight = (count: number) => (count === 1 ? 0.5 : 1);
  const totalWeight = scores.reduce(
    (sum, d) => sum + weight(d.componentCount),
    0,
  );
  return {
    modelId: profile.modelId,
    profileId: profile.id,
    rank: null,
    overallScore: totalWeight
      ? scores.reduce((sum, d) => sum + d.score * weight(d.componentCount), 0) /
        totalWeight
      : null,
    dimensions: scores,
    evidenceResultIds: evidence.map((e) => e.id).toSorted(),
  };
}

function evidenceByProfile(evidence: ProductEvidence[]) {
  const grouped = new Map<string, ProductEvidence[]>();
  for (const item of evidence) {
    const profileId = item.model.profileId!;
    const items = grouped.get(profileId) ?? [];
    items.push(item);
    grouped.set(profileId, items);
  }
  return grouped;
}

export function comparisonOptions(
  product: ProductVersion,
  dimensions: Record<string, DimensionId>,
): LeaderboardRow[] {
  const evidence = comparisonEvidence(product, dimensions);
  const grouped = evidenceByProfile(evidence);
  const coverage = new Map<string, number>();
  const rows = product.profiles.flatMap((profile) => {
    const items = grouped.get(profile.id) ?? [];
    coverage.set(profile.id, new Set(items.map((e) => e.benchmarkId)).size);
    return items.length ? [scoreRow(profile, items, dimensions)] : [];
  });
  // Choose one stable, most-covered profile per model; selection does not change when peers change.
  rows.sort(
    (a, b) =>
      coverage.get(b.profileId)! - coverage.get(a.profileId)! ||
      a.profileId.localeCompare(b.profileId),
  );
  const representatives = new Map<string, LeaderboardRow>();
  rows.forEach((row) => {
    if (!representatives.has(row.modelId))
      representatives.set(row.modelId, row);
  });
  return [...representatives.values()].sort((a, b) =>
    a.modelId.localeCompare(b.modelId),
  );
}

export function buildCommonComparison(
  product: PresetProductVersion,
  modelIds: string[],
  selectedProfiles: Record<string, string>,
  dimensions: Record<string, DimensionId>,
  options = comparisonOptions(product, dimensions),
  pinnedProfileIds: readonly string[] = [],
) {
  const evidence = comparisonEvidence(product, dimensions);
  const grouped = evidenceByProfile(evidence);
  const profileById = new Map(product.profiles.map((p) => [p.id, p]));
  const optionByModel = new Map(options.map((row) => [row.modelId, row]));
  const selectedModelIds = new Set(modelIds);
  const profiles = [...new Set(modelIds)].flatMap((modelId) => {
    const fallback = optionByModel.get(modelId)?.profileId;
    const requested = profileById.get(selectedProfiles[modelId] ?? '');
    const profile =
      (requested?.modelId === modelId ? requested : undefined) ??
      profileById.get(fallback ?? '');
    return profile ? [profile] : [];
  });
  for (const id of pinnedProfileIds) {
    const profile = profileById.get(id);
    if (
      profile &&
      selectedModelIds.has(profile.modelId) &&
      !profiles.some((p) => p.id === id)
    )
      profiles.push(profile);
  }
  const byProfile = profiles.map((profile) => grouped.get(profile.id) ?? []);
  const metricKeysByProfile = byProfile.map((items) => {
    const metrics = new Map<string, string[]>();
    for (const item of items) {
      const keys = metrics.get(item.benchmarkId) ?? [];
      keys.push(
        `${item.metric.id}:${item.metric.unit}:${item.metric.higherIsBetter}`,
      );
      metrics.set(item.benchmarkId, keys);
    }
    return new Map(
      [...metrics].map(([id, keys]) => [id, keys.toSorted().join('|')]),
    );
  });
  const sharedBenchmarkIds = [...(metricKeysByProfile[0]?.keys() ?? [])]
    .filter((id) => {
      // Different metrics of one benchmark must not become an apparent like-for-like comparison.
      const key = metricKeysByProfile[0]!.get(id);
      return metricKeysByProfile.every((keys) => keys.get(id) === key);
    })
    .toSorted();
  // The quality share is evaluated on this intersection, not on the picker universe.
  const quality = product.benchmarkQuality;
  const eligible = sharedBenchmarkIds.filter(
    (id) => !quality?.excludedBenchmarkIds.includes(id),
  );
  const benchmarkIds = UI_DIMENSION_IDS.flatMap((dimension) => {
    const members = eligible.filter((id) => dimensions[id] === dimension);
    if (!quality) return members;
    const regular = members.filter(
      (id) => !quality.limitedBenchmarkIds.includes(id),
    );
    const limited = members.filter((id) =>
      quality.limitedBenchmarkIds.includes(id),
    );
    const cap = Math.floor(
      regular.length / quality.minOtherBenchmarksPerLimited,
    );
    return [...regular, ...limited.slice(0, cap)];
  }).toSorted();
  const common = new Set(benchmarkIds);
  const leaderboard = profiles.map((profile, i) =>
    scoreRow(
      profile,
      byProfile[i]!.filter((e) => common.has(e.benchmarkId)),
      dimensions,
    ),
  );
  leaderboard.sort(
    (a, b) =>
      (b.overallScore ?? -Infinity) - (a.overallScore ?? -Infinity) ||
      a.profileId.localeCompare(b.profileId),
  );
  let rank = 0;
  leaderboard.forEach((row) => {
    row.rank = row.overallScore === null ? null : ++rank;
  });
  const activePreset = {
    id: 'common-benchmarks',
    targetModelCount: profiles.length,
    requireAllSources: false,
    benchmarkIds,
    leaderboard,
  };
  const result: PresetProductVersion = {
    ...product,
    activePreset,
    leaderboard,
  };
  return {
    product: result,
    profiles,
    benchmarkIds,
    evidence: byProfile.flat().filter((e) => common.has(e.benchmarkId)),
  };
}
