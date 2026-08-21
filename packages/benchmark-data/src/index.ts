import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
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
export type BenchmarkDimensionMapping = z.infer<
  typeof BenchmarkDimensionMappingSchema
>;

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

export const ScoreProvenanceMethodSchema = z.enum([
  'EXPORT',
  'API_RESPONSE',
  'EMBEDDED_JSON',
  'NEXT_RSC',
  'DOM',
  'VISUAL',
]);

export const ScoreProvenanceSchema = z.strictObject({
  sourceUrl: HttpUrlSchema,
  locator: z.string().min(1),
  method: ScoreProvenanceMethodSchema,
  retrievedAt: z.iso.datetime(),
  evidenceId: Sha256Schema,
});
export type ScoreProvenance = z.infer<typeof ScoreProvenanceSchema>;

export const CandidateProfileAttributesSchema = z.object({
  effort: z.string().nullable(),
  thinking: z.string().nullable(),
  tools: z.boolean().nullable(),
  harness: z.string().nullable(),
  contextWindowTokens: z.int().positive().nullable(),
  quantization: z.string().nullable(),
  attempts: z.int().positive().nullable(),
});

export const ModelProfileAttributesSchema = z.object({
  effort: z.string().nullable(),
  harness: z.string().nullable(),
});

const CandidateResultBaseSchema = z.object({
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
  profile: CandidateProfileAttributesSchema,
  productProfile: ModelProfileAttributesSchema.optional(),
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
});

export const CandidateResultSchema = CandidateResultBaseSchema.superRefine(
  (value, context) => {
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
  },
);
export type CandidateResult = z.infer<typeof CandidateResultSchema>;

export const ProductEvidenceSchema = CandidateResultBaseSchema.omit({
  schemaVersion: true,
  sourceUrl: true,
  observedAt: true,
  sourcePublishedAt: true,
  evidenceIds: true,
  provenance: true,
})
  .extend({ provenance: ScoreProvenanceSchema })
  .strict()
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
export type ProductEvidence = z.infer<typeof ProductEvidenceSchema>;

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
export type Pricing = z.infer<typeof PricingSchema>;

export const CostRecordSchema = z.object({
  schemaVersion: z.literal('cost-record-v1'),
  id: z.string().min(1).max(300),
  sourceId: SlugSchema,
  model: z.object({
    rawName: z.string().min(1),
    canonicalModelId: SlugSchema.nullable(),
    profileId: SlugSchema.nullable(),
  }),
  profile: CandidateProfileAttributesSchema,
  costType: PricingSchema.shape.type,
  metricId: SlugSchema,
  metricName: z.string().min(1),
  unit: z.enum(['USD_PER_MILLION_TOKENS', 'USD_PER_TASK']),
  inputPerMillionTokens: z.number().nonnegative().nullable(),
  outputPerMillionTokens: z.number().nonnegative().nullable(),
  cost: z.number().nonnegative().nullable(),
  assumptionId: SlugSchema.nullable(),
  benchmarkId: SlugSchema.nullable(),
  benchmarkVersion: z.string().min(1).nullable(),
  inclusion: z.enum(['INCLUDED', 'EXCLUDED']),
  exclusionReason: z.string().min(1).nullable(),
  sourceUrl: HttpUrlSchema,
  observedAt: z.iso.datetime(),
  sourcePublishedAt: z.iso.datetime().nullable(),
  evidenceIds: z.array(Sha256Schema).min(1),
  provenance: z.record(z.string(), FieldProvenanceSchema),
});
export type CostRecord = z.infer<typeof CostRecordSchema>;

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
      aliases: z.array(z.string().min(1)).optional(),
      releaseDate: z.iso.date().nullable(),
      deprecated: z.boolean().optional(),
      pricing: z.array(PricingSchema),
      profilePricing: z.record(SlugSchema, z.array(PricingSchema)),
    }),
  ),
});
export type ModelCatalog = z.infer<typeof ModelCatalogSchema>;

