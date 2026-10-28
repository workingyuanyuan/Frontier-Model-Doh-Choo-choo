'use client';

import {
  memo,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { getChartDomain } from '../lib/chart-scale';
import {
  ADVANCED_COST_SOURCE_IDS,
  AVAILABLE_ADVANCED_COST_SOURCE_IDS,
  COST_SOURCE_WEIGHTS,
  buildAdvancedCostModelOptions,
  buildAdvancedCostSeries,
  buildWeightedCostCurve,
  getCostParetoFrontier,
  missingAdvancedCostSources,
  type AdvancedCostModelOption,
  type AdvancedCostSeries,
  type AdvancedCostSourceId,
  type CostSourceScoreBasisId,
  type WeightedCostPoint,
  type PresetProductVersion,
} from '../lib/view-model';

/** Models visible on the advanced chart, each with its visible effort profiles. */
export type ChartShortlist = { modelId: string; profileIds: string[] }[];

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
  cursorbench: 'CursorBench',
  'openai-releases': 'OpenAI (vendor)',
  'anthropic-releases': 'Anthropic (vendor)',
  'xai-releases': 'xAI (vendor)',
  'google-releases': 'Google (vendor)',
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
  FRONTIER_CODE_2_0: 'Frontier Code 2.0',
  ARC_AGI: 'ARC-AGI-2',
  VALS_INDEX: 'Vals Index',
  ZAPIER_AUTOMATIONBENCH: 'AutomationBench',
  CURSORBENCH_4: 'CursorBench 4.0',
  NONE: 'cost only, no pairable score',
};

/** Names the basis once: "Frontier Code 2.0" plus version "2.0" reads as one. */
const scoreBasisLabel = (
  basis: CostSourceScoreBasisId,
  version?: string | null,
): string => {
  const name = SCORE_BASIS_NAMES[basis];
  if (!version || name.endsWith(version)) return name;
  return version.startsWith(name) ? version : `${name} ${version}`;
};

const scoreBasisNote = (
  basis: CostSourceScoreBasisId,
  score: number | null,
  version?: string | null,
): string =>
  basis === 'NONE' || score === null
    ? SCORE_BASIS_NAMES.NONE
    : `${scoreBasisLabel(basis, version)} ${score.toFixed(1)}`;

/** Sources carrying a weight, i.e. the largest source count a point can have. */
const WEIGHTED_SOURCE_COUNT = Object.keys(COST_SOURCE_WEIGHTS).length;

const providerColor = (providerId: string): string =>
  PROVIDER_COLORS[providerId] ?? '#64748b';

const sourceName = (sourceId: string): string =>
  SOURCE_NAMES[sourceId] ?? sourceId;

const costSourceName = (source: {
  sourceId: string;
  reportedSourceId?: string;
}): string =>
  `${sourceName(source.sourceId)}${source.reportedSourceId ? ` · ${sourceName(source.reportedSourceId)}` : ''}`;

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

/** Gap, in px, the hover card keeps from the chart's left and right edges. */
const CARD_EDGE_INSET = 8;

/**
 * The hover card is anchored beside its point, then nudged horizontally after
 * layout so it never spills past the chart: on a phone the card can be wider
 * than the room on either side of the point.
 */
function CostHoverCard({
  x,
  y,
  children,
}: {
  x: number;
  y: number;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const card = ref.current;
    const canvas = card?.parentElement;
    if (!card || !canvas) return;
    card.style.marginLeft = '0px';
    const bounds = canvas.getBoundingClientRect();
    const box = card.getBoundingClientRect();
    const overLeft = bounds.left + CARD_EDGE_INSET - box.left;
    const overRight = box.right - (bounds.right - CARD_EDGE_INSET);
    const shift = overLeft > 0 ? overLeft : overRight > 0 ? -overRight : 0;
    card.style.marginLeft = `${shift}px`;
  });
  return (
    <div
      ref={ref}
      className="cost-hover-card"
      role="tooltip"
      aria-hidden="true"
      style={{
        left: `${((x / 660) * 100).toFixed(2)}%`,
        top: `${((y / 405) * 100).toFixed(2)}%`,
        transform: getCardTransform(x, y),
      }}
    >
      {children}
    </div>
  );
}

