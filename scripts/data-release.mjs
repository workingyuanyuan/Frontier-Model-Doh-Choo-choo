/**
 * `pnpm data:release`: the one command that turns imported source snapshots
 * into a verified static dashboard (OPERATIONS §3–7). It stops at the first
 * failure and always leaves a receipt under artifacts/releases/<run-id>/.
 * A complete receipt means mechanically verified, not accepted: committing
 * current.json still waits for the user's review (OPERATIONS §6).
 *
 * Usage: node scripts/data-release.mjs
 */
import { spawn, execFileSync } from 'node:child_process';
import {
  closeSync,
  copyFileSync,
  createWriteStream,
  existsSync,
  mkdirSync,
  openSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import {
  CONSUMED_MAPPINGS,
  LATEST_RECEIPT,
  RELEASE_OUTPUTS,
  RELEASES_DIR,
  computeReleaseState,
  exportDigest,
  validateActiveSources,
} from './release-state.mjs';
import {
  defaultPresetInferences,
  diffProducts,
  renderReleaseMarkdown,
} from './release-report.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const readJson = (path) => JSON.parse(readFileSync(join(root, path), 'utf8'));

const writeJsonAtomic = (path, value) => {
  const absolute = join(root, path);
  mkdirSync(dirname(absolute), { recursive: true });
  writeFileSync(`${absolute}.tmp`, `${JSON.stringify(value, null, 2)}\n`);
  renameSync(`${absolute}.tmp`, absolute);
};

const git = (...args) =>
  execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();

/** Outer audit status decides; nested gapAudit is informational (§3). */
const assertAuditSelected = () => {
  const audit = readJson('data/mappings/frontier-selection-audit.json');
  if (audit.status !== 'selected') {
    throw new Error(
      `frontier-selection-audit.json status is ${audit.status}, not selected`,
    );
  }
};

const assertExportVersion = () => {
  const { versionId } = readJson('data/product/current.json');
  const index = join(root, 'apps/bench/out/index.html');
  if (!existsSync(index) || !readFileSync(index, 'utf8').includes(versionId)) {
    throw new Error(`apps/bench/out/index.html does not show ${versionId}`);
  }
};

const STEPS = [
  {
    id: 'sources',
    title: 'Validate active source snapshots and their artifacts',
    run: () => {
      const { issues } = validateActiveSources(root);
      if (issues.length > 0) throw new Error(issues.join('\n'));
    },
  },
  {
    id: 'evidence',
    title: 'Verify the evidence store',
    command: ['pnpm', '-s', 'evidence', 'verify'],
  },
  {
    id: 'frontier',
    title: 'Generate the AA frontier set',
    command: ['pnpm', 'data:generate-frontier-set'],
    after: assertAuditSelected,
  },
  {
    id: 'product',
    title: 'Build data/product/current.json',
    command: ['pnpm', 'data:build-current'],
    after: assertAuditSelected,
  },
  {
    id: 'fresh',
    title: 'Confirm the product reproduces from its inputs',
    command: ['pnpm', 'data:verify-fresh'],
  },
  {
    // Some unit tests assert the saved snapshot (top ten, preset sizes); CI
    // runs them too, so a release that skipped them could not be committed.
    id: 'tests',
    title: 'Run unit tests against the rebuilt data',
    command: ['pnpm', 'test'],
  },
  {
    id: 'site',
    title: 'Build the static dashboard',
    command: ['pnpm', '--filter', '@llm-bench/bench', 'build'],
    after: assertExportVersion,
  },
  {
    id: 'e2e',
    title: 'Run browser and accessibility tests on this export',
    command: ['pnpm', 'e2e'],
    // Never reuse a server that may be serving another build.
    env: { DATA_RELEASE: '1' },
  },
];

/** Resolves with the exit code; spawn or log failures reject into the step. */
const runCommand = (command, env, logPath) =>
  new Promise((resolvePromise, rejectPromise) => {
    let settled = false;
    const settle = (callback) => {
      if (settled) return;
      settled = true;
      callback();
    };
    const log = createWriteStream(logPath);
    log.on('error', (error) => settle(() => rejectPromise(error)));
    const child = spawn(command[0], command.slice(1), {
      cwd: root,
      env: { ...process.env, ...env },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    child.on('error', (error) => settle(() => rejectPromise(error)));
    child.stdout.pipe(log, { end: false });
    child.stderr.pipe(log, { end: false });
    child.on('close', (code) => {
      log.end(() => settle(() => resolvePromise(code ?? 1)));
    });
  });

const tail = (path, lines = 25) =>
  existsSync(path)
    ? readFileSync(path, 'utf8').trimEnd().split('\n').slice(-lines).join('\n')
    : '';

const isAlive = (pid) => {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
};

/**
 * Creates the lock exclusively with this pid. A stale lock (its process has
 * exited) is moved aside atomically first, so of two runners recovering the
 * same stale lock only one can then create the new one.
 */
const acquireLock = () => {
  const path = join(root, RELEASES_DIR, '.lock');
  mkdirSync(dirname(path), { recursive: true });
  const create = () => {
    const fd = openSync(path, 'wx');
    writeFileSync(fd, String(process.pid));
    closeSync(fd);
  };
  try {
    create();
  } catch {
    const pid = Number(readFileSync(path, 'utf8'));
    if (isAlive(pid)) {
      throw new Error(`Another data release is running (pid ${pid})`);
    }
    const stale = `${path}.stale-${process.pid}`;
    renameSync(path, stale);
    rmSync(stale, { force: true });
    create();
  }
  return () => {
    if (readFileSync(path, 'utf8') === String(process.pid)) {
      rmSync(path, { force: true });
    }
  };
};

const saveBaseline = (directory) => {
  mkdirSync(directory, { recursive: true });
  for (const path of [...RELEASE_OUTPUTS, ...CONSUMED_MAPPINGS]) {
    const from = join(root, path);
    if (existsSync(from)) {
      copyFileSync(from, join(directory, path.replaceAll('/', '__')));
    }
  }
  writeFileSync(
    join(directory, 'git-status.txt'),
    git('status', '--porcelain=v1'),
  );
};

export const runRelease = async () => {
  const releaseLock = acquireLock();
  const startedAt = new Date().toISOString();
  const runId = startedAt.replace(/[:.]/gu, '-');
  const runDir = `${RELEASES_DIR}/${runId}`;
  mkdirSync(join(root, runDir, 'logs'), { recursive: true });
  const baselineDir = `${runDir}/baseline`;
  saveBaseline(join(root, baselineDir));

  // Compare with the committed product: a failed earlier run may already have
  // rewritten the working copy, which would hide this run's changes.
  let previous = null;
  try {
    previous = JSON.parse(
      execFileSync('git', ['show', 'HEAD:data/product/current.json'], {
        cwd: root,
        encoding: 'utf8',
        maxBuffer: 256 * 1024 * 1024,
        stdio: ['ignore', 'pipe', 'ignore'],
      }),
    );
  } catch {
    try {
      previous = readJson('data/product/current.json');
    } catch {
      // A missing or unreadable product still gets rebuilt; the diff is skipped.
    }
  }
  const startState = computeReleaseState(root);
  const receipt = {
    schemaVersion: 'data-release-receipt-v1',
    runId,
    status: 'running',
    review: 'pending-user-review',
    failedStep: null,
    error: null,
    head: git('rev-parse', 'HEAD'),
    startedAt,
    finishedAt: null,
    baselineDir,
    previousVersionId: previous?.versionId ?? null,
    versionId: null,
    basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? '',
    steps: [],
    ...startState,
    exportDigest: null,
  };
  const persist = () => {
    writeJsonAtomic(`${runDir}/receipt.json`, receipt);
    writeJsonAtomic(LATEST_RECEIPT, receipt);
  };
  persist();

  // Outputs are pinned once the freshness check passes and the export once it
  // is built; e2e and completion must still see exactly those files.
  let verifiedOutputs = null;
  let builtExport = null;
  try {
    for (const step of STEPS) {
      console.log(`▶ ${step.id}: ${step.title}`);
      const started = Date.now();
      const log = step.command ? `${runDir}/logs/${step.id}.log` : null;
      let exitCode = 0;
      let error = null;
      try {
        if (step.command) {
          exitCode = await runCommand(
            step.command,
            step.env ?? {},
            join(root, log),
          );
          if (exitCode !== 0) {
            error = `${step.command.join(' ')} exited ${exitCode}`;
          }
        } else {
          step.run();
        }
        if (error === null) step.after?.();
      } catch (caught) {
        error = caught instanceof Error ? caught.message : String(caught);
        if (exitCode === 0) exitCode = 1;
      }
      receipt.steps.push({
        id: step.id,
        command: step.command?.join(' ') ?? null,
        exitCode,
        ms: Date.now() - started,
        log,
      });
      if (error !== null) {
        receipt.failedStep = step.id;
        receipt.error = error;
        throw new Error(`${step.id} failed: ${error}`);
      }
      if (step.id === 'fresh') {
        verifiedOutputs = computeReleaseState(root).outputsDigest;
      }
      if (step.id === 'site') builtExport = exportDigest(root);
      persist();
    }

    const endState = computeReleaseState(root);
    const drift = [
      endState.inputsDigest !== startState.inputsDigest && 'inputs',
      endState.implementationDigest !== startState.implementationDigest &&
        'implementation',
      endState.outputsDigest !== verifiedOutputs && 'product outputs',
      exportDigest(root) !== builtExport && 'static export',
    ].filter(Boolean);
    if (drift.length > 0) {
      receipt.failedStep = 'stability';
      receipt.error = `${drift.join(', ')} changed while the release was running`;
      throw new Error(receipt.error);
    }
    Object.assign(receipt, endState);
    receipt.versionId = readJson('data/product/current.json').versionId;
    receipt.exportDigest = builtExport;
    receipt.status = 'complete';
  } catch (error) {
    receipt.status = 'failed';
    receipt.error ??= error instanceof Error ? error.message : String(error);
    try {
      // Bind the failure to the files as they are, so it can be handed over.
      Object.assign(receipt, computeReleaseState(root));
    } catch {
      // Unreadable inputs keep the start digests; the stop gate stays closed.
    }
  } finally {
    receipt.finishedAt = new Date().toISOString();
    let diff = null;
    let inferences = [];
    let skipped = [];
    if (receipt.status === 'complete' && previous !== null) {
      const next = readJson('data/product/current.json');
      diff = diffProducts(previous, next);
      inferences = defaultPresetInferences(root, next);
      skipped =
        readJson('data/mappings/frontier-set.json').eligibility?.skipped ?? [];
      writeJsonAtomic(`${runDir}/diff.json`, { diff, inferences, skipped });
    }
    writeFileSync(
      join(root, runDir, 'report.md'),
      renderReleaseMarkdown({ receipt, diff, inferences, skipped }),
    );
    persist();
    releaseLock();
  }
  return { receipt, runDir };
};

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const { receipt, runDir } = await runRelease();
  if (receipt.status === 'complete') {
    console.log(
      [
        '',
        `✔ Release complete: ${receipt.versionId}`,
        `  Receipt: ${runDir}/receipt.json`,
        `  Change report: ${runDir}/report.md`,
        '  Next: write docs/refresh/<date>.md from the change report and have another',
        '  agent spot-check it (OPERATIONS §6). Commit and open a PR only when there are',
        '  no significant changes; otherwise stop for user review.',
      ].join('\n'),
    );
  } else {
    const failed = receipt.steps.at(-1);
    console.error(
      [
        '',
        `✘ Release failed at ${receipt.failedStep}: ${receipt.error}`,
        failed?.log ? tail(join(root, failed.log)) : '',
        `  Receipt: ${runDir}/receipt.json`,
        '  Fix the cause and rerun `pnpm data:release`, or hand the failure to the user.',
      ].join('\n'),
    );
    process.exitCode = 1;
  }
}
