import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, expect, test } from 'vitest';
import { buildArtifactRecord } from './index.js';
import { EvidenceStore } from './evidence-store.js';
import { migrateEvidence } from './evidence-migration.js';

const roots: string[] = [];
afterEach(() =>
  roots
    .splice(0)
    .forEach((root) => rmSync(root, { recursive: true, force: true })),
);
const fixture = () => {
  const root = mkdtempSync(join(tmpdir(), 'evidence-migration-'));
  roots.push(root);
  const git = (...args: string[]) =>
    execFileSync('git', ['-C', root, ...args], { stdio: 'pipe' });
  git('init');
  git('config', 'user.email', 'test@example.test');
  git('config', 'user.name', 'Test');
  const bytes = Buffer.from('{"score":42}');
  const record = buildArtifactRecord(
    bytes,
    'application/json',
    'artifacts/raw.json',
    { sourceId: 'retained', retrievedAt: '2026-10-01T00:00:00.000Z' },
  );
  mkdirSync(join(root, 'artifacts'));
  writeFileSync(join(root, record.artifactPath), bytes);
  const write = (source: string) => {
    const dir = join(root, 'data/sources', source);
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      join(dir, 'evidence-index.json'),
      JSON.stringify([{ ...record, sourceId: source }]),
    );
    writeFileSync(join(dir, 'candidates.json'), '[]');
  };
  write('retained');
  write('deleted');
  git('add', 'data');
  git('commit', '-m', 'initial sources');
  rmSync(join(root, 'data/sources/deleted'), { recursive: true });
  git('add', '-A');
  git('commit', '-m', 'remove obsolete source');
  return { root, git, record };
};

test('repeated migration is idempotent and history respects retained source set', () => {
  const { root } = fixture();
  const store = new EvidenceStore(root);
  try {
    const first = migrateEvidence(root, store, { history: true });
    const second = migrateEvidence(root, store, { history: true });
    expect(first.verification.ok).toBe(true);
    expect(second.verification).toEqual(first.verification);
    expect(store.snapshots({ sourceId: 'deleted' })).toEqual([]);
    expect(store.captures({ sourceId: 'retained' }).length).toBeGreaterThan(0);
    expect(second.history.commitsVisited).toBeGreaterThan(0);
  } finally {
    store.close();
  }
});

test('malformed historical evidence is skipped and current valid data is imported', () => {
  const { root, git, record } = fixture();
  const path = join(root, 'data/sources/retained/evidence-index.json');
  writeFileSync(path, 'not-json');
  git('add', 'data');
  git('commit', '-m', 'malformed historical input');
  writeFileSync(path, JSON.stringify([record]));
  git('add', 'data');
  git('commit', '-m', 'valid input');
  const store = new EvidenceStore(root);
  try {
    const report = migrateEvidence(root, store, { history: true });
    expect(report.history.skippedUnavailableSnapshots).toBe(1);
    expect(report.verification.ok).toBe(true);
  } finally {
    store.close();
  }
});
