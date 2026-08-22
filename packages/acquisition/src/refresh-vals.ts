import { writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

import {
  BenchmarkDimensionMappingSchema,
  SourceManifestSchema,
  type CandidateResult,
  type CostRecord,
} from '@llm-bench/benchmark-data';

import {
  APPROVED_VALS_BENCHMARKS,
  VALS_INDEX_URL,
  VALS_SOURCE_ID,
  extractValsBenchmarkSlugs,
  materializeVals,
} from './vals-materializer.js';
import {
  captureArtifact,
  getWorkspaceRoot,
  manifestJson,
  prettyDeterministicJson,
  previousSnapshotValue,
  readJson,
  readText,
  snapshotDeltaMarkdown,
  type CapturedArtifact,
} from './refresh-utils.js';

const PAGE_URL = (slug: string): string =>
  `https://www.vals.ai/benchmarks/${slug}`;

async function capturePagesInBatches(input: {
  root: string;
  retrievedAt: string;
  slugs: string[];
}): Promise<Array<{ slug: string; artifact: CapturedArtifact }>> {
  const captures: Array<{ slug: string; artifact: CapturedArtifact }> = [];
  const batchSize = 6;
  for (let offset = 0; offset < input.slugs.length; offset += batchSize) {
    const batch = input.slugs.slice(offset, offset + batchSize);
    const capturedBatch = await Promise.all(
      batch.map(async (slug) => ({
        slug,
        artifact: await captureArtifact({
          root: input.root,
          sourceId: VALS_SOURCE_ID,
          url: PAGE_URL(slug),
          retrievedAt: input.retrievedAt,
          mediaType: 'text/html',
          method: 'EMBEDDED_JSON',
          metadata: {
            captureScope:
              'official Vals BenchmarkView Astro island and visible methodology page',
            benchmarkSlug: slug,
          },
        }),
      })),
    );
    captures.push(...capturedBatch);
  }
  return captures;
}

async function main() {
  const rootArgument = process.argv
    .slice(2)
    .find((argument) => !argument.startsWith('--'));
  const root = resolve(rootArgument ?? getWorkspaceRoot());
  const retrievedAt = new Date().toISOString();
  const sourceDirectory = join(root, 'data-v2', 'sources', VALS_SOURCE_ID);
  const previousCandidates = await readJson<CandidateResult[]>(
    join(sourceDirectory, 'candidates.json'),
  ).catch(() => [] as CandidateResult[]);
  const previousCosts = await readJson<CostRecord[]>(
    join(sourceDirectory, 'costs.json'),
  ).catch(() => [] as CostRecord[]);
  const previousReport = await readText(
    join(sourceDirectory, 'validation-report.md'),
  ).catch(() => '');
  const benchmarkMapping = BenchmarkDimensionMappingSchema.parse(
    await readJson(join(root, 'data-v2', 'mappings', 'benchmarks.json')),
  );

  const index = await captureArtifact({
    root,
    sourceId: VALS_SOURCE_ID,
    url: VALS_INDEX_URL,
    retrievedAt,
    mediaType: 'text/html',
    method: 'DOM',
    metadata: {
      captureScope:
        'official benchmark index used to enumerate every page slug',
    },
  });
  const slugs = extractValsBenchmarkSlugs(index.text);
  if (slugs.length === 0) {
    throw new Error('Vals benchmark index exposed no /benchmarks/<slug> links');
  }
  const pageCaptures = await capturePagesInBatches({
    root,
    retrievedAt,
    slugs,
  });
  const result = materializeVals(
    pageCaptures.map(({ slug, artifact }) => ({
      slug,
      html: artifact.text,
      evidenceId: artifact.record.id,
      sourceUrl: PAGE_URL(slug),
    })),
    {
      observedAt: retrievedAt,
      indexEvidenceId: index.record.id,
      discoveredSlugs: slugs,
    },
  );

  index.record.metadata = {
    ...index.record.metadata,
    discoveredBenchmarkSlugs: slugs.length,
    parsedBenchmarkPages: result.parsedPages,
    unavailableBenchmarkPages: result.unavailablePages,
  };
  for (const { slug, artifact } of pageCaptures) {
    artifact.record.metadata = {
      ...artifact.record.metadata,
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
    index.record,
    ...pageCaptures.map(({ artifact }) => artifact.record),
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

  console.log(
    JSON.stringify({
      slugs: slugs.length,
      parsedPages: result.parsedPages,
      unavailablePages: result.unavailablePages,
      candidates: result.candidates.length,
      includedCandidates: result.candidates.filter(
        ({ inclusion }) => inclusion === 'INCLUDED',
      ).length,
      costs: result.costs.length,
      includedCosts: result.costs.filter(
        ({ inclusion }) => inclusion === 'INCLUDED',
      ).length,
      unresolvedModels: result.unresolvedModels.length,
      newlyDiscoveredSlugs: result.newlyDiscoveredSlugs,
    }),
  );
}

await main();
