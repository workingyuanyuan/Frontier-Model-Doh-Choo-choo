import { describe, expect, it } from 'vitest';

import {
  APPROVED_VALS_BENCHMARKS,
  decodeHtmlEntities,
  decodeValsEffort,
  extractValsBenchmarkSlugs,
  materializeVals,
  parseValsBenchmarkPage,
  unwrapAstroValue,
} from './vals-materializer.js';

const evidenceId = `sha256:${'a'.repeat(64)}`;

const fixture = (totalModels = 2): string => {
  const props = {
    benchmarkView: [
      0,
      {
        default: [
          0,
          {
            metadata: [
              0,
              {
                benchmark: [0, 'Fixture Bench'],
                version: [0, '1.2'],
                updated: [0, '2026-08-21'],
                total_models: [0, totalModels],
              },
            ],
            tasks: [
              0,
              {
                overall: [
                  0,
                  {
                    'GPT-5.6 Sol': [
                      0,
                      {
                        accuracy: [0, 81.25],
                        cost_per_test: [0, 0.42],
                        reasoning_effort: [0, 'max'],
                        compute_effort: [0, null],
                        harness: [0, 'fixture'],
                      },
                    ],
                    'unknown/model': [
                      0,
                      {
                        accuracy: [0, 12.5],
                        cost_per_test: [0, null],
                        reasoning_effort: [0, '0.99'],
                        compute_effort: [0, null],
                        harness: [0, null],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  };
  const encoded = JSON.stringify(props)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;');
  return `<astro-island component-url="/_astro/ScatterGraph.js" props="{}"></astro-island><astro-island component-url="/_astro/BenchmarkView.hash.js" props="${encoded}"></astro-island>`;
};

describe('Vals Astro parsing', () => {
  it('decodes HTML entities independently', () => {
    expect(decodeHtmlEntities('&quot;x&amp;y&#39;&#x21;&quot;')).toBe(
      '"x&y\'!"',
    );
  });

  it('unwraps nested Astro envelopes independently', () => {
    expect(unwrapAstroValue([0, { a: [0, 'x'], b: [0, [1, 2, 3]] }])).toEqual({
      a: 'x',
      b: [1, 2, 3],
    });
  });

  it('selects BenchmarkView rather than another Astro island', () => {
    const parsed = parseValsBenchmarkPage(fixture());
    expect(parsed?.metadata.total_models).toBe(2);
    expect(Object.keys(parsed?.rows ?? {})).toEqual([
      'GPT-5.6 Sol',
      'unknown/model',
    ]);
  });

  it('fails when metadata.total_models differs from overall rows', () => {
    expect(() => parseValsBenchmarkPage(fixture(3))).toThrow(
      /total_models mismatch/u,
    );
  });

  it('returns null for a page without BenchmarkView data', () => {
    expect(parseValsBenchmarkPage('<main>No results</main>')).toBeNull();
    expect(
      parseValsBenchmarkPage(
        '<astro-island component-url="/_astro/BenchmarkView.hash.js" props="{&quot;empty&quot;:[0,true]}"></astro-island>',
      ),
    ).toBeNull();
  });

  it('enumerates and de-duplicates slugs from the live-style index markup', () => {
    expect(
      extractValsBenchmarkSlugs(
        '<a href="/benchmarks/swebench">a</a><a href="/benchmarks/new_one">b</a><a href="/benchmarks/swebench">c</a>',
      ),
    ).toEqual(['new_one', 'swebench']);
  });
});

describe('Vals materialization policy', () => {
  it('maps underscore slugs explicitly and records per-benchmark roles', () => {
    expect(APPROVED_VALS_BENCHMARKS.corp_fin_v2).toEqual({
      benchmarkId: 'corpfin',
      role: 'ORGANIZER',
    });
    expect(APPROVED_VALS_BENCHMARKS.legal_research?.benchmarkId).toBe(
      'legal-research',
    );
    expect(APPROVED_VALS_BENCHMARKS.mmlu_pro?.benchmarkId).toBe('mmlu-pro');
    expect(APPROVED_VALS_BENCHMARKS.ioi?.role).toBe('INDEPENDENT');
    expect(APPROVED_VALS_BENCHMARKS.emb?.role).toBe('ORGANIZER');
    expect(APPROVED_VALS_BENCHMARKS.cyber?.role).toBe('INDEPENDENT');
  });

  it('decodes reasoning and compute effort but rejects 0.99', () => {
    expect(
      decodeValsEffort({ reasoning_effort: '0.99', compute_effort: null }),
    ).toBeNull();
    expect(
      decodeValsEffort({ reasoning_effort: null, compute_effort: 'max' }),
    ).toBe('max');
  });

  it('promotes only allow-listed pages and preserves unknown identity as null', () => {
    const result = materializeVals(
      [
        {
          slug: 'swebench',
          html: fixture(),
          evidenceId,
          sourceUrl: 'https://www.vals.ai/benchmarks/swebench',
        },
        {
          slug: 'brand_new',
          html: fixture(),
          evidenceId,
          sourceUrl: 'https://www.vals.ai/benchmarks/brand_new',
        },
      ],
      {
        observedAt: '2026-08-22T00:00:00.000Z',
        indexEvidenceId: evidenceId,
        discoveredSlugs: ['swebench', 'brand_new'],
      },
    );
    expect(
      result.candidates.filter(({ inclusion }) => inclusion === 'INCLUDED'),
    ).toHaveLength(2);
    expect(
      result.candidates
        .filter(({ benchmarkId }) => benchmarkId === 'brand-new')
        .every(({ inclusion }) => inclusion === 'EXCLUDED'),
    ).toBe(true);
    const unknown = result.candidates.find(
      ({ model }) => model.rawName === 'unknown/model',
    );
    expect(unknown?.model).toMatchObject({
      canonicalModelId: null,
      profileId: null,
    });
    expect(unknown?.profile.effort).toBeNull();
    expect(result.newlyDiscoveredSlugs).toEqual(['brand_new']);
  });

  it('always excludes composite scores but includes only vals_index costs', () => {
    const result = materializeVals(
      [
        {
          slug: 'vals_index',
          html: fixture(),
          evidenceId,
          sourceUrl: 'https://www.vals.ai/benchmarks/vals_index',
        },
      ],
      {
        observedAt: '2026-08-22T00:00:00.000Z',
        indexEvidenceId: evidenceId,
        discoveredSlugs: ['vals_index'],
      },
    );
    expect(
      result.candidates.every(({ inclusion }) => inclusion === 'EXCLUDED'),
    ).toBe(true);
    expect(result.costs).toHaveLength(1);
    expect(result.costs[0]?.inclusion).toBe('INCLUDED');
  });

  it('retains a non-percent unapproved raw score without inventing normalization', () => {
    const html = fixture().replace('12.5', '994.5');
    const result = materializeVals(
      [
        {
          slug: 'poker_agent',
          html,
          evidenceId,
          sourceUrl: 'https://www.vals.ai/benchmarks/poker_agent',
        },
      ],
      {
        observedAt: '2026-08-22T00:00:00.000Z',
        indexEvidenceId: evidenceId,
        discoveredSlugs: ['poker_agent'],
      },
    );
    const row = result.candidates.find(
      ({ model }) => model.rawName === 'unknown/model',
    );
    expect(row).toMatchObject({
      rawScore: 994.5,
      normalizedScore: null,
      inclusion: 'EXCLUDED',
    });
  });
});
