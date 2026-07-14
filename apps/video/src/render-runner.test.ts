import { describe, expect, it } from 'vitest';

import {
  createRemotionInvocation,
  createRenderOutputLayout,
  createVideoRenderLog,
} from './render-runner';

const context = {
  weeklyEditionId: '019f5f51-505b-74de-bcef-c92c8d9fe66a',
  snapshotId: '019f5f2d-c3df-7c54-96e8-e1939d332c8e',
  snapshotSha256:
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  editionDate: '2026-07-13',
  publicationMode: 'FORMAL' as const,
  locale: 'en' as const,
  theme: 'studio' as const,
  topN: 5,
  selectedModelSlug: 'model-a',
  media: 'poster' as const,
};

describe('edition render runner contracts', () => {
  it('creates collision-resistant edition-bound artifact paths', () => {
    const layout = createRenderOutputLayout('N:/project/output', context);

    expect(layout.directory.replaceAll('\\', '/')).toContain(
      '/2026-07-13/019f5f2d-c3df-7c54-96e8-e1939d332c8e/en-studio-top5-model-model-a-poster',
    );
    expect(layout.outputPath).toMatch(/\.png$/);
    expect(layout.propsPath).toMatch(/\.props\.json$/);
    expect(layout.renderLogPath).toMatch(/\.render-log\.json$/);
  });

  it('passes a JSON props file through a shell-free Remotion invocation', () => {
    const invocation = createRemotionInvocation({
      nodePath: 'C:/node.exe',
      pnpmCliPath: 'C:/pnpm.cjs',
      packageDirectory: 'N:/project/apps/video',
      media: 'video',
      propsPath: 'N:/project/output/input props.json',
      outputPath: 'N:/project/output/result.mp4',
    });

    expect(invocation.command).toBe('C:/node.exe');
    expect(invocation.options).toMatchObject({
      cwd: 'N:/project/apps/video',
      shell: false,
    });
    expect(invocation.arguments).toContain(
      '--props=N:/project/output/input props.json',
    );
    expect(invocation.arguments).toContain('render');
  });

  it('validates structured success and bounded failure logs', () => {
    const success = createVideoRenderLog({
      ...context,
      jobId: '019f513f-132a-7dc0-805d-0b036ea0d477',
      status: 'SUCCEEDED',
      startedAt: '2026-07-14T01:00:00.000Z',
      completedAt: '2026-07-14T01:01:00.000Z',
      outputPath: 'output/poster.png',
      outputSha256:
        'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
      metadataPath: 'output/metadata.json',
      rankingCsvPath: 'output/ranking.csv',
    });
    expect(success.status).toBe('SUCCEEDED');

    const failed = createVideoRenderLog({
      ...context,
      jobId: null,
      status: 'FAILED',
      startedAt: '2026-07-14T01:00:00.000Z',
      completedAt: '2026-07-14T01:01:00.000Z',
      errorSummary: 'x'.repeat(3_000),
      metadataPath: 'output/metadata.json',
      rankingCsvPath: 'output/ranking.csv',
    });
    expect(failed.status).toBe('FAILED');
    if (failed.status !== 'FAILED')
      throw new Error('Expected failed render log');
    expect(failed.errorSummary).toHaveLength(2_000);
  });
});
