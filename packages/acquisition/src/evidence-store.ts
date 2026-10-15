import { createHash, randomUUID } from 'node:crypto';
import {
  closeSync,
  copyFileSync,
  existsSync,
  fsyncSync,
  mkdirSync,
  openSync,
  readFileSync,
  readSync,
  readdirSync,
  realpathSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import {
  EvidenceRecordSchema,
  type EvidenceRecord,
} from '@llm-bench/benchmark-data';

export interface EvidenceProvenance {
  kind: string;
  revision?: string;
  createdAt?: string;
}
export interface EvidenceQuery {
  sourceId?: string;
  model?: string;
  from?: string;
  to?: string;
  hash?: string;
  offset?: number;
  limit?: number;
}
export interface CaptureHttp {
  status?: number;
  headers?: Record<string, string>;
}
export interface StoredCapture {
  id: string;
  record: EvidenceRecord;
  http: CaptureHttp;
  provenance: EvidenceProvenance;
}
export interface StoredSnapshot {
  id: string;
  sourceId: string;
  files: Record<string, string>;
  provenance: EvidenceProvenance;
  createdAt: string | null;
}
export interface EvidenceReference {
  snapshotId: string;
  sourceId: string;
  file: string;
  pointer: string;
  hash: string;
}
export interface ProcessInput {
  sourceId: string;
  inputs: EvidenceRecord[];
  parserVersion: string;
  config: unknown;
}
export interface ProcessLookup {
  hit: boolean;
  reason: string;
  key: string;
  snapshotId?: string;
  files?: Record<string, string>;
}
export interface VerificationIssue {
  kind: string;
  hash?: string;
  path?: string;
  snapshotId?: string;
  message: string;
}
export interface VerificationReport {
  ok: boolean;
  blobs: number;
  captures: number;
  snapshots: number;
  unknown: number;
  issues: VerificationIssue[];
}
interface SnapshotRow {
  id: string;
  source_id: string;
  files: string;
  provenance: string;
  created_at: string | null;
  digest: string;
}
interface BlobRow {
  hash: string;
  path: string;
  size: number | null;
}
interface BackupManifest {
  version: 1;
  database: { path: string; sha256: string; bytes: number };
  blobs: Array<{ path: string; sha256: string; bytes: number }>;
  unknown: Array<{ hash: string; path: string }>;
}

const SCHEMA_VERSION = 2;
const digest = (bytes: string | Uint8Array): string =>
  `sha256:${createHash('sha256').update(bytes).digest('hex')}`;
const fileDescriptor = (path: string): { sha256: string; bytes: number } => {
  const fd = openSync(path, 'r');
  const hash = createHash('sha256');
  const buffer = Buffer.allocUnsafe(1024 * 1024);
  let bytes = 0;
  try {
    while (true) {
      const count = readSync(fd, buffer, 0, buffer.length, null);
      if (!count) break;
      hash.update(buffer.subarray(0, count));
      bytes += count;
    }
  } finally {
    closeSync(fd);
  }
  return { sha256: `sha256:${hash.digest('hex')}`, bytes };
};
const durableCopy = (source: string, target: string): void => {
  mkdirSync(dirname(target), { recursive: true });
  copyFileSync(source, target);
  const fd = openSync(target, 'r');
  try {
    fsyncSync(fd);
  } finally {
    closeSync(fd);
  }
};
const canonical = (value: unknown): string => {
  const normalize = (item: unknown): unknown => {
    if (Array.isArray(item)) return item.map(normalize);
    if (item !== null && typeof item === 'object')
      return Object.fromEntries(
        Object.entries(item)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([key, val]) => [key, normalize(val)]),
      );
    return item;
  };
  return JSON.stringify(normalize(value)) ?? 'null';
};
const parse = <T>(value: string): T => JSON.parse(value) as T;
const validHash = (value: unknown): value is string =>
  typeof value === 'string' && /^sha256:[a-f0-9]{64}$/.test(value);
