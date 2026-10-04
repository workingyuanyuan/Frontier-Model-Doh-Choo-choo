import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import {
  CandidateResultSchema,
  SourceManifestSchema,
  type CandidateResult,
} from '@llm-bench/benchmark-data';
import { buildArtifactRecord, writeContentAddressedArtifact } from './index.js';
import {
  captureArtifact,
  getWorkspaceRoot,
  readJson,
  writeMetadataJson,
} from './refresh-utils.js';
import { materializeOpenAIReleaseCaptures } from './vendor-openai.js';
import {
  materializeAnthropicReleases,
  ANTHROPIC_RELEASE_URLS,
} from './vendor-anthropic.js';
import { auditVendorReleases } from './vendor-release-audit.js';

const root = getWorkspaceRoot();
const args = process.argv.slice(2).filter((a) => a !== '--');
const observedAt = new Date().toISOString();
const indexPosition = args.indexOf('--openai-capture-index');
const indexPath =
  indexPosition >= 0
    ? resolve(args[indexPosition + 1]!)
    : join(root, 'data/sources/openai-releases/reviewed-capture-index.json');
const captureIndex = await readJson<{
  schemaVersion: string;
  captures: { path: string; observedAt: string }[];
}>(indexPath);
if (captureIndex.schemaVersion !== 'openai-release-capture-index-v1')
  throw new Error('Invalid capture index');
const openaiEvidence = [];
const openaiCaptures = [];
for (const entry of captureIndex.captures) {
  if (!Number.isFinite(Date.parse(entry.observedAt)))
    throw new Error('Invalid capture time');
  const captureBytes = await readFile(resolve(dirname(indexPath), entry.path));
  const capture = JSON.parse(captureBytes.toString('utf8')) as {
    sourceUrl: string;
  };
  const artifact = await writeContentAddressedArtifact(
    join(root, 'artifacts/sha256'),
    captureBytes,
    'application/json',
  );
  const record = buildArtifactRecord(
    captureBytes,
    'application/json',
    `artifacts/sha256/${artifact.record.artifactPath}`,
    {
      sourceId: 'openai-releases',
      retrievedAt: entry.observedAt,
      requestUrl: capture.sourceUrl,
      finalUrl: capture.sourceUrl,
      method: 'NEXT_RSC',
      metadata: {
        scope:
          'Reviewed release chart excerpt; bounded capture with per-page validation',
      },
    },
  );
  openaiEvidence.push(record);
  openaiCaptures.push({
    captureText: captureBytes.toString('utf8'),
    context: { evidenceId: record.id, observedAt: entry.observedAt },
  });
}
const openai = materializeOpenAIReleaseCaptures(openaiCaptures);
const anthropicPages = [];
for (const url of ANTHROPIC_RELEASE_URLS)
  anthropicPages.push(
    await captureArtifact({
      root,
      sourceId: 'anthropic-releases',
      url,
      retrievedAt: observedAt,
      mediaType: 'text/html',
      method: 'NEXT_RSC',
      metadata: {
        scope:
          'Full official model release HTML; individually reviewed benchmark charts',
      },
    }),
  );
