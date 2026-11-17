import type { DimensionId, ProductVersion } from '@llm-bench/benchmark-data';

import {
  WEIGHTED_SOURCE_COUNT,
  costSourceName,
  scoreBasisNote,
  sourceName,
} from './cost-labels';
import { evidenceVersionPath, toDashboardProduct } from './dashboard-data';
import { escapeCell, markdownLine } from './leaderboard-markdown';
import { formatScore } from './score-format';
import {
  LLMS_TXT_PATH,
  METHODOLOGY_PATH,
  REPOSITORY_URL,
  presetMarkdownPath,
} from './site-paths';
import {
  UI_DIMENSION_ABBREVIATIONS,
  UI_DIMENSION_IDS,
  UI_DIMENSION_NAMES,
  getActiveDimensionIds,
} from './ui-contract';
import {
  COST_SOURCE_WEIGHTS,
  buildWeightedCostCurve,
  getCostParetoFrontier,
  getProfileIdentity,
  getRepresentativeRows,
  mainScreenProduct,
  profileById,
  withActivePreset,
} from './view-model';

/**
 * Plain-text files published next to the dashboard for readers that cannot run
 * it: fetch-only agents, crawlers and scripts. They are built from the same
 * projections the page renders, so a number here is the number on screen.
 */

const table = (headers: string[], rows: string[][]): string =>
  [
    markdownLine(headers),
    markdownLine(headers.map(() => '---')),
    ...rows.map(markdownLine),
  ].join('\n');

/** Path from a file at `from` to the site-root-relative `to`. */
const relativeTo = (from: string, to: string): string =>
  `${'../'.repeat(from.split('/').length - 1)}${to}`;

const versionLines = (product: ProductVersion): string[] => [
  `- Data version: \`${product.versionId}\``,
  `- Generated: ${product.generatedAt} (UTC; when this data version was built)`,
];

const SCORE_NOTE =
  'Scores are 0–100 and higher is better. A missing score is written N/A; it is never zero and never imputed.';