export const ProfilePolicySchema = z
  .object({
    schemaVersion: z.literal('profile-policy-v2'),
    effortOrder: z.array(z.string().min(1)).min(1),
    defaultEffort: z.string().min(1),
  })
  .superRefine((policy, context) => {
    const normalizedOrder = policy.effortOrder.map(normalizedLabelKey);
    if (new Set(normalizedOrder).size !== normalizedOrder.length) {
      context.addIssue({
        code: 'custom',
        message: 'effortOrder cannot contain duplicate labels',
        path: ['effortOrder'],
      });
    }
    if (normalizedLabelKey(policy.defaultEffort) !== 'default') {
      context.addIssue({
        code: 'custom',
        message: 'defaultEffort must be the outside-the-ladder "default" tier',
        path: ['defaultEffort'],
      });
    }
    if (normalizedOrder.includes('default')) {
      context.addIssue({
        code: 'custom',
        message: 'default must not be included in effortOrder',
        path: ['effortOrder'],
      });
    }
  });
export type ProfilePolicy = z.infer<typeof ProfilePolicySchema>;

export const EFFORT_TIERS = [
  'non-reasoning',
  'low',
  'medium',
  'high',
  'xhigh',
  'max',
] as const;
export type EffortTier = (typeof EFFORT_TIERS)[number];
export type ProductEffort = EffortTier | 'default';

const EFFORT_TIER_RANK: ReadonlyMap<EffortTier, number> = new Map(
  EFFORT_TIERS.map((effort, index) => [effort, index]),
);

export type EffortDecisionBasis =
  'SOURCE_FIELD' | 'NAME_DERIVED' | 'CROSS_SOURCE' | 'DEFAULT';

export interface EffortResolutionInput {
  id: string;
  sourceId: string;
  model: {
    rawName: string;
    canonicalModelId: string | null;
  };
  profile: {
    effort: string | null;
  };
}

export interface EffortDecision {
  effort: ProductEffort;
  basis: EffortDecisionBasis;
  basisSourceId: string | null;
  basisCandidateId: string | null;
}

export const SourcesConfigSchema = z.object({
  schemaVersion: z.literal('sources-config-v1'),
  whitelist: z.array(SlugSchema).min(1),
});
export type SourcesConfig = z.infer<typeof SourcesConfigSchema>;

export const DisplaySetSchema = z.object({
  schemaVersion: z.literal('display-set-v1'),
  notes: z.string().optional(),
  benchmarkIds: z.array(SlugSchema).min(1),
});
export type DisplaySet = z.infer<typeof DisplaySetSchema>;

export const validateDisplaySet = (
  displaySetInput: DisplaySet,
  benchmarkMappingInput: BenchmarkDimensionMapping,
): void => {
  const displaySet = DisplaySetSchema.parse(displaySetInput);
  const benchmarkMapping = BenchmarkDimensionMappingSchema.parse(
    benchmarkMappingInput,
  );
  const knownBenchmarkIds = new Set(
    benchmarkMapping.benchmarks.map(({ id }) => id),
  );
  const missing = displaySet.benchmarkIds.filter(
    (id) => !knownBenchmarkIds.has(id),
  );
  if (missing.length > 0) {
    throw new Error(
      `Display set contains unknown benchmark IDs: ${missing.join(', ')}`,
    );
  }
};

const normalizedLabelKey = (value: string): string =>
  value.trim().toLocaleLowerCase().replace(/\s+/gu, ' ');

const profileIdSegment = (value: string): string =>
  value
    .normalize('NFKD')
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/gu, '-')
    .replace(/^-+|-+$/gu, '');

const normalizedEffortKey = (value: string): string =>
  normalizedLabelKey(value)
    .replace(/[()]/gu, '')
    .replace(/[_\s]+/gu, '-')
    .replace(/-+effort$/u, '')
    .replace(/^-+|-+$/gu, '');

