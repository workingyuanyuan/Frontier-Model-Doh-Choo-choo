# Surge ComplexConstraints acquisition validation

- Source: <https://surgehq.ai/benchmarks/complex-constraints>
- Evidence: `sha256:924dff79ccaa2e1371f82e93fb1615b603b017ebedbb0bbd6d4c11345082967c`
- Main leaderboard: 56 rows; rendered browser count: 56.
- Every row contains one numeric score; empty score attributes require the published percent marker. Numeric attributes agree with displayed text; no pagination.
- Unresolved catalog identities (20): DeepSeek V3.2 (No reasoning); DeepSeek V4.1 Flash (Max reasoning); DeepSeek V4 Flash (preview) (High reasoning); DeepSeek V4 Flash Vision (experimental) (Max reasoning); DeepSeek V4 Pro (preview) (High reasoning); Ernie 4.5 300B; Ernie 5.1; Gemini 3.1 Pro (High reasoning); GLM 5.3 Flash (Max reasoning); GLM 5.3 (Max reasoning); Grok 4.20 Beta; Hy Hy3 (High reasoning); Hy Hy4 Preview (High reasoning); Kimi K2.5 (Thinking on); Mistral Large 3; Muse Glimmer 30B (xHigh reasoning); Nemotron Lightning 3.5 30B A3B (Thinking on); Nova 2 Pro (No reasoning); Qwen 3.5 Plus (Thinking on); Qwen 3.8 Flash (xHigh reasoning).

Scores are the main leaderboard pass@1 percentages (0–100). Explicit reasoning tiers are retained; Adaptive/Max maps to max, Adaptive/High to high, Minimal reasoning to low, and No reasoning / Thinking off to non-reasoning. Thinking on does not declare an effort tier. Unresolved model variants retain null canonical identity.

The official harness defines the leaderboard task pass rate as all_pass/mean (Pass@1): every rubric criterion must pass. Mean criteria satisfaction is a separate metric. Each response is a single completion; per-row repeated trial counts, benchmark version and publication dates are unpublished and remain null.

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
