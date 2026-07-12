import { createHash } from 'node:crypto';

import { DIMENSION_IDS, type RankingEntry } from '@llm-bench/contracts';

import { validateVideoProps, type LlmBenchVideoProps } from './props';
import {
  VIDEO_DURATION_IN_FRAMES,
  VIDEO_FPS,
  VIDEO_HEIGHT,
  VIDEO_WIDTH,
} from './timeline';

const COMPOSITION_ID = 'LlmBenchWeekly';

export interface VideoArtifactManifest {
  readonly schemaVersion: 1;
  readonly compositionId: typeof COMPOSITION_ID;
  readonly snapshotId: string;
  readonly snapshotSha256: string;
  readonly editionDate: string;
  readonly dataCutoffAt: string;
  readonly scoringMethodVersion: string;
  readonly sourceSnapshotIds: readonly string[];
  readonly locale: LlmBenchVideoProps['locale'];
  readonly theme: LlmBenchVideoProps['theme'];
  readonly selectedModelId: string;
  readonly isPreview: boolean;
  readonly width: number;
  readonly height: number;
  readonly fps: number;
  readonly durationInFrames: number;
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
): VideoArtifactBundle {
  const props = validateVideoProps(input);
  const serializedSnapshot = JSON.stringify(props.snapshot);
  const selected = props.snapshot.entries[props.selectedModelIndex];
  if (!selected) throw new Error('Selected model is missing from the snapshot');

  const manifest: VideoArtifactManifest = {
    schemaVersion: 1,
    compositionId: COMPOSITION_ID,
    snapshotId: props.snapshot.id,
    snapshotSha256: createHash('sha256')
      .update(serializedSnapshot)
      .digest('hex'),
    editionDate: props.snapshot.editionDate,
    dataCutoffAt: props.snapshot.dataCutoffAt,
    scoringMethodVersion: props.snapshot.scoringMethodVersion,
    sourceSnapshotIds: props.snapshot.sourceSnapshotIds,
    locale: props.locale,
    theme: props.theme,
    selectedModelId: selected.modelVariantId,
    isPreview: props.snapshot.scoringMethodVersion.startsWith('preview-'),
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
