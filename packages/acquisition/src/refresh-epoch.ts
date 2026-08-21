import { writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

import AdmZip from 'adm-zip';
import {
  SourceManifestSchema,
  deterministicJson,
  type CandidateResult,
} from '@llm-bench/benchmark-data';

import { EPOCH_DIRECT_FILES, materializeEpoch } from './epoch-materializer.js';
import { parseCsv } from './materializer-utils.js';
import {
  captureArtifact,
  getWorkspaceRoot,
  manifestJson,
  prettyDeterministicJson,
  readJson,
  readText,
  previousSnapshotValue,
  snapshotDeltaMarkdown,
} from './refresh-utils.js';

const SOURCE_ID = 'epoch-ai';
const PAGE_URL = 'https://epoch.ai/benchmarks/use-this-data';
const ZIP_URL = 'https://epoch.ai/data/benchmark_data.zip';
const LIVE_URL = 'https://epoch.ai/data/benchmarks.csv';

const ECI_FILE = 'epoch_capabilities_index.csv';

/**
 * Epoch publishes no countable model table in server-rendered HTML, so the
 * visible comparison other sources make against a rendered leaderboard is done
 * here against `benchmarks.csv` — the run-level file the rendered benchmark
 * pages actually read to produce their "N models evaluated" line. Comparing the
 * export against the file behind the page is the same check, and it needs no
 * human-typed count.
 */
interface VisibleComparison {
  benchmark: string;
  exportModels: number;
  liveModels: number;
  matched: boolean;
}

const distinctScoredVersions = (rows: readonly string[][]): Set<string> => {
  const versions = new Set<string>();
  for (let index = 1; index < rows.length; index += 1) {
    const row = rows[index];
    const version = row?.[0];
    if (!version) continue;
    if (Number.isFinite(Number.parseFloat(row[1] ?? ''))) versions.add(version);
  }
  return versions;
};

const liveVersionsByTask = (csv: string): Map<string, Set<string>> => {
  const rows = parseCsv(csv);
  const header = rows[0];
  if (!header) throw new Error(`${LIVE_URL} has no header row`);
  const taskColumn = header.indexOf('task');
  const modelColumn = header.indexOf('model');
  const scoreColumn = header.indexOf('mean_score');
  if (taskColumn === -1 || modelColumn === -1 || scoreColumn === -1) {
    throw new Error(
      `${LIVE_URL} no longer exposes task / model / mean_score columns`,
    );
  }
  const byTask = new Map<string, Set<string>>();
  for (let index = 1; index < rows.length; index += 1) {
    const row = rows[index];
    const task = row?.[taskColumn];
    const model = row?.[modelColumn];
    if (!task || !model) continue;
    if (!Number.isFinite(Number.parseFloat(row[scoreColumn] ?? ''))) continue;
    const versions = byTask.get(task) ?? new Set<string>();
    versions.add(model);
    byTask.set(task, versions);
  }
  return byTask;
};

const compareChannels = (zip: AdmZip, liveCsv: string): VisibleComparison[] => {
  const live = liveVersionsByTask(liveCsv);
  return EPOCH_DIRECT_FILES.map((file) => {
    const entry = zip.getEntry(file.name);
    if (!entry) throw new Error(`${file.name} is missing from ${ZIP_URL}`);
    const exportVersions = distinctScoredVersions(
      parseCsv(entry.getData().toString('utf8')),
    );
    const liveVersions = live.get(file.liveTaskName) ?? new Set<string>();
    return {
      benchmark: file.liveTaskName,
      exportModels: exportVersions.size,
      liveModels: liveVersions.size,
      matched:
        exportVersions.size === liveVersions.size &&
        [...exportVersions].every((version) => liveVersions.has(version)),
    };
  });
};

const validationReport = (input: {
  retrievedAt: string;
  zipEntries: number;
  externalMirrors: number;
  eciRows: number;
  candidates: readonly CandidateResult[];
  comparisons: readonly VisibleComparison[];
  delta: string;
}): string => {
  const byBenchmark = new Map<string, number>();
  for (const candidate of input.candidates) {
    byBenchmark.set(
      candidate.benchmarkId,
      (byBenchmark.get(candidate.benchmarkId) ?? 0) + 1,
    );
  }
  const unresolved = input.candidates.filter(
    ({ model }) => model.canonicalModelId === null,
  ).length;
  return `# Epoch AI acquisition validation

- Retrieved at: ${input.retrievedAt}
- Export: ${ZIP_URL}
- Live comparison channel: ${LIVE_URL}
- Page: ${PAGE_URL}

## Exact counts

| Check | Count |
|---|---:|
| ZIP entries | ${input.zipEntries} |
| External-source mirrors (\`_external\`) | ${input.externalMirrors} |
| Epoch Capabilities Index rows | ${input.eciRows} |
| CandidateResults | ${input.candidates.length} |
| Rows without a canonical identity | ${unresolved} |

## CandidateResults per benchmark

| Benchmark | Rows |
|---|---:|
${[...byBenchmark]
  .toSorted(([left], [right]) => left.localeCompare(right))
  .map(([benchmarkId, count]) => `| \`${benchmarkId}\` | ${count} |`)
  .join('\n')}

