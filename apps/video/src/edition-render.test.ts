import { describe, expect, it } from 'vitest';

import { previewSnapshot } from '@llm-bench/presentation';

import {
  createEditionRenderPlan,
  parseEditionRenderArguments,
} from './edition-render';

const editionId = '019f5f51-505b-74de-bcef-c92c8d9fe66a';
const snapshotId = '019f5f2d-c3df-7c54-96e8-e1939d332c8e';

const edition = {
  id: editionId,
  publicationMode: 'PREVIEW' as const,
  titleZhTw: '預覽週報',
  titleEn: 'Preview weekly',
  summaryZhTw: null,
  summaryEn: null,
  activatedAt: '2026-07-14T00:00:00.000Z',
  snapshotSha256:
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  snapshot: { ...previewSnapshot, id: snapshotId },
};

describe('edition video render input', () => {
  it('parses one immutable selector and bounded render options', () => {
    expect(
      parseEditionRenderArguments([
        '--',
        '--edition',
        editionId,
        '--locale',
        'en',
        '--theme',
        'studio',
        '--top',
        '2',
        '--model',
        previewSnapshot.entries[1]!.slug,
        '--media',
        'video',
      ]),
    ).toEqual({
      selector: { editionId },
      locale: 'en',
      theme: 'studio',
      topN: 2,
      selectedModelSlug: previewSnapshot.entries[1]!.slug,
      media: 'video',
    });
  });

  it('defaults to a Traditional Chinese editorial poster', () => {
    expect(parseEditionRenderArguments(['--snapshot', snapshotId])).toEqual({
      selector: { snapshotId },
      locale: 'zh-TW',
      theme: 'editorial',
      topN: 5,
      selectedModelSlug: undefined,
      media: 'poster',
    });
  });

  it.each([
    ['no selector', []],
    ['two selectors', ['--edition', editionId, '--snapshot', snapshotId]],
    ['invalid UUID', ['--edition', 'latest']],
    ['unsupported locale', ['--edition', editionId, '--locale', 'fr']],
    ['unsupported theme', ['--edition', editionId, '--theme', 'dark']],
    ['excessive Top-N', ['--edition', editionId, '--top', '6']],
    ['unknown argument', ['--edition', editionId, '--publish']],
  ])('rejects %s', (_name, arguments_) => {
    expect(() => parseEditionRenderArguments(arguments_)).toThrow();
  });
});

describe('edition video render plan', () => {
  it('projects the immutable snapshot to Top-N and selects by canonical slug', () => {
    const selected = previewSnapshot.entries[1]!;
    const plan = createEditionRenderPlan(edition, {
      selector: { editionId },
      locale: 'en',
      theme: 'studio',
      topN: 2,
      selectedModelSlug: selected.slug,
      media: 'poster',
    });

    expect(plan.props.snapshot.entries).toHaveLength(2);
    expect(plan.props.snapshot.id).toBe(snapshotId);
    expect(plan.props.selectedModelIndex).toBe(1);
    expect(plan.props.publicationMode).toBe('PREVIEW');
    expect(plan.props.snapshotContentSha256).toBe(edition.snapshotSha256);
    expect(plan.themePresetSlug).toBe('studio-light');
    expect(plan.snapshotContentSha256).toBe(edition.snapshotSha256);
  });

  it('rejects an edition/snapshot mismatch and selection outside Top-N', () => {
    expect(() =>
      createEditionRenderPlan(edition, {
        selector: {
          snapshotId: '019f513f-132a-7dc0-805d-0b036ea0d499',
        },
        locale: 'zh-TW',
        theme: 'editorial',
        topN: 2,
        selectedModelSlug: undefined,
        media: 'poster',
      }),
    ).toThrow('snapshot');

    expect(() =>
      createEditionRenderPlan(edition, {
        selector: { editionId },
        locale: 'zh-TW',
        theme: 'editorial',
        topN: 1,
        selectedModelSlug: previewSnapshot.entries[1]!.slug,
        media: 'poster',
      }),
    ).toThrow('Top-N');
  });
});
