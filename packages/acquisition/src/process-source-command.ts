import { spawn } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { EvidenceStore } from './evidence-store.js';
import { getWorkspaceRoot } from './refresh-utils.js';
import { parserRevision, readSourceFiles } from './source-processing.js';

/** Journal the baseline before a writer starts, and publish only its successful output. */
export async function runSourceCommand<
  T extends { code: number; signal: NodeJS.Signals | null },
>(
  root: string,
  sourceIds: readonly string[],
  run: () => Promise<T>,
): Promise<T> {
  const store = new EvidenceStore(root);
  const token = store.beginSourceUpdate([...sourceIds]);
  try {
    const result = await run();
    if (result.code !== 0 || result.signal) {
      store.abortSourceUpdate(token);
      return result;
    }
    const revision = parserRevision();
    const ids = sourceIds.map((sourceId) =>
      store.importSnapshot(sourceId, readSourceFiles(root, sourceId), {
        kind: 'source-command',
        revision,
      }),
    );
    for (const id of ids) store.exportSnapshot(id);
    store.completeSourceUpdate(token);
    return result;
  } catch (error) {
    store.abortSourceUpdate(token);
    throw error;
  } finally {
    store.close();
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  const [sources, script, ...args] = process.argv
    .slice(2)
    .filter((arg) => arg !== '--');
  if (!sources || !script)
    throw new Error(
      'Usage: process-source-command <source-ids|@all> <script> [root] [arguments]',
    );
  const root = resolve(
    args.find((arg) => !arg.startsWith('--')) ?? getWorkspaceRoot(),
  );
  const sourceIds =
    sources === '@all'
      ? readdirSync(join(root, 'data', 'sources'), { withFileTypes: true })
          .filter((entry) => entry.isDirectory())
          .map((entry) => entry.name)
      : sources.split(',');
  const result = await runSourceCommand(
    root,
    sourceIds,
    () =>
      new Promise<{ code: number; signal: NodeJS.Signals | null }>(
        (resolveResult, reject) => {
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
        },
      ),
  );
  if (result.signal) process.kill(process.pid, result.signal);
  else process.exitCode = result.code;
}
