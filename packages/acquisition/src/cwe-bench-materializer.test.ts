import { describe, expect, it } from 'vitest';
import { materializeCweBench } from './cwe-bench-materializer.js';

const row = (key: string, name: string, harness: string, p1: string) => `
  <tbody class="lb-group">
    <tr data-model="${key}" data-p1="${p1}" data-p4="90.0" data-p1-all="${p1}" data-p4-all="90.0" data-p1-public="10.0">
      <td class="lb-rank">1</td>
      <td class="lb-name">${name}</td>
      <td class="lb-harness-cell col-harness">${harness}</td>
      <td class="num lb-m is-sorted" data-k="p1">${p1}%</td>
      <td class="num lb-m" data-k="p4">90.0%</td>
    </tr>
  </tbody>`;

const page = ({
  rows = [
    row('Claude Opus 5.5', 'Claude&#160;Opus&#xA0;5.5', 'Claude Code', '50.0'),
    row('Qwen 3.8 Max', 'Qwen3.8-Max&nbsp;(0902)', 'opencode', '40.5'),
  ],
  methodology = 'Each model gets four rollouts on each of the 250 tasks, at high reasoning. Each rollout has a one-hour limit.',
} = {}) => `<!doctype html><html lang="en" data-page-ver="v2"><body>
<section class="shell section" id="leaderboard">
  <h2 class="section-title">CWE-bench leaderboard</h2>
  <button type="button" class="seg is-on" data-set="all" aria-pressed="true">Combined (250)</button>
  <p class="lb-attribution">Results as of <time datetime="2026-11-18">November 18, 2026</time>, on <span data-set-label>all 250 tasks, public and held-out</span>.</p>
  <table>${rows.join('')}</table>
  <p class="note"><strong>How the scores are computed.</strong> ${methodology}</p>
</section></body></html>`;

const context = {
  evidenceId: `sha256:${'c'.repeat(64)}`,
  observedAt: '2026-11-21T00:00:00.000Z',
  visualRowCount: 2,
};

describe('CWE-bench materializer', () => {
  it('scores the Combined view at the stated high effort with per-row harness', () => {
    const result = materializeCweBench(page(), context);
    expect(result.resultsAsOf).toBe('2026-11-18');
    expect(
      result.candidates.map((c) => [
        c.model.rawName,
        c.model.canonicalModelId,
        c.profile.effort,
        c.profile.harness,
        c.profile.attempts,
        c.normalizedScore,
      ]),
    ).toEqual([
      [
        'Claude Opus 5.5',
        'anthropic-claude-opus-5-5',
        'high',
        'Claude Code',
        4,
        50,
      ],
      // The displayed name keeps the dated build, which has no catalog alias.
      ['Qwen3.8-Max (0902)', null, 'high', 'opencode', 4, 40.5],
    ]);
  });

  it('only accepts the leaderboard section by its exact id', () => {
    expect(() =>
      materializeCweBench(
        page().replace('id="leaderboard"', 'data-id="leaderboard"'),
        context,
      ),
    ).toThrow(/section missing/u);
  });

  it('rejects a row count that differs from the rendered table', () => {
    expect(() =>
      materializeCweBench(page(), { ...context, visualRowCount: 3 }),
    ).toThrow(/rendered count/u);
  });

  it('rejects a methodology change', () => {
    expect(() =>
      materializeCweBench(
        page({ methodology: 'Each model gets one rollout, at max reasoning.' }),
        context,
      ),
    ).toThrow(/methodology drift/u);
    expect(() =>
      materializeCweBench(
        page({
          methodology:
            'Each model gets four rollouts on each of the 250 tasks, at high reasoning. Each rollout has a two-hour limit.',
        }),
        context,
      ),
    ).toThrow(/methodology drift/u);
  });

  it('rejects a displayed score that disagrees with the Combined attribute', () => {
    const bad = row('GPT-6.2 Sol', 'GPT-6.2 Sol', 'Codex', '60.0').replace(
      'data-k="p1">60.0%',
      'data-k="p1">61.0%',
    );
    expect(() =>
      materializeCweBench(page({ rows: [bad] }), {
        ...context,
        visualRowCount: 1,
      }),
    ).toThrow(/inconsistent/u);
  });
});
