import { createHash, randomUUID } from 'node:crypto';
import { access, mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import * as z from 'zod';

export const DIMENSION_IDS = [
  'reasoning',
  'math',
  'knowledge',
  'language',
  'instruction',
  'coding',
  'agentic',
  'context',
] as const;

export const DimensionIdSchema = z.enum(DIMENSION_IDS);
export type DimensionId = z.infer<typeof DimensionIdSchema>;

export const BenchmarkDimensionMappingSchema = z.object({
  schemaVersion: z.literal('benchmark-dimensions-v1'),
  dimensions: z
    .array(DimensionIdSchema)
    .length(DIMENSION_IDS.length)
    .superRefine((dimensions, context) => {
      DIMENSION_IDS.forEach((dimension, index) => {
        if (dimensions[index] !== dimension) {
          context.addIssue({
            code: 'custom',
            message: `Expected ${dimension} at dimension index ${index}`,
            path: [index],
          });
        }
      });
    }),
  benchmarks: z.array(
    z.object({
      id: z
        .string()
        .min(1)
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u),
      primaryDimension: DimensionIdSchema,
      secondaryDimensions: z.array(DimensionIdSchema),
    }),
  ),
});

export const SlugSchema = z
  .string()
  .min(1)
  .max(160)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u);

export const HttpUrlSchema = z
  .url()
  .refine(
    (value) => ['http:', 'https:'].includes(new URL(value).protocol),
    'Expected an HTTP(S) URL',
  );

export const Sha256Schema = z
  .string()
  .regex(/^sha256:[a-f0-9]{64}$/u, 'Expected a prefixed SHA-256 digest');

export const SourceRoleSchema = z.enum([
  'ORGANIZER',
  'INDEPENDENT',
  'VENDOR',
  'AGGREGATOR',
]);

export const AcquisitionMethodSchema = z.enum([
  'OFFICIAL_API',
  'EXPORT',
  'EMBEDDED_JSON',
  'API_RESPONSE',
  'NEXT_RSC',
  'DOM',
  'PDF',
  'VISUAL',
  'MANUAL',
]);

export const SourceManifestSchema = z.object({
  schemaVersion: z.literal('source-manifest-v1'),
  sourceId: SlugSchema,
  displayName: z.string().min(1).max(200),
  role: SourceRoleSchema,
  baseUrl: HttpUrlSchema,
  targetUrls: z.array(HttpUrlSchema).min(1),
  benchmarkIds: z.array(SlugSchema),
  accessMethods: z.array(AcquisitionMethodSchema).min(1),
  completeness: z.object({
    expectedCountMethod: z.string().min(1),
    pagination: z.string().nullable(),
    visibleComparisonRequired: z.boolean(),
  }),
  fieldMapping: z.record(z.string(), z.string()),
  fallbackMethods: z.array(AcquisitionMethodSchema),
  lastVerifiedAt: z.iso.datetime(),
  notes: z.array(z.string()),
});
export type SourceManifest = z.infer<typeof SourceManifestSchema>;

export const EvidenceRecordSchema = z.object({
  schemaVersion: z.literal('evidence-record-v1'),
  id: Sha256Schema,
  sourceId: SlugSchema,
  retrievedAt: z.iso.datetime(),
  requestUrl: HttpUrlSchema,
  finalUrl: HttpUrlSchema,
  mediaType: z.string().min(1).max(160),
  byteLength: z.int().nonnegative(),
  sha256: Sha256Schema,
  artifactPath: z.string().min(1),
  method: AcquisitionMethodSchema,
  metadata: z.record(z.string(), z.unknown()),
});
export type EvidenceRecord = z.infer<typeof EvidenceRecordSchema>;

export const FieldProvenanceSchema = z.object({
  evidenceId: Sha256Schema,
  method: AcquisitionMethodSchema,
  locator: z.string().min(1),
});

export const ModelProfileAttributesSchema = z.object({
  effort: z.string().nullable(),
  thinking: z.string().nullable(),
  tools: z.boolean().nullable(),
  harness: z.string().nullable(),
  contextWindowTokens: z.int().positive().nullable(),
  quantization: z.string().nullable(),
  attempts: z.int().positive().nullable(),
});

