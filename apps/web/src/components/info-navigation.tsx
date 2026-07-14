import Link from 'next/link';

import type { InfoCopy } from '../lib/info-copy';
import type { Locale } from '../lib/i18n';

interface InfoNavigationProps {
  active: 'methodology' | 'sources' | 'pipeline';
  copy: InfoCopy['nav'];
  locale: Locale;
}

export function InfoNavigation({ active, copy, locale }: InfoNavigationProps) {
  const otherLocale = locale === 'zh-TW' ? 'en' : 'zh-TW';
  return (
    <nav className="infoNav" aria-label="Information pages">
      <Link href={`/${locale}`}>{copy.home}</Link>
      <Link
        aria-current={active === 'methodology' ? 'page' : undefined}
        href={`/${locale}/methodology`}
      >
        {copy.methodology}
      </Link>
      <Link
        aria-current={active === 'sources' ? 'page' : undefined}
        href={`/${locale}/sources`}
      >
        {copy.sources}
      </Link>
      <Link
        aria-current={active === 'pipeline' ? 'page' : undefined}
        href={`/${locale}/pipeline`}
      >
        {copy.pipeline}
      </Link>
      <Link className="infoLanguage" href={`/${otherLocale}/${active}`}>
        {locale === 'zh-TW' ? 'English' : '繁體中文'}
      </Link>
    </nav>
  );
}
