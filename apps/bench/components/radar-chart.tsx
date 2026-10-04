'use client';

import { memo, useMemo, useState } from 'react';

import {
  buildRadarPoints,
  buildRadarSegments,
  pointsAttribute,
  polarPoint,
} from '../lib/visualization';
import {
  getActiveDimensionIds,
  UI_DIMENSION_ABBREVIATIONS,
} from '../lib/ui-contract';
import {
  getProfileDisplayName,
  getRepresentativeRows,
  type PresetProductVersion,
} from '../lib/view-model';

export const RadarChart = memo(function RadarChart({
  product,
  comparisonProduct,
  fixedProfileIds,
}: {
  product: PresetProductVersion;
  comparisonProduct?: PresetProductVersion;
  fixedProfileIds?: string[] | undefined;
}) {
  const center = 140;
  const radius = 92;

  const targetProduct = comparisonProduct ?? product;
  const fixedComparison = fixedProfileIds !== undefined;
  const representativeRows = useMemo(
    () => (fixedComparison ? [] : getRepresentativeRows(targetProduct)),
    [targetProduct, fixedComparison],
  );

  const [seriesProfileIds, setSeriesProfileIds] = useState<string[]>(() => {
    // Preserve the default selection when a fixed comparison later becomes editable.
    const firstRow = (
      fixedComparison
        ? getRepresentativeRows(targetProduct)
        : representativeRows
    )[0];
    return firstRow ? [firstRow.profileId] : [];
  });

  const seriesList = useMemo(() => {
    const profiles = new Map(
      product.profiles.map((profile) => [profile.id, profile]),
    );
    const results = new Map(
      product.leaderboard.map((row) => [row.profileId, row]),
    );
    return (fixedProfileIds ?? seriesProfileIds)
      .map((profileId) => {
        const profile = profiles.get(profileId);
        const result = results.get(profileId);
        return profile && result
          ? {
              profileId,
              displayName: getProfileDisplayName(profile),
              dimensions: result.dimensions,
            }
          : null;
      })
      .filter((data): data is NonNullable<typeof data> => data !== null);
  }, [
    seriesProfileIds,
    fixedProfileIds,
    product.profiles,
    product.leaderboard,
  ]);

  const dimensionIds = useMemo(
    () => getActiveDimensionIds(seriesList),
    [seriesList],
  );
  const plottedSeries = useMemo(
    () =>
      seriesList.map((series) => {
        const values = buildRadarPoints(
          series.dimensions,
          dimensionIds,
          center,
          center,
          radius,
        );
        const segmented =
          dimensionIds.length < 3 || values.some((point) => point === null);
        return {
          ...series,
          values,
          segmented,
          segments:
            segmented && dimensionIds.length >= 2
              ? buildRadarSegments(
                  series.dimensions,
                  dimensionIds,
                  center,
                  center,
                  radius,
                )
              : [],
        };
      }),
    [seriesList, dimensionIds],
  );
  const dimensionTitle = dimensionIds.length
    ? `${['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six'][dimensionIds.length]} ${dimensionIds.length === 1 ? 'Dimension' : 'Dimensions'}`
    : 'Dimensions';

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
    return representativeRows.filter(
      (row) => !seriesModelIds.includes(row.modelId),
    );
  }, [representativeRows, seriesModelIds]);

  const modelNames = seriesList.map((s) => s.displayName).join(' vs ');
  const textualSummary = seriesList
    .map((series) => {
      const values = dimensionIds
        .map((dimensionId) => {
          const value = series.dimensions.find(
            (dimension) => dimension.dimension === dimensionId,
          )?.score;
          return `${UI_DIMENSION_ABBREVIATIONS[dimensionId]}: ${value === null || value === undefined ? 'N/A' : value.toFixed(1)}`;
        })
        .join(', ');
      return `${series.displayName}: ${values}`;
    })
    .join('. ');
  const hasMissingValues = seriesList.some((series) =>
    dimensionIds.some(
      (dimensionId) =>
        series.dimensions.find(
          (dimension) => dimension.dimension === dimensionId,
        )?.score == null,
    ),
  );

  return (
    <div className="dashboard-section">
      <p className="eyebrow section-eyebrow">Capability profile</p>
      <section
        className="panel chart-panel"
        data-max-series="3"
        aria-labelledby="profile-title"
      >
        <div className="section-heading compact">
          <div>
            <h2 id="profile-title">{dimensionTitle}</h2>
            <div className="series-controls">
              {!fixedProfileIds &&
                seriesList.length < 3 &&
                availableComparisonRows.length > 0 && (
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
                    className={`legend-chip series-tone-${(sIndex % 3) + 1}`}
                  >
                    <span
                      className={`legend-chip-color series-tone-${(sIndex % 3) + 1}`}
                    />
                    <span className="legend-chip-name">
                      {series.displayName}
                    </span>
                    {!fixedProfileIds ? (
                      <button
                        type="button"
                        className="remove-series-btn"
                        onClick={() => handleRemoveSeries(series.profileId)}
                        aria-label={`Remove ${series.displayName} from radar chart`}
                      >
                        ×
                      </button>
                    ) : null}
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
                  ? `${dimensionTitle} radar chart for ${modelNames}. Missing values are omitted rather than drawn at zero.`
                  : `${dimensionTitle} radar chart.`
              }
              aria-describedby="radar-chart-description"
            >
              <title id="radar-chart-title">
                {modelNames
                  ? `${dimensionTitle} radar chart for ${modelNames}`
                  : `${dimensionTitle} radar chart`}
              </title>
              <desc id="radar-chart-description">
                {textualSummary ? `${textualSummary}. ` : ''}
                {dimensionIds.length === 0
                  ? ''
                  : hasMissingValues
                    ? 'Missing values are shown as N/A and omitted from the plotted shape.'
                    : 'All plotted dimensions have available values.'}
              </desc>
              {(dimensionIds.length > 2 ? [25, 50, 75, 100] : []).map(
                (level) => {
                  const grid = dimensionIds.map((_, index) =>
                    polarPoint(
                      index,
                      dimensionIds.length,
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
                },
              )}
              {dimensionIds.map((dimension, index) => {
                const endpoint = polarPoint(
                  index,
                  dimensionIds.length,
                  radius,
                  center,
                  center,
                );
                const textPoint = polarPoint(
                  index,
                  dimensionIds.length,
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
              {plottedSeries.map((series, sIndex) => {
                const values = series.values;
                if (dimensionIds.length < 2) return null;
                if (series.segmented) {
                  return series.segments.map((segment, segmentIndex) => (
                    <polyline
                      key={`${series.profileId}-segment-${segmentIndex}`}
                      className={`radar-area series-tone-${(sIndex % 3) + 1}`}
                      points={pointsAttribute(segment)}
                      fill="none"
                    />
                  ));
                }
                return (
                  <polygon
                    key={series.profileId}
                    className={`radar-area series-tone-${(sIndex % 3) + 1}`}
                    points={pointsAttribute(
                      values.filter(
                        (point): point is NonNullable<typeof point> =>
                          point !== null,
                      ),
                    )}
                  />
                );
              })}
              {plottedSeries.flatMap((series, sIndex) => {
                return series.values.map((point, index) =>
                  point ? (
                    <circle
                      key={`${series.profileId}-${dimensionIds[index]}`}
                      className={`radar-point series-tone-${(sIndex % 3) + 1}`}
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
            {dimensionIds.map((dimensionId) => {
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
                              className={`series-tone-${(sIndex % 3) + 1}`}
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
    </div>
  );
});
