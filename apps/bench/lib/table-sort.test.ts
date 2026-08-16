import { describe, expect, it } from 'vitest';

import {
  groupEvidenceByDimension,
  sortEvidenceRows,
  sortLeaderboardRows,
} from './table-sort';
import { productFixture } from '../test/fixture';

const benchmarkDimensions = {
  'terminal-bench-2-1': 'coding',
  frontiermath: 'math',
} as const;

describe('sortable product tables', () => {
  it('sorts every leaderboard value deterministically and keeps N/A last', () => {
    const byModel = sortLeaderboardRows(
      productFixture,
      productFixture.leaderboard,
      {
        key: 'model',
        direction: 'ascending',
      },
    );
    const byReasoning = sortLeaderboardRows(
      productFixture,
      productFixture.leaderboard,
      {
        key: 'reasoning',
        direction: 'descending',
      },
    );
    const contextAscending = sortLeaderboardRows(
      productFixture,
      productFixture.leaderboard,
      {
        key: 'context',
        direction: 'ascending',
      },
    );
    const contextDescending = sortLeaderboardRows(
      productFixture,
      productFixture.leaderboard,
      {
        key: 'context',
        direction: 'descending',
      },
    );

    expect(byModel.map(({ modelId }) => modelId)).toEqual([
      'anthropic-claude-fable-5',
      'google-gemini-3-1-pro',
      'openai-gpt-5-6-sol',
      'openai-gpt-5-6-sol',
    ]);
    expect(byReasoning[0]?.profileId).toBe('openai-gpt-5-6-sol-max');
    expect(contextAscending.at(-1)?.modelId).toBe('anthropic-claude-fable-5');
    expect(contextDescending.at(-1)?.modelId).toBe('anthropic-claude-fable-5');
  });

  it('sorts coverage descending with Overall Score as its deterministic tie-break', () => {
    const sorted = sortLeaderboardRows(
      productFixture,
      productFixture.leaderboard,
      { key: 'coverage', direction: 'descending' },
    );

    expect(sorted.map(({ profileId }) => profileId)).toEqual([
      'openai-gpt-5-6-sol-max',
      'openai-gpt-5-6-sol-high',
      'google-gemini-3-1-pro-high',
      'anthropic-claude-fable-5-standard',
    ]);
  });

  it('sorts evidence by each visible column value', () => {
    const rows = productFixture.evidence;

    expect(
      sortEvidenceRows(rows, {
        key: 'benchmark',
        direction: 'ascending',
      })[0]?.benchmarkId,
    ).toBe('frontiermath');
    expect(
      sortEvidenceRows(rows, {
        key: 'score',
        direction: 'descending',
      })[0]?.rawScore,
    ).toBe(94.7);
    expect(
      sortEvidenceRows(rows, {
        key: 'decision',
        direction: 'ascending',
      })[0]?.inclusion,
    ).toBe('EXCLUDED');
  });
});

describe('evidence categories', () => {
  it('always returns the eight product dimensions in UI order', () => {
    const { groups } = groupEvidenceByDimension(
      productFixture.evidence,
      benchmarkDimensions,
    );

    expect(groups.map(({ dimension }) => dimension)).toEqual([
      'agentic',
      'coding',
      'reasoning',
      'math',
      'knowledge',
      'language',
      'context',
      'instruction',
    ]);
    expect(
      groups.find(({ dimension }) => dimension === 'coding')?.rows,
    ).toHaveLength(2);
    expect(
      groups.find(({ dimension }) => dimension === 'math')?.rows,
    ).toHaveLength(1);
  });

  it('retains excluded, non-scoring evidence outside the eight score groups', () => {
    const { unmapped } = groupEvidenceByDimension(
      productFixture.evidence,
      benchmarkDimensions,
    );

    expect(unmapped.map(({ id }) => id)).toEqual(['aggregate:max']);
  });
});
