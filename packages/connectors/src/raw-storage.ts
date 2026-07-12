import { createHash, timingSafeEqual } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

export interface StoredArtifact {
  readonly contentSha256: string;
  readonly byteLength: number;
  readonly storagePath: string;
}

function isAlreadyExistsError(error: unknown): error is NodeJS.ErrnoException {
  return (
    error instanceof Error &&
    'code' in error &&
    (error as NodeJS.ErrnoException).code === 'EEXIST'
  );
}

export async function writeContentAddressedArtifact(
  storageRoot: string,
  body: Uint8Array,
  extension: string,
): Promise<StoredArtifact> {
  if (!/^[a-z0-9]{1,10}$/.test(extension)) {
    throw new Error(
      'Artifact extension must contain only lowercase letters or digits',
    );
  }

  if (body.byteLength === 0) {
    throw new Error('Cannot store an empty artifact');
  }

  const contentSha256 = createHash('sha256').update(body).digest('hex');
  const directory = join(
    resolve(storageRoot),
    'sha256',
    contentSha256.slice(0, 2),
  );
  const storagePath = join(directory, `${contentSha256}.${extension}`);
  await mkdir(directory, { recursive: true });

  try {
    await writeFile(storagePath, body, { flag: 'wx' });
  } catch (error) {
    if (!isAlreadyExistsError(error)) {
      throw error;
    }

    const existing = await readFile(storagePath);
    const incoming = Buffer.from(body);
    if (
      existing.byteLength !== incoming.byteLength ||
      !timingSafeEqual(existing, incoming)
    ) {
      throw new Error(
        'Content-addressed artifact does not match its SHA-256 path',
        { cause: error },
      );
    }
  }

  return {
    contentSha256,
    byteLength: body.byteLength,
    storagePath,
  };
}
