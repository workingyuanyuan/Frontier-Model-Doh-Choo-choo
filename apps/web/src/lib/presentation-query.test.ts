import { describe, expect, it } from 'vitest';

import {
  buildPresentationQuery,
  InvalidPresentationQueryError,
  resolveWebTheme,
  validateEditionQuery,
} from './presentation-query';

const editionId = '019f513f-132a-7dc0-805d-0b036ea0d505';

describe('presentation query', () => {
  it('defaults to editorial and accepts the two shared light themes', () => {
    expect(resolveWebTheme(undefined)).toBe('editorial');
    expect(resolveWebTheme('editorial')).toBe('editorial');
    expect(resolveWebTheme('studio')).toBe('studio');
  });

  it.each([['dark'], [['studio', 'editorial']]])(
    'rejects an invalid or repeated theme',
    (theme) => {
      expect(() => resolveWebTheme(theme)).toThrow(
        InvalidPresentationQueryError,
      );
    },
  );

  it('accepts only the currently active edition', () => {
    expect(validateEditionQuery(undefined, editionId)).toBe(editionId);
    expect(validateEditionQuery(editionId, editionId)).toBe(editionId);
    expect(() => validateEditionQuery('unknown', editionId)).toThrow(
      InvalidPresentationQueryError,
    );
    expect(() => validateEditionQuery(editionId, null)).toThrow(
      InvalidPresentationQueryError,
    );
  });

  it('serializes edition, theme, and ordered comparison models', () => {
    expect(
      buildPresentationQuery({
        editionId,
        theme: 'studio',
        models: ['alpha', 'beta'],
      }),
    ).toBe(`edition=${editionId}&theme=studio&models=alpha&models=beta`);
  });
});
