# Surge DAYJOB Tax acquisition validation

- Source: <https://surgehq.ai/benchmarks/dayjob-tax>
- Evidence: `sha256:e93a6aed058eb051d1404428a4afe0fd9f585cfc1936394223708c7f6221192a`
- Main leaderboard: 16 rows; rendered browser count: 16.
- Every row contains one numeric score; empty score attributes require the published percent marker. Numeric attributes agree with displayed text; no pagination.
- Unresolved catalog identities (4): DeepSeek V4.1 Flash 1017 (Max reasoning); GLM 5.3 (Max reasoning); Hy Hy4 Preview (High reasoning); Mistral Large 4 (High reasoning).

Scores are the main leaderboard Pass@1 percentages (0–100) at a 95% rubric threshold. Explicit reasoning tiers are retained; Adaptive/Max maps to max, Adaptive/High to high, Minimal reasoning to low, and No reasoning / Thinking off to non-reasoning. Thinking on and Auto reasoning do not declare an effort tier. Fast is a model variant and stays in the identity lookup. Unresolved model variants retain null canonical identity.

Unlike the Finance and Healthcare leaderboards, which display mean reward, the official DAYJOB: Tax announcement reports pass@1 at a 95% rubric threshold: an attempt passes when it satisfies at least 95% of the task criteria, and the leaderboard shows the share of passing attempts. The benchmark contains 50 environments. The announcement describes per-task outcomes across five attempts, the benchmark page states the share of attempts that pass, and the DAYJOB repository identifies five attempts per task for leaderboard runs, so attempts is 5.

The public DAYJOB repository holds the harness, not the Tax tasks; the announcement directs full benchmark access requests to Surge. The repository documents a Harbor adapter and OpenHands SDK agent harness, with Claude Opus 4.8 grading, for the DAYJOB family, but neither it nor the Tax announcement establishes exact tools or harness metadata for each current Tax row, so those profile fields remain null. Benchmark version, context windows and leaderboard publication dates are unpublished and remain null.

- Methodology: <https://surgehq.ai/blog/dayjob-tax> (published 2026-10-27) and <https://github.com/surge-ai/dayjob>. The blog publication date is not the leaderboard publication date.

<!-- C6-EFFORT-INFERENCE:START -->
## C6 effort inference — PENDING USER REVIEW

This tagged section is generated deterministically for `surge-dayjob-tax`. Raw `profile.effort` remains unchanged; `productProfile.effort` is the transient product decision. Policy default: `default`.

### Cross-source inferences — PENDING USER REVIEW

- None.

### Unlabelled rows assigned the outside-the-ladder default

- None.

<!-- C6-EFFORT-INFERENCE:END -->
