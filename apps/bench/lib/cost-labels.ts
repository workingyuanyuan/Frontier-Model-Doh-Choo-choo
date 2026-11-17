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

/** Sources carrying a weight, i.e. the largest source count a point can have. */
export const WEIGHTED_SOURCE_COUNT = Object.keys(COST_SOURCE_WEIGHTS).length;

export const sourceName = (sourceId: string): string =>
  SOURCE_NAMES[sourceId] ?? sourceId;

export const costSourceName = (source: {
  sourceId: string;
  reportedSourceId?: string;
}): string =>
  `${sourceName(source.sourceId)}${source.reportedSourceId ? ` · ${sourceName(source.reportedSourceId)}` : ''}`;
