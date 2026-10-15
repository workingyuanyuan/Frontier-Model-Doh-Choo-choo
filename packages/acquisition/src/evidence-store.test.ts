import { createHash } from 'node:crypto';
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
  existsSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { afterEach, describe, expect, it } from 'vitest';
import type { EvidenceRecord } from '@llm-bench/benchmark-data';
import { EvidenceStore, type ProcessInput } from './evidence-store.js';

const roots: string[] = [];
const stores: EvidenceStore[] = [];
const root = (): string => {
  const path = mkdtempSync(join(tmpdir(), 'evidence-store-'));
  roots.push(path);
  return path;
};
const store = (path = root()): EvidenceStore => {
  const result = new EvidenceStore(path);
  stores.push(result);
  return result;
};
const close = (database: EvidenceStore): void => {
  stores.splice(stores.indexOf(database), 1);
  database.close();
};
const record = (
  directory: string,
  text = 'captured bytes',
  overrides: Partial<EvidenceRecord> = {},
): EvidenceRecord => {
  const sha = createHash('sha256').update(text).digest('hex');
  const path = `artifacts/sha256/${sha.slice(0, 2)}/${sha}.txt`;
  mkdirSync(dirname(join(directory, path)), { recursive: true });
  writeFileSync(join(directory, path), text);
  return {
    schemaVersion: 'evidence-record-v1',
    id: `sha256:${sha}`,
    sha256: `sha256:${sha}`,
    sourceId: 'example',
    retrievedAt: '2026-10-01T00:00:00.000Z',
    artifactPath: path,
    mediaType: 'text/plain',
    byteLength: Buffer.byteLength(text),
    requestUrl: 'https://example.test/input',
    finalUrl: 'https://example.test/final',
    method: 'API_RESPONSE',
    metadata: {},
    ...overrides,
  };
};
const files = (
  evidence: EvidenceRecord[],
  value = 1,
): Record<string, string> => ({
  'evidence-index.json': JSON.stringify(evidence),
  'manifest.json': JSON.stringify({ sourceId: 'example' }),
  'candidates.json': JSON.stringify([
    {
      id: 'candidate-1',
      model: { canonicalModelId: 'model-a' },
      evidenceIds: evidence.map((item) => item.id),
      value,
    },
  ]),
  'validation-report.md': `Validated ${value}\n`,
});
const processInput = (inputs: EvidenceRecord[]): ProcessInput => ({
  sourceId: 'example',
  inputs,
  parserVersion: 'parser-1',
  config: { aliases: ['a'] },
});

afterEach(() => {
  for (const database of stores.splice(0)) database.close();
  for (const directory of roots.splice(0))
    rmSync(directory, { recursive: true, force: true });
});

