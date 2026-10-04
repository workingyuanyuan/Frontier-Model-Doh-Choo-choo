import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  CostRecordSchema,
  EvidenceRecordSchema,
} from '@llm-bench/benchmark-data';
import { describe, expect, it } from 'vitest';
import { materializeOpenAIRelease } from './vendor-openai.js';

const root = fileURLToPath(new URL('../../../', import.meta.url));

describe('audited vendor task cost evidence', () => {
  it.each([['openai-releases', 36, 30]] as const)(
    'replays %s with exact chart cost identities',
    (sourceId, count, included) => {
      const evidence = EvidenceRecordSchema.array().parse(
        JSON.parse(
          readFileSync(
            resolve(root, 'data/sources', sourceId, 'evidence-index.json'),
            'utf8',
          ),
        ),
      );
      const record = evidence[0]!;
      const capture = readFileSync(
        resolve(root, 'data/sources/openai-releases/reviewed-capture.json'),
        'utf8',
      );
      const context = { evidenceId: record.id, observedAt: record.retrievedAt };
      const result = materializeOpenAIRelease(capture, context);
      CostRecordSchema.array().parse(result.costs);
      expect(result.costs).toHaveLength(count);
      expect(
        result.costs.filter(({ inclusion }) => inclusion === 'INCLUDED'),
      ).toHaveLength(included);
      for (const cost of result.costs) {
        const candidate = result.candidates.find(
          ({ id }) => `${id}:cost` === cost.id,
        )!;
        expect(cost).toMatchObject({
          sourceId,
          model: candidate.model,
          profile: candidate.profile,
          benchmarkId: candidate.benchmarkId,
          benchmarkVersion: candidate.benchmarkVersion,
          inclusion: candidate.inclusion,
          evidenceIds: candidate.evidenceIds,
          unit: 'USD_PER_TASK',
          costType: 'AGENT_TASK',
        });
      }
      if (sourceId === 'openai-releases') {
        const sol = result.costs.filter(
          ({ model, benchmarkId }) =>
            model.canonicalModelId === 'openai-gpt-6-1-sol' &&
            benchmarkId === 'deepswe-1-1',
        );
        expect(sol).toHaveLength(5);
        expect(sol.find(({ profile }) => profile.effort === 'low')?.cost).toBe(
          0.1714,
        );
        expect(sol.find(({ profile }) => profile.effort === 'max')?.cost).toBe(
          1.5711,
        );
      }
    },
  );
});
