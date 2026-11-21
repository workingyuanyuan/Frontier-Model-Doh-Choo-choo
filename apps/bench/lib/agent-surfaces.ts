import type { DimensionId, ProductVersion } from '@llm-bench/benchmark-data';

import {
  COST_TABLE_INDEX_HEADING,
  COST_NOTE,
  costSourceName,
  scoreBasisNote,
  sourceName,
} from './cost-labels';
import { escapeCell, markdownLine } from './leaderboard-markdown';
import { PRESET_FAMILY_INFO } from './preset-family';
import {
  projectPreset,
  type PresetCostSource,
  type PresetProjection,
} from './preset-projection';
import { formatScore } from './score-format';
import {
  COSTS_PATH,
  DATA_INDEX_PATH,
  LLMS_TXT_PATH,
  METHODOLOGY_PATH,
  PROFILES_PATH,
  REPOSITORY_URL,
  evidenceVersionPath,
  presetJsonPath,
  presetMarkdownPath,
  presetPagePath,
  profileEvidencePath,
  relativeTo,
} from './site-paths';
import {
  ECONOMY_ABBREVIATION,
  ECONOMY_HEADING,
  UI_DIMENSION_ABBREVIATIONS,
  UI_DIMENSION_IDS,
  UI_DIMENSION_NAMES,
} from './ui-contract';
import { COST_SOURCE_WEIGHTS, getProfileIdentity } from './view-model';

/**
 * Files published next to the dashboard for readers that cannot run it:
 * fetch-only agents, crawlers and scripts. The per-preset files render the
 * same projection as the static preset page, which is built from the functions
 * the dashboard calls, so a number here is the number on screen.
 */

const table = (headers: string[], rows: string[][]): string =>
  [
    markdownLine(headers),
    markdownLine(headers.map(() => '---')),
    ...rows.map(markdownLine),
  ].join('\n');

const versionLines = (product: {
  versionId: string;
  generatedAt: string;
}): string[] => [
  `- Data version: \`${product.versionId}\``,
  `- Generated: ${product.generatedAt} (UTC; when this data version was built)`,
];

const SCORE_NOTE =
  'Scores are 0–100 and higher is better. A missing score is written N/A; it is never zero and never imputed.';

export const LEADERBOARD_NOTE =
  'One row per base model, at its representative reasoning effort (the qualifying effort holding the most scoring-eligible benchmarks). Overall is the weighted mean of the dimension scores; a dimension backed by a single benchmark counts half. Economy is 100 minus the cost index explained under Quality vs. cost, so higher is cheaper; it does not enter Overall, and N/A means the model has no comparable task cost.';

export const COST_SOURCES_TITLE = 'Task costs by source';
export const COST_SOURCES_NOTE =
  'One row per source behind a cost index. The paired score is the score that source published with the cost, on its own scale; it is not the Overall.';
export const COST_SOURCE_HEADERS = [
  'Model',
  'Source',
  'Task cost (USD)',
  'Paired score',
];

export const dimensionHeading = (dimension: DimensionId): string =>
  `${UI_DIMENSION_NAMES[dimension]} (${UI_DIMENSION_ABBREVIATIONS[dimension]})`;

/** Name, USD task cost and paired score of one source, as every format prints them. */
export const costSourceCells = (
  source: PresetCostSource,
): [name: string, usd: string, pairedScore: string] => [
  costSourceName({
    sourceId: source.sourceId,
    ...(source.reportedBySourceId
      ? { reportedSourceId: source.reportedBySourceId }
      : {}),
  }),
  `$${source.usdPerTask.toFixed(3)}`,
  scoreBasisNote(
    source.pairedScore?.basis ?? 'NONE',
    source.pairedScore?.score ?? null,
    source.pairedScore?.benchmarkVersion,
  ),
];

/** Every preset's projection, in product order. */
export const projectPresets = (
  product: ProductVersion,
  benchmarkDimensions: Record<string, DimensionId>,
): PresetProjection[] =>
  product.presets.map(({ id }) =>
    projectPreset(product, id, benchmarkDimensions)!,
  );