export const normalizeProductEffort = (
  value: string | null | undefined,
): EffortTier | null => {
  if (typeof value !== 'string' || value.trim().length === 0) return null;
  const key = normalizedEffortKey(value);
  if (key === 'nonreasoning' || key === 'non-reasoning') {
    return 'non-reasoning';
  }
  if (key === 'minimal') return 'low';
  return EFFORT_TIER_RANK.has(key as EffortTier) ? (key as EffortTier) : null;
};

export const deriveNameEffort = (rawName: string): EffortTier | null => {
  // The explicit non-reasoning marker must win if a source includes more than
  // one parenthetical qualifier in a display name.
  if (/\(\s*non[\s_-]*reasoning\s*\)/iu.test(rawName)) {
    return 'non-reasoning';
  }
  if (/\(\s*minimal\s*\)/iu.test(rawName)) return 'low';

  const parentheticals = rawName.match(/\([^()]+\)/gu) ?? [];
  for (const parenthetical of parentheticals) {
    const effort = normalizeProductEffort(parenthetical);
    if (effort !== null) return effort;
  }
  return null;
};

const directEffort = (
  candidate: EffortResolutionInput,
): { effort: EffortTier; basis: 'SOURCE_FIELD' | 'NAME_DERIVED' } | null => {
  if (candidate.profile.effort !== null) {
    const sourceEffort = normalizeProductEffort(candidate.profile.effort);
    // A present but invalid source field is not permission to fall back to a
    // qualifier in the display name. The source explicitly supplied a value;
    // it remains unlabelled (and can only use the §4.5/default paths).
    return sourceEffort === null
      ? null
      : { effort: sourceEffort, basis: 'SOURCE_FIELD' };
  }
  const nameEffort = deriveNameEffort(candidate.model.rawName);
  return nameEffort === null
    ? null
    : { effort: nameEffort, basis: 'NAME_DERIVED' };
};

/**
 * `non-reasoning` is never an inference result. It declares a mode rather than a
 * degree of effort, so carrying it to another source would claim that source
 * turned reasoning off — a much stronger assertion than picking a tier, and one
 * the other source never made.
 *
 * Qwen3.6 27B showed why: Artificial Analysis lists both `(Reasoning)` and
 * `(Non-reasoning)`, but the reasoning row names no tier and therefore resolves
 * to `default`, which is not a tier. `non-reasoning` was then the only named
 * tier left, so LiveBench's plain `qwen3.6-27b` row was filed as reasoning-off
 * and the non-reasoning profile outscored the real reasoning one.
 *
 * See REFACTOR_SPEC_V2.md section 4.5.
 */
const INFERABLE_TIERS: ReadonlySet<EffortTier> = new Set(
  EFFORT_TIERS.filter((tier) => tier !== 'non-reasoning'),
);

/**
 * Every source casts one vote for each named tier it published for the model.
 * The tier the most sources ran wins; ties go to the higher tier.
 *
 * Taking the single highest tier across all sources let one source decide for
 * everyone. Grok 4.6 showed it: DeepSWE swept low through xhigh while
 * Artificial Analysis and Frontier Code both ran only high, so LiveBench's
 * unlabelled row was handed `xhigh` on the strength of a sweep the other two
 * sources never performed.
 *
 * Collapsing each source to its own highest tier was the first fix, and it was
 * still wrong: it discards the tier a sweeping source shares with everyone
 * else. Adding Epoch as a fifth source made that visible — Epoch runs Grok 4.6
 * at both high and xhigh, so under the highest-per-source reading the vote was
 * high 2, xhigh 2, and the tie rule handed it `xhigh`, splitting the profile
 * and dropping Grok 4.6 off the main screen. Counting every tier a source
 * published gives high 4 (Artificial Analysis, DeepSWE, Frontier Code, Epoch)
 * against xhigh 2, which is what the labelled sources actually agree on, and no
 * tie-break is needed at all.
 *
 * A sweeping source cannot outvote anyone this way: it contributes at most one
 * vote to each tier, exactly like a source that ran a single configuration.
 *
 * See REFACTOR_SPEC_V2.md section 4.5.
 */
