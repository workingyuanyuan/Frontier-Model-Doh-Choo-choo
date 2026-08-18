# LiveBench acquisition validation

- Release: `2026-06-25` (cacheVersion `1787033560`) dynamically extracted from `https://livebench.ai/static/js/main.d02aefd7.js`
- Evidence: `https://livebench.ai/table_2026_06_25.csv?v=1787033560` and `https://livebench.ai/categories_2026_06_25.json?v=1787033560`

## Exact counts

| Check | Count |
|---|---:|
| Raw model rows in table CSV | 44 |
| Approved scoring categories | 4 (Reasoning, Mathematics, Language, IF) |
| Excluded/Unapproved categories | 3 (Coding, Agentic Coding, Data Analysis) |
| Generated CandidateResults | 176 |
| Canonically resolved candidates | 172 |
| Canonically unresolved candidates | 4 |
| Distinct unresolved raw model names | 1 |

## Model identity resolution

Full raw-name catalog matches are attempted first. Remaining names use only exact effort-suffix, Claude thinking/date, dated-effort, thinking-marker, or dated-model-alias transforms; no fuzzy matching is performed.

- `smaug-agentic`: full slug "smaug-agentic" has no documented exact LiveBench transform to a catalog slug

## Category scope boundary

Per REFACTOR_SPEC_V2.md §9.1 and §5.2, only the 4 approved categories (Reasoning, Mathematics, Language, Instruction Following) enter scoring. Coding, Agentic Coding, and Data Analysis categories are unapproved and excluded.

## Discrepancies and notes

- None. All 44 model rows have complete task coverage across the 4 approved categories.

## Visible comparison

- Fresh rendered page profile count: 44
- Complete table export profile count: 44
- Result: matched

## Snapshot delta

| Check | Previous | Refreshed | Delta |
|---|---:|---:|---:|
| Raw model profiles | 40 | 44 | +4 |
| Candidate results | 160 | 176 | +16 |
| Cost export profiles | 40 | 44 | +4 |
| Materialized costs | 48 | 48 | +0 |

Previous content-addressed artifacts remain preserved; this report compares the prior tracked snapshot with the refreshed snapshot.

<!-- C6-EFFORT-INFERENCE:START -->
## C6 effort inference — PENDING USER REVIEW

This tagged section is generated deterministically for `livebench`. Raw `profile.effort` remains unchanged; `productProfile.effort` is the transient product decision. Policy default: `default`.

### Cross-source inferences — PENDING USER REVIEW

