import { COST_SOURCE_WEIGHTS, type CostSourceScoreBasisId } from './view-model';

export const SOURCE_NAMES: Record<string, string> = {
  'artificial-analysis': 'Artificial Analysis',
  livebench: 'LiveBench',
  deepswe: 'DeepSWE',
  'frontier-code': 'Frontier Code',
  'arc-prize': 'ARC Prize',
  'vals-ai': 'Vals AI',
  'zapier-automationbench': 'Zapier',
  cursorbench: 'CursorBench',
  'agents-last-exam': "Agents' Last Exam",
  'openai-releases': 'OpenAI (vendor)',
  'anthropic-releases': 'Anthropic (vendor)',
  'xai-releases': 'xAI (vendor)',
  'google-releases': 'Google (vendor)',
};

/**
 * What each source's contributed score actually is. A cost source without a
 * basis says so out loud: it contributed cost and nothing else.
 */
const SCORE_BASIS_NAMES: Record<CostSourceScoreBasisId, string> = {
  AA_INTELLIGENCE_INDEX: 'Intelligence Index',
  DEEPSWE_1_1: 'DeepSWE 1.1',
  FRONTIER_CODE_2_0: 'Frontier Code 2.0',
  ARC_AGI: 'ARC-AGI-2',
  VALS_INDEX: 'Vals Index',
  ZAPIER_AUTOMATIONBENCH: 'AutomationBench',
  CURSORBENCH_4: 'CursorBench 4.0',
  AGENTS_LAST_EXAM: "Agents' Last Exam",
  NONE: 'cost only, no pairable score',
};

/** Names the basis once: "Frontier Code 2.0" plus version "2.0" reads as one. */
const scoreBasisLabel = (
  basis: CostSourceScoreBasisId,
  version?: string | null,
): string => {
  const name = SCORE_BASIS_NAMES[basis];
  if (!version || name.endsWith(version)) return name;
  return version.startsWith(name) ? version : `${name} ${version}`;
};

export const scoreBasisNote = (
  basis: CostSourceScoreBasisId,
  score: number | null,
  version?: string | null,
): string =>
  basis === 'NONE' || score === null
    ? SCORE_BASIS_NAMES.NONE
    : `${scoreBasisLabel(basis, version)} ${score.toFixed(1)}`;

/** How to read the cost index; shown wherever the index is published. */
export const COST_NOTE =
  'The cost index blends task costs across sources. Within each source, the natural log of the USD task cost is min-max scaled to 0–100 over the costs that source published for the profiles in this preset (every reasoning effort that qualifies for the table, not only the one shown), so the index of a model differs between presets. The sources a model has are then averaged with equal weight. It is a relative position, not a dollar estimate; the per-source USD figures are the published costs. A source named with a vendor, such as "DeepSWE · OpenAI (vendor)", is a score and cost for that benchmark that the named vendor published on its release page; it is used only when the benchmark organizer has no matching score and cost pair for the profile. A model is on the value frontier when its Overall is strictly higher than that of every model with the same or a lower cost index.';

/** Sources carrying a weight, i.e. the largest source count a point can have. */
export const WEIGHTED_SOURCE_COUNT = Object.keys(COST_SOURCE_WEIGHTS).length;

export const sourceName = (sourceId: string): string =>
  SOURCE_NAMES[sourceId] ?? sourceId;

export const costSourceName = (source: {
  sourceId: string;
  reportedSourceId?: string;
}): string =>
  `${sourceName(source.sourceId)}${source.reportedSourceId ? ` · ${sourceName(source.reportedSourceId)}` : ''}`;