const anthropic = materializeAnthropicReleases(
  anthropicPages.map((page) => ({
    sourceUrl: page.record.requestUrl,
    text: page.text,
    evidenceId: page.record.id,
    observedAt: page.record.retrievedAt,
  })),
);
const cursorPage = await captureArtifact({
  root,
  sourceId: 'anthropic-releases',
  url: 'https://prod.cursor.com/evals',
  retrievedAt: observedAt,
  mediaType: 'text/html',
  method: 'DOM',
  metadata: {
    scope: 'Organizer cross-check; visible chart aria-label score/effort pairs',
  },
});
const organizerIds = ['deepswe', 'zapier-automationbench', 'frontier-code'];
const organizerCandidates: CandidateResult[] = [];
const references: unknown[] = [];
for (const sourceId of organizerIds) {
  organizerCandidates.push(
    ...CandidateResultSchema.array().parse(
      await readJson(
        join(root, 'data', 'sources', sourceId, 'candidates.json'),
      ),
    ),
  );
  references.push({
    sourceId,
    evidence: await readJson(
      join(root, 'data', 'sources', sourceId, 'evidence-index.json'),
    ),
  });
}
const crossChecks = auditVendorReleases(
  [...openai.candidates, ...anthropic.candidates],
  organizerCandidates,
  cursorPage.text,
);
// All extraction and comparison checks must pass before replacing either snapshot.
for (const source of [
  {
    id: 'openai-releases',
    name: 'OpenAI model releases',
    result: openai,
    evidence: openaiEvidence,
    urls: openaiEvidence.map((record) => record.requestUrl),
    baseUrl: 'https://openai.com/',
  },
  {
    id: 'anthropic-releases',
    name: 'Anthropic model releases',
    result: anthropic,
    evidence: [...anthropicPages.map((page) => page.record), cursorPage.record],
    urls: [...ANTHROPIC_RELEASE_URLS],
    baseUrl: 'https://www.anthropic.com/',
  },
]) {
  const directory = join(root, 'data', 'sources', source.id);
  await mkdir(directory, { recursive: true });
  const checks = crossChecks.filter((check) =>
    source.result.candidates.some((r) => r.id === check.candidateId),
  );
  const manifest = SourceManifestSchema.parse({
    schemaVersion: 'source-manifest-v1',
    sourceId: source.id,
    displayName: source.name,
    role: 'VENDOR',
    baseUrl: source.baseUrl,
    targetUrls: source.urls,
    benchmarkIds: [
      ...new Set(source.result.candidates.map((r) => r.benchmarkId)),
    ],
    accessMethods: ['NEXT_RSC'],
    completeness: {
      expectedCountMethod:
        'Selected release charts only; compare chart counts, named model/effort pairs and organizer references.',
      pagination: null,
      visibleComparisonRequired: true,
    },
    fieldMapping: {
      'chart model/series': 'model.rawName',
      'chart effort label': 'profile.effort',
      'chart score/y': 'rawScore',
      'chart release heading': 'benchmarkVersion',
    },
    fallbackMethods: ['DOM', 'VISUAL'],
    lastVerifiedAt: source.evidence
      .map((record) => record.retrievedAt)
      .sort()
      .at(-1)!,
    notes: [
      'PARTIAL_SOURCE: bounded, individually reviewed release charts. VENDOR remains lower priority than organizer and independent results.',
      'Matching numbers establish citation consistency only; evaluator identity and unpublished preview scores are not independently confirmed.',
      'Review details: docs/refresh/2026-10-02-vendor-releases.md',
    ],
  });
  await writeMetadataJson(join(directory, 'manifest.json'), manifest);
  await writeMetadataJson(
    join(directory, 'evidence-index.json'),
    source.evidence,
  );
  await writeMetadataJson(
    join(directory, 'candidates.json'),
    source.result.candidates,
  );
  await writeMetadataJson(join(directory, 'costs.json'), source.result.costs);
  await writeMetadataJson(join(directory, 'cross-checks.json'), {
    observedAt,
    checks,
    references,
    cursorEvidence: cursorPage.record,
  });
  await writeFile(
    join(directory, 'validation-report.md'),
    source.result.validationReport +
      `\n## Organizer cross-check\n\n- Matched: ${checks.filter((r) => r.status === 'MATCH').length}\n- Vendor preview rows absent from reference: ${checks.filter((r) => r.status === 'SUPPLEMENT').length}\n- Excluded: ${checks.filter((r) => r.status === 'EXCLUDED').length}\n- Per-row references and rounding decisions: [cross-checks.json](cross-checks.json).\n- Research: [vendor release review](../../../docs/refresh/2026-10-02-vendor-releases.md).\n`,
  );
}
console.log(
  JSON.stringify({
    openaiRows: openai.candidates.length,
    anthropicRows: anthropic.candidates.length,
    matches: crossChecks.filter((r) => r.status === 'MATCH').length,
    supplements: crossChecks.filter((r) => r.status === 'SUPPLEMENT').length,
  }),
);
