import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { readFile } from 'node:fs/promises';

export const readJson = async <T = unknown>(path: string): Promise<T> =>
  JSON.parse(await readFile(path, 'utf8')) as T;

export function findRepositoryRoot(startDir: string = '.'): string {
  let current = resolve(startDir);
  while (true) {
    if (existsSync(join(current, 'data', 'mappings', 'sources.json'))) {
      return current;
    }
    const parent = dirname(current);
    if (parent === current) {
      break;
    }
    current = parent;
  }
  return resolve(startDir);
}

export const reportCliError = (error: unknown): void => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
};
