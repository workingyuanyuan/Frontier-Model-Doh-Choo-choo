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

export const ScoreStatusSchema = z.enum([
  'FORMAL',
  'PROVISIONAL',
  'INSUFFICIENT_DATA',
]);
export type ScoreStatus = z.infer<typeof ScoreStatusSchema>;

export const RankingStatusSchema = z.enum([
  'VERIFIED',
  'PROVISIONAL',
  'UNRANKED',
]);
export type RankingStatus = z.infer<typeof RankingStatusSchema>;

export const QualityFlagSchema = z.enum([
  'PROVISIONAL',
  'VENDOR_REPORTED',
  'STALE',
  'LOW_COVERAGE',
  'SOURCE_UNAVAILABLE',
  'MANUAL_REVIEW_REQUIRED',
  'CONFLICTING',
  'PARSER_FAILED',
]);
export type QualityFlag = z.infer<typeof QualityFlagSchema>;

export const DimensionScoreSchema = z.object({
  dimension: DimensionIdSchema,
  score: z.number().min(0).max(100).nullable(),
  coverage: z.number().min(0).max(1),
  confidence: z.number().min(0).max(100),
  status: ScoreStatusSchema,
});
export type DimensionScore = z.infer<typeof DimensionScoreSchema>;

export const OrderedDimensionScoresSchema = z
  .array(DimensionScoreSchema)
  .length(DIMENSION_IDS.length)
  .superRefine((scores, context) => {
    DIMENSION_IDS.forEach((dimension, index) => {
      if (scores[index]?.dimension !== dimension) {
        context.addIssue({
          code: 'custom',
          message: `Expected ${dimension} at axis ${index}`,
          path: [index, 'dimension'],
        });
      }
    });
  });

export const RankingEntrySchema = z.object({
  modelVariantId: z.uuidv7(),
  slug: z
    .string()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  displayName: z.string().min(1).max(200),
  providerName: z.string().min(1).max(120),
  rank: z.int().positive().nullable(),
  overallScore: z.number().min(0).max(100).nullable(),
  overallCoverage: z.number().min(0).max(1),
  overallConfidence: z.number().min(0).max(100),
  rankingStatus: RankingStatusSchema,
  dimensions: OrderedDimensionScoresSchema,
  qualityFlags: z.array(QualityFlagSchema),
});
export type RankingEntry = z.infer<typeof RankingEntrySchema>;

export const RankingSnapshotSchema = z.object({
  id: z.uuidv7(),
  editionDate: z.iso.date(),
  dataCutoffAt: z.iso.datetime(),
  scoringMethodVersion: z.string().min(1).max(80),
  sourceSnapshotIds: z.array(z.uuidv7()).min(1),
  entries: z.array(RankingEntrySchema),
});
export type RankingSnapshot = z.infer<typeof RankingSnapshotSchema>;

export const PublicationModeSchema = z.enum(['FORMAL', 'PREVIEW']);
export type PublicationMode = z.infer<typeof PublicationModeSchema>;

export const Sha256Schema = z
  .string()
  .regex(/^[a-f0-9]{64}$/u, 'Expected a lowercase SHA-256 digest');

export const ActiveEditionSchema = z.object({
  id: z.uuidv7(),
  publicationMode: PublicationModeSchema,
  titleZhTw: z.string().min(1).max(240),
  titleEn: z.string().min(1).max(240),
  summaryZhTw: z.string().max(2_000).nullable(),
  summaryEn: z.string().max(2_000).nullable(),
  activatedAt: z.iso.datetime(),
  snapshotSha256: Sha256Schema,
  snapshot: RankingSnapshotSchema,
});
export type ActiveEdition = z.infer<typeof ActiveEditionSchema>;

export const ActiveEditionResponseSchema = z.object({
  apiVersion: z.literal('v1'),
  data: ActiveEditionSchema,
});
export type ActiveEditionResponse = z.infer<typeof ActiveEditionResponseSchema>;

export const ApiErrorResponseSchema = z.object({
  apiVersion: z.literal('v1'),
  error: z.object({
    code: z
      .string()
      .min(1)
      .max(80)
      .regex(/^[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)*$/u),
    message: z.string().min(1).max(500),
    details: z.record(z.string(), z.unknown()).optional(),
  }),
});
export type ApiErrorResponse = z.infer<typeof ApiErrorResponseSchema>;

export const DataStatusSchema = z.object({
  status: z.literal('READY'),
  activeEdition: z
    .object({
      id: z.uuidv7(),
      editionDate: z.iso.date(),
      publicationMode: PublicationModeSchema,
      activatedAt: z.iso.datetime(),
      snapshotId: z.uuidv7(),
      entryCount: z.int().nonnegative(),
    })
    .nullable(),
  publishedResultCount: z.int().nonnegative(),
});
export type DataStatus = z.infer<typeof DataStatusSchema>;

export const DataStatusResponseSchema = z.object({
  apiVersion: z.literal('v1'),
  data: DataStatusSchema,
});
export type DataStatusResponse = z.infer<typeof DataStatusResponseSchema>;

export const HealthResponseSchema = z.object({
  apiVersion: z.literal('v1'),
  data: z.object({ status: z.literal('OK') }),
});
export type HealthResponse = z.infer<typeof HealthResponseSchema>;

export const DetailSlugSchema = z
  .string()
  .min(1)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u);

