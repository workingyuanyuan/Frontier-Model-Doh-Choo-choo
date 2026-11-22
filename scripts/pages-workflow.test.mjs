import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { parse } from 'yaml';
import {
  verifyCurrentMain,
  verifyDeployment,
} from './verify-pages-deployment.mjs';
import {
  latestSuccessfulRun,
  mergedPullRequest,
  verifiedArtifact,
} from './find-verified-pr-build.mjs';

const workflow = parse(readFileSync('.github/workflows/ci.yml', 'utf8'));
const sha = 'a'.repeat(40);
const valid = {
  GITHUB_EVENT_NAME: 'push',
  GITHUB_REPOSITORY: 'workingyuanyuan/Frontier-Model-Doh-Choo-choo',
  GITHUB_REF: 'refs/heads/main',
  GITHUB_SHA: sha,
  VERIFIED_SHA: sha,
  QUALITY_RESULT: 'success',
};
function jobEligible(env) {
  return runInNewContext(workflow.jobs.deploy.if, {
    cancelled: () => false,
    github: {
      event_name: env.GITHUB_EVENT_NAME,
      repository: env.GITHUB_REPOSITORY,
      ref: env.GITHUB_REF,
    },
    needs: { quality: { result: env.QUALITY_RESULT } },
  });
}

test('trusted successful main push and current-SHA rerun can deploy', () => {
  for (const attempt of ['1', '2']) {
    const env = { ...valid, GITHUB_RUN_ATTEMPT: attempt };
    assert.equal(jobEligible(env), true);
    assert.doesNotThrow(() => verifyDeployment(env, sha));
  }
});

for (const [label, patch] of [
  ...['failure', 'cancelled', 'skipped', undefined].map((result) => [
    `quality ${result ?? 'missing'}`,
    { QUALITY_RESULT: result },
  ]),
  ['PR', { GITHUB_EVENT_NAME: 'pull_request' }],
  ['fork push', { GITHUB_REPOSITORY: 'someone/fork' }],
  [
    'fork PR',
    { GITHUB_EVENT_NAME: 'pull_request', GITHUB_REPOSITORY: 'someone/fork' },
  ],
  ['manual trigger', { GITHUB_EVENT_NAME: 'workflow_dispatch' }],
  ['other branch', { GITHUB_REF: 'refs/heads/topic' }],
  ['tag', { GITHUB_REF: 'refs/tags/v1' }],
]) {
  test(`${label} is blocked by the actual job condition and deployment guard`, () => {
    const env = { ...valid, ...patch };
    assert.equal(jobEligible(env), false);
    assert.throws(() => verifyDeployment(env, sha));
  });
}

test('mismatched artifact, missing SHA and stale reruns fail closed', () => {
  for (const verified of [undefined, '', 'b'.repeat(40)]) {
    assert.throws(() =>
      verifyDeployment({ ...valid, VERIFIED_SHA: verified }, sha),
    );
  }
  for (const main of [undefined, '', 'null', 'bad-response', 'b'.repeat(40)]) {
    assert.throws(() => verifyDeployment(valid, main));
    assert.throws(() =>
      verifyDeployment({ ...valid, GITHUB_RUN_ATTEMPT: '2' }, main),
    );
  }
  assert.throws(() => verifyDeployment({ ...valid, GITHUB_SHA: '' }, sha));
});

const findStep = (job, predicate, label) => {
  const step = job.steps.find(predicate);
  assert.ok(step, label);
  return step;
};

