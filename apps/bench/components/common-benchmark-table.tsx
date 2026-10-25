import type { buildCommonComparison } from '../lib/common-benchmarks';
import { commonBenchmarksMarkdown } from '../lib/leaderboard-markdown';
import { getProfileDisplayName } from '../lib/view-model';
import { CopyMarkdownButton } from './copy-markdown-button';
import {
  getBenchmarkDisplayName,
  getSourceDisplayName,
} from './model-detail-panel';

type Comparison = ReturnType<typeof buildCommonComparison>;

/** One row per benchmark metric, shared by the table and its Markdown copy. */
function commonBenchmarkRows({ profiles, benchmarkIds, evidence }: Comparison) {
  return benchmarkIds.flatMap((benchmarkId) => {
    const metrics = evidence.filter(
      (e) =>
        e.benchmarkId === benchmarkId && e.model.profileId === profiles[0]?.id,
    );
    return metrics.map((metric) => {
      const cells = profiles.map((p) =>
        evidence.find(
          (e) =>
            e.benchmarkId === benchmarkId &&
            e.metric.id === metric.metric.id &&
            e.model.profileId === p.id,
        )!,
      );
      return {
        key: `${benchmarkId}:${metric.metric.id}`,
        label: `${getBenchmarkDisplayName(benchmarkId, metric)}${
          metrics.length > 1 ? ` · ${metric.metric.name}` : ''
        }`,
        cells,
        scores: cells.map((cell) => cell.normalizedScore!),
        difference:
          profiles.length === 2
            ? cells[0]!.normalizedScore! - cells[1]!.normalizedScore!
            : null,
      };
    });
  });
}

export function CommonBenchmarkTable({
  comparison,
}: {
  comparison: Comparison;
}) {
  const { profiles, benchmarkIds } = comparison;
  const rows = commonBenchmarkRows(comparison);
  return (
    <section
      className="panel common-benchmark-panel"
      aria-labelledby="common-benchmarks-title"
    >
      <div className="section-heading">
        <h2 id="common-benchmarks-title">Common benchmarks</h2>
        <div className="common-benchmark-actions">
          <span>
            {benchmarkIds.length} benchmarks · {profiles.length} profiles
          </span>
          <CopyMarkdownButton
            label="Copy common benchmarks as Markdown"
            disabled={!rows.length}
            markdown={() =>
              commonBenchmarksMarkdown(
                profiles.map(getProfileDisplayName),
                rows,
              )
            }
          />
        </div>
      </div>
      {profiles.length < 2 ? (
        <p role="status">
          Select at least two profiles to compare. A single selection shows that
          profile’s available benchmarks.
        </p>
      ) : null}
      {!benchmarkIds.length ? (
        <p role="status">
          {profiles.length
            ? 'No common benchmarks for these profiles. Choose another profile or fewer models.'
            : 'Select models in Search Models to begin.'}
        </p>
      ) : (
        <>
          <div
            className="table-scroll"
            role="region"
            aria-label="Common benchmark scores"
            tabIndex={0}
          >
            <table className="common-benchmark-table">
              <thead>
                <tr>
                  <th scope="col">Benchmark</th>
                  {profiles.map((profile) => (
                    <th scope="col" key={profile.id}>
                      {getProfileDisplayName(profile)}
                    </th>
                  ))}
                  {profiles.length === 2 ? (
                    <th scope="col">
                      Difference
                      <br />
                      (first − second)
                    </th>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {rows.map(({ key, label, cells, difference }) => {
                  const best = Math.max(
                    ...cells.map((cell) => cell.normalizedScore!),
                  );
                  return (
                    <tr key={key}>
                      <th scope="row">{label}</th>
                      {cells.map((cell) => (
                        <td key={cell.id}>
                          <strong
                            className={
                              cell.normalizedScore === best
                                ? 'common-best-score'
                                : undefined
                            }
                          >
                            {cell.normalizedScore!.toFixed(1)}
                          </strong>
                          <a
                            href={cell.provenance.sourceUrl}
                            target="_blank"
                            rel="noreferrer"
                            title={`Original score: ${cell.rawScore} ${cell.metric.unit}`}
                          >
                            {getSourceDisplayName(cell.sourceId)} ·{' '}
                            {new Intl.NumberFormat('en', {
                              maximumFractionDigits: 4,
                            }).format(cell.rawScore)}{' '}
                            {cell.metric.unit}
                            {cell.benchmarkVersion
                              ? ` · ${cell.benchmarkVersion}`
                              : ''}
                          </a>
                        </td>
                      ))}
                      {difference !== null ? (
                        <td>
                          {difference > 0 ? '+' : ''}
                          {difference.toFixed(1)}
                        </td>
                      ) : null}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
