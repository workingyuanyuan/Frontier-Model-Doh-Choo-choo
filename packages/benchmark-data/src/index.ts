import { createHash } from 'node:crypto';

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

export const HttpUrlSchema = z.url().refine(
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
  state: z.enum(['DRAFT', 'PUBLISHED']),
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

export const ProductVersionPointerSchema = z
  .object({
    schemaVersion: z.literal('product-pointer-v1'),
    channel: z.enum(['DRAFT', 'PUBLISHED']),
    versionId: Sha256Schema,
    versionState: z.enum(['DRAFT', 'PUBLISHED']),
    updatedAt: z.iso.datetime(),
  })
  .superRefine((value, context) => {
    if (value.channel !== value.versionState) {
      context.addIssue({
        code: 'custom',
        message: 'versionState must match the pointer channel',
        path: ['versionState'],
      });
    }
  });
export type ProductVersionPointer = z.infer<
  typeof ProductVersionPointerSchema
>;

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
