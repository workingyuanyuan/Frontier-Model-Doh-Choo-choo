import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

import {
  ProductVersionSchema,
  publishDraft,
  rollbackPublished,
  setDraftPointer,
  writeImmutableProductVersion,
} from './index.js';
import { writeWorkspaceDraft } from './workspace.js';

const usage = [
  'Usage:',
  '  product-version build-workspace [repository-root]',
  '  product-version write-draft <version.json> [product-root]',
  '  product-version publish [product-root]',
  '  product-version rollback [product-root]',
].join('\n');

export const runProductVersionCli = async (
  args: string[],
  now = new Date().toISOString(),
): Promise<string> => {
  const [command, first, second] = args;

  if (command === 'build-workspace') {
    const root = resolve(first ?? '.');
    const product = await writeWorkspaceDraft(root, now);
    return `Draft ${product.versionId} built from verified workspace sources`;
  }

  if (command === 'write-draft') {
    if (!first) throw new Error(usage);
    const root = resolve(second ?? 'data-v2/product');
    const version = ProductVersionSchema.parse(
      JSON.parse(await readFile(resolve(first), 'utf8')),
    );
    await writeImmutableProductVersion(root, version);
    const pointer = await setDraftPointer(root, version.versionId, now);
    return `Draft now points to ${pointer.versionId}`;
  }

  if (command === 'publish') {
    const pointer = await publishDraft(
      resolve(first ?? 'data-v2/product'),
      now,
    );
    return `Published now points to ${pointer.versionId}`;
  }

  if (command === 'rollback') {
    const pointer = await rollbackPublished(
      resolve(first ?? 'data-v2/product'),
      now,
    );
    return `Published rolled back to ${pointer.versionId}`;
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