export const presetMarkdown = (
  product: ProductVersion,
  presetId: string,
  benchmarkDimensions: Record<string, DimensionId>,
): string | null => {
  if (!product.presets.some(({ id }) => id === presetId)) return null;
  const self = presetMarkdownPath(presetId);
  const link = (to: string): string => relativeTo(self, to);
  const main = mainScreenProduct(
    withActivePreset(toDashboardProduct(product), presetId),
  );
  const rows = getRepresentativeRows(main);
  const dimensionIds = getActiveDimensionIds(rows);
  const evidenceRoot = `evidence/${evidenceVersionPath(product.versionId)}`;

  const leaderboard = table(
    [
      'Rank',
      'Model',
      'Provider',
      'Reasoning effort',
      'Overall',
      ...dimensionIds.map(
        (dimension) =>
          `${UI_DIMENSION_NAMES[dimension]} (${UI_DIMENSION_ABBREVIATIONS[dimension]})`,
      ),
      'Evidence',
    ],
    rows.map((row) => {
      const profile = profileById(main, row.profileId);
      return [
        row.rank === null ? 'N/A' : String(row.rank),
        escapeCell(profile?.baseModelName ?? row.modelId),
        escapeCell(profile?.providerId ?? 'unknown'),
        escapeCell(profile ? getProfileIdentity(profile) : 'unknown'),
        formatScore(row.overallScore),
        ...dimensionIds.map((dimension) =>
          formatScore(
            row.dimensions.find((entry) => entry.dimension === dimension)
              ?.score ?? null,
          ),
        ),
        `[${row.profileId}.json](${link(`${evidenceRoot}/${row.profileId}.json`)})`,
      ];
    }),
  );

  const points = buildWeightedCostCurve(main);
  const frontier = new Set(
    getCostParetoFrontier(points).map(({ profileId }) => profileId),
  );
  const costs = points.length
    ? table(
        [
          'Model',
          'Provider',
          'Cost index (0–100, lower is cheaper)',
          'Overall',
          'Cost sources',
          'On value frontier',
          'Task cost in USD by source (paired score)',
        ],
        points.map((point) => [
          escapeCell(point.displayName),
          escapeCell(point.providerId),
          point.normalizedCost.toFixed(1),
          point.performance.toFixed(1),
          `${point.sourceCount} of ${WEIGHTED_SOURCE_COUNT}`,
          frontier.has(point.profileId) ? 'yes' : 'no',
          point.sourceCosts
            .map((source) =>
              escapeCell(
                `${costSourceName(source)} $${source.cost.toFixed(3)} (${scoreBasisNote(
                  source.scoreBasis,
                  source.sourceScore,
                  source.scoreBenchmarkVersion,
                )})`,
              ),
            )
            .join('; '),
        ]),
      )
    : 'No model in this preset has a comparable task cost.';

  const benchmarks = table(
    ['Benchmark ID', 'Dimension'],
    main.activePreset.benchmarkIds
      .toSorted()
      .map((id) => [`\`${id}\``, UI_DIMENSION_NAMES[benchmarkDimensions[id]!]]),
  );

  return [
    `# FM-DCC leaderboard — preset \`${presetId}\``,
    '',
    `Frontier language models ranked on the benchmarks every model in this set has in common.${
      presetId === product.defaultPresetId
        ? ' This is the default view of the dashboard.'
        : ''
    }`,
    '',
    ...versionLines(product),
    `- Models: ${rows.length}; benchmarks scored: ${main.activePreset.benchmarkIds.length}`,
    `- Method: [methodology](${link(METHODOLOGY_PATH)})`,
    '',
    '## Leaderboard',
    '',
    `One row per base model, at its highest-scoring reasoning effort. ${SCORE_NOTE} Overall is the weighted mean of the dimension scores; a dimension backed by a single benchmark counts half. Each Evidence file lists every measurement behind the row with its source URL.`,
    '',
    leaderboard,
    '',
    '## Quality vs. cost',
    '',
    'The cost index blends task costs across sources: within each source the natural log of the USD task cost is min-max scaled to 0–100, then the sources a model has are averaged with equal weight. It is a relative position, not a dollar estimate; the per-source USD figures are the published costs. A model is on the value frontier when its Overall is strictly higher than that of every model with the same or a lower cost index.',
    '',
    costs,
    '',
    '## Benchmarks scored in this preset',
    '',
    benchmarks,
    '',
    '## Other presets',
    '',
    ...product.presets.map(
      ({ id, leaderboard: presetRows }) =>
        `- [${id}](${link(presetMarkdownPath(id))})${
          id === presetId ? ' (this file)' : ''
        }: ${new Set(presetRows.map(({ modelId }) => modelId)).size} models`,
    ),
    '',
  ].join('\n');
};

export const llmsTxt = (product: ProductVersion): string =>
  [
    '# FM-DCC — Frontier Model Doh Choo-choo',
    '',
    '> A static leaderboard comparing frontier language models on capability dimensions (agentic, coding, reasoning, knowledge, comprehension) and on task cost, computed from publicly published benchmark results.',
    '',
    ...versionLines(product),
    `- ${SCORE_NOTE}`,
    '- The HTML dashboard embeds its whole dataset and is about 2 MB; read the files below instead.',
    '',
    '## Leaderboards',
    '',
    ...product.presets.map(
      ({ id }) =>
        `- [${id}](${presetMarkdownPath(id)}): ranking, dimension scores, task costs and benchmark list${
          id === product.defaultPresetId ? ' (default view)' : ''
        }`,
    ),
    '',
    '## Evidence',
    '',
    `- \`evidence/${evidenceVersionPath(product.versionId)}/<profileId>.json\`: every measurement for one model profile (schema \`profile-evidence-v1\`), with raw and normalized score, inclusion status, source URL, locator and retrieval time. Each leaderboard row links to its file. The directory name changes with the data version.`,
    '',
    '## Documentation',
    '',
    `- [Methodology](${METHODOLOGY_PATH}): model selection, scoring formulas, cost index, sources and attribution`,
    `- [Source repository](${REPOSITORY_URL}): code, source snapshots and the full methodology (Traditional Chinese)`,
    '',
  ].join('\n');

