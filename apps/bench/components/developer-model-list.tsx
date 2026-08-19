import type { DeveloperModelRow } from '../lib/view-model';

export function DeveloperModelList({ rows }: { rows: DeveloperModelRow[] }) {
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
          {rows.map((row) => (
            <li key={row.profileId} data-developer-model={row.modelId}>
              <strong>{row.displayName}</strong>
              <span>
                {row.missingBenchmarkIds.length > 0
                  ? `Missing: ${row.missingBenchmarkIds.join(', ')}`
                  : 'Missing rendered dimension data'}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="empty-state" role="status">
          No excluded models.
        </p>
      )}
    </section>
  );
}
