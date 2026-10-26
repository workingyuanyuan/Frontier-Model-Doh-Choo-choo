import {
  CandidateResultSchema,
  type CandidateResult,
} from '@llm-bench/benchmark-data';

import { resolveLiveBenchModel } from './livebench-materializer.js';
import { parseCsv } from './materializer-utils.js';

/**
 * LiveBench 2.0 suites. Each column of `data/<release>/table.csv` is already
 * the official suite score (mean task score, 0–100, single run). Dimensions
 * follow the graded endpoint described on the 2.0 methodology page; tools
 * follow its "Not agentic: no tools" notes for Reasoning and Data Analysis.
 */
export const LIVEBENCH2_SUITES = [
  {
    column: 'long_agentic',
    category: 'Long Agentic',
    benchmarkId: 'livebench-long-agentic',
    tools: true,
  },
  {
    column: 'reasoning',
    category: 'Reasoning',
    benchmarkId: 'livebench-reasoning',
    tools: false,
  },
  {
    column: 'coding',
    category: 'Coding',
    benchmarkId: 'livebench-coding',
    tools: true,
  },
  {
    column: 'browser',
    category: 'Browser',
    benchmarkId: 'livebench-browser',
    tools: true,
  },
  {
    column: 'data_analysis',
    category: 'Data Analysis',
    benchmarkId: 'livebench-data-analysis',
    tools: false,
  },
  {
    column: 'research',
    category: 'Research',
    benchmarkId: 'livebench-research',
    tools: true,
  },
  {
    column: 'design',
    category: 'Design',
    benchmarkId: 'livebench-design',
    tools: true,
  },
] as const;

export const LIVEBENCH2_HARNESS = 'LiveBench 2.0';

/** Metadata key in `categories.json` holding the source's Overall weights. */
export const LIVEBENCH2_WEIGHTS_KEY = '_overall_weights';

export interface LiveBench2Release {
  /** Directory name under `data/`, e.g. `20261014`. */
  path: string;
  /** ISO date, e.g. `2026-10-14`. */
  date: string;
}

export interface LiveBench2RegistryEntry {
  displayName: string;
  effort: string | null;
}

/** Reads the 2.0 release list (`["20261014"]`) from the application bundle. */
export function extractLiveBench2Release(mainJs: string): LiveBench2Release {
  const match = mainJs.match(/\["(20\d{6})"(?:,"20\d{6}")*\]/u);
  if (!match) throw new Error('LiveBench 2.0 release list was not found');
  const path = [...match[0].matchAll(/"(20\d{6})"/gu)].at(-1)![1]!;
  return {
    path,
    date: `${path.slice(0, 4)}-${path.slice(4, 6)}-${path.slice(6, 8)}`,
  };
}

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');

/**
 * Reads the 2.0 model registry entry (`"slug":{displayName:…,effort:…}`).
 * Older registry entries start with `url:`; 2.0 entries start with
 * `displayName:`, which keeps the two registries apart.
 */
export function readLiveBench2Registry(
  mainJs: string,
  slug: string,
): LiveBench2RegistryEntry | null {
  const key = /^[A-Za-z_$][\w$]*$/u.test(slug)
    ? `(?:"${escapeRegExp(slug)}"|\\b${escapeRegExp(slug)})`
    : `"${escapeRegExp(slug)}"`;
  const match = new RegExp(
    `${key}:\\{(displayName:"[^"]*"[^{}]*)\\}`,
    'u',
  ).exec(mainJs);
  if (!match) return null;
  const body = match[1]!;
  return {
    displayName: /displayName:"([^"]*)"/u.exec(body)![1]!,
    effort: /effort:"([^"]*)"/u.exec(body)?.[1] ?? null,
  };
}

export interface MaterializeLiveBench2Context {
  release: LiveBench2Release;
  tableEvidenceId: string;
  categoriesEvidenceId: string;
  jsEvidenceId: string;
  tableUrl: string;
  observedAt: string;
}

export interface MaterializeLiveBench2Result {
  candidates: CandidateResult[];
  models: string[];
  unresolvedModels: string[];
  blankCells: string[];
  /** Explicit `_overall_weights`; suites not listed weigh 1 upstream. */
  overallWeights: Record<string, number>;
}