export const presetMarkdown = (
  projection: PresetProjection,
  presets: readonly PresetProjection[],
): string => {
  const { preset, dimensionIds } = projection;
  const link = (to: string): string =>
    relativeTo(presetMarkdownPath(preset.id), to);

  const leaderboard = table(
    [
      'Rank',
      'Model',
      'Frontier #',
      'Provider',
      'Reasoning effort',
      'Overall',
      ...dimensionIds.map(dimensionHeading),
      ECONOMY_HEADING,
      'Evidence',
    ],
    projection.leaderboard.map((row) => [
      row.rank === null ? 'N/A' : String(row.rank),
      escapeCell(row.modelName),
      row.frontierWindowRank === null ? 'N/A' : String(row.frontierWindowRank),
      escapeCell(row.providerId),
      escapeCell(row.reasoningEffort),
      formatScore(row.overallScore),
      ...dimensionIds.map((dimension) =>
        formatScore(row.dimensionScores[dimension] ?? null),
      ),
      formatScore(row.economyScore),
      `[${row.profileId}.json](${link(row.evidencePath)})`,
    ]),
  );

  const costs = projection.costs.length
    ? table(
        [
          'Model',
          'Provider',
          COST_TABLE_INDEX_HEADING,
          'Overall',
          'Cost sources',
          'On value frontier',
        ],
        projection.costs.map((row) => [
          escapeCell(row.displayName),
          escapeCell(row.providerId),
          row.costIndex.toFixed(1),
          row.overallScore.toFixed(1),
          `${row.sourceCount} of ${projection.weightedCostSourceCount}`,
          row.onValueFrontier ? 'yes' : 'no',
        ]),
      )
    : 'No model in this preset has a comparable task cost.';
  const costSources = table(
    COST_SOURCE_HEADERS,
    projection.costs.flatMap((row) =>
      row.sources.map((source) => {
        const [name, usd, pairedScore] = costSourceCells(source);
        return [
          escapeCell(row.displayName),
          `[${escapeCell(name)}](${source.sourceUrl})`,
          usd,
          escapeCell(pairedScore),
        ];
      }),
    ),
  );

  const benchmarks = table(
    ['Benchmark ID', 'Dimension'],
    projection.benchmarks.map(({ id, dimension }) => [
      `\`${id}\``,
      UI_DIMENSION_NAMES[dimension],
    ]),
  );

  return [
    `# FM-DCC leaderboard — preset \`${preset.id}\``,
    '',
    `Frontier language models ranked on the benchmarks every model in this set has in common.${
      preset.isDefault ? ' This is the default view of the dashboard.' : ''
    }`,
    '',
    `${preset.scopeNote} Scores compare only within this preset.`,
    '',
    ...versionLines(projection),
    `- Model set: ${preset.familyName}, ${preset.selectionRule}`,
    `- Models: ${preset.modelCount}; benchmarks scored: ${preset.benchmarkCount}`,
    ...(preset.counterpartPresetId
      ? [
          `- Same size in the other model set: [${preset.counterpartPresetId}](${link(presetMarkdownPath(preset.counterpartPresetId))})`,
        ]
      : []),
    `- Method: [methodology](${link(METHODOLOGY_PATH)})`,
    `- Same data: [JSON](${link(presetJsonPath(preset.id))}) (unrounded), [HTML](${link(presetPagePath(preset.id))})`,
    '',
    '## Leaderboard',
    '',
    `${LEADERBOARD_NOTE} ${SCORE_NOTE} Frontier # is the model's position in the AA-ordered frontier window. Each Evidence file lists every measurement behind the row with its source URL.`,
    '',
    leaderboard,
    '',
    '## Quality vs. cost',
    '',
    COST_NOTE,
    '',
    costs,
    '',
    ...(projection.costs.length
      ? [`## ${COST_SOURCES_TITLE}`, '', COST_SOURCES_NOTE, '', costSources, '']
      : []),
    '## Benchmarks scored in this preset',
    '',
    benchmarks,
    '',
    '## Other presets',
    '',
    ...presets.map(
      (other) =>
        `- [${other.preset.id}](${link(presetMarkdownPath(other.preset.id))})${
          other.preset.id === preset.id ? ' (this file)' : ''
        }: ${other.preset.familyName}, ${other.preset.modelCount} models`,
    ),
    '',
  ].join('\n');
};

