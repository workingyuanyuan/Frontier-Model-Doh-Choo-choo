import { describe, expect, it } from 'vitest';
import { buildAaIndexReport, formatAaIndexReport } from './aa-index-report.js';
import type { ProductVersion } from './index.js';

const product = (values: Array<[string | null, number]>) =>
  ({
    evidence: values.map(([version, score], i) => ({
      id: `result-${i}`,
      sourceId: 'artificial-analysis',
      benchmarkId: 'artificial-analysis-intelligence-index',
      benchmarkVersion: version,
      model: {
        canonicalModelId: 'model',
        profileId: `profile-${i}`,
        rawName: `Model ${i}`,
      },
      rawScore: score,
      normalizedScore: null,
      provenance: {
        evidenceId: 'evidence',
        sourceUrl: 'https://artificialanalysis.ai/models',
        locator: 'intelligenceIndex',
      },
    })),
  }) as ProductVersion;

describe('AA index report', () => {
  it('ranks raw index points within each version and keeps provenance', () => {
    const rows = buildAaIndexReport(
      product([
        ['v4.3', 20],
        ['v4.2', 99],
        ['v4.3', 60],
        ['v4.3', 60],
        ['v4.3', 0],
        [null, 100],
      ]),
    );
    expect(
      rows.filter((r) => r.version === 'v4.3').map((r) => [r.score, r.rank]),
    ).toEqual([
      [60, 1],
      [60, 1],
      [20, 3],
      [0, 4],
    ]);
    expect(rows.find((r) => r.version === 'v4.2')?.rank).toBe(1);
    expect(rows.find((r) => r.version === null)?.rank).toBeNull();
    expect(rows[0]).toMatchObject({
      resultId: 'result-5',
      evidenceId: 'evidence',
      locator: 'intelligenceIndex',
    });
    expect(formatAaIndexReport(rows)).toContain('| 3 | Model 0 | 20.0000 |');
  });
  it('rejects missing or nonfinite raw scores instead of inventing ranks', () => {
    for (const score of [null, undefined, NaN, Infinity]) {
      expect(() =>
        buildAaIndexReport(product([['v4.3', score as number]])),
      ).toThrow('finite rawScore');
    }
  });
});
