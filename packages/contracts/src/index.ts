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