export const CandidateResultSchema = z
  .object({
    schemaVersion: z.literal('candidate-result-v1'),
    id: z.string().min(1).max(300),
    sourceId: SlugSchema,
    sourceRole: SourceRoleSchema,
    benchmarkId: SlugSchema,
    benchmarkVersion: z.string().min(1).nullable(),
    model: z.object({
      rawName: z.string().min(1),
      canonicalModelId: SlugSchema.nullable(),
      profileId: SlugSchema.nullable(),
    }),
    profile: ModelProfileAttributesSchema,
    metric: z.object({
      id: SlugSchema,
      name: z.string().min(1),
      unit: z.string().min(1),
      higherIsBetter: z.boolean(),
    }),
    rawScore: z.number().finite(),
    normalizedScore: z.number().min(0).max(100).nullable(),
    acquisitionStatus: z.enum(['FULL', 'PARTIAL_SOURCE']),
    inclusion: z.enum(['INCLUDED', 'EXCLUDED']),
    exclusionReason: z.string().min(1).nullable(),
    sourceUrl: HttpUrlSchema,
    observedAt: z.iso.datetime(),
    sourcePublishedAt: z.iso.datetime().nullable(),
    evidenceIds: z.array(Sha256Schema).min(1),
    provenance: z.record(z.string(), FieldProvenanceSchema),
  })
  .superRefine((value, context) => {
    if (value.inclusion === 'EXCLUDED' && value.exclusionReason === null) {
      context.addIssue({
        code: 'custom',
        message: 'exclusionReason is required for excluded results',
        path: ['exclusionReason'],
      });
    }
    if (value.inclusion === 'INCLUDED' && value.exclusionReason !== null) {
      context.addIssue({
        code: 'custom',
        message: 'included results cannot have an exclusionReason',
        path: ['exclusionReason'],
      });
    }
  });
export type CandidateResult = z.infer<typeof CandidateResultSchema>;

export const PricingSchema = z.object({
  type: z.enum([
    'API_STANDARDIZED',
    'MEASURED_TASK',
    'AGENT_TASK',
    'SUBSCRIPTION',
    'HOSTED_OPEN_WEIGHTS',
  ]),
  currency: z.literal('USD'),
  inputPerMillionTokens: z.number().nonnegative().nullable(),
  outputPerMillionTokens: z.number().nonnegative().nullable(),
  costPerTask: z.number().nonnegative().nullable(),
  assumptionId: SlugSchema.nullable(),
  sourceUrl: HttpUrlSchema,
});

export const ModelProfileSchema = z.object({
  id: SlugSchema,
  modelId: SlugSchema,
  providerId: SlugSchema,
  displayName: z.string().min(1),
  baseModelName: z.string().min(1),
  releaseDate: z.iso.date().nullable(),
  attributes: ModelProfileAttributesSchema,
  pricing: z.array(PricingSchema),
});
export type ModelProfile = z.infer<typeof ModelProfileSchema>;

export const ModelCatalogSchema = z.object({
  schemaVersion: z.literal('model-catalog-v1'),
  models: z.array(
    z.object({
      modelId: SlugSchema,
      providerId: SlugSchema,
      displayName: z.string().min(1),
      releaseDate: z.iso.date().nullable(),
      pricing: z.array(PricingSchema),
      profilePricing: z.record(SlugSchema, z.array(PricingSchema)),
    }),
  ),
});
export type ModelCatalog = z.infer<typeof ModelCatalogSchema>;

export const OrderedDimensionScoresSchema = z
  .array(
    z.object({
      dimension: DimensionIdSchema,
      score: z.number().min(0).max(100).nullable(),
      componentCount: z.int().nonnegative(),
    }),
  )
  .length(DIMENSION_IDS.length)
  .superRefine((scores, context) => {
    DIMENSION_IDS.forEach((dimension, index) => {
      if (scores[index]?.dimension !== dimension) {
        context.addIssue({
          code: 'custom',
          message: `Expected ${dimension} at dimension index ${index}`,
          path: [index, 'dimension'],
        });
      }
    });
  });

