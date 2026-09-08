import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';

// Run from the repository root; optional positional args: input.json output.json.
const inputPath = process.argv[2] ?? 'data/product/current.json';
const outputPath =
  process.argv[3] ?? 'docs/refresh/2026-09-08-benchmark-saturation.json';
const product = JSON.parse(readFileSync(inputPath, 'utf8'));
if (
  existsSync(outputPath) &&
  JSON.parse(readFileSync(outputPath, 'utf8')).versionId !== product.versionId
) {
  throw new Error(
    'This audit belongs to a different product version. Supply a new output path to preserve the reviewed policy evidence.',
  );
}
const mapping = JSON.parse(
  readFileSync('data/mappings/benchmarks.json', 'utf8'),
);
const dimension = new Map(
  mapping.benchmarks.map((b) => [b.id, b.primaryDimension]),
);
const evidence = new Map(product.evidence.map((e) => [e.id, e]));
const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;
const quantile = (xs, q) => {
  const a = [...xs].sort((x, y) => x - y);
  const i = (a.length - 1) * q;
  return a[Math.floor(i)] + (a[Math.ceil(i)] - a[Math.floor(i)]) * (i % 1);
};
const stats = (xs) =>
  xs.length
    ? {
        n: xs.length,
        min: Math.min(...xs),
        max: Math.max(...xs),
        median: quantile(xs, 0.5),
        p10: quantile(xs, 0.1),
        p90: quantile(xs, 0.9),
        p90p10: quantile(xs, 0.9) - quantile(xs, 0.1),
        sd: Math.sqrt(mean(xs.map((x) => (x - mean(xs)) ** 2))),
        fraction95: xs.filter((x) => x >= 95).length / xs.length,
      }
    : null;
const compare = (a, b) =>
  b.overallScore - a.overallScore || a.profileId.localeCompare(b.profileId);
const cells = (row) =>
  new Map(
    row.evidenceResultIds.map((id) => {
      const e = evidence.get(id);
      assert(
        e && e.inclusion === 'INCLUDED' && Number.isFinite(e.normalizedScore),
      );
      assert.equal(e.model.profileId, row.profileId);
      return [e.benchmarkId, e];
    }),
  );
const complete = (preset) =>
  preset.leaderboard.filter(
    (r) =>
      r.overallScore !== null &&
      preset.benchmarkIds.every((b) => cells(r).has(b)),
  );
const representatives = (rows) =>
  [
    ...new Map(
      [...rows]
        .sort(compare)
        .reverse()
        .map((r) => [r.modelId, r]),
    ).values(),
  ].sort(compare);
const review = (preset) => {
  const eligible = complete(preset);
  const rows = representatives(eligible);
  assert.equal(rows.length, preset.targetModelCount);
  for (const row of eligible) {
    const c = cells(row);
    assert.equal(c.size, row.evidenceResultIds.length);
    const scores = mapping.dimensions.map((d) => {
      const ids = preset.benchmarkIds.filter((b) => dimension.get(b) === d);
      const score = mean(ids.map((b) => c.get(b).normalizedScore));
      const original = row.dimensions.find((x) => x.dimension === d);
      assert.equal(original.componentCount, ids.length);
      assert(Math.abs(original.score - score) < 1e-9);
      return score;
    });
    assert(Math.abs(mean(scores) - row.overallScore) < 1e-9);
  }
  const benchmarks = preset.benchmarkIds.map((id) => {
    const values = rows.map((r) => cells(r).get(id).normalizedScore);
    const s = stats(values);
    return {
      id,
      dimension: dimension.get(id),
      ...s,
      dimensionWeight:
        1 /
        preset.benchmarkIds.filter(
          (b) => dimension.get(b) === dimension.get(id),
        ).length,
      top5: stats(
        rows.slice(0, 5).map((r) => cells(r).get(id).normalizedScore),
      ),
      sources: [...new Set(rows.map((r) => cells(r).get(id).sourceId))],
      flag:
        s.n < 8
          ? 'small-sample'
          : s.median >= 95 && s.p90p10 <= 5
            ? 'ceiling'
            : s.median >= 90 && s.p90p10 <= 10
              ? 'compressed-high'
              : 'other',
    };
  });
  return {
    id: preset.id,
    benchmarkCount: preset.benchmarkIds.length,
    modelCount: rows.length,
    profileCount: eligible.length,
    representatives: rows.map((r) => ({
      modelId: r.modelId,
      profileId: r.profileId,
      overallScore: r.overallScore,
    })),
    benchmarks,
  };
};
const presets = product.presets.map(review);
const defaultPreset = presets.find((p) => p.id === product.defaultPresetId);
// Broader screen: one highest observed score per model for each benchmark.
// This deliberately differs from a fixed representative cohort; use only as corroboration.
const all = new Map();
for (const e of product.evidence) {
  if (e.inclusion !== 'INCLUDED' || !Number.isFinite(e.normalizedScore))
    continue;
  const id = e.benchmarkId;
  if (!all.has(id)) all.set(id, new Map());
  const models = all.get(id);
  const modelId = e.model.canonicalModelId;
  models.set(
    modelId,
    Math.max(models.get(modelId) ?? -Infinity, e.normalizedScore),
  );
}
const broad = [...all].map(([id, models]) => ({
  id,
  dimension: dimension.get(id),
  ...stats([...models.values()]),
}));
const ablations = [];
const base = product.presets.find((p) => p.id === product.defaultPresetId);
for (const removed of [
  ['aime'],
  ['aime', 'gpqa-diamond', 'legal-bench', 'livebench-mathematics'],
]) {
  const recalc = (row) => {
    const c = cells(row);
    const scores = mapping.dimensions.map((d) =>
      mean(
        base.benchmarkIds
          .filter((b) => !removed.includes(b) && dimension.get(b) === d)
          .map((b) => c.get(b).normalizedScore),
      ),
    );
    assert(scores.every(Number.isFinite));
    return { ...row, overallScore: mean(scores) };
  };
  const original = representatives(complete(base));
  const fixed = original.map(recalc).sort(compare);
  ablations.push({
    removed,
    cohort: 'fixed original representative profiles',
    changes: fixed.map((r, i) => {
      const oldIndex = original.findIndex((x) => x.profileId === r.profileId);
      return {
        modelId: r.modelId,
        oldRank: oldIndex + 1,
        newRank: i + 1,
        oldScore: original[oldIndex].overallScore,
        newScore: r.overallScore,
      };
    }),
  });
}
const report = {
  generatedAt: product.generatedAt,
  versionId: product.versionId,
  defaultPresetId: product.defaultPresetId,
  methodology:
    '0–100 normalized included winning evidence; complete profiles only; one highest-overall eligible profile/model/preset. Population SD; linearly interpolated quantiles. Screening heuristics, not statistical significance: n>=8 and median>=95, P90-P10<=5 (ceiling); median>=90, P90-P10<=10 (compressed-high).',
  defaultPreset,
  presets,
  broad,
  ablations,
};
writeFileSync(outputPath, JSON.stringify(report, null, 2) + '\n');
const chartQuery = `SELECT json_extract(value, '$.id') AS benchmark,
  json_extract(value, '$.p90p10') AS spread,
  json_extract(value, '$.median') AS median,
  json_extract(value, '$.n') AS n,
  json_extract(value, '$.dimension') AS dimension
FROM json_each(?, '$.defaultPreset.benchmarks') ORDER BY spread`;
const db = new DatabaseSync(':memory:');
const chartRows = db.prepare(chartQuery).all(JSON.stringify(report));
db.close();
console.log(JSON.stringify({ chartQuery, chartRows }));
