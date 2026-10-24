import type { DashboardProduct as ProductVersion } from '../lib/dashboard-data';
import type { DimensionId } from '@llm-bench/benchmark-data';
import { useMemo, useState } from 'react';

import {
  profileById,
  type DeveloperModelRow,
  type ProductPreset,
} from '../lib/view-model';
import {
  ModelDetailPanel,
  buildBenchmarkNameLookup,
} from './model-detail-panel';

const COLLAPSED_ROW_COUNT = 10;

export interface DeveloperModelListProps {
  rows: DeveloperModelRow[];
  product?: ProductVersion | undefined;
  benchmarkDimensions?: Record<string, DimensionId> | undefined;
  preset?: ProductPreset | null | undefined;
  initialExpandedModelIds?: string[] | undefined;
}

export function DeveloperModelList({
  rows,
  product,
  benchmarkDimensions,
  preset,
  initialExpandedModelIds,
}: DeveloperModelListProps) {
  const [expandedModelIds, setExpandedModelIds] = useState<string[]>(
    initialExpandedModelIds ?? [],
  );

  const [showAll, setShowAll] = useState(false);
  const visibleRows = showAll ? rows : rows.slice(0, COLLAPSED_ROW_COUNT);

  const benchmarkName = useMemo(
    () => buildBenchmarkNameLookup(product?.evidence ?? []),
    [product?.evidence],
  );

  const toggleExpand = (modelId: string) => {
    setExpandedModelIds((prev) =>
      prev.includes(modelId)
        ? prev.filter((id) => id !== modelId)
        : [...prev, modelId],
    );
  };

  return (
    <section
      className="diagnostics-section"
      aria-labelledby="developer-models-title"
      data-developer-models
    >
      <div className="diagnostics-heading">
        <h2 id="developer-models-title">Excluded models</h2>
        <span>{rows.length}</span>
      </div>
      {rows.length > 0 ? (
        <table className="diagnostics-table developer-model-table">
          <thead>
            <tr>
              <th scope="col">Model</th>
              <th scope="col" className="diagnostics-num">
                Gaps
              </th>
              <th scope="col">Missing benchmarks</th>
            </tr>
          </thead>
          {visibleRows.map((row) => {
            const isExpanded = expandedModelIds.includes(row.modelId);
            const profile = product
              ? profileById(product, row.profileId)
              : undefined;
            const missingNames = row.missingBenchmarkIds.map((id) =>
              benchmarkName(id),
            );

            return (
              <tbody
                key={row.profileId}
                data-developer-model={row.modelId}
                className={isExpanded ? 'is-expanded' : undefined}
              >
                <tr>
                  <th scope="row">
                    <button
                      type="button"
                      className="developer-model-button"
                      onClick={() => {
                        toggleExpand(row.modelId);
                      }}
                      aria-expanded={isExpanded}
                    >
                      <span className="expand-chevron" aria-hidden="true" />
                      {row.displayName}
                    </button>
                  </th>
                  <td className="diagnostics-num">
                    {missingNames.length || '—'}
                  </td>
                  <td className="developer-model-missing">
                    {missingNames.length > 0 ? (
                      <span title={missingNames.join(', ')}>
                        {missingNames.join(', ')}
                      </span>
                    ) : (
                      <span>No rendered dimension data</span>
                    )}
                  </td>
                </tr>
                {isExpanded && profile && product && benchmarkDimensions ? (
                  <tr className="developer-model-detail-row">
                    <td colSpan={3}>
                      <div
                        className="developer-model-detail-wrapper"
                        data-model-detail={row.modelId}
                      >
                        <ModelDetailPanel
                          profile={profile}
                          product={product}
                          benchmarkDimensions={benchmarkDimensions}
                          selectedResult={undefined}
                          preset={preset}
                          developerMode
                          showHeading={false}
                        />
                      </div>
                    </td>
                  </tr>
                ) : null}
              </tbody>
            );
          })}
        </table>
      ) : null}
      {rows.length > COLLAPSED_ROW_COUNT ? (
        <div className="diagnostics-footer">
          <button
            type="button"
            className="diagnostics-show-all"
            aria-expanded={showAll}
            onClick={() => setShowAll((current) => !current)}
          >
            {showAll ? 'Show fewer' : `Show all ${rows.length}`}
          </button>
        </div>
      ) : null}
      {rows.length === 0 ? (
        <p className="diagnostics-empty" role="status">
          No excluded models.
        </p>
      ) : null}
    </section>
  );
}
