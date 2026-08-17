import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

import { ProductVersionSchema, writeCurrentProductVersion } from './index.js';
import { writeWorkspaceCurrent } from './workspace.js';

const usage = [
  'Usage:',
  '  product-version build-workspace [repository-root]',
  '  product-version write-current <version.json> [product-root]',
].join('\n');

export const runProductVersionCli = async (
  args: string[],
  now = new Date().toISOString(),
): Promise<string> => {
  const [command, first, second] = args;

  if (command === 'build-workspace') {
    const root = resolve(first ?? '.');
    const product = await writeWorkspaceCurrent(root, now);
    return `Current product ${product.versionId} built from verified workspace sources`;
  }

  if (command === 'write-current') {
    if (!first) throw new Error(usage);
    const root = resolve(second ?? 'data-v2/product');
    const version = ProductVersionSchema.parse(
      JSON.parse(await readFile(resolve(first), 'utf8')),
    );
    await writeCurrentProductVersion(root, version);
    return `Current product written: ${version.versionId}`;
  }

  throw new Error(usage);
};

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : null;
if (invokedPath === fileURLToPath(import.meta.url)) {
  runProductVersionCli(process.argv.slice(2))
    .then((message) => {
      console.log(message);
    })
    .catch((error: unknown) => {
      console.error(error instanceof Error ? error.message : String(error));
      process.exitCode = 1;
    });
}
