import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import {
  materializeEpoch,
  materializeArtificialAnalysis,
} from './materializers.js';
import {
  CandidateResultSchema,
  deterministicJson,
  type CandidateResult,
} from '@llm-bench/benchmark-data';

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

function getEpochReport(
  extractedCount: number,
  candidateCount: number,
  unresolvedCount: number,
): string {
  return `# Epoch AI acquisition validation

- Official export: <https://epoch.ai/data/benchmark_data.zip>
- Captured scope: 75 ZIP entries, 74 CSV files, nine internal result files, 64 external mirrors, and one supplemental ECI parameter file.

## Exact counts

| Check | Count |
|---|---:|
| Raw internal result rows | 1490 |
| ECI rows with a finite score | 460 |
| ECI metadata rows without a score | 259 |
| Direct scored rows | 771 |
| Extracted scored rows | ${extractedCount} |
| Generated candidates | ${candidateCount} |
| Canonically unresolved candidates | ${unresolvedCount} |

## Role boundary

All 460 scored ECI rows are organizer-owned composite evidence and remain \`EXCLUDED\`; downstream Frontier selection applies the dynamic Top 20 rule. The 771 direct rows cover GPQA, MATH Level 5, SWE-bench Verified, AIME, FrontierMath, FrontierMath Tier 4, SimpleQA Verified, and Chess Puzzles. FrontierMath rows are organizer evidence; reruns of external Benchmarks are independent evidence. The 64 \`_external.csv\` mirrors are never materialized as Epoch results.

## Limitations

The export includes ${unresolvedCount} historical or alias-specific rows not yet mapped to a canonical product model. They remain reviewable CandidateResults but cannot enter ranking until identity resolution. Missing ECI scores are preserved as an explicit completeness count and never converted to zero.
`;
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

interface EvidenceRecord {
  id: string;
  sourceId: string;
  retrievedAt: string;
  artifactPath: string;
  mediaType: string;
  requestUrl: string;
}

function main() {
  const repoRoot = resolve(process.argv[2] || getWorkspaceRoot());
  console.log(
    `Regenerating candidate snapshots in repository root: ${repoRoot}`,
  );

  const sources = [
    { id: 'epoch-ai', reportFn: getEpochReport },
    { id: 'artificial-analysis', reportFn: getAAReport },
  ];

  for (const src of sources) {
    const sourceDir = join(repoRoot, 'data-v2', 'sources', src.id);
    const indexFile = join(sourceDir, 'evidence-index.json');

    console.log(`Processing source ${src.id}...`);
    const evidenceList = JSON.parse(
      readFileSync(indexFile, 'utf8'),
    ) as EvidenceRecord[];

    let candidates: CandidateResult[] = [];

    if (src.id === 'epoch-ai') {
      const zipRecord = evidenceList.find(
        (e) => e.mediaType === 'application/zip',
      );
      if (!zipRecord)
        throw new Error('application/zip evidence not found for epoch-ai');
      const zipBuffer = readFileSync(join(repoRoot, zipRecord.artifactPath));
      candidates = materializeEpoch(zipBuffer, zipRecord.retrievedAt, {
        evidenceId: zipRecord.id,
        sourceUrl: zipRecord.requestUrl,
      });
    } else if (src.id === 'artificial-analysis') {
      const modelsRecord = evidenceList.find(
        (e) => e.requestUrl === 'https://artificialanalysis.ai/models',
      );
      const articleRecord = evidenceList.find(
        (e) =>
          e.requestUrl ===
          'https://artificialanalysis.ai/articles/gpt-5-6-has-landed',
      );
      if (!modelsRecord || !articleRecord)
        throw new Error(
          'Models/Article HTML evidence not found for artificial-analysis',
        );
      const modelsHtml = readFileSync(
        join(repoRoot, modelsRecord.artifactPath),
        'utf8',
      );
      const articleHtml = readFileSync(
        join(repoRoot, articleRecord.artifactPath),
        'utf8',
      );
      candidates = materializeArtificialAnalysis(
        modelsHtml,
        articleHtml,
        modelsRecord.retrievedAt,
        {
          modelsEvidenceId: modelsRecord.id,
          articleEvidenceId: articleRecord.id,
          modelsUrl: modelsRecord.requestUrl,
          articleUrl: articleRecord.requestUrl,
        },
      );
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

    // Counts
    const unresolvedCount = candidates.filter(
      (c) => c.model.canonicalModelId === null,
    ).length;
    const validationReportPath = join(sourceDir, 'validation-report.md');

    // Write validation-report.md
    const reportText = src.reportFn(
      candidates.length,
      candidates.length,
      unresolvedCount,
    );
    writeFileSync(validationReportPath, reportText, 'utf8');

    console.log(
      `Source ${src.id} done. Extracted/Candidates: ${candidates.length}, Unresolved: ${unresolvedCount}`,
    );
  }

  console.log('Regeneration complete!');
}

main();