/**
 * Short axis titles set outside the plot: the score title reads horizontally
 * above the Y axis and the cost title sits right-aligned under the X axis end,
 * each followed by its plotted range and a direction hint in muted type. The
 * range stays visible because the axes are truncated to the data and the
 * title is where that is disclosed (docs/SPEC.md); data attributes expose the
 * same bounds to tests.
 */
function CostAxisTitles({
  scoreLabel,
  xDomain,
  yDomain,
  right,
  bottom,
}: {
  scoreLabel: string;
  xDomain: { min: number; max: number };
  yDomain: { min: number; max: number };
  right: number;
  bottom: number;
}) {
  return (
    <>
      <text
        className="cost-axis-title"
        x={right}
        y={bottom + 44}
        textAnchor="end"
        data-domain-min={xDomain.min}
        data-domain-max={xDomain.max}
      >
        <tspan className="cost-axis-hint">← lower is better</tspan>
        <tspan dx="12">Weighted cost index</tspan>
        <tspan className="cost-axis-hint" dx="6">
          {`${xDomain.min}–${xDomain.max}`}
        </tspan>
      </text>
      <text
        className="cost-axis-title"
        x="8"
        y="14"
        data-domain-min={yDomain.min}
        data-domain-max={yDomain.max}
      >
        <tspan>{scoreLabel}</tspan>
        <tspan className="cost-axis-hint" dx="6">
          {`${yDomain.min}–${yDomain.max}`}
        </tspan>
        <tspan className="cost-axis-hint" dx="12">
          ↑ higher is better
        </tspan>
      </text>
    </>
  );
}

