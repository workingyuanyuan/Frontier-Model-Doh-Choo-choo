import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  CandidateResultSchema,
  normalizeProductEffort,
} from '@llm-bench/benchmark-data';

import { decodeVersionSuffix, materializeEpoch } from './epoch-materializer.js';

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

describe('decodeVersionSuffix', () => {
  it('files the tiers Epoch names and leaves the rest to inference', () => {
    const effortOf = (version: string) => decodeVersionSuffix(version).effort;

    // `_none` is reasoning off, declared by the source. Leaving it null had it
    // inferred to `max`, so a reasoning-off Chess Puzzles run (7.00) replaced
    // the real max run (55.00) for GPT-5.6 Sol.
    expect(effortOf('gpt-5.6-sol_none')).toBe('non-reasoning');
    // `_minimal` is the bottom tier, not an absent label. The raw source value
    // is retained here and `normalizeProductEffort` maps it to `low` (spec 4.4);
    // what matters is that it is no longer null, so it is filed rather than
    // inferred -- it was being inferred to `high`.
    expect(effortOf('gemini-3.6-flash_minimal')).toBe('minimal');
    expect(normalizeProductEffort('minimal')).toBe('low');

    expect(effortOf('gpt-5.6-sol_max')).toBe('max');
    expect(effortOf('grok-4.6_xhigh')).toBe('xhigh');
    expect(effortOf('gemini-3.7-flash_high')).toBe('high');
    expect(effortOf('kimi-k3_medium')).toBe('medium');
    expect(effortOf('glm-5.2_low')).toBe('low');

    // Not effort tiers: token budgets, an explicit unknown, and a bare name.
    expect(effortOf('gemini-3.1-pro-preview_32K')).toBeNull();
    expect(effortOf('deepseek-v4-pro_unknown')).toBeNull();
    expect(effortOf('muse-spark')).toBeNull();
  });

  it('separates a Pro model from a pro configuration of the base model', () => {
    // Epoch gives a distinct Pro release its own model version and its own
    // name, so these score normally under their own catalog models.
    expect(decodeVersionSuffix('gpt-5.5-pro_xhigh')).toEqual({
      effort: 'xhigh',
      thinking: 'pro',
      proConfiguration: false,
    });
    expect(decodeVersionSuffix('gpt-5.4-pro-2026-03-05_xhigh')).toEqual({
      effort: 'xhigh',
      thinking: 'pro',
      proConfiguration: false,
    });
    // Gemini's "Pro" is the model tier name, in the version, not a suffix.
    expect(decodeVersionSuffix('gemini-3.1-pro-preview_high')).toEqual({
      effort: 'high',
      thinking: 'pro',
      proConfiguration: false,
    });

    // GPT-5.6 Sol Pro is a suffix on the base version, so it stays with the
    // base model and is flagged for exclusion from its scores.
    expect(decodeVersionSuffix('gpt-5.6-sol_promax')).toEqual({
      effort: 'max',
      thinking: 'pro',
      proConfiguration: true,
    });
    expect(decodeVersionSuffix('gpt-5.6-sol_prounknown')).toEqual({
      effort: null,
      thinking: 'pro',
      proConfiguration: true,
    });
  });
});

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
    expect(fm).toHaveLength(101);

    const fmTier4 = candidates.filter(
      (c) => c.benchmarkId === 'frontiermath-tier-4',
    );
    expect(fmTier4).toHaveLength(72);

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
