const officialMetric = `task_completed_correctly`;
const diagnosticMetric = `partial_credit`;
const version = `1.0.6`;
const leaderboard = [
  [1, `Gemini 3.7 Flash (High)`, `30.44%`, `$0.61*`],
  [2, `Gemini 3.5 Flash (Low)`, `12.0%`, `$0.40`],
  [3, `Gemini 3.5 Flash (Minimal)`, `2.0%`, `$0.20`],
  [4, `Gemma 4 31B (Max)`, `1.7%`, `$0.09†`],
  [5, `Deepseek v4 Flash (Max)`, `1.0%`, `—`],
];
const promoNote = `*Gemini 3.7 Flash launch promo: $0.30 / task through Dec 31, 2026 ($0.75 in / $3.75 out per MTok). Ranking and Cost / task reflect standard list pricing; the promo is noted but does not affect rank.`;
const dedicatedNote = `†Dedicated-deployment pricing; not directly comparable to per-token API cost.`;
export {
  dedicatedNote,
  diagnosticMetric,
  leaderboard,
  officialMetric,
  promoNote,
  version,
};