| Model | Target candidate | Raw effort | Product effort | Basis source | Basis candidate |
|---|---|---|---|---|---|
| deepseek-v4-flash | `livebench-2026-06-25:livebench-instruction-following:deepseek-v4-flash` | — | `max` | artificial-analysis | artificial-analysis:aa-briefcase:deepseek-v4-flash |
| deepseek-v4-flash | `livebench-2026-06-25:livebench-language:deepseek-v4-flash` | — | `max` | artificial-analysis | artificial-analysis:aa-briefcase:deepseek-v4-flash |
| deepseek-v4-flash | `livebench-2026-06-25:livebench-mathematics:deepseek-v4-flash` | — | `max` | artificial-analysis | artificial-analysis:aa-briefcase:deepseek-v4-flash |
| deepseek-v4-flash | `livebench-2026-06-25:livebench-reasoning:deepseek-v4-flash` | — | `max` | artificial-analysis | artificial-analysis:aa-briefcase:deepseek-v4-flash |
| deepseek-v4-flash-0731 | `livebench-2026-06-25:livebench-instruction-following:deepseek-v4-flash-0731` | — | `max` | artificial-analysis | artificial-analysis:aa-briefcase:deepseek-v4-flash |
| deepseek-v4-flash-0731 | `livebench-2026-06-25:livebench-language:deepseek-v4-flash-0731` | — | `max` | artificial-analysis | artificial-analysis:aa-briefcase:deepseek-v4-flash |
| deepseek-v4-flash-0731 | `livebench-2026-06-25:livebench-mathematics:deepseek-v4-flash-0731` | — | `max` | artificial-analysis | artificial-analysis:aa-briefcase:deepseek-v4-flash |
| deepseek-v4-flash-0731 | `livebench-2026-06-25:livebench-reasoning:deepseek-v4-flash-0731` | — | `max` | artificial-analysis | artificial-analysis:aa-briefcase:deepseek-v4-flash |
| deepseek-v4-pro | `livebench-2026-06-25:livebench-instruction-following:deepseek-v4-pro` | — | `max` | artificial-analysis | artificial-analysis:aa-briefcase:deepseek-v4-pro-0424 |
| deepseek-v4-pro | `livebench-2026-06-25:livebench-language:deepseek-v4-pro` | — | `max` | artificial-analysis | artificial-analysis:aa-briefcase:deepseek-v4-pro-0424 |
| deepseek-v4-pro | `livebench-2026-06-25:livebench-mathematics:deepseek-v4-pro` | — | `max` | artificial-analysis | artificial-analysis:aa-briefcase:deepseek-v4-pro-0424 |
| deepseek-v4-pro | `livebench-2026-06-25:livebench-reasoning:deepseek-v4-pro` | — | `max` | artificial-analysis | artificial-analysis:aa-briefcase:deepseek-v4-pro-0424 |
| deepseek-v4-pro-0813 | `livebench-2026-06-25:livebench-instruction-following:deepseek-v4-pro-0813` | — | `max` | artificial-analysis | artificial-analysis:aa-briefcase:deepseek-v4-pro-0424 |
| deepseek-v4-pro-0813 | `livebench-2026-06-25:livebench-language:deepseek-v4-pro-0813` | — | `max` | artificial-analysis | artificial-analysis:aa-briefcase:deepseek-v4-pro-0424 |
| deepseek-v4-pro-0813 | `livebench-2026-06-25:livebench-mathematics:deepseek-v4-pro-0813` | — | `max` | artificial-analysis | artificial-analysis:aa-briefcase:deepseek-v4-pro-0424 |
| deepseek-v4-pro-0813 | `livebench-2026-06-25:livebench-reasoning:deepseek-v4-pro-0813` | — | `max` | artificial-analysis | artificial-analysis:aa-briefcase:deepseek-v4-pro-0424 |
| glm-5.2 | `livebench-2026-06-25:livebench-instruction-following:glm-5-2` | — | `max` | artificial-analysis | artificial-analysis:aa-briefcase:glm-5-2 |
| glm-5.2 | `livebench-2026-06-25:livebench-language:glm-5-2` | — | `max` | artificial-analysis | artificial-analysis:aa-briefcase:glm-5-2 |
| glm-5.2 | `livebench-2026-06-25:livebench-mathematics:glm-5-2` | — | `max` | artificial-analysis | artificial-analysis:aa-briefcase:glm-5-2 |
| glm-5.2 | `livebench-2026-06-25:livebench-reasoning:glm-5-2` | — | `max` | artificial-analysis | artificial-analysis:aa-briefcase:glm-5-2 |
| grok-4.3 | `livebench-2026-06-25:livebench-instruction-following:grok-4-3` | — | `medium` | artificial-analysis | artificial-analysis:aa-lcr:grok-4-3-medium |
| grok-4.3 | `livebench-2026-06-25:livebench-language:grok-4-3` | — | `medium` | artificial-analysis | artificial-analysis:aa-lcr:grok-4-3-medium |
| grok-4.3 | `livebench-2026-06-25:livebench-mathematics:grok-4-3` | — | `medium` | artificial-analysis | artificial-analysis:aa-lcr:grok-4-3-medium |
| grok-4.3 | `livebench-2026-06-25:livebench-reasoning:grok-4-3` | — | `medium` | artificial-analysis | artificial-analysis:aa-lcr:grok-4-3-medium |
| grok-4.5 | `livebench-2026-06-25:livebench-instruction-following:grok-4-5` | — | `high` | artificial-analysis | artificial-analysis:aa-briefcase:grok-4-5 |
| grok-4.5 | `livebench-2026-06-25:livebench-language:grok-4-5` | — | `high` | artificial-analysis | artificial-analysis:aa-briefcase:grok-4-5 |
| grok-4.5 | `livebench-2026-06-25:livebench-mathematics:grok-4-5` | — | `high` | artificial-analysis | artificial-analysis:aa-briefcase:grok-4-5 |
| grok-4.5 | `livebench-2026-06-25:livebench-reasoning:grok-4-5` | — | `high` | artificial-analysis | artificial-analysis:aa-briefcase:grok-4-5 |
| grok-4.6 | `livebench-2026-06-25:livebench-instruction-following:grok-4-6` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-grok-4-6-xhigh |
| grok-4.6 | `livebench-2026-06-25:livebench-language:grok-4-6` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-grok-4-6-xhigh |
| grok-4.6 | `livebench-2026-06-25:livebench-mathematics:grok-4-6` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-grok-4-6-xhigh |
| grok-4.6 | `livebench-2026-06-25:livebench-reasoning:grok-4-6` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-grok-4-6-xhigh |
| kimi-k3 | `livebench-2026-06-25:livebench-instruction-following:kimi-k3` | — | `max` | artificial-analysis | artificial-analysis:aa-briefcase:kimi-k3 |
| kimi-k3 | `livebench-2026-06-25:livebench-language:kimi-k3` | — | `max` | artificial-analysis | artificial-analysis:aa-briefcase:kimi-k3 |
| kimi-k3 | `livebench-2026-06-25:livebench-mathematics:kimi-k3` | — | `max` | artificial-analysis | artificial-analysis:aa-briefcase:kimi-k3 |
| kimi-k3 | `livebench-2026-06-25:livebench-reasoning:kimi-k3` | — | `max` | artificial-analysis | artificial-analysis:aa-briefcase:kimi-k3 |
| qwen3.8-max | `livebench-2026-06-25:livebench-instruction-following:qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| qwen3.8-max | `livebench-2026-06-25:livebench-language:qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| qwen3.8-max | `livebench-2026-06-25:livebench-mathematics:qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |
| qwen3.8-max | `livebench-2026-06-25:livebench-reasoning:qwen3-8-max` | — | `xhigh` | deepswe | deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh |

### Unlabelled rows assigned the outside-the-ladder default

| Model | Target candidate | Raw effort | Product effort | Basis source | Basis candidate |
|---|---|---|---|---|---|
| gpt-5.2-codex | `livebench-2026-06-25:livebench-instruction-following:gpt-5-2-codex` | — | `default` | — | — |
| gpt-5.2-codex | `livebench-2026-06-25:livebench-language:gpt-5-2-codex` | — | `default` | — | — |
| gpt-5.2-codex | `livebench-2026-06-25:livebench-mathematics:gpt-5-2-codex` | — | `default` | — | — |
| gpt-5.2-codex | `livebench-2026-06-25:livebench-reasoning:gpt-5-2-codex` | — | `default` | — | — |
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
| minimax-m3 | `livebench-2026-06-25:livebench-instruction-following:minimax-m3` | — | `default` | — | — |
| minimax-m3 | `livebench-2026-06-25:livebench-language:minimax-m3` | — | `default` | — | — |
| minimax-m3 | `livebench-2026-06-25:livebench-mathematics:minimax-m3` | — | `default` | — | — |
| minimax-m3 | `livebench-2026-06-25:livebench-reasoning:minimax-m3` | — | `default` | — | — |
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
| qwen3.8-27b | `livebench-2026-06-25:livebench-instruction-following:qwen3-8-27b` | — | `default` | — | — |
| qwen3.8-27b | `livebench-2026-06-25:livebench-language:qwen3-8-27b` | — | `default` | — | — |
| qwen3.8-27b | `livebench-2026-06-25:livebench-mathematics:qwen3-8-27b` | — | `default` | — | — |
| qwen3.8-27b | `livebench-2026-06-25:livebench-reasoning:qwen3-8-27b` | — | `default` | — | — |

<!-- C6-EFFORT-INFERENCE:END -->
