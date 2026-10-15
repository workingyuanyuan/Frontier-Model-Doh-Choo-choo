import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { afterEach, describe, expect, it } from 'vitest';

import { buildArtifactRecord } from './index.js';
import { parseEvidenceArguments, runEvidenceCommand } from './evidence-cli.js';
import { EvidenceStore } from './evidence-store.js';

const roots: string[] = [];
afterEach(() => {
  for (const root of roots.splice(0))
    rmSync(root, { recursive: true, force: true });
});

const fixture = () => {
  const root = mkdtempSync(join(tmpdir(), 'evidence-cli-'));
  roots.push(root);
  const bytes = Buffer.from('captured source bytes');
  const artifactPath = 'artifacts/sha256/input.txt';
  mkdirSync(join(root, 'artifacts/sha256'), { recursive: true });
  writeFileSync(join(root, artifactPath), bytes);
  const evidence = buildArtifactRecord(bytes, 'text/plain', artifactPath, {
    sourceId: 'test-source',
    retrievedAt: '2026-10-15T00:00:00.000Z',
    metadata: { fullResponse: 'PRIVATE_METADATA'.repeat(10_000) },
  });
  return { root, evidence };
};

describe('evidence CLI', () => {
  it('parses explicit values and rejects malformed or duplicate options', () => {
    expect(
      parseEvidenceArguments([
        'find',
        '--',
        '--source=test-source',
        '--limit',
        '3',
      ]),
    ).toEqual({
      command: 'find',
      options: { source: 'test-source', limit: '3' },
    });
    expect(() => parseEvidenceArguments(['find', '--unknown', 'x'])).toThrow(
      'Unknown option',
    );
    expect(() =>
      parseEvidenceArguments(['find', '--limit', '3', '--limit=4']),
    ).toThrow('Duplicate option');
    expect(() =>
      parseEvidenceArguments(['find', '--source', '--limit', '3']),
    ).toThrow('requires a value');
    expect(() => parseEvidenceArguments(['init', '--history=true'])).toThrow(
      'takes no value',
    );
  });

  it('paginates all matching candidate rows across snapshot boundaries', () => {
    const { root, evidence } = fixture();
    const store = new EvidenceStore(root);
    try {
      for (let batch = 0; batch < 2; batch++) {
        store.importSnapshot(
          'test-source',
          {
            'evidence-index.json': JSON.stringify([evidence]),
            'candidates.json': JSON.stringify(
              Array.from({ length: 5 }, (_, index) => ({
                id: `row-${batch * 5 + index}`,
                model: { canonicalModelId: 'model-a', rawName: 'Model A' },
                benchmarkId: 'test-benchmark',
                rawScore: index,
                evidenceIds: [evidence.id],
              })),
            ),
          },
          { kind: 'git-checkout', revision: String(batch) },
        );
      }
    } finally {
      store.close();
    }
    const ids: string[] = [];
    let offset: number | null = 0;
    while (offset !== null) {
      const result = runEvidenceCommand([
        'find',
        '--root',
        root,
        '--source',
        'test-source',
        '--model',
        'model-a',
        '--limit',
        '3',
        '--offset',
        String(offset),
      ]);
      const page = result.value as {
        items: Array<{ id: string; snapshotId: string; locator: string }>;
        total: number;
        nextOffset: number | null;
      };
      expect(page.total).toBe(10);
      expect(page.items.length).toBeLessThanOrEqual(3);
      expect(
        page.items.every(
          (row) => row.snapshotId && row.locator.includes('candidates.json#/'),
        ),
      ).toBe(true);
      ids.push(...page.items.map((row) => row.id));
      offset = page.nextOffset;
    }
    expect(ids).toEqual(
      Array.from({ length: 10 }, (_, index) => `row-${index}`),
    );
  });

  it('normalizes timezone bounds and keeps capture summaries bounded', () => {
    const { root, evidence } = fixture();
    const store = new EvidenceStore(root);
    try {
      store.recordCapture(evidence, {
        status: 200,
        headers: { huge: 'HEADER'.repeat(10_000) },
      });
    } finally {
      store.close();
    }
    const result = runEvidenceCommand([
      'captures',
      '--root',
      root,
      '--from',
      '2026-10-15T08:00:00+08:00',
      '--to',
      '2026-10-15T01:00:00Z',
      '--limit',
      '1',
    ]);
    const page = result.value as {
      items: Array<{ sourceId: string; httpStatus: number }>;
      nextOffset: number | null;
    };
    expect(page.items).toHaveLength(1);
    expect(page.items[0]).toMatchObject({
      sourceId: 'test-source',
      httpStatus: 200,
    });
    expect(page.nextOffset).toBeNull();
    expect(JSON.stringify(page).length).toBeLessThan(1500);
    expect(JSON.stringify(page)).not.toContain('PRIVATE_METADATA');
    expect(JSON.stringify(page)).not.toContain('HEADER');
  });

  it('prints compact diff summaries while explicit read exposes stored content', () => {
    const { root, evidence } = fixture();
    const store = new EvidenceStore(root);
    let before: string;
    let after: string;
    const huge = 'FULL_CONTENT_SENTINEL'.repeat(10_000);
    try {
      before = store.importSnapshot(
        'test-source',
        {
          'evidence-index.json': JSON.stringify([evidence]),
          'candidates.json': JSON.stringify([
            { id: 'original', payload: huge },
          ]),
        },
        { kind: 'git-checkout', revision: 'before' },
      );
      after = store.importSnapshot(
        'test-source',
        {
          'evidence-index.json': JSON.stringify([evidence]),
          'candidates.json': JSON.stringify([
            { id: 'original', payload: `${huge} changed` },
            ...Array.from({ length: 25 }, (_, index) => ({
              id: `added-${index}`,
            })),
          ]),
        },
        { kind: 'git-checkout', revision: 'after' },
      );
    } finally {
      store.close();
    }
    const output = execFileSync(
      process.execPath,
      [
        '--import',
        'tsx',
        fileURLToPath(new URL('./evidence-cli.ts', import.meta.url)),
        'diff',
        '--root',
        root,
        '--before',
        before!,
        '--after',
        after!,
      ],
      { encoding: 'utf8' },
    );
    expect(output.length).toBeLessThan(5000);
    expect(output).not.toContain('FULL_CONTENT_SENTINEL');
    const parsed = JSON.parse(output) as {
      result: {
        items: Array<{
          before: { bytes: number; sha256: string };
          structured: {
            added: number;
            changed: number;
            sampleIds: { added: string[] };
          };
        }>;
      };
    };
    expect(parsed.result.items[0]?.before.bytes).toBeGreaterThan(100_000);
    expect(parsed.result.items[0]?.before.sha256).toMatch(/^sha256:/);
    expect(parsed.result.items[0]?.structured).toMatchObject({
      added: 25,
      changed: 1,
    });
    expect(parsed.result.items[0]?.structured.sampleIds.added).toHaveLength(20);
    const read = runEvidenceCommand([
      'read',
      '--root',
      root,
      '--snapshot',
      after!,
      '--file',
      'candidates.json',
      '--length',
      '100',
    ]);
    expect((read.value as { content: string }).content).toContain(
      'FULL_CONTENT_SENTINEL',
    );
  });

  it('keeps process cache snapshots available for reading and rejects their export', () => {
    const { root } = fixture();
    const store = new EvidenceStore(root);
    let snapshot: string;
    try {
      snapshot = store.importSnapshot(
        'test-source',
        { 'candidates.json': '[]' },
        { kind: 'process' },
      );
    } finally {
      store.close();
    }
    expect(() =>
      runEvidenceCommand(['export', '--root', root, '--snapshot', snapshot!]),
    ).toThrow('Process cache snapshots cannot be exported');
    const result = runEvidenceCommand([
      'read',
      '--root',
      root,
      '--snapshot',
      snapshot!,
      '--file',
      'candidates.json',
    ]);
    expect((result.value as { content: string }).content).toBe('[]');
  });
});
