import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { CandidateResultSchema } from '@llm-bench/benchmark-data';

import { materializeArtificialAnalysis } from './artificial-analysis-materializer.js';

const topDistinctRows = (
  candidates: ReturnType<typeof materializeArtificialAnalysis>,
  benchmarkId: string,
  limit: number,
) => {
  const seen = new Set<string>();
  return candidates
    .filter((candidate) => candidate.benchmarkId === benchmarkId)
    .toSorted((left, right) => right.rawScore - left.rawScore)
    .filter(({ model }) => {
      const baseName = model.rawName
        .replace(/\s*\([^)]*\)\s*$/u, '')
        .trim()
        .toLowerCase();
      if (seen.has(baseName)) return false;
      seen.add(baseName);
      return true;
    })
    .slice(0, limit);
};

describe('Artificial Analysis materializer', () => {
  it('materializes all structured rows from HTML', () => {
    const modelsHtml = readFileSync(
      resolve(
        '../../artifacts-v2/sha256/b7/b7084dca03b345e5a1e1aab3729bee6fcd7577b744ad46f38e30e0143486768a.html',
      ),
      'utf8',
    );
    const articleHtml = readFileSync(
      resolve(
        '../../artifacts-v2/sha256/1b/1b8ce2a9690fbd52b4706e5fe3f81215735b792710b7a8f4859e684a284d2a28.html',
      ),
      'utf8',
    );

    const candidates = materializeArtificialAnalysis(
      modelsHtml,
      articleHtml,
      '2026-07-16T13:18:08.712Z',
    );

    // Schema parse validation
    CandidateResultSchema.array().parse(candidates);

    // 28*8 matrix metrics + 29 critpt + 10 apexAgents + 2 livecodebench + 23 ifbench + 28 omniscience accuracy + 28 omniscience index + 28 intelligenceIndex + 28 codingIndex + 4 article briefcases = 376
    expect(candidates).toHaveLength(376);

    const intel = candidates.filter(
      (c) => c.benchmarkId === 'artificial-analysis-intelligence-index',
    );
    expect(intel).toHaveLength(28);

    const codingIdx = candidates.filter(
      (c) => c.benchmarkId === 'artificial-analysis-coding-agent-index',
    );
    expect(codingIdx).toHaveLength(28);

    const omniscience = candidates.filter(
      (c) => c.benchmarkId === 'aa-omniscience',
    );
    expect(omniscience).toHaveLength(56); // 28 Included accuracy + 28 Excluded index

    const ifbench = candidates.filter((c) => c.benchmarkId === 'ifbench');
    expect(ifbench).toHaveLength(23);

    const briefcase = candidates.filter(
      (c) => c.benchmarkId === 'aa-briefcase',
    );
    expect(briefcase).toHaveLength(4); // Fable and Sol, both rubric-score and analytical-quality-elo
  });

  it('resolves all Artificial Analysis Intelligence Index Top 20 configuration labels', () => {
    const candidates = materializeArtificialAnalysis(
      readFileSync(
        resolve(
          '../../artifacts-v2/sha256/b7/b7084dca03b345e5a1e1aab3729bee6fcd7577b744ad46f38e30e0143486768a.html',
        ),
        'utf8',
      ),
      readFileSync(
        resolve(
          '../../artifacts-v2/sha256/1b/1b8ce2a9690fbd52b4706e5fe3f81215735b792710b7a8f4859e684a284d2a28.html',
        ),
        'utf8',
      ),
      '2026-07-16T13:18:08.712Z',
    );
    const top20 = topDistinctRows(
      candidates,
      'artificial-analysis-intelligence-index',
      20,
    );

    expect(top20).toHaveLength(20);
    expect(
      top20.filter(({ model }) => model.canonicalModelId === null),
    ).toEqual([]);
    expect(
      candidates.find(
        ({ model }) =>
          model.rawName === 'DeepSeek V4 Pro (Reasoning, Max Effort)',
      )?.model.canonicalModelId,
    ).toBe('deepseek-deepseek-v4-pro');
  });
});