const hostOf = (url: string): string => {
  try {
    return new URL(url).host;
  } catch {
    return 'unknown';
  }
};

const sourcesTable = (product: ProductVersion): string => {
  const snapshots = new Map(
    product.sourceSnapshotIds.map((id) => {
      const split = id.indexOf(':');
      return [id.slice(0, split), id.slice(split + 1)] as const;
    }),
  );
  const bySource = new Map<
    string,
    { included: number; roles: Set<string>; hosts: Map<string, number> }
  >();
  product.evidence.forEach((row) => {
    if (row.inclusion !== 'INCLUDED') return;
    const entry = bySource.get(row.sourceId) ?? {
      included: 0,
      roles: new Set<string>(),
      hosts: new Map<string, number>(),
    };
    entry.included += 1;
    entry.roles.add(row.sourceRole);
    const host = hostOf(row.provenance.sourceUrl);
    entry.hosts.set(host, (entry.hosts.get(host) ?? 0) + 1);
    bySource.set(row.sourceId, entry);
  });
  return table(
    [
      'Source ID',
      'Publisher site',
      'Role',
      'Included measurements',
      'Snapshot taken (UTC)',
      'Licence / redistribution terms',
    ],
    [...bySource.entries()]
      .toSorted(([left], [right]) => left.localeCompare(right))
      .map(([sourceId, { included, roles, hosts }]) => [
        `\`${sourceId}\``,
        [...hosts.entries()].toSorted(
          (left, right) =>
            right[1] - left[1] || left[0].localeCompare(right[0]),
        )[0]![0],
        [...roles].toSorted().join(', '),
        String(included),
        snapshots.get(sourceId) ?? 'unknown',
        'unknown',
      ]),
  );
};

