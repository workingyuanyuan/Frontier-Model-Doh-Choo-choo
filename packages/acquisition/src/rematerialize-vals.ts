import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

import {
  BenchmarkDimensionMappingSchema,
  EvidenceRecordSchema,
  type CandidateResult,
  type CostRecord,
  type EvidenceRecord,
} from '@llm-bench/benchmark-data';

import {
  VALS_SOURCE_ID,
  extractValsBenchmarkSlugs,
  materializeVals,
} from './vals-materializer.js';
import { writeValsSnapshot } from './vals-snapshot.js';
import { getWorkspaceRoot, readJson, readText } from './refresh-utils.js';

/**
 * Rebuild the Vals snapshot from the artifacts already on disk.
 *
 * Identity is resolved at materialize time and then frozen into
 * `candidates.json`, so a catalog alias added later changes nothing until the
 * rows are rebuilt. Re-running the network refresh would rebuild them, but it
 * would also pull whatever upstream has changed since, and the two effects
 * would be indistinguishable in the diff. This path holds the upstream bytes
 * fixed -- every artifact is re-hashed and must match the id recorded in
 * `evidence-index.json` -- so any change in the output is attributable to the
 * identity layer alone.
 *
 * It writes the same four files through the same writer as the refresh. It
 * captures nothing and must never reach the network.
 */
const INDEX_SCOPE =
  'official benchmark index used to enumerate every page slug';

interface LoadedArtifact {
  record: EvidenceRecord;
  text: string;
}

const readArtifact = async (
  root: string,
  record: EvidenceRecord,
): Promise<LoadedArtifact> => {
  const bytes = await readFile(join(root, record.artifactPath));
  const digest = `sha256:${createHash('sha256').update(bytes).digest('hex')}`;
  if (digest !== record.id) {
    throw new Error(
      `Artifact ${record.artifactPath} hashes to ${digest} but is recorded as ${record.id}. The stored bytes changed; refuse to re-materialize from them.`,
    );
  }
  return { record, text: new TextDecoder().decode(bytes) };
};

export async function rematerializeVals(root: string): Promise<{
  slugs: number;
  candidates: number;
  unresolvedModels: number;
}> {
  const sourceDirectory = join(root, 'data-v2', 'sources', VALS_SOURCE_ID);
  const evidence = (
    await readJson<unknown[]>(join(sourceDirectory, 'evidence-index.json'))
  ).map((record) => EvidenceRecordSchema.parse(record));

  const indexRecord = evidence.find(
    ({ metadata }) => metadata['captureScope'] === INDEX_SCOPE,
  );
  if (!indexRecord) {
    throw new Error('evidence-index.json has no Vals benchmark index record');
  }
  const pageEntries = evidence.flatMap((record) => {
    const slug = record.metadata['benchmarkSlug'];
    return typeof slug === 'string' ? [{ slug, record }] : [];
  });
  if (pageEntries.length === 0) {
    throw new Error('evidence-index.json has no Vals benchmark page records');
  }

  const index = await readArtifact(root, indexRecord);
  const pages = await Promise.all(
    pageEntries.map(async ({ slug, record }) => ({
      slug,
      artifact: await readArtifact(root, record),
    })),
  );

  // Re-derived from the stored index rather than read back from its metadata,
  // so the slug list comes from the same code path the refresh used.
  const slugs = extractValsBenchmarkSlugs(index.text);
  if (slugs.length === 0) {
    throw new Error('Stored Vals index exposed no /benchmarks/<slug> links');
  }

  const result = materializeVals(
    pages.map(({ slug, artifact }) => ({
      slug,
      html: artifact.text,
      evidenceId: artifact.record.id,
      sourceUrl: artifact.record.requestUrl,
    })),
    {
      observedAt: indexRecord.retrievedAt,
      indexEvidenceId: indexRecord.id,
      discoveredSlugs: slugs,
    },
  );

  await writeValsSnapshot({
    sourceDirectory,
    retrievedAt: indexRecord.retrievedAt,
    slugs,
    indexRecord,
    pageRecords: pages.map(({ slug, artifact }) => ({
      slug,
      record: artifact.record,
    })),
    result,
    benchmarkMapping: BenchmarkDimensionMappingSchema.parse(
      await readJson(join(root, 'data-v2', 'mappings', 'benchmarks.json')),
    ),
    previousReport: await readText(
      join(sourceDirectory, 'validation-report.md'),
    ).catch(() => ''),
    previousCandidates: await readJson<CandidateResult[]>(
      join(sourceDirectory, 'candidates.json'),
    ).catch(() => [] as CandidateResult[]),
    previousCosts: await readJson<CostRecord[]>(
      join(sourceDirectory, 'costs.json'),
    ).catch(() => [] as CostRecord[]),
  });

  return {
    slugs: slugs.length,
    candidates: result.candidates.length,
    unresolvedModels: result.unresolvedModels.length,
  };
}

async function main() {
  const rootArgument = process.argv
    .slice(2)
    .find((argument) => !argument.startsWith('--'));
  const root = resolve(rootArgument ?? getWorkspaceRoot());
  console.log(JSON.stringify(await rematerializeVals(root)));
}

await main();
