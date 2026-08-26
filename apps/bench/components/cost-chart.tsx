'use client';

import { useState } from 'react';

import { getChartDomain } from '../lib/chart-scale';
import {
  ADVANCED_COST_SOURCE_IDS,
  COST_SOURCE_SCORE_BASES,
  COST_SOURCE_WEIGHTS,
  buildAdvancedCostModelOptions,
  buildAdvancedCostSeries,
  buildWeightedCostCurve,
  getCostParetoFrontier,
  type AdvancedCostModelOption,
  type AdvancedCostSeries,
  type AdvancedCostSourceId,
  type CostSourceScoreBasisId,
  type WeightedCostPoint,
  type PresetProductVersion,
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

const SOURCE_NAMES: Record<string, string> = {
  'artificial-analysis': 'Artificial Analysis',
  livebench: 'LiveBench',
  deepswe: 'DeepSWE',
  'frontier-code': 'Frontier Code',
  'arc-prize': 'ARC Prize',
  'vals-ai': 'Vals AI',
  'zapier-automationbench': 'Zapier',
};

/**
 * Derived from COST_SOURCE_WEIGHTS rather than written out. The hand-written
 * version silently kept claiming six sources at 16.7% after Zapier was adopted
 * and the table became seven at 14.3%.
 */
const weightNote = (weights: Readonly<Record<string, number>>): string => {
  const entries = Object.entries(weights);
  const firstWeight = entries[0]?.[1] ?? 0;
  const equalWeights = entries.every(
    ([, weight]) => Math.abs(weight - firstWeight) < Number.EPSILON,
  );

  return equalWeights
    ? `Source weights: ${(firstWeight * 100).toFixed(1)}% each.`
    : `Source weights: ${entries
        .map(
          ([sourceId, weight]) =>
            `${SOURCE_NAMES[sourceId] ?? sourceId} ${(weight * 100).toFixed(1)}%`,
        )
        .join(' · ')}.`;
};

/**
 * What each source's contributed score actually is. A cost source without a
 * basis says so out loud: it contributed cost and nothing else.
 */
const SCORE_BASIS_NAMES: Record<CostSourceScoreBasisId, string> = {
  AA_INTELLIGENCE_INDEX: 'Intelligence Index',
  DEEPSWE_1_1: 'DeepSWE 1.1',
  FRONTIER_CODE_1_1: 'Frontier Code 1.1',
  ARC_AGI: 'ARC-AGI-2',
  VALS_INDEX: 'Vals Index',
  ZAPIER_AUTOMATIONBENCH: 'AutomationBench',
  NONE: 'cost only, no pairable score',
};

const scoreBasisNote = (
  basis: CostSourceScoreBasisId,
  score: number | null,
): string =>
  basis === 'NONE' || score === null
    ? SCORE_BASIS_NAMES.NONE
    : `${SCORE_BASIS_NAMES[basis]} ${score.toFixed(1)}`;

/** Sources carrying a weight, i.e. the largest source count a point can have. */
const WEIGHTED_SOURCE_COUNT = Object.keys(COST_SOURCE_WEIGHTS).length;

/**
 * Named from the basis table, not written out, so the sentence cannot go stale
 * the way the hand-written weight note did when Zapier was adopted.
 */
const costOnlySourcesNote = (): string => {
  const costOnly = Object.keys(COST_SOURCE_WEIGHTS)
    .filter((sourceId) => COST_SOURCE_SCORE_BASES[sourceId] == null)
    .map((sourceId) => SOURCE_NAMES[sourceId] ?? sourceId);
  return costOnly.length === 0
    ? 'Every source here contributes both.'
    : `${costOnly.join(', ')} ${costOnly.length === 1 ? 'contributes' : 'contribute'} cost only.`;
};

const providerColor = (providerId: string): string =>
  PROVIDER_COLORS[providerId] ?? '#64748b';

const sourceName = (sourceId: string): string =>
  SOURCE_NAMES[sourceId] ?? sourceId;

const defaultPointIsSelected = (
  point: WeightedCostPoint,
  selectedProfileId: string | null | undefined,
): boolean =>
  Boolean(
    selectedProfileId &&
    (point.profileId === selectedProfileId ||
      point.selectedProfileIds.includes(selectedProfileId)),
  );

function getCardTransform(x: number, y: number): string {
  const flipX = x > 340;
  const flipYTop = y < 110;
  const flipYBottom = y > 290;

  const translateX = flipX ? 'calc(-100% - 12px)' : '12px';
  const translateY = flipYTop
    ? '6px'
    : flipYBottom
      ? 'calc(-100% - 6px)'
      : '-50%';

  return `translate(${translateX}, ${translateY})`;
}

export function DefaultCostPlot({
  points,
  selectedProfileId = null,
  onToggleSelect,
  initialActivePoint = null,
}: {
  points: WeightedCostPoint[];
  selectedProfileId?: string | null;
  onToggleSelect?: (profileId: string | null) => void;
  initialActivePoint?: WeightedCostPoint | null;
}) {
  const [activePoint, setActivePoint] = useState<WeightedCostPoint | null>(
    initialActivePoint,
  );
  const frontier = getCostParetoFrontier(points);
  const left = 58;
  const right = 610;
  const top = 28;
  const bottom = 350;
  const xDomain = getChartDomain(points.map((point) => point.normalizedCost));
  const yDomain = getChartDomain(points.map((point) => point.performance));
  const x = (cost: number) =>
    left +
    ((cost - xDomain.min) / (xDomain.max - xDomain.min)) * (right - left);
  const y = (performance: number) =>
    bottom -
    ((performance - yDomain.min) / (yDomain.max - yDomain.min)) *
      (bottom - top);
  const frontierPath = frontier
    .map(
      (point, index) =>
        `${index === 0 ? 'M' : 'L'} ${x(point.normalizedCost).toFixed(2)} ${y(point.performance).toFixed(2)}`,
    )
    .join(' ');

  const handleToggle = (point: WeightedCostPoint) => {
    if (defaultPointIsSelected(point, selectedProfileId)) {
      onToggleSelect?.(null);
    } else {
      onToggleSelect?.(point.profileId);
    }
  };

  return (
    <>
      {points.length > 0 ? (
        <div className="cost-curve-layout">
          <div className="cost-plot-wrap">
            <div className="cost-chart-canvas">
              <svg
                className="cost-curve-chart"
                viewBox="0 0 660 405"
                role="img"
                aria-label={`Overall Score (${yDomain.min}–${yDomain.max}) versus weighted normalized task cost (${xDomain.min}–${xDomain.max}). The value frontier connects non-dominated models toward the upper left.`}
              >
                {yDomain.ticks.map((tick) => (
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
                {xDomain.ticks.map((tick) => (
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
                  {`Weighted normalized task cost index (${xDomain.min}–${xDomain.max}, lower is better)`}
                </text>
                <text
                  className="cost-axis-title"
                  x="15"
                  y={(top + bottom) / 2}
                  textAnchor="middle"
                  transform={`rotate(-90 15 ${(top + bottom) / 2})`}
                >
                  {`Overall Score (${yDomain.min}–${yDomain.max}, higher is better)`}
                </text>
                <text
                  className="cost-direction-label"
                  x={left + 8}
                  y={top + 15}
                >
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
                  const selected = defaultPointIsSelected(
                    point,
                    selectedProfileId,
                  );
                  const onFrontier = frontier.some(
                    ({ profileId }) => profileId === point.profileId,
                  );
                  return (
                    <circle
                      key={point.modelId}
                      className={`cost-point${selected ? ' is-selected' : ''}${onFrontier ? ' is-frontier' : ''}`}
                      cx={x(point.normalizedCost)}
                      cy={y(point.performance)}
                      r={selected ? 8 : 6}
                      fill={providerColor(point.providerId)}
                      tabIndex={0}
                      role="img"
                      aria-label={`${point.displayName}. Overall Score ${point.performance.toFixed(1)}. Weighted normalized task cost ${point.normalizedCost.toFixed(1)}. ${point.sourceCount} source${point.sourceCount === 1 ? '' : 's'}. ${onFrontier ? 'On the value frontier.' : ''}`}
                      onClick={() => handleToggle(point)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleToggle(point);
                        }
                      }}
                      onPointerEnter={() => setActivePoint(point)}
                      onPointerLeave={() =>
                        setActivePoint((current) =>
                          current?.modelId === point.modelId ? null : current,
                        )
                      }
                      onFocus={() => setActivePoint(point)}
                      onBlur={() =>
                        setActivePoint((current) =>
                          current?.modelId === point.modelId ? null : current,
                        )
                      }
                    />
                  );
                })}
              </svg>
              {activePoint ? (
                <div
                  className="cost-hover-card"
                  role="tooltip"
                  aria-hidden="true"
                  style={{
                    left: `${((x(activePoint.normalizedCost) / 660) * 100).toFixed(2)}%`,
                    top: `${((y(activePoint.performance) / 405) * 100).toFixed(2)}%`,
                    transform: getCardTransform(
                      x(activePoint.normalizedCost),
                      y(activePoint.performance),
                    ),
                  }}
                >
                  <div className="cost-hover-card-header">
                    <span
                      className="provider-dot"
                      style={{
                        backgroundColor: providerColor(activePoint.providerId),
                      }}
                      aria-hidden="true"
                    />
                    <strong className="cost-hover-card-title">
                      {activePoint.displayName}
                    </strong>
                  </div>
                  <div className="cost-hover-card-metrics">
                    <div className="cost-hover-card-row">
                      <span className="cost-hover-card-label">
                        Overall Score:
                      </span>
                      <span className="cost-hover-card-value">
                        {activePoint.performance.toFixed(1)}
                      </span>
                    </div>
                    <div className="cost-hover-card-row">
                      <span className="cost-hover-card-label">
                        Weighted cost index:
                      </span>
                      <span className="cost-hover-card-value">
                        {activePoint.normalizedCost.toFixed(1)}
                      </span>
                    </div>
                    <div className="cost-hover-card-row">
                      <span className="cost-hover-card-label">Sources:</span>
                      <span
                        className="cost-hover-card-value"
                        data-testid="cost-hover-source-count"
                      >
                        {activePoint.sourceCount} of {WEIGHTED_SOURCE_COUNT}
                      </span>
                    </div>
                  </div>
                  {activePoint.sourceCosts.length > 0 ? (
                    <div className="cost-hover-card-sources">
                      <div className="cost-hover-card-sources-title">
                        Source task costs
                      </div>
                      <ul className="cost-hover-card-source-list">
                        {activePoint.sourceCosts.map((source) => (
                          <li
                            key={source.sourceId}
                            className="cost-hover-card-source-item"
                          >
                            <span>
                              {sourceName(source.sourceId)} ({source.profileId})
                              :
                            </span>
                            <span>${source.cost.toFixed(3)}</span>
                            <span className="cost-hover-card-source-basis">
                              {scoreBasisNote(
                                source.scoreBasis,
                                source.sourceScore,
                              )}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
            <p className="cost-frontier-caption">
              The frontier connects best score at each cost.
            </p>
          </div>

          <aside
            className="cost-model-legend"
            aria-label="Models in default cost chart"
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
                    key={point.modelId}
                    className={
                      defaultPointIsSelected(point, selectedProfileId)
                        ? 'is-selected'
                        : undefined
                    }
                    onClick={() => handleToggle(point)}
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
        <p className="chart-data-note">
          Each source contributes cost plus at most one score, on a single named
          basis. A source that has no score pairable with its own cost metric
          contributes cost only, and says so rather than averaging whatever
          benchmarks it happens to publish. {costOnlySourcesNote()}
        </p>
        <table className="compact-data-table">
          <thead>
            <tr>
              <th scope="col">Model</th>
              <th scope="col">Provider</th>
              <th scope="col">Weighted cost</th>
              <th scope="col">Overall</th>
              <th scope="col">Sources</th>
              <th scope="col">Source cost and score basis</th>
            </tr>
          </thead>
          <tbody>
            {points.map((point) => (
              <tr key={point.modelId}>
                <th scope="row">{point.displayName}</th>
                <td>{point.providerId}</td>
                <td>{point.normalizedCost.toFixed(1)}</td>
                <td>{point.performance.toFixed(1)}</td>
                <td data-testid="cost-row-source-count">
                  {point.sourceCount} of {WEIGHTED_SOURCE_COUNT}
                </td>
                <td>
                  {point.sourceCosts.map((source, index) => (
                    <span key={source.sourceId}>
                      {index > 0 ? ' · ' : ''}
                      <a href={source.sourceUrl}>
                        {sourceName(source.sourceId)}
                      </a>{' '}
                      ({source.profileId}, ${source.cost.toFixed(3)},{' '}
                      {scoreBasisNote(source.scoreBasis, source.sourceScore)})
                    </span>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </>
  );
}

export function AdvancedCostPlot({
  series,
  modelOptions,
  selectedSourceCount,
  selectedProfileId = null,
  onToggleSelect,
  initialActivePoint = null,
  initialHiddenSeriesIds,
  initialHiddenProfileIds,
}: {
  series: AdvancedCostSeries[];
  modelOptions?: AdvancedCostModelOption[];
  selectedSourceCount?: number;
  selectedProfileId?: string | null;
  onToggleSelect?: (profileId: string | null) => void;
  initialActivePoint?: {
    series: AdvancedCostSeries;
    point: AdvancedCostSeries['points'][number];
  } | null;
  initialHiddenSeriesIds?: Set<string> | readonly string[];
  initialHiddenProfileIds?: Set<string> | readonly string[];
}) {
  const [hiddenProfileIds, setHiddenProfileIds] = useState<Set<string>>(
    () =>
      new Set([
        ...(initialHiddenProfileIds ?? []),
        ...series
          .filter(({ seriesId }) =>
            new Set(initialHiddenSeriesIds ?? []).has(seriesId),
          )
          .flatMap(({ points }) => points.map(({ profileId }) => profileId)),
      ]),
  );
  const [activePoint, setActivePoint] = useState<{
    series: AdvancedCostSeries;
    point: AdvancedCostSeries['points'][number];
  } | null>(initialActivePoint);
  const left = 62;
  const right = 610;
  const top = 28;
  const bottom = 350;
  const controls: AdvancedCostModelOption[] =
    modelOptions ??
    series.map((line) => ({
      seriesId: line.seriesId,
      modelId: line.modelId,
      providerId: line.providerId,
      displayName: line.displayName,
      efforts: line.points.map((point) => ({
        profileId: point.profileId,
        effort: point.effort,
        isDefaultEffort: point.isDefaultEffort,
      })),
    }));
  const sourceCount =
    selectedSourceCount ?? series[0]?.points[0]?.sources.length ?? 0;
  const scoreAxisLabel =
    sourceCount <= 1 ? 'Source score' : `${sourceCount}-source mean score`;

  const toggleProfileVisibility = (profileId: string) => {
    setHiddenProfileIds((prev) => {
      const next = new Set(prev);
      if (next.has(profileId)) {
        next.delete(profileId);
      } else {
        next.add(profileId);
      }
      return next;
    });
  };

  const setModelVisibility = (
    eligibleProfileIds: readonly string[],
    visible: boolean,
  ) => {
    setHiddenProfileIds((prev) => {
      const next = new Set(prev);
      eligibleProfileIds.forEach((profileId) => {
        if (visible) next.delete(profileId);
        else next.add(profileId);
      });
      return next;
    });
  };

  const seriesById = new Map(series.map((line) => [line.seriesId, line]));
  const visibleSeries = series.flatMap((line) => {
    const points = line.points.filter(
      ({ profileId }) => !hiddenProfileIds.has(profileId),
    );
    return points.length > 0 ? [{ ...line, points }] : [];
  });
  const visiblePoints = visibleSeries.flatMap(({ points }) => points);
  const visibleProfileIds = new Set(
    visiblePoints.map(({ profileId }) => profileId),
  );
  const currentActivePoint = activePoint
    ? (series.flatMap((line) =>
        line.points
          .filter(({ profileId }) => profileId === activePoint.point.profileId)
          .map((point) => ({ series: line, point })),
      )[0] ?? null)
    : null;
  const xDomain = getChartDomain(visiblePoints.map((point) => point.costIndex));
  const yDomain = getChartDomain(visiblePoints.map((point) => point.score));
  const x = (cost: number) =>
    left +
    ((cost - xDomain.min) / (xDomain.max - xDomain.min)) * (right - left);
  const y = (score: number) =>
    bottom -
    ((score - yDomain.min) / (yDomain.max - yDomain.min)) * (bottom - top);

  const handleToggle = (pointProfileId: string) => {
    if (selectedProfileId === pointProfileId) {
      onToggleSelect?.(null);
    } else {
      onToggleSelect?.(pointProfileId);
    }
  };

  return controls.length > 0 ? (
    <div className="advanced-cost-layout">
      <div className="cost-plot-wrap">
        <div className="cost-chart-canvas">
          <svg
            className="cost-curve-chart advanced-cost-chart"
            viewBox="0 0 660 405"
            role="img"
            aria-label={`${scoreAxisLabel} (${yDomain.min}–${yDomain.max}) versus weighted normalized task cost index (${xDomain.min}–${xDomain.max}). Each line connects effort profiles for one model.`}
          >
            {yDomain.ticks.map((tick) => (
              <g key={`advanced-y-${tick}`}>
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
            {xDomain.ticks.map((tick) => (
              <g key={`advanced-x-${tick}`}>
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
              {`Weighted normalized task cost index (${xDomain.min}–${xDomain.max}, lower is better)`}
            </text>
            <text
              className="cost-axis-title"
              x="15"
              y={(top + bottom) / 2}
              textAnchor="middle"
              transform={`rotate(-90 15 ${(top + bottom) / 2})`}
            >
              {`${scoreAxisLabel} (${yDomain.min}–${yDomain.max}, higher is better)`}
            </text>
            <text className="cost-direction-label" x={left + 8} y={top + 15}>
              Better value ↖
            </text>
            {visibleSeries.map((line) => {
              const effortLadderPoints = line.points.filter(
                (point) => !point.isDefaultEffort,
              );
              const points = effortLadderPoints
                .map(
                  (point) =>
                    `${x(point.costIndex).toFixed(2)},${y(point.score).toFixed(2)}`,
                )
                .join(' ');
              return (
                <g key={line.seriesId}>
                  {effortLadderPoints.length > 1 ? (
                    <polyline
                      className="advanced-cost-line"
                      points={points}
                      stroke={providerColor(line.providerId)}
                      aria-label={`${line.displayName} effort curve`}
                    />
                  ) : null}
                  {line.points.map((point) => {
                    const selected = point.profileId === selectedProfileId;
                    return (
                      <circle
                        key={point.profileId}
                        className={`advanced-cost-point${selected ? ' is-selected' : ''}${point.isDefaultEffort ? ' is-default' : ''}`}
                        data-series-id={line.seriesId}
                        data-cost-index={point.costIndex.toFixed(2)}
                        cx={x(point.costIndex)}
                        cy={y(point.score)}
                        r={selected ? 8 : 6}
                        fill={providerColor(line.providerId)}
                        tabIndex={0}
                        role="img"
                        aria-label={`${point.displayName}. ${scoreAxisLabel} ${point.score.toFixed(1)}. Weighted normalized task cost ${point.costIndex.toFixed(1)}.`}
                        onClick={() => handleToggle(point.profileId)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleToggle(point.profileId);
                          }
                        }}
                        onPointerEnter={() =>
                          setActivePoint({ series: line, point })
                        }
                        onPointerLeave={() =>
                          setActivePoint((current) =>
                            current?.point.profileId === point.profileId
                              ? null
                              : current,
                          )
                        }
                        onFocus={() => setActivePoint({ series: line, point })}
                        onBlur={() =>
                          setActivePoint((current) =>
                            current?.point.profileId === point.profileId
                              ? null
                              : current,
                          )
                        }
                      />
                    );
                  })}
                </g>
              );
            })}
          </svg>
          {visiblePoints.length === 0 ? (
            <div className="cost-plot-empty" role="status">
              <strong>
                {sourceCount === 0
                  ? 'No sources selected'
                  : series.length === 0
                    ? 'No profiles match these sources'
                    : 'All efforts hidden'}
              </strong>
              <span>
                {sourceCount === 0
                  ? 'Turn on at least one source to calculate the advanced chart.'
                  : series.length === 0
                    ? 'Turn off a source to admit profiles with a smaller complete intersection.'
                    : 'Use a model checkbox or effort button to show a curve.'}
              </span>
            </div>
          ) : null}
          {currentActivePoint &&
          visibleProfileIds.has(currentActivePoint.point.profileId) ? (
            <div
              className="cost-hover-card"
              role="tooltip"
              aria-hidden="true"
              style={{
                left: `${((x(currentActivePoint.point.costIndex) / 660) * 100).toFixed(2)}%`,
                top: `${((y(currentActivePoint.point.score) / 405) * 100).toFixed(2)}%`,
                transform: getCardTransform(
                  x(currentActivePoint.point.costIndex),
                  y(currentActivePoint.point.score),
                ),
              }}
            >
              <div className="cost-hover-card-header">
                <span
                  className="provider-dot"
                  style={{
                    backgroundColor: providerColor(
                      currentActivePoint.series.providerId,
                    ),
                  }}
                  aria-hidden="true"
                />
                <strong className="cost-hover-card-title">
                  {currentActivePoint.series.displayName}
                </strong>
              </div>
              <div className="cost-hover-card-meta">
                {currentActivePoint.point.isDefaultEffort
                  ? 'default effort'
                  : `${currentActivePoint.point.effort} effort`}
              </div>
              <div className="cost-hover-card-metrics">
                <div className="cost-hover-card-row">
                  <span className="cost-hover-card-label">Mean score:</span>
                  <span className="cost-hover-card-value">
                    {currentActivePoint.point.score.toFixed(1)}
                  </span>
                </div>
                <div className="cost-hover-card-row">
                  <span className="cost-hover-card-label">
                    Weighted cost index:
                  </span>
                  <span className="cost-hover-card-value">
                    {currentActivePoint.point.costIndex.toFixed(1)}
                  </span>
                </div>
              </div>
              {currentActivePoint.point.sources.length > 0 ? (
                <div className="cost-hover-card-sources">
                  <div className="cost-hover-card-sources-title">
                    Source scores and costs
                  </div>
                  <ul className="cost-hover-card-source-list">
                    {currentActivePoint.point.sources.map((source) => (
                      <li
                        key={source.sourceId}
                        className="cost-hover-card-source-item"
                      >
                        <span>{sourceName(source.sourceId)}:</span>
                        <span>
                          score {source.score.toFixed(1)} · $
                          {source.cost.toFixed(3)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
        <p className="cost-frontier-caption">
          Lines connect effort profiles for the same model. Default
          configurations are marked separately and are not part of the effort
          ladder.
        </p>
      </div>

      <aside
        className="cost-model-legend"
        aria-label="Models in advanced cost chart"
      >
        <h3>Models</h3>
        <ul tabIndex={0} aria-label="Scrollable model legend">
          {controls.map((model) => {
            const currentLine = seriesById.get(model.seriesId);
            const eligiblePoints = currentLine?.points ?? [];
            const eligibleProfileIds = eligiblePoints.map(
              ({ profileId }) => profileId,
            );
            const eligibleSet = new Set(eligibleProfileIds);
            const visibleCount = eligibleProfileIds.filter(
              (profileId) => !hiddenProfileIds.has(profileId),
            ).length;
            const eligibleCount = eligibleProfileIds.length;
            const allEligibleVisible =
              eligibleCount > 0 && visibleCount === eligibleCount;
            const isMixed =
              visibleCount > 0 && visibleCount < model.efforts.length;
            const checkboxId = `series-toggle-${model.seriesId.replace(/[^a-zA-Z0-9_-]/g, '-')}`;
            const isSelected = model.efforts.some(
              ({ profileId }) => profileId === selectedProfileId,
            );
            return (
              <li
                key={model.seriesId}
                data-series-id={model.seriesId}
                className={isSelected ? 'is-selected' : undefined}
              >
                <div className="cost-model-control-header">
                  <label
                    htmlFor={checkboxId}
                    className="cost-legend-checkbox-label"
                  >
                    <input
                      ref={(node) => {
                        if (node) node.indeterminate = isMixed;
                      }}
                      type="checkbox"
                      id={checkboxId}
                      checked={allEligibleVisible && !isMixed}
                      disabled={eligibleCount === 0}
                      onChange={() =>
                        setModelVisibility(
                          model.efforts.map(({ profileId }) => profileId),
                          !allEligibleVisible,
                        )
                      }
                      className="cost-series-checkbox"
                      aria-label={`Toggle all ${model.displayName} effort profiles`}
                    />
                    <span
                      className="provider-dot"
                      style={{
                        backgroundColor: providerColor(model.providerId),
                      }}
                      aria-hidden="true"
                    />
                    <strong>{model.displayName}</strong>
                  </label>
                  <span
                    className="cost-model-effort-count"
                    aria-label={`${visibleCount} of ${model.efforts.length} effort profiles visible`}
                  >
                    {visibleCount}/{model.efforts.length}
                  </span>
                </div>
                {model.efforts.length > 1 ? (
                  <div
                    className="cost-effort-controls"
                    role="group"
                    aria-label={`${model.displayName} effort profiles`}
                  >
                    {model.efforts.map((effort) => {
                      const eligible = eligibleSet.has(effort.profileId);
                      const visible =
                        eligible && !hiddenProfileIds.has(effort.profileId);
                      return (
                        <button
                          key={effort.profileId}
                          type="button"
                          className="cost-effort-toggle"
                          data-profile-id={effort.profileId}
                          aria-pressed={visible}
                          disabled={!eligible}
                          title={
                            eligible
                              ? `${visible ? 'Hide' : 'Show'} ${model.displayName} ${effort.effort}`
                              : `${model.displayName} ${effort.effort} does not have complete data for the selected sources`
                          }
                          onClick={() =>
                            toggleProfileVisibility(effort.profileId)
                          }
                        >
                          {effort.effort}
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      </aside>
    </div>
  ) : (
    <div className="empty-state" role="status">
      <strong>No source-backed effort profiles</strong>
      <span>
        The advanced chart needs at least one effort with a pairable score and
        task cost.
      </span>
    </div>
  );
}

export function CostChart({
  defaultProduct,
  advancedProduct,
}: {
  /** Main-screen projection: complete display-set profiles only. */
  defaultProduct: PresetProductVersion;
  /** Full ProductVersion: preserves D4's non-display effort profiles. */
  advancedProduct: PresetProductVersion;
}) {
  const [advanced, setAdvanced] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(
    null,
  );
  const [advancedSourceIds, setAdvancedSourceIds] = useState<
    Set<AdvancedCostSourceId>
  >(() => new Set(ADVANCED_COST_SOURCE_IDS));
  const points = buildWeightedCostCurve(defaultProduct);
  const selectedAdvancedSourceIds = ADVANCED_COST_SOURCE_IDS.filter(
    (sourceId) => advancedSourceIds.has(sourceId),
  );
  const series = buildAdvancedCostSeries(
    advancedProduct,
    selectedAdvancedSourceIds,
  );
  const advancedModelOptions = buildAdvancedCostModelOptions(advancedProduct);
  const advancedPanelId = 'advanced-cost-chart-panel';

  const handleToggleSelect = (profileId: string | null) => {
    setSelectedProfileId(profileId);
  };

  const toggleAdvancedSource = (sourceId: AdvancedCostSourceId) => {
    setAdvancedSourceIds((current) => {
      const next = new Set(current);
      if (next.has(sourceId)) next.delete(sourceId);
      else next.add(sourceId);
      return next;
    });
  };

  return (
    <div className="dashboard-section">
      <p className="eyebrow section-eyebrow">Price efficiency</p>
      <section
        className="panel chart-panel cost-panel"
        aria-labelledby="cost-title"
        data-cost-mode={advanced ? 'advanced' : 'default'}
      >
        <div className="section-heading compact">
          <div>
            <h2 id="cost-title">Quality vs. Cost</h2>
            <p>Lower cost is better. Higher Overall Score is better.</p>
          </div>
          <div className="cost-chart-actions">
            {!advanced ? (
              <p className="cost-weight-note">
                {weightNote(COST_SOURCE_WEIGHTS)}
              </p>
            ) : (
              <div
                className="advanced-source-controls"
                role="group"
                aria-label="Sources used in the advanced cost chart"
              >
                {ADVANCED_COST_SOURCE_IDS.map((sourceId) => {
                  const enabled = advancedSourceIds.has(sourceId);
                  return (
                    <button
                      key={sourceId}
                      type="button"
                      className="advanced-source-toggle"
                      data-source-id={sourceId}
                      aria-pressed={enabled}
                      onClick={() => toggleAdvancedSource(sourceId)}
                    >
                      {sourceName(sourceId)}
                    </button>
                  );
                })}
              </div>
            )}
            <button
              type="button"
              className="cost-mode-toggle"
              aria-label={
                advanced
                  ? 'Show default cost chart'
                  : 'Show advanced effort curves'
              }
              aria-expanded={advanced}
              aria-controls={advancedPanelId}
              onClick={() => setAdvanced((current) => !current)}
            >
              {advanced ? 'Default' : 'Advanced'}
            </button>
          </div>
        </div>

        <div id={advancedPanelId}>
          {advanced ? (
            <AdvancedCostPlot
              series={series}
              modelOptions={advancedModelOptions}
              selectedSourceCount={selectedAdvancedSourceIds.length}
              selectedProfileId={selectedProfileId}
              onToggleSelect={handleToggleSelect}
            />
          ) : (
            <DefaultCostPlot
              points={points}
              selectedProfileId={selectedProfileId}
              onToggleSelect={handleToggleSelect}
            />
          )}
        </div>

        <span className="sr-only">
          Configured weights:{' '}
          {Object.entries(COST_SOURCE_WEIGHTS)
            .map(([source, weight]) => `${source} ${weight * 100}%`)
            .join(', ')}
          . Advanced sources enabled:{' '}
          {selectedAdvancedSourceIds.join(', ') || 'none'}. API standardized
          token prices are excluded from both charts.
        </span>
      </section>
    </div>
  );
}
