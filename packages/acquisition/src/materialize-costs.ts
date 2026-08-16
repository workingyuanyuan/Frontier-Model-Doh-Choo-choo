import { readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

import {
  EvidenceRecordSchema,
  deterministicJson,
  type EvidenceRecord,
} from '@llm-bench/benchmark-data';

import { writeContentAddressedArtifact } from './index.js';
import {
  materializeArtificialAnalysisCosts,
  materializeDeepSweCosts,
  materializeLiveBenchCosts,
} from './pricing-materializers.js';

const readJson = async <T>(path: string): Promise<T> =>
  JSON.parse(await readFile(path, 'utf8')) as T;

const findEvidence = (
  records: EvidenceRecord[],
  requestUrl: string,
): EvidenceRecord => {
  const record = records.find((entry) => entry.requestUrl === requestUrl);
  if (!record) throw new Error(`Missing evidence for ${requestUrl}`);
  return record;
};

async function main() {
  const root = resolve(process.argv[2] ?? process.cwd());
  const sourcesRoot = join(root, 'data-v2', 'sources');

  const aaIndexPath = join(
    sourcesRoot,
    'artificial-analysis',
    'evidence-index.json',
  );
  const aaEvidence = EvidenceRecordSchema.array().parse(
    await readJson<unknown>(aaIndexPath),
  );
  const aaRecord = findEvidence(
    aaEvidence,
    'https://artificialanalysis.ai/models',
  );
  const aaHtml = await readFile(join(root, aaRecord.artifactPath), 'utf8');
  const aaCosts = materializeArtificialAnalysisCosts(aaHtml, {
    sourceUrl: aaRecord.requestUrl,
    evidenceId: aaRecord.id,
    observedAt: aaRecord.retrievedAt,
    method: aaRecord.method,
  });
  await writeFile(
    join(sourcesRoot, 'artificial-analysis', 'costs.json'),
    deterministicJson(aaCosts),
  );

  const deepIndexPath = join(sourcesRoot, 'deepswe', 'evidence-index.json');
  const deepEvidence = EvidenceRecordSchema.array().parse(
    await readJson<unknown>(deepIndexPath),
  );
  const deepRecord = findEvidence(
    deepEvidence,
    'https://deepswe.datacurve.ai/artifacts/v1.1/leaderboard-live.json',
  );
  const deepJson = await readFile(join(root, deepRecord.artifactPath), 'utf8');
  const deepCosts = materializeDeepSweCosts(deepJson, {
    sourceUrl: deepRecord.requestUrl,
    evidenceId: deepRecord.id,
    observedAt: deepRecord.retrievedAt,
    method: deepRecord.method,
  });
  await writeFile(
    join(sourcesRoot, 'deepswe', 'costs.json'),
    deterministicJson(deepCosts),
  );

  const liveUrl = 'https://livebench.ai/cost_2026_06_25.csv?v=1784029070';
  const response = await fetch(liveUrl);
  if (!response.ok) {
    throw new Error(`LiveBench cost export returned ${response.status}`);
  }
  const bytes = new Uint8Array(await response.arrayBuffer());
  const retrievedAt = new Date().toISOString();
  const stored = await writeContentAddressedArtifact(
    join(root, 'artifacts-v2', 'sha256'),
    bytes,
    'text/csv',
  );
  const liveIndexPath = join(sourcesRoot, 'livebench', 'evidence-index.json');
  const liveEvidence = EvidenceRecordSchema.array().parse(
    await readJson<unknown>(liveIndexPath),
  );
  const existingLiveRecord = liveEvidence.find(
    ({ requestUrl, id }) => requestUrl === liveUrl && id === stored.record.id,
  );
  const stableRetrievedAt = existingLiveRecord?.retrievedAt ?? retrievedAt;
  const liveRecord = EvidenceRecordSchema.parse({
    ...stored.record,
    sourceId: 'livebench',
    retrievedAt: stableRetrievedAt,
    requestUrl: liveUrl,
    finalUrl: response.url || liveUrl,
    artifactPath: `artifacts-v2/sha256/${stored.record.artifactPath}`,
    method: 'EXPORT',
    metadata: { release: '2026-06-25' },
  });
  const updatedLiveEvidence = liveEvidence.filter(
    ({ requestUrl }) => requestUrl !== liveUrl,
  );
  updatedLiveEvidence.push(liveRecord);
  updatedLiveEvidence.sort((left, right) =>
    left.requestUrl.localeCompare(right.requestUrl),
  );
  await writeFile(liveIndexPath, deterministicJson(updatedLiveEvidence));
  const liveCosts = materializeLiveBenchCosts(new TextDecoder().decode(bytes), {
    sourceUrl: liveUrl,
    evidenceId: liveRecord.id,
    observedAt: stableRetrievedAt,
    method: liveRecord.method,
  });
  await writeFile(
    join(sourcesRoot, 'livebench', 'costs.json'),
    deterministicJson(liveCosts),
  );

  console.log(
    JSON.stringify({
      artificialAnalysis: aaCosts.length,
      deepSwe: deepCosts.length,
      liveBench: liveCosts.length,
      liveBenchArtifact: liveRecord.id,
    }),
  );
}

await main();