const higherEffortEvidence = (
  candidates: readonly EffortResolutionInput[],
): { candidate: EffortResolutionInput; effort: EffortTier } | null => {
  const direct = candidates.flatMap((candidate) => {
    const resolved = directEffort(candidate);
    return resolved === null || !INFERABLE_TIERS.has(resolved.effort)
      ? []
      : [{ candidate, effort: resolved.effort }];
  });
  if (direct.length === 0) return null;

  const byRank = (effort: EffortTier) => EFFORT_TIER_RANK.get(effort) ?? -1;
  const voters = new Map<EffortTier, Set<string>>();
  for (const entry of direct) {
    const sources = voters.get(entry.effort) ?? new Set<string>();
    sources.add(entry.candidate.sourceId);
    voters.set(entry.effort, sources);
  }

  const winner = [...voters.entries()].toSorted(
    ([leftEffort, leftSources], [rightEffort, rightSources]) =>
      rightSources.size - leftSources.size ||
      byRank(rightEffort) - byRank(leftEffort),
  )[0]![0];

  return (
    direct
      .filter(({ effort }) => effort === winner)
      .toSorted(
        (left, right) =>
          left.candidate.sourceId.localeCompare(right.candidate.sourceId) ||
          left.candidate.id.localeCompare(right.candidate.id),
      )[0] ?? null
  );
};

/**
 * Resolve the product-facing effort without mutating source-facing fields.
 *
 * This is intentionally pure: every caller passes the complete source set,
 * and cross-source inference filters out the target source before looking for
 * direct evidence. Inferred/default values are therefore never fed back as
 * evidence for another candidate.
 */
export const decideProductEffort = (
  candidate: EffortResolutionInput,
  allCandidates: readonly EffortResolutionInput[],
): EffortDecision => {
  const direct = directEffort(candidate);
  if (direct !== null) {
    return {
      effort: direct.effort,
      basis: direct.basis,
      basisSourceId: candidate.sourceId,
      basisCandidateId: candidate.id,
    };
  }

  if (candidate.model.canonicalModelId !== null) {
    const crossSource = higherEffortEvidence(
      allCandidates.filter(
        (other) =>
          other.id !== candidate.id &&
          other.sourceId !== candidate.sourceId &&
          other.model.canonicalModelId === candidate.model.canonicalModelId,
      ),
    );
    if (crossSource !== null) {
      return {
        effort: crossSource.effort,
        basis: 'CROSS_SOURCE',
        basisSourceId: crossSource.candidate.sourceId,
        basisCandidateId: crossSource.candidate.id,
      };
    }
  }

  return {
    effort: 'default',
    basis: 'DEFAULT',
    basisSourceId: null,
    basisCandidateId: null,
  };
};

const productProfileId = (modelId: string, effort: ProductEffort): string =>
  `${modelId}-${profileIdSegment(effort)}`;

export const applyProductProfilePolicy = (
  candidates: CandidateResult[],
  catalogInput: ModelCatalog,
  policyInput: ProfilePolicy,
): CandidateResult[] => {
  ModelCatalogSchema.parse(catalogInput);
  const policy = ProfilePolicySchema.parse(policyInput);
  // Parsing the policy here documents that the configured ladder is part of
  // the input contract. The canonical ladder/ranks are fixed by §4.4 so a
  // highest-tier decision remains correct if the JSON is presented in the
  // older highest-first order.
  void policy;
  const evidence: readonly EffortResolutionInput[] = candidates;

  return candidates.map((candidate) => {
    const modelId = candidate.model.canonicalModelId;
    if (modelId === null) return candidate;

    const decision = decideProductEffort(candidate, evidence);
    return CandidateResultSchema.parse({
      ...candidate,
      model: {
        ...candidate.model,
        profileId: productProfileId(modelId, decision.effort),
      },
      productProfile: { effort: decision.effort, harness: null },
    });
  });
};

