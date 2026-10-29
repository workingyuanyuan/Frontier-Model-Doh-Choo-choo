/**
 * Claude Code Stop hook. When the working tree changes product inputs,
 * outputs or the scoring code, the agent may only stop after
 * `pnpm data:release` has produced a receipt for exactly this state. A failed
 * receipt also lets it stop, so a blocked release can be handed over honestly.
 * CI recomputes the product independently; this gate only catches skipped
 * steps before the agent reports "done".
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import {
  computeReleaseState,
  isReleaseRelevantPath,
  parsePorcelainZ,
  readReceipt,
  receiptMatches,
} from './release-state.mjs';

export const evaluateStopGate = ({ changedPaths, receipt, state }) => {
  if (changedPaths.length === 0) return { block: false };
  if (receiptMatches(receipt, state)) {
    return { block: false, status: receipt.status };
  }
  const reason = [
    'Product inputs changed without a matching data release:',
    ...changedPaths.slice(0, 8).map((path) => `- ${path}`),
    changedPaths.length > 8 ? `- …and ${changedPaths.length - 8} more` : null,
    receipt === null
      ? 'No release receipt exists.'
      : `The latest receipt (${receipt.runId}, ${receipt.status}) was made for different files.`,
    'Run `pnpm data:release` and report its result (AGENTS.md). Commit data/product/current.json only after the spot check finds no significant changes.',
  ]
    .filter(Boolean)
    .join('\n');
  return { block: true, reason };
};

const readHookInput = () => {
  try {
    return JSON.parse(readFileSync(0, 'utf8') || '{}');
  } catch {
    return {};
  }
};

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const input = readHookInput();
  const root =
    process.env.CLAUDE_PROJECT_DIR ??
    resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const status = execFileSync(
    'git',
    ['status', '--porcelain=v1', '-z', '--untracked-files=all'],
    { cwd: root, encoding: 'utf8' },
  );
  const changedPaths = parsePorcelainZ(status).filter((path) =>
    isReleaseRelevantPath(root, path),
  );
  let result;
  try {
    result = evaluateStopGate({
      changedPaths,
      receipt: changedPaths.length ? readReceipt(root) : null,
      state: changedPaths.length ? computeReleaseState(root) : null,
    });
  } catch (error) {
    // A hook that crashes does not block, so unreadable inputs must.
    result = {
      block: true,
      reason: `Cannot read the release inputs (${error instanceof Error ? error.message : String(error)}). Fix them and run \`pnpm data:release\`.`,
    };
  }
  if (result.block) {
    // A second refusal in a row lets the session end but tells the user why.
    console.log(
      JSON.stringify(
        input.stop_hook_active
          ? { systemMessage: `Data release still missing.\n${result.reason}` }
          : { decision: 'block', reason: result.reason },
      ),
    );
  }
}
