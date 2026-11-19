import { type CandidateResult } from '@llm-bench/benchmark-data';
import { describe, expect, it } from 'vitest';

import {
  auditVendorReleases,
  REVIEWED_CURSORBENCH_CAPTURE_ID,
  verifyReviewedCursorCapture,
} from './vendor-release-audit.js';

const evidenceId = `sha256:${'a'.repeat(64)}`;
const cursorHtml =
  '<h1>CursorBench 4.0</h1><section class="chart" aria-label="CursorBench 4.0 results">' +
  ['Opus 5.5', 'Fable 5.1', 'Opus 5']
    .flatMap((model) =>
      ['Low', 'Medium', 'High', 'Extra High', 'Max'].map(
        (effort) => `<div aria-label="${model} ${effort}: 50%, cost"></div>`,
      ),
    )
    .join('') +
  '</section>';

function candidate(overrides: Partial<CandidateResult> = {}): CandidateResult {
  return {
    schemaVersion: 'candidate-result-v1',
    id: 'vendor-row',
    sourceId: 'openai-releases',
    sourceRole: 'VENDOR',
    benchmarkId: 'deepswe-1-1',
    benchmarkVersion: '1.1',
    model: {
      rawName: 'GPT-6 Astra',
      canonicalModelId: 'openai-gpt-6-astra',
      profileId: 'openai-gpt-6-astra-low',
    },
    profile: {
      effort: 'low',
      thinking: null,
      tools: null,
      harness: null,
      contextWindowTokens: null,
      quantization: null,
      attempts: null,
    },
    metric: {
      id: 'pass-at-1',
      name: 'Pass@1',
      unit: 'percent',
      higherIsBetter: true,
    },
    rawScore: 70,
    normalizedScore: 70,
    acquisitionStatus: 'PARTIAL_SOURCE',
    inclusion: 'INCLUDED',
    exclusionReason: null,
    sourceUrl: 'https://example.test/vendor',
    observedAt: '2026-10-02T00:00:00.000Z',
    sourcePublishedAt: null,
    evidenceIds: [evidenceId],
    provenance: {},
    ...overrides,
  };
}

function reference(overrides: Partial<CandidateResult> = {}): CandidateResult {
  return candidate({
    id: 'organizer-row',
    sourceId: 'deepswe',
    sourceRole: 'ORGANIZER',
    acquisitionStatus: 'FULL',
    sourceUrl: 'https://example.test/organizer',
    ...overrides,
  });
}