/**
 * Align cost records with the product profile chosen for their corresponding
 * CandidateResult while leaving CostRecord.profile untouched. Cost rows often
 * carry a source-specific profile ID (or an old fallback ID); the product
 * projection must use the same effort decision as the score evidence.
 */
export const applyProductProfilePolicyToCosts = (
  costs: CostRecord[],
  candidates: readonly CandidateResult[],
  catalogInput: ModelCatalog,
  policyInput: ProfilePolicy,
): CostRecord[] => {
  ModelCatalogSchema.parse(catalogInput);
  const policy = ProfilePolicySchema.parse(policyInput);
  void policy;
  const evidence: readonly EffortResolutionInput[] = candidates;
  const decisionByCandidate = new Map(
    candidates.map((candidate) => [
      candidate.id,
      decideProductEffort(candidate, evidence),
    ]),
  );

  return costs.map((cost) => {
    const modelId = cost.model.canonicalModelId;
    if (modelId === null) return cost;

    const matching = candidates
      .filter(
        (candidate) =>
          candidate.sourceId === cost.sourceId &&
          candidate.model.canonicalModelId === modelId &&
          candidate.model.rawName === cost.model.rawName,
      )
      .toSorted((left, right) => left.id.localeCompare(right.id));
    const costEffort = normalizeProductEffort(cost.profile.effort);
    const matchingEffort = matching.find(
      (candidate) =>
        normalizeProductEffort(candidate.profile.effort) === costEffort,
    );
    const matchingCandidate = matchingEffort ?? matching[0];
    const decision = matchingCandidate
      ? (decisionByCandidate.get(matchingCandidate.id) as EffortDecision)
      : decideProductEffort(cost, evidence);

    return CostRecordSchema.parse({
      ...cost,
      model: {
        ...cost.model,
        profileId: productProfileId(modelId, decision.effort),
      },
    });
  });
};

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

export const ProductCostSchema = z.object({
  modelId: SlugSchema,
  profileId: SlugSchema,
  costType: PricingSchema.shape.type,
  cost: z.number().nonnegative(),
  performance: z.number().min(0).max(100).nullable(),
  assumptionId: SlugSchema.nullable(),
  sourceUrl: HttpUrlSchema,
  sourceId: SlugSchema,
  metricId: SlugSchema,
  metricName: z.string().min(1),
  unit: z.enum(['USD_PER_MILLION_TOKENS', 'USD_PER_TASK']),
  benchmarkId: SlugSchema.nullable(),
  benchmarkVersion: z.string().min(1).nullable(),
  /** Every product cost must carry provenance; see REFACTOR_SPEC_V2 section 4.4. */
  evidenceIds: z.array(Sha256Schema).min(1),
});
export type ProductCost = z.infer<typeof ProductCostSchema>;

export const ProductVersionSchema = z.object({
  schemaVersion: z.literal('product-version-v3'),
  versionId: Sha256Schema,
  generatedAt: z.iso.datetime(),
  sourceSnapshotIds: z.array(z.string().min(1)),
  frontier: z.array(
    z.object({
      modelId: SlugSchema,
      reasons: z.array(z.string().min(1)).min(1),
      externalCompositeScores: z.record(z.string(), z.number()),
    }),
  ),
  profiles: z.array(ModelProfileSchema),
  leaderboard: z.array(
    z
      .object({
        modelId: SlugSchema,
        profileId: SlugSchema,
        rank: z.int().positive().nullable(),
        overallScore: z.number().min(0).max(100).nullable(),
        dimensions: OrderedDimensionScoresSchema,
        evidenceResultIds: z.array(z.string().min(1)),
      })
      .strict(),
  ),
  costs: z.array(ProductCostSchema),
  evidence: z.array(ProductEvidenceSchema),
});
export type ProductVersion = z.infer<typeof ProductVersionSchema>;

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
  ].join('\u001f');