const portable = (path: string): string => path.split(sep).join('/');
const safeRelative = (path: string): string => {
  if (
    !path ||
    isAbsolute(path) ||
    path.includes('\\') ||
    path.includes('\0') ||
    path.split('/').some((part) => part === '..' || part === '')
  ) {
    throw new Error(`Unsafe relative path: ${path}`);
  }
  return path;
};
const inside = (root: string, path: string): string => {
  const target = resolve(root, safeRelative(path));
  if (!target.startsWith(`${resolve(root)}${sep}`))
    throw new Error(`Path escapes root: ${path}`);
  // Existing symlinks must not redirect reads or writes beyond the configured root.
  let ancestor = target;
  while (!existsSync(ancestor)) ancestor = dirname(ancestor);
  const actual = realpathSync(ancestor);
  const actualRoot = realpathSync(root);
  if (actual !== actualRoot && !actual.startsWith(`${actualRoot}${sep}`))
    throw new Error(`Path escapes root through a symlink: ${path}`);
  return target;
};
const durableWrite = (path: string, bytes: string | Uint8Array): void => {
  mkdirSync(dirname(path), { recursive: true });
  const fd = openSync(path, 'w');
  try {
    writeFileSync(fd, bytes);
    fsyncSync(fd);
  } finally {
    closeSync(fd);
  }
};
const syncDirectory = (directory: string): void => {
  const fd = openSync(directory, 'r');
  try {
    fsyncSync(fd);
  } finally {
    closeSync(fd);
  }
};
const normalizeFiles = (
  files: Record<string, string>,
): Record<string, string> => {
  for (const [name, contents] of Object.entries(files)) {
    safeRelative(name);
    if (typeof contents !== 'string')
      throw new Error(`Snapshot file must contain text: ${name}`);
    if (name.endsWith('.json')) JSON.parse(contents);
  }
  return Object.fromEntries(
    Object.entries(files).sort(([a], [b]) => a.localeCompare(b)),
  );
};
const sourceName = (sourceId: string): string => {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(sourceId))
    throw new Error(`Invalid source ID: ${sourceId}`);
  return sourceId;
};
const referenceValues = (
  files: Record<string, string>,
): Array<{ file: string; pointer: string; hash: string }> => {
  const refs: Array<{ file: string; pointer: string; hash: string }> = [];
  const walk = (file: string, value: unknown, pointer: string): void => {
    if (validHash(value)) {
      refs.push({ file, pointer, hash: value });
      return;
    }
    if (Array.isArray(value))
      value.forEach((item, index) => walk(file, item, `${pointer}/${index}`));
    else if (value && typeof value === 'object')
      for (const [key, item] of Object.entries(value)) {
        walk(
          file,
          item,
          `${pointer}/${key.replaceAll('~', '~0').replaceAll('/', '~1')}`,
        );
      }
  };
  for (const [file, contents] of Object.entries(files))
    if (file.endsWith('.json')) walk(file, JSON.parse(contents), '');
  return refs;
};
const embeddedRecords = (files: Record<string, string>): EvidenceRecord[] => {
  const records = new Map<string, EvidenceRecord>();
  const walk = (value: unknown): void => {
    if (Array.isArray(value)) value.forEach(walk);
    else if (value && typeof value === 'object') {
      if (
        'schemaVersion' in value &&
        value.schemaVersion === 'evidence-record-v1'
      ) {
        const record = EvidenceRecordSchema.parse(value);
        records.set(canonical(record), record);
      }
      Object.values(value).forEach(walk);
    }
  };
  for (const [file, contents] of Object.entries(files))
    if (file.endsWith('.json')) walk(JSON.parse(contents));
  return [...records.values()];
};
const modelsIn = (files: Record<string, string>): string[] => {
  const models = new Set<string>();
  const walk = (value: unknown): void => {
    if (Array.isArray(value)) value.forEach(walk);
    else if (value && typeof value === 'object')
      for (const [key, item] of Object.entries(value)) {
        if (
          (key === 'canonicalModelId' ||
            key === 'modelId' ||
            key === 'rawName') &&
          typeof item === 'string'
        )
          models.add(item);
        walk(item);
      }
  };
  for (const [file, contents] of Object.entries(files))
    if (file.endsWith('.json')) walk(JSON.parse(contents));
  return [...models].sort();
};
const snapshotIdentity = (
  sourceId: string,
  files: Record<string, string>,
  provenance: EvidenceProvenance,
): string => digest(canonical({ sourceId, files, provenance }));

/** SQLite owns acquisition history; source JSON files remain portable projections. */
export class EvidenceStore {
  readonly root: string;
  readonly dbPath: string;
  private readonly db: DatabaseSync;
  private readonly verifiedImports = new Map<
    string,
    { signature: string; hash: string }
  >();

  constructor(root: string, dbPath?: string) {
    this.root = resolve(root);
    mkdirSync(this.root, { recursive: true });
    this.dbPath = dbPath
      ? resolve(this.root, dbPath)
      : join(this.root, 'artifacts/evidence/store.sqlite');
    mkdirSync(dirname(this.dbPath), { recursive: true });
    this.db = new DatabaseSync(this.dbPath);
    try {
      this.db.exec(
        'PRAGMA foreign_keys=ON; PRAGMA busy_timeout=15000; PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL;',
      );
      this.migrate();
      this.recoverSourceUpdates();
      this.recoverExports();
    } catch (error) {
      this.db.close();
      throw error;
    }
  }

  close(): void {
    this.db.close();
  }

  private transaction<T>(work: () => T): T {
    this.db.exec('BEGIN IMMEDIATE');
    try {
      const result = work();
      this.db.exec('COMMIT');
      return result;
    } catch (error) {
      this.db.exec('ROLLBACK');
      throw error;
    }
  }

  private migrate(): void {
    this.transaction(() => {
      const version = Number(
        (
          this.db.prepare('PRAGMA user_version').get() as {
            user_version: number;
          }
        ).user_version,
      );
      if (version > SCHEMA_VERSION)
        throw new Error(
          `Evidence store schema ${version} is newer than supported schema ${SCHEMA_VERSION}`,
        );
      if (version < 1)
        this.db.exec(`
        CREATE TABLE blobs (hash TEXT NOT NULL, path TEXT NOT NULL, size INTEGER, PRIMARY KEY(hash,path));
        CREATE TABLE captures (seq INTEGER PRIMARY KEY AUTOINCREMENT, id TEXT NOT NULL UNIQUE, hash TEXT NOT NULL,
          source_id TEXT NOT NULL, retrieved_at TEXT NOT NULL, record TEXT NOT NULL, http TEXT NOT NULL, provenance TEXT NOT NULL);
        CREATE INDEX captures_source_time ON captures(source_id,retrieved_at,seq);
        CREATE INDEX captures_hash ON captures(hash);
        CREATE TABLE snapshots (seq INTEGER PRIMARY KEY AUTOINCREMENT, id TEXT NOT NULL UNIQUE, source_id TEXT NOT NULL,
          created_at TEXT, imported_at TEXT NOT NULL, files TEXT NOT NULL, provenance TEXT NOT NULL, digest TEXT NOT NULL);
        CREATE INDEX snapshots_source_time ON snapshots(source_id,created_at,seq);
        CREATE TABLE snapshot_refs (snapshot_id TEXT NOT NULL REFERENCES snapshots(id), hash TEXT NOT NULL, file TEXT NOT NULL,
          pointer TEXT NOT NULL, PRIMARY KEY(snapshot_id,file,pointer));
        CREATE INDEX snapshot_refs_hash ON snapshot_refs(hash);
        CREATE TABLE snapshot_models (snapshot_id TEXT NOT NULL REFERENCES snapshots(id), model TEXT NOT NULL, PRIMARY KEY(snapshot_id,model));
        CREATE TABLE current_snapshots (source_id TEXT PRIMARY KEY, snapshot_id TEXT NOT NULL REFERENCES snapshots(id));
        CREATE TABLE processes (key TEXT PRIMARY KEY, source_id TEXT NOT NULL, inputs TEXT NOT NULL, parser_version TEXT NOT NULL,
          config TEXT NOT NULL, snapshot_id TEXT NOT NULL REFERENCES snapshots(id));
        CREATE TABLE export_journal (id TEXT PRIMARY KEY, snapshot_id TEXT NOT NULL REFERENCES snapshots(id), destination TEXT NOT NULL,
          state TEXT NOT NULL CHECK(state IN ('pending','complete')));
        PRAGMA user_version=1;
      `);
      if (version < 2)
        this.db.exec(`
        CREATE TABLE attempts (seq INTEGER PRIMARY KEY AUTOINCREMENT, id TEXT NOT NULL UNIQUE, source_id TEXT NOT NULL, retrieved_at TEXT NOT NULL, request_url TEXT NOT NULL, error TEXT NOT NULL, status INTEGER);
        CREATE INDEX attempts_source_time ON attempts(source_id,retrieved_at,seq);
        CREATE TABLE source_updates (id TEXT PRIMARY KEY, owner_pid INTEGER NOT NULL, owner_identity TEXT NOT NULL, baselines TEXT NOT NULL, state TEXT NOT NULL CHECK(state IN ('pending','complete','aborted')));
        PRAGMA user_version=2;
      `);
    });
  }

