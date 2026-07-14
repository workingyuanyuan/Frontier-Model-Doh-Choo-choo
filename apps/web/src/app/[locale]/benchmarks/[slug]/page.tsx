import Link from 'next/link';
import { notFound } from 'next/navigation';

import { DetailSlugSchema } from '@llm-bench/contracts';
import { getBenchmarkDetailBySlug } from '@llm-bench/db';

import { getWebDatabase } from '../../../../lib/database';
import { selectMetricLeaders } from '../../../../lib/detail-data';
import { getDetailCopy } from '../../../../lib/detail-copy';
import { isLocale } from '../../../../lib/i18n';

export const dynamic = 'force-dynamic';

interface BenchmarkPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export default async function BenchmarkPage({ params }: BenchmarkPageProps) {
  const { locale, slug } = await params;
  if (!isLocale(locale) || !DetailSlugSchema.safeParse(slug).success)
    notFound();
  const benchmark = await getBenchmarkDetailBySlug(getWebDatabase().db, slug);
  if (!benchmark) notFound();
  const text = getDetailCopy(locale);
  const leaders = selectMetricLeaders(benchmark);

  return (
    <main className="detailPage">
      <Link className="detailBack" href={`/${locale}`}>
        ← {text.back}
      </Link>
      <header className="detailHero">
        <p>{text.benchmarkProfile}</p>
        <h1>{benchmark.displayName}</h1>
        <span>
          {text.version} {benchmark.version}
        </span>
        <p>{benchmark.description}</p>
      </header>
      <dl className="detailFacts">
        <div>
          <dt>{text.version}</dt>
          <dd>{benchmark.version}</dd>
        </div>
        <div>
          <dt>{text.releaseDate}</dt>
          <dd>{benchmark.releasedAt?.slice(0, 10) ?? text.unknown}</dd>
        </div>
        <div>
          <dt>{text.license}</dt>
          <dd>{benchmark.licenseSpdx ?? text.unknown}</dd>
        </div>
        <div>
          <dt>{text.methodology}</dt>
          <dd>
            {benchmark.methodologyUrl ? (
              <a
                href={benchmark.methodologyUrl}
                rel="noreferrer"
                target="_blank"
              >
                {text.methodology} ↗
              </a>
            ) : (
              text.unknown
            )}
          </dd>
        </div>
        <div>
          <dt>{text.homepage}</dt>
          <dd>
            {benchmark.homepageUrl ? (
              <a href={benchmark.homepageUrl} rel="noreferrer" target="_blank">
                {text.homepage} ↗
              </a>
            ) : (
              text.unknown
            )}
          </dd>
        </div>
      </dl>
      <section className="detailSection">
        <h2>{text.metrics}</h2>
        <div className="tableScroll">
          <table className="detailTable">
            <thead>
              <tr>
                <th>{text.metric}</th>
                <th>Unit</th>
                <th>{text.direction}</th>
                <th>{text.range}</th>
              </tr>
            </thead>
            <tbody>
              {benchmark.metrics.map((metric) => (
                <tr key={metric.slug}>
                  <td>{metric.displayName}</td>
                  <td>{metric.unit}</td>
                  <td>{metric.higherIsBetter ? text.higher : text.lower}</td>
                  <td>
                    {metric.theoreticalMin ?? '—'}–
                    {metric.theoreticalMax ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="detailSection">
        <h2>{text.leaderboard}</h2>
        <div className="tableScroll">
          <table className="detailTable">
            <thead>
              <tr>
                <th>{text.metric}</th>
                <th>{text.model}</th>
                <th>{text.value}</th>
                <th>{text.sampleSize}</th>
                <th>{text.qualityFlags}</th>
              </tr>
            </thead>
            <tbody>
              {leaders.map((row) => (
                <tr key={`${row.metricSlug}:${row.modelSlug}`}>
                  <td>{row.metricSlug}</td>
                  <td>
                    <Link href={`/${locale}/models/${row.modelSlug}`}>
                      {row.modelName} · {row.providerName}
                    </Link>
                  </td>
                  <td>{Math.round(row.value * 100) / 100}</td>
                  <td>{row.sampleSize ?? 'N/A'}</td>
                  <td>
                    {row.qualityFlags.length > 0
                      ? row.qualityFlags.join(', ')
                      : text.none}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
