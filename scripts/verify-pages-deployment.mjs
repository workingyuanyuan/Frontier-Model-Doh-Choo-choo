import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export function verifyDeployment(env, currentMainSha) {
  assert.equal(env.GITHUB_EVENT_NAME, 'push', 'Only main pushes may deploy');
  assert.equal(
    env.GITHUB_REPOSITORY,
    'workingyuanyuan/Frontier-Model-Doh-Choo-choo',
    'Only the trusted repository may deploy',
  );
  assert.equal(env.GITHUB_REF, 'refs/heads/main');
  assert.equal(env.QUALITY_RESULT, 'success', 'All quality gates must succeed');
  assert.match(env.GITHUB_SHA ?? '', /^[a-f0-9]{40}$/);
  assert.equal(
    env.VERIFIED_SHA,
    env.GITHUB_SHA,
    'Artifact SHA must match this run',
  );
  assert.match(
    currentMainSha ?? '',
    /^[a-f0-9]{40}$/,
    'Main SHA must be available',
  );
  assert.equal(currentMainSha, env.GITHUB_SHA, 'Stale runs must not deploy');
}

export function verifyCurrentMain(env, execute = execFileSync) {
  // A failed API request throws before deployment, including on a rerun.
  const mainSha = execute(
    'gh',
    [
      'api',
      `repos/${env.GITHUB_REPOSITORY}/git/ref/heads/main`,
      '--jq',
      '.object.sha',
    ],
    { encoding: 'utf8' },
  ).trim();
  verifyDeployment(env, mainSha);
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  verifyCurrentMain(process.env);
  const message = `Deploying verified SHA: ${process.env.VERIFIED_SHA}\n`;
  console.log(message.trim());
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, message);
}
