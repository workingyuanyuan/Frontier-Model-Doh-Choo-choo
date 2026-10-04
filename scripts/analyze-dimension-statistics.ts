/** Export canonical current evidence without invoking the coverage optimizer. */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { loadWorkspaceCoverageData } from '../packages/benchmark-data/src/coverage-matrix.js';
import {
  applyProductProfilePolicy,
  buildFrontierSet,
  getComparisonOnlyBenchmarkIds,
  selectCurrentResults,
} from '../packages/benchmark-data/src/index.js';

async function main() {
  const root = resolve(process.argv[2] ?? '.');
  const referenceDate = '2026-10-03';
  const input = await loadWorkspaceCoverageData(root);
  const qualified = buildFrontierSet({
    catalog: input.catalog,
    manualModels: input.frontierConfig.manualModels,
    referenceDate,
    qualificationWindowMonths:
      input.frontierConfig.qualificationWindowMonths ?? 12,
  });
  const qualifiedIds = new Set(qualified.map((m) => m.modelId));
  const comparisonOnly = getComparisonOnlyBenchmarkIds(input.benchmarkMapping);
  const whitelisted = input.sourceCandidates.filter(
    (c) =>
      input.whitelist.includes(c.sourceId) &&
      !comparisonOnly.has(c.benchmarkId),
  );
  const policyCandidates = applyProductProfilePolicy(
    whitelisted,
    input.catalog,
    input.profilePolicy,
  );
  const eligible = policyCandidates.filter(
    (c) =>
      c.inclusion === 'INCLUDED' &&
      c.normalizedScore !== null &&
      c.model.canonicalModelId !== null &&
      c.model.profileId !== null,
  );
  const selected = selectCurrentResults(eligible);
  const mapping = new Map(
    input.benchmarkMapping.benchmarks
      .filter((b) => !b.comparisonOnly)
      .map((b) => [b.id, b]),
  );
  const effective = selected.filter(
    (c) =>
      qualifiedIds.has(c.model.canonicalModelId!) && mapping.has(c.benchmarkId),
  );
  const seen = new Set<string>();
  for (const c of effective) {
    const key = `${c.model.profileId}\u001f${c.benchmarkId}`;
    if (seen.has(key))
      throw new Error(
        `Multiple current metrics require an explicit score rule: ${key}`,
      );
    seen.add(key);
  }
  const displayPolicy = JSON.parse(
    await readFile(
      resolve(root, 'data/mappings/display-set-policy.json'),
      'utf8',
    ),
  );
  const output = {
    referenceDate,
    method:
      'Exact loadWorkspaceCoverageData plus coverage-matrix.ts steps 1–7; canonical product effort and current selection; no optimizer.',
    counts: {
      sourceCandidates: input.sourceCandidates.length,
      whitelistedNonComparison: whitelisted.length,
      eligibleCandidates: eligible.length,
      selectedResults: selected.length,
      effectiveResults: effective.length,
      qualifiedModels: qualified.length,
    },
    whitelist: input.whitelist,
    comparisonOnlyBenchmarkIds: [...comparisonOnly].sort(),
    qualityPolicy: displayPolicy.benchmarkQuality,
    models: input.catalog.models.filter((m) => qualifiedIds.has(m.modelId)),
    benchmarks: input.benchmarkMapping.benchmarks.filter((b) =>
      effective.some((c) => c.benchmarkId === b.id),
    ),
    rows: effective.map((c) => ({
      benchmarkId: c.benchmarkId,
      profileId: c.model.profileId,
      modelId: c.model.canonicalModelId,
      score: c.normalizedScore,
      sourceId: c.sourceId,
      id: c.id,
      metricId: c.metric.id,
      primaryDimension: mapping.get(c.benchmarkId)!.primaryDimension,
      effort: c.productProfile?.effort,
      provenance: c.provenance,
      evidenceIds: c.evidenceIds,
    })),
  };
  const outputDir = resolve(root, 'tmp/dimension-statistics');
  await mkdir(outputDir, { recursive: true });
  await writeFile(
    resolve(outputDir, 'effective-results.json'),
    JSON.stringify(output, null, 2) + '\n',
  );
  console.log(
    JSON.stringify(
      {
        ...output.counts,
        activeBenchmarks: output.benchmarks.length,
        profiles: new Set(output.rows.map((r) => r.profileId)).size,
        output: resolve(outputDir, 'effective-results.json'),
      },
      null,
      2,
    ),
  );
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