  private registerRecord(record: EvidenceRecord, requireBytes = false): void {
    EvidenceRecordSchema.parse(record);
    if (record.id !== record.sha256)
      throw new Error('Evidence ID must equal its content hash');
    const path = inside(this.root, record.artifactPath);
    if (!existsSync(path) && requireBytes)
      throw new Error(`Missing evidence blob: ${record.artifactPath}`);
    if (existsSync(path)) {
      const info = statSync(path, { bigint: true });
      const signature = `${info.dev}:${info.ino}:${info.size}:${info.mtimeNs}:${info.ctimeNs}`;
      const verified = this.verifiedImports.get(path);
      if (
        requireBytes ||
        verified?.signature !== signature ||
        verified.hash !== record.sha256 ||
        info.size !== BigInt(record.byteLength)
      ) {
        const descriptor = fileDescriptor(path);
        if (
          descriptor.sha256 !== record.sha256 ||
          descriptor.bytes !== record.byteLength
        )
          throw new Error(`Corrupt evidence blob: ${record.artifactPath}`);
        this.verifiedImports.set(path, { signature, hash: descriptor.sha256 });
      }
      if (requireBytes) {
        const fd = openSync(path, 'r');
        try {
          fsyncSync(fd);
        } finally {
          closeSync(fd);
        }
        syncDirectory(dirname(path));
      }
    }
    this.db
      .prepare(
        'INSERT INTO blobs(hash,path,size) VALUES(?,?,?) ON CONFLICT(hash,path) DO UPDATE SET size=excluded.size',
      )
      .run(record.sha256, record.artifactPath, record.byteLength);
  }

  recordCapture(record: EvidenceRecord, http: CaptureHttp = {}): string {
    const id = `capture:${randomUUID()}`;
    return this.transaction(() => {
      this.registerRecord(record, true);
      this.db
        .prepare(
          'INSERT INTO captures(id,hash,source_id,retrieved_at,record,http,provenance) VALUES(?,?,?,?,?,?,?)',
        )
        .run(
          id,
          record.sha256,
          record.sourceId,
          record.retrievedAt,
          canonical(record),
          canonical(http),
          canonical({ kind: 'capture' }),
        );
      return id;
    });
  }

  /** Imports retain the observation timestamp; the same historical event imports once. */
  importCapture(
    record: EvidenceRecord,
    provenance: EvidenceProvenance = { kind: 'import' },
  ): string {
    const id = `capture:${digest(canonical(record)).slice(7)}`;
    return this.transaction(() => {
      this.registerRecord(record);
      this.db
        .prepare(
          'INSERT OR IGNORE INTO captures(id,hash,source_id,retrieved_at,record,http,provenance) VALUES(?,?,?,?,?,?,?)',
        )
        .run(
          id,
          record.sha256,
          record.sourceId,
          record.retrievedAt,
          canonical(record),
          '{}',
          canonical(provenance),
        );
      return id;
    });
  }

  importBlob(path: string): string {
    const target = inside(this.root, path);
    const descriptor = fileDescriptor(target);
    const hash = descriptor.sha256;
    // Content-addressed filenames are also evidence and must agree with the bytes.
    const filenameHash = /(?:^|\/)([a-f0-9]{64})(?:\.[^/]*)?$/.exec(path)?.[1];
    if (filenameHash && hash !== `sha256:${filenameHash}`)
      throw new Error(`Corrupt evidence blob: ${path}`);
    this.db
      .prepare(
        'INSERT INTO blobs(hash,path,size) VALUES(?,?,?) ON CONFLICT(hash,path) DO UPDATE SET size=excluded.size',
      )
      .run(hash, path, descriptor.bytes);
    return hash;
  }

  scanArtifacts(): { added: number; files: number } {
    let added = 0;
    let files = 0;
    const directory = join(this.root, 'artifacts/sha256');
    const walk = (path: string): void => {
      for (const entry of readdirSync(path, { withFileTypes: true })) {
        const child = join(path, entry.name);
        if (entry.isDirectory()) walk(child);
        else if (entry.isFile()) {
          const portablePath = portable(relative(this.root, child));
          if (
            !this.db
              .prepare('SELECT 1 FROM blobs WHERE path=?')
              .get(portablePath)
          )
            added++;
          this.importBlob(portablePath);
          files++;
        }
      }
    };
    if (existsSync(directory)) this.transaction(() => walk(directory));
    return { added, files };
  }

