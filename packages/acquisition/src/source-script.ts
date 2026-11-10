import { spawn } from 'node:child_process';

export const runSourceScript = (
  script: string,
  args: readonly string[],
): Promise<{ code: number; signal: NodeJS.Signals | null }> =>
  new Promise<{
    code: number;
    signal: NodeJS.Signals | null;
  }>((resolveResult, reject) => {
    const child = spawn(
      process.execPath,
      ['--import', 'tsx', script, ...args],
      {
        cwd: process.cwd(),
        env: process.env,
        stdio: 'inherit',
        shell: false,
      },
    );
    child.once('error', reject);
    child.once('exit', (code, signal) =>
      resolveResult({ code: code ?? 1, signal }),
    );
  });
