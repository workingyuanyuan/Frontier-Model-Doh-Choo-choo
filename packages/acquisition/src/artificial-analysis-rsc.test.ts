import { describe, expect, it } from 'vitest';

import {
  compareArtificialAnalysisApi,
  extractArtificialAnalysisRscRows,
  isArtificialAnalysisValuePresent,
  materializeArtificialAnalysisRsc,
} from './artificial-analysis-rsc.js';

const evidenceId =
  'sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';

describe('Artificial Analysis RSC parser', () => {
  it('extracts model rows and treats $undefined as missing, not as a score', () => {
    const html =
      '<script>self.__next_f.push([1,"21:[{\\"model_creator_id\\":\\"creator\\",\\"slug\\":\\"model\\",\\"name\\":\\"Model (high)\\",\\"release_date\\":\\"2026-08-01\\",\\"deprecated\\":false,\\"gpqa\\":\\"$undefined\\",\\"hle\\":0.5,\\"omniscience_breakdown\\":{\\"total\\":{\\"accuracy\\":0.7}},\\"intelligenceIndexCostPerTask\\":{\\"cost\\":{\\"total\\":1.25}}}]")])</script>';
    const rows = extractArtificialAnalysisRscRows(html);

    expect(rows).toHaveLength(1);
    expect(rows[0]?.gpqa).toBe('$undefined');
    expect(isArtificialAnalysisValuePresent(rows[0]?.gpqa)).toBe(false);
    expect(isArtificialAnalysisValuePresent(rows[0]?.hle)).toBe(true);
    expect(rows[0]?.omniscience_breakdown).toEqual({
      total: { accuracy: 0.7 },
    });
  });

  it('parses initialModels rows from evaluation pages', () => {
    const html =
      '<script>self.__next_f.push([1,"21:[\\"$\\",\\"$L1\\",null,{\\"initialModels\\":[{\\"id\\":\\"row-id\\",\\"slug\\":\\"model\\",\\"name\\":\\"Model (max)\\",\\"releaseDate\\":\\"2026-08-01\\",\\"deprecated\\":false,\\"gpqa\\":0.9}]}]")])</script>';
    const rows = extractArtificialAnalysisRscRows(html);

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      slug: 'model',
      name: 'Model (max)',
      gpqa: 0.9,
    });
  });
});

describe('Artificial Analysis API cross-validation', () => {
  it('reports overlapping value mismatches without treating different populations as errors', () => {
    const result = compareArtificialAnalysisApi(
      [
        { slug: 'same', name: 'Same', gpqa: 0.8 },
        { slug: 'page-only', name: 'Page only', gpqa: 0.4 },
      ],
      {
        data: [
          { slug: 'same', evaluations: { gpqa: 0.81 } },
          { slug: 'api-only', evaluations: { gpqa: 0.2 } },
        ],
      },
    );

    expect(result.matchedRows).toBe(1);
    expect(result.comparedValues).toBe(1);
    expect(result.mismatches).toEqual([
      {
        key: 'same',
        field: 'gpqa',
        pageValue: 0.8,
        apiValue: 0.81,
      },
    ]);
    expect(result.pageOnlyRows).toEqual(['page-only']);
    expect(result.apiOnlyRows).toEqual(['api-only']);
  });

  it('counts API rounding as a precision difference, not a disagreement', () => {
    // The API rounds to three decimals while the page payload is full
    // precision. Without a tolerance this reports a difference on roughly two
    // thirds of all comparisons and buries real drift in the noise.
    const result = compareArtificialAnalysisApi(
      [
        { slug: 'rounded', name: 'Rounded', gpqa: 0.856565656565657 },
        { slug: 'exact', name: 'Exact', gpqa: 0.5 },
      ],
      {
        data: [
          { slug: 'rounded', evaluations: { gpqa: 0.857 } },
          { slug: 'exact', evaluations: { gpqa: 0.5 } },
        ],
      },
    );

    expect(result.comparedValues).toBe(2);
    expect(result.precisionDifferences).toBe(1);
    expect(result.mismatches).toEqual([]);
  });

  it('accepts the exact half-step rounding boundary despite float noise', () => {
    const result = compareArtificialAnalysisApi(
      [{ slug: 'boundary', name: 'Boundary', gpqa: 0.3125 }],
      { data: [{ slug: 'boundary', evaluations: { gpqa: 0.313 } }] },
    );

    expect(result.precisionDifferences).toBe(1);
    expect(result.mismatches).toEqual([]);
  });

  it('still reports a difference that exceeds the rounding tolerance', () => {
    const result = compareArtificialAnalysisApi(
      [{ slug: 'drifted', name: 'Drifted', gpqa: 0.8 }],
      { data: [{ slug: 'drifted', evaluations: { gpqa: 0.81 } }] },
    );

    expect(result.precisionDifferences).toBe(0);
    expect(result.mismatches).toHaveLength(1);
    expect(result.mismatches[0]).toMatchObject({ field: 'gpqa' });
  });
});

