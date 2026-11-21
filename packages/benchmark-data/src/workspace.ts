import { readJson } from './node-utils.js';
import { readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

import {
  BenchmarkDimensionMappingSchema,
  BenchmarkQualityPolicySchema,
  CandidateResultSchema,
  CostRecordSchema,
  EvidenceRecordSchema,
  ModelCatalogSchema,
  ProfilePolicySchema,
  SourceManifestSchema,
  SourcesConfigSchema,
  applyProductProfilePolicy,
  applyProductProfilePolicyToCosts,
  buildProduct,
  deriveModelProfiles,
  getComparisonOnlyBenchmarkIds,
  validateDisplaySet,
  writeCurrentProductVersion,
  type CandidateResult,
  type CostRecord,
  type ProductVersion,
} from './index.js';
import {
  FrontierIdentitiesSchema,
  resolveFrontierIdentities,
} from './frontier-identities.js';
import {
  computeFrontierSet,
  writeFrontierSet,
} from './generate-frontier-set.js';

type FrontierSetResult = Awaited<ReturnType<typeof computeFrontierSet>>;

/**
 * Computes the frontier set and the product from the saved sources and
 * mappings. Nothing is written; a frontier that needs review yields no product.
 */
const computeWorkspace = async (
  repositoryRoot: string,
  generatedAt: string,
): Promise<{ frontier: FrontierSetResult; product: ProductVersion | null }> => {
  const dataRoot = join(resolve(repositoryRoot), 'data');
  const sourcesConfig = SourcesConfigSchema.parse(
    await readJson(join(dataRoot, 'mappings', 'sources.json')),
  );
  const whitelist = new Set(sourcesConfig.whitelist);
  const sourceRoot = join(dataRoot, 'sources');
  const sourceDirectories = (await readdir(sourceRoot, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory() && whitelist.has(entry.name))
    .map(({ name }) => name)
    .sort();
  const sourceCandidates: CandidateResult[] = [];
  const sourceSnapshotIds: string[] = [];
  const sourceCosts: CostRecord[] = [];

  for (const source of sourceDirectories) {
    const directory = join(sourceRoot, source);
    const manifest = SourceManifestSchema.parse(
      await readJson(join(directory, 'manifest.json')),
    );
    const parsedCandidates = CandidateResultSchema.array().parse(
      await readJson(join(directory, 'candidates.json')),
    );
    sourceCandidates.push(...parsedCandidates);
    const costsPath = join(directory, 'costs.json');
    if (existsSync(costsPath)) {
      const parsedCosts = CostRecordSchema.array().parse(
        await readJson(costsPath),
      );
      const evidence = EvidenceRecordSchema.array().parse(
        await readJson(join(directory, 'evidence-index.json')),
      );
      const evidenceIds = new Set(evidence.map(({ id }) => id));
      const missingCostEvidence = [
        ...new Set(
          parsedCosts.flatMap(({ evidenceIds: ids }) =>
            ids.filter((id) => !evidenceIds.has(id)),
          ),
        ),
      ];
      if (missingCostEvidence.length > 0) {
        throw new Error(
          `${source} costs reference missing Evidence: ${missingCostEvidence.join(', ')}`,
        );
      }
      sourceCosts.push(...parsedCosts);
    }
    sourceSnapshotIds.push(`${manifest.sourceId}:${manifest.lastVerifiedAt}`);
  }

  const benchmarkMapping = BenchmarkDimensionMappingSchema.parse(
    await readJson(join(dataRoot, 'mappings', 'benchmarks-v2.json')),
  );
  const quality = BenchmarkQualityPolicySchema.parse(
    await readJson(join(dataRoot, 'mappings', 'benchmark-quality-v2.json')),
  );
  const benchmarkDimensions = new Map(
    benchmarkMapping.benchmarks.map(({ id, primaryDimension }) => [
      id,
      primaryDimension,
    ]),
  );
  const catalog = ModelCatalogSchema.parse(
    await readJson(join(dataRoot, 'mappings', 'models.json')),
  );
  const profilePolicy = ProfilePolicySchema.parse(
    await readJson(join(dataRoot, 'mappings', 'profile-policy.json')),
  );
  const comparisonOnlyBenchmarkIds =
    getComparisonOnlyBenchmarkIds(benchmarkMapping);
  const identities = FrontierIdentitiesSchema.parse(
    await readJson(join(dataRoot, 'mappings', 'frontier-identities.json')),
  );
  const resolvedCandidates = resolveFrontierIdentities(
    sourceCandidates,
    identities,
  );
  const candidates = applyProductProfilePolicy(
    resolvedCandidates,
    catalog,
    profilePolicy,
    comparisonOnlyBenchmarkIds,
  );
  const costRecords = applyProductProfilePolicyToCosts(
    sourceCosts,
    resolvedCandidates,
    catalog,
    profilePolicy,
    comparisonOnlyBenchmarkIds,
  );
  const missingMappings = [
    ...new Set(
      candidates
        .filter(
          ({ inclusion, normalizedScore }) =>
            inclusion === 'INCLUDED' && normalizedScore !== null,
        )
        .map(({ benchmarkId }) => benchmarkId)
        .filter((benchmarkId) => !benchmarkDimensions.has(benchmarkId)),
    ),
  ];
  if (missingMappings.length > 0) {
    throw new Error(
      `included benchmarks are missing dimension mappings: ${missingMappings.join(', ')}`,
    );
  }

  // Recompute from saved captures on every build. A needs-review audit fails
  // the build instead of publishing an older successful frontier artifact.
  const frontier = await computeFrontierSet(repositoryRoot, {
    candidates,
    catalog,
    mapping: benchmarkMapping,
    quality,
  });
  if (frontier.status !== 'selected') return { frontier, product: null };
  const { artifact } = frontier;
  const displaySet = {
    schemaVersion: 'display-set-v2' as const,
    defaultPresetId: artifact.defaultPresetId,
    presets: [...artifact.cohorts, ...artifact.coverageCohorts].map(
      (cohort) => ({
        id: cohort.id,
        targetModelCount: cohort.targetModelCount,
        family: cohort.family,
        benchmarkIds: cohort.benchmarkIds,
      }),
    ),
  };
  validateDisplaySet(displaySet, benchmarkMapping, quality);

  const product = buildProduct({
    generatedAt,
    sourceSnapshotIds,
    candidates,
    profiles: deriveModelProfiles(candidates, catalog),
    benchmarkDimensions,
    comparisonOnlyBenchmarkIds,
    catalog,
    displaySet,
    frontier: artifact.eligibility.leaders.map((row) => ({
      modelId: row.modelId,
      reasons: [
        `Artificial Analysis Intelligence Index rank ${row.rank}`,
        `Scored by ${row.organizations.length} independent organizations: ${row.organizations.join(', ')}`,
        ...(row.profileId === row.aaWinningProfileId
          ? []
          : [
              `Representative profile ${row.profileId} (AA ${row.representativeScore}) holds ${row.benchmarkCount} scoring-eligible benchmarks; AA-winning ${row.aaWinningProfileId} ${aaWinnerStanding(row)}`,
            ]),
      ],
      externalCompositeScores: { 'artificial-analysis': row.score },
    })),
    presetProfileIds: new Map(
      [...artifact.cohorts, ...artifact.coverageCohorts].map(
        ({ id, profileIds }) => [id, profileIds],
      ),
    ),
    benchmarkQuality: quality,
    costRecords,
  });
  return { frontier, product };
};

export const buildWorkspaceProduct = async (
  repositoryRoot: string,
  generatedAt: string,
): Promise<ProductVersion> => {
  const { frontier, product } = await computeWorkspace(
    repositoryRoot,
    generatedAt,
  );
  if (frontier.status !== 'selected' || product === null) throw frontier.error;
  return product;
};

/**
 * Builds first and writes afterwards: a failed product build leaves the
 * frontier files and current.json untouched. A frontier that needs review
 * records its audit, keeps the last selected set and product, and fails.
 */
export const writeWorkspaceCurrent = async (
  repositoryRoot: string,
  generatedAt: string,
): Promise<ProductVersion> => {
  const root = resolve(repositoryRoot);
  const { frontier, product } = await computeWorkspace(root, generatedAt);
  await writeFrontierSet(root, frontier);
  if (frontier.status !== 'selected' || product === null) throw frontier.error;
  await writeCurrentProductVersion(join(root, 'data', 'product'), product);
  return product;
};

/** How the AA-winning effort compares under the representative-profile rule. */
const aaWinnerStanding = (row: {
  aaWinningProfileId: string | null;
  candidateProfiles: readonly { profileId: string; benchmarkCount: number }[];
}): string => {
  const winner = row.candidateProfiles.find(
    ({ profileId }) => profileId === row.aaWinningProfileId,
  );
  return winner
    ? `holds ${winner.benchmarkCount}`
    : 'lacks results from enough independent organizations';
};
