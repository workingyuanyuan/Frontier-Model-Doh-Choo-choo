# Surge ComplexConstraints acquisition validation

- Source: <https://surgehq.ai/benchmarks/complex-constraints>
- Benchmark version: v1.1.
- Evidence: `sha256:1f9b41ac6bee4fe51e87ef80aa2ea2eb4609be65c082038b80869bc7cb94f067`
- Main leaderboard: 16 rows; rendered browser count: 16.
- Every row contains one numeric score; empty score attributes require the published percent marker. Numeric attributes agree with displayed text; no pagination.
- Unresolved catalog identities (3): GLM 5.3 (Max reasoning); Hy Hy4 Preview (High reasoning); Mistral Large 4 (High reasoning).

Scores are the main leaderboard pass@1 percentages (0–100). Explicit reasoning tiers are retained; Adaptive/Max maps to max, Adaptive/High to high, Minimal reasoning to low, and No reasoning / Thinking off to non-reasoning. Thinking on does not declare an effort tier. Unresolved model variants retain null canonical identity.

The official harness defines the leaderboard task pass rate as all_pass/mean (Pass@1): every rubric criterion must pass. Mean criteria satisfaction is a separate metric. Each response is a single completion; per-row repeated trial counts and publication dates are unpublished and remain null.

## Preserved rows omitted from the current leaderboard

Current rendered rows: 16; preserved: 34; total stored: 50. Preserved rows retain their original version, timestamp, score and Evidence and are not current-version reruns.

