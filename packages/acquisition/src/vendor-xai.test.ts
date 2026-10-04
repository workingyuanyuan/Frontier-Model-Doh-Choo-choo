import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { materializeXaiRelease } from './vendor-xai.js';

const root = resolve(import.meta.dirname, '../../..');
const records = JSON.parse(
  readFileSync(
    resolve(root, 'data/research/release-evidence-index.json'),
    'utf8',
  ),
) as {
  sourceId: string;
  mediaType: string;
  artifactPath: string;
  id: string;
  retrievedAt: string;
}[];
const page = records.find(
  (r) => r.sourceId === 'xai-releases' && r.mediaType === 'text/html',
)!;
const bundle = records.find(
  (r) =>
    r.sourceId === 'xai-releases' && r.mediaType === 'application/javascript',
)!;
const html = readFileSync(resolve(root, page.artifactPath), 'utf8');
const js = readFileSync(resolve(root, bundle.artifactPath), 'utf8');
const context = {
  evidenceId: bundle.id,
  pageEvidenceId: page.id,
  observedAt: page.retrievedAt,
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
