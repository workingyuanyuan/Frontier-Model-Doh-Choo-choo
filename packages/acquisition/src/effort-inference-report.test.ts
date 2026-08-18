import { describe, expect, it } from 'vitest';

import type { CandidateResult, ProfilePolicy } from '@llm-bench/benchmark-data';

import {
  EFFORT_INFERENCE_END,
  EFFORT_INFERENCE_START,
  renderEffortInferenceSection,
  upsertEffortInferenceSection,
} from './effort-inference-report.js';

const evidenceId = `sha256:${'a'.repeat(64)}`;
const policy: ProfilePolicy = {
  schemaVersion: 'profile-policy-v2',
  effortOrder: ['non-reasoning', 'low', 'medium', 'high', 'xhigh', 'max'],
  defaultEffort: 'default',
};

const candidate = (
  id: string,
  sourceId: string,
  effort: string | null,
  rawName = 'GPT-5.6 Sol',
): CandidateResult => ({
  schemaVersion: 'candidate-result-v1',
  id,
  sourceId,
  sourceRole: 'ORGANIZER',
  benchmarkId: 'test-benchmark',
  benchmarkVersion: '1',
  model: {
    rawName,
    canonicalModelId: 'openai-gpt-5-6-sol',
    profileId: null,
  },
  profile: {
    effort,
    thinking: null,
    tools: null,
    harness: null,
    contextWindowTokens: null,
    quantization: null,
    attempts: null,
  },
  metric: {
    id: 'score',
    name: 'Score',
    unit: 'percent',
    higherIsBetter: true,
  },
  rawScore: 1,
  normalizedScore: 100,
  acquisitionStatus: 'FULL',
  inclusion: 'INCLUDED',
  exclusionReason: null,
  sourceUrl: 'https://example.test/score',
  observedAt: '2026-08-18T00:00:00.000Z',
  sourcePublishedAt: null,
  evidenceIds: [evidenceId],
  provenance: {
    rawScore: {
      evidenceId,
      method: 'MANUAL',
      locator: '$.score',
    },
  },
});

describe('effort inference report', () => {
  it('renders cross-source and default rows with review markers', () => {
    const missing = candidate('frontier-missing', 'frontier-code', null);
    const explicit = candidate('aa-max', 'artificial-analysis', 'max');
    const section = renderEffortInferenceSection(
      'frontier-code',
      [missing],
      [missing, explicit],
      policy,
    );

    expect(section).toContain(EFFORT_INFERENCE_START);
    expect(section).toContain('PENDING USER REVIEW');
    expect(section).toContain('frontier-missing');
    expect(section).toContain('aa-max');
    expect(section).toContain('`max`');

    const defaultSection = renderEffortInferenceSection(
      'frontier-code',
      [missing],
      [missing],
      policy,
    );
    expect(defaultSection).toContain('Unlabelled rows assigned');
    expect(defaultSection).toContain('`default`');
  });

  it('replaces a tagged section idempotently without duplicating it', () => {
    const base = '# source validation\n\nOriginal content.\n';
    const first = upsertEffortInferenceSection(
      base,
      renderEffortInferenceSection(
        'frontier-code',
        [candidate('missing', 'frontier-code', null)],
        [candidate('missing', 'frontier-code', null)],
        policy,
      ),
    );
    const second = upsertEffortInferenceSection(
      first,
      renderEffortInferenceSection(
        'frontier-code',
        [candidate('missing', 'frontier-code', null)],
        [candidate('missing', 'frontier-code', null)],
        policy,
      ),
    );

    expect(second).toBe(first);
    expect(second.match(new RegExp(EFFORT_INFERENCE_START, 'g'))).toHaveLength(
      1,
    );
    expect(second.match(new RegExp(EFFORT_INFERENCE_END, 'g'))).toHaveLength(1);
  });
});