export const ProductVersionSchema = z.object({
  schemaVersion: z.literal('product-version-v1'),
  versionId: Sha256Schema,
  generatedAt: z.iso.datetime(),
  sourceSnapshotIds: z.array(z.string().min(1)),
  frontier: z.array(
    z.object({
      modelId: SlugSchema,
      profileId: SlugSchema,
      reasons: z.array(z.string().min(1)).min(1),
      externalCompositeScores: z.record(z.string(), z.number()),
    }),
  ),
  profiles: z.array(ModelProfileSchema),
  leaderboard: z.array(
    z.object({
      modelId: SlugSchema,
      profileId: SlugSchema,
      rank: z.int().positive().nullable(),
      overallScore: z.number().min(0).max(100).nullable(),
      status: z.enum(['ESTIMATED', 'SUPPORTED']),
      dimensions: OrderedDimensionScoresSchema,
      evidenceResultIds: z.array(z.string().min(1)),
    }),
  ),
  costs: z.array(
    z.object({
      modelId: SlugSchema,
      profileId: SlugSchema,
      costType: PricingSchema.shape.type,
      cost: z.number().nonnegative(),
      performance: z.number().min(0).max(100),
      assumptionId: SlugSchema.nullable(),
    }),
  ),
  evidence: z.array(CandidateResultSchema),
});
export type ProductVersion = z.infer<typeof ProductVersionSchema>;

export const ProductVersionPointerSchema = z.object({
  schemaVersion: z.literal('product-pointer-v1'),
  channel: z.enum(['DRAFT', 'PUBLISHED']),
  versionId: Sha256Schema,
  previousVersionId: Sha256Schema.nullable(),
  updatedAt: z.iso.datetime(),
});
export type ProductVersionPointer = z.infer<typeof ProductVersionPointerSchema>;

const sortJson = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(sortJson);
  }
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, nested]) => [key, sortJson(nested)]),
    );
  }
  return value;
};

export const deterministicJson = (value: unknown): string =>
  `${JSON.stringify(sortJson(value))}\n`;

export const sha256 = (value: Uint8Array | string): string =>
  `sha256:${createHash('sha256').update(value).digest('hex')}`;

const SOURCE_ROLE_WEIGHT: Record<z.infer<typeof SourceRoleSchema>, number> = {
  ORGANIZER: 4,
  INDEPENDENT: 3,
  VENDOR: 2,
  AGGREGATOR: 1,
};

const resultIdentityKey = (result: CandidateResult): string =>
  [
    result.benchmarkId,
    result.benchmarkVersion ?? '',
    result.model.profileId ?? '',
    result.metric.id,
    result.profile.effort ?? '',
    result.profile.thinking ?? '',
    String(result.profile.tools),
    result.profile.harness ?? '',
    String(result.profile.contextWindowTokens),
    result.profile.quantization ?? '',
    String(result.profile.attempts),
  ].join('\u001f');

export const selectCurrentResults = (
  results: CandidateResult[],
): CandidateResult[] => {
  const selected = new Map<string, CandidateResult>();
  for (const result of results) {
    if (
      result.inclusion !== 'INCLUDED' ||
      result.model.canonicalModelId === null ||
      result.model.profileId === null
    ) {
      continue;
    }

    const key = resultIdentityKey(result);
    const current = selected.get(key);
    if (!current) {
      selected.set(key, result);
      continue;
    }

    const roleDifference =
      SOURCE_ROLE_WEIGHT[result.sourceRole] -
      SOURCE_ROLE_WEIGHT[current.sourceRole];
    const completenessDifference =
      Number(result.acquisitionStatus === 'FULL') -
      Number(current.acquisitionStatus === 'FULL');
    const publishedDifference = (
      result.sourcePublishedAt ?? result.observedAt
    ).localeCompare(current.sourcePublishedAt ?? current.observedAt);

    if (
      roleDifference > 0 ||
      (roleDifference === 0 && completenessDifference > 0) ||
      (roleDifference === 0 &&
        completenessDifference === 0 &&
        publishedDifference > 0)
    ) {
      selected.set(key, result);
    }
  }

  return [...selected.values()].sort((left, right) =>
    resultIdentityKey(left).localeCompare(resultIdentityKey(right)),
  );
};

export interface CompositeRankingRow {
  sourceId: string;
  rank: number;
  modelId: string;
  profileId: string;
  score: number;
}

export interface ManualFrontierModel {
  modelId: string;
  profileId: string;
  reason: string;
}

export interface FrontierModel {
  modelId: string;
  profileId: string;
  reasons: string[];
  externalCompositeScores: Record<string, number>;
}

const groupBy = <Item, Key>(
  items: Iterable<Item>,
  getKey: (item: Item) => Key,
): Map<Key, Item[]> => {
  const groups = new Map<Key, Item[]>();
  for (const item of items) {
    const key = getKey(item);
    const group = groups.get(key) ?? [];
    group.push(item);
    groups.set(key, group);
  }
  return groups;
};