const UNITS = {
  overallScore: { unit: 'score_0_100', better: 'higher' },
  dimensionScores: { unit: 'score_0_100', better: 'higher' },
  costIndex: { unit: 'normalized_index_0_100', better: 'lower' },
  economyScore: { unit: 'score_0_100', better: 'higher' },
  normalizedCost: { unit: 'normalized_index_0_100', better: 'lower' },
  usdPerTask: { unit: 'USD_PER_TASK', better: 'lower' },
} as const;

const json = (value: unknown): string => `${JSON.stringify(value, null, 1)}\n`;

/**
 * The preset projection as a public document: links become relative to the
 * file's own URL, and the meaning of each number and of null is spelled out.
 */
export const presetJson = (projection: PresetProjection): string => {
  const { preset } = projection;
  const link = (to: string): string =>
    relativeTo(presetJsonPath(preset.id), to);
  return json({
    schemaVersion: 'preset-leaderboard-v2',
    versionId: projection.versionId,
    generatedAt: projection.generatedAt,
    preset,
    links: {
      note: "Relative to this file's URL.",
      index: link(DATA_INDEX_PATH),
      markdown: link(presetMarkdownPath(preset.id)),
      html: link(presetPagePath(preset.id)),
      methodology: link(METHODOLOGY_PATH),
    },
    units: UNITS,
    nulls: {
      score: 'Not measured. A missing score is never zero and never imputed.',
      costIndex:
        'The model is not on the cost chart: no weighted cost source published a positive USD task cost for a profile of it that qualifies for the table, or its Overall is zero.',
      pairedScore:
        'The source published a cost but no score that can be paired with it.',
    },
    notes: {
      leaderboard: LEADERBOARD_NOTE,
      costs: COST_NOTE,
      frontierWindowRank:
        "The model's 1-based position in the AA-ordered frontier window.",
    },
    dimensionIds: projection.dimensionIds,
    leaderboard: projection.leaderboard.map(({ evidencePath, ...row }) => ({
      ...row,
      evidence: link(evidencePath),
    })),
    weightedCostSourceCount: projection.weightedCostSourceCount,
    weightedCostSourceIds: Object.keys(COST_SOURCE_WEIGHTS),
    costs: projection.costs.map((row) => ({
      ...row,
      sources: row.sources.map((source) => ({
        ...source,
        sourceName: sourceName(source.sourceId),
      })),
    })),
    benchmarks: projection.benchmarks,
  });
};

/** Entry point for scripts: every published data file and the source list. */
export const dataIndexJson = (
  product: ProductVersion,
  presets: readonly PresetProjection[],
): string => {
  const link = (to: string): string => relativeTo(DATA_INDEX_PATH, to);
  return json({
    schemaVersion: 'data-index-v2',
    versionId: product.versionId,
    generatedAt: product.generatedAt,
    links: {
      note: "Relative to this file's URL. Only the latest data version is published; every file states its versionId.",
      profiles: link(PROFILES_PATH),
      costs: link(COSTS_PATH),
      methodology: link(METHODOLOGY_PATH),
      llmsTxt: link(LLMS_TXT_PATH),
      repository: REPOSITORY_URL,
    },
    defaultPresetId: product.defaultPresetId,
    presets: presets.map(({ preset }) => ({
      ...preset,
      json: link(presetJsonPath(preset.id)),
      markdown: link(presetMarkdownPath(preset.id)),
      html: link(presetPagePath(preset.id)),
    })),
    evidence: {
      schemaVersion: 'profile-evidence-v1',
      pathTemplate: link(profileEvidencePath(product.versionId, '{profileId}')),
      profileCount: product.profiles.length,
      note: 'One file per profile listed in profiles. The directory name changes with the data version.',
    },
    sources: {
      note: 'Results and costs belong to their publishers. Licence and redistribution terms have not been established for any source; no open-data licence is claimed.',
      weightedCostSourceIds: Object.keys(COST_SOURCE_WEIGHTS),
      list: sourceRows(product).map((source) => ({
        ...source,
        licence: 'unknown',
      })),
    },
  });
};

