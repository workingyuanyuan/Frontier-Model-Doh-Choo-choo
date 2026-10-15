import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

import { EvidenceStore, type EvidenceQuery } from './evidence-store.js';
import { migrateEvidence } from './evidence-migration.js';
import { getWorkspaceRoot } from './refresh-utils.js';

const COMMANDS = [
  'init',
  'find',
  'captures',
  'failures',
  'snapshots',
  'diff',
  'references',
  'verify',
  'export',
  'read',
  'raw',
  'backup',
  'restore',
  'recover',
] as const;
const ALLOWED = new Set([
  'root',
  'db',
  'history',
  'history-limit',
  'no-scan',
  'source',
  'model',
  'from',
  'to',
  'hash',
  'offset',
  'limit',
  'snapshot',
  'before',
  'after',
  'scope',
  'file',
  'start',
  'length',
  'directory',
]);

export function parseEvidenceArguments(args: string[]) {
  const tokens = args.filter((arg) => arg !== '--');
  const command = tokens.shift() ?? 'help';
  const options: Record<string, string> = {};
  for (let index = 0; index < tokens.length; index++) {
    const token = tokens[index]!;
    const match = /^--([a-z-]+)(?:=(.*))?$/u.exec(token);
    if (!match || !ALLOWED.has(match[1]!))
      throw new Error(`Unknown option: ${token}`);
    const name = match[1]!;
    if (name in options) throw new Error(`Duplicate option: --${name}`);
    if (['history', 'no-scan'].includes(name)) {
      if (match[2] !== undefined) throw new Error(`--${name} takes no value`);
      options[name] = 'true';
    } else {
      const value = match[2] ?? tokens[++index];
      if (!value || value.startsWith('--'))
        throw new Error(`--${name} requires a value`);
      options[name] = value;
    }
  }
  return { command, options };
}

const integer = (
  value: string | undefined,
  fallback: number,
  maximum: number,
): number => {
  if (value === undefined) return fallback;
  if (!/^\d+$/u.test(value)) throw new Error('Expected a nonnegative integer');
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number > maximum)
    throw new Error(`Integer must be at most ${maximum}`);
  return number;
};

