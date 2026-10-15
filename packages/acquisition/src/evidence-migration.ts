import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve, sep } from 'node:path';

import { EvidenceRecordSchema } from '@llm-bench/benchmark-data';
import type { EvidenceStore } from './evidence-store.js';

const git = (root: string, args: string[]): string =>
  execFileSync('git', ['-C', root, ...args], {
    encoding: 'utf8',
    maxBuffer: 128 * 1024 * 1024,
  });

export function readSourceFiles(
  root: string,
  sourceId: string,
): Record<string, string> {
  const directory = join(root, 'data', 'sources', sourceId);
  return Object.fromEntries(
    readdirSync(directory, { withFileTypes: true })
      .filter((entry) => entry.isFile())
      .map(({ name }) => [name, readFileSync(join(directory, name), 'utf8')])
      .sort(([a], [b]) => a!.localeCompare(b!)),
  );
}

/** Import retained snapshots only. Availability is checked before importing history. */
export function migrateEvidence(
  root: string,
  store: EvidenceStore,
  options: {
    history?: boolean;
    historyLimit?: number;
    scan?: boolean;
  } = {},
) {
  const started = performance.now();
  const sources = readdirSync(join(root, 'data', 'sources'), {
    withFileTypes: true,
  })
    .filter(
      (entry) =>
        entry.isDirectory() &&
        existsSync(
          join(root, 'data', 'sources', entry.name, 'evidence-index.json'),
        ),
    )
    .map(({ name }) => name)
    .sort();
  let historicalImported = 0;
  let historicalUnavailable = 0;
  let commitsVisited = 0;
  const verified = new Map<string, boolean>();
  const complete = (files: Record<string, string>): boolean => {
    if (!files['evidence-index.json']) return false;
    let data: unknown;
    try {
      data = JSON.parse(files['evidence-index.json']);
    } catch {
      return false;
    }
    const parsed = EvidenceRecordSchema.array().safeParse(data);
    if (!parsed.success) return false;
    return parsed.data.every((record) => {
      const cacheKey = `${record.artifactPath}:${record.sha256}:${record.byteLength}`;
      if (verified.has(cacheKey)) return verified.get(cacheKey)!;
      const path = resolve(root, record.artifactPath);
      let valid = false;
      if (path.startsWith(`${resolve(root)}${sep}`) && existsSync(path)) {
        const bytes = readFileSync(path);
        valid =
          bytes.length === record.byteLength &&
          `sha256:${createHash('sha256').update(bytes).digest('hex')}` ===
            record.sha256;
      }
      verified.set(cacheKey, valid);
      return valid;
    });
  };
  const history = {
    requested: options.history ?? false,
    scope:
      'Reachable Git revisions of retained source directories with available verified inputs',
    head: null as string | null,
    shallow: null as boolean | null,
    limit: options.historyLimit ?? null,
    commitsVisited: 0,
    importedSnapshots: 0,
    skippedUnavailableSnapshots: 0,
  };
  if (options.history) {
    history.head = git(root, ['rev-parse', 'HEAD']).trim();
    history.shallow =
      git(root, ['rev-parse', '--is-shallow-repository']).trim() === 'true';
    let commits = git(root, [
      'log',
      '--format=%H',
      '--',
      ...sources.map((source) => `data/sources/${source}/`),
    ])
      .trim()
      .split('\n')
      .filter(Boolean);
    if (options.historyLimit) commits = commits.slice(0, options.historyLimit);
    for (const commit of commits.reverse()) {
      commitsVisited++;
      const changed = new Set(
        git(root, [
          'diff-tree',
          '-m',
          '--root',
          '--no-commit-id',
          '--name-only',
          '-r',
          commit,
          '--',
          'data/sources',
        ])
          .split('\n')
          .map((path) => path.split('/')[2])
          .filter(
            (source): source is string => !!source && sources.includes(source),
          ),
      );
      for (const source of [...changed].sort()) {
        const prefix = `data/sources/${source}/`;
        const paths = git(root, [
          'ls-tree',
          '-r',
          '--name-only',
          commit,
          '--',
          prefix,
        ])
          .trim()
          .split('\n')
          .filter(
            (path) =>
              path.startsWith(prefix) &&
              !path.slice(prefix.length).includes('/'),
          );
        const files = Object.fromEntries(
          paths.map((path) => [
            path.slice(prefix.length),
            git(root, ['show', `${commit}:${path}`]),
          ]),
        );
        if (!complete(files)) {
          historicalUnavailable++;
          continue;
        }
        store.importSnapshot(source, files, {
          kind: 'git-history',
          revision: commit,
        });
        historicalImported++;
      }
    }
  }
  const current = sources.map((sourceId) => {
    const files = readSourceFiles(root, sourceId);
    const snapshotId = store.importSnapshot(sourceId, files, {
      kind: 'git-checkout',
    });
    store.setCurrentSnapshot(snapshotId);
    return { sourceId, snapshotId, files: Object.keys(files).length };
  });
  const inventory = options.scan === false ? null : store.scanArtifacts();
  Object.assign(history, {
    commitsVisited,
    importedSnapshots: historicalImported,
    skippedUnavailableSnapshots: historicalUnavailable,
  });
  return {
    current,
    inventory,
    history,
    verification: store.verify(),
    elapsedMs: Math.round(performance.now() - started),
  };
}
