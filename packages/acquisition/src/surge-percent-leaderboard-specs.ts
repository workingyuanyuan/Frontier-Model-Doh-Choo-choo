import type { SurgePercentLeaderboardSpec } from './surge-percent-leaderboard.js';

/**
 * Surge leaderboards that publish one percentage per row in the shared
 * `.lead-main [data-leaderboard-row]` layout. Adding one means adding an entry
 * here; parsing, validation and refresh are shared.
 */
export const SURGE_PERCENT_LEADERBOARDS = {
  'surge-dayjob-finance': {
    sourceId: 'surge-dayjob-finance',
    benchmarkId: 'dayjob-finance',
    pageUrl: 'https://surgehq.ai/benchmarks/dayjob-finance',
    pageTitle: 'DAYJOB: Finance',
    label: 'DAYJOB Finance',
    displayName: 'Surge AI DAYJOB Finance',
    attempts: 5,
    metric: {
      id: 'mean-reward',
      name: 'Mean reward',
    },
    scoreSummary: 'mean reward percentages (0–100)',
    reportParagraphs: [
      'The official DAYJOB repository defines a trial reward on 0–1, each task score as the mean reward over five attempts excluding errored trials, and the domain score as the unweighted mean of task scores. The main leaderboard displays that domain score as a percentage. The repository explicitly identifies five attempts per task for leaderboard runs, so attempts is 5.',
      'The official blog describes long-horizon finance work spanning corporate finance, banking, credit, investing, and real assets, assessed with task-specific rubrics. The public repository documents a Harbor adapter and OpenHands SDK agent harness, with Claude Opus 4.8 grading. These published general descriptions do not establish exact tools or harness metadata for each current row, so those profile fields remain null. Benchmark version, context windows and leaderboard publication dates are unpublished and remain null.',
      '- Methodology: <https://surgehq.ai/blog/dayjob> and <https://github.com/surge-ai/dayjob#grading>. The blog publication date is not the leaderboard publication date.',
    ],
    manifestNotes: [
      'Main leaderboard domain mean reward percentages. Finance tasks span corporate finance, banking, credit, investing, and real assets.',
      'Official methodology: https://surgehq.ai/blog/dayjob and https://github.com/surge-ai/dayjob#grading. Domain score is the unweighted mean of task scores, each averaging five trial rewards excluding errored trials. The README explicitly identifies five attempts per task for leaderboard runs.',
      'Published harness uses Harbor and OpenHands SDK, with Claude Opus 4.8 grading; exact current per-row tools and harness remain unconfirmed and null. Benchmark version and leaderboard publication date are unpublished.',
    ],
  },
  'surge-dayjob-healthcare': {
    sourceId: 'surge-dayjob-healthcare',
    benchmarkId: 'dayjob-healthcare',
    pageUrl: 'https://surgehq.ai/benchmarks/dayjob-healthcare',
    pageTitle: 'DAYJOB: Healthcare',
    label: 'DAYJOB Healthcare',
    displayName: 'Surge AI DAYJOB Healthcare',
    attempts: 5,
    metric: {
      id: 'mean-reward',
      name: 'Mean reward',
    },
    scoreSummary: 'mean reward percentages (0–100)',
    reportParagraphs: [
      'The official DAYJOB repository defines a trial reward on 0–1, each task score as the mean reward over five attempts excluding errored trials, and the domain score as the unweighted mean of task scores. The main leaderboard displays that domain score as a percentage. The repository explicitly identifies five attempts per task for leaderboard runs, so attempts is 5.',
      'The official DAYJOB repository publishes the Healthcare domain tasks and documents task-specific grading. The public repository documents a Harbor adapter and OpenHands SDK agent harness, with Claude Opus 4.8 grading. These published general descriptions do not establish exact tools or harness metadata for each current row, so those profile fields remain null. Benchmark version, context windows and leaderboard publication dates are unpublished and remain null.',
      '- Methodology: <https://surgehq.ai/blog/dayjob> and <https://github.com/surge-ai/dayjob#grading>. The blog publication date is not the leaderboard publication date.',
    ],
    manifestNotes: [
      'Main leaderboard domain mean reward percentages. Healthcare tasks are published in the official DAYJOB repository.',
      'Official methodology: https://surgehq.ai/blog/dayjob and https://github.com/surge-ai/dayjob#grading. Domain score is the unweighted mean of task scores, each averaging five trial rewards excluding errored trials. The README explicitly identifies five attempts per task for leaderboard runs.',
      'Published harness uses Harbor and OpenHands SDK, with Claude Opus 4.8 grading; exact current per-row tools and harness remain unconfirmed and null. Benchmark version and leaderboard publication date are unpublished.',
    ],
  },
  'surge-dayjob-tax': {
    sourceId: 'surge-dayjob-tax',
    benchmarkId: 'dayjob-tax',
    pageUrl: 'https://surgehq.ai/benchmarks/dayjob-tax',
    pageTitle: 'DAYJOB: Tax',
    label: 'DAYJOB Tax',
    displayName: 'Surge AI DAYJOB Tax',
    attempts: 5,
    metric: {
      id: 'pass-at-1',
      name: 'Pass@1',
    },
    scoreSummary: 'Pass@1 percentages (0–100) at a 95% rubric threshold',
    reportParagraphs: [
      'Unlike the Finance and Healthcare leaderboards, which display mean reward, the official DAYJOB: Tax announcement reports pass@1 at a 95% rubric threshold: an attempt passes when it satisfies at least 95% of the task criteria, and the leaderboard shows the share of passing attempts. The benchmark contains 50 environments. The announcement describes per-task outcomes across five attempts, the benchmark page states the share of attempts that pass, and the DAYJOB repository identifies five attempts per task for leaderboard runs, so attempts is 5.',
      'The public DAYJOB repository holds the harness, not the Tax tasks; the announcement directs full benchmark access requests to Surge. The repository documents a Harbor adapter and OpenHands SDK agent harness, with Claude Opus 4.8 grading, for the DAYJOB family, but neither it nor the Tax announcement establishes exact tools or harness metadata for each current Tax row, so those profile fields remain null. Benchmark version, context windows and leaderboard publication dates are unpublished and remain null.',
      '- Methodology: <https://surgehq.ai/blog/dayjob-tax> (published 2026-10-27) and <https://github.com/surge-ai/dayjob>. The blog publication date is not the leaderboard publication date.',
    ],
    manifestNotes: [
      'Main leaderboard Pass@1 percentages at a 95% rubric threshold over 50 tax environments. Tax tasks are not in the public DAYJOB repository; full benchmark access is by request.',
      'Official methodology: https://surgehq.ai/blog/dayjob-tax (2026-10-27). An attempt passes when it satisfies at least 95% of the task criteria; the score is the share of passing attempts. Five attempts per task: the announcement describes per-task outcomes across five attempts and the DAYJOB README identifies five attempts per task for leaderboard runs.',
      'The DAYJOB family harness uses Harbor and OpenHands SDK, with Claude Opus 4.8 grading; exact current per-row tools and harness for Tax remain unconfirmed and null. Benchmark version and leaderboard publication date are unpublished.',
    ],
  },
  'surge-dayjob-law': {
    sourceId: 'surge-dayjob-law',
    benchmarkId: 'dayjob-law',
    pageUrl: 'https://surgehq.ai/benchmarks/dayjob-law',
    pageTitle: 'DAYJOB: Law',
    label: 'DAYJOB Law',
    displayName: 'Surge AI DAYJOB Law',
    attempts: 5,
    metric: {
      id: 'pass-at-1',
      name: 'Pass@1',
    },
    scoreSummary: 'Pass@1 percentages (0–100) at a 95% rubric threshold',
    reportParagraphs: [
      'Like DAYJOB: Tax, and unlike the Finance and Healthcare leaderboards, which display mean reward, the official DAYJOB: Law announcement reports a pass rate at a 95% rubric threshold: an attempt passes when it satisfies at least 95% of its task criteria, and the leaderboard shows the share of passing attempts. The benchmark contains 71 assignments written by practicing lawyers. The DAYJOB repository identifies five attempts per task for leaderboard runs, so attempts is 5.',
      'The public DAYJOB-law dataset holds 2 sample tasks; the full 71-task set is available by request to Surge. The repository documents a Harbor adapter and OpenHands SDK agent harness, with Claude Opus 4.8 grading, for the DAYJOB family, but neither it nor the Law announcement establishes exact tools or harness metadata for each current Law row, so those profile fields remain null. Benchmark version, context windows and leaderboard publication dates are unpublished and remain null.',
      '- Methodology: <https://surgehq.ai/blog/dayjob-law> (published 2026-11-18), <https://huggingface.co/datasets/surgeai/DAYJOB-law> and <https://github.com/surge-ai/dayjob>. The blog publication date is not the leaderboard publication date.',
    ],
    manifestNotes: [
      'Main leaderboard Pass@1 percentages at a 95% rubric threshold over 71 legal assignments. Only 2 sample tasks are public; full benchmark access is by request.',
      'Official methodology: https://surgehq.ai/blog/dayjob-law (2026-11-18) and https://huggingface.co/datasets/surgeai/DAYJOB-law. An attempt passes when it satisfies at least 95% of its task rubric criteria; the score is the share of passing attempts. Five attempts per task: the DAYJOB README identifies five attempts per task for leaderboard runs.',
      'The DAYJOB family harness uses Harbor and OpenHands SDK, with Claude Opus 4.8 grading; exact current per-row tools and harness for Law remain unconfirmed and null. Benchmark version and leaderboard publication date are unpublished.',
    ],
  },
  'surge-corecraft': {
    sourceId: 'surge-corecraft',
    benchmarkId: 'enterprisebench-corecraft',
    pageUrl: 'https://surgehq.ai/benchmarks/enterprisebench-corecraft',
    pageTitle: 'EnterpriseBench: CoreCraft Agents',
    label: 'CoreCraft',
    displayName: 'Surge AI CoreCraft',
    attempts: null,
    metric: {
      id: 'task-pass-rate',
      name: 'Task pass rate',
    },
    scoreSummary: 'task pass rate percentages (0–100)',
    reportParagraphs: [
      'The official paper defines task pass rate as satisfying every expert-authored rubric criterion. The official blog describes a lightweight Vercel AI SDK harness, one conversation turn with up to 1000 tool-loop steps, MCP tools and company policy. These general methodology descriptions do not establish current per-row harness or tools metadata; those fields remain null. Current benchmark version, per-row repeated trial counts, context windows and publication dates are unpublished and remain null.',
      '- Methodology: <https://surgehq.ai/blog/enterprisebench-corecraft> and <https://arxiv.org/html/2602.16179v5>. The paper version is not a leaderboard benchmark version.',
    ],
    manifestNotes: [
      'Main leaderboard task pass rate percentages; enterprise customer support agent tasks requiring every rubric criterion to pass.',
      'Official methodology: https://surgehq.ai/blog/enterprisebench-corecraft and https://arxiv.org/html/2602.16179v5. Current per-row harness and tool metadata remain null.',
      'Per-row trial count, benchmark version and publication date are unpublished.',
    ],
  },
} as const satisfies Record<string, SurgePercentLeaderboardSpec>;

export type SurgePercentLeaderboardId = keyof typeof SURGE_PERCENT_LEADERBOARDS;

export const isSurgePercentLeaderboardId = (
  sourceId: string,
): sourceId is SurgePercentLeaderboardId =>
  Object.hasOwn(SURGE_PERCENT_LEADERBOARDS, sourceId);
