import type {
  DimensionId,
  ModelProfile,
  ProductEvidence,
} from '@llm-bench/benchmark-data';
import { useState } from 'react';

import { getProfileDisplayName } from '../lib/view-model';
import { UI_DIMENSION_ABBREVIATIONS } from '../lib/ui-contract';
import {
  groupEvidenceByDimension,
  sortEvidenceRows,
  type EvidenceSortKey,
  type SortDirection,
} from '../lib/table-sort';

type EvidenceDetailProps = {
  profile: ModelProfile;
  evidence: ProductEvidence[];
  benchmarkDimensions: Record<string, DimensionId>;
  selectedResult?:
    | {
        dimensions: Array<{
          dimension: DimensionId;
          score: number | null;
        }>;
      }
    | undefined;
};

const displayScore = (value: number | null) =>
  value === null ? 'N/A' : value.toFixed(1);

const evidenceProfile = (result: ProductEvidence) =>
  result.profile.harness ?? '';

const DIMENSION_LABELS: Record<DimensionId, string> = {
  agentic: 'Agentic',
  coding: 'Coding',
  reasoning: 'Reasoning',
  math: 'Math',
  knowledge: 'Knowledge',
  language: 'Language',
  context: 'Context',
  instruction: 'Instruction',
};

const EvidenceRow = ({ result }: { result: ProductEvidence }) => (
  <tr>
    <th scope="row" data-label="Benchmark">
      <a href={result.provenance.sourceUrl} target="_blank" rel="noreferrer">
        {result.benchmarkId}
      </a>
      <span>Version {result.benchmarkVersion ?? 'not published'}</span>
    </th>
    <td data-label="Source Profile">
      <strong>{evidenceProfile(result)}</strong>
    </td>
    <td data-label="Score">
      <strong>
        {result.rawScore.toFixed(1)} {result.metric.unit}
      </strong>
      <span>Normalized {displayScore(result.normalizedScore)}</span>
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
      <span>{result.provenance.locator}</span>
      <span>{result.provenance.retrievedAt}</span>
    </td>
    <td data-label="Decision">
      <span
        className={`status-badge inclusion-${result.inclusion.toLowerCase()}`}
      >
        {result.inclusion === 'INCLUDED' ? 'Included' : 'Excluded'}
      </span>
      {result.exclusionReason ? (
        <span className="exclusion-reason">{result.exclusionReason}</span>
      ) : null}
    </td>
  </tr>
);

export function EvidenceDetail({
  profile,
  evidence,
  benchmarkDimensions,
  selectedResult,
}: EvidenceDetailProps) {
  const [sort, setSort] = useState<{
    key: EvidenceSortKey;
    direction: SortDirection;
  }>({ key: 'benchmark', direction: 'ascending' });
  const { groups, unmapped } = groupEvidenceByDimension(
    evidence,
    benchmarkDimensions,
  );
  const dimensionScores = new Map(
    selectedResult?.dimensions.map(({ dimension, score }) => [
      dimension,
      score,
    ]) ?? [],
  );
  const onSort = (key: EvidenceSortKey) =>
    setSort((current) => ({
      key,
      direction:
        current.key === key && current.direction === 'ascending'
          ? 'descending'
          : 'ascending',
    }));
  const sortHeader = (label: string, key: EvidenceSortKey) => (
    <button
      type="button"
      className="table-sort-button"
      data-evidence-sort
      aria-label={`Sort by ${label}`}
      onClick={() => onSort(key)}
    >
      <span>{label}</span>
      <span className="sort-indicator" aria-hidden="true">
        {sort.key === key ? (sort.direction === 'ascending' ? '↑' : '↓') : '↕'}
      </span>
    </button>
  );

  return (
    <section className="panel evidence-panel" aria-labelledby="evidence-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Audit trail</p>
          <h2 id="evidence-title">Benchmark details</h2>
          <p>
            Included results belong to {getProfileDisplayName(profile)}.
            Excluded rows cover the base model and retain their source Profile.
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
                <th
                  scope="col"
                  aria-sort={sort.key === 'benchmark' ? sort.direction : 'none'}
                >
                  {sortHeader('Benchmark', 'benchmark')}
                </th>
                <th
                  scope="col"
                  aria-sort={sort.key === 'profile' ? sort.direction : 'none'}
                >
                  {sortHeader('Source Profile', 'profile')}
                </th>
                <th
                  scope="col"
                  aria-sort={sort.key === 'score' ? sort.direction : 'none'}
                >
                  {sortHeader('Score', 'score')}
                </th>
                <th
                  scope="col"
                  aria-sort={sort.key === 'source' ? sort.direction : 'none'}
                >
                  {sortHeader('Source', 'source')}
                </th>
                <th
                  scope="col"
                  aria-sort={
                    sort.key === 'acquisition' ? sort.direction : 'none'
                  }
                >
                  {sortHeader('Acquisition', 'acquisition')}
                </th>
                <th
                  scope="col"
                  aria-sort={sort.key === 'decision' ? sort.direction : 'none'}
                >
                  {sortHeader('Decision', 'decision')}
                </th>
              </tr>
            </thead>
            <tbody>
              {groups.map(({ dimension, rows }) => (
                <tr className="evidence-group-row" key={dimension}>
                  <td colSpan={6}>
                    <details data-evidence-dimension={dimension}>
                      <summary className="evidence-group-summary">
                        <span className="summary-title-wrapper">
                          <span className="summary-title">
                            {DIMENSION_LABELS[dimension]}
                            <small>
                              {UI_DIMENSION_ABBREVIATIONS[dimension]}
                            </small>
                          </span>
                          {dimensionScores.get(dimension) != null ? (
                            <span className="summary-score-badge">
                              {dimensionScores.get(dimension)?.toFixed(1)}
                            </span>
                          ) : null}
                        </span>
                        <span className="summary-count">
                          {rows.length}{' '}
                          {rows.length === 1 ? 'result' : 'results'}
                        </span>
                      </summary>
                      <div className="evidence-group-content">
                        {rows.length ? (
                          <table className="evidence-table nested-evidence-table">
                            <tbody>
                              {sortEvidenceRows(rows, sort).map((result) => (
                                <EvidenceRow key={result.id} result={result} />
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <p className="evidence-group-empty">
                            No capability-specific evidence.
                          </p>
                        )}
                      </div>
                    </details>
                  </td>
                </tr>
              ))}
              {unmapped.length ? (
                <tr className="evidence-group-row">
                  <td colSpan={6}>
                    <details>
                      <summary className="evidence-group-summary">
                        <span className="summary-title-wrapper">
                          <span className="summary-title">
                            Other evidence
                            <small>Non-scoring</small>
                          </span>
                        </span>
                        <span className="summary-count">
                          {unmapped.length}{' '}
                          {unmapped.length === 1 ? 'result' : 'results'}
                        </span>
                      </summary>
                      <div className="evidence-group-content">
                        <table className="evidence-table nested-evidence-table">
                          <tbody>
                            {sortEvidenceRows(unmapped, sort).map((result) => (
                              <EvidenceRow key={result.id} result={result} />
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </details>
                  </td>
                </tr>
              ) : null}
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
