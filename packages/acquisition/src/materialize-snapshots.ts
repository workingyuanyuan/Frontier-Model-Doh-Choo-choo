import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import {
  extractArtificialAnalysisRscRows,
  materializeArtificialAnalysisRsc,
  type ArtificialAnalysisPage,
} from './artificial-analysis-rsc.js';
import { materializeLiveBench } from './livebench-materializer.js';
import { materializeDeepSwe } from './deepswe-materializer.js';
import {
  FRONTIER_CODE_DATA_URL,
  FRONTIER_CODE_PAGE_URL,
  materializeFrontierCode,
} from './frontier-code-materializer.js';
import {
  CandidateResultSchema,
  deterministicJson,
  ProfilePolicySchema,
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
    if (existsSync(join(dir, 'data-v2'))) {
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
  const sourceRoot = join(repoRoot, 'data-v2', 'sources');
  const allCandidates = sourceIds.flatMap((sourceId) => {
    const path = join(sourceRoot, sourceId, 'candidates.json');
    return CandidateResultSchema.array().parse(
      JSON.parse(readFileSync(path, 'utf8')),
    );
  });
  const policy = ProfilePolicySchema.parse(
    JSON.parse(
      readFileSync(
        join(repoRoot, 'data-v2', 'mappings', 'profile-policy.json'),
        'utf8',
      ),
    ),
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
      allCandidates,
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
  ];

  for (const src of sources) {
    const sourceDir = join(repoRoot, 'data-v2', 'sources', src.id);
    const indexFile = join(sourceDir, 'evidence-index.json');

    console.log(`Processing source ${src.id}...`);
    const evidenceList = JSON.parse(
      readFileSync(indexFile, 'utf8'),
    ) as EvidenceRecord[];

    let candidates: CandidateResult[] = [];
    let customReportText: string | null = null;
    let materializedCosts: unknown[] | null = null;

    if (src.id === 'artificial-analysis') {
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

    // Write candidates.json using deterministicJson
    const candidatesPath = join(sourceDir, 'candidates.json');
    writeFileSync(candidatesPath, deterministicJson(candidates), 'utf8');
    if (materializedCosts !== null) {
      writeFileSync(
        join(sourceDir, 'costs.json'),
        prettyDeterministicJson(materializedCosts),
        'utf8',
      );
    }

    // Counts
    const unresolvedCount = candidates.filter(
      (c) => c.model.canonicalModelId === null,
    ).length;
    const validationReportPath = join(sourceDir, 'validation-report.md');

    // Write validation-report.md
    const reportText =
      customReportText ??
      (src.reportFn
        ? src.reportFn(candidates.length, candidates.length, unresolvedCount)
        : '');
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
