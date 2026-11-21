import { describe, expect, it } from 'vitest';
import { materializeTerminalBench } from './terminal-bench-materializer.js';

const row = (
  id: string,
  model: string,
  modelUrl: string,
  agent: string,
  effort: string,
  successes: number,
) => ({
  id,
  rank: 1,
  status: 'display',
  updated_at: '2026-11-17T17:27:40.25888+00:00',
  metadata: {
    date: '2026-11-17',
    agent_display: { url: 'https://example.com/agent', label: agent },
    model_display: { url: modelUrl, label: model },
    model_org: { url: 'https://example.com', label: 'Org' },
    reasoning_effort: effort,
  },
  metrics: {
    accuracy: Math.round((successes / 330) * 10000) / 100,
    n_trials: 330,
    successes,
    pass_at_5: 0.5,
    accuracy_ci95_half_width: 3,
  },
});

const ROWS = [
  row('a', 'Opus 5.5', 'https://example.com/opus', 'Claude Code', 'max', 165),
  row('b', 'Opus 5.5', 'https://example.com/opus', 'Claude Code', 'high', 150),
  row(
    'c',
    'Sonnet 5',
    'https://www.anthropic.com/news/claude-sonnet-5',
    'Claude Code',
    'max',
    40,
  ),
  row(
    'd',
    'MiniMax M3',
    'https://example.com/m3',
    'mini-swe-agent',
    'none',
    25,
  ),
].map((r, index) => ({ ...r, rank: index + 1 }));

/** Wrap the dehydrated leaderboard query in Next.js flight chunks. */
const page = (rows: unknown[] = ROWS, title = 'Terminal-Bench 4.1') => {
  const flight = `1d:["$","$L1e",null,${JSON.stringify({
    state: {
      queries: [
        {
          state: {
            data: {
              leaderboard: {
                package: 'terminal-bench/terminal-bench',
                name: '4-1-0',
                title,
                updated_at: '2026-11-20T16:07:10.159846+00:00',
                rank_by: [{ accessor: 'metrics.accuracy', direction: 'desc' }],
              },
              rows,
            },
          },
        },
      ],
    },
  })}]`;
  const half = Math.floor(flight.length / 2);
  return [flight.slice(0, half), flight.slice(half)]
    .map(
      (chunk) =>
        `<script>self.__next_f.push([1,${JSON.stringify(chunk)}])</script>`,
    )
    .join('');
};

const context = {
  evidenceId: `sha256:${'d'.repeat(64)}`,
  observedAt: '2026-11-21T00:00:00.000Z',
  visualModelCount: 3,
};

describe('Terminal-Bench materializer', () => {
  it('keeps every effort configuration from the embedded leaderboard query', () => {
    const result = materializeTerminalBench(page(), context);
    expect(result.configurations).toBe(4);
    expect(result.distinctModels).toBe(3);
    expect(
      result.candidates.map((c) => [
        c.model.rawName,
        c.model.canonicalModelId,
        c.profile.effort,
        c.profile.harness,
        c.normalizedScore,
      ]),
    ).toEqual([
      // Source effort none is not a product tier.
      ['MiniMax M3', 'minimax-minimax-m3', null, 'mini-swe-agent', 7.58],
      ['Opus 5.5', 'anthropic-claude-opus-5-5', 'high', 'Claude Code', 45.45],
      ['Opus 5.5', 'anthropic-claude-opus-5-5', 'max', 'Claude Code', 50],
      // Reviewed exact entry backed by the vendor link on the row.
      ['Sonnet 5', 'anthropic-claude-sonnet-5', 'max', 'Claude Code', 12.12],
    ]);
  });

  it('rejects a reviewed short name whose vendor link changed', () => {
    const rows = [
      row(
        'c',
        'Sonnet 5',
        'https://example.com/other',
        'Claude Code',
        'max',
        40,
      ),
    ];
    expect(() =>
      materializeTerminalBench(page(rows), { ...context, visualModelCount: 1 }),
    ).toThrow(/link changed/u);
  });

  it('rejects a resolution rate that disagrees with successes / trials', () => {
    const bad = row('a', 'Opus 5.5', 'u', 'Claude Code', 'max', 165);
    bad.metrics.accuracy = 51;
    expect(() =>
      materializeTerminalBench(page([bad]), {
        ...context,
        visualModelCount: 1,
      }),
    ).toThrow(/Invalid Terminal-Bench row/u);
  });

  it('rejects fractional success counts even when the rate matches', () => {
    const bad = row('a', 'Opus 5.5', 'u', 'Claude Code', 'max', 165);
    bad.metrics.successes = 165.4;
    expect(() =>
      materializeTerminalBench(page([bad]), {
        ...context,
        visualModelCount: 1,
      }),
    ).toThrow(/Invalid Terminal-Bench row/u);
  });

  it('detects a missing interior configuration through competition ranks', () => {
    // Dropping Opus 5.5 high leaves three models but a gap before rank 3.
    expect(() =>
      materializeTerminalBench(page(ROWS.filter((r) => r.id !== 'b')), context),
    ).toThrow(/implies missing rows/u);
  });

  it('rejects another leaderboard version or a rendered count mismatch', () => {
    expect(() =>
      materializeTerminalBench(page(ROWS, 'Terminal-Bench 4.0'), context),
    ).toThrow(/identity drift/u);
    expect(() =>
      materializeTerminalBench(page(), { ...context, visualModelCount: 4 }),
    ).toThrow(/rendered count/u);
  });
});
