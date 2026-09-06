// Reduced synthetic regression fixture based on the 2026-09-05 route module.
// Ranks are renumbered for parser continuity; this is not a source artifact.
const officialMetric = `task_completed_correctly`;
const version = `1.0.6`;
const leaderboard = [
  [1, `GPT 6 Astra (Max)`, `41.4%`, `$1.77`],
  [2, `GPT 6 Astra (XHigh)`, `38.96%`, `$1.53`],
  [3, `GPT 6 Astra (High)`, `37.14%`, `$1.45`],
  [4, `GPT 6 Astra (Medium)`, `34.09%`, `$1.28`],
  [5, `Claude Fable 5.1 with Opus 5 Fallback (Max)`, `31.4%`, `$2.45§`],
  [6, `Gemini 3.7 Flash (High)`, `30.44%`, `$0.61*`],
  [7, `GPT 6 Astra (Low)`, `30.29%`, `$1.08`],
  [8, `Gemini 3.8 Flash (Medium)`, `29.68%`, `$0.55*`],
  [9, `DeepSeek V4 Flash (Max)`, `28.5%`, `$0.14‡`],
  [10, `Gemma 4 31B (Max)`, `1.7%`, `$0.09†`],
  [11, `GPT 6 Astra (None)`, `25.27%`, `$1.28`],
];
const fallbackNote = `§ Rank 5 is Fable 5.1 with an Opus 5 fallback: when Fable 5.1's safety classifier refuses a step, Opus 5 completes it and Fable finishes the task. Opus 5 handled ~40% of tasks (260 of 657); the 31.4% score includes those fallback completions. Cost/task shown is Fable 5.1 alone and excludes fallback tokens, so the true combo cost is higher.`;
const promoNote = `*Promotional pricing is available for both Gemini models; Ranking and Cost / task reflect standard list pricing. Gemini 3.7 Flash: $0.30 / task through Dec 31, 2026. Gemini 3.8 Flash: $0.27 (Medium) / $0.31 (High) per task.`;
const deepseekNote = `‡DeepSeek V4 Flash priced at Fireworks rates ($0.14 / task uncached, $0.04 cached).`;
const dedicatedNote = `†Dedicated-deployment pricing; not directly comparable to per-token API cost.`;
export {
  leaderboard,
  officialMetric,
  version,
  fallbackNote,
  promoNote,
  deepseekNote,
  dedicatedNote,
};
