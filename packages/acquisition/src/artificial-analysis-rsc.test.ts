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
