# Surge Riemann-bench acquisition validation

- Source: <https://surgehq.ai/benchmarks/riemann-bench>
- Benchmark version: v1.1.
- Evidence: `sha256:f0403026b555ba4125cf356a514ecaad5c1f46298a2780406804401fe2b72534`
- Main leaderboard: 21 rows; rendered browser count: 21.
- Every row contains one numeric score; empty score attributes require the published percent marker. Numeric attributes agree with displayed text; no pagination.
- Unresolved catalog identities (3): GLM 5.3 (Max reasoning); Hy Hy4 Preview (High reasoning); Mistral Large 4 (High reasoning).

Scores are the main leaderboard pass rate percentages (0–100). Explicit reasoning tiers are retained; Adaptive/Max maps to max, Adaptive/High to high, Minimal reasoning to low, and No reasoning / Thinking off to non-reasoning. Thinking on and Auto reasoning do not declare an effort tier. Fast is a model variant and stays in the identity lookup. Unresolved model variants retain null canonical identity.

The official paper describes 25 private research mathematics problems with unique closed-form answers, programmatic verification, and historical pass@1 estimates from 100 independent runs per problem. The official blog records a pipeline update removing the initial one-hour timeout. The current leaderboard does not label its estimator or confirm current per-row run counts, tools, or harness, so the metric remains pass rate and those profile fields remain null. Context windows and leaderboard publication dates are unpublished and remain null.

- Methodology: <https://surgehq.ai/blog/riemann-bench-a-benchmark-for-moonshot-mathematics> and <https://arxiv.org/html/2604.06802v3>. The paper version is not a leaderboard benchmark version.

## Preserved rows omitted from the current leaderboard

Current rendered rows: 21; preserved: 34; total stored: 55. Preserved rows retain their original version, timestamp, score and Evidence and are not current-version reruns.

