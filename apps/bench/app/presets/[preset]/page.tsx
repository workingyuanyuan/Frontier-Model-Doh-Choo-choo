import type { Metadata } from 'next';

import {
  COST_SOURCES_NOTE,
  COST_SOURCES_TITLE,
  COST_SOURCE_HEADERS,
  LEADERBOARD_NOTE,
  costSourceCells,
  dimensionHeading,
  projectPresets,
} from '../../../lib/agent-surfaces';
import { COST_NOTE, COST_TABLE_INDEX_HEADING } from '../../../lib/cost-labels';
import { loadProductVersion } from '../../../lib/load-product-version';
import { formatScore } from '../../../lib/score-format';
import {
  LLMS_TXT_PATH,
  METHODOLOGY_PATH,
  REPOSITORY_URL,
  presetJsonPath,
  presetMarkdownPath,
  presetPagePath,
  publicUrl,
  sitePath,
} from '../../../lib/site-paths';
import { ECONOMY_HEADING, UI_DIMENSION_NAMES } from '../../../lib/ui-contract';
import './static-page.css';

export const dynamic = 'force-static';
export const dynamicParams = false;

type Props = { params: Promise<{ preset: string }> };

export function generateStaticParams() {
  return loadProductVersion().product.presets.map(({ id }) => ({ preset: id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { preset } = await params;
  return {
    title: `FM-DCC leaderboard — preset ${preset}`,
    description: `Frontier language models of preset ${preset}: ranking, dimension scores and task costs as a static table.`,
    alternates: { canonical: publicUrl(presetPagePath(preset)) },
  };
}

/**
 * One preset as plain tables: the same projection as the Markdown and JSON
 * files, rendered on the server with no data payload, so a reader that cannot
 * run the dashboard still gets the whole view from one small page.
 */
export default async function PresetPage({ params }: Props) {
  const { preset: presetId } = await params;
  const { benchmarkDimensions, product } = loadProductVersion();
  const presets = projectPresets(product, benchmarkDimensions);
  const projection = presets.find(({ preset }) => preset.id === presetId)!;
  const { preset, dimensionIds } = projection;
  const dashboard = preset.isDefault
    ? sitePath('')
    : `${sitePath('')}?preset=${encodeURIComponent(preset.id)}`;

  return (
    <div id="top">
      <header className="site-header">
        <a className="brand" href={sitePath('')}>
          <span className="brand-mark" aria-hidden="true" />
          <span>
            <strong>FM-DCC</strong> <small>Frontier Model Doh Choo-choo</small>
          </span>
        </a>{' '}
        <a href={dashboard}>Interactive dashboard</a>
      </header>
      <main className="page-shell static-page">
        <p className="eyebrow">Preset {preset.id}</p>
        <h1>Frontier model leaderboard</h1>
        <p>
          {preset.modelCount} frontier language models ranked on the{' '}
          {preset.benchmarkCount} benchmarks every model in this set has in
          common.
          {preset.isDefault
            ? ' This is the default view of the dashboard.'
            : ''}{' '}
          Same data as{' '}
          <a href={sitePath(presetMarkdownPath(preset.id))}>Markdown</a> and{' '}
          <a href={sitePath(presetJsonPath(preset.id))}>JSON</a>; how it is
          computed: <a href={sitePath(METHODOLOGY_PATH)}>methodology</a>.
        </p>
        <nav className="static-presets" aria-label="Presets">
          <span>Model sets (number of models): </span>
          {presets.map((other) => (
            <a
              key={other.preset.id}
              href={sitePath(presetPagePath(other.preset.id))}
              aria-current={other.preset.id === preset.id ? 'page' : undefined}
            >
              {other.preset.id} ({other.preset.modelCount}){' '}
            </a>
          ))}
        </nav>

        <section className="panel static-panel" aria-labelledby="leaderboard">
          <h2 id="leaderboard">Leaderboard</h2>
          <p>
            {LEADERBOARD_NOTE} Scores are 0–100 and higher is better. Each
            evidence file lists every measurement behind the row with its source
            URL.
          </p>
          <div className="table-scroll">
            <table className="static-table" data-static-table="leaderboard">
              <thead>
                <tr>
                  <th scope="col">Rank</th>
                  <th scope="col">Model</th>
                  <th scope="col">Provider</th>
                  <th scope="col">Reasoning effort</th>
                  <th scope="col">Overall</th>
                  {dimensionIds.map((dimension) => (
                    <th key={dimension} scope="col">
                      {dimensionHeading(dimension)}
                    </th>
                  ))}
                  <th scope="col">{ECONOMY_HEADING}</th>
                  <th scope="col">Evidence</th>
                </tr>
              </thead>
              <tbody>
                {projection.leaderboard.map((row) => (
                  <tr key={row.profileId} data-profile-id={row.profileId}>
                    <td>{row.rank ?? 'N/A'}</td>
                    <th scope="row">{row.modelName}</th>
                    <td>{row.providerId}</td>
                    <td>{row.reasoningEffort}</td>
                    <td>
                      <strong>{formatScore(row.overallScore)}</strong>
                    </td>
                    {dimensionIds.map((dimension) => (
                      <td key={dimension}>
                        {formatScore(row.dimensionScores[dimension] ?? null)}
                      </td>
                    ))}
                    <td>{formatScore(row.economyScore)}</td>
                    <td>
                      <a href={sitePath(row.evidencePath)}>JSON</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel static-panel" aria-labelledby="cost">
          <h2 id="cost">Quality vs. cost</h2>
          <p>{COST_NOTE}</p>
          {projection.costs.length ? (
            <div className="table-scroll">
              <table className="static-table" data-static-table="costs">
                <thead>
                  <tr>
                    <th scope="col">Model</th>
                    <th scope="col">Provider</th>
                    <th scope="col">{COST_TABLE_INDEX_HEADING}</th>
                    <th scope="col">Overall</th>
                    <th scope="col">Cost sources</th>
                    <th scope="col">On value frontier</th>
                  </tr>
                </thead>
                <tbody>
                  {projection.costs.map((row) => (
                    <tr key={row.profileId} data-profile-id={row.profileId}>
                      <th scope="row">{row.displayName}</th>
                      <td>{row.providerId}</td>
                      <td>{row.costIndex.toFixed(1)}</td>
                      <td>{row.overallScore.toFixed(1)}</td>
                      <td>
                        {row.sourceCount} of{' '}
                        {projection.weightedCostSourceCount}
                      </td>
                      <td>{row.onValueFrontier ? 'yes' : 'no'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No model in this preset has a comparable task cost.</p>
          )}
        </section>

        {projection.costs.length ? (
          <section className="panel static-panel" aria-labelledby="sources">
            <h2 id="sources">{COST_SOURCES_TITLE}</h2>
            <p>{COST_SOURCES_NOTE}</p>
            <div className="table-scroll">
              <table className="static-table" data-static-table="cost-sources">
                <thead>
                  <tr>
                    {COST_SOURCE_HEADERS.map((header) => (
                      <th key={header} scope="col">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {projection.costs.flatMap((row) =>
                    row.sources.map((source) => {
                      const [name, usd, pairedScore] = costSourceCells(source);
                      return (
                        <tr key={`${row.profileId}:${source.sourceId}`}>
                          <th scope="row">{row.displayName}</th>
                          <td>
                            <a href={source.sourceUrl}>{name}</a>
                          </td>
                          <td>{usd}</td>
                          <td>{pairedScore}</td>
                        </tr>
                      );
                    }),
                  )}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}

        <section className="panel static-panel" aria-labelledby="benchmarks">
          <h2 id="benchmarks">Benchmarks scored in this preset</h2>
          <div className="table-scroll">
            <table className="static-table" data-static-table="benchmarks">
              <thead>
                <tr>
                  <th scope="col">Benchmark ID</th>
                  <th scope="col">Dimension</th>
                </tr>
              </thead>
              <tbody>
                {projection.benchmarks.map(({ id, dimension }) => (
                  <tr key={id}>
                    <td>
                      <code>{id}</code>
                    </td>
                    <td>{UI_DIMENSION_NAMES[dimension]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <span>FM-DCC</span>
        <nav className="footer-links" aria-label="Data and documentation">
          <a href={sitePath(presetMarkdownPath(preset.id))}>Markdown</a>{' '}
          <a href={sitePath(presetJsonPath(preset.id))}>JSON</a>{' '}
          <a href={sitePath(METHODOLOGY_PATH)}>Methodology</a>{' '}
          <a href={sitePath(LLMS_TXT_PATH)}>llms.txt</a>{' '}
          <a href={REPOSITORY_URL}>Source repository</a>
        </nav>
        <span className="footer-version-meta">
          <span>Version {projection.versionId}</span>{' '}
          <span>Generated {projection.generatedAt}</span>
        </span>
      </footer>
    </div>
  );
}
