# LiveBench acquisition validation

- Release: `2026-06-25` (cacheVersion `1788552585`) dynamically extracted from `https://livebench.ai/static/js/main.4035919d.js`
- Evidence: `https://livebench.ai/table_2026_06_25.csv?v=1788552585` and `https://livebench.ai/categories_2026_06_25.json?v=1788552585`

## Exact counts

| Check | Count |
|---|---:|
| Raw model rows in table CSV | 54 |
| Approved scoring categories | 4 (Reasoning, Mathematics, Language, IF) |
| Excluded/Unapproved categories | 3 (Coding, Agentic Coding, Data Analysis) |
| Generated CandidateResults | 216 |
| Canonically resolved candidates | 172 |
| Canonically unresolved candidates | 44 |
| Distinct unresolved raw model names | 11 |

## Model identity resolution

Full raw-name catalog matches are attempted first. Remaining names use only exact effort-suffix, Claude thinking/date, dated-effort, thinking-marker, or dated-model-alias transforms; no fuzzy matching is performed.

- `claude-fable-5-1-max-effort`: no exact catalog match; effort-suffix transform produced "claude-fable-5-1", which is not an exact catalog slug
- `deepseek-v4-flash`: full slug "deepseek-v4-flash" has no documented exact LiveBench transform to a catalog slug
- `deepseek-v4-flash-vision-exp`: full slug "deepseek-v4-flash-vision-exp" has no documented exact LiveBench transform to a catalog slug
- `deepseek-v4-pro`: full slug "deepseek-v4-pro" has no documented exact LiveBench transform to a catalog slug
- `gemini-3.8-flash-high`: no exact catalog match; effort-suffix transform produced "gemini-3-8-flash", which is not an exact catalog slug
- `glm-5.3`: full slug "glm-5-3" has no documented exact LiveBench transform to a catalog slug
- `glm-5.3-flash`: full slug "glm-5-3-flash" has no documented exact LiveBench transform to a catalog slug
- `muse-spark-1.3-xhigh`: no exact catalog match; effort-suffix transform produced "muse-spark-1-3", which is not an exact catalog slug
- `ox-alpha-max`: no exact catalog match; effort-suffix transform produced "ox-alpha", which is not an exact catalog slug
- `qwen3.8-flash-next`: full slug "qwen3-8-flash-next" has no documented exact LiveBench transform to a catalog slug
- `smaug-agentic`: full slug "smaug-agentic" has no documented exact LiveBench transform to a catalog slug

## Category scope boundary

Per SPEC.md §9.1 and §5.2, only the 4 approved categories (Reasoning, Mathematics, Language, Instruction Following) enter scoring. Coding, Agentic Coding, and Data Analysis categories are unapproved and excluded.

## Discrepancies and notes

- None. All 54 model rows have complete task coverage across the 4 approved categories.

## Visible comparison

- Fresh rendered page profile count (Include finetunes enabled): 52
- Complete table export profile count: 54
- Superseded export-only names, absent from the current rendered leaderboard: deepseek-v4-flash, deepseek-v4-pro
- Current export profiles after the existing superseded-build policy: 52
- Result: current profiles matched; raw export-only rows remain traceable and unresolved.

## Snapshot delta

