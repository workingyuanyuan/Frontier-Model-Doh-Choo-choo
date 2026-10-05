import { createHash } from 'node:crypto';
import { createWriteStream } from 'node:fs';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { cpus, freemem, loadavg, platform, release, totalmem } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { performance } from 'node:perf_hooks';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const options = { iterations: '10', output: 'artifacts/workspace-timing' };
for (let index = 2; index < process.argv.length; index += 2) {
  const key = process.argv[index]?.replace(/^--/u, '');
  const value = process.argv[index + 1];
  if (!Object.hasOwn(options, key) || !value) {
    throw new Error(
      'Usage: node scripts/measure-workspace-tests.mjs [--iterations N] [--output DIRECTORY]',
    );
  }
  options[key] = value;
}
const outputRoot = resolve(root, options.output);
const windows = process.platform === 'win32';
const pnpmProbe = spawnSync('pnpm', ['--version'], {
  cwd: root,
  encoding: 'utf8',
  shell: false,
  windowsHide: true,
});
const pnpmShell = windows && pnpmProbe.error?.code === 'ENOENT';
if (!pnpmShell && pnpmProbe.status !== 0) {
  throw pnpmProbe.error ?? new Error(pnpmProbe.stderr);
}
const pnpm = pnpmShell ? 'pnpm.cmd' : 'pnpm';
const repetitions = Number(options.iterations);
if (!Number.isSafeInteger(repetitions) || repetitions < 1) {
  throw new Error('--iterations must be a positive integer');
}
const commands = [
  {
    mode: 'target',
    args: [
      '--filter',
      '@llm-bench/benchmark-data',
      'exec',
      'vitest',
      'run',
      'src/workspace.test.ts',
      '-t',
      'preserves every existing preset and cost with the real FrontierSWE V2 snapshot',
    ],
  },
  {
    mode: 'workspace-file',
    args: [
      '--filter',
      '@llm-bench/benchmark-data',
      'exec',
      'vitest',
      'run',
      'src/workspace.test.ts',
    ],
  },
  { mode: 'full-suite', args: ['test'] },
];

// Only fixed command arguments enter the Windows shell required by pnpm.cmd.
const commandArgs = (args) =>
  pnpmShell ? args.map((arg) => (/\s/u.test(arg) ? `"${arg}"` : arg)) : args;
const version = (command, args, shell = false) => {
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: 'utf8',
    shell,
    windowsHide: true,
  });
  if (result.status !== 0) throw result.error ?? new Error(result.stderr);
  return result.stdout.trim();
};

async function dataDigest(directory, relative = '') {
  const entries = await readdir(directory, { withFileTypes: true });
  const hash = createHash('sha256');
  let files = 0;
  let bytes = 0;
  for (const entry of entries.sort((a, b) =>
    a.name < b.name ? -1 : a.name > b.name ? 1 : 0,
  )) {
    const name = relative ? `${relative}/${entry.name}` : entry.name;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      const nested = await dataDigest(path, name);
      hash.update(name).update('\0').update(nested.sha256).update('\0');
      files += nested.files;
      bytes += nested.bytes;
    } else if (entry.isFile()) {
      const content = await readFile(path);
      hash
        .update(name)
        .update('\0')
        .update(String(content.length))
        .update('\0');
      hash.update(content).update('\0');
      files += 1;
      bytes += content.length;
    } else {
      throw new Error(`Unsupported data entry: ${path}`);
    }
  }
  return {
    algorithm: 'sha256-path-length-content-tree',
    sha256: hash.digest('hex'),
    files,
    bytes,
  };
}

