import { describe, expect, it } from 'vitest';

import {
  groupEvidenceByDimension,
  sortEvidenceRows,
  sortLeaderboardRows,
} from './table-sort';
import { productFixture } from '../test/fixture';

const benchmarkDimensions = {
  'terminal-bench-2-1': 'coding',
  frontiermath: 'reasoning',
} as const;

describe('sortable product tables', () => {
  it('sorts every leaderboard value deterministically', () => {
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
    const languageAscending = sortLeaderboardRows(
      productFixture,
      productFixture.leaderboard,
      {
        key: 'language',
        direction: 'ascending',
      },
    );
    const languageDescending = sortLeaderboardRows(
      productFixture,
      productFixture.leaderboard,
      {
        key: 'language',
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
    expect(languageAscending.at(-1)?.modelId).toBe('anthropic-claude-fable-5');
    expect(languageDescending.at(-1)?.modelId).toBe('anthropic-claude-fable-5');
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
  it('always returns the five product dimensions in UI order', () => {
    const { groups } = groupEvidenceByDimension(
      productFixture.evidence,
      benchmarkDimensions,
    );

    expect(groups.map(({ dimension }) => dimension)).toEqual([
      'agentic',
      'coding',
      'reasoning',
      'knowledge',
      'language',
    ]);
    expect(
      groups.find(({ dimension }) => dimension === 'coding')?.rows,
    ).toHaveLength(2);
    expect(
      groups.find(({ dimension }) => dimension === 'reasoning')?.rows,
    ).toHaveLength(1);
  });

  it('retains excluded, non-scoring evidence outside the five score groups', () => {
    const { unmapped } = groupEvidenceByDimension(
      productFixture.evidence,
      benchmarkDimensions,
    );

    expect(unmapped.map(({ id }) => id)).toEqual(['aggregate:max']);
  });
});
