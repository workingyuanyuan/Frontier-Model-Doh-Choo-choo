import { describe, expect, it } from 'vitest';

import {
  LIVEBENCH_PUBLIC_RELEASE,
  selectLiveBenchQuestionInventory,
} from './livebench-question-inventory.js';

const q = (suffix: string) => suffix.padStart(64, '0');

describe('selectLiveBenchQuestionInventory', () => {
  it('selects the configured release and earlier releases with stable ordering', () => {
    const selected = selectLiveBenchQuestionInventory({
      release: LIVEBENCH_PUBLIC_RELEASE,
      availableReleases: ['2024-11-25', '2024-06-24', '2024-07-26'],
      rows: [
        {
          question_id: q('3'),
          category: 'language',
          task: 'typos',
          turns: ['third'],
          livebench_release_date: new Date('2024-11-25T00:00:00.000Z'),
          livebench_removal_date: '',
        },
        {
          question_id: q('1'),
          category: 'coding',
          task: 'LCB_generation',
          turns: ['first'],
          livebench_release_date: '2024-06-24T00:00:00Z',
          livebench_removal_date: null,
        },
        {
          question_id: q('2'),
          category: 'coding',
          task: 'LCB_generation',
          turns: ['second'],
          livebench_release_date: '2024-07-26',
          livebench_removal_date: '',
        },
        {
          question_id: q('4'),
          category: 'reasoning',
          task: 'spatial',
          turns: ['future'],
          livebench_release_date: '2025-04-02',
          livebench_removal_date: '',
        },
      ],
    });

    expect(selected).toEqual([
      {
        category: 'coding',
        task: 'LCB_generation',
        questionId: q('1'),
        turn: 1,
      },
      {
        category: 'coding',
        task: 'LCB_generation',
        questionId: q('2'),
        turn: 1,
      },
      {
        category: 'language',
        task: 'typos',
        questionId: q('3'),
        turn: 1,
      },
    ]);
  });

  it('excludes removals on the selected release and expands retained turns', () => {
    const selected = selectLiveBenchQuestionInventory({
      release: LIVEBENCH_PUBLIC_RELEASE,
      availableReleases: ['2024-06-24', '2024-11-25'],
      rows: [
        {
          question_id: q('1'),
          category: 'instruction_following',
          task: 'if',
          turns: ['removed'],
          livebench_release_date: '2024-06-24',
          livebench_removal_date: '2024-11-25',
        },
        {
          question_id: q('2'),
          category: 'instruction_following',
          task: 'if',
          turns: ['one', 'two'],
          livebench_release_date: '2024-06-24',
          livebench_removal_date: '2025-04-02',
        },
      ],
    });

    expect(selected).toEqual([
      {
        category: 'instruction_following',
        task: 'if',
        questionId: q('2'),
        turn: 1,
      },
      {
        category: 'instruction_following',
        task: 'if',
        questionId: q('2'),
        turn: 2,
      },
    ]);
  });

  it('rejects unknown releases, malformed dates and duplicate question IDs', () => {
    const base = {
      release: LIVEBENCH_PUBLIC_RELEASE,
      availableReleases: ['2024-06-24', '2024-11-25'],
      rows: [
        {
          question_id: q('1'),
          category: 'math',
          task: 'amc',
          turns: ['question'],
          livebench_release_date: '2024-06-24',
          livebench_removal_date: '',
        },
      ],
    } as const;

    expect(() =>
      selectLiveBenchQuestionInventory({ ...base, release: '2025-04-02' }),
    ).toThrow('release');
    expect(() =>
      selectLiveBenchQuestionInventory({
        ...base,
        rows: [{ ...base.rows[0], livebench_release_date: '2024-6-24' }],
      }),
    ).toThrow('date');
    expect(() =>
      selectLiveBenchQuestionInventory({
        ...base,
        rows: [base.rows[0], base.rows[0]],
      }),
    ).toThrow('Duplicate');
  });
});
