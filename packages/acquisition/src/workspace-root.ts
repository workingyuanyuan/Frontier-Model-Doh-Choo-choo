import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';

export const getWorkspaceRoot = (): string => {
  let directory = process.cwd();
  while (true) {
    if (existsSync(join(directory, 'data'))) return directory;
    const parent = dirname(directory);
    if (parent === directory) throw new Error('Workspace root not found');
    directory = parent;
  }
};
