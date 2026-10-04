# Surge CoreCraft acquisition validation

- Source: <https://surgehq.ai/benchmarks/enterprisebench-corecraft>
- Evidence: `sha256:63cb9251cf8cf99d03f192315fc721fb32414f3ef069a4d7545f9bce53d3c557`
- Main leaderboard: 50 rows; rendered browser count: 50.
- Every row contains one numeric score; empty score attributes require the published percent marker. Numeric attributes agree with displayed text; no pagination.
- Unresolved catalog identities (20): DeepSeek V3.2 (High reasoning); DeepSeek V4.1 Flash (Max reasoning); DeepSeek V4 Flash Vision (experimental) (Max reasoning); Gemini 3.1 Pro (High reasoning); Gemini 3 Flash (High reasoning); Gemini 3 Pro (High reasoning); GLM 5.3 Flash (Max reasoning); GLM 5.3 (Max reasoning); GLM 5 (Auto reasoning); Grok 4.1 (Fast); Hy Hy3 (High reasoning); Hy Hy4 Preview (High reasoning); Kimi K2.5 (Thinking on); Mistral Large 3; Muse Glimmer 30B (xHigh reasoning); Nemotron Lightning 3.5 30B A3B (Thinking on); Nova 2 Pro (High reasoning); Qwen 3.5 Plus (Thinking on); Qwen 3.8 Flash (xHigh reasoning); Qwen 3 Max (Thinking on).

Scores are the main leaderboard task pass rate percentages (0–100). Explicit reasoning tiers are retained; Adaptive/Max maps to max, Adaptive/High to high, Minimal reasoning to low, and No reasoning / Thinking off to non-reasoning. Thinking on and Auto reasoning do not declare an effort tier. Fast is a model variant and stays in the identity lookup. Unresolved model variants retain null canonical identity.

The official paper defines task pass rate as satisfying every expert-authored rubric criterion. The official blog describes a lightweight Vercel AI SDK harness, one conversation turn with up to 1000 tool-loop steps, MCP tools and company policy. These general methodology descriptions do not establish current per-row harness or tools metadata; those fields remain null. Current benchmark version, per-row repeated trial counts, context windows and publication dates are unpublished and remain null.

- Methodology: <https://surgehq.ai/blog/enterprisebench-corecraft> and <https://arxiv.org/html/2602.16179v5>. The paper version is not a leaderboard benchmark version.

<!-- C6-EFFORT-INFERENCE:START -->
## C6 effort inference — PENDING USER REVIEW

This tagged section is generated deterministically for `surge-corecraft`. Raw `profile.effort` remains unchanged; `productProfile.effort` is the transient product decision. Policy default: `default`.

### Cross-source inferences — PENDING USER REVIEW

- None.

### Unlabelled rows assigned the outside-the-ladder default

| Model | Target candidate | Raw effort | Product effort | Basis source | Basis candidate |
|---|---|---|---|---|---|
| Kimi K2.6 (Thinking on) | `surge-corecraft:enterprisebench-corecraft:kimi-k2-6-thinking-on` | — | `default` | — | — |
| Qwen 3.7 Max (Thinking on) | `surge-corecraft:enterprisebench-corecraft:qwen-3-7-max-thinking-on` | — | `default` | — | — |

<!-- C6-EFFORT-INFERENCE:END -->
