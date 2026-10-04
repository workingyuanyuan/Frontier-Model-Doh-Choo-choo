import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { format } from 'prettier';
import {
  CandidateResultSchema,
  type CandidateResult,
  type EvidenceRecord,
} from '@llm-bench/benchmark-data';
import {
  ARTIFICIAL_ANALYSIS_EVALUATION_SLUGS,
  SCORE_MAPPING,
} from './artificial-analysis-rsc.js';
import {
  APPROVED_VALS_BENCHMARKS,
  COMPOSITE_VALS_SLUGS,
} from './vals-materializer.js';
import { acquisitionClient } from './safe-network.js';
import { captureArtifact, writeMetadataJson } from './refresh-utils.js';
import {
  discoverSourceCatalog,
  type CatalogEntry,
} from './source-catalog-discovery.js';

export interface BenchmarkSnapshot {
  id: string;
  versions: string[];
  metrics: string[];
  sourceUrls: string[];
  models: string[];
  profiles: string[];
  rawLabels: string[];
  includedRows: number;
  rows: number;
}
export interface SourceSnapshot {
  sourceId: string;
  observedAt: string | null;
  benchmarks: BenchmarkSnapshot[];
}
export interface Finding {
  kind: string;
  benchmarkId: string;
  detail: string;
}
interface SourceState {
  schemaVersion: 'source-monitor-state-v1';
  checkedAt: string;
  snapshot: SourceSnapshot;
  catalog: CatalogEntry[] | null;
  evidence: EvidenceRecord | null;
}
interface SourceReport {
  sourceId: string;
  checkedAt: string;
  snapshotObservedAt: string | null;
  scope: 'live-catalog-and-snapshot' | 'snapshot-only' | 'offline-snapshot';
  findings: Finding[];
  error: string | null;
  inventory: Array<
    CatalogEntry & {
      status: string;
      captureRegistered: boolean;
      benchmarkId: string | null;
      reason: string | null;
    }
  >;
}
const CATALOG_URLS: Readonly<Record<string, string>> = {
  'artificial-analysis': 'https://artificialanalysis.ai/evaluations',
  'vals-ai': 'https://www.vals.ai/benchmarks',
  'surge-chartography': 'https://surgehq.ai/benchmarks',
  'surge-complex-constraints': 'https://surgehq.ai/benchmarks',
  'surge-corecraft': 'https://surgehq.ai/benchmarks',
  'surge-riemann': 'https://surgehq.ai/benchmarks',
  'surge-dayjob-finance': 'https://surgehq.ai/benchmarks',
  'surge-dayjob-healthcare': 'https://surgehq.ai/benchmarks',
  'surge-gdp-xlsx': 'https://surgehq.ai/benchmarks',
};
const SURGE_ADAPTERS = {
  chartography: {
    sourceId: 'surge-chartography',
    benchmarkId: 'chartography',
  },
  complexconstraints: {
    sourceId: 'surge-complex-constraints',
    benchmarkId: 'complex-constraints',
  },
  'enterprisebench-corecraft': {
    sourceId: 'surge-corecraft',
    benchmarkId: 'enterprisebench-corecraft',
  },
  'riemann-bench': {
    sourceId: 'surge-riemann',
    benchmarkId: 'riemann-bench',
  },
  'dayjob-finance': {
    sourceId: 'surge-dayjob-finance',
    benchmarkId: 'dayjob-finance',
  },
  'dayjob-healthcare': {
    sourceId: 'surge-dayjob-healthcare',
    benchmarkId: 'dayjob-healthcare',
  },
  'gdp-xlsx': {
    sourceId: 'surge-gdp-xlsx',
    benchmarkId: 'gdp-xlsx',
  },
} as const;
const isSurgeSource = (sourceId: string): boolean =>
  Object.values(SURGE_ADAPTERS).some(
    (adapter) => adapter.sourceId === sourceId,
  );
