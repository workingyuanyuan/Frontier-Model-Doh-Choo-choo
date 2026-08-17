import { describe, expect, it } from 'vitest';

import type {
  CandidateResult,
  EvidenceRecord,
} from '@llm-bench/benchmark-data';

import {
  buildCompletenessReport,
  findMissingEvidenceIds,
  renderCompletenessMarkdown,
} from './index.js';

describe('buildCompletenessReport', () => {
  it('marks a source complete when visible rows and pages reconcile', () => {
    expect(
      buildCompletenessReport({
        sourceId: 'terminal-bench',
        expectedVisibleRows: 18,
        extractedRows: 18,
        candidateRows: 18,
        expectedPages: 1,
        processedPages: 1,
        structuredVisualConflict: false,
      }),
    ).toMatchObject({
      status: 'FULL',
      issues: [],
    });
  });

  it('keeps incomplete sources usable as PARTIAL_SOURCE', () => {
    const report = buildCompletenessReport({
      sourceId: 'livebench',
      expectedVisibleRows: 40,
      extractedRows: 20,
      candidateRows: 20,
      expectedPages: 2,
      processedPages: 1,
      structuredVisualConflict: false,
    });

    expect(report.status).toBe('PARTIAL_SOURCE');
    expect(report.issues.map(({ code }) => code)).toEqual([
      'VISIBLE_ROW_MISMATCH',
      'PAGINATION_INCOMPLETE',
    ]);
  });

  it('requires review when structured data conflicts with the visible page', () => {
    expect(
      buildCompletenessReport({
        sourceId: 'epoch-ai',
        expectedVisibleRows: 12,
        extractedRows: 12,
        candidateRows: 12,
        expectedPages: null,
        processedPages: 1,
        structuredVisualConflict: true,
      }).status,
    ).toBe('REVIEW_REQUIRED');
  });
});

describe('findMissingEvidenceIds', () => {
  it('reports evidence references not present in the source snapshot', () => {
    const present =
      'sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
    const missing =
      'sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';

    expect(
      findMissingEvidenceIds(
        [
          {
            evidenceIds: [present, missing],
          } as CandidateResult,
        ],
        [{ id: present } as EvidenceRecord],
      ),
    ).toEqual([missing]);
  });
});

describe('renderCompletenessMarkdown', () => {
  it('renders counts and issues for human review', () => {
    const markdown = renderCompletenessMarkdown(
      buildCompletenessReport({
        sourceId: 'livebench',
        expectedVisibleRows: null,
        extractedRows: 7,
        candidateRows: 7,
        expectedPages: null,
        processedPages: 1,
        structuredVisualConflict: false,
      }),
    );

    expect(markdown).toContain('# livebench acquisition validation');
    expect(markdown).toContain('| Status | PARTIAL_SOURCE |');
    expect(markdown).toContain('VISIBLE_COUNT_UNKNOWN');
  });
});
