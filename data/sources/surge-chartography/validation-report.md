# Surge Chartography acquisition validation

- Source: <https://surgehq.ai/benchmarks/chartography>
- Evidence: `sha256:d68055444132ee7a391f297f96415aa5e46ed811e52dae0c4b2f18c0036a99a3`
- Main leaderboard: 42 rows; rendered browser count: 42.
- Every data-score attribute agrees with its displayed percentage; no pagination.
- Unresolved catalog identities (10): DeepSeek V4.1 Flash (Max reasoning); DeepSeek V4 Flash Vision (experimental) (Max reasoning); Gemini 3.1 Pro (High reasoning); GLM 5.3 Flash (Max reasoning); Inkling Small (xHigh reasoning); Kimi K2.5 (Thinking on); Mistral Large 3; Muse Glimmer 30B (xHigh reasoning); Qwen 3.5 Plus (Thinking on); Qwen 3.8 Flash (xHigh reasoning).

Scores are the main leaderboard pass@1 percentages (0–100). Explicit reasoning tiers are retained; Adaptive/Max maps to max and Minimal reasoning to low. Thinking on does not declare an effort tier. Unresolved model variants retain null canonical identity.

The cost/token charts have a separate, older configuration list and are outside this leaderboard snapshot. The chart caption states 20 trials, while the official GitHub README describes 10 epochs; attempts remains null because per-row trial counts are unpublished. Benchmark version and per-row publication dates are also unpublished and remain null.

## Snapshot delta

Comparison uses this task’s immutable pre-import snapshot; the source identity replay uses current captured bytes.

| Check | Previous | Refreshed | Delta |
|---|---:|---:|---:|
| Candidate results | 42 | 42 | +0 |
| Materialized costs | 0 | 0 | +0 |

<!-- C6-EFFORT-INFERENCE:START -->
## C6 effort inference — PENDING USER REVIEW

This tagged section is generated deterministically for `surge-chartography`. Raw `profile.effort` remains unchanged; `productProfile.effort` is the transient product decision. Policy default: `default`.

### Cross-source inferences — PENDING USER REVIEW

- None.

### Unlabelled rows assigned the outside-the-ladder default

| Model | Target candidate | Raw effort | Product effort | Basis source | Basis candidate |
|---|---|---|---|---|---|
| Kimi K2.6 (Thinking on) | `surge-chartography:chartography:kimi-k2-6-thinking-on` | — | `default` | — | — |
| Qwen 3.7 Plus (Thinking on) | `surge-chartography:chartography:qwen-3-7-plus-thinking-on` | — | `default` | — | — |

<!-- C6-EFFORT-INFERENCE:END -->
