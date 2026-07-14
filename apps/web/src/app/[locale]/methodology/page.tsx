import { notFound } from 'next/navigation';

import { InfoNavigation } from '../../../components/info-navigation';
import { getInfoCopy } from '../../../lib/info-copy';
import { isLocale } from '../../../lib/i18n';

interface MethodologyPageProps {
  params: Promise<{ locale: string }>;
}

export default async function MethodologyPage({
  params,
}: MethodologyPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const copy = getInfoCopy(locale);

  return (
    <main className="detailPage infoPage">
      <InfoNavigation active="methodology" copy={copy.nav} locale={locale} />
      <header className="detailHero">
        <p>{copy.methodology.eyebrow}</p>
        <h1>{copy.methodology.title}</h1>
        <p>{copy.methodology.body}</p>
      </header>
      <section className="infoGrid">
        {copy.methodology.principles.map(([title, body]) => (
          <article className="infoCard" key={title}>
            <h2>{title}</h2>
            <p>{body}</p>
          </article>
        ))}
      </section>
      <section className="detailSection methodFlow">
        <h2>{copy.methodology.flowTitle}</h2>
        <ol>
          {copy.methodology.flow.map((step, index) => (
            <li key={step}>
              <span>{index + 1}</span>
              <strong>{step}</strong>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
