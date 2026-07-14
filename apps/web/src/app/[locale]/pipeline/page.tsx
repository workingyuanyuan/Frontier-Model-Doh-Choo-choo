import { notFound } from 'next/navigation';

import { getPipelineStatus } from '@llm-bench/db';

import { InfoNavigation } from '../../../components/info-navigation';
import { getWebDatabase } from '../../../lib/database';
import { getInfoCopy } from '../../../lib/info-copy';
import { isLocale } from '../../../lib/i18n';

export const dynamic = 'force-dynamic';
interface PipelinePageProps {
  params: Promise<{ locale: string }>;
}

export default async function PipelinePage({ params }: PipelinePageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const copy = getInfoCopy(locale);
  const status = await getPipelineStatus(getWebDatabase().db);
  const metrics = [
    [copy.pipeline.sources, status.sourceCount],
    [copy.pipeline.snapshots, status.snapshotCount],
    [copy.pipeline.runs, status.ingestionRunCount],
    [copy.pipeline.staged, status.stagedRowCount],
    [copy.pipeline.published, status.data.publishedResultCount],
    [copy.pipeline.rankings, status.rankingSnapshotCount],
    [copy.pipeline.editions, status.editionCount],
  ] as const;

  return (
    <main className="detailPage infoPage">
      <InfoNavigation active="pipeline" copy={copy.nav} locale={locale} />
      <header className="detailHero">
        <p>{copy.pipeline.eyebrow}</p>
        <h1>{copy.pipeline.title}</h1>
        <p>{copy.pipeline.body}</p>
      </header>
      <section className="pipelineMetrics" aria-label={copy.pipeline.title}>
        {metrics.map(([label, value]) => (
          <article key={label}>
            <span>{label}</span>
            <strong>{value.toLocaleString(locale)}</strong>
          </article>
        ))}
      </section>
      <section className="detailSection pipelineState">
        <h2>{copy.pipeline.active}</h2>
        {status.data.activeEdition ? (
          <dl>
            <div>
              <dt>Edition</dt>
              <dd>{status.data.activeEdition.editionDate}</dd>
            </div>
            <div>
              <dt>Mode</dt>
              <dd>{status.data.activeEdition.publicationMode}</dd>
            </div>
            <div>
              <dt>Models</dt>
              <dd>{status.data.activeEdition.entryCount}</dd>
            </div>
            <div>
              <dt>Snapshot</dt>
              <dd>
                <code>{status.data.activeEdition.snapshotId}</code>
              </dd>
            </div>
          </dl>
        ) : (
          <p>{copy.pipeline.noActive}</p>
        )}
      </section>
      <section className="detailSection pipelineState">
        <h2>{copy.pipeline.latestRun}</h2>
        {status.latestRun ? (
          <dl>
            <div>
              <dt>Source</dt>
              <dd>{status.latestRun.sourceSlug}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{status.latestRun.status}</dd>
            </div>
            <div>
              <dt>Connector</dt>
              <dd>{status.latestRun.connectorVersion}</dd>
            </div>
            <div>
              <dt>{copy.pipeline.seenAccepted}</dt>
              <dd>
                {status.latestRun.recordsSeen.toLocaleString(locale)} /{' '}
                {status.latestRun.recordsAccepted.toLocaleString(locale)}
              </dd>
            </div>
          </dl>
        ) : (
          <p>N/A</p>
        )}
      </section>
    </main>
  );
}
