import { readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

import {
  CandidateResultSchema,
  ProfilePolicySchema,
  SourcesConfigSchema,
} from '@llm-bench/benchmark-data';

import {
  renderEffortInferenceSection,
  upsertEffortInferenceSection,
} from './effort-inference-report.js';
import { getWorkspaceRoot } from './refresh-utils.js';

/**
 * The source list is read from the whitelist rather than hardcoded. Section 4.5
 * inference is cross-source by definition, so a report computed from a subset of
 * the sources the pipeline actually reads would disagree with the product data
 * while every test stayed green -- which is exactly what happened when
 * `epoch-ai` joined the whitelist and this list still named four sources.
 */
const readSourceIds = async (root: string): Promise<readonly string[]> =>
  SourcesConfigSchema.parse(
    JSON.parse(
      await readFile(join(root, 'data-v2', 'mappings', 'sources.json'), 'utf8'),
    ),
  ).whitelist;

async function main() {
  const root = resolve(process.argv[2] ?? getWorkspaceRoot());
  const sourceRoot = join(root, 'data-v2', 'sources');
  const sourceIds = await readSourceIds(root);
  const candidatesBySource = new Map(
    await Promise.all(
      sourceIds.map(
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
  const allCandidates = sourceIds.flatMap(
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

  for (const sourceId of sourceIds) {
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
