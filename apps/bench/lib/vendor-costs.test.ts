import { describe, expect, it } from 'vitest';
import {
  buildAdvancedCostSeries,
  type AdvancedCostSourceId,
} from './view-model';
import { productFixture } from '../test/fixture';

const profile = productFixture.profiles[0]!;
const templateEvidence = productFixture.evidence[0]!;
const templateCost = productFixture.costs.find(
  ({ costType }) => costType === 'MEASURED_TASK',
)!;
const publisher = 'openai-releases';
const sourceUrl = 'https://openai.com/zh-Hant/index/introducing-gpt-6-1-sol/';
const definitions = [
  ['deepswe', 'deepswe-1-1', '1.1'],
  ['zapier-automationbench', 'automationbench', '1.0.6'],
  ['cursorbench', 'cursorbench-4', '4.0'],
  ['frontier-code', 'frontier-code-1-1', '1.1'],
] as const;

function fixture(
  benchmarkId: string,
  version: string,
  sourceId = publisher,
  score = 75,
  cost = 0.65,
) {
  const evidence = {
    ...templateEvidence,
    id: `vendor-score:${benchmarkId}:${sourceId}`,
    sourceId,
    sourceRole: 'VENDOR' as const,
    benchmarkId,
    benchmarkVersion: version,
    model: {
      ...templateEvidence.model,
      canonicalModelId: profile.modelId,
      profileId: profile.id,
    },
    profile: { ...templateEvidence.profile, effort: profile.attributes.effort },
    inclusion: 'INCLUDED' as const,
    rawScore: score,
    normalizedScore: score,
    sourceUrl,
  };
  const taskCost = {
    ...templateCost,
    sourceId,
    profileId: profile.id,
    modelId: profile.modelId,
    cost,
    costType: 'AGENT_TASK' as const,
    unit: 'USD_PER_TASK' as const,
    benchmarkId,
    benchmarkVersion: version,
    sourceUrl,
    evidenceIds: ['sha256:' + 'a'.repeat(64)],
  };
  return {
    ...productFixture,
    profiles: [profile],
    evidence: [evidence],
    costs: [taskCost],
  };
}

const pointFor = (
  product: ReturnType<typeof fixture>,
  channel: AdvancedCostSourceId,
) => buildAdvancedCostSeries(product, [channel])[0]?.points[0];

describe('vendor benchmark quality and cost pairing', () => {
  it.each(definitions)(
    'shows a vendor pair under %s with original publisher provenance',
    (channel, benchmarkId, version) => {
      const product = fixture(benchmarkId, version);
      const point = pointFor(product, channel);
      expect(point).toMatchObject({ profileId: profile.id, score: 75 });
      expect(point?.sources).toEqual([
        expect.objectContaining({
          sourceId: channel,
          reportedSourceId: publisher,
          sourceUrl,
          benchmarkId,
          scoreBenchmarkVersion: version,
          cost: 0.65,
          evidenceIds: ['sha256:' + 'a'.repeat(64)],
        }),
      ]);
    },
  );

  it.each(definitions)(
    'prefers the organizer pair over a vendor duplicate in %s without averaging costs',
    (channel, benchmarkId, version) => {
      const product = fixture(benchmarkId, version);
      const organizer = fixture(benchmarkId, version, channel, 74, 2);
      product.costs.push(...organizer.costs);
      product.evidence.push(...organizer.evidence);
      const point = pointFor(product, channel);
      expect(point).toMatchObject({ score: 74 });
      expect(point?.sources[0]).toMatchObject({ sourceId: channel, cost: 2 });
      expect(point?.sources[0]?.reportedSourceId).toBeUndefined();
    },
  );

  it.each(['missing', 'excluded', 'version', 'publisher', 'profile'] as const)(
    'omits a vendor cost with %s score evidence',
    (kind) => {
      const product = fixture('deepswe-1-1', '1.1');
      const evidence = product.evidence[0]!;
      if (kind === 'missing') product.evidence = [];
      if (kind === 'excluded')
        Object.assign(evidence, {
          inclusion: 'EXCLUDED',
          exclusionReason: 'Reviewed conflict',
        });
      if (kind === 'version') evidence.benchmarkVersion = '1.2';
      if (kind === 'publisher') evidence.sourceId = 'deepswe';
      if (kind === 'profile') evidence.model.profileId = 'different-high';
      expect(buildAdvancedCostSeries(product, ['deepswe'])).toEqual([]);
    },
  );

  it('omits a vendor cost with a different chart version', () => {
    const product = fixture('deepswe-1-1', '1.1');
    product.costs[0]!.benchmarkVersion = '1.2';
    expect(buildAdvancedCostSeries(product, ['deepswe'])).toEqual([]);
  });
});