export const profilesJson = (product: ProductVersion): string =>
  json({
    schemaVersion: 'profiles-v1',
    versionId: product.versionId,
    generatedAt: product.generatedAt,
    note: "A profile is one model at one reasoning effort. Evidence paths are relative to this file's URL.",
    profiles: product.profiles.map((profile) => ({
      id: profile.id,
      modelId: profile.modelId,
      modelName: profile.baseModelName,
      providerId: profile.providerId,
      reasoningEffort: getProfileIdentity(profile),
      releaseDate: profile.releaseDate,
      evidence: relativeTo(
        PROFILES_PATH,
        profileEvidencePath(product.versionId, profile.id),
      ),
    })),
  });

export const costsJson = (product: ProductVersion): string =>
  json({
    schemaVersion: 'costs-v1',
    versionId: product.versionId,
    generatedAt: product.generatedAt,
    note: 'Every published cost record, as its source stated it; each record names its own unit. The cost index of the leaderboards uses only positive USD_PER_TASK records of the weighted sources (see methodology).',
    units: {
      USD_PER_TASK: 'US dollars to complete one benchmark task',
      USD_PER_MILLION_TOKENS: 'US dollars per million tokens (API price)',
    },
    costs: product.costs.map((cost) => ({
      modelId: cost.modelId,
      profileId: cost.profileId,
      sourceId: cost.sourceId,
      benchmarkId: cost.benchmarkId,
      benchmarkVersion: cost.benchmarkVersion,
      metricId: cost.metricId,
      metricName: cost.metricName,
      costType: cost.costType,
      unit: cost.unit,
      cost: cost.cost,
      sourceUrl: cost.sourceUrl,
    })),
  });

