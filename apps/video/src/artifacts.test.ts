import { previewSnapshot } from '@llm-bench/presentation';
import { describe, expect, it } from 'vitest';

import { createVideoArtifactBundle } from './artifacts';

describe('video artifact bundle', () => {
  it('is deterministic for the same immutable snapshot and render inputs', () => {
    const input = {
      snapshot: previewSnapshot,
      locale: 'zh-TW' as const,
      theme: 'editorial' as const,
      selectedModelIndex: 0,
    };

    const first = createVideoArtifactBundle(input);
    const second = createVideoArtifactBundle(input);

    expect(second).toEqual(first);
    expect(first.manifest).toMatchObject({
      compositionId: 'LlmBenchWeekly',
      snapshotId: previewSnapshot.id,
      editionDate: previewSnapshot.editionDate,
      isPreview: true,
      width: 1920,
      height: 1080,
      fps: 30,
      durationInFrames: 600,
    });
    expect(first.manifest.snapshotSha256).toMatch(/^[a-f0-9]{64}$/);
  });

  it('exports the ranking and all eight dimensions as RFC 4180 CSV', () => {
    const bundle = createVideoArtifactBundle({
      snapshot: previewSnapshot,
      locale: 'en',
      theme: 'studio',
      selectedModelIndex: 1,
    });

    const lines = bundle.rankingCsv.trimEnd().split('\r\n');
    expect(lines).toHaveLength(previewSnapshot.entries.length + 1);
    expect(lines[0]).toBe(
      'rank,model,provider,overall_score,coverage,confidence,reasoning,math,knowledge,language,instruction,coding,agentic,context,status',
    );
    expect(lines[1]).toContain('Orion 3.2 Reasoner');
  });
});