export const buildFrontierSet = (
  rows: CompositeRankingRow[],
  manualModels: ManualFrontierModel[],
  perSourceLimit = 20,
): FrontierModel[] => {
  const bySource = groupBy(rows, ({ sourceId }) => sourceId);
  const frontier = new Map<string, FrontierModel>();

  [...bySource.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .forEach(([sourceId, sourceRows]) => {
      const seenModels = new Set<string>();
      sourceRows
        .toSorted(
          (left, right) =>
            left.rank - right.rank ||
            right.score - left.score ||
            left.modelId.localeCompare(right.modelId),
        )
        .filter(({ modelId }) => {
          if (seenModels.has(modelId)) return false;
          seenModels.add(modelId);
          return true;
        })
        .slice(0, perSourceLimit)
        .forEach((row) => {
          const current = frontier.get(row.modelId);
          if (current) {
            current.reasons.push(`${sourceId} composite Top ${perSourceLimit}`);
            current.externalCompositeScores[sourceId] = row.score;
            return;
          }
          frontier.set(row.modelId, {
            modelId: row.modelId,
            profileId: row.profileId,
            reasons: [`${sourceId} composite Top ${perSourceLimit}`],
            externalCompositeScores: { [sourceId]: row.score },
          });
        });
    });

  manualModels.forEach((manual) => {
    const current = frontier.get(manual.modelId);
    if (current) {
      current.reasons.push(manual.reason);
      return;
    }
    frontier.set(manual.modelId, {
      modelId: manual.modelId,
      profileId: manual.profileId,
      reasons: [manual.reason],
      externalCompositeScores: {},
    });
  });

  return [...frontier.values()];
};

type LeaderboardEntry = z.infer<
  typeof ProductVersionSchema
>['leaderboard'][number];

export const scoreProfiles = (
  results: CandidateResult[],
  benchmarkDimensions: ReadonlyMap<string, DimensionId>,
): LeaderboardEntry[] => {
  const selected = selectCurrentResults(results);
  const byProfile = groupBy(selected, ({ model }) => model.profileId as string);

  const entries = [...byProfile.entries()].map(
    ([profileId, profileResults]): LeaderboardEntry => {
      const modelId = profileResults[0]?.model.canonicalModelId;
      if (!modelId) {
        throw new Error(`profile ${profileId} has no canonical model`);
      }

      const dimensionComponents = new Map<DimensionId, number[]>();
      profileResults.forEach((result) => {
        const dimension = benchmarkDimensions.get(result.benchmarkId);
        if (dimension && result.normalizedScore !== null) {
          const components = dimensionComponents.get(dimension) ?? [];
          components.push(result.normalizedScore);
          dimensionComponents.set(dimension, components);
        }
      });

      const dimensions = DIMENSION_IDS.map((dimension) => {
        const components = dimensionComponents.get(dimension) ?? [];
        return {
          dimension,
          score:
            components.length === 0
              ? null
              : components.reduce((sum, score) => sum + score, 0) /
                components.length,
          componentCount: components.length,
        };
      });
      const available = dimensions.flatMap(({ score }) =>
        score === null ? [] : [score],
      );

      return {
        modelId,
        profileId,
        rank: null,
        overallScore:
          available.length === 0
            ? null
            : available.reduce((sum, score) => sum + score, 0) /
              available.length,
        status: 'ESTIMATED',
        dimensions,
        evidenceResultIds: profileResults.map(({ id }) => id).toSorted(),
      };
    },
  );

  const ranked = entries.toSorted((left, right) => {
    if (left.overallScore === null) return 1;
    if (right.overallScore === null) return -1;
    return (
      right.overallScore - left.overallScore ||
      left.modelId.localeCompare(right.modelId)
    );
  });
  let rank = 0;
  return ranked.map((entry) => ({
    ...entry,
    rank: entry.overallScore === null ? null : ++rank,
  }));
};

export interface CompositeSource {
  sourceId: string;
  benchmarkId: string;
}

export const FrontierConfigSchema = z.object({
  schemaVersion: z.literal('frontier-config-v1'),
  perSourceLimit: z.int().positive().max(20),
  compositeSources: z.array(
    z.object({
      sourceId: SlugSchema,
      benchmarkId: SlugSchema,
    }),
  ),
  manualModels: z.array(
    z.object({
      modelId: SlugSchema,
      profileId: SlugSchema,
      reason: z.string().min(1),
    }),
  ),
});
export type FrontierConfig = z.infer<typeof FrontierConfigSchema>;

const knownConsensus = <Value>(values: Array<Value | null>): Value | null => {
  const known = [...new Set(values.filter((value) => value !== null))];
  return known.length === 1 ? (known[0] as Value) : null;
};

const exactConsensus = <Value>(values: Array<Value | null>): Value | null => {
  const unique = [...new Set(values)];
  return unique.length === 1 ? (unique[0] as Value | null) : null;
};

const readableModelName = (rawName: string): string => {
  const withoutProfile = rawName.replace(/\s*\([^)]*\)\s*$/u, '').trim();
  if (!withoutProfile.includes('-')) return withoutProfile;
  return withoutProfile
    .split('-')
    .map((word) =>
      /^(ai|gpt|glm|k2|swe)$/iu.test(word)
        ? word.toUpperCase()
        : `${word.charAt(0).toUpperCase()}${word.slice(1)}`,
    )
    .join(' ');
};

