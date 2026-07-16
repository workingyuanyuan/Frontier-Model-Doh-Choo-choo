import type { CandidateResult, ModelProfile } from '@llm-bench/benchmark-data';

type EvidenceDetailProps = {
  profile: ModelProfile;
  evidence: CandidateResult[];
};

const displayScore = (value: number | null) =>
  value === null ? 'N/A' : value.toFixed(1);

export function EvidenceDetail({ profile, evidence }: EvidenceDetailProps) {
  return (
    <section className="panel evidence-panel" aria-labelledby="evidence-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Audit trail</p>
          <h2 id="evidence-title">Score evidence</h2>
          <p>
            Results collected for {profile.displayName}, including excluded
            evidence.
          </p>
        </div>
        <div
          className="evidence-count"
          aria-label={`${evidence.length} evidence rows`}
        >
          {evidence.length} rows
        </div>
      </div>

      {evidence.length ? (
        <div className="table-scroll">
          <table className="evidence-table">
            <thead>
              <tr>
                <th scope="col">Benchmark</th>
                <th scope="col">Score</th>
                <th scope="col">Source</th>
                <th scope="col">Acquisition</th>
                <th scope="col">Decision</th>
              </tr>
            </thead>
            <tbody>
              {evidence.map((result) => (
                <tr key={result.id}>
                  <th scope="row" data-label="Benchmark">
                    <a href={result.sourceUrl} target="_blank" rel="noreferrer">
                      {result.benchmarkId}
                    </a>
                    <span>
                      Version {result.benchmarkVersion ?? 'not published'}
                    </span>
                  </th>
                  <td data-label="Score">
                    <strong>
                      {result.rawScore.toFixed(1)} {result.metric.unit}
                    </strong>
                    <span>
                      Normalized {displayScore(result.normalizedScore)}
                    </span>
                  </td>
                  <td data-label="Source">
                    <strong>{result.sourceId}</strong>
                    <span>{result.sourceRole}</span>
                  </td>
                  <td data-label="Acquisition">
                    <span
                      className={`status-badge acquisition-${result.acquisitionStatus.toLowerCase()}`}
                    >
                      {result.acquisitionStatus}
                    </span>
                  </td>
                  <td data-label="Decision">
                    <span
                      className={`status-badge inclusion-${result.inclusion.toLowerCase()}`}
                    >
                      {result.inclusion === 'INCLUDED'
                        ? 'Included'
                        : 'Excluded'}
                    </span>
                    {result.exclusionReason ? (
                      <span className="exclusion-reason">
                        {result.exclusionReason}
                      </span>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state" role="status">
          <strong>No profile-specific evidence</strong>
          <span>
            This profile is discoverable, but its detailed rows are not in this
            dataset.
          </span>
        </div>
      )}
    </section>
  );
}