test('every gate runs unconditionally in a job that quality waits for', () => {
  assert.deepEqual(Object.keys(workflow.on).sort(), ['pull_request', 'push']);
  assert.deepEqual(workflow.on.push.branches, ['main']);
  assert.equal(existsSync('.github/workflows/pages.yml'), false);
  assert.deepEqual(workflow.permissions, { contents: 'read' });
  const { checks, build, e2e, quality } = workflow.jobs;
  for (const job of Object.values(workflow.jobs))
    assert.equal(job['continue-on-error'], undefined);
  for (const [command, job] of [
    ['pnpm audit --audit-level high', checks],
    ['pnpm format', checks],
    ['pnpm lint', checks],
    ['pnpm typecheck', checks],
    ['pnpm test', checks],
    ['pnpm data:verify-fresh', checks],
    ['pnpm build', build],
    ['pnpm e2e --shard=${{ matrix.shard }}/3', e2e],
  ]) {
    const step = findStep(job, (s) => s.run === command, command);
    assert.equal(step.if, undefined, `${command} cannot be skipped`);
    assert.equal(step['continue-on-error'], undefined);
  }
  for (const job of [checks, build, e2e]) {
    assert.equal(job.permissions, undefined);
    assert.equal(job.steps[0].with.ref, '${{ github.sha }}');
  }
  // Only a reused PR build may skip the gates.
  for (const job of [checks, build]) {
    assert.equal(job.needs, 'reuse');
    assert.equal(
      job.if,
      "${{ !cancelled() && !(needs.reuse.result == 'success' && needs.reuse.outputs.hit == 'true') }}",
    );
  }
  assert.equal(e2e.needs, 'build');
  assert.equal(
    e2e.if,
    "${{ !cancelled() && needs.build.result == 'success' }}",
  );
  assert.deepEqual(e2e.strategy.matrix.shard, [1, 2, 3]);
  assert.deepEqual(quality.needs, ['reuse', 'checks', 'build', 'e2e']);
});

test('the browser shards test the export this run built', () => {
  const { build, e2e } = workflow.jobs;
  assert.equal(
    e2e.steps.some((s) => s.run === 'pnpm build'),
    false,
  );
  const handoff = findStep(
    build,
    (s) => s.uses?.startsWith('actions/upload-artifact@'),
    'build uploads its export for e2e',
  );
  const download = findStep(
    e2e,
    (s) => s.uses?.startsWith('actions/download-artifact@'),
    'e2e downloads the build',
  );
  // One name per run attempt, produced by the build and passed to the shards.
  assert.equal(handoff.with.name, '${{ steps.pages.outputs.e2e }}');
  assert.equal(build.outputs.e2e, '${{ steps.pages.outputs.e2e }}');
  assert.equal(download.with.name, '${{ needs.build.outputs.e2e }}');
  assert.match(
    build.steps.find((s) => s.id === 'pages').run,
    /e2e=e2e-build-\$GITHUB_RUN_ID-\$GITHUB_RUN_ATTEMPT/,
  );
  assert.match(handoff.with.path, /^apps\/bench\/out$/m);
  assert.equal(handoff.with['if-no-files-found'], 'error');
  assert.ok(
    build.steps.indexOf(handoff) >
      build.steps.findIndex((s) => s.run === 'pnpm build'),
  );
  assert.equal(e2e.env.NEXT_PUBLIC_BASE_PATH, build.env.NEXT_PUBLIC_BASE_PATH);
});

