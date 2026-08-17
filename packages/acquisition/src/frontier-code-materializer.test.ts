import { describe, expect, it } from 'vitest';

import {
  extractFrontierCodeTopTen,
  materializeFrontierCode,
} from './frontier-code-materializer.js';

const evidenceId = `sha256:${'a'.repeat(64)}`;
const pageEvidenceId = `sha256:${'b'.repeat(64)}`;

const htmlFor = (rows: ReadonlyArray<readonly [string, number]>): string => `
<script type="application/ld+json">
${JSON.stringify({
  '@type': 'Dataset',
  '@graph': [
    {
      '@type': 'ItemList',
      name: 'FrontierCode 1.1 Leaderboard (Main)',
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

const payload = JSON.stringify({
  v1_1: {
    models: names,
    harness: Object.fromEntries(names.map((name) => [name, 'test-harness'])),
    efforts: Object.fromEntries(
      names.map((name, index) => [name, index === 9 ? ['none'] : ['high']]),
    ),
    data: Object.fromEntries(
      names.map((name, index) => [
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
  },
});

describe('Frontier Code materializer', () => {
  it('extracts the named Main JSON-LD ItemList', () => {
    expect(
      extractFrontierCodeTopTen(
        htmlFor(names.map((name, index) => [name, 100 - index])),
      ),
    ).toEqual(
      names.map((name, index) => ({
        position: index + 1,
        name,
        score: 100 - index,
      })),
    );
  });

  it('preserves every Main effort row, omits missing costs, and keeps none null', () => {
    const result = materializeFrontierCode(
      payload,
      htmlFor(names.map((name, index) => [name, 100 - index])),
      {
        dataEvidenceId: evidenceId,
        pageEvidenceId,
        observedAt: '2026-08-17T00:00:00.000Z',
        visualRowCount: 10,
        visualTopTenMatched: true,
      },
    );

    expect(result.candidates).toHaveLength(10);
    expect(result.costs).toHaveLength(9);
    expect(result.topTenMatches).toBe(10);
    expect(result.candidates.every(({ rawScore }) => rawScore <= 1)).toBe(true);
    expect(
      result.candidates.find(({ model }) => model.rawName === 'Kimi K3'),
    ).toMatchObject({
      model: { canonicalModelId: 'moonshot-kimi-k3', profileId: null },
      profile: { effort: null },
      rawScore: 0.91,
      normalizedScore: 91,
    });
    expect(
      result.candidates.find(({ model }) => model.rawName === 'Claude Opus 5'),
    ).toMatchObject({
      model: {
        canonicalModelId: 'anthropic-claude-opus-5',
        profileId: 'anthropic-claude-opus-5-high',
      },
      profile: { effort: 'high', harness: 'test-harness' },
    });
  });

  it('scores under frontier-code-1-1, never the Proximal frontierswe id', () => {
    const result = materializeFrontierCode(
      payload,
      htmlFor(names.map((name, index) => [name, 100 - index])),
      {
        dataEvidenceId: evidenceId,
        pageEvidenceId,
        observedAt: '2026-08-17T00:00:00.000Z',
        visualRowCount: 10,
        visualTopTenMatched: true,
      },
    );

    // frontierswe belongs to Proximal FrontierSWE, a different organiser
    // scoring model+harness rank and dominance. See REFACTOR_SPEC_V2.md 4.2.
    expect(
      result.candidates.every(
        ({ benchmarkId }) => benchmarkId === 'frontier-code-1-1',
      ),
    ).toBe(true);
    expect(
      result.costs.every(
        ({ benchmarkId }) => benchmarkId === 'frontier-code-1-1',
      ),
    ).toBe(true);
    expect(result.candidates.some(({ id }) => id.includes('frontierswe'))).toBe(
      false,
    );
  });

  it('treats an effort outside the policy tiers as unlabelled', () => {
    // FrontierCode keys one configuration by a sampling parameter ("0.99"),
    // which must not become a product profile such as `<model>-0-99`.
    const withIllegalEffort = JSON.parse(payload) as {
      v1_1: {
        efforts: Record<string, string[]>;
        data: Record<string, Record<string, unknown>>;
      };
    };
    const subject = names[0]!;
    withIllegalEffort.v1_1.efforts[subject] = ['0.99'];
    withIllegalEffort.v1_1.data[subject] = {
      '0.99': {
        main: { new_score: 0.14, correct: 0.5, cost: 1.5 },
        extended: { new_score: 0.99, cost: 99 },
      },
    };

    const result = materializeFrontierCode(
      JSON.stringify(withIllegalEffort),
      htmlFor(names.map((name, index) => [name, 100 - index])),
      {
        dataEvidenceId: evidenceId,
        pageEvidenceId,
        observedAt: '2026-08-17T00:00:00.000Z',
        visualRowCount: 10,
        visualTopTenMatched: true,
      },
    );

    const row = result.candidates.find(
      ({ model }) => model.rawName === subject,
    );
    expect(row?.profile.effort).toBeNull();
    expect(row?.model.profileId).toBeNull();
    expect(
      result.candidates.every(
        ({ model }) => !model.profileId?.includes('0-99'),
      ),
    ).toBe(true);
    // The raw key is still recoverable from provenance.
    expect(JSON.stringify(row?.provenance)).toContain('0.99');
  });

  it('reports a structured-export versus JSON-LD mismatch', () => {
    const mismatched = names.map((name, index) => [name, 100 - index] as const);
    mismatched[0] = [names[0]!, 12.3];
    const result = materializeFrontierCode(payload, htmlFor(mismatched), {
      dataEvidenceId: evidenceId,
      pageEvidenceId,
      observedAt: '2026-08-17T00:00:00.000Z',
      visualRowCount: 10,
      visualTopTenMatched: false,
    });
    expect(result.topTenMatches).toBe(9);
    expect(result.topTenMismatches[0]).toContain('rank 1');
  });
});
