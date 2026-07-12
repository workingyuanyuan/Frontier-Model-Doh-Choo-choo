import { describe, expect, it } from 'vitest';

import {
  VIDEO_DURATION_IN_FRAMES,
  VIDEO_FPS,
  getActiveScenes,
  scenes,
} from './timeline';

describe('weekly video timeline', () => {
  it('is a deterministic 20-second 30fps composition', () => {
    expect(VIDEO_FPS).toBe(30);
    expect(VIDEO_DURATION_IN_FRAMES).toBe(600);
  });

  it('covers the entire composition without a blank frame', () => {
    for (let frame = 0; frame < VIDEO_DURATION_IN_FRAMES; frame += 1) {
      expect(getActiveScenes(frame).length).toBeGreaterThan(0);
    }
  });

  it('uses deliberate overlap only at scene transitions', () => {
    expect(getActiveScenes(0)).toEqual(['intro']);
    expect(getActiveScenes(95)).toEqual(['intro', 'profile']);
    expect(getActiveScenes(200)).toEqual(['profile']);
    expect(getActiveScenes(340)).toEqual(['profile', 'ranking']);
    expect(getActiveScenes(470)).toEqual(['ranking', 'evidence']);
    expect(getActiveScenes(590)).toEqual(['evidence']);
    const finalScene = scenes.at(-1);
    expect(finalScene).toBeDefined();
    expect(finalScene!.to + 1).toBe(VIDEO_DURATION_IN_FRAMES);
  });
});
