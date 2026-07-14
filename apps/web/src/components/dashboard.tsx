'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

import { type ActiveEdition, type RankingSnapshot } from '@llm-bench/contracts';

import { calculateFieldAverage } from '../lib/homepage-data';
import type { Dictionary, Locale } from '../lib/i18n';
import { RadarChart } from './radar-chart';

interface DashboardProps {
  dictionary: Dictionary;
  edition: ActiveEdition | null;
  locale: Locale;
  snapshot: RankingSnapshot;
}

type ThemeId = 'editorial' | 'studio';

export function Dashboard({
  dictionary,
  edition,
  locale,
  snapshot,
}: DashboardProps) {
  const [theme, setTheme] = useState<ThemeId>('editorial');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selected = snapshot.entries[selectedIndex] ?? snapshot.entries[0];
  const fieldAverage = useMemo(
    () => calculateFieldAverage(snapshot.entries),
    [snapshot.entries],
  );

  if (!selected) {
    return null;
  }

  const otherLocale = locale === 'zh-TW' ? 'en' : 'zh-TW';
  const isFallback = edition === null;
  const isFormal = edition?.publicationMode === 'FORMAL';
  const editionTitle = edition
    ? locale === 'zh-TW'
      ? edition.titleZhTw
      : edition.titleEn
    : dictionary.edition;
  const dataCutoff = edition
    ? `${dictionary.dataCutoffLabel} ${new Intl.DateTimeFormat(locale, {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'Asia/Taipei',
      }).format(new Date(snapshot.dataCutoffAt))}`
    : dictionary.dataCutoff;
  const badge = isFallback
    ? dictionary.hero.previewBadge
    : isFormal
      ? dictionary.hero.formalBadge
      : dictionary.hero.dataPreviewBadge;
  const notice = isFallback
    ? dictionary.hero.previewNotice
    : isFormal
      ? dictionary.hero.formalNotice
      : dictionary.hero.dataPreviewNotice;
  const rankedModels = snapshot.entries.filter(
    (entry) => entry.rank !== null,
  ).length;

  return (
    <div className="siteShell" data-theme={theme} lang={locale}>
      <header className="siteHeader">
        <Link
          className="brand"
          href={`/${locale}`}
          aria-label={dictionary.brand}
        >
          <span className="brandMark" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span>{dictionary.brand}</span>
        </Link>

        <nav className="primaryNav" aria-label="Primary navigation">
          <a href="#rankings">{dictionary.nav.rankings}</a>
          <Link href={`/${locale}/compare`}>{dictionary.nav.compare}</Link>
          <Link href={`/${locale}/methodology`}>
            {dictionary.nav.methodology}
          </Link>
        </nav>

        <div className="headerActions">
          <div className="themeSwitch" aria-label={dictionary.theme.label}>
            <button
              type="button"
              aria-pressed={theme === 'editorial'}
              onClick={() => setTheme('editorial')}
            >
              {dictionary.theme.editorial}
            </button>
            <button
              type="button"
              aria-pressed={theme === 'studio'}
              onClick={() => setTheme('studio')}
            >
              {dictionary.theme.studio}
            </button>
          </div>
          <Link className="languageLink" href={`/${otherLocale}`}>
            {dictionary.language}
          </Link>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="heroCopy">
            <div className="eyebrowRow">
              <span className="liveDot" />
              <span>{dictionary.hero.eyebrow}</span>
              <span className="previewPill">{badge}</span>
            </div>
            <h1>
              {dictionary.hero.title.split('\n').map((line, index) => (
                <span key={line}>{`${line}${index === 0 ? ' ' : ''}`}</span>
              ))}
            </h1>
            <p>{dictionary.hero.body}</p>
          </div>

          <div className="editionCard">
            <span className="editionKicker">Edition</span>
            <strong>{editionTitle}</strong>
            <span>{dataCutoff}</span>
            <svg viewBox="0 0 72 72" aria-hidden="true">
              <circle cx="36" cy="36" r="30" />
              <path d="M36 14v22l15 9" />
            </svg>
          </div>
        </section>

        <aside className="previewNotice" role="note">
          <span aria-hidden="true">i</span>
          <p>{notice}</p>
        </aside>

        <section className="dashboardGrid" id="rankings">
          <aside className="rankingPanel">
            <div className="panelHeading">
              <div>
                <span className="sectionIndex">01</span>
                <h2>{dictionary.ranking}</h2>
              </div>
              <p>{dictionary.modelListHint}</p>
            </div>

            <div className="rankingList">
              {snapshot.entries.map((entry, index) => (
                <button
                  className={
                    index === selectedIndex ? 'rankItem selected' : 'rankItem'
                  }
                  key={entry.modelVariantId}
                  type="button"
                  aria-pressed={index === selectedIndex}
                  onClick={() => setSelectedIndex(index)}
                >
                  <span className="rankNumber">
                    {entry.rank === null
                      ? '—'
                      : String(entry.rank).padStart(2, '0')}
                  </span>
                  <span className="modelIdentity">
                    <strong>{entry.displayName}</strong>
                    <small>{entry.providerName}</small>
                  </span>
                  <span className="modelScore">
                    {entry.overallScore?.toFixed(1) ?? 'N/A'}
                  </span>
                </button>
              ))}
            </div>

            <div className="rankingFootnote">
              <span className="statusDot" />
              <span>
                {isFallback
                  ? dictionary.missingDataRule
                  : `${selected.rankingStatus} · ${edition.publicationMode}`}
              </span>
            </div>
          </aside>

          <section className="radarPanel" id="compare">
            <div className="radarHeader">
              <div>
                <span className="sectionIndex">02</span>
                <h2>{dictionary.capabilityProfile}</h2>
                <p>{dictionary.capabilityDescription}</p>
              </div>
              <div className="legend" aria-label="Chart legend">
                <span>
                  <i className="legendModel" />
                  {selected.displayName}
                </span>
                <span>
                  <i className="legendAverage" />
                  {dictionary.fieldAverage}
                </span>
              </div>
            </div>

            {!isFallback && (
              <Link
                className="detailLink"
                href={`/${locale}/models/${selected.slug}`}
              >
                {dictionary.viewModelDetails} →
              </Link>
            )}

            <div className="radarStage">
              <RadarChart
                dictionary={dictionary}
                entry={selected}
                fieldAverage={fieldAverage}
              />
            </div>

            <div className="metricGrid">
              <article>
                <span>{dictionary.overallScore}</span>
                <strong>{selected.overallScore?.toFixed(1) ?? 'N/A'}</strong>
                <small>/ 100</small>
              </article>
              <article>
                <span>{dictionary.coverage}</span>
                <strong>{Math.round(selected.overallCoverage * 100)}%</strong>
                <div className="meter">
                  <i style={{ width: `${selected.overallCoverage * 100}%` }} />
                </div>
              </article>
              <article>
                <span>{dictionary.confidence}</span>
                <strong>{Math.round(selected.overallConfidence)}</strong>
                <small>/ 100</small>
              </article>
              <article>
                <span>{dictionary.weeklyChange}</span>
                <strong>N/A</strong>
                <small>{dictionary.noPriorEdition}</small>
              </article>
            </div>
          </section>
        </section>

        <section className="insightGrid" id="methodology">
          <article className="insightCard evidenceCard">
            <span className="sectionIndex">03</span>
            <h2>{dictionary.evidenceTitle}</h2>
            <p>{dictionary.evidenceBody}</p>
            <div className="hashSample">
              <span>Snapshot</span>
              <code>{snapshot.id}</code>
            </div>
          </article>

          <article className="insightCard pipelineCard">
            <span className="sectionIndex">04</span>
            <h2>{dictionary.pipelineTitle}</h2>
            <ol>
              {dictionary.pipelineSteps.map((step, index) => (
                <li key={step} className={index < 3 ? 'complete' : 'current'}>
                  <span>{index + 1}</span>
                  <strong>{step}</strong>
                </li>
              ))}
            </ol>
            <dl>
              <div>
                <dt>{dictionary.sourceStatus}</dt>
                <dd>
                  {isFallback
                    ? dictionary.sourceReady
                    : snapshot.scoringMethodVersion}
                </dd>
              </div>
              <div>
                <dt>{dictionary.stagedRows}</dt>
                <dd>{snapshot.entries.length}</dd>
              </div>
              <div>
                <dt>{dictionary.publishedRows}</dt>
                <dd>{rankedModels}</dd>
              </div>
            </dl>
          </article>

          <article className="insightCard methodologyCard">
            <span className="sectionIndex">05</span>
            <h2>{dictionary.methodologyTitle}</h2>
            <p>{dictionary.methodologyBody}</p>
            <div className="missingDemo" aria-hidden="true">
              <span />
              <span />
              <i>N/A</i>
              <span />
              <span />
            </div>
          </article>
        </section>
      </main>

      <footer className="siteFooter">
        <strong>{dictionary.brand}</strong>
        <p>{dictionary.footer}</p>
        <span>v0.1 · 2026</span>
      </footer>
    </div>
  );
}