  importSnapshot(
    sourceId: string,
    files: Record<string, string>,
    provenance: EvidenceProvenance,
  ): string {
    sourceName(sourceId);
    const normalized = normalizeFiles(files);
    if (!provenance.kind)
      throw new Error('Snapshot provenance kind is required');
    const id = snapshotIdentity(sourceId, normalized, provenance);
    const evidence = embeddedRecords(normalized);
    const createdAt =
      provenance.createdAt ??
      evidence
        .map((record) => record.retrievedAt)
        .sort()
        .at(-1) ??
      null;
    this.transaction(() => {
      for (const record of evidence) {
        this.registerRecord(record);
        const captureId = `capture:${digest(canonical(record)).slice(7)}`;
        if (
          !this.db
            .prepare(
              'SELECT 1 FROM captures WHERE hash=? AND source_id=? AND retrieved_at=? AND record=? LIMIT 1',
            )
            .get(
              record.sha256,
              record.sourceId,
              record.retrievedAt,
              canonical(record),
            )
        )
          this.db
            .prepare(
              'INSERT OR IGNORE INTO captures(id,hash,source_id,retrieved_at,record,http,provenance) VALUES(?,?,?,?,?,?,?)',
            )
            .run(
              captureId,
              record.sha256,
              record.sourceId,
              record.retrievedAt,
              canonical(record),
              '{}',
              canonical(provenance),
            );
      }
      const inserted = this.db
        .prepare(
          'INSERT OR IGNORE INTO snapshots(id,source_id,created_at,imported_at,files,provenance,digest) VALUES(?,?,?,?,?,?,?)',
        )
        .run(
          id,
          sourceId,
          createdAt,
          new Date().toISOString(),
          canonical(normalized),
          canonical(provenance),
          digest(canonical(normalized)),
        );
      if (!Number(inserted.changes)) return;
      for (const ref of referenceValues(normalized))
        this.db
          .prepare(
            'INSERT INTO snapshot_refs(snapshot_id,hash,file,pointer) VALUES(?,?,?,?)',
          )
          .run(id, ref.hash, ref.file, ref.pointer);
      for (const model of modelsIn(normalized))
        this.db
          .prepare('INSERT INTO snapshot_models(snapshot_id,model) VALUES(?,?)')
          .run(id, model);
    });
    return id;
  }

  private decodeSnapshot(row: SnapshotRow): StoredSnapshot {
    return {
      id: row.id,
      sourceId: row.source_id,
      files: parse(row.files),
      provenance: parse(row.provenance),
      createdAt: row.created_at,
    };
  }

  getSnapshot(id: string): StoredSnapshot {
    const row = this.db
      .prepare('SELECT * FROM snapshots WHERE id=?')
      .get(id) as SnapshotRow | undefined;
    if (!row) throw new Error(`Unknown snapshot: ${id}`);
    if (
      digest(canonical(parse(row.files))) !== row.digest ||
      snapshotIdentity(
        row.source_id,
        parse(row.files),
        parse(row.provenance),
      ) !== row.id
    ) {
      throw new Error(`Corrupt stored snapshot: ${id}`);
    }
    return this.decodeSnapshot(row);
  }

  private queryParts(
    query: EvidenceQuery,
    kind: 'snapshots' | 'captures',
  ): { where: string; args: Array<string | number> } {
    const clauses: string[] = [];
    const args: Array<string | number> = [];
    if (query.sourceId) {
      clauses.push('s.source_id=?');
      args.push(query.sourceId);
    }
    const time = kind === 'captures' ? 's.retrieved_at' : 's.created_at';
    if (query.from) {
      clauses.push(`${time}>=?`);
      args.push(query.from);
    }
    if (query.to) {
      clauses.push(`${time}<=?`);
      args.push(query.to);
    }
    if (query.hash) {
      clauses.push(
        kind === 'captures'
          ? 's.hash=?'
          : 'EXISTS(SELECT 1 FROM snapshot_refs r WHERE r.snapshot_id=s.id AND r.hash=?)',
      );
      args.push(query.hash);
    }
    if (query.model) {
      clauses.push(
        kind === 'snapshots'
          ? 'EXISTS(SELECT 1 FROM snapshot_models m WHERE m.snapshot_id=s.id AND m.model=?)'
          : 'EXISTS(SELECT 1 FROM snapshot_refs r JOIN snapshot_models m ON m.snapshot_id=r.snapshot_id WHERE r.hash=s.hash AND m.model=?)',
      );
      args.push(query.model);
    }
    const limit = query.limit ?? 100;
    const offset = query.offset ?? 0;
    if (
      !Number.isSafeInteger(limit) ||
      limit < 0 ||
      !Number.isSafeInteger(offset) ||
      offset < 0
    )
      throw new Error(
        'Pagination requires nonnegative integer limit and offset',
      );
    args.push(limit, offset);
    return {
      where: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '',
      args,
    };
  }

  snapshots(query: EvidenceQuery = {}): StoredSnapshot[] {
    const { where, args } = this.queryParts(query, 'snapshots');
    return (
      this.db
        .prepare(
          `SELECT s.* FROM snapshots s ${where} ORDER BY s.seq LIMIT ? OFFSET ?`,
        )
        .all(...args) as unknown as SnapshotRow[]
    ).map((row) => this.getSnapshot(row.id));
  }
  history(query: EvidenceQuery = {}): StoredSnapshot[] {
    return this.snapshots(query);
  }
  captures(query: EvidenceQuery = {}): StoredCapture[] {
    const { where, args } = this.queryParts(query, 'captures');
    const rows = this.db
      .prepare(
        `SELECT s.* FROM captures s ${where} ORDER BY s.seq LIMIT ? OFFSET ?`,
      )
      .all(...args) as unknown as Array<{
      id: string;
      record: string;
      http: string;
      provenance: string;
    }>;
    return rows.map((row) => ({
      id: row.id,
      record: parse(row.record),
      http: parse(row.http),
      provenance: parse(row.provenance),
    }));
  }

  currentSnapshot(sourceId: string): StoredSnapshot | null {
    const row = this.db
      .prepare('SELECT snapshot_id FROM current_snapshots WHERE source_id=?')
      .get(sourceId) as { snapshot_id: string } | undefined;
    return row ? this.getSnapshot(row.snapshot_id) : null;
  }

  setCurrentSnapshot(id: string): void {
    const snapshot = this.getSnapshot(id);
    if (snapshot.provenance.kind === 'process')
      throw new Error(
        'Process cache snapshots cannot be current source projections',
      );
    this.db
      .prepare(
        'INSERT INTO current_snapshots(source_id,snapshot_id) VALUES(?,?) ON CONFLICT(source_id) DO UPDATE SET snapshot_id=excluded.snapshot_id',
      )
      .run(snapshot.sourceId, id);
  }

