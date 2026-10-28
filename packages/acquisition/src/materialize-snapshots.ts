import { createHash } from 'node:crypto';
import {
  GDP_XLSX_PAGE_URL,
  materializeGdpXlsx,
} from './surge-gdp-xlsx-materializer.js';
import {
  DAYJOB_HEALTHCARE_PAGE_URL,
  materializeDayjobHealthcare,
} from './surge-dayjob-healthcare-materializer.js';
import {
  DAYJOB_TAX_PAGE_URL,
  materializeDayjobTax,
} from './surge-dayjob-tax-materializer.js';
import {
  DAYJOB_FINANCE_PAGE_URL,
  materializeDayjobFinance,
} from './surge-dayjob-finance-materializer.js';
import {
  RIEMANN_PAGE_URL,
  materializeRiemann,
} from './surge-riemann-materializer.js';
import {
  CORECRAFT_PAGE_URL,
  materializeCorecraft,
} from './surge-corecraft-materializer.js';
import {
  COMPLEX_CONSTRAINTS_PAGE_URL,
  materializeComplexConstraints,
} from './surge-complex-constraints-materializer.js';
import { readFileSync, existsSync } from 'node:fs';
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
import { resolve, join, dirname } from 'node:path';
import {
  CHARTOGRAPHY_PAGE_URL,
  materializeChartography,
} from './surge-chartography-materializer.js';
import {
  extractArtificialAnalysisRscRows,
  materializeArtificialAnalysisRsc,
  type ArtificialAnalysisPage,
} from './artificial-analysis-rsc.js';
import {
  buildLiveBenchSnapshot,
  liveBenchInputFromEvidence,
} from './livebench-snapshot.js';
import { materializeDeepSwe } from './deepswe-materializer.js';
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
  getComparisonOnlyBenchmarkIds,
  type CandidateResult,
  type EvidenceRecord,
} from '@llm-bench/benchmark-data';
import {
  renderEffortInferenceSection,
  upsertEffortInferenceSection,
} from './effort-inference-report.js';

const prettyDeterministicJson = (value: unknown): string =>
  `${JSON.stringify(JSON.parse(deterministicJson(value)), null, 2)}\n`;

function getWorkspaceRoot(): string {
  let dir = process.cwd();
  while (true) {
    if (existsSync(join(dir, 'data'))) {
      return dir;
    }
    const parent = dirname(dir);
    if (parent === dir) {
      throw new Error('Workspace root not found');
    }
    dir = parent;
  }
}

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
          join(repoRoot, 'data', 'mappings', 'benchmarks.json'),
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

