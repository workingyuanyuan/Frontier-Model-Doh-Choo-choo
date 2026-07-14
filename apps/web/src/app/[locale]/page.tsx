import { redirect } from 'next/navigation';

import { getActiveEdition } from '@llm-bench/db';

import { Dashboard } from '../../components/dashboard';
import { getWebDatabase } from '../../lib/database';
import { resolveHomepageData } from '../../lib/homepage-data';
import { getDictionary, isLocale } from '../../lib/i18n';

export const dynamic = 'force-dynamic';

interface LocalePageProps {
  params: Promise<{ locale: string }>;
}

export default async function LocalePage({ params }: LocalePageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    redirect('/zh-TW');
  }

  const homepage = resolveHomepageData(
    await getActiveEdition(getWebDatabase().db),
  );

  return (
    <Dashboard
      dictionary={getDictionary(locale)}
      edition={homepage.edition}
      locale={locale}
      snapshot={homepage.snapshot}
    />
  );
}