const sorted = (values: Iterable<string>): string[] =>
  [...new Set(values)].sort();
const json = async <T>(path: string): Promise<T> =>
  JSON.parse(await readFile(path, 'utf8')) as T;
async function optionalJson<T>(path: string): Promise<T | null> {
  try {
    return await json<T>(path);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
    throw error;
  }
}

export function summarizeSource(
  sourceId: string,
  candidates: CandidateResult[],
  observedAt: string | null,
): SourceSnapshot {
  const ids = sorted(candidates.map((row) => row.benchmarkId));
  return {
    sourceId,
    observedAt,
    benchmarks: ids.map((id) => {
      const rows = candidates.filter((row) => row.benchmarkId === id);
      return {
        id,
        versions: sorted(
          rows.map((row) => row.benchmarkVersion ?? '(unknown)'),
        ),
        metrics: sorted(
          rows.map(
            (row) =>
              `${row.metric.id}:${row.metric.unit}:${row.metric.higherIsBetter}`,
          ),
        ),
        sourceUrls: sorted(rows.map((row) => row.sourceUrl)),
        models: sorted(
          rows.flatMap((row) =>
            row.model.canonicalModelId ? [row.model.canonicalModelId] : [],
          ),
        ),
        rawLabels: sorted(rows.map((row) => row.model.rawName)),
        profiles: sorted(
          rows.map((row) =>
            JSON.stringify([
              row.model.rawName,
              row.profile.effort,
              row.profile.thinking,
              row.profile.harness,
              row.profile.tools,
              row.profile.quantization,
              row.profile.attempts,
              row.profile.contextWindowTokens,
            ]),
          ),
        ),
        includedRows: rows.filter((row) => row.inclusion === 'INCLUDED').length,
        rows: rows.length,
      };
    }),
  };
}

export async function readSourceSnapshots(
  root: string,
  sourceIds: string[],
  allowMissing = false,
): Promise<SourceSnapshot[]> {
  const snapshots = await Promise.all(
    sourceIds.map(async (sourceId) => {
      if (!/^[a-z0-9-]+$/u.test(sourceId))
        throw new Error(`Invalid source ID: ${sourceId}`);
      const directory = join(root, 'data', 'sources', sourceId);
      const read = allowMissing ? optionalJson : json;
      const raw = await read<unknown[]>(join(directory, 'candidates.json'));
      const candidates = (raw ?? []).map((row) =>
        CandidateResultSchema.parse(row),
      );
      if (candidates.some((row) => row.sourceId !== sourceId))
        throw new Error(`Source ID mismatch: ${sourceId}`);
      const manifest = await read<{ lastVerifiedAt?: string }>(
        join(directory, 'manifest.json'),
      );
      if (raw === null || manifest === null) return null;
      return summarizeSource(
        sourceId,
        candidates,
        manifest.lastVerifiedAt ?? null,
      );
    }),
  );
  return snapshots.filter(
    (snapshot): snapshot is SourceSnapshot => snapshot !== null,
  );
}

export function compareSnapshots(
  before: SourceSnapshot | null,
  after: SourceSnapshot,
): Finding[] {
  if (!before) return [];
  const findings: Finding[] = [];
  for (const old of before.benchmarks) {
    const current = after.benchmarks.find(({ id }) => id === old.id);
    if (!current) {
      findings.push({
        kind: 'benchmark-disappeared',
        benchmarkId: old.id,
        detail: `Previously ${old.rows} rows; now absent from materialized snapshot.`,
      });
      continue;
    }
    for (const field of ['versions', 'metrics'] as const) {
      if (JSON.stringify(old[field]) !== JSON.stringify(current[field]))
        findings.push({
          kind: `${field}-changed`,
          benchmarkId: old.id,
          detail: `${old[field].join(', ')} -> ${current[field].join(', ')}`,
        });
    }
    for (const field of ['models', 'profiles'] as const) {
      const removed = old[field].filter((id) => !current[field].includes(id));
      if (removed.length)
        findings.push({
          kind: `${field}-lost`,
          benchmarkId: old.id,
          detail: `${old[field].length} -> ${current[field].length}; missing ${removed.length}: ${removed.join(', ')}`,
        });
    }
    if (current.includedRows < old.includedRows)
      findings.push({
        kind: 'included-coverage-decreased',
        benchmarkId: old.id,
        detail: `${old.includedRows} -> ${current.includedRows} included rows`,
      });
  }
  for (const current of after.benchmarks) {
    if (!before.benchmarks.some(({ id }) => id === current.id))
      findings.push({
        kind: 'benchmark-materialized',
        benchmarkId: current.id,
        detail: `${current.rows} rows; ${current.includedRows} included`,
      });
  }
  return findings;
}

