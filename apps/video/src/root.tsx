import {
  previewSnapshot,
  previewSnapshotContentSha256,
} from '@llm-bench/presentation';
import { Composition } from 'remotion';

import { LlmBenchWeeklyVideo } from './composition';
import type { LlmBenchVideoProps } from './props';
import {
  VIDEO_DURATION_IN_FRAMES,
  VIDEO_FPS,
  VIDEO_HEIGHT,
  VIDEO_WIDTH,
} from './timeline';

const defaultProps: LlmBenchVideoProps = {
  snapshot: previewSnapshot,
  locale: 'zh-TW',
  theme: 'editorial',
  publicationMode: 'PREVIEW',
  snapshotContentSha256: previewSnapshotContentSha256,
  selectedModelIndex: 0,
};

export const RemotionRoot = () => (
  <Composition
    id="LlmBenchWeekly"
    component={LlmBenchWeeklyVideo}
    durationInFrames={VIDEO_DURATION_IN_FRAMES}
    fps={VIDEO_FPS}
    width={VIDEO_WIDTH}
    height={VIDEO_HEIGHT}
    defaultProps={defaultProps}
  />
);
