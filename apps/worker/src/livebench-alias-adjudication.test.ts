import { describe, expect, it } from 'vitest';

import { summarizeLiveBenchAliasAdjudication } from './livebench-alias-adjudication.js';

describe('LiveBench alias adjudication completeness', () => {
  it('assigns exactly one auditable decision to all 166 pinned aliases', () => {
    expect(summarizeLiveBenchAliasAdjudication()).toEqual({
      aliasesInventoried: 166,
      aliasesMapped: 157,
      aliasesExcluded: 9,
      aliasesPending: 0,
    });
  });
});
