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

test('workflow ties every required gate to the uploaded output and SHA', () => {
  assert.deepEqual(Object.keys(workflow.on).sort(), ['pull_request', 'push']);
  assert.deepEqual(workflow.on.push.branches, ['main']);
  assert.equal(existsSync('.github/workflows/pages.yml'), false);
  assert.deepEqual(workflow.permissions, { contents: 'read' });
  const { quality, deploy } = workflow.jobs;
  assert.equal(quality['continue-on-error'], undefined);
  assert.equal(deploy.needs, 'quality');
  const steps = quality.steps;
  const gates = [
    'pnpm audit --audit-level high',
    'pnpm format',
    'pnpm lint',
    'pnpm typecheck',
    'pnpm test',
    'pnpm build',
    'pnpm e2e',
  ].map((command) => {
    const index = steps.findIndex((step) => step.run === command);
    assert.ok(index >= 0, `Required gate: ${command}`);
    assert.equal(steps[index].if, undefined, `${command} cannot be skipped`);
    assert.equal(steps[index]['continue-on-error'], undefined);
    return index;
  });
  const verified = steps.findIndex((step) => step.id === 'verified');
  const upload = steps.findIndex((step) =>
    step.uses?.startsWith('actions/upload-pages-artifact@'),
  );
  assert.ok(gates.every((index) => index < verified));
  assert.ok(verified < upload);
  for (const index of [verified, upload]) {
    assert.equal(steps[index].if, undefined);
    assert.equal(steps[index]['continue-on-error'], undefined);
  }
  assert.match(steps[verified].run, /touch apps\/bench\/out\/\.nojekyll/);
  assert.match(steps[verified].run, /sha=\$GITHUB_SHA/);
  assert.match(steps[verified].run, /GITHUB_RUN_ID-\$GITHUB_RUN_ATTEMPT/);
  assert.equal(steps[upload].with.path, 'apps/bench/out');
  assert.equal(
    steps[upload].with.name,
    '${{ steps.verified.outputs.artifact }}',
  );
  assert.equal(quality.outputs.sha, '${{ steps.verified.outputs.sha }}');
  assert.equal(
    quality.outputs.artifact,
    '${{ steps.verified.outputs.artifact }}',
  );
  assert.equal(
    quality.env.NEXT_PUBLIC_BASE_PATH,
    "${{ format('/{0}', github.event.repository.name) }}",
  );
  assert.equal(steps[0].with.ref, '${{ github.sha }}');
  assert.equal(deploy.steps[0].with.ref, '${{ github.sha }}');
  assert.equal(workflow.concurrency, undefined);
  assert.deepEqual(deploy.concurrency, {
    group: 'pages',
    'cancel-in-progress': false,
  });
  assert.deepEqual(deploy.permissions, {
    contents: 'read',
    pages: 'write',
    'id-token': 'write',
  });
  assert.equal(quality.permissions, undefined);
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
