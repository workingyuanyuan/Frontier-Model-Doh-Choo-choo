import { describe, expect, it } from 'vitest';

import {
  buildFrontierSet,
  buildProductVersion,
  scoreProfiles,
  selectCurrentResults,
  type CandidateResult,
} from './index.js';

const evidenceId =
  'sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' as const;

const makeCandidate = (
  overrides: Partial<CandidateResult> = {},
): CandidateResult => ({
  schemaVersion: 'candidate-result-v1',
  id: 'result-vendor',
  sourceId: 'openai',
  sourceRole: 'VENDOR',
  benchmarkId: 'terminal-bench-2-1',
  benchmarkVersion: '2.1',
  model: {
    rawName: 'GPT-5.6 Sol (max)',
    canonicalModelId: 'openai-gpt-5-6-sol',
    profileId: 'openai-gpt-5-6-sol-max',
  },
  profile: {
    effort: 'max',
    thinking: null,
    tools: true,
    harness: 'terminus-2',
    contextWindowTokens: null,
    quantization: null,
    attempts: 1,
  },
  metric: {
    id: 'terminal-bench-score',
    name: 'Score',
    unit: 'percent',
    higherIsBetter: true,
  },
  rawScore: 82,
  normalizedScore: 82,
  acquisitionStatus: 'FULL',
  inclusion: 'INCLUDED',
  exclusionReason: null,
  sourceUrl: 'https://openai.com/index/gpt-5-6/',
  observedAt: '2026-07-16T00:00:00.000Z',
  sourcePublishedAt: '2026-07-09T00:00:00.000Z',
  evidenceIds: [evidenceId],
  provenance: {
    rawScore: {
      evidenceId,
      method: 'DOM',
      locator: 'Terminal-Bench 2.1 table',
    },
  },
  ...overrides,
});

describe('selectCurrentResults', () => {
  it('uses organizer evidence over a vendor value for the same profile/config', () => {
    const vendor = makeCandidate();
    const organizer = makeCandidate({
      id: 'result-organizer',
      sourceId: 'terminal-bench',
      sourceRole: 'ORGANIZER',
      sourceUrl: 'https://www.tbench.ai/leaderboard/terminal-bench/2.1',
      rawScore: 85.8,
      normalizedScore: 85.8,
    });

    expect(selectCurrentResults([vendor, organizer])).toEqual([organizer]);
  });

  it('uses a full snapshot over a partial row at the same source tier', () => {
    const partial = makeCandidate({ acquisitionStatus: 'PARTIAL_SOURCE' });
    const full = makeCandidate({
      id: 'full',
      sourceId: 'vals-ai',
      sourceRole: 'INDEPENDENT',
      acquisitionStatus: 'FULL',
      rawScore: 84,
      normalizedScore: 84,
    });

    expect(
      selectCurrentResults([{ ...partial, sourceRole: 'INDEPENDENT' }, full]),
    ).toEqual([full]);
  });

  it('does not score excluded or display-only rows', () => {
    expect(
      selectCurrentResults([
        makeCandidate({
          inclusion: 'EXCLUDED',
          exclusionReason: 'Composite index is selection-only',
        }),
      ]),
    ).toEqual([]);
  });
});

describe('buildFrontierSet', () => {
  it('takes at most twenty base models per source and keeps one profile slot', () => {
    const rows = [
      {
        sourceId: 'aa',
        rank: 1,
        modelId: 'model-a',
        profileId: 'model-a-max',
        score: 60,
      },
      {
        sourceId: 'aa',
        rank: 2,
        modelId: 'model-a',
        profileId: 'model-a-high',
        score: 58,
      },
      ...Array.from({ length: 24 }, (_, index) => ({
        sourceId: 'aa',
        rank: index + 3,
        modelId: `model-${index + 2}`,
        profileId: `model-${index + 2}-default`,
        score: 50 - index,
      })),
    ];

    const frontier = buildFrontierSet(rows, [
      {
        modelId: 'manual-new-model',
        profileId: 'manual-new-model-default',
        reason: 'Manually specified new release',
      },
    ]);

    expect(frontier).toHaveLength(21);
    expect(
      frontier.filter(({ modelId }) => modelId === 'model-a'),
    ).toHaveLength(1);
    expect(frontier.at(-1)?.modelId).toBe('manual-new-model');
  });

  it('does not pad a source that has fewer than twenty models', () => {
    expect(
      buildFrontierSet(
        [
          {
            sourceId: 'short',
            rank: 1,
            modelId: 'only-model',
            profileId: 'only-model-default',
            score: 10,
          },
        ],
        [],
      ),
    ).toHaveLength(1);
  });
});

describe('scoreProfiles', () => {
  it('renormalizes over available dimensions and preserves missing axes', () => {
    const scored = scoreProfiles(
      [
        makeCandidate(),
        makeCandidate({
          id: 'math',
          benchmarkId: 'aime',
          benchmarkVersion: '2026',
          metric: {
            id: 'accuracy',
            name: 'Accuracy',
            unit: 'percent',
            higherIsBetter: true,
          },
          rawScore: 90,
          normalizedScore: 90,
        }),
      ],
      new Map([
        ['terminal-bench-2-1', 'coding'],
        ['aime', 'math'],
      ]),
    );

    expect(scored[0]?.overallScore).toBe(86);
    expect(scored[0]?.dimensions).toEqual(
      expect.arrayContaining([
        { dimension: 'math', score: 90, componentCount: 1 },
        { dimension: 'coding', score: 82, componentCount: 1 },
        { dimension: 'knowledge', score: null, componentCount: 0 },
      ]),
    );
  });

  it('does not produce an overall score without a mapped normalized result', () => {
    const scored = scoreProfiles(
      [makeCandidate({ normalizedScore: null })],
      new Map([['terminal-bench-2-1', 'coding']]),
    );

    expect(scored[0]?.overallScore).toBeNull();
  });
});

describe('buildProductVersion', () => {
  it('produces a byte-stable immutable version identifier', () => {
    const input = {
      generatedAt: '2026-07-16T00:00:00.000Z',
      sourceSnapshotIds: ['terminal-bench:2026-07-16'],
      frontier: [],
      profiles: [],
      leaderboard: scoreProfiles(
        [makeCandidate()],
        new Map([['terminal-bench-2-1', 'coding']]),
      ),
      costs: [],
      evidence: [makeCandidate()],
    };

    const version = buildProductVersion(input);

    expect(version).toEqual(buildProductVersion(input));
    expect(version).not.toHaveProperty('state');
  });
});