describe('Artificial Analysis RSC materializer', () => {
  it('keeps missing sentinels out of candidates and emits separate cost semantics', () => {
    const html =
      '<script>self.__next_f.push([1,"21:[{\\"model_creator_id\\":\\"creator\\",\\"slug\\":\\"gpt-5-6-sol\\",\\"name\\":\\"GPT-5.6 Sol (max)\\",\\"release_date\\":\\"2026-08-01\\",\\"deprecated\\":false,\\"gpqa\\":0.9,\\"hle\\":\\"$undefined\\",\\"lcr\\":0.8,\\"omniscience\\":42,\\"omniscience_breakdown\\":{\\"total\\":{\\"accuracy\\":0.7}},\\"intelligenceIndexCostPerTask\\":{\\"cost\\":{\\"total\\":1.25}},\\"price1mInputTokens\\":5,\\"price1mOutputTokens\\":30}]")])</script>';
    const result = materializeArtificialAnalysisRsc([
      {
        kind: 'evaluation',
        slug: 'omniscience',
        sourceUrl: 'https://artificialanalysis.ai/evaluations/omniscience',
        evidenceId,
        retrievedAt: '2026-08-17T00:00:00.000Z',
        html,
      },
    ]);

    expect(
      result.candidates.some(
        ({ benchmarkId }) => benchmarkId === 'humanitys-last-exam',
      ),
    ).toBe(false);
    expect(
      result.candidates.some(
        ({ benchmarkId }) => benchmarkId === 'gpqa-diamond',
      ),
    ).toBe(true);
    expect(
      result.candidates.some(
        ({ benchmarkId, inclusion }) =>
          benchmarkId === 'aa-omniscience' && inclusion === 'EXCLUDED',
      ),
    ).toBe(true);
    expect(result.costs.map(({ costType }) => costType)).toEqual([
      'API_STANDARDIZED',
      'MEASURED_TASK',
    ]);
    expect(result.validationReport).toContain(
      '$undefined` is treated as missing',
    );
  });
});

describe('Artificial Analysis provenance URLs', () => {
  const detailPage = (slug: string, rows: Record<string, unknown>[]) => ({
    kind: 'model-detail' as const,
    slug,
    sourceUrl: `https://artificialanalysis.ai/models/${slug}`,
    evidenceId: `sha256:${'c'.repeat(64)}`,
    retrievedAt: '2026-08-17T00:00:00.000Z',
    rows,
  });

  it('points a row at its own model page, not the detail page it was parsed from', () => {
    // A /models/<slug> payload carries the whole catalog. Attributing every row
    // to the alphabetically-first detail page sent 202 rows across 11 models to
    // https://artificialanalysis.ai/models/a-x-k2.
    const result = materializeArtificialAnalysisRsc([
      detailPage('a-x-k2', [
        {
          slug: 'a-x-k2',
          name: 'A.X K2',
          release_date: '2026-08-01',
          deprecated: false,
          gpqa: 0.5,
        },
        {
          slug: 'claude-opus-5-high',
          name: 'Claude Opus 5 (High)',
          release_date: '2026-08-01',
          deprecated: false,
          gpqa: 0.9,
        },
      ]),
    ]);

    const foreign = result.candidates.find(
      ({ model }) => model.rawName === 'Claude Opus 5 (High)',
    );
    const own = result.candidates.find(
      ({ model }) => model.rawName === 'A.X K2',
    );
    expect(foreign?.sourceUrl).toBe(
      'https://artificialanalysis.ai/models/claude-opus-5-high',
    );
    expect(own?.sourceUrl).toBe('https://artificialanalysis.ai/models/a-x-k2');
  });
});

describe('Artificial Analysis superseded builds', () => {
  it('keeps only the newest release_date for a model', () => {
    // AA lists the April build beside the current one and the display names do
    // not always say which is which, so the row's own release_date decides.
    // Both names resolve to deepseek-deepseek-v4-pro, so without this filter
    // the April scores would land under the current model's identity.
    const result = materializeArtificialAnalysisRsc([
      {
        kind: 'evaluation',
        slug: 'omniscience',
        sourceUrl: 'https://artificialanalysis.ai/evaluations/omniscience',
        evidenceId: `sha256:${'d'.repeat(64)}`,
        retrievedAt: '2026-08-18T00:00:00.000Z',
        rows: [
          {
            slug: 'deepseek-v4-pro-0424',
            name: 'DeepSeek V4 Pro (Reasoning, Max Effort)',
            release_date: '2026-04-24',
            deprecated: false,
            gpqa: 0.1,
          },
          {
            slug: 'deepseek-v4-pro',
            name: 'DeepSeek V4 Pro 0813 (Reasoning, Max Effort)',
            release_date: '2026-08-13',
            deprecated: false,
            gpqa: 0.9,
          },
        ],
      },
    ]);

    const scores = result.candidates
      .filter(({ benchmarkId }) => benchmarkId === 'gpqa-diamond')
      .map(({ rawScore }) => rawScore);
    expect(scores).toEqual([0.9]);
  });
});
