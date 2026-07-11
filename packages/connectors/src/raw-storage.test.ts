import { readFile } from 'node:fs/promises';
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
});
