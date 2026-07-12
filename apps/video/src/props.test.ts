import { describe, expect, it } from 'vitest';

import { previewSnapshot } from '@llm-bench/presentation';

import { validateVideoProps } from './props';

const validProps = {
  snapshot: previewSnapshot,
  locale: 'zh-TW' as const,
  theme: 'editorial' as const,
  selectedModelIndex: 0,
};

describe('video input props', () => {
  it('accepts the shared validated preview snapshot', () => {
    expect(validateVideoProps(validProps)).toEqual(validProps);
  });

  it.each([
    ['locale', { ...validProps, locale: 'fr' }],
    ['theme', { ...validProps, theme: 'dark' }],
    ['model index', { ...validProps, selectedModelIndex: 99 }],
    [
      'snapshot',
      { ...validProps, snapshot: { ...previewSnapshot, entries: [] } },
    ],
  ])('rejects an invalid %s', (_name, value) => {
    expect(() => validateVideoProps(value)).toThrow();
  });
});