export function materializeSnapshots(
  repoRoot: string,
  options: { force?: boolean } = {},
): ProcessingStats {
  const started = performance.now();
  const stats: ProcessingStats = {
    hits: 0,
    misses: 0,
    parsedSources: 0,
    elapsedMs: 0,
  };
  const store = new EvidenceStore(repoRoot);
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

    updateToken = store.beginSourceUpdate(sources.map(({ id }) => id));

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
            const page = evidenceFor(COMPLEX_CONSTRAINTS_PAGE_URL);
            const result = materializeComplexConstraints(evidenceText(page), {
              evidenceId: page.id,
              observedAt: page.retrievedAt,
              visualRowCount: Number(page.metadata?.renderedRows),
            });
            candidates = result.candidates;
            customReportText = result.validationReport;
          } else if (src.id === 'surge-corecraft') {
            const page = evidenceFor(CORECRAFT_PAGE_URL);
            const result = materializeCorecraft(evidenceText(page), {
              evidenceId: page.id,
              observedAt: page.retrievedAt,
              visualRowCount: Number(page.metadata?.renderedRows),
            });
            candidates = result.candidates;
            customReportText = result.validationReport;
          } else if (src.id === 'surge-riemann') {
            const page = evidenceFor(RIEMANN_PAGE_URL);
            const result = materializeRiemann(evidenceText(page), {
              evidenceId: page.id,
              observedAt: page.retrievedAt,
              visualRowCount: Number(page.metadata?.renderedRows),
            });
            candidates = result.candidates;
            customReportText = result.validationReport;
          } else if (src.id === 'surge-dayjob-finance') {
            const page = evidenceFor(DAYJOB_FINANCE_PAGE_URL);
            const result = materializeDayjobFinance(evidenceText(page), {
              evidenceId: page.id,
              observedAt: page.retrievedAt,
              visualRowCount: Number(page.metadata?.renderedRows),
            });
            candidates = result.candidates;
            customReportText = result.validationReport;
          } else if (src.id === 'surge-dayjob-healthcare') {
            const page = evidenceFor(DAYJOB_HEALTHCARE_PAGE_URL);
            const result = materializeDayjobHealthcare(evidenceText(page), {
              evidenceId: page.id,
              observedAt: page.retrievedAt,
              visualRowCount: Number(page.metadata?.renderedRows),
            });
            candidates = result.candidates;
            customReportText = result.validationReport;
          } else if (src.id === 'surge-dayjob-tax') {
            const page = evidenceFor(DAYJOB_TAX_PAGE_URL);
            const result = materializeDayjobTax(evidenceText(page), {
              evidenceId: page.id,
              observedAt: page.retrievedAt,
              visualRowCount: Number(page.metadata?.renderedRows),
            });
            candidates = result.candidates;
            customReportText = result.validationReport;
          } else if (src.id === 'surge-gdp-xlsx') {
            const page = evidenceFor(GDP_XLSX_PAGE_URL);
            const result = materializeGdpXlsx(evidenceText(page), {
              evidenceId: page.id,
              observedAt: page.retrievedAt,
              visualRowCount: Number(page.metadata?.renderedRows),
            });
            candidates = result.candidates;
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
            const pages: ArtificialAnalysisPage[] = aaPageRecords.map(
              (record) => {
                const isModels =
                  record.requestUrl === 'https://artificialanalysis.ai/models';
                const isDetail = record.requestUrl.startsWith(
                  'https://artificialanalysis.ai/models/',
                );
                const slug = isModels
                  ? 'models'
                  : (record.requestUrl.split('/').at(-1) ?? record.requestUrl);
                const html = readFileSync(
                  join(repoRoot, record.artifactPath),
                  'utf8',
                );
                return {
                  kind: isModels
                    ? 'models'
                    : isDetail
                      ? 'model-detail'
                      : 'evaluation',
                  slug,
                  sourceUrl: record.requestUrl,
                  evidenceId: record.id,
                  retrievedAt: record.retrievedAt,
                  rows: extractArtificialAnalysisRscRows(html),
                };
              },
            );
            const apiRecord = evidenceList.find(
              ({ requestUrl, method }) =>
                requestUrl ===
                  'https://artificialanalysis.ai/api/v2/data/llms/models' &&
                method === 'API_RESPONSE',
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
            candidates = result.candidates;
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
    // Commit all durable snapshots before exporting any source files.
    const snapshots = [...outputFiles].map(([sourceId, files]) =>
      store.importSnapshot(sourceId, files, {
        kind: 'offline-materialization',
        revision,
      }),
    );
    for (const id of snapshots) store.exportSnapshot(id);
    store.completeSourceUpdate(updateToken);
    updateToken = undefined;

    stats.elapsedMs = Math.round(performance.now() - started);
    console.log(`Processing statistics: ${JSON.stringify(stats)}`);
    return stats;
  } catch (error) {
    if (updateToken) store.abortSourceUpdate(updateToken);
    throw error;
  } finally {
    store.close();
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  const root = resolve(
    process.argv.slice(2).find((arg) => !arg.startsWith('--')) ??
      getWorkspaceRoot(),
  );
  materializeSnapshots(root, { force: process.argv.includes('--force') });
}
