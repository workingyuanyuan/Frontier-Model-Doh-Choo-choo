import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildArtifactRecord } from './index.js';
import { EvidenceStore } from './evidence-store.js';
import { captureArtifact } from './refresh-utils.js';
import { acquisitionClient } from './safe-network.js';
import { processSource, type ProcessingStats } from './source-processing.js';
import { runSourceCommand } from './process-source-command.js';

const roots: string[] = [];
const temporaryRoot = async () => {
  const root = await mkdtemp(join(tmpdir(), 'source-processing-'));
  roots.push(root);
  return root;
};
afterEach(async () => {
  vi.restoreAllMocks();
  await Promise.all(
    roots.splice(0).map((root) => rm(root, { recursive: true, force: true })),
  );
});

describe('durable source processing', () => {
  it('retains distinct acquisitions of identical bytes and HTTP provenance', async () => {
    const root = await temporaryRoot();
    const bytes = new TextEncoder().encode('{"score":42}');
    vi.spyOn(acquisitionClient, 'get').mockResolvedValue({
      ok: true,
      status: 200,
      url: 'https://example.test/final',
      headers: new Headers({ etag: 'same' }),
      bytes,
    });
    const context = {
      root,
      sourceId: 'example',
      url: 'https://example.test/data',
      mediaType: 'application/json',
      method: 'API_RESPONSE' as const,
      metadata: {},
    };
    const first = await captureArtifact({
      ...context,
      retrievedAt: '2026-10-01T00:00:00Z',
    });
    const second = await captureArtifact({
      ...context,
      retrievedAt: '2026-10-02T00:00:00Z',
    });
    expect(first.record.id).toBe(second.record.id);
    const store = new EvidenceStore(root);
    try {
      const captures = store.captures({ sourceId: 'example' });
      expect(captures).toHaveLength(2);
      expect(new Set(captures.map(({ id }) => id)).size).toBe(2);
      expect(
        captures.every(
          ({ http, record }) =>
            http.status === 200 &&
            http.headers?.etag === 'same' &&
            record.finalUrl === 'https://example.test/final',
        ),
      ).toBe(true);
    } finally {
      store.close();
    }
  });

  it('retains failed HTTP and transport attempts before surfacing errors', async () => {
    const root = await temporaryRoot();
    const context = {
      root,
      sourceId: 'example',
      url: 'https://example.test/data',
      retrievedAt: '2026-10-01T00:00:00Z',
      mediaType: 'application/json',
      method: 'API_RESPONSE' as const,
      metadata: {},
    };
    const get = vi
      .spyOn(acquisitionClient, 'get')
      .mockResolvedValueOnce({
        ok: false,
        status: 503,
        url: context.url,
        headers: new Headers(),
        bytes: new Uint8Array(),
      })
      .mockRejectedValueOnce(new Error('ECONNRESET'));
    await expect(captureArtifact(context)).rejects.toThrow('HTTP 503');
    await expect(captureArtifact(context)).rejects.toThrow('ECONNRESET');
    expect(get).toHaveBeenCalledTimes(2);
    const store = new EvidenceStore(root);
    try {
      expect(store.failures({ sourceId: 'example' })).toHaveLength(2);
    } finally {
      store.close();
    }
  });

  it('reuses extraction and invalidates on metadata, parser, configuration, and force changes', async () => {
    const root = await temporaryRoot();
    await mkdir(join(root, 'artifacts'), { recursive: true });
    const bytes = new TextEncoder().encode('raw');
    await writeFile(join(root, 'artifacts/raw.txt'), bytes);
    const record = buildArtifactRecord(
      bytes,
      'text/plain',
      'artifacts/raw.txt',
      { sourceId: 'example', retrievedAt: '2026-10-01T00:00:00Z' },
    );
    const store = new EvidenceStore(root);
    const stats: ProcessingStats = {
      hits: 0,
      misses: 0,
      parsedSources: 0,
      elapsedMs: 0,
    };
    const materialize = vi.fn(() => ({ value: 42 }));
    const base = {
      store,
      sourceId: 'example',
      evidence: [record],
      parserVersion: 'parser-1',
      config: { aliases: 1 },
      stats,
      materialize,
      encode: (result: { value: number }) => ({
        'candidates.json': JSON.stringify(result),
      }),
      decode: (files: Record<string, string>) =>
        JSON.parse(files['candidates.json']!) as { value: number },
    };
    try {
      const full = processSource({ ...base, force: true });
      expect(processSource(base)).toEqual(full);
      expect(materialize).toHaveBeenCalledTimes(1);
      processSource({
        ...base,
        evidence: [{ ...record, retrievedAt: '2026-10-02T00:00:00Z' }],
      });
      processSource({
        ...base,
        evidence: [{ ...record, metadata: { rows: 3 } }],
      });
      processSource({ ...base, parserVersion: 'parser-2' });
      processSource({ ...base, config: { aliases: 2 } });
      expect(processSource({ ...base, force: true })).toEqual(full);
      expect(stats).toMatchObject({ hits: 1, misses: 6, parsedSources: 6 });
    } finally {
      store.close();
    }
  });

  it('restores partial child writes on failure and exports successful files from persisted snapshots', async () => {
    const root = await temporaryRoot();
    const directory = join(root, 'data/sources/example');
    await mkdir(directory, { recursive: true });
    const path = join(directory, 'candidates.json');
    await writeFile(path, '[1]');
    await runSourceCommand(root, ['example'], async () => {
      await writeFile(path, '[2]');
      await writeFile(join(directory, 'costs.json'), '[3]');
      return { code: 7, signal: null };
    });
    expect(await readFile(path, 'utf8')).toBe('[1]');
    await expect(readFile(join(directory, 'costs.json'))).rejects.toMatchObject(
      { code: 'ENOENT' },
    );
    await runSourceCommand(root, ['example'], async () => {
      await writeFile(path, '[4]');
      return { code: 0, signal: null };
    });
    const store = new EvidenceStore(root);
    try {
      const current = store.history({ sourceId: 'example' }).at(-1);
      expect(current?.files['candidates.json']).toBe('[4]');
    } finally {
      store.close();
    }
    expect(await readFile(path, 'utf8')).toBe('[4]');
  });
});
