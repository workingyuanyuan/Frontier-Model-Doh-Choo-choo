import { spawn } from 'node:child_process';
import { basename, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { getWorkspaceRoot } from './refresh-utils.js';
import {
  monitorSources,
  readSourceSnapshots,
} from './source-change-monitor.js';

export const refreshRoot = (script: string, args: string[]): string => {
  const scriptName = basename(script);
  if (
    scriptName === 'refresh-vendor-releases.ts' ||
    scriptName === 'refresh-surge-chartography.ts' ||
    scriptName === 'refresh-surge-complex-constraints.ts' ||
    scriptName === 'refresh-surge-corecraft.ts' ||
    scriptName === 'refresh-surge-riemann.ts' ||
    scriptName === 'refresh-surge-dayjob-finance.ts' ||
    scriptName === 'refresh-surge-dayjob-healthcare.ts' ||
    scriptName === 'refresh-surge-gdp-xlsx.ts'
  ) {
    return resolve(getWorkspaceRoot());
  }
  if (scriptName === 'refresh-frontier-code.ts') {
    const index = args.indexOf('--root');
    return resolve(
      (index < 0 ? undefined : args[index + 1]) ?? getWorkspaceRoot(),
    );
  }
  return resolve(
    args.find((argument) => !argument.startsWith('--')) ?? getWorkspaceRoot(),
  );
};

export const refreshWithAudit = async (
  sourceList: string,
  script: string,
  args: string[],
): Promise<{ code: number; signal: NodeJS.Signals | null }> => {
  const sourceIds = sourceList
    .split(',')
    .map((sourceId) => sourceId.trim())
    .filter(Boolean);
  if (sourceIds.length === 0)
    throw new Error('At least one source ID is required');
  const root = refreshRoot(script, args);
  const previousSnapshots = await readSourceSnapshots(root, sourceIds, true);
  const result = await new Promise<{
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
  if (result.code !== 0 || result.signal) return result;
  const audit = await monitorSources({ root, sourceIds, previousSnapshots });
  console.log(`Source change report: ${audit.reportPath}`);
  console.log(
    `Source changes requiring review: ${audit.attentionCount}; audit errors: ${audit.errorCount}`,
  );
  return { code: audit.errorCount > 0 ? 1 : 0, signal: null };
};

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  const [sourceList, script, ...args] = process.argv.slice(2);
  if (!sourceList || !script) {
    console.error(
      'Usage: refresh-with-audit <source-id[,source-id]> <script> [arguments...]',
    );
    process.exitCode = 1;
  } else {
    refreshWithAudit(sourceList, script, args)
      .then(({ code, signal }) => {
        if (signal) process.kill(process.pid, signal);
        else process.exitCode = code;
      })
      .catch((error: unknown) => {
        console.error(error);
        process.exitCode = 1;
      });
  }
}
