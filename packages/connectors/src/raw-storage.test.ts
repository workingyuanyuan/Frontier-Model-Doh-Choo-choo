import { readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { writeContentAddressedArtifact } from './raw-storage.js';

describe('content-addressed raw storage', () => {
  it('writes deterministic immutable artifacts and safely deduplicates them', async () => {
    const root = join(tmpdir(), `llm-bench-storage-${crypto.randomUUID()}`);
    const body = new TextEncoder().encode('{"source":"livebench"}');

    const first = await writeContentAddressedArtifact(root, body, 'json');
    const second = await writeContentAddressedArtifact(root, body, 'json');

    expect(second).toEqual(first);
    expect(first.contentSha256).toMatch(/^[a-f0-9]{64}$/);
    expect(first.storagePath).toContain(
      join('sha256', first.contentSha256.slice(0, 2), first.contentSha256),
    );
    await expect(readFile(first.storagePath)).resolves.toEqual(
      Buffer.from(body),
    );
  });

  it('rejects unsafe file extensions', async () => {
    await expect(
      writeContentAddressedArtifact(
        tmpdir(),
        new Uint8Array([1]),
        '../outside',
      ),
    ).rejects.toThrow('extension');
  });

  it('preserves the filesystem cause when an existing artifact was tampered with', async () => {
    const root = join(tmpdir(), `llm-bench-storage-${crypto.randomUUID()}`);
    const body = new TextEncoder().encode('{"source":"livebench"}');
    const stored = await writeContentAddressedArtifact(root, body, 'json');
    await writeFile(stored.storagePath, Buffer.alloc(body.byteLength, 0x78));

    const failure = await writeContentAddressedArtifact(
      root,
      body,
      'json',
    ).then(
      () => undefined,
      (error: unknown) => error,
    );

    expect(failure).toBeInstanceOf(Error);
    expect((failure as Error & { cause?: unknown }).cause).toMatchObject({
      code: 'EEXIST',
    });
  });
});
