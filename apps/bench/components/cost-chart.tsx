import type { ProductVersion } from '@llm-bench/benchmark-data';

import { profileById, splitCostSeries } from '../lib/view-model';

type CostPoint = ProductVersion['costs'][number];

function ScatterPlot({
  title,
  description,
  axisLabel,
  points,
  product,
  selectedProfileId,
}: {
  title: string;
  description: string;
  axisLabel: string;
  points: CostPoint[];
  product: ProductVersion;
  selectedProfileId: string;
}) {
  if (!points.length) {
    return (
      <div className="cost-series">
        <h3>{title}</h3>
        <div className="empty-state" role="status">
          <strong>No comparable cost points</strong>
          <span>{description}</span>
        </div>
      </div>
    );
  }

  const maxCost = Math.max(...points.map(({ cost }) => cost));
  const minPerformance =
    Math.min(...points.map(({ performance }) => performance)) - 3;
  const x = (cost: number) => 45 + (cost / maxCost) * 275;
  const y = (performance: number) =>
    190 - ((performance - minPerformance) / (100 - minPerformance)) * 150;

  return (
    <div className="cost-series">
      <div className="subheading">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <svg
        className="scatter-chart"
        viewBox="0 0 350 220"
        role="img"
        aria-label={`${title}: performance plotted against ${axisLabel}`}
      >
        <line className="chart-axis" x1="45" y1="190" x2="330" y2="190" />
        <line className="chart-axis" x1="45" y1="30" x2="45" y2="190" />
        <text className="chart-axis-label" x="185" y="214" textAnchor="middle">
          {axisLabel}
        </text>
        <text className="chart-axis-label" x="8" y="22">
          Score
        </text>
        {points.map((point) => {
          const profile = profileById(product, point.profileId);
          const selected = point.profileId === selectedProfileId;
          return (
            <g key={`${point.profileId}:${point.costType}`}>
              <circle
                className={
                  selected ? 'scatter-point is-selected' : 'scatter-point'
                }
                cx={x(point.cost)}
                cy={y(point.performance)}
                r={selected ? 7 : 5}
                aria-label={`${profile?.displayName ?? point.profileId}: ${point.performance.toFixed(1)} at ${point.cost.toFixed(3)} USD`}
              />
              <text
                className="scatter-label"
                x={x(point.cost)}
                y={y(point.performance) - 11}
                textAnchor="middle"
              >
                {profile?.baseModelName ?? point.modelId}
              </text>
            </g>
          );
        })}
      </svg>
      <details className="chart-data">
        <summary>{title} chart data</summary>
        <table className="compact-data-table">
          <thead>
            <tr>
              <th scope="col">Profile</th>
              <th scope="col">Cost</th>
              <th scope="col">Score</th>
            </tr>
          </thead>
          <tbody>
            {points.map((point) => (
              <tr key={`${point.profileId}:${point.costType}`}>
                <th scope="row">
                  {profileById(product, point.profileId)?.displayName ??
                    point.profileId}
                </th>
                <td>${point.cost.toFixed(3)}</td>
                <td>{point.performance.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}

export function CostChart({
  product,
  selectedProfileId,
}: {
  product: ProductVersion;
  selectedProfileId: string;
}) {
  const { api, task } = splitCostSeries(product);

  return (
    <section
      className="panel chart-panel cost-panel"
      aria-labelledby="cost-title"
    >
      <div className="section-heading compact">
        <div>
          <p className="eyebrow">Price efficiency</p>
          <h2 id="cost-title">Quality vs. cost</h2>
          <p>
            Comparable API estimates and observed task costs remain separate.
          </p>
        </div>
      </div>
      <div className="cost-grid">
        <ScatterPlot
          title="API standardized"
          description="Comparable USD cost under the configured blended-token assumption."
          axisLabel="Comparable USD cost"
          points={api}
          product={product}
          selectedProfileId={selectedProfileId}
        />
        <ScatterPlot
          title="Measured / agent task"
          description="Observed benchmark or agent-run cost; not mixed with API estimates."
          axisLabel="Cost per task (USD)"
          points={task}
          product={product}
          selectedProfileId={selectedProfileId}
        />
      </div>
    </section>
  );
}
