# FrontierSWE V2 acquisition validation

- Source: <https://www.frontierswe.com/>
- Evidence: `sha256:b3701f910aad11d787c2c84e112a29c957dfba3bfc198d3ee0089476a0173860`
- Complete mean@5 configurations: 18; coverage matrix identities matched.
- Server-rendered leaderboard rows cross-checked at displayed precision: 10.
- Methodology: Scores across all 34 tasks. Each model runs 5 trials per task with a 20-hour budget.
- Unresolved catalog names: DeepSeek V4 Flash Vision Exp, GLM-5.3, GPT-5.6.

The embedded entries.abs.mean array supplies all configurations, including models hidden by the default Best filter. Scores are already percentages (0–100). Raw effort remains null because the source does not publish it. Harness and five trials are retained as provenance. The benchmark mapping limits these results to manual profile comparisons.

<!-- C6-EFFORT-INFERENCE:START -->
## C6 effort inference — PENDING USER REVIEW

This tagged section is generated deterministically for `frontier-swe`. Raw `profile.effort` remains unchanged; `productProfile.effort` is the transient product decision. Policy default: `default`.

### Cross-source inferences — PENDING USER REVIEW

| Model | Target candidate | Raw effort | Product effort | Basis source | Basis candidate |
|---|---|---|---|---|---|
| Claude Fable 5 | `frontier-swe:frontier-swe-v2:claude-fable-5-proximus` | — | `max` | arc-prize | arc-prize:arc-agi-2:anthropic-claude-fable-5-max:arc-agi-2-v2-semi-private |
| Claude Fable 5.1 | `frontier-swe:frontier-swe-v2:claude-fable-5-1-proximus` | — | `max` | anthropic-releases | anthropic-releases:cursorbench-4:fable51-max |
| Claude Opus 5 | `frontier-swe:frontier-swe-v2:claude-opus-5-proximus` | — | `max` | anthropic-releases | anthropic-releases:cursorbench-4:opus5-max |
| Claude Opus 5.5 | `frontier-swe:frontier-swe-v2:claude-opus-5-5-proximus` | — | `max` | anthropic-releases | anthropic-releases:cursorbench-4:opus55-max |
| Claude Sonnet 5.5 | `frontier-swe:frontier-swe-v2:claude-sonnet-5-5-proximus` | — | `max` | artificial-analysis | artificial-analysis:aa-briefcase:claude-sonnet-5-5 |
| Gemini 3.7 Flash | `frontier-swe:frontier-swe-v2:gemini-3-7-flash-proximus` | — | `high` | arc-prize | arc-prize:arc-agi-2:google-gemini-3-7-flash-high:arc-agi-2-v2-semi-private |
| Gemini 3.8 Flash | `frontier-swe:frontier-swe-v2:gemini-3-8-flash-proximus` | — | `high` | arc-prize | arc-prize:arc-agi-2:google-gemini-3-8-flash-high:arc-agi-2-v2-semi-private |
| Gemini 4 Argon | `frontier-swe:frontier-swe-v2:gemini-4-argon-proximus` | — | `high` | artificial-analysis | artificial-analysis:aa-briefcase:gemini-4-argon |
| GPT-6 Astra | `frontier-swe:frontier-swe-v2:gpt-6-astra-proximus` | — | `max` | anthropic-releases | anthropic-releases:frontier-code-1-1:gpt6astra-max |
| Grok 4.6 | `frontier-swe:frontier-swe-v2:grok-4-6-proximus` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:xai-grok-4-6-xhigh:arc-agi-2-v2-semi-private |
| Grok 4.7 | `frontier-swe:frontier-swe-v2:grok-4-7-proximus` | — | `xhigh` | artificial-analysis | artificial-analysis:aa-briefcase:grok-4-7 |
| Inkling | `frontier-swe:frontier-swe-v2:inkling-proximus` | — | `xhigh` | artificial-analysis | artificial-analysis:aa-briefcase:inkling |
| Kimi K3 | `frontier-swe:frontier-swe-v2:kimi-k3-proximus` | — | `max` | arc-prize | arc-prize:arc-agi-2:moonshot-kimi-k3-max:arc-agi-2-v2-semi-private |
| Muse Spark 1.2 | `frontier-swe:frontier-swe-v2:muse-spark-1-2-proximus` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-muse-spark-1-2-xhigh |
| Qwen3.8-Max | `frontier-swe:frontier-swe-v2:qwen3-8-max-proximus` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |

### Unlabelled rows assigned the outside-the-ladder default

- None.

<!-- C6-EFFORT-INFERENCE:END -->