const bestRawName = (results: CandidateResult[]): string =>
  results
    .map(({ model }) => model.rawName)
    .toSorted((left, right) => {
      const score = (value: string) =>
        (value.match(/\s/gu)?.length ?? 0) * 4 +
        (value.match(/[A-Z]/gu)?.length ?? 0) -
        (value.match(/-/gu)?.length ?? 0) * 3;
      return score(right) - score(left) || left.length - right.length;
    })[0] as string;

export const deriveModelProfiles = (
  candidates: CandidateResult[],
  catalogInput: ModelCatalog,
): ModelProfile[] => {
  const catalog = ModelCatalogSchema.parse(catalogInput);
  const metadataByModel = new Map(
    catalog.models.map((metadata) => [metadata.modelId, metadata]),
  );
  const byProfile = groupBy(
    candidates.filter(
      (
        candidate,
      ): candidate is CandidateResult & {
        model: CandidateResult['model'] & {
          canonicalModelId: string;
          profileId: string;
        };
      } =>
        candidate.model.canonicalModelId !== null &&
        candidate.model.profileId !== null,
    ),
    ({ model }) => model.profileId,
  );

  return [...byProfile.entries()]
    .map(([profileId, results]): ModelProfile => {
      const modelIds = [
        ...new Set(results.map(({ model }) => model.canonicalModelId)),
      ];
      if (modelIds.length !== 1) {
        throw new Error(
          `profile ${profileId} resolves to multiple canonical models`,
        );
      }
      const modelId = modelIds[0] as string;
      const metadata = metadataByModel.get(modelId);
      const attributes = {
        effort: knownConsensus(results.map(({ profile }) => profile.effort)),
        thinking: knownConsensus(
          results.map(({ profile }) => profile.thinking),
        ),
        tools: exactConsensus(results.map(({ profile }) => profile.tools)),
        harness: exactConsensus(results.map(({ profile }) => profile.harness)),
        contextWindowTokens: knownConsensus(
          results.map(({ profile }) => profile.contextWindowTokens),
        ),
        quantization: knownConsensus(
          results.map(({ profile }) => profile.quantization),
        ),
        attempts: exactConsensus(
          results.map(({ profile }) => profile.attempts),
        ),
      };
      const baseModelName =
        metadata?.displayName ?? readableModelName(bestRawName(results));
      const qualifiers = [
        attributes.effort,
        attributes.harness,
        attributes.tools === true
          ? 'tools'
          : attributes.tools === false
            ? 'no tools'
            : null,
      ].filter((value): value is string => value !== null);

      return ModelProfileSchema.parse({
        id: profileId,
        modelId,
        providerId: metadata?.providerId ?? modelId.split('-')[0],
        displayName:
          qualifiers.length > 0
            ? `${baseModelName} · ${qualifiers.join(' · ')}`
            : baseModelName,
        baseModelName,
        releaseDate: metadata?.releaseDate ?? null,
        attributes,
        pricing: [
          ...(metadata?.pricing ?? []),
          ...(metadata?.profilePricing[profileId] ?? []),
        ],
      });
    })
    .toSorted((left, right) => left.id.localeCompare(right.id));
};

