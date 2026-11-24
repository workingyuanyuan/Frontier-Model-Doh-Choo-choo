import { describe, expect, it } from 'vitest';
import {
  type CandidateResult,
  type EvidenceRecord,
} from '@llm-bench/benchmark-data';
import { materializeComplexConstraints } from './surge-complex-constraints-materializer.js';
import {
  materializeRiemann,
  riemannIdentity,
} from './surge-riemann-materializer.js';
import {
  latestSurgeEvidence,
  retainSurgeRows,
  surgeBenchmarkVersion,
} from './surge-version.js';

const context = {
  evidenceId: `sha256:${'a'.repeat(64)}`,
  observedAt: '2026-11-02T23:30:00.000Z',
  visualRowCount: 1,
};
const html = (title: string) =>
  `<h1>${title}</h1><section class="lead-main"><div data-leaderboard-table=""><div data-leaderboard-row=""><div><div class="head-rank-table-brand">GPT</div></div><div><div class="head-rank-table-name">6 Astra (Max reasoning)</div></div><div data-score="70.8">70.8</div></div></div></section>`;
const old = () =>
  materializeComplexConstraints(html('ComplexConstraints'), context)
    .candidates[0]!;
const record = { id: context.evidenceId } as EvidenceRecord;
// A synthetic resolver that keeps the stored identity, independent of models.json.
const keepIdentity = ({ model, profile }: CandidateResult) => ({
  ...model,
  effort: profile.effort,
});

describe('Surge version revisions', () => {
  it('replays the latest page when historical row evidence shares its URL', () => {
    const previous = {
      ...record,
      requestUrl: 'https://example.org/board',
      retrievedAt: '2026-11-01T00:00:00.000Z',
    };
    const current = {
      ...previous,
      id: `sha256:${'b'.repeat(64)}`,
      retrievedAt: '2026-11-02T00:00:00.000Z',
    };
    expect(latestSurgeEvidence([previous, current], previous.requestUrl)).toBe(
      current,
    );
    expect(latestSurgeEvidence([current, previous], previous.requestUrl)).toBe(
      current,
    );
    expect(() => latestSurgeEvidence([], previous.requestUrl)).toThrow(
      'Missing Surge evidence',
    );
  });
  it.each([
    ['ComplexConstraints', materializeComplexConstraints],
    ['Riemann-bench', materializeRiemann],
  ] as const)(
    'records %s version from official inline markup and rendered headings',
    (title, materialize) => {
      for (const page of [
        html(title) +
          `<script>h1.appendChild(el('<span class="v2-chip">v1.1</span>'));</script>`,
        html(`${title}<span class="v2-chip">v1.1</span>`),
      ]) {
        const result = materialize(page, context);
        expect(result.benchmarkVersion).toBe('v1.1');
        expect(result.candidates[0]).toMatchObject({
          benchmarkVersion: 'v1.1',
          provenance: { benchmarkVersion: { evidenceId: context.evidenceId } },
        });
      }
      expect(materialize(html(title), context).benchmarkVersion).toBeNull();
    },
  );

  it('rejects conflicting official version chips', () => {
    expect(() =>
      surgeBenchmarkVersion(
        '<span class="v2-chip">v1.1</span><span class="v2-chip">v1.2</span>',
      ),
    ).toThrow('Conflicting');
  });

  it('keeps omitted rows and their original evidence while accepting a lower current score', () => {
    const prior = old();
    const omitted = {
      ...prior,
      id: 'omitted',
      model: {
        rawName: 'Unknown variant',
        canonicalModelId: null,
        profileId: null,
      },
    };
    const current = {
      ...prior,
      id: 'renamed',
      benchmarkVersion: 'v1.1',
      rawScore: 60,
      normalizedScore: 60,
    };
    const result = retainSurgeRows(
      [current],
      [prior, omitted],
      [record],
      keepIdentity,
    );
    expect(result.retained).toEqual([omitted]);
    expect(result.candidates).toEqual([omitted, current]);
    expect(
      result.candidates.find((row) => row.id === 'renamed')?.rawScore,
    ).toBe(60);
    expect(result.evidence).toEqual([record]);
    expect(result.retained[0]?.benchmarkVersion).toBeNull();
    expect(() =>
      retainSurgeRows([current], [omitted], [], keepIdentity),
    ).toThrow('Missing retained Surge evidence');
  });

  it('does not merge unknown identities or unspecified effort by name similarity', () => {
    const prior = {
      ...old(),
      id: 'previous',
      profile: { ...old().profile, effort: null },
    };
    const current = { ...prior, id: 'current' };
    expect(
      retainSurgeRows([current], [prior], [record], keepIdentity).retained,
    ).toEqual([prior]);
  });

  it('re-resolves preserved rows against the current catalog before superseding them', () => {
    const base = old();
    const at = (id: string, rawName: string, effort: string | null) => ({
      ...base,
      id,
      model: { rawName, canonicalModelId: null, profileId: null },
      profile: { ...base.profile, effort },
    });
    // Captured before the catalog knew either model.
    const registered = at('registered', 'Model A (Max reasoning)', 'max');
    const duplicate = at('duplicate', 'Model B (Max reasoning)', 'max');
    const current = {
      ...base,
      id: 'current',
      model: {
        rawName: 'Model B v2 (Max reasoning)',
        canonicalModelId: 'model-b',
        profileId: 'model-b-max',
      },
      profile: { ...base.profile, effort: 'max' },
    };
    const catalog: Record<string, string> = {
      'Model A (Max reasoning)': 'model-a',
      'Model B (Max reasoning)': 'model-b',
    };
    const result = retainSurgeRows(
      [current],
      [registered, duplicate],
      [record],
      ({ model, profile }) => {
        const canonicalModelId = catalog[model.rawName] ?? null;
        return {
          canonicalModelId,
          profileId:
            canonicalModelId && `${canonicalModelId}-${profile.effort}`,
          effort: profile.effort,
        };
      },
    );
    // Score, version, time and Evidence stay; only the identity moves.
    expect(result.retained).toEqual([
      {
        ...registered,
        model: {
          ...registered.model,
          canonicalModelId: 'model-a',
          profileId: 'model-a-max',
        },
      },
    ]);
    expect(result.reresolved).toEqual([
      'registered: unresolved -> model-a, profile null -> model-a-max',
    ]);
  });

  it("re-derives a preserved row's effort from its name with the production resolver", () => {
    const base = old();
    // Captured under an older configuration rule that left effort null.
    const stale = {
      ...base,
      id: 'stale',
      model: {
        rawName: 'Synthetic Unlisted Model (High reasoning)',
        canonicalModelId: null,
        profileId: null,
      },
      profile: { ...base.profile, effort: null },
    };
    const [retained] = retainSurgeRows(
      [],
      [stale],
      [record],
      riemannIdentity,
    ).retained;
    expect(retained).toEqual({
      ...stale,
      profile: { ...stale.profile, effort: 'high' },
    });
  });
});
