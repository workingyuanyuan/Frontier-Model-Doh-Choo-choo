# LiveBench acquisition validation

LiveBench now publishes two generations. Release 2026-10-25 (LiveBench 2.0) supplies seven suites; the frozen 1.0 release 2026-06-25 keeps the benchmarks that 2.0 dropped.

## Exact counts

| Check | Count |
|---|---:|
| 2.0 model rows (`https://livebench.ai/data/20261025/table.csv?v=1793326121`) | 32 |
| 2.0 suite candidates | 224 |
| 2.0 blank (still running) cells | 0 |
| 1.0 model rows (`https://livebench.ai/v1/table_2026_06_25.csv?v=1793326121`) | 71 |
| 1.0 retained candidates (Language, IF, Mathematics) | 213 |
| 1.0 Reasoning candidates excluded as superseded | 71 |
| Cost records | 144 |
| Distinct unresolved raw model names | 25 |

## LiveBench 2.0 suites

| Suite | Benchmark ID | Tools |
|---|---|---|
| Long Agentic | `livebench-long-agentic` | yes |
| Reasoning | `livebench-reasoning` | no |
| Coding | `livebench-coding` | yes |
| Browser | `livebench-browser` | yes |
| Data Analysis | `livebench-data-analysis` | no |
| Research | `livebench-research` | yes |
| Design | `livebench-design` | yes |

- Each cell is the official suite score (mean task score 0–100, single run); unmeasured tasks score 0 upstream and a blank cell is not materialized.
- Effort comes from the 2.0 model registry in the application bundle; models run at their highest supported effort unless the registry says otherwise.
- `livebench-reasoning` continues on the 2.0 Reasoning suite (same task family, new release).
- The release's own Overall weights Long Agentic ×2, Coding ×1.5, Design ×1.5 and every other suite ×1 (`_overall_weights`); Overall is not materialized, so the weights do not affect suite scores.
- Retained 1.0 rows compared with the saved snapshot by candidate ID and score: none removed or changed; 0 added since the last capture.
- 2.0 cost per task is Σ suite cost / Σ suite tasks, as the methodology defines it. 1.0 cost-per-successful-task records are kept but EXCLUDED, so the two generations are never blended.

## Unresolved model names

- `claude-haiku-5-5-max-effort`
- `claude-haiku-5-5-xhigh-effort`
- `claude-haiku-5.5`
- `deepseek-v4-flash`
- `deepseek-v4-flash-vision-exp`
- `deepseek-v4-pro`
- `deepseek-v4.1-flash-1017`
- `deepseek-v4.1-flash-max`
- `gemma-4-31b`
- `glm-5.3`
- `glm-5.3-flash`
- `mimo-v2.6-pro`
- `minimax-m3.1-flash`
- `mistral-large-4`
- `mistral-large-4-0`
- `mistral-large-4-high`
- `muse-spark-open`
- `nemotron-3.5-lightning-30b-a3b`
- `nemotron-super-vl-3.5`
- `nemotron-super-vl-3.5-nvfp4`
- `ox-alpha-max`
- `qwen3.8-flash-next`
- `smaug-agentic`
- `smaug-nemotron-3.5-nvfp4`
- `step-5-preview`

## Visible comparison

- LiveBench 2.0 rendered leaderboard rows: 32; table rows: 32.
- LiveBench 1.0 release 2026-06-25 rendered rows with Include finetunes enabled: 65; export rows 71 minus superseded export-only names (deepseek-v4-flash, deepseek-v4-pro) and 4 collapsed variant rows.
- Result: both rendered counts matched.

## Snapshot delta

| Check | Previous | Refreshed | Delta |
|---|---:|---:|---:|
| Raw model profiles | 97 | 98 | +1 |
| Candidate results | 501 | 508 | +7 |
| Materialized costs | 144 | 144 | +0 |

Previous content-addressed artifacts remain preserved; this report compares the prior tracked snapshot with the refreshed snapshot.

<!-- C6-EFFORT-INFERENCE:START -->
## C6 effort inference — PENDING USER REVIEW

This tagged section is generated deterministically for `livebench`. Raw `profile.effort` remains unchanged; `productProfile.effort` is the transient product decision. Policy default: `default`.

### Cross-source inferences — PENDING USER REVIEW

