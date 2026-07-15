import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { resolve } from 'node:path';

export type WeeklyRenderInput =
  | { readonly kind: 'DEFAULT_PREVIEW' }
  | { readonly kind: 'EDITION_PREVIEW'; readonly snapshotId: string };

export interface WeeklyRenderRuntime {
  readonly nodePath: string;
  readonly pnpmCliPath: string;
  readonly projectDirectory: string;
}

export interface WeeklyRenderInvocation {
  readonly command: string;
  readonly arguments: readonly string[];
  readonly options: {
    readonly cwd: string;
    readonly shell: false;
  };
}

const uuidV7Pattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/u;
const maxCapturedOutputBytes = 2 * 1024 * 1024;

export function createWeeklyRenderInvocation(
  runtime: WeeklyRenderRuntime,
  input: WeeklyRenderInput,
): readonly WeeklyRenderInvocation[] {
  if (
    input.kind === 'EDITION_PREVIEW' &&
    !uuidV7Pattern.test(input.snapshotId)
  ) {
    throw new Error('Weekly preview snapshot must be a UUIDv7');
  }
  const createInvocation = (
    arguments_: readonly string[],
  ): WeeklyRenderInvocation => ({
    command: runtime.nodePath,
    arguments: [runtime.pnpmCliPath, ...arguments_],
    options: { cwd: runtime.projectDirectory, shell: false },
  });
  return input.kind === 'DEFAULT_PREVIEW'
    ? [createInvocation(['video:still']), createInvocation(['video:artifacts'])]
    : [
        createInvocation([
          'video:edition',
          '--',
          '--snapshot',
          input.snapshotId,
          '--locale',
          'zh-TW',
          '--theme',
          'editorial',
          '--top',
          '5',
          '--media',
          'poster',
        ]),
      ];
}

async function runInvocation(
  invocation: WeeklyRenderInvocation,
): Promise<string> {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(invocation.command, invocation.arguments, {
      ...invocation.options,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    const stdout: Buffer[] = [];
    const stderr: Buffer[] = [];
    let capturedBytes = 0;
    const capture = (target: Buffer[], chunk: Buffer): void => {
      capturedBytes += chunk.byteLength;
      if (capturedBytes > maxCapturedOutputBytes) {
        child.kill();
        reject(new Error('Weekly render output exceeded the capture limit'));
        return;
      }
      target.push(chunk);
    };
    child.stdout.on('data', (chunk: Buffer) => capture(stdout, chunk));
    child.stderr.on('data', (chunk: Buffer) => capture(stderr, chunk));
    child.once('error', reject);
    child.once('exit', (code, signal) => {
      if (code === 0) {
        resolvePromise(Buffer.concat(stdout).toString('utf8'));
        return;
      }
      const detail = Buffer.concat(stderr)
        .toString('utf8')
        .trim()
        .slice(-2_000);
      reject(
        new Error(
          `Weekly render exited with ${code === null ? `signal ${String(signal)}` : `code ${code}`}${detail ? `: ${detail}` : ''}`,
        ),
      );
    });
  });
}

async function sha256File(path: string): Promise<string> {
  const hash = createHash('sha256');
  await new Promise<void>((resolvePromise, reject) => {
    const stream = createReadStream(path);
    stream.on('data', (chunk) => hash.update(chunk));
    stream.once('end', resolvePromise);
    stream.once('error', reject);
  });
  return hash.digest('hex');
}

function parseEditionOutput(output: string): unknown {
  const trimmed = output.trim();
  try {
    return JSON.parse(trimmed) as unknown;
  } catch {
    throw new Error('Edition preview renderer did not return JSON');
  }
}

export async function runWeeklyPreviewRender(
  runtime: WeeklyRenderRuntime,
  input: WeeklyRenderInput,
): Promise<unknown> {
  const outputs: string[] = [];
  for (const invocation of createWeeklyRenderInvocation(runtime, input)) {
    outputs.push(await runInvocation(invocation));
  }
  if (input.kind === 'EDITION_PREVIEW') {
    return parseEditionOutput(outputs[0] ?? '');
  }

  const posterPath = resolve(
    runtime.projectDirectory,
    'artifacts/llm-bench-weekly.png',
  );
  const metadataPath = resolve(
    runtime.projectDirectory,
    'output/llm-bench-weekly.metadata.json',
  );
  const rankingCsvPath = resolve(
    runtime.projectDirectory,
    'output/llm-bench-weekly.ranking.csv',
  );
  return {
    kind: input.kind,
    posterPath: 'artifacts/llm-bench-weekly.png',
    posterSha256: await sha256File(posterPath),
    metadataPath: 'output/llm-bench-weekly.metadata.json',
    metadataSha256: await sha256File(metadataPath),
    rankingCsvPath: 'output/llm-bench-weekly.ranking.csv',
    rankingCsvSha256: await sha256File(rankingCsvPath),
  };
}
