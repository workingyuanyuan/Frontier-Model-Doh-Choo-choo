import { prettyDeterministicJson } from './refresh-utils.js';
import { getWorkspaceRoot } from './workspace-root.js';
import { latestSurgeEvidence, retainSurgeSnapshot } from './surge-version.js';
import { createHash } from 'node:crypto';
import {
  GDP_XLSX_PAGE_URL,
  materializeGdpXlsx,
} from './surge-gdp-xlsx-materializer.js';
import {
  RIEMANN_PAGE_URL,
  materializeRiemann,
} from './surge-riemann-materializer.js';
import {
  COMPLEX_CONSTRAINTS_PAGE_URL,
  materializeComplexConstraints,
} from './surge-complex-constraints-materializer.js';
import { materializeSurgePercentLeaderboard } from './surge-percent-leaderboard.js';
import {
  SURGE_PERCENT_LEADERBOARDS,
  isSurgePercentLeaderboardId,
} from './surge-percent-leaderboard-specs.js';
import { readFileSync } from 'node:fs';
import { performance } from 'node:perf_hooks';
import { pathToFileURL } from 'node:url';
import { EvidenceStore } from './evidence-store.js';
import {
  parserRevision,
  processingConfig,
  processSource,
  readSourceFiles,
  type SourceFiles,
  type ProcessingStats,
} from './source-processing.js';
import { resolve, join } from 'node:path';
import {
  CHARTOGRAPHY_PAGE_URL,
  materializeChartography,
} from './surge-chartography-materializer.js';
import {
  extractArtificialAnalysisRscRows,
  ARTIFICIAL_ANALYSIS_EVALUATION_SLUGS,
  readCapturedPageReferences,
  type CapturedPageReference,
  materializeArtificialAnalysisRsc,
  retainArtificialAnalysisBriefcaseRows,
  type ArtificialAnalysisPage,
} from './artificial-analysis-rsc.js';
import {
  buildLiveBenchSnapshot,
  liveBenchInputFromEvidence,
} from './livebench-snapshot.js';
import { materializeDeepSwe } from './deepswe-materializer.js';
import {
  BIOBASICS_PAGE_URL,
  materializeBioBasicsBench,
} from './biobasicsbench-materializer.js';
import {
  MAXXBENCH_PAGE_URL,
  materializeMaxxBench,
} from './maxxbench-materializer.js';
import {
  SCALE_SWE_ATLAS_PAGE_URL,
  materializeScaleSweAtlas,
} from './scale-swe-atlas-materializer.js';
import { materializeDeepSweCosts } from './pricing-materializers.js';
import { materializeOpenAIReleaseCaptures } from './vendor-openai.js';
import {
  materializeAnthropicReleases,
  ANTHROPIC_RELEASE_URLS,
} from './vendor-anthropic.js';
import { auditVendorReleases } from './vendor-release-audit.js';
import {
  FRONTIER_SWE_PAGE_URL,
  materializeFrontierSwe,
} from './frontier-swe-materializer.js';
import { materializeEpoch } from './epoch-materializer.js';
import {
  materializeArcPrize,
  ARC_PRIZE_EVALUATIONS_URL,
  ARC_PRIZE_MODELS_URL,
  ARC_PRIZE_DATASETS_URL,
  ARC_PRIZE_PAGE_URL,
} from './arc-prize-materializer.js';
import { materializeZapier, ZAPIER_PAGE_URL } from './zapier-materializer.js';
import { rebuildFrontierCodeFromEvidence } from './frontier-code-materializer.js';
import {
  CandidateResultSchema,
  CostRecordSchema,
  deterministicJson,
  ProfilePolicySchema,
  BenchmarkDimensionMappingSchema,
  SourcesConfigSchema,
  getComparisonOnlyBenchmarkIds,
  type CandidateResult,
  type EvidenceRecord,
} from '@llm-bench/benchmark-data';
import { asRecord } from './materializer-utils.js';
import {
  renderEffortInferenceSection,
  upsertEffortInferenceSection,
} from './effort-inference-report.js';

function getAAReport(
  extractedCount: number,
  candidateCount: number,
  unresolvedCount: number,
): string {
  return `# Artificial Analysis acquisition validation

- Evidence: captured Artificial Analysis models payload and GPT-5.6 release article.

## Exact counts

| Check | Count |
|---|---:|
| Source model objects parsed | 29 |
| Models with Intelligence/Coding indices | 28 |
| Structured CandidateResults | 372 |
| Article CandidateResults | 4 |
| Extracted rows | ${extractedCount} |
| Generated candidates | ${candidateCount} |
| Canonically unresolved candidates | ${unresolvedCount} |

The payload enumerates Intelligence Index, Coding Agent Index, AA-Omniscience index and accuracy, AA-LCR, HLE, GPQA, SciCode, CritPt, APEX-Agents, Terminal-Bench 2.1, τ³ Banking, LiveCodeBench, GDPval-AA, and IFBench wherever non-null. Intelligence/Coding composites and the raw Omniscience index are Excluded; Omniscience accuracy and the mapped direct constituents are Included. The article adds Fable/Sol AA-Briefcase rubric and Elo rows; rubric is Included and Elo remains Excluded.

## Role boundary

Artificial Analysis-owned indices, AA-Omniscience, AA-LCR, and AA-Briefcase use \`ORGANIZER\`. Reruns of external Benchmarks use \`INDEPENDENT\`.

## Risks and limitations

- The artifact exposes only part of the wider model catalog, so all rows remain \`PARTIAL_SOURCE\` and ${unresolvedCount} rows keep null identity.
- Null fields are not converted to zero. Chart-only values without structured or explicit textual evidence are not transcribed.
`;
}

