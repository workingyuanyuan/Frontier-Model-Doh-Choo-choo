import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  buildArtifactRecord,
  verifyArtifactRecord,
  writeContentAddressedArtifact,
} from './index.js';

describe('content-addressed artifacts', () => {
  it('writes identical bytes to the same immutable path', async () => {
    const root = await mkdtemp(join(tmpdir(), 'llm-bench-artifact-'));
    const first = await writeContentAddressedArtifact(
      root,
      Buffer.from('evidence'),
      'application/json',
    );
    const second = await writeContentAddressedArtifact(
      root,
      Buffer.from('evidence'),
      'application/json',
    );

    expect(second).toEqual(first);
    expect(await readFile(first.path, 'utf8')).toBe('evidence');
  });

  it('rejects evidence whose stored bytes no longer match its hash', async () => {
    const record = buildArtifactRecord(
      Buffer.from('evidence'),
      'application/json',
      'artifacts-v2/aa/bad.json',
    );

    expect(() => verifyArtifactRecord(record, Buffer.from('changed'))).toThrow(
      'hash',
    );
  });

  it('rejects a relative path that escapes the artifact root', async () => {
    const root = await mkdtemp(join(tmpdir(), 'llm-bench-artifact-'));

    await expect(
      writeContentAddressedArtifact(root, Buffer.from('evidence'), '../../x'),
    ).rejects.toThrow('media type');
  });
});
