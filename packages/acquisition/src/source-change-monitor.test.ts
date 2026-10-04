import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  CandidateResultSchema,
  type CandidateResult,
} from '@llm-bench/benchmark-data';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type * as RefreshUtils from './refresh-utils.js';

const mocks = vi.hoisted(() => ({ captureArtifact: vi.fn() }));
vi.mock('./refresh-utils.js', async (importOriginal) => ({
  ...(await importOriginal<typeof RefreshUtils>()),
  captureArtifact: mocks.captureArtifact,
}));

import {
  compareCatalogs,
  compareSnapshots,
  monitorSources,
  summarizeSource,
  readSourceSnapshots,
} from './source-change-monitor.js';
import type { CatalogEntry } from './source-catalog-discovery.js';

const SOURCE = 'surge-chartography';
const DATE = '2026-10-03T00:00:00.000Z';
const EVIDENCE = `sha256:${'a'.repeat(64)}`;
const candidate = (overrides: Partial<CandidateResult> = {}): CandidateResult =>
  CandidateResultSchema.parse({
    schemaVersion: 'candidate-result-v1',
    id: 'test-result',
    sourceId: SOURCE,
    benchmarkId: 'chartography',
    benchmarkVersion: 'v1',
    evidenceIds: [EVIDENCE],
    acquisitionStatus: 'FULL',
    inclusion: 'INCLUDED',
    exclusionReason: null,
    metric: {
      id: 'pass-at-1',
      name: 'Pass@1',
      unit: 'percent',
      higherIsBetter: true,
    },
    model: {
      canonicalModelId: 'model-a',
      profileId: 'model-a-high',
      rawName: 'Model A',
    },
    normalizedScore: 50,
    rawScore: 50,
    observedAt: DATE,
    sourcePublishedAt: null,
    sourceRole: 'ORGANIZER',
    sourceUrl: 'https://surgehq.ai/benchmarks/chartography',
    profile: {
      attempts: null,
      contextWindowTokens: null,
      effort: 'high',
      harness: null,
      quantization: null,
      thinking: null,
      tools: null,
    },
    provenance: {
      rawScore: { evidenceId: EVIDENCE, locator: 'row 1', method: 'DOM' },
    },
    ...overrides,
  });
const snapshot = (rows: CandidateResult[]) =>
  summarizeSource(SOURCE, rows, DATE);
const catalog = (
  id = 'chartography',
  title = 'Chartography',
  version: string | null = null,
): CatalogEntry => ({
  id,
  title,
  version,
  url: `https://surgehq.ai/benchmarks/${id}`,
});

describe('source change comparisons', () => {
  it('detects changes to execution limits and quantization as profile changes', () => {
    const before = candidate();
    const after = candidate({
      profile: {
        ...before.profile,
        attempts: 5,
        contextWindowTokens: 32000,
        quantization: 'int8',
      },
    });
    expect(
      compareSnapshots(snapshot([before]), snapshot([after])).map(
        ({ kind }) => kind,
      ),
    ).toEqual(['profiles-lost']);
  });

  it('detects version changes and lost models and profiles despite equal row counts', () => {
    const before = candidate();
    const after = candidate({
      benchmarkVersion: 'v2',
      model: {
        canonicalModelId: 'model-b',
        profileId: 'model-b-low',
        rawName: 'Model B',
      },
      profile: { ...before.profile, effort: 'low' },
    });
    const findings = compareSnapshots(snapshot([before]), snapshot([after]));
    expect(snapshot([before]).benchmarks[0]?.rows).toBe(
      snapshot([after]).benchmarks[0]?.rows,
    );
    expect(findings.map(({ kind }) => kind)).toEqual([
      'versions-changed',
      'models-lost',
      'profiles-lost',
    ]);
    expect(
      findings.find(({ kind }) => kind === 'models-lost')?.detail,
    ).toContain('model-a');
  });

  it('detects included coverage reaching zero and an absent benchmark', () => {
    const before = snapshot([candidate()]);
    const zero = snapshot([
      candidate({ inclusion: 'EXCLUDED', exclusionReason: 'test exclusion' }),
    ]);
    expect(compareSnapshots(before, zero)).toContainEqual({
      kind: 'included-coverage-decreased',
      benchmarkId: 'chartography',
      detail: '1 -> 0 included rows',
    });
    expect(compareSnapshots(before, snapshot([]))).toEqual([
      {
        kind: 'benchmark-disappeared',
        benchmarkId: 'chartography',
        detail: 'Previously 1 rows; now absent from materialized snapshot.',
      },
    ]);
  });

  it('detects added and removed catalog entries', () => {
    expect(
      compareCatalogs([catalog()], [catalog('new-benchmark')]).map(
        ({ kind }) => kind,
      ),
    ).toEqual(['catalog-added', 'catalog-link-disappeared']);
  });

  it.each([
    catalog('chartography', 'Renamed Chartography'),
    catalog('chartography', 'Chartography', 'v2'),
  ])(
    'detects catalog title or version mutation: $title [$version]',
    (updated) => {
      expect(compareCatalogs([catalog()], [updated])).toHaveLength(1);
      expect(compareCatalogs([catalog()], [updated])[0]?.kind).toBe(
        'catalog-metadata-changed',
      );
    },
  );

  it('establishes initial snapshot and catalog baselines without claiming additions', () => {
    expect(compareSnapshots(null, snapshot([candidate()]))).toEqual([]);
    expect(compareCatalogs(null, [catalog()])).toEqual([]);
  });
});

