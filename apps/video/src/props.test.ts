import { describe, expect, it } from 'vitest';

import { previewSnapshot } from '@llm-bench/presentation';

import { validateVideoProps } from './props';

const validProps = {
  snapshot: previewSnapshot,
  locale: 'zh-TW' as const,
  theme: 'editorial' as const,
  publicationMode: 'PREVIEW' as const,
  snapshotContentSha256:
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  selectedModelIndex: 0,
};

describe('video input props', () => {
  it('accepts the shared validated preview snapshot', () => {
    expect(validateVideoProps(validProps)).toEqual(validProps);
  });

  it.each([
    ['locale', { ...validProps, locale: 'fr' }],
    ['theme', { ...validProps, theme: 'dark' }],
    ['publication mode', { ...validProps, publicationMode: 'DRAFT' }],
    [
      'snapshot content hash',
      { ...validProps, snapshotContentSha256: 'not-a-sha' },
    ],
    ['model index', { ...validProps, selectedModelIndex: 99 }],
    [
      'snapshot',
      { ...validProps, snapshot: { ...previewSnapshot, entries: [] } },
    ],
  ])('rejects an invalid %s', (_name, value) => {
    expect(() => validateVideoProps(value)).toThrow();
  });
});
