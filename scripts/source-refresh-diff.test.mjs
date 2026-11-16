import test from 'node:test';
import assert from 'node:assert/strict';

import { describeEvidence, diffSourceRows } from './source-refresh-diff.mjs';

const row = (id, score, capture) => ({
  id,
  score,
  observedAt: capture,
  evidenceIds: [`sha256:${capture}`],
  provenance: { rawScore: { evidenceId: `sha256:${capture}`, locator: 'a' } },
});
const diff = (before, after) => diffSourceRows(before, after, 'old', 'new');
const none = { added: [], removed: [], changed: [] };

test('a recapture with the same values is not a change', () => {
  assert.deepEqual(diff([row('a', 1, 'old')], [row('a', 1, 'new')]), none);
});

test('reports added, removed and changed rows by id', () => {
  assert.deepEqual(
    diff(
      [row('a', 1, 'old'), row('b', 2, 'old')],
      [row('a', 3, 'new'), row('c', 2, 'new')],
    ),
    { added: ['c'], removed: ['b'], changed: ['a'] },
  );
});

test('a changed locator counts even when the score is the same', () => {
  const after = row('a', 1, 'new');
  after.provenance.rawScore.locator = 'b';
  assert.deepEqual(diff([row('a', 1, 'old')], [after]).changed, ['a']);
});

test('a retained row keeps its own time, and losing it is a change', () => {
  const retained = row('a', 1, 'older');
  assert.deepEqual(diff([retained], [retained]), none);
  assert.deepEqual(diff([retained], [row('a', 1, 'new')]).changed, ['a']);
  assert.deepEqual(diff([row('a', 1, 'old')], [retained]).changed, ['a']);
});

test('unchanged bytes are a change when the capture time moved on', () => {
  const rows = [row('a', 1, 'old')];
  assert.deepEqual(diff(rows, rows).changed, ['a']);
});

test('reordered rows are a change', () => {
  assert.deepEqual(
    diff(
      [row('a', 1, 'old'), row('b', 2, 'old')],
      [row('b', 2, 'new'), row('a', 1, 'new')],
    ).changed,
    ['<row order>'],
  );
});

test('rows that cannot be paired by id fall back to the whole file', () => {
  const duplicated = [row('a', 1, 'old'), row('a', 2, 'old')];
  assert.deepEqual(
    diff(duplicated, [row('a', 1, 'new'), row('a', 5, 'new')]).changed,
    ['<whole file>'],
  );
  assert.deepEqual(
    diff(duplicated, [row('a', 1, 'new'), row('a', 2, 'new')]),
    none,
  );
});

const evidence = (capture, overrides = {}) => ({
  id: `sha256:${capture}`,
  sha256: capture,
  retrievedAt: capture,
  requestUrl: 'https://example.test/board',
  finalUrl: 'https://example.test/board',
  method: 'HTTP',
  mediaType: 'text/html',
  metadata: {
    bounds: [1, 2],
    pageEvidenceId: capture,
    capturedPages: [
      { slug: 'one', evidenceId: capture },
      { slug: 'two', evidenceId: capture },
    ],
  },
  ...overrides,
});

test('evidence is described by what it says, not by its bytes or order', () => {
  const other = evidence('older', { requestUrl: 'https://example.test/b' });
  assert.deepEqual(
    describeEvidence([evidence('old'), other], 'old'),
    describeEvidence([other, evidence('new')], 'new'),
  );
});

test('evidence metadata, final URL, page order and capture group count', () => {
  const base = describeEvidence([evidence('old')], 'old');
  const changed = [
    evidence('new', {
      metadata: { ...evidence('new').metadata, bounds: [1, 3] },
    }),
    evidence('new', { finalUrl: 'https://example.test/moved' }),
    evidence('new', {
      metadata: {
        ...evidence('new').metadata,
        capturedPages: [{ slug: 'two' }, { slug: 'one' }],
      },
    }),
    evidence('older'),
  ];
  for (const record of changed) {
    assert.notDeepEqual(describeEvidence([record], 'new'), base);
  }
});
