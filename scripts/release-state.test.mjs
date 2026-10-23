import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

import {
  computeReleaseState,
  isReleaseRelevantPath,
  parsePorcelainZ,
  receiptMatches,
  validateActiveSources,
} from './release-state.mjs';
import { evaluateStopGate } from './agent-stop-gate.mjs';

const sha = (bytes) =>
  `sha256:${createHash('sha256').update(bytes).digest('hex')}`;

const workspace = async () => {
  const root = await mkdtemp(join(tmpdir(), 'release-state-'));
  const write = async (path, value) => {
    await mkdir(join(root, path, '..'), { recursive: true });
    await writeFile(
      join(root, path),
      typeof value === 'string' ? value : JSON.stringify(value),
    );
  };
  const artifact = 'raw leaderboard bytes';
  const artifactPath = `artifacts/sha256/ab/${sha(artifact).slice(7)}.html`;
  await write(artifactPath, artifact);
  await write('data/mappings/sources.json', { whitelist: ['demo'] });
  await write('data/mappings/models.json', { models: [] });
  await write('data/sources/demo/manifest.json', {
    lastVerifiedAt: '2026-10-23T00:00:00.000Z',
  });
  await write('data/sources/demo/evidence-index.json', [
    {
      id: sha(artifact),
      sha256: sha(artifact),
      byteLength: artifact.length, // ASCII, so characters equal bytes
      artifactPath,
    },
  ]);
  await write('data/sources/demo/candidates.json', [
    { evidenceIds: [sha(artifact)] },
  ]);
  await write('data/product/current.json', { versionId: 'sha256:one' });
  return { root, write, artifactPath };
};

test('digests change with inputs, outputs and scoring code', async () => {
  const { root, write } = await workspace();
  try {
    const base = computeReleaseState(root);
    await write('data/sources/demo/candidates.json', []);
    const input = computeReleaseState(root);
    assert.notEqual(input.inputsDigest, base.inputsDigest);
    assert.equal(input.outputsDigest, base.outputsDigest);

    await write('data/product/current.json', { versionId: 'sha256:two' });
    assert.notEqual(
      computeReleaseState(root).outputsDigest,
      base.outputsDigest,
    );

    await write('packages/benchmark-data/src/scoring.ts', 'export {}');
    const code = computeReleaseState(root);
    assert.notEqual(code.implementationDigest, base.implementationDigest);
    await write('packages/benchmark-data/src/scoring.test.ts', 'test');
    assert.equal(
      computeReleaseState(root).implementationDigest,
      code.implementationDigest,
    );

    for (const path of [
      'scripts/data-release.mjs',
      'playwright.config.ts',
      'apps/bench/e2e/dashboard.spec.ts',
    ]) {
      const before = computeReleaseState(root).implementationDigest;
      await write(path, `// ${path}`);
      assert.notEqual(
        computeReleaseState(root).implementationDigest,
        before,
        path,
      );
    }
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('source validation reports missing evidence and altered artifacts', async () => {
  const { root, write, artifactPath } = await workspace();
  try {
    assert.deepEqual(validateActiveSources(root).issues, []);
    await write('data/sources/demo/candidates.json', [
      { evidenceIds: ['sha256:missing'] },
    ]);
    await write(artifactPath, 'raw leaderboard bytez');
    const { issues } = validateActiveSources(root);
    assert.match(issues[0], /cites missing Evidence: sha256:missing/u);
    assert.match(issues[1], /SHA-256 differs/u);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('only consumed data and non-test scoring code are release relevant', () => {
  for (const path of [
    'data/product/current.json',
    'data/mappings/models.json',
    'data/mappings/frontier-set.json',
    'data/sources/vals-ai/candidates.json',
    'packages/benchmark-data/src/index.ts',
  ]) {
    assert.equal(isReleaseRelevantPath('.', path), true, path);
  }
  for (const path of [
    'data/sources/vals-ai/validation-report.md',
    'data/mappings/source-monitoring.json',
    'data/source-monitoring/REPORT.md',
    'packages/benchmark-data/src/index.test.ts',
    'docs/OPERATIONS.md',
  ]) {
    assert.equal(isReleaseRelevantPath('.', path), false, path);
  }
});

test('porcelain parsing keeps both sides of a rename', () => {
  assert.deepEqual(
    parsePorcelainZ(
      ' M data/mappings/models.json\0R  new.json\0data/sources/x/candidates.json\0?? AGENTS.md\0',
    ),
    [
      'data/mappings/models.json',
      'new.json',
      'data/sources/x/candidates.json',
      'AGENTS.md',
    ],
  );
});

test('stop gate blocks until a receipt matches the workspace', () => {
  const state = {
    inputsDigest: 'sha256:i',
    outputsDigest: 'sha256:o',
    implementationDigest: 'sha256:c',
  };
  const changedPaths = ['data/mappings/models.json'];
  assert.equal(
    evaluateStopGate({ changedPaths: [], receipt: null, state }).block,
    false,
  );
  const missing = evaluateStopGate({ changedPaths, receipt: null, state });
  assert.equal(missing.block, true);
  assert.match(missing.reason, /pnpm data:release/u);

  const stale = {
    ...state,
    runId: 'r1',
    status: 'complete',
    outputsDigest: 'x',
  };
  assert.equal(receiptMatches(stale, state), false);
  assert.equal(
    evaluateStopGate({ changedPaths, receipt: stale, state }).block,
    true,
  );
  for (const status of ['complete', 'failed']) {
    assert.equal(
      evaluateStopGate({
        changedPaths,
        receipt: { ...state, runId: 'r2', status },
        state,
      }).block,
      false,
    );
  }
});

test('an unfinished receipt never satisfies the gate', () => {
  const state = {
    inputsDigest: 'sha256:i',
    outputsDigest: 'sha256:o',
    implementationDigest: 'sha256:c',
  };
  for (const status of ['running', 'unknown', undefined]) {
    assert.equal(receiptMatches({ ...state, status }, state), false, status);
    assert.equal(
      evaluateStopGate({
        changedPaths: ['data/mappings/models.json'],
        receipt: { ...state, runId: 'r', status },
        state,
      }).block,
      true,
    );
  }
});

test('the stop hook blocks when release inputs cannot be read', async () => {
  const root = await mkdtemp(join(tmpdir(), 'stop-gate-'));
  try {
    execFileSync('git', ['init', '-q'], { cwd: root });
    await mkdir(join(root, 'data/mappings'), { recursive: true });
    await writeFile(join(root, 'data/mappings/sources.json'), '{ not json');
    const gate = resolve(import.meta.dirname, 'agent-stop-gate.mjs');
    const run = (input) =>
      execFileSync(process.execPath, [gate], {
        env: { ...process.env, CLAUDE_PROJECT_DIR: root },
        input: JSON.stringify(input),
        encoding: 'utf8',
      });
    const blocked = JSON.parse(run({}));
    assert.equal(blocked.decision, 'block');
    assert.match(blocked.reason, /Cannot read the release inputs/u);
    const released = JSON.parse(run({ stop_hook_active: true }));
    assert.equal(released.decision, undefined);
    assert.match(released.systemMessage, /Data release still missing/u);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
