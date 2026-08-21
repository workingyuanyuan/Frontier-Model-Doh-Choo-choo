import type {
  DimensionId,
  DisplaySet,
  ProductVersion,
} from '@llm-bench/benchmark-data';
import { useState } from 'react';

import { profileById, type DeveloperModelRow } from '../lib/view-model';
import { ModelDetailPanel } from './model-detail-panel';

export interface DeveloperModelListProps {
  rows: DeveloperModelRow[];
  product?: ProductVersion | undefined;
  benchmarkDimensions?: Record<string, DimensionId> | undefined;
  displaySet?: DisplaySet | null | undefined;
  initialExpandedModelIds?: string[] | undefined;
}

export function DeveloperModelList({
  rows,
  product,
  benchmarkDimensions,
  displaySet,
  initialExpandedModelIds,
}: DeveloperModelListProps) {
  const [expandedModelIds, setExpandedModelIds] = useState<string[]>(
    initialExpandedModelIds ?? [],
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
      className="panel developer-model-panel"
      aria-labelledby="developer-models-title"
      data-developer-models
    >
      <div className="section-heading compact">
        <div>
          <p className="eyebrow">Developer diagnostics</p>
          <h2 id="developer-models-title">Excluded model cells</h2>
          <p>
            These models are outside the main matrix. Missing benchmark cells
            are listed without calculating aggregate scores.
          </p>
        </div>
      </div>
      {rows.length > 0 ? (
        <ul className="developer-model-list">
          {rows.map((row) => {
            const isExpanded = expandedModelIds.includes(row.modelId);
            const profile = product
              ? profileById(product, row.profileId)
              : undefined;

            return (
              <li key={row.profileId} data-developer-model={row.modelId}>
                <button
                  type="button"
                  className="developer-model-button"
                  onClick={() => {
                    toggleExpand(row.modelId);
                  }}
                  aria-expanded={isExpanded}
                >
                  <strong>{row.displayName}</strong>
                  <span>
                    {row.missingBenchmarkIds.length > 0
                      ? `Missing: ${row.missingBenchmarkIds.join(', ')}`
                      : 'Missing rendered dimension data'}
                  </span>
                </button>

                {isExpanded && profile && product && benchmarkDimensions ? (
                  <div
                    className="developer-model-detail-wrapper"
                    data-model-detail={row.modelId}
                  >
                    <ModelDetailPanel
                      profile={profile}
                      product={product}
                      benchmarkDimensions={benchmarkDimensions}
                      selectedResult={undefined}
                      displaySet={displaySet}
                    />
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="empty-state" role="status">
          No excluded models.
        </p>
      )}
    </section>
  );
}