export function CostModelMenu({
  advanced,
  open,
  menuId,
  points,
  series,
  modelOptions,
  selectedProfileId,
  hiddenProfileIds,
  selectedSourceIds = ADVANCED_COST_SOURCE_IDS,
  onToggleOpen,
  onToggleSelect,
  onUpdateHiddenProfileIds,
  onUseInLeaderboard,
}: {
  advanced: boolean;
  open: boolean;
  menuId: string;
  points: WeightedCostPoint[];
  series: AdvancedCostSeries[];
  modelOptions: AdvancedCostModelOption[];
  selectedProfileId: string | null;
  hiddenProfileIds: Set<string>;
  selectedSourceIds?: readonly AdvancedCostSourceId[];
  onToggleOpen: () => void;
  onToggleSelect: (profileId: string | null) => void;
  onUpdateHiddenProfileIds: (
    update: (current: Set<string>) => Set<string>,
  ) => void;
  onUseInLeaderboard?: ((models: ChartShortlist) => void) | undefined;
}) {
  const seriesById = new Map(series.map((line) => [line.seriesId, line]));
  const orderedOptions = modelOptions.toSorted(
    (leftModel, rightModel) =>
      Number(seriesById.has(rightModel.seriesId)) -
      Number(seriesById.has(leftModel.seriesId)),
  );

  const shortlist: ChartShortlist = series.flatMap((line) => {
    const profileIds = line.points
      .map(({ profileId }) => profileId)
      .filter((profileId) => !hiddenProfileIds.has(profileId));
    return profileIds.length ? [{ modelId: line.modelId, profileIds }] : [];
  });

  const toggleProfileVisibility = (profileId: string) => {
    onUpdateHiddenProfileIds((current) => {
      const next = new Set(current);
      if (next.has(profileId)) next.delete(profileId);
      else next.add(profileId);
      return next;
    });
  };

  return (
    <div className="cost-model-overflow">
      <button
        type="button"
        className="cost-model-overflow-trigger"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={onToggleOpen}
      >
        <span>Models</span>
        <svg
          className="cost-model-overflow-chevron"
          viewBox="0 0 12 12"
          aria-hidden="true"
        >
          <path d="M2.5 4.25 6 7.75l3.5-3.5" />
        </svg>
      </button>
      <div id={menuId} className="cost-model-overflow-menu" hidden={!open}>
        <ul
          className="cost-model-menu-list"
          aria-label={`Models in ${advanced ? 'advanced' : 'default'} cost chart`}
        >
          {advanced
            ? orderedOptions.map((model) => {
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
                const missingSourceIds =
                  eligibleCount === 0
                    ? missingAdvancedCostSources(model, selectedSourceIds)
                    : [];

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
                            onUpdateHiddenProfileIds((current) => {
                              const next = new Set(current);
                              model.efforts.forEach(({ profileId }) => {
                                if (allEligibleVisible) next.add(profileId);
                                else next.delete(profileId);
                              });
                              return next;
                            })
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
                      {missingSourceIds.map((sourceId) => (
                        <span
                          key={sourceId}
                          className="cost-model-missing-source"
                          data-source-id={sourceId}
                          aria-label={`Missing ${sourceName(sourceId)}`}
                        >
                          {sourceName(sourceId)}
                        </span>
                      ))}
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
                                  : `${model.displayName} ${effort.effort} is missing ${selectedSourceIds
                                      .filter(
                                        (sourceId) =>
                                          !effort.sourceIds.includes(sourceId),
                                      )
                                      .map(sourceName)
                                      .join(', ')}`
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
              })
            : points
                .toSorted(
                  (leftPoint, rightPoint) =>
                    rightPoint.performance - leftPoint.performance ||
                    leftPoint.normalizedCost - rightPoint.normalizedCost,
                )
                .map((point) => {
                  const selected = defaultPointIsSelected(
                    point,
                    selectedProfileId,
                  );
                  return (
                    <li
                      key={point.modelId}
                      data-profile-id={point.profileId}
                      className={selected ? 'is-selected' : undefined}
                    >
                      <button
                        type="button"
                        aria-pressed={selected}
                        onClick={() =>
                          onToggleSelect(selected ? null : point.profileId)
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
                      </button>
                    </li>
                  );
                })}
        </ul>
        {advanced ? (
          // Laid out like the Search Models picker: the primary action on the
          // left, then Clear and Default.
          <div className="picker-actions cost-model-menu-actions">
            {onUseInLeaderboard ? (
              <button
                type="button"
                disabled={!shortlist.length}
                onClick={() => onUseInLeaderboard(shortlist)}
              >
                Use in Leaderboard
              </button>
            ) : null}
            <button
              type="button"
              onClick={() =>
                onUpdateHiddenProfileIds(
                  () =>
                    new Set(
                      modelOptions.flatMap(({ efforts }) =>
                        efforts.map(({ profileId }) => profileId),
                      ),
                    ),
                )
              }
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => onUpdateHiddenProfileIds(() => new Set())}
            >
              Default
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export const DefaultCostPlot = memo(function DefaultCostPlot({
  points,
  selectedProfileId = null,
  onToggleSelect,
  initialActivePoint = null,
  developerMode = false,
}: {
  points: WeightedCostPoint[];
  selectedProfileId?: string | null;
  onToggleSelect?: (profileId: string | null) => void;
  initialActivePoint?: WeightedCostPoint | null;
  developerMode?: boolean;
}) {
  const [activePoint, setActivePoint] = useState<WeightedCostPoint | null>(
    initialActivePoint,
  );
  const frontier = useMemo(() => getCostParetoFrontier(points), [points]);
  const left = 58;
  const right = 610;
  const top = 28;
  const bottom = 350;
  const xDomain = useMemo(
    () => getChartDomain(points.map((point) => point.normalizedCost)),
    [points],
  );
  const yDomain = useMemo(
    () => getChartDomain(points.map((point) => point.performance)),
    [points],
  );
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
                <CostAxisTitles
                  scoreLabel="Overall Score"
                  xDomain={xDomain}
                  yDomain={yDomain}
                  right={right}
                  bottom={bottom}
                />
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
                <CostHoverCard
                  x={x(activePoint.normalizedCost)}
                  y={y(activePoint.performance)}
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
                              {costSourceName(source)} ({source.profileId}) :
                            </span>
                            <span>${source.cost.toFixed(3)}</span>
                            <span className="cost-hover-card-source-basis">
                              {scoreBasisNote(
                                source.scoreBasis,
                                source.sourceScore,
                                source.scoreBenchmarkVersion,
                              )}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </CostHoverCard>
              ) : null}
            </div>
          </div>
        </div>
      ) : (
        <div className="empty-state" role="status">
          <strong>No comparable task-cost points</strong>
          <span>At least one source-backed task cost is required.</span>
        </div>
      )}

      {developerMode ? (
        <details className="chart-data cost-chart-data">
          <summary>Source breakdown</summary>
          <table className="diagnostics-table cost-source-table">
            <thead>
              <tr>
                <th scope="col">Model</th>
                <th scope="col" className="diagnostics-num">
                  Cost
                </th>
                <th scope="col" className="diagnostics-num">
                  Overall
                </th>
                <th scope="col" className="diagnostics-num">
                  Sources
                </th>
                <th scope="col">Task cost · paired score</th>
              </tr>
            </thead>
            <tbody>
              {points.map((point) => (
                <tr key={point.modelId}>
                  <th scope="row">{point.displayName}</th>
                  <td className="diagnostics-num">
                    {point.normalizedCost.toFixed(1)}
                  </td>
                  <td className="diagnostics-num">
                    {point.performance.toFixed(1)}
                  </td>
                  <td
                    className="diagnostics-num"
                    data-testid="cost-row-source-count"
                  >
                    {point.sourceCount} of {WEIGHTED_SOURCE_COUNT}
                  </td>
                  <td>
                    <ul className="cost-source-list">
                      {point.sourceCosts.map((source) => (
                        <li key={source.sourceId}>
                          <a href={source.sourceUrl}>
                            {costSourceName(source)}
                          </a>
                          <span className="cost-source-value">
                            ${source.cost.toFixed(3)}
                          </span>
                          <span
                            className={`cost-source-basis${source.scoreBasis === 'NONE' || source.sourceScore === null ? ' is-cost-only' : ''}`}
                          >
                            {scoreBasisNote(
                              source.scoreBasis,
                              source.sourceScore,
                              source.scoreBenchmarkVersion,
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      ) : null}
    </>
  );
});

export const AdvancedCostPlot = memo(function AdvancedCostPlot({
  series,
  modelOptions,
  selectedSourceCount,
  selectedProfileId = null,
  onToggleSelect,
  initialActivePoint = null,
  initialHiddenSeriesIds,
  initialHiddenProfileIds,
  hiddenProfileIds: controlledHiddenProfileIds,
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
  hiddenProfileIds?: Set<string>;
}) {
  const [internalHiddenProfileIds] = useState<Set<string>>(
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
  const hiddenProfileIds =
    controlledHiddenProfileIds ?? internalHiddenProfileIds;
  const left = 62;
  const right = 610;
  const top = 28;
  const bottom = 350;
  const controls =
    modelOptions ?? series.map((line) => ({ seriesId: line.seriesId }));
  const sourceCount =
    selectedSourceCount ?? series[0]?.points[0]?.sources.length ?? 0;
  const scoreAxisLabel =
    sourceCount <= 1 ? 'Source score' : `${sourceCount}-source mean score`;

  const visibleSeries = useMemo(
    () =>
      series.flatMap((line) => {
        const points = line.points.filter(
          ({ profileId }) => !hiddenProfileIds.has(profileId),
        );
        return points.length > 0 ? [{ ...line, points }] : [];
      }),
    [series, hiddenProfileIds],
  );
  const visiblePoints = useMemo(
    () => visibleSeries.flatMap(({ points }) => points),
    [visibleSeries],
  );
  const visibleProfileIds = useMemo(
    () => new Set(visiblePoints.map(({ profileId }) => profileId)),
    [visiblePoints],
  );
  const currentActivePoint = activePoint
    ? (series.flatMap((line) =>
        line.points
          .filter(({ profileId }) => profileId === activePoint.point.profileId)
          .map((point) => ({ series: line, point })),
      )[0] ?? null)
    : null;
  const xDomain = useMemo(
    () => getChartDomain(visiblePoints.map((point) => point.costIndex)),
    [visiblePoints],
  );
  const yDomain = useMemo(
    () => getChartDomain(visiblePoints.map((point) => point.score)),
    [visiblePoints],
  );
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
            <CostAxisTitles
              scoreLabel={scoreAxisLabel}
              xDomain={xDomain}
              yDomain={yDomain}
              right={right}
              bottom={bottom}
            />
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
                        data-profile-id={point.profileId}
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
            <CostHoverCard
              x={x(currentActivePoint.point.costIndex)}
              y={y(currentActivePoint.point.score)}
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
                  <ul className="cost-hover-card-source-list has-score-column">
                    {currentActivePoint.point.sources.map((source) => (
                      <li
                        key={source.sourceId}
                        className="cost-hover-card-source-item"
                      >
                        <span>
                          <a href={source.sourceUrl}>
                            {costSourceName(source)}
                          </a>
                          {source.scoreBenchmarkVersion
                            ? ` ${source.scoreBenchmarkVersion}`
                            : ''}
                          :
                        </span>
                        <span>score {source.score.toFixed(1)}</span>
                        <span>${source.cost.toFixed(3)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </CostHoverCard>
          ) : null}
        </div>
      </div>
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
});

export const CostChart = memo(function CostChart({
  defaultProduct,
  advancedProduct,
  developerMode = false,
  onUseInLeaderboard,
}: {
  /** Main-screen projection: complete display-set profiles only. */
  defaultProduct: PresetProductVersion;
  /** Full ProductVersion: preserves D4's non-display effort profiles. */
  advancedProduct: PresetProductVersion;
  developerMode?: boolean;
  /** Hands the models and efforts visible on the advanced chart to the leaderboard. */
  onUseInLeaderboard?: ((models: ChartShortlist) => void) | undefined;
}) {
  const [advanced, setAdvanced] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(
    null,
  );
  const [advancedSourceIds, setAdvancedSourceIds] = useState<
    Set<AdvancedCostSourceId>
  >(() => new Set(ADVANCED_COST_SOURCE_IDS));
  const [advancedHiddenProfileIds, setAdvancedHiddenProfileIds] = useState(
    () => new Set<string>(),
  );
  const [modelMenuOpen, setModelMenuOpen] = useState(false);
  const points = useMemo(
    () => buildWeightedCostCurve(defaultProduct),
    [defaultProduct],
  );
  const selectedAdvancedSourceIds = useMemo(
    () =>
      AVAILABLE_ADVANCED_COST_SOURCE_IDS.filter((sourceId) =>
        advancedSourceIds.has(sourceId),
      ),
    [advancedSourceIds],
  );
  const series = useMemo(
    () =>
      advanced
        ? buildAdvancedCostSeries(advancedProduct, selectedAdvancedSourceIds)
        : [],
    [advanced, advancedProduct, selectedAdvancedSourceIds],
  );
  const advancedModelOptions = useMemo(
    () => (advanced ? buildAdvancedCostModelOptions(advancedProduct) : []),
    [advanced, advancedProduct],
  );
  const advancedPanelId = 'advanced-cost-chart-panel';

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
                {AVAILABLE_ADVANCED_COST_SOURCE_IDS.map((sourceId) => {
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
            <div className="cost-chart-primary-actions">
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
                onClick={() => {
                  setAdvanced((current) => !current);
                  setModelMenuOpen(false);
                }}
              >
                {advanced ? 'Default' : 'Advanced'}
              </button>
              <CostModelMenu
                advanced={advanced}
                open={modelMenuOpen}
                menuId="cost-chart-models-menu"
                points={points}
                series={series}
                modelOptions={advancedModelOptions}
                selectedProfileId={selectedProfileId}
                hiddenProfileIds={advancedHiddenProfileIds}
                selectedSourceIds={selectedAdvancedSourceIds}
                onToggleOpen={() => setModelMenuOpen((current) => !current)}
                onToggleSelect={setSelectedProfileId}
                onUpdateHiddenProfileIds={(update) =>
                  setAdvancedHiddenProfileIds(update)
                }
                onUseInLeaderboard={
                  onUseInLeaderboard &&
                  ((models) => {
                    setModelMenuOpen(false);
                    onUseInLeaderboard(models);
                  })
                }
              />
            </div>
          </div>
        </div>

        <div id={advancedPanelId}>
          {advanced ? (
            <AdvancedCostPlot
              series={series}
              modelOptions={advancedModelOptions}
              selectedSourceCount={selectedAdvancedSourceIds.length}
              selectedProfileId={selectedProfileId}
              onToggleSelect={setSelectedProfileId}
              hiddenProfileIds={advancedHiddenProfileIds}
            />
          ) : (
            <DefaultCostPlot
              points={points}
              selectedProfileId={selectedProfileId}
              onToggleSelect={setSelectedProfileId}
              developerMode={developerMode}
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
});