export function compareCatalogs(
  before: CatalogEntry[] | null,
  after: CatalogEntry[],
): Finding[] {
  if (!before) return [];
  const findings: Finding[] = [];
  for (const entry of after) {
    const previous = before.find(({ id }) => id === entry.id);
    if (!previous)
      findings.push({
        kind: 'catalog-added',
        benchmarkId: entry.id,
        detail: entry.url,
      });
    else if (
      previous.version !== entry.version ||
      previous.title !== entry.title
    )
      findings.push({
        kind: 'catalog-metadata-changed',
        benchmarkId: entry.id,
        detail: `${previous.title} [${previous.version ?? 'unknown'}] -> ${entry.title} [${entry.version ?? 'unknown'}]`,
      });
  }
  for (const entry of before) {
    if (!after.some(({ id }) => id === entry.id))
      findings.push({
        kind: 'catalog-link-disappeared',
        benchmarkId: entry.id,
        detail: `No longer linked by directory: ${entry.url}`,
      });
  }
  return findings;
}

function integratedIds(sourceId: string): Record<string, string> {
  if (sourceId === 'artificial-analysis')
    return Object.fromEntries([
      ...SCORE_MAPPING.map((mapping) => [
        mapping.preferredPage === 'models'
          ? mapping.benchmarkId
          : mapping.preferredPage,
        mapping.benchmarkId,
      ]),
      ['aa-briefcase', 'aa-briefcase'],
      ['omniscience', 'aa-omniscience'],
      ['aa-omniscience', 'aa-omniscience'],
      ['terminal-bench-2-1', 'terminal-bench-2-1'],
      ['terminalbench-2-1', 'terminal-bench-2-1'],
      [
        'artificial-analysis-intelligence-index',
        'artificial-analysis-intelligence-index',
      ],
    ]);
  if (sourceId === 'vals-ai')
    return Object.fromEntries(
      Object.entries(APPROVED_VALS_BENCHMARKS).map(([slug, value]) => [
        slug,
        value.benchmarkId,
      ]),
    );
  if (isSurgeSource(sourceId))
    return Object.fromEntries(
      Object.entries(SURGE_ADAPTERS).map(([slug, adapter]) => [
        slug,
        adapter.benchmarkId,
      ]),
    );
  return {};
}
const cell = (value: string) =>
  value.replace(/[|[\]<>]/gu, (char) => `\\${char}`).replace(/[\r\n]+/gu, ' ');
