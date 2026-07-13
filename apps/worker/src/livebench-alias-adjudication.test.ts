import { describe, expect, it } from 'vitest';

import {
  summarizeLiveBenchAliasAdjudication,
  validateLiveBenchAliasPersistence,
} from './livebench-alias-adjudication.js';

describe('LiveBench alias adjudication completeness', () => {
  it('assigns exactly one auditable decision to all 166 pinned aliases', () => {
    expect(summarizeLiveBenchAliasAdjudication()).toEqual({
      aliasesInventoried: 166,
      aliasesMapped: 157,
      aliasesExcluded: 9,
      aliasesPending: 0,
    });
  });

  it('accepts only persisted validated or excluded records with correct IDs', () => {
    expect(
      validateLiveBenchAliasPersistence([
        {
          validationStatus: 'VALIDATED',
          records: 58_233,
          resolvedRecords: 58_233,
        },
        {
          validationStatus: 'EXCLUDED',
          records: 2_139,
          resolvedRecords: 0,
        },
      ]),
    ).toEqual({
      recordsSeen: 60_372,
      recordsValidated: 58_233,
      recordsExcluded: 2_139,
    });
  });

  it('rejects review-required rows and broken variant relationships', () => {
    expect(() => validateLiveBenchAliasPersistence([])).toThrow(
      'Persistence verification returned no records',
    );
    expect(() =>
      validateLiveBenchAliasPersistence([
        {
          validationStatus: 'REVIEW_REQUIRED',
          records: 1,
          resolvedRecords: 0,
        },
      ]),
    ).toThrow('Unexpected persisted validation status');
    expect(() =>
      validateLiveBenchAliasPersistence([
        {
          validationStatus: 'VALIDATED',
          records: 1,
          resolvedRecords: 0,
        },
      ]),
    ).toThrow('must resolve every record');
    expect(() =>
      validateLiveBenchAliasPersistence([
        {
          validationStatus: 'EXCLUDED',
          records: 1,
          resolvedRecords: 1,
        },
      ]),
    ).toThrow('must not resolve records');
  });
});
