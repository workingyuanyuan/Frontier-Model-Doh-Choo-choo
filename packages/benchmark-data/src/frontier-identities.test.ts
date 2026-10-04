import { describe, expect, it } from 'vitest';

import {
  FrontierIdentitiesSchema,
  resolveFrontierIdentities,
  type FrontierIdentities,
} from './frontier-identities.js';
import type { CandidateResult } from './index.js';

const evidenceId = `sha256:${'a'.repeat(64)}`;
const candidate = (
  rawName = 'GLM-5.3 (Max)',
  id = 'aa-glm-max',
): CandidateResult => ({
  schemaVersion: 'candidate-result-v1',
  id,
  sourceId: 'artificial-analysis',
  sourceRole: 'ORGANIZER',
  benchmarkId: 'artificial-analysis-intelligence-index',
  benchmarkVersion: 'v4.3.2',
  model: { rawName, canonicalModelId: null, profileId: null },
  profile: {
    effort: 'max',
    thinking: 'reasoning',
    tools: null,
    harness: null,
    contextWindowTokens: null,
    quantization: null,
    attempts: null,
  },
  metric: {
    id: 'intelligence-index',
    name: 'Intelligence Index',
    unit: 'index points',
    higherIsBetter: true,
  },
  rawScore: 44.777392385614,
  normalizedScore: null,
  acquisitionStatus: 'PARTIAL_SOURCE',
  inclusion: 'EXCLUDED',
  exclusionReason: 'Composite used for frontier selection and comparison.',
  sourceUrl: 'https://artificialanalysis.ai/models/glm-5-3',
  observedAt: '2026-10-03T00:00:00Z',
  sourcePublishedAt: null,
  evidenceIds: [evidenceId],
  provenance: {
    rawScore: {
      evidenceId,
      method: 'NEXT_RSC',
      locator: 'model.intelligenceIndex',
    },
  },
});
const config = (
  references: CandidateResult[] = [candidate()],
): FrontierIdentities => ({
  schemaVersion: 'frontier-identities-v1',
  mappings: [
    {
      sourceId: 'artificial-analysis',
      canonicalModelId: 'zai-glm-5-3',
      aliases: references.map(({ model }) => model.rawName),
      justification:
        'Saved source names explicitly identify this base model and its efforts.',
      evidence: references.map(({ id, model, sourceUrl }) => ({
        candidateId: id,
        rawName: model.rawName,
        evidenceId,
        sourceUrl,
      })),
    },
  ],
});

describe('frontier identity resolution', () => {
  it('resolves exact base-model aliases across efforts while preserving all evidence fields', () => {
    const input = [candidate(), candidate('GLM-5.3 (Low)', 'aa-glm-low')];
    input[1]!.profile.effort = 'low';
    const snapshot = structuredClone(input);
    const resolved = resolveFrontierIdentities(input, config(input));
    expect(resolved.map(({ model }) => model.canonicalModelId)).toEqual([
      'zai-glm-5-3',
      'zai-glm-5-3',
    ]);
    expect(input).toEqual(snapshot);
    expect(resolved).toEqual(
      snapshot.map((row) => ({
        ...row,
        model: { ...row.model, canonicalModelId: 'zai-glm-5-3' },
      })),
    );
  });

  it('limits resolution to exact labels from the configured source', () => {
    const reference = candidate();
    const otherSource = {
      ...candidate(),
      id: 'other-glm',
      sourceId: 'other-source',
    };
    const related = [
      candidate('GLM-5.3 Flash', 'flash'),
      candidate('glm-5.3 (max)', 'lowercase'),
      candidate('GLM-5.3 (Max) ', 'spaced'),
    ];
    const result = resolveFrontierIdentities(
      [reference, otherSource, ...related],
      config(),
    );
    expect(result[0]!.model.canonicalModelId).toBe('zai-glm-5-3');
    expect(
      result.slice(1).every(({ model }) => model.canonicalModelId === null),
    ).toBe(true);
  });

  it('rejects conflicts with a previously resolved canonical identity', () => {
    const input = candidate();
    input.model.canonicalModelId = 'different-glm-model';
    expect(() => resolveFrontierIdentities([input], config())).toThrow(
      'conflicts with candidate',
    );
  });

  it('rejects ambiguous aliases and aliases lacking saved identity evidence', () => {
    const ambiguous = config();
    ambiguous.mappings.push({
      ...ambiguous.mappings[0]!,
      canonicalModelId: 'different-model',
    });
    expect(() => FrontierIdentitiesSchema.parse(ambiguous)).toThrow(
      'aliases must be unique',
    );
    const missing = config();
    missing.mappings[0]!.aliases.push('GLM-5.3 Flash');
    expect(() => FrontierIdentitiesSchema.parse(missing)).toThrow(
      'requires saved source identity evidence',
    );
  });

  it('resolves a later capture while keeping renamed models unresolved', () => {
    const input = candidate();
    input.id = 'new-version-result';
    input.benchmarkVersion = 'v5';
    input.evidenceIds = [`sha256:${'b'.repeat(64)}`];
    const result = resolveFrontierIdentities(
      [input, candidate('GLM-5.4')],
      config(),
    );
    expect(result[0]!.model.canonicalModelId).toBe('zai-glm-5-3');
    expect(result[1]!.model.canonicalModelId).toBeNull();
  });
});
