import { mapAcquisitionItems } from './acquisition-policy.js';
import { acquisitionClient } from './safe-network.js';
import { join, resolve } from 'node:path';

import {
  BenchmarkDimensionMappingSchema,
  type CandidateResult,
  type CostRecord,
  type EvidenceRecord,
} from '@llm-bench/benchmark-data';

import {
  VALS_INDEX_URL,
  VALS_SOURCE_ID,
  extractValsBenchmarkSlugs,
  materializeVals,
  parseValsBenchmarkPage,
  type ParsedValsPage,
} from './vals-materializer.js';
import { writeValsSnapshot } from './vals-snapshot.js';
import {
  captureArtifact,
  getWorkspaceRoot,
  readJson,
  readText,
} from './refresh-utils.js';

const PAGE_URL = (slug: string): string =>
  `https://www.vals.ai/benchmarks/${encodeURIComponent(slug)}`;

async function capturePagesInBatches(input: {
  root: string;
  retrievedAt: string;
  slugs: string[];
}): Promise<
  Array<{ slug: string; record: EvidenceRecord; parsed: ParsedValsPage | null }>
> {
  return mapAcquisitionItems(
    input.slugs,
    acquisitionClient.budget,
    async (slug) => {
      const artifact = await captureArtifact({
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
      });
      // Drop full response bytes/HTML after each page; retain only parsed data.
      return {
        slug,
        record: artifact.record,
        parsed: parseValsBenchmarkPage(artifact.text),
      };
    },
  );
}

async function main() {
  const rootArgument = process.argv
    .slice(2)
    .find((argument) => !argument.startsWith('--'));
  const root = resolve(rootArgument ?? getWorkspaceRoot());
  const retrievedAt = new Date().toISOString();
  const sourceDirectory = join(root, 'data', 'sources', VALS_SOURCE_ID);
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
    await readJson(join(root, 'data', 'mappings', 'benchmarks.json')),
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
    pageCaptures.map(({ slug, record, parsed }) => ({
      slug,
      parsed,
      evidenceId: record.id,
      sourceUrl: PAGE_URL(slug),
    })),
    {
      observedAt: retrievedAt,
      indexEvidenceId: index.record.id,
      discoveredSlugs: slugs,
    },
  );

  await writeValsSnapshot({
    sourceDirectory,
    retrievedAt,
    slugs,
    indexRecord: index.record,
    pageRecords: pageCaptures.map(({ slug, record }) => ({
      slug,
      record,
    })),
    result,
    benchmarkMapping,
    previousReport,
    previousCandidates,
    previousCosts,
  });

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
