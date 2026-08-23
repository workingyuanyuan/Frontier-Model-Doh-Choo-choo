import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import {
  SourceManifestSchema,
  type BenchmarkDimensionMapping,
  type CandidateResult,
  type CostRecord,
  type EvidenceRecord,
} from '@llm-bench/benchmark-data';

import {
  APPROVED_VALS_BENCHMARKS,
  VALS_INDEX_URL,
  VALS_SOURCE_ID,
  type MaterializeValsResult,
} from './vals-materializer.js';
import {
  manifestJson,
  prettyDeterministicJson,
  previousSnapshotValue,
  snapshotDeltaMarkdown,
} from './refresh-utils.js';

const PAGE_URL = (slug: string): string =>
  `https://www.vals.ai/benchmarks/${slug}`;

/**
 * Write the four Vals snapshot files from an already-materialized result.
 *
 * Shared by the network refresh and the offline re-materialize so the two
 * cannot drift into producing different snapshot shapes for the same data. A
 * re-materialize exists because identity resolution happens at materialize
 * time: `candidates.json` stores the resolved `canonicalModelId`, so a catalog
 * alias added afterwards changes nothing until the rows are rebuilt. Rebuilding
 * from the stored artifacts keeps upstream content fixed while the identity
 * layer moves, which is the only way to tell an identity fix apart from
 * upstream drift.
 */
export interface WriteValsSnapshotInput {
  sourceDirectory: string;
  retrievedAt: string;
  slugs: string[];
  indexRecord: EvidenceRecord;
  pageRecords: Array<{ slug: string; record: EvidenceRecord }>;
  result: MaterializeValsResult;
  benchmarkMapping: BenchmarkDimensionMapping;
  previousReport: string;
  previousCandidates: CandidateResult[];
  previousCosts: CostRecord[];
}

