import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import {
  ProductVersionSchema,
  type ProductEvidence,
  type ProductVersion,
} from '@llm-bench/benchmark-data';

const SOURCE_SPECS = {
  'artificial-analysis': {
    benchmarkId: 'artificial-analysis-intelligence-index',
    useRawScore: true,
  },
  deepswe: { benchmarkId: 'deepswe-1-1', useRawScore: false },
  'frontier-code': {
    benchmarkId: 'frontier-code-1-1',
    useRawScore: false,
  },
  'arc-prize': { benchmarkId: 'arc-agi-2', useRawScore: false },
  'vals-ai': { benchmarkId: 'vals-index', useRawScore: true },
} as const;

type SourceId = keyof typeof SOURCE_SPECS;

const COMBINATIONS: ReadonlyArray<{
  label: string;
  sources: readonly SourceId[];
}> = [
  {
    label: '3 sources (current)',
    sources: ['artificial-analysis', 'deepswe', 'frontier-code'],
  },
  {
    label: '4 sources (+ ARC Prize)',
    sources: ['artificial-analysis', 'deepswe', 'frontier-code', 'arc-prize'],
  },
  {
    label: '5 sources (+ ARC Prize + Vals diagnostic)',
    sources: [
      'artificial-analysis',
      'deepswe',
      'frontier-code',
      'arc-prize',
      'vals-ai',
    ],
  },
];

const isTaskCost = (cost: ProductVersion['costs'][number]): boolean =>
  ['MEASURED_TASK', 'AGENT_TASK'].includes(cost.costType) &&
  cost.unit === 'USD_PER_TASK' &&
  cost.cost > 0;

const median = (values: number[]): number => {
  const sorted = values.toSorted((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[middle - 1]! + sorted[middle]!) / 2
    : sorted[middle]!;
};

const sourceScore = (
  evidence: ProductEvidence[],
  sourceId: SourceId,
  profileId: string,
): number | null => {
  const spec = SOURCE_SPECS[sourceId];
  const row = evidence
    .filter(
      (candidate) =>
        candidate.sourceId === sourceId &&
        candidate.benchmarkId === spec.benchmarkId &&
        candidate.model.profileId === profileId,
    )
    .toSorted((left, right) => left.id.localeCompare(right.id))[0];
  if (!row) return null;
  if (spec.useRawScore) return row.rawScore;
  return row.inclusion === 'INCLUDED' ? row.normalizedScore : null;
};

const round = (value: number): number => Number(value.toFixed(2));

const main = async (): Promise<void> => {
  const root = resolve(process.argv[2] ?? process.cwd());
  const product = ProductVersionSchema.parse(
    JSON.parse(
      await readFile(resolve(root, 'data-v2/product/current.json'), 'utf8'),
    ),
  );
  const ranges = new Map<SourceId, { min: number; max: number }>();
  for (const sourceId of Object.keys(SOURCE_SPECS) as SourceId[]) {
    const logs = product.costs
      .filter((cost) => cost.sourceId === sourceId && isTaskCost(cost))
      .map(({ cost }) => Math.log(cost));
    if (logs.length > 0) {
      ranges.set(sourceId, { min: Math.min(...logs), max: Math.max(...logs) });
    }
  }

  const results = COMBINATIONS.map(({ label, sources }) => {
    const points: Array<{
      modelId: string;
      profileId: string;
      effort: string;
      costIndex: number;
      score: number;
      sourceScores: Partial<Record<SourceId, number>>;
    }> = [];
    for (const profile of product.profiles) {
      const normalizedCosts: number[] = [];
      const sourceScores: Partial<Record<SourceId, number>> = {};
      let complete = true;
      for (const sourceId of sources) {
        const score = sourceScore(product.evidence, sourceId, profile.id);
        const sourceCosts = product.costs
          .filter(
            (cost) =>
              cost.sourceId === sourceId &&
              cost.profileId === profile.id &&
              cost.modelId === profile.modelId &&
              isTaskCost(cost),
          )
          .map(({ cost }) => cost);
        const range = ranges.get(sourceId);
        if (score === null || sourceCosts.length === 0 || !range) {
          complete = false;
          break;
        }
        sourceScores[sourceId] = score;
        const cost = median(sourceCosts);
        normalizedCosts.push(
          range.min === range.max
            ? 50
            : ((Math.log(cost) - range.min) / (range.max - range.min)) * 100,
        );
      }
      if (!complete || normalizedCosts.length !== sources.length) continue;
      points.push({
        modelId: profile.modelId,
        profileId: profile.id,
        effort: profile.attributes.effort ?? 'default',
        costIndex:
          normalizedCosts.reduce((sum, value) => sum + value, 0) /
          normalizedCosts.length,
        score:
          Object.values(sourceScores).reduce((sum, value) => sum + value, 0) /
          sources.length,
        sourceScores,
      });
    }
    const byModel = new Map<string, typeof points>();
    for (const point of points) {
      const modelPoints = byModel.get(point.modelId) ?? [];
      modelPoints.push(point);
      byModel.set(point.modelId, modelPoints);
    }
    const costs = points.map(({ costIndex }) => costIndex);
    const scores = points.map(({ score }) => score);
    const standardDeviation = (values: number[]): number => {
      const mean =
        values.reduce((sum, value) => sum + value, 0) / values.length;
      return Math.sqrt(
        values.reduce((sum, value) => sum + (value - mean) ** 2, 0) /
          values.length,
      );
    };
    return {
      label,
      sources,
      qualifyingProfiles: points.length,
      qualifyingModels: byModel.size,
      connectableModels: [...byModel.values()].filter(
        (modelPoints) => modelPoints.length >= 2,
      ).length,
      xRange:
        costs.length === 0
          ? null
          : { min: round(Math.min(...costs)), max: round(Math.max(...costs)) },
      yRange:
        scores.length === 0
          ? null
          : {
              min: round(Math.min(...scores)),
              max: round(Math.max(...scores)),
            },
      sourceStandardDeviations: Object.fromEntries(
        sources.map((sourceId) => [
          sourceId,
          round(
            standardDeviation(
              points.map(({ sourceScores }) => sourceScores[sourceId]!),
            ),
          ),
        ]),
      ),
      models: [...byModel.entries()]
        .map(([modelId, modelPoints]) => ({
          modelId,
          profiles: modelPoints.length,
          efforts: modelPoints
            .map(({ effort }) => effort)
            .toSorted((left, right) => left.localeCompare(right)),
        }))
        .toSorted((left, right) => left.modelId.localeCompare(right.modelId)),
    };
  });

  process.stdout.write(`${JSON.stringify(results, null, 2)}\n`);
};

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
