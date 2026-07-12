import { redirect } from 'next/navigation';

import { Dashboard } from '../../components/dashboard';
import { getDictionary, isLocale } from '../../lib/i18n';
import { previewSnapshot } from '../../lib/preview';

interface LocalePageProps {
  params: Promise<{ locale: string }>;
}

export default async function LocalePage({ params }: LocalePageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    redirect('/zh-TW');
  }

  return (
    <Dashboard
      dictionary={getDictionary(locale)}
      locale={locale}
      snapshot={previewSnapshot}
    />
  );
}
