import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { addDirectoryIndexes } from './add-directory-indexes.mjs';

test('copies each page to <page>/index.html and skips root, 404 and internals', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'directory-indexes-'));
  try {
    await mkdir(join(dir, 'presets', 'alpha'), { recursive: true });
    await mkdir(join(dir, 'kept'), { recursive: true });
    await mkdir(join(dir, '_next'), { recursive: true });
    await writeFile(join(dir, 'index.html'), 'root');
    await writeFile(join(dir, '404.html'), 'missing');
    await writeFile(join(dir, '_not-found.html'), 'internal');
    await writeFile(join(dir, '_next', 'chunk.html'), 'internal');
    await writeFile(join(dir, 'presets', 'alpha.html'), 'alpha page');
    await writeFile(join(dir, 'presets', 'beta.html'), 'beta page');
    await writeFile(join(dir, 'presets', 'alpha', 'segment.txt'), 'rsc');
    await writeFile(join(dir, 'kept.html'), 'kept page');
    await writeFile(join(dir, 'kept', 'index.html'), 'existing index');

    assert.deepEqual(addDirectoryIndexes(dir), [
      join('presets', 'alpha', 'index.html'),
      join('presets', 'beta', 'index.html'),
    ]);
    assert.equal(
      readFileSync(join(dir, 'presets', 'alpha', 'index.html'), 'utf8'),
      'alpha page',
    );
    assert.equal(
      readFileSync(join(dir, 'kept', 'index.html'), 'utf8'),
      'existing index',
    );
    assert.equal(existsSync(join(dir, '404', 'index.html')), false);
    assert.equal(existsSync(join(dir, '_not-found', 'index.html')), false);
    // Rerunning finds every index in place and writes nothing.
    assert.deepEqual(addDirectoryIndexes(dir), []);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
