import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import {
  EvidenceRecordSchema,
  SourceManifestSchema,
} from '@llm-bench/benchmark-data';
import {
  BIOBASICS_PAGE_URL,
  materializeBioBasicsBench,
} from './biobasicsbench-materializer.js';
import { writeContentAddressedArtifact } from './index.js';
import { getWorkspaceRoot, writeMetadataJson } from './refresh-utils.js';

const root = resolve(process.argv[2] ?? getWorkspaceRoot());
const directory = join(root, 'data/sources/biobasicsbench');
const captureText = await readFile(
  join(directory, 'reviewed-capture.json'),
  'utf8',
);
const capture = JSON.parse(captureText) as { observedAt: string };
const stored = await writeContentAddressedArtifact(
  join(root, 'artifacts/sha256'),
  new TextEncoder().encode(captureText),
  'application/json',
);
const evidence = EvidenceRecordSchema.parse({
  ...stored.record,
  artifactPath: `artifacts/sha256/${stored.record.artifactPath}`,
  sourceId: 'biobasicsbench',
  requestUrl: BIOBASICS_PAGE_URL,
  finalUrl: BIOBASICS_PAGE_URL,
  retrievedAt: capture.observedAt,
  method: 'DOM',
  metadata: {
    captureKind: 'bounded-normalized-browser-transcription',
    originalHttpBytes: false,
    chartId: 'biobasicsbench-model-performance',
    settings: 37,
    printedXhighRows: 7,
    tasks: 100,
    attemptsPerTask: 5,
  },
});
const result = materializeBioBasicsBench(captureText, {
  evidenceId: evidence.id,
  observedAt: capture.observedAt,
});
const manifest = SourceManifestSchema.parse({
  schemaVersion: 'source-manifest-v1',
  sourceId: 'biobasicsbench',
  displayName: 'BioBasicsBench (OpenAI and Ligo)',
  role: 'VENDOR',
  baseUrl: BIOBASICS_PAGE_URL,
  targetUrls: [BIOBASICS_PAGE_URL],
  benchmarkIds: ['biobasicsbench'],
  accessMethods: ['DOM', 'NEXT_RSC'],
  fallbackMethods: ['VISUAL'],
  completeness: {
    expectedCountMethod:
      'Official Results states 37 settings, seven models, 100 tasks and five attempts. All seven printed xhigh rows match chart scores, confidence bounds and average output tokens at the printed precision.',
    pagination: null,
    visibleComparisonRequired: true,
  },
  fieldMapping: {
    'vegaLiteSpec.data.values[].model_label': 'model.rawName',
    'vegaLiteSpec.data.values[].effort_label': 'profile.effort',
    'vegaLiteSpec.data.values[].mean_credit_pct':
      'rawScore and normalizedScore',
    'Results: five attempts on each task': 'profile.attempts',
  },
  lastVerifiedAt: capture.observedAt,
  notes: [
    'Complete published 37-setting chart retained in bounded normalized browser capture. PARTIAL_SOURCE describes the acquisition boundary.',
    'Benchmark version and dated checkpoints are unpublished.',
    'Mean reward measures partial rubric credit. Average output tokens are retained as provenance. No monetary task cost is published.',
    'Source effort none is explicit disabled reasoning, retained for product effort normalization.',
  ],
});
await mkdir(directory, { recursive: true });
await writeMetadataJson(join(directory, 'manifest.json'), manifest);
await writeMetadataJson(join(directory, 'evidence-index.json'), [evidence]);
await writeMetadataJson(join(directory, 'candidates.json'), result.candidates);
await writeMetadataJson(join(directory, 'costs.json'), []);
await writeFile(
  join(directory, 'validation-report.md'),
  result.validationReport,
);
console.log(
  JSON.stringify({
    sourceId: 'biobasicsbench',
    candidates: result.candidates.length,
    costs: 0,
  }),
);
