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

const root = getWorkspaceRoot();
const evidence = (
  await readJson<EvidenceRecord[]>(
    join(root, 'data/research/release-evidence-index.json'),
  )
).filter((r) => r.sourceId === 'google-releases');
const page = evidence.find((r) => r.requestUrl.endsWith('/gemini-4-argon/'))!;
const method = evidence.find(
  (r) =>
    r.requestUrl.endsWith('/gemini-4-argon') &&
    r.mediaType === 'application/pdf',
)!;
for (const record of evidence)
  verifyArtifactRecord(record, await readFile(join(root, record.artifactPath)));
const html = await readFile(join(root, page.artifactPath), 'utf8');
if (!html.includes('77.9%') || !html.includes('DeepSWE v1.1'))
  throw new Error('Google DeepSWE release drift');
const candidate = CandidateResultSchema.parse({
  schemaVersion: 'candidate-result-v1',
  id: 'google-releases:argon:deepswe',
  sourceId: 'google-releases',
  sourceRole: 'VENDOR',
  benchmarkId: 'deepswe-1-1',
  benchmarkVersion: '1.1',
  model: {
    rawName: 'Gemini 4 Argon',
    canonicalModelId: 'google-gemini-4-argon',
    profileId: null,
  },
  profile: {
    effort: null,
    thinking: null,
    tools: true,
    harness: 'mini-swe-agent',
    contextWindowTokens: null,
    quantization: null,
    attempts: null,
  },
  metric: {
    id: 'pass-at-1',
    name: 'Pass@1',
    unit: 'percent',
    higherIsBetter: true,
  },
  rawScore: 77.9,
  normalizedScore: 77.9,
  acquisitionStatus: 'PARTIAL_SOURCE',
  inclusion: 'INCLUDED',
  exclusionReason: null,
  sourceUrl: page.requestUrl,
  observedAt: page.retrievedAt,
  sourcePublishedAt: null,
  evidenceIds: [page.id, method.id],
  provenance: {
    rawScore: {
      evidenceId: page.id,
      method: 'DOM',
      locator:
        'Enabling coding and enterprise workflows across domains; DeepSWE v1.1 (77.9%)',
    },
    profile: {
      evidenceId: method.id,
      method: 'MANUAL',
      locator:
        'Methodology p2: highest thinking settings; Coding DeepSWE v1.1 self-computed mini-swe agent. Literal effort label unspecified; kept null for product effort policy.',
    },
  },
});
const dir = join(root, 'data/sources/google-releases');
await mkdir(dir, { recursive: true });
await writeMetadataJson(
  join(dir, 'manifest.json'),
  SourceManifestSchema.parse({
    schemaVersion: 'source-manifest-v1',
    sourceId: 'google-releases',
    displayName: 'Google model releases',
    role: 'VENDOR',
    baseUrl: 'https://blog.google/',
    targetUrls: evidence.map((r) => r.requestUrl),
    benchmarkIds: ['deepswe-1-1'],
    accessMethods: ['DOM'],
    fallbackMethods: ['VISUAL'],
    completeness: {
      expectedCountMethod:
        'One reviewed Argon DeepSWE self-reported row; methods and release evidence retained',
      pagination: null,
      visibleComparisonRequired: true,
    },
    fieldMapping: { 'DeepSWE v1.1': 'rawScore' },
    lastVerifiedAt: page.retrievedAt,
    notes: [
      'PARTIAL_SOURCE. Argon self-evaluation; highest thinking has no literal effort label in PDF.',
      'Gemini 3.8 Flash release 73.7 differs from current organizer 73.825503; organizer retained.',
      'Cross-source numerical agreement does not establish common execution.',
    ],
  }),
);
await writeMetadataJson(join(dir, 'evidence-index.json'), evidence);
await writeMetadataJson(join(dir, 'candidates.json'), [candidate]);
await writeMetadataJson(join(dir, 'costs.json'), []);
await writeMetadataJson(join(dir, 'cross-checks.json'), {
  checks: [
    {
      model: 'Gemini 4 Argon',
      benchmark: 'DeepSWE 1.1',
      status: 'SUPPLEMENT',
      score: 77.9,
      method: 'Self-computed mini-swe-agent; exact effort unspecified',
    },
    {
      model: 'Gemini 3.8 Flash',
      benchmark: 'DeepSWE 1.1',
      status: 'CONFLICT',
      vendorScore: 73.7,
      organizerScore: 73.8255033557047,
    },
    {
      model: 'Gemini 4 Argon',
      benchmark: 'AutomationBench',
      status: 'MATCH',
      vendorScore: 51.3,
      organizerScore: 51.29,
      note: 'Google methodology explicitly cites private organizer set; organizer retained',
    },
  ],
});
await writeFile(
  join(dir, 'validation-report.md'),
  '# Google release validation\n\nArgon DeepSWE v1.1: 77.9%, self-computed mini-swe-agent. Methods PDF and release page captured and hashed. Literal effort unspecified; candidate keeps null. AutomationBench 51.3 rounds organizer 51.29; Gemini 3.8 Flash DeepSWE differs from current organizer. See cross-checks.json.\n',
);
console.log('Google: one Argon DeepSWE supplement');