test('quality fails closed and carries the build SHA and artifact', () => {
  const { build, quality } = workflow.jobs;
  assert.equal(quality.if, '${{ !cancelled() }}');
  assert.equal(quality.permissions, undefined);
  assert.equal(quality.steps.length, 3);
  const [receipts, verified, receiptUpload] = quality.steps;
  assert.ok(receipts.uses.startsWith('actions/download-artifact@'));
  assert.equal(receipts.with.pattern, 'e2e-receipt-*');
  assert.equal(
    receipts.if,
    "${{ !(needs.reuse.result == 'success' && needs.reuse.outputs.hit == 'true') }}",
  );
  assert.equal(verified.id, 'verified');
  assert.equal(verified.if, undefined);
  for (const step of [receipts, verified])
    assert.equal(step['continue-on-error'], undefined);
  // Best effort: a missing receipt only means main runs every gate.
  assert.equal(receiptUpload['continue-on-error'], true);
  // The receipt a later main push reuses is written only on the path that
  // checked every gate, and uploaded only once that step passed.
  const gated = verified.run.indexOf('else');
  assert.ok(gated > 0);
  assert.ok(verified.run.indexOf('verified-build/receipt') > gated);
  assert.ok(verified.run.indexOf('test "$E2E" = success') > gated);
  assert.equal(verified.env.TREE, '${{ needs.build.outputs.tree }}');
  assert.ok(verified.run.includes('test -n "$TREE"'));
  assert.equal(receiptUpload.if, "github.event_name == 'pull_request'");
  assert.equal(
    receiptUpload.with.name,
    'verified-build-${{ github.run_attempt }}',
  );
  assert.equal(receiptUpload.with['if-no-files-found'], 'error');
  // Every shard must leave a receipt naming the build this run tested.
  const { e2e } = workflow.jobs;
  const ran = e2e.steps.findIndex((s) => s.run?.startsWith('pnpm e2e'));
  const receipt = e2e.steps.findIndex(
    (s) =>
      s.with?.name ===
      'e2e-receipt-${{ matrix.shard }}-${{ github.run_attempt }}',
  );
  assert.ok(ran >= 0 && receipt > ran);
  for (const step of e2e.steps.slice(ran, receipt + 1))
    assert.equal(step.if, undefined);
  assert.equal(verified.env.TESTED, '${{ needs.build.outputs.e2e }}');
  assert.ok(verified.run.includes('for shard in 1 2 3; do'));
  assert.ok(verified.run.includes('grep -qxF "$TESTED"'));
  for (const [name, need] of [
    ['CHECKS', 'checks'],
    ['BUILD', 'build'],
    ['E2E', 'e2e'],
  ]) {
    assert.equal(verified.env[name], `\${{ needs.${need}.result }}`);
    assert.ok(verified.run.includes(`test "$${name}" = success`), name);
  }
  assert.equal(verified.env.BUILT_SHA, '${{ needs.build.outputs.sha }}');
  assert.equal(verified.env.ARTIFACT, '${{ needs.build.outputs.artifact }}');
  assert.ok(verified.run.includes('test "$BUILT_SHA" = "$GITHUB_SHA"'));
  assert.ok(verified.run.includes('test -n "$ARTIFACT"'));
  assert.equal(quality.outputs.sha, '${{ steps.verified.outputs.sha }}');
  assert.equal(
    quality.outputs.artifact,
    '${{ steps.verified.outputs.artifact }}',
  );

  const steps = build.steps;
  const built = steps.findIndex((s) => s.run === 'pnpm build');
  const pages = steps.findIndex((s) => s.id === 'pages');
  const upload = steps.findIndex((s) =>
    s.uses?.startsWith('actions/upload-pages-artifact@'),
  );
  assert.ok(built >= 0 && built < pages && pages < upload);
  for (const index of [pages, upload]) {
    assert.equal(steps[index].if, undefined);
    assert.equal(steps[index]['continue-on-error'], undefined);
  }
  assert.match(steps[pages].run, /touch apps\/bench\/out\/\.nojekyll/);
  assert.match(steps[pages].run, /sha=\$GITHUB_SHA/);
  assert.match(steps[pages].run, /GITHUB_RUN_ID-\$GITHUB_RUN_ATTEMPT/);
  assert.equal(steps[upload].with.path, 'apps/bench/out');
  assert.equal(steps[upload].with.name, '${{ steps.pages.outputs.artifact }}');
  assert.equal(build.outputs.sha, '${{ steps.pages.outputs.sha }}');
  assert.equal(build.outputs.artifact, '${{ steps.pages.outputs.artifact }}');
  assert.equal(
    build.env.NEXT_PUBLIC_BASE_PATH,
    "${{ format('/{0}', github.event.repository.name) }}",
  );
});

test('deploy uses only the artifact quality verified, under its own lock', () => {
  const { reuse, checks, build, e2e, quality, deploy } = workflow.jobs;
  // A workflow-wide cancel would also cancel a deploy already running.
  assert.equal(workflow.concurrency, undefined);
  // A cancelled reuse would start its fallback gates after a newer run's.
  assert.equal(reuse.concurrency, undefined);
  const groups = [checks, build, e2e].map((job) => job.concurrency.group);
  assert.equal(new Set(groups).size, groups.length);
  assert.match(e2e.concurrency.group, /matrix\.shard/);
  assert.equal(quality.concurrency, undefined);
  assert.deepEqual(deploy.concurrency, {
    group: 'pages',
    'cancel-in-progress': false,
    queue: 'max',
  });
  assert.equal(deploy.needs, 'quality');
  assert.equal(deploy.steps[0].with.ref, '${{ github.sha }}');
  assert.deepEqual(deploy.permissions, {
    contents: 'read',
    pages: 'write',
    'id-token': 'write',
  });
  const check = deploy.steps[1];
  assert.equal(check.run, 'node scripts/verify-pages-deployment.mjs');
  assert.equal(check.env.VERIFIED_SHA, '${{ needs.quality.outputs.sha }}');
  assert.equal(check.env.QUALITY_RESULT, '${{ needs.quality.result }}');
  assert.equal(check.if, undefined);
  assert.equal(check['continue-on-error'], undefined);
  assert.ok(deploy.steps[2].uses.startsWith('actions/deploy-pages@'));
  assert.equal(deploy.steps[2].if, undefined);
  assert.equal(
    deploy.steps[2].with.artifact_name,
    '${{ needs.quality.outputs.artifact }}',
  );
});