const median = (values) => {
  const sorted = values.toSorted((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2;
};

async function hostCpuSnapshot() {
  if (process.platform !== 'linux') return null;
  try {
    const line = (await readFile('/proc/stat', 'utf8')).split('\n')[0];
    const values = line.trim().split(/\s+/u).slice(1).map(Number);
    // Guest time is already included in user/nice; exclude it from the total.
    return {
      totalTicks: values.slice(0, 8).reduce((a, b) => a + b, 0),
      iowaitTicks: values[4],
    };
  } catch {
    return null;
  }
}

await mkdir(outputRoot, { recursive: true });
const generatedPaths = [
  'frontier-set.json',
  'frontier-selection-audit.json',
].map((name) => join(root, 'data/mappings', name));
const originals = await Promise.all(
  generatedPaths.map((path) => readFile(path)),
);
const restoreGeneratedFiles = () =>
  Promise.all(
    generatedPaths.map((path, index) => writeFile(path, originals[index])),
  );
const cpuModels = [...new Set(cpus().map(({ model }) => model))];
const report = {
  startedAt: new Date().toISOString(),
  gitSha: version('git', ['rev-parse', 'HEAD']),
  gitStatusBefore: version('git', ['status', '--porcelain']),
  data: await dataDigest(join(root, 'data')),
  environment: {
    node: process.version,
    pnpm: pnpmShell
      ? version(pnpm, ['--version'], true)
      : pnpmProbe.stdout.trim(),
    platform: platform(),
    osRelease: release(),
    arch: process.arch,
    cpuModels,
    logicalCpuCount: cpus().length,
    totalMemoryBytes: totalmem(),
    runner: Object.fromEntries(
      [
        'CI',
        'GITHUB_RUN_ID',
        'GITHUB_RUN_ATTEMPT',
        'GITHUB_SHA',
        'RUNNER_OS',
        'RUNNER_ARCH',
        'RUNNER_NAME',
        'ImageOS',
        'ImageVersion',
      ].map((key) => [key, process.env[key] ?? null]),
    ),
  },
  repetitions,
  processPolicy:
    'Every command starts a fresh process. First-process and repeated-process labels describe run order; OS cache state is uncontrolled.',
  cpuPolicy:
    'harnessCpu measures this orchestration process only; test stages report their own process CPU. Child aggregate CPU and I/O wait are not measured.',
  hostCpuPolicy:
    'Linux /proc/stat deltas cover all host CPUs and processes. Iowait is host-wide and cannot be attributed to this test; kernel iowait accounting can decrease. Stage fsRead/fsWrite are OS resource usage operation counters, not byte counts.',
  runs: [],
  modes: {},
};

async function saveReport() {
  report.modes = Object.fromEntries(
    commands.map(({ mode }) => {
      const runs = report.runs.filter((run) => run.mode === mode);
      const times = runs.map((run) => run.wallMs);
      const testTimes = runs
        .map((run) => run.testStageTotalMs)
        .filter((value) => value !== null);
      return [
        mode,
        {
          completed: runs.length,
          failures: runs.filter(
            (run) => run.exitCode !== 0 || run.signal || run.error,
          ).length,
          medianWallMs: times.length ? median(times) : null,
          maxWallMs: times.length ? Math.max(...times) : null,
          medianTestStageTotalMs: testTimes.length ? median(testTimes) : null,
          maxTestStageTotalMs: testTimes.length ? Math.max(...testTimes) : null,
          instrumentationFailures: runs.filter((run) => run.phaseErrors.length)
            .length,
        },
      ];
    }),
  );
  await writeFile(
    join(outputRoot, 'summary.json'),
    `${JSON.stringify(report, null, 2)}\n`,
  );
}

try {
  await saveReport();
  for (const { mode, args } of commands) {
    for (let index = 1; index <= repetitions; index += 1) {
      const stem = `${mode}-${String(index).padStart(2, '0')}`;
      const phasePath = join(outputRoot, `${stem}.jsonl`);
      const logPath = join(outputRoot, `${stem}.log`);
      await writeFile(phasePath, '');
      const log = createWriteStream(logPath);
      const hostCpuBefore = await hostCpuSnapshot();
      const cpuStart = process.cpuUsage();
      const started = performance.now();
      const result = await new Promise((resolveRun) => {
        const child = spawn(pnpm, commandArgs(args), {
          cwd: root,
          env: {
            ...process.env,
            CI: 'true',
            WORKSPACE_TIMING_OUTPUT: phasePath,
          },
          shell: pnpmShell,
          windowsHide: true,
          stdio: ['ignore', 'pipe', 'pipe'],
        });
        child.stdout.pipe(log, { end: false });
        child.stderr.pipe(log, { end: false });
        let error = null;
        child.on('error', (failure) => {
          error = failure.message;
        });
        child.on('close', (exitCode, signal) =>
          resolveRun({ exitCode, signal, error }),
        );
      });
      const wallMs = performance.now() - started;
      const cpu = process.cpuUsage(cpuStart);
      const hostCpuAfter = await hostCpuSnapshot();
      await new Promise((resolveLog, rejectLog) => {
        log.on('error', rejectLog);
        log.end(resolveLog);
      });
      const phaseLines = (await readFile(phasePath, 'utf8')).trim();
      const phases = [];
      const phaseErrors = [];
      for (const line of phaseLines ? phaseLines.split('\n') : []) {
        try {
          phases.push(JSON.parse(line));
        } catch (error) {
          phaseErrors.push(error.message);
        }
      }
      const stages = phases[0]?.stages;
      const validStages =
        Array.isArray(stages) &&
        stages.length > 0 &&
        stages.every(({ wallMs }) => Number.isFinite(wallMs));
      if (!validStages)
        phaseErrors.push('Missing or invalid workspace test stage records');
      report.runs.push({
        mode,
        repetition: index,
        processOrder: report.runs.length + 1,
        processLabel:
          index === 1 ? 'first-process-in-mode' : 'repeated-process-in-mode',
        command: [pnpm, ...args],
        wallMs,
        ...result,
        harnessCpu: { userMs: cpu.user / 1000, systemMs: cpu.system / 1000 },
        runnerSnapshot: { loadAverage: loadavg(), freeMemoryBytes: freemem() },
        log: `${stem}.log`,
        phaseLog: `${stem}.jsonl`,
        phases,
        phaseErrors,
        testStageTotalMs: validStages
          ? stages.reduce((total, stage) => total + stage.wallMs, 0)
          : null,
        hostCpu:
          hostCpuBefore && hostCpuAfter
            ? {
                before: hostCpuBefore,
                after: hostCpuAfter,
                totalTicksDelta:
                  hostCpuAfter.totalTicks - hostCpuBefore.totalTicks,
                iowaitTicksDelta:
                  hostCpuAfter.iowaitTicks - hostCpuBefore.iowaitTicks,
              }
            : null,
      });
      await restoreGeneratedFiles();
      await saveReport();
      console.log(
        `${stem}: ${result.exitCode === 0 ? 'passed' : 'failed'} (${Math.round(wallMs)}ms)`,
      );
    }
  }
} finally {
  await restoreGeneratedFiles();
  report.finishedAt = new Date().toISOString();
  report.gitStatusAfter = version('git', ['status', '--porcelain']);
  await saveReport();
}
if (
  report.runs.some(
    ({ exitCode, error, phaseErrors }) =>
      exitCode !== 0 || error || phaseErrors.length,
  )
) {
  process.exitCode = 1;
}
