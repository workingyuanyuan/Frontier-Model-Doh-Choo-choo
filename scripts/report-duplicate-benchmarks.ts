import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { ProductVersionSchema } from '@llm-bench/benchmark-data';

const SPECIFICATIONS = [
  {
    benchmarkId: 'gpqa-diamond',
    title: 'GPQA Diamond',
    sources: [
      ['artificial-analysis', 'AA'],
      ['epoch-ai', 'Epoch'],
      ['vals-ai', 'Vals'],
    ],
  },
  {
    benchmarkId: 'swe-bench',
    title: 'SWE-bench',
    sources: [
      ['epoch-ai', 'Epoch'],
      ['vals-ai', 'Vals'],
    ],
  },
  {
    benchmarkId: 'terminal-bench-2-1',
    title: 'Terminal-Bench 2.1',
    sources: [
      ['artificial-analysis', 'AA'],
      ['vals-ai', 'Vals'],
    ],
  },
] as const;

type Specification = (typeof SPECIFICATIONS)[number];

interface ComparisonRow {
  modelId: string;
  profileId: string;
  effort: string;
  scores: Record<string, number>;
}

const round = (value: number): number => Number(value.toFixed(4));

const median = (values: readonly number[]): number => {
  const sorted = values.toSorted((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[middle - 1]! + sorted[middle]!) / 2
    : sorted[middle]!;
};

const markdownCell = (value: string): string => value.replaceAll('|', '\\|');

const formatScore = (value: number | undefined): string =>
  value === undefined ? '—' : value.toFixed(2);

const buildRows = (
  product: ReturnType<typeof ProductVersionSchema.parse>,
  specification: Specification,
): ComparisonRow[] => {
  const sourceIds = new Set(
    specification.sources.map(([sourceId]) => sourceId as string),
  );
  const byProfile = new Map<string, ComparisonRow>();

  product.evidence
    .filter(
      (evidence) =>
        evidence.inclusion === 'INCLUDED' &&
        evidence.benchmarkId === specification.benchmarkId &&
        sourceIds.has(evidence.sourceId) &&
        evidence.model.canonicalModelId !== null &&
        evidence.model.profileId !== null &&
        evidence.normalizedScore !== null,
    )
    .forEach((evidence) => {
      const profileId = evidence.model.profileId!;
      const existing = byProfile.get(profileId) ?? {
        modelId: evidence.model.canonicalModelId!,
        profileId,
        effort: evidence.profile.effort ?? 'default',
        scores: {},
      };
      existing.scores[evidence.sourceId] = Math.max(
        existing.scores[evidence.sourceId] ?? Number.NEGATIVE_INFINITY,
        evidence.normalizedScore!,
      );
      byProfile.set(profileId, existing);
    });

  return [...byProfile.values()].toSorted(
    (left, right) =>
      left.modelId.localeCompare(right.modelId) ||
      left.effort.localeCompare(right.effort) ||
      left.profileId.localeCompare(right.profileId),
  );
};

const summarize = (rows: readonly ComparisonRow[], sourceCount: number) => {
  const comparable = rows.filter(
    ({ scores }) => Object.keys(scores).length >= 2,
  );
  const complete = rows.filter(
    ({ scores }) => Object.keys(scores).length === sourceCount,
  );
  const uplift = (row: ComparisonRow): number => {
    const values = Object.values(row.scores);
    return Math.max(...values) - median(values);
  };
  const average = (values: readonly number[]): number | null =>
    values.length === 0
      ? null
      : values.reduce((sum, value) => sum + value, 0) / values.length;

  return {
    rows: rows.length,
    comparableRows: comparable.length,
    completeRows: complete.length,
    averageUplift: average(comparable.map(uplift)),
    completeAverageUplift: average(complete.map(uplift)),
    maximumUplift:
      comparable.length === 0 ? null : Math.max(...comparable.map(uplift)),
  };
};

const renderSection = (
  specification: Specification,
  rows: readonly ComparisonRow[],
): string => {
  const summary = summarize(rows, specification.sources.length);
  const headers = specification.sources.map(([, label]) => label);
  const sourceIds = specification.sources.map(([sourceId]) => sourceId);
  const lines = [
    `## ${specification.title}`,
    '',
    `- Canonical model × effort rows: ${summary.rows}`,
    `- Rows with at least two sources: ${summary.comparableRows}`,
    `- Rows with all ${specification.sources.length} sources: ${summary.completeRows}`,
    `- Mean uplift of max over median (rows with 2+ sources): ${summary.averageUplift?.toFixed(2) ?? '—'} points`,
    ...(specification.sources.length > 2
      ? [
          `- Mean uplift on all-${specification.sources.length}-source rows only: ${summary.completeAverageUplift?.toFixed(2) ?? '—'} points`,
        ]
      : []),
    `- Largest observed uplift: ${summary.maximumUplift?.toFixed(2) ?? '—'} points`,
    '',
    `| Model | Effort | ${headers.join(' | ')} | Max | Median | Max − median | Max source |`,
    `|---|---|${headers.map(() => '---:').join('|')}|---:|---:|---:|---|`,
  ];

  rows.forEach((row) => {
    const values = Object.values(row.scores);
    const maximum = Math.max(...values);
    const middle = median(values);
    const comparable = values.length >= 2;
    const winners = specification.sources
      .filter(([sourceId]) => row.scores[sourceId] === maximum)
      .map(([, label]) => label)
      .join(' + ');
    lines.push(
      `| \`${markdownCell(row.modelId)}\` | ${markdownCell(row.effort)} | ${sourceIds
        .map((sourceId) => formatScore(row.scores[sourceId]))
        .join(
          ' | ',
        )} | ${maximum.toFixed(2)} | ${comparable ? middle.toFixed(2) : '—'} | ${comparable ? (maximum - middle).toFixed(2) : '—'} | ${winners} |`,
    );
  });

  return lines.join('\n');
};

const main = async (): Promise<void> => {
  const root = resolve(process.argv[2] ?? process.cwd());
  const outputPath = resolve(
    root,
    process.argv[3] ?? 'docs/PHASE3_DUPLICATE_BENCHMARKS_2026-08-22.md',
  );
  const product = ProductVersionSchema.parse(
    JSON.parse(
      await readFile(resolve(root, 'data-v2/product/current.json'), 'utf8'),
    ),
  );
  const sections = SPECIFICATIONS.map((specification) => {
    const rows = buildRows(product, specification);
    return {
      markdown: renderSection(specification, rows),
      benchmarkId: specification.benchmarkId,
      ...summarize(rows, specification.sources.length),
    };
  });
  const report = [
    '# Phase 3 duplicate benchmark source comparison — 2026-08-22',
    '',
    '> Generated from `data-v2/product/current.json` by `scripts/report-duplicate-benchmarks.ts`.',
    '> This report quantifies the approved §4.3.1 cross-source maximum rule; it does not change scoring policy.',
    '',
    '## Method',
    '',
    '- The comparison key is canonical model × product effort, matching the profile-level selection used by the product.',
    '- Within one source and key, duplicate rows are reduced to that source’s highest normalized 0–100 score.',
    '- “Max − median” is reported only when at least two sources measured the same key. For two sources, the median is their arithmetic midpoint.',
    '- A one-source row remains in the table for coverage disclosure but does not contribute to uplift statistics.',
    '',
    ...sections.flatMap(({ markdown }, index) => [
      markdown,
      ...(index === sections.length - 1 ? [] : ['']),
    ]),
    '',
  ].join('\n');
  await writeFile(outputPath, report, 'utf8');
  process.stdout.write(
    `${JSON.stringify(
      sections.map(({ markdown: _markdown, ...summary }) => ({
        ...summary,
        averageUplift:
          summary.averageUplift === null ? null : round(summary.averageUplift),
        completeAverageUplift:
          summary.completeAverageUplift === null
            ? null
            : round(summary.completeAverageUplift),
        maximumUplift:
          summary.maximumUplift === null ? null : round(summary.maximumUplift),
      })),
      null,
      2,
    )}\n`,
  );
};

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