## Visible comparison

Epoch serves no countable model table in server-rendered HTML. The rendered
benchmark pages derive their "N models evaluated" line from \`benchmarks.csv\`,
so the export is compared against that file rather than against a typed count.

| Benchmark | Export models | Live models | Result |
|---|---:|---:|---|
${input.comparisons
  .map(
    (row) =>
      `| ${row.benchmark} | ${row.exportModels} | ${row.liveModels} | ${row.matched ? 'matched' : 'MISMATCH'} |`,
  )
  .join('\n')}

## Known unresolved

- The Epoch Capabilities Index is a composite and stays \`EXCLUDED\`; it is
  selection-only evidence and must not be double-counted in eight-dimension
  scoring.
- \`mirrorcode.csv\` and \`mystery_game_puzzles.csv\` are present in the export but
  are not promoted: neither has an approved benchmark ID or dimension mapping.
- \`gpqa-diamond\` is also published by Artificial Analysis. The cross-source
  merge rule is not yet decided; see \`tasks/claude-code-plan.md\` L1.

${input.delta}`;
};

async function main() {
  const rootArgument = process.argv
    .slice(2)
    .find((argument) => !argument.startsWith('--'));
  const root = resolve(rootArgument ?? getWorkspaceRoot());
  const retrievedAt = new Date().toISOString();
  const sourceDirectory = join(root, 'data-v2', 'sources', SOURCE_ID);
  const previousCandidates = await readJson<CandidateResult[]>(
    join(sourceDirectory, 'candidates.json'),
  );
  const previousReport = await readText(
    join(sourceDirectory, 'validation-report.md'),
  );

  const [archive, live, page] = await Promise.all([
    captureArtifact({
      root,
      sourceId: SOURCE_ID,
      url: ZIP_URL,
      retrievedAt,
      mediaType: 'application/zip',
      method: 'EXPORT',
      metadata: { captureScope: 'complete benchmark data export' },
    }),
    captureArtifact({
      root,
      sourceId: SOURCE_ID,
      url: LIVE_URL,
      retrievedAt,
      mediaType: 'text/csv',
      method: 'EXPORT',
      metadata: { captureScope: 'run-level table behind the rendered pages' },
    }),
    captureArtifact({
      root,
      sourceId: SOURCE_ID,
      url: PAGE_URL,
      retrievedAt,
      mediaType: 'text/html',
      method: 'DOM',
      metadata: { captureScope: 'download page' },
    }),
  ]);

  const zip = new AdmZip(Buffer.from(archive.bytes));
  const entries = zip.getEntries().map(({ entryName }) => entryName);
  const externalMirrors = entries.filter((name) =>
    name.includes('_external'),
  ).length;
  if (!entries.includes(ECI_FILE)) {
    throw new Error(`${ECI_FILE} is missing from ${ZIP_URL}`);
  }

  const comparisons = compareChannels(zip, live.text);
  const mismatched = comparisons.filter(({ matched }) => !matched);
  if (mismatched.length > 0) {
    throw new Error(
      `Export and live channel disagree: ${mismatched
        .map(
          ({ benchmark, exportModels, liveModels }) =>
            `${benchmark} (export ${exportModels}, live ${liveModels})`,
        )
        .join('; ')}`,
    );
  }

  const candidates = materializeEpoch(Buffer.from(archive.bytes), retrievedAt, {
    evidenceId: archive.record.id,
    sourceUrl: ZIP_URL,
  });
  const eciRows = candidates.filter(
    ({ benchmarkId }) => benchmarkId === 'epoch-capabilities-index',
  ).length;

  archive.record.metadata = {
    ...archive.record.metadata,
    zipEntries: entries.length,
    externalMirrors,
    candidateRows: candidates.length,
  };
  live.record.metadata = {
    ...live.record.metadata,
    visibleComparisonMatched: true,
    comparedBenchmarks: comparisons.length,
  };

  const report = validationReport({
    retrievedAt,
    zipEntries: entries.length,
    externalMirrors,
    eciRows,
    candidates,
    comparisons,
    delta: snapshotDeltaMarkdown([
      {
        label: 'CandidateResults',
        previous: previousSnapshotValue(
          previousReport,
          'CandidateResults',
          previousCandidates.length,
        ),
        refreshed: candidates.length,
      },
      {
        label: 'Epoch Capabilities Index rows',
        previous: previousSnapshotValue(
          previousReport,
          'Epoch Capabilities Index rows',
          previousCandidates.filter(
            ({ benchmarkId }) => benchmarkId === 'epoch-capabilities-index',
          ).length,
        ),
        refreshed: eciRows,
      },
      {
        label: 'Rows without a canonical identity',
        previous: previousSnapshotValue(
          previousReport,
          'Rows without a canonical identity',
          previousCandidates.filter(
            ({ model }) => model.canonicalModelId === null,
          ).length,
        ),
        refreshed: candidates.filter(
          ({ model }) => model.canonicalModelId === null,
        ).length,
      },
    ]),
  });

  const manifest = SourceManifestSchema.parse({
    schemaVersion: 'source-manifest-v1',
    sourceId: SOURCE_ID,
    displayName: 'Epoch AI Benchmarking Hub — internal runs',
    role: 'INDEPENDENT',
    baseUrl: 'https://epoch.ai',
    targetUrls: [PAGE_URL, ZIP_URL, LIVE_URL],
    benchmarkIds: [
      'epoch-capabilities-index',
      ...new Set(EPOCH_DIRECT_FILES.map(({ benchmarkId }) => benchmarkId)),
    ].toSorted((left, right) => left.localeCompare(right)),
    accessMethods: ['EXPORT', 'DOM'],
    completeness: {
      expectedCountMethod:
        'Enumerate every ZIP entry, separate the Epoch-run files from the _external mirrors, then compare each promoted file against the same task in the live benchmarks.csv the rendered pages read.',
      pagination: null,
      visibleComparisonRequired: true,
    },
    fieldMapping: {
      'Model version': 'model/profile identity',
      mean_score: 'rawScore / 100',
      'ECI Score': 'rawScore',
      'Started at': 'sourcePublishedAt',
      'Release date': 'model release metadata',
    },
    fallbackMethods: ['OFFICIAL_API', 'DOM'],
    lastVerifiedAt: retrievedAt,
    notes: [
      'Only files without the _external suffix are treated as Epoch-run evidence.',
      'ECI is an Epoch-owned composite and stays EXCLUDED: selection-only evidence, never a ninth dimension.',
      `${comparisons.length} promoted files matched the live benchmarks.csv model set exactly.`,
      'mirrorcode.csv and mystery_game_puzzles.csv stay in the raw artifact; neither has an approved benchmark ID or dimension mapping.',
      'Epoch Inspect harness and attempt metadata remain raw Profile provenance and do not create Product Profiles.',
    ],
  });

  await Promise.all([
    writeFile(
      join(sourceDirectory, 'evidence-index.json'),
      prettyDeterministicJson(
        [archive.record, live.record, page.record].toSorted((left, right) =>
          left.requestUrl.localeCompare(right.requestUrl),
        ),
      ),
    ),
    writeFile(
      join(sourceDirectory, 'candidates.json'),
      deterministicJson(candidates),
    ),
    writeFile(join(sourceDirectory, 'validation-report.md'), report),
    writeFile(join(sourceDirectory, 'manifest.json'), manifestJson(manifest)),
  ]);

  console.log(
    JSON.stringify({
      zipEntries: entries.length,
      candidates: candidates.length,
      eciRows,
      comparedBenchmarks: comparisons.length,
    }),
  );
}

await main();
