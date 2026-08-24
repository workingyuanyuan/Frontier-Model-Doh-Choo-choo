import { readFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

import {
  BenchmarkDimensionMappingSchema,
  CandidateResultSchema,
  CostRecordSchema,
  DisplaySetSchema,
  EvidenceRecordSchema,
  FrontierConfigSchema,
  ModelCatalogSchema,
  ProfilePolicySchema,
  SourceManifestSchema,
  SourcesConfigSchema,
  applyProductProfilePolicy,
  applyProductProfilePolicyToCosts,
  buildProduct,
  deriveModelProfiles,
  validateDisplaySet,
  writeCurrentProductVersion,
  type CandidateResult,
  type CostRecord,
  type ProductVersion,
} from './index.js';

const readJson = async (path: string): Promise<unknown> =>
  JSON.parse(await readFile(path, 'utf8'));

export const buildWorkspaceProduct = async (
  repositoryRoot: string,
  generatedAt: string,
): Promise<ProductVersion> => {
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
    await readJson(join(dataRoot, 'mappings', 'benchmarks.json')),
  );
  const displaySet = DisplaySetSchema.parse(
    await readJson(join(dataRoot, 'mappings', 'display-set.json')),
  );
  validateDisplaySet(displaySet, benchmarkMapping);
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
  const candidates = applyProductProfilePolicy(
    sourceCandidates,
    catalog,
    profilePolicy,
  );
  const costRecords = applyProductProfilePolicyToCosts(
    sourceCosts,
    sourceCandidates,
    catalog,
    profilePolicy,
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

  const frontierConfig = FrontierConfigSchema.parse(
    await readJson(join(dataRoot, 'mappings', 'frontier.json')),
  );

  return buildProduct({
    generatedAt,
    sourceSnapshotIds,
    candidates,
    profiles: deriveModelProfiles(candidates, catalog),
    benchmarkDimensions,
    catalog,
    displaySet,
    manualModels: frontierConfig.manualModels,
    qualificationWindowMonths: frontierConfig.qualificationWindowMonths,
    costRecords,
  });
};

export const writeWorkspaceCurrent = async (
  repositoryRoot: string,
  generatedAt: string,
): Promise<ProductVersion> => {
  const root = resolve(repositoryRoot);
  const product = await buildWorkspaceProduct(root, generatedAt);
  const productRoot = join(root, 'data', 'product');
  await writeCurrentProductVersion(productRoot, product);
  return product;
};