describe('EvidenceStore', () => {
  it('separates durable capture identity from shared content and retains HTTP context', () => {
    const database = store();
    const captured = record(database.root);
    const first = database.recordCapture(captured, {
      status: 200,
      headers: { etag: 'v1' },
    });
    const second = database.recordCapture(
      { ...captured, retrievedAt: '2026-10-02T00:00:00.000Z' },
      { status: 304 },
    );
    expect(first).not.toBe(second);
    expect(database.captures()).toHaveLength(2);
    expect(database.captures()[0]?.http).toEqual({
      status: 200,
      headers: { etag: 'v1' },
    });
    expect(database.verify()).toMatchObject({
      ok: true,
      blobs: 1,
      captures: 2,
    });
    const directory = database.root;
    close(database);
    expect(store(directory).captures()).toHaveLength(2);
  });

  it('imports observations and snapshots idempotently without manufacturing timestamps', () => {
    const database = store();
    const captured = record(database.root);
    const firstCapture = database.importCapture(captured, {
      kind: 'git',
      revision: 'a',
    });
    expect(
      database.importCapture(captured, { kind: 'git', revision: 'b' }),
    ).toBe(firstCapture);
    const snapshot = database.importSnapshot('example', files([captured]), {
      kind: 'git',
      revision: 'a',
    });
    expect(
      database.importSnapshot('example', files([captured]), {
        kind: 'git',
        revision: 'a',
      }),
    ).toBe(snapshot);
    expect(database.captures()).toHaveLength(1);
    expect(database.getSnapshot(snapshot).createdAt).toBe(captured.retrievedAt);
    const noObservation = database.importSnapshot(
      'another',
      { 'manifest.json': '{}' },
      { kind: 'git', revision: 'a' },
    );
    expect(database.getSnapshot(noObservation).createdAt).toBeNull();
    expect(database.currentSnapshot('example')).toBeNull();
  });

  it('imports embedded cross-source evidence and verifies legitimate auxiliary references', () => {
    const database = store();
    const captured = record(database.root);
    const foreign = record(database.root, 'foreign', { sourceId: 'foreign' });
    const snapshotFiles = {
      ...files([captured]),
      'cross-checks.json': JSON.stringify({
        cursorEvidence: foreign,
        evidenceIds: [foreign.id],
      }),
    };
    database.importSnapshot('example', snapshotFiles, { kind: 'git' });
    expect(database.captures({ sourceId: 'foreign' })).toHaveLength(1);
    expect(database.references(foreign.id).length).toBeGreaterThan(0);
    expect(database.verify().ok).toBe(true);
  });

  it('keeps exact snapshot bytes and queries stable source/model/time/hash pages', () => {
    const database = store();
    const captured = record(database.root);
    const firstFiles = files([captured]);
    firstFiles['candidates.json'] =
      `${JSON.stringify(JSON.parse(firstFiles['candidates.json']!), null, 2)}\n`;
    const first = database.importSnapshot('example', firstFiles, {
      kind: 'git',
      revision: 'a',
    });
    const second = database.importSnapshot('example', files([captured], 2), {
      kind: 'git',
      revision: 'b',
    });
    expect(database.getSnapshot(first).files).toEqual(firstFiles);
    expect(
      database
        .snapshots({
          sourceId: 'example',
          model: 'model-a',
          hash: captured.sha256,
          from: captured.retrievedAt,
          to: captured.retrievedAt,
          offset: 1,
          limit: 1,
        })
        .map((item) => item.id),
    ).toEqual([second]);
    expect(database.snapshots({ model: 'absent' })).toEqual([]);
    expect(() => database.snapshots({ offset: -1 })).toThrow('Pagination');
    database.setCurrentSnapshot(second);
    expect(
      database
        .references(captured.id, { scope: 'current' })
        .every((item) => item.snapshotId === second),
    ).toBe(true);
    expect(
      new Set(
        database
          .references(captured.id, { scope: 'history' })
          .map((item) => item.snapshotId),
      ),
    ).toEqual(new Set([first, second]));
    expect(
      database
        .diffSnapshots(first, second)
        .files.find((item) => item.file === 'candidates.json')?.structured
        ?.changed,
    ).toHaveLength(1);
  });

  it('keys cache over every ordered input, parser, metadata and config and supports force', () => {
    const database = store();
    const one = record(database.root, 'one');
    const two = record(database.root, 'two', {
      requestUrl: 'https://example.test/two',
    });
    const input = processInput([one, two]);
    expect(database.lookupProcess(input)).toMatchObject({
      hit: false,
      reason: 'key-not-found',
    });
    const cached = database.storeProcess(input, files([one, two]));
    expect(database.lookupProcess(input)).toMatchObject({
      hit: true,
      snapshotId: cached,
      files: files([one, two]),
    });
    expect(database.lookupProcess(input, { force: true })).toMatchObject({
      hit: false,
      reason: 'forced',
    });
    expect(
      database.lookupProcess({ ...input, parserVersion: 'parser-2' }).hit,
    ).toBe(false);
    expect(
      database.lookupProcess({ ...input, config: { aliases: ['b'] } }).hit,
    ).toBe(false);
    expect(database.lookupProcess({ ...input, inputs: [two, one] }).hit).toBe(
      false,
    );
    expect(
      database.lookupProcess({
        ...input,
        inputs: [one, { ...two, retrievedAt: '2026-10-02T00:00:00.000Z' }],
      }).hit,
    ).toBe(false);
    const three = record(database.root, 'changed second input');
    expect(database.lookupProcess({ ...input, inputs: [one, three] }).hit).toBe(
      false,
    );
    expect(() => database.exportSnapshot(cached)).toThrow(
      'Process cache snapshots',
    );
  });

  it('rechecks blobs on cache hits and refuses corrupted input and backup', () => {
    const database = store();
    const captured = record(database.root);
    const input = processInput([captured]);
    database.storeProcess(input, files([captured]));
    writeFileSync(join(database.root, captured.artifactPath), 'corrupt bytes');
    expect(database.lookupProcess(input)).toMatchObject({
      hit: false,
      reason: `input-corrupt:${captured.artifactPath}`,
    });
    expect(() => database.storeProcess(input, files([captured]))).toThrow(
      'Cannot cache',
    );
    expect(() => database.recordCapture(captured)).toThrow(
      'Corrupt evidence blob',
    );
    expect(database.verify()).toMatchObject({
      ok: false,
      issues: [expect.objectContaining({ kind: 'corrupt-blob' })],
    });
    expect(() => database.backup(root())).toThrow(
      'Cannot back up corrupt blob',
    );
    rmSync(join(database.root, captured.artifactPath));
    expect(database.lookupProcess(input).reason).toContain('input-missing');
    expect(() => database.recordCapture(captured)).toThrow(
      'Missing evidence blob',
    );
  });

  it('reports unknown historical bytes and inventories unreferenced blobs', () => {
    const database = store();
    const historical = record(database.root);
    rmSync(join(database.root, historical.artifactPath));
    database.importCapture(historical, { kind: 'git' });
    expect(database.verify()).toMatchObject({
      ok: false,
      unknown: 1,
      issues: [expect.objectContaining({ kind: 'missing-blob' })],
    });
    record(database.root, 'unreferenced');
    expect(database.scanArtifacts()).toEqual({ added: 1, files: 1 });
    expect(database.scanArtifacts()).toEqual({ added: 0, files: 1 });
  });

  it('exports a complete source projection and removes files absent from selected snapshot', () => {
    const database = store();
    const captured = record(database.root);
    const older = database.importSnapshot('example', files([captured]), {
      kind: 'git',
      revision: 'a',
    });
    const newer = database.importSnapshot(
      'example',
      { ...files([captured], 2), 'costs.json': '[]' },
      { kind: 'git', revision: 'b' },
    );
    database.exportSnapshot(newer);
    const directory = join(database.root, 'data/sources/example');
    expect(existsSync(join(directory, 'costs.json'))).toBe(true);
    database.exportSnapshot(older);
    expect(existsSync(join(directory, 'costs.json'))).toBe(false);
    expect(readFileSync(join(directory, 'candidates.json'), 'utf8')).toBe(
      files([captured])['candidates.json'],
    );
    expect(database.currentSnapshot('example')?.id).toBe(older);
    expect(() => database.exportSnapshot(older, 'outside')).toThrow(
      'inside data/sources',
    );
  });

  it('recovers an interrupted export at the next open', () => {
    const database = store();
    const directory = database.root;
    const captured = record(directory);
    const snapshot = database.importSnapshot('example', files([captured]), {
      kind: 'git',
    });
    const dbPath = database.dbPath;
    close(database);
    const sqlite = new DatabaseSync(dbPath);
    sqlite
      .prepare(
        'INSERT INTO export_journal(id,snapshot_id,destination,state) VALUES(?,?,?,?)',
      )
      .run('crashed-export', snapshot, 'data/sources/example', 'pending');
    sqlite.close();
    mkdirSync(join(directory, 'data/sources/example'), { recursive: true });
    writeFileSync(
      join(directory, 'data/sources/example/candidates.json'),
      'partial',
    );
    writeFileSync(join(directory, 'data/sources/example/stale.json'), '[]');
    const reopened = store(directory);
    expect(reopened.currentSnapshot('example')?.id).toBe(snapshot);
    expect(
      readFileSync(
        join(directory, 'data/sources/example/candidates.json'),
        'utf8',
      ),
    ).toBe(files([captured])['candidates.json']);
    expect(existsSync(join(directory, 'data/sources/example/stale.json'))).toBe(
      false,
    );
    expect(reopened.recoverExports()).toBe(0);
  });

  it('journals failed attempts independently of content captures', () => {
    const database = store();
    const input = {
      sourceId: 'example',
      requestUrl: 'https://example.test',
      retrievedAt: '2026-10-01T00:00:00.000Z',
      error: 'network failure',
      status: 503,
    };
    database.recordFailure(input);
    database.recordFailure(input);
    expect(database.failures({ sourceId: 'example' })).toHaveLength(2);
    expect(database.captures()).toHaveLength(0);
    expect(database.failures()[0]).toMatchObject(input);
  });

  it('keeps a live source update open and rolls back files, absence and current pointers after owner death', () => {
    const database = store();
    const captured = record(database.root);
    const original = database.importSnapshot('example', files([captured]), {
      kind: 'git',
      revision: 'original',
    });
    database.exportSnapshot(original);
    const update = database.beginSourceUpdate(['example', 'new-source']);
    expect(database.recoverSourceUpdates()).toBe(0);
    const next = database.importSnapshot('example', files([captured], 2), {
      kind: 'git',
      revision: 'new',
    });
    database.exportSnapshot(next);
    mkdirSync(join(database.root, 'data/sources/new-source'), {
      recursive: true,
    });
    writeFileSync(
      join(database.root, 'data/sources/new-source/candidates.json'),
      '[]',
    );
    const directory = database.root;
    const dbPath = database.dbPath;
    close(database);
    const sqlite = new DatabaseSync(dbPath);
    sqlite
      .prepare(
        'UPDATE source_updates SET owner_pid=?,owner_identity=? WHERE id=?',
      )
      .run(2147483647, 'dead', update);
    sqlite.close();
    const reopened = store(directory);
    expect(reopened.currentSnapshot('example')?.id).toBe(original);
    expect(
      readFileSync(
        join(directory, 'data/sources/example/candidates.json'),
        'utf8',
      ),
    ).toBe(files([captured])['candidates.json']);
    expect(existsSync(join(directory, 'data/sources/new-source'))).toBe(false);
    expect(reopened.recoverSourceUpdates()).toBe(0);
  });

  it('backs up consistent SQLite and restores portable blobs/history/projections under another root', () => {
    const database = store();
    const captured = record(database.root);
    database.recordCapture(captured, { status: 200 });
    const snapshot = database.importSnapshot('example', files([captured]), {
      kind: 'git',
      revision: 'a',
    });
    database.exportSnapshot(snapshot);
    database.storeProcess(processInput([captured]), files([captured]));
    const backup = root();
    const manifest = database.backup(backup);
    expect(manifest.blobs).toHaveLength(1);
    expect(JSON.stringify(manifest)).not.toContain(database.root);
    const destination = root();
    const restored = EvidenceStore.restore(backup, destination);
    stores.push(restored);
    expect(restored.verify().ok).toBe(true);
    expect(restored.getSnapshot(snapshot).files).toEqual(files([captured]));
    expect(restored.lookupProcess(processInput([captured])).hit).toBe(true);
    expect(readFileSync(join(destination, captured.artifactPath), 'utf8')).toBe(
      'captured bytes',
    );
    expect(
      readFileSync(
        join(destination, 'data/sources/example/manifest.json'),
        'utf8',
      ),
    ).toBe(files([captured])['manifest.json']);
    expect(() => EvidenceStore.restore(backup, destination)).toThrow(
      'empty database',
    );
  });

  it('verifies the whole backup before writing restored database or blobs', () => {
    const database = store();
    const captured = record(database.root);
    database.importCapture(captured);
    const backup = root();
    database.backup(backup);
    writeFileSync(join(backup, 'blobs', captured.artifactPath), 'broken');
    const destination = root();
    expect(() => EvidenceStore.restore(backup, destination)).toThrow(
      'Backup blob checksum mismatch',
    );
    expect(
      existsSync(join(destination, 'artifacts/evidence/store.sqlite')),
    ).toBe(false);
    expect(existsSync(join(destination, captured.artifactPath))).toBe(false);
  });

  it('rejects future schema versions, invalid snapshot JSON and escaping paths', () => {
    const database = store();
    expect(() =>
      database.importSnapshot(
        'example',
        { '../evil.json': '{}' },
        { kind: 'git' },
      ),
    ).toThrow('Unsafe relative path');
    expect(() =>
      database.importSnapshot(
        'example',
        { 'data.json': 'bad json' },
        { kind: 'git' },
      ),
    ).toThrow();
    const captured = record(database.root);
    expect(() =>
      database.importCapture({ ...captured, artifactPath: '../outside' }),
    ).toThrow('Unsafe relative path');
    const directory = database.root;
    const dbPath = database.dbPath;
    close(database);
    const sqlite = new DatabaseSync(dbPath);
    sqlite.exec('PRAGMA user_version=999');
    sqlite.close();
    expect(() => new EvidenceStore(directory)).toThrow('newer than supported');
  });

  it('detects SQLite snapshot payload and reference index corruption', () => {
    const database = store();
    const captured = record(database.root);
    const snapshot = database.importSnapshot('example', files([captured]), {
      kind: 'git',
    });
    const sqlite = new DatabaseSync(database.dbPath);
    sqlite
      .prepare('DELETE FROM snapshot_refs WHERE snapshot_id=?')
      .run(snapshot);
    expect(database.verify().issues).toContainEqual(
      expect.objectContaining({ kind: 'snapshot-references' }),
    );
    sqlite
      .prepare('UPDATE snapshots SET files=? WHERE id=?')
      .run('{}', snapshot);
    sqlite.close();
    expect(() => database.getSnapshot(snapshot)).toThrow(
      'Corrupt stored snapshot',
    );
    expect(database.verify().issues).toContainEqual(
      expect.objectContaining({ kind: 'corrupt-snapshot' }),
    );
  });
});
