import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { CandidateResultSchema } from '@llm-bench/benchmark-data';

import { materializeDeepSwe } from './deepswe-materializer.js';

describe('DeepSWE materializer', () => {
  const jsonPath = fileURLToPath(
    new URL(
      '../test-fixtures/c4be4303194e8c91a6033b7e03cc1952845817412daaef42cab8679797191c3f.json',
      import.meta.url,
    ),
  );
  const jsonStr = readFileSync(jsonPath, 'utf8');

  it('materializes all 53 configuration rows preserving multi-effort reasoning ladders', () => {
    const result = materializeDeepSwe(jsonStr, '2026-08-12T16:44:09.579Z', {
      evidenceId:
        'sha256:c4be4303194e8c91a6033b7e03cc1952845817412daaef42cab8679797191c3f',
      sourceUrl:
        'https://deepswe.datacurve.ai/artifacts/v1.1/leaderboard-live.json',
    });

    // Schema validation
    CandidateResultSchema.array().parse(result.candidates);

    // Exact count verification
    expect(result.configurationRows).toBe(53);
    expect(result.distinctModels).toBe(21);
    expect(result.candidates).toHaveLength(53);

    // Verify all candidates have benchmarkId deepswe-1-1
    expect(
      result.candidates.every((c) => c.benchmarkId === 'deepswe-1-1'),
    ).toBe(true);

    // Verify multi-effort reasoning ladder preservation for Claude Fable 5 (5 levels)
    const fableEfforts = result.candidates
      .filter((c) => c.model.rawName === 'claude-fable-5')
      .map((c) => c.profile.effort)
      .sort();
    expect(fableEfforts).toEqual(['high', 'low', 'max', 'medium', 'xhigh']);

    // Verify multi-effort reasoning ladder preservation for GPT-5.6 Terra (5 levels)
    const terraEfforts = result.candidates
      .filter((c) => c.model.rawName === 'gpt-5-6-terra')
      .map((c) => c.profile.effort)
      .sort();
    expect(terraEfforts).toEqual(['high', 'low', 'max', 'medium', 'xhigh']);

    // Verify multi-effort reasoning ladder preservation for GPT-5.5 (4 levels)
    const gpt55Efforts = result.candidates
      .filter((c) => c.model.rawName === 'gpt-5-5')
      .map((c) => c.profile.effort)
      .sort();
    expect(gpt55Efforts).toEqual(['high', 'low', 'medium', 'xhigh']);

    // Verify validation report includes exact counts and ladders
    expect(result.validationReport).toContain(
      '# DeepSWE acquisition validation',
    );
    expect(result.validationReport).toContain(
      'Configuration rows extracted | 53',
    );
    expect(result.validationReport).toContain(
      'Distinct models represented | 21',
    );
    expect(result.validationReport).toContain('claude-fable-5 (5 levels:');
    expect(result.validationReport).toContain('gpt-5-6-terra (5 levels:');
  });

  it('rejects payload with empty rows array', () => {
    expect(() =>
      materializeDeepSwe(
        JSON.stringify({ rows: [] }),
        '2026-08-12T16:44:09.579Z',
        {
          evidenceId: 'sha256:dummy',
          sourceUrl: 'https://example.test',
        },
      ),
    ).toThrow('DeepSWE leaderboard JSON contains no rows');
  });
});
