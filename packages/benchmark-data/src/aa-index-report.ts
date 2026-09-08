import type { ProductVersion } from './index.js';

/** AA's external index uses raw index points; normalizedScore is intentionally null. */
export const buildAaIndexReport = (product: ProductVersion) => {
  const rows = product.evidence
    .filter(
      (row) =>
        row.sourceId === 'artificial-analysis' &&
        row.benchmarkId === 'artificial-analysis-intelligence-index',
    )
    .map((row) => {
      if (!Number.isFinite(row.rawScore)) {
        throw new Error(`AA index requires a finite rawScore: ${row.id}`);
      }
      return {
        model: row.model.canonicalModelId,
        profile: row.model.profileId,
        name: row.model.rawName,
        version: row.benchmarkVersion,
        score: row.rawScore,
        rank: null as number | null,
        resultId: row.id,
        evidenceId: row.provenance.evidenceId,
        sourceUrl: row.provenance.sourceUrl,
        locator: row.provenance.locator,
      };
    })
    .toSorted(
      (a, b) =>
        (a.version ?? '').localeCompare(b.version ?? '', undefined, {
          numeric: true,
        }) ||
        b.score - a.score ||
        a.resultId.localeCompare(b.resultId),
    );
  let version: string | null = null;
  let position = 0;
  let rank = 0;
  let score: number | undefined;
  for (const row of rows) {
    if (row.version === null) continue;
    if (row.version !== version) {
      version = row.version;
      position = 0;
      score = undefined;
    }
    position++;
    if (score !== row.score) rank = position;
    row.rank = rank;
    score = row.score;
  }
  return rows;
};

export const formatAaIndexReport = (
  rows: ReturnType<typeof buildAaIndexReport>,
): string => {
  const cell = (value: string) =>
    value.replaceAll('|', '\\|').replace(/[\r\n]+/g, ' ');
  return [...new Set(rows.map((row) => row.version))]
    .map((version) =>
      [
        `### ${version ?? '版本未明（不排名）'}`,
        '',
        '| 版內名次 | 模型／配置 | 指數分數 |',
        '| --- | --- | --- |',
        ...rows
          .filter((row) => row.version === version)
          .map(
            (row) =>
              `| ${row.rank ?? '—'} | ${cell(row.name)} | ${row.score.toFixed(4)} |`,
          ),
      ].join('\n'),
    )
    .join('\n\n');
};
