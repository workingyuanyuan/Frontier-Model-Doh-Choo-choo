# Surge Riemann-bench acquisition validation

- Source: <https://surgehq.ai/benchmarks/riemann-bench>
- Evidence: `sha256:bf6ce3c7e1305e7677eeeb022f4c123e6a663fe0c625b03ffc505ddd7159c8d5`
- Main leaderboard: 44 rows; rendered browser count: 44.
- Every row contains one numeric score; empty score attributes require the published percent marker. Numeric attributes agree with displayed text; no pagination.
- Unresolved catalog identities (11): DeepSeek V3.2 (High reasoning); DeepSeek V4.1 Flash (Max reasoning); DeepSeek V4 Flash Vision (experimental) (High reasoning); DeepSeek V4 Pro (preview) (xHigh reasoning); Gemini 3.1 Pro (High reasoning); GLM 5.3 Flash (Max reasoning); GLM 5.3 (Max reasoning); Hy Hy4 Preview (High reasoning); Kimi K2.5 (Thinking on); MAI Thinking 1; Muse Glimmer 30B (xHigh reasoning).

Scores are the main leaderboard pass rate percentages (0–100). Explicit reasoning tiers are retained; Adaptive/Max maps to max, Adaptive/High to high, Minimal reasoning to low, and No reasoning / Thinking off to non-reasoning. Thinking on and Auto reasoning do not declare an effort tier. Fast is a model variant and stays in the identity lookup. Unresolved model variants retain null canonical identity.

The official paper describes 25 private research mathematics problems with unique closed-form answers, programmatic verification, and historical pass@1 estimates from 100 independent runs per problem. The official blog records a pipeline update removing the initial one-hour timeout. The current leaderboard does not label its estimator or confirm current per-row run counts, tools, or harness, so the metric remains pass rate and those profile fields remain null. Benchmark version, context windows, and leaderboard publication dates are unpublished and remain null.

- Methodology: <https://surgehq.ai/blog/riemann-bench-a-benchmark-for-moonshot-mathematics> and <https://arxiv.org/html/2604.06802v3>. The paper version is not a leaderboard benchmark version.

<!-- C6-EFFORT-INFERENCE:START -->
## C6 effort inference — PENDING USER REVIEW

This tagged section is generated deterministically for `surge-riemann`. Raw `profile.effort` remains unchanged; `productProfile.effort` is the transient product decision. Policy default: `default`.

### Cross-source inferences — PENDING USER REVIEW

- None.

### Unlabelled rows assigned the outside-the-ladder default

| Model | Target candidate | Raw effort | Product effort | Basis source | Basis candidate |
|---|---|---|---|---|---|
| Kimi K2.6 (Thinking on) | `surge-riemann:riemann-bench:kimi-k2-6-thinking-on` | — | `default` | — | — |
| Qwen 3.7 Max (Thinking on) | `surge-riemann:riemann-bench:qwen-3-7-max-thinking-on` | — | `default` | — | — |

<!-- C6-EFFORT-INFERENCE:END -->