test('IndexNow runs only after a deploy and never blocks one', () => {
  const { build, quality, indexnow } = workflow.jobs;
  const step = build.steps.find(({ id }) => id === 'indexnow');
  assert.equal(step['continue-on-error'], true);
  assert.equal(
    step.if,
    "github.event_name == 'push' && github.ref == 'refs/heads/main'",
  );
  assert.ok(
    build.steps.indexOf(step) >
      build.steps.findIndex(({ run }) => run === 'pnpm build'),
  );
  assert.equal(build.outputs.indexnow, '${{ steps.indexnow.outputs.body }}');
  assert.equal(
    quality.outputs.indexnow,
    '${{ needs.build.outputs.indexnow || needs.reuse.outputs.indexnow }}',
  );
  assert.deepEqual(indexnow.needs, ['quality', 'deploy']);
  assert.match(indexnow.if, /needs\.deploy\.result == 'success'/);
  assert.equal(indexnow.permissions, undefined);
  assert.ok(indexnow.steps.every((s) => s['continue-on-error'] === true));
});

test('API failure or incomplete response blocks verification', () => {
  assert.throws(
    () =>
      verifyCurrentMain(valid, () => {
        throw new Error('gh API request failed');
      }),
    /gh API request failed/,
  );
  for (const response of ['', 'null', 'b'.repeat(40)]) {
    assert.throws(() => verifyCurrentMain(valid, () => response));
  }
  assert.doesNotThrow(() =>
    verifyCurrentMain(valid, (command, args) => {
      assert.equal(command, 'gh');
      assert.deepEqual(args, [
        'api',
        `repos/${valid.GITHUB_REPOSITORY}/git/ref/heads/main`,
        '--jq',
        '.object.sha',
      ]);
      return sha;
    }),
  );
});