export function runEvidenceCommand(args: string[]): {
  value: unknown;
  code: number;
} {
  const { command, options } = parseEvidenceArguments(args);
  if (command === 'help')
    return {
      code: 0,
      value: {
        commands: COMMANDS,
        usage:
          'pnpm evidence <command> [--root path] [--source id] [--model id] [--hash sha256:…] [--offset 0] [--limit 20]',
        schemaVersion: 'evidence-cli-v1',
      },
    };
  if (!(COMMANDS as readonly string[]).includes(command))
    throw new Error(`Unknown command: ${command}`);
  const required = (key: string): string => {
    if (!options[key]) throw new Error(`--${key} is required for ${command}`);
    return options[key];
  };
  const root = resolve(getWorkspaceRoot(), options.root ?? '.');
  const db = options.db ? resolve(root, options.db) : undefined;
  const limit = integer(options.limit, 20, 1000);
  if (limit === 0) throw new Error('--limit must be positive');
  const offset = integer(options.offset, 0, Number.MAX_SAFE_INTEGER);
  const query: EvidenceQuery = { offset, limit };
  for (const [option, field] of [
    ['source', 'sourceId'],
    ['model', 'model'],
    ['from', 'from'],
    ['to', 'to'],
    ['hash', 'hash'],
  ] as const) {
    if (options[option]) query[field] = options[option];
  }
  for (const field of ['from', 'to'] as const) {
    const date = query[field];
    if (!date) continue;
    if (!Number.isFinite(Date.parse(date)))
      throw new Error('Invalid date filter');
    query[field] = new Date(date).toISOString();
  }
  if (query.hash && !/^sha256:[a-f0-9]{64}$/u.test(query.hash))
    throw new Error('--hash requires a SHA-256 digest with sha256: prefix');
  if (command === 'restore') {
    const restored = EvidenceStore.restore(
      resolve(getWorkspaceRoot(), required('directory')),
      root,
      db,
    );
    try {
      const value = restored.verify();
      return { value, code: value.ok ? 0 : 2 };
    } finally {
      restored.close();
    }
  }
  const store = new EvidenceStore(root, db);
  try {
    const page = <T>(rows: T[]) => ({
      items: rows.slice(0, limit),
      offset,
      limit,
      nextOffset: rows.length > limit ? offset + limit : null,
    });
    if (command === 'init') {
      const value = migrateEvidence(root, store, {
        history: options.history === 'true',
        scan: options['no-scan'] !== 'true',
        ...(options['history-limit']
          ? {
              historyLimit: integer(
                options['history-limit'],
                0,
                Number.MAX_SAFE_INTEGER,
              ),
            }
          : {}),
      });
      return { value, code: value.verification.ok ? 0 : 2 };
    }
    if (command === 'verify' || command === 'recover') {
      const value = store.verify();
      return { value, code: value.ok ? 0 : 2 };
    }
    if (command === 'captures') {
      const rows = store
        .captures({ ...query, limit: limit + 1 })
        .map(({ id, record, http, provenance }) => ({
          id,
          sourceId: record.sourceId,
          retrievedAt: record.retrievedAt,
          hash: record.sha256,
          requestUrl: record.requestUrl,
          finalUrl: record.finalUrl,
          artifactPath: record.artifactPath,
          mediaType: record.mediaType,
          bytes: record.byteLength,
          method: record.method,
          httpStatus: http.status ?? null,
          provenance: {
            kind: provenance.kind,
            revision: provenance.revision ?? null,
          },
        }));
      return { value: page(rows), code: 0 };
    }
    if (command === 'failures') {
      return {
        value: page(store.failures({ ...query, limit: limit + 1 })),
        code: 0,
      };
    }
    if (command === 'snapshots') {
      const rows = store
        .snapshots({ ...query, limit: limit + 1 })
        .map((snapshot) => ({
          id: snapshot.id,
          sourceId: snapshot.sourceId,
          createdAt: snapshot.createdAt,
          provenance: snapshot.provenance,
          files: Object.entries(snapshot.files).map(([file, content]) => ({
            file,
            bytes: Buffer.byteLength(content),
          })),
        }));
      return { value: page(rows), code: 0 };
    }
    if (command === 'find') {
      const items: unknown[] = [];
      let total = 0;
      let snapshotOffset = 0;
      const batchSize = 25;
      while (true) {
        const snapshots = store.snapshots({
          ...query,
          offset: snapshotOffset,
          limit: batchSize,
        });
        for (const snapshot of snapshots) {
          const candidates = JSON.parse(
            snapshot.files['candidates.json'] ?? '[]',
          ) as Array<Record<string, unknown>>;
          const evidence = JSON.parse(
            snapshot.files['evidence-index.json'] ?? '[]',
          ) as Array<Record<string, unknown>>;
          for (const [index, candidate] of candidates.entries()) {
            const model =
              candidate.model && typeof candidate.model === 'object'
                ? (candidate.model as Record<string, unknown>)
                : {};
            if (options.model && !Object.values(model).includes(options.model))
              continue;
            if (
              query.hash &&
              !(candidate.evidenceIds as string[] | undefined)?.includes(
                query.hash,
              )
            )
              continue;
            const position = total++;
            if (position < offset || items.length >= limit) continue;
            items.push({
              snapshotId: snapshot.id,
              sourceId: snapshot.sourceId,
              createdAt: snapshot.createdAt,
              id: candidate.id,
              model: candidate.model,
              benchmarkId: candidate.benchmarkId,
              rawScore: candidate.rawScore,
              locator: `data/sources/${snapshot.sourceId}/candidates.json#/${index}`,
              evidence: evidence
                .filter((record) =>
                  (candidate.evidenceIds as string[] | undefined)?.includes(
                    record.id as string,
                  ),
                )
                .map((record) => ({
                  id: record.id,
                  requestUrl: record.requestUrl,
                  artifactPath: record.artifactPath,
                  sha256: record.sha256,
                  retrievedAt: record.retrievedAt,
                })),
            });
          }
        }
        snapshotOffset += snapshots.length;
        if (snapshots.length < batchSize) break;
      }
      return {
        value: {
          items,
          offset,
          limit,
          total,
          nextOffset:
            offset + items.length < total ? offset + items.length : null,
        },
        code: 0,
      };
    }
    if (command === 'references') {
      const scope = options.scope ?? 'history';
      if (scope !== 'current' && scope !== 'history')
        throw new Error('--scope must be current or history');
      const rows = store.references(required('hash'), { scope });
      return {
        value: {
          ...page(rows.slice(offset, offset + limit + 1)),
          scope:
            'Imported snapshots only; init --history reports reachable Git coverage',
          total: rows.length,
        },
        code: 0,
      };
    }
    if (command === 'diff') {
      const beforeId = required('before');
      const afterId = required('after');
      const beforeSnapshot = store.getSnapshot(beforeId);
      const afterSnapshot = store.getSnapshot(afterId);
      if (beforeSnapshot.sourceId !== afterSnapshot.sourceId)
        throw new Error(
          'Source comparison requires two snapshots of the same source',
        );
      const rawInputs = (files: Record<string, string>) =>
        new Set(
          (
            JSON.parse(files['evidence-index.json'] ?? '[]') as Array<{
              sha256: string;
            }>
          ).map((record) => record.sha256),
        );
      const beforeInputs = rawInputs(beforeSnapshot.files);
      const afterInputs = rawInputs(afterSnapshot.files);
      const addedInputs = [...afterInputs].filter(
        (hash) => !beforeInputs.has(hash),
      );
      const removedInputs = [...beforeInputs].filter(
        (hash) => !afterInputs.has(hash),
      );
      const delta = store.diffSnapshots(beforeId, afterId);
      const contentSummary = (content: string | null) =>
        content === null
          ? null
          : {
              sha256: `sha256:${createHash('sha256').update(content).digest('hex')}`,
              bytes: Buffer.byteLength(content),
            };
      const rowId = (item: unknown): string | null =>
        item && typeof item === 'object' && 'id' in item
          ? String(item.id)
          : null;
      const sampleSize = Math.min(limit, 20);
      const changes = delta.files
        .slice(offset, offset + limit + 1)
        .map((change) => ({
          file: change.file,
          before: contentSummary(change.before),
          after: contentSummary(change.after),
          fileBytesChanged: true,
          ...(change.structured
            ? {
                structured: {
                  added: change.structured.added.length,
                  removed: change.structured.removed.length,
                  changed: change.structured.changed.length,
                  sampleIds: {
                    added: change.structured.added
                      .slice(0, sampleSize)
                      .map(rowId),
                    removed: change.structured.removed
                      .slice(0, sampleSize)
                      .map(rowId),
                    changed: change.structured.changed
                      .slice(0, sampleSize)
                      .map(({ id }) => id),
                  },
                },
              }
            : {}),
        }));
      return {
        value: {
          from: delta.from,
          to: delta.to,
          rawInputs: {
            changed: addedInputs.length + removedInputs.length > 0,
            added: addedInputs.length,
            removed: removedInputs.length,
            addedHashes: addedInputs.slice(0, limit),
            removedHashes: removedInputs.slice(0, limit),
          },
          total: delta.files.length,
          ...page(changes),
        },
        code: 0,
      };
    }
    if (command === 'export') {
      const id = required('snapshot');
      if (store.getSnapshot(id).provenance.kind === 'process')
        throw new Error(
          'Process cache snapshots cannot be exported; select a completed source snapshot',
        );
      store.exportSnapshot(id);
      return { value: { snapshotId: id, exported: true }, code: 0 };
    }
    if (command === 'backup') {
      const directory = resolve(getWorkspaceRoot(), required('directory'));
      const manifest = store.backup(directory);
      return {
        value: {
          directory,
          database: manifest.database,
          blobs: manifest.blobs.length,
          bytes: manifest.blobs.reduce((sum, blob) => sum + blob.bytes, 0),
          unknown: manifest.unknown.length,
        },
        code: 0,
      };
    }
    if (command === 'raw') {
      const hash = required('hash');
      const capture = store.captures({ hash, limit: 1 })[0];
      if (!capture) throw new Error('No capture found for hash');
      const path = resolve(root, capture.record.artifactPath);
      if (!path.startsWith(`${root}${sep}`))
        throw new Error('Artifact path escapes workspace');
      const bytes = readFileSync(path);
      if (`sha256:${createHash('sha256').update(bytes).digest('hex')}` !== hash)
        throw new Error('Artifact integrity check failed');
      const start = integer(options.start, 0, Number.MAX_SAFE_INTEGER);
      const length = integer(options.length, 4096, 65536);
      return {
        value: {
          hash,
          artifactPath: capture.record.artifactPath,
          start,
          totalBytes: bytes.length,
          encoding: 'base64',
          content: bytes.subarray(start, start + length).toString('base64'),
          nextStart: start + length < bytes.length ? start + length : null,
        },
        code: 0,
      };
    }
    if (command === 'read') {
      const snapshot = store.getSnapshot(required('snapshot'));
      if (!snapshot) throw new Error('Snapshot not found');
      const file = required('file');
      const content = snapshot.files[file];
      if (content === undefined) throw new Error('Snapshot file not found');
      const bytes = Buffer.from(content);
      const start = integer(options.start, 0, Number.MAX_SAFE_INTEGER);
      const length = integer(options.length, 4096, 65536);
      return {
        value: {
          snapshotId: snapshot.id,
          file,
          start,
          totalBytes: bytes.length,
          content: bytes.subarray(start, start + length).toString('utf8'),
          nextStart: start + length < bytes.length ? start + length : null,
        },
        code: 0,
      };
    }
    throw new Error('Unsupported command');
  } finally {
    store.close();
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  try {
    const result = runEvidenceCommand(process.argv.slice(2));
    process.stdout.write(
      `${JSON.stringify({ schemaVersion: 'evidence-cli-v1', result: result.value })}\n`,
    );
    process.exitCode = result.code;
  } catch (error) {
    process.stdout.write(
      `${JSON.stringify({ schemaVersion: 'evidence-cli-v1', error: { code: 'EVIDENCE_COMMAND_FAILED', message: error instanceof Error ? error.message : String(error) } })}\n`,
    );
    process.exitCode = 1;
  }
}
