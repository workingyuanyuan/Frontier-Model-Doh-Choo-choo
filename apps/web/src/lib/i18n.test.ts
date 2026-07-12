import { describe, expect, it } from 'vitest';

import { getDictionary, isLocale, locales } from './i18n';

describe('web locales', () => {
  it('supports exactly Traditional Chinese and English', () => {
    expect(locales).toEqual(['zh-TW', 'en']);
    expect(isLocale('zh-TW')).toBe(true);
    expect(isLocale('en')).toBe(true);
    expect(isLocale('zh-CN')).toBe(false);
  });

  it('provides complete axis labels in both locales', () => {
    expect(Object.keys(getDictionary('zh-TW').dimensions)).toHaveLength(8);
    expect(Object.keys(getDictionary('en').dimensions)).toHaveLength(8);
  });
});