  references(
    hash: string,
    options: { scope?: 'current' | 'history' } = {},
  ): EvidenceReference[] {
    const current =
      options.scope === 'current'
        ? 'JOIN current_snapshots c ON c.snapshot_id=s.id'
        : '';
    const rows = this.db
      .prepare(
        `SELECT s.id AS snapshotId,s.source_id AS sourceId,r.file,r.pointer,r.hash FROM snapshot_refs r JOIN snapshots s ON s.id=r.snapshot_id ${current} WHERE r.hash=? ORDER BY s.seq,r.file,r.pointer`,
      )
      .all(hash);
    return rows as unknown as EvidenceReference[];
  }

  diffSnapshots(
    from: string,
    to: string,
  ): {
    from: string;
    to: string;
    files: Array<{
      file: string;
      before: string | null;
      after: string | null;
      structured?: {
        added: unknown[];
        removed: unknown[];
        changed: Array<{ id: string; before: unknown; after: unknown }>;
      };
    }>;
  } {
    const before = this.getSnapshot(from).files;
    const after = this.getSnapshot(to).files;
    const files: ReturnType<EvidenceStore['diffSnapshots']>['files'] = [];
    for (const file of [
      ...new Set([...Object.keys(before), ...Object.keys(after)]),
    ].sort()) {
      if (before[file] === after[file]) continue;
      const change: (typeof files)[number] = {
        file,
        before: before[file] ?? null,
        after: after[file] ?? null,
      };
      if (file.endsWith('.json')) {
        const a: unknown = before[file] ? JSON.parse(before[file]) : [];
        const b: unknown = after[file] ? JSON.parse(after[file]) : [];
        if (Array.isArray(a) && Array.isArray(b)) {
          const key = (item: unknown): string =>
            item && typeof item === 'object' && 'id' in item
              ? String(item.id)
              : canonical(item);
          const left = new Map(a.map((item: unknown) => [key(item), item]));
          const right = new Map(b.map((item: unknown) => [key(item), item]));
          change.structured = {
            added: [...right]
              .filter(([id]) => !left.has(id))
              .map(([, item]) => item),
            removed: [...left]
              .filter(([id]) => !right.has(id))
              .map(([, item]) => item),
            changed: [...left]
              .filter(
                ([id, item]) =>
                  right.has(id) && canonical(item) !== canonical(right.get(id)),
              )
              .map(([id, item]) => ({
                id,
                before: item,
                after: right.get(id),
              })),
          };
        }
      }
      files.push(change);
    }
    return { from, to, files };
  }

  private processKey(input: ProcessInput): string {
    return digest(
      canonical({
        ...input,
        inputs: input.inputs.map((record) =>
          EvidenceRecordSchema.parse(record),
        ),
      }),
    );
  }
  lookupProcess(
    input: ProcessInput,
    options: { force?: boolean | undefined } = {},
  ): ProcessLookup {
    const key = this.processKey(input);
    if (options.force) return { hit: false, reason: 'forced', key };
    for (const record of input.inputs) {
      const path = inside(this.root, record.artifactPath);
      if (!existsSync(path))
        return {
          hit: false,
          reason: `input-missing:${record.artifactPath}`,
          key,
        };
      const descriptor = fileDescriptor(path);
      if (
        descriptor.sha256 !== record.sha256 ||
        descriptor.bytes !== record.byteLength
      )
        return {
          hit: false,
          reason: `input-corrupt:${record.artifactPath}`,
          key,
        };
    }
    const row = this.db
      .prepare('SELECT snapshot_id FROM processes WHERE key=?')
      .get(key) as { snapshot_id: string } | undefined;
    if (!row) return { hit: false, reason: 'key-not-found', key };
    try {
      const snapshot = this.getSnapshot(row.snapshot_id);
      return {
        hit: true,
        reason: 'verified-inputs',
        key,
        snapshotId: snapshot.id,
        files: snapshot.files,
      };
    } catch {
      return { hit: false, reason: 'output-corrupt', key };
    }
  }
  storeProcess(input: ProcessInput, files: Record<string, string>): string {
    const invalid = this.lookupProcess(input);
    if (invalid.reason.startsWith('input-'))
      throw new Error(`Cannot cache ${invalid.reason}`);
    const key = this.processKey(input);
    const snapshotId = this.importSnapshot(input.sourceId, files, {
      kind: 'process',
      revision: key,
    });
    this.transaction(() => {
      for (const record of input.inputs) this.registerRecord(record);
      this.db
        .prepare(
          'INSERT INTO processes(key,source_id,inputs,parser_version,config,snapshot_id) VALUES(?,?,?,?,?,?) ON CONFLICT(key) DO UPDATE SET snapshot_id=excluded.snapshot_id',
        )
        .run(
          key,
          input.sourceId,
          canonical(input.inputs),
          input.parserVersion,
          canonical(input.config),
          snapshotId,
        );
    });
    return snapshotId;
  }

