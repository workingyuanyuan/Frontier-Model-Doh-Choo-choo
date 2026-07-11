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