const sourceHarnessKey = (result: CandidateResult): string =>
  normalizedLabelKey(result.profile.harness ?? '');

const comparableScore = (result: CandidateResult): number =>
  result.normalizedScore ??
  (result.metric.higherIsBetter ? result.rawScore : -result.rawScore);

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

    // Two sources publishing the same benchmark for the same profile is a
    // genuine duplicate measurement, and the user's rule for it (2026-08-21) is
    // to take the higher score. Artificial Analysis and Epoch AI both rerun
    // GPQA Diamond, both as INDEPENDENT and both FULL, so nothing below could
    // separate them and the choice fell out of whether their harness strings
    // happened to differ -- an accident, not a decision.
    //
    // The rule is deliberately limited to sources of equal standing. A VENDOR's
    // self-reported number must still lose to an ORGANIZER's, and a partial
    // snapshot must still lose to a full one, however flattering the score.
    const equalStanding =
      SOURCE_ROLE_WEIGHT[result.sourceRole] ===
        SOURCE_ROLE_WEIGHT[current.sourceRole] &&
      result.acquisitionStatus === current.acquisitionStatus;

    if (
      (result.sourceId !== current.sourceId && equalStanding) ||
      sourceHarnessKey(result) !== sourceHarnessKey(current)
    ) {
      const scoreDifference =
        comparableScore(result) - comparableScore(current);
      if (scoreDifference > 0) {
        selected.set(key, result);
      }
      if (scoreDifference !== 0) continue;
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
  reason: string;
}