- surge-complex-constraints:complex-constraints:claude-fable-5-max-reasoning: 38.1; version unpublished; observed 2026-11-02T03:15:46.661Z; Evidence sha256:e17daabadabc6c433d99d39cea28df0bfdf781f4869df509e8619a6c1a63bfc5.
- surge-complex-constraints:complex-constraints:claude-opus-4-8-max-reasoning: 35.6; version unpublished; observed 2026-11-02T03:15:46.661Z; Evidence sha256:e17daabadabc6c433d99d39cea28df0bfdf781f4869df509e8619a6c1a63bfc5.
- surge-complex-constraints:complex-constraints:claude-opus-5-adaptive-max: 37.3; version unpublished; observed 2026-11-02T03:15:46.661Z; Evidence sha256:e17daabadabc6c433d99d39cea28df0bfdf781f4869df509e8619a6c1a63bfc5.
- surge-complex-constraints:complex-constraints:deepseek-v4-1-flash-max-reasoning: 49.7; version unpublished; observed 2026-11-02T03:15:46.661Z; Evidence sha256:e17daabadabc6c433d99d39cea28df0bfdf781f4869df509e8619a6c1a63bfc5.
- surge-complex-constraints:complex-constraints:deepseek-v4-flash-vision-experimental-max-reasoning: 39.9; version unpublished; observed 2026-11-02T03:15:46.661Z; Evidence sha256:e17daabadabc6c433d99d39cea28df0bfdf781f4869df509e8619a6c1a63bfc5.
- surge-complex-constraints:complex-constraints:deepseek-v4-pro-max-reasoning: 42; version unpublished; observed 2026-11-02T03:15:46.661Z; Evidence sha256:e17daabadabc6c433d99d39cea28df0bfdf781f4869df509e8619a6c1a63bfc5.
- surge-complex-constraints:complex-constraints:ernie-4-5-300b: 0; version unpublished; observed 2026-11-02T03:15:46.661Z; Evidence sha256:e17daabadabc6c433d99d39cea28df0bfdf781f4869df509e8619a6c1a63bfc5.
- surge-complex-constraints:complex-constraints:ernie-5-1: 14.7; version unpublished; observed 2026-11-02T03:15:46.661Z; Evidence sha256:e17daabadabc6c433d99d39cea28df0bfdf781f4869df509e8619a6c1a63bfc5.
- surge-complex-constraints:complex-constraints:gemini-3-1-pro-high-reasoning: 43.7; version unpublished; observed 2026-11-02T03:15:46.661Z; Evidence sha256:e17daabadabc6c433d99d39cea28df0bfdf781f4869df509e8619a6c1a63bfc5.
- surge-complex-constraints:complex-constraints:gemini-3-5-flash-lite-high-reasoning: 23.2; version unpublished; observed 2026-11-02T03:15:46.661Z; Evidence sha256:e17daabadabc6c433d99d39cea28df0bfdf781f4869df509e8619a6c1a63bfc5.
- surge-complex-constraints:complex-constraints:gemini-3-6-flash-high-reasoning: 40; version unpublished; observed 2026-11-02T03:15:46.661Z; Evidence sha256:e17daabadabc6c433d99d39cea28df0bfdf781f4869df509e8619a6c1a63bfc5.
- surge-complex-constraints:complex-constraints:gemini-3-7-flash-high-reasoning: 42.4; version unpublished; observed 2026-11-02T03:15:46.661Z; Evidence sha256:e17daabadabc6c433d99d39cea28df0bfdf781f4869df509e8619a6c1a63bfc5.
- surge-complex-constraints:complex-constraints:glm-5-2-max-reasoning: 29.3; version unpublished; observed 2026-11-02T03:15:46.661Z; Evidence sha256:e17daabadabc6c433d99d39cea28df0bfdf781f4869df509e8619a6c1a63bfc5.
- surge-complex-constraints:complex-constraints:glm-5-3-flash-max-reasoning: 27.6; version unpublished; observed 2026-11-02T03:15:46.661Z; Evidence sha256:e17daabadabc6c433d99d39cea28df0bfdf781f4869df509e8619a6c1a63bfc5.
- surge-complex-constraints:complex-constraints:gpt-5-4-xhigh-reasoning: 46; version unpublished; observed 2026-11-02T03:15:46.661Z; Evidence sha256:e17daabadabc6c433d99d39cea28df0bfdf781f4869df509e8619a6c1a63bfc5.
- surge-complex-constraints:complex-constraints:gpt-5-5-xhigh-reasoning: 49.5; version unpublished; observed 2026-11-02T03:15:46.661Z; Evidence sha256:e17daabadabc6c433d99d39cea28df0bfdf781f4869df509e8619a6c1a63bfc5.
- surge-complex-constraints:complex-constraints:gpt-5-6-sol-max-reasoning: 50.5; version unpublished; observed 2026-11-02T03:15:46.661Z; Evidence sha256:e17daabadabc6c433d99d39cea28df0bfdf781f4869df509e8619a6c1a63bfc5.
- surge-complex-constraints:complex-constraints:gpt-6-sol-max-reasoning: 50.8; version unpublished; observed 2026-11-02T03:15:46.661Z; Evidence sha256:e17daabadabc6c433d99d39cea28df0bfdf781f4869df509e8619a6c1a63bfc5.
- surge-complex-constraints:complex-constraints:grok-4-20-beta: 16.4; version unpublished; observed 2026-11-02T03:15:46.661Z; Evidence sha256:e17daabadabc6c433d99d39cea28df0bfdf781f4869df509e8619a6c1a63bfc5.
- surge-complex-constraints:complex-constraints:grok-4-5-high-reasoning: 35.9; version unpublished; observed 2026-11-02T03:15:46.661Z; Evidence sha256:e17daabadabc6c433d99d39cea28df0bfdf781f4869df509e8619a6c1a63bfc5.
- surge-complex-constraints:complex-constraints:grok-4-6-xhigh-reasoning: 36.5; version unpublished; observed 2026-11-02T03:15:46.661Z; Evidence sha256:e17daabadabc6c433d99d39cea28df0bfdf781f4869df509e8619a6c1a63bfc5.
- surge-complex-constraints:complex-constraints:hy-hy3-high-reasoning: 34.3; version unpublished; observed 2026-11-02T03:15:46.661Z; Evidence sha256:e17daabadabc6c433d99d39cea28df0bfdf781f4869df509e8619a6c1a63bfc5.
- surge-complex-constraints:complex-constraints:kimi-k2-5-thinking-on: 18.2; version unpublished; observed 2026-11-02T03:15:46.661Z; Evidence sha256:e17daabadabc6c433d99d39cea28df0bfdf781f4869df509e8619a6c1a63bfc5.
- surge-complex-constraints:complex-constraints:kimi-k2-6-thinking-on: 30.1; version unpublished; observed 2026-11-02T03:15:46.661Z; Evidence sha256:e17daabadabc6c433d99d39cea28df0bfdf781f4869df509e8619a6c1a63bfc5.
- surge-complex-constraints:complex-constraints:mistral-large-3: 0.4; version unpublished; observed 2026-11-02T03:15:46.661Z; Evidence sha256:e17daabadabc6c433d99d39cea28df0bfdf781f4869df509e8619a6c1a63bfc5.
- surge-complex-constraints:complex-constraints:muse-glimmer-30b-xhigh-reasoning: 23.9; version unpublished; observed 2026-11-02T03:15:46.661Z; Evidence sha256:e17daabadabc6c433d99d39cea28df0bfdf781f4869df509e8619a6c1a63bfc5.
- surge-complex-constraints:complex-constraints:muse-spark-1-1-xhigh-reasoning: 38.1; version unpublished; observed 2026-11-02T03:15:46.661Z; Evidence sha256:e17daabadabc6c433d99d39cea28df0bfdf781f4869df509e8619a6c1a63bfc5.
- surge-complex-constraints:complex-constraints:muse-spark-1-2-xhigh-reasoning: 39.9; version unpublished; observed 2026-11-02T03:15:46.661Z; Evidence sha256:e17daabadabc6c433d99d39cea28df0bfdf781f4869df509e8619a6c1a63bfc5.
- surge-complex-constraints:complex-constraints:muse-spark-1-3-xhigh-reasoning: 51.9; version unpublished; observed 2026-11-02T03:15:46.661Z; Evidence sha256:e17daabadabc6c433d99d39cea28df0bfdf781f4869df509e8619a6c1a63bfc5.
- surge-complex-constraints:complex-constraints:nemotron-3-ultra: 17.8; version unpublished; observed 2026-11-02T03:15:46.661Z; Evidence sha256:e17daabadabc6c433d99d39cea28df0bfdf781f4869df509e8619a6c1a63bfc5.
- surge-complex-constraints:complex-constraints:nemotron-lightning-3-5-30b-a3b-thinking-on: 7.1; version unpublished; observed 2026-11-02T03:15:46.661Z; Evidence sha256:e17daabadabc6c433d99d39cea28df0bfdf781f4869df509e8619a6c1a63bfc5.
- surge-complex-constraints:complex-constraints:qwen-3-5-plus-thinking-on: 17.8; version unpublished; observed 2026-11-02T03:15:46.661Z; Evidence sha256:e17daabadabc6c433d99d39cea28df0bfdf781f4869df509e8619a6c1a63bfc5.
- surge-complex-constraints:complex-constraints:qwen-3-7-max-thinking-on: 33.5; version unpublished; observed 2026-11-02T03:15:46.661Z; Evidence sha256:e17daabadabc6c433d99d39cea28df0bfdf781f4869df509e8619a6c1a63bfc5.
- surge-complex-constraints:complex-constraints:qwen-3-8-flash-xhigh-reasoning: 43.3; version unpublished; observed 2026-11-02T03:15:46.661Z; Evidence sha256:e17daabadabc6c433d99d39cea28df0bfdf781f4869df509e8619a6c1a63bfc5.

<!-- C6-EFFORT-INFERENCE:START -->
## C6 effort inference — PENDING USER REVIEW

This tagged section is generated deterministically for `surge-complex-constraints`. Raw `profile.effort` remains unchanged; `productProfile.effort` is the transient product decision. Policy default: `default`.

### Cross-source inferences — PENDING USER REVIEW

- None.

### Unlabelled rows assigned the outside-the-ladder default

| Model | Target candidate | Raw effort | Product effort | Basis source | Basis candidate |
|---|---|---|---|---|---|
| Kimi K2.6 (Thinking on) | `surge-complex-constraints:complex-constraints:kimi-k2-6-thinking-on` | — | `default` | — | — |
| Nemotron 3 Ultra | `surge-complex-constraints:complex-constraints:nemotron-3-ultra` | — | `default` | — | — |
| Qwen 3.7 Max (Thinking on) | `surge-complex-constraints:complex-constraints:qwen-3-7-max-thinking-on` | — | `default` | — | — |

<!-- C6-EFFORT-INFERENCE:END -->
