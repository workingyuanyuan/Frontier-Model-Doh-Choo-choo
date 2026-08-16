import type { ProductVersion } from '@llm-bench/benchmark-data';

import {
  COST_SOURCE_WEIGHTS,
  buildWeightedCostCurve,
  getCostParetoFrontier,
} from '../lib/view-model';

const PROVIDER_COLORS: Record<string, string> = {
  openai: '#2563eb',
  anthropic: '#c2410c',
  google: '#7c3aed',
  xai: '#111827',
  alibaba: '#0891b2',
  deepseek: '#059669',
  zai: '#db2777',
  minimax: '#ca8a04',
  meta: '#4f46e5',
  moonshot: '#0f766e',
  nvidia: '#65a30d',
  'thinking-machines': '#9333ea',
  xiaomi: '#e11d48',
};

const providerColor = (providerId: string): string =>
  PROVIDER_COLORS[providerId] ?? '#64748b';

const tickValues = [0, 25, 50, 75, 100] as const;

export function CostChart({
  product,
  selectedProfileId,
}: {
  product: ProductVersion;
  selectedProfileId: string;
}) {
  const points = buildWeightedCostCurve(product);
  const frontier = getCostParetoFrontier(points);
  const left = 58;
  const right = 610;
  const top = 28;
  const bottom = 350;
  const x = (cost: number) => left + (cost / 100) * (right - left);
  const y = (performance: number) =>
    bottom - (performance / 100) * (bottom - top);
  const frontierPath = frontier
    .map(
      (point, index) =>
        `${index === 0 ? 'M' : 'L'} ${x(point.normalizedCost).toFixed(2)} ${y(point.performance).toFixed(2)}`,
    )
    .join(' ');

  return (
    <section
      className="panel chart-panel cost-panel"
      aria-labelledby="cost-title"
    >
      <div className="section-heading compact">
        <div>
          <p className="eyebrow">Price efficiency</p>
          <h2 id="cost-title">Quality vs. Cost</h2>
          <p>
            Lower normalized task cost is better. Higher Overall Score is
            better.
          </p>
        </div>
        <p className="cost-weight-note">
          Source weights: Artificial Analysis 40% · LiveBench 40% · DeepSWE 20%
        </p>
      </div>

      {points.length > 0 ? (
        <div className="cost-curve-layout">
          <div className="cost-plot-wrap">
            <svg
              className="cost-curve-chart"
              viewBox="0 0 660 405"
              role="img"
              aria-label="Overall Score versus weighted normalized task cost. The value frontier connects non-dominated models toward the upper left."
            >
              {tickValues.map((tick) => (
                <g key={`y-${tick}`}>
                  <line
                    className="cost-grid-line"
                    x1={left}
                    y1={y(tick)}
                    x2={right}
                    y2={y(tick)}
                  />
                  <text
                    className="cost-tick-label"
                    x={left - 10}
                    y={y(tick) + 4}
                    textAnchor="end"
                  >
                    {tick}
                  </text>
                </g>
              ))}
              {tickValues.map((tick) => (
                <g key={`x-${tick}`}>
                  <line
                    className="cost-grid-line"
                    x1={x(tick)}
                    y1={top}
                    x2={x(tick)}
                    y2={bottom}
                  />
                  <text
                    className="cost-tick-label"
                    x={x(tick)}
                    y={bottom + 22}
                    textAnchor="middle"
                  >
                    {tick}
                  </text>
                </g>
              ))}
              <line
                className="chart-axis"
                x1={left}
                y1={bottom}
                x2={right}
                y2={bottom}
              />
              <line
                className="chart-axis"
                x1={left}
                y1={top}
                x2={left}
                y2={bottom}
              />
              <text
                className="cost-axis-title"
                x={(left + right) / 2}
                y="397"
                textAnchor="middle"
              >
                Weighted normalized task cost index (0–100, lower is better)
              </text>
              <text
                className="cost-axis-title"
                x="15"
                y={(top + bottom) / 2}
                textAnchor="middle"
                transform={`rotate(-90 15 ${(top + bottom) / 2})`}
              >
                Overall Score (0–100, higher is better)
              </text>
              <text className="cost-direction-label" x={left + 8} y={top + 15}>
                Better value ↖
              </text>
              {frontierPath ? (
                <path
                  className="cost-frontier-line"
                  d={frontierPath}
                  aria-hidden="true"
                />
              ) : null}
              {points.map((point) => {
                const selected = point.profileId === selectedProfileId;
                const onFrontier = frontier.some(
                  ({ profileId }) => profileId === point.profileId,
                );
                const sourceSummary = point.sourceCosts
                  .map(
                    ({ sourceId, cost }) => `${sourceId}: $${cost.toFixed(3)}`,
                  )
                  .join('; ');
                return (
                  <circle
                    key={point.profileId}
                    className={`cost-point${selected ? ' is-selected' : ''}${onFrontier ? ' is-frontier' : ''}`}
                    cx={x(point.normalizedCost)}
                    cy={y(point.performance)}
                    r={selected ? 8 : 6}
                    fill={providerColor(point.providerId)}
                    tabIndex={0}
                    role="img"
                    aria-label={`${point.displayName}. Overall Score ${point.performance.toFixed(1)}. Weighted normalized task cost ${point.normalizedCost.toFixed(1)}. ${point.sourceCount} source${point.sourceCount === 1 ? '' : 's'}. ${onFrontier ? 'On the value frontier.' : ''}`}
                  >
                    <title>{`${point.displayName}\nOverall Score: ${point.performance.toFixed(1)}\nWeighted cost index: ${point.normalizedCost.toFixed(1)}\n${sourceSummary}`}</title>
                  </circle>
                );
              })}
            </svg>
            <p className="cost-frontier-caption">
              The frontier connects profiles that are not beaten by another
              profile on both cost and performance.
            </p>
          </div>

          <aside
            className="cost-model-legend"
            aria-label="Models in cost chart"
          >
            <h3>Models</h3>
            <ul tabIndex={0} aria-label="Scrollable model legend">
              {points
                .toSorted(
                  (leftPoint, rightPoint) =>
                    rightPoint.performance - leftPoint.performance ||
                    leftPoint.normalizedCost - rightPoint.normalizedCost,
                )
                .map((point) => (
                  <li
                    key={point.profileId}
                    className={
                      point.profileId === selectedProfileId
                        ? 'is-selected'
                        : undefined
                    }
                  >
                    <span
                      className="provider-dot"
                      style={{
                        backgroundColor: providerColor(point.providerId),
                      }}
                      aria-hidden="true"
                    />
                    <span>
                      <strong>{point.displayName}</strong>
                      <small>
                        {point.providerId} · cost{' '}
                        {point.normalizedCost.toFixed(1)} · score{' '}
                        {point.performance.toFixed(1)}
                      </small>
                    </span>
                  </li>
                ))}
            </ul>
          </aside>
        </div>
      ) : (
        <div className="empty-state" role="status">
          <strong>No comparable task-cost points</strong>
          <span>At least one source-backed task cost is required.</span>
        </div>
      )}

      <details className="chart-data cost-chart-data">
        <summary>Quality vs. Cost chart data and source contributions</summary>
        <table className="compact-data-table">
          <thead>
            <tr>
              <th scope="col">Profile</th>
              <th scope="col">Provider</th>
              <th scope="col">Weighted cost</th>
              <th scope="col">Overall</th>
              <th scope="col">Sources</th>
            </tr>
          </thead>
          <tbody>
            {points.map((point) => (
              <tr key={point.profileId}>
                <th scope="row">{point.displayName}</th>
                <td>{point.providerId}</td>
                <td>{point.normalizedCost.toFixed(1)}</td>
                <td>{point.performance.toFixed(1)}</td>
                <td>
                  {point.sourceCosts.map((source, index) => (
                    <span key={source.sourceId}>
                      {index > 0 ? ' · ' : ''}
                      <a href={source.sourceUrl}>{source.sourceId}</a> ($
                      {source.cost.toFixed(3)})
                    </span>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>

      <span className="sr-only">
        Configured weights:{' '}
        {Object.entries(COST_SOURCE_WEIGHTS)
          .map(([source, weight]) => `${source} ${weight * 100}%`)
          .join(', ')}
      </span>
    </section>
  );
}
