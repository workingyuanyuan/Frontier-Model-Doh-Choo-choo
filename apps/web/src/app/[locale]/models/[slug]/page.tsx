import Link from 'next/link';
import { notFound } from 'next/navigation';

import { DetailSlugSchema } from '@llm-bench/contracts';
import { getModelDetailBySlug } from '@llm-bench/db';

import { getWebDatabase } from '../../../../lib/database';
import { getDetailCopy } from '../../../../lib/detail-copy';
import { isLocale } from '../../../../lib/i18n';

export const dynamic = 'force-dynamic';

interface ModelPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

const valueOrNA = (value: number | null): string =>
  value === null ? 'N/A' : (Math.round(value * 10) / 10).toString();

export default async function ModelPage({ params }: ModelPageProps) {
  const { locale, slug } = await params;
  if (!isLocale(locale) || !DetailSlugSchema.safeParse(slug).success) {
    notFound();
  }
  const model = await getModelDetailBySlug(getWebDatabase().db, slug);
  if (!model) notFound();
  const text = getDetailCopy(locale);

  return (
    <main className="detailPage">
      <Link className="detailBack" href={`/${locale}`}>
        ← {text.back}
      </Link>
      <header className="detailHero">
        <p>{text.modelProfile}</p>
        <h1>{model.displayName}</h1>
        <span>{model.providerName}</span>
      </header>

      <dl className="detailFacts">
        <div>
          <dt>{text.provider}</dt>
          <dd>
            {model.providerUrl ? (
              <a href={model.providerUrl} rel="noreferrer" target="_blank">
                {model.providerName} ↗
              </a>
            ) : (
              model.providerName
            )}
          </dd>
        </div>
        <div>
          <dt>{text.family}</dt>
          <dd>{model.familyName}</dd>
        </div>
        <div>
          <dt>{text.releaseDate}</dt>
          <dd>{model.releaseDate ?? text.unknown}</dd>
        </div>
        <div>
          <dt>{text.lifecycle}</dt>
          <dd>{model.lifecycleStatus}</dd>
        </div>
        <div>
          <dt>{text.contextWindow}</dt>
          <dd>
            {model.contextWindowTokens?.toLocaleString(locale) ?? text.unknown}
          </dd>
        </div>
        <div>
          <dt>{text.parameters}</dt>
          <dd>
            {model.parameterCountMillions
              ? `${model.parameterCountMillions.toLocaleString(locale)} M`
              : text.unknown}
          </dd>
        </div>
        <div>
          <dt>{text.openWeights}</dt>
          <dd>{model.isOpenWeights ? text.yes : text.no}</dd>
        </div>
      </dl>

      <section className="detailSection">
        <h2>{text.currentSnapshot}</h2>
        <div className="detailScoreCard">
          <strong>
            {valueOrNA(model.activeRanking?.overallScore ?? null)}
          </strong>
          <span>{model.activeRanking?.rankingStatus ?? 'N/A'}</span>
          <span>
            {Math.round((model.activeRanking?.overallCoverage ?? 0) * 100)}%{' '}
            {text.coverage}
          </span>
        </div>
      </section>

      <section className="detailSection">
        <h2>{text.history}</h2>
        <div className="tableScroll">
          <table className="detailTable">
            <thead>
              <tr>
                <th>{text.edition}</th>
                <th>{text.rank}</th>
                <th>{text.score}</th>
                <th>{text.status}</th>
              </tr>
            </thead>
            <tbody>
              {model.history.map((point) => (
                <tr key={point.editionDate}>
                  <td>{point.editionDate}</td>
                  <td>{point.rank ?? '—'}</td>
                  <td>{valueOrNA(point.overallScore)}</td>
                  <td>
                    {point.rankingStatus} · {point.publicationMode}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="detailSection">
        <h2>{text.results}</h2>
        {model.benchmarkResults.length === 0 ? (
          <p>{text.noResults}</p>
        ) : (
          <div className="tableScroll">
            <table className="detailTable">
              <thead>
                <tr>
                  <th>Benchmark</th>
                  <th>{text.metric}</th>
                  <th>{text.value}</th>
                  <th>{text.sampleSize}</th>
                  <th>{text.qualityFlags}</th>
                  <th>{text.evidence}</th>
                </tr>
              </thead>
              <tbody>
                {model.benchmarkResults.map((result) => (
                  <tr
                    key={`${result.benchmarkSlug}:${result.benchmarkVersion}:${result.metricSlug}`}
                  >
                    <td>
                      <Link
                        href={`/${locale}/benchmarks/${result.benchmarkSlug}`}
                      >
                        {result.benchmarkName} {result.benchmarkVersion}
                      </Link>
                    </td>
                    <td>{result.metricName}</td>
                    <td>
                      {valueOrNA(result.value)} {result.unit}
                    </td>
                    <td>{result.sampleSize ?? 'N/A'}</td>
                    <td>
                      {result.qualityFlags.length > 0
                        ? result.qualityFlags.join(', ')
                        : text.none}
                    </td>
                    <td>
                      {result.evidence ? (
                        <a
                          href={result.evidence.requestUrl}
                          rel="noreferrer"
                          target="_blank"
                        >
                          {result.evidence.sourceName} ·{' '}
                          {result.evidence.contentSha256.slice(0, 10)}…
                        </a>
                      ) : (
                        'N/A'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
