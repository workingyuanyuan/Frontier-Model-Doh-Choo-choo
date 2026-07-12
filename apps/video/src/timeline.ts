export const VIDEO_FPS = 30;
export const VIDEO_DURATION_IN_FRAMES = 600;
export const VIDEO_WIDTH = 1920;
export const VIDEO_HEIGHT = 1080;

export type SceneId = 'intro' | 'profile' | 'ranking' | 'evidence';

export interface SceneRange {
  readonly id: SceneId;
  readonly from: number;
  readonly to: number;
}

export const scenes: readonly SceneRange[] = [
  { id: 'intro', from: 0, to: 104 },
  { id: 'profile', from: 90, to: 359 },
  { id: 'ranking', from: 330, to: 489 },
  { id: 'evidence', from: 465, to: 599 },
];

export function getActiveScenes(frame: number): SceneId[] {
  if (!Number.isInteger(frame)) {
    throw new Error('Video frame must be an integer');
  }

  return scenes
    .filter(({ from, to }) => frame >= from && frame <= to)
    .map(({ id }) => id);
}
