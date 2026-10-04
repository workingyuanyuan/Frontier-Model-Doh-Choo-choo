import { resolve } from 'node:path';
import { getWorkspaceRoot } from './refresh-utils.js';
import { monitorSources } from './source-change-monitor.js';

const args = process.argv.slice(2).filter((arg) => arg !== '--');
const sourceIds = args
  .find((arg) => arg.startsWith('--sources='))
  ?.slice('--sources='.length)
  .split(',');
const root = resolve(
  args.find((arg) => !arg.startsWith('--')) ?? getWorkspaceRoot(),
);
const result = await monitorSources({
  root,
  ...(sourceIds ? { sourceIds } : {}),
  offline: args.includes('--offline'),
});
console.log(JSON.stringify(result));
if (result.errorCount || (args.includes('--check') && result.attentionCount))
  process.exitCode = 1;