  /** Pending plans are durable before publication; opening the store finishes them. */
  exportSnapshot(id: string, directory?: string): void {
    const snapshot = this.getSnapshot(id);
    if (snapshot.provenance.kind === 'process')
      throw new Error(
        'Process cache snapshots cannot be exported as source projections',
      );
    const destination = directory
      ? resolve(this.root, directory)
      : join(this.root, 'data/sources', snapshot.sourceId);
    const sourceRoot = join(this.root, 'data/sources');
    mkdirSync(sourceRoot, { recursive: true });
    if (
      destination === sourceRoot ||
      !destination.startsWith(`${sourceRoot}${sep}`)
    )
      throw new Error('Snapshot export must be inside data/sources');
    const portableDestination = portable(relative(this.root, destination));
    inside(this.root, portableDestination);
    const journalId = randomUUID();
    this.transaction(() => {
      this.db
        .prepare(
          'INSERT INTO export_journal(id,snapshot_id,destination,state) VALUES(?,?,?,?)',
        )
        .run(journalId, id, portableDestination, 'pending');
    });
    this.recoverExports();
  }
  recoverExports(): number {
    return this.transaction(() => {
      const plans = this.db
        .prepare(
          "SELECT * FROM export_journal WHERE state='pending' ORDER BY rowid",
        )
        .all() as unknown as Array<{
        id: string;
        snapshot_id: string;
        destination: string;
      }>;
      for (const plan of plans) {
        const snapshot = this.getSnapshot(plan.snapshot_id);
        const destination = inside(this.root, plan.destination);
        const sourceRoot = join(this.root, 'data/sources');
        if (!destination.startsWith(`${sourceRoot}${sep}`))
          throw new Error(
            'Journal export destination must be inside data/sources',
          );
        mkdirSync(destination, { recursive: true });
        const prune = (directory: string): void => {
          for (const entry of readdirSync(directory, { withFileTypes: true })) {
            const target = join(directory, entry.name);
            if (entry.isDirectory()) {
              prune(target);
              if (
                !readdirSync(target).length &&
                !Object.keys(snapshot.files).some((file) =>
                  file.startsWith(
                    `${portable(relative(destination, target))}/`,
                  ),
                )
              )
                rmSync(target, { recursive: true });
            } else if (
              !(portable(relative(destination, target)) in snapshot.files)
            )
              rmSync(target, { force: true });
          }
          syncDirectory(directory);
        };
        prune(destination);
        for (const [file, contents] of Object.entries(snapshot.files)) {
          const target = inside(this.root, `${plan.destination}/${file}`);
          const temporary = `${target}.evidence-${plan.id}.tmp`;
          durableWrite(temporary, contents);
          renameSync(temporary, target);
          syncDirectory(dirname(target));
        }
        syncDirectory(dirname(destination));
        this.setCurrentSnapshot(snapshot.id);
        this.db
          .prepare("UPDATE export_journal SET state='complete' WHERE id=?")
          .run(plan.id);
      }
      return plans.length;
    });
  }

  verify(): VerificationReport {
    const issues: VerificationIssue[] = [];
    const integrity = this.db
      .prepare('PRAGMA integrity_check')
      .all() as unknown as Array<{ integrity_check: string }>;
    for (const row of integrity)
      if (row.integrity_check !== 'ok')
        issues.push({ kind: 'sqlite', message: row.integrity_check });
    for (const row of this.db.prepare('PRAGMA foreign_key_check').all())
      issues.push({ kind: 'foreign-key', message: canonical(row) });
    const blobs = this.db
      .prepare('SELECT * FROM blobs ORDER BY hash,path')
      .all() as unknown as BlobRow[];
    let unknown = 0;
    for (const blob of blobs) {
      try {
        const path = inside(this.root, blob.path);
        if (!existsSync(path)) {
          unknown++;
          issues.push({
            kind: 'missing-blob',
            hash: blob.hash,
            path: blob.path,
            message: 'Historical bytes unavailable',
          });
          continue;
        }
        const descriptor = fileDescriptor(path);
        if (
          descriptor.sha256 !== blob.hash ||
          (blob.size !== null && blob.size !== descriptor.bytes)
        )
          issues.push({
            kind: 'corrupt-blob',
            hash: blob.hash,
            path: blob.path,
            message: 'Blob hash or size differs from stored descriptor',
          });
      } catch (error) {
        issues.push({
          kind: 'invalid-path',
          hash: blob.hash,
          path: blob.path,
          message: String(error),
        });
      }
    }
    const snapshots = this.db
      .prepare('SELECT id FROM snapshots ORDER BY seq')
      .all() as unknown as Array<{ id: string }>;
    for (const { id } of snapshots) {
      try {
        const snapshot = this.getSnapshot(id);
        const expected = referenceValues(snapshot.files).sort((a, b) =>
          canonical(a).localeCompare(canonical(b)),
        );
        const actual = this.db
          .prepare(
            'SELECT file,pointer,hash FROM snapshot_refs WHERE snapshot_id=?',
          )
          .all(id)
          .map((item) => ({
            file: String(item.file),
            pointer: String(item.pointer),
            hash: String(item.hash),
          }))
          .sort((a, b) => canonical(a).localeCompare(canonical(b)));
        if (canonical(expected) !== canonical(actual))
          issues.push({
            kind: 'snapshot-references',
            snapshotId: id,
            message: 'Reference index differs from immutable snapshot contents',
          });
        const index = snapshot.files['evidence-index.json']
          ? EvidenceRecordSchema.array().parse(
              JSON.parse(snapshot.files['evidence-index.json']),
            )
          : [];
        const indexed = new Set(index.map((record) => record.id));
        for (const ref of expected)
          if (
            ['candidates.json', 'costs.json'].includes(ref.file) &&
            !indexed.has(ref.hash)
          ) {
            issues.push({
              kind: 'unindexed-reference',
              snapshotId: id,
              hash: ref.hash,
              path: ref.file,
              message: `Reference ${ref.pointer} has no evidence-index record`,
            });
          }
      } catch (error) {
        issues.push({
          kind: 'corrupt-snapshot',
          snapshotId: id,
          message: String(error),
        });
      }
    }
    const captureRows = this.db
      .prepare('SELECT id,hash,record FROM captures ORDER BY seq')
      .all() as unknown as Array<{ id: string; hash: string; record: string }>;
    for (const row of captureRows) {
      try {
        const record = EvidenceRecordSchema.parse(JSON.parse(row.record));
        if (row.hash !== record.sha256 || record.id !== record.sha256)
          throw new Error('Capture digest differs from record');
      } catch (error) {
        issues.push({
          kind: 'corrupt-capture',
          message: `${row.id}: ${String(error)}`,
        });
      }
    }
    return {
      ok: issues.length === 0,
      blobs: blobs.length,
      captures: captureRows.length,
      snapshots: snapshots.length,
      unknown,
      issues,
    };
  }

