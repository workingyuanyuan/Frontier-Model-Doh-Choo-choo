import { notFound } from 'next/navigation';

import { getSourceRegistry } from '@llm-bench/db';

import { InfoNavigation } from '../../../components/info-navigation';
import { getWebDatabase } from '../../../lib/database';
import { getInfoCopy } from '../../../lib/info-copy';
import { isLocale } from '../../../lib/i18n';

export const dynamic = 'force-dynamic';
interface SourcesPageProps {
  params: Promise<{ locale: string }>;
}

export default async function SourcesPage({ params }: SourcesPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const copy = getInfoCopy(locale);
  const registry = await getSourceRegistry(getWebDatabase().db);
  const date = (value: string | null) =>
    value
      ? new Intl.DateTimeFormat(locale, {
          dateStyle: 'medium',
          timeStyle: 'short',
          timeZone: 'Asia/Taipei',
        }).format(new Date(value))
      : 'N/A';

  return (
    <main className="detailPage infoPage">
      <InfoNavigation active="sources" copy={copy.nav} locale={locale} />
      <header className="detailHero">
        <p>{copy.sources.eyebrow}</p>
        <h1>{copy.sources.title}</h1>
        <p>{copy.sources.body}</p>
      </header>
      <section className="sourceGrid">
        {registry.map((source) => (
          <article className="sourceCard" key={source.slug}>
            <div className="sourceCardHeader">
              <div>
                <span>{source.sourceType}</span>
                <h2>{source.displayName}</h2>
              </div>
              <strong data-enabled={source.isEnabled}>
                {source.isEnabled
                  ? copy.sources.enabled
                  : copy.sources.disabled}
              </strong>
            </div>
            <dl>
              <div>
                <dt>{copy.sources.trust}</dt>
                <dd>{source.trustTier}</dd>
              </div>
              <div>
                <dt>{copy.sources.license}</dt>
                <dd>{source.licenseSpdx ?? 'N/A'}</dd>
              </div>
              <div>
                <dt>{copy.sources.snapshots}</dt>
                <dd>{source.snapshotCount.toLocaleString(locale)}</dd>
              </div>
              <div>
                <dt>{copy.sources.latestFetch}</dt>
                <dd>{date(source.latestFetchedAt)}</dd>
              </div>
              <div>
                <dt>{copy.sources.latestRun}</dt>
                <dd>
                  {source.latestRun
                    ? `${source.latestRun.status} · ${date(source.latestRun.completedAt)}`
                    : copy.sources.noRun}
                </dd>
              </div>
              <div>
                <dt>{copy.sources.accepted}</dt>
                <dd>
                  {source.latestRun?.recordsAccepted.toLocaleString(locale) ??
                    'N/A'}
                </dd>
              </div>
            </dl>
            {source.baseUrl && (
              <a
                className="detailLink"
                href={source.baseUrl}
                rel="noreferrer"
                target="_blank"
              >
                {source.slug} ↗
              </a>
            )}
          </article>
        ))}
      </section>
    </main>
  );
}
