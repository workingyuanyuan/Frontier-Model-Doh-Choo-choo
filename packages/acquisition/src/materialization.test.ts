import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { CandidateResultSchema } from '@llm-bench/benchmark-data';

import {
  materializeEpoch,
  materializeVals,
  materializeArtificialAnalysis,
} from './index.js';

const topDistinctRows = (
  candidates: ReturnType<typeof materializeEpoch>,
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

describe('Epoch AI materializer', () => {
  it('materializes all structured rows from zip', () => {
    const zipPath = resolve(
      '../../artifacts-v2/sha256/f8/f8ce95989868ba75347e92b661e5f700f5c07767f9884768d36632425c78a3b9.zip',
    );
    const zipBuffer = readFileSync(zipPath);

    const candidates = materializeEpoch(zipBuffer, '2026-07-16T13:05:53.306Z');

    // Schema parse validation
    CandidateResultSchema.array().parse(candidates);

    // Total: 460 ECI plus 771 direct rows = 1231
    expect(candidates).toHaveLength(1231);

    const eci = candidates.filter(
      (c) => c.benchmarkId === 'epoch-capabilities-index',
    );
    expect(eci).toHaveLength(460);

    const direct = candidates.filter(
      (c) => c.benchmarkId !== 'epoch-capabilities-index',
    );
    expect(direct).toHaveLength(771);

    // Check specific direct benchmark counts
    const gpqa = candidates.filter((c) => c.benchmarkId === 'gpqa-diamond');
    expect(gpqa).toHaveLength(181);

    const math = candidates.filter((c) => c.benchmarkId === 'math-level-5');
    expect(math).toHaveLength(108);

    const swe = candidates.filter((c) => c.benchmarkId === 'swe-bench');
    expect(swe).toHaveLength(35);

    const aime = candidates.filter((c) => c.benchmarkId === 'aime');
    expect(aime).toHaveLength(154);

    const fm = candidates.filter((c) => c.benchmarkId === 'frontiermath');
    expect(fm).toHaveLength(173); // 101 + 72

    const simpleqa = candidates.filter(
      (c) => c.benchmarkId === 'simpleqa-verified',
    );
    expect(simpleqa).toHaveLength(64);

    const chess = candidates.filter((c) => c.benchmarkId === 'chess-puzzles');
    expect(chess).toHaveLength(56);
  });

  it('resolves every available distinct ECI Top 20 model and its reviewed configuration variants', () => {
    const zipBuffer = readFileSync(
      resolve(
        '../../artifacts-v2/sha256/f8/f8ce95989868ba75347e92b661e5f700f5c07767f9884768d36632425c78a3b9.zip',
      ),
    );
    const candidates = materializeEpoch(zipBuffer, '2026-07-16T13:05:53.306Z');
    const top20 = topDistinctRows(candidates, 'epoch-capabilities-index', 20);

    expect(top20).toHaveLength(20);
    expect(
      top20.filter(({ model }) => model.canonicalModelId === null),
    ).toEqual([]);
    expect(
      candidates.find(
        ({ model }) => model.rawName === 'Claude Opus 4.6 (32k thinking)',
      )?.model.canonicalModelId,
    ).toBe('anthropic-claude-opus-4-6');
  });
});

describe('Vals AI materializer', () => {
  it('materializes all structured rows from HTML', () => {
    const homeHtml = readFileSync(
      resolve(
        '../../artifacts-v2/sha256/a9/a905ab27b4c4efc554e0c62ff8e501e9710d8e7474c3834c124b0dac50c80a09.html',
      ),
      'utf8',
    );
    const detailHtml = readFileSync(
      resolve(
        '../../artifacts-v2/sha256/5f/5facdfe0c6d90ff4b224aae0ac6d5884b2e536dcaad23de47ed437b59f677871.html',
      ),
      'utf8',
    );

    const candidates = materializeVals(
      homeHtml,
      detailHtml,
      '2026-07-16T13:11:54.923Z',
    );

    // Schema parse validation
    CandidateResultSchema.array().parse(candidates);

    // 216 from matrix (36 models x 6 tasks) + 2 pre-existing GPT-5.6 Sol manual candidates = 218
    expect(candidates).toHaveLength(218);

    const valsIndex = candidates.filter((c) => c.benchmarkId === 'vals-index');
    expect(valsIndex).toHaveLength(36);

    const financeAgent = candidates.filter(
      (c) => c.benchmarkId === 'finance-agent-v2',
    );
    expect(financeAgent).toHaveLength(36);

    const corpfin = candidates.filter((c) => c.benchmarkId === 'corpfin');
    expect(corpfin).toHaveLength(36);

    const swe = candidates.filter((c) => c.benchmarkId === 'swe-bench');
    expect(swe).toHaveLength(36);

    const vibe = candidates.filter((c) => c.benchmarkId === 'vibe-code-bench');
    expect(vibe).toHaveLength(36);

    const terminal = candidates.filter(
      (c) => c.benchmarkId === 'terminal-bench-2-1',
    );
    expect(terminal).toHaveLength(36);

    // ProofBench manual candidates: 1 (GPT-5.6 Sol)
    const proofbench = candidates.filter((c) => c.benchmarkId === 'proofbench');
    expect(proofbench).toHaveLength(1);

    // GPQA Diamond manual candidates: 1 (GPT-5.6 Sol)
    const gpqa = candidates.filter((c) => c.benchmarkId === 'gpqa-diamond');
    expect(gpqa).toHaveLength(1);
  });

  it('resolves all Vals Index Top 20 provider slugs without fuzzy matching', () => {
    const candidates = materializeVals(
      readFileSync(
        resolve(
          '../../artifacts-v2/sha256/a9/a905ab27b4c4efc554e0c62ff8e501e9710d8e7474c3834c124b0dac50c80a09.html',
        ),
        'utf8',
      ),
      readFileSync(
        resolve(
          '../../artifacts-v2/sha256/5f/5facdfe0c6d90ff4b224aae0ac6d5884b2e536dcaad23de47ed437b59f677871.html',
        ),
        'utf8',
      ),
      '2026-07-16T13:11:54.923Z',
    );
    const top20 = topDistinctRows(candidates, 'vals-index', 20);

    expect(top20).toHaveLength(20);
    expect(
      top20.filter(({ model }) => model.canonicalModelId === null),
    ).toEqual([]);
    expect(
      candidates.find(({ model }) => model.rawName === 'kimi/kimi-k2.6')?.model
        .canonicalModelId,
    ).toBe('moonshot-kimi-k2-6');
  });
});

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
