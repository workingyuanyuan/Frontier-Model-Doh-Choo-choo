import Link from 'next/link';
import { notFound } from 'next/navigation';

import { getActiveEdition } from '@llm-bench/db';

import { CompareSelector } from '../../../components/compare-selector';
import { ComparisonRadar } from '../../../components/comparison-radar';
import { getCompareCopy } from '../../../lib/compare-copy';
import {
  InvalidComparisonSelectionError,
  resolveComparisonEntries,
  type ComparisonQueryValue,
} from '../../../lib/comparison';
import { getWebDatabase } from '../../../lib/database';
import { resolveHomepageData } from '../../../lib/homepage-data';
import { getDictionary, isLocale } from '../../../lib/i18n';

export const dynamic = 'force-dynamic';

interface ComparePageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ models?: ComparisonQueryValue }>;
}

export default async function ComparePage({
  params,
  searchParams,
}: ComparePageProps) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  if (!isLocale(locale)) notFound();

  const homepage = resolveHomepageData(
    await getActiveEdition(getWebDatabase().db),
  );
  let selected;
  try {
    selected = resolveComparisonEntries(
      homepage.snapshot.entries,
      query.models,
    );
  } catch (error) {
    if (error instanceof InvalidComparisonSelectionError) notFound();
    throw error;
  }

  const dictionary = getDictionary(locale);
  const copy = getCompareCopy(locale);
  const otherLocale = locale === 'zh-TW' ? 'en' : 'zh-TW';
  const shareQuery = new URLSearchParams();
  for (const entry of selected) shareQuery.append('models', entry.slug);

  return (
    <main className="detailPage comparePage">
      <div className="detailPageNav">
        <Link className="detailBack" href={`/${locale}`}>
          ← {copy.back}
        </Link>
        <Link
          className="detailLink"
          href={`/${otherLocale}/compare?${shareQuery.toString()}`}
        >
          {dictionary.language}
        </Link>
      </div>

      <header className="detailHero">
        <p>{copy.eyebrow}</p>
        <h1>{copy.title}</h1>
        <p>{copy.body}</p>
      </header>

      <CompareSelector
        copy={copy}
        initialSlugs={selected.map((entry) => entry.slug)}
        locale={locale}
        options={homepage.snapshot.entries.map((entry) => ({
          slug: entry.slug,
          displayName: entry.displayName,
          providerName: entry.providerName,
        }))}
      />

      <section className="detailSection">
        <h2>{copy.capabilityTable}</h2>
        <ComparisonRadar
          dictionary={dictionary}
          entries={selected}
          title={copy.capabilityTable}
        />
      </section>

      <section className="compareCards" aria-label={copy.selection}>
        {selected.map((entry) => (
          <article className="compareCard" key={entry.slug}>
            <p>{entry.providerName}</p>
            <h2>{entry.displayName}</h2>
            <dl>
              <div>
                <dt>{copy.overall}</dt>
                <dd>{entry.overallScore?.toFixed(1) ?? 'N/A'}</dd>
              </div>
              <div>
                <dt>{copy.coverage}</dt>
                <dd>{Math.round(entry.overallCoverage * 100)}%</dd>
              </div>
              <div>
                <dt>{copy.status}</dt>
                <dd>{entry.rankingStatus}</dd>
              </div>
              <div>
                <dt>{copy.flags}</dt>
                <dd>{entry.qualityFlags.join(', ') || '—'}</dd>
              </div>
            </dl>
            {homepage.source === 'ACTIVE_EDITION' && (
              <Link
                className="detailLink"
                href={`/${locale}/models/${entry.slug}`}
              >
                {copy.details} →
              </Link>
            )}
          </article>
        ))}
      </section>

      <section className="detailSection">
        <h2>{copy.capabilityTable}</h2>
        <div className="tableScroll">
          <table className="detailTable compareTable">
            <caption>{copy.body}</caption>
            <thead>
              <tr>
                <th>{copy.dimension}</th>
                {selected.map((entry) => (
                  <th key={entry.slug}>{entry.displayName}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {selected[0]?.dimensions.map((dimension, index) => (
                <tr key={dimension.dimension}>
                  <th scope="row">
                    {dictionary.dimensions[dimension.dimension]}
                  </th>
                  {selected.map((entry) => {
                    const score = entry.dimensions[index];
                    return (
                      <td key={entry.slug}>
                        <strong>{score?.score?.toFixed(1) ?? 'N/A'}</strong>
                        <small>{score?.status ?? 'INSUFFICIENT_DATA'}</small>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