const appendEffortInferenceReports = (
  repoRoot: string,
  sourceIds: readonly string[],
  filesBySource: Map<string, SourceFiles>,
): void => {
  const allCandidates = sourceIds.flatMap((sourceId) => {
    return CandidateResultSchema.array().parse(
      JSON.parse(filesBySource.get(sourceId)!['candidates.json']!),
    );
  });
  const policy = ProfilePolicySchema.parse(
    JSON.parse(
      readFileSync(
        join(repoRoot, 'data', 'mappings', 'profile-policy.json'),
        'utf8',
      ),
    ),
  );
  const comparisonOnlyIds = getComparisonOnlyBenchmarkIds(
    BenchmarkDimensionMappingSchema.parse(
      JSON.parse(
        readFileSync(
          join(repoRoot, 'data', 'mappings', 'benchmarks-v2.json'),
          'utf8',
        ),
      ),
    ),
  );
  const inferenceCandidates = allCandidates.filter(
    ({ benchmarkId }) => !comparisonOnlyIds.has(benchmarkId),
  );

  for (const sourceId of sourceIds) {
    const candidates = CandidateResultSchema.array().parse(
      JSON.parse(filesBySource.get(sourceId)!['candidates.json']!),
    );
    const report = filesBySource.get(sourceId)!['validation-report.md']!;
    const section = renderEffortInferenceSection(
      sourceId,
      candidates,
      inferenceCandidates,
      policy,
    );
    filesBySource.get(sourceId)!['validation-report.md'] =
      upsertEffortInferenceSection(report, section);
  }
};

/**
 * Rebuilds every replayable source from its saved evidence. With `check`, the
 * evidence store is never opened and nothing is written: the caller compares
 * the returned files with the working tree.
 */