const roots: string[] = [];
let root: string;
const statePath = () =>
  join(root, 'data', 'source-monitoring', 'state', `${SOURCE}.json`);
const readReport = async () =>
  JSON.parse(
    await readFile(
      join(root, 'data', 'source-monitoring', 'current.json'),
      'utf8',
    ),
  ) as {
    sources: Array<{
      sourceId: string;
      scope: string;
      error: string | null;
      findings: Array<{ kind: string }>;
      inventory: Array<{
        id: string;
        status: string;
        captureRegistered: boolean;
        benchmarkId: string | null;
        reason: string | null;
      }>;
    }>;
  };
const writeCandidates = async (rows: CandidateResult[], sourceId = SOURCE) =>
  writeFile(
    join(root, 'data', 'sources', sourceId, 'candidates.json'),
    JSON.stringify(rows),
  );
const capture = (
  html = '<a href="/benchmarks/chartography">Chartography</a>',
) =>
  mocks.captureArtifact.mockResolvedValue({
    text: html,
    bytes: new TextEncoder().encode(html),
    record: {
      schemaVersion: 'evidence-record-v1',
      id: EVIDENCE,
      sha256: EVIDENCE,
      sourceId: SOURCE,
      requestUrl: 'https://surgehq.ai/benchmarks',
      finalUrl: 'https://surgehq.ai/benchmarks',
      retrievedAt: DATE,
      mediaType: 'text/html',
      method: 'DOM',
      byteLength: html.length,
      artifactPath: 'artifacts/test.html',
      metadata: {},
    },
  });

beforeEach(async () => {
  vi.clearAllMocks();
  root = await mkdtemp(join(tmpdir(), 'source-monitor-test-'));
  roots.push(root);
  await mkdir(join(root, 'data', 'mappings'), { recursive: true });
  await mkdir(join(root, 'data', 'sources', SOURCE), { recursive: true });
  await writeFile(
    join(root, 'data', 'mappings', 'sources.json'),
    JSON.stringify({ whitelist: [SOURCE] }),
  );
  await writeFile(
    join(root, 'data', 'sources', SOURCE, 'manifest.json'),
    JSON.stringify({ lastVerifiedAt: DATE }),
  );
  await writeCandidates([candidate()]);
  capture();
});
afterEach(async () => {
  await Promise.all(
    roots.splice(0).map((path) => rm(path, { recursive: true, force: true })),
  );
});