| Check | Previous | Refreshed | Delta |
|---|---:|---:|---:|
| Raw model profiles | 44 | 54 | +10 |
| Candidate results | 176 | 216 | +40 |
| Cost export profiles | 44 | 54 | +10 |
| Materialized costs | 44 | 46 | +2 |

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
| gpt-5.2-codex | `livebench-2026-06-25:livebench-instruction-following:gpt-5-2-codex` | — | `high` | vals-ai | vals-ai:swe-bench:openai-gpt-5-2-codex |
| gpt-5.2-codex | `livebench-2026-06-25:livebench-language:gpt-5-2-codex` | — | `high` | vals-ai | vals-ai:swe-bench:openai-gpt-5-2-codex |
| gpt-5.2-codex | `livebench-2026-06-25:livebench-mathematics:gpt-5-2-codex` | — | `high` | vals-ai | vals-ai:swe-bench:openai-gpt-5-2-codex |
| gpt-5.2-codex | `livebench-2026-06-25:livebench-reasoning:gpt-5-2-codex` | — | `high` | vals-ai | vals-ai:swe-bench:openai-gpt-5-2-codex |
| grok-4.3 | `livebench-2026-06-25:livebench-instruction-following:grok-4-3` | — | `medium` | artificial-analysis | artificial-analysis:aa-lcr:grok-4-3-medium |
| grok-4.3 | `livebench-2026-06-25:livebench-language:grok-4-3` | — | `medium` | artificial-analysis | artificial-analysis:aa-lcr:grok-4-3-medium |
| grok-4.3 | `livebench-2026-06-25:livebench-mathematics:grok-4-3` | — | `medium` | artificial-analysis | artificial-analysis:aa-lcr:grok-4-3-medium |
| grok-4.3 | `livebench-2026-06-25:livebench-reasoning:grok-4-3` | — | `medium` | artificial-analysis | artificial-analysis:aa-lcr:grok-4-3-medium |
| grok-4.5 | `livebench-2026-06-25:livebench-instruction-following:grok-4-5` | — | `high` | arc-prize | arc-prize:arc-agi-2:xai-grok-4-5-high:arc-agi-2-v2-semi-private |
| grok-4.5 | `livebench-2026-06-25:livebench-language:grok-4-5` | — | `high` | arc-prize | arc-prize:arc-agi-2:xai-grok-4-5-high:arc-agi-2-v2-semi-private |
| grok-4.5 | `livebench-2026-06-25:livebench-mathematics:grok-4-5` | — | `high` | arc-prize | arc-prize:arc-agi-2:xai-grok-4-5-high:arc-agi-2-v2-semi-private |
| grok-4.5 | `livebench-2026-06-25:livebench-reasoning:grok-4-5` | — | `high` | arc-prize | arc-prize:arc-agi-2:xai-grok-4-5-high:arc-agi-2-v2-semi-private |
| grok-4.6 | `livebench-2026-06-25:livebench-instruction-following:grok-4-6` | — | `high` | arc-prize | arc-prize:arc-agi-2:xai-grok-4-6-high:arc-agi-2-v2-semi-private |
| grok-4.6 | `livebench-2026-06-25:livebench-language:grok-4-6` | — | `high` | arc-prize | arc-prize:arc-agi-2:xai-grok-4-6-high:arc-agi-2-v2-semi-private |
| grok-4.6 | `livebench-2026-06-25:livebench-mathematics:grok-4-6` | — | `high` | arc-prize | arc-prize:arc-agi-2:xai-grok-4-6-high:arc-agi-2-v2-semi-private |
| grok-4.6 | `livebench-2026-06-25:livebench-reasoning:grok-4-6` | — | `high` | arc-prize | arc-prize:arc-agi-2:xai-grok-4-6-high:arc-agi-2-v2-semi-private |
| kimi-k3 | `livebench-2026-06-25:livebench-instruction-following:kimi-k3` | — | `max` | arc-prize | arc-prize:arc-agi-2:moonshot-kimi-k3-max:arc-agi-2-v2-semi-private |
| kimi-k3 | `livebench-2026-06-25:livebench-language:kimi-k3` | — | `max` | arc-prize | arc-prize:arc-agi-2:moonshot-kimi-k3-max:arc-agi-2-v2-semi-private |
| kimi-k3 | `livebench-2026-06-25:livebench-mathematics:kimi-k3` | — | `max` | arc-prize | arc-prize:arc-agi-2:moonshot-kimi-k3-max:arc-agi-2-v2-semi-private |
| kimi-k3 | `livebench-2026-06-25:livebench-reasoning:kimi-k3` | — | `max` | arc-prize | arc-prize:arc-agi-2:moonshot-kimi-k3-max:arc-agi-2-v2-semi-private |
| minimax-m3 | `livebench-2026-06-25:livebench-instruction-following:minimax-m3` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:minimax-m3-max-rank-70:1-0-6 |
| minimax-m3 | `livebench-2026-06-25:livebench-language:minimax-m3` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:minimax-m3-max-rank-70:1-0-6 |
| minimax-m3 | `livebench-2026-06-25:livebench-mathematics:minimax-m3` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:minimax-m3-max-rank-70:1-0-6 |
| minimax-m3 | `livebench-2026-06-25:livebench-reasoning:minimax-m3` | — | `max` | zapier-automationbench | zapier-automationbench:automationbench:minimax-m3-max-rank-70:1-0-6 |
| qwen3.8-27b | `livebench-2026-06-25:livebench-instruction-following:qwen3-8-27b` | — | `xhigh` | artificial-analysis | artificial-analysis:aa-briefcase:qwen3-8-27b |
| qwen3.8-27b | `livebench-2026-06-25:livebench-language:qwen3-8-27b` | — | `xhigh` | artificial-analysis | artificial-analysis:aa-briefcase:qwen3-8-27b |
| qwen3.8-27b | `livebench-2026-06-25:livebench-mathematics:qwen3-8-27b` | — | `xhigh` | artificial-analysis | artificial-analysis:aa-briefcase:qwen3-8-27b |
| qwen3.8-27b | `livebench-2026-06-25:livebench-reasoning:qwen3-8-27b` | — | `xhigh` | artificial-analysis | artificial-analysis:aa-briefcase:qwen3-8-27b |
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
| kimi-k2.7-code | `livebench-2026-06-25:livebench-instruction-following:kimi-k2-7-code` | — | `default` | — | — |
| kimi-k2.7-code | `livebench-2026-06-25:livebench-language:kimi-k2-7-code` | — | `default` | — | — |
| kimi-k2.7-code | `livebench-2026-06-25:livebench-mathematics:kimi-k2-7-code` | — | `default` | — | — |
| kimi-k2.7-code | `livebench-2026-06-25:livebench-reasoning:kimi-k2-7-code` | — | `default` | — | — |
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

<!-- C6-EFFORT-INFERENCE:END -->