export function renderSourceReport(reports: SourceReport[]): string {
  return [
    '# Source change report',
    '',
    'Catalog observations and stored score snapshots have separate dates. Snapshot-only sources do not claim discovery of unpublished or unparsed upstream benchmarks.',
    '',
    ...reports.flatMap((report) => [
      `## ${report.sourceId}`,
      '',
      `- Checked: ${report.checkedAt}`,
      `- Stored score snapshot: ${report.snapshotObservedAt ?? 'unknown'}`,
      `- Scope: ${report.scope}`,
      ...(report.error ? [`- ERROR: ${report.error}`] : []),
      '',
      '| Finding | Benchmark | Detail |',
      '|---|---|---|',
      ...report.findings.map(
        (finding) =>
          `| ${cell(finding.kind)} | ${cell(finding.benchmarkId)} | ${cell(finding.detail)} |`,
      ),
      ...(report.findings.length
        ? []
        : ['| None | — | No differences detected within the stated scope. |']),
      '',
      ...(report.inventory.length
        ? [
            '| Source catalog entry | Capture registered | Integration | Benchmark ID | Review note |',
            '|---|---|---|---|---|',
            ...report.inventory.map(
              (entry) =>
                `| [${cell(entry.title)}](${entry.url}) | ${entry.captureRegistered ? 'yes' : 'no'} | ${entry.status} | ${entry.benchmarkId ?? '—'} | ${cell(entry.reason ?? '')} |`,
            ),
            '',
          ]
        : []),
    ]),
    '',
  ].join('\n');
}