test('main reuses a PR artifact only through the gated reuse chain', () => {
  const { reuse, quality, deploy } = workflow.jobs;
  assert.match(reuse.if, /github\.event_name == 'push'/);
  assert.match(reuse.if, /github\.ref == 'refs\/heads\/main'/);
  assert.match(reuse.if, /github\.repository == 'workingyuanyuan\//);
  assert.deepEqual(reuse.permissions, {
    contents: 'read',
    actions: 'read',
    'pull-requests': 'read',
  });
  const byId = Object.fromEntries(
    reuse.steps.filter((s) => s.id).map((s) => [s.id, s]),
  );
  // Each step runs only if the previous one succeeded, so any failure
  // leaves `hit` unset and the gates run.
  assert.equal(
    byId.receipt.if,
    "steps.find.outcome == 'success' && steps.find.outputs.run-id != ''",
  );
  assert.equal(byId.check.if, "steps.receipt.outcome == 'success'");
  assert.equal(byId.download.if, "steps.check.outcome == 'success'");
  assert.equal(byId.archive.if, "steps.download.outcome == 'success'");
  assert.match(byId.archive.run, /test -f reuse\/out\/index\.html/);
  assert.equal(byId.upload.if, "steps.archive.outcome == 'success'");
  assert.equal(byId.reused.if, "steps.upload.outcome == 'success'");
  assert.equal(byId.reused['continue-on-error'], undefined);
  assert.match(byId.reused.run, /hit=true/);
  assert.equal(byId.find.run, 'node scripts/find-verified-pr-build.mjs find');
  assert.match(byId.check.run, /find-verified-pr-build\.mjs check/);
  assert.equal(
    byId.receipt.with.name,
    'verified-build-${{ steps.find.outputs.attempt }}',
  );
  for (const step of [byId.receipt, byId.download])
    assert.equal(step.with['run-id'], '${{ steps.find.outputs.run-id }}');
  assert.equal(byId.download.with.name, '${{ steps.check.outputs.artifact }}');
  assert.equal(
    byId.upload.with.name,
    'github-pages-reused-${{ github.run_id }}-${{ github.run_attempt }}',
  );
  assert.match(
    byId.reused.run,
    /artifact=github-pages-reused-\$GITHUB_RUN_ID-\$GITHUB_RUN_ATTEMPT/,
  );
  // Never the name a fallback build in the same run uploads.
  assert.notEqual(
    byId.upload.with.name,
    workflow.jobs.build.steps.find((s) =>
      s.uses?.startsWith('actions/upload-pages-artifact@'),
    ).with.name,
  );
  assert.equal(byId.indexnow['timeout-minutes'], 2);
  assert.ok(byId.indexnow['timeout-minutes'] < reuse['timeout-minutes']);
  assert.equal(reuse.outputs.hit, '${{ steps.reused.outputs.hit }}');
  // quality accepts the reused artifact only with every gate skipped.
  const verified = quality.steps.find((s) => s.id === 'verified');
  const reused = verified.run.slice(0, verified.run.indexOf('else'));
  assert.ok(reused.includes('[ "$REUSE" = success ] && [ "$REUSED" = true ]'));
  for (const name of ['CHECKS', 'BUILD', 'E2E'])
    assert.ok(reused.includes(`test "$${name}" = skipped`), name);
  assert.ok(reused.includes('test -n "$REUSED_ARTIFACT"'));
  assert.match(deploy.if, /^!cancelled\(\) &&/);
});

const repo = 'workingyuanyuan/Frontier-Model-Doh-Choo-choo';
const head = 'c'.repeat(40);
const tree = 'd'.repeat(40);
const pr = {
  number: 7,
  merged_at: '2026-11-22T00:00:00Z',
  merge_commit_sha: sha,
  base: { ref: 'main', repo: { full_name: repo } },
  head: { sha: head, repo: { full_name: repo } },
};
const run = {
  id: 42,
  run_attempt: 2,
  event: 'pull_request',
  status: 'completed',
  conclusion: 'success',
  path: '.github/workflows/ci.yml',
  head_sha: head,
  head_repository: { full_name: repo },
  created_at: '2026-11-22T00:00:00Z',
};

test('only the same-repository PR this commit merged is used', () => {
  assert.equal(mergedPullRequest([pr], repo, sha), pr);
  for (const patch of [
    { merged_at: null },
    { merge_commit_sha: 'b'.repeat(40) },
    { base: { ref: 'topic', repo: { full_name: repo } } },
    { head: { sha: head, repo: { full_name: 'someone/fork' } } },
    { head: { sha: 'short', repo: { full_name: repo } } },
  ])
    assert.equal(
      mergedPullRequest([{ ...pr, ...patch }], repo, sha),
      undefined,
    );
});

test('only a passing CI run of that PR head is used, newest first', () => {
  const newer = { ...run, id: 43, created_at: '2026-11-22T01:00:00Z' };
  assert.equal(latestSuccessfulRun([run, newer], repo, head), newer);
  for (const patch of [
    { conclusion: 'failure' },
    { status: 'in_progress' },
    { event: 'push' },
    { path: '.github/workflows/workspace-timing.yml' },
    { head_sha: 'b'.repeat(40) },
    { head_repository: { full_name: 'someone/fork' } },
    { run_attempt: undefined },
  ])
    assert.equal(
      latestSuccessfulRun([{ ...run, ...patch }], repo, head),
      undefined,
    );
});

test('the receipt must name this tree and an artifact of that run', () => {
  const receipt = `tree=${tree}\nartifact=github-pages-42-2\n`;
  assert.equal(verifiedArtifact(receipt, tree, '42', '2'), 'github-pages-42-2');
  // A partial rerun keeps the earlier attempt's build.
  assert.equal(verifiedArtifact(receipt, tree, '42', '3'), 'github-pages-42-2');
  assert.throws(() => verifiedArtifact(receipt, tree, '42', '1'));
  assert.throws(() => verifiedArtifact(receipt, tree, '42', ''));
  for (const [text, at, id] of [
    [receipt, 'e'.repeat(40), '42'],
    [receipt, tree, '43'],
    [receipt, '', '42'],
    [receipt, tree, '42 '],
    [`tree=${tree}\n`, tree, '42'],
    [`${receipt}tree=${tree}\n`, tree, '42'],
    [`${receipt}extra=1\n`, tree, '42'],
    [`tree=${tree}\nartifact=github-pages-42-2-x\n`, tree, '42'],
    [`tree=${tree}\nartifact=github-pages-4-2\n`, tree, '42'],
    ['', tree, '42'],
  ])
    assert.throws(() => verifiedArtifact(text, at, id, '2'));
});
