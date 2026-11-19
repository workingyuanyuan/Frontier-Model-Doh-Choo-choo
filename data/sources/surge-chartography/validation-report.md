# Surge Chartography acquisition validation

- Source: <https://surgehq.ai/benchmarks/chartography>
- Evidence: `sha256:35a7f210fd64895b7a456633666e0733f162226fd5765b93e088a3fad6f4a667`
- Main leaderboard: 41 rows; rendered browser count: 41.
- Every data-score attribute agrees with its displayed percentage; no pagination.
- Unresolved catalog identities (9): Gemini 3.1 Pro (High reasoning); GLM 5.3 Flash (Max reasoning); GLM 5.3 (Max reasoning); Hy Hy3 (High reasoning); Hy Hy4 (High reasoning); Hy Hy4 Preview (High reasoning); MiniMax M3.1 Flash (Max reasoning); Mistral Large 3; Muse Glimmer 30B (xHigh reasoning).

Scores are the main leaderboard pass@1 percentages (0–100). Explicit reasoning tiers are retained; Adaptive/Max maps to max and Minimal reasoning to low. Thinking on does not declare an effort tier. Unresolved model variants retain null canonical identity.

The cost/token charts have a separate, older configuration list and are outside this leaderboard snapshot. The chart caption states 20 trials, while the official GitHub README describes 10 epochs; attempts remains null because per-row trial counts are unpublished. Benchmark version and per-row publication dates are also unpublished and remain null.

<!-- C6-EFFORT-INFERENCE:START -->
## C6 effort inference — PENDING USER REVIEW

This tagged section is generated deterministically for `surge-chartography`. Raw `profile.effort` remains unchanged; `productProfile.effort` is the transient product decision. Policy default: `default`.

### Cross-source inferences — PENDING USER REVIEW

- None.

### Unlabelled rows assigned the outside-the-ladder default

| Model | Target candidate | Raw effort | Product effort | Basis source | Basis candidate |
|---|---|---|---|---|---|
| Nemotron 3 Ultra | `surge-chartography:chartography:nemotron-3-ultra` | — | `default` | — | — |

<!-- C6-EFFORT-INFERENCE:END -->