export const llmsTxt = (
  product: ProductVersion,
  presets: readonly PresetProjection[],
): string =>
  [
    '# FM-DCC — Frontier Model Doh Choo-choo',
    '',
    '> A static leaderboard comparing frontier language models on capability dimensions (agentic, coding, reasoning, knowledge, comprehension) and on task cost, computed from publicly published benchmark results.',
    '',
    ...versionLines(product),
    `- ${SCORE_NOTE}`,
    '- The page at the site root is the interactive dashboard. Its HTML holds the tables of the default preset; the other presets and the controls need JavaScript. The files below hold every preset. A script that drives the page in a browser should wait for `<html data-dashboard="interactive">` before using the controls.',
    '',
    '## Leaderboards',
    '',
    'Two model sets, each with one preset per size (2 to 10 models). Each preset has the ranking, dimension scores, task costs and benchmark list in three formats with the same content: Markdown, JSON (unrounded numbers) and a static HTML page that needs no JavaScript.',
    '',
    `- \`aa-top-N\` (${PRESET_FAMILY_INFO['aa-frontier'].name}): ${PRESET_FAMILY_INFO['aa-frontier'].rule}. Use it for "the best N models".`,
    `- \`coverage-N\` (${PRESET_FAMILY_INFO.coverage.name}): ${PRESET_FAMILY_INFO.coverage.rule}. Use it to compare on the most benchmarks; it can leave out top-ranked models, and each file names the ones it leaves out.`,
    '',
    'Read the Markdown or JSON file when the table structure matters. The Markdown files are served as Markdown and their tables are complete; a tool that converts an HTML page to text can drop the separator row under a table header.',
    '',
    'A preset scores its models on the benchmarks all of them have in common, so each preset has its own benchmark set. The Overall, dimension scores and cost index of a model therefore differ between presets; compare models within one preset.',
    '',
    ...presets.map(
      ({ preset }) =>
        `- ${preset.id}${preset.isDefault ? ' (default view)' : ''}, ${preset.familyName}, ${preset.modelCount} models, ${preset.benchmarkCount} benchmarks: [Markdown](${presetMarkdownPath(preset.id)}), [JSON](${presetJsonPath(preset.id)}), [HTML](${presetPagePath(preset.id)})`,
    ),
    '',
    '## Data',
    '',
    `- [Index](${DATA_INDEX_PATH}): every data file with its schema version, plus the source list and attribution`,
    `- [Profiles](${PROFILES_PATH}): every model profile (one model at one reasoning effort) with the path of its evidence file`,
    `- [Costs](${COSTS_PATH}): every published cost record with its unit (about 0.5 MB)`,
    `- \`evidence/${evidenceVersionPath(product.versionId)}/<profileId>.json\`: every measurement for one model profile (schema \`profile-evidence-v1\`), with raw and normalized score, inclusion status, source URL, locator and retrieval time. Each row of the leaderboard files above links to its evidence file. The directory name changes with the data version.`,
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

interface SourceRow {
  sourceId: string;
  publisherSite: string;
  roles: string[];
  includedMeasurements: number;
  snapshotTakenAt: string | null;
}

/** Sources with at least one included measurement, by ID. */
const sourceRows = (product: ProductVersion): SourceRow[] => {
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
  return [...bySource.entries()]
    .toSorted(([left], [right]) => left.localeCompare(right))
    .map(([sourceId, { included, roles, hosts }]) => ({
      sourceId,
      publisherSite: [...hosts.entries()].toSorted(
        (left, right) => right[1] - left[1] || left[0].localeCompare(right[0]),
      )[0]![0],
      roles: [...roles].toSorted(),
      includedMeasurements: included,
      snapshotTakenAt: snapshots.get(sourceId) ?? null,
    }));
};

const sourcesTable = (product: ProductVersion): string =>
  table(
    [
      'Source ID',
      'Publisher site',
      'Role',
      'Included measurements',
      'Snapshot taken (UTC)',
      'Licence / redistribution terms',
    ],
    sourceRows(product).map((source) => [
      `\`${source.sourceId}\``,
      source.publisherSite,
      source.roles.join(', '),
      String(source.includedMeasurements),
      source.snapshotTakenAt ?? 'unknown',
      'unknown',
    ]),
  );

export const methodologyMarkdown = (
  product: ProductVersion,
  benchmarkDimensions: Record<string, DimensionId>,
): string => {
  const quality = product.benchmarkQuality;
  const scoredIds = [
    ...new Set(product.presets.flatMap(({ benchmarkIds }) => benchmarkIds)),
  ].toSorted();
  const similarlyNamed = (quality?.excludedBenchmarkIds ?? []).flatMap((id) =>
    scoredIds
      .filter((scored) => scored.startsWith(`${id}-`))
      .map((scored) => `\`${id}\` is excluded while \`${scored}\` is scored`),
  );
  const ids = (values: readonly string[]): string =>
    values.length
      ? values
          .toSorted()
          .map((id) => `\`${id}\``)
          .join(', ')
      : 'none';
  const presets = projectPresets(product, benchmarkDimensions);
  const perDimension = UI_DIMENSION_IDS.map(
    (dimension) =>
      [
        dimension,
        Object.values(benchmarkDimensions).filter(
          (value) => value === dimension,
        ).length,
        presets.filter(({ dimensionIds }) => dimensionIds.includes(dimension))
          .length,
      ] as const,
  );
  const unscored = perDimension
    .filter(([, , presetCount]) => presetCount === 0)
    .map(([dimension]) => dimensionHeading(dimension));
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
    'Each benchmark feeds exactly one dimension. A leaderboard shows a dimension only when its preset scores at least one benchmark mapped to it, so a dimension can have mapped benchmarks and still be missing from a leaderboard.',
    '',
    table(
      [
        'Dimension',
        'Abbreviation',
        'Meaning',
        'Benchmarks mapped',
        'Presets that score it',
      ],
      perDimension.map(([dimension, count, presetCount]) => [
        UI_DIMENSION_NAMES[dimension],
        UI_DIMENSION_ABBREVIATIONS[dimension],
        DIMENSION_MEANINGS[dimension],
        String(count),
        `${presetCount} of ${presets.length}`,
      ]),
    ),
    ...(unscored.length
      ? [
          '',
          `Scored in no preset in this data version, so no leaderboard has a column for it: ${unscored.join(', ')}.`,
        ]
      : []),
    '',
    '## Which models are ranked',
    '',
    '- The model set follows the Artificial Analysis Intelligence Index ranking of current frontier models. That index only selects models; it is not part of any score.',
    '- A model qualifies when it is ranked there and has results from at least two independent organisations.',
    '- The frontier window is the first ten qualifying models in that ranking.',
    '- Each model is represented by one reasoning-effort profile: among its qualifying efforts, the one holding the most scoring-eligible benchmarks (ties: more independent organisations, then the higher AA score, then the profile ID). The choice is recomputed with every data version, so it follows the effort the sources measured most.',
    `- Two model sets, one preset per size N = 2 to 10. \`aa-top-N\` (${PRESET_FAMILY_INFO['aa-frontier'].name}) takes ${PRESET_FAMILY_INFO['aa-frontier'].rule.replace('the top N models', 'the top N')}. \`coverage-N\` (${PRESET_FAMILY_INFO.coverage.name}) takes ${PRESET_FAMILY_INFO.coverage.rule}; it can leave out top-ranked models. With all ten models the two sets coincide.`,
    `- The default preset is \`${product.defaultPresetId}\`.`,
    '- A model can have several profiles, one per reasoning effort. Results from different efforts are never merged. Each preset scores one row per base model: its representative profile. On the dashboard a reader can switch a row to another effort, and the scores are recomputed for that selection.',
    '',
    '## Which benchmarks are scored',
    '',
    '- A preset scores only the benchmarks that every model in it has a valid result for, so all rows are compared on the same tests.',
    '- A result counts when it is included, finite, and normalized to 0–100. External composite indices are not scored.',
    `- Excluded from scoring by the quality policy (reviewed ${quality?.reviewedAt ?? 'unknown'}): ${ids(quality?.excludedBenchmarkIds ?? [])}.${
      quality?.evidencePath
        ? ` The [review record](${REPOSITORY_URL}/blob/main/${quality.evidencePath}) gives the reason for each exclusion, including the benchmark that supersedes it where there is one.`
        : ''
    }`,
    `- Benchmark IDs are exact. A benchmark with a similar name is a separate benchmark and the list above does not cover it${similarlyNamed.length ? `: ${similarlyNamed.join('; ')}` : ''}.`,
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
    '- Within each source, the natural log of the task cost is min-max scaled to 0–100 (0 = cheapest, 100 = most expensive). The scale spans the costs that source published for the profiles in the preset being viewed: every reasoning effort that qualifies for the table, not only the one shown. The same model therefore has a different index in different presets.',
    `- The index is the equally weighted mean over the cost groups a model has, out of ${weightEntries.length}: ${weightEntries.map(sourceName).join(', ')}. Missing groups are skipped and the weights renormalised.`,
    `- Economy (${ECONOMY_ABBREVIATION}) in the leaderboard tables and on the radar chart of the dashboard is 100 minus the cost index, so higher is cheaper like every other column. It is not a capability dimension, no benchmark feeds it and it does not enter Overall.`,
    '- On the dashboard, changing the reasoning effort of a row or the set of models rescales the index over the profiles then shown, each from its own task costs.',
    '- The value frontier is the Pareto set: scanning from cheapest to most expensive, a model is on it when its Overall is strictly higher than that of every model with the same or a lower cost index.',
    '- The index is a comparison aid, not a dollar estimate.',
    '',
    '## Sources and attribution',
    '',
    'All benchmark results and costs are the work of their publishers and are reproduced here as individual facts with a link to where each was published. This project has not established the licence or redistribution terms of any source, so the column below reads "unknown" and no open-data licence is claimed over the results. Consult each publisher before reusing its data.',
    '',
    sourcesTable(product),
    '',
    'Sources are captured independently, so the snapshot times differ; each is when that source was last captured, and the scores it contributes are as of that time.',
    '',
    'A source URL is the exact page the data was captured from, including its language edition. Some vendor release pages were captured from a localized edition, so their URLs carry a locale path such as `/zh-Hant/`.',
    '',
    `Machine-readable files are listed in [llms.txt](${LLMS_TXT_PATH}) and [data/index.json](${DATA_INDEX_PATH}).`,
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
