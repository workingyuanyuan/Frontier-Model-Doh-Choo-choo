import { notFound, redirect } from 'next/navigation';

import { getActiveEdition } from '@llm-bench/db';

import { Dashboard } from '../../components/dashboard';
import { getWebDatabase } from '../../lib/database';
import { resolveHomepageData } from '../../lib/homepage-data';
import { getDictionary, isLocale } from '../../lib/i18n';
import {
  InvalidPresentationQueryError,
  resolveWebTheme,
  type QueryValue,
  validateEditionQuery,
} from '../../lib/presentation-query';

export const dynamic = 'force-dynamic';

interface LocalePageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ edition?: QueryValue; theme?: QueryValue }>;
}

export default async function LocalePage({
  params,
  searchParams,
}: LocalePageProps) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  if (!isLocale(locale)) {
    redirect('/zh-TW');
  }

  const homepage = resolveHomepageData(
    await getActiveEdition(getWebDatabase().db),
  );
  let editionId: string | null;
  let theme;
  try {
    editionId = validateEditionQuery(
      query.edition,
      homepage.edition?.id ?? null,
    );
    theme = resolveWebTheme(query.theme);
  } catch (error) {
    if (error instanceof InvalidPresentationQueryError) notFound();
    throw error;
  }

  return (
    <Dashboard
      dictionary={getDictionary(locale)}
      edition={homepage.edition}
      editionId={editionId}
      initialTheme={theme}
      locale={locale}
      snapshot={homepage.snapshot}
    />
  );
}
