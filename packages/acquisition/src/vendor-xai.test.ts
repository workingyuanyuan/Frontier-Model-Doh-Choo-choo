import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { materializeXaiRelease } from './vendor-xai.js';

const fixtures = resolve(import.meta.dirname, '../test-fixtures');
const html = readFileSync(resolve(fixtures, 'xai-release.html'), 'utf8');
const js = readFileSync(resolve(fixtures, 'xai-release-chart.js'), 'utf8');
// IDs identify these reduced fixtures, not the original captures.
const context = {
  evidenceId:
    'sha256:2f3da629a2cb2be11e7dd3814c06f50987dcb62f81f74ab46ca5154bd9b29ecd',
  pageEvidenceId:
    'sha256:97006302e883111553ff1154fd35adc4270a58cb86726dd85acbcfc526e6de11',
  observedAt: '2026-10-04T00:00:00.000Z',
};
describe('xAI reviewed release', () => {
  it('preserves score/cost pairing and the DeepSWE effort override', () => {
    const result = materializeXaiRelease(js, html, context);
    const grok = result.candidates.find(
      (r) =>
        r.benchmarkId === 'cursorbench-4' &&
        r.model.canonicalModelId === 'xai-grok-4-7' &&
        r.profile.effort === 'xhigh',
    )!;
    expect(grok.rawScore).toBe(46.3);
    expect(result.costs.find((r) => r.id === `${grok.id}:cost`)?.cost).toBe(
      6.01,
    );
    expect(
      result.candidates.find((r) => r.benchmarkId === 'deepswe-1-1')?.profile
        .effort,
    ).toBe('high');
    expect(
      result.candidates.find((r) => r.profile.effort === 'minimal')?.inclusion,
    ).toBe('EXCLUDED');
  });
  it('rejects unit or table score drift', () => {
    expect(() =>
      materializeXaiRelease(
        js.replace('Average cost per task', 'Cost per token'),
        html,
        context,
      ),
    ).toThrow('drift');
    expect(() =>
      materializeXaiRelease(js, html.replaceAll('71.0%', '72.0%'), context),
    ).toThrow('drift');
  });
});