export function materializeLiveBench2(
  mainJs: string,
  tableCsv: string,
  categoriesJson: string,
  context: MaterializeLiveBench2Context,
): MaterializeLiveBench2Result {
  // Releases after 2026-10-14 add `_overall_weights` for the source's own
  // Overall. Overall is not materialized, but the weights must name known
  // suites with positive finite values, so a renamed suite still fails closed.
  const { [LIVEBENCH2_WEIGHTS_KEY]: rawWeights, ...categories } = JSON.parse(
    categoriesJson,
  ) as Record<string, unknown>;
  const overallWeights: Record<string, number> = {};
  if (rawWeights !== undefined) {
    if (
      rawWeights === null ||
      typeof rawWeights !== 'object' ||
      Array.isArray(rawWeights)
    ) {
      throw new Error('LiveBench 2.0 _overall_weights is not an object');
    }
    for (const [category, weight] of Object.entries(rawWeights)) {
      if (!LIVEBENCH2_SUITES.some((suite) => suite.category === category)) {
        throw new Error(
          `LiveBench 2.0 _overall_weights names unknown category ${category}`,
        );
      }
      if (
        typeof weight !== 'number' ||
        !Number.isFinite(weight) ||
        weight <= 0
      ) {
        throw new Error(
          `Invalid LiveBench 2.0 weight ${category}: ${String(weight)}`,
        );
      }
      overallWeights[category] = weight;
    }
  }
  for (const suite of LIVEBENCH2_SUITES) {
    const columns = categories[suite.category] as string[] | undefined;
    if (columns?.length !== 1 || columns[0] !== suite.column) {
      throw new Error(
        `LiveBench 2.0 category ${suite.category} no longer maps to column ${suite.column}`,
      );
    }
  }
  const extra = Object.keys(categories).filter(
    (name) => !LIVEBENCH2_SUITES.some(({ category }) => category === name),
  );
  if (extra.length > 0) {
    throw new Error(`Unreviewed LiveBench 2.0 categories: ${extra.join(', ')}`);
  }

  const rows = parseCsv(tableCsv.trim());
  const header = rows[0] ?? [];
  const column = (name: string) => {
    const index = header.indexOf(name);
    if (index < 0) throw new Error(`LiveBench 2.0 table lacks ${name}`);
    return index;
  };
  const modelColumn = column('model');
  const suiteColumns = LIVEBENCH2_SUITES.map((suite) => ({
    ...suite,
    index: column(suite.column),
  }));

  const candidates: CandidateResult[] = [];
  const models: string[] = [];
  const unresolved: string[] = [];
  const blankCells: string[] = [];
  for (const row of rows.slice(1)) {
    const rawName = row[modelColumn]?.trim();
    if (!rawName) continue;
    models.push(rawName);
    const registry = readLiveBench2Registry(mainJs, rawName);
    if (!registry) {
      throw new Error(`LiveBench 2.0 registry has no entry for ${rawName}`);
    }
    const resolution = resolveLiveBenchModel(rawName);
    if (resolution.canonicalModelId === null) unresolved.push(rawName);
    const effort = registry.effort ?? resolution.effort;
    const profileId = resolution.canonicalModelId
      ? `${resolution.canonicalModelId}-${effort ?? 'default'}-livebench-2`
      : null;
    for (const suite of suiteColumns) {
      const cell = row[suite.index]?.trim() ?? '';
      // A blank cell means the suite is still running; a published 0 stays 0.
      if (cell === '') {
        blankCells.push(`${rawName}/${suite.column}`);
        continue;
      }
      const score = Number(cell);
      if (!Number.isFinite(score) || score < 0 || score > 100) {
        throw new Error(
          `Invalid LiveBench 2.0 score ${rawName}/${suite.column}: ${cell}`,
        );
      }
      candidates.push(
        CandidateResultSchema.parse({
          schemaVersion: 'candidate-result-v1',
          id: `livebench-${context.release.date}:${suite.benchmarkId}:${rawName.replace(/[^a-z0-9]+/giu, '-').toLowerCase()}`,
          sourceId: 'livebench',
          sourceRole: 'ORGANIZER',
          benchmarkId: suite.benchmarkId,
          benchmarkVersion: context.release.date,
          model: {
            rawName,
            canonicalModelId: resolution.canonicalModelId,
            profileId,
          },
          profile: {
            effort,
            thinking: null,
            tools: suite.tools,
            harness: LIVEBENCH2_HARNESS,
            contextWindowTokens: null,
            quantization: null,
            attempts: 1,
          },
          metric: {
            id: 'suite-score',
            name: `${suite.category} suite score`,
            unit: 'percent',
            higherIsBetter: true,
          },
          rawScore: score,
          normalizedScore: score,
          acquisitionStatus: 'FULL',
          inclusion: 'INCLUDED',
          exclusionReason: null,
          sourceUrl: context.tableUrl,
          observedAt: context.observedAt,
          sourcePublishedAt: `${context.release.date}T00:00:00.000Z`,
          evidenceIds: [
            context.tableEvidenceId,
            context.categoriesEvidenceId,
            context.jsEvidenceId,
          ],
          provenance: {
            rawScore: {
              evidenceId: context.tableEvidenceId,
              locator: `row[model="${rawName}"].${suite.column}`,
              method: 'EXPORT',
            },
            'profile.effort': {
              evidenceId: context.jsEvidenceId,
              locator: `2.0 model registry["${rawName}"].effort (${registry.displayName})`,
              method: 'EMBEDDED_JSON',
            },
          },
        }),
      );
    }
  }
  return {
    candidates: candidates.toSorted((left, right) =>
      left.id.localeCompare(right.id),
    ),
    models,
    unresolvedModels: [...new Set(unresolved)].toSorted(),
    blankCells,
    overallWeights,
  };
}
