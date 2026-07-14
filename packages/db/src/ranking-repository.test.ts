import { describe, expect, it } from 'vitest';

import {
  assembleActiveEdition,
  type ActiveEditionHeaderRow,
  type ActiveEditionRankingRow,
} from './ranking-repository.js';

const dimensions = [
  'reasoning',
  'math',
  'knowledge',
  'language',
  'instruction',
  'coding',
  'agentic',
  'context',
].map((dimension) => ({
  dimension,
  score: null,
  coverage: 0,
  confidence: 0,
  status: 'INSUFFICIENT_DATA',
}));

const header: ActiveEditionHeaderRow = {
  id: '019f5f51-505b-74de-bcef-c92c8d9fe66a',
  publicationMode: 'PREVIEW',
  titleZhTw: '2026-07-13 LLM 基準週報（預覽）',
  titleEn: '2026-07-13 LLM benchmark weekly (Preview)',
  summaryZhTw: null,
  summaryEn: null,
  activatedAt: new Date('2026-07-14T00:00:00.000Z'),
  snapshotId: '019f5f2d-c3df-7c54-96e8-e1939d332c8e',
  editionDate: '2026-07-13',
  dataCutoffAt: new Date('2026-07-13T03:37:10.792Z'),
  scoringMethodVersion: 'absolute-capability-v1',
  sourceSnapshotIds: ['019f513f-132a-7dc0-805d-0b036ea0d476'],
  entryCount: 2,
};

function row(modelVariantId: string, slug: string): ActiveEditionRankingRow {
  return {
    modelVariantId,
    slug,
    displayName: slug,
    providerName: 'Provider',
    rank: null,
    overallScore: null,
    overallCoverage: '0.125000',
    overallConfidence: '12.5000',
    rankingStatus: 'UNRANKED',
    dimensions,
    qualityFlags: ['LOW_COVERAGE'],
  };
}

describe('active ranking repository assembly', () => {
  it('validates and orders unranked entries deterministically by slug', () => {
    const edition = assembleActiveEdition(header, [
      row('019f513f-132a-7dc0-805d-0b036ea0d478', 'zeta-model'),
      row('019f513f-132a-7dc0-805d-0b036ea0d477', 'alpha-model'),
    ]);

    expect(edition.snapshot.entries.map(({ slug }) => slug)).toEqual([
      'alpha-model',
      'zeta-model',
    ]);
    expect(edition.publicationMode).toBe('PREVIEW');
  });

  it('fails closed when snapshot metadata and rows disagree', () => {
    expect(() =>
      assembleActiveEdition(header, [
        row('019f513f-132a-7dc0-805d-0b036ea0d477', 'alpha-model'),
      ]),
    ).toThrow('entry count');
  });
});