export const methodologyMarkdown = (
  product: ProductVersion,
  benchmarkDimensions: Record<string, DimensionId>,
): string => {
  const quality = product.benchmarkQuality;
  const ids = (values: readonly string[]): string =>
    values.length
      ? values
          .toSorted()
          .map((id) => `\`${id}\``)
          .join(', ')
      : 'none';
  const perDimension = UI_DIMENSION_IDS.map(
    (dimension) =>
      [
        dimension,
        Object.values(benchmarkDimensions).filter(
          (value) => value === dimension,
        ).length,
      ] as const,
  );
  const weightEntries = Object.keys(COST_SOURCE_WEIGHTS);
  const docs = `${REPOSITORY_URL}/blob/main/docs`;

  return [
    '# FM-DCC methodology',
    '',
    `This is an English summary generated with the data. The authoritative text is the Traditional Chinese documentation in the repository: [scoring](${docs}/SCORING_METHODOLOGY.md), [data and cost](${docs}/DATA_METHODOLOGY.md), [frontier policy](${docs}/FRONTIER_POLICY.md) and [benchmark-to-dimension mapping](${docs}/BENCHMARK_DIMENSION_MAPPING.md). Where the two differ, the repository documentation governs.`,
    '',
    ...versionLines(product),
    '',
    '## Dimensions',
    '',
    'Each benchmark feeds exactly one dimension.',
    '',
    table(
      ['Dimension', 'Abbreviation', 'Meaning', 'Benchmarks mapped'],
      perDimension.map(([dimension, count]) => [
        UI_DIMENSION_NAMES[dimension],
        UI_DIMENSION_ABBREVIATIONS[dimension],
        DIMENSION_MEANINGS[dimension],
        String(count),
      ]),
    ),
    '',
    '## Which models are ranked',
    '',
    '- The model set follows the Artificial Analysis Intelligence Index ranking of current frontier models. That index only selects models; it is not part of any score.',
    '- A model qualifies when it is ranked there and has results from at least two independent organisations.',
    `- Each preset takes the top N qualifying models (N = 2 to 10). The default preset is \`${product.defaultPresetId}\`.`,
    '- A model can have several profiles, one per reasoning effort. Results from different efforts are never merged. The leaderboard shows one row per base model: the profile with the highest Overall.',
    '',
    '## Which benchmarks are scored',
    '',
    '- A preset scores only the benchmarks that every model in it has a valid result for, so all rows are compared on the same tests.',
    '- A result counts when it is included, finite, and normalized to 0–100. External composite indices are not scored.',
    `- Excluded from scoring by the quality policy (reviewed ${quality?.reviewedAt ?? 'unknown'}): ${ids(quality?.excludedBenchmarkIds ?? [])}.`,
    `- Limited benchmarks (${ids(quality?.limitedBenchmarkIds ?? [])}) are kept only when the same dimension also has at least ${quality?.minOtherBenchmarksPerLimited ?? 'unknown'} unrestricted benchmarks.`,
    '- The main table lists a profile only when it has every benchmark of the preset and a score in every displayed dimension.',
    '',
    '## Dimension and Overall scores',
    '',
    '1. Benchmark score: the arithmetic mean of its compatible metrics.',
    '2. Dimension score: the arithmetic mean of the scored benchmarks mapped to that dimension.',
    '3. Dimension weight: 1 when the dimension has two or more scored benchmarks, 0.5 when it has one. A dimension with none is left out and not displayed.',
    '4. Overall = Σ(dimension score × weight) / Σ(weight).',
    '',
    'Rows are ordered by Overall, with the profile ID as the tie-break. A profile with no scored benchmark has a null Overall and no rank. Missing data is never treated as zero.',
    '',
    '## When sources disagree',
    '',
    'One result is kept per benchmark, model, effort and metric: by source role priority first, then a full result over a partial one, then the higher comparable score among equally ranked sources. Results that were not adopted stay in the evidence files for audit, so an evidence file can hold more measurements than the ones that were scored.',
    '',
    '## Cost index',
    '',
    `- Only published USD-per-task costs are used; API token prices are not part of the default chart. Cost never affects capability scores.`,
    '- Within each source, the natural log of the task cost is min-max scaled to 0–100 across that source (0 = cheapest, 100 = most expensive).',
    `- The index is the equally weighted mean over the cost groups a model has, out of ${weightEntries.length}: ${weightEntries.map(sourceName).join(', ')}. Missing groups are skipped and the weights renormalised.`,
    '- The value frontier is the Pareto set: scanning from cheapest to most expensive, a model is on it when its Overall is strictly higher than that of every model with the same or a lower cost index.',
    '- The index is a comparison aid, not a dollar estimate.',
    '',
    '## Sources and attribution',
    '',
    'All benchmark results and costs are the work of their publishers and are reproduced here as individual facts with a link to where each was published. This project has not established the licence or redistribution terms of any source, so the column below reads "unknown" and no open-data licence is claimed over the results. Consult each publisher before reusing its data.',
    '',
    sourcesTable(product),
    '',
    `Machine-readable files are listed in [llms.txt](${LLMS_TXT_PATH}).`,
    '',
  ].join('\n');
};

const DIMENSION_MEANINGS: Record<DimensionId, string> = {
  agentic: 'Operating an environment to reach a goal',
  coding: 'Producing code that meets the requirements',
  reasoning: 'Deriving an answer from given conditions',
  knowledge: 'Applying existing domain knowledge',
  comprehension: 'Interpreting the input material',
  language: 'Writing text as instructed',
};
