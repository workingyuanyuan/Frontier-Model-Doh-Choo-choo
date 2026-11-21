# GBENCH acquisition validation

- Source https://gertlabs.com/rankings?mode=agentic_coding; data https://gertlabs.com/api/v1/global/rankings?mode=agentic_coding&limit=500
- Observed 2026-11-21T12:40:54.066Z
- Evidence `sha256:c450f6b554136aa2ce0c42279fa87351e9ea8189ae952742a59395414713a076`
- Ranked rows 112; rendered Agentic Coding rows 100 (the page shows the first 100); non-model rows excluded 2 (custom/human, baseline/random); rows without a published score 0 (none); candidates 110; resolved identities 68.
- Only the Agentic Coding GScore is scored, as `gbench-agentic-coding` (2026-11-21 user decision). The combined, one-shot and decision-making scores remain in the raw artifact.
- GScore is published on 0–1 and multiplied by 100. It is a relative score: population-adjusted percentiles against the other ranked models, so earlier models move when models or games are added. GBENCH publishes no benchmark version, so `benchmarkVersion` is null.
- The response names no effort, reasoning, thinking or harness setting for any row; those fields stay null and product effort comes from the cross-source vote. Confidence bounds are kept in provenance.
- Identities resolve only through exact catalog display names or aliases matching the provider-qualified source `model_id`; the short `model` label is never used. Unresolved rows keep their raw name.

## Exact model identities

