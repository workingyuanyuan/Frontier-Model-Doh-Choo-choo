import type {
  DimensionId,
  ProductEvidence,
  ProductVersion,
} from '@llm-bench/benchmark-data';
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
  const scores = UI_DIMENSION_IDS.map((dimension) => {
    const items = evidence.filter(
      (e) => dimensions[e.benchmarkId] === dimension,
    );
    return {
      dimension,
      score: items.length
        ? items.reduce((sum, e) => sum + e.normalizedScore!, 0) / items.length
        : null,
      componentCount: items.length,
    };
  });
  return {
    modelId: profile.modelId,
    profileId: profile.id,
    rank: null,
    overallScore: scores.every((d) => d.score !== null)
      ? scores.reduce((sum, d) => sum + d.score!, 0) / scores.length
      : null,
    dimensions: scores,
    evidenceResultIds: evidence.map((e) => e.id).toSorted(),
  };
}

export function comparisonOptions(
  product: ProductVersion,
  dimensions: Record<string, DimensionId>,
): LeaderboardRow[] {
  const evidence = comparisonEvidence(product, dimensions);
  const coverage = new Map<string, number>();
  const rows = product.profiles.flatMap((profile) => {
    const items = evidence.filter((e) => e.model.profileId === profile.id);
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
) {
  const evidence = comparisonEvidence(product, dimensions);
  const profiles = [...new Set(modelIds)].flatMap((modelId) => {
    const fallback = options.find((row) => row.modelId === modelId)?.profileId;
    const profile =
      product.profiles.find(
        (p) => p.modelId === modelId && p.id === selectedProfiles[modelId],
      ) ?? product.profiles.find((p) => p.id === fallback);
    return profile ? [profile] : [];
  });
  const byProfile = profiles.map((profile) =>
    evidence.filter((e) => e.model.profileId === profile.id),
  );
  const benchmarkIds = [
    ...new Set(byProfile[0]?.map((e) => e.benchmarkId) ?? []),
  ]
    .filter((id) => {
      // Different metrics of one benchmark must not become an apparent like-for-like comparison.
      const metricKeys = (items: ProductEvidence[]) =>
        items
          .filter((e) => e.benchmarkId === id)
          .map(
            (e) => `${e.metric.id}:${e.metric.unit}:${e.metric.higherIsBetter}`,
          )
          .toSorted()
          .join('|');
      const key = metricKeys(byProfile[0]!);
      return byProfile.every((items) => metricKeys(items) === key);
    })
    .toSorted();
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
      a.modelId.localeCompare(b.modelId),
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
