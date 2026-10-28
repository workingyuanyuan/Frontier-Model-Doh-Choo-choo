import { describe, expect, it } from 'vitest';

import {
  assertFrontierCode11Unchanged,
  FRONTIER_CODE_1_1_COST_SUPERSEDED_REASON,
  FRONTIER_CODE_2_0_DATA_URL,
  FRONTIER_CODE_DATA_URL,
  FRONTIER_CODE_PAGE_URL,
  extractFrontierCodeTopTen,
  materializeFrontierCode11,
  materializeFrontierCode20,
  rebuildFrontierCodeFromEvidence,
  type MaterializeFrontierCode20Context,
} from './frontier-code-materializer.js';

const evidenceId = `sha256:${'a'.repeat(64)}`;
const pageEvidenceId = `sha256:${'b'.repeat(64)}`;
const v20EvidenceId = `sha256:${'c'.repeat(64)}`;
const oldEvidenceId = `sha256:${'d'.repeat(64)}`;

const htmlFor = (
  rows: ReadonlyArray<readonly [string, number]>,
  listName = 'FrontierCode 2.0 Leaderboard',
): string => `
<script type="application/ld+json">
${JSON.stringify({
  '@type': 'Dataset',
  '@graph': [
    {
      '@type': 'ItemList',
      name: listName,
      itemListElement: rows.map(([name, score], index) => ({
        position: index + 1,
        name,
        description: `Score ${score.toFixed(1)}%`,
      })),
    },
  ],
})}
</script>`;

const names = [
  'Claude Opus 5',
  'Claude Fable 5',
  'GPT-5.6 Sol',
  'Claude Opus 4.8',
  'GPT-5.5',
  'Grok 4.5',
  'Claude Sonnet 5',
  'GPT-5.6 Terra',
  'GPT-5.6 Luna',
  'Kimi K3',
];

const version = (models: readonly string[]) => ({
  models,
  harness: Object.fromEntries(models.map((name) => [name, 'test-harness'])),
  efforts: Object.fromEntries(
    models.map((name, index) => [name, index === 9 ? ['none'] : ['high']]),
  ),
  data: Object.fromEntries(
    models.map((name, index) => [
      name,
      {
        [index === 9 ? 'none' : 'high']: {
          main: {
            new_score: (100 - index) / 100,
            correct: 0.5,
            cost: index === 8 ? null : index + 0.5,
          },
          extended: { new_score: 0.99, cost: 99 },
        },
      },
    ]),
  ),
});

const v11Payload = JSON.stringify({ v1: {}, v1_1: version(names) });
const v20Payload = JSON.stringify(version(names));
const topTenHtml = htmlFor(names.map((name, index) => [name, 100 - index]));
const observedAt = '2026-10-28T00:00:00.000Z';
const noPrevious = { candidates: [], costs: [] };

const v20Context = (
  overrides: Partial<MaterializeFrontierCode20Context> = {},
): MaterializeFrontierCode20Context => ({
  dataEvidenceId: v20EvidenceId,
  pageEvidenceId,
  observedAt,
  visualBestRowCount: 10,
  visualAllRowCount: 10,
  visualTopTenMatched: true,
  hiddenModels: [],
  ...overrides,
});

