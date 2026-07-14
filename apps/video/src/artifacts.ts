import { createHash } from 'node:crypto';

import {
  DIMENSION_IDS,
  PublicationModeSchema,
  Sha256Schema,
  type PublicationMode,
  type RankingEntry,
} from '@llm-bench/contracts';
import * as z from 'zod';

import { validateVideoProps, type LlmBenchVideoProps } from './props';
import {
  VIDEO_DURATION_IN_FRAMES,
  VIDEO_FPS,
  VIDEO_HEIGHT,
  VIDEO_WIDTH,
} from './timeline';

const COMPOSITION_ID = 'LlmBenchWeekly';

export interface VideoArtifactManifest {
  readonly schemaVersion: 2;
  readonly compositionId: typeof COMPOSITION_ID;
  readonly weeklyEditionId: string | null;
  readonly publicationMode: PublicationMode;
  readonly snapshotId: string;
  readonly snapshotSha256: string;
  readonly inputPropsSha256: string;
  readonly editionDate: string;
  readonly dataCutoffAt: string;
  readonly scoringMethodVersion: string;
  readonly sourceSnapshotIds: readonly string[];
  readonly locale: LlmBenchVideoProps['locale'];
  readonly theme: LlmBenchVideoProps['theme'];
  readonly selectedModelId: string;
  readonly topN: number;
  readonly isPreview: boolean;
  readonly width: number;
  readonly height: number;
  readonly fps: number;
  readonly durationInFrames: number;
}

export interface VideoArtifactContext {
  readonly weeklyEditionId: string;
  readonly publicationMode: PublicationMode;
  readonly snapshotContentSha256: string;
  readonly topN: number;
}

export interface VideoArtifactBundle {
  readonly manifest: VideoArtifactManifest;
  readonly rankingCsv: string;
}

function csvCell(value: string | number | null): string {
  if (value === null) return '';
  const text = String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function rankingRow(entry: RankingEntry): string {
  const dimensionScores = Object.fromEntries(
    entry.dimensions.map(({ dimension, score }) => [dimension, score]),
  );
  const values = [
    entry.rank,
    entry.displayName,
    entry.providerName,
    entry.overallScore,
    entry.overallCoverage,
    entry.overallConfidence,
    ...DIMENSION_IDS.map((dimension) => dimensionScores[dimension] ?? null),
    entry.rankingStatus,
  ];
  return values.map(csvCell).join(',');
}

export function createVideoArtifactBundle(
  input: LlmBenchVideoProps,
  context?: VideoArtifactContext,
): VideoArtifactBundle {
  const props = validateVideoProps(input);
  const inputPropsSha256 = createHash('sha256')
    .update(JSON.stringify(props))
    .digest('hex');
  const normalizedContext = context
    ? {
        weeklyEditionId: z.uuidv7().parse(context.weeklyEditionId),
        publicationMode: PublicationModeSchema.parse(context.publicationMode),
        snapshotContentSha256: Sha256Schema.parse(
          context.snapshotContentSha256,
        ),
        topN: z.int().min(1).max(5).parse(context.topN),
      }
    : null;
  if (
    normalizedContext &&
    (normalizedContext.publicationMode !== props.publicationMode ||
      normalizedContext.snapshotContentSha256 !== props.snapshotContentSha256)
  ) {
    throw new Error('Video artifact context does not match validated props');
  }
  const selected = props.snapshot.entries[props.selectedModelIndex];
  if (!selected) throw new Error('Selected model is missing from the snapshot');

  const manifest: VideoArtifactManifest = {
    schemaVersion: 2,
    compositionId: COMPOSITION_ID,
    weeklyEditionId: normalizedContext?.weeklyEditionId ?? null,
    publicationMode: props.publicationMode,
    snapshotId: props.snapshot.id,
    snapshotSha256:
      normalizedContext?.snapshotContentSha256 ?? props.snapshotContentSha256,
    inputPropsSha256,
    editionDate: props.snapshot.editionDate,
    dataCutoffAt: props.snapshot.dataCutoffAt,
    scoringMethodVersion: props.snapshot.scoringMethodVersion,
    sourceSnapshotIds: props.snapshot.sourceSnapshotIds,
    locale: props.locale,
    theme: props.theme,
    selectedModelId: selected.modelVariantId,
    topN: normalizedContext?.topN ?? props.snapshot.entries.length,
    isPreview: props.publicationMode === 'PREVIEW',
    width: VIDEO_WIDTH,
    height: VIDEO_HEIGHT,
    fps: VIDEO_FPS,
    durationInFrames: VIDEO_DURATION_IN_FRAMES,
  };

  const header = [
    'rank',
    'model',
    'provider',
    'overall_score',
    'coverage',
    'confidence',
    ...DIMENSION_IDS,
    'status',
  ].join(',');
  const rankingCsv = [header, ...props.snapshot.entries.map(rankingRow)].join(
    '\r\n',
  );

  return { manifest, rankingCsv: `${rankingCsv}\r\n` };
}
