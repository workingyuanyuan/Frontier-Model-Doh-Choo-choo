'use client';

import { useMemo, useState } from 'react';

import {
  buildRadarPoints,
  buildRadarSegments,
  pointsAttribute,
  polarPoint,
} from '../lib/visualization';
import {
  UI_DIMENSION_IDS,
  UI_DIMENSION_ABBREVIATIONS,
} from '../lib/ui-contract';
import {
  getProfileDisplayName,
  getRepresentativeRows,
  type PresetProductVersion,
} from '../lib/view-model';

export function RadarChart({
  product,
  comparisonProduct,
}: {
  product: PresetProductVersion;
  comparisonProduct?: PresetProductVersion;
}) {
  const center = 140;
  const radius = 92;

  const targetProduct = comparisonProduct ?? product;
  const initialSeriesIds = useMemo(() => {
    const reps = getRepresentativeRows(targetProduct);
    return reps[0] ? [reps[0].profileId] : [];
  }, [targetProduct]);

  const [seriesProfileIds, setSeriesProfileIds] =
    useState<string[]>(initialSeriesIds);

  const getSeriesData = (profileId: string) => {
    const profile = product.profiles.find((p) => p.id === profileId);
    const result = product.leaderboard.find((l) => l.profileId === profileId);
    if (!profile || !result) return null;
    return {
      profileId,
      displayName: getProfileDisplayName(profile),
      dimensions: result.dimensions,
    };
  };

  const seriesList = useMemo(() => {
    return seriesProfileIds
      .map((id) => getSeriesData(id))
      .filter((data): data is NonNullable<typeof data> => data !== null);
  }, [seriesProfileIds, product]);

  const handleRemoveSeries = (profileId: string) => {
    setSeriesProfileIds((prev) => prev.filter((id) => id !== profileId));
  };

  const seriesModelIds = useMemo(() => {
    return seriesList
      .map((s) => {
        const p = product.profiles.find((prof) => prof.id === s.profileId);
        return p?.modelId ?? '';
      })
      .filter(Boolean);
  }, [seriesList, product.profiles]);

  const availableComparisonRows = useMemo(() => {
    const reps = getRepresentativeRows(targetProduct);
    return reps.filter((row) => !seriesModelIds.includes(row.modelId));
  }, [targetProduct, seriesModelIds]);

  const modelNames = seriesList.map((s) => s.displayName).join(' vs ');
  const textualSummary = seriesList
    .map((series) => {
      const values = UI_DIMENSION_IDS.map((dimensionId) => {
        const value = series.dimensions.find(
          (dimension) => dimension.dimension === dimensionId,
        )?.score;
        return `${UI_DIMENSION_ABBREVIATIONS[dimensionId]}: ${value === null || value === undefined ? 'N/A' : value.toFixed(1)}`;
      }).join(', ');
      return `${series.displayName}: ${values}`;
    })
    .join('. ');
  const hasMissingValues = seriesList.some((series) =>
    UI_DIMENSION_IDS.some(
      (dimensionId) =>
        series.dimensions.find(
          (dimension) => dimension.dimension === dimensionId,
        )?.score == null,
    ),
  );

  return (
    <section
      className="panel chart-panel"
      data-max-series="3"
      aria-labelledby="profile-title"
    >
      <div className="section-heading compact">
        <div>
          <p className="eyebrow">Capability profile</p>
          <h2 id="profile-title">Five Dimensions</h2>
          <div className="series-controls">
            {seriesList.length < 3 && availableComparisonRows.length > 0 && (
              <div className="add-model-container">
                <label htmlFor="add-model-select" className="sr-only">
                  Add model for comparison
                </label>
                <select
                  id="add-model-select"
                  data-add-model
                  data-max-series="3"
                  className="add-model-select"
                  value=""
                  onChange={(e) => {
                    const val = e.target.value;
                    if (
                      val &&
                      !seriesProfileIds.includes(val) &&
                      seriesProfileIds.length < 3
                    ) {
                      setSeriesProfileIds((prev) => [...prev, val]);
                    }
                  }}
                >
                  <option value="" disabled>
                    Add model...
                  </option>
                  {availableComparisonRows.map((row) => {
                    const profile = product.profiles.find(
                      (p) => p.id === row.profileId,
                    );
                    const displayName = profile
                      ? getProfileDisplayName(profile)
                      : row.modelId;
                    return (
                      <option key={row.modelId} value={row.profileId}>
                        {displayName}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}
            <div className="series-legend">
              {seriesList.map((series, sIndex) => (
                <div
                  key={series.profileId}
                  className={`legend-chip series-tone-${sIndex + 1}`}
                >
                  <span
                    className={`legend-chip-color series-tone-${sIndex + 1}`}
                  />
                  <span className="legend-chip-name">{series.displayName}</span>
                  <button
                    type="button"
                    className="remove-series-btn"
                    onClick={() => handleRemoveSeries(series.profileId)}
                    aria-label={`Remove ${series.displayName} from radar chart`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="radar-layout">
        <div>
          <svg
            className="radar-chart"
            viewBox="0 0 280 280"
            role="img"
            aria-label={
              modelNames
                ? `Five Dimensions radar chart for ${modelNames}. Missing values are omitted rather than drawn at zero.`
                : 'Five Dimensions radar chart. Missing values are omitted rather than drawn at zero.'
            }
            aria-describedby="radar-chart-description"
          >
            <title id="radar-chart-title">
              {modelNames
                ? `Five Dimensions radar chart for ${modelNames}`
                : 'Five Dimensions radar chart'}
            </title>
            <desc id="radar-chart-description">
              {textualSummary ? `${textualSummary}. ` : ''}
              {hasMissingValues
                ? 'Missing values are shown as N/A and omitted from the plotted shape.'
                : 'All five dimensions have available values.'}
            </desc>
            {[25, 50, 75, 100].map((level) => {
              const grid = UI_DIMENSION_IDS.map((_, index) =>
                polarPoint(
                  index,
                  UI_DIMENSION_IDS.length,
                  radius * (level / 100),
                  center,
                  center,
                ),
              );
              return (
                <polygon
                  key={level}
                  className="radar-grid"
                  points={pointsAttribute(grid)}
                />
              );
            })}
            {UI_DIMENSION_IDS.map((dimension, index) => {
              const endpoint = polarPoint(
                index,
                UI_DIMENSION_IDS.length,
                radius,
                center,
                center,
              );
              const textPoint = polarPoint(
                index,
                UI_DIMENSION_IDS.length,
                radius + 25,
                center,
                center,
              );
              return (
                <g key={dimension}>
                  <line
                    className="radar-axis"
                    x1={center}
                    y1={center}
                    x2={endpoint.x}
                    y2={endpoint.y}
                  />
                  <text
                    className="radar-label"
                    x={textPoint.x}
                    y={textPoint.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {UI_DIMENSION_ABBREVIATIONS[dimension]}
                  </text>
                </g>
              );
            })}
            {seriesList.map((series, sIndex) => {
              const values = buildRadarPoints(
                series.dimensions,
                UI_DIMENSION_IDS,
                center,
                center,
                radius,
              );
              if (values.some((point) => point === null)) {
                return buildRadarSegments(
                  series.dimensions,
                  UI_DIMENSION_IDS,
                  center,
                  center,
                  radius,
                ).map((segment, segmentIndex) => (
                  <polyline
                    key={`${series.profileId}-segment-${segmentIndex}`}
                    className={`radar-area series-tone-${sIndex + 1}`}
                    points={pointsAttribute(segment)}
                    fill="none"
                  />
                ));
              }
              return (
                <polygon
                  key={series.profileId}
                  className={`radar-area series-tone-${sIndex + 1}`}
                  points={pointsAttribute(
                    values.filter(
                      (point): point is NonNullable<typeof point> =>
                        point !== null,
                    ),
                  )}
                />
              );
            })}
            {seriesList.flatMap((series, sIndex) => {
              const values = buildRadarPoints(
                series.dimensions,
                UI_DIMENSION_IDS,
                center,
                center,
                radius,
              );
              return values.map((point, index) =>
                point ? (
                  <circle
                    key={`${series.profileId}-${UI_DIMENSION_IDS[index]}`}
                    className={`radar-point series-tone-${sIndex + 1}`}
                    cx={point.x}
                    cy={point.y}
                    r="4"
                    aria-hidden="true"
                  />
                ) : null,
              );
            })}
          </svg>
        </div>

        <div className="horizontal-score-bars">
          {UI_DIMENSION_IDS.map((dimensionId) => {
            return (
              <div className="dimension-bar-row" key={dimensionId}>
                <span className="dimension-bar-label">
                  {UI_DIMENSION_ABBREVIATIONS[dimensionId]}
                </span>
                <div className="dimension-bars-container">
                  {seriesList.map((series, sIndex) => {
                    const dimData = series.dimensions.find(
                      (d) => d.dimension === dimensionId,
                    );
                    const scoreVal = dimData?.score ?? null;
                    return (
                      <div className="series-bar-item" key={series.profileId}>
                        {scoreVal !== null ? (
                          <progress
                            max="100"
                            value={scoreVal}
                            className={`series-tone-${sIndex + 1}`}
                            aria-label={`${series.displayName} - ${dimensionId}: ${scoreVal.toFixed(1)}`}
                          />
                        ) : (
                          <div
                            className="bar-track"
                            role="img"
                            aria-label={`${series.displayName} - ${dimensionId}: N/A`}
                          >
                            <span className="bar-na">N/A</span>
                          </div>
                        )}
                        <span className="bar-score-label">
                          {scoreVal !== null ? scoreVal.toFixed(1) : 'N/A'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
