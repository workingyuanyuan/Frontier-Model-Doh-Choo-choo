import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { parse } from 'yaml';
import {
  verifyCurrentMain,
  verifyDeployment,
} from './verify-pages-deployment.mjs';

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
    assert.equal(job.if, undefined);
    assert.equal(job.permissions, undefined);
    assert.equal(job.steps[0].with.ref, '${{ github.sha }}');
  }
  assert.equal(e2e.needs, 'build');
  assert.deepEqual(e2e.strategy.matrix.shard, [1, 2, 3]);
  assert.deepEqual(quality.needs, ['checks', 'build', 'e2e']);
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
  assert.equal(quality.steps.length, 2);
  const [receipts, verified] = quality.steps;
  assert.ok(receipts.uses.startsWith('actions/download-artifact@'));
  assert.equal(receipts.with.pattern, 'e2e-receipt-*');
  assert.equal(verified.id, 'verified');
  for (const step of quality.steps) {
    assert.equal(step.if, undefined);
    assert.equal(step['continue-on-error'], undefined);
  }
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
  const { checks, build, e2e, quality, deploy } = workflow.jobs;
  // A workflow-wide cancel would also cancel a deploy already running.
  assert.equal(workflow.concurrency, undefined);
  const groups = [checks, build, e2e].map((job) => job.concurrency.group);
  assert.equal(new Set(groups).size, groups.length);
  assert.match(e2e.concurrency.group, /matrix\.shard/);
  assert.equal(quality.concurrency, undefined);
  assert.deepEqual(deploy.concurrency, {
    group: 'pages',
    'cancel-in-progress': false,
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
  assert.equal(quality.outputs.indexnow, '${{ needs.build.outputs.indexnow }}');
  assert.deepEqual(indexnow.needs, ['quality', 'deploy']);
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