function rebuildSnapshots(
  repoRoot: string,
  options: { force?: boolean; check?: boolean } = {},
): { stats: ProcessingStats; outputFiles: Map<string, SourceFiles> } {
  const started = performance.now();
  const stats: ProcessingStats = {
    hits: 0,
    misses: 0,
    parsedSources: 0,
    elapsedMs: 0,
  };
  const store = options.check ? null : new EvidenceStore(repoRoot);
  let updateToken: string | undefined;
  try {
    const revision = parserRevision();
    const config = processingConfig(repoRoot);
    console.log(
      `Regenerating candidate snapshots in repository root: ${repoRoot}`,
    );

    const sources = [
      { id: 'artificial-analysis', reportFn: getAAReport },
      { id: 'livebench', reportFn: null },
      { id: 'deepswe', reportFn: null },
      { id: 'maxxbench', reportFn: null },
      { id: 'scale-swe-atlas', reportFn: null },
      { id: 'biobasicsbench', reportFn: null },
      { id: 'frontier-code', reportFn: null },
      { id: 'frontier-swe', reportFn: null },
      { id: 'surge-chartography', reportFn: null },
      { id: 'surge-complex-constraints', reportFn: null },
      { id: 'surge-corecraft', reportFn: null },
      { id: 'surge-riemann', reportFn: null },
      { id: 'surge-dayjob-finance', reportFn: null },
      { id: 'surge-dayjob-healthcare', reportFn: null },
      { id: 'surge-dayjob-tax', reportFn: null },
      { id: 'surge-gdp-xlsx', reportFn: null },
      { id: 'epoch-ai', reportFn: null },
      { id: 'arc-prize', reportFn: null },
      { id: 'zapier-automationbench', reportFn: null },
      { id: 'openai-releases', reportFn: null },
      { id: 'anthropic-releases', reportFn: null },
    ];

    updateToken = store?.beginSourceUpdate(sources.map(({ id }) => id));

    // Audit both vendor snapshots against captured references before any files
    // are replaced, including when only one vendor contains a discrepancy.
    const vendorResults = new Map(
      ['openai-releases', 'anthropic-releases'].map((sourceId) => {
        const evidence = JSON.parse(
          readFileSync(
            join(repoRoot, 'data', 'sources', sourceId, 'evidence-index.json'),
            'utf8',
          ),
        ) as EvidenceRecord[];
        return [
          sourceId,
          {
            evidence,
            result: null as Pick<
              ReturnType<typeof materializeOpenAIReleaseCaptures>,
              'candidates' | 'costs' | 'validationReport'
            > | null,
          },
        ] satisfies [
          string,
          {
            evidence: EvidenceRecord[];
            result: Pick<
              ReturnType<typeof materializeOpenAIReleaseCaptures>,
              'candidates' | 'costs' | 'validationReport'
            > | null;
          },
        ];
      }),
    );
    const cursorEvidence = vendorResults
      .get('anthropic-releases')!
      .evidence.find(
        ({ requestUrl, mediaType }) =>
          requestUrl === 'https://prod.cursor.com/evals' &&
          mediaType === 'text/html',
      );
    if (!cursorEvidence)
      throw new Error('Missing stored Cursor organizer evidence');
    const references = [
      'deepswe',
      'zapier-automationbench',
      'frontier-code',
    ].map((sourceId) => ({
      sourceId,
      evidence: JSON.parse(
        readFileSync(
          join(repoRoot, 'data', 'sources', sourceId, 'evidence-index.json'),
          'utf8',
        ),
      ) as EvidenceRecord[],
    }));
    const stagedSources: {
      src: (typeof sources)[number];
      candidates: CandidateResult[];
      customReportText: string | null;
      materializedCosts: unknown[] | null;
    }[] = [];

    for (const src of sources) {
      const sourceDir = join(repoRoot, 'data', 'sources', src.id);
      const indexFile = join(sourceDir, 'evidence-index.json');

      console.log(`Processing source ${src.id}...`);
      const evidenceList = JSON.parse(
        readFileSync(indexFile, 'utf8'),
      ) as EvidenceRecord[];

      const baseline = readSourceFiles(repoRoot, src.id);
      const extraction = processSource({
        store,
        sourceId: src.id,
        evidence: evidenceList,
        parserVersion: revision,
        config: {
          mappings: config,
          // The FrontierCode rebuild checks 1.1 against the saved snapshot, so
          // a changed baseline must miss the cache and rerun that gate.
          ...(src.id === 'frontier-code'
            ? {
                frontierCodeBaseline: createHash('sha256')
                  .update(baseline['candidates.json'] ?? '')
                  .update('\0')
                  .update(baseline['costs.json'] ?? '')
                  .digest('hex'),
              }
            : {}),
          ...([
            'artificial-analysis',
            'surge-complex-constraints',
            'surge-riemann',
          ].includes(src.id)
            ? {
                retainedSnapshotBaseline: createHash('sha256')
                  .update(baseline['candidates.json'] ?? '')
                  .digest('hex'),
              }
            : {}),
          // Epoch retains capture-time checks. Counts and generated inference are derived below.
          captureReport:
            src.id === 'epoch-ai'
              ? baseline['validation-report.md']
                  ?.split('<!-- C6-EFFORT-INFERENCE:START -->')[0]
                  ?.replace(
                    /^\| (CandidateResults|Rows without a canonical identity) \| \d+ \|\r?$/gm,
                    '',
                  )
              : null,
        },
        force: options.force ?? false,
        stats,
        encode: (result) => ({
          ...baseline,
          'candidates.json': prettyDeterministicJson(result.candidates),
          'validation-report.md': result.customReportText ?? '',
          ...(result.materializedCosts !== null
            ? {
                'costs.json': prettyDeterministicJson(result.materializedCosts),
              }
            : {}),
          'processing-result.json': JSON.stringify({
            hasReport: result.customReportText !== null,
            hasCosts: result.materializedCosts !== null,
          }),
        }),
        decode: (files) => {
          const flags = JSON.parse(files['processing-result.json']!);
          return {
            candidates: CandidateResultSchema.array().parse(
              JSON.parse(files['candidates.json']!),
            ),
            customReportText: flags.hasReport
              ? files['validation-report.md']!
              : null,
            materializedCosts: flags.hasCosts
              ? (JSON.parse(files['costs.json']!) as unknown[])
              : null,
          };
        },
        materialize: () => {
          let candidates: CandidateResult[] = [];
          let customReportText: string | null = null;
          let materializedCosts: unknown[] | null = null;
          const evidenceFor = (url: string): EvidenceRecord => {
            const record = evidenceList.find(
              (record) => record.requestUrl === url,
            );
            if (!record) throw new Error(`Missing ${src.id} evidence: ${url}`);
            return record;
          };
          const evidenceText = (record: EvidenceRecord) =>
            readFileSync(join(repoRoot, record.artifactPath), 'utf8');

          const vendor = vendorResults.get(src.id);
          if (vendor) {
            const releases = evidenceList.filter(
              (r) =>
                r.sourceId === src.id &&
                (src.id === 'openai-releases'
                  ? r.mediaType === 'application/json' &&
                    r.requestUrl.startsWith('https://openai.com/')
                  : (ANTHROPIC_RELEASE_URLS as readonly string[]).includes(
                      r.requestUrl,
                    )),
            );
            if (!releases.length)
              throw new Error(`Missing ${src.id} release evidence`);
            const pages = releases.map((record) => ({
              sourceUrl: record.requestUrl,
              text: evidenceText(record),
              evidenceId: record.id,
              observedAt: record.retrievedAt,
            }));
            const result =
              src.id === 'openai-releases'
                ? materializeOpenAIReleaseCaptures(
                    pages.map((page) => ({
                      captureText: page.text,
                      context: page,
                    })),
                  )
                : materializeAnthropicReleases(pages);
            candidates = result.candidates;
            customReportText = result.validationReport;
            materializedCosts = result.costs;
          } else if (src.id === 'surge-chartography') {
            const page = evidenceFor(CHARTOGRAPHY_PAGE_URL);
            const result = materializeChartography(evidenceText(page), {
              evidenceId: page.id,
              observedAt: page.retrievedAt,
              visualRowCount: Number(page.metadata?.renderedRows),
            });
            candidates = result.candidates;
            customReportText = result.validationReport;
          } else if (src.id === 'surge-complex-constraints') {
            const page = latestSurgeEvidence(
              evidenceList,
              COMPLEX_CONSTRAINTS_PAGE_URL,
            );
            const result = materializeComplexConstraints(evidenceText(page), {
              evidenceId: page.id,
              observedAt: page.retrievedAt,
              visualRowCount: Number(page.metadata?.renderedRows),
            });
            ({ candidates, validationReport: customReportText } =
              retainSurgeSnapshot(
                result,
                baseline['candidates.json'],
                evidenceList,
              ));
          } else if (isSurgePercentLeaderboardId(src.id)) {
            const spec = SURGE_PERCENT_LEADERBOARDS[src.id];
            const page = evidenceFor(spec.pageUrl);
            const result = materializeSurgePercentLeaderboard(
              spec,
              evidenceText(page),
              {
                evidenceId: page.id,
                observedAt: page.retrievedAt,
                visualRowCount: Number(page.metadata?.renderedRows),
              },
            );
            candidates = result.candidates;
            customReportText = result.validationReport;
          } else if (src.id === 'surge-riemann') {
            const page = latestSurgeEvidence(evidenceList, RIEMANN_PAGE_URL);
            const result = materializeRiemann(evidenceText(page), {
              evidenceId: page.id,
              observedAt: page.retrievedAt,
              visualRowCount: Number(page.metadata?.renderedRows),
            });
            ({ candidates, validationReport: customReportText } =
              retainSurgeSnapshot(
                result,
                baseline['candidates.json'],
                evidenceList,
              ));
          } else if (src.id === 'surge-gdp-xlsx') {
            const page = evidenceFor(GDP_XLSX_PAGE_URL);
            const result = materializeGdpXlsx(evidenceText(page), {
              evidenceId: page.id,
              observedAt: page.retrievedAt,
              visualRowCount: Number(page.metadata?.renderedRows),
            });
            candidates = result.candidates;
            customReportText = result.validationReport;
          } else if (src.id === 'biobasicsbench') {
            const page = evidenceFor(BIOBASICS_PAGE_URL);
            const result = materializeBioBasicsBench(evidenceText(page), {
              evidenceId: page.id,
              observedAt: page.retrievedAt,
            });
            candidates = result.candidates;
            materializedCosts = [];
            customReportText = result.validationReport;
          } else if (src.id === 'scale-swe-atlas') {
            const page = evidenceFor(SCALE_SWE_ATLAS_PAGE_URL);
            const catalog = JSON.parse(
              readFileSync(join(repoRoot, 'data/mappings/models.json'), 'utf8'),
            ) as {
              models: {
                modelId: string;
                displayName: string;
                aliases?: string[];
              }[];
            };
            const result = materializeScaleSweAtlas(evidenceText(page), {
              evidenceId: page.id,
              observedAt: page.retrievedAt,
              visualRowCount: Number(page.metadata?.renderedOverallRows),
              models: catalog.models,
            });
            candidates = result.candidates;
            materializedCosts = [];
            customReportText = result.validationReport;
          } else if (src.id === 'maxxbench') {
            const page = evidenceFor(MAXXBENCH_PAGE_URL);
            const result = materializeMaxxBench(evidenceText(page), {
              evidenceId: page.id,
              observedAt: page.retrievedAt,
              visualRowCount: Number(page.metadata?.renderedRows),
            });
            candidates = result.candidates;
            materializedCosts = result.costs;
            customReportText = result.validationReport;
          } else if (src.id === 'frontier-swe') {
            const page = evidenceFor(FRONTIER_SWE_PAGE_URL);
            const result = materializeFrontierSwe(evidenceText(page), {
              evidenceId: page.id,
              observedAt: page.retrievedAt,
            });
            candidates = result.candidates;
            customReportText = result.validationReport;
          } else if (src.id === 'epoch-ai') {
            const archive = evidenceFor(
              'https://epoch.ai/data/benchmark_data.zip',
            );
            candidates = materializeEpoch(
              readFileSync(join(repoRoot, archive.artifactPath)),
              archive.retrievedAt,
              { evidenceId: archive.id, sourceUrl: archive.requestUrl },
            );
            // The archived capture report contains cross-channel checks that an
            // offline identity replay cannot recreate. Retain those checks and update
            // only current materialization counts; effort reports are upserted below.
            const unresolved = candidates.filter(
              (candidate) => candidate.model.canonicalModelId === null,
            ).length;
            customReportText = readFileSync(
              join(sourceDir, 'validation-report.md'),
              'utf8',
            )
              .replace(
                /^\| CandidateResults \| \d+ \|\r?$/m,
                `| CandidateResults | ${candidates.length} |`,
              )
              .replace(
                /^\| Rows without a canonical identity \| \d+ \|\r?$/m,
                `| Rows without a canonical identity | ${unresolved} |`,
              );
          } else if (src.id === 'arc-prize') {
            const evaluations = evidenceFor(ARC_PRIZE_EVALUATIONS_URL);
            const models = evidenceFor(ARC_PRIZE_MODELS_URL);
            const datasets = evidenceFor(ARC_PRIZE_DATASETS_URL);
            const page = evidenceFor(ARC_PRIZE_PAGE_URL);
            const result = materializeArcPrize(
              evidenceText(evaluations),
              evidenceText(models),
              evidenceText(datasets),
              {
                evaluationsEvidenceId: evaluations.id,
                modelsEvidenceId: models.id,
                datasetsEvidenceId: datasets.id,
                pageEvidenceId: page.id,
                observedAt: evaluations.retrievedAt,
              },
            );
            if (result.missingModelIds.length)
              throw new Error(
                `Missing ARC models: ${result.missingModelIds.join(', ')}`,
              );
            candidates = result.candidates;
            materializedCosts = result.costs;
            customReportText = result.validationReport;
          } else if (src.id === 'zapier-automationbench') {
            const page = evidenceFor(ZAPIER_PAGE_URL);
            const moduleRecord = evidenceList.find(
              (record) => record.mediaType === 'text/javascript',
            );
            if (!moduleRecord) throw new Error('Missing Zapier route module');
            const result = materializeZapier(evidenceText(moduleRecord), {
              moduleEvidenceId: moduleRecord.id,
              pageEvidenceId: page.id,
              moduleUrl: moduleRecord.requestUrl,
              observedAt: moduleRecord.retrievedAt,
              discoveredModuleCount: Number(
                page.metadata?.discoveredModuleCount ?? 1,
              ),
            });
            candidates = result.candidates;
            materializedCosts = result.costs;
            customReportText = result.validationReport;
          } else if (src.id === 'artificial-analysis') {
            const aaPageRecords = evidenceList.filter(
              ({ requestUrl }) =>
                requestUrl === 'https://artificialanalysis.ai/models' ||
                requestUrl.startsWith(
                  'https://artificialanalysis.ai/models/',
                ) ||
                requestUrl.startsWith(
                  'https://artificialanalysis.ai/evaluations/',
                ),
            );
            if (aaPageRecords.length === 0) {
              throw new Error(
                'Artificial Analysis RSC page evidence not found',
              );
            }
            // The index also keeps earlier captures as Evidence for retained
            // rows. One refresh stamps every capture with the same time, so
            // the latest time identifies the current snapshot.
            const capturedAt = aaPageRecords
              .map(({ retrievedAt }) => retrievedAt)
              .toSorted()
              .at(-1)!;
            const currentRecords = aaPageRecords.filter(
              ({ retrievedAt }) => retrievedAt === capturedAt,
            );
            const rowsByEvidence = new Map(
              currentRecords.map((record) => [
                record.id,
                extractArtificialAnalysisRscRows(
                  readFileSync(join(repoRoot, record.artifactPath), 'utf8'),
                ),
              ]),
            );
            const modelsRecord = currentRecords.find(
              ({ requestUrl }) =>
                requestUrl === 'https://artificialanalysis.ai/models',
            );
            const recorded = modelsRecord
              ? readCapturedPageReferences(modelsRecord.metadata)
              : null;
            // Snapshots written before the page list was recorded: one page
            // per surviving record, models first, then evaluations in their
            // configured order, then detail pages by slug. Scores and rows
            // reproduce; which Evidence page a row cites may not.
            const evaluationOrder = (slug: string): number =>
              ARTIFICIAL_ANALYSIS_EVALUATION_SLUGS.indexOf(
                slug as (typeof ARTIFICIAL_ANALYSIS_EVALUATION_SLUGS)[number],
              );
            const references =
              recorded ??
              currentRecords
                .map(({ id, requestUrl }): CapturedPageReference => {
                  const segment = requestUrl.split('/').at(-1) ?? requestUrl;
                  return requestUrl === 'https://artificialanalysis.ai/models'
                    ? {
                        kind: 'models',
                        slug: 'models',
                        sourceUrl: requestUrl,
                        evidenceId: id,
                      }
                    : requestUrl.startsWith(
                          'https://artificialanalysis.ai/models/',
                        )
                      ? {
                          kind: 'model-detail',
                          slug: decodeURIComponent(segment),
                          sourceUrl: requestUrl,
                          evidenceId: id,
                        }
                      : {
                          kind: 'evaluation',
                          slug: segment,
                          sourceUrl: requestUrl,
                          evidenceId: id,
                        };
                })
                .toSorted((left, right) => {
                  const rank = (page: CapturedPageReference) =>
                    page.kind === 'models'
                      ? -1
                      : page.kind === 'evaluation'
                        ? evaluationOrder(page.slug)
                        : ARTIFICIAL_ANALYSIS_EVALUATION_SLUGS.length;
                  return (
                    rank(left) - rank(right) ||
                    left.slug.localeCompare(right.slug)
                  );
                });
            const pages = references.map((page): ArtificialAnalysisPage => {
              const rows = rowsByEvidence.get(page.evidenceId);
              if (!rows)
                throw new Error(
                  `Artificial Analysis page ${page.sourceUrl} cites Evidence outside the current capture: ${page.evidenceId}`,
                );
              return { ...page, retrievedAt: capturedAt, rows };
            });
            const apiRecord = evidenceList.find(
              ({ requestUrl, method, retrievedAt }) =>
                requestUrl ===
                  'https://artificialanalysis.ai/api/v2/data/llms/models' &&
                method === 'API_RESPONSE' &&
                retrievedAt === capturedAt,
            );
            const api = apiRecord
              ? {
                  sourceUrl: apiRecord.requestUrl,
                  evidenceId: apiRecord.id,
                  retrievedAt: apiRecord.retrievedAt,
                  payload: JSON.parse(
                    readFileSync(
                      join(repoRoot, apiRecord.artifactPath),
                      'utf8',
                    ),
                  ) as unknown,
                }
              : null;
            const result = materializeArtificialAnalysisRsc(pages, api);
            // Same carry-forward as the online refresh, against the saved
            // snapshot: rows this capture observed always win.
            candidates = retainArtificialAnalysisBriefcaseRows(
              result.candidates,
              baseline['candidates.json']
                ? CandidateResultSchema.array().parse(
                    JSON.parse(baseline['candidates.json']),
                  )
                : [],
              result.activeProfileKeys,
            ).candidates;
            materializedCosts = result.costs;
            customReportText = result.validationReport;
          } else if (src.id === 'livebench') {
            const snapshot = buildLiveBenchSnapshot(
              liveBenchInputFromEvidence(
                evidenceList,
                evidenceText,
                baseline['candidates.json']
                  ? CandidateResultSchema.array().parse(
                      JSON.parse(baseline['candidates.json']),
                    )
                  : null,
              ),
            );
            candidates = snapshot.candidates;
            customReportText = snapshot.validationReport;
            materializedCosts = snapshot.costs;
          } else if (src.id === 'deepswe') {
            const jsonRecord = evidenceList.find(
              (e) =>
                e.mediaType === 'application/json' ||
                e.requestUrl.includes('leaderboard-live.json'),
            );
            if (!jsonRecord) {
              throw new Error(
                'leaderboard-live.json evidence not found for deepswe',
              );
            }
            const jsonText = readFileSync(
              join(repoRoot, jsonRecord.artifactPath),
              'utf8',
            );
            const result = materializeDeepSwe(
              jsonText,
              jsonRecord.retrievedAt,
              {
                evidenceId: jsonRecord.id,
                sourceUrl: jsonRecord.requestUrl,
              },
            );
            candidates = result.candidates;
            customReportText = result.validationReport;
            materializedCosts = materializeDeepSweCosts(jsonText, {
              sourceUrl: jsonRecord.requestUrl,
              evidenceId: jsonRecord.id,
              observedAt: jsonRecord.retrievedAt,
              method: jsonRecord.method,
            });
          } else if (src.id === 'frontier-code') {
            const result = rebuildFrontierCodeFromEvidence(
              evidenceList,
              (artifactPath) =>
                readFileSync(join(repoRoot, artifactPath), 'utf8'),
              {
                candidates: baseline['candidates.json']
                  ? CandidateResultSchema.array().parse(
                      JSON.parse(baseline['candidates.json']),
                    )
                  : [],
                costs: baseline['costs.json']
                  ? CostRecordSchema.array().parse(
                      JSON.parse(baseline['costs.json']),
                    )
                  : [],
              },
            );
            candidates = result.candidates;
            materializedCosts = result.costs;
            customReportText = result.validationReport;
          }

          // Unique-ID check
          const ids = new Set<string>();
          for (const c of candidates) {
            if (ids.has(c.id)) {
              throw new Error(
                `Duplicate candidate ID found in ${src.id}: ${c.id}`,
              );
            }
            ids.add(c.id);
          }

          // Schema parse
          CandidateResultSchema.array().parse(candidates);

          const availableEvidenceIds = new Set(
            evidenceList.map(({ id }) => id),
          );
          const missingEvidenceIds = [
            ...new Set(
              candidates.flatMap(({ evidenceIds }) =>
                evidenceIds.filter((id) => !availableEvidenceIds.has(id)),
              ),
            ),
          ];
          if (missingEvidenceIds.length > 0) {
            throw new Error(
              `${src.id} candidates reference missing Evidence: ${missingEvidenceIds.join(', ')}`,
            );
          }

          // Deterministic sort by id
          candidates.sort((a, b) => a.id.localeCompare(b.id));
          return { candidates, customReportText, materializedCosts };
        },
      });
      const vendor = vendorResults.get(src.id);
      if (vendor)
        vendor.result = {
          candidates: extraction.candidates,
          costs: extraction.materializedCosts as ReturnType<
            typeof materializeOpenAIReleaseCaptures
          >['costs'],
          validationReport: extraction.customReportText ?? '',
        };
      stagedSources.push({ src, ...extraction });
    }

    const organizerCandidates = references.flatMap(({ sourceId }) => {
      const staged = stagedSources.find(({ src }) => src.id === sourceId);
      if (!staged)
        throw new Error(`Missing staged organizer source: ${sourceId}`);
      return staged.candidates;
    });
    const vendorChecks = auditVendorReleases(
      [...vendorResults.values()].flatMap(({ result }) => result!.candidates),
      organizerCandidates,
      readFileSync(join(repoRoot, cursorEvidence.artifactPath), 'utf8'),
    );

    const outputFiles = new Map<string, SourceFiles>();

    // Publish exactly the arrays audited above, after all source extraction and
    // vendor/organizer comparisons have passed.
    for (const {
      src,
      candidates,
      customReportText,
      materializedCosts,
    } of stagedSources) {
      const vendor = vendorResults.get(src.id);
      const candidateIds = new Set(candidates.map(({ id }) => id));
      const checks = vendorChecks.filter(({ candidateId }) =>
        candidateIds.has(candidateId),
      );

      const files = readSourceFiles(repoRoot, src.id);
      const pretty = /\n\s+\{/.test(files['candidates.json'] ?? '');
      files['candidates.json'] = pretty
        ? prettyDeterministicJson(candidates)
        : deterministicJson(candidates);
      if (materializedCosts !== null)
        files['costs.json'] = prettyDeterministicJson(materializedCosts);
      if (files['costs.json']) {
        const available = new Set(
          (JSON.parse(files['evidence-index.json']!) as EvidenceRecord[]).map(
            ({ id }) => id,
          ),
        );
        const costs = CostRecordSchema.array().parse(
          JSON.parse(files['costs.json']),
        );
        const missing = [
          ...new Set(
            costs.flatMap(({ evidenceIds }) =>
              evidenceIds.filter((id) => !available.has(id)),
            ),
          ),
        ];
        if (missing.length)
          throw new Error(
            `${src.id} costs reference missing Evidence: ${missing.join(', ')}`,
          );
      }
      if (vendor)
        files['cross-checks.json'] = prettyDeterministicJson({
          observedAt: cursorEvidence.retrievedAt,
          checks,
          references,
          cursorEvidence,
        });
      // Counts
      const unresolvedCount = candidates.filter(
        (c) => c.model.canonicalModelId === null,
      ).length;

      // Write validation-report.md
      let reportText =
        customReportText ??
        (src.reportFn
          ? src.reportFn(candidates.length, candidates.length, unresolvedCount)
          : '');
      if (vendor) {
        reportText += `\n## Organizer cross-check\n\n- Matched: ${checks.filter(({ status }) => status === 'MATCH').length}\n- Vendor preview rows absent from reference: ${checks.filter(({ status }) => status === 'SUPPLEMENT').length}\n- Excluded: ${checks.filter(({ status }) => status === 'EXCLUDED').length}\n- Per-row references and rounding decisions: [cross-checks.json](cross-checks.json).\n`;
      }
      files['validation-report.md'] = reportText;
      outputFiles.set(src.id, files);

      console.log(
        `Source ${src.id} done. Extracted/Candidates: ${candidates.length}, Unresolved: ${unresolvedCount}`,
      );
    }

    appendEffortInferenceReports(
      repoRoot,
      sources.map(({ id }) => id),
      outputFiles,
    );
    if (store) {
      // Commit all durable snapshots before exporting any source files.
      const snapshots = [...outputFiles].map(([sourceId, files]) =>
        store.importSnapshot(sourceId, files, {
          kind: 'offline-materialization',
          revision,
        }),
      );
      for (const id of snapshots) store.exportSnapshot(id);
      store.completeSourceUpdate(updateToken!);
      updateToken = undefined;
    }

    stats.elapsedMs = Math.round(performance.now() - started);
    console.log(`Processing statistics: ${JSON.stringify(stats)}`);
    return { stats, outputFiles };
  } catch (error) {
    if (store && updateToken) store.abortSourceUpdate(updateToken);
    throw error;
  } finally {
    store?.close();
  }
}

export function materializeSnapshots(
  repoRoot: string,
  options: { force?: boolean } = {},
): ProcessingStats {
  return rebuildSnapshots(repoRoot, options).stats;
}

export interface ReplayDifference {
  sourceId: string;
  file: string;
  /** Row ids for JSON arrays of records; empty for other files. */
  added: string[];
  removed: string[];
  changed: string[];
}

export interface ReplayCheck {
  /** Sources rebuilt from saved evidence and compared with the working tree. */
  replayedSourceIds: string[];
  /** Whitelisted sources the offline path cannot rebuild. */
  notReplayableSourceIds: string[];
  differences: ReplayDifference[];
}

const parseJson = (text: string): { value: unknown } | null => {
  try {
    return { value: JSON.parse(text) };
  } catch {
    return null;
  }
};

/** Rows keyed by id, or null when the file is not an array of uniquely identified records. */
const rowsById = (text: string | undefined): Map<string, string> | null => {
  if (text === undefined) return new Map();
  const value = parseJson(text)?.value;
  if (!Array.isArray(value)) return null;
  const rows = new Map<string, string>();
  for (const row of value) {
    const id = asRecord(row)?.id;
    if (typeof id !== 'string' || rows.has(id)) return null;
    rows.set(id, deterministicJson(row));
  }
  return rows;
};

/**
 * Compares rebuilt files with saved ones by content, ignoring JSON layout. A
 * file present on one side only always differs, even when it holds no rows.
 */
export const diffSourceFiles = (
  sourceId: string,
  saved: SourceFiles,
  rebuilt: SourceFiles,
): ReplayDifference[] =>
  [...new Set([...Object.keys(saved), ...Object.keys(rebuilt)])]
    .toSorted()
    .flatMap((file): ReplayDifference[] => {
      const before = saved[file];
      const after = rebuilt[file];
      if (before === after) return [];
      const difference = {
        sourceId,
        file,
        added: [] as string[],
        removed: [] as string[],
        changed: [] as string[],
      };
      if (!file.endsWith('.json')) return [difference];
      const savedRows = rowsById(before);
      const rebuiltRows = rowsById(after);
      if (savedRows === null || rebuiltRows === null) {
        // Not comparable row by row: equal only when both parse to the same value.
        const left = before === undefined ? null : parseJson(before);
        const right = after === undefined ? null : parseJson(after);
        return left !== null &&
          right !== null &&
          deterministicJson(left.value) === deterministicJson(right.value)
          ? []
          : [difference];
      }
      for (const [id, row] of rebuiltRows) {
        if (!savedRows.has(id)) difference.added.push(id);
        else if (savedRows.get(id) !== row) difference.changed.push(id);
      }
      for (const id of savedRows.keys())
        if (!rebuiltRows.has(id)) difference.removed.push(id);
      return before === undefined ||
        after === undefined ||
        difference.added.length +
          difference.removed.length +
          difference.changed.length >
          0
        ? [difference]
        : [];
    });

/**
 * Rebuilds the replayable sources in memory and reports where the result
 * differs from the saved snapshots. Reads only; the evidence store stays shut.
 */
export function checkSnapshotReplay(repoRoot: string): ReplayCheck {
  const { outputFiles } = rebuildSnapshots(repoRoot, { check: true });
  const whitelist = SourcesConfigSchema.parse(
    JSON.parse(
      readFileSync(join(repoRoot, 'data', 'mappings', 'sources.json'), 'utf8'),
    ),
  ).whitelist;
  return {
    replayedSourceIds: [...outputFiles.keys()].toSorted(),
    notReplayableSourceIds: whitelist
      .filter((sourceId) => !outputFiles.has(sourceId))
      .toSorted(),
    differences: [...outputFiles].flatMap(([sourceId, files]) =>
      diffSourceFiles(sourceId, readSourceFiles(repoRoot, sourceId), files),
    ),
  };
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  const root = resolve(
    process.argv.slice(2).find((arg) => !arg.startsWith('--')) ??
      getWorkspaceRoot(),
  );
  if (process.argv.includes('--check')) {
    // Keep stdout for the JSON report; rebuild progress goes to stderr.
    const log = console.log;
    console.log = console.error;
    let check: ReplayCheck;
    try {
      check = checkSnapshotReplay(root);
    } finally {
      console.log = log;
    }
    console.log(
      JSON.stringify(
        {
          ...check,
          differences: check.differences.map((difference) => ({
            sourceId: difference.sourceId,
            file: difference.file,
            added: difference.added.length,
            removed: difference.removed.length,
            changed: difference.changed.length,
            examples: [
              ...difference.added.slice(0, 3).map((id) => `+ ${id}`),
              ...difference.removed.slice(0, 3).map((id) => `- ${id}`),
              ...difference.changed.slice(0, 3).map((id) => `~ ${id}`),
            ],
          })),
        },
        null,
        2,
      ),
    );
    // Reports are regenerated prose; only a changed score or cost row fails.
    if (
      check.differences.some(({ file }) =>
        ['candidates.json', 'costs.json'].includes(file),
      )
    )
      process.exitCode = 1;
  } else {
    materializeSnapshots(root, { force: process.argv.includes('--force') });
  }
}