describe('vendor release organizer audit', () => {
  it.each([
    ['deepswe-1-1', 0.005],
    ['automationbench', 0.05],
    ['frontiercode-main', 0.000001],
  ])(
    'accepts the published rounding boundary for %s',
    (benchmarkId, difference) => {
      const vendor = candidate({ benchmarkId });
      const organizer = reference({
        benchmarkId,
        normalizedScore: 70 + Number(difference),
      });
      expect(auditVendorReleases([vendor], [organizer], cursorHtml)).toEqual([
        expect.objectContaining({
          status: 'MATCH',
          vendorScore: 70,
          referenceScore: organizer.normalizedScore,
          referenceUrl: organizer.sourceUrl,
        }),
      ]);
    },
  );

  it.each([
    ['deepswe-1-1', 0.0051],
    ['automationbench', 0.0501],
    ['frontiercode-main', 0.00001],
  ])(
    'rejects scores outside rounding tolerance for %s',
    (benchmarkId, difference) => {
      expect(() =>
        auditVendorReleases(
          [candidate({ benchmarkId })],
          [
            reference({
              benchmarkId,
              normalizedScore: 70 + Number(difference),
            }),
          ],
          cursorHtml,
        ),
      ).toThrow('Vendor/organizer mismatch');
    },
  );

  it('retains supplements and excluded rows alongside a verified anchor', () => {
    const supplemental = candidate({
      id: 'preview',
      model: {
        rawName: 'GPT-6 Sol',
        canonicalModelId: 'openai-gpt-6-sol',
        profileId: 'openai-gpt-6-sol-low',
      },
    });
    const excluded = candidate({
      id: 'fallback',
      inclusion: 'EXCLUDED',
      exclusionReason: 'Multi-model fallback',
      model: {
        rawName: 'Opus with fallback',
        canonicalModelId: null,
        profileId: null,
      },
    });
    expect(
      auditVendorReleases(
        [candidate(), supplemental, excluded],
        [reference()],
        cursorHtml,
      ).map(({ status }) => status),
    ).toEqual(['MATCH', 'SUPPLEMENT', 'EXCLUDED']);
  });

  it.each(['absent', 'version', 'metric', 'role', 'effort', 'excluded'])(
    'requires a matching organizer anchor when the reference is %s',
    (kind) => {
      const organizer = reference();
      if (kind === 'version') organizer.benchmarkVersion = '1.2';
      if (kind === 'metric') organizer.metric.id = 'pass-at-4';
      if (kind === 'role') organizer.sourceRole = 'INDEPENDENT';
      if (kind === 'effort') organizer.profile.effort = 'high';
      if (kind === 'excluded') {
        organizer.inclusion = 'EXCLUDED';
        organizer.exclusionReason = 'Unresolved configuration';
      }
      expect(() =>
        auditVendorReleases(
          [candidate()],
          kind === 'absent' ? [] : [organizer],
          cursorHtml,
        ),
      ).toThrow('No organizer anchor for deepswe-1-1');
    },
  );

  it('rejects ambiguous organizer configurations', () => {
    expect(() =>
      auditVendorReleases(
        [candidate()],
        [reference(), reference({ id: 'second-config' })],
        cursorHtml,
      ),
    ).toThrow('Ambiguous organizer configuration');
  });

  it('matches explicit Cursor model/effort labels against the organizer chart', () => {
    const vendor = candidate({
      benchmarkId: 'cursorbench-4',
      metric: {
        id: 'accuracy',
        name: 'Accuracy',
        unit: 'percent',
        higherIsBetter: true,
      },
      benchmarkVersion: '4.0',
      normalizedScore: 50,
      model: {
        rawName: 'Claude Opus 5.5',
        canonicalModelId: 'anthropic-claude-opus-5-5',
        profileId: 'anthropic-claude-opus-5-5-low',
      },
    });
    expect(auditVendorReleases([vendor], [], cursorHtml)).toEqual([
      expect.objectContaining({
        status: 'MATCH',
        referenceScore: 50,
        referenceUrl: 'https://prod.cursor.com/evals',
      }),
    ]);
  });

  it('rejects conflicting Cursor rows for the same model/effort', () => {
    const conflicting = cursorHtml.replace(
      '</section>',
      '<div aria-label="Opus 5.5 Low: 51%, cost"></div></section>',
    );
    expect(() =>
      auditVendorReleases([candidate()], [reference()], conflicting),
    ).toThrow('Conflicting Cursor reference');
  });

  it('accepts repeated matching Cursor labels', () => {
    const duplicate = cursorHtml.replace(
      '</section>',
      '<div aria-label="Opus 5.5 Low: 50%, cost"></div></section>',
    );
    expect(
      auditVendorReleases([candidate()], [reference()], duplicate)[0]!.status,
    ).toBe('MATCH');
  });

  it('rejects a chart on a newer release even when the changelog still names 4.0', () => {
    const newer =
      cursorHtml.replaceAll('CursorBench 4.0', 'CursorBench 4.1') +
      '<ul><li>CursorBench 4.0<ul><li>Introduced new problems.</li></ul></li></ul>';
    expect(() =>
      auditVendorReleases([candidate()], [reference()], newer),
    ).toThrow('Cursor reference shows CursorBench 4.1');
  });

  it.each([
    cursorHtml.replaceAll('CursorBench 4.0', 'CursorBench 3.0'),
    cursorHtml.replace(' aria-label="CursorBench 4.0 results"', ''),
    cursorHtml.replace('aria-label="Opus 5.5 Low:', 'aria-label="Unknown Low:'),
  ])('rejects a missing reviewed Cursor reference', (html) => {
    expect(() =>
      auditVendorReleases([candidate()], [reference()], html),
    ).toThrow(/Cursor reference/);
  });

  it('reads Cursor scores only from inside the results section', () => {
    const outside =
      '<section aria-label="CursorBench 4.0 results"></section>' +
      cursorHtml.replace(/<section[^>]*>|<\/section>/gu, '');
    expect(() =>
      auditVendorReleases([candidate()], [reference()], outside),
    ).toThrow('missing the reviewed overlap');
  });

  it('rejects CursorBench rows from another release or metric', () => {
    const vendor = candidate({
      benchmarkId: 'cursorbench-4',
      benchmarkVersion: '4.1',
      normalizedScore: 50,
      model: {
        rawName: 'Claude Opus 5.5',
        canonicalModelId: 'anthropic-claude-opus-5-5',
        profileId: 'anthropic-claude-opus-5-5-low',
      },
    });
    expect(() => auditVendorReleases([vendor], [], cursorHtml)).toThrow(
      'not the reviewed 4.0/accuracy chart',
    );
  });

  it('accepts only the pinned reviewed capture as the 4.0 fallback', () => {
    const bytes = new TextEncoder().encode(cursorHtml);
    const record = {
      id: REVIEWED_CURSORBENCH_CAPTURE_ID,
      sha256: REVIEWED_CURSORBENCH_CAPTURE_ID,
      byteLength: bytes.byteLength,
    };
    expect(() => verifyReviewedCursorCapture(record, bytes)).toThrow(
      'is not the reviewed CursorBench 4.0 capture',
    );
  });

  it('ignores score labels in comments or other attributes', () => {
    const hidden = cursorHtml
      .replace('results">', 'results"><!--')
      .replace('</section>', '--></section>');
    expect(() =>
      auditVendorReleases([candidate()], [reference()], hidden),
    ).toThrow('missing the reviewed overlap');
    const renamed = cursorHtml.replace(
      /<div aria-label=/gu,
      '<div data-aria-label=',
    );
    expect(() =>
      auditVendorReleases([candidate()], [reference()], renamed),
    ).toThrow('missing the reviewed overlap');
  });
});
