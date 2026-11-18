import { describe, expect, it } from 'vitest';

import {
  ALE_MULTIPLE_HARNESS_REASON,
  aleApiUrl,
  extractAleLeaderboardBundleUrls,
  materializeAle,
  parseAlePageVersion,
} from './ale-materializer.js';

// Synthetic board: names resolve through the catalog, numbers are invented.
interface SyntheticRow {
  harness: string;
  model: string;
  harnessVariant: string;
  linux: { tasks: number; passes: number };
  windows: { tasks: number; passes: number };
  avgScore: number;
  totalCostUsd: number;
}

const LINUX_TASKS = 6;
const WINDOWS_TASKS = 4;

const boardRow = (
  row: SyntheticRow,
  tasks: number,
  passes: number,
  splitTasks: number,
  totalCostUsd: number,
) => ({
  split: 'v9.9',
  harness: row.harness,
  model: row.model,
  harnessVariant: row.harnessVariant,
  runs: tasks,
  tasks,
  splitTasks,
  passes,
  passRate: passes / tasks,
  avgScore: row.avgScore,
  totalDurationS: 10,
  totalInputTokens: null,
  totalOutputTokens: 100,
  totalCostUsd,
  costSource: 'list',
});

const payload = (rows: SyntheticRow[]) => ({
  rows: rows.map((row) =>
    boardRow(
      row,
      row.linux.tasks + row.windows.tasks,
      row.linux.passes + row.windows.passes,
      LINUX_TASKS + WINDOWS_TASKS,
      row.totalCostUsd,
    ),
  ),
  platforms: {
    linux: {
      taskCount: LINUX_TASKS,
      rows: rows.map((row) =>
        boardRow(
          row,
          row.linux.tasks,
          row.linux.passes,
          LINUX_TASKS,
          row.totalCostUsd * 0.75,
        ),
      ),
    },
    windows: {
      taskCount: WINDOWS_TASKS,
      rows: rows.map((row) =>
        boardRow(
          row,
          row.windows.tasks,
          row.windows.passes,
          WINDOWS_TASKS,
          row.totalCostUsd * 0.25,
        ),
      ),
    },
  },
  costRatesAsOf: '2099-01-01',
  resultsUpdatedAt: '2099-01-02T00:00:00Z',
  benchmarkReference: {
    repository: 'https://example.com/ale',
    commit: 'abc123',
    committedAt: '2099-01-01T00:00:00Z',
  },
});

const full = {
  linux: { tasks: 6, passes: 3 },
  windows: { tasks: 4, passes: 1 },
};
const row = (overrides: Partial<SyntheticRow>): SyntheticRow => ({
  harness: 'codex',
  model: 'gpt-5.6-sol',
  harnessVariant: 'reasoning-high',
  ...full,
  avgScore: 0.5,
  totalCostUsd: 20,
  ...overrides,
});

const context = {
  apiEvidenceId: `sha256:${'a'.repeat(64)}`,
  pageEvidenceId: `sha256:${'b'.repeat(64)}`,
  apiUrl: aleApiUrl('9.9'),
  observedAt: '2099-01-03T00:00:00.000Z',
  version: '9.9',
};

const run = (rows: SyntheticRow[]) =>
  materializeAle(JSON.stringify(payload(rows)), context);

const candidateFor = (
  result: ReturnType<typeof run>,
  model: string,
  variant: string,
  harness = 'codex',
) =>
  result.candidates.find(
    (candidate) =>
      candidate.model.rawName === model &&
      candidate.profile.harness === harness &&
      candidate.id.includes(variant.replace(/[^a-z0-9]+/gu, '-')),
  )!;

describe("Agents' Last Exam page contract", () => {
  it('reads one version from the header and the leaderboard prop', () => {
    const html =
      '<p class="eyebrow">ALE v9.9</p><script>self.__next_f.push([1,"{\\"version\\":\\"v9.9\\"}"])</script>';
    expect(parseAlePageVersion(html)).toBe('9.9');
    expect(() =>
      parseAlePageVersion(html.replace('\\"v9.9\\"', '\\"v9.8\\"')),
    ).toThrow(/several versions/);
    expect(() => parseAlePageVersion('<p>Leaderboard</p>')).toThrow();
  });

  it('discovers the leaderboard bundle from the HTML', () => {
    expect(
      extractAleLeaderboardBundleUrls(
        '<script src="/_next/static/chunks/app/leaderboard/page-x1.js"></script><script src="/_next/static/chunks/main-y.js"></script>',
      ),
    ).toEqual([
      'https://agents-last-exam.org/_next/static/chunks/app/leaderboard/page-x1.js',
    ]);
  });
});

