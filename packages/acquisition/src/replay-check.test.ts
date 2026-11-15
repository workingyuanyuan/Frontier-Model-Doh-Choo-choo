import { describe, expect, it } from 'vitest';

import { diffSourceFiles } from './materialize-snapshots.js';

const rows = (...values: { id: string; score: number }[]) =>
  JSON.stringify(values);

describe('diffSourceFiles', () => {
  it('ignores JSON layout and key order', () => {
    expect(
      diffSourceFiles(
        'demo',
        { 'candidates.json': '[{"id":"a","score":1}]' },
        { 'candidates.json': '[\n  { "score": 1, "id": "a" }\n]\n' },
      ),
    ).toEqual([]);
  });

  it('names added, removed and changed rows by id', () => {
    expect(
      diffSourceFiles(
        'demo',
        {
          'candidates.json': rows(
            { id: 'kept', score: 1 },
            { id: 'changed', score: 2 },
            { id: 'removed', score: 3 },
          ),
        },
        {
          'candidates.json': rows(
            { id: 'kept', score: 1 },
            { id: 'changed', score: 9 },
            { id: 'added', score: 4 },
          ),
        },
      ),
    ).toEqual([
      {
        sourceId: 'demo',
        file: 'candidates.json',
        added: ['added'],
        removed: ['removed'],
        changed: ['changed'],
      },
    ]);
  });

  it('reports a file that only one side has', () => {
    expect(
      diffSourceFiles(
        'demo',
        {},
        { 'costs.json': rows({ id: 'a', score: 1 }) },
      ),
    ).toEqual([
      {
        sourceId: 'demo',
        file: 'costs.json',
        added: ['a'],
        removed: [],
        changed: [],
      },
    ]);
  });

  it('reports an empty file that only one side has', () => {
    expect(diffSourceFiles('demo', {}, { 'costs.json': '[]' })).toHaveLength(1);
    expect(diffSourceFiles('demo', { 'costs.json': '[]' }, {})).toHaveLength(1);
  });

  it('falls back to whole-file comparison for duplicate ids', () => {
    const duplicated = rows({ id: 'a', score: 1 }, { id: 'a', score: 2 });
    expect(
      diffSourceFiles(
        'demo',
        { 'candidates.json': duplicated },
        { 'candidates.json': rows({ id: 'a', score: 2 }) },
      ),
    ).toHaveLength(1);
    expect(
      diffSourceFiles(
        'demo',
        { 'candidates.json': duplicated },
        { 'candidates.json': `${duplicated}\n` },
      ),
    ).toEqual([]);
  });

  it('reports invalid JSON as a difference and keeps comparing other files', () => {
    expect(
      diffSourceFiles(
        'demo',
        { 'candidates.json': '[', 'costs.json': rows({ id: 'a', score: 1 }) },
        { 'candidates.json': '[]', 'costs.json': rows({ id: 'a', score: 2 }) },
      ).map(({ file }) => file),
    ).toEqual(['candidates.json', 'costs.json']);
  });

  it('reports changed text and non-row JSON without row ids', () => {
    expect(
      diffSourceFiles(
        'demo',
        { 'validation-report.md': 'old', 'manifest.json': '{"a":1}' },
        { 'validation-report.md': 'new', 'manifest.json': '{"a":2}' },
      ).map(({ file, added, removed, changed }) => ({
        file,
        rows: added.length + removed.length + changed.length,
      })),
    ).toEqual([
      { file: 'manifest.json', rows: 0 },
      { file: 'validation-report.md', rows: 0 },
    ]);
  });
});