export interface FrontierModel {
  modelId: string;
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

export const isReleaseDateQualified = (
  releaseDateStr: string,
  referenceDateStr: string,
  windowMonths: number,
): boolean => {
  const ref = new Date(referenceDateStr);
  const cutoffYear = ref.getUTCFullYear();
  const cutoffMonth = ref.getUTCMonth() - windowMonths;
  const cutoffDay = ref.getUTCDate();
  const cutoffDate = new Date(
    Date.UTC(cutoffYear, cutoffMonth, cutoffDay, 0, 0, 0, 0),
  );

  const releaseDate = new Date(
    releaseDateStr.includes('T')
      ? releaseDateStr
      : `${releaseDateStr}T00:00:00.000Z`,
  );

  return releaseDate.getTime() >= cutoffDate.getTime();
};

/**
 * The release-date window is a negative filter only: it removes models that are
 * known to be old. A missing release date never disqualifies a model, because
 * frontier eligibility is decided by measured benchmark availability (the
 * display-set complete-matrix gate), not by whether a catalog row happens to
 * carry a date.
 * See REFACTOR_SPEC_V2.md section 5.1.
 */
export const isModelQualified = (
  model: {
    modelId: string;
    releaseDate: string | null;
    deprecated?: boolean | undefined;
  },
  referenceDate: string,
  windowMonths = 12,
): boolean => {
  if (model.deprecated) return false;
  if (!model.releaseDate) return true;
  return isReleaseDateQualified(model.releaseDate, referenceDate, windowMonths);
};

export const buildFrontierSet = ({
  catalog,
  manualModels,
  referenceDate,
  qualificationWindowMonths,
}: {
  catalog?: ModelCatalog | undefined;
  manualModels?: ManualFrontierModel[] | undefined;
  referenceDate: string;
  qualificationWindowMonths?: number | undefined;
}): FrontierModel[] => {
  const frontier = new Map<string, FrontierModel>();
  const windowMonths = qualificationWindowMonths ?? 12;

  if (catalog) {
    catalog.models.forEach((model) => {
      if (isModelQualified(model, referenceDate, windowMonths)) {
        frontier.set(model.modelId, {
          modelId: model.modelId,
          reasons: [
            model.releaseDate
              ? `Active model within ${windowMonths} month qualification window`
              : 'Active model with no known release date; not excluded by the release-date window',
          ],
          externalCompositeScores: {},
        });
      }
    });
  }

  (manualModels ?? []).forEach((manual) => {
    const current = frontier.get(manual.modelId);
    if (current) {
      current.reasons.push(manual.reason);
      return;
    }
    frontier.set(manual.modelId, {
      modelId: manual.modelId,
      reasons: [manual.reason],
      externalCompositeScores: {},
    });
  });

  return [...frontier.values()].toSorted((left, right) =>
    left.modelId.localeCompare(right.modelId),
  );
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
      const completeScores = dimensions.flatMap(({ score }) =>
        score === null ? [] : [score],
      );

      return {
        modelId,
        profileId,
        rank: null,
        overallScore:
          completeScores.length === DIMENSION_IDS.length
            ? completeScores.reduce((sum, score) => sum + score, 0) /
              completeScores.length
            : null,
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

export const FrontierConfigSchema = z.object({
  schemaVersion: z.literal('frontier-config-v2'),
  qualificationWindowMonths: z.number().int().positive().default(12),
  manualModels: z
    .array(
      z.object({
        modelId: SlugSchema,
        reason: z.string().min(1),
      }),
    )
    .default([]),
});
export type FrontierConfig = z.infer<typeof FrontierConfigSchema>;

const knownConsensus = <Value>(values: Array<Value | null>): Value | null => {
  const known = [...new Set(values.filter((value) => value !== null))];
  return known.length === 1 ? (known[0] as Value) : null;
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
        candidate.inclusion === 'INCLUDED' &&
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
        effort: knownConsensus(
          results.map(({ productProfile, profile }) =>
            productProfile ? productProfile.effort : profile.effort,
          ),
        ),
        harness: null,
      };
      const baseModelName =
        metadata?.displayName ?? readableModelName(bestRawName(results));
      const qualifiers = [attributes.effort].filter(
        (value): value is string => value !== null,
      );

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

export interface ProductInput {
  generatedAt: string;
  sourceSnapshotIds: string[];
  candidates: CandidateResult[];
  profiles: ModelProfile[];
  benchmarkDimensions: ReadonlyMap<string, DimensionId>;
  catalog?: ModelCatalog | undefined;
  manualModels?: ManualFrontierModel[] | undefined;
  qualificationWindowMonths?: number | undefined;
  costRecords?: CostRecord[] | undefined;
}

export const toProductEvidence = (
  candidate: CandidateResult,
): ProductEvidence => {
  const {
    schemaVersion: _schemaVersion,
    sourceUrl,
    observedAt,
    sourcePublishedAt: _sourcePublishedAt,
    evidenceIds,
    provenance: fieldProvenance,
    ...score
  } = candidate;
  const rawScoreProvenance = fieldProvenance.rawScore;
  if (!rawScoreProvenance) {
    throw new Error(`candidate ${candidate.id} has no rawScore provenance`);
  }
  if (!evidenceIds.includes(rawScoreProvenance.evidenceId)) {
    throw new Error(
      `candidate ${candidate.id} rawScore evidence is not in evidenceIds`,
    );
  }

  return ProductEvidenceSchema.parse({
    ...score,
    provenance: {
      sourceUrl,
      locator: rawScoreProvenance.locator,
      method: rawScoreProvenance.method,
      retrievedAt: observedAt,
      evidenceId: rawScoreProvenance.evidenceId,
    },
  });
};

export const buildProduct = (input: ProductInput): ProductVersion => {
  const frontier = buildFrontierSet({
    catalog: input.catalog,
    manualModels: input.manualModels ?? [],
    referenceDate: input.generatedAt,
    qualificationWindowMonths: input.qualificationWindowMonths ?? 12,
  });
  const frontierModelIds = new Set(frontier.map(({ modelId }) => modelId));
  const scoringEvidence = input.candidates
    .filter(
      ({ model }) =>
        model.canonicalModelId !== null &&
        frontierModelIds.has(model.canonicalModelId),
    )
    .toSorted((left, right) => left.id.localeCompare(right.id));
  const leaderboard = scoreProfiles(scoringEvidence, input.benchmarkDimensions);
  const evidence = scoringEvidence.map(toProductEvidence);
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
  // The model catalog carries manual pricing, but a cost with no evidence
  // cannot be audited back to a source, and DATA_METHODOLOGY forbids exactly
  // that. Only materialized CostRecords - each one carrying evidenceIds -
  // reach the product. See REFACTOR_SPEC_V2.md section 6.3.
  const materializedCosts = (input.costRecords ?? []).flatMap((record) => {
    if (
      record.inclusion !== 'INCLUDED' ||
      record.model.canonicalModelId === null ||
      record.model.profileId === null
    ) {
      return [];
    }
    const performance =
      leaderboardByProfile.get(record.model.profileId)?.overallScore ?? null;
    const cost =
      record.cost ??
      (record.inputPerMillionTokens !== null &&
      record.outputPerMillionTokens !== null &&
      record.assumptionId !== null
        ? (record.inputPerMillionTokens * 3 + record.outputPerMillionTokens) / 4
        : null);
    if (cost === null) return [];
    return [
      {
        modelId: record.model.canonicalModelId,
        profileId: record.model.profileId,
        costType: record.costType,
        cost,
        performance,
        assumptionId: record.assumptionId,
        sourceUrl: record.sourceUrl,
        sourceId: record.sourceId,
        metricId: record.metricId,
        metricName: record.metricName,
        unit: record.unit,
        benchmarkId: record.benchmarkId,
        benchmarkVersion: record.benchmarkVersion,
        evidenceIds: record.evidenceIds,
      },
    ];
  });
  const costs = [...materializedCosts].toSorted(
    (left, right) =>
      left.cost - right.cost ||
      left.profileId.localeCompare(right.profileId) ||
      left.sourceId.localeCompare(right.sourceId) ||
      left.metricId.localeCompare(right.metricId),
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
    schemaVersion: 'product-version-v3' as const,
    ...input,
  };
  return ProductVersionSchema.parse({
    ...versionContent,
    versionId: sha256(deterministicJson(versionContent)),
  });
};

const currentProductPath = (root: string): string => join(root, 'current.json');

export const verifyProductVersion = (input: ProductVersion): ProductVersion => {
  const version = ProductVersionSchema.parse(input);
  const { versionId, ...content } = version;
  if (sha256(deterministicJson(content)) !== versionId) {
    throw new Error('product version content does not match its versionId');
  }
  return version;
};

export const writeCurrentProductVersion = async (
  root: string,
  version: ProductVersion,
): Promise<string> => {
  const parsed = verifyProductVersion(version);
  const path = currentProductPath(root);
  const bytes = deterministicJson(parsed);
  await mkdir(root, { recursive: true });

  try {
    const existing = await readFile(path, 'utf8');
    if (existing === bytes) return path;
  } catch (error) {
    if (!(
      error instanceof Error &&
      'code' in error &&
      error.code === 'ENOENT'
    )) {
      throw error;
    }
  }

  await writeFile(path, bytes);
  return path;
};

export const readCurrentProductVersion = async (
  root: string,
): Promise<ProductVersion> => {
  const path = currentProductPath(root);
  try {
    return verifyProductVersion(
      ProductVersionSchema.parse(JSON.parse(await readFile(path, 'utf8'))),
    );
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      throw new Error('current product version does not exist', {
        cause: error,
      });
    }
    throw error;
  }
};
