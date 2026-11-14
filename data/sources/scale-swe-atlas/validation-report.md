# Scale SWE Atlas acquisition validation

- Source https://scale.com/leaderboard/swe-atlas
- Observed 2026-11-13T04:49:32.945Z
- Evidence `sha256:af33134d41c2fc798f9c66a7b2cbf45b90d783c8d597fb68d91a885a5008e738`
- Rendered Overall rows 28; embedded Overall rows 28; candidates 28.
- Embedded variant populations: {"overall":28,"qna":28,"testwriting":28,"refactoring":28}.
- Only Overall contributes one SWE Atlas v1.1 score per model. QnA, Test Writing and Refactoring remain in the raw HTML artifact.
- Published scores use the 0–100 scale directly. maxScore is chart-axis metadata, not the normalization denominator.
- The official v1.1 notice describes 284 tasks and reruns with GPT-6.1 Sol as judge (majority of three votes), refined grading and restricted networking. Judge votes are not agent attempts.
- Unpublished effort, tools, harness, thinking, context, quantization and attempts remain null. Row createdAt is retained in provenance and is not treated as a score publication timestamp.
- Published confidenceInterval_upper/lower fields are retained verbatim in artifact metadata and field provenance. No confidence level or missing bound is inferred.

## Exact model identities

| Source model | Canonical identity | Source effort |
|---|---|---|
| DeepSeek V4.1 Flash | null | null |
| Fable 5.1 | anthropic-claude-fable-5-1 | null |
| Fable 5.2 | anthropic-claude-fable-5-2 | null |
| Gemini 3.8 Flash | google-gemini-3-8-flash | null |
| Gemini 4 Argon | google-gemini-4-argon | null |
| Gemini 4 Carbon | google-gemini-4-carbon | null |
| GLM 5.3 | null | null |
| GLM 5.3 Flash | null | null |
| GPT-6.1 Sol | openai-gpt-6-1-sol | null |
| GPT-6.1 Terra | openai-gpt-6-1-terra | null |
| GPT-6 Astra | openai-gpt-6-astra | null |
| GPT-6 Luna | openai-gpt-6-luna | null |
| gpt-oss-120b | null | null |
| Grok 4.7 | xai-grok-4-7 | null |
| Haiku 5.5 | null | null |
| Inkling 2 Small | thinking-machines-inkling-2-small | null |
| Kimi K3 | moonshot-kimi-k3 | null |
| Kimi K3.1 Pro | moonshot-kimi-k3-1-pro | null |
| MiniMax M3 | minimax-minimax-m3 | null |
| Mistral Large 4 | null | null |
| Muse Ember 1.0 | meta-muse-ember | null |
| Muse Spark Open | meta-muse-spark-open | null |
| Muse Wonder 1.0 | meta-muse-wonder | null |
| Nemotron 3.5 Super VL | null | null |
| Nemotron 3 Ultra | nvidia-nemotron-3-ultra | null |
| Opus 5.5 | anthropic-claude-opus-5-5 | null |
| Qwen 3.8 Max | alibaba-qwen3-8-max | null |
| Sonnet 5.5 | anthropic-claude-sonnet-5-5 | null |

<!-- C6-EFFORT-INFERENCE:START -->
## C6 effort inference — PENDING USER REVIEW

This tagged section is generated deterministically for `scale-swe-atlas`. Raw `profile.effort` remains unchanged; `productProfile.effort` is the transient product decision. Policy default: `default`.

### Cross-source inferences — PENDING USER REVIEW