  recordFailure(input: {
    sourceId: string;
    requestUrl: string;
    retrievedAt: string;
    error: string;
    status?: number | undefined;
  }): string {
    sourceName(input.sourceId);
    if (!Number.isFinite(Date.parse(input.retrievedAt)))
      throw new Error('Failure timestamp must be an observation time');
    const id = `attempt:${randomUUID()}`;
    this.db
      .prepare(
        'INSERT INTO attempts(id,source_id,retrieved_at,request_url,error,status) VALUES(?,?,?,?,?,?)',
      )
      .run(
        id,
        input.sourceId,
        input.retrievedAt,
        input.requestUrl,
        input.error,
        input.status ?? null,
      );
    return id;
  }
  failures(query: EvidenceQuery = {}): Array<{
    id: string;
    sourceId: string;
    retrievedAt: string;
    requestUrl: string;
    error: string;
    status: number | null;
  }> {
    const { model: _model, hash: _hash, ...filters } = query;
    const { where, args } = this.queryParts(filters, 'captures');
    return this.db
      .prepare(
        `SELECT s.id,s.source_id AS sourceId,s.retrieved_at AS retrievedAt,s.request_url AS requestUrl,s.error,s.status FROM attempts s ${where} ORDER BY s.seq LIMIT ? OFFSET ?`,
      )
      .all(...args) as unknown as ReturnType<EvidenceStore['failures']>;
  }

  private ownerIdentity(pid: number): string {
    try {
      const stat = readFileSync(`/proc/${pid}/stat`, 'utf8');
      return (
        stat.slice(stat.lastIndexOf(')') + 2).split(' ')[19] ?? String(pid)
      );
    } catch {
      return String(pid);
    }
  }
  private ownerAlive(pid: number, identity: string): boolean {
    try {
      process.kill(pid, 0);
      return this.ownerIdentity(pid) === identity;
    } catch (error) {
      return (error as NodeJS.ErrnoException).code === 'EPERM';
    }
  }
  private sourceFiles(sourceId: string): {
    exists: boolean;
    files: Record<string, string>;
  } {
    const directory = join(this.root, 'data/sources', sourceName(sourceId));
    const files: Record<string, string> = {};
    const walk = (path: string): void => {
      for (const entry of readdirSync(path, { withFileTypes: true })) {
        const child = join(path, entry.name);
        if (entry.isSymbolicLink())
          throw new Error(`Source update cannot journal a symlink: ${child}`);
        if (entry.isDirectory()) walk(child);
        else if (entry.isFile())
          files[portable(relative(directory, child))] =
            readFileSync(child).toString('base64');
      }
    };
    const present = existsSync(directory);
    if (present) walk(directory);
    return { exists: present, files };
  }
  beginSourceUpdate(sourceIds: readonly string[]): string {
    const id = `update:${randomUUID()}`;
    this.transaction(() => {
      const pending = this.db
        .prepare("SELECT baselines FROM source_updates WHERE state='pending'")
        .all() as unknown as Array<{ baselines: string }>;
      const activeSources = new Set(
        pending.flatMap((row) =>
          Object.keys(parse<Record<string, unknown>>(row.baselines)),
        ),
      );
      for (const sourceId of sourceIds)
        if (activeSources.has(sourceId))
          throw new Error(`Source update already in progress: ${sourceId}`);
      const baselines = Object.fromEntries(
        [...new Set(sourceIds)].map((sourceId) => [
          sourceName(sourceId),
          {
            ...this.sourceFiles(sourceId),
            currentSnapshotId: this.currentSnapshot(sourceId)?.id ?? null,
          },
        ]),
      );
      this.db
        .prepare(
          'INSERT INTO source_updates(id,owner_pid,owner_identity,baselines,state) VALUES(?,?,?,?,?)',
        )
        .run(
          id,
          process.pid,
          this.ownerIdentity(process.pid),
          canonical(baselines),
          'pending',
        );
    });
    return id;
  }
  completeSourceUpdate(id: string): void {
    const result = this.db
      .prepare(
        "UPDATE source_updates SET state='complete',baselines='{}' WHERE id=? AND state='pending'",
      )
      .run(id);
    if (!Number(result.changes))
      throw new Error(`Unknown pending source update: ${id}`);
  }
  abortSourceUpdate(id: string): void {
    this.transaction(() => this.rollbackSourceUpdate(id));
  }
  private rollbackSourceUpdate(id: string): void {
    const row = this.db
      .prepare(
        "SELECT baselines FROM source_updates WHERE id=? AND state='pending'",
      )
      .get(id) as { baselines: string } | undefined;
    if (!row) return;
    const baselines = parse<
      Record<
        string,
        {
          exists: boolean;
          files: Record<string, string>;
          currentSnapshotId?: string | null;
        }
      >
    >(row.baselines);
    for (const [sourceId, baseline] of Object.entries(baselines)) {
      const directory = inside(
        this.root,
        `data/sources/${sourceName(sourceId)}`,
      );
      this.db
        .prepare(
          "UPDATE export_journal SET state='complete' WHERE state='pending' AND snapshot_id IN (SELECT id FROM snapshots WHERE source_id=?)",
        )
        .run(sourceId);
      if (baseline.currentSnapshotId)
        this.setCurrentSnapshot(baseline.currentSnapshotId);
      else
        this.db
          .prepare('DELETE FROM current_snapshots WHERE source_id=?')
          .run(sourceId);
      // The durable baseline remains pending until every original file and directory is restored.
      rmSync(directory, { recursive: true, force: true });
      if (baseline.exists) {
        mkdirSync(directory, { recursive: true });
        for (const [file, bytes] of Object.entries(baseline.files))
          durableWrite(
            inside(this.root, `data/sources/${sourceId}/${safeRelative(file)}`),
            Buffer.from(bytes, 'base64'),
          );
        syncDirectory(directory);
      }
      if (existsSync(dirname(directory))) syncDirectory(dirname(directory));
    }
    this.db
      .prepare(
        "UPDATE source_updates SET state='aborted',baselines='{}' WHERE id=?",
      )
      .run(id);
  }
  recoverSourceUpdates(): number {
    return this.transaction(() => {
      const updates = this.db
        .prepare(
          "SELECT id,owner_pid,owner_identity FROM source_updates WHERE state='pending' ORDER BY rowid",
        )
        .all() as unknown as Array<{
        id: string;
        owner_pid: number;
        owner_identity: string;
      }>;
      let recovered = 0;
      for (const update of updates)
        if (!this.ownerAlive(update.owner_pid, update.owner_identity)) {
          this.rollbackSourceUpdate(update.id);
          recovered++;
        }
      return recovered;
    });
  }