| Source model | Canonical identity | GScore |
|---|---|---:|
| anthropic/claude-fable-5 | anthropic-claude-fable-5 | 72.48 |
| anthropic/claude-fable-5-1 | anthropic-claude-fable-5-1 | 75.26 |
| anthropic/claude-fable-5-2 | anthropic-claude-fable-5-2 | 85.96 |
| anthropic/claude-haiku-5-5 | null | 56.77 |
| anthropic/claude-opus-4-5 | anthropic-claude-opus-4-5 | 42.71 |
| anthropic/claude-opus-4-6 | anthropic-claude-opus-4-6 | 38.26 |
| anthropic/claude-opus-4-7 | anthropic-claude-opus-4-7 | 45.06 |
| anthropic/claude-opus-4-8 | anthropic-claude-opus-4-8 | 52.15 |
| anthropic/claude-opus-5 | anthropic-claude-opus-5 | 75.97 |
| anthropic/claude-opus-5-5 | anthropic-claude-opus-5-5 | 79.62 |
| anthropic/claude-sonnet-4-6 | anthropic-claude-sonnet-4-6 | 49.66 |
| anthropic/claude-sonnet-5 | anthropic-claude-sonnet-5 | 39.87 |
| anthropic/claude-sonnet-5-5 | anthropic-claude-sonnet-5-5 | 69.74 |
| deepseek/deepseek-v4.1-flash | null | 62.73 |
| deepseek/deepseek-v4.1-flash-1017 | deepseek-deepseek-v4-1-flash-1017 | 60.58 |
| deepseek/deepseek-v4-flash | null | 34.44 |
| deepseek/deepseek-v4-flash-0731 | deepseek-deepseek-v4-flash | 48.16 |
| deepseek/deepseek-v4-pro | null | 30.93 |
| deepseek/deepseek-v4-pro-0813 | deepseek-deepseek-v4-pro | 46.13 |
| fireworks/ember-1 | null | 52.93 |
| google/gemini-3.1-flash-lite | null | 22.5 |
| google/gemini-3.1-pro-preview | google-gemini-3-1-pro-preview | 27.61 |
| google/gemini-3.1-pro-preview-customtools | null | 46.36 |
| google/gemini-3.5-flash | google-gemini-3-5-flash | 37.73 |
| google/gemini-3.5-flash-lite | google-gemini-3-5-flash-lite | 19.91 |
| google/gemini-3.6-flash | google-gemini-3-6-flash | 53.73 |
| google/gemini-3.7-flash | google-gemini-3-7-flash | 59.52 |
| google/gemini-3.8-flash | google-gemini-3-8-flash | 63.92 |
| google/gemini-3-flash-preview | null | 34.67 |
| google/gemini-3-pro-preview | google-gemini-3-pro-preview | 40.49 |
| google/gemini-4-argon | google-gemini-4-argon | 83.13 |
| google/gemini-4-carbon | google-gemini-4-carbon | 86.58 |
| google/gemini-4-hydrogen | google-gemini-4-hydrogen | 83.75 |
| google/gemini-4-neon | google-gemini-4-neon | 86.26 |
| google/gemma-4-26b-a4b-it | null | 8.99 |
| google/gemma-4-31b-it | null | 15.93 |
| inception/mercury-2.5 | null | 17.1 |
| inception/mercury-3 | null | 52.08 |
| kwaipilot/kat-coder-pro-v2.5 | null | 38.54 |
| meta/muse-ember | meta-muse-ember | 54.47 |
| meta/muse-glimmer-30b | null | 32.37 |
| meta/muse-spark-1.1 | meta-muse-spark-1-1 | 56.66 |
| meta/muse-spark-1.2 | meta-muse-spark-1-2 | 33.64 |
| meta/muse-spark-1.3 | meta-muse-spark-1-3 | 51.15 |
| meta/muse-spark-open | meta-muse-spark-open | 37.39 |
| meta/muse-wonder | meta-muse-wonder | 67.73 |
| minimax/minimax-m2.5 | null | 22.77 |
| minimax/minimax-m2.7 | null | 33.13 |
| minimax/minimax-m3 | minimax-minimax-m3 | 21.72 |
| minimax/minimax-m3.1-flash | null | 51.56 |
| mistral/mistral-large-4-0 | null | 35.24 |
| moonshot/kimi-k2.6 | moonshot-kimi-k2-6 | 52.18 |
| moonshot/kimi-k2.7-code | moonshot-kimi-k2-7-code | 34.44 |
| moonshot/kimi-k2-thinking | null | 7.65 |
| moonshot/kimi-k3 | moonshot-kimi-k3 | 64.79 |
| moonshot/kimi-k3.1-pro | moonshot-kimi-k3-1-pro | 64.98 |
| nvidia/nemotron-3.5-super-vl | null | 26.1 |
| openai/gpt-5.1-codex | null | 16.65 |
| openai/gpt-5.2-codex | openai-gpt-5-2-codex | 20.99 |
| openai/gpt-5.3-codex | openai-gpt-5-3-codex | 41.91 |
| openai/gpt-5.4 | openai-gpt-5-4 | 52.87 |
| openai/gpt-5.5 | openai-gpt-5-5 | 61.78 |
| openai/gpt-5.6-luna | openai-gpt-5-6-luna | 55.12 |
| openai/gpt-5.6-sol | openai-gpt-5-6-sol | 62.84 |
| openai/gpt-5.6-terra | openai-gpt-5-6-terra | 49.1 |
| openai/gpt-6.1-sol | openai-gpt-6-1-sol | 91.73 |
| openai/gpt-6.1-terra | openai-gpt-6-1-terra | 84.34 |
| openai/gpt-6.2-astra | openai-gpt-6-2-astra | 89.31 |
| openai/gpt-6.2-sol | openai-gpt-6-2-sol | 90.89 |
| openai/gpt-6-astra | openai-gpt-6-astra | 92.08 |
| openai/gpt-6-luna | openai-gpt-6-luna | 56.79 |
| openai/gpt-6-sol | openai-gpt-6-sol | 81.02 |
| openai/gpt-oss-120b | null | 17.52 |
| poolside/laguna-m.1 | null | 21.09 |
| poolside/laguna-s-2.1 | null | 9.37 |
| poolside/laguna-xs-2.1 | null | 14.91 |
| qwen/qwen3.5-397b-a17b | null | 26.26 |
| qwen/qwen3.6-27b | alibaba-qwen3-6-27b | 35.61 |
| qwen/qwen3.6-35b-a3b | null | 21.91 |
| qwen/qwen3.6-flash | null | 32.3 |
| qwen/qwen3.6-max-preview | null | 48.26 |
| qwen/qwen3.6-plus | alibaba-qwen3-6-plus | 33.56 |
| qwen/qwen3.7-flash | null | 23.09 |
| qwen/qwen3.7-max | alibaba-qwen3-7-max | 36.41 |
| qwen/qwen3.7-plus | alibaba-qwen3-7-plus | 37.55 |
| qwen/qwen3.8-27b | alibaba-qwen3-8-27b | 33.67 |
| qwen/qwen3.8-max | alibaba-qwen3-8-max | 47.34 |
| qwen/qwen3-max-thinking | null | 11.68 |
| qwen/qwen4-max | alibaba-qwen4-max | 64.15 |
| reflection/beam-1.0-501b-a23b | null | 26.37 |
| stepfun/step-3.7-flash | null | 18.76 |
| thinkingmachines/inkling | thinking-machines-inkling | 24.86 |
| thinkingmachines/inkling-2-small | thinking-machines-inkling-2-small | 44.74 |
| x.ai/grok-4.1-fast | null | 31.68 |
| x.ai/grok-4.20 | null | 13.06 |
| x.ai/grok-4.3 | xai-grok-4-3 | 16.44 |
| x.ai/grok-4.5 | xai-grok-4-5 | 38.89 |
| x.ai/grok-4.6 | xai-grok-4-6 | 71.44 |
| x.ai/grok-4.7 | xai-grok-4-7 | 68.74 |
| x.ai/grok-build-0.1 | xai-grok-build-0-1 | 22.14 |
| xiaomi/mimo-v2.5 | null | 37.3 |
| xiaomi/mimo-v2.5-pro | xiaomi-mimo-v2-5-pro | 40.28 |
| xiaomi/mimo-v2.6-flash | null | 61.74 |
| xiaomi/mimo-v2.6-pro | null | 64.29 |
| z.ai/glm-4.7 | null | 9.72 |
| z.ai/glm-5 | null | 19.41 |
| z.ai/glm-5.1 | zai-glm-5-1 | 32.88 |
| z.ai/glm-5.2 | zai-glm-5-2 | 51.26 |
| z.ai/glm-5.3 | null | 64.73 |
| z.ai/glm-5.3-flash | null | 48.82 |

