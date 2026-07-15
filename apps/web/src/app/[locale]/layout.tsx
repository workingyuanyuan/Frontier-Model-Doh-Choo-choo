import type { Metadata } from 'next';
import { connection } from 'next/server';
import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';

import { getDictionary, isLocale } from '../../lib/i18n';
import '../globals.css';

interface LocaleLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: LocaleLayoutProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return {};
  }

  const { meta } = getDictionary(locale);
  return { title: meta.title, description: meta.description };
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  await connection();
  const { locale } = await params;
  if (!isLocale(locale)) {
    redirect('/zh-TW');
  }

  return (
    <html lang={locale}>
      <body>{children}</body>
    </html>
  );
}