describe('Frontier Code materializer', () => {
  it('extracts the named 2.0 JSON-LD ItemList and rejects the 1.1 name', () => {
    expect(extractFrontierCodeTopTen(topTenHtml)).toEqual(
      names.map((name, index) => ({
        position: index + 1,
        name,
        score: 100 - index,
      })),
    );
    expect(() =>
      extractFrontierCodeTopTen(
        htmlFor(
          names.map((name, index) => [name, 100 - index]),
          'FrontierCode 1.1 Leaderboard (Main)',
        ),
      ),
    ).toThrow('FrontierCode 2.0 Leaderboard');
  });

  it('keeps 1.1 rows, IDs and costs under frontier-code-1-1, costs EXCLUDED', () => {
    const result = materializeFrontierCode11(
      v11Payload,
      { dataEvidenceId: evidenceId, observedAt },
      noPrevious,
    );

    expect(result.candidates).toHaveLength(10);
    expect(result.costs).toHaveLength(9);
    expect(
      result.candidates.every(
        ({ benchmarkId, benchmarkVersion, id }) =>
          benchmarkId === 'frontier-code-1-1' &&
          benchmarkVersion === '1.1' &&
          id.startsWith('frontier-code:frontier-code-1-1:'),
      ),
    ).toBe(true);
    expect(
      result.costs.every(
        ({ benchmarkId, id, inclusion, exclusionReason }) =>
          benchmarkId === 'frontier-code-1-1' &&
          id.startsWith('frontier-code:mean-rollout-cost:') &&
          inclusion === 'EXCLUDED' &&
          exclusionReason === FRONTIER_CODE_1_1_COST_SUPERSEDED_REASON,
      ),
    ).toBe(true);
    // Superseded costs stay as evidence with their original ID and value.
    expect(
      result.costs.find(({ model }) => model.rawName === 'Claude Opus 5'),
    ).toMatchObject({
      id: 'frontier-code:mean-rollout-cost:claude-opus-5-high',
      cost: 0.5,
      costType: 'AGENT_TASK',
      unit: 'USD_PER_TASK',
    });
    expect(
      result.candidates.find(({ model }) => model.rawName === 'Kimi K3'),
    ).toMatchObject({
      id: 'frontier-code:frontier-code-1-1:kimi-k3-none',
      model: { canonicalModelId: 'moonshot-kimi-k3', profileId: null },
      profile: { effort: null },
      rawScore: 0.91,
      normalizedScore: 91,
      evidenceIds: [evidenceId],
    });
    expect(
      result.candidates.find(({ model }) => model.rawName === 'Claude Opus 5')
        ?.provenance.rawScore?.locator,
    ).toBe('$.v1_1.data["Claude Opus 5"]["high"].main.new_score');
    // frontierswe belongs to Proximal FrontierSWE (SPEC.md 4.2).
    expect(result.candidates.some(({ id }) => id.includes('frontierswe'))).toBe(
      false,
    );
  });

  it('preserves 1.1 rows and costs the export removed, with their evidence', () => {
    const previous = materializeFrontierCode11(
      v11Payload,
      { dataEvidenceId: oldEvidenceId, observedAt: '2026-10-27T00:00:00.000Z' },
      noPrevious,
    );
    // Upstream drops GPT-5.6 Terra from the export (as on 2026-10-28).
    const full = JSON.parse(v11Payload) as {
      v1_1: ReturnType<typeof version>;
    };
    const removed = 'GPT-5.6 Terra';
    const trimmed = {
      v1_1: {
        ...full.v1_1,
        models: full.v1_1.models.filter((name) => name !== removed),
      },
    };

    const result = materializeFrontierCode11(
      JSON.stringify(trimmed),
      { dataEvidenceId: evidenceId, observedAt },
      { candidates: previous.candidates, costs: previous.costs },
    );

    expect(result.exportModelCount).toBe(9);
    expect(result.modelCount).toBe(10);
    expect(result.candidates).toHaveLength(10);
    expect(result.costs).toHaveLength(9);
    expect(result.preservedModels).toEqual([removed]);
    expect(result.preservedCandidateIds).toEqual([
      'frontier-code:frontier-code-1-1:gpt-5-6-terra-high',
    ]);
    expect(result.preservedCostIds).toEqual([
      'frontier-code:mean-rollout-cost:gpt-5-6-terra-high',
    ]);
    expect(result.preservedEvidenceIds).toEqual([oldEvidenceId]);
    expect(result.valueChanges).toEqual([]);
    expect(result.addedCandidateIds).toEqual([]);
    const terra = result.candidates.find(
      ({ model }) => model.rawName === removed,
    );
    // Carried forward unchanged, still citing the export it came from.
    expect(terra).toEqual(
      previous.candidates.find(({ model }) => model.rawName === removed),
    );
    expect(terra?.evidenceIds).toEqual([oldEvidenceId]);
  });

  it('excludes 1.1 costs preserved from an INCLUDED snapshot and still gates their values', () => {
    const fresh = materializeFrontierCode11(
      v11Payload,
      { dataEvidenceId: oldEvidenceId, observedAt },
      noPrevious,
    );
    // Snapshots written before 2026-10-28 carry the 1.1 costs as INCLUDED.
    const legacyCosts = fresh.costs.map((cost) => ({
      ...cost,
      inclusion: 'INCLUDED' as const,
      exclusionReason: null,
    }));
    const removed = 'GPT-5.6 Terra';
    const full = JSON.parse(v11Payload) as {
      v1_1: ReturnType<typeof version>;
    };
    const trimmed = {
      v1_1: {
        ...full.v1_1,
        models: full.v1_1.models.filter((name) => name !== removed),
      },
    };
    const result = materializeFrontierCode11(
      JSON.stringify(trimmed),
      { dataEvidenceId: evidenceId, observedAt },
      { candidates: fresh.candidates, costs: legacyCosts },
    );
    expect(result.valueChanges).toEqual([]);
    expect(result.preservedCostIds).toEqual([
      'frontier-code:mean-rollout-cost:gpt-5-6-terra-high',
    ]);
    expect(
      result.costs.every(({ inclusion }) => inclusion === 'EXCLUDED'),
    ).toBe(true);

    const changed = JSON.parse(v11Payload) as {
      v1_1: {
        data: Record<string, Record<string, { main: { cost: number } }>>;
      };
    };
    changed.v1_1.data['Claude Opus 5']!.high!.main.cost = 9;
    const gated = materializeFrontierCode11(
      JSON.stringify(changed),
      { dataEvidenceId: evidenceId, observedAt },
      { candidates: fresh.candidates, costs: legacyCosts },
    );
    expect(gated.valueChanges).toEqual([
      'frontier-code:mean-rollout-cost:claude-opus-5-high cost 0.5 -> 9',
    ]);
    expect(() => assertFrontierCode11Unchanged(gated, null)).toThrow(
      /cost 0.5 -> 9/u,
    );
  });

  it('reports 1.1 score changes against the previous snapshot', () => {
    const previous = materializeFrontierCode11(
      v11Payload,
      { dataEvidenceId: oldEvidenceId, observedAt },
      noPrevious,
    );
    const changed = JSON.parse(v11Payload) as {
      v1_1: {
        data: Record<string, Record<string, { main: { new_score: number } }>>;
      };
    };
    changed.v1_1.data['Claude Opus 5']!.high!.main.new_score = 0.5;
    const result = materializeFrontierCode11(
      JSON.stringify(changed),
      { dataEvidenceId: evidenceId, observedAt },
      previous,
    );
    expect(result.valueChanges).toEqual([
      'frontier-code:frontier-code-1-1:claude-opus-5-high score 1 -> 0.5',
    ]);
    expect(result.preservedCandidateIds).toEqual([]);
  });

  it('parses 2.0 as frontier-code-2-0 with INCLUDED per-rollout costs', () => {
    const result = materializeFrontierCode20(
      v20Payload,
      topTenHtml,
      v20Context(),
    );

    expect(result.candidates).toHaveLength(10);
    expect(result.configurationsWithCost).toBe(9);
    // GPT-5.6 Luna has a null cost: omitted, never zero.
    expect(result.costs).toHaveLength(9);
    expect(
      result.costs.some(({ model }) => model.rawName === 'GPT-5.6 Luna'),
    ).toBe(false);
    expect(
      result.costs.every(
        ({ benchmarkId, benchmarkVersion, id, inclusion, evidenceIds }) =>
          benchmarkId === 'frontier-code-2-0' &&
          benchmarkVersion === '2.0' &&
          id.startsWith('frontier-code:frontier-code-2-0:mean-rollout-cost:') &&
          inclusion === 'INCLUDED' &&
          evidenceIds.join() === v20EvidenceId,
      ),
    ).toBe(true);
    expect(
      result.costs.find(({ model }) => model.rawName === 'Claude Opus 5'),
    ).toMatchObject({
      id: 'frontier-code:frontier-code-2-0:mean-rollout-cost:claude-opus-5-high',
      sourceId: 'frontier-code',
      costType: 'AGENT_TASK',
      unit: 'USD_PER_TASK',
      metricId: 'mean-rollout-cost',
      metricName: 'Mean FrontierCode 2.0 rollout cost',
      cost: 0.5,
      exclusionReason: null,
      model: { profileId: 'anthropic-claude-opus-5-high' },
      provenance: {
        cost: { locator: '$.data["Claude Opus 5"]["high"].main.cost' },
      },
    });
    expect(result.topTenMatches).toBe(10);
    expect(
      result.candidates.every(
        ({ benchmarkId, benchmarkVersion, id, evidenceIds }) =>
          benchmarkId === 'frontier-code-2-0' &&
          benchmarkVersion === '2.0' &&
          id.startsWith('frontier-code:frontier-code-2-0:') &&
          evidenceIds.join() === [v20EvidenceId, pageEvidenceId].join(),
      ),
    ).toBe(true);
    expect(
      result.candidates.find(({ model }) => model.rawName === 'Claude Opus 5'),
    ).toMatchObject({
      model: {
        canonicalModelId: 'anthropic-claude-opus-5',
        profileId: 'anthropic-claude-opus-5-high',
      },
      profile: { effort: 'high', harness: 'test-harness', attempts: null },
      provenance: {
        rawScore: { locator: '$.data["Claude Opus 5"]["high"].main.new_score' },
      },
    });
  });

  it('treats an effort outside the policy tiers as unlabelled', () => {
    // FrontierCode keys some configurations by a sampling parameter ("0.99")
    // or "na", which must not become a product profile.
    const payload = JSON.parse(v20Payload) as {
      efforts: Record<string, string[]>;
      data: Record<string, Record<string, unknown>>;
    };
    const subject = names[0]!;
    payload.efforts[subject] = ['0.99', 'na'];
    payload.data[subject] = {
      '0.99': { main: { new_score: 1, cost: 1.5 } },
      na: { main: { new_score: 0.14, cost: 1.5 } },
    };
    const result = materializeFrontierCode20(
      JSON.stringify(payload),
      topTenHtml,
      v20Context({ visualAllRowCount: 11 }),
    );
    const rows = result.candidates.filter(
      ({ model }) => model.rawName === subject,
    );
    expect(rows).toHaveLength(2);
    expect(rows.every(({ profile }) => profile.effort === null)).toBe(true);
    expect(rows.every(({ model }) => model.profileId === null)).toBe(true);
    expect(JSON.stringify(rows.map(({ provenance }) => provenance))).toContain(
      '0.99',
    );
  });

  it('drops page-hidden 2.0 models and counts only visible rows', () => {
    const payload = JSON.parse(v20Payload) as {
      models: string[];
      efforts: Record<string, string[]>;
      data: Record<string, unknown>;
    };
    const hidden = 'Obsidian 3';
    payload.models = [...payload.models, hidden];
    payload.efforts[hidden] = ['low', 'high'];
    payload.data[hidden] = {
      low: { main: { new_score: 0.2, correct: 0.2, cost: 1.25 } },
      high: { main: { new_score: 0.3, correct: 0.3, cost: 2.5 } },
    };
    const result = materializeFrontierCode20(
      JSON.stringify(payload),
      topTenHtml,
      v20Context({ hiddenModels: [hidden] }),
    );
    expect(result.hiddenModels).toEqual([hidden]);
    expect(result.modelCount).toBe(10);
    expect(
      result.candidates.some(({ model }) => model.rawName === hidden),
    ).toBe(false);
    expect(result.costs.some(({ model }) => model.rawName === hidden)).toBe(
      false,
    );
    expect(result.configurationsWithCost).toBe(9);

    // Without declaring it hidden, the export no longer matches the page.
    expect(() =>
      materializeFrontierCode20(
        JSON.stringify(payload),
        topTenHtml,
        v20Context(),
      ),
    ).toThrow('rendered count mismatch');
    expect(() =>
      materializeFrontierCode20(
        v20Payload,
        topTenHtml,
        v20Context({ hiddenModels: ['Not In Export'] }),
      ),
    ).toThrow('hidden models are not in the export');
  });

  it('fails when the rendered 2.0 row counts differ from the export', () => {
    expect(() =>
      materializeFrontierCode20(
        v20Payload,
        topTenHtml,
        v20Context({ visualBestRowCount: 9 }),
      ),
    ).toThrow(/rendered Best reasoning mode rows 9, export has 10/u);
    expect(() =>
      materializeFrontierCode20(
        v20Payload,
        topTenHtml,
        v20Context({ visualAllRowCount: 98 }),
      ),
    ).toThrow(/rendered All reasoning levels rows 98, export has 10/u);
  });

  it('reports a structured-export versus JSON-LD mismatch', () => {
    const mismatched = names.map((name, index) => [name, 100 - index] as const);
    mismatched[0] = [names[0]!, 12.3];
    const result = materializeFrontierCode20(
      v20Payload,
      htmlFor(mismatched),
      v20Context({ visualTopTenMatched: false }),
    );
    expect(result.topTenMatches).toBe(9);
    expect(result.topTenMismatches[0]).toContain('rank 1');
  });

  it('rebuilds both benchmarks offline from the latest evidence', () => {
    const artifacts: Record<string, string> = {
      'old.json': v11Payload,
      'v11.json': JSON.stringify({
        v1_1: {
          ...version(names),
          models: names.filter((name) => name !== 'GPT-5.6 Terra'),
        },
      }),
      'v20.json': v20Payload,
      'page.html': topTenHtml,
    };
    const previous = materializeFrontierCode11(
      v11Payload,
      { dataEvidenceId: oldEvidenceId, observedAt: '2026-10-27T00:00:00.000Z' },
      noPrevious,
    );
    const result = rebuildFrontierCodeFromEvidence(
      [
        {
          id: oldEvidenceId,
          requestUrl: FRONTIER_CODE_DATA_URL,
          retrievedAt: '2026-10-27T00:00:00.000Z',
          artifactPath: 'old.json',
        },
        {
          id: evidenceId,
          requestUrl: FRONTIER_CODE_DATA_URL,
          retrievedAt: observedAt,
          artifactPath: 'v11.json',
        },
        {
          id: v20EvidenceId,
          requestUrl: FRONTIER_CODE_2_0_DATA_URL,
          retrievedAt: observedAt,
          artifactPath: 'v20.json',
          metadata: { hiddenModels: [] },
        },
        {
          id: pageEvidenceId,
          requestUrl: FRONTIER_CODE_PAGE_URL,
          retrievedAt: observedAt,
          artifactPath: 'page.html',
          metadata: {
            renderedRows: 10,
            renderedAllRows: 10,
            renderedTopTenMatched: true,
          },
        },
      ],
      (path) => artifacts[path]!,
      previous,
    );
    expect(
      result.candidates.filter(
        ({ benchmarkId }) => benchmarkId === 'frontier-code-1-1',
      ),
    ).toHaveLength(10);
    expect(
      result.candidates.filter(
        ({ benchmarkId }) => benchmarkId === 'frontier-code-2-0',
      ),
    ).toHaveLength(10);
    // 1.1 costs (including the preserved Terra row) stay EXCLUDED; only 2.0
    // costs are INCLUDED, so no profile ever has both versions included.
    const v11Costs = result.costs.filter(
      ({ benchmarkId }) => benchmarkId === 'frontier-code-1-1',
    );
    const v20Costs = result.costs.filter(
      ({ benchmarkId }) => benchmarkId === 'frontier-code-2-0',
    );
    expect(v11Costs).toHaveLength(9);
    expect(v20Costs).toHaveLength(9);
    expect(result.costs).toHaveLength(18);
    expect(new Set(result.costs.map(({ id }) => id)).size).toBe(18);
    expect(v11Costs.every(({ inclusion }) => inclusion === 'EXCLUDED')).toBe(
      true,
    );
    expect(v20Costs.every(({ inclusion }) => inclusion === 'INCLUDED')).toBe(
      true,
    );
    expect(
      result.costs
        .filter(({ inclusion }) => inclusion === 'INCLUDED')
        .every(({ benchmarkId }) => benchmarkId === 'frontier-code-2-0'),
    ).toBe(true);
    expect(result.validationReport).toContain(
      '2.0 configurations with costs (materialized, INCLUDED) | 9 |',
    );
    expect(result.validationReport).toContain(
      'Models removed upstream and preserved unchanged: GPT-5.6 Terra.',
    );
  });

  it('rejects 1.1 value changes offline and only accepts them online with a hint', () => {
    const changes = { valueChanges: ['row score 1 -> 0.5'] };
    expect(() => assertFrontierCode11Unchanged(changes, null)).toThrow(
      /offline rebuilds cannot accept value changes: row score 1 -> 0.5/u,
    );
    expect(() =>
      assertFrontierCode11Unchanged(changes, 'rerun with --accept'),
    ).toThrow(/rerun with --accept/u);
    expect(() =>
      assertFrontierCode11Unchanged({ valueChanges: [] }, null),
    ).not.toThrow();

    const previous = materializeFrontierCode11(
      v11Payload,
      { dataEvidenceId: oldEvidenceId, observedAt },
      noPrevious,
    );
    const changed = JSON.parse(v11Payload) as {
      v1_1: {
        data: Record<string, Record<string, { main: { new_score: number } }>>;
      };
    };
    changed.v1_1.data['Claude Opus 5']!.high!.main.new_score = 0.5;
    const artifacts: Record<string, string> = {
      'v11.json': JSON.stringify(changed),
      'page.html': topTenHtml,
    };
    expect(() =>
      rebuildFrontierCodeFromEvidence(
        [
          {
            id: evidenceId,
            requestUrl: FRONTIER_CODE_DATA_URL,
            retrievedAt: observedAt,
            artifactPath: 'v11.json',
          },
          {
            id: pageEvidenceId,
            requestUrl: FRONTIER_CODE_PAGE_URL,
            retrievedAt: observedAt,
            artifactPath: 'page.html',
            metadata: { renderedRows: 10, renderedTopTenMatched: true },
          },
        ],
        (path) => artifacts[path]!,
        previous,
      ),
    ).toThrow(/offline rebuilds cannot accept value changes/u);
  });
});
