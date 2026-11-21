# Surge DAYJOB Law acquisition validation

- Source: <https://surgehq.ai/benchmarks/dayjob-law>
- Evidence: `sha256:2d46ac03eb9c68e4211298ddd4cefd6207bd2895ab3b6435bec908050e6e1e80`
- Main leaderboard: 25 rows; rendered browser count: 25.
- Every row contains one numeric score; empty score attributes require the published percent marker. Numeric attributes agree with displayed text; no pagination.
- Unresolved catalog identities (3): GLM 5.3 (Max reasoning); Hy Hy4 Preview (High reasoning); Mistral Large 4 (High reasoning).

Scores are the main leaderboard Pass@1 percentages (0–100) at a 95% rubric threshold. Explicit reasoning tiers are retained; Adaptive/Max maps to max, Adaptive/High to high, Minimal reasoning to low, and No reasoning / Thinking off to non-reasoning. Thinking on and Auto reasoning do not declare an effort tier. Fast is a model variant and stays in the identity lookup. Unresolved model variants retain null canonical identity.

Like DAYJOB: Tax, and unlike the Finance and Healthcare leaderboards, which display mean reward, the official DAYJOB: Law announcement reports a pass rate at a 95% rubric threshold: an attempt passes when it satisfies at least 95% of its task criteria, and the leaderboard shows the share of passing attempts. The benchmark contains 71 assignments written by practicing lawyers. The DAYJOB repository identifies five attempts per task for leaderboard runs, so attempts is 5.

The public DAYJOB-law dataset holds 2 sample tasks; the full 71-task set is available by request to Surge. The repository documents a Harbor adapter and OpenHands SDK agent harness, with Claude Opus 4.8 grading, for the DAYJOB family, but neither it nor the Law announcement establishes exact tools or harness metadata for each current Law row, so those profile fields remain null. Benchmark version, context windows and leaderboard publication dates are unpublished and remain null.

- Methodology: <https://surgehq.ai/blog/dayjob-law> (published 2026-11-18), <https://huggingface.co/datasets/surgeai/DAYJOB-law> and <https://github.com/surge-ai/dayjob>. The blog publication date is not the leaderboard publication date.

<!-- C6-EFFORT-INFERENCE:START -->
## C6 effort inference — PENDING USER REVIEW

This tagged section is generated deterministically for `surge-dayjob-law`. Raw `profile.effort` remains unchanged; `productProfile.effort` is the transient product decision. Policy default: `default`.

### Cross-source inferences — PENDING USER REVIEW

- None.

### Unlabelled rows assigned the outside-the-ladder default

- None.

<!-- C6-EFFORT-INFERENCE:END -->