export async function monitorSources(input: {
  root: string;
  sourceIds?: string[];
  previousSnapshots?: SourceSnapshot[];
  offline?: boolean;
}): Promise<{
  reportPath: string;
  attentionCount: number;
  errorCount: number;
}> {
  const { root } = input;
  const whitelist = (
    await json<{ whitelist: string[] }>(
      join(root, 'data', 'mappings', 'sources.json'),
    )
  ).whitelist;
  const sourceIds = input.sourceIds ?? whitelist;
  for (const id of sourceIds)
    if (!whitelist.includes(id)) throw new Error(`Source not active: ${id}`);
  const policy = await optionalJson<{
    deferred: Record<string, Record<string, string>>;
  }>(join(root, 'data', 'mappings', 'source-monitoring.json'));
  const directory = join(root, 'data', 'source-monitoring');
  await mkdir(join(directory, 'state'), { recursive: true });
  const checkedAt = new Date().toISOString();
  const reports: SourceReport[] = [];
  for (const sourceId of sourceIds) {
    const report: SourceReport = {
      sourceId,
      checkedAt,
      snapshotObservedAt: null,
      scope: input.offline
        ? 'offline-snapshot'
        : CATALOG_URLS[sourceId]
          ? 'live-catalog-and-snapshot'
          : 'snapshot-only',
      findings: [],
      error: null,
      inventory: [],
    };
    try {
      const statePath = join(directory, 'state', `${sourceId}.json`);
      const previous = await optionalJson<SourceState>(statePath);
      const snapshot = (await readSourceSnapshots(root, [sourceId]))[0]!;
      report.snapshotObservedAt = snapshot.observedAt;
      report.findings = compareSnapshots(
        input.previousSnapshots?.find((item) => item.sourceId === sourceId) ??
          previous?.snapshot ??
          null,
        snapshot,
      );
      let catalog = previous?.catalog ?? null;
      let evidence = previous?.evidence ?? null;
      const url = CATALOG_URLS[sourceId];
      if (url && !input.offline) {
        const capture = await captureArtifact({
          root,
          sourceId,
          url,
          retrievedAt: checkedAt,
          mediaType: 'text/html',
          method: 'DOM',
          metadata: { captureScope: 'benchmark directory change detection' },
        });
        catalog = discoverSourceCatalog(sourceId, capture.text);
        acquisitionClient.budget.checkItems(catalog.length);
        evidence = capture.record;
        report.findings.push(
          ...compareCatalogs(previous?.catalog ?? null, catalog),
        );
        const supported = integratedIds(sourceId);
        // Inventory shares the Surge directory, while each source keeps its own
        // score snapshot and comparison baseline.
        const inventorySnapshots = isSurgeSource(sourceId)
          ? [
              snapshot,
              ...(await readSourceSnapshots(
                root,
                Object.values(SURGE_ADAPTERS)
                  .map((adapter) => adapter.sourceId)
                  .filter((id) => id !== sourceId && whitelist.includes(id)),
                true,
              )),
            ]
          : [snapshot];
        const inventoryBenchmarks = inventorySnapshots.flatMap(
          (item) => item.benchmarks,
        );
        for (const entry of catalog) {
          const benchmarkId =
            supported[entry.id] ??
            inventoryBenchmarks.find((benchmark) =>
              benchmark.sourceUrls.some(
                (sourceUrl) => sourceUrl.split(/[?#]/u)[0] === entry.url,
              ),
            )?.id ??
            null;
          const benchmark = inventoryBenchmarks.find(
            ({ id }) => id === benchmarkId,
          );
          const composite =
            (sourceId === 'vals-ai' && COMPOSITE_VALS_SLUGS.has(entry.id)) ||
            (sourceId === 'artificial-analysis' &&
              entry.id === 'artificial-analysis-intelligence-index');
          const reason =
            policy?.deferred[sourceId]?.[entry.id] ??
            (isSurgeSource(sourceId)
              ? policy?.deferred['surge-chartography']?.[entry.id]
              : null) ??
            (composite
              ? 'Composite retained separately; excluded from capability scoring by existing policy.'
              : null);
          const status = reason
            ? 'reviewed-deferred'
            : benchmark?.includedRows
              ? 'scored'
              : benchmark
                ? 'captured-not-scored'
                : supported[entry.id]
                  ? 'supported-no-scores'
                  : 'unintegrated';
          const captureRegistered =
            sourceId === 'vals-ai' ||
            (isSurgeSource(sourceId) && Boolean(supported[entry.id])) ||
            (sourceId === 'artificial-analysis' &&
              (ARTIFICIAL_ANALYSIS_EVALUATION_SLUGS.some(
                (slug) => slug === entry.id,
              ) ||
                Boolean(supported[entry.id])));
          report.inventory.push({
            ...entry,
            status,
            captureRegistered,
            benchmarkId,
            reason,
          });
          if (!reason && status !== 'scored')
            report.findings.push({
              kind: status,
              benchmarkId: entry.id,
              detail: entry.url,
            });
          if (
            entry.version &&
            benchmark &&
            !benchmark.versions.includes(entry.version) &&
            !benchmark.versions.includes(entry.version.replace(/^v/u, ''))
          )
            report.findings.push({
              kind: 'catalog-snapshot-version-mismatch',
              benchmarkId: entry.id,
              detail: `Directory ${entry.version}; stored scores ${benchmark.versions.join(', ')}`,
            });
        }
      }
      // Offline checks must not advance a live directory baseline.
      if (!input.offline)
        await writeMetadataJson(statePath, {
          schemaVersion: 'source-monitor-state-v1',
          checkedAt,
          snapshot,
          catalog,
          evidence,
        } satisfies SourceState);
    } catch (error) {
      report.error = error instanceof Error ? error.message : String(error);
    }
    reports.push(report);
  }
  const priorReport = await optionalJson<{ sources: SourceReport[] }>(
    join(directory, 'current.json'),
  );
  const sources = [
    ...(priorReport?.sources ?? []).filter(
      (item) =>
        whitelist.includes(item.sourceId) && !sourceIds.includes(item.sourceId),
    ),
    ...reports,
  ].sort((a, b) => a.sourceId.localeCompare(b.sourceId));
  const result = {
    schemaVersion: 'source-change-report-v1',
    checkedAt,
    sources,
  };
  await writeMetadataJson(join(directory, 'current.json'), result);
  const reportPath = join(directory, 'REPORT.md');
  await writeFile(
    reportPath,
    await format(renderSourceReport(sources), { parser: 'markdown' }),
  );
  const history = join(root, 'artifacts', 'source-monitoring');
  await mkdir(history, { recursive: true });
  await writeMetadataJson(
    join(history, `${checkedAt.replace(/[:.]/gu, '-')}.json`),
    result,
  );
  return {
    reportPath,
    attentionCount: reports.reduce(
      (total, item) => total + item.findings.length,
      0,
    ),
    errorCount: reports.filter((item) => item.error).length,
  };
}