export const HttpUrlSchema = z.url().refine(
  (value) => {
    const protocol = new URL(value).protocol;
    return protocol === 'https:' || protocol === 'http:';
  },
  { message: 'URL must use HTTP or HTTPS' },
);

export const ComparisonSelectionSchema = z
  .array(DetailSlugSchema)
  .min(2)
  .max(5)
  .superRefine((slugs, context) => {
    if (new Set(slugs).size !== slugs.length) {
      context.addIssue({
        code: 'custom',
        message: 'Comparison model slugs must be unique',
      });
    }
  });
export type ComparisonSelection = z.infer<typeof ComparisonSelectionSchema>;

export const ModelHistoryPointSchema = z.object({
  editionDate: z.iso.date(),
  publicationMode: PublicationModeSchema,
  rank: z.int().positive().nullable(),
  overallScore: z.number().min(0).max(100).nullable(),
  rankingStatus: RankingStatusSchema,
});

export const ModelBenchmarkResultSchema = z.object({
  benchmarkSlug: DetailSlugSchema,
  benchmarkName: z.string().min(1),
  benchmarkVersion: z.string().min(1),
  metricSlug: DetailSlugSchema,
  metricName: z.string().min(1),
  value: z.number(),
  unit: z.string().min(1),
  sampleSize: z.int().nonnegative().nullable(),
  qualityFlags: z.array(QualityFlagSchema),
  evidence: z
    .object({
      sourceName: z.string().min(1),
      sourceSnapshotId: z.uuidv7(),
      contentSha256: Sha256Schema,
      requestUrl: HttpUrlSchema,
    })
    .nullable(),
});

export const ModelDetailSchema = z.object({
  slug: DetailSlugSchema,
  displayName: z.string().min(1),
  providerName: z.string().min(1),
  providerUrl: HttpUrlSchema.nullable(),
  familyName: z.string().min(1),
  releaseDate: z.iso.date().nullable(),
  lifecycleStatus: z.string().min(1),
  contextWindowTokens: z.int().positive().nullable(),
  parameterCountMillions: z.int().positive().nullable(),
  isOpenWeights: z.boolean(),
  activeRanking: RankingEntrySchema.nullable(),
  history: z.array(ModelHistoryPointSchema),
  benchmarkResults: z.array(ModelBenchmarkResultSchema),
});
export type ModelDetail = z.infer<typeof ModelDetailSchema>;

export const BenchmarkMetricDetailSchema = z.object({
  slug: DetailSlugSchema,
  displayName: z.string().min(1),
  unit: z.string().min(1),
  higherIsBetter: z.boolean(),
  theoreticalMin: z.number().nullable(),
  theoreticalMax: z.number().nullable(),
});

export const BenchmarkLeaderboardRowSchema = z.object({
  metricSlug: DetailSlugSchema,
  modelSlug: DetailSlugSchema,
  modelName: z.string().min(1),
  providerName: z.string().min(1),
  value: z.number(),
  sampleSize: z.int().nonnegative().nullable(),
  qualityFlags: z.array(QualityFlagSchema),
});

export const BenchmarkDetailSchema = z.object({
  slug: DetailSlugSchema,
  displayName: z.string().min(1),
  description: z.string().nullable(),
  homepageUrl: HttpUrlSchema.nullable(),
  licenseSpdx: z.string().nullable(),
  version: z.string().min(1),
  releasedAt: z.iso.datetime().nullable(),
  methodologyUrl: HttpUrlSchema.nullable(),
  metrics: z.array(BenchmarkMetricDetailSchema),
  leaderboard: z.array(BenchmarkLeaderboardRowSchema),
});
export type BenchmarkDetail = z.infer<typeof BenchmarkDetailSchema>;

export const IngestionRunSummarySchema = z.object({
  sourceSlug: DetailSlugSchema,
  status: z.string().min(1).max(80),
  connectorVersion: z.string().min(1).max(120),
  startedAt: z.iso.datetime(),
  completedAt: z.iso.datetime().nullable(),
  recordsSeen: z.int().nonnegative(),
  recordsAccepted: z.int().nonnegative(),
});

export const SourceRegistryEntrySchema = z.object({
  slug: DetailSlugSchema,
  displayName: z.string().min(1).max(200),
  sourceType: z.string().min(1).max(80),
  baseUrl: HttpUrlSchema.nullable(),
  trustTier: z.string().min(1).max(80),
  licenseSpdx: z.string().min(1).max(120).nullable(),
  termsUrl: HttpUrlSchema.nullable(),
  isEnabled: z.boolean(),
  snapshotCount: z.int().nonnegative(),
  latestFetchedAt: z.iso.datetime().nullable(),
  latestRun: IngestionRunSummarySchema.nullable(),
});
export type SourceRegistryEntry = z.infer<typeof SourceRegistryEntrySchema>;

export const SourceRegistrySchema = z.array(SourceRegistryEntrySchema);

export const PipelineStatusSchema = z.object({
  data: DataStatusSchema,
  sourceCount: z.int().nonnegative(),
  snapshotCount: z.int().nonnegative(),
  ingestionRunCount: z.int().nonnegative(),
  stagedRowCount: z.int().nonnegative(),
  rankingSnapshotCount: z.int().nonnegative(),
  editionCount: z.int().nonnegative(),
  latestRun: IngestionRunSummarySchema.nullable(),
});
export type PipelineStatus = z.infer<typeof PipelineStatusSchema>;
