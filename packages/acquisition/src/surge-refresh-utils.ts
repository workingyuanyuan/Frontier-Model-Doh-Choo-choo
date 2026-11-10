import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import {
  CandidateResultSchema,
  EvidenceRecordSchema,
} from '@llm-bench/benchmark-data';

export async function readSurgeBaseline(root: string, directory: string) {
  const baselineOption = process.argv
    .find((arg) => arg.startsWith('--baseline-directory='))
    ?.slice('--baseline-directory='.length);
  const baseline = baselineOption ? resolve(root, baselineOption) : directory;
  if (
    baselineOption &&
    (!existsSync(join(baseline, 'candidates.json')) ||
      !existsSync(join(baseline, 'evidence-index.json')))
  ) {
    throw new Error(
      'Baseline directory must contain candidates.json and evidence-index.json',
    );
  }
  const previousCandidates = existsSync(join(baseline, 'candidates.json'))
    ? CandidateResultSchema.array().parse(
        JSON.parse(await readFile(join(baseline, 'candidates.json'), 'utf8')),
      )
    : [];
  const previousEvidence = existsSync(join(baseline, 'evidence-index.json'))
    ? EvidenceRecordSchema.array().parse(
        JSON.parse(
          await readFile(join(baseline, 'evidence-index.json'), 'utf8'),
        ),
      )
    : [];
  return { previousCandidates, previousEvidence };
}

export function surgeVisualRowCount(label: string): number {
  const visualRowCount = Number(
    process.argv
      .find((arg) => arg.startsWith('--visual-row-count='))
      ?.split('=')[1],
  );
  if (!Number.isInteger(visualRowCount) || visualRowCount < 1)
    throw new Error(
      `First verify the rendered ${label} leaderboard, then pass --visual-row-count=<count>`,
    );
  return visualRowCount;
}
