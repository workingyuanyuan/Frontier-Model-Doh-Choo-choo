import {
  createDatabase,
  modelFamilies,
  models,
  modelVariants,
  providers,
  rankingEntries,
  rankingSnapshots,
  scoringMethodSeed,
  scoringMethodVersions,
  weeklyEditions,
} from '@llm-bench/db';
import { eq } from 'drizzle-orm';

import { E2E_EDITION_ID, E2E_SNAPSHOT_ID } from './fixture';

const providerId = '019f7000-0000-7000-8000-000000000001';
const familyId = '019f7000-0000-7000-8000-000000000002';
const modelIds = [
  '019f7000-0000-7000-8000-000000000010',
  '019f7000-0000-7000-8000-000000000011',
  '019f7000-0000-7000-8000-000000000012',
] as const;
const variantIds = [
  '019f7000-0000-7000-8000-000000000020',
  '019f7000-0000-7000-8000-000000000021',
  '019f7000-0000-7000-8000-000000000022',
] as const;
const variants = [
  { slug: 'e2e-alpha', displayName: 'E2E Alpha', score: 82.5 },
  { slug: 'e2e-beta', displayName: 'E2E Beta', score: 74.25 },
  { slug: 'e2e-gamma', displayName: 'E2E Gamma', score: 66.75 },
] as const;
const dimensionIds = [
  'reasoning',
  'math',
  'knowledge',
  'language',
  'instruction',
  'coding',
  'agentic',
  'context',
] as const;

if (process.env.E2E_FIXTURE !== '1') {
  throw new Error('Refusing to write E2E data unless E2E_FIXTURE=1');
}

async function seedE2eFixture(): Promise<void> {
  const { db, pool } = createDatabase();
  try {
    await db.transaction(async (transaction) => {
      const active = await transaction
        .select({ id: weeklyEditions.id })
        .from(weeklyEditions)
        .where(eq(weeklyEditions.isActive, true));
      if (active.some(({ id }) => id !== E2E_EDITION_ID)) {
        throw new Error('Refusing to replace a non-E2E active edition');
      }

      await transaction
        .insert(providers)
        .values({
          id: providerId,
          slug: 'e2e-provider',
          displayName: 'E2E Provider',
          websiteUrl: 'https://example.com/e2e-provider',
        })
        .onConflictDoNothing();
      await transaction
        .insert(modelFamilies)
        .values({
          id: familyId,
          providerId,
          slug: 'e2e-family',
          displayName: 'E2E Family',
        })
        .onConflictDoNothing();
      await transaction
        .insert(models)
        .values(
          variants.map((variant, index) => ({
            id: modelIds[index],
            familyId,
            slug: `${variant.slug}-model`,
            displayName: `${variant.displayName} Model`,
            modality: { input: ['text'], output: ['text'] },
          })),
        )
        .onConflictDoNothing();
      await transaction
        .insert(modelVariants)
        .values(
          variants.map((variant, index) => ({
            id: variantIds[index],
            modelId: modelIds[index],
            slug: variant.slug,
            displayName: variant.displayName,
            releaseDate: '2026-07-01',
            contextWindowTokens: 131_072,
            isOpenWeights: index === 2,
          })),
        )
        .onConflictDoNothing();

      const [method] = await transaction
        .select({ id: scoringMethodVersions.id })
        .from(scoringMethodVersions)
        .where(eq(scoringMethodVersions.version, scoringMethodSeed.version))
        .limit(1);
      if (!method) throw new Error('Run db:seed before the E2E fixture');

      await transaction
        .insert(rankingSnapshots)
        .values({
          id: E2E_SNAPSHOT_ID,
          editionDate: '2026-07-13',
          dataCutoffAt: new Date('2026-07-13T00:00:00.000Z'),
          scoringMethodVersionId: method.id,
          sourceSnapshotIds: ['019f7000-0000-7000-8000-000000000050'],
          entryCount: variants.length,
          contentSha256:
            'e2e0000000000000000000000000000000000000000000000000000000000000',
        })
        .onConflictDoNothing();
      for (const [index, variant] of variants.entries()) {
        const entry = {
          rankingSnapshotId: E2E_SNAPSHOT_ID,
          modelVariantId: variantIds[index],
          rank: index + 1,
          overallScore: String(variant.score),
          overallCoverage: String(0.8 - index * 0.05),
          overallConfidence: String(90 - index * 5),
          rankingStatus: 'VERIFIED',
          dimensions: dimensionIds.map((dimension, dimensionIndex) => ({
            dimension,
            score: Math.max(0, variant.score - dimensionIndex * 2),
            coverage: 0.75,
            confidence: 85,
            status: 'FORMAL',
          })),
          qualityFlags: [],
        };
        await transaction
          .insert(rankingEntries)
          .values(entry)
          .onConflictDoUpdate({
            target: [
              rankingEntries.rankingSnapshotId,
              rankingEntries.modelVariantId,
            ],
            set: entry,
          });
      }
      const edition = {
        id: E2E_EDITION_ID,
        editionDate: '2026-07-13',
        rankingSnapshotId: E2E_SNAPSHOT_ID,
        status: 'ACTIVE',
        publicationMode: 'PREVIEW',
        isActive: true,
        titleZhTw: '2026-07-13 E2E 基準週報（預覽）',
        titleEn: '2026-07-13 E2E benchmark weekly (Preview)',
        publishedAt: null,
        activatedAt: new Date('2026-07-14T00:00:00.000Z'),
      };
      await transaction
        .insert(weeklyEditions)
        .values(edition)
        .onConflictDoUpdate({
          target: weeklyEditions.id,
          set: edition,
        });
    });
    console.info(`E2E fixture ready: ${E2E_EDITION_ID}`);
  } finally {
    await pool.end();
  }
}

seedE2eFixture().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
