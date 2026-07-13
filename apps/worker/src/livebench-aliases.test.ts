import { describe, expect, it } from 'vitest';

import {
  parseIngestionRunId,
  planLiveBenchAliasDecisions,
} from './livebench-aliases.js';
import type { ModelAliasExclusionCandidate } from './model-alias-resolution.js';

const candidates = [
  {
    namespace: 'livebench',
    alias: 'claude-3-5-sonnet-20241022',
    modelVariantId: 'variant-claude',
  },
  {
    namespace: 'livebench',
    alias: 'GPT 4o',
    modelVariantId: 'variant-gpt-a',
  },
  {
    namespace: 'livebench',
    alias: 'gpt 4O',
    modelVariantId: 'variant-gpt-b',
  },
];

const exclusions: readonly ModelAliasExclusionCandidate[] = [
  {
    namespace: 'livebench',
    alias: 'private-checkpoint',
    reason: 'BENCHMARK_PRIVATE_CHECKPOINT',
    evidenceUrls: ['https://github.com/LiveBench/LiveBench'],
  },
];

describe('LiveBench staged alias decisions', () => {
  it('creates explicit resolved, excluded, unresolved, and ambiguous updates', () => {
    const decisions = planLiveBenchAliasDecisions(
      [
        {
          id: 'staged-resolved',
          rawModelName: 'Claude-3-5-Sonnet-20241022',
        },
        { id: 'staged-excluded', rawModelName: 'PRIVATE-CHECKPOINT' },
        { id: 'staged-unresolved', rawModelName: 'unknown-model' },
        { id: 'staged-ambiguous', rawModelName: 'GPT 4O' },
      ],
      candidates,
      exclusions,
    );

    expect(decisions).toEqual([
      {
        stagedResultId: 'staged-resolved',
        resolutionStatus: 'RESOLVED',
        resolvedModelVariantId: 'variant-claude',
        validationStatus: 'VALIDATED',
        validationErrors: [],
      },
      {
        stagedResultId: 'staged-excluded',
        resolutionStatus: 'EXCLUDED',
        resolvedModelVariantId: null,
        validationStatus: 'EXCLUDED',
        validationErrors: [
          {
            code: 'MODEL_ALIAS_EXCLUDED',
            normalizedAlias: 'private-checkpoint',
            reason: 'BENCHMARK_PRIVATE_CHECKPOINT',
            evidenceUrls: ['https://github.com/LiveBench/LiveBench'],
          },
        ],
      },
      {
        stagedResultId: 'staged-unresolved',
        resolutionStatus: 'UNRESOLVED',
        resolvedModelVariantId: null,
        validationStatus: 'REVIEW_REQUIRED',
        validationErrors: [
          {
            code: 'MODEL_ALIAS_UNRESOLVED',
            normalizedAlias: 'unknown-model',
          },
        ],
      },
      {
        stagedResultId: 'staged-ambiguous',
        resolutionStatus: 'AMBIGUOUS',
        resolvedModelVariantId: null,
        validationStatus: 'REVIEW_REQUIRED',
        validationErrors: [
          {
            code: 'MODEL_ALIAS_AMBIGUOUS',
            normalizedAlias: 'gpt 4o',
            candidateModelVariantIds: ['variant-gpt-a', 'variant-gpt-b'],
          },
        ],
      },
    ]);
  });

  it('returns no updates for an ingestion run without staged rows', () => {
    expect(planLiveBenchAliasDecisions([], candidates, exclusions)).toEqual([]);
  });

  it('rejects an alias that is both mapped and excluded', () => {
    expect(() =>
      planLiveBenchAliasDecisions(
        [{ id: 'staged-conflict', rawModelName: 'private-checkpoint' }],
        [
          ...candidates,
          {
            namespace: 'livebench',
            alias: 'private-checkpoint',
            modelVariantId: 'variant-private',
          },
        ],
        exclusions,
      ),
    ).toThrow('both mapped and excluded');
  });
});

describe('LiveBench alias review input', () => {
  it('accepts a UUID ingestion run ID and rejects missing or unsafe input', () => {
    expect(parseIngestionRunId('019f513a-b30e-75b7-8027-a16db6820da5')).toBe(
      '019f513a-b30e-75b7-8027-a16db6820da5',
    );
    expect(() => parseIngestionRunId(undefined)).toThrow(
      'LIVEBENCH_INGESTION_RUN_ID',
    );
    expect(() => parseIngestionRunId("' OR true --")).toThrow(
      'LIVEBENCH_INGESTION_RUN_ID',
    );
  });
});