export interface DraftProductInput {
  generatedAt: string;
  sourceSnapshotIds: string[];
  candidates: CandidateResult[];
  profiles: ModelProfile[];
  benchmarkDimensions: ReadonlyMap<string, DimensionId>;
  compositeSources: CompositeSource[];
  manualModels: ManualFrontierModel[];
  perSourceLimit?: number;
}

export const buildDraftProduct = (input: DraftProductInput): ProductVersion => {
  const compositeRows = input.compositeSources.flatMap(
    ({ sourceId, benchmarkId }) => {
      const rows = input.candidates
        .filter(
          (candidate) =>
            candidate.sourceId === sourceId &&
            candidate.benchmarkId === benchmarkId &&
            candidate.model.canonicalModelId !== null,
        )
        .toSorted((left, right) => {
          const scoreOrder = left.metric.higherIsBetter
            ? right.rawScore - left.rawScore
            : left.rawScore - right.rawScore;
          return (
            scoreOrder ||
            (left.model.canonicalModelId ?? '').localeCompare(
              right.model.canonicalModelId ?? '',
            )
          );
        });

      return rows.map((candidate, index): CompositeRankingRow => ({
        sourceId,
        rank: index + 1,
        modelId: candidate.model.canonicalModelId as string,
        profileId:
          candidate.model.profileId ??
          `${candidate.model.canonicalModelId as string}-unspecified`,
        score: candidate.rawScore,
      }));
    },
  );
  const frontier = buildFrontierSet(
    compositeRows,
    input.manualModels,
    input.perSourceLimit ?? 20,
  ).toSorted((left, right) => left.modelId.localeCompare(right.modelId));
  const frontierModelIds = new Set(frontier.map(({ modelId }) => modelId));
  const evidence = input.candidates
    .filter(
      ({ model }) =>
        model.canonicalModelId !== null &&
        frontierModelIds.has(model.canonicalModelId),
    )
    .toSorted((left, right) => left.id.localeCompare(right.id));
  const leaderboard = scoreProfiles(evidence, input.benchmarkDimensions);
  const leaderboardProfileIds = new Set(
    leaderboard.map(({ profileId }) => profileId),
  );
  const profiles = input.profiles
    .filter(({ id }) => leaderboardProfileIds.has(id))
    .toSorted((left, right) => left.id.localeCompare(right.id));
  const catalogProfileIds = new Set(profiles.map(({ id }) => id));
  const missingProfiles = [...leaderboardProfileIds].filter(
    (profileId) => !catalogProfileIds.has(profileId),
  );
  if (missingProfiles.length > 0) {
    throw new Error(
      `model catalog is missing profiles: ${missingProfiles.join(', ')}`,
    );
  }

  const leaderboardByProfile = new Map(
    leaderboard.map((entry) => [entry.profileId, entry]),
  );
  const costs = profiles
    .flatMap((profile) => {
      const performance = leaderboardByProfile.get(profile.id)?.overallScore;
      if (performance === null || performance === undefined) return [];

      return profile.pricing.flatMap((pricing) => {
        const cost =
          pricing.costPerTask ??
          (pricing.inputPerMillionTokens !== null &&
          pricing.outputPerMillionTokens !== null &&
          pricing.assumptionId !== null
            ? (pricing.inputPerMillionTokens * 3 +
                pricing.outputPerMillionTokens) /
              4
            : null);
        if (cost === null) return [];
        return [
          {
            modelId: profile.modelId,
            profileId: profile.id,
            costType: pricing.type,
            cost,
            performance,
            assumptionId: pricing.assumptionId,
          },
        ];
      });
    })
    .toSorted(
      (left, right) =>
        left.cost - right.cost || left.profileId.localeCompare(right.profileId),
    );

  return buildProductVersion({
    generatedAt: input.generatedAt,
    sourceSnapshotIds: input.sourceSnapshotIds.toSorted(),
    frontier,
    profiles,
    leaderboard,
    costs,
    evidence,
  });
};

type ProductVersionInput = Omit<ProductVersion, 'schemaVersion' | 'versionId'>;

export const buildProductVersion = (
  input: ProductVersionInput,
): ProductVersion => {
  const versionContent = {
    schemaVersion: 'product-version-v1' as const,
    ...input,
  };
  return ProductVersionSchema.parse({
    ...versionContent,
    versionId: sha256(deterministicJson(versionContent)),
  });
};

const productVersionPath = (root: string, versionId: string): string =>
  join(root, 'versions', `${Sha256Schema.parse(versionId).slice(7)}.json`);