- surge-riemann:riemann-bench:claude-fable-5-adaptive-max: 60; version unpublished; observed 2026-11-02T03:15:50.838Z; Evidence sha256:3fcc838de91500db5c7b7ffdf3772a985e4d1bb014798fd9516158555e03d1f8.
- surge-riemann:riemann-bench:claude-opus-4-5-adaptive-max: 11.2; version unpublished; observed 2026-11-02T03:15:50.838Z; Evidence sha256:3fcc838de91500db5c7b7ffdf3772a985e4d1bb014798fd9516158555e03d1f8.
- surge-riemann:riemann-bench:claude-opus-4-6-adaptive-max: 27.2; version unpublished; observed 2026-11-02T03:15:50.838Z; Evidence sha256:3fcc838de91500db5c7b7ffdf3772a985e4d1bb014798fd9516158555e03d1f8.
- surge-riemann:riemann-bench:claude-opus-4-7-adaptive-max: 32.8; version unpublished; observed 2026-11-02T03:15:50.838Z; Evidence sha256:3fcc838de91500db5c7b7ffdf3772a985e4d1bb014798fd9516158555e03d1f8.
- surge-riemann:riemann-bench:claude-opus-4-8-adaptive-max: 47.2; version unpublished; observed 2026-11-02T03:15:50.838Z; Evidence sha256:3fcc838de91500db5c7b7ffdf3772a985e4d1bb014798fd9516158555e03d1f8.
- surge-riemann:riemann-bench:claude-opus-5-adaptive-max: 68; version unpublished; observed 2026-11-02T03:15:50.838Z; Evidence sha256:3fcc838de91500db5c7b7ffdf3772a985e4d1bb014798fd9516158555e03d1f8.
- surge-riemann:riemann-bench:deepseek-v3-2-high-reasoning: 8; version unpublished; observed 2026-11-02T03:15:50.838Z; Evidence sha256:3fcc838de91500db5c7b7ffdf3772a985e4d1bb014798fd9516158555e03d1f8.
- surge-riemann:riemann-bench:deepseek-v4-1-flash-max-reasoning: 24; version unpublished; observed 2026-11-02T03:15:50.838Z; Evidence sha256:3fcc838de91500db5c7b7ffdf3772a985e4d1bb014798fd9516158555e03d1f8.
- surge-riemann:riemann-bench:deepseek-v4-flash-max-reasoning: 10.4; version unpublished; observed 2026-11-02T03:15:50.838Z; Evidence sha256:3fcc838de91500db5c7b7ffdf3772a985e4d1bb014798fd9516158555e03d1f8.
- surge-riemann:riemann-bench:deepseek-v4-flash-vision-experimental-high-reasoning: 23.2; version unpublished; observed 2026-11-02T03:15:50.838Z; Evidence sha256:3fcc838de91500db5c7b7ffdf3772a985e4d1bb014798fd9516158555e03d1f8.
- surge-riemann:riemann-bench:deepseek-v4-pro-max-reasoning: 38.4; version unpublished; observed 2026-11-02T03:15:50.838Z; Evidence sha256:3fcc838de91500db5c7b7ffdf3772a985e4d1bb014798fd9516158555e03d1f8.
- surge-riemann:riemann-bench:deepseek-v4-pro-preview-xhigh-reasoning: 5.6; version unpublished; observed 2026-11-02T03:15:50.838Z; Evidence sha256:3fcc838de91500db5c7b7ffdf3772a985e4d1bb014798fd9516158555e03d1f8.
- surge-riemann:riemann-bench:gemini-3-1-pro-high-reasoning: 33.6; version unpublished; observed 2026-11-02T03:15:50.838Z; Evidence sha256:3fcc838de91500db5c7b7ffdf3772a985e4d1bb014798fd9516158555e03d1f8.
- surge-riemann:riemann-bench:gemini-3-5-flash-high-reasoning: 36.8; version unpublished; observed 2026-11-02T03:15:50.838Z; Evidence sha256:3fcc838de91500db5c7b7ffdf3772a985e4d1bb014798fd9516158555e03d1f8.
- surge-riemann:riemann-bench:gemini-3-5-flash-lite-high-reasoning: 11.2; version unpublished; observed 2026-11-02T03:15:50.838Z; Evidence sha256:3fcc838de91500db5c7b7ffdf3772a985e4d1bb014798fd9516158555e03d1f8.
- surge-riemann:riemann-bench:gemini-3-6-flash-high-reasoning: 30.4; version unpublished; observed 2026-11-02T03:15:50.838Z; Evidence sha256:3fcc838de91500db5c7b7ffdf3772a985e4d1bb014798fd9516158555e03d1f8.
- surge-riemann:riemann-bench:gemini-3-7-flash-high-reasoning: 39.2; version unpublished; observed 2026-11-02T03:15:50.838Z; Evidence sha256:3fcc838de91500db5c7b7ffdf3772a985e4d1bb014798fd9516158555e03d1f8.
- surge-riemann:riemann-bench:glm-5-2-max-reasoning: 10.4; version unpublished; observed 2026-11-02T03:15:50.838Z; Evidence sha256:3fcc838de91500db5c7b7ffdf3772a985e4d1bb014798fd9516158555e03d1f8.
- surge-riemann:riemann-bench:glm-5-3-flash-max-reasoning: 8.8; version unpublished; observed 2026-11-02T03:15:50.838Z; Evidence sha256:3fcc838de91500db5c7b7ffdf3772a985e4d1bb014798fd9516158555e03d1f8.
- surge-riemann:riemann-bench:gpt-5-2-xhigh-reasoning: 37.6; version unpublished; observed 2026-11-02T03:15:50.838Z; Evidence sha256:3fcc838de91500db5c7b7ffdf3772a985e4d1bb014798fd9516158555e03d1f8.
- surge-riemann:riemann-bench:gpt-5-4-xhigh-reasoning: 41.6; version unpublished; observed 2026-11-02T03:15:50.838Z; Evidence sha256:3fcc838de91500db5c7b7ffdf3772a985e4d1bb014798fd9516158555e03d1f8.
- surge-riemann:riemann-bench:gpt-5-5-xhigh-reasoning: 55.2; version unpublished; observed 2026-11-02T03:15:50.838Z; Evidence sha256:3fcc838de91500db5c7b7ffdf3772a985e4d1bb014798fd9516158555e03d1f8.
- surge-riemann:riemann-bench:gpt-5-6-terra-max-reasoning: 66.4; version unpublished; observed 2026-11-02T03:15:50.838Z; Evidence sha256:3fcc838de91500db5c7b7ffdf3772a985e4d1bb014798fd9516158555e03d1f8.
- surge-riemann:riemann-bench:gpt-6-luna-max-reasoning: 59.2; version unpublished; observed 2026-11-02T03:15:50.838Z; Evidence sha256:3fcc838de91500db5c7b7ffdf3772a985e4d1bb014798fd9516158555e03d1f8.
- surge-riemann:riemann-bench:gpt-6-sol-max-reasoning: 64.8; version unpublished; observed 2026-11-02T03:15:50.838Z; Evidence sha256:3fcc838de91500db5c7b7ffdf3772a985e4d1bb014798fd9516158555e03d1f8.
- surge-riemann:riemann-bench:grok-4-5-high-reasoning: 38.4; version unpublished; observed 2026-11-02T03:15:50.838Z; Evidence sha256:3fcc838de91500db5c7b7ffdf3772a985e4d1bb014798fd9516158555e03d1f8.
- surge-riemann:riemann-bench:inkling-xhigh-reasoning: 15.2; version unpublished; observed 2026-11-02T03:15:50.838Z; Evidence sha256:3fcc838de91500db5c7b7ffdf3772a985e4d1bb014798fd9516158555e03d1f8.
- surge-riemann:riemann-bench:kimi-k2-5-thinking-on: 12; version unpublished; observed 2026-11-02T03:15:50.838Z; Evidence sha256:3fcc838de91500db5c7b7ffdf3772a985e4d1bb014798fd9516158555e03d1f8.
- surge-riemann:riemann-bench:kimi-k2-6-thinking-on: 7.2; version unpublished; observed 2026-11-02T03:15:50.838Z; Evidence sha256:3fcc838de91500db5c7b7ffdf3772a985e4d1bb014798fd9516158555e03d1f8.
- surge-riemann:riemann-bench:mai-thinking-1: 4.8; version unpublished; observed 2026-11-02T03:15:50.838Z; Evidence sha256:3fcc838de91500db5c7b7ffdf3772a985e4d1bb014798fd9516158555e03d1f8.
- surge-riemann:riemann-bench:muse-glimmer-30b-xhigh-reasoning: 13.6; version unpublished; observed 2026-11-02T03:15:50.838Z; Evidence sha256:3fcc838de91500db5c7b7ffdf3772a985e4d1bb014798fd9516158555e03d1f8.
- surge-riemann:riemann-bench:muse-spark-1-1-xhigh-reasoning: 20.8; version unpublished; observed 2026-11-02T03:15:50.838Z; Evidence sha256:3fcc838de91500db5c7b7ffdf3772a985e4d1bb014798fd9516158555e03d1f8.
- surge-riemann:riemann-bench:muse-spark-1-2-xhigh-reasoning: 23.2; version unpublished; observed 2026-11-02T03:15:50.838Z; Evidence sha256:3fcc838de91500db5c7b7ffdf3772a985e4d1bb014798fd9516158555e03d1f8.
- surge-riemann:riemann-bench:qwen-3-7-max-thinking-on: 15.2; version unpublished; observed 2026-11-02T03:15:50.838Z; Evidence sha256:3fcc838de91500db5c7b7ffdf3772a985e4d1bb014798fd9516158555e03d1f8.

## Snapshot delta

Comparison uses this task’s immutable pre-import snapshot; the source identity replay uses current captured bytes.

| Check | Previous | Refreshed | Delta |
|---|---:|---:|---:|
| Candidate results | 55 | 55 | +0 |
| Materialized costs | 0 | 0 | +0 |

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