describe('source monitor in a temporary workspace', () => {
  it('shares the seven-adapter Surge inventory while keeping score baselines separate', async () => {
    const complexSource = 'surge-complex-constraints';
    const corecraftSource = 'surge-corecraft';
    const riemannSource = 'surge-riemann';
    const financeSource = 'surge-dayjob-finance';
    const healthcareSource = 'surge-dayjob-healthcare';
    const gdpXlsxSource = 'surge-gdp-xlsx';
    const sources = [
      SOURCE,
      complexSource,
      corecraftSource,
      riemannSource,
      financeSource,
      healthcareSource,
      gdpXlsxSource,
    ];
    await writeFile(
      join(root, 'data', 'mappings', 'sources.json'),
      JSON.stringify({ whitelist: sources }),
    );
    const complexCandidate = candidate({
      sourceId: complexSource,
      benchmarkId: 'complex-constraints',
      sourceUrl: 'https://surgehq.ai/benchmarks/complexconstraints',
    });
    const corecraftCandidate = candidate({
      sourceId: corecraftSource,
      benchmarkId: 'enterprisebench-corecraft',
      sourceUrl: 'https://surgehq.ai/benchmarks/enterprisebench-corecraft',
    });
    const riemannCandidate = candidate({
      sourceId: riemannSource,
      benchmarkId: 'riemann-bench',
      sourceUrl: 'https://surgehq.ai/benchmarks/riemann-bench',
    });
    const financeCandidate = candidate({
      sourceId: financeSource,
      benchmarkId: 'dayjob-finance',
      sourceUrl: 'https://surgehq.ai/benchmarks/dayjob-finance',
    });
    const healthcareCandidate = candidate({
      sourceId: healthcareSource,
      benchmarkId: 'dayjob-healthcare',
      sourceUrl: 'https://surgehq.ai/benchmarks/dayjob-healthcare',
    });
    const gdpXlsxCandidate = candidate({
      sourceId: gdpXlsxSource,
      benchmarkId: 'gdp-xlsx',
      sourceUrl: 'https://surgehq.ai/benchmarks/gdp-xlsx',
    });
    for (const sourceId of [
      complexSource,
      corecraftSource,
      riemannSource,
      financeSource,
      healthcareSource,
      gdpXlsxSource,
    ]) {
      await mkdir(join(root, 'data', 'sources', sourceId), {
        recursive: true,
      });
      await writeFile(
        join(root, 'data', 'sources', sourceId, 'manifest.json'),
        JSON.stringify({ lastVerifiedAt: DATE }),
      );
    }
    await writeCandidates([complexCandidate], complexSource);
    await writeCandidates([corecraftCandidate], corecraftSource);
    await writeCandidates([riemannCandidate], riemannSource);
    await writeCandidates([financeCandidate], financeSource);
    await writeCandidates([healthcareCandidate], healthcareSource);
    await writeCandidates([gdpXlsxCandidate], gdpXlsxSource);
    await writeFile(
      join(root, 'data', 'mappings', 'source-monitoring.json'),
      JSON.stringify({
        deferred: { [SOURCE]: { handbook: 'Pending adapter review.' } },
      }),
    );
    capture(
      '<a href="/benchmarks/chartography">Chartography</a><a href="/benchmarks/complexconstraints">ComplexConstraints</a><a href="/benchmarks/enterprisebench-corecraft">EnterpriseBench: CoreCraft</a><a href="/benchmarks/riemann-bench">Riemann-bench</a><a href="/benchmarks/dayjob-finance">DAYJOB: Finance</a><a href="/benchmarks/dayjob-healthcare">DAYJOB: Healthcare</a><a href="/benchmarks/gdp-xlsx">GDP.xlsx</a><a href="/benchmarks/handbook">HANDBOOK.md</a>',
    );
    expect(await monitorSources({ root })).toMatchObject({
      errorCount: 0,
      attentionCount: 0,
    });
    const initialReports = (await readReport()).sources;
    expect(initialReports).toHaveLength(7);
    for (const report of initialReports) {
      expect(report.scope).toBe('live-catalog-and-snapshot');
      expect(report.inventory).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: 'chartography',
            status: 'scored',
            captureRegistered: true,
            benchmarkId: 'chartography',
          }),
          expect.objectContaining({
            id: 'complexconstraints',
            status: 'scored',
            captureRegistered: true,
            benchmarkId: 'complex-constraints',
          }),
          expect.objectContaining({
            id: 'enterprisebench-corecraft',
            status: 'scored',
            captureRegistered: true,
            benchmarkId: 'enterprisebench-corecraft',
          }),
          expect.objectContaining({
            id: 'riemann-bench',
            status: 'scored',
            captureRegistered: true,
            benchmarkId: 'riemann-bench',
          }),
          expect.objectContaining({
            id: 'dayjob-finance',
            status: 'scored',
            captureRegistered: true,
            benchmarkId: 'dayjob-finance',
          }),
          expect.objectContaining({
            id: 'dayjob-healthcare',
            status: 'scored',
            captureRegistered: true,
            benchmarkId: 'dayjob-healthcare',
          }),
          expect.objectContaining({
            id: 'gdp-xlsx',
            status: 'scored',
            captureRegistered: true,
            benchmarkId: 'gdp-xlsx',
          }),
          expect.objectContaining({
            id: 'handbook',
            status: 'reviewed-deferred',
            reason: 'Pending adapter review.',
          }),
        ]),
      );
      expect(report.inventory).toEqual(initialReports[0]?.inventory);
      const state = JSON.parse(
        await readFile(
          join(
            root,
            'data',
            'source-monitoring',
            'state',
            `${report.sourceId}.json`,
          ),
          'utf8',
        ),
      );
      expect(
        state.snapshot.benchmarks.map(({ id }: { id: string }) => id),
      ).toEqual([
        report.sourceId === SOURCE
          ? 'chartography'
          : report.sourceId === complexSource
            ? 'complex-constraints'
            : report.sourceId === corecraftSource
              ? 'enterprisebench-corecraft'
              : report.sourceId === riemannSource
                ? 'riemann-bench'
                : report.sourceId === financeSource
                  ? 'dayjob-finance'
                  : report.sourceId === healthcareSource
                    ? 'dayjob-healthcare'
                    : 'gdp-xlsx',
      ]);
    }
    await writeCandidates(
      [candidate({ ...riemannCandidate, benchmarkVersion: 'v2' })],
      riemannSource,
    );
    await writeCandidates(
      [candidate({ ...financeCandidate, benchmarkVersion: 'v2' })],
      financeSource,
    );
    await writeCandidates(
      [candidate({ ...healthcareCandidate, benchmarkVersion: 'v2' })],
      healthcareSource,
    );
    await writeCandidates(
      [candidate({ ...gdpXlsxCandidate, benchmarkVersion: 'v2' })],
      gdpXlsxSource,
    );
    expect((await monitorSources({ root })).errorCount).toBe(0);
    const reports = (await readReport()).sources;
    expect(
      reports.find(({ sourceId }) => sourceId === SOURCE)?.findings,
    ).toEqual([]);
    expect(
      reports.find(({ sourceId }) => sourceId === complexSource)?.findings,
    ).toEqual([]);
    expect(
      reports.find(({ sourceId }) => sourceId === corecraftSource)?.findings,
    ).toEqual([]);
    expect(
      reports.find(({ sourceId }) => sourceId === riemannSource)?.findings,
    ).toEqual([
      expect.objectContaining({
        kind: 'versions-changed',
        benchmarkId: 'riemann-bench',
      }),
    ]);
    expect(
      reports.find(({ sourceId }) => sourceId === financeSource)?.findings,
    ).toEqual([
      expect.objectContaining({
        kind: 'versions-changed',
        benchmarkId: 'dayjob-finance',
      }),
    ]);
    expect(
      reports.find(({ sourceId }) => sourceId === healthcareSource)?.findings,
    ).toEqual([
      expect.objectContaining({
        kind: 'versions-changed',
        benchmarkId: 'dayjob-healthcare',
      }),
    ]);
    expect(
      reports.find(({ sourceId }) => sourceId === gdpXlsxSource)?.findings,
    ).toEqual([
      expect.objectContaining({
        kind: 'versions-changed',
        benchmarkId: 'gdp-xlsx',
      }),
    ]);
  });

  it.each([false, true])(
    'shares Surge catalog inventory when companion snapshots are absent (active: %s)',
    async (active) => {
      const complexSource = 'surge-complex-constraints';
      const corecraftSource = 'surge-corecraft';
      const riemannSource = 'surge-riemann';
      const financeSource = 'surge-dayjob-finance';
      const healthcareSource = 'surge-dayjob-healthcare';
      const gdpXlsxSource = 'surge-gdp-xlsx';
      if (active)
        await writeFile(
          join(root, 'data', 'mappings', 'sources.json'),
          JSON.stringify({
            whitelist: [
              SOURCE,
              complexSource,
              corecraftSource,
              riemannSource,
              financeSource,
              healthcareSource,
              gdpXlsxSource,
            ],
          }),
        );
      capture(
        '<a href="/benchmarks/chartography">Chartography</a><a href="/benchmarks/complexconstraints">ComplexConstraints</a><a href="/benchmarks/enterprisebench-corecraft">EnterpriseBench</a><a href="/benchmarks/riemann-bench">Riemann-bench</a><a href="/benchmarks/dayjob-finance">DAYJOB: Finance</a><a href="/benchmarks/dayjob-healthcare">DAYJOB: Healthcare</a><a href="/benchmarks/gdp-xlsx">GDP.xlsx</a>',
      );
      expect(await monitorSources({ root, sourceIds: [SOURCE] })).toMatchObject(
        { errorCount: 0, attentionCount: 6 },
      );
      const inventory = (await readReport()).sources[0]?.inventory;
      expect(inventory).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: 'complexconstraints',
            status: 'supported-no-scores',
            captureRegistered: true,
            benchmarkId: 'complex-constraints',
          }),
          expect.objectContaining({
            id: 'enterprisebench-corecraft',
            status: 'supported-no-scores',
            captureRegistered: true,
            benchmarkId: 'enterprisebench-corecraft',
          }),
          expect.objectContaining({
            id: 'riemann-bench',
            status: 'supported-no-scores',
            captureRegistered: true,
            benchmarkId: 'riemann-bench',
          }),
          expect.objectContaining({
            id: 'dayjob-finance',
            status: 'supported-no-scores',
            captureRegistered: true,
            benchmarkId: 'dayjob-finance',
          }),
          expect.objectContaining({
            id: 'dayjob-healthcare',
            status: 'supported-no-scores',
            captureRegistered: true,
            benchmarkId: 'dayjob-healthcare',
          }),
          expect.objectContaining({
            id: 'gdp-xlsx',
            status: 'supported-no-scores',
            captureRegistered: true,
            benchmarkId: 'gdp-xlsx',
          }),
        ]),
      );
    },
  );

  it('allows absent baselines only before refreshing, and rejects corrupted existing snapshots', async () => {
    await expect(
      readSourceSnapshots(root, ['new-source'], true),
    ).resolves.toEqual([]);
    await expect(readSourceSnapshots(root, ['new-source'])).rejects.toThrow();
    await writeFile(
      join(root, 'data', 'sources', SOURCE, 'candidates.json'),
      '{broken',
    );
    await expect(readSourceSnapshots(root, [SOURCE], true)).rejects.toThrow();
  });
  it('captures a directory through the safe capture API and writes reports and live state', async () => {
    const result = await monitorSources({ root });
    expect(result).toMatchObject({ attentionCount: 0, errorCount: 0 });
    expect(mocks.captureArtifact).toHaveBeenCalledWith(
      expect.objectContaining({
        root,
        sourceId: SOURCE,
        url: 'https://surgehq.ai/benchmarks',
        method: 'DOM',
      }),
    );
    const state = JSON.parse(await readFile(statePath(), 'utf8'));
    expect(state.snapshot.observedAt).toBe(DATE);
    expect(state.catalog).toEqual([catalog()]);
    expect(state.evidence.id).toBe(EVIDENCE);
    expect(await readFile(result.reportPath, 'utf8')).toContain(
      'live-catalog-and-snapshot',
    );
    await writeCandidates([candidate({ benchmarkVersion: 'v2' })]);
    capture(
      '<a href="/benchmarks/chartography">Chartography v2</a><a href="/benchmarks/new-benchmark">New Benchmark</a>',
    );
    expect((await monitorSources({ root })).errorCount).toBe(0);
    const kinds = (await readReport()).sources[0]!.findings.map(
      ({ kind }) => kind,
    );
    expect(kinds).toEqual(
      expect.arrayContaining([
        'versions-changed',
        'catalog-metadata-changed',
        'catalog-added',
        'unintegrated',
      ]),
    );
    expect(kinds).not.toContain('catalog-snapshot-version-mismatch');
  });

  it.each(['fetch rejection', 'unreadable catalog'])(
    'retains the live baseline on %s',
    async (failure) => {
      await monitorSources({ root });
      const before = await readFile(statePath(), 'utf8');
      await writeCandidates([candidate({ benchmarkVersion: 'v2' })]);
      if (failure === 'fetch rejection')
        mocks.captureArtifact.mockRejectedValue(new Error('fetch unavailable'));
      else capture('<html>verification required</html>');
      expect((await monitorSources({ root })).errorCount).toBe(1);
      expect(await readFile(statePath(), 'utf8')).toBe(before);
      expect((await readReport()).sources[0]?.error).toMatch(
        /fetch unavailable|no benchmark links/u,
      );
    },
  );

  it('does not fetch or advance a live baseline during an offline snapshot check', async () => {
    await monitorSources({ root });
    const before = await readFile(statePath(), 'utf8');
    mocks.captureArtifact.mockClear();
    await writeCandidates([candidate({ benchmarkVersion: 'v2' })]);
    expect((await monitorSources({ root, offline: true })).errorCount).toBe(0);
    expect(mocks.captureArtifact).not.toHaveBeenCalled();
    expect(await readFile(statePath(), 'utf8')).toBe(before);
    expect((await readReport()).sources[0]).toMatchObject({
      scope: 'offline-snapshot',
      findings: [{ kind: 'versions-changed' }],
    });
    await monitorSources({ root });
    expect((await readReport()).sources[0]?.findings).toContainEqual(
      expect.objectContaining({ kind: 'versions-changed' }),
    );
  });

  it.each([
    { rows: [] as CandidateResult[], status: 'supported-no-scores' },
    {
      rows: [
        candidate({ inclusion: 'EXCLUDED', exclusionReason: 'test exclusion' }),
      ],
      status: 'captured-not-scored',
    },
  ])('reports catalog coverage for $status', async ({ rows, status }) => {
    await writeCandidates(rows);
    const result = await monitorSources({ root });
    expect(result).toMatchObject({ errorCount: 0, attentionCount: 1 });
    expect((await readReport()).sources[0]?.inventory[0]?.status).toBe(status);
  });
});