export async function writeValsSnapshot({
  sourceDirectory,
  retrievedAt,
  slugs,
  indexRecord,
  pageRecords,
  result,
  benchmarkMapping,
  previousReport,
  previousCandidates,
  previousCosts,
}: WriteValsSnapshotInput): Promise<void> {
  indexRecord.metadata = {
    ...indexRecord.metadata,
    discoveredBenchmarkSlugs: slugs.length,
    parsedBenchmarkPages: result.parsedPages,
    unavailableBenchmarkPages: result.unavailablePages,
  };
  for (const { slug, record } of pageRecords) {
    record.metadata = {
      ...record.metadata,
      benchmarkViewAvailable: !result.unavailablePages.includes(slug),
      approvedForScoring: APPROVED_VALS_BENCHMARKS[slug] !== undefined,
    };
  }

  const previousCandidateCount = previousSnapshotValue(
    previousReport,
    'CandidateResults',
    previousCandidates.length,
  );
  const delta = snapshotDeltaMarkdown([
    {
      label: 'Benchmark slugs discovered from index',
      previous: previousSnapshotValue(
        previousReport,
        'Benchmark slugs discovered from index',
        0,
      ),
      refreshed: slugs.length,
    },
    {
      label: 'CandidateResults',
      previous: previousCandidateCount,
      refreshed: result.candidates.length,
    },
    {
      label: 'CostRecords retained',
      previous: previousSnapshotValue(
        previousReport,
        'CostRecords retained',
        previousCosts.length,
      ),
      refreshed: result.costs.length,
    },
    {
      label: 'Canonically unresolved rows',
      previous: previousSnapshotValue(
        previousReport,
        'Canonically unresolved rows',
        previousCandidates.filter(
          ({ model }) => model.canonicalModelId === null,
        ).length,
      ),
      refreshed: result.candidates.filter(
        ({ model }) => model.canonicalModelId === null,
      ).length,
    },
  ]);

  const benchmarkIds = [
    ...new Set(
      result.candidates
        .filter(({ inclusion }) => inclusion === 'INCLUDED')
        .map(({ benchmarkId }) => benchmarkId),
    ),
  ].toSorted((left, right) => left.localeCompare(right));
  const dimensionsByBenchmark = new Map(
    benchmarkMapping.benchmarks.map((benchmark) => [benchmark.id, benchmark]),
  );
  const dimensionMappingMarkdown = [
    '## Approved N3a dimension mapping',
    '',
    '| Vals slug | Benchmark ID | Primary dimension | Secondary dimensions |',
    '|---|---|---|---|',
    ...Object.entries(APPROVED_VALS_BENCHMARKS)
      .toSorted(([left], [right]) => left.localeCompare(right))
      .map(([slug, { benchmarkId }]) => {
        const mapping = dimensionsByBenchmark.get(benchmarkId);
        if (!mapping) {
          throw new Error(
            `Approved Vals benchmark ${benchmarkId} has no dimension mapping`,
          );
        }
        return `| \`${slug}\` | \`${benchmarkId}\` | ${mapping.primaryDimension} | ${mapping.secondaryDimensions.join(', ') || '—'} |`;
      }),
    '',
    'The N3a user ruling remains authoritative. The deferred multimodal watchlist includes `sage` and `mortgage_tax`; neither is promoted by this refresh.',
    '',
  ].join('\n');
  const manifest = SourceManifestSchema.parse({
    schemaVersion: 'source-manifest-v1',
    sourceId: VALS_SOURCE_ID,
    displayName: 'Vals AI benchmark pages',
    role: 'INDEPENDENT',
    baseUrl: 'https://www.vals.ai',
    targetUrls: [VALS_INDEX_URL, ...slugs.map(PAGE_URL)],
    benchmarkIds,
    accessMethods: ['DOM', 'EMBEDDED_JSON'],
    completeness: {
      expectedCountMethod:
        'Enumerate every /benchmarks/<slug> link from the official index, capture every page, parse the unique BenchmarkView Astro island when present, and require metadata.total_models to equal tasks.overall row count.',
      pagination: null,
      visibleComparisonRequired: true,
    },
    fieldMapping: {
      'index /benchmarks/<slug> links': 'complete page enumeration',
      'BenchmarkView.metadata':
        'benchmark name, version, publication date, and expected row count',
      'BenchmarkView.tasks.overall.*.accuracy':
        'CandidateResult rawScore and normalizedScore',
      'BenchmarkView.tasks.overall.*.reasoning_effort / compute_effort':
        'profile.effort when legal',
      'BenchmarkView.tasks.overall.*.cost_per_test':
        'CostRecord.cost; only vals_index is INCLUDED for charts',
    },
    fallbackMethods: ['VISUAL', 'MANUAL'],
    lastVerifiedAt: retrievedAt,
    notes: [
      `${slugs.length} benchmark slugs were discovered dynamically; ${result.parsedPages} exposed BenchmarkView data.`,
      'Only the explicit approved benchmark table may produce INCLUDED capability scores; new pages are visible in validation but remain EXCLUDED.',
      'Composite indices are always EXCLUDED as capability scores.',
      'Source role is assigned per benchmark: Vals-owned programs are ORGANIZER and external reruns are INDEPENDENT.',
      'Per D4, only vals_index cost_per_test is INCLUDED as the Vals cost signal; other per-benchmark costs remain retained but EXCLUDED.',
      'Per D6, unknown model identities remain null and no catalog entries or inferred aliases are created.',
    ],
  });

  const evidence = [
    indexRecord,
    ...pageRecords.map(({ record }) => record),
  ].toSorted((left, right) => left.requestUrl.localeCompare(right.requestUrl));
  await Promise.all([
    writeFile(
      join(sourceDirectory, 'evidence-index.json'),
      prettyDeterministicJson(evidence),
    ),
    writeFile(
      join(sourceDirectory, 'candidates.json'),
      prettyDeterministicJson(result.candidates),
    ),
    writeFile(
      join(sourceDirectory, 'costs.json'),
      prettyDeterministicJson(result.costs),
    ),
    writeFile(
      join(sourceDirectory, 'validation-report.md'),
      `${result.validationReport.trimEnd()}\n\n${dimensionMappingMarkdown}${delta}`,
    ),
    writeFile(join(sourceDirectory, 'manifest.json'), manifestJson(manifest)),
  ]);
}
