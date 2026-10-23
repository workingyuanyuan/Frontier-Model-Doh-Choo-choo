import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { CandidateResultSchema, SourcesConfigSchema } from './index.js';
import { checkWorkspaceFreshness } from './product-freshness.js';
import { writeWorkspaceCurrent } from './workspace.js';

const repositoryRoot = resolve(import.meta.dirname, '../../..');

const copyInputs = async (to: string) => {
  const config = SourcesConfigSchema.parse(
    JSON.parse(
      await readFile(
        join(repositoryRoot, 'data/mappings/sources.json'),
        'utf8',
      ),
    ),
  );
  await cp(join(repositoryRoot, 'data/mappings'), join(to, 'data/mappings'), {
    recursive: true,
  });
  for (const source of config.whitelist) {
    await mkdir(join(to, 'data/sources', source), { recursive: true });
    for (const file of [
      'manifest.json',
      'candidates.json',
      'costs.json',
      'evidence-index.json',
    ]) {
      const origin = join(repositoryRoot, 'data/sources', source, file);
      if (existsSync(origin)) {
        await cp(origin, join(to, 'data/sources', source, file));
      }
    }
  }
};

describe('checkWorkspaceFreshness', () => {
  let root: string;

  beforeAll(async () => {
    root = await mkdtemp(join(tmpdir(), 'product-freshness-'));
    await copyInputs(root);
    await writeWorkspaceCurrent(root, '2026-10-23T00:00:00.000Z');
  }, 120_000);

  afterAll(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it('accepts a product built from the current inputs without writing', async () => {
    const audit = await readFile(
      join(root, 'data/mappings/frontier-selection-audit.json'),
      'utf8',
    );
    const report = await checkWorkspaceFreshness(root);
    expect(report).toMatchObject({ fresh: true, mismatches: [] });
    expect(report.recomputedVersionId).toBe(report.versionId);
    expect(
      await readFile(
        join(root, 'data/mappings/frontier-selection-audit.json'),
        'utf8',
      ),
    ).toBe(audit);
  }, 120_000);

  it('reports stale frontier files and products after an input edit', async () => {
    const auditPath = join(root, 'data/mappings/frontier-selection-audit.json');
    const audit = await readFile(auditPath, 'utf8');
    await writeFile(auditPath, `${audit}\n`);
    const candidatesPath = join(
      root,
      'data/sources/artificial-analysis/candidates.json',
    );
    const original = await readFile(candidatesPath, 'utf8');
    const candidates = CandidateResultSchema.array().parse(
      JSON.parse(original),
    );
    const target = candidates.find(
      ({ inclusion, normalizedScore }) =>
        inclusion === 'INCLUDED' && normalizedScore !== null,
    )!;
    target.normalizedScore = target.normalizedScore! > 50 ? 1 : 99;
    await writeFile(candidatesPath, JSON.stringify(candidates));
    try {
      const report = await checkWorkspaceFreshness(root);
      expect(report.fresh).toBe(false);
      expect(report.mismatches.join('\n')).toMatch(
        /frontier-selection-audit\.json differs/u,
      );
      expect(report.mismatches.join('\n')).toMatch(
        /current inputs build sha256:/u,
      );
    } finally {
      await writeFile(candidatesPath, original);
      await writeFile(auditPath, audit);
    }
  }, 120_000);
});
