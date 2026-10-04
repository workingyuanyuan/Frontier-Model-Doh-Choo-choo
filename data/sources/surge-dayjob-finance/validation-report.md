# Surge DAYJOB Finance acquisition validation

- Source: <https://surgehq.ai/benchmarks/dayjob-finance>
- Evidence: `sha256:a0f705d60b185c0d57165d6941580a66a5b85c8c3291175fcb2f7c1f9981f190`
- Main leaderboard: 32 rows; rendered browser count: 32.
- Every row contains one numeric score; empty score attributes require the published percent marker. Numeric attributes agree with displayed text; no pagination.
- Unresolved catalog identities (7): Gemini 3.1 Pro (High reasoning); GLM 5.3 Flash (Max reasoning); GLM 5.3 (Max reasoning); Hy Hy3 (High reasoning); Hy Hy4 Preview (High reasoning); Mistral Large 3; Muse Glimmer 30B (xHigh reasoning).

Scores are the main leaderboard mean reward percentages (0–100). Explicit reasoning tiers are retained; Adaptive/Max maps to max, Adaptive/High to high, Minimal reasoning to low, and No reasoning / Thinking off to non-reasoning. Thinking on and Auto reasoning do not declare an effort tier. Fast is a model variant and stays in the identity lookup. Unresolved model variants retain null canonical identity.

The official DAYJOB repository defines a trial reward on 0–1, each task score as the mean reward over five attempts excluding errored trials, and the domain score as the unweighted mean of task scores. The main leaderboard displays that domain score as a percentage. The repository explicitly identifies five attempts per task for leaderboard runs, so attempts is 5.

The official blog describes long-horizon finance work spanning corporate finance, banking, credit, investing, and real assets, assessed with task-specific rubrics. The public repository documents a Harbor adapter and OpenHands SDK agent harness, with Claude Opus 4.8 grading. These published general descriptions do not establish exact tools or harness metadata for each current row, so those profile fields remain null. Benchmark version, context windows and leaderboard publication dates are unpublished and remain null.

- Methodology: <https://surgehq.ai/blog/dayjob> and <https://github.com/surge-ai/dayjob#grading>. The blog publication date is not the leaderboard publication date.

<!-- C6-EFFORT-INFERENCE:START -->
## C6 effort inference — PENDING USER REVIEW

This tagged section is generated deterministically for `surge-dayjob-finance`. Raw `profile.effort` remains unchanged; `productProfile.effort` is the transient product decision. Policy default: `default`.

### Cross-source inferences — PENDING USER REVIEW

- None.

### Unlabelled rows assigned the outside-the-ladder default

| Model | Target candidate | Raw effort | Product effort | Basis source | Basis candidate |
|---|---|---|---|---|---|
| Nemotron 3 Ultra | `surge-dayjob-finance:dayjob-finance:nemotron-3-ultra` | — | `default` | — | — |

<!-- C6-EFFORT-INFERENCE:END -->