describe("Agents' Last Exam materializer", () => {
  it('scales avgScore to percent and divides total cost by tasks', () => {
    const result = run([row({ avgScore: 0.625, totalCostUsd: 25 })]);
    const [candidate] = result.candidates;
    expect(candidate).toMatchObject({
      benchmarkId: 'agents-last-exam',
      benchmarkVersion: '9.9',
      sourceRole: 'ORGANIZER',
      inclusion: 'INCLUDED',
      metric: { id: 'average-score', unit: 'percent', higherIsBetter: true },
      model: { profileId: 'openai-gpt-5-6-sol-high' },
      profile: { effort: 'high', harness: 'codex' },
    });
    expect(candidate!.normalizedScore).toBeCloseTo(62.5, 10);
    expect(candidate!.provenance.passRate?.locator).toMatch(/diagnostic/);
    const [cost] = result.costs;
    expect(cost).toMatchObject({
      costType: 'AGENT_TASK',
      unit: 'USD_PER_TASK',
      inclusion: 'INCLUDED',
    });
    expect(cost!.cost).toBeCloseTo(25 / 10, 10);
  });

  it('includes and discloses rows that cover fewer tasks than the split', () => {
    const result = run([
      row({
        linux: { tasks: 5, passes: 2 },
        windows: { tasks: 3, passes: 1 },
        totalCostUsd: 16,
      }),
    ]);
    const [candidate] = result.candidates;
    expect(candidate!.inclusion).toBe('INCLUDED');
    expect(candidate!.provenance.rawScore?.locator).toMatch(
      /partial coverage: 8 of 10 tasks/,
    );
    expect(result.costs[0]!.cost).toBeCloseTo(2, 10);
    expect(result.partialCoverageRows).toHaveLength(1);
    expect(result.validationReport).toMatch(
      /## Partial-coverage rows[\s\S]*gpt-5\.6-sol \/ codex \/ reasoning-high: 8 of 10 tasks/,
    );
  });

  it('treats reasoning-none as non-reasoning, even as the only row', () => {
    const result = run([
      row({ harnessVariant: 'reasoning-none' }),
      row({ harnessVariant: 'reasoning-low' }),
      row({ model: 'gpt-5.6-luna', harnessVariant: 'reasoning-none' }),
    ]);
    const ladder = candidateFor(result, 'gpt-5.6-sol', 'reasoning-none');
    expect(ladder.profile.effort).toBe('non-reasoning');
    expect(ladder.model.profileId).toBe('openai-gpt-5-6-sol-non-reasoning');
    const single = candidateFor(result, 'gpt-5.6-luna', 'reasoning-none');
    expect(single.profile.effort).toBe('non-reasoning');
    expect(single.model.profileId).toBe('openai-gpt-5-6-luna-non-reasoning');
    expect(single.inclusion).toBe('INCLUDED');
  });

  it('excludes unrecognised harness variants row by row', () => {
    const result = run([
      row({ harnessVariant: 'reasoning-turbo' }),
      row({ harnessVariant: 'reasoning-high' }),
    ]);
    expect(
      candidateFor(result, 'gpt-5.6-sol', 'reasoning-turbo').exclusionReason,
    ).toMatch(/Unrecognised harness variant/);
    expect(
      candidateFor(result, 'gpt-5.6-sol', 'reasoning-high').inclusion,
    ).toBe('INCLUDED');
  });

  it('excludes every harness that publishes the same canonical profile', () => {
    const result = run([
      row({ harness: 'codex' }),
      row({ harness: 'other_cli' }),
      row({ harnessVariant: 'reasoning-max' }),
    ]);
    const duplicated = result.candidates.filter(
      ({ profile }) => profile.effort === 'high',
    );
    expect(duplicated).toHaveLength(2);
    for (const candidate of duplicated) {
      expect(candidate.inclusion).toBe('EXCLUDED');
      expect(candidate.exclusionReason).toBe(ALE_MULTIPLE_HARNESS_REASON);
    }
    expect(
      result.costs
        .filter(({ profile }) => profile.effort === 'high')
        .every(({ inclusion }) => inclusion === 'EXCLUDED'),
    ).toBe(true);
    expect(candidateFor(result, 'gpt-5.6-sol', 'reasoning-max').inclusion).toBe(
      'INCLUDED',
    );
  });

  it('fails closed when platform rows do not add up to the overall row', () => {
    const board = payload([row({})]);
    board.platforms.windows.rows[0]!.passes = 2;
    expect(() => materializeAle(JSON.stringify(board), context)).toThrow(
      /platform cross-check failed/,
    );
  });

  it('fails closed when platform costs do not add up to the overall cost', () => {
    const board = payload([row({})]);
    board.rows[0]!.totalCostUsd += 1000;
    expect(() => materializeAle(JSON.stringify(board), context)).toThrow(
      /platform cost cross-check failed/,
    );
    const rounded = payload([row({})]);
    rounded.rows[0]!.totalCostUsd += 0.01;
    expect(() =>
      materializeAle(JSON.stringify(rounded), context),
    ).not.toThrow();
  });

  it('fails closed on a platform task count that is not a positive integer', () => {
    const board = payload([row({})]);
    board.platforms.linux.taskCount = 11;
    board.platforms.windows.taskCount = -1;
    expect(() => materializeAle(JSON.stringify(board), context)).toThrow(
      /taskCount -1 is not a positive integer/,
    );
  });

  it('fails closed when two harness names produce the same record id', () => {
    expect(() =>
      run([row({ harness: 'claude_code' }), row({ harness: 'claude-code' })]),
    ).toThrow(/duplicate record id/);
  });

  it('fails closed on runs != tasks, missing fields and a version mismatch', () => {
    const runs = payload([row({})]);
    runs.rows[0]!.runs = 9;
    expect(() => materializeAle(JSON.stringify(runs), context)).toThrow(
      /runs 9 != tasks 10/,
    );
    const missing = payload([row({})]) as { rows: Record<string, unknown>[] };
    delete missing.rows[0]!.avgScore;
    expect(() => materializeAle(JSON.stringify(missing), context)).toThrow(
      /avgScore/,
    );
    expect(() =>
      materializeAle(JSON.stringify(payload([row({})])), {
        ...context,
        version: '9.8',
      }),
    ).toThrow(/does not match the page version/);
  });
});