| Model | Target candidate | Raw effort | Product effort | Basis source | Basis candidate |
|---|---|---|---|---|---|
| deepseek-v4-flash-0731 | `livebench-2026-06-25:livebench-instruction-following:deepseek-v4-flash-0731` | — | `max` | arc-prize | arc-prize:arc-agi-2:deepseek-v4-flash-0731-max:arc-agi-2-v2-semi-private |
| deepseek-v4-flash-0731 | `livebench-2026-06-25:livebench-language:deepseek-v4-flash-0731` | — | `max` | arc-prize | arc-prize:arc-agi-2:deepseek-v4-flash-0731-max:arc-agi-2-v2-semi-private |
| deepseek-v4-flash-0731 | `livebench-2026-06-25:livebench-mathematics:deepseek-v4-flash-0731` | — | `max` | arc-prize | arc-prize:arc-agi-2:deepseek-v4-flash-0731-max:arc-agi-2-v2-semi-private |
| deepseek-v4-flash-0731 | `livebench-2026-06-25:livebench-reasoning:deepseek-v4-flash-0731` | — | `max` | arc-prize | arc-prize:arc-agi-2:deepseek-v4-flash-0731-max:arc-agi-2-v2-semi-private |
| deepseek-v4-pro-0813 | `livebench-2026-06-25:livebench-instruction-following:deepseek-v4-pro-0813` | — | `max` | arc-prize | arc-prize:arc-agi-2:deepseek-v4-pro-0813-max:arc-agi-2-v2-semi-private |
| deepseek-v4-pro-0813 | `livebench-2026-06-25:livebench-language:deepseek-v4-pro-0813` | — | `max` | arc-prize | arc-prize:arc-agi-2:deepseek-v4-pro-0813-max:arc-agi-2-v2-semi-private |
| deepseek-v4-pro-0813 | `livebench-2026-06-25:livebench-mathematics:deepseek-v4-pro-0813` | — | `max` | arc-prize | arc-prize:arc-agi-2:deepseek-v4-pro-0813-max:arc-agi-2-v2-semi-private |
| deepseek-v4-pro-0813 | `livebench-2026-06-25:livebench-reasoning:deepseek-v4-pro-0813` | — | `max` | arc-prize | arc-prize:arc-agi-2:deepseek-v4-pro-0813-max:arc-agi-2-v2-semi-private |
| glm-5.2 | `livebench-2026-06-25:livebench-instruction-following:glm-5-2` | — | `max` | artificial-analysis | artificial-analysis:aa-briefcase:glm-5-2 |
| glm-5.2 | `livebench-2026-06-25:livebench-language:glm-5-2` | — | `max` | artificial-analysis | artificial-analysis:aa-briefcase:glm-5-2 |
| glm-5.2 | `livebench-2026-06-25:livebench-mathematics:glm-5-2` | — | `max` | artificial-analysis | artificial-analysis:aa-briefcase:glm-5-2 |
| glm-5.2 | `livebench-2026-06-25:livebench-reasoning:glm-5-2` | — | `max` | artificial-analysis | artificial-analysis:aa-briefcase:glm-5-2 |
| gpt-5.2-codex | `livebench-2026-06-25:livebench-instruction-following:gpt-5-2-codex` | — | `xhigh` | artificial-analysis | artificial-analysis:aa-lcr:gpt-5-2-codex |
| gpt-5.2-codex | `livebench-2026-06-25:livebench-language:gpt-5-2-codex` | — | `xhigh` | artificial-analysis | artificial-analysis:aa-lcr:gpt-5-2-codex |
| gpt-5.2-codex | `livebench-2026-06-25:livebench-mathematics:gpt-5-2-codex` | — | `xhigh` | artificial-analysis | artificial-analysis:aa-lcr:gpt-5-2-codex |
| gpt-5.2-codex | `livebench-2026-06-25:livebench-reasoning:gpt-5-2-codex` | — | `xhigh` | artificial-analysis | artificial-analysis:aa-lcr:gpt-5-2-codex |
| grok-4.3 | `livebench-2026-06-25:livebench-instruction-following:grok-4-3` | — | `high` | artificial-analysis | artificial-analysis:aa-briefcase:grok-4-3 |
| grok-4.3 | `livebench-2026-06-25:livebench-language:grok-4-3` | — | `high` | artificial-analysis | artificial-analysis:aa-briefcase:grok-4-3 |
| grok-4.3 | `livebench-2026-06-25:livebench-mathematics:grok-4-3` | — | `high` | artificial-analysis | artificial-analysis:aa-briefcase:grok-4-3 |
| grok-4.3 | `livebench-2026-06-25:livebench-reasoning:grok-4-3` | — | `high` | artificial-analysis | artificial-analysis:aa-briefcase:grok-4-3 |
| grok-4.5 | `livebench-2026-06-25:livebench-instruction-following:grok-4-5` | — | `high` | arc-prize | arc-prize:arc-agi-2:xai-grok-4-5-high:arc-agi-2-v2-semi-private |
| grok-4.5 | `livebench-2026-06-25:livebench-language:grok-4-5` | — | `high` | arc-prize | arc-prize:arc-agi-2:xai-grok-4-5-high:arc-agi-2-v2-semi-private |
| grok-4.5 | `livebench-2026-06-25:livebench-mathematics:grok-4-5` | — | `high` | arc-prize | arc-prize:arc-agi-2:xai-grok-4-5-high:arc-agi-2-v2-semi-private |
| grok-4.5 | `livebench-2026-06-25:livebench-reasoning:grok-4-5` | — | `high` | arc-prize | arc-prize:arc-agi-2:xai-grok-4-5-high:arc-agi-2-v2-semi-private |
| grok-4.6 | `livebench-2026-06-25:livebench-instruction-following:grok-4-6` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:xai-grok-4-6-xhigh:arc-agi-2-v2-semi-private |
| grok-4.6 | `livebench-2026-06-25:livebench-language:grok-4-6` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:xai-grok-4-6-xhigh:arc-agi-2-v2-semi-private |
| grok-4.6 | `livebench-2026-06-25:livebench-mathematics:grok-4-6` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:xai-grok-4-6-xhigh:arc-agi-2-v2-semi-private |
| grok-4.6 | `livebench-2026-06-25:livebench-reasoning:grok-4-6` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:xai-grok-4-6-xhigh:arc-agi-2-v2-semi-private |
| kimi-k2.7-code | `livebench-2026-06-25:livebench-instruction-following:kimi-k2-7-code` | — | `max` | surge-dayjob-finance | surge-dayjob-finance:dayjob-finance:kimi-k2-7-code-max-reasoning |
| kimi-k2.7-code | `livebench-2026-06-25:livebench-language:kimi-k2-7-code` | — | `max` | surge-dayjob-finance | surge-dayjob-finance:dayjob-finance:kimi-k2-7-code-max-reasoning |
| kimi-k2.7-code | `livebench-2026-06-25:livebench-mathematics:kimi-k2-7-code` | — | `max` | surge-dayjob-finance | surge-dayjob-finance:dayjob-finance:kimi-k2-7-code-max-reasoning |
| kimi-k2.7-code | `livebench-2026-06-25:livebench-reasoning:kimi-k2-7-code` | — | `max` | surge-dayjob-finance | surge-dayjob-finance:dayjob-finance:kimi-k2-7-code-max-reasoning |
| kimi-k3 | `livebench-2026-06-25:livebench-instruction-following:kimi-k3` | — | `max` | arc-prize | arc-prize:arc-agi-2:moonshot-kimi-k3-max:arc-agi-2-v2-semi-private |
| kimi-k3 | `livebench-2026-06-25:livebench-language:kimi-k3` | — | `max` | arc-prize | arc-prize:arc-agi-2:moonshot-kimi-k3-max:arc-agi-2-v2-semi-private |
| kimi-k3 | `livebench-2026-06-25:livebench-mathematics:kimi-k3` | — | `max` | arc-prize | arc-prize:arc-agi-2:moonshot-kimi-k3-max:arc-agi-2-v2-semi-private |
| kimi-k3 | `livebench-2026-06-25:livebench-reasoning:kimi-k3` | — | `max` | arc-prize | arc-prize:arc-agi-2:moonshot-kimi-k3-max:arc-agi-2-v2-semi-private |
| minimax-m3 | `livebench-2026-06-25:livebench-instruction-following:minimax-m3` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:minimax-m3-max-rank-102:1-0-6 |
| minimax-m3 | `livebench-2026-06-25:livebench-language:minimax-m3` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:minimax-m3-max-rank-102:1-0-6 |
| minimax-m3 | `livebench-2026-06-25:livebench-mathematics:minimax-m3` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:minimax-m3-max-rank-102:1-0-6 |
| minimax-m3 | `livebench-2026-06-25:livebench-reasoning:minimax-m3` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:minimax-m3-max-rank-102:1-0-6 |
| qwen3.8-27b | `livebench-2026-06-25:livebench-instruction-following:qwen3-8-27b` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:alibaba-qwen3-8-27b-xhigh:arc-agi-2-v2-semi-private |
| qwen3.8-27b | `livebench-2026-06-25:livebench-language:qwen3-8-27b` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:alibaba-qwen3-8-27b-xhigh:arc-agi-2-v2-semi-private |
| qwen3.8-27b | `livebench-2026-06-25:livebench-mathematics:qwen3-8-27b` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:alibaba-qwen3-8-27b-xhigh:arc-agi-2-v2-semi-private |
| qwen3.8-27b | `livebench-2026-06-25:livebench-reasoning:qwen3-8-27b` | — | `xhigh` | arc-prize | arc-prize:arc-agi-2:alibaba-qwen3-8-27b-xhigh:arc-agi-2-v2-semi-private |
| qwen3.8-max | `livebench-2026-06-25:livebench-instruction-following:qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| qwen3.8-max | `livebench-2026-06-25:livebench-language:qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| qwen3.8-max | `livebench-2026-06-25:livebench-mathematics:qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| qwen3.8-max | `livebench-2026-06-25:livebench-reasoning:qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |

### Unlabelled rows assigned the outside-the-ladder default

| Model | Target candidate | Raw effort | Product effort | Basis source | Basis candidate |
|---|---|---|---|---|---|
| grok-build-0.1 | `livebench-2026-06-25:livebench-instruction-following:grok-build-0-1` | — | `default` | — | — |
| grok-build-0.1 | `livebench-2026-06-25:livebench-language:grok-build-0-1` | — | `default` | — | — |
| grok-build-0.1 | `livebench-2026-06-25:livebench-mathematics:grok-build-0-1` | — | `default` | — | — |
| grok-build-0.1 | `livebench-2026-06-25:livebench-reasoning:grok-build-0-1` | — | `default` | — | — |
| kimi-k2.6-thinking | `livebench-2026-06-25:livebench-instruction-following:kimi-k2-6-thinking` | — | `default` | — | — |
| kimi-k2.6-thinking | `livebench-2026-06-25:livebench-language:kimi-k2-6-thinking` | — | `default` | — | — |
| kimi-k2.6-thinking | `livebench-2026-06-25:livebench-mathematics:kimi-k2-6-thinking` | — | `default` | — | — |
| kimi-k2.6-thinking | `livebench-2026-06-25:livebench-reasoning:kimi-k2-6-thinking` | — | `default` | — | — |
| nemotron-3-ultra-550b-a55b | `livebench-2026-06-25:livebench-instruction-following:nemotron-3-ultra-550b-a55b` | — | `default` | — | — |
| nemotron-3-ultra-550b-a55b | `livebench-2026-06-25:livebench-language:nemotron-3-ultra-550b-a55b` | — | `default` | — | — |
| nemotron-3-ultra-550b-a55b | `livebench-2026-06-25:livebench-mathematics:nemotron-3-ultra-550b-a55b` | — | `default` | — | — |
| nemotron-3-ultra-550b-a55b | `livebench-2026-06-25:livebench-reasoning:nemotron-3-ultra-550b-a55b` | — | `default` | — | — |
| qwen3.6-27b | `livebench-2026-06-25:livebench-instruction-following:qwen3-6-27b` | — | `default` | — | — |
| qwen3.6-27b | `livebench-2026-06-25:livebench-language:qwen3-6-27b` | — | `default` | — | — |
| qwen3.6-27b | `livebench-2026-06-25:livebench-mathematics:qwen3-6-27b` | — | `default` | — | — |
| qwen3.6-27b | `livebench-2026-06-25:livebench-reasoning:qwen3-6-27b` | — | `default` | — | — |
| qwen3.6-plus | `livebench-2026-06-25:livebench-instruction-following:qwen3-6-plus` | — | `default` | — | — |
| qwen3.6-plus | `livebench-2026-06-25:livebench-language:qwen3-6-plus` | — | `default` | — | — |
| qwen3.6-plus | `livebench-2026-06-25:livebench-mathematics:qwen3-6-plus` | — | `default` | — | — |
| qwen3.6-plus | `livebench-2026-06-25:livebench-reasoning:qwen3-6-plus` | — | `default` | — | — |
| qwen3.7-max | `livebench-2026-06-25:livebench-instruction-following:qwen3-7-max` | — | `default` | — | — |
| qwen3.7-max | `livebench-2026-06-25:livebench-language:qwen3-7-max` | — | `default` | — | — |
| qwen3.7-max | `livebench-2026-06-25:livebench-mathematics:qwen3-7-max` | — | `default` | — | — |
| qwen3.7-max | `livebench-2026-06-25:livebench-reasoning:qwen3-7-max` | — | `default` | — | — |
| smaug-flash | `livebench-2026-06-25:livebench-instruction-following:smaug-flash` | — | `default` | — | — |
| smaug-flash | `livebench-2026-06-25:livebench-language:smaug-flash` | — | `default` | — | — |
| smaug-flash | `livebench-2026-06-25:livebench-mathematics:smaug-flash` | — | `default` | — | — |
| smaug-flash | `livebench-2026-06-25:livebench-reasoning:smaug-flash` | — | `default` | — | — |
| smaug-mini | `livebench-2026-06-25:livebench-instruction-following:smaug-mini` | — | `default` | — | — |
| smaug-mini | `livebench-2026-06-25:livebench-language:smaug-mini` | — | `default` | — | — |
| smaug-mini | `livebench-2026-06-25:livebench-mathematics:smaug-mini` | — | `default` | — | — |
| smaug-mini | `livebench-2026-06-25:livebench-reasoning:smaug-mini` | — | `default` | — | — |

<!-- C6-EFFORT-INFERENCE:END -->