  backup(directory: string): BackupManifest {
    const destination = resolve(directory);
    if (existsSync(destination) && readdirSync(destination).length > 0)
      throw new Error('Backup destination must be empty');
    mkdirSync(destination, { recursive: true });
    const databasePath = 'store.sqlite';
    // VACUUM INTO creates a consistent, standalone SQLite image including committed WAL pages.
    this.db.prepare('VACUUM INTO ?').run(join(destination, databasePath));
    const snapshotDb = new DatabaseSync(join(destination, databasePath), {
      readOnly: true,
    });
    const blobRows = snapshotDb
      .prepare('SELECT * FROM blobs ORDER BY path,hash')
      .all() as unknown as BlobRow[];
    snapshotDb.close();
    const databaseDescriptor = fileDescriptor(join(destination, databasePath));
    const manifest: BackupManifest = {
      version: 1,
      database: {
        path: databasePath,
        sha256: databaseDescriptor.sha256,
        bytes: databaseDescriptor.bytes,
      },
      blobs: [],
      unknown: [],
    };
    const copied = new Set<string>();
    for (const blob of blobRows) {
      const source = inside(this.root, blob.path);
      if (!existsSync(source)) {
        manifest.unknown.push({ hash: blob.hash, path: blob.path });
        continue;
      }
      const descriptor = fileDescriptor(source);
      if (
        descriptor.sha256 !== blob.hash ||
        (blob.size !== null && blob.size !== descriptor.bytes)
      )
        throw new Error(`Cannot back up corrupt blob: ${blob.path}`);
      if (copied.has(blob.path)) continue;
      const path = `blobs/${safeRelative(blob.path)}`;
      durableCopy(source, join(destination, path));
      manifest.blobs.push({
        path: blob.path,
        sha256: blob.hash,
        bytes: descriptor.bytes,
      });
      copied.add(blob.path);
    }
    const backupFd = openSync(join(destination, databasePath), 'r');
    try {
      fsyncSync(backupFd);
    } finally {
      closeSync(backupFd);
    }
    durableWrite(
      join(destination, 'manifest.json'),
      `${canonical(manifest)}\n`,
    );
    syncDirectory(destination);
    return manifest;
  }

  static restore(
    directory: string,
    root: string,
    dbPath?: string,
  ): EvidenceStore {
    const backupRoot = resolve(directory);
    const manifest = parse<BackupManifest>(
      readFileSync(join(backupRoot, 'manifest.json'), 'utf8'),
    );
    if (
      manifest.version !== 1 ||
      !Array.isArray(manifest.blobs) ||
      !Array.isArray(manifest.unknown)
    )
      throw new Error('Unsupported backup manifest');
    const targetRoot = resolve(root);
    mkdirSync(targetRoot, { recursive: true });
    const targetDb = dbPath
      ? resolve(targetRoot, dbPath)
      : join(targetRoot, 'artifacts/evidence/store.sqlite');
    if (
      existsSync(targetDb) ||
      existsSync(`${targetDb}-wal`) ||
      existsSync(`${targetDb}-shm`)
    )
      throw new Error('Restore requires an empty database destination');
    const backupDbPath = inside(backupRoot, manifest.database.path);
    const databaseDescriptor = fileDescriptor(backupDbPath);
    if (
      databaseDescriptor.sha256 !== manifest.database.sha256 ||
      databaseDescriptor.bytes !== manifest.database.bytes
    )
      throw new Error('Backup database checksum mismatch');
    const validation = new DatabaseSync(
      inside(backupRoot, manifest.database.path),
      { readOnly: true },
    );
    try {
      const check = validation.prepare('PRAGMA integrity_check').get() as {
        integrity_check: string;
      };
      if (check.integrity_check !== 'ok')
        throw new Error('Backup database integrity check failed');
      const rows = validation
        .prepare('SELECT * FROM blobs')
        .all() as unknown as BlobRow[];
      const listed = new Map(
        manifest.blobs.map((blob) => [`${blob.sha256}\0${blob.path}`, blob]),
      );
      const unknown = new Set(
        manifest.unknown.map((blob) => `${blob.hash}\0${blob.path}`),
      );
      for (const row of rows)
        if (
          !listed.has(`${row.hash}\0${row.path}`) &&
          !unknown.has(`${row.hash}\0${row.path}`)
        )
          throw new Error(`Backup manifest omits blob: ${row.path}`);
    } finally {
      validation.close();
    }
    // Verify the complete package before creating any live database.
    for (const blob of manifest.blobs) {
      safeRelative(blob.path);
      const descriptor = fileDescriptor(
        inside(backupRoot, `blobs/${blob.path}`),
      );
      if (descriptor.sha256 !== blob.sha256 || descriptor.bytes !== blob.bytes)
        throw new Error(`Backup blob checksum mismatch: ${blob.path}`);
      const path = inside(targetRoot, blob.path);
      if (existsSync(path) && fileDescriptor(path).sha256 !== blob.sha256)
        throw new Error(`Restore would replace different bytes: ${blob.path}`);
    }
    for (const blob of manifest.blobs)
      durableCopy(
        inside(backupRoot, `blobs/${blob.path}`),
        inside(targetRoot, blob.path),
      );
    mkdirSync(dirname(targetDb), { recursive: true });
    durableCopy(backupDbPath, `${targetDb}.restore.tmp`);
    renameSync(`${targetDb}.restore.tmp`, targetDb);
    syncDirectory(dirname(targetDb));
    const store = new EvidenceStore(targetRoot, targetDb);
    try {
      const current = store.db
        .prepare('SELECT snapshot_id FROM current_snapshots ORDER BY source_id')
        .all() as unknown as Array<{ snapshot_id: string }>;
      for (const row of current) store.exportSnapshot(row.snapshot_id);
      return store;
    } catch (error) {
      store.close();
      throw error;
    }
  }
}