<!-- C6-EFFORT-INFERENCE:START -->
## C6 effort inference — PENDING USER REVIEW

This tagged section is generated deterministically for `gbench`. Raw `profile.effort` remains unchanged; `productProfile.effort` is the transient product decision. Policy default: `default`.

### Cross-source inferences — PENDING USER REVIEW

| Model | Target candidate | Raw effort | Product effort | Basis source | Basis candidate |
|---|---|---|---|---|---|
| anthropic/claude-fable-5 | `gbench:gbench-agentic-coding:anthropic-claude-fable-5` | — | `max` | arc-prize | arc-prize:arc-agi-2:anthropic-claude-fable-5-max:arc-agi-2-v2-semi-private |
| anthropic/claude-fable-5-1 | `gbench:gbench-agentic-coding:anthropic-claude-fable-5-1` | — | `max` | anthropic-releases | anthropic-releases:cursorbench-4:fable51-max |
| anthropic/claude-fable-5-2 | `gbench:gbench-agentic-coding:anthropic-claude-fable-5-2` | — | `max` | agents-last-exam | agents-last-exam:agents-last-exam:claude-code-claude-fable-5-2-reasoning-max:1-1 |
| anthropic/claude-opus-4-5 | `gbench:gbench-agentic-coding:anthropic-claude-opus-4-5` | — | `max` | surge-riemann | surge-riemann:riemann-bench:claude-opus-4-5-adaptive-max |
| anthropic/claude-opus-4-6 | `gbench:gbench-agentic-coding:anthropic-claude-opus-4-6` | — | `max` | arc-prize | arc-prize:arc-agi-2:claude-opus-4-6-thinking-120k-max:arc-agi-2-v2-semi-private |
| anthropic/claude-opus-4-7 | `gbench:gbench-agentic-coding:anthropic-claude-opus-4-7` | — | `max` | artificial-analysis | artificial-analysis:aa-briefcase:claude-opus-4-7 |
| anthropic/claude-opus-4-8 | `gbench:gbench-agentic-coding:anthropic-claude-opus-4-8` | — | `max` | artificial-analysis | artificial-analysis:aa-briefcase:claude-opus-4-8 |
| anthropic/claude-opus-5 | `gbench:gbench-agentic-coding:anthropic-claude-opus-5` | — | `max` | anthropic-releases | anthropic-releases:cursorbench-4:opus5-max |
| anthropic/claude-opus-5-5 | `gbench:gbench-agentic-coding:anthropic-claude-opus-5-5` | — | `max` | agents-last-exam | agents-last-exam:agents-last-exam:claude-code-claude-opus-5-5-reasoning-max:1-1 |
| anthropic/claude-sonnet-4-6 | `gbench:gbench-agentic-coding:anthropic-claude-sonnet-4-6` | — | `max` | arc-prize | arc-prize:arc-agi-2:claude-sonnet-4-6-max:arc-agi-2-v2-semi-private |
| anthropic/claude-sonnet-5 | `gbench:gbench-agentic-coding:anthropic-claude-sonnet-5` | — | `max` | anthropic-releases | anthropic-releases:sonnet-5-5:cursorbench-4:sonnet5-max |
| anthropic/claude-sonnet-5-5 | `gbench:gbench-agentic-coding:anthropic-claude-sonnet-5-5` | — | `max` | anthropic-releases | anthropic-releases:sonnet-5-5:cursorbench-4:sonnet55-max |
| deepseek/deepseek-v4-flash-0731 | `gbench:gbench-agentic-coding:deepseek-deepseek-v4-flash-0731` | — | `max` | arc-prize | arc-prize:arc-agi-2:deepseek-v4-flash-0731-max:arc-agi-2-v2-semi-private |
| deepseek/deepseek-v4-pro-0813 | `gbench:gbench-agentic-coding:deepseek-deepseek-v4-pro-0813` | — | `max` | arc-prize | arc-prize:arc-agi-2:deepseek-v4-pro-0813-max:arc-agi-2-v2-semi-private |
| deepseek/deepseek-v4.1-flash-1017 | `gbench:gbench-agentic-coding:deepseek-deepseek-v4-1-flash-1017` | — | `max` | agents-last-exam | agents-last-exam:agents-last-exam:openclaw-cli-deepseek-deepseek-v4-1-flash-1017-reasoning-max:1-1 |
| google/gemini-3-pro-preview | `gbench:gbench-agentic-coding:google-gemini-3-pro-preview` | — | `high` | vals-ai | vals-ai:corpfin:google-gemini-3-pro-preview |
| google/gemini-3.1-pro-preview | `gbench:gbench-agentic-coding:google-gemini-3-1-pro-preview` | — | `high` | deepswe | deepswe-1-1:mini-swe-agent-gemini-3-1-pro-preview-high |
| google/gemini-3.5-flash | `gbench:gbench-agentic-coding:google-gemini-3-5-flash` | — | `high` | arc-prize | arc-prize:arc-agi-2:gemini-3-5-flash-high:arc-agi-2-v2-semi-private |
| google/gemini-3.5-flash-lite | `gbench:gbench-agentic-coding:google-gemini-3-5-flash-lite` | — | `high` | arc-prize | arc-prize:arc-agi-2:gemini-3-5-flash-lite-high:arc-agi-2-v2-semi-private |
| google/gemini-3.6-flash | `gbench:gbench-agentic-coding:google-gemini-3-6-flash` | — | `high` | arc-prize | arc-prize:arc-agi-2:gemini-3-6-flash-high:arc-agi-2-v2-semi-private |
| google/gemini-3.7-flash | `gbench:gbench-agentic-coding:google-gemini-3-7-flash` | — | `high` | arc-prize | arc-prize:arc-agi-2:google-gemini-3-7-flash-high:arc-agi-2-v2-semi-private |
| google/gemini-3.8-flash | `gbench:gbench-agentic-coding:google-gemini-3-8-flash` | — | `high` | arc-prize | arc-prize:arc-agi-2:google-gemini-3-8-flash-high:arc-agi-2-v2-semi-private |
| google/gemini-4-argon | `gbench:gbench-agentic-coding:google-gemini-4-argon` | — | `high` | agents-last-exam | agents-last-exam:agents-last-exam:ale-claw-gemini-4-argon-reasoning-high:1-1 |
| google/gemini-4-carbon | `gbench:gbench-agentic-coding:google-gemini-4-carbon` | — | `high` | agents-last-exam | agents-last-exam:agents-last-exam:ale-claw-gemini-4-carbon-reasoning-high:1-1 |
| google/gemini-4-hydrogen | `gbench:gbench-agentic-coding:google-gemini-4-hydrogen` | — | `xhigh` | agents-last-exam | agents-last-exam:agents-last-exam:antigravity-cli-gemini-4-hydrogen-reasoning-xhigh:1-1 |
| google/gemini-4-neon | `gbench:gbench-agentic-coding:google-gemini-4-neon` | — | `high` | artificial-analysis | artificial-analysis:aa-briefcase:gemini-4-neon-high |
| meta/muse-ember | `gbench:gbench-agentic-coding:meta-muse-ember` | — | `max` | artificial-analysis | artificial-analysis:aa-briefcase:muse-ember |
| meta/muse-spark-1.1 | `gbench:gbench-agentic-coding:meta-muse-spark-1-1` | — | `xhigh` | artificial-analysis | artificial-analysis:aa-briefcase:muse-spark-1-1 |
| meta/muse-spark-1.2 | `gbench:gbench-agentic-coding:meta-muse-spark-1-2` | — | `xhigh` | artificial-analysis | artificial-analysis:aa-briefcase:muse-spark-1-2 |
| meta/muse-spark-1.3 | `gbench:gbench-agentic-coding:meta-muse-spark-1-3` | — | `max` | artificial-analysis | artificial-analysis:aa-briefcase:muse-spark-1-3 |
| meta/muse-spark-open | `gbench:gbench-agentic-coding:meta-muse-spark-open` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:meta-muse-spark-open-xhigh:arc-agi-2-v2-semi-private |
| meta/muse-wonder | `gbench:gbench-agentic-coding:meta-muse-wonder` | — | `max` | artificial-analysis | artificial-analysis:aa-briefcase:muse-wonder |
| minimax/minimax-m3 | `gbench:gbench-agentic-coding:minimax-minimax-m3` | — | `max` | scale-swe-atlas | scale-swe-atlas:swe-atlas:minimax-m3-mini-swe-agent-max |
| moonshot/kimi-k2.7-code | `gbench:gbench-agentic-coding:moonshot-kimi-k2-7-code` | — | `max` | surge-chartography | surge-chartography:chartography:kimi-k2-7-code-max-reasoning |
| moonshot/kimi-k3 | `gbench:gbench-agentic-coding:moonshot-kimi-k3` | — | `max` | agents-last-exam | agents-last-exam:agents-last-exam:kimi-code-kimi-k3-reasoning-max:1-1 |
| moonshot/kimi-k3.1-pro | `gbench:gbench-agentic-coding:moonshot-kimi-k3-1-pro` | — | `max` | epoch-ai | epoch-ai:aime:moonshot-kimi-k3-1-pro-max-epoch-inspect-row-4 |
| openai/gpt-5.2-codex | `gbench:gbench-agentic-coding:openai-gpt-5-2-codex` | — | `xhigh` | artificial-analysis | artificial-analysis:aa-lcr:gpt-5-2-codex |
| openai/gpt-5.3-codex | `gbench:gbench-agentic-coding:openai-gpt-5-3-codex` | — | `xhigh` | vals-ai | vals-ai:ioi:openai-gpt-5-3-codex |
| openai/gpt-5.4 | `gbench:gbench-agentic-coding:openai-gpt-5-4` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:gpt-5-4-xhigh:arc-agi-2-v2-semi-private |
| openai/gpt-5.5 | `gbench:gbench-agentic-coding:openai-gpt-5-5` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:gpt-5-5-2026-04-22-thinking-xhigh:arc-agi-2-v2-semi-private |
| openai/gpt-5.6-luna | `gbench:gbench-agentic-coding:openai-gpt-5-6-luna` | — | `max` | arc-prize | arc-prize:arc-agi-2:openai-gpt-5-6-luna-max:arc-agi-2-v2-semi-private |
| openai/gpt-5.6-sol | `gbench:gbench-agentic-coding:openai-gpt-5-6-sol` | — | `max` | agents-last-exam | agents-last-exam:agents-last-exam:codex-gpt-5-6-sol-reasoning-max:1-1 |
| openai/gpt-5.6-terra | `gbench:gbench-agentic-coding:openai-gpt-5-6-terra` | — | `max` | arc-prize | arc-prize:arc-agi-2:openai-gpt-5-6-terra-max:arc-agi-2-v2-semi-private |
| openai/gpt-6-astra | `gbench:gbench-agentic-coding:openai-gpt-6-astra` | — | `max` | agents-last-exam | agents-last-exam:agents-last-exam:codex-gpt-6-astra-reasoning-max:1-1 |
| openai/gpt-6-luna | `gbench:gbench-agentic-coding:openai-gpt-6-luna` | — | `max` | arc-prize | arc-prize:arc-agi-2:openai-gpt-6-luna-max:arc-agi-2-v2-semi-private |
| openai/gpt-6-sol | `gbench:gbench-agentic-coding:openai-gpt-6-sol` | — | `max` | anthropic-releases | anthropic-releases:sonnet-5-5:frontier-code-1-1:gpt6sol-max |
| openai/gpt-6.1-sol | `gbench:gbench-agentic-coding:openai-gpt-6-1-sol` | — | `max` | arc-prize | arc-prize:arc-agi-2:openai-gpt-6-1-sol-max:arc-agi-2-v2-semi-private |
| openai/gpt-6.1-terra | `gbench:gbench-agentic-coding:openai-gpt-6-1-terra` | — | `max` | agents-last-exam | agents-last-exam:agents-last-exam:codex-gpt-6-1-terra-reasoning-max:1-1 |
| openai/gpt-6.2-astra | `gbench:gbench-agentic-coding:openai-gpt-6-2-astra` | — | `max` | agents-last-exam | agents-last-exam:agents-last-exam:codex-gpt-6-2-astra-reasoning-max:1-1 |
| openai/gpt-6.2-sol | `gbench:gbench-agentic-coding:openai-gpt-6-2-sol` | — | `max` | agents-last-exam | agents-last-exam:agents-last-exam:codex-gpt-6-2-sol-reasoning-max:1-1 |
| qwen/qwen3.8-27b | `gbench:gbench-agentic-coding:qwen-qwen3-8-27b` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:alibaba-qwen3-8-27b-xhigh:arc-agi-2-v2-semi-private |
| qwen/qwen3.8-max | `gbench:gbench-agentic-coding:qwen-qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| qwen/qwen4-max | `gbench:gbench-agentic-coding:qwen-qwen4-max` | — | `xhigh` | livebench | livebench-2026-11-06:livebench-browser:qwen4-max |
| thinkingmachines/inkling | `gbench:gbench-agentic-coding:thinkingmachines-inkling` | — | `max` | livebench | livebench-2026-11-06:livebench-browser:inkling |
| thinkingmachines/inkling-2-small | `gbench:gbench-agentic-coding:thinkingmachines-inkling-2-small` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:thinky-inkling-2-small-xhigh:arc-agi-2-v2-semi-private |
| x.ai/grok-4.3 | `gbench:gbench-agentic-coding:x-ai-grok-4-3` | — | `high` | artificial-analysis | artificial-analysis:aa-briefcase:grok-4-3 |
| x.ai/grok-4.5 | `gbench:gbench-agentic-coding:x-ai-grok-4-5` | — | `high` | arc-prize | arc-prize:arc-agi-2:xai-grok-4-5-high:arc-agi-2-v2-semi-private |
| x.ai/grok-4.6 | `gbench:gbench-agentic-coding:x-ai-grok-4-6` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:xai-grok-4-6-xhigh:arc-agi-2-v2-semi-private |
| x.ai/grok-4.7 | `gbench:gbench-agentic-coding:x-ai-grok-4-7` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:xai-grok-4-7-xhigh:arc-agi-2-v2-semi-private |
| z.ai/glm-5.1 | `gbench:gbench-agentic-coding:z-ai-glm-5-1` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:glm-5-1-max-rank-117:1-0-6 |
| z.ai/glm-5.2 | `gbench:gbench-agentic-coding:z-ai-glm-5-2` | — | `max` | artificial-analysis | artificial-analysis:aa-briefcase:glm-5-2 |

### Unlabelled rows assigned the outside-the-ladder default

| Model | Target candidate | Raw effort | Product effort | Basis source | Basis candidate |
|---|---|---|---|---|---|
| moonshot/kimi-k2.6 | `gbench:gbench-agentic-coding:moonshot-kimi-k2-6` | — | `default` | — | — |
| qwen/qwen3.6-27b | `gbench:gbench-agentic-coding:qwen-qwen3-6-27b` | — | `default` | — | — |
| qwen/qwen3.6-plus | `gbench:gbench-agentic-coding:qwen-qwen3-6-plus` | — | `default` | — | — |
| qwen/qwen3.7-max | `gbench:gbench-agentic-coding:qwen-qwen3-7-max` | — | `default` | — | — |
| qwen/qwen3.7-plus | `gbench:gbench-agentic-coding:qwen-qwen3-7-plus` | — | `default` | — | — |
| x.ai/grok-build-0.1 | `gbench:gbench-agentic-coding:x-ai-grok-build-0-1` | — | `default` | — | — |
| xiaomi/mimo-v2.5-pro | `gbench:gbench-agentic-coding:xiaomi-mimo-v2-5-pro` | — | `default` | — | — |

<!-- C6-EFFORT-INFERENCE:END -->
