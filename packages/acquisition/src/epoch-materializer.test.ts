import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { CandidateResultSchema } from '@llm-bench/benchmark-data';

import { materializeEpoch } from './epoch-materializer.js';

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
    const zipPath = fileURLToPath(
      new URL(
        '../test-fixtures/f8ce95989868ba75347e92b661e5f700f5c07767f9884768d36632425c78a3b9.zip',
        import.meta.url,
      ),
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
      fileURLToPath(
        new URL(
          '../test-fixtures/f8ce95989868ba75347e92b661e5f700f5c07767f9884768d36632425c78a3b9.zip',
          import.meta.url,
        ),
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
