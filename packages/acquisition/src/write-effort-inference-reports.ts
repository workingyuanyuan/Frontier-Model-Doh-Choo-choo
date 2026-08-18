import { readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

import {
  CandidateResultSchema,
  ProfilePolicySchema,
} from '@llm-bench/benchmark-data';

import {
  renderEffortInferenceSection,
  upsertEffortInferenceSection,
} from './effort-inference-report.js';
import { getWorkspaceRoot } from './refresh-utils.js';

const SOURCE_IDS = [
  'artificial-analysis',
  'livebench',
  'deepswe',
  'frontier-code',
] as const;

async function main() {
  const root = resolve(process.argv[2] ?? getWorkspaceRoot());
  const sourceRoot = join(root, 'data-v2', 'sources');
  const candidatesBySource = new Map(
    await Promise.all(
      SOURCE_IDS.map(
        async (sourceId) =>
          [
            sourceId,
            CandidateResultSchema.array().parse(
              JSON.parse(
                await readFile(
                  join(sourceRoot, sourceId, 'candidates.json'),
                  'utf8',
                ),
              ),
            ),
          ] as const,
      ),
    ),
  );
  const allCandidates = SOURCE_IDS.flatMap(
    (sourceId) => candidatesBySource.get(sourceId) ?? [],
  );
  const policy = ProfilePolicySchema.parse(
    JSON.parse(
      await readFile(
        join(root, 'data-v2', 'mappings', 'profile-policy.json'),
        'utf8',
      ),
    ),
  );

  for (const sourceId of SOURCE_IDS) {
    const reportPath = join(sourceRoot, sourceId, 'validation-report.md');
    const report = await readFile(reportPath, 'utf8');
    const section = renderEffortInferenceSection(
      sourceId,
      candidatesBySource.get(sourceId) ?? [],
      allCandidates,
      policy,
    );
    await writeFile(
      reportPath,
      upsertEffortInferenceSection(report, section),
      'utf8',
    );
  }
}

await main();
