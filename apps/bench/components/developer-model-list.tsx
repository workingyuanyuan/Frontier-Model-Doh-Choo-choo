import type { DeveloperModelRow } from '../lib/view-model';

export function DeveloperModelList({
  rows,
  selectedProfileId,
  onSelect,
}: {
  rows: DeveloperModelRow[];
  selectedProfileId?: string | undefined;
  onSelect?: ((modelId: string, profileId: string) => void) | undefined;
}) {
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
            const isSelected = row.profileId === selectedProfileId;
            return (
              <li
                key={row.profileId}
                data-developer-model={row.modelId}
                className={isSelected ? 'is-selected' : undefined}
              >
                {onSelect ? (
                  <button
                    type="button"
                    className="developer-model-button"
                    onClick={() => onSelect(row.modelId, row.profileId)}
                    aria-pressed={isSelected}
                  >
                    <strong>{row.displayName}</strong>
                    <span>
                      {row.missingBenchmarkIds.length > 0
                        ? `Missing: ${row.missingBenchmarkIds.join(', ')}`
                        : 'Missing rendered dimension data'}
                    </span>
                  </button>
                ) : (
                  <>
                    <strong>{row.displayName}</strong>
                    <span>
                      {row.missingBenchmarkIds.length > 0
                        ? `Missing: ${row.missingBenchmarkIds.join(', ')}`
                        : 'Missing rendered dimension data'}
                    </span>
                  </>
                )}
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
