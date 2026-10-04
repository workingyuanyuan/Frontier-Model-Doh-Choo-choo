import { describe, expect, it } from 'vitest';

import { materializeAnthropicRelease } from './vendor-anthropic.js';

const evidenceId = `sha256:${'a'.repeat(64)}`;
const observedAt = '2026-10-02T14:00:00.000Z';

const frontierCodeCsv = `series,x,y,label,labelPlacement
opus55,0.4036,47.3,Low,
opus55,0.8016,54.64,Med,
opus55,1.0896,53.99,High,below
opus55,2.2545,51.42,Xhigh,below
opus55,6.191,54.43,Max,
fable51,2.4665,52.8,Low,hidden
fable51,3.2845,50.91,Med,hidden
fable51,5.2741,50.34,High,hidden
fable51,9.2739,48.73,Xhigh,hidden
fable51,12.8218,50.28,Max,hidden
opus5,2.6415,41.95,Low,hidden
opus5,4.6066,53.38,Med,hidden
opus5,7.615,47.99,High,hidden
opus5,8.9885,43.65,Xhigh,hidden
opus5,12.2814,48.04,Max,hidden
gpt56sol,1.7476,35.44,Low,hidden
gpt56sol,2.4986,39.93,Med,hidden
gpt56sol,3.2488,45.06,High,hidden
gpt56sol,3.8806,46.84,Xhigh,hidden
gpt56sol,4.8477,47.49,Max,hidden
gpt6astra,1.5927,45.27,Low,hidden
gpt6astra,2.2845,48.83,Med,hidden
gpt6astra,2.847,50.94,High,hidden
gpt6astra,3.0961,50.62,Xhigh,hidden
gpt6astra,4.3632,53.26,Max,hidden`;

const cursorBenchCsv = `series,x,y,label,labelPlacement
opus55,1.18,43.7,Low,
opus55,2.9,52.5,Med,below
opus55,3.97,56,High,
opus55,6.99,56,Xhigh,
opus55,13.43,57.8,Max,
fable51,5.44,45.1,Low,hidden
fable51,7.05,46.8,Med,hidden
fable51,9.08,49.2,High,hidden
fable51,13.01,51.6,Xhigh,hidden
fable51,17.28,51.8,Max,hidden
opus5,4.87,40.7,Low,hidden
opus5,6.94,43.3,Med,hidden
opus5,9,44.7,High,hidden
opus5,11.43,46.1,Xhigh,hidden
opus5,11.95,46.6,Max,hidden
gpt56sol,0.87,24.6,Low,hidden
gpt56sol,1.77,31.1,Med,hidden
gpt56sol,2.85,35.7,High,hidden
gpt56sol,4.4,37.7,Xhigh,hidden
gpt56sol,8.23,41.7,Max,hidden`;

const encodeRscChart = (key: string, csv: string): string =>
  `"key":"${key}","data":"${csv.replace(/\r\n?/gu, '\n').replace(/\n/gu, '\\\\n')}${String.fromCharCode(92, 34)},"xAxis":{"label":"Cost per task (USD, log scale)"},`;

const page = (
  options: {
    frontierCode?: string | null;
    cursorBench?: string | null;
  } = {},
): string =>
  [
    '<h1>Claude Opus 5.5</h1>',
    '<time>September 22, 2026</time>',
    '<h2>FrontierCode v1.1 (Main)</h2>',
    '<h2>CursorBench 4.0</h2>',
    options.frontierCode === null
      ? ''
      : encodeRscChart(
          'tuskchartfrontiercode',
          options.frontierCode ?? frontierCodeCsv,
        ),
    options.cursorBench === null
      ? ''
      : encodeRscChart(
          'tuskchartcursorbench',
          options.cursorBench ?? cursorBenchCsv,
        ),
  ].join('\n');

const materialize = (html: string) =>
  materializeAnthropicRelease(html, { evidenceId, observedAt });

const findCandidate = (
  result: ReturnType<typeof materialize>,
  benchmarkId: string,
  rawName: string,
  effort: string,
) =>
  result.candidates.find(
    (candidate) =>
      candidate.benchmarkId === benchmarkId &&
      candidate.model.rawName === rawName &&
      candidate.profile.effort === effort,
  );

