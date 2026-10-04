import {
  GDP_XLSX_PAGE_URL,
  materializeGdpXlsx,
} from './surge-gdp-xlsx-materializer.js';
import {
  DAYJOB_HEALTHCARE_PAGE_URL,
  materializeDayjobHealthcare,
} from './surge-dayjob-healthcare-materializer.js';
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
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
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
import { materializeLiveBench } from './livebench-materializer.js';
import { materializeDeepSwe } from './deepswe-materializer.js';
import { materializeOpenAIRelease } from './vendor-openai.js';
import { materializeAnthropicRelease } from './vendor-anthropic.js';
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
import {
  FRONTIER_CODE_DATA_URL,
  FRONTIER_CODE_PAGE_URL,
  materializeFrontierCode,
} from './frontier-code-materializer.js';
import {
  CandidateResultSchema,
  deterministicJson,
  ProfilePolicySchema,
  BenchmarkDimensionMappingSchema,
  getComparisonOnlyBenchmarkIds,
  type CandidateResult,
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
): void => {
  const sourceRoot = join(repoRoot, 'data', 'sources');
  const allCandidates = sourceIds.flatMap((sourceId) => {
    const path = join(sourceRoot, sourceId, 'candidates.json');
    return CandidateResultSchema.array().parse(
      JSON.parse(readFileSync(path, 'utf8')),
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
    const sourceDirectory = join(sourceRoot, sourceId);
    const candidates = CandidateResultSchema.array().parse(
      JSON.parse(
        readFileSync(join(sourceDirectory, 'candidates.json'), 'utf8'),
      ),
    );
    const reportPath = join(sourceDirectory, 'validation-report.md');
    const report = readFileSync(reportPath, 'utf8');
    const section = renderEffortInferenceSection(
      sourceId,
      candidates,
      inferenceCandidates,
      policy,
    );
    writeFileSync(
      reportPath,
      upsertEffortInferenceSection(report, section),
      'utf8',
    );
  }
};

interface EvidenceRecord {
  id: string;
  sourceId: string;
  retrievedAt: string;
  artifactPath: string;
  mediaType: string;
  requestUrl: string;
  method: string;
  metadata?: Record<string, unknown>;
}

function main() {
  const repoRoot = resolve(process.argv[2] || getWorkspaceRoot());
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
    { id: 'surge-gdp-xlsx', reportFn: null },
    { id: 'epoch-ai', reportFn: null },
    { id: 'arc-prize', reportFn: null },
    { id: 'zapier-automationbench', reportFn: null },
    { id: 'openai-releases', reportFn: null },
    { id: 'anthropic-releases', reportFn: null },
  ];

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
      const release = evidence[0];
      if (!release || release.sourceId !== sourceId) {
        throw new Error(`Missing ${sourceId} release evidence`);
      }
      const text = readFileSync(join(repoRoot, release.artifactPath), 'utf8');
      const context = {
        evidenceId: release.id,
        observedAt: release.retrievedAt,
      };
      const result =
        sourceId === 'openai-releases'
          ? materializeOpenAIRelease(text, context)
          : materializeAnthropicRelease(text, context);
      return [sourceId, { result, evidence }] as const;
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
  const references = ['deepswe', 'zapier-automationbench', 'frontier-code'].map(
    (sourceId) => ({
      sourceId,
      evidence: JSON.parse(
        readFileSync(
          join(repoRoot, 'data', 'sources', sourceId, 'evidence-index.json'),
          'utf8',
        ),
      ) as EvidenceRecord[],
    }),
  );
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

    let candidates: CandidateResult[] = [];
    let customReportText: string | null = null;
    let materializedCosts: unknown[] | null = null;
    const evidenceFor = (url: string): EvidenceRecord => {
      const record = evidenceList.find((record) => record.requestUrl === url);
      if (!record) throw new Error(`Missing ${src.id} evidence: ${url}`);
      return record;
    };
    const evidenceText = (record: EvidenceRecord) =>
      readFileSync(join(repoRoot, record.artifactPath), 'utf8');

    const vendor = vendorResults.get(src.id);
    if (vendor) {
      candidates = vendor.result.candidates;
      customReportText = vendor.result.validationReport;
      materializedCosts = vendor.result.costs;
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
      const archive = evidenceFor('https://epoch.ai/data/benchmark_data.zip');
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
          requestUrl.startsWith('https://artificialanalysis.ai/models/') ||
          requestUrl.startsWith('https://artificialanalysis.ai/evaluations/'),
      );
      if (aaPageRecords.length === 0) {
        throw new Error('Artificial Analysis RSC page evidence not found');
      }
      const pages: ArtificialAnalysisPage[] = aaPageRecords.map((record) => {
        const isModels =
          record.requestUrl === 'https://artificialanalysis.ai/models';
        const isDetail = record.requestUrl.startsWith(
          'https://artificialanalysis.ai/models/',
        );
        const slug = isModels
          ? 'models'
          : (record.requestUrl.split('/').at(-1) ?? record.requestUrl);
        const html = readFileSync(join(repoRoot, record.artifactPath), 'utf8');
        return {
          kind: isModels ? 'models' : isDetail ? 'model-detail' : 'evaluation',
          slug,
          sourceUrl: record.requestUrl,
          evidenceId: record.id,
          retrievedAt: record.retrievedAt,
          rows: extractArtificialAnalysisRscRows(html),
        };
      });
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
              readFileSync(join(repoRoot, apiRecord.artifactPath), 'utf8'),
            ) as unknown,
          }
        : null;
      const result = materializeArtificialAnalysisRsc(pages, api);
      candidates = result.candidates;
      materializedCosts = result.costs;
      customReportText = result.validationReport;
    } else if (src.id === 'livebench') {
      const jsRecord = evidenceList.find(
        (e) =>
          e.mediaType === 'text/javascript' ||
          e.requestUrl.includes('static/js/main.'),
      );
      const tableRecord = evidenceList.find((e) =>
        e.requestUrl.includes('/table_'),
      );
      const categoriesRecord = evidenceList.find((e) =>
        e.requestUrl.includes('/categories_'),
      );
      if (!jsRecord || !tableRecord || !categoriesRecord) {
        throw new Error(
          'Required evidence (main.js, table.csv, categories.json) not found for livebench',
        );
      }
      const jsText = readFileSync(
        join(repoRoot, jsRecord.artifactPath),
        'utf8',
      );
      const tableCsv = readFileSync(
        join(repoRoot, tableRecord.artifactPath),
        'utf8',
      );
      const categoriesJson = readFileSync(
        join(repoRoot, categoriesRecord.artifactPath),
        'utf8',
      );
      const result = materializeLiveBench(
        jsText,
        tableCsv,
        categoriesJson,
        tableRecord.retrievedAt,
        {
          tableEvidenceId: tableRecord.id,
          categoriesEvidenceId: categoriesRecord.id,
          jsEvidenceId: jsRecord.id,
          tableUrl: tableRecord.requestUrl,
          categoriesUrl: categoriesRecord.requestUrl,
          jsUrl: jsRecord.requestUrl,
        },
      );
      candidates = result.candidates;
      customReportText = result.validationReport;
    } else if (src.id === 'deepswe') {
      const jsonRecord = evidenceList.find(
        (e) =>
          e.mediaType === 'application/json' ||
          e.requestUrl.includes('leaderboard-live.json'),
      );
      if (!jsonRecord) {
        throw new Error('leaderboard-live.json evidence not found for deepswe');
      }
      const jsonText = readFileSync(
        join(repoRoot, jsonRecord.artifactPath),
        'utf8',
      );
      const result = materializeDeepSwe(jsonText, jsonRecord.retrievedAt, {
        evidenceId: jsonRecord.id,
        sourceUrl: jsonRecord.requestUrl,
      });
      candidates = result.candidates;
      customReportText = result.validationReport;
    } else if (src.id === 'frontier-code') {
      const dataRecord = evidenceList.find(
        ({ requestUrl }) => requestUrl === FRONTIER_CODE_DATA_URL,
      );
      const pageRecord = evidenceList.find(
        ({ requestUrl }) => requestUrl === FRONTIER_CODE_PAGE_URL,
      );
      if (!dataRecord || !pageRecord) {
        throw new Error('Frontier Code export/page evidence not found');
      }
      const visualRowCount = Number(pageRecord.metadata?.renderedRows);
      const visualTopTenMatched =
        pageRecord.metadata?.renderedTopTenMatched === true;
      if (!Number.isInteger(visualRowCount) || !visualTopTenMatched) {
        throw new Error(
          'Frontier Code evidence has no completed rendered-DOM validation',
        );
      }
      const result = materializeFrontierCode(
        readFileSync(join(repoRoot, dataRecord.artifactPath), 'utf8'),
        readFileSync(join(repoRoot, pageRecord.artifactPath), 'utf8'),
        {
          dataEvidenceId: dataRecord.id,
          pageEvidenceId: pageRecord.id,
          observedAt: dataRecord.retrievedAt,
          visualRowCount,
          visualTopTenMatched,
        },
      );
      if (result.topTenMismatches.length > 0) {
        throw new Error(result.topTenMismatches.join('; '));
      }
      candidates = result.candidates;
      materializedCosts = result.costs;
      customReportText = result.validationReport;
    }

    // Unique-ID check
    const ids = new Set<string>();
    for (const c of candidates) {
      if (ids.has(c.id)) {
        throw new Error(`Duplicate candidate ID found in ${src.id}: ${c.id}`);
      }
      ids.add(c.id);
    }

    // Schema parse
    CandidateResultSchema.array().parse(candidates);

    const availableEvidenceIds = new Set(evidenceList.map(({ id }) => id));
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
    stagedSources.push({
      src,
      candidates,
      customReportText,
      materializedCosts,
    });
  }

  const organizerCandidates = references.flatMap(({ sourceId }) => {
    const staged = stagedSources.find(({ src }) => src.id === sourceId);
    if (!staged)
      throw new Error(`Missing staged organizer source: ${sourceId}`);
    return staged.candidates;
  });
  const vendorChecks = auditVendorReleases(
    [...vendorResults.values()].flatMap(({ result }) => result.candidates),
    organizerCandidates,
    readFileSync(join(repoRoot, cursorEvidence.artifactPath), 'utf8'),
  );

  // Publish exactly the arrays audited above, after all source extraction and
  // vendor/organizer comparisons have passed.
  for (const {
    src,
    candidates,
    customReportText,
    materializedCosts,
  } of stagedSources) {
    const sourceDir = join(repoRoot, 'data', 'sources', src.id);
    const vendor = vendorResults.get(src.id);
    const candidateIds = new Set(candidates.map(({ id }) => id));
    const checks = vendorChecks.filter(({ candidateId }) =>
      candidateIds.has(candidateId),
    );

    // Write candidates.json using deterministicJson
    const candidatesPath = join(sourceDir, 'candidates.json');
    const pretty =
      existsSync(candidatesPath) &&
      /\n\s+\{/.test(readFileSync(candidatesPath, 'utf8'));
    writeFileSync(
      candidatesPath,
      pretty
        ? prettyDeterministicJson(candidates)
        : deterministicJson(candidates),
      'utf8',
    );
    if (materializedCosts !== null) {
      writeFileSync(
        join(sourceDir, 'costs.json'),
        prettyDeterministicJson(materializedCosts),
        'utf8',
      );
    }
    if (vendor) {
      writeFileSync(
        join(sourceDir, 'cross-checks.json'),
        prettyDeterministicJson({
          observedAt: cursorEvidence.retrievedAt,
          checks,
          references,
          cursorEvidence,
        }),
        'utf8',
      );
    }

    // Counts
    const unresolvedCount = candidates.filter(
      (c) => c.model.canonicalModelId === null,
    ).length;
    const validationReportPath = join(sourceDir, 'validation-report.md');

    // Write validation-report.md
    let reportText =
      customReportText ??
      (src.reportFn
        ? src.reportFn(candidates.length, candidates.length, unresolvedCount)
        : '');
    if (vendor) {
      reportText += `\n## Organizer cross-check\n\n- Matched: ${checks.filter(({ status }) => status === 'MATCH').length}\n- Vendor preview rows absent from reference: ${checks.filter(({ status }) => status === 'SUPPLEMENT').length}\n- Excluded: ${checks.filter(({ status }) => status === 'EXCLUDED').length}\n- Per-row references and rounding decisions: [cross-checks.json](cross-checks.json).\n`;
    }
    writeFileSync(validationReportPath, reportText, 'utf8');

    console.log(
      `Source ${src.id} done. Extracted/Candidates: ${candidates.length}, Unresolved: ${unresolvedCount}`,
    );
  }

  appendEffortInferenceReports(
    repoRoot,
    sources.map(({ id }) => id),
  );

  console.log('Regeneration complete!');
}

main();
