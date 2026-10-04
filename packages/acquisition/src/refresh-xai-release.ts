import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import {
  CandidateResultSchema,
  SourceManifestSchema,
  type EvidenceRecord,
} from '@llm-bench/benchmark-data';
import {
  getWorkspaceRoot,
  readJson,
  writeMetadataJson,
} from './refresh-utils.js';
import { verifyArtifactRecord } from './index.js';
import { materializeXaiRelease, XAI_RELEASE_URL } from './vendor-xai.js';
import { auditVendorReleases } from './vendor-release-audit.js';

const root = getWorkspaceRoot();
const evidence = (
  await readJson<EvidenceRecord[]>(
    join(root, 'data/research/release-evidence-index.json'),
  )
).filter((r) => r.sourceId === 'xai-releases');
const page = evidence.find((r) => r.requestUrl === XAI_RELEASE_URL)!;
const bundle = evidence.find((r) => r.mediaType === 'application/javascript')!;
const load = async (r: EvidenceRecord) => {
  const bytes = await readFile(join(root, r.artifactPath));
  verifyArtifactRecord(r, bytes);
  return bytes.toString('utf8');
};
const result = materializeXaiRelease(await load(bundle), await load(page), {
  evidenceId: bundle.id,
  pageEvidenceId: page.id,
  observedAt: page.retrievedAt,
});
const organizer = (
  await Promise.all(
    ['deepswe', 'zapier-automationbench', 'frontier-code'].map((s) =>
      readJson(join(root, `data/sources/${s}/candidates.json`)),
    ),
  )
).flatMap((r) => CandidateResultSchema.array().parse(r));
const openai = CandidateResultSchema.array().parse(
  await readJson(join(root, 'data/sources/openai-releases/candidates.json')),
);
const cursor = (
  await readJson<EvidenceRecord[]>(
    join(root, 'data/sources/anthropic-releases/evidence-index.json'),
  )
).find((r) => r.requestUrl === 'https://prod.cursor.com/evals')!;
const checks = auditVendorReleases(
  [...openai, ...result.candidates],
  organizer,
  await load(cursor),
).filter((r) => r.candidateId.startsWith('xai-releases:'));
const dir = join(root, 'data/sources/xai-releases');
await mkdir(dir, { recursive: true });
await writeMetadataJson(
  join(dir, 'manifest.json'),
  SourceManifestSchema.parse({
    schemaVersion: 'source-manifest-v1',
    sourceId: 'xai-releases',
    displayName: 'xAI model releases',
    role: 'VENDOR',
    baseUrl: 'https://x.ai/',
    targetUrls: [XAI_RELEASE_URL],
    benchmarkIds: ['cursorbench-4', 'deepswe-1-1'],
    accessMethods: ['NEXT_RSC'],
    fallbackMethods: ['DOM', 'VISUAL'],
    completeness: {
      expectedCountMethod:
        '43 literal CursorBench rows and one reviewed DeepSWE row',
      pagination: null,
      visibleComparisonRequired: true,
    },
    fieldMapping: {
      'runs.score': 'rawScore',
      'runs.avgCost': 'cost',
      'runs.effort': 'profile.effort',
    },
    lastVerifiedAt: page.retrievedAt,
    notes: [
      'PARTIAL_SOURCE: reviewed Grok 4.7 release. CursorBench chart scores cross-checked with organizer; DeepSWE high is vendor supplement.',
    ],
  }),
);
await writeMetadataJson(join(dir, 'evidence-index.json'), [
  ...evidence,
  cursor,
]);
await writeMetadataJson(join(dir, 'candidates.json'), result.candidates);
await writeMetadataJson(join(dir, 'costs.json'), result.costs);
await writeMetadataJson(join(dir, 'cross-checks.json'), { checks });
await writeFile(
  join(dir, 'validation-report.md'),
  result.validationReport +
    `\n- Matches: ${checks.filter((r) => r.status === 'MATCH').length}\n- Supplements: ${checks.filter((r) => r.status === 'SUPPLEMENT').length}\n- Excluded: ${checks.filter((r) => r.status === 'EXCLUDED').length}\n`,
);
console.log(
  JSON.stringify({
    candidates: result.candidates.length,
    costs: result.costs.length,
    checks: checks.reduce(
      (a, r) => ({ ...a, [r.status]: (a[r.status] ?? 0) + 1 }),
      {} as Record<string, number>,
    ),
  }),
);
