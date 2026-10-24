import test from 'node:test';
import assert from 'node:assert/strict';

import {
  diffPreset,
  diffProducts,
  renderReleaseMarkdown,
} from './release-report.mjs';

const row = (modelId, rank, overallScore, profileId = `${modelId}-max`) => ({
  modelId,
  profileId,
  rank,
  overallScore,
});

const product = (versionId, leaderboard, benchmarkIds, frontier) => ({
  versionId,
  defaultPresetId: 'aa-frontier',
  profiles: leaderboard.map(({ profileId }) => ({ id: profileId })),
  evidence: [],
  costs: [],
  sourceSnapshotIds: [`aa:${versionId}`],
  frontier: frontier.map((modelId, index) => ({
    modelId,
    externalCompositeScores: { 'artificial-analysis': 60 - index },
  })),
  presets: [
    { id: 'aa-frontier', targetModelCount: 8, benchmarkIds, leaderboard },
  ],
});

test('preset diff separates entries, exits and rank changes', () => {
  const diff = diffPreset(
    {
      id: 'aa-frontier',
      benchmarkIds: ['a', 'b'],
      leaderboard: [row('m1', 1, 70), row('m2', 2, 65)],
    },
    {
      id: 'aa-frontier',
      benchmarkIds: ['a', 'c'],
      leaderboard: [row('m3', 1, 72), row('m1', 2, 69.5, 'm1-xhigh')],
    },
  );
  assert.deepEqual(diff.benchmarks, { added: ['c'], removed: ['b'] });
  assert.deepEqual(diff.models, { added: ['m3'], removed: ['m2'] });
  assert.deepEqual(diff.entered, [
    { modelId: 'm3', profileId: 'm3-max', rank: 1, overall: 72 },
  ]);
  assert.deepEqual(diff.continuing[0], {
    modelId: 'm1',
    oldProfileId: 'm1-max',
    newProfileId: 'm1-xhigh',
    oldRank: 1,
    newRank: 2,
    oldOverall: 70,
    newOverall: 69.5,
    overallDelta: -0.5,
  });
});

test('release markdown lists versions, frontier and inferences', () => {
  const before = product('sha256:old', [row('m1', 1, 70)], ['a'], ['m1']);
  const after = product(
    'sha256:new',
    [row('m2', 1, 71), row('m1', 2, 70)],
    ['a'],
    ['m2', 'm1'],
  );
  const markdown = renderReleaseMarkdown({
    receipt: {
      runId: 'run',
      status: 'complete',
      review: 'pending-user-review',
      failedStep: null,
      previousVersionId: 'sha256:old',
      versionId: 'sha256:new',
      head: 'abc',
      startedAt: 's',
      finishedAt: 'f',
      baselineDir: 'artifacts/releases/run/baseline',
      steps: [{ id: 'product', exitCode: 0, ms: 1500, log: 'x.log' }],
    },
    diff: diffProducts(before, after),
    inferences: [
      {
        modelId: 'm2',
        benchmarkId: 'a',
        sourceId: 'epoch-ai',
        effort: 'max',
        basisSource: 'arc-prize',
        basisCandidate: 'arc:x',
      },
    ],
    skipped: [
      { rank: 3, modelId: 'm3', score: 55.804, organizations: ['vals-ai'] },
    ],
  });
  assert.match(markdown, /`sha256:old` → `sha256:new`/u);
  assert.match(markdown, /\| 3 \| m3 \| 55\.8 \| vals-ai \|/u);
  assert.match(markdown, /\| 1 \| m1 \| 60 \| m2 \| 60 \|/u);
  assert.match(markdown, /m2 \(new\)/u);
  assert.match(markdown, /\| 8 \| `aa-frontier` \(default\) \| 1 → 1 \|/u);
  assert.match(
    markdown,
    /\| m2 \| a \| epoch-ai \| max \| arc-prize: arc:x \|/u,
  );
});