describe('Anthropic release-page materializer', () => {
  it('materializes USD task costs with matching effort, version, evidence, and exclusions', () => {
    const result = materialize(page());
    expect(result.costs).toHaveLength(45);
    expect(
      result.costs.find(({ id }) =>
        id.endsWith('cursorbench-4:opus55-medium:cost'),
      ),
    ).toMatchObject({
      sourceId: 'anthropic-releases',
      benchmarkId: 'cursorbench-4',
      benchmarkVersion: '4.0',
      profile: { effort: 'medium', harness: null },
      cost: 2.9,
      unit: 'USD_PER_TASK',
      costType: 'AGENT_TASK',
      evidenceIds: [evidenceId],
      observedAt,
    });
    expect(
      result.costs.filter(({ inclusion }) => inclusion === 'EXCLUDED'),
    ).toHaveLength(1);
    expect(
      result.costs.find(({ inclusion }) => inclusion === 'EXCLUDED'),
    ).toMatchObject({
      cost: 2.4665,
      exclusionReason: expect.stringContaining('49.82%'),
    });
    expect(result.costs[0]?.provenance.unit?.locator).toContain('USD');
    expect(() =>
      materialize(
        page().replaceAll(
          'Cost per task (USD, log scale)',
          'Cost per task (EUR)',
        ),
      ),
    ).toThrow('cost unit drift');
  });
  it('parses the two selected RSC curves and retains all explicit effort rows', () => {
    const result = materialize(page());

    expect(result.chartCounts).toEqual({
      tuskchartfrontiercode: 25,
      tuskchartcursorbench: 20,
    });
    expect(result.candidates).toHaveLength(45);
    expect(
      findCandidate(result, 'frontier-code-1-1', 'Claude Opus 5.5', 'medium'),
    ).toMatchObject({
      model: {
        canonicalModelId: 'anthropic-claude-opus-5-5',
        profileId: 'anthropic-claude-opus-5-5-medium',
      },
      profile: { effort: 'medium', harness: null },
      metric: { id: 'weighted-rubric-score', unit: 'percent' },
      rawScore: 54.64,
      normalizedScore: 54.64,
      sourceRole: 'VENDOR',
      acquisitionStatus: 'PARTIAL_SOURCE',
    });
    expect(
      findCandidate(result, 'frontier-code-1-1', 'GPT-6 Astra', 'max'),
    ).toMatchObject({ rawScore: 53.26, profile: { harness: null } });
    expect(
      findCandidate(result, 'cursorbench-4', 'Claude Opus 5.5', 'max'),
    ).toMatchObject({
      benchmarkVersion: '4.0',
      metric: { id: 'accuracy', unit: 'percent' },
      rawScore: 57.8,
      normalizedScore: 57.8,
      sourcePublishedAt: '2026-09-22T00:00:00.000Z',
    });
    expect(result.validationReport).toContain(
      'separate organizer results remain separate evidence',
    );
    expect(
      findCandidate(result, 'cursorbench-4', 'Claude Opus 5.5', 'medium')
        ?.provenance.rawScore?.locator,
    ).toContain('effort label');
  });

  it('preserves but excludes only the reviewed FrontierCode disagreement', () => {
    const result = materialize(page());
    const conflict = findCandidate(
      result,
      'frontier-code-1-1',
      'Claude Fable 5.1',
      'low',
    );

    expect(result.candidates).toHaveLength(45);
    expect(
      result.candidates.filter(({ inclusion }) => inclusion === 'INCLUDED'),
    ).toHaveLength(44);
    expect(
      result.candidates.filter(({ inclusion }) => inclusion === 'EXCLUDED'),
    ).toHaveLength(1);
    expect(conflict).toMatchObject({
      rawScore: 52.8,
      normalizedScore: 52.8,
      inclusion: 'EXCLUDED',
      exclusionReason: expect.stringContaining('49.82%'),
    });
    expect(conflict?.exclusionReason).toContain(
      'https://cognition.com/frontiercode',
    );
    expect(result.validationReport).toContain(
      'preserved at 52.8% but excluded',
    );

    const changedScore = frontierCodeCsv.replace(
      'fable51,2.4665,52.8,Low',
      'fable51,2.4665,52.79,Low',
    );
    expect(() => materialize(page({ frontierCode: changedScore }))).toThrow(
      'Reviewed Anthropic FrontierCode conflict row changed',
    );
  });

  it('rejects unknown model series and effort labels instead of guessing', () => {
    const unknownModel = `${frontierCodeCsv}\nmystery,1,22,Low,hidden`;
    expect(() => materialize(page({ frontierCode: unknownModel }))).toThrow(
      'Unknown model series',
    );

    const unknownEffort = frontierCodeCsv.replace(
      'opus55,0.4036,47.3,Low,',
      'opus55,0.4036,47.3,Turbo,',
    );
    expect(() => materialize(page({ frontierCode: unknownEffort }))).toThrow(
      'Unknown effort label',
    );
  });

  it('rejects duplicates, out-of-range scores, and blank scores rather than zero-filling', () => {
    const duplicate = `${frontierCodeCsv}\nopus55,0.4036,47.3,Low,`;
    expect(() => materialize(page({ frontierCode: duplicate }))).toThrow(
      'Duplicate model/effort row',
    );

    const outsideRange = frontierCodeCsv.replace(
      '0.4036,47.3,Low',
      '0.4036,100.1,Low',
    );
    expect(() => materialize(page({ frontierCode: outsideRange }))).toThrow(
      'score must be between 0 and 100',
    );

    const blankScore = frontierCodeCsv.replace(
      '0.4036,47.3,Low',
      '0.4036,,Low',
    );
    expect(() => materialize(page({ frontierCode: blankScore }))).toThrow(
      'missing or invalid score; blanks are not zero',
    );
  });

  it('requires the expected chart keys, benchmark versions, and full row coverage', () => {
    expect(() => materialize(page({ frontierCode: null }))).toThrow(
      'Expected exactly one Anthropic release chart key tuskchartfrontiercode',
    );

    expect(() =>
      materialize(
        page().replace('FrontierCode v1.1 (Main)', 'FrontierCode v1.2 (Main)'),
      ),
    ).toThrow('missing benchmark/version marker');

    const missingEffort = frontierCodeCsv.replace(
      'opus55,0.4036,47.3,Low,\n',
      '',
    );
    expect(() => materialize(page({ frontierCode: missingEffort }))).toThrow(
      'missing expected model/effort rows',
    );
  });
});
