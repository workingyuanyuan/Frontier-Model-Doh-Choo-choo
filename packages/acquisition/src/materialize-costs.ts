import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

import {
  EvidenceRecordSchema,
  deterministicJson,
  type EvidenceRecord,
} from '@llm-bench/benchmark-data';

import {
  materializeDeepSweCosts,
  materializeLiveBenchCosts,
} from './pricing-materializers.js';
import {
  extractArtificialAnalysisRscRows,
  materializeArtificialAnalysisRsc,
  type ArtificialAnalysisPage,
} from './artificial-analysis-rsc.js';
import {
  FRONTIER_CODE_DATA_URL,
  FRONTIER_CODE_PAGE_URL,
  materializeFrontierCode,
} from './frontier-code-materializer.js';

const readJson = async <T>(path: string): Promise<T> =>
  JSON.parse(await readFile(path, 'utf8')) as T;

const prettyDeterministicJson = (value: unknown): string =>
  `${JSON.stringify(JSON.parse(deterministicJson(value)), null, 2)}\n`;

const getWorkspaceRoot = (): string => {
  let directory = process.cwd();
  while (true) {
    if (existsSync(join(directory, 'data-v2'))) return directory;
    const parent = dirname(directory);
    if (parent === directory) throw new Error('Workspace root not found');
    directory = parent;
  }
};

const findEvidence = (
  records: EvidenceRecord[],
  requestUrl: string,
): EvidenceRecord => {
  const record = records.find((entry) => entry.requestUrl === requestUrl);
  if (!record) throw new Error(`Missing evidence for ${requestUrl}`);
  return record;
};

async function main() {
  const root = resolve(process.argv[2] ?? getWorkspaceRoot());
  const sourcesRoot = join(root, 'data-v2', 'sources');

  const aaIndexPath = join(
    sourcesRoot,
    'artificial-analysis',
    'evidence-index.json',
  );
  const aaEvidence = EvidenceRecordSchema.array().parse(
    await readJson<unknown>(aaIndexPath),
  );
  const aaPageEvidence = aaEvidence.filter(
    ({ requestUrl }) =>
      requestUrl === 'https://artificialanalysis.ai/models' ||
      requestUrl.startsWith('https://artificialanalysis.ai/models/') ||
      requestUrl.startsWith('https://artificialanalysis.ai/evaluations/'),
  );
  const aaPages: ArtificialAnalysisPage[] = await Promise.all(
    aaPageEvidence.map(async (record) => {
      const isModels =
        record.requestUrl === 'https://artificialanalysis.ai/models';
      const isDetail = record.requestUrl.startsWith(
        'https://artificialanalysis.ai/models/',
      );
      return {
        kind: isModels ? 'models' : isDetail ? 'model-detail' : 'evaluation',
        slug: isModels
          ? 'models'
          : (record.requestUrl.split('/').at(-1) ?? record.requestUrl),
        sourceUrl: record.requestUrl,
        evidenceId: record.id,
        retrievedAt: record.retrievedAt,
        rows: extractArtificialAnalysisRscRows(
          await readFile(join(root, record.artifactPath), 'utf8'),
        ),
      };
    }),
  );
  const aaApiRecord = aaEvidence.find(
    ({ requestUrl, method }) =>
      requestUrl === 'https://artificialanalysis.ai/api/v2/data/llms/models' &&
      method === 'API_RESPONSE',
  );
  const aaApi = aaApiRecord
    ? {
        sourceUrl: aaApiRecord.requestUrl,
        evidenceId: aaApiRecord.id,
        retrievedAt: aaApiRecord.retrievedAt,
        payload: await readJson<unknown>(join(root, aaApiRecord.artifactPath)),
      }
    : null;
  const aaCosts = materializeArtificialAnalysisRsc(aaPages, aaApi).costs;
  await writeFile(
    join(sourcesRoot, 'artificial-analysis', 'costs.json'),
    prettyDeterministicJson(aaCosts),
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
    prettyDeterministicJson(deepCosts),
  );

  const liveIndexPath = join(sourcesRoot, 'livebench', 'evidence-index.json');
  const liveEvidence = EvidenceRecordSchema.array().parse(
    await readJson<unknown>(liveIndexPath),
  );
  const liveRecord = liveEvidence.find(({ requestUrl }) =>
    /\/cost_\d{4}_\d{2}_\d{2}\.csv\?v=\d+$/u.test(requestUrl),
  );
  if (!liveRecord) throw new Error('LiveBench cost evidence was not found');
  const liveCosts = materializeLiveBenchCosts(
    await readFile(join(root, liveRecord.artifactPath), 'utf8'),
    {
      sourceUrl: liveRecord.requestUrl,
      evidenceId: liveRecord.id,
      observedAt: liveRecord.retrievedAt,
      method: liveRecord.method,
    },
  );
  await writeFile(
    join(sourcesRoot, 'livebench', 'costs.json'),
    prettyDeterministicJson(liveCosts),
  );

  const frontierIndexPath = join(
    sourcesRoot,
    'frontier-code',
    'evidence-index.json',
  );
  const frontierEvidence = EvidenceRecordSchema.array().parse(
    await readJson<unknown>(frontierIndexPath),
  );
  const frontierDataRecord = findEvidence(
    frontierEvidence,
    FRONTIER_CODE_DATA_URL,
  );
  const frontierPageRecord = findEvidence(
    frontierEvidence,
    FRONTIER_CODE_PAGE_URL,
  );
  const visualRowCount = Number(frontierPageRecord.metadata.renderedRows);
  const visualTopTenMatched =
    frontierPageRecord.metadata.renderedTopTenMatched === true;
  if (!Number.isInteger(visualRowCount) || !visualTopTenMatched) {
    throw new Error(
      'Frontier Code evidence has no completed rendered-DOM validation',
    );
  }
  const frontierResult = materializeFrontierCode(
    await readFile(join(root, frontierDataRecord.artifactPath), 'utf8'),
    await readFile(join(root, frontierPageRecord.artifactPath), 'utf8'),
    {
      dataEvidenceId: frontierDataRecord.id,
      pageEvidenceId: frontierPageRecord.id,
      observedAt: frontierDataRecord.retrievedAt,
      visualRowCount,
      visualTopTenMatched,
    },
  );
  await writeFile(
    join(sourcesRoot, 'frontier-code', 'costs.json'),
    prettyDeterministicJson(frontierResult.costs),
  );

  console.log(
    JSON.stringify({
      artificialAnalysis: aaCosts.length,
      deepSwe: deepCosts.length,
      liveBench: liveCosts.length,
      liveBenchArtifact: liveRecord.id,
      frontierCode: frontierResult.costs.length,
    }),
  );
}

await main();