| Model | Target candidate | Raw effort | Product effort | Basis source | Basis candidate |
|---|---|---|---|---|---|
| Fable 5.1 | `scale-swe-atlas:swe-atlas:fable-5-1` | — | `max` | anthropic-releases | anthropic-releases:cursorbench-4:fable51-max |
| Fable 5.2 | `scale-swe-atlas:swe-atlas:fable-5-2` | — | `max` | arc-prize | arc-prize:arc-agi-2:anthropic-claude-fable-5-2-max:arc-agi-2-v2-semi-private |
| Gemini 3.8 Flash | `scale-swe-atlas:swe-atlas:gemini-3-8-flash` | — | `high` | arc-prize | arc-prize:arc-agi-2:google-gemini-3-8-flash-high:arc-agi-2-v2-semi-private |
| Gemini 4 Argon | `scale-swe-atlas:swe-atlas:gemini-4-argon` | — | `high` | arc-prize | arc-prize:arc-agi-2:google-gemini-4-argon-high:arc-agi-2-v2-semi-private |
| Gemini 4 Carbon | `scale-swe-atlas:swe-atlas:gemini-4-carbon` | — | `high` | arc-prize | arc-prize:arc-agi-2:google-gemini-4-carbon-high:arc-agi-2-v2-semi-private |
| GPT-6 Astra | `scale-swe-atlas:swe-atlas:gpt-6-astra` | — | `max` | anthropic-releases | anthropic-releases:frontier-code-1-1:gpt6astra-max |
| GPT-6 Luna | `scale-swe-atlas:swe-atlas:gpt-6-luna` | — | `max` | arc-prize | arc-prize:arc-agi-2:openai-gpt-6-luna-max:arc-agi-2-v2-semi-private |
| GPT-6.1 Sol | `scale-swe-atlas:swe-atlas:gpt-6-1-sol` | — | `max` | arc-prize | arc-prize:arc-agi-2:openai-gpt-6-1-sol-max:arc-agi-2-v2-semi-private |
| GPT-6.1 Terra | `scale-swe-atlas:swe-atlas:gpt-6-1-terra` | — | `max` | artificial-analysis | artificial-analysis:aa-briefcase:gpt-6-1-terra |
| Grok 4.7 | `scale-swe-atlas:swe-atlas:grok-4-7` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:xai-grok-4-7-xhigh:arc-agi-2-v2-semi-private |
| Inkling 2 Small | `scale-swe-atlas:swe-atlas:inkling-2-small` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:thinky-inkling-2-small-xhigh:arc-agi-2-v2-semi-private |
| Kimi K3 | `scale-swe-atlas:swe-atlas:kimi-k3` | — | `max` | arc-prize | arc-prize:arc-agi-2:moonshot-kimi-k3-max:arc-agi-2-v2-semi-private |
| Kimi K3.1 Pro | `scale-swe-atlas:swe-atlas:kimi-k3-1-pro` | — | `max` | epoch-ai | epoch-ai:aime:moonshot-kimi-k3-1-pro-max-epoch-inspect-row-2 |
| MiniMax M3 | `scale-swe-atlas:swe-atlas:minimax-m3` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:minimax-m3-max-rank-110:1-0-6 |
| Muse Ember 1.0 | `scale-swe-atlas:swe-atlas:muse-ember-1-0` | — | `max` | artificial-analysis | artificial-analysis:aa-briefcase:muse-ember |
| Muse Spark Open | `scale-swe-atlas:swe-atlas:muse-spark-open` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:meta-muse-spark-open-xhigh:arc-agi-2-v2-semi-private |
| Muse Wonder 1.0 | `scale-swe-atlas:swe-atlas:muse-wonder-1-0` | — | `max` | artificial-analysis | artificial-analysis:aa-briefcase:muse-wonder |
| Opus 5.5 | `scale-swe-atlas:swe-atlas:opus-5-5` | — | `max` | anthropic-releases | anthropic-releases:cursorbench-4:opus55-max |
| Qwen 3.8 Max | `scale-swe-atlas:swe-atlas:qwen-3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| Sonnet 5.5 | `scale-swe-atlas:swe-atlas:sonnet-5-5` | — | `max` | anthropic-releases | anthropic-releases:sonnet-5-5:cursorbench-4:sonnet55-max |

### Unlabelled rows assigned the outside-the-ladder default

| Model | Target candidate | Raw effort | Product effort | Basis source | Basis candidate |
|---|---|---|---|---|---|
| Nemotron 3 Ultra | `scale-swe-atlas:swe-atlas:nemotron-3-ultra` | — | `default` | — | — |

<!-- C6-EFFORT-INFERENCE:END -->