const pointerPath = (
  root: string,
  channel: ProductVersionPointer['channel'],
): string => join(root, 'pointers', `${channel.toLowerCase()}.json`);

export const verifyProductVersion = (input: ProductVersion): ProductVersion => {
  const version = ProductVersionSchema.parse(input);
  const { versionId, ...content } = version;
  if (sha256(deterministicJson(content)) !== versionId) {
    throw new Error('product version content does not match its versionId');
  }
  return version;
};

export const writeImmutableProductVersion = async (
  root: string,
  version: ProductVersion,
): Promise<string> => {
  const parsed = verifyProductVersion(version);
  const path = productVersionPath(root, parsed.versionId);
  const bytes = deterministicJson(parsed);
  await mkdir(join(root, 'versions'), { recursive: true });

  try {
    const existing = await readFile(path, 'utf8');
    if (existing !== bytes) {
      throw new Error(
        'immutable product version already exists with new bytes',
      );
    }
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      await writeFile(path, bytes, { flag: 'wx' });
    } else {
      throw error;
    }
  }

  return path;
};

export const readProductVersion = async (
  root: string,
  versionId: string,
): Promise<ProductVersion> => {
  const path = productVersionPath(root, versionId);
  try {
    await access(path);
  } catch {
    throw new Error(`product version ${versionId} does not exist`);
  }
  const parsed = verifyProductVersion(
    ProductVersionSchema.parse(JSON.parse(await readFile(path, 'utf8'))),
  );
  if (parsed.versionId !== versionId) {
    throw new Error('product version filename does not match its versionId');
  }
  return parsed;
};

export const readProductPointer = async (
  root: string,
  channel: ProductVersionPointer['channel'],
): Promise<ProductVersionPointer | null> => {
  try {
    return ProductVersionPointerSchema.parse(
      JSON.parse(await readFile(pointerPath(root, channel), 'utf8')),
    );
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
};

const writeProductPointer = async (
  root: string,
  pointer: ProductVersionPointer,
): Promise<void> => {
  const parsed = ProductVersionPointerSchema.parse(pointer);
  const directory = join(root, 'pointers');
  const target = pointerPath(root, parsed.channel);
  const temporary = join(
    directory,
    `.${parsed.channel.toLowerCase()}.${process.pid}.${randomUUID()}.tmp`,
  );
  await mkdir(directory, { recursive: true });
  await writeFile(temporary, deterministicJson(parsed), { flag: 'wx' });
  await rename(temporary, target);
};

export const setDraftPointer = async (
  root: string,
  versionId: string,
  updatedAt: string,
): Promise<ProductVersionPointer> => {
  await readProductVersion(root, versionId);
  const pointer = ProductVersionPointerSchema.parse({
    schemaVersion: 'product-pointer-v1',
    channel: 'DRAFT',
    versionId,
    previousVersionId: null,
    updatedAt,
  });
  await writeProductPointer(root, pointer);
  return pointer;
};

export const publishDraft = async (
  root: string,
  updatedAt: string,
): Promise<ProductVersionPointer> => {
  const draft = await readProductPointer(root, 'DRAFT');
  if (!draft) {
    throw new Error('Draft pointer does not exist');
  }
  await readProductVersion(root, draft.versionId);
  const current = await readProductPointer(root, 'PUBLISHED');
  const pointer = ProductVersionPointerSchema.parse({
    schemaVersion: 'product-pointer-v1',
    channel: 'PUBLISHED',
    versionId: draft.versionId,
    previousVersionId:
      current?.versionId === draft.versionId
        ? current.previousVersionId
        : (current?.versionId ?? null),
    updatedAt,
  });
  await writeProductPointer(root, pointer);
  return pointer;
};

export const rollbackPublished = async (
  root: string,
  updatedAt: string,
): Promise<ProductVersionPointer> => {
  const current = await readProductPointer(root, 'PUBLISHED');
  if (!current) {
    throw new Error('Published pointer does not exist');
  }
  if (!current.previousVersionId) {
    throw new Error('Published pointer has no previous version');
  }
  await readProductVersion(root, current.previousVersionId);
  const pointer = ProductVersionPointerSchema.parse({
    schemaVersion: 'product-pointer-v1',
    channel: 'PUBLISHED',
    versionId: current.previousVersionId,
    previousVersionId: current.versionId,
    updatedAt,
  });
  await writeProductPointer(root, pointer);
  return pointer;
};
